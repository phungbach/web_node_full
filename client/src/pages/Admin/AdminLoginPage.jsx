import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        email: credentials.username,
        password: credentials.password,
      });
      const { token, user } = response.data.data;

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      navigate('/admin', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin CMS</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Đăng nhập quản trị</h1>
          <p className="mt-2 text-sm text-slate-500">Đăng nhập để quản lý nội dung website.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Tài khoản
            <input
              required
              autoComplete="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="admin"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Mật khẩu
            <input
              required
              type="password"
              autoComplete="current-password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Nhập mật khẩu"
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLoginPage;
