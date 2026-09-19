import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  RotateCcw,
  ArrowLeft,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import type { TestResult, QuestionResult } from '../types/mock';

type Filter = 'all' | 'correct' | 'incorrect';

interface Props {
  result: TestResult;
  onRetake: () => void;
  onBackToMocks: () => void;
}

export default function ScoreSummary({
  result,
  onRetake,
  onBackToMocks,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const { totalQuestions, correctCount, incorrectCount, skippedCount, accuracyPercent, questionResults } = result;

  const filtered: QuestionResult[] = questionResults.filter((r) => {
    if (filter === 'correct') return r.isCorrect;
    if (filter === 'incorrect') return !r.isCorrect && r.selectedOptionId !== null;
    return true; // 'all'
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'incorrect', label: 'Incorrect' },
    { key: 'correct', label: 'Correct' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Trophy className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Performance Summary
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </button>
            <button
              onClick={onBackToMocks}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              All Mocks
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Score cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total score */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">
              {correctCount}/{totalQuestions}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Score
            </p>
          </div>

          {/* Accuracy */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">
              {accuracyPercent}%
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Accuracy
            </p>
          </div>

          {/* Correct */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-700">
                {correctCount}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-emerald-600 uppercase tracking-wider">
              Correct
            </p>
          </div>

          {/* Incorrect */}
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-700">
                {incorrectCount}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-red-600 uppercase tracking-wider">
              Incorrect
            </p>
          </div>
        </div>

        {/* Skipped badge (only if any) */}
        {skippedCount > 0 && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-600">
              <MinusCircle className="w-4 h-4 text-slate-400" />
              <span>
                <span className="font-semibold">{skippedCount}</span> skipped /
                unattempted
              </span>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Review list */}
        <div className="space-y-5">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">
              No questions match this filter.
            </p>
          )}

          {filtered.map((r) => {
            const { question, selectedOptionId, isCorrect } = r;
            const wasSkipped = selectedOptionId === null;

            return (
              <div
                key={question.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Question header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
                  <span className="mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : wasSkipped ? (
                      <MinusCircle className="w-5 h-5 text-slate-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Question {questionResults.indexOf(r) + 1}
                    </p>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {question.question}
                    </p>
                  </div>
                </div>

                {/* Options review */}
                <div className="px-5 py-3 space-y-2">
                  {question.options.map((opt) => {
                    const isUserChoice = opt.id === selectedOptionId;
                    const isCorrectAnswer =
                      opt.id === question.correctOptionId;

                    let optClasses =
                      'rounded-lg border px-4 py-2.5 text-sm flex items-center gap-2 ';

                    if (isCorrectAnswer) {
                      optClasses +=
                        'border-emerald-300 bg-emerald-50 text-emerald-800';
                    } else if (isUserChoice && !isCorrect) {
                      optClasses += 'border-red-300 bg-red-50 text-red-800';
                    } else {
                      optClasses +=
                        'border-slate-100 bg-slate-50 text-slate-600';
                    }

                    return (
                      <div key={opt.id} className={optClasses}>
                        {isCorrectAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {isUserChoice && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <span>{opt.text}</span>
                        {isCorrectAnswer && (
                          <span className="ml-auto text-xs font-semibold text-emerald-600">
                            Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <span className="ml-auto text-xs font-semibold text-red-600">
                            Your Answer
                          </span>
                        )}
                        {isUserChoice && isCorrectAnswer && (
                          <span className="ml-auto text-xs font-semibold text-emerald-600">
                            Your Answer ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-900 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
