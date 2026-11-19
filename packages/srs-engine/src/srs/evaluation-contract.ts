import { z } from "zod";
import { paramsVersionSchema } from "./scheduler-policy-contract";

export const EVALUATION_CONTRACT_VERSION = "evaluation.v3.1" as const;
export const MAX_SYNTHETIC_COHORT_SIZE = 10_000 as const;
export const MAX_REPLAY_BATCH_SIZE = 10_000 as const;
export const MAX_SIMULATION_DAYS = 3_650 as const;
export const MAX_DETERMINISTIC_SEED = 0xffff_ffff as const;

export const SYNTHETIC_INVARIANT_NAMES = [
  "hard_gate_readiness",
  "queue_caps",
  "placement_probe_budget",
  "provisional_mastery_decay",
  "misconception_precedence",
] as const;

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 hex digest");
const unpaddedIdSchema = z
  .string()
  .min(1)
  .refine((value) => value.trim() === value && value.length > 0, {
    message: "must be non-blank and have no surrounding whitespace",
  });

export const syntheticLearnerSchema = z
  .strictObject({
    learnerId: z.string().min(1),
    ability: z.number().finite().min(0).max(1),
    forgetRateMultiplier: z.number().finite().gt(0).max(10),
    guessProb: z.number().finite().min(0).max(1),
    slipProb: z.number().finite().min(0).max(1),
    complianceRate: z.number().finite().min(0).max(1),
  })
  .refine((learner) => learner.guessProb + learner.slipProb <= 1, {
    path: ["slipProb"],
    message: "guessProb + slipProb must not exceed 1",
  });

export const syntheticCohortSchema = z
  .strictObject({
    contractVersion: z.literal(EVALUATION_CONTRACT_VERSION),
    cohortId: z.string().min(1),
    seed: z.number().int().nonnegative().max(MAX_DETERMINISTIC_SEED),
    configHash: sha256Schema,
    simulationDays: z.number().int().positive().max(MAX_SIMULATION_DAYS),
    learners: z.array(syntheticLearnerSchema).min(1).max(MAX_SYNTHETIC_COHORT_SIZE),
  })
  .superRefine((cohort, ctx) => {
    const learnerIds = new Set<string>();
    cohort.learners.forEach((learner, index) => {
      if (learnerIds.has(learner.learnerId)) {
        ctx.addIssue({
          code: "custom",
          path: ["learners", index, "learnerId"],
          message: "learnerId must be unique within a cohort",
        });
      }
      learnerIds.add(learner.learnerId);
    });
  });

export const syntheticInvariantMetricSchema = z
  .strictObject({
    name: z.enum(SYNTHETIC_INVARIANT_NAMES),
    passed: z.boolean(),
    checkedCount: z.number().int().nonnegative(),
    violationCount: z.number().int().nonnegative(),
  })
  .superRefine((metric, ctx) => {
    if (metric.violationCount > metric.checkedCount) {
      ctx.addIssue({
        code: "custom",
        path: ["violationCount"],
        message: "violationCount cannot exceed checkedCount",
      });
    }
    if (metric.passed !== (metric.violationCount === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["passed"],
        message: "passed must agree with violationCount",
      });
    }
  });

export const replayCalibrationBinSchema = z
  .strictObject({
    binIndex: z.number().int().min(0).max(9),
    lowerBound: z.number().finite().min(0).max(1),
    upperBound: z.number().finite().min(0).max(1),
    sampleCount: z.number().int().nonnegative(),
    meanPredictedRetention: z.number().finite().min(0).max(1).nullable(),
    observedRecallRate: z.number().finite().min(0).max(1).nullable(),
  })
  .superRefine((bin, ctx) => {
    const hasMeans = bin.meanPredictedRetention !== null && bin.observedRecallRate !== null;
    if (bin.sampleCount > 0 !== hasMeans) {
      ctx.addIssue({
        code: "custom",
        path: ["sampleCount"],
        message: "non-empty bins require both means; empty bins require null means",
      });
    }
  });

export const replayCalibrationMetricsSchema = z
  .strictObject({
    retentionPredictionMae: z.number().finite().min(0).max(1),
    bins: z.array(replayCalibrationBinSchema).length(10),
    maxAbsoluteError: z.number().finite().min(0).max(1),
  })
  .superRefine((metrics, ctx) => {
    metrics.bins.forEach((bin, index) => {
      const expectedLower = index / 10;
      const expectedUpper = (index + 1) / 10;
      if (
        bin.binIndex !== index ||
        Math.abs(bin.lowerBound - expectedLower) > 1e-12 ||
        Math.abs(bin.upperBound - expectedUpper) > 1e-12
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["bins", index],
          message: "calibration bins must be the ordered 10 equal retention intervals",
        });
      }
    });
    const populatedErrors = metrics.bins.flatMap((bin) =>
      bin.meanPredictedRetention === null || bin.observedRecallRate === null
        ? []
        : [Math.abs(bin.meanPredictedRetention - bin.observedRecallRate)],
    );
    const expectedMaximum = populatedErrors.length > 0 ? Math.max(...populatedErrors) : 0;
    if (Math.abs(metrics.maxAbsoluteError - expectedMaximum) > 1e-12) {
      ctx.addIssue({
        code: "custom",
        path: ["maxAbsoluteError"],
        message: "maxAbsoluteError must match the supplied calibration bins",
      });
    }
  });

