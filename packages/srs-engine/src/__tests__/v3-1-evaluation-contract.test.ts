import { describe, expect, it } from 'vitest';

import {
  EVALUATION_CONTRACT_VERSION,
  MAX_REPLAY_BATCH_SIZE,
  MAX_SYNTHETIC_COHORT_SIZE,
  SYNTHETIC_INVARIANT_NAMES,
  isReplayEvaluationResultV31,
  isSyntheticCohortV31,
  isSyntheticLearnerV31,
  replayEvaluationResultSchema,
  syntheticCohortSchema,
  syntheticLearnerSchema,
} from '../srs/evaluation-contract';

const hashA = 'a'.repeat(64);
const hashB = 'b'.repeat(64);

const learner = {
  learnerId: 'synthetic-learner-1',
  ability: 0.65,
  forgetRateMultiplier: 1.2,
  guessProb: 0.25,
  slipProb: 0.05,
  complianceRate: 0.9,
};

const invariantMetrics = SYNTHETIC_INVARIANT_NAMES.map((name) => ({
  name,
  passed: true,
  checkedCount: 100,
  violationCount: 0,
}));

const calibrationBins = Array.from({ length: 10 }, (_, binIndex) => ({
  binIndex,
  lowerBound: binIndex / 10,
  upperBound: (binIndex + 1) / 10,
  sampleCount: 1,
  meanPredictedRetention: binIndex / 10 + 0.05,
  observedRecallRate: binIndex / 10 + 0.05,
}));

const completedReplay = {
  contractVersion: EVALUATION_CONTRACT_VERSION,
  evaluationId: 'evaluation-1',
  candidateEngineVersion: 'srs-engine.2026-07-10',
  candidateParamsVersion: 'fsrs.math.im3.2026-07',
  incumbentParamsVersion: 'fsrs.math.im3.2026-06',
  replayCorpusId: 'synthetic-review-log-replay.v1',
  seed: 424242,
  configHash: hashA,
  replayInputHash: hashB,
  progress: {
    status: 'completed',
    processedReviewCount: 1,
    totalReviewCount: 1,
    batchSize: 100,
    startCursor: null,
    nextCursor: null,
  },
  sourceReviews: [
    {
      reviewId: 'review-1',
      cardId: 'card-1',
      paramsVersion: 'fsrs.math.im3.2026-05',
      predictedRetention: 0.8,
      observedRecall: true,
      reviewedAt: '2026-07-10T00:00:00.000Z',
    },
  ],
  invariantMetrics,
  calibrationMetrics: {
    retentionPredictionMae: 0.05,
    bins: calibrationBins,
    maxAbsoluteError: 0,
  },
  recommendationMetrics: {
    placementAccuracy: 0.8,
    placementSampleCount: 20,
    fringeStabilityFlapsPerStudentWeek: 0.2,
    edgeCalibrationBrierScore: 0.15,
    edgeCalibrationSampleCount: 80,
  },
  releaseMetrics: {
    invariantsPassed: true,
    retentionPredictionMae: {
      candidateValue: 0.05,
      incumbentValue: 0.05,
      maximumAllowed: 0.07,
      thresholdRule: 'incumbent_plus_0.02',
      passed: true,
    },
    calibrationMaxAbsoluteError: {
      candidateValue: 0,
      incumbentValue: null,
      maximumAllowed: 0.1,
      thresholdRule: 'fixed_0.10',
      passed: true,
    },
    fringeStability: {
      candidateValue: 0.2,
      incumbentValue: 0.2,
      maximumAllowed: 0.22,
      thresholdRule: 'incumbent_times_1.10',
      passed: true,
    },
    allGatesPassed: true,
    releaseRecommendation: 'eligible_for_human_approval',
    humanApprovalRequired: true,
  },
  generatedAt: '2026-07-10T01:00:00.000Z',
} as const;

