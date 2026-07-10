export {
  SRS_CONTRACT_VERSION,
  SRS_CONTRACT_VERSION_LEGACY,
  PRIORITY_DEFAULTS,
  STUDENT_DAILY_PRACTICE_COPY,
  TEACHER_DAILY_PRACTICE_COPY,
  isPlacementEstimate,
  isPlacementSeededCard,
  isDailyQueueResult,
  SRS_RATING_POLICY_VERSION,
  TIMING_BASELINE_POLICY_VERSION,
  timingZBaselineSchema,
  ratingCapDecisionSchema,
  timingRatingDecisionSchema,
  srsRatingResultV31Schema,
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
} from './srs/contract';

export type {
  ObjectivePriority,
  ObjectivePracticePolicy,
  SrsCardId,
  SrsCardState,
  SrsReviewLogEntry,
  SrsReviewLogEntryV31,
  SrsSessionConfig,
  SrsSession,
  PlacementConfidence,
  PlacementEvidenceType,
  PlacementEstimate,
  PlacementCardProvenance,
  PlacementSeededCard,
  DailyQueueResult,
  PracticeSubmissionEnvelope,
  PracticeSubmissionPart,
  PracticeTimingSummary,
  PracticeTimingBaseline,
  PracticeTimingFeatures,
  TimingSpeedBand,
  SrsRatingInput,
  SrsRatingInputV31,
  SrsRatingResult,
  TimingZBaseline,
  RatingCapDecision,
  TimingRatingDecision,
  SrsRatingResultV31,
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
} from './srs/contract';

export type { SrsRating } from './srs/contract';

export {
  PROFICIENCY_EVIDENCE_POLICY_VERSION,
  EVIDENCE_DIAGNOSTIC_REASONS,
  guessFloorRefSchema,
  practiceAttemptEvidenceSchema,
  practiceVariantEvidenceInputSchema,
  practiceVariantEvidenceResultSchema,
} from './srs/proficiency-evidence-contract';

export {
  PROFICIENCY_EVIDENCE_HALF_LIFE,
  ONE_SIDED_WILSON_Z,
  computeRecencyWeightedCorrectness,
  oneSidedWilsonLowerBound,
  rescaleAgainstGuessFloor,
  computePracticeVariantEvidence,
} from './srs/proficiency-evidence';
export type {
  EvidenceTimingContext,
  RecencyWeightedCorrectness,
  PracticeVariantEvidenceInput,
} from './srs/proficiency-evidence';
export type {
  GuessFloorRef,
  PracticeAttemptEvidence,
  PracticeVariantEvidenceInputV31,
  PracticeVariantEvidenceResultV31,
  EvidenceDiagnosticReason,
} from './srs/proficiency-evidence-contract';

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
} from './srs/scheduler-policy-contract';
export type {
  ObjectivePriorityV31,
  RequestRetentionByPriority,
  SchedulerConfigV31,
  ParamsVersionStampV31,
} from './srs/scheduler-policy-contract';

export * from './srs/fsrs-fitting-contract';
export * from './srs/evaluation-contract';

export {
  DEFAULT_SCHEDULER_CONFIG,
  mapSrsRatingToGrade,
  mapGradeToSrsRating,
  createCard,
  reviewCard,
  getDueCards,
  previewInterval,
} from './srs/scheduler';

export type { SchedulerConfig } from './srs/scheduler';

export {
  processReview,
} from './srs/review-processor';

export type { ReviewProcessorInput } from './srs/review-processor';
export type { ReviewProcessorResult } from './srs/review-processor';

export {
  isOverdue,
  daysOverdue,
  buildDailyQueue,
  buildDailyQueueResult,
} from './srs/queue';

export type { QueueItem } from './srs/queue';

export {
  PLACEMENT_STABILITY_HORIZONS,
  expandPlacementEvidence,
  synthesizePlacementCards,
} from './srs/placement';
export type {
  PlacementGraphEdge,
  PlacementGraphAdapter,
  PlacementSeedConfig,
} from './srs/placement';

export type { CardStore, ReviewLogStore } from './srs/adapters';
export { InMemoryCardStore, InMemoryReviewLogStore } from './srs/adapters';

export {
  createMockSrsCard,
  createMockSrsReviewLog,
} from './srs/fixtures';

export {
  validateSrsTransition,
} from './srs/transition-validator';

export {
  SubmissionSrsAdapter,
  InMemoryPracticeVariantResolver,
  InMemoryTimingBaselineResolver,
  InMemorySubmissionSrsAdapter,
} from './srs/submission-srs-adapter';

export type {
  SubmissionSrsInput,
  SubmissionSrsResult,
  SubmissionSrsResultSuccess,
  SubmissionSrsResultSkipped,
  SubmissionSrsResultError,
  PracticeVariantInfo,
  PracticeVariantResolver,
  TimingBaselineResolver,
} from './srs/submission-srs-adapter';

// Objective Policy
export type {
  ObjectivePolicy,
  ObjectivePolicyInput,
} from './srs/objective-policy';

export {
  OBJECTIVE_PRIORITY_VALUES,
  objectivePrioritySchema,
  objectivePolicySchema,
} from './srs/objective-policy';

// Objective Proficiency
export type {
  EvidenceConfidence,
  PracticeVariantEvidence,
  ObjectiveProficiencyInput,
  ObjectiveProficiencyResult,
  StudentProficiencyView,
  TeacherProficiencyView,
} from './srs/objective-proficiency';

export {
  PROFICIENCY_THRESHOLD_DEFAULTS,
  computeObjectiveProficiency,
  buildStudentProficiencyView,
  buildTeacherProficiencyView,
} from './srs/objective-proficiency';

// SRS Proficiency Utilities
export type {
  ProficiencyCardInput,
  TimingBaselines,
} from './srs/srs-proficiency';

export {
  STABILITY_SCALE_FACTOR,
  FSRS_RETENTION_FACTOR,
  FSRS_RETENTION_DECAY,
  stabilityToRetention,
  objectiveLiveRetention,
  aggregateCardsToEvidence,
} from './srs/srs-proficiency';

// Edge Calibration
export type {
  CalibrationStatus,
  CalibrationVerdict,
  CalibrationObservation,
  CalibrationContingencyTable,
  EdgeCalibration,
  CalibrationNecessityResult,
  CalibrationReviewQueueItem,
  ReviewQueueBuildInput,
  ReviewQueueBuildOptions,
} from './srs/edge-calibration';

export {
  CALIBRATION_STATUS_VALUES,
  extractObservations,
  buildContingencyTable,
  computeNecessity,
  computeInformativeness,
  posteriorMean,
  posteriorVariance,
  updatePosterior,
  applyDecay,
  bucketVariance,
  classifyStatus,
  buildReviewQueueItem,
  buildReviewQueue,
} from './srs/edge-calibration';
