import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';

const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  thumbnail: '',
  seoTitle: '',
  seoDescription: '',
  status: 'draft',
  category: '',
};

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
});

const makeSlug = (title) => title
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const MEDIA_PAGE_SIZE = 4;

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

function PostsPage() {
  const thumbnailInputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState([]);
  const [post, setPost] = useState(emptyPost);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [mediaPage, setMediaPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPosts = () => {
    setIsLoading(true);
    return api.get('/posts')
      .then((response) => setPosts(response.data?.data || []))
      .catch(() => setError('Không thể tải danh sách bài viết.'))
      .finally(() => setIsLoading(false));
  };

  const loadMedia = () => {
    setIsMediaLoading(true);
    return api.get('/media', authConfig())
      .then((response) => {
        setMedia(response.data?.data || []);
        setMediaPage(0);
      })
      .catch(() => setError('Không thể tải thư viện ảnh.'))
      .finally(() => setIsMediaLoading(false));
  };

  useEffect(() => {
    loadPosts();
    api.get('/categories')
      .then((response) => setCategories(response.data?.data || []))
      .catch(() => setError('Không thể tải danh mục bài viết.'));
  }, []);

  const openCreateForm = () => {
    setPost(emptyPost);
    setEditingId(null);
    setIsFormOpen(true);
    setMessage('');
    setError('');
    loadMedia();
  };

  const openEditForm = (selectedPost) => {
    setPost({ ...emptyPost, ...selectedPost });
    setEditingId(selectedPost._id);
    setIsFormOpen(true);
    setMessage('');
    setError('');
    loadMedia();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPost((current) => ({
      ...current,
      [name]: value,
      ...(name === 'title' && !editingId ? { slug: makeSlug(value) } : {}),
    }));
  };

  const handleThumbnailUpload = async (event) => {
    const [file] = Array.from(event.target.files || []);
    event.target.value = '';
    if (!file) return;

    setError('');
    setMessage('');
    if (!file.type.startsWith('image/')) {
      setError('Chỉ được chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh tối đa 5MB.');
      return;
    }

    setIsThumbnailUploading(true);
    try {
      const url = await readFile(file);
      const response = await api.post(
        '/media',
        { name: file.name, type: file.type, size: file.size, url },
        authConfig(),
      );
      const uploadedMedia = response.data?.data;
      if (!uploadedMedia?.url) throw new Error('Media upload returned no image URL.');

      setMedia((current) => [uploadedMedia, ...current]);
      setMediaPage(0);
      setPost((current) => ({ ...current, thumbnail: uploadedMedia.url }));
      setMessage('Đã tải ảnh lên Media và chọn làm ảnh đại diện.');
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || 'Không thể tải ảnh lên.');
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        await api.put(`/posts/${editingId}`, post, authConfig());
        setMessage('Đã cập nhật bài viết.');
      } else {
        await api.post('/posts', post, authConfig());
        setMessage('Đã thêm bài viết.');
      }
      setIsFormOpen(false);
      setEditingId(null);
      setPost(emptyPost);
      await loadPosts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu bài viết.');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Bạn có chắc muốn xoá bài viết này?')) return;

    try {
      await api.delete(`/posts/${postId}`, authConfig());
      setMessage('Đã xoá bài viết.');
      await loadPosts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xoá bài viết.');
    }
  };

  const mediaPageCount = Math.ceil(media.length / MEDIA_PAGE_SIZE);
  const visibleMedia = media.slice(mediaPage * MEDIA_PAGE_SIZE, (mediaPage + 1) * MEDIA_PAGE_SIZE);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Content</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Bài viết</h1>
        </div>
        <button onClick={openCreateForm} className="rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">
          + Thêm bài viết
        </button>
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h2>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Tiêu đề<input required name="title" value={post.title} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Slug<input required name="slug" value={post.slug} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Danh mục<select required name="category" value={post.category?._id || post.category || ''} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option value="">Chọn danh mục</option>{categories.map((currentCategory) => <option key={currentCategory._id} value={currentCategory._id}>{currentCategory.name}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Trạng thái<select name="status" value={post.status} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option value="draft">Bản nháp</option><option value="published">Đã xuất bản</option></select></label>
          <div className="grid gap-3 text-sm font-medium text-slate-700 md:col-span-2">
            <label>Ảnh đại diện URL<input name="thumbnail" value={post.thumbnail} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" placeholder="https://..." /></label>
            <div>
              <p>Hoặc chọn ảnh trong Media</p>
              <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isThumbnailUploading}
                className="mt-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isThumbnailUploading ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy'}
              </button>
              {isMediaLoading ? <p className="mt-2 text-sm font-normal text-slate-500">Đang tải thư viện ảnh...</p> : null}
              {!isMediaLoading && !media.length ? <p className="mt-2 text-sm font-normal text-slate-500">Chưa có ảnh trong thư viện.</p> : null}
              {media.length ? <div className="mt-2 flex items-center gap-2">
                {mediaPageCount > 1 ? <button type="button" onClick={() => setMediaPage((current) => Math.max(0, current - 1))} disabled={mediaPage === 0} className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-3 text-sm font-bold text-slate-600 hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Ảnh trước">‹</button> : null}
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                {visibleMedia.map((item) => {
                  const isSelected = item.url === post.thumbnail;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setPost((current) => ({ ...current, thumbnail: item.url }))}
                      className={`overflow-hidden rounded-xl border-2 bg-white text-left transition ${isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`}
                      title={`Chọn ${item.name}`}
                    >
                      <img src={item.url} alt={item.name} className="h-14 w-full object-contain bg-slate-100 p-1" />
                      <span className="block truncate px-1.5 py-1 text-[11px] font-medium text-slate-700">{item.name}</span>
                    </button>
                  );
                })}
                </div>
                {mediaPageCount > 1 ? <button type="button" onClick={() => setMediaPage((current) => Math.min(mediaPageCount - 1, current + 1))} disabled={mediaPage === mediaPageCount - 1} className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-3 text-sm font-bold text-slate-600 hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Ảnh tiếp theo">›</button> : null}
              </div> : null}
              {mediaPageCount > 1 ? <p className="mt-1 text-center text-xs font-normal text-slate-500">Trang {mediaPage + 1}/{mediaPageCount}</p> : null}
            </div>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Mô tả ngắn<textarea name="excerpt" value={post.excerpt} onChange={handleChange} rows="3" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Nội dung<textarea required name="content" value={post.content} onChange={handleChange} rows="8" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" placeholder="Có thể nhập nội dung HTML." /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">SEO title<input name="seoTitle" value={post.seoTitle} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">SEO description<input name="seoDescription" value={post.seoDescription} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <div className="flex gap-3 md:col-span-2"><button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">{editingId ? 'Lưu bài viết' : 'Tạo bài viết'}</button><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-blue-300">Huỷ</button></div>
        </form>
      ) : null}

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Lượt xem</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">Đang tải bài viết...</td></tr> : null}
            {!isLoading && posts.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">Chưa có bài viết.</td></tr> : null}
            {!isLoading && posts.map((currentPost) => (
              <tr key={currentPost._id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-800">{currentPost.title}</td>
                <td className="px-4 py-3 text-slate-600">{currentPost.category?.name || categories.find((item) => item._id === currentPost.category)?.name || 'Chưa phân loại'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {currentPost.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{currentPost.views || 0}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(currentPost.publishedAt || currentPost.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openEditForm(currentPost)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">Sửa</button><button onClick={() => handleDelete(currentPost._id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Xoá</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PostsPage;
