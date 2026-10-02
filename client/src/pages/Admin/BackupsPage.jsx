import { useEffect, useState } from 'react';
import api from '../../services/api';

const formatBytes = (value) => {
  if (!value) return '0 KB';
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (value) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const weekdayLabels = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function BackupsPage() {
  const [backups, setBackups] = useState([]);
  const [destination, setDestination] = useState('server');
  const [restoreSource, setRestoreSource] = useState('server');
  const [selectedBackup, setSelectedBackup] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [downloadingFilename, setDownloadingFilename] = useState('');
  const [deletingFilename, setDeletingFilename] = useState('');
  const [schedule, setSchedule] = useState({ enabled: false, frequency: 'daily', runTime: '02:00', weekday: 1, monthDay: 1, lastRunKey: null });
  const [isScheduleSaving, setIsScheduleSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadBackups = () => {
    setIsLoading(true);
    return api.get('/backups')
      .then((response) => {
        const nextBackups = response.data?.data || [];
        setBackups(nextBackups);
        setSelectedBackup((current) => current && nextBackups.some((backup) => backup.filename === current)
          ? current
          : nextBackups[0]?.filename || '');
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải danh sách backup.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadBackups();
    api.get('/backups/schedule')
      .then((response) => setSchedule((current) => ({ ...current, ...response.data?.data })))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải lịch backup.'));
  }, []);

  const createBackup = async () => {
    setIsCreating(true);
    setMessage('');
    setError('');
    try {
      if (destination === 'download') {
        const response = await api.post('/backups', { destination }, { responseType: 'blob' });
        saveBlob(response.data, `website-backup-${new Date().toISOString().slice(0, 10)}.zip`);
        setMessage('Đã tạo backup và tải xuống máy của bạn.');
      } else {
        const response = await api.post('/backups', { destination });
        setBackups((current) => [response.data.data, ...current]);
        setMessage('Đã tạo và lưu backup trên máy chủ.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tạo gói backup.');
    } finally {
      setIsCreating(false);
    }
  };

  const downloadBackup = async (backup) => {
    setDownloadingFilename(backup.filename);
    setMessage('');
    setError('');
    try {
      const response = await api.get(`/backups/${encodeURIComponent(backup.filename)}/download`, { responseType: 'blob' });
      saveBlob(response.data, backup.filename);
      setMessage('Đã tải gói backup xuống máy của bạn.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải gói backup.');
    } finally {
      setDownloadingFilename('');
    }
  };

  const deleteBackup = async (backup) => {
    if (!window.confirm(`Xóa gói backup "${backup.filename}"? Hành động này không thể hoàn tác.`)) return;

    setDeletingFilename(backup.filename);
    setMessage('');
    setError('');
    try {
      await api.delete(`/backups/${encodeURIComponent(backup.filename)}`);
      setBackups((current) => current.filter((item) => item.filename !== backup.filename));
      setSelectedBackup((current) => (current === backup.filename ? '' : current));
      setMessage('Đã xóa gói backup.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa gói backup.');
    } finally {
      setDeletingFilename('');
    }
  };

  const saveSchedule = async () => {
    setIsScheduleSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await api.put('/backups/schedule', schedule);
      setSchedule(response.data?.data || schedule);
      setMessage(schedule.enabled ? 'Đã bật lịch backup tự động.' : 'Đã tắt lịch backup tự động.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu lịch backup.');
    } finally {
      setIsScheduleSaving(false);
    }
  };

  const restoreBackup = async () => {
    if (restoreConfirmation !== 'RESTORE') {
      setError('Hãy nhập RESTORE để xác nhận ghi đè dữ liệu.');
      return;
    }
    if (restoreSource === 'server' && !selectedBackup) {
      setError('Hãy chọn một gói backup trên máy chủ.');
      return;
    }
    if (restoreSource === 'upload' && !restoreFile) {
      setError('Hãy chọn file ZIP backup từ máy.');
      return;
    }

    setIsRestoring(true);
    setMessage('');
    setError('');
    try {
      const response = restoreSource === 'server'
        ? await api.post('/restore/server', { filename: selectedBackup, confirmation: restoreConfirmation })
        : await api.post(
          '/restore/upload',
          (() => {
            const formData = new FormData();
            formData.append('backup', restoreFile);
            formData.append('confirmation', restoreConfirmation);
            return formData;
          })(),
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
      const counts = response.data?.data?.counts || {};
      setMessage(`Đã restore thành công: ${Object.values(counts).reduce((total, count) => total + count, 0)} bản ghi.`);
      setRestoreConfirmation('');
      setRestoreFile(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể restore dữ liệu.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Cài đặt</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Backup website</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Tạo gói ZIP chứa dữ liệu MySQL của website. File môi trường, mật khẩu và mã nguồn không được đưa vào backup.
        </p>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tạo gói backup</h2>
            <p className="mt-1 text-sm text-slate-500">Chọn nơi lưu file sau khi hệ thống đóng gói dữ liệu. Backup có chứa hash tài khoản Admin để phục hồi đăng nhập.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={`cursor-pointer rounded-2xl border p-4 transition ${destination === 'server' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}>
            <input type="radio" name="backup-destination" value="server" checked={destination === 'server'} onChange={() => setDestination('server')} className="sr-only" />
            <span className="flex items-start gap-3">
              <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border ${destination === 'server' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`} aria-hidden="true" />
              <span>
                <span className="block font-bold text-slate-900">Lưu trên máy chủ</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">Lưu trong thư mục backup của server để quản trị viên tải lại sau.</span>
              </span>
            </span>
          </label>
          <label className={`cursor-pointer rounded-2xl border p-4 transition ${destination === 'download' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}>
            <input type="radio" name="backup-destination" value="download" checked={destination === 'download'} onChange={() => setDestination('download')} className="sr-only" />
            <span className="flex items-start gap-3">
              <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border ${destination === 'download' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`} aria-hidden="true" />
              <span>
                <span className="block font-bold text-slate-900">Tải về máy này</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">Tải trực tiếp file ZIP xuống máy tính đang mở trang Admin.</span>
              </span>
            </span>
          </label>
        </div>

        <button type="button" onClick={createBackup} disabled={isCreating} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isCreating ? 'Đang tạo backup...' : 'Tạo gói backup'}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700" aria-hidden="true">↻</span>
            <div>
            <h2 className="text-xl font-bold text-slate-900">Backup tự động</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Server sẽ tự tạo một gói backup và lưu trên máy chủ theo lịch đã chọn.</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${schedule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{schedule.enabled ? 'Đang bật' : 'Đang tắt'}</span>
        </div>
        <div className="mt-5 grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={schedule.enabled} onChange={(event) => setSchedule((current) => ({ ...current, enabled: event.target.checked }))} className="h-5 w-5 accent-blue-600" />
            <span><span className="block">Bật tự động</span><span className="mt-1 block text-xs font-normal text-slate-500">Tạo và lưu trên server</span></span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Chu kỳ backup</p>
              <div className="grid grid-cols-3 gap-2">
                {[['daily', 'Hàng ngày'], ['weekly', 'Hàng tuần'], ['monthly', 'Hàng tháng']].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setSchedule((current) => ({ ...current, frequency: value }))} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${schedule.frequency === value ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'}`}>{label}</button>
                ))}
              </div>
            </div>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Giờ chạy
              <input type="time" value={schedule.runTime} onChange={(event) => setSchedule((current) => ({ ...current, runTime: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-400" />
            </label>
            {schedule.frequency === 'weekly' ? (
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Ngày trong tuần
                <select value={schedule.weekday} onChange={(event) => setSchedule((current) => ({ ...current, weekday: Number(event.target.value) }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-400">
                  {weekdayLabels.map((label, index) => <option key={label} value={index}>{label}</option>)}
                </select>
              </label>
            ) : null}
            {schedule.frequency === 'monthly' ? (
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Ngày trong tháng
                <select value={schedule.monthDay} onChange={(event) => setSchedule((current) => ({ ...current, monthDay: Number(event.target.value) }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-400">
                  {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => <option key={day} value={day}>Ngày {day}</option>)}
                </select>
              </label>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={saveSchedule} disabled={isScheduleSaving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isScheduleSaving ? 'Đang lưu...' : 'Lưu lịch tự động'}</button>
          <span className="text-xs text-slate-500">Lần chạy gần nhất: {schedule.lastRunKey || 'Chưa chạy'}</span>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gói backup đã lưu trên máy chủ</h2>
            <p className="mt-1 text-sm text-slate-500">Tối đa 5 file trên máy chủ. Khi tạo file thứ 6, file cũ nhất sẽ được tự động xóa.</p>
          </div>
          <button type="button" onClick={loadBackups} disabled={isLoading} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 disabled:opacity-60">
            Làm mới
          </button>
        </div>
        {isLoading ? <p className="mt-6 text-sm text-slate-500">Đang tải danh sách backup...</p> : null}
        {!isLoading && backups.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Chưa có gói backup nào được lưu trên máy chủ.</p> : null}
        {!isLoading && backups.length ? (
          <div className="mt-5 space-y-3">
            {backups.map((backup, index) => (
              <div key={backup.filename} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-all font-semibold text-slate-900">{backup.filename}</p>
                    {index === 0 ? <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">Mới nhất</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{formatBytes(backup.size)} · {formatDate(backup.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" onClick={() => downloadBackup(backup)} disabled={downloadingFilename === backup.filename || deletingFilename === backup.filename} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {downloadingFilename === backup.filename ? 'Đang tải...' : 'Tải xuống'}
                  </button>
                  <button type="button" onClick={() => deleteBackup(backup)} disabled={downloadingFilename === backup.filename || deletingFilename === backup.filename} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {deletingFilename === backup.filename ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-rose-200 bg-white p-4 shadow-soft sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">Khôi phục</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Restore dữ liệu</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Restore sẽ xóa dữ liệu hiện tại rồi thay bằng dữ liệu trong gói backup. Hãy tạo một backup mới trước khi thực hiện.</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={`cursor-pointer rounded-2xl border p-4 transition ${restoreSource === 'server' ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-rose-300'}`}>
            <input type="radio" name="restore-source" value="server" checked={restoreSource === 'server'} onChange={() => setRestoreSource('server')} className="sr-only" />
            <span className="block font-bold text-slate-900">Chọn backup trên máy chủ</span>
            <span className="mt-1 block text-sm text-slate-600">Dùng một file đang có trong danh sách backup ở trên.</span>
          </label>
          <label className={`cursor-pointer rounded-2xl border p-4 transition ${restoreSource === 'upload' ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-rose-300'}`}>
            <input type="radio" name="restore-source" value="upload" checked={restoreSource === 'upload'} onChange={() => setRestoreSource('upload')} className="sr-only" />
            <span className="block font-bold text-slate-900">Chọn file từ máy này</span>
            <span className="mt-1 block text-sm text-slate-600">Tải lên một file ZIP backup đã lưu trên máy tính.</span>
          </label>
        </div>

        <div className="mt-4">
          {restoreSource === 'server' ? (
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Gói backup
              <select value={selectedBackup} onChange={(event) => setSelectedBackup(event.target.value)} disabled={!backups.length} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">{backups.length ? 'Chọn gói backup' : 'Chưa có backup trên máy chủ'}</option>
                {backups.map((backup) => <option key={backup.filename} value={backup.filename}>{backup.filename} · {formatDate(backup.createdAt)}</option>)}
              </select>
            </label>
          ) : (
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              File ZIP backup
              <input type="file" accept=".zip,application/zip" onChange={(event) => setRestoreFile(event.target.files?.[0] || null)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-slate-700" />
            </label>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="restore-confirmation">Nhập <strong>RESTORE</strong> để xác nhận</label>
          <input id="restore-confirmation" value={restoreConfirmation} onChange={(event) => setRestoreConfirmation(event.target.value.toUpperCase())} placeholder="RESTORE" className="max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 uppercase outline-none focus:border-rose-400" />
        </div>
        <button type="button" onClick={restoreBackup} disabled={isRestoring} className="mt-5 rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isRestoring ? 'Đang restore...' : 'Restore dữ liệu'}
        </button>
      </section>
    </div>
  );
}

export default BackupsPage;
