/**
 * Daily Practice SRS Product Contract
 *
 * Version: srs.contract.v3
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
export const SRS_CONTRACT_VERSION_LEGACY = "srs.contract.v1" as const;
export const SRS_CONTRACT_VERSION = "srs.contract.v3" as const;

export {
  PLACEMENT_POLICY_VERSION,
  PLACEMENT_DECISION_PROBE_COUNT,
  PLACEMENT_TIE_BREAK_PROBE_COUNT,
  DEFAULT_PLACEMENT_PROBE_BUDGET,
  DEFAULT_PLACEMENT_STAGNATION_LIMIT,
  PLACEMENT_PROBE_OUTCOMES,
  PLACEMENT_DECISIONS,
  PLACEMENT_FRONTIER_STATUSES,
  PLACEMENT_STOPPING_REASONS,
  placementProbeOutcomeSchema,
  placementDecisionDirectionSchema,
  placementFrontierStatusSchema,
  placementStoppingReasonSchema,
  placementConfidenceCapSchema,
  placementProbeInstrumentSnapshotSchema,
  placementProbeEvidenceSchema,
  placementProbeDecisionSchema,
  placementFrontierNodeStateSchema,
  placementFrontierStateSchema,
  resolvePlacementStoppingReason,
  isPlacementProbeEvidenceV31,
  isPlacementProbeDecisionV31,
  isPlacementFrontierStateV31,
} from "./placement-contract";
export type {
  PlacementProbeOutcome,
  PlacementDecisionDirection,
  PlacementFrontierStatus,
  PlacementStoppingReason,
  PlacementConfidenceCap,
  PlacementProbeInstrumentSnapshot,
  PlacementProbeEvidenceV31,
  PlacementProbeDecisionV31,
  PlacementFrontierNodeState,
  PlacementFrontierStateV31,
} from "./placement-contract";

export {
  SCHEDULER_POLICY_VERSION,
  OBJECTIVE_PRIORITIES,
  DEFAULT_REQUEST_RETENTION_BY_PRIORITY,
  objectivePrioritySchema as schedulerObjectivePrioritySchema,
  requestRetentionByPrioritySchema,
  schedulerConfigSchema,
  normalizeSchedulerConfig,
  resolveRequestedRetention,
  isSchedulerConfigV31,
  paramsVersionSchema,
  paramsVersionStampSchema,
  createParamsVersionStamp,
  isParamsVersionStampV31,
  hasStampedParamsVersion,
} from "./scheduler-policy-contract";
export type {
  ObjectivePriorityV31,
  RequestRetentionByPriority,
  SchedulerConfigV31,
  ParamsVersionStampV31,
} from "./scheduler-policy-contract";

import type { ParamsVersionStampV31 } from "./scheduler-policy-contract";

// ============================================
// Objective Policy Types (SRS-specific)
// ============================================

/**
 * Priority level assigned to an objective's practice policy.
 */
export type ObjectivePriority = "essential" | "supporting" | "extension" | "triaged";

/**
 * Policy configuration governing how an objective is practiced and evaluated.
 */
export type ObjectivePracticePolicy = {
  objectiveId: string;
  priority: ObjectivePriority;
  minVariants?: number;
  minCoverageThreshold?: number;
  minRetentionThreshold?: number;
};

/**
 * Default priority settings for objectives.
 */
export const PRIORITY_DEFAULTS: Record<ObjectivePriority, ObjectivePracticePolicy> = {
  essential: { objectiveId: "", priority: "essential" },
  supporting: { objectiveId: "", priority: "supporting" },
  extension: { objectiveId: "", priority: "extension" },
  triaged: { objectiveId: "", priority: "triaged" },
};

// ============================================
// Types: SRS Rating (re-exported from practice-core)
// ============================================

import type { SrsRating } from "@math-platform/practice-core/srs-rating";
export type {
  SrsRating,
  SrsRatingInput,
  SrsRatingInputV31,
  SrsRatingResult,
} from "@math-platform/practice-core/srs-rating";
export {
  SRS_RATING_POLICY_VERSION,
  TIMING_BASELINE_POLICY_VERSION,
  timingZBaselineSchema,
  ratingCapDecisionSchema,
  timingRatingDecisionSchema,
  srsRatingResultV31Schema,
} from "@math-platform/practice-core/v3-1-contracts";
export type {
  TimingZBaseline,
  RatingCapDecision,
  TimingRatingDecision,
  SrsRatingResultV31,
} from "@math-platform/practice-core/v3-1-contracts";

// ============================================
// Types: Timing Baseline (re-exported from practice-core)
// ============================================

export type { PracticeTimingBaseline } from "@math-platform/practice-core/timing-baseline";
export type { TimingSpeedBand } from "@math-platform/practice-core/timing-baseline";
export type { PracticeTimingFeatures } from "@math-platform/practice-core/timing-baseline";

// ============================================
// Types: Practice Contract (re-exported from practice-core)
// ============================================

export type {
  PracticeSubmissionPart,
  PracticeTimingSummary,
  PracticeSubmissionEnvelope,
} from "@math-platform/practice-core/contract";

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
  variantKey: string;
  stability: number;
  difficulty: number;
  state: "new" | "learning" | "review" | "relearning";
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
// v3 Placement and Queue Contracts
// ============================================

