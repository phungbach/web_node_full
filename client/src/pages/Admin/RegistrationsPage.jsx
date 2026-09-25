import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const statusOptions = [
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const courseLabels = { car: 'Ô tô', motorbike: 'Xe máy', unknown: 'Chưa biết' };
const statusMeta = { new: 'bg-blue-100 text-blue-700', contacted: 'bg-amber-100 text-amber-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-rose-100 text-rose-700' };
const formatDate = (value) => (value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '--');

function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadRegistrations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/registrations');
      setRegistrations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRegistrations(); }, []);
  const total = useMemo(() => registrations.length, [registrations]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');
    try {
      const response = await api.patch('/registrations/' + id + '/status', { status });
      const updated = response.data.data;
      setRegistrations((current) => current.map((item) => (item._id === id ? updated : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingId('');
    }
  };

  const deleteRegistration = async (id, name) => {
    if (!window.confirm('Xóa đăng ký của ' + name + '? Hành động này không thể hoàn tác.')) return;
    setDeletingId(id);
    setError('');
    try {
      await api.delete('/registrations/' + id);
      setRegistrations((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa đăng ký.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Đăng ký</p><h1 className="mt-2 text-3xl font-black text-slate-900">Danh sách đăng ký</h1></div>
        <p className="text-sm text-slate-600">Tổng: <span className="font-semibold text-slate-900">{total}</span></p>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        {isLoading ? (
          <div className="p-6 text-sm text-slate-600">Đang tải danh sách...</div>
        ) : registrations.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">Chưa có đăng ký nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Khóa học</th>
                  <th className="px-4 py-3">Khu vực</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Cập nhật</th>
                  <th className="px-4 py-3">Xóa</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row) => (
                  <tr key={row._id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3">{row.phone}</td>
                    <td className="px-4 py-3">{courseLabels[row.courseType] || row.courseType || '--'}</td>
                    <td className="px-4 py-3">{row.area || '--'}</td>
                    <td className="px-4 py-3 max-w-xs whitespace-pre-wrap">{row.note || '--'}</td>
                    <td className="px-4 py-3">
                      <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + (statusMeta[row.status] || 'bg-slate-100 text-slate-700')}>
                        {(statusOptions.find((item) => item.value === row.status)?.label) || row.status || 'Mới'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status || 'new'}
                        onChange={(e) => updateStatus(row._id, e.target.value)}
                        disabled={updatingId === row._id || deletingId === row._id}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => deleteRegistration(row._id, row.name)}
                        disabled={deletingId === row._id || updatingId === row._id}
                        className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === row._id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationsPage;
