import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { logo } from '../../assets';
import useSiteSettings from '../../hooks/useSiteSettings';

function splitSiteTitle(siteName) {
  const title = siteName.trim().toUpperCase();
  const highlight = 'TUYÊN QUANG';
  const highlightIndex = title.indexOf(highlight);

  if (highlightIndex === -1) {
    return { main: title, highlight: '' };
  }

  return {
    main: title.slice(0, highlightIndex).trim(),
    highlight,
  };
}

function Header() {
  const settings = useSiteSettings();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const logoSource = settings.logo || (settings.isLoaded ? logo : '');
  const titleParts = splitSiteTitle(settings.siteName);

  useEffect(() => {
    setOpenMenu(null);
    setIsMobileOpen(false);
  }, [location.pathname]);

  const isCoursesActive = ['/hoc-lai-xe-o-to', '/hoc-lai-xe-may', '/dang-ky'].includes(location.pathname);
  const isBlogActive = ['/kinh-nghiem', '/cau-hoi', '/lien-he'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="container-shell flex items-center gap-4 py-3 sm:gap-6 sm:py-4">
        <Link to="/" className="-ml-2 flex min-w-0 shrink-0 items-center gap-3 sm:-ml-1" aria-label={`Trang chủ ${settings.siteName}`}>
          <span className="flex h-14 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {logoSource ? <img src={logoSource} alt={settings.siteName} className="h-full w-full object-cover object-center" /> : null}
          </span>
          <span className="max-w-[11rem] whitespace-normal break-words text-base font-black leading-[1.05] tracking-tight text-[#0B3B78] sm:max-w-[15rem] sm:text-lg">
            {titleParts.main ? <span>{titleParts.main} </span> : null}
            {titleParts.highlight ? <span className="text-[#E31B23]">{titleParts.highlight}</span> : null}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-3 lg:flex xl:gap-4">
          <NavLink to="/" end className={({ isActive }) => `whitespace-nowrap text-[13px] font-medium transition xl:text-sm ${isActive ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>
            Trang chủ
          </NavLink>

          <div className="group relative">
            <button type="button" aria-expanded={openMenu === 'courses'} onClick={() => setOpenMenu(openMenu === 'courses' ? null : 'courses')} className={`flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold transition xl:text-sm ${isCoursesActive || openMenu === 'courses' ? 'text-[#0B3B78]' : 'text-slate-600 hover:text-[#0B3B78]'}`}>
              Học lái xe <span aria-hidden="true" className={`text-xs transition ${openMenu === 'courses' ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            <div className={`${openMenu === 'courses' ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'} before:absolute before:-top-3 before:left-0 before:h-3 before:w-full absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition duration-200`}>
              <p className="px-4 pb-2 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Chương trình học</p>
              <Link to="/hoc-lai-xe-o-to" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B78]"><span className="h-2 w-2 rounded-full bg-[#0057B8]" />Học lái ô tô</Link>
              <Link to="/hoc-lai-xe-may" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B78]"><span className="h-2 w-2 rounded-full bg-[#FFC400]" />Học lái xe máy</Link>
              <Link to="/dang-ky" className="mt-1 flex items-center gap-3 rounded-xl border-t border-slate-100 px-4 py-3 text-sm font-bold text-[#E31B23] hover:bg-red-50"><span className="h-2 w-2 rounded-full bg-[#E31B23]" />Đăng ký tư vấn</Link>
            </div>
          </div>

          <div className="group relative">
            <button type="button" aria-expanded={openMenu === 'blog'} onClick={() => setOpenMenu(openMenu === 'blog' ? null : 'blog')} className={`flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold transition xl:text-sm ${isBlogActive || openMenu === 'blog' ? 'text-[#0B3B78]' : 'text-slate-600 hover:text-[#0B3B78]'}`}>
              Blog <span aria-hidden="true" className={`text-xs transition ${openMenu === 'blog' ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            <div className={`${openMenu === 'blog' ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'} before:absolute before:-top-3 before:left-0 before:h-3 before:w-full absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition duration-200`}>
              <p className="px-4 pb-2 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Thông tin hữu ích</p>
              <Link to="/kinh-nghiem" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B78]"><span className="h-2 w-2 rounded-full bg-[#0057B8]" />Kinh nghiệm</Link>
              <Link to="/cau-hoi" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B78]"><span className="h-2 w-2 rounded-full bg-[#FFC400]" />FAQ</Link>
              <Link to="/lien-he" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B78]"><span className="h-2 w-2 rounded-full bg-[#E31B23]" />Liên hệ</Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${settings.phone}`}
            className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 sm:inline-flex"
          >
            Gọi ngay
          </a>
          <Link
            to="/dang-ky"
            className="hidden items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-red-700 sm:inline-flex"
          >
            Đăng ký tư vấn
          </Link>
          <button type="button" aria-label={isMobileOpen ? 'Đóng menu' : 'Mở menu'} onClick={() => setIsMobileOpen((current) => !current)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold text-[#0B3B78] lg:hidden">
            {isMobileOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      {isMobileOpen ? (
        <nav className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="grid gap-1 text-sm font-semibold">
            <Link to="/" className="rounded-xl px-4 py-3 text-[#0B3B78] hover:bg-blue-50">Trang chủ</Link>
            <p className="px-4 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Học lái xe</p>
            <Link to="/hoc-lai-xe-o-to" className="rounded-xl px-4 py-3 text-slate-700 hover:bg-blue-50">Học lái ô tô</Link>
            <Link to="/hoc-lai-xe-may" className="rounded-xl px-4 py-3 text-slate-700 hover:bg-blue-50">Học lái xe máy</Link>
            <Link to="/dang-ky" className="rounded-xl px-4 py-3 text-[#E31B23] hover:bg-red-50">Đăng ký tư vấn</Link>
            <p className="px-4 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Blog</p>
            <Link to="/kinh-nghiem" className="rounded-xl px-4 py-3 text-slate-700 hover:bg-blue-50">Kinh nghiệm</Link>
            <Link to="/cau-hoi" className="rounded-xl px-4 py-3 text-slate-700 hover:bg-blue-50">FAQ</Link>
            <Link to="/lien-he" className="rounded-xl px-4 py-3 text-slate-700 hover:bg-blue-50">Liên hệ</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export default Header;
