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

/**
 * Filter questions to only those matching the given lesson IDs.
 * @param {PracticeTestQuestion[]} questions - Full question bank
 * @param {string[]} lessonIds - Lesson IDs to include
 * @returns {PracticeTestQuestion[]} - Filtered question array
 */
export function filterQuestionsByLessonIds(
  questions: PracticeTestQuestion[],
  lessonIds: string[]
): PracticeTestQuestion[] {
  const lessonIdSet = new Set(lessonIds);
  return questions.filter((q) => lessonIdSet.has(q.lessonId));
}

/**
 * Draw a random subset of questions using Fisher-Yates shuffle.
 * @param {PracticeTestQuestion[]} questions - Source question array
 * @param {number} count - Number of questions to draw
 * @returns {PracticeTestQuestion[]} - Randomly selected questions (up to count or array length)
 */
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

/**
 * Shuffle a question's answer choices and locate the correct answer index.
 * @param {PracticeTestQuestion} question - The question to shuffle
 * @returns {ShuffledQuestion} - Shuffled choices array with correct answer index
 */
export function shuffleAnswers(question: PracticeTestQuestion): ShuffledQuestion {
  const choices = [question.correctAnswer, ...question.distractors];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const correctIndex = choices.indexOf(question.correctAnswer);
  return { correctIndex, choices };
}

/**
 * Check whether a selected answer matches the correct answer.
 * @param {ShuffledQuestion} shuffled - Shuffled question with correct index
 * @param {string} selectedAnswer - The answer string to check
 * @returns {boolean} - True if the selected answer is correct
 */
export function isAnswerCorrect(shuffled: ShuffledQuestion, selectedAnswer: string): boolean {
  return selectedAnswer === shuffled.choices[shuffled.correctIndex];
}

/**
 * Calculate the total score (correct count) from an array of answers.
 * @param {Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean }>} answers - Array of answer objects with isCorrect flag
 * @returns {number} - Number of correct answers
 */
export function calculateScore(
  answers: Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean }>
): number {
  return answers.filter((a) => a.isCorrect).length;
}

/**
 * Calculate a percentage score rounded to the nearest integer.
 * @param {number} score - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} - Percentage (0-100), or 0 if total is 0
 */
export function calculatePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}