/**
 * Practice Test Question Bank Helpers
 *
 * Provides utility functions for filtering, sampling, and shuffling
 * practice test questions.
 */

import type {
  PracticeTestQuestion,
  PracticeTestModuleConfig,
} from './types';

/**
 * Filter questions by lesson IDs.
 *
 * @example
 * ```ts
 * const filtered = filterQuestionsByLessonIds(questions, ['lesson-1-1', 'lesson-1-2']);
 * ```
 */
export function filterQuestionsByLessonIds(
  questions: PracticeTestQuestion[],
  lessonIds: string[]
): PracticeTestQuestion[] {
  const lessonIdSet = new Set(lessonIds);
  return questions.filter((q) => lessonIdSet.has(q.lessonId));
}

/**
 * Draw random questions using Fisher-Yates shuffle.
 *
 * Returns up to `count` questions, or all available if count exceeds
 * the number of available questions.
 *
 * @example
 * ```ts
 * const selected = drawRandomQuestions(questions, 5);
 * // Returns 5 randomly selected questions
 * ```
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
 * Shuffle answers for a question (distractors + correct answer).
 *
 * Returns an array with the correct answer position and the shuffled
 * answer choices.
 *
 * @example
 * ```ts
 * const { correctIndex, choices } = shuffleAnswers(question);
 * // choices might be ['(x+2)(x+3)', '(x+1)(x+6)', '(x-2)(x-3)']
 * // correctIndex would be 0 if the first element is the correct answer
 * ```
 */
export function shuffleAnswers(question: PracticeTestQuestion): {
  correctIndex: number;
  choices: string[];
} {
  const choices = [question.correctAnswer, ...question.distractors];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const correctIndex = choices.indexOf(question.correctAnswer);
  return { correctIndex, choices };
}

const MODULE_CONFIGS = new Map<number, PracticeTestModuleConfig>();

/**
 * Register a module configuration.
 *
 * @internal
 */
export function registerModuleConfig(config: PracticeTestModuleConfig): void {
  MODULE_CONFIGS.set(config.moduleNumber, config);
}

/**
 * Get module configuration by module number.
 *
 * @example
 * ```ts
 * const config = getModuleConfig(1);
 * if (!config) {
 *   console.error('Module 1 not configured');
 * }
 * ```
 */
export function getModuleConfig(moduleNumber: number): PracticeTestModuleConfig | undefined {
  return MODULE_CONFIGS.get(moduleNumber);
}

/**
 * Get all registered module numbers.
 *
 * @example
 * ```ts
 * const modules = getRegisteredModules();
 * // Returns [1, 2, 3, ..., 9]
 * ```
 */
export function getRegisteredModules(): number[] {
  return Array.from(MODULE_CONFIGS.keys()).sort((a, b) => a - b);
}