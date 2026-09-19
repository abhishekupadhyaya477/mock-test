/**
 * Data loader — Phase 2: Supabase backend.
 *
 * Every data-access function lives here so the rest of the app
 * never touches `supabase` directly.
 */
import { supabase } from '../lib/supabase';
import type { MockTest, Question, ExamCategory, Option } from '../types/mock';

// ─── Helpers ────────────────────────────────────────────────

/** Map a DB question row (snake_case JSONB options) to our app type. */
function mapQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as string,
    question: row.question as string,
    options: row.options as Option[],
    correctOptionId: row.correct_option_id as string,
    explanation: row.explanation as string,
  };
}

/** Map a DB mock_test row (with nested questions + category) to our app type. */
function mapMockTest(row: Record<string, unknown>): MockTest {
  const questionsRaw = (row.questions ?? []) as Record<string, unknown>[];
  const categoryRaw = row.exam_categories as Record<string, unknown> | null;

  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category_id: row.category_id as string | null,
    category: categoryRaw
      ? {
          id: categoryRaw.id as string,
          exam_group: categoryRaw.exam_group as string,
          sub_category: categoryRaw.sub_category as string,
        }
      : undefined,
    time_limit: row.time_limit as number | null,
    passing_mark: row.passing_mark as number | null,
    is_published: row.is_published as boolean,
    questions: questionsRaw.map(mapQuestion),
  };
}

// ─── Read ───────────────────────────────────────────────────

/** Fetch all mock tests (with their questions and category). */
export async function getMockTests(): Promise<MockTest[]> {
  const { data, error } = await supabase
    .from('mock_tests')
    .select('*, exam_categories(*), questions(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapMockTest);
}

/** Fetch published mock tests only. */
export async function getPublishedMockTests(): Promise<MockTest[]> {
  const { data, error } = await supabase
    .from('mock_tests')
    .select('*, exam_categories(*), questions(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapMockTest);
}

/** Fetch a single mock test by id. */
export async function getMockTestById(
  id: string
): Promise<MockTest | undefined> {
  const { data, error } = await supabase
    .from('mock_tests')
    .select('*, exam_categories(*), questions(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined; // not found
    throw error;
  }
  return mapMockTest(data);
}

// ─── Categories ─────────────────────────────────────────────

/** Fetch all exam categories. */
export async function getExamCategories(): Promise<ExamCategory[]> {
  const { data, error } = await supabase
    .from('exam_categories')
    .select('*')
    .order('exam_group')
    .order('sub_category');

  if (error) throw error;
  return (data ?? []) as ExamCategory[];
}

/** Get distinct exam group names. */
export async function getDistinctExamGroups(): Promise<string[]> {
  const categories = await getExamCategories();
  return [...new Set(categories.map((c) => c.exam_group))];
}

/** Create a new exam category. */
export async function createExamCategory(
  exam_group: string,
  sub_category: string
): Promise<ExamCategory> {
  const { data, error } = await supabase
    .from('exam_categories')
    .insert({ exam_group: exam_group.trim(), sub_category: sub_category.trim() })
    .select()
    .single();

  if (error) throw error;
  return data as ExamCategory;
}

// ─── Write (Mock Tests) ────────────────────────────────────

/** Create a new mock test. Returns the new mock's id. */
export async function createMockTest(input: {
  title: string;
  description: string;
  category_id: string;
  time_limit: number | null;
  passing_mark: number | null;
  is_published: boolean;
}): Promise<string> {
  const { data, error } = await supabase
    .from('mock_tests')
    .insert(input)
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

/** Toggle the is_published flag on a mock test. */
export async function togglePublished(
  id: string,
  is_published: boolean
): Promise<void> {
  const { error } = await supabase
    .from('mock_tests')
    .update({ is_published })
    .eq('id', id);

  if (error) throw error;
}

/** Delete a mock test and its questions (cascade). */
export async function deleteMockTest(id: string): Promise<void> {
  const { error } = await supabase
    .from('mock_tests')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Write (Questions) ─────────────────────────────────────

/** Insert questions for a mock test. */
export async function createQuestions(
  mockTestId: string,
  questions: Omit<Question, 'id'>[]
): Promise<void> {
  const rows = questions.map((q, i) => ({
    mock_test_id: mockTestId,
    question: q.question,
    options: q.options,
    correct_option_id: q.correctOptionId,
    explanation: q.explanation,
    sort_order: i,
  }));

  const { error } = await supabase.from('questions').insert(rows);
  if (error) throw error;
}
