import Section from '../../components/common/Section';
import { faqItems } from '../../constants/site';

function FAQ() {
  return (
    <Section eyebrow="FAQ" title="Câu hỏi thường gặp" description="Thông tin giúp bạn hiểu rõ hơn về quy trình học, điều kiện và thủ tục đăng ký.">
      <div className="mt-10 space-y-4">
        {faqItems.map((item) => (
          <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">{item.question}</summary>
            <p className="mt-3 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export default FAQ;
