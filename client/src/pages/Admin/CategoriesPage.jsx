import { useEffect, useState } from 'react';
import api from '../../services/api';

const emptyCategory = { name: '', slug: '', description: '' };
const authConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });

const makeSlug = (name) => name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCategories = () => api.get('/categories')
    .then((response) => setCategories(response.data?.data || []))
    .catch(() => setError('Không thể tải danh mục.'));

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCategory((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !editingId ? { slug: makeSlug(value) } : {}),
    }));
  };

  const openCreate = () => {
    setCategory(emptyCategory);
    setEditingId(null);
    setIsFormOpen(true);
    setMessage('');
    setError('');
  };

  const openEdit = (currentCategory) => {
    setCategory({ ...emptyCategory, ...currentCategory });
    setEditingId(currentCategory._id);
    setIsFormOpen(true);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, category, authConfig());
        setMessage('Đã cập nhật danh mục.');
      } else {
        await api.post('/categories', category, authConfig());
        setMessage('Đã thêm danh mục.');
      }
      setIsFormOpen(false);
      setEditingId(null);
      setCategory(emptyCategory);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu danh mục.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá danh mục này?')) return;

    try {
      await api.delete(`/categories/${id}`, authConfig());
      setMessage('Đã xoá danh mục.');
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xoá danh mục.');
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Content</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Danh mục</h1>
        </div>
        <button onClick={openCreate} className="rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">+ Thêm danh mục</button>
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 md:grid-cols-2">
          <h2 className="text-xl font-bold text-slate-900 md:col-span-2">{editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Tên danh mục<input required name="name" value={category.name} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Slug<input required name="slug" value={category.slug} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Mô tả<textarea name="description" value={category.description} onChange={handleChange} rows="3" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" /></label>
          <div className="flex gap-3 md:col-span-2"><button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">{editingId ? 'Lưu danh mục' : 'Tạo danh mục'}</button><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700">Huỷ</button></div>
        </form>
      ) : null}

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700"><tr><th className="px-4 py-3">Tên danh mục</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Mô tả</th><th className="px-4 py-3">Thao tác</th></tr></thead>
          <tbody>
            {categories.map((currentCategory) => (
              <tr key={currentCategory._id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-semibold text-slate-800">{currentCategory.name}</td>
                <td className="px-4 py-3 text-slate-600">{currentCategory.slug}</td>
                <td className="px-4 py-3 text-slate-600">{currentCategory.description || '—'}</td>
                <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openEdit(currentCategory)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700">Sửa</button><button onClick={() => handleDelete(currentCategory._id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">Xoá</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoriesPage;
