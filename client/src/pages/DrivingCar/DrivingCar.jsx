import { Link } from 'react-router-dom';
import CTASection from '../../components/common/CTASection';
import RegistrationForm from '../../components/common/RegistrationForm';
import Section from '../../components/common/Section';
import { heroCar } from '../../assets';

const points = [
  'Phù hợp với người muốn học lái xe ô tô cá nhân hoặc phục vụ công việc.',
  'Học theo lộ trình rõ ràng, hướng dẫn từ đầu đến thi thực hành.',
  'Hỗ trợ thủ tục, hồ sơ và các bước đăng ký hiệu quả.',
  'Lịch học linh hoạt, dễ sắp xếp thời gian cá nhân.',
];

const timeline = [
  { title: 'Đăng ký', description: 'Bạn gửi thông tin và nhận tư vấn khóa học phù hợp.' },
  { title: 'Hồ sơ', description: 'Chuẩn bị hồ sơ theo hướng dẫn của trung tâm.' },
  { title: 'Học lý thuyết', description: 'Nắm rõ quy tắc giao thông và nội dung cần học.' },
  { title: 'Học thực hành', description: 'Rèn kỹ năng lái xe trên thực tế, tập trung kỹ thuật an toàn.' },
  { title: 'Chuẩn bị thi', description: 'Ôn tập và định hướng trước kỳ thi sát hạch.' },
];

function DrivingCar() {
  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="container-shell grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="pill">Khóa học ô tô</span>
            <h1 className="mt-5 text-4xl font-black text-slate-900 sm:text-5xl">Học lái xe ô tô tại Tuyên Quang</h1>
            <p className="mt-4 text-lg text-slate-600">
              Lộ trình học tập rõ ràng, hướng dẫn chi tiết và hỗ trợ thủ tục từ đầu đến khi hoàn tất khóa học.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link to="/dang-ky" className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Đăng ký tư vấn
              </Link>
              <a href="tel:0900000000" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-700">
                Gọi ngay
              </a>
            </div>
          </div>
          <img src={heroCar} alt="Khóa học lái xe ô tô" className="rounded-3xl shadow-soft" />
        </div>
      </section>

      <Section eyebrow="Giới thiệu" title="Khóa học phù hợp với nhiều đối tượng" description="Khóa học ô tô được xây dựng để giúp học viên tiếp cận kiến thức, kỹ năng và quy trình thi đầy đủ nhưng không cảm thấy quá tải.">
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {points.map((point) => (
            <div key={point} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-slate-700">{point}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Điều kiện" title="Điều kiện học và hồ sơ" description="Thông tin cơ bản cần chuẩn bị trước khi đăng ký được cập nhật đúng quy định hiện hành.">
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold">Đối tượng</h3>
            <p className="mt-3 text-slate-600">Người đủ độ tuổi, có sức khỏe phù hợp và muốn học lái xe ô tô.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold">Hồ sơ</h3>
            <p className="mt-3 text-slate-600">Căn cước công dân, ảnh và các giấy tờ cá nhân theo hướng dẫn của trung tâm.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold">Thủ tục</h3>
            <p className="mt-3 text-slate-600">Nhận tư vấn, điền hồ sơ, đăng ký khóa học và nhận lịch học phù hợp.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Quy trình" title="Lộ trình học" description="Học viên được hướng dẫn từng bước để nắm chắc lý thuyết, kỹ năng thực hành và cách thi đạt hiệu quả.">
        <div className="mt-8 grid gap-6 md:grid-cols-5">
          {timeline.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Chi phí" title="Thông tin chi phí" description="Mức chi phí có thể thay đổi theo chương trình và thời điểm, nên học viên nên được tư vấn trực tiếp trước khi đăng ký.">
        <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-slate-800 shadow-soft">
          <p>Chi phí học sẽ được cập nhật dựa trên chương trình hiện hành và được tư vấn rõ ràng trước khi đăng ký.</p>
        </div>
      </Section>

      <div className="container-shell grid gap-8 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="section-title">Câu hỏi thường gặp</h2>
          <div className="mt-6 space-y-4">
            {['Học lái xe ô tô bao lâu?', 'Có được học thử không?', 'Hồ sơ cần chuẩn bị trước khi đăng ký?'].map((question) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                <p className="font-medium text-slate-800">{question}</p>
              </div>
            ))}
          </div>
        </div>
        <RegistrationForm />
      </div>

      <CTASection title="Sẵn sàng học lái xe ô tô?" description="Đăng ký tư vấn ngay để nhận lộ trình học phù hợp và hỗ trợ từ đội ngũ chuyên nghiệp." />
    </>
  );
}

export default DrivingCar;
