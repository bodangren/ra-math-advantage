/**
 * Daily Practice SRS Product Contract
 *
 * Version: srs.contract.v1
 *
 * This module consolidates all types needed for the spaced-repetition daily
 * practice pipeline. It re-exports from `@math-platform/practice-core` where
 * available and defines SRS-specific types.
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
 *   import { SrsCardState, SrsSessionConfig } from '@math-platform/srs-engine';
 */

// ============================================
// Version
// ============================================

/**
 * Canonical version identifier for the SRS contract.
 */
export const SRS_CONTRACT_VERSION = 'srs.contract.v1' as const;

// ============================================
// Objective Policy Types (from practice-core or local)
// ============================================

/**
 * Priority level assigned to an objective's practice policy.
 */
export type ObjectivePriority = 'essential' | 'supporting' | 'extension' | 'triaged';

/**
 * Policy configuration governing how an objective is practiced and evaluated.
 */
export type ObjectivePracticePolicy = {
  objectiveId: string;
  priority: ObjectivePriority;
  minProblemFamilies?: number;
  minCoverageThreshold?: number;
  minRetentionThreshold?: number;
};

/**
 * Default priority settings for objectives.
 */
export const PRIORITY_DEFAULTS: Record<ObjectivePriority, ObjectivePracticePolicy> = {
  essential: { objectiveId: '', priority: 'essential' },
  supporting: { objectiveId: '', priority: 'supporting' },
  extension: { objectiveId: '', priority: 'extension' },
  triaged: { objectiveId: '', priority: 'triaged' },
};

// ============================================
// Types: SRS Rating (duplicated from practice-core for package isolation)
// ============================================

/**
 * FSRS-compatible rating for a practice attempt.
 */
export type SrsRating = 'Again' | 'Hard' | 'Good' | 'Easy';

/**
 * Input payload for computing an SRS rating from practice evidence.
 */
export type SrsRatingInput = {
  parts: Array<{
    isCorrect?: boolean;
    hintsUsed?: number;
    revealStepsSeen?: number;
    misconceptionTags?: string[];
  }>;
  timingFeatures: {
    hasReliableTiming: boolean;
    confidence: 'low' | 'medium' | 'high';
    reasons: string[];
  };
  baselineSampleCount?: number;
};

/**
 * Result of computing a time-aware SRS rating.
 */
export type SrsRatingResult = {
  rating: SrsRating;
  baseRating: SrsRating;
  timingAdjusted: boolean;
  reasons: string[];
};

// ============================================
// Types: Timing Baseline
// ============================================

export type TimingSpeedBand = 'very_slow' | 'slow' | 'expected' | 'fast' | 'very_fast';

export type PracticeTimingBaseline = {
  problemFamilyId: string;
  sampleCount: number;
  medianActiveMs: number;
  p25ActiveMs?: number;
  p75ActiveMs?: number;
  p90ActiveMs?: number;
  lastComputedAt: string;
  minSamplesMet: boolean;
};

export type PracticeTimingFeatures = {
  hasReliableTiming: boolean;
  confidence: 'low' | 'medium' | 'high';
  reasons: string[];
};

// ============================================
// Types: Practice Contract
// ============================================

export type PracticeSubmissionPart = {
  partId: string;
  rawAnswer: unknown;
  normalizedAnswer?: string;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  misconceptionTags?: string[];
  hintsUsed?: number;
  revealStepsSeen?: number;
};

export type PracticeTimingSummary = {
  startedAt: string;
  submittedAt: string;
  wallClockMs: number;
  activeMs: number;
  idleMs: number;
  pauseCount: number;
  focusLossCount: number;
  visibilityHiddenCount: number;
  confidence: 'low' | 'medium' | 'high';
};

export type PracticeSubmissionEnvelope = {
  contractVersion: string;
  activityId: string;
  attemptNumber: number;
  submittedAt: string;
  parts: PracticeSubmissionPart[];
  timing?: PracticeTimingSummary;
};

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
 */
export type SrsReviewLogEntry = {
  reviewId: string;
  cardId: SrsCardId;
  studentId: string;
  rating: SrsRating;
  submissionId: string;
  evidence: {
    baseRating: SrsRating;
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
 */
export type SrsSessionConfig = {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  prioritizeOverdue: boolean;
};

/**
 * Represents an active or completed daily practice session.
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
 */
export const STUDENT_DAILY_PRACTICE_COPY = {
  queueSummary: (count: number): string =>
    `You have ${count} item${count === 1 ? '' : 's'} to review today.`,
  allDone: 'All done for today! Come back tomorrow for your next review.',
  buildingRecall: "You're building strong recall on this skill.",
} as const;

/**
 * Teacher-facing copy for daily practice dashboard surfaces.
 */
export const TEACHER_DAILY_PRACTICE_COPY = {
  sessionOverview: 'Review session overview for your class.',
} as const;