import { Link } from 'react-router-dom';

function MobileBottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold">
        <a href="tel:0900000000" className="rounded-xl bg-red-600 px-3 py-3 text-white">☎ Gọi</a>
        <a href="https://zalo.me/0900000000" target="_blank" rel="noreferrer" className="rounded-xl bg-blue-600 px-3 py-3 text-white">
          💬 Zalo
        </a>
        <Link to="/dang-ky" className="rounded-xl bg-blue-600 px-3 py-3 text-white">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}

export default MobileBottomBar;
