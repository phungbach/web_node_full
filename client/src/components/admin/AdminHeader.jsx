import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function makeBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Admin', to: '/admin' }];

  if (segments[0] === 'admin') {
    const tail = segments.slice(1);
    tail.forEach((segment, index) => {
      const label = segment.replace(/-/g, ' ');
      const to = `/admin/${tail.slice(0, index + 1).join('/')}`;
      breadcrumbs.push({ label, to });
    });
  }

  return breadcrumbs;
}

function AdminHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const breadcrumbs = makeBreadcrumbs(pathname);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || 'null');
    } catch {
      return null;
    }
  })();

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.to} className="flex items-center gap-2">
              {index > 0 ? <span>/</span> : null}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-slate-700">{crumb.label}</span>
              ) : (
                <Link to={crumb.to} className="hover:text-slate-700">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="relative flex items-center gap-3">
          <Link to="/" className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700">
            Xem website
          </Link>

          <button
            type="button"
            onClick={() => setShowMenu((current) => !current)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
            aria-label="Tài khoản quản trị"
            title={user?.name || 'Tài khoản quản trị'}
          >
            <span className="text-lg">👤</span>
            <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </button>

          {showMenu ? (
            <div className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Quản trị viên'}</p>
                <p className="text-xs text-slate-500">Đang hoạt động</p>
              </div>
              <Link
                to="/admin/account"
                onClick={() => setShowMenu(false)}
                className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Tài khoản quản trị
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
              >
                Đăng xuất
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
