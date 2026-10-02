import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const optionLabels = ['A', 'B', 'C', 'D'];
const vehicleOptions = [
  { value: 'car', label: 'Ô tô' },
  { value: 'motorbike', label: 'Xe máy' },
];
const licensesByVehicle = { car: ['B1', 'B2'], motorbike: ['A1', 'A2'] };

const filterOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unanswered', label: 'Chưa ôn' },
  { value: 'answered', label: 'Đã chọn' },
];

const getQuestionState = (question, answers) => (answers[question._id] === undefined ? 'unanswered' : 'answered');

function Quiz() {
  const [vehicleType, setVehicleType] = useState('car');
  const [licenseType, setLicenseType] = useState('B1');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionFilter, setQuestionFilter] = useState('all');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setQuestionFilter('all');
    api.get(`/quiz?vehicleType=${vehicleType}&licenseType=${licenseType}`)
      .then((response) => setQuestions(response.data?.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải bộ câu hỏi.'))
      .finally(() => setIsLoading(false));
  }, [licenseType, vehicleType]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const remainingCount = Math.max(0, questions.length - answeredCount);
  const completion = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const progress = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const visibleIndexes = useMemo(
    () => questions
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => questionFilter === 'all' || getQuestionState(question, answers) === questionFilter)
      .map(({ index }) => index),
    [answers, questionFilter, questions],
  );
  const vehicleLabel = vehicleOptions.find((option) => option.value === vehicleType)?.label || 'Ô tô';
  const scoreMessage = result
    ? result.percentage >= 80
      ? 'Bạn đang nắm khá tốt các kiến thức cơ bản.'
      : result.percentage >= 50
        ? 'Hãy xem lại phần giải thích và luyện thêm nhé.'
        : 'Bạn nên ôn lại kiến thức rồi thử lại một lần nữa.'
    : '';

  const chooseFilter = (filter) => {
    setQuestionFilter(filter);
    const nextIndexes = questions
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => filter === 'all' || getQuestionState(question, answers) === filter)
      .map(({ index }) => index);
    if (nextIndexes.length && !nextIndexes.includes(currentIndex)) setCurrentIndex(nextIndexes[0]);
  };

  const chooseAnswer = (optionIndex) => {
    if (!currentQuestion) return;
    setAnswers((current) => ({ ...current, [currentQuestion._id]: optionIndex }));
  };

  const submitQuiz = async () => {
    setError('');
    try {
      const response = await api.post('/quiz/submit', {
        vehicleType,
        licenseType,
        answers: Object.entries(answers).map(([questionId, optionIndex]) => ({ questionId, optionIndex })),
      });
      setResult(response.data?.data || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể chấm điểm bài luyện đề thi.');
    }
  };

  const restart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setQuestionFilter('all');
    setResult(null);
    setError('');
  };

  const selectVehicle = (value) => {
    setVehicleType(value);
    setLicenseType(licensesByVehicle[value][0]);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-100 text-slate-700">
      <div className="border-t-4 border-red-500 bg-blue-700 text-white shadow-lg">
        <div className="container-shell py-9 sm:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">Ôn tập lý thuyết</p>
              <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">Luyện đề thi lái {vehicleLabel.toLowerCase()} {licenseType}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Luyện từng câu, theo dõi tiến độ và xem lời giải sau khi nộp bài.</p>
            </div>
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 sm:max-w-md">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">Loại xe</p>
                  <div className="flex flex-wrap gap-2">
                    {vehicleOptions.map((option) => (
                      <button key={option.value} type="button" onClick={() => selectVehicle(option.value)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${vehicleType === option.value ? 'border-yellow-400 bg-yellow-400 text-blue-700 shadow-sm' : 'border-blue-200/60 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400'}`}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">Hạng bằng</p>
                  <div className="flex flex-wrap gap-2">
                    {licensesByVehicle[vehicleType].map((license) => (
                      <button key={license} type="button" onClick={() => setLicenseType(license)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${licenseType === license ? 'border-red-500 bg-red-500 text-white shadow-sm' : 'border-blue-200/60 bg-white/10 text-blue-100 hover:border-red-300 hover:text-white'}`}>
                        {license}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[
              [currentIndex + 1, 'câu đang ôn'],
              [remainingCount, 'câu còn lại'],
              [`${completion}%`, 'hoàn thành'],
              [questions.length, 'câu hỏi'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-2xl font-black text-yellow-400 sm:text-3xl">{isLoading ? '...' : value}</p>
                <p className="mt-1 text-xs font-semibold text-blue-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-shell py-6 sm:py-8">
        {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {isLoading ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-soft">Đang tải câu hỏi...</div> : null}
        {!isLoading && !questions.length ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-soft">Chưa có câu hỏi cho nhóm này.</div> : null}

        {!isLoading && questions.length && !result ? (
          <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
              <p className="px-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Chương</p>
              <div className="mt-4 space-y-2">
                <button type="button" onClick={() => chooseFilter('all')} className="flex w-full items-center justify-between rounded-xl bg-blue-50 px-3 py-3 text-left text-sm font-bold text-blue-700">
                  <span>Chương 1 — Ôn tập {vehicleLabel.toLowerCase()} {licenseType}</span>
                  <span className="shrink-0 text-xs text-blue-700">{questions.length}</span>
                </button>
                <div className="border-b border-slate-200 pb-3 text-xs text-slate-500">Các câu hỏi được quản lý từ trang Admin.</div>
              </div>
              <div className="mt-4 grid gap-2">
                <button type="button" onClick={restart} className="rounded-xl bg-yellow-400 px-3 py-2.5 text-sm font-bold text-blue-700 hover:bg-yellow-300">Làm lại từ đầu</button>
                <a href="tel:0987499141" className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-bold text-blue-700 hover:border-red-500 hover:text-red-500">Cần tư vấn khóa học</a>
              </div>
            </aside>

            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
                <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <h2 className="font-bold text-blue-700">Chương 1 — Quy định {vehicleLabel.toLowerCase()} {licenseType}</h2>
                  <span className="text-xs font-semibold text-slate-500">{currentIndex + 1}/{questions.length} đang ôn</span>
                </div>
                <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
                  {filterOptions.map((filter) => (
                    <button key={filter.value} type="button" onClick={() => chooseFilter(filter.value)} className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${questionFilter === filter.value ? 'border-[#0B3B78] bg-[#0B3B78] text-white' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-[#0B3B78]'}`}>
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-5">
                  {visibleIndexes.map((index) => {
                    const question = questions[index];
                    const answered = answers[question._id] !== undefined;
                    return (
                      <button key={question._id} type="button" onClick={() => setCurrentIndex(index)} className={`relative h-9 w-9 rounded-lg border text-xs font-bold transition ${currentIndex === index ? 'border-[#FFC400] bg-[#FFC400] text-[#0B3B78]' : answered ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-[#0B3B78]'}`}>
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:px-5">
                  <span><i className="mr-2 inline-block h-3 w-3 rounded border border-emerald-500 bg-emerald-50 align-[-1px]" />Đã chọn</span>
                  <span><i className="mr-2 inline-block h-3 w-3 rounded border border-slate-200 align-[-1px]" />Chưa ôn</span>
                  <span><i className="mr-2 inline-block h-3 w-3 rounded bg-[#FFC400] align-[-1px]" />Đang xem</span>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
                  <button type="button" onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))} disabled={currentIndex === 0} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#0B3B78] hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40">‹ Câu trước</button>
                  <span className="text-xs font-semibold text-slate-500">Câu {currentIndex + 1}/{questions.length}</span>
                  {currentIndex < questions.length - 1 ? (
                    <button type="button" onClick={() => setCurrentIndex((current) => current + 1)} className="rounded-xl bg-[#0057B8] px-4 py-2 text-sm font-bold text-white hover:bg-[#0B3B78]">Câu sau ›</button>
                  ) : (
                    <button type="button" onClick={submitQuiz} className="rounded-xl bg-[#FFC400] px-4 py-2 text-sm font-bold text-[#17222b] hover:bg-yellow-300">Nộp bài</button>
                  )}
                </div>
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E31B23]">Câu hỏi {currentIndex + 1}</p>
                  <h3 className="mt-3 text-lg font-bold leading-8 text-[#0B3B78] sm:text-xl">{currentQuestion.question}</h3>
                  <div className="mt-6 grid gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <label key={optionLabels[index]} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${answers[currentQuestion._id] === index ? 'border-[#FFC400] bg-yellow-50 text-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}>
                        <input type="radio" name={`question-${currentQuestion._id}`} checked={answers[currentQuestion._id] === index} onChange={() => chooseAnswer(index)} className="mt-1 accent-yellow-400" />
                        <span><strong className="mr-2 text-[#E31B23]">{optionLabels[index]}.</strong>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#E31B23] transition-all" style={{ width: `${progress}%` }} /></div>
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="mx-auto max-w-4xl space-y-6">
            <section className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-center sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E31B23]">Kết quả luyện đề thi</p>
              <p className="mt-3 text-5xl font-black text-[#0B3B78]">{result.score}/{result.total}</p>
              <p className="mt-2 text-lg font-bold text-[#E31B23]">{result.percentage}%</p>
              <p className="mt-2 text-slate-600">{scoreMessage}</p>
              <button type="button" onClick={restart} className="mt-5 rounded-xl bg-[#E31B23] px-5 py-3 font-bold text-white hover:bg-red-700">Làm lại</button>
            </section>
            <div className="space-y-4">
              {result.results.map((item, index) => (
                <article key={item._id} className={`rounded-2xl border p-5 ${item.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Câu {index + 1}</p>
                  <h3 className="mt-2 font-bold leading-7 text-[#0B3B78]">{item.question}</h3>
                  <p className="mt-3 text-sm font-semibold text-slate-700">Đáp án đúng: {optionLabels[item.correctOption]}. {item.options[item.correctOption]}</p>
                  {item.selectedOption !== null && !item.isCorrect ? <p className="mt-1 text-sm text-red-700">Bạn chọn: {optionLabels[item.selectedOption]}. {item.options[item.selectedOption]}</p> : null}
                  {item.explanation ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.explanation}</p> : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Quiz;
