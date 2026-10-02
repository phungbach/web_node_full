import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { formatPostDate, getDateInputValue, toPublishedAtValue } from '../../utils/date';

const createEmptyPost = () => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  thumbnail: '',
  seoTitle: '',
  seoDescription: '',
  status: 'draft',
  category: '',
  publishedAt: getDateInputValue(),
});

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

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const limitText = (value, maxLength) => value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}…`;

function PostsPage() {
  const thumbnailInputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState([]);
  const [post, setPost] = useState(createEmptyPost);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [contentMode, setContentMode] = useState('visual');
  const [contentStyle, setContentStyle] = useState('guide');
  const contentEditorRef = useRef(null);
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
    setPost(createEmptyPost());
    setEditingId(null);
    setContentMode('visual');
    setContentStyle('guide');
    setIsFormOpen(true);
    setMessage('');
    setError('');
    loadMedia();
  };

  const openEditForm = (selectedPost) => {
    setPost({
      ...createEmptyPost(),
      ...selectedPost,
      category: selectedPost.category?._id || selectedPost.category || '',
      publishedAt: getDateInputValue(selectedPost.publishedAt || selectedPost.createdAt || new Date()),
    });
    setEditingId(selectedPost._id);
    setContentMode('visual');
    setContentStyle('guide');
    setIsFormOpen(true);
    setMessage('');
    setError('');
    loadMedia();
  };

  useEffect(() => {
    if (isFormOpen && contentMode === 'visual' && contentEditorRef.current && contentEditorRef.current.innerHTML !== post.content) {
      contentEditorRef.current.innerHTML = post.content || '';
    }
  }, [contentMode, editingId, isFormOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPost((current) => ({
      ...current,
      [name]: value,
      ...(name === 'title' && !editingId ? { slug: makeSlug(value) } : {}),
    }));
  };

  const updateContent = (content) => {
    setPost((current) => ({ ...current, content }));
    if (contentMode === 'visual' && contentEditorRef.current) contentEditorRef.current.innerHTML = content;
  };

  const insertHtmlSnippet = (snippet) => {
    const nextContent = `${post.content ? `${post.content}\n` : ''}${snippet}`;
    updateContent(nextContent);
  };

  const generateStyledContent = () => {
    if (post.content.trim() && !window.confirm('Nội dung hiện tại sẽ được thay bằng mẫu mới. Bạn có muốn tiếp tục?')) return;
    const title = escapeHtml(post.title || 'Học lái xe tại Tuyên Quang');
    const excerpt = escapeHtml(post.excerpt || 'Tìm hiểu lộ trình học lái xe phù hợp và những điều cần chuẩn bị.');
    const templates = {
      guide: `<h2>${title}</h2><p>${excerpt}</p><h2>Lộ trình học lái xe</h2><ol><li>Chuẩn bị hồ sơ và xác định hạng bằng phù hợp.</li><li>Ôn lý thuyết, biển báo và các tình huống giao thông.</li><li>Luyện thực hành theo từng kỹ năng với giáo viên.</li><li>Ôn tập và chuẩn bị trước kỳ thi sát hạch.</li></ol><h2>Kinh nghiệm cần nhớ</h2><p>Hãy học đều đặn, ưu tiên an toàn và ghi lại những lỗi cần cải thiện sau mỗi buổi thực hành.</p><div class="article-cta"><h3>Cần tư vấn khóa học?</h3><p>Gọi <a href="tel:0987499141"><strong>0987499141</strong></a> để được hỗ trợ tại Tuyên Quang.</p></div>`,
      experience: `<h2>${title}</h2><p>${excerpt}</p><h2>Điều nên chuẩn bị trước khi học</h2><p>Người học nên xác định mục tiêu, thời gian rảnh và hạng bằng muốn đăng ký. Việc chuẩn bị sớm giúp quá trình học rõ ràng và tiết kiệm thời gian hơn.</p><h2>Mẹo học hiệu quả</h2><ul><li>Ôn lý thuyết theo từng nhóm chủ đề.</li><li>Luyện kỹ năng chậm, chắc và đúng hướng dẫn.</li><li>Trao đổi ngay với giáo viên khi gặp lỗi.</li></ul><div class="article-cta"><h3>Nhận tư vấn miễn phí</h3><p>Liên hệ <a href="tel:0987499141"><strong>0987499141</strong></a> để được tư vấn lịch học.</p></div>`,
      course: `<h2>${title}</h2><p>${excerpt}</p><h2>Khóa học có gì?</h2><p>Chương trình được sắp xếp theo từng bước, kết hợp kiến thức lý thuyết và thực hành để học viên dễ theo dõi tiến độ.</p><h2>Đối tượng phù hợp</h2><ul><li>Người mới bắt đầu học lái xe.</li><li>Người cần nâng cao kỹ năng và ôn thi.</li><li>Người muốn chọn lịch học linh hoạt.</li></ul><div class="article-cta"><h3>Đăng ký tư vấn</h3><p>Gọi <a href="tel:0987499141"><strong>0987499141</strong></a> để chọn khóa học phù hợp.</p></div>`,
    };

    updateContent(templates[contentStyle]);
    setMessage('Đã tạo nội dung theo mẫu. Bạn có thể chỉnh tiếp ở chế độ Soạn văn bản hoặc HTML.');
  };

  const getSelectedCategoryName = () => {
    const selectedCategory = categories.find((item) => item._id === post.category);
    return selectedCategory?.name || 'học lái xe';
  };

  const generateSeoTitle = () => {
    const title = post.title.trim() || 'Học lái xe tại Tuyên Quang';
    const seoTitle = limitText(`${title} | Học lái xe Tuyên Quang`, 60);
    setPost((current) => ({ ...current, seoTitle }));
    setMessage('Đã tự động tạo SEO title.');
  };

  const generateSeoDescription = () => {
    const title = post.title.trim() || 'học lái xe';
    const category = getSelectedCategoryName();
    const base = post.excerpt.trim() || `Tìm hiểu ${title.toLowerCase()} và lộ trình ${category.toLowerCase()}`;
    const seoDescription = limitText(`${base} tại Tuyên Quang. Gọi 0987499141 để được tư vấn lịch học và hồ sơ.`, 160);
    setPost((current) => ({ ...current, seoDescription }));
    setMessage('Đã tự động tạo SEO description.');
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
    if (!post.content.trim()) {
      setError('Vui lòng nhập nội dung bài viết.');
      return;
    }

    try {
      const postPayload = { ...post, publishedAt: toPublishedAtValue(post.publishedAt) };
      if (editingId) {
        await api.put(`/posts/${editingId}`, postPayload, authConfig());
        setMessage('Đã cập nhật bài viết.');
      } else {
        await api.post('/posts', postPayload, authConfig());
        setMessage('Đã thêm bài viết.');
      }
      setIsFormOpen(false);
      setEditingId(null);
      setPost(createEmptyPost());
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
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Content</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Bài viết</h1>
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
          <label className="grid gap-2 text-sm font-medium text-slate-700">Ngày đăng<input required type="date" name="publishedAt" value={post.publishedAt} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
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
          <div className="grid gap-3 text-sm font-medium text-slate-700 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p>Nội dung</p>
                <p className="mt-1 text-xs font-normal text-slate-500">Soạn trực quan hoặc chuyển sang HTML để chỉnh mã nội dung.</p>
              </div>
              <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                <button type="button" onClick={() => setContentMode('visual')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${contentMode === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Soạn văn bản</button>
                <button type="button" onClick={() => setContentMode('html')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${contentMode === 'html' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>HTML</button>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Gợi ý thẻ HTML</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => insertHtmlSnippet('<h2>Tiêu đề phụ</h2>')} className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">+ H2</button>
                <button type="button" onClick={() => insertHtmlSnippet('<p>Đoạn nội dung mới...</p>')} className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">+ Đoạn văn</button>
                <button type="button" onClick={() => insertHtmlSnippet('<ul><li>Ý thứ nhất</li><li>Ý thứ hai</li></ul>')} className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">+ Danh sách</button>
                <button type="button" onClick={() => insertHtmlSnippet('<div class="article-cta"><h3>Gọi để được tư vấn</h3><p>Liên hệ <a href="tel:0987499141"><strong>0987499141</strong></a> để được hỗ trợ.</p></div>')} className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">+ CTA</button>
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Tự động tạo nội dung</p>
                  <p className="mt-1 text-xs font-normal text-blue-800">Tạo nhanh HTML theo style có sẵn, dựa trên tiêu đề và mô tả ngắn.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={contentStyle} onChange={(event) => setContentStyle(event.target.value)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800 outline-none">
                    <option value="guide">Hướng dẫn</option>
                    <option value="experience">Kinh nghiệm</option>
                    <option value="course">Giới thiệu khóa học</option>
                  </select>
                  <button type="button" onClick={generateStyledContent} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">Tạo nội dung mẫu</button>
                </div>
              </div>
            </div>
            {contentMode === 'visual' ? (
              <div
                ref={contentEditorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(event) => {
                  const content = event.currentTarget.innerHTML;
                  setPost((current) => ({ ...current, content }));
                }}
                className="article-content min-h-[14rem] rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
                role="textbox"
                aria-label="Nội dung bài viết"
              />
            ) : (
              <textarea required name="content" value={post.content} onChange={handleChange} rows="10" className="min-h-[14rem] rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-blue-400" placeholder="<h2>Tiêu đề</h2><p>Nội dung bài viết...</p>" />
            )}
            <textarea name="contentValidation" value={post.content} onChange={() => {}} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute h-px w-px opacity-0" />
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span className="flex flex-wrap items-center justify-between gap-2">SEO title <button type="button" onClick={generateSeoTitle} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Tạo tự động</button></span>
            <input name="seoTitle" value={post.seoTitle} onChange={handleChange} maxLength="60" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" />
            <span className="text-xs font-normal text-slate-500">{post.seoTitle.length}/60 ký tự</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span className="flex flex-wrap items-center justify-between gap-2">SEO description <button type="button" onClick={generateSeoDescription} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Tạo tự động</button></span>
            <textarea name="seoDescription" value={post.seoDescription} onChange={handleChange} maxLength="160" rows="3" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" />
            <span className="text-xs font-normal text-slate-500">{post.seoDescription.length}/160 ký tự</span>
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2"><button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">{editingId ? 'Lưu bài viết' : 'Tạo bài viết'}</button><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-blue-300">Huỷ</button></div>
        </form>
      ) : null}

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="space-y-3 p-3 md:hidden">
          {isLoading ? <p className="p-4 text-center text-sm text-slate-500">Đang tải bài viết...</p> : null}
          {!isLoading && posts.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">Chưa có bài viết.</p> : null}
          {!isLoading && posts.map((currentPost) => (
            <article key={currentPost._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 break-words font-bold text-slate-900">{currentPost.title}</h2>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {currentPost.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div><dt className="text-slate-500">Danh mục</dt><dd className="break-words font-medium text-slate-800">{currentPost.category?.name || categories.find((item) => item._id === currentPost.category)?.name || 'Chưa phân loại'}</dd></div>
                <div><dt className="text-slate-500">Lượt xem</dt><dd className="font-medium text-slate-800">{currentPost.views || 0}</dd></div>
                <div className="col-span-2"><dt className="text-slate-500">Ngày đăng</dt><dd className="text-slate-700">{formatPostDate(currentPost.publishedAt || currentPost.createdAt)}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => openEditForm(currentPost)} className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">Sửa</button>
                <button onClick={() => handleDelete(currentPost._id)} className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Xóa</button>
              </div>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[52rem] text-left text-sm">
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
                <td className="px-4 py-3 text-slate-600">{formatPostDate(currentPost.publishedAt || currentPost.createdAt)}</td>
                <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openEditForm(currentPost)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">Sửa</button><button onClick={() => handleDelete(currentPost._id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Xoá</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default PostsPage;
