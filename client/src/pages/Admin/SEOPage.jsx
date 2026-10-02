import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { defaultSeoSchema, defaultSiteSettings } from '../../hooks/useSiteSettings';

const siteUrl = 'https://hoclaixetq.com';

const recommendedSeo = (current) => ({
  ...current,
  seoTitle: 'Học lái xe Tuyên Quang | Học ô tô, xe máy uy tín',
  seoDescription: 'Học lái xe ô tô B1, B2 và xe máy A1, A2 tại Tuyên Quang. Lộ trình rõ ràng, giáo viên tận tâm, tư vấn nhanh qua 0987499141.',
  seoKeywords: 'học lái xe Tuyên Quang, học lái xe B1, học lái xe B2, học lái xe A1, học lái xe A2, thi bằng lái xe Tuyên Quang',
  canonicalUrl: siteUrl,
  ogTitle: 'Học lái xe Tuyên Quang | B1, B2, A1, A2',
  ogDescription: 'Tư vấn học lái ô tô B1, B2 và xe máy A1, A2 tại Tuyên Quang. Gọi 0987499141 để được hỗ trợ.',
  ogImage: `${siteUrl}/logo.svg`,
  robotsIndex: true,
  robotsFollow: true,
  schemaJson: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'DrivingSchool',
    name: 'Học lái xe Tuyên Quang',
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    image: `${siteUrl}/logo.svg`,
    telephone: '+84987499141',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tuyên Quang',
      addressRegion: 'Tuyên Quang',
      addressCountry: 'VN',
    },
    areaServed: {
      '@type': 'City',
      name: 'Tuyên Quang',
    },
    sameAs: [],
  }, null, 2),
});

