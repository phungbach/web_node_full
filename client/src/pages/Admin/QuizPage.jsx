import { useEffect, useState } from 'react';
import api from '../../services/api';

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
const licensesByVehicle = { car: ['B1', 'B2'], motorbike: ['A1', 'A2'] };

const createEmptyQuestion = () => ({
  vehicleType: 'car',
  licenseType: 'B1',
  question: '',
  options: ['', '', '', ''],
  correctOption: 0,
  explanation: '',
  status: 'published',
});

const vehicleLabels = { car: 'Ô tô', motorbike: 'Xe máy' };
const importTemplate = 'Loại xe,Hạng bằng,Câu hỏi,A,B,C,D,Câu đúng\nÔ tô,B1,"Khi chuẩn bị chuyển hướng, người lái cần làm gì?","Quan sát và bật tín hiệu","Tăng tốc","Tắt đèn","Đi sát xe trước",A';

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [vehicleFilter, setVehicleFilter] = useState('car');
  const [licenseFilter, setLicenseFilter] = useState('B1');
  const [duplicateOnly, setDuplicateOnly] = useState(false);
  const [question, setQuestion] = useState(createEmptyQuestion);
  const [editingId, setEditingId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const loadQuestions = () => {
    setIsLoading(true);
    return api.get('/quiz/admin')
      .then((response) => setQuestions(response.data?.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải bộ câu hỏi.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const openCreateForm = () => {
    setQuestion(createEmptyQuestion());
    setEditingId('');
    setIsFormOpen(true);
    setMessage('');
    setError('');
  };

  const openEditForm = (selectedQuestion) => {
    const vehicleType = selectedQuestion.vehicleType === 'motorbike' ? 'motorbike' : 'car';
    const options = selectedQuestion.options?.length >= 2 ? selectedQuestion.options : ['', ''];
    setQuestion({
      ...createEmptyQuestion(),
      ...selectedQuestion,
      vehicleType,
      licenseType: licensesByVehicle[vehicleType].includes(selectedQuestion.licenseType)
        ? selectedQuestion.licenseType
        : licensesByVehicle[vehicleType][0],
      options,
    });
    setEditingId(selectedQuestion._id);
    setIsFormOpen(true);
    setMessage('');
    setError('');
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setQuestion((current) => ({
      ...current,
      [name]: name === 'correctOption' ? Number(value) : value,
      ...(name === 'vehicleType' ? { licenseType: licensesByVehicle[value][0] } : {}),
    }));
  };

  const updateOption = (index, value) => {
    setQuestion((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }));
  };

  const addOption = () => {
    setQuestion((current) => (current.options.length >= 6
      ? current
      : { ...current, options: [...current.options, ''] }));
  };

  const removeOption = (index) => {
    setQuestion((current) => {
      if (current.options.length <= 2) return current;
      const options = current.options.filter((_, optionIndex) => optionIndex !== index);
      const correctOption = current.correctOption === index
        ? 0
        : current.correctOption > index
          ? current.correctOption - 1
          : current.correctOption;
      return { ...current, options, correctOption: Math.min(correctOption, options.length - 1) };
    });
  };

  const duplicateCount = questions.filter((item) => item.vehicleType === vehicleFilter && item.licenseType === licenseFilter && item.isDuplicate).length;
  const filteredQuestions = questions.filter((item) => item.vehicleType === vehicleFilter && item.licenseType === licenseFilter && (!duplicateOnly || item.isDuplicate));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = editingId
        ? await api.put(`/quiz/admin/${editingId}`, question)
        : await api.post('/quiz/admin', question);
      setMessage(editingId ? 'Đã cập nhật câu hỏi.' : 'Đã thêm câu hỏi.');
      setQuestions((current) => editingId
        ? current.map((item) => (item._id === editingId ? response.data.data : item))
        : [response.data.data, ...current]);
      setIsFormOpen(false);
      setEditingId('');
      setQuestion(createEmptyQuestion());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu câu hỏi.');
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    setMessage('');
    setError('');
    try {
      await api.delete(`/quiz/admin/${id}`);
      setQuestions((current) => current.filter((item) => item._id !== id));
      setMessage('Đã xóa câu hỏi.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa câu hỏi.');
    }
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([importTemplate], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importQuestions = async () => {
    if (!importFile) {
      setError('Hãy chọn file CSV từ Google Sheets.');
      return;
    }
    setIsImporting(true);
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const response = await api.post('/quiz/admin/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const report = response.data?.data || {};
      setMessage(`Import xong: ${report.imported || 0} câu mới, bỏ qua ${report.skipped || 0} câu trùng${report.errors?.length ? `, ${report.errors.length} dòng lỗi` : ''}.`);
      if (report.errors?.length) setError(report.errors.slice(0, 5).join(' '));
      setImportFile(null);
      await loadQuestions();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể import file câu hỏi.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Học lái xe</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Bộ câu hỏi luyện đề thi</h1>
          <p className="mt-2 text-sm text-slate-500">Thêm câu hỏi trắc nghiệm, đáp án đúng và lời giải thích cho học viên.</p>
        </div>
        <button type="button" onClick={openCreateForm} className="rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">+ Thêm câu hỏi</button>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</p> : null}

      <section className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-bold text-blue-900">Import từ Google Sheets</h2>
            <p className="mt-1 text-sm leading-6 text-blue-800">Trong Google Sheets chọn <strong>File → Download → Comma-separated values (.csv)</strong>, sau đó tải file lên đây.</p>
            <p className="mt-1 text-xs text-blue-700">Cột bắt buộc: Loại xe, Hạng bằng, Câu hỏi, A, B, C, D, Câu đúng. Đáp án đúng nhận A/B/C/D hoặc 1/2/3/4.</p>
          </div>
          <button type="button" onClick={downloadTemplate} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">Tải file mẫu</button>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="file" accept=".csv,.tsv,.txt,text/csv" onChange={(event) => setImportFile(event.target.files?.[0] || null)} className="block min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:font-semibold file:text-white" />
          <button type="button" onClick={importQuestions} disabled={isImporting || !importFile} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{isImporting ? 'Đang import...' : 'Import câu hỏi'}</button>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap gap-2">
          {Object.entries(vehicleLabels).map(([value, label]) => (
            <button key={value} type="button" onClick={() => { setVehicleFilter(value); setLicenseFilter(licensesByVehicle[value][0]); }} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${vehicleFilter === value ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:text-blue-700'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
          <span className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Hạng bằng:</span>
          {licensesByVehicle[vehicleFilter].map((license) => (
            <button key={license} type="button" onClick={() => setLicenseFilter(license)} className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${licenseFilter === license ? 'border-red-500 bg-red-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600'}`}>
              {license}
            </button>
          ))}
          <button type="button" onClick={() => setDuplicateOnly((current) => !current)} className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${duplicateOnly ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700'}`}>
            {duplicateOnly ? 'Đang lọc câu trùng' : 'Lọc câu trùng'}{duplicateCount ? ` (${duplicateCount})` : ''}
          </button>
          <span className="ml-auto text-xs text-slate-500">{filteredQuestions.length} câu hỏi</span>
        </div>
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 md:grid-cols-2">
          <h2 className="text-xl font-bold text-slate-900 md:col-span-2">{editingId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Loại xe
            <select name="vehicleType" value={question.vehicleType} onChange={updateField} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">
              <option value="car">Ô tô</option>
              <option value="motorbike">Xe máy</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Hạng bằng
            <select name="licenseType" value={question.licenseType} onChange={updateField} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">
              {licensesByVehicle[question.vehicleType].map((license) => <option key={license} value={license}>{license}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Trạng thái
            <select name="status" value={question.status} onChange={updateField} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Nội dung câu hỏi
            <textarea required name="question" value={question.question} onChange={updateField} rows="3" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" placeholder="Ví dụ: Khi chuẩn bị chuyển hướng, người lái cần làm gì trước?" />
          </label>
          <div className="grid gap-3 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">Đáp án ({question.options.length}/6)</p>
              <button type="button" onClick={addOption} disabled={question.options.length >= 6} className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">+ Thêm đáp án</button>
            </div>
            {question.options.map((option, index) => (
              <label key={optionLabels[index]} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700">{optionLabels[index]}</span>
                <input required value={option} onChange={(event) => updateOption(index, event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" placeholder={`Nội dung đáp án ${optionLabels[index]}`} />
                <button type="button" onClick={() => removeOption(index)} disabled={question.options.length <= 2} className="rounded-lg px-2 py-1 text-lg font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Xóa đáp án ${optionLabels[index]}`}>×</button>
              </label>
            ))}
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Đáp án đúng
            <select name="correctOption" value={question.correctOption} onChange={updateField} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">
              {question.options.map((_, index) => <option key={optionLabels[index]} value={index}>Đáp án {optionLabels[index]}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Giải thích đáp án
            <textarea name="explanation" value={question.explanation} onChange={updateField} rows="3" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" placeholder="Giải thích ngắn giúp học viên hiểu vì sao đáp án này đúng." />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">{editingId ? 'Lưu câu hỏi' : 'Tạo câu hỏi'}</button>
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-blue-300">Hủy</button>
          </div>
        </form>
      ) : null}

      <div className="rounded-2xl border border-slate-200">
        {isLoading ? <p className="p-6 text-sm text-slate-500">Đang tải câu hỏi...</p> : null}
        {!isLoading && !filteredQuestions.length ? <p className="p-6 text-sm text-slate-500">Chưa có câu hỏi trong nhóm {vehicleLabels[vehicleFilter]} - {licenseFilter}.</p> : null}
        {!isLoading && filteredQuestions.length ? (
          <>
            <div className="space-y-3 p-3 md:hidden">
              {filteredQuestions.map((item) => (
                <article key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{vehicleLabels[item.vehicleType]}</span>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">{item.licenseType}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>
                  </div>
                  <h2 className="mt-3 break-words font-bold leading-6 text-slate-900">{item.question}</h2>
                  {item.isDuplicate ? <p className="mt-2 text-xs font-semibold text-amber-700">Câu này trùng nội dung với {item.duplicateCount - 1} câu khác trong nhóm.</p> : null}
                  <p className="mt-2 text-sm text-slate-600">Đáp án đúng: <strong className="text-blue-700">{optionLabels[item.correctOption] || '--'}</strong></p>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => openEditForm(item)} className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">Sửa</button>
                    <button type="button" onClick={() => deleteQuestion(item._id)} className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Xóa</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[62rem] text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr><th className="px-4 py-3">Câu hỏi</th><th className="px-4 py-3">Loại xe</th><th className="px-4 py-3">Hạng bằng</th><th className="px-4 py-3">Đáp án</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thao tác</th></tr>
            </thead>
            <tbody>
              {filteredQuestions.map((item) => (
                <tr key={item._id} className="border-t border-slate-200 align-top">
                  <td className="max-w-xl px-4 py-3 font-medium text-slate-800">{item.question}</td>
                  <td className="px-4 py-3 text-slate-600">{vehicleLabels[item.vehicleType] || item.vehicleType}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{item.licenseType || (item.vehicleType === 'motorbike' ? 'A1' : 'B1')}</td>
                  <td className="px-4 py-3 text-slate-600">{optionLabels[item.correctOption] || '--'}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>{item.isDuplicate ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Trùng</span> : null}</div></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button type="button" onClick={() => openEditForm(item)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">Sửa</button><button type="button" onClick={() => deleteQuestion(item._id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Xóa</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default QuizPage;
