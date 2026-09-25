import Section from '../../components/common/Section';

const stats = [
  { label: 'Bài viết', value: '120' },
  { label: 'Đăng ký', value: '35' },
  { label: 'Lead mới', value: '12' },
  { label: 'Liên hệ', value: '8' },
];

const registrations = [
  { name: 'Nguyễn Văn A', course: 'Ô tô', phone: '0901 234 567', status: 'new' },
  { name: 'Trần Thị B', course: 'Xe máy', phone: '0902 345 678', status: 'contacted' },
  { name: 'Lê Văn C', course: 'Chưa biết', phone: '0903 456 789', status: 'completed' },
];

function Admin() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Bảng điều khiển</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-3xl font-black text-slate-900">{item.value}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Khách hàng đăng ký</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Khóa học</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row) => (
                  <tr key={row.phone} className="border-t border-slate-200">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.course}</td>
                    <td className="px-4 py-3">{row.phone}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Section eyebrow="Quick actions" title="Quản trị" description="Theo dõi nội dung và lead dễ dàng hơn.">
          <div className="mt-6 space-y-3 text-slate-700">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">• Bài viết</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">• Danh mục</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">• Khách hàng đăng ký</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">• Cài đặt website</div>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default Admin;