export type PlacementConfidence = "low" | "medium" | "high";
export type PlacementEvidenceType = "direct" | "inferred";

export type PlacementEstimate = {
  nodeId: string;
  masteryEstimate: number;
  confidence: PlacementConfidence;
  evidenceType: PlacementEvidenceType;
  inferenceDepth: number;
};

export type PlacementCardProvenance = {
  source: "placement";
  evidenceType: PlacementEvidenceType;
  confidence: PlacementConfidence;
  inferenceDepth: number;
  placedAt: string;
};

export type PlacementSeededCard = SrsCardState & {
  placement: PlacementCardProvenance;
};

export type DailyQueueResult<TItem = unknown> = {
  items: TItem[];
  backlog: boolean;
  dueReviewCount: number;
  deferredReviewCount: number;
  newCardsSuppressed: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isPlacementEstimate(value: unknown): value is PlacementEstimate {
  if (!isRecord(value)) return false;
  const confidence = value.confidence;
  const evidenceType = value.evidenceType;
  const inferenceDepth = value.inferenceDepth;
  if (typeof value.nodeId !== "string" || value.nodeId.length === 0) return false;
  if (typeof value.masteryEstimate !== "number" || !Number.isFinite(value.masteryEstimate))
    return false;
  if (value.masteryEstimate < 0 || value.masteryEstimate > 1) return false;
  if (confidence !== "low" && confidence !== "medium" && confidence !== "high") return false;
  if (evidenceType !== "direct" && evidenceType !== "inferred") return false;
  if (!isNonNegativeInteger(inferenceDepth)) return false;
  if (evidenceType === "direct" && inferenceDepth !== 0) return false;
  if (evidenceType === "inferred" && inferenceDepth === 0) return false;
  return true;
}

export function isPlacementSeededCard(value: unknown): value is PlacementSeededCard {
  if (!isRecord(value) || !isRecord(value.placement)) return false;
  const placement = value.placement;
  if (placement.source !== "placement") return false;
  if (placement.evidenceType !== "direct" && placement.evidenceType !== "inferred") return false;
  if (
    placement.confidence !== "low" &&
    placement.confidence !== "medium" &&
    placement.confidence !== "high"
  )
    return false;
  if (!isNonNegativeInteger(placement.inferenceDepth)) return false;
  if (placement.evidenceType === "direct" && placement.inferenceDepth !== 0) return false;
  if (placement.evidenceType === "inferred" && placement.inferenceDepth === 0) return false;
  if (typeof placement.placedAt !== "string" || !Number.isFinite(Date.parse(placement.placedAt)))
    return false;

  const stringFields = [
    "cardId",
    "studentId",
    "objectiveId",
    "variantKey",
    "dueDate",
    "createdAt",
    "updatedAt",
  ] as const;
  if (stringFields.some((field) => typeof value[field] !== "string" || value[field].length === 0))
    return false;
  if (value.lastReview !== null && typeof value.lastReview !== "string") return false;
  if (value.state !== "review") return false;
  const numberFields = [
    "stability",
    "difficulty",
    "elapsedDays",
    "scheduledDays",
    "reps",
    "lapses",
  ] as const;
  if (
    numberFields.some((field) => typeof value[field] !== "number" || !Number.isFinite(value[field]))
  )
    return false;
  const stability = value.stability as number;
  const elapsedDays = value.elapsedDays as number;
  const scheduledDays = value.scheduledDays as number;
  const reps = value.reps as number;
  const lapses = value.lapses as number;
  if (stability < 0 || elapsedDays < 0 || scheduledDays < 0 || reps < 1 || lapses < 0) return false;
  return true;
}

export function isDailyQueueResult(value: unknown): value is DailyQueueResult {
  if (!isRecord(value) || !Array.isArray(value.items)) return false;
  if (typeof value.backlog !== "boolean" || typeof value.newCardsSuppressed !== "boolean")
    return false;
  if (
    !isNonNegativeInteger(value.dueReviewCount) ||
    !isNonNegativeInteger(value.deferredReviewCount)
  )
    return false;
  if (value.deferredReviewCount > value.dueReviewCount) return false;
  return true;
}

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
  evidence:
    | {
        action: "teacher_reset";
        objectiveId: string;
      }
    | {
        baseRating: SrsRating;
        timingAdjusted: boolean;
        reasons: string[];
        misconceptionTags?: string[];
      };
  stateBefore: Pick<SrsCardState, "stability" | "difficulty" | "state" | "reps" | "lapses">;
  stateAfter: Pick<SrsCardState, "stability" | "difficulty" | "state" | "reps" | "lapses">;
  /** Present on v3.1+ logs; legacy persisted entries may omit this field. */
  paramsVersion?: string;
  reviewedAt: string; // ISO timestamp
};

/** v3.1 review-log contract with mandatory scheduler-parameter attribution. */
export type SrsReviewLogEntryV31 = SrsReviewLogEntry & ParamsVersionStampV31;

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
    `You have ${count} item${count === 1 ? "" : "s"} to review today.`,
  allDone: "All done for today! Come back tomorrow for your next review.",
  buildingRecall: "You're building strong recall on this skill.",
} as const;

/**
 * Teacher-facing copy for daily practice dashboard surfaces.
 */
export const TEACHER_DAILY_PRACTICE_COPY = {
  sessionOverview: "Review session overview for your class.",
} as const;
