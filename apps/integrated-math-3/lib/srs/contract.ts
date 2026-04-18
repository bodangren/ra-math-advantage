/**
 * Daily Practice SRS Product Contract
 *
 * Version: srs.contract.v1
 *
 * This module consolidates all types needed for the spaced-repetition daily
 * practice pipeline. It re-exports existing types from `lib/practice/*` and
 * defines new types for SRS card state, review logs, and sessions.
 *
 * ## Triage Handling Rules
 *
 * Objectives with `priority === 'triaged'` are explicitly excluded from daily
 * practice queues and proficiency calculations unless a teacher overrides.
 * - They do not generate SRS cards.
 * - They do not appear in student proficiency dashboards as incomplete.
 * - They can be reactivated by changing the priority field.
 *
 * Downstream tracks (schema, queue engine, card creation) must skip triaged
 * objectives at their respective boundaries.
 *
 * ## Import Guidelines
 *
 * All SRS-related code should import from this module only:
 *   import { SrsCardState, SrsSessionConfig } from '@/lib/srs/contract';
 *
 * Do not import directly from `lib/practice/srs-rating.ts`,
 * `lib/practice/objective-proficiency.ts`, etc. in SRS-specific code.
 */

// ============================================
// Version
// ============================================

/**
 * Canonical version identifier for the SRS contract.
 *
 * Downstream code can assert compatibility by checking this value.
 */
export const SRS_CONTRACT_VERSION = 'srs.contract.v1' as const;

// ============================================
// Re-exports: SRS Rating
// ============================================

export type {
  /** FSRS-compatible rating derived from practice correctness and timing. */
  SrsRating,
  /** Input payload for computing an SRS rating. */
  SrsRatingInput,
  /** Result of computing an SRS rating, including base and adjusted ratings. */
  SrsRatingResult,
} from '@/lib/practice/srs-rating';

// ============================================
// Re-exports: Objective Proficiency
// ============================================

export type {
  /** Priority level assigned to an objective's practice policy. */
  ObjectivePriority,
  /** Policy configuration governing how an objective is practiced and evaluated. */
  ObjectivePracticePolicy,
  /** Confidence level for proficiency evidence or timing features. */
  EvidenceConfidence,
  /** Full proficiency assessment result for a single objective. */
  ObjectiveProficiencyResult,
  /** Student-facing view of objective proficiency. */
  StudentProficiencyView,
  /** Teacher-facing view of objective proficiency with class-level context. */
  TeacherProficiencyView,
} from '@/lib/practice/objective-proficiency';

export { PRIORITY_DEFAULTS } from '@/lib/practice/objective-proficiency';

// ============================================
// Re-exports: Timing Baseline
// ============================================

export type {
  /** Baseline timing statistics for a problem family. */
  PracticeTimingBaseline,
  /** Derived timing features for a single review attempt. */
  PracticeTimingFeatures,
  /** Speed classification relative to a baseline. */
  TimingSpeedBand,
} from '@/lib/practice/timing-baseline';

// ============================================
// Re-exports: Practice Contract
// ============================================

export type {
  /** Canonical envelope for a practice.v1 submission. */
  PracticeSubmissionEnvelope,
  /** Individual part/answer within a practice submission. */
  PracticeSubmissionPart,
  /** Aggregated timing summary for a practice session or attempt. */
  PracticeTimingSummary,
} from '@/lib/practice/contract';

// ============================================
// New Types: Card State
// ============================================

/** Unique identifier for an SRS card. */
export type SrsCardId = string;

/**
 * Full state of an SRS card for spaced-repetition scheduling.
 *
 * This shape is intentionally aligned with ts-fsRS so that the scheduler
 * can map to/from its internal `Card` type without data loss.
 *
 * @example
 * ```ts
 * const card: SrsCardState = {
 *   cardId: 'card_abc123',
 *   studentId: 'stu_001',
 *   objectiveId: 'obj_quadratic_roots',
 *   problemFamilyId: 'pf_qr_01',
 *   stability: 3.5,
 *   difficulty: 5.2,
 *   state: 'review',
 *   dueDate: '2026-04-18T00:00:00.000Z',
 *   elapsedDays: 1,
 *   scheduledDays: 2,
 *   reps: 4,
 *   lapses: 1,
 *   lastReview: '2026-04-16T00:00:00.000Z',
 *   createdAt: '2026-04-10T00:00:00.000Z',
 *   updatedAt: '2026-04-16T00:00:00.000Z',
 * };
 * ```
 */