const checkSeo = (settings) => [
  { label: 'Meta title 30–60 ký tự', passed: settings.seoTitle.length >= 30 && settings.seoTitle.length <= 60 },
  { label: 'Meta description 120–160 ký tự', passed: settings.seoDescription.length >= 120 && settings.seoDescription.length <= 160 },
  { label: 'Canonical dùng HTTPS và đúng domain', passed: settings.canonicalUrl === siteUrl },
  { label: 'Có từ khóa theo nhóm bằng lái', passed: /B1|B2|A1|A2/i.test(settings.seoKeywords) },
  { label: 'Có ảnh Open Graph', passed: /^https:\/\//.test(settings.ogImage) },
  { label: 'Schema JSON-LD hợp lệ', passed: (() => { try { JSON.parse(settings.schemaJson); return true; } catch { return false; } })() },
];

function SEOPage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSitemapUpdating, setIsSitemapUpdating] = useState(false);
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

  const checks = useMemo(() => checkSeo({
    seoTitle: settings.seoTitle || '',
    seoDescription: settings.seoDescription || '',
    canonicalUrl: settings.canonicalUrl || '',
    seoKeywords: settings.seoKeywords || '',
    ogImage: settings.ogImage || '',
    schemaJson: settings.schemaJson || '',
  }), [settings]);
  const passedChecks = checks.filter((check) => check.passed).length;
  const seoScore = Math.round((passedChecks / checks.length) * 100);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAutoFill = () => {
    setSettings((current) => recommendedSeo(current));
    setMessage('Đã tự động điền bộ SEO cho hoclaixetq.com. Hãy bấm Lưu cấu hình SEO để áp dụng.');
    setError('');
  };

  const refreshSitemap = async () => {
    setIsSitemapUpdating(true);
    setMessage('');
    setError('');
    try {
      await api.post('/settings/sitemap');
      setMessage('Đã cập nhật sitemap.xml từ các trang và bài viết đã xuất bản.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật sitemap.xml.');
    } finally {
      setIsSitemapUpdating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      JSON.parse(settings.schemaJson);
    } catch {
      setError('Schema JSON-LD không hợp lệ.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put('/settings', settings);
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
    <form onSubmit={handleSubmit} className="min-w-0 space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">SEO</p>
          <h1 className="mt-2 text-2xl font-black text-[#0B3B78] sm:text-3xl">SEO tổng hợp</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Tự động tối ưu title, description, từ khóa, canonical, chia sẻ mạng xã hội và Schema cho hoclaixetq.com.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl ${seoScore >= 80 ? 'bg-emerald-100 text-emerald-700' : seoScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            <strong className="text-xl">{seoScore}</strong>
            <span className="text-[10px] font-bold uppercase">SEO score</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleAutoFill} className="rounded-xl bg-[#E31B23] px-4 py-3 text-sm font-bold text-white hover:bg-red-700">Tự động điền SEO</button>
            <button type="button" onClick={refreshSitemap} disabled={isSitemapUpdating} className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">{isSitemapUpdating ? 'Đang cập nhật...' : 'Cập nhật sitemap'}</button>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#0B3B78]">Kiểm tra nhanh</h2>
            <p className="mt-1 text-sm text-blue-800">Màu xanh là trường đã đạt tiêu chí cơ bản.</p>
          </div>
          <span className="text-sm font-bold text-blue-700">{passedChecks}/{checks.length} đạt</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => <div key={check.label} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${check.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}><span className="mr-2">{check.passed ? '✓' : '!'}</span>{check.label}</div>)}
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-200 pt-6">
        <div><h2 className="text-xl font-bold text-[#0B3B78]">Thông tin Google</h2><p className="mt-1 text-sm text-slate-500">Các trường quan trọng nhất để Google hiểu website và hiển thị kết quả tìm kiếm.</p></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Meta title<input required name="seoTitle" value={settings.seoTitle || ''} onChange={handleChange} maxLength="60" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /><span className={`text-xs font-normal ${settings.seoTitle.length >= 30 && settings.seoTitle.length <= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>{settings.seoTitle.length}/60 ký tự</span></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Meta description<textarea required name="seoDescription" value={settings.seoDescription || ''} onChange={handleChange} maxLength="160" rows="3" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /><span className={`text-xs font-normal ${settings.seoDescription.length >= 120 && settings.seoDescription.length <= 160 ? 'text-emerald-600' : 'text-amber-600'}`}>{settings.seoDescription.length}/160 ký tự</span></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Từ khóa SEO<input name="seoKeywords" value={settings.seoKeywords || ''} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" placeholder="Các từ khóa, cách nhau bằng dấu phẩy" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Canonical URL<input type="url" name="canonicalUrl" value={settings.canonicalUrl || ''} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-200 pt-6">
        <div><h2 className="text-xl font-bold text-[#0B3B78]">Chia sẻ Facebook/Zalo</h2><p className="mt-1 text-sm text-slate-500">Kiểm soát nội dung khi chia sẻ đường dẫn website.</p></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">Open Graph title<input name="ogTitle" value={settings.ogTitle || ''} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Open Graph image URL<input name="ogImage" value={settings.ogImage || ''} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" placeholder={`${siteUrl}/logo.svg`} /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Open Graph description<textarea name="ogDescription" value={settings.ogDescription || ''} onChange={handleChange} rows="3" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-200 pt-6">
        <div><h2 className="text-xl font-bold text-[#0B3B78]">Robots và Schema</h2><p className="mt-1 text-sm text-slate-500">Cho phép lập chỉ mục và khai báo doanh nghiệp đào tạo lái xe.</p></div>
        <div className="flex flex-wrap gap-6"><label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="robotsIndex" checked={Boolean(settings.robotsIndex)} onChange={handleChange} className="h-5 w-5 accent-blue-600" />Cho phép index</label><label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="robotsFollow" checked={Boolean(settings.robotsFollow)} onChange={handleChange} className="h-5 w-5 accent-blue-600" />Cho phép follow link</label></div>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Schema JSON-LD<textarea name="schemaJson" value={settings.schemaJson || ''} onChange={handleChange} rows="12" className="font-mono rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-blue-400" /><span className="text-xs font-normal text-slate-500">Schema dùng URL tuyệt đối của hoclaixetq.com để Google nhận diện DrivingSchool.</span></label>
        <button type="button" onClick={() => { setSettings((current) => ({ ...current, schemaJson: defaultSeoSchema })); setError(''); setMessage('Đã khôi phục Schema mặc định.'); }} className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">Khôi phục Schema mặc định</button>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Google preview</p>
        <p className="mt-3 text-xl font-medium text-[#0B3B78]">{settings.seoTitle || 'Tiêu đề website'}</p>
        <p className="mt-1 text-sm text-green-700">{settings.canonicalUrl || siteUrl}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{settings.seoDescription || 'Mô tả website sẽ hiển thị ở đây.'}</p>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}
      <button type="submit" disabled={isSaving} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Đang lưu...' : 'Lưu cấu hình SEO'}</button>
    </form>
  );
}

export default SEOPage;
