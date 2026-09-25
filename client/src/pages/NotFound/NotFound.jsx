import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">404</p>
        <h1 className="mt-4 text-4xl font-black text-slate-900">Trang không tồn tại</h1>
        <p className="mt-4 text-slate-600">Trang bạn đang tìm kiếm không có sẵn hoặc đã được di chuyển.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
