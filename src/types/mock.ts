/** A single selectable option within a question. */
export interface Option {
  id: string;
  text: string;
}

/** A single question in a mock test. */
export interface Question {
  id: string;
  question: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
}

/** An exam category grouping (e.g. Assam PGT → Political Science). */
export interface ExamCategory {
  id: string;
  exam_group: string;
  sub_category: string;
}

/** A complete mock test containing metadata and questions. */
export interface MockTest {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  category?: ExamCategory;
  time_limit: number | null;
  passing_mark: number | null;
  is_published: boolean;
  questions: Question[];
}

/**
 * Map of questionId → selected optionId.
 * A missing key means the question was skipped/unattempted.
 */
export type UserAnswers = Record<string, string>;

/** Result for a single question after test submission. */
export interface QuestionResult {
  question: Question;
  selectedOptionId: string | null;
  isCorrect: boolean;
}

/** Aggregate score after test submission. */
export interface TestResult {
  mockTest: MockTest;
  answers: UserAnswers;
  questionResults: QuestionResult[];
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercent: number;
}