export const recommendationEvaluationMetricsSchema = z
  .strictObject({
    placementAccuracy: z.number().finite().min(0).max(1).nullable(),
    placementSampleCount: z.number().int().nonnegative(),
    fringeStabilityFlapsPerStudentWeek: z.number().finite().nonnegative(),
    fringeStudentWeekCount: z.number().int().nonnegative(),
    edgeCalibrationBrierScore: z.number().finite().min(0).max(1).nullable(),
    edgeCalibrationSampleCount: z.number().int().nonnegative(),
  })
  .superRefine((metrics, ctx) => {
    if (metrics.placementSampleCount > 0 !== (metrics.placementAccuracy !== null)) {
      ctx.addIssue({
        code: "custom",
        path: ["placementAccuracy"],
        message: "placementAccuracy requires placement samples and vice versa",
      });
    }
    if (metrics.edgeCalibrationSampleCount > 0 !== (metrics.edgeCalibrationBrierScore !== null)) {
      ctx.addIssue({
        code: "custom",
        path: ["edgeCalibrationBrierScore"],
        message: "edgeCalibrationBrierScore requires edge samples and vice versa",
      });
    }
    if (metrics.fringeStudentWeekCount === 0 && metrics.fringeStabilityFlapsPerStudentWeek !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["fringeStabilityFlapsPerStudentWeek"],
        message: "zero fringe samples require a neutral zero flap rate",
      });
    }
  });

export const releaseGateMetricSchema = z
  .strictObject({
    candidateValue: z.number().finite().nonnegative(),
    incumbentValue: z.number().finite().nonnegative().nullable(),
    maximumAllowed: z.number().finite().nonnegative(),
    thresholdRule: z.enum(["incumbent_plus_0.02", "fixed_0.10", "incumbent_times_1.10"]),
    passed: z.boolean(),
  })
  .superRefine((metric, ctx) => {
    if (metric.passed !== metric.candidateValue <= metric.maximumAllowed) {
      ctx.addIssue({
        code: "custom",
        path: ["passed"],
        message: "passed must agree with candidateValue and maximumAllowed",
      });
    }
    const expectedMaximum =
      metric.thresholdRule === "fixed_0.10"
        ? 0.1
        : metric.incumbentValue === null
          ? null
          : metric.thresholdRule === "incumbent_plus_0.02"
            ? metric.incumbentValue + 0.02
            : metric.incumbentValue * 1.1;
    if (metric.thresholdRule === "fixed_0.10" && metric.incumbentValue !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["incumbentValue"],
        message: "fixed threshold must not claim an incumbent metric value",
      });
    }
    if (metric.thresholdRule !== "fixed_0.10" && metric.incumbentValue === null) {
      ctx.addIssue({
        code: "custom",
        path: ["incumbentValue"],
        message: "incumbent-relative threshold requires the incumbent metric value",
      });
    }
    if (expectedMaximum !== null && Math.abs(metric.maximumAllowed - expectedMaximum) > 1e-12) {
      ctx.addIssue({
        code: "custom",
        path: ["maximumAllowed"],
        message: "maximumAllowed must match its declared release-threshold rule",
      });
    }
  });

export const replayReleaseMetricsSchema = z
  .strictObject({
    invariantsPassed: z.boolean(),
    retentionPredictionMae: releaseGateMetricSchema,
    calibrationMaxAbsoluteError: releaseGateMetricSchema,
    fringeStability: releaseGateMetricSchema,
    allGatesPassed: z.boolean(),
    releaseRecommendation: z.enum(["pending", "eligible_for_human_approval", "rejected"]),
    humanApprovalRequired: z.literal(true),
  })
  .superRefine((metrics, ctx) => {
    const expectedRules = [
      [
        "retentionPredictionMae",
        metrics.retentionPredictionMae.thresholdRule,
        "incumbent_plus_0.02",
      ],
      [
        "calibrationMaxAbsoluteError",
        metrics.calibrationMaxAbsoluteError.thresholdRule,
        "fixed_0.10",
      ],
      ["fringeStability", metrics.fringeStability.thresholdRule, "incumbent_times_1.10"],
    ] as const;
    for (const [field, actual, expected] of expectedRules) {
      if (actual !== expected) {
        ctx.addIssue({
          code: "custom",
          path: [field, "thresholdRule"],
          message: `${field} must use the ${expected} release rule`,
        });
      }
    }
  });

