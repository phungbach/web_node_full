import { Link } from 'react-router-dom';
import { heroCar, heroMotorbike } from '../../assets';
import CTASection from '../../components/common/CTASection';
import RegistrationForm from '../../components/common/RegistrationForm';
import Section from '../../components/common/Section';
import { blogPosts, courseHighlights } from '../../constants/site';

const courseCards = [
  {
    title: 'Học lái xe ô tô',
    icon: '🚗',
    description: 'Tìm hiểu chương trình học và quy trình đăng ký phù hợp với nhu cầu của bạn.',
    to: '/hoc-lai-xe-o-to',
  },
  {
    title: 'Học lái xe máy',
    icon: '🏍️',
    description: 'Học theo lộ trình rõ ràng, ưu tiên người mới bắt đầu và thực hành hiệu quả.',
    to: '/hoc-lai-xe-may',
  },
];

const process = [
  { step: '01', title: 'Tư vấn', text: 'Chúng tôi hiểu nhu cầu và gợi ý khóa học phù hợp.' },
  { step: '02', title: 'Đăng ký', text: 'Hoàn thiện hồ sơ và nhận lịch học dựa trên thời gian rảnh.' },
  { step: '03', title: 'Học tập', text: 'Theo lộ trình, học lý thuyết và thực hành định hướng. ' },
  { step: '04', title: 'Thi & cấp', text: 'Chuẩn bị tốt cho kỳ thi và hướng dẫn sát hạch.' },
];

const benefits = [
  'Giáo viên tận tâm, hướng dẫn từng bước',
  'Thời gian học linh hoạt theo nhu cầu',
  'Hỗ trợ hồ sơ và quy trình đăng ký',
  'Phù hợp với người mới bắt đầu',
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_40%)]" />
        <div className="container-shell relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="pill">Học lái xe Tuyên Quang</span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              HỌC LÁI XE Ô TÔ &amp; XE MÁY
              <span className="mt-2 block text-blue-700">TẠI TUYÊN QUANG</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Tìm hiểu khóa học, quy trình đăng ký và lộ trình học phù hợp với bạn.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/dang-ky" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Đăng ký tư vấn
              </Link>
              <a href="tel:0900000000" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-700">
                Gọi ngay
              </a>
            </div>
            <ul className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              {courseHighlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-4 shadow-soft sm:translate-y-8">
              <img src={heroCar} alt="Học lái xe ô tô" className="h-64 w-full rounded-2xl object-cover" />
            </div>
            <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-soft">
              <img src={heroMotorbike} alt="Học lái xe máy" className="h-64 w-full rounded-2xl object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Khóa học" title="Bạn muốn học loại xe nào?" description="Chọn giữa khóa học ô tô hoặc xe máy để bắt đầu lộ trình học lái xe phù hợp với mục tiêu của bạn.">
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {courseCards.map((course) => (
            <div key={course.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="text-4xl">{course.icon}</div>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">{course.title}</h3>
              <p className="mt-3 text-slate-600">{course.description}</p>
              <Link to={course.to} className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                Xem khóa học
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Vì sao chọn chúng tôi" title="Lộ trình học rõ ràng, phù hợp với người mới" description="Chúng tôi tập trung vào trải nghiệm học tập thực tế, dễ hiểu và thân thiện với người mới bắt đầu.">
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((item, index) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                0{index + 1}
              </div>
              <p className="text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Quy trình" title="Quy trình đăng ký đơn giản" description="Mỗi bước đều được hướng dẫn rõ ràng để bạn tới gần hơn với bằng lái xe mong muốn.">
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {process.map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <span className="text-sm font-bold text-blue-600">{item.step}</span>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Kinh nghiệm" title="Kinh nghiệm học lái xe hữu ích" description="Những bài viết được biên soạn để giúp học viên đặt nền móng tốt hơn cho quá trình học và thi sát hạch.">
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              <img src={post.thumbnail} alt={post.title} className="h-48 w-full object-cover" />
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{post.category}</span>
                <h3 className="mt-3 text-xl font-bold text-slate-900">{post.title}</h3>
                <p className="mt-3 text-slate-600">{post.excerpt}</p>
                <Link to={`/kinh-nghiem/${post.slug}`} className="mt-5 inline-flex text-sm font-semibold text-blue-700">
                  Đọc thêm →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Câu hỏi thường gặp" description="Thông tin nhanh, dễ hiểu và cập nhật theo quy định hiện hành.">
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {['Học lái xe cần điều kiện gì?', 'Lịch học như thế nào?', 'Hồ sơ đăng ký gồm những gì?', 'Người mới bắt đầu có học được không?'].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="font-semibold text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <CTASection
        title="Bạn muốn bắt đầu học lái xe ngay hôm nay?"
        description="Nhận tư vấn miễn phí, lộ trình phù hợp và hỗ trợ đăng ký nhanh chóng từ đội ngũ của chúng tôi."
      />
    </>
  );
}

export default Home;
