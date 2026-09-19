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

/** A complete mock test containing metadata and questions. */
export interface MockTest {
  id: string;
  title: string;
  description: string;
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