describe('v3.1 synthetic evaluation contracts', () => {
  it('bounds each learner parameter and the chance/error probability mass', () => {
    expect(isSyntheticLearnerV31(learner)).toBe(true);
    expect(syntheticLearnerSchema.safeParse({ ...learner, ability: 1.01 }).success).toBe(false);
    expect(syntheticLearnerSchema.safeParse({
      ...learner,
      guessProb: 0.7,
      slipProb: 0.4,
    }).success).toBe(false);
  });

  it('defines a deterministic, bounded cohort with unique learner IDs', () => {
    const cohort = {
      contractVersion: EVALUATION_CONTRACT_VERSION,
      cohortId: 'cohort-1',
      seed: 42,
      configHash: hashA,
      simulationDays: 180,
      learners: [learner],
    };
    expect(syntheticCohortSchema.parse(cohort).learners).toHaveLength(1);
    expect(isSyntheticCohortV31(cohort)).toBe(true);
    expect(MAX_SYNTHETIC_COHORT_SIZE).toBe(10_000);
    expect(MAX_REPLAY_BATCH_SIZE).toBe(10_000);
    expect(syntheticCohortSchema.safeParse({
      ...cohort,
      learners: [learner, learner],
    }).success).toBe(false);
    expect(syntheticCohortSchema.safeParse({ ...cohort, configHash: 'not-a-hash' }).success).toBe(false);
  });
});

describe('v3.1 replay evaluation result contract', () => {
  it('captures deterministic provenance, source-review parameter attribution, and every metric family', () => {
    const parsed = replayEvaluationResultSchema.parse(completedReplay);
    expect(parsed.sourceReviews[0].paramsVersion).toBe('fsrs.math.im3.2026-05');
    expect(parsed.invariantMetrics).toHaveLength(5);
    expect(parsed.calibrationMetrics.bins).toHaveLength(10);
    expect(parsed.releaseMetrics.humanApprovalRequired).toBe(true);
    expect(isReplayEvaluationResultV31(parsed)).toBe(true);
  });

  it('rejects duplicate or unattributed source reviews', () => {
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      sourceReviews: [
        completedReplay.sourceReviews[0],
        completedReplay.sourceReviews[0],
      ],
    }).success).toBe(false);
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      sourceReviews: [{ ...completedReplay.sourceReviews[0], paramsVersion: '' }],
    }).success).toBe(false);
  });

  it('requires an auditable resume cursor until the bounded replay is complete', () => {
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      progress: {
        ...completedReplay.progress,
        status: 'in_progress',
        processedReviewCount: 1,
        totalReviewCount: 2,
        nextCursor: 'opaque-cursor-2',
      },
      releaseMetrics: {
        ...completedReplay.releaseMetrics,
        allGatesPassed: false,
        releaseRecommendation: 'pending',
      },
    }).success).toBe(true);
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      progress: { ...completedReplay.progress, nextCursor: 'unexpected' },
    }).success).toBe(false);
  });

  it('rejects inconsistent invariant, calibration, and release summaries', () => {
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      invariantMetrics: invariantMetrics.map((metric, index) => (
        index === 0 ? { ...metric, passed: true, violationCount: 1 } : metric
      )),
    }).success).toBe(false);
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      calibrationMetrics: { ...completedReplay.calibrationMetrics, maxAbsoluteError: 0.2 },
    }).success).toBe(false);
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      releaseMetrics: {
        ...completedReplay.releaseMetrics,
        retentionPredictionMae: {
          candidateValue: 0.08,
          incumbentValue: 0.05,
          maximumAllowed: 0.07,
          thresholdRule: 'incumbent_plus_0.02',
          passed: true,
        },
      },
    }).success).toBe(false);
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      releaseMetrics: {
        ...completedReplay.releaseMetrics,
        fringeStability: {
          ...completedReplay.releaseMetrics.fringeStability,
          maximumAllowed: 0.3,
        },
      },
    }).success).toBe(false);
  });

  it('rejects auto-release claims and undeclared schema fields', () => {
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      releaseMetrics: {
        ...completedReplay.releaseMetrics,
        humanApprovalRequired: false,
      },
    }).success).toBe(false);
    expect(replayEvaluationResultSchema.safeParse({
      ...completedReplay,
      productionReleaseApplied: true,
    }).success).toBe(false);
  });
});
