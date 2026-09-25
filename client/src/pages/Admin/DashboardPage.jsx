import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

function formatNumber(value) {
  return value === null || value === undefined ? "--" : new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }).format(new Date(value));
}

function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState({
    posts: null, activeUsers: null, screenPageViews: null, connected: false, message: "",
    totalRegistrations: null, unprocessedCount: null, todayNewCount: null, dailyNewRegistrations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/analytics/overview')
      .then((response) => setDashboardStats(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải dashboard.'))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { label: 'Người truy cập (30 ngày)', value: formatNumber(dashboardStats.activeUsers) },
    { label: 'Lượt xem (30 ngày)', value: formatNumber(dashboardStats.screenPageViews) },
    { label: 'Bài viết đã xuất bản', value: isLoading ? '...' : formatNumber(dashboardStats.posts) },
    { label: 'Tổng đăng ký', value: isLoading ? '...' : formatNumber(dashboardStats.totalRegistrations) },
    { label: 'Chưa xử lý', value: isLoading ? '...' : formatNumber(dashboardStats.unprocessedCount) },
    { label: 'Đăng ký mới hôm nay', value: isLoading ? '...' : formatNumber(dashboardStats.todayNewCount) },
  ];

  const recentDailyRegistrations = useMemo(() => dashboardStats.dailyNewRegistrations || [], [dashboardStats.dailyNewRegistrations]);
  const isAnalyticsConnected = dashboardStats.connected;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Tổng quan hệ thống</h1>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-3xl font-black text-slate-900">{item.value}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Đăng ký mới</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">7 ngày gần nhất</h2>
            </div>
            <span className={`rounded-full px-3 py-2 text-sm font-semibold ${isAnalyticsConnected ? 'bg-yellow-100 text-slate-900' : 'bg-slate-100 text-slate-700'}`}>
              {isAnalyticsConnected ? 'Đang hoạt động' : 'Chưa kết nối'}
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {recentDailyRegistrations.length === 0 ? (
              <p className="text-sm text-slate-600">Chưa có dữ liệu.</p>
            ) : recentDailyRegistrations.map((item) => (
              <div key={item.date} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="w-24 text-sm font-medium text-slate-700">{formatDate(item.date)}</div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, item.count * 20)}%` }} />
                </div>
                <div className="w-10 text-right text-sm font-semibold text-slate-900">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Google Analytics</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Theo dõi website</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isAnalyticsConnected
                ? dashboardStats.message
                : 'Chưa có quyền đọc dữ liệu GA4. Cấu hình Property ID và service account trên server.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
              Mở Google Analytics
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;