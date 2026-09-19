import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import type { MockTest, UserAnswers } from '../types/mock';
import { getMockTestById } from '../data/loader';
import { computeTestResult } from '../utils/scoring';

export default function ActiveTest() {
  const { mockId } = useParams<{ mockId: string }>();
  const navigate = useNavigate();

  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!mockId) return;
    getMockTestById(mockId)
      .then((data) => {
        if (!data) {
          navigate('/', { replace: true });
          return;
        }
        setMockTest(data);
      })
      .catch(() => navigate('/', { replace: true }))
      .finally(() => setLoading(false));
  }, [mockId, navigate]);

  if (loading || !mockTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const { questions } = mockTest;
  const current = questions[currentIdx];
  const total = questions.length;
  const progressPercent = ((currentIdx + 1) / total) * 100;

  const selectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
  };

  const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIdx((i) => Math.min(total - 1, i + 1));

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = total - answeredCount;

  const handleSubmit = () => {
    const result = computeTestResult(mockTest, answers);
    navigate(`/test/${mockId}/result`, { state: { result } });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Exit
              </button>
              <h1 className="text-base font-semibold text-slate-800 truncate max-w-[60%] text-center">
                {mockTest.title}
              </h1>
              <span className="text-sm text-slate-500 tabular-nums">
                {answeredCount}/{total}
              </span>
            </div>
          </div>
        </header>

        {/* Progress */}
        <div className="w-full h-1 bg-slate-200">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 mb-1">
            Question {currentIdx + 1} of {total}
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-6 leading-snug">
            {current.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 flex-1">
            {current.options.map((opt) => {
              const selected = answers[current.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => selectOption(opt.id)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all cursor-pointer ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      selected ? 'text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentIdx < total - 1 ? (
              <button
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Submit Test
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Submit Test?
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="ml-auto text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              You have answered{' '}
              <span className="font-semibold text-slate-900">
                {answeredCount}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-900">{total}</span>{' '}
              questions.
              {unansweredCount > 0 && (
                <>
                  {' '}
                  <span className="font-semibold text-amber-600">
                    {unansweredCount}
                  </span>{' '}
                  {unansweredCount === 1
                    ? 'question remains'
                    : 'questions remain'}{' '}
                  unanswered and will be marked as skipped.
                </>
              )}
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
