import { NavLink } from 'react-router-dom';

const navGroups = [
  {
    title: 'Admin',
    items: [
      { label: 'Dashboard', to: '/admin' },
      { label: 'Đăng ký', to: '/admin/registrations' },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { label: 'Bài viết', to: '/admin/posts' },
      { label: 'Danh mục', to: '/admin/categories' },
    ],
  },
  {
    title: 'Media',
    items: [{ label: 'Thư viện ảnh', to: '/admin/media' }],
  },
  {
    title: 'SEO',
    items: [{ label: 'SEO tổng hợp', to: '/admin/seo' }],
  },
  {
    title: 'Cài đặt',
    items: [{ label: 'Website', to: '/admin/settings' }],
  },
];

function AdminSidebar() {
  return (
    <aside className='hidden w-72 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-200 lg:block'>
      <div className="border-b border-slate-700 px-6 py-5">
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>ADMIN</p>
        <h2 className='mt-2 text-xl font-bold text-white'>Hoclaixetq</h2>
      </div>

      <nav className='space-y-6 px-4 py-5'>
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className='px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'>{group.title}</p>
            <ul className='mt-2 space-y-1'>
              {group.items.map(({ label, to }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/admin'}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
