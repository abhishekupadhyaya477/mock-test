import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Loader2, Search } from 'lucide-react';
import type { MockTest } from '../types/mock';
import { getPublishedMockTests } from '../data/loader';

export default function MockSelection() {
  const navigate = useNavigate();

  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  // Fetch published mocks
  useEffect(() => {
    getPublishedMockTests()
      .then((data) => {
        setMocks(data);
        // Default to first group
        const groups = [...new Set(data.map((m) => m.category?.exam_group).filter(Boolean))] as string[];
        if (groups.length > 0) setActiveGroup(groups[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Categories to hide from candidate-facing views
  const HIDDEN_GROUPS = ['Imported'];
  const HIDDEN_SUBS = ['Auto Import'];

  // Derive groups (excluding hidden)
  const examGroups = useMemo(() => {
    const groups = mocks
      .map((m) => m.category?.exam_group)
      .filter((g): g is string => !!g && !HIDDEN_GROUPS.includes(g));
    return [...new Set(groups)];
  }, [mocks]);

  // Derive sub-categories for active group (excluding hidden)
  const subCategories = useMemo(() => {
    const subs = mocks
      .filter((m) => m.category?.exam_group === activeGroup)
      .map((m) => m.category?.sub_category)
      .filter((s): s is string => !!s && s.length > 0 && !HIDDEN_SUBS.includes(s));
    return [...new Set(subs)];
  }, [mocks, activeGroup]);

  // Filter mocks (also exclude hidden categories)
  const filtered = useMemo(() => {
    return mocks.filter((m) => {
      // Always hide mocks in hidden categories
      if (HIDDEN_GROUPS.includes(m.category?.exam_group ?? '')) return false;
      // If no categories exist at all, show everything
      if (examGroups.length === 0) return true;
      if (m.category?.exam_group !== activeGroup) return false;
      if (activeSub && m.category?.sub_category !== activeSub) return false;
      return true;
    });
  }, [mocks, activeGroup, activeSub, examGroups]);

  // When group changes, reset sub-category
  const handleGroupChange = (group: string) => {
    setActiveGroup(group);
    setActiveSub(null);
  };

  // ─── Loading / Error states ─────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <p className="text-red-700 font-medium">Failed to load tests</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

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

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Exam group tabs */}
        {examGroups.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {examGroups.map((group) => (
              <button
                key={group}
                onClick={() => handleGroupChange(group)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  activeGroup === group
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        )}

        {/* Sub-category pills */}
        {subCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSub(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                activeSub === null
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  activeSub === sub
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Mock cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No published tests found
              {activeGroup ? ` in "${activeGroup}"` : ''}.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filtered.map((mock) => (
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

                  {/* Meta row */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {mock.questions.length} question
                      {mock.questions.length !== 1 && 's'}
                    </span>
                    {mock.time_limit && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                        {mock.time_limit} min
                      </span>
                    )}
                    {mock.category?.sub_category && (
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-3 py-1">
                        {mock.category.sub_category}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => navigate(`/test/${mock.id}`)}
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
        )}
      </main>
    </div>
  );
}
