import type { MockTest, UserAnswers, QuestionResult, TestResult } from '../types/mock';

/** Compute the full test result from a mock test and the user's answers. */
export function computeTestResult(
  mockTest: MockTest,
  answers: UserAnswers
): TestResult {
  const questionResults: QuestionResult[] = mockTest.questions.map((q) => {
    const selected = answers[q.id] ?? null;
    return {
      question: q,
      selectedOptionId: selected,
      isCorrect: selected === q.correctOptionId,
    };
  });

  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const skippedCount = questionResults.filter(
    (r) => r.selectedOptionId === null
  ).length;
  const incorrectCount =
    questionResults.length - correctCount - skippedCount;

  return {
    mockTest,
    answers,
    questionResults,
    totalQuestions: mockTest.questions.length,
    correctCount,
    incorrectCount,
    skippedCount,
    accuracyPercent:
      mockTest.questions.length > 0
        ? Math.round((correctCount / mockTest.questions.length) * 100)
        : 0,
  };
}
