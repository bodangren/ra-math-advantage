/**
 * SRS FSRS Scheduler Wrapper
 *
 * Wraps the `ts-fsrs` library with a clean interface for card scheduling.
 * Operates on `SrsCardState` from the SRS product contract.
 *
 * ## FSRS Algorithm Background
 *
 * FSRS (Free Spaced Repetition Scheduler) is a modern spaced repetition
 * algorithm that models memory stability and retrievability to optimize
 * review scheduling. The algorithm computes optimal intervals based on:
 * - Current stability (how well the card is remembered)
 * - Difficulty (intrinsic card complexity)
 * - Repetition history (reps, lapses)
 *
 * ## Default Parameters
 *
 * - `requestRetention`: 0.9 (90%) — desired probability of remembering
 * - `maximumInterval`: 365 days — cap at one school year
 *
 * These defaults are conservative for educational use where missed
 * reviews have higher consequences than in typical language learning.
 */

import {
  fsrs,
  generatorParameters,
  Rating,
  type Card,
  type Grade,
} from 'ts-fsrs';
import type { SrsCardId, SrsCardState, SrsRating } from './contract';

/**
 * Scheduler configuration parameters.
 *
 * These map directly to ts-fsrs generator parameters and control
 * the algorithm's behavior and output intervals.
 */
export type SchedulerConfig = {
  /**
   * Target retention probability (0 < r <= 1).
   * Default: 0.9 (90%)
   *
   * Higher values produce shorter intervals (more conservative).
   * Lower values produce longer intervals (more aggressive).
   *
   * Educational content typically uses 0.85-0.92.
   */
  requestRetention: number;

  /**
   * Maximum interval in days.
   * Default: 365 (one school year)
   *
   * Cards will never be scheduled beyond this many days.
   * Useful for curriculum alignment where all cards should
   * be reviewed within a defined window.
   */
  maximumInterval: number;

  /**
   * Enable short-term preview mode.
   * Default: false
   *
   * When true, produces previews using shorter intervals suitable
   * for same-day or next-day preview scheduling.
   */
  enableShortTermPreview: boolean;
};

/**
 * Default scheduler configuration optimized for educational content.
 */
export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  requestRetention: 0.9,
  maximumInterval: 365,
  enableShortTermPreview: false,
};

/**
 * Map our SrsRating enum to ts-fsrs Grade enum.
 *
 * FSRS Grades:
 * - Again (1): Complete blackout, wrong response
 * - Hard (2): Correct but with significant difficulty
 * - Good (3): Correct with moderate effort
 * - Easy (4): Correct with no hesitation
 *
 * @example
 * ```ts
 * const grade = mapSrsRatingToGrade('Good'); // Rating.Good (3)
 * ```
 */
export function mapSrsRatingToGrade(rating: SrsRating): Grade {
  switch (rating) {
    case 'Again':
      return Rating.Again;
    case 'Hard':
      return Rating.Hard;
    case 'Good':
      return Rating.Good;
    case 'Easy':
      return Rating.Easy;
  }
}

/**
 * Map ts-fsrs Grade enum back to our SrsRating.
 *
 * @example
 * ```ts
 * const rating = mapGradeToSrsRating(Rating.Good); // 'Good'
 * ```
 */
export function mapGradeToSrsRating(grade: Grade): SrsRating {
  switch (grade) {
    case Rating.Again:
      return 'Again';
    case Rating.Hard:
      return 'Hard';
    case Rating.Good:
      return 'Good';
    case Rating.Easy:
      return 'Easy';
    default:
      return 'Again';
  }
}

/**
 * Convert ts-fsrs internal Card to our SrsCardState.
 * This is an internal helper for the scheduler wrapper.
 */
