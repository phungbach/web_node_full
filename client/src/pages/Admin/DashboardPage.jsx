import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const number = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);
const date = (value) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(value));

function DashboardPage() {
  const [data, setData] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/analytics/overview').then((response) => setData(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải dashboard.'));
    const loadDatabaseStatus = () => api.get('/analytics/database')
      .then((response) => setDatabaseStatus(response.data.data))
      .catch(() => setDatabaseStatus({ connected: false, status: 'unknown' }));
    loadDatabaseStatus();
    const timer = window.setInterval(loadDatabaseStatus, 15000);
    return () => window.clearInterval(timer);
  }, []);
  const chart = useMemo(() => data?.dailyAnalytics || [], [data]);
  const max = Math.max(1, ...chart.map((item) => item.visitors + item.postViews));
  const stats = [
    ['Khách truy cập (30 ngày)', data?.totalVisitors],
    ['Lượt xem bài viết (30 ngày)', data?.totalPostViews],
    ['Bài viết đã xuất bản', data?.posts],
    ['Tổng đăng ký', data?.totalRegistrations],
    ['Chưa xử lý', data?.unprocessedCount],
    ['Đăng ký mới hôm nay', data?.todayNewCount],
  ];
  const databaseIndicatorColor = !databaseStatus || databaseStatus.status === 'connecting'
    ? 'bg-amber-500'
    : databaseStatus.connected
      ? 'bg-emerald-500'
      : 'bg-red-500';
  const databasePanelColor = !databaseStatus || databaseStatus.status === 'connecting'
    ? 'border-amber-200 bg-amber-50'
    : databaseStatus.connected
      ? 'border-emerald-200 bg-emerald-50'
      : 'border-red-200 bg-red-50';
  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Dashboard</p><h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Tổng quan hệ thống</h1></div>
        <section className={`inline-flex w-fit max-w-full items-center gap-3 rounded-2xl border px-4 py-3 ${databasePanelColor}`}>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${!databaseStatus || databaseStatus.status === 'connecting' ? 'animate-pulse' : ''} ${databaseIndicatorColor}`} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">MySQL</p>
            <p className={`text-xs font-medium ${databaseStatus?.connected ? 'text-emerald-700' : databaseStatus?.status === 'connecting' ? 'text-amber-700' : 'text-red-700'}`}>
              {!databaseStatus
                ? 'Đang kiểm tra...'
                : databaseStatus.status === 'connected'
                  ? 'Đã kết nối'
                  : databaseStatus.status === 'connecting'
                    ? 'Đang kết nối'
                    : databaseStatus.status === 'disconnecting'
                      ? 'Đang ngắt kết nối'
                      : databaseStatus.status === 'disconnected'
                        ? 'Chưa kết nối'
                        : 'Không kiểm tra được'}
            </p>
          </div>
        </section>
      </div>
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">{stats.map(([label, value]) => <div key={label} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6"><p className="text-3xl font-black text-slate-900">{data ? number(value) : '...'}</p><p className="mt-2 break-words text-sm font-semibold text-slate-600">{label}</p></div>)}</div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Thống kê thủ công</p><h2 className="mt-2 text-xl font-bold text-slate-900">Khách truy cập và lượt xem · 30 ngày</h2></div><p className="text-sm text-slate-500">Mỗi lần mở hoặc chuyển trang được tính 1 lượt</p></div>
        <div className="mt-6 flex h-64 items-end gap-1 overflow-x-auto border-b border-slate-200 pb-0">{chart.map((item) => <div key={item.date} className="group flex h-full min-w-[18px] flex-1 flex-col justify-end" title={`${date(item.date)}: ${item.visitors} khách, ${item.postViews} lượt xem`}><div className="w-full rounded-t bg-blue-500" style={{ height: `${Math.max(2, (item.visitors / max) * 100)}%` }} /><div className="w-full bg-yellow-400" style={{ height: `${Math.max(2, (item.postViews / max) * 100)}%` }} /></div>)}</div>
        <div className="mt-4 flex gap-5 text-sm text-slate-600"><span><i className="mr-2 inline-block h-3 w-3 rounded bg-blue-500" />Khách truy cập</span><span><i className="mr-2 inline-block h-3 w-3 rounded bg-yellow-400" />Lượt xem bài viết</span></div>
      </div>
    </div>
  );
}
export default DashboardPage;
