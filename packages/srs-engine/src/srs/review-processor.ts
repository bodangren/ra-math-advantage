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
  mapPracticeToSrsRatingV31,
  type SrsRatingInputV31,
  type SrsRatingResult,
} from '@math-platform/practice-core/srs-rating';
import type { SrsRatingResultV31 } from '@math-platform/practice-core/v3-1-contracts';
import { deriveTimingFeatures } from '@math-platform/practice-core/timing-baseline';
import { reviewCard } from './scheduler';
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
  /**
   * Explicit opt-in to the normative v3.1 mapper. Callers provide the enriched
   * reveal totals, per-part timing baselines, and misconception policy needed
   * by that version. When omitted, legacy rating behavior is unchanged.
   */
  ratingInputV31?: SrsRatingInputV31;
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
 */
export function processReview(input: ReviewProcessorInput): ReviewProcessorResult {
  const { card, submission, baseline, ratingInputV31, now } = input;

  const parts = submission.parts;
  let ratingResult: SrsRatingResult | SrsRatingResultV31;
  let evidenceReasons: string[];

  if (ratingInputV31 !== undefined) {
    ratingResult = mapPracticeToSrsRatingV31(ratingInputV31);
    evidenceReasons = ratingResult.reasons;
  } else {
    const timingFeatures = submission.timing
      ? deriveTimingFeatures(submission.timing, baseline)
      : {
          hasReliableTiming: false as const,
          confidence: 'low' as const,
          reasons: ['timing_missing'],
        };

    ratingResult = mapPracticeToSrsRating({
      parts: parts.map((part) => ({
        isCorrect: part.isCorrect,
        hintsUsed: part.hintsUsed,
        revealStepsSeen: part.revealStepsSeen,
        misconceptionTags: part.misconceptionTags,
      })),
      timingFeatures,
      baselineSampleCount: baseline?.sampleCount,
    });

    evidenceReasons = submission.timing
      ? ratingResult.reasons
      : ['timing_missing', ...ratingResult.reasons];
  }

  const updatedCard = reviewCard(card, ratingResult.rating, now);

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
 */
function generateReviewId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `rev_${hex}`;
}