export const sourceReviewAttributionSchema = z.strictObject({
  reviewId: unpaddedIdSchema,
  cardId: unpaddedIdSchema,
  paramsVersion: paramsVersionSchema,
  predictedRetention: z.number().finite().min(0).max(1),
  observedRecall: z.boolean(),
  reviewedAt: z.string().datetime(),
});

export const replayProgressSchema = z
  .strictObject({
    status: z.enum(["in_progress", "completed"]),
    processedReviewCount: z.number().int().nonnegative(),
    totalReviewCount: z.number().int().nonnegative(),
    batchSize: z.number().int().positive().max(MAX_REPLAY_BATCH_SIZE),
    startCursor: z.string().min(1).nullable(),
    nextCursor: z.string().min(1).nullable(),
  })
  .superRefine((progress, ctx) => {
    if (progress.processedReviewCount > progress.totalReviewCount) {
      ctx.addIssue({
        code: "custom",
        path: ["processedReviewCount"],
        message: "processedReviewCount cannot exceed totalReviewCount",
      });
    }
    if (progress.status === "completed") {
      if (progress.processedReviewCount !== progress.totalReviewCount) {
        ctx.addIssue({
          code: "custom",
          path: ["processedReviewCount"],
          message: "completed replay must process every source review",
        });
      }
      if (progress.nextCursor !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["nextCursor"],
          message: "completed replay cannot expose a next cursor",
        });
      }
    } else {
      if (progress.processedReviewCount >= progress.totalReviewCount) {
        ctx.addIssue({
          code: "custom",
          path: ["processedReviewCount"],
          message: "in-progress replay must have remaining source reviews",
        });
      }
      if (progress.nextCursor === null) {
        ctx.addIssue({
          code: "custom",
          path: ["nextCursor"],
          message: "in-progress replay requires an opaque resume cursor",
        });
      }
    }
  });

