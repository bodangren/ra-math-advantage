export {
  PRACTICE_CONTRACT_VERSION,
  PRACTICE_MODE_VALUES,
  PRACTICE_SUBMISSION_STATUS_VALUES,
  practiceModeSchema,
  practiceSubmissionStatusSchema,
  practiceTimingConfidenceSchema,
  type PracticeTimingConfidence,
  practiceTimingSummarySchema,
  type PracticeTimingSummary,
  practiceSubmissionPartSchema,
  type PracticeSubmissionPart,
  convexActivityIdSchema,
  type ConvexActivityId,
  toConvexActivityId,
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
  type PracticeSubmissionCallbackPayload,
  isPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  buildPracticeSubmissionEnvelope,
  type PracticeSubmissionInput,
  normalizePracticeSubmissionInput,
} from './practice/contract';

/**
 * @deprecated Import from `./contract` instead. These re-exports are preserved
 * for backward compatibility and will be removed in a future version.
 */
export {
  PracticeTimingConfidenceSchema,
  PracticeTimingSummarySchema,
  PracticeSubmissionPartSchema,
  PracticeSubmissionEnvelopeSchema,
  type PracticeTimingSummary as PracticeTimingSummaryAlt,
  type PracticeSubmissionPart as PracticeSubmissionPartAlt,
  type PracticeSubmissionEnvelope as PracticeSubmissionEnvelopeAlt,
} from './practice/submission.schema';

export {
  DEFAULT_IDLE_THRESHOLD_MS,
  type TimingEventType,
  type TimingEvent,
  type TimingAccumulatorSnapshot,
  type TimingAccumulatorOptions,
  TimingAccumulator,
  createTimingAccumulator,
} from './practice/timing';

export {
  TIMING_BASELINE_MIN_SAMPLES,
  SPEED_BAND_THRESHOLDS,
  type TimingSpeedBand,
  type PracticeTimingBaseline,
  type PracticeTimingFeatures,
  type ComputeBaselineInput,
  computeTimingBaseline,
  deriveTimingFeatures,
} from './practice/timing-baseline';

export {
  type SrsRating,
  type SrsRatingInput,
  type SrsRatingInputV31,
  type SrsRatingResult,
  type SeverityByTag,
  type ComputeBaseRatingOptions,
  computeBaseRating,
  applyTimingToRating,
  mapPracticeToSrsRating,
  mapPracticeToSrsRatingV31,
} from './practice/srs-rating';

export {
  SRS_RATING_POLICY_VERSION,
  TIMING_BASELINE_POLICY_VERSION,
  timingZBaselineSchema,
  srsRatingPartV31Schema,
  srsRatingInputV31Schema,
  ratingCapDecisionSchema,
  timingPartDecisionSchema,
  timingRatingDecisionSchema,
  srsRatingResultV31Schema,
} from './practice/v3-1-contracts';
export type {
  TimingZBaseline,
  SrsRatingPartV31,
  RatingCapDecision,
  TimingRatingDecision,
  SrsRatingResultV31,
} from './practice/v3-1-contracts';

export {
  DIFFICULTY_VALUES,
  type Difficulty,
  difficultySchema,
  type PracticeVariant,
  practiceVariantSchema,
  type PracticeVariantInput,
} from './practice/problem-family';

/** @deprecated Renamed to practiceVariantSchema. Will be removed in a future version. */
export { practiceVariantSchema as problemFamilySchema } from './practice/problem-family';
/** @deprecated Renamed to PracticeVariantInput. Will be removed in a future version. */
export { type PracticeVariantInput as ProblemFamilyInput } from './practice/problem-family';

export {
  type PracticeItem,
  practiceItemSchema,
  type PracticeItemInput,
} from './practice/practice-item';

export {
  type MisconceptionSummary,
  type PracticeSubmissionEvidence,
  type SubmissionEvidence,
  type PartOutcomeSummary,
  type StudentErrorProfile,
  type LessonErrorSummary,
  type DeterministicErrorSummary,
  type AISummaryInput,
  type AISummaryOutput,
  type TeacherErrorView,
  canTeacherAccessSubmission,
  canTeacherAccessLessonSummary,
  aggregateMisconceptionTags,
  summarizePartOutcomes,
  buildStudentProfiles,
  buildDeterministicSummary,
  generateAISummary,
  buildTeacherErrorView,
} from './practice/error-analysis';

export {
  createMockPracticeEnvelope,
  createMockPracticeTimingSummary,
  createMockPracticeSubmissionPart,
} from './practice/fixtures';

export {
  LEARNING_EVIDENCE_CONTRACT_VERSION,
  LEARNING_EVIDENCE_ORIGIN_VALUES,
  learningEvidenceV1Schema,
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  learningEvidenceFingerprintV1,
} from './practice/learning-evidence';
export type {
  LearningEvidenceV1,
  LearningEvidenceIdempotencyV1,
  LearningEvidenceExposureStateV1,
  LearningEvidenceDecisionReasonV1,
  LearningEvidenceDecisionV1,
  EvaluateLearningEvidenceV1Input,
} from './practice/learning-evidence';
