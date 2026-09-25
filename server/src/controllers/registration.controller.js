import { createRegistration, deleteRegistration, getRegistrations, updateRegistrationStatus } from '../services/registration.service.js';

const submissionTracker = new Map();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const SUBMISSION_COOLDOWN_MS = 5 * 60 * 1000;

const VIETNAMESE_NAME_REGEX = /^[A-Za-zÀ-ỹĂăÂâĐđÊêÔôƠơƯư\s'.-]{2,80}$/u;
const AREA_REGEX = /^[A-Za-zÀ-ỹĂăÂâĐđÊêÔôƠơƯư0-9\s,'().-/]{2,80}$/u;
const PHONE_LOCAL_REGEX = /^0(?:3|8|9)\d{8}$/;
const GIBBERISH_REGEX = /^(.)\1{4,}$|^[a-zA-Z]{1,2}\d{3,}$/u;

const normalizeText = (value = '') => value.trim().replace(/\s+/g, ' ');

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || 'unknown';
};

const getBucket = (ip) => submissionTracker.get(ip) || [];
const saveBucket = (ip, bucket) => submissionTracker.set(ip, bucket);

const cleanupBucket = (bucket, windowMs) => {
  const now = Date.now();
  return bucket.filter((entry) => now - entry.ts < windowMs);
};

const getRateLimitState = (ip) => {
  const bucket = cleanupBucket(getBucket(ip), RATE_LIMIT_WINDOW_MS);
  return {
    bucket,
    count: bucket.length,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - bucket.length),
    resetAt: bucket[0] ? bucket[0].ts + RATE_LIMIT_WINDOW_MS : Date.now() + RATE_LIMIT_WINDOW_MS,
  };
};

const hasRepeatedChars = (value) => /(.)\1{3,}/.test(value.replace(/\s+/g, ''));
const hasTooManyDigits = (value) => (value.match(/\d/g) || []).length > 3;
const looksLikeGibberish = (value) => {
  const compact = value.replace(/\s+/g, '');
  if (compact.length < 2) return true;
  if (GIBBERISH_REGEX.test(value)) return true;
  if (hasRepeatedChars(value)) return true;
  if (/^[A-Za-zÀ-ỹ]+$/.test(compact) && compact.length < 3) return true;
  const words = value.split(/\s+/);
  if (words.length >= 2 && words.every((word) => word.length <= 2)) return true;
  return false;
};

const normalizePhone = (phone) => {
  let value = normalizeText(phone).replace(/[\s.-]/g, '');
  if (value.startsWith('+84')) value = `0${value.slice(3)}`;
  if (value.startsWith('84') && value.length === 11) value = `0${value.slice(2)}`;
  return value;
};

const validateName = (name) => {
  const value = normalizeText(name);
  if (!value) return 'Vui lòng nhập họ tên.';
  if (!VIETNAMESE_NAME_REGEX.test(value)) return 'Họ tên không hợp lệ.';
  const words = value.split(/\s+/);
  if (words.length >= 2 && words.every((word) => word.length <= 2)) return 'Họ tên có vẻ không hợp lệ.';
  if (looksLikeGibberish(value)) return 'Họ tên có vẻ không hợp lệ.';
  return '';
};

const validatePhone = (phone) => {
  const value = normalizePhone(phone);
  if (!value) return 'Vui lòng nhập số điện thoại.';
  if (!PHONE_LOCAL_REGEX.test(value)) return 'Số điện thoại phải là số di động Việt Nam hợp lệ (03, 08 hoặc 09, 10 chữ số).';
  if (/^0(?:3|8|9)(\d)\1{6,}$/.test(value)) return 'Số điện thoại không hợp lệ.';
  return '';
};

const validateCourseType = (courseType) => {
  if (!['car', 'motorbike', 'unknown'].includes(courseType)) return 'Loại khóa học không hợp lệ.';
  return '';
};

const validateArea = (area) => {
  const value = normalizeText(area || 'Tuyên Quang');
  if (!value) return 'Vui lòng nhập khu vực.';
  if (!AREA_REGEX.test(value)) return 'Khu vực không hợp lệ.';
  if (looksLikeGibberish(value) || hasTooManyDigits(value)) return 'Khu vực không hợp lệ.';
  return '';
};

const validateNote = (note) => {
  const value = normalizeText(note || '');
  if (!value) return '';
  if (value.length > 500) return 'Ghi chú quá dài.';
  return '';
};

const validateRegistrationPayload = (payload) => {
  const errors = [];
  const name = normalizeText(payload.name);
  const phone = normalizePhone(payload.phone);
  const area = normalizeText(payload.area || 'Tuyên Quang');
  const note = normalizeText(payload.note);
  const courseType = payload.courseType || 'unknown';

  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);

  const courseError = validateCourseType(courseType);
  if (courseError) errors.push(courseError);

  const areaError = validateArea(area);
  if (areaError) errors.push(areaError);

  const noteError = validateNote(note);
  if (noteError) errors.push(noteError);

  return {
    errors,
    normalized: {
      name,
      phone,
      courseType,
      area,
      note,
    },
  };
};

export const createRegistrationEntry = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const { bucket, count, remaining, resetAt } = getRateLimitState(ip);
    const now = Date.now();
    const lastSubmission = bucket[bucket.length - 1];
    const cooldownRemainingMs = lastSubmission ? Math.max(0, SUBMISSION_COOLDOWN_MS - (now - lastSubmission.ts)) : 0;

    if (count >= RATE_LIMIT_MAX_REQUESTS) {
      const waitMinutes = Math.ceil((resetAt - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Bạn đã gửi tối đa ${RATE_LIMIT_MAX_REQUESTS} đăng ký trong 24 giờ. Vui lòng thử lại sau ${waitMinutes} phút.`,
        retryAfterMs: Math.max(0, resetAt - now),
        remaining: 0,
      });
    }

    if (cooldownRemainingMs > 0) {
      const waitSeconds = Math.ceil(cooldownRemainingMs / 1000);
      return res.status(429).json({
        success: false,
        message: `Vui lòng đợi ${Math.ceil(waitSeconds / 60)} phút trước khi gửi lại.`,
        retryAfterMs: cooldownRemainingMs,
        remaining,
      });
    }

    const honeypot = normalizeText(req.body.website || req.body.company || req.body.address2 || '');
    if (honeypot) {
      return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ.' });
    }

    const { errors, normalized } = validateRegistrationPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0] });
    }

    const registration = await createRegistration({
      ...normalized,
      source: 'website',
    });

    bucket.push({ ts: now });
    saveBucket(ip, cleanupBucket(bucket, RATE_LIMIT_WINDOW_MS));

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
      data: registration,
      remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - getBucket(ip).length),
      retryAfterMs: SUBMISSION_COOLDOWN_MS,
    });
  } catch (error) {
    next(error);
  }
};

export const listRegistrations = async (req, res, next) => {
  try {
    const registrations = await getRegistrations();
    res.json({ success: true, message: 'Success', data: registrations });
  } catch (error) {
    next(error);
  }
};

export const patchRegistrationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['new', 'contacted', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const updated = await updateRegistrationStatus(id, status);
    if (!updated) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, message: 'Registration updated', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteRegistrationEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteRegistration(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, message: 'Registration deleted', data: deleted });
  } catch (error) {
    next(error);
  }
};
