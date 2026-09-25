import RegistrationForm from '../../components/common/RegistrationForm';
import Section from '../../components/common/Section';

function Register() {
  return (
    <Section eyebrow="Đăng ký" title="Đăng ký học lái xe Tuyên Quang" description="Vui lòng điền thông tin để được tư vấn lộ trình học phù hợp nhất với bạn.">
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-soft">
          <h3 className="text-2xl font-bold">Lợi ích khi đăng ký</h3>
          <ul className="mt-6 space-y-4 text-slate-200">
            <li>✔ Tư vấn miễn phí, không ép mua khóa học.</li>
            <li>✔ Nhận lộ trình học phù hợp với mục tiêu cá nhân.</li>
            <li>✔ Hỗ trợ hồ sơ, quy trình và lịch học rõ ràng.</li>
            <li>✔ Chọn khóa học ô tô hoặc xe máy theo nhu cầu.</li>
          </ul>
        </div>

        <RegistrationForm />
      </div>
    </Section>
  );
}

export default Register;
