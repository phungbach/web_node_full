import { useState } from 'react';
import CTASection from '../../components/common/CTASection';
import Section from '../../components/common/Section';
import { submitContact } from '../../services/contact.service';

const initialForm = {
  name: '',
  phone: '',
  message: '',
};

function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const response = await submitContact(form);
    setStatus(response?.success ? 'Tin nhắn đã được gửi. Chúng tôi sẽ liên hệ lại sớm.' : response?.message || 'Không thể gửi tin nhắn lúc này.');
    if (response?.success) {
      setForm(initialForm);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Section eyebrow="Liên hệ" title="Liên hệ với đội ngũ tư vấn" description="Chúng tôi sẵn sàng hỗ trợ bạn tìm khóa học phù hợp và giải đáp mọi thắc mắc về quy trình học lái xe.">
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-slate-900">Thông tin liên hệ</h3>
            <ul className="mt-6 space-y-4 text-slate-700">
              <li>☎ Điện thoại: 0900 000 000</li>
              <li>💬 Zalo: 0900 000 000</li>
              <li>📍 Địa chỉ: Tuyên Quang, Việt Nam</li>
              <li>🌐 Website: hoclaixetq.com</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Họ tên
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400"
                  placeholder="Nhập họ tên"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400"
                  placeholder="090xxxxxxx"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Tin nhắn
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="4"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400"
                  placeholder="Tôi muốn tìm hiểu về khóa học..."
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
            {status ? <p className="mt-4 text-sm text-blue-700">{status}</p> : null}
          </form>
        </div>
      </Section>

      <CTASection title="Bạn cần tư vấn riêng?" description="Gọi ngay hoặc nhắn tin để được đội ngũ tư vấn hỗ trợ nhanh nhất." />
    </>
  );
}

export default Contact;
