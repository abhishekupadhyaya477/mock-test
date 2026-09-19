import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  LogOut, Plus, Trash2, Upload, Save, Check, 
  AlertTriangle, Loader2, BookOpen, Settings, 
  ToggleLeft, ToggleRight, LayoutDashboard, Database
} from 'lucide-react';
import { 
  getExamCategories, createExamCategory, createMockTest, 
  createQuestions, getMockTests, togglePublished, deleteMockTest 
} from '../../data/loader';
import type { ExamCategory, MockTest, Question } from '../../types/mock';
import mocksData from '../../data/mocks.json';

type Tab = 'create' | 'questions' | 'tools';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline-block">{user?.email}</span>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} flex items-start`}>
            {message.type === 'success' ? <Check className="w-5 h-5 mr-2 mt-0.5" /> : <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`${activeTab === 'create' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Mock
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`${activeTab === 'questions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Questions
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`${activeTab === 'tools' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Tools
            </button>
          </nav>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'create' && <CreateMockTab showMessage={showMessage} onCreated={() => setActiveTab('questions')} />}
          {activeTab === 'questions' && <QuestionsTab showMessage={showMessage} />}
          {activeTab === 'tools' && <ToolsTab showMessage={showMessage} />}
        </div>
      </main>
    </div>
  );
};

const CreateMockTab: React.FC<{ showMessage: (m: string, t: 'success' | 'error') => void, onCreated: () => void }> = ({ showMessage, onCreated }) => {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [examGroup, setExamGroup] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [passingMark, setPassingMark] = useState<string>('');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getExamCategories();
      setCategories(cats);
    } catch (e) {
      console.error(e);
      showMessage('Failed to load categories', 'error');
    }
  };

  const groups = useMemo(() => Array.from(new Set(categories.map(c => c.exam_group))), [categories]);
  const subCategories = useMemo(() => Array.from(new Set(categories.filter(c => c.exam_group === examGroup).map(c => c.sub_category))), [categories, examGroup]);

  const handleCreateCategory = async () => {
    if (!examGroup.trim() || !subCategory.trim()) {
      showMessage('Exam group and sub-category are required', 'error');
      return;
    }
    
    const existing = categories.find(c => c.exam_group.toLowerCase() === examGroup.toLowerCase() && c.sub_category.toLowerCase() === subCategory.toLowerCase());
    
    if (existing) {
      setSelectedCategoryId(existing.id);
      showMessage('Category selected', 'success');
      return;
    }

    try {
      setSaving(true);
      const newCat = await createExamCategory(examGroup, subCategory);
      setCategories([...categories, newCat]);
      setSelectedCategoryId(newCat.id);
      showMessage('Category created and selected', 'success');
    } catch (e) {
      console.error(e);
      showMessage('Failed to create category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !title.trim()) {
      showMessage('Category and title are required', 'error');
      return;
    }

    try {
      setSaving(true);
      await createMockTest({
        title,
        description,
        category_id: selectedCategoryId,
        time_limit: timeLimit ? parseInt(timeLimit) : null,
        passing_mark: passingMark ? parseInt(passingMark) : null,
        is_published: isPublished
      });
      showMessage('Mock test created successfully!', 'success');
      setTitle('');
      setDescription('');
      setTimeLimit('');
      setPassingMark('');
      setIsPublished(false);
      onCreated();
    } catch (e) {
      console.error(e);
      showMessage('Failed to create mock test', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">1. Select or Create Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Group</label>
            <input 
              type="text" 
              list="exam-groups"
              value={examGroup}
              onChange={e => setExamGroup(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="e.g. UPSC, SSC"
            />
            <datalist id="exam-groups">
              {groups.map(g => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
            <input 
              type="text" 
              list="sub-categories"
              value={subCategory}
              onChange={e => setSubCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="e.g. Prelims 2024"
            />
            <datalist id="sub-categories">
              {subCategories.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create & Select Category
            </button>
            {selectedCategoryId && (
              <span className="ml-3 inline-flex items-center text-sm text-green-600 font-medium">
                <Check className="w-4 h-4 mr-1" /> Selected
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">2. Mock Test Details</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={e => setTimeLimit(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Passing Mark</label>
            <input
              type="number"
              value={passingMark}
              onChange={e => setPassingMark(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="published"
            type="checkbox"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
            Publish immediately
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving || !selectedCategoryId}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Save Mock Test
          </button>
        </div>
      </form>
    </div>
  );
};

const QuestionsTab: React.FC<{ showMessage: (m: string, t: 'success' | 'error') => void }> = ({ showMessage }) => {
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [selectedMockId, setSelectedMockId] = useState('');
  
  type QuestionInput = Omit<Question, 'id'> & { id?: string };
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMocks();
  }, []);

  const loadMocks = async () => {
    try {
      const data = await getMockTests();
      setMocks(data);
    } catch (e) {
      console.error(e);
      showMessage('Failed to load mock tests', 'error');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' },
        ],
        correctOptionId: 'a',
        explanation: ''
      }
    ]);
  };

  const handleQuestionChange = (index: number, field: keyof QuestionInput, value: any) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const newQs = [...questions];
    newQs[qIndex].options[optIndex].text = text;
    setQuestions(newQs);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQs = questions.filter((_, i) => i !== index);
    setQuestions(newQs);
  };

  const handleSaveQuestions = async () => {
    if (!selectedMockId) return;
    try {
      setSaving(true);
      await createQuestions(selectedMockId, questions);
      showMessage('Questions saved successfully!', 'success');
      setQuestions([]);
    } catch (e) {
      console.error(e);
      showMessage('Failed to save questions', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Mock Test</label>
        <select
          value={selectedMockId}
          onChange={e => setSelectedMockId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        >
          <option value="">-- Select a Mock Test --</option>
          {mocks.map(m => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>

      {selectedMockId && (
        <div className="space-y-8 mt-8">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white border rounded-lg p-6 shadow-sm relative">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Question {qIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question Text</label>
                  <textarea
                    required
                    rows={2}
                    value={q.question}
                    onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Options (Select the correct one)</label>
                  {q.options.map((opt, oIndex) => (
                    <div key={opt.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctOptionId === opt.id}
                        onChange={() => handleQuestionChange(qIndex, 'correctOptionId', opt.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="font-medium text-gray-500 w-6">{opt.id.toUpperCase()}.</span>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Explanation</label>
                  <textarea
                    rows={2}
                    value={q.explanation}
                    onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between border-t pt-6">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-5 h-5 mr-2 text-gray-400" />
              Add Question
            </button>

            {questions.length > 0 && (
              <button
                type="button"
                onClick={handleSaveQuestions}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                Save All Questions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ToolsTab: React.FC<{ showMessage: (m: string, t: 'success' | 'error') => void }> = ({ showMessage }) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [mocks, setMocks] = useState<MockTest[]>([]);

  useEffect(() => {
    loadMocks();
  }, []);

  const loadMocks = async () => {
    try {
      const data = await getMockTests();
      setMocks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = async () => {
    if (!window.confirm('This will import mocks from mocks.json. Continue?')) return;
    
    setImporting(true);
    let importedCount = 0;
    let questionsCount = 0;

    try {
      // Find or create "Imported" category
      const cats = await getExamCategories();
      let importCat = cats.find(c => c.exam_group === 'Imported' && c.sub_category === 'Auto Import');
      if (!importCat) {
        importCat = await createExamCategory('Imported', 'Auto Import');
      }

      for (let i = 0; i < mocksData.length; i++) {
        const mockData = mocksData[i];
        setProgress(`Importing mock ${i + 1} of ${mocksData.length}...`);
        
        const mockId = await createMockTest({
          title: mockData.title,
          description: mockData.description,
          category_id: importCat.id,
          time_limit: 60,
          passing_mark: 40,
          is_published: true
        });
        importedCount++;

        if (mockData.questions && mockData.questions.length > 0) {
          const qsToInsert = mockData.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctOptionId: q.correctOptionId,
            explanation: q.explanation
          }));
          await createQuestions(mockId, qsToInsert);
          questionsCount += qsToInsert.length;
        }
      }

      showMessage(`Successfully imported ${importedCount} mocks and ${questionsCount} questions.`, 'success');
      loadMocks();
    } catch (e) {
      console.error(e);
      showMessage('Import failed. See console for details.', 'error');
    } finally {
      setImporting(false);
      setProgress('');
    }
  };

  const handleTogglePublished = async (mock: MockTest) => {
    try {
      await togglePublished(mock.id, !mock.is_published);
      loadMocks();
    } catch (e) {
      showMessage('Failed to update status', 'error');
    }
  };

  const handleDeleteMock = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this mock test? This action cannot be undone.')) return;
    
    try {
      await deleteMockTest(id);
      showMessage('Mock test deleted successfully', 'success');
      loadMocks();
    } catch (e) {
      showMessage('Failed to delete mock test', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-50 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-4 sm:mb-0">
          <h3 className="text-lg font-medium text-indigo-900 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Bulk Import
          </h3>
          <p className="text-sm text-indigo-700 mt-1">
            Import mock tests and questions from the static mocks.json file. They will be added to the "Imported" category.
          </p>
          {progress && <p className="text-sm font-semibold text-indigo-800 mt-2">{progress}</p>}
        </div>
        <button
          onClick={handleImport}
          disabled={importing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {importing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
          Import from mocks.json
        </button>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Mock Tests</h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {mocks.map(mock => (
              <li key={mock.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                  <p className="text-sm font-medium text-indigo-600 truncate">{mock.title}</p>
                  <p className="text-sm text-gray-500">
                    Category: {mock.category?.exam_group} - {mock.category?.sub_category}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {mock.questions?.length || 0} Questions
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleTogglePublished(mock)}
                    className={`flex items-center text-sm font-medium ${mock.is_published ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {mock.is_published ? (
                      <><ToggleRight className="w-6 h-6 mr-1" /> Published</>
                    ) : (
                      <><ToggleLeft className="w-6 h-6 mr-1" /> Draft</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteMock(mock.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
            {mocks.length === 0 && (
              <li className="p-8 text-center text-gray-500">
                No mock tests found. Create one or import data.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
