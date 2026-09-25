import { useEffect, useMemo, useState } from 'react';
import { submitRegistration } from '../../services/registration.service';

const initialState = {
  name: '',
  phone: '',
  courseType: 'car',
  area: 'Tuyên Quang',
  note: '',
  website: '',
};

const COOLDOWN_MS = 5 * 60 * 1000;
const STORAGE_KEY = 'registration_form_cooldown_until';

function getCooldownRemaining() {
  try {
    const until = Number(localStorage.getItem(STORAGE_KEY) || 0);
    return Math.max(0, until - Date.now());
  } catch {
    return 0;
  }
}

function RegistrationForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(() => getCooldownRemaining());

  useEffect(() => {
    if (cooldownRemaining <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCooldownRemaining((current) => {
        const next = Math.max(0, current - 1000);
        if (next === 0) {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownRemaining]);

  const canSubmit = useMemo(() => !isSubmitting && cooldownRemaining === 0, [isSubmitting, cooldownRemaining]);

  const formatCountdown = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes > 0 ? `${minutes} phút ` : ''}${seconds.toString().padStart(2, '0')} giây`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setStatus('');

    const response = await submitRegistration({ ...form, area: form.area || 'Tuyên Quang' });
    setStatus(response?.success ? response?.message : response?.message || 'Không thể gửi đăng ký lúc này.');

    if (response?.success) {
      const nextUntil = Date.now() + COOLDOWN_MS;
      try {
        localStorage.setItem(STORAGE_KEY, String(nextUntil));
      } catch {
        // ignore
      }
      setForm(initialState);
      setCooldownRemaining(COOLDOWN_MS);
    }

    setIsSubmitting(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h3 className="text-2xl font-bold text-slate-900">Đăng ký tư vấn</h3>
      <p className="mt-2 text-sm text-slate-500">Vui lòng điền thông tin chính xác để được hỗ trợ nhanh hơn.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Họ tên
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400"
            placeholder="Nhập họ tên"
            required
            autoComplete="name"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Số điện thoại
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400"
            placeholder="0912345678"
            required
            autoComplete="tel"
            inputMode="tel"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Loại khóa học
          <select
            name="courseType"
            value={form.courseType}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400"
          >
            <option value="car">Ô tô</option>
            <option value="motorbike">Xe máy</option>
            <option value="unknown">Chưa biết</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Khu vực
          <input
            name="area"
            value={form.area}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400"
            placeholder="Tuyên Quang"
            autoComplete="address-level2"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
        Ghi chú
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          rows="4"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400"
          placeholder="Tôi muốn tìm hiểu về khóa học phù hợp..."
        />
      </label>

      <label className="sr-only" aria-hidden="true">
        Website
        <input
          name="website"
          value={form.website}
          onChange={handleChange}
          tabIndex="-1"
          autoComplete="off"
          className="hidden"
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? 'Đang gửi...'
          : cooldownRemaining > 0
            ? `Vui lòng đợi ${formatCountdown(cooldownRemaining)} trước khi gửi lại`
            : 'Gửi đăng ký'}
      </button>

      {status ? <p className="mt-4 text-sm text-blue-700">{status}</p> : null}
    </form>
  );
}

export default RegistrationForm;