export type SrsCardState = {
  cardId: SrsCardId;
  studentId: string;
  objectiveId: string;
  problemFamilyId: string;
  stability: number;
  difficulty: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  dueDate: string; // ISO timestamp
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

// ============================================
// New Types: Review Log
// ============================================

/**
 * Immutable audit entry for a single SRS card review.
 *
 * Captures the rating, evidence, and before/after card state so that
 * proficiency and diagnostic queries can reconstruct history.
 *
 * @example
 * ```ts
 * const entry: SrsReviewLogEntry = {
 *   reviewId: 'rev_xyz789',
 *   cardId: 'card_abc123',
 *   studentId: 'stu_001',
 *   rating: 'Good',
 *   submissionId: 'act_123-1',
 *   evidence: {
 *     baseRating: 'Good',
 *     timingAdjusted: false,
 *     reasons: [],
 *   },
 *   stateBefore: { stability: 3.5, difficulty: 5.2, state: 'review', reps: 4, lapses: 1 },
 *   stateAfter: { stability: 4.1, difficulty: 5.1, state: 'review', reps: 5, lapses: 1 },
 *   reviewedAt: '2026-04-16T00:00:00.000Z',
 * };
 * ```
 */
export type SrsReviewLogEntry = {
  reviewId: string;
  cardId: SrsCardId;
  studentId: string;
  rating: import('@/lib/practice/srs-rating').SrsRating;
  submissionId: string;
  evidence: {
    baseRating: import('@/lib/practice/srs-rating').SrsRating;
    timingAdjusted: boolean;
    reasons: string[];
  };
  stateBefore: Pick<
    SrsCardState,
    'stability' | 'difficulty' | 'state' | 'reps' | 'lapses'
  >;
  stateAfter: Pick<
    SrsCardState,
    'stability' | 'difficulty' | 'state' | 'reps' | 'lapses'
  >;
  reviewedAt: string; // ISO timestamp
};

// ============================================
// New Types: Session
// ============================================

/**
 * Configuration that governs a single daily practice session.
 *
 * @example
 * ```ts
 * const config: SrsSessionConfig = {
 *   newCardsPerDay: 5,
 *   maxReviewsPerDay: 20,
 *   prioritizeOverdue: true,
 * };
 * ```
 */
export type SrsSessionConfig = {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  prioritizeOverdue: boolean;
};

/**
 * Represents an active or completed daily practice session.
 *
 * @example
 * ```ts
 * const session: SrsSession = {
 *   sessionId: 'sess_001',
 *   studentId: 'stu_001',
 *   startedAt: '2026-04-17T08:00:00.000Z',
 *   completedAt: null,
 *   plannedCards: 12,
 *   completedCards: 0,
 *   config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
 * };
 * ```
 */
export type SrsSession = {
  sessionId: string;
  studentId: string;
  startedAt: string; // ISO timestamp
  completedAt: string | null;
  plannedCards: number;
  completedCards: number;
  config: SrsSessionConfig;
};

// ============================================
// Instructional Language Constants
// ============================================

/**
 * Student-facing copy for daily practice surfaces.
 * All copy is written to be encouraging and non-punitive.
 * No speed rankings, no comparative language, no raw FSRS numbers.
 */
export const STUDENT_DAILY_PRACTICE_COPY = {
  queueSummary: (count: number): string =>
    `You have ${count} item${count === 1 ? '' : 's'} to review today.`,
  allDone: 'All done for today! Come back tomorrow for your next review.',
  buildingRecall: "You're building strong recall on this skill.",
} as const;

/**
 * Teacher-facing copy for daily practice dashboard surfaces.
 * Uses diagnostic language only.
 */
export const TEACHER_DAILY_PRACTICE_COPY = {
  sessionOverview: 'Review session overview for your class.',
} as const;
