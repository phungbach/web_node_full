import { Link } from 'react-router-dom';
import { realCar, realMotorbike, teacher } from '../../assets';
import CTASection from '../../components/common/CTASection';
import Section from '../../components/common/Section';
import { blogPosts, faqItems } from '../../constants/site';

const courses = [
  {
    label: 'HẠNG B',
    title: 'Học lái xe ô tô',
    description: 'Lộ trình từ cơ bản đến thực hành, phù hợp cho người mới bắt đầu tại Tuyên Quang.',
    image: realMotorbike,
    to: '/hoc-lai-xe-o-to',
  },
  {
    label: 'A1 / A',
    title: 'Học lái xe máy',
    description: 'Ôn lý thuyết, luyện thực hành và chuẩn bị tốt cho kỳ thi sát hạch.',
    image: realCar,
    to: '/hoc-lai-xe-may',
  },
];

const steps = [
  ['01', 'Tư vấn khóa học', 'Trao đổi nhu cầu, hạng bằng và thời gian học phù hợp.'],
  ['02', 'Chuẩn bị hồ sơ', 'Được hướng dẫn giấy tờ và quy trình đăng ký rõ ràng.'],
  ['03', 'Học lý thuyết & thực hành', 'Luyện tập theo từng giai đoạn với lịch học linh hoạt.'],
  ['04', 'Sát hạch', 'Ôn tập trọng tâm và chuẩn bị kỹ năng trước ngày thi.'],
];

const advantages = [
  ['01', 'Lịch học linh hoạt', 'Dễ sắp xếp theo công việc và thời gian rảnh của học viên.'],
  ['02', 'Tư vấn minh bạch', 'Được giải thích rõ về lộ trình, hồ sơ và các khoản chi phí.'],
  ['03', 'Hỗ trợ tận tình', 'Đồng hành từ lúc đăng ký đến khi hoàn thành khóa học.'],
  ['04', 'Học tại Tuyên Quang', 'Tập trung thông tin địa điểm và lịch học thuận tiện tại địa phương.'],
];

