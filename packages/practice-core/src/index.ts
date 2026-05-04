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
  type SrsRatingResult,
  computeBaseRating,
  applyTimingToRating,
  mapPracticeToSrsRating,
} from './practice/srs-rating';

export {
  DIFFICULTY_VALUES,
  type Difficulty,
  difficultySchema,
  type ProblemFamily,
  problemFamilySchema,
  type ProblemFamilyInput,
} from './practice/problem-family';

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