export const replayEvaluationResultSchema = z
  .strictObject({
    contractVersion: z.literal(EVALUATION_CONTRACT_VERSION),
    evaluationId: unpaddedIdSchema,
    candidateEngineVersion: unpaddedIdSchema,
    candidateParamsVersion: paramsVersionSchema,
    incumbentParamsVersion: paramsVersionSchema,
    replayCorpusId: unpaddedIdSchema,
    seed: z.number().int().nonnegative().max(MAX_DETERMINISTIC_SEED),
    configHash: sha256Schema,
    replayInputHash: sha256Schema,
    progress: replayProgressSchema,
    sourceReviews: z.array(sourceReviewAttributionSchema).max(MAX_REPLAY_BATCH_SIZE),
    invariantMetrics: z
      .array(syntheticInvariantMetricSchema)
      .length(SYNTHETIC_INVARIANT_NAMES.length),
    calibrationMetrics: replayCalibrationMetricsSchema,
    recommendationMetrics: recommendationEvaluationMetricsSchema,
    releaseMetrics: replayReleaseMetricsSchema,
    generatedAt: z.string().datetime(),
  })
  .superRefine((result, ctx) => {
    if (result.candidateParamsVersion === result.incumbentParamsVersion) {
      ctx.addIssue({
        code: "custom",
        path: ["candidateParamsVersion"],
        message: "candidateParamsVersion must differ from incumbentParamsVersion",
      });
    }
    if (result.sourceReviews.length > result.progress.batchSize) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceReviews"],
        message: "sourceReviews cannot exceed the bounded replay batch size",
      });
    }
    const cumulativeCalibrationSampleCount = result.calibrationMetrics.bins.reduce(
      (sum, bin) => sum + bin.sampleCount,
      0,
    );
    if (cumulativeCalibrationSampleCount !== result.progress.processedReviewCount) {
      ctx.addIssue({
        code: "custom",
        path: ["calibrationMetrics", "bins"],
        message: "calibration sample count must equal cumulative processedReviewCount",
      });
    }
    if (
      result.progress.startCursor === null &&
      result.sourceReviews.length !== result.progress.processedReviewCount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceReviews"],
        message: "an initial replay batch must expose every processed source review",
      });
    }
    const reviewIds = new Set<string>();
    result.sourceReviews.forEach((review, index) => {
      if (reviewIds.has(review.reviewId)) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceReviews", index, "reviewId"],
          message: "reviewId must be unique within an evaluation batch",
        });
      }
      reviewIds.add(review.reviewId);
      if (index > 0) {
        const previous = result.sourceReviews[index - 1];
        const reviewTime = Date.parse(review.reviewedAt);
        const previousTime = Date.parse(previous.reviewedAt);
        if (
          reviewTime < previousTime ||
          (reviewTime === previousTime && review.reviewId.localeCompare(previous.reviewId) <= 0)
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["sourceReviews", index],
            message: "source reviews must be in canonical reviewedAt/reviewId order",
          });
        }
      }
      if (Date.parse(result.generatedAt) < Date.parse(review.reviewedAt)) {
        ctx.addIssue({
          code: "custom",
          path: ["generatedAt"],
          message: "generatedAt cannot predate a source review",
        });
      }
    });

    result.invariantMetrics.forEach((metric, index) => {
      if (metric.name !== SYNTHETIC_INVARIANT_NAMES[index]) {
        ctx.addIssue({
          code: "custom",
          path: ["invariantMetrics", index, "name"],
          message: "invariant metrics must contain every invariant in canonical order",
        });
      }
    });

    const invariantsPassed = result.invariantMetrics.every((metric) => metric.passed);
    if (result.releaseMetrics.invariantsPassed !== invariantsPassed) {
      ctx.addIssue({
        code: "custom",
        path: ["releaseMetrics", "invariantsPassed"],
        message: "invariantsPassed must match the invariant metrics",
      });
    }

    const metricPairs = [
      [
        result.releaseMetrics.retentionPredictionMae.candidateValue,
        result.calibrationMetrics.retentionPredictionMae,
        "retentionPredictionMae",
      ],
      [
        result.releaseMetrics.calibrationMaxAbsoluteError.candidateValue,
        result.calibrationMetrics.maxAbsoluteError,
        "calibrationMaxAbsoluteError",
      ],
      [
        result.releaseMetrics.fringeStability.candidateValue,
        result.recommendationMetrics.fringeStabilityFlapsPerStudentWeek,
        "fringeStability",
      ],
    ] as const;
    for (const [releaseValue, measuredValue, field] of metricPairs) {
      if (Math.abs(releaseValue - measuredValue) > 1e-12) {
        ctx.addIssue({
          code: "custom",
          path: ["releaseMetrics", field, "candidateValue"],
          message: "release candidate value must match the measured result",
        });
      }
    }

    const hasRequiredReplayEvidence =
      result.invariantMetrics.every((metric) => metric.checkedCount > 0) &&
      result.calibrationMetrics.bins.some((bin) => bin.sampleCount > 0) &&
      result.recommendationMetrics.fringeStudentWeekCount > 0;
    const allGatesPassed =
      invariantsPassed &&
      hasRequiredReplayEvidence &&
      result.releaseMetrics.retentionPredictionMae.passed &&
      result.releaseMetrics.calibrationMaxAbsoluteError.passed &&
      result.releaseMetrics.fringeStability.passed;
    if (result.progress.status === "in_progress") {
      if (
        result.releaseMetrics.allGatesPassed ||
        result.releaseMetrics.releaseRecommendation !== "pending"
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["releaseMetrics", "releaseRecommendation"],
          message: "in-progress replay must remain pending and cannot pass release gates",
        });
      }
    } else {
      const expectedRecommendation = allGatesPassed ? "eligible_for_human_approval" : "rejected";
      if (
        result.releaseMetrics.allGatesPassed !== allGatesPassed ||
        result.releaseMetrics.releaseRecommendation !== expectedRecommendation
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["releaseMetrics", "releaseRecommendation"],
          message: `completed replay must be ${expectedRecommendation}`,
        });
      }
    }
  });

export type SyntheticLearnerV31 = z.infer<typeof syntheticLearnerSchema>;
export type SyntheticCohortV31 = z.infer<typeof syntheticCohortSchema>;
export type SyntheticInvariantName = (typeof SYNTHETIC_INVARIANT_NAMES)[number];
export type SyntheticInvariantMetric = z.infer<typeof syntheticInvariantMetricSchema>;
export type ReplayCalibrationBin = z.infer<typeof replayCalibrationBinSchema>;
export type ReplayCalibrationMetrics = z.infer<typeof replayCalibrationMetricsSchema>;
export type RecommendationEvaluationMetrics = z.infer<typeof recommendationEvaluationMetricsSchema>;
export type ReplayReleaseMetrics = z.infer<typeof replayReleaseMetricsSchema>;
export type SourceReviewAttribution = z.infer<typeof sourceReviewAttributionSchema>;
export type ReplayProgress = z.infer<typeof replayProgressSchema>;
export type ReplayEvaluationResultV31 = z.infer<typeof replayEvaluationResultSchema>;

export function isSyntheticLearnerV31(value: unknown): value is SyntheticLearnerV31 {
  return syntheticLearnerSchema.safeParse(value).success;
}

export function isSyntheticCohortV31(value: unknown): value is SyntheticCohortV31 {
  return syntheticCohortSchema.safeParse(value).success;
}

export function isReplayEvaluationResultV31(value: unknown): value is ReplayEvaluationResultV31 {
  return replayEvaluationResultSchema.safeParse(value).success;
}
