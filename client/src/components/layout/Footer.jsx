import { Link } from 'react-router-dom';
import { logo } from '../../assets';
import useSiteSettings from '../../hooks/useSiteSettings';

function Footer() {
  const settings = useSiteSettings();
  const logoSource = settings.logo || (settings.isLoaded ? logo : '');

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-4">
        <div>
          {logoSource ? <img src={logoSource} alt={settings.siteName} className="h-12 w-auto rounded-xl object-contain" /> : null}
          <p className="mt-4 text-sm text-slate-300">
            {settings.heroDescription}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Khóa học</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link to="/hoc-lai-xe-o-to">Học lái xe ô tô</Link></li>
            <li><Link to="/hoc-lai-xe-may">Học lái xe máy</Link></li>
            <li><Link to="/kinh-nghiem">Kinh nghiệm</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Hỗ trợ</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link to="/cau-hoi">FAQ</Link></li>
            <li><Link to="/dang-ky">Đăng ký</Link></li>
            <li><Link to="/lien-he">Liên hệ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Liên hệ</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>☎ {settings.phone}</li>
            <li>💬 Zalo: {settings.zalo}</li>
            <li>📍 {settings.address}</li>
            <li>✉ {settings.email}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
