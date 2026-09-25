import { useState } from 'react';
import api from '../../services/api';

const initialForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function AdminAccountPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.patch('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(response.data?.message || 'Đã cập nhật mật khẩu quản trị.');
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Tài khoản quản trị</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Đổi mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-600">Mật khẩu mới sẽ áp dụng cho các lần đăng nhập sau.</p>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Mật khẩu hiện tại
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Mật khẩu mới
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            minLength={8}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Xác nhận mật khẩu mới
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            minLength={8}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
}

export default AdminAccountPage;