function mapFsrsCardToSrsCardState(
  fsrsCard: Card,
  metadata: {
    cardId: SrsCardId;
    studentId: string;
    objectiveId: string;
    problemFamilyId: string;
  },
  now: string,
): SrsCardState {
  return {
    cardId: metadata.cardId,
    studentId: metadata.studentId,
    objectiveId: metadata.objectiveId,
    problemFamilyId: metadata.problemFamilyId,
    stability: fsrsCard.stability,
    difficulty: fsrsCard.difficulty,
    state: mapCardState(fsrsCard.state),
    dueDate: fsrsCard.due.toISOString(),
    elapsedDays: fsrsCard.elapsed_days,
    scheduledDays: fsrsCard.scheduled_days,
    reps: fsrsCard.reps,
    lapses: fsrsCard.lapses,
    lastReview: fsrsCard.last_review?.toISOString() ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Map ts-fsrs state number to our card state string.
 */
function mapCardState(state: number): SrsCardState['state'] {
  switch (state) {
    case 0:
      return 'new';
    case 1:
      return 'learning';
    case 2:
      return 'review';
    case 3:
      return 'relearning';
    default:
      return 'new';
  }
}

/**
 * Create a new SRS card initialized with FSRS defaults.
 *
 * New cards start in 'new' state with zero stability and difficulty,
 * ready to receive their first review.
 *
 * @example
 * ```ts
 * const card = createCard({
 *   studentId: 'stu_001',
 *   objectiveId: 'obj_quadratic_roots',
 *   problemFamilyId: 'pf_qr_01',
 *   now: new Date().toISOString(),
 * });
 * // card.state === 'new'
 * // card.reps === 0
 * ```
 */
export function createCard(params: {
  studentId: string;
  objectiveId: string;
  problemFamilyId: string;
  now?: string;
  config?: Partial<SchedulerConfig>;
}): SrsCardState {
  const now = params.now ?? new Date().toISOString();
  const cardId = generateCardId();

  return {
    cardId,
    studentId: params.studentId,
    objectiveId: params.objectiveId,
    problemFamilyId: params.problemFamilyId,
    stability: 0,
    difficulty: 0,
    state: 'new',
    dueDate: now,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Convert our internal card state to ts-fsrs Card format.
 */
function toFsrsCard(card: SrsCardState): Card {
  return {
    due: new Date(card.dueDate),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    learning_steps: 0,
    reps: card.reps,
    lapses: card.lapses,
    state: mapSrsStateToNumber(card.state),
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
  };
}

/**
 * Apply a review rating to a card and return the updated state.
 *
 * Uses ts-fsrs to compute optimal next interval based on:
 * - Current card stability and difficulty
 * - Review rating (Again/Hard/Good/Easy)
 * - Configured retention target and maximum interval
 *
 * After a review:
 * - 'Again' moves card to relearning state, reduces stability, increments lapses
 * - 'Good' and 'Easy' advance card through learning/review states
 * - All ratings increment the reps counter
 *
 * @example
 * ```ts
 * const updated = reviewCard(card, 'Good', new Date().toISOString());
 * // updated.reps === card.reps + 1
 * // updated.dueDate is recomputed by FSRS
 * ```
 */
export function reviewCard(
  card: SrsCardState,
  rating: SrsRating,
  now?: string,
  config?: Partial<SchedulerConfig>,
): SrsCardState {
  const currentTime = now ?? new Date().toISOString();
  const fullConfig = { ...DEFAULT_SCHEDULER_CONFIG, ...config };

  const params = generatorParameters({
    request_retention: fullConfig.requestRetention,
    maximum_interval: fullConfig.maximumInterval,
    enable_short_term: fullConfig.enableShortTermPreview,
  });

  const scheduler = fsrs(params);
  const fsrsCard = toFsrsCard(card);
  const grade = mapSrsRatingToGrade(rating);
  const result = scheduler.next(fsrsCard, currentTime, grade);

  return mapFsrsCardToSrsCardState(
    result.card,
    {
      cardId: card.cardId,
      studentId: card.studentId,
      objectiveId: card.objectiveId,
      problemFamilyId: card.problemFamilyId,
    },
    currentTime,
  );
}

/**
 * Filter cards to return only those with dueDate <= now.
 *
 * Used to determine which cards are due for review in a session.
 * Comparison is done on ISO timestamp strings for serialization safety.
 *
 * @example
 * ```ts
 * const due = getDueCards(allCards, new Date().toISOString());
 * // due contains only cards whose dueDate has passed
 * ```
 */
export function getDueCards(cards: SrsCardState[], now?: string): SrsCardState[] {
  const currentTime = now ?? new Date().toISOString();
  const nowMs = new Date(currentTime).getTime();

  return cards.filter((card) => {
    const dueMs = new Date(card.dueDate).getTime();
    return dueMs <= nowMs;
  });
}

/**
 * Preview the scheduled interval for a card without mutating its state.
 *
 * Useful for showing students/teachers what the next review would look like
 * before actually submitting a review.
 *
 * Returns the interval in days that would be scheduled.
 *
 * @example
 * ```ts
 * const intervalDays = previewInterval(card, 'Easy');
 * // intervalDays is the number of days until the next review if rated Easy
 * ```
 */
export function previewInterval(
  card: SrsCardState,
  rating: SrsRating,
  now?: string,
): number {
  const currentTime = now ?? new Date().toISOString();
  const params = generatorParameters({
    request_retention: DEFAULT_SCHEDULER_CONFIG.requestRetention,
    maximum_interval: DEFAULT_SCHEDULER_CONFIG.maximumInterval,
    enable_short_term: DEFAULT_SCHEDULER_CONFIG.enableShortTermPreview,
  });

  const scheduler = fsrs(params);
  const fsrsCard = toFsrsCard(card);
  const grade = mapSrsRatingToGrade(rating);
  const result = scheduler.next(fsrsCard, currentTime, grade);

  return result.card.scheduled_days;
}

/**
 * Map our state string to ts-fsrs state number.
 */
function mapSrsStateToNumber(state: SrsCardState['state']): number {
  switch (state) {
    case 'new':
      return 0;
    case 'learning':
      return 1;
    case 'review':
      return 2;
    case 'relearning':
      return 3;
  }
}

/**
 * Generate a unique card ID using crypto-safe random bytes.
 * Returns a string prefixed with 'card_' for clarity.
 */
function generateCardId(): SrsCardId {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `card_${hex}`;
}
