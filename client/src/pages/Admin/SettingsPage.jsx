import { useEffect, useState } from 'react';
import api from '../../services/api';
import { defaultSiteSettings } from '../../hooks/useSiteSettings';

const imageLimits = {
  logo: { width: 600, height: 180, label: 'Logo' },
  favicon: { width: 512, height: 512, label: 'Favicon' },
};

function fitImage(file, width, height) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const scale = Math.min(width / image.width, height / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;

      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc ảnh'));
    };
    image.src = objectUrl;
  });
}

function SettingsPage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then((response) => {
        if (response.data?.data) {
          setSettings((current) => ({ ...current, ...response.data.data }));
        }
      })
      .catch(() => setError('Không thể tải thông tin website.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox'
      ? checked
      : name === 'logoWidth' || name === 'logoHeight'
        ? Number(value)
        : value;
    setSettings((current) => ({ ...current, [name]: nextValue }));
  };

  const handleImageFile = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(`${imageLimits[field].label} cần có dung lượng tối đa 2MB.`);
      return;
    }

    try {
      const resizedImage = await fitImage(file, imageLimits[field].width, imageLimits[field].height);
      setSettings((current) => ({ ...current, [field]: resizedImage }));
      setError('');
    } catch {
      setError(`Không thể đọc file ${imageLimits[field].label.toLowerCase()}.`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await api.put('/settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      });
      setSettings((current) => ({ ...current, ...response.data.data }));
      setMessage('Đã lưu thông tin website.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu thông tin website.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">Đang tải cài đặt...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Settings</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Thông tin website</h1>
        <p className="mt-2 text-sm text-slate-500">Cập nhật thông tin hiển thị trên Header và Footer của website.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">Tên website<input name="siteName" value={settings.siteName} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Slogan<input name="heroDescription" value={settings.heroDescription} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Số điện thoại<input name="phone" value={settings.phone} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Zalo<input name="zalo" value={settings.zalo} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Email<input type="email" name="email" value={settings.email} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Facebook URL<input name="facebook" value={settings.facebook} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" placeholder="https://facebook.com/..." /></label>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Địa chỉ<input name="address" value={settings.address} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" /></label>
        <div className="grid gap-3 text-sm font-medium text-slate-700 md:col-span-2">
          <label htmlFor="logo-file">Logo</label>
          <input id="logo-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleImageFile(event, 'logo')} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700" />
          <label className="grid gap-2 font-normal text-slate-500">Hoặc nhập Logo URL<input name="logo" value={settings.logo.startsWith('data:') ? '' : settings.logo} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-400" placeholder="https://.../logo.png" /></label>
          <p className="font-normal text-slate-500">Ảnh sẽ được thu nhỏ vừa khung 600 x 180px, không cắt ảnh.</p>
        </div>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Chiều rộng logo: {settings.logoWidth}px
            <div className="flex items-center gap-3">
              <input type="range" name="logoWidth" min="120" max="300" step="1" value={settings.logoWidth} onChange={handleChange} className="w-full accent-blue-600" />
              <input type="number" name="logoWidth" min="120" max="300" value={settings.logoWidth} onChange={handleChange} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center outline-none focus:border-blue-400" />
            </div>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Chiều cao logo: {settings.logoHeight}px
            <div className="flex items-center gap-3">
              <input type="range" name="logoHeight" min="40" max="160" step="1" value={settings.logoHeight} onChange={handleChange} className="w-full accent-blue-600" />
              <input type="number" name="logoHeight" min="40" max="160" value={settings.logoHeight} onChange={handleChange} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center outline-none focus:border-blue-400" />
            </div>
          </label>
        </div>
        <div className="grid gap-3 text-sm font-medium text-slate-700 md:col-span-2">
          <label htmlFor="favicon-file">Favicon</label>
          <input id="favicon-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleImageFile(event, 'favicon')} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700" />
          <label className="grid gap-2 font-normal text-slate-500">Hoặc nhập Favicon URL<input name="favicon" value={settings.favicon.startsWith('data:') ? '' : settings.favicon} onChange={handleChange} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-400" placeholder="https://.../favicon.png" /></label>
          <p className="font-normal text-slate-500">Ảnh sẽ được thu nhỏ vừa khung 512 x 512px, không cắt ảnh.</p>
        </div>
        <div className="grid gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 md:col-span-2 md:grid-cols-[auto_1fr] md:items-center">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
            <input type="checkbox" name="googleAnalyticsEnabled" checked={settings.googleAnalyticsEnabled} onChange={handleChange} className="h-5 w-5 accent-blue-600" />
            Bật Google Analytics 4
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Measurement ID
            <input name="googleAnalyticsId" value={settings.googleAnalyticsId} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" placeholder="G-XXXXXXXXXX" />
          </label>
          <p className="text-sm text-slate-600 md:col-span-2">Nhập Measurement ID trong Google Analytics để website bắt đầu ghi nhận lượt truy cập.</p>
        </div>
      </div>

      {settings.logo ? <div className="mt-5 rounded-2xl border border-slate-200 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] p-4"><p className="mb-3 text-sm font-medium text-slate-700">Xem trước logo PNG trong suốt</p><img src={settings.logo} alt="Xem trước logo" className="h-16 w-auto rounded-xl object-contain" /></div> : null}
      {settings.favicon ? <div className="mt-5 rounded-2xl border border-slate-200 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] p-4"><p className="mb-3 text-sm font-medium text-slate-700">Xem trước favicon PNG trong suốt</p><img src={settings.favicon} alt="Xem trước favicon" className="h-16 w-16 rounded-xl object-contain" /></div> : null}
      {error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}

      <button type="submit" disabled={isSaving} className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
    </form>
  );
}

export default SettingsPage;
