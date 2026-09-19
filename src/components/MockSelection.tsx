import { BookOpen, ArrowRight } from 'lucide-react';
import type { MockTest } from '../types/mock';

interface Props {
  mocks: MockTest[];
  onSelect: (mockId: string) => void;
}

export default function MockSelection({ mocks, onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mock Tests</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Choose a test below to get started
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Cards */}
      <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {mocks.map((mock) => (
            <div
              key={mock.id}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {mock.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {mock.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {mock.questions.length} question
                    {mock.questions.length !== 1 && 's'}
                  </span>

                  <button
                    onClick={() => onSelect(mock.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer"
                  >
                    Start Test
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
