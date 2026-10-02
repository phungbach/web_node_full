import { NavLink } from 'react-router-dom';
import { logo } from '../../assets';

const navGroups = [
  {
    title: 'Admin',
    items: [
      { label: 'Dashboard', to: '/admin', icon: 'dashboard' },
      { label: 'Đăng ký', to: '/admin/registrations', icon: 'registrations' },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { label: 'Bài viết', to: '/admin/posts', icon: 'posts' },
      { label: 'Danh mục', to: '/admin/categories', icon: 'categories' },
      { label: 'Bộ câu hỏi luyện đề', to: '/admin/quiz', icon: 'quiz' },
    ],
  },
  {
    title: 'Media',
    items: [{ label: 'Thư viện ảnh', to: '/admin/media', icon: 'media' }],
  },
  {
    title: 'SEO',
    items: [{ label: 'SEO tổng hợp', to: '/admin/seo', icon: 'seo' }],
  },
  {
    title: 'Cài đặt',
    items: [
      { label: 'Website', to: '/admin/settings', icon: 'settings' },
      { label: 'Backup', to: '/admin/backups', icon: 'backup' },
    ],
  },
];

function MenuIcon({ type }) {
  const paths = {
    dashboard: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    registrations: 'M6 3h12a2 2 0 0 1 2 2v14H4V5a2 2 0 0 1 2-2Zm2 4h8M8 11h8M8 15h5',
    posts: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
    categories: 'M4 6h6l2 2h8v10H4z',
    quiz: 'M5 4h14v16H5zM8 8h8M8 12h2M12 12h4M8 16h8',
    media: 'M4 5h16v14H4zM7 15l3-3 2 2 3-4 5 5M8 9h.01',
    seo: 'M4 5h16M4 12h16M4 19h10',
    settings: 'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m4.6 4.6 2.1 2.1m0-8.8-2.1 2.1m-4.6 4.6-2.1 2.1M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    backup: 'M4 5h16v14H4zM8 9h8M8 13h5M8 17h8',
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><path d={paths[type] || paths.dashboard} /></svg>;
}

function AdminSidebar({ isMobileOpen, onClose }) {
  const sidebarContent = (
    <>
      <div className="relative overflow-hidden border-b border-blue-900/50 bg-gradient-to-br from-[#0B3B78] to-[#06284f] px-5 py-6">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
            <img src={logo} alt="Học lái xe Tuyên Quang" className="h-full w-full object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">ADMIN CMS</p>
            <h2 className="mt-1 truncate text-lg font-black text-white">Hoclaixetq</h2>
          </div>
        </div>
        <p className="relative mt-5 text-xs font-medium text-blue-100">Quản trị website học lái xe</p>
      </div>

      <nav className='space-y-5 overflow-y-auto px-3 py-5'>
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className='px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500'>{group.title}</p>
            <ul className='mt-2 space-y-1'>
              {group.items.map(({ label, to, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/admin'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-sm font-semibold transition ${
                        isActive ? 'border-yellow-400 bg-blue-700 text-white shadow-lg shadow-blue-950/20' : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <MenuIcon type={icon} />
                    <span className="min-w-0 truncate">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className='hidden w-72 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-200 lg:block'>
        {sidebarContent}
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Đóng menu quản trị" onClick={onClose} className="absolute inset-0 bg-slate-950/50" />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col overflow-hidden bg-slate-900 text-slate-200 shadow-2xl">
            <button type="button" onClick={onClose} aria-label="Đóng menu quản trị" className="absolute right-4 top-4 z-10 text-2xl leading-none text-slate-300 hover:text-white">×</button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default AdminSidebar;
