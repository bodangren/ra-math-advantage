/**
 * Shared efficacy-core test fixtures.
 *
 * Reuses canonical SRS + practice-core fixture builders so contract drift
 * surfaces here first. All timestamps use deterministic `Date.UTC(...)`
 * constants — never `Date.now()`.
 *
 * Reference: measure/tracks/learning-efficacy-analytics_20260605/test-strategy.md §3.
 */

import {
  createMockSrsCard,
  createMockSrsReviewLog,
  type SrsCardState,
  type SrsReviewLogEntry,
  type SrsRating,
} from '@math-platform/srs-engine';
import {
  createMockPracticeEnvelope,
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core';

// ============================================
// Deterministic time anchors
// ============================================

/** Cohort window start: 2026-04-01 00:00:00 UTC. */
export const COHORT_WINDOW_START_MS = Date.UTC(2026, 3, 1, 0, 0, 0);
/** Cohort window end:   2026-05-01 00:00:00 UTC. */
export const COHORT_WINDOW_END_MS = Date.UTC(2026, 4, 1, 0, 0, 0);
/** 24 hours in ms. */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Convert a millisecond timestamp to ISO-8601 string. Pure, deterministic.
 */
export function isoAt(ms: number): string {
  return new Date(ms).toISOString();
}

// ============================================
// SRS card builders (re-exported with deterministic defaults)
// ============================================

export type MakeCardOverrides = Partial<SrsCardState>;

/**
 * Build a deterministic SRS card fixture for efficacy tests.
 * Defaults to a card created at COHORT_WINDOW_START_MS in 'review' state
 * with mid-range stability.
 */
export function makeCard(overrides: MakeCardOverrides = {}): SrsCardState {
  const createdAt = isoAt(COHORT_WINDOW_START_MS);
  return createMockSrsCard({
    cardId: 'card_fix_001',
    studentId: 'stu_fix_001',
    objectiveId: 'obj_fix_quadratic',
    problemFamilyId: 'pf_fix_001',
    stability: 30,
    difficulty: 3,
    state: 'review',
    reps: 3,
    lapses: 0,
    createdAt,
    updatedAt: createdAt,
    lastReview: createdAt,
    dueDate: isoAt(COHORT_WINDOW_START_MS + 30 * MS_PER_DAY),
    ...overrides,
  });
}

// ============================================
// SRS review-log builders
// ============================================

export type MakeReviewLogOverrides = Partial<SrsReviewLogEntry> & {
  reviewedAtMs?: number;
};

/**
 * Build a deterministic SRS review-log entry. `reviewedAtMs` (optional)
 * pins the reviewedAt timestamp by epoch ms; defaults to COHORT_WINDOW_START_MS.
 */
export function makeReviewLog(
  overrides: MakeReviewLogOverrides = {},
): SrsReviewLogEntry {
  const { reviewedAtMs, ...rest } = overrides;
  const reviewedAt = isoAt(reviewedAtMs ?? COHORT_WINDOW_START_MS);
  return createMockSrsReviewLog({
    reviewId: 'rev_fix_001',
    cardId: 'card_fix_001',
    studentId: 'stu_fix_001',
    rating: 'Good',
    submissionId: 'sub_fix_001',
    reviewedAt,
    stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
    stateAfter: { stability: 1, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
    ...rest,
  });
}

/**
 * Pin a sequence of review-log entries for a single card across a time series.
 * Each entry advances reps by 1 and uses ratingSequence[i] at offsetsDays[i].
 */
export function makeReviewSequence(args: {
  cardId: string;
  studentId: string;
  baseMs?: number;
  ratings: readonly SrsRating[];
  offsetsDays: readonly number[];
}): SrsReviewLogEntry[] {
  const { cardId, studentId, baseMs = COHORT_WINDOW_START_MS, ratings, offsetsDays } = args;
  if (ratings.length !== offsetsDays.length) {
    throw new Error('makeReviewSequence: ratings and offsetsDays must match length');
  }
  return ratings.map((rating, i) =>
    makeReviewLog({
      reviewId: `rev_${cardId}_${i + 1}`,
      cardId,
      studentId,
      rating,
      submissionId: `sub_${cardId}_${i + 1}`,
      reviewedAtMs: baseMs + offsetsDays[i] * MS_PER_DAY,
      stateBefore: { stability: i, difficulty: 0, state: i === 0 ? 'new' : 'review', reps: i, lapses: 0 },
      stateAfter: { stability: i + 1, difficulty: 0, state: 'review', reps: i + 1, lapses: 0 },
    }),
  );
}

// ============================================
// Practice-submission builders (schema-validated at build time)
// ============================================

export type MakeSubmissionOverrides = {
  studentId?: string;
  activityId?: string;
  attemptNumber?: number;
  isCorrect?: boolean;
  submittedAtMs?: number;
};

/**
 * Build a deterministic practice.v1 submission envelope for efficacy tests.
 *
 * The envelope is re-parsed through `practiceSubmissionEnvelopeSchema` so any
 * drift from the canonical contract throws at fixture-build time, not at
 * assertion time. Note: studentId is *not* a field on the envelope itself —
 * it's threaded through downstream evidence; we keep it in the result for
 * convenience.
 */
export function makeSubmission(
  overrides: MakeSubmissionOverrides = {},
): { studentId: string; envelope: PracticeSubmissionEnvelope } {
  const {
    studentId = 'stu_fix_001',
    activityId = 'act_fix_001',
    attemptNumber = 1,
    isCorrect = true,
    submittedAtMs = COHORT_WINDOW_START_MS,
  } = overrides;

  const envelope = createMockPracticeEnvelope({
    activityId,
    attemptNumber,
    status: 'submitted',
    submittedAt: isoAt(submittedAtMs),
    parts: [
      {
        partId: 'q1',
        rawAnswer: isCorrect ? 'correct' : 'incorrect',
        isCorrect,
      },
    ],
  });

  // Belt + suspenders: re-validate at fixture-build time.
  practiceSubmissionEnvelopeSchema.parse(envelope);
  return { studentId, envelope };
}
