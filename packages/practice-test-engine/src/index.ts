/**
 * @math-platform/practice-test-engine
 *
 * Shared types and utilities for practice test engines.
 * Question banks and engine implementations remain app-local.
 */

export const PRACTICE_TEST_ENGINE_VERSION = 'practice-test-engine.v1' as const;

export interface PracticeTestQuestion {
  id: string;
  lessonId: string;
  lessonTitle: string;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
  objectiveTags: string[];
}

export interface ShuffledQuestion {
  correctIndex: number;
  choices: string[];
}

export interface PracticeTestAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface PracticeTestPerLessonBreakdown {
  lessonId: string;
  lessonTitle: string;
  correct: number;
  total: number;
}

export interface PracticeTestResult {
  moduleNumber: number;
  lessonsTested: string[];
  questionCount: number;
  score: number;
  percentage: number;
  perLessonBreakdown: PracticeTestPerLessonBreakdown[];
  completedAt: string;
}

export function filterQuestionsByLessonIds(
  questions: PracticeTestQuestion[],
  lessonIds: string[]
): PracticeTestQuestion[] {
  const lessonIdSet = new Set(lessonIds);
  return questions.filter((q) => lessonIdSet.has(q.lessonId));
}

export function drawRandomQuestions(
  questions: PracticeTestQuestion[],
  count: number
): PracticeTestQuestion[] {
  if (count <= 0) return [];
  if (questions.length === 0) return [];

  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function shuffleAnswers(question: PracticeTestQuestion): ShuffledQuestion {
  const choices = [question.correctAnswer, ...question.distractors];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const correctIndex = choices.indexOf(question.correctAnswer);
  return { correctIndex, choices };
}

export function isAnswerCorrect(shuffled: ShuffledQuestion, selectedAnswer: string): boolean {
  return selectedAnswer === shuffled.choices[shuffled.correctIndex];
}

export function calculateScore(
  answers: Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean }>
): number {
  return answers.filter((a) => a.isCorrect).length;
}

export function calculatePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}