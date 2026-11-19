export {
  EFFICACY_CONTRACT_VERSION,
  RetentionPointSchema,
  TimeToMasteryStatSchema,
  AccuracyTrendPointSchema,
  ReviewSuccessRateSchema,
  MetricResultSchema,
  type RetentionPoint,
  type TimeToMasteryStat,
  type AccuracyTrendPoint,
  type ReviewSuccessRate,
  type MetricResult,
} from "./contracts";

export { computeRetentionCurve } from "./metrics/retention";
export { computeTimeToMastery } from "./metrics/time-to-mastery";
export { computeAccuracyTrend } from "./metrics/accuracy";
export { computeReviewSuccessRate } from "./metrics/review-success";

export { assign, type AssignInput, type AssignVariant } from "./experiment/assign";
export {
  createExperimentRegistry,
  type ExperimentEntry,
  type ExperimentStatus,
} from "./experiment/registry";
export {
  computeExperimentReport,
  type ExperimentReport,
  type ExperimentReportInput,
  type ExperimentSignificance,
  type VariantStatistics,
} from "./experiment/report";
