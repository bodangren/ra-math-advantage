/**
 * SRS Review Processor
 *
 * Bridges practice submission evidence with FSRS card state updates.
 *
 * Processing pipeline:
 * 1. Extract submission parts
 * 2. Derive timing features (if timing and baseline are available)
 * 3. Compute SRS rating from correctness and timing
 * 4. Apply rating to card state via FSRS scheduler
 * 5. Build immutable review log entry with before/after state
 */

import {
  mapPracticeToSrsRating,
  type SrsRatingResult,
} from '@/lib/practice/srs-rating';
import { deriveTimingFeatures } from '@/lib/practice/timing-baseline';
import { reviewCard } from '@/lib/srs/scheduler';
import type {
  PracticeSubmissionEnvelope,
  PracticeTimingBaseline,
  SrsCardState,
  SrsReviewLogEntry,
} from './contract';

/**
 * Input payload for `processReview`.
 */
export type ReviewProcessorInput = {
  /** The SRS card being reviewed. */
  card: SrsCardState;
  /** The practice submission that produced the review. */
  submission: PracticeSubmissionEnvelope;
  /** Optional timing baseline for the problem family; omit if unavailable. */
  baseline?: PracticeTimingBaseline;
  /** Review timestamp as an ISO string. */
  now: string;
};

/**
 * Output of `processReview` containing the updated card and audit log.
 */
export type ReviewProcessorResult = {
  /** Final FSRS rating applied to the card. */
  rating: SrsRatingResult['rating'];
  /** Card state after the FSRS review has been applied. */
  updatedCard: SrsCardState;
  /** Immutable audit entry capturing before/after state and evidence. */
  reviewLog: SrsReviewLogEntry;
};

/**
 * Process a practice submission review, updating the SRS card state
 * and producing an immutable review log entry.
 *
 * @example
 * ```ts
 * const result = processReview({
 *   card,
 *   submission,
 *   baseline,
 *   now: new Date().toISOString(),
 * });
 * // result.rating      // 'Good' | 'Easy' | 'Hard' | 'Again'
 * // result.updatedCard // mutated card with new due date and stats
 * // result.reviewLog   // audit entry with before/after state
 * ```
 */
export function processReview(input: ReviewProcessorInput): ReviewProcessorResult {
  const { card, submission, baseline, now } = input;

  // 1. Extract parts from submission
  const parts = submission.parts;

  // 2. Derive timing features if timing data is present
  const timingFeatures = submission.timing
    ? deriveTimingFeatures(submission.timing, baseline)
    : {
        hasReliableTiming: false as const,
        confidence: 'low' as const,
        reasons: ['timing_missing'],
      };

  // 3. Compute SRS rating from correctness evidence and timing
  const ratingResult = mapPracticeToSrsRating({
    parts: parts.map((part) => ({
      isCorrect: part.isCorrect,
      hintsUsed: part.hintsUsed,
      revealStepsSeen: part.revealStepsSeen,
      misconceptionTags: part.misconceptionTags,
    })),
    timingFeatures,
    baselineSampleCount: baseline?.sampleCount,
  });

  // Preserve timing_missing reason when submission has no timing data
  const evidenceReasons = submission.timing
    ? ratingResult.reasons
    : ['timing_missing', ...ratingResult.reasons];

  // 4. Apply rating to card state using FSRS scheduler
  const updatedCard = reviewCard(card, ratingResult.rating, now);

  // 5. Build immutable review log entry
  const reviewLog: SrsReviewLogEntry = {
    reviewId: generateReviewId(),
    cardId: card.cardId,
    studentId: card.studentId,
    rating: ratingResult.rating,
    submissionId: `${submission.activityId}-${submission.attemptNumber}`,
    evidence: {
      baseRating: ratingResult.baseRating,
      timingAdjusted: ratingResult.timingAdjusted,
      reasons: evidenceReasons,
    },
    stateBefore: {
      stability: card.stability,
      difficulty: card.difficulty,
      state: card.state,
      reps: card.reps,
      lapses: card.lapses,
    },
    stateAfter: {
      stability: updatedCard.stability,
      difficulty: updatedCard.difficulty,
      state: updatedCard.state,
      reps: updatedCard.reps,
      lapses: updatedCard.lapses,
    },
    reviewedAt: now,
  };

  return {
    rating: ratingResult.rating,
    updatedCard,
    reviewLog,
  };
}

/**
 * Generate a unique review ID using crypto-safe random bytes.
 * Returns a string prefixed with 'rev_' for clarity.
 */
function generateReviewId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `rev_${hex}`;
}
