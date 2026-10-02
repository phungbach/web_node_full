import {
  createQuestion,
  deleteQuestion,
  getAdminQuestions,
  getPublicQuestions,
  importQuestions,
  submitQuiz,
  updateQuestion,
} from '../services/quiz.service.js';

const parseDelimited = (text, delimiter) => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
};

export const listPublicQuestions = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getPublicQuestions(req.query.vehicleType, req.query.licenseType) });
  } catch (error) {
    next(error);
  }
};

export const submit = async (req, res, next) => {
  try {
    res.json({ success: true, data: await submitQuiz(req.body || {}) });
  } catch (error) {
    next(error);
  }
};

export const listAdminQuestions = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getAdminQuestions() });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await createQuestion(req.body || {}) });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const question = await updateQuestion(req.params.id, req.body || {});
    if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi.' });
    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const question = await deleteQuestion(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi.' });
    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

export const importFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Chưa chọn file CSV từ Google Sheets.' });
    const filename = req.file.originalname.toLowerCase();
    if (!filename.endsWith('.csv') && !filename.endsWith('.tsv') && !filename.endsWith('.txt')) {
      return res.status(400).json({ success: false, message: 'Hãy tải Google Sheet xuống dạng CSV rồi import.' });
    }
    const text = req.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
    const delimiter = text.split(/\r?\n/, 1)[0].includes('\t') ? '\t' : ',';
    const rows = parseDelimited(text, delimiter);
    const firstRow = rows[0]?.map((value) => String(value).trim().toLowerCase()) || [];
    const hasHeader = firstRow.some((value) => value.includes('câu hỏi') || value.includes('cau hoi'));
    const report = await importQuestions(hasHeader ? rows.slice(1) : rows);
    res.json({ success: true, message: 'Đã xử lý file import.', data: report });
  } catch (error) {
    next(error);
  }
};
