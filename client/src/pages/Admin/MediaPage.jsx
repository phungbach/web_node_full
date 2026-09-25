import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';

const authConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

function MediaPage() {
  const inputRef = useRef(null);
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadMedia = () => api.get('/media', authConfig())
    .then((response) => setMedia(response.data?.data || []))
    .catch(() => setError('Không thể tải thư viện ảnh.'))
    .finally(() => setIsLoading(false));

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    setMessage('');
    setError('');

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) throw new Error('Chỉ được chọn file ảnh.');
        if (file.size > 5 * 1024 * 1024) throw new Error('Mỗi ảnh tối đa 5MB.');
        const url = await readFile(file);
        await api.post('/media', { name: file.name, type: file.type, size: file.size, url }, authConfig());
      }
      setMessage(`Đã tải lên ${files.length} ảnh.`);
      await loadMedia();
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || 'Không thể tải ảnh lên.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleCopy = async (url) => {
    await navigator.clipboard.writeText(url);
    setMessage('Đã copy URL ảnh.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá ảnh này?')) return;
    try {
      await api.delete(`/media/${id}`, authConfig());
      await loadMedia();
      setMessage('Đã xoá ảnh.');
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Không thể xoá ảnh.');
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Media</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Thư viện ảnh</h1>
          <p className="mt-2 text-sm text-slate-500">Lưu trữ ảnh dùng cho bài viết, logo và các trang public.</p>
        </div>
        <>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} className="rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isUploading ? 'Đang tải...' : '+ Tải ảnh mới'}
          </button>
        </>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}

      {isLoading ? <p className="py-10 text-center text-slate-500">Đang tải thư viện...</p> : null}
      {!isLoading && !media.length ? <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">Chưa có ảnh. Bấm “Tải ảnh mới” để bắt đầu.</div> : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((item) => (
          <article key={item._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex h-44 items-center justify-center bg-slate-100 p-3"><img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain" /></div>
            <div className="space-y-3 p-4"><p className="truncate text-sm font-semibold text-slate-800" title={item.name}>{item.name}</p><p className="text-xs text-slate-500">{Math.max(1, Math.round(item.size / 1024))} KB</p><div className="flex gap-2"><button type="button" onClick={() => handleCopy(item.url)} className="flex-1 rounded-lg border border-blue-200 px-2 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">Copy URL</button><button type="button" onClick={() => handleDelete(item._id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Xoá</button></div></div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MediaPage;
