import { useEffect, useState } from 'react';
import api from '../../services/api';
import { defaultSeoSchema, defaultSiteSettings } from '../../hooks/useSiteSettings';

function SEOPage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then((response) => {
        if (response.data?.data) setSettings((current) => ({ ...current, ...response.data.data }));
      })
      .catch(() => setError('Không thể tải cấu hình SEO.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (settings.schemaJson.trim()) {
      try {
        JSON.parse(settings.schemaJson);
      } catch {
        setError('Schema JSON-LD không hợp lệ.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await api.put('/settings', settings, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
      setSettings((current) => ({ ...current, ...response.data.data }));
      setMessage('Đã lưu toàn bộ cấu hình SEO.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu cấu hình SEO.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">Đang tải cấu hình SEO...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">SEO</p>
        <h1 className="mt-2 text-3xl font-black text-[#0B3B78]">SEO tổng hợp</h1>
        <p className="mt-2 text-sm text-slate-500">Quản lý toàn bộ metadata, chia sẻ mạng xã hội, robots và dữ liệu có cấu trúc trong một trang.</p>
      </div>

      <section className="space-y-5 border-t border-slate-200 pt-6">
        <div><h2 className="text-xl font-bold text-[#0B3B78]">Công cụ tìm kiếm</h2><p className="mt-1 text-sm text-slate-500">Thông tin hiển thị trên Google và các công cụ tìm kiếm.</p></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Meta title<input required name="seoTitle" value={settings.seoTitle} onChange={handleChange} maxLength="60" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /><span className="text-xs font-normal text-slate-500">{settings.seoTitle.length}/60 ký tự</span></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Meta description<textarea required name="seoDescription" value={settings.seoDescription} onChange={handleChange} maxLength="160" rows="3" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /><span className="text-xs font-normal text-slate-500">{settings.seoDescription.length}/160 ký tự</span></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Từ khoá SEO<input name="seoKeywords" value={settings.seoKeywords} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" placeholder="Từ khoá, cách nhau bằng dấu phẩy" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Canonical URL<input type="url" name="canonicalUrl" value={settings.canonicalUrl} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-200 pt-6">
        <div><h2 className="text-xl font-bold text-[#0B3B78]">Chia sẻ mạng xã hội</h2><p className="mt-1 text-sm text-slate-500">Kiểm soát tiêu đề, mô tả và ảnh khi chia sẻ link.</p></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">Open Graph title<input name="ogTitle" value={settings.ogTitle} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Open Graph image URL<input name="ogImage" value={settings.ogImage} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" placeholder="https://.../og-image.jpg" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Open Graph description<textarea name="ogDescription" value={settings.ogDescription} onChange={handleChange} rows="3" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-200 pt-6">
        <div><h2 className="text-xl font-bold text-[#0B3B78]">Robots và dữ liệu có cấu trúc</h2><p className="mt-1 text-sm text-slate-500">Thiết lập việc lập chỉ mục và schema JSON-LD cho website.</p></div>
        <div className="flex flex-wrap gap-6"><label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="robotsIndex" checked={settings.robotsIndex} onChange={handleChange} className="h-5 w-5 accent-blue-600" />Cho phép index</label><label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="robotsFollow" checked={settings.robotsFollow} onChange={handleChange} className="h-5 w-5 accent-blue-600" />Cho phép follow link</label></div>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Schema JSON-LD<textarea name="schemaJson" value={settings.schemaJson} onChange={handleChange} rows="12" className="font-mono rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-blue-400" placeholder="{ &quot;@context&quot;: &quot;https://schema.org&quot;, ... }" /><span className="text-xs font-normal text-slate-500">Schema mặc định dành cho trung tâm học lái xe tại Tuyên Quang.</span></label>
        <button type="button" onClick={() => { setSettings((current) => ({ ...current, schemaJson: defaultSeoSchema })); setError(''); setMessage('Đã khôi phục Schema mặc định.'); }} className="w-fit rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">Khôi phục Schema mặc định</button>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Google preview</p>
        <p className="mt-3 text-xl font-medium text-[#0B3B78]">{settings.seoTitle || 'Tiêu đề website'}</p>
        <p className="mt-1 text-sm text-green-700">{settings.canonicalUrl || 'https://example.com'}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{settings.seoDescription || 'Mô tả website sẽ hiển thị ở đây.'}</p>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}
      <button type="submit" disabled={isSaving} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Đang lưu...' : 'Lưu cấu hình SEO'}</button>
    </form>
  );
}

export default SEOPage;
