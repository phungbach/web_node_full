import { Link } from 'react-router-dom';
import CTASection from '../../components/common/CTASection';
import RegistrationForm from '../../components/common/RegistrationForm';
import Section from '../../components/common/Section';
import { heroMotorbike } from '../../assets';

const values = [
  'Thích hợp cho người mới bắt đầu, dễ tiếp cận và thực hành.',
  'Hướng dẫn kỹ thuật lái xe an toàn và đúng quy chuẩn.',
  'Thủ tục và hồ sơ được hỗ trợ rõ ràng từng bước.',
  'Lịch học linh hoạt, thuận tiện cho sinh viên và người đi làm.',
];

function DrivingMotorbike() {
  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="container-shell grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="pill">Khóa học xe máy</span>
            <h1 className="mt-5 text-4xl font-black text-slate-900 sm:text-5xl">Học lái xe máy tại Tuyên Quang</h1>
            <p className="mt-4 text-lg text-slate-600">
              Chương trình học tập dễ tiếp cận, an toàn và phù hợp với người mới bắt đầu muốn nhanh chóng có kỹ năng lái xe cơ bản.
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
          <img src={heroMotorbike} alt="Khóa học lái xe máy" className="rounded-3xl shadow-soft" />
        </div>
      </section>

      <Section eyebrow="Giới thiệu" title="Khóa học xe máy an toàn và hiệu quả" description="Người học sẽ được hướng dẫn từng bước từ nền tảng cơ bản đến kỹ năng lái xe thực tế, đảm bảo an toàn cho bản thân và người khác.">
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {values.map((value) => (
            <div key={value} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Điều kiện" title="Điều kiện, hồ sơ và quy trình" description="Thông tin được thiết kế dành cho học viên mới, mang tính hướng dẫn rõ ràng và tiện theo dõi.">
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold">Đối tượng</h3>
            <p className="mt-3 text-slate-600">Học viên đủ điều kiện theo quy định, có mục tiêu học bằng lái xe máy.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold">Hồ sơ</h3>
            <p className="mt-3 text-slate-600">Căn cước công dân, ảnh và thông tin cá nhân cần thiết theo yêu cầu.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold">Tư vấn</h3>
            <p className="mt-3 text-slate-600">Nhận gợi ý khóa học và lộ trình học phù hợp với từng cá nhân.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Chi phí" title="Mức chi phí" description="Lệ phí có thể thay đổi theo từng giai đoạn và chương trình học. Học viên nên được tư vấn đầy đủ trước khi đăng ký.">
        <div className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-slate-800 shadow-soft">
          <p>Thông tin chi phí cụ thể sẽ được cung cấp khi bạn trao đổi trực tiếp với tư vấn viên của trung tâm.</p>
        </div>
      </Section>

      <div className="container-shell grid gap-8 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="section-title">Các câu hỏi phổ biến</h2>
          <div className="mt-6 space-y-4">
            {['Học xe máy có khó không?', 'Có cần có kỹ năng lái trước không?', 'Sau khi học xong có được thi ngay không?'].map((question) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                <p className="font-medium text-slate-800">{question}</p>
              </div>
            ))}
          </div>
        </div>
        <RegistrationForm />
      </div>

      <CTASection title="Bạn muốn bắt đầu học lái xe máy?" description="Đăng ký tư vấn miễn phí để được hỗ trợ chi tiết về thủ tục, lộ trình học và lịch đăng ký." />
    </>
  );
}

export default DrivingMotorbike;
