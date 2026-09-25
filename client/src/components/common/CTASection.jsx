import { Link } from 'react-router-dom';

function CTASection({ title, description, primary = '/dang-ky', secondary = 'tel:0900000000' }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-shell">
        <div className="rounded-3xl bg-slate-900 px-6 py-10 text-center text-white shadow-soft sm:px-10 lg:px-16">
          <p className="pill border-slate-700 bg-slate-800 text-slate-200">Tư vấn miễn phí</p>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={primary} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500">
              Đăng ký tư vấn
            </Link>
            <a href={secondary} className="rounded-full border border-slate-600 px-6 py-3 font-semibold text-white hover:border-white">
              Gọi ngay
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