function Home() {
  return (
    <>
      <div className="bg-[#082e63] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        Tư vấn học lái xe tại Tuyên Quang <span className="mx-2 text-yellow-300">•</span> Hỗ trợ đăng ký nhanh
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7fbff] via-white to-[#eaf3ff]">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-yellow-300/30 blur-3xl" />
        <div className="container-shell relative grid items-center gap-10 py-12 sm:pt-8 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex rounded bg-[#e31b23] px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-white">Trung tâm đào tạo lái xe</span>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] text-[#082e63] sm:text-5xl lg:text-6xl">
              Học lái xe dễ hiểu,
              <span className="block text-[#e31b23]">vững tay lái</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Tìm khóa học ô tô hoặc xe máy phù hợp, được tư vấn lộ trình và hỗ trợ hồ sơ tại Tuyên Quang.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/dang-ky" className="inline-flex items-center justify-center rounded bg-[#e31b23] px-7 py-3.5 font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700">
                Đăng ký tư vấn
              </Link>
              <a href="tel:0987499141" className="inline-flex items-center justify-center rounded border-2 border-[#082e63] bg-white px-7 py-3.5 font-bold text-[#082e63] transition hover:bg-[#082e63] hover:text-white">
                Gọi để được tư vấn
              </a>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              <div><strong className="block text-2xl font-black text-[#082e63]">01</strong><span className="text-xs text-slate-500 sm:text-sm">Lộ trình rõ ràng</span></div>
              <div><strong className="block text-2xl font-black text-[#082e63]">02</strong><span className="text-xs text-slate-500 sm:text-sm">Nhóm khóa học</span></div>
              <div><strong className="block text-2xl font-black text-[#082e63]">24/7</strong><span className="text-xs text-slate-500 sm:text-sm">Hỗ trợ tư vấn</span></div>
            </div>
          </div>
          <div className="relative flex min-h-[24rem] items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50 via-white to-yellow-50 sm:min-h-[34rem]">
            <div className="absolute right-8 top-10 h-28 w-28 rounded-full bg-yellow-300/50 blur-2xl sm:right-16 sm:h-40 sm:w-40" />
            <img src={teacher} alt="Giáo viên hướng dẫn học lái xe tại Tuyên Quang" className="relative z-10 h-[27rem] w-auto max-w-none object-contain object-bottom sm:h-[38rem]" />
            <div className="absolute bottom-5 right-4 z-20 rounded-2xl border border-red-100 bg-white/95 px-4 py-3 text-right shadow-xl sm:bottom-8 sm:right-8">
              <p className="text-base font-black uppercase tracking-wide text-center text-[#e31b23] sm:text-lg">Thầy An Quang Long</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#082e63] sm:text-sm">10 năm kinh nghiệm đào tạo</p>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Khóa học" title="Chọn chương trình phù hợp với bạn" description="Bắt đầu bằng một cuộc tư vấn ngắn để hiểu rõ điều kiện, thời gian và lộ trình học.">
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.title} className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl sm:grid-cols-[0.85fr_1.15fr]">
              <img src={course.image} alt={course.title} className="h-56 w-full object-cover sm:h-full" />
              <div className="p-6">
                <span className="text-xs font-black tracking-[0.16em] text-[#e31b23]">{course.label}</span>
                <h3 className="mt-3 text-2xl font-black text-[#082e63]">{course.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{course.description}</p>
                <Link to={course.to} className="mt-5 inline-flex font-bold text-[#e31b23]">Xem chi tiết <span className="ml-2 transition group-hover:translate-x-1">→</span></Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <section className="bg-[#082e63] py-14 text-white">
        <div className="container-shell grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">Địa điểm học</span>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Học lái xe tại Thành phố Tuyên Quang</h2>
            <p className="mt-4 max-w-lg leading-7 text-blue-100">Tìm hiểu địa điểm, lịch học và hồ sơ cần chuẩn bị trước khi đăng ký. Đội ngũ tư vấn sẽ giúp bạn chọn phương án phù hợp.</p>
            <Link to="/lien-he" className="mt-6 inline-flex rounded bg-yellow-400 px-5 py-3 font-bold text-[#082e63] hover:bg-yellow-300">Nhận tư vấn địa điểm</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Tư vấn hồ sơ', 'Lịch học linh hoạt', 'Hỗ trợ trước kỳ thi'].map((item) => (
              <div key={item} className="rounded-xl border border-blue-400/30 bg-white/10 p-5">
                <span className="text-2xl text-yellow-300">✓</span>
                <p className="mt-3 font-bold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Lộ trình" title="4 bước bắt đầu học lái xe" description="Quy trình đơn giản, thông tin rõ ràng và có người hướng dẫn ở từng bước.">
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <div key={number} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <span className="text-4xl font-black text-yellow-400">{number}</span>
              <h3 className="mt-5 text-xl font-black text-[#082e63]">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Lợi ích" title="Đồng hành trong suốt quá trình học" description="Những điều học viên quan tâm nhất được giải thích rõ ngay từ buổi tư vấn đầu tiên.">
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map(([number, title, text]) => (
            <div key={number} className="border-t-4 border-[#e31b23] bg-white p-5 shadow-soft">
              <span className="text-sm font-black text-[#e31b23]">{number}</span>
              <h3 className="mt-3 font-black text-[#082e63]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Kinh nghiệm" title="Thông tin hữu ích cho học viên" description="Đọc thêm các bài viết để chuẩn bị tốt hơn cho quá trình học và thi.">
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              <img src={post.thumbnail} alt={post.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#e31b23]">{post.category}</span>
                <h3 className="mt-3 text-lg font-black text-[#082e63]">{post.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                <Link to={`/kinh-nghiem/${post.slug}`} className="mt-4 inline-flex text-sm font-bold text-[#e31b23]">Đọc bài viết →</Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Giải đáp" title="Câu hỏi thường gặp" description="Một số thông tin cơ bản trước khi bạn đăng ký tư vấn.">
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {faqItems.slice(0, 6).map((item) => (
            <details key={item.question} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
              <summary className="cursor-pointer list-none pr-6 font-bold text-[#082e63] marker:hidden">{item.question}<span className="float-right text-[#e31b23] group-open:rotate-45">+</span></summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CTASection title="Bạn đã sẵn sàng bắt đầu?" description="Để lại thông tin, chúng tôi sẽ liên hệ tư vấn khóa học và lịch học phù hợp tại Tuyên Quang." />
    </>
  );
}

export default Home;
