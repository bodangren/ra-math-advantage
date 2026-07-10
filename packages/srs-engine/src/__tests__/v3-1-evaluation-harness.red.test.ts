/**
 * Intentional Red — v3.1 offline evaluation harness (§17).
 *
 * These tests define the smallest domain-neutral behavioral surface needed by
 * the future implementation. Fixtures are synthetic and expected values are
 * calculated independently from the implementation under test.
 */
import { describe, expect, it } from 'vitest';

import {
  EVALUATION_CONTRACT_VERSION,
  SYNTHETIC_INVARIANT_NAMES,
} from '../srs/evaluation-contract';
import type {
  ReplayCalibrationBin,
  SourceReviewAttribution,
  SyntheticInvariantMetric,
} from '../srs/evaluation-contract';
import {
  computeReplayMetrics,
  evaluateReplayReleaseGates,
  evaluateSyntheticInvariants,
  generateSyntheticCohort,
  runReplayEvaluationBatch,
} from '../srs/evaluation-harness';

const CONFIG_HASH = 'a'.repeat(64);
const REPLAY_HASH = 'b'.repeat(64);

const passingInvariantMetrics = SYNTHETIC_INVARIANT_NAMES.map((name) => ({
  name,
  passed: true,
  checkedCount: 1,
  violationCount: 0,
}));

const passingAudit = {
  recommendations: [{ hardGateReady: true }],
  dailyQueues: [{ queueSize: 12, queueCap: 12, newCardCount: 3, newCardsPerDay: 3 }],
  placements: [{ terminated: true, probeCount: 24, probeBudget: 24 }],
  provisionalMastery: [{
    reviewed: false,
    elapsedDays: 7,
    previousMastery: 0.8,
    currentMastery: 0.7,
  }],
  progressionDecisions: [{
    activeMisconception: true,
    nextAction: 'misconception_remediation',
  }],
} as const;

const tenBinReviews = Array.from({ length: 10 }, (_, index) => ({
  reviewId: `metric-review-${index}`,
  cardId: `metric-card-${index}`,
  paramsVersion: 'fsrs.synthetic.v1',
  predictedRetention: index / 10 + 0.05,
  observedRecall: index >= 5,
  reviewedAt: `2026-07-10T00:00:${String(index).padStart(2, '0')}.000Z`,
}));

const reportMetricInputs = {
  placementComparisons: [
    { estimatedMastery: 0.8, firstThreeAttemptMastery: 0.6 },
    { estimatedMastery: 0.2, firstThreeAttemptMastery: 0.6 },
    { estimatedMastery: 0.5, firstThreeAttemptMastery: 0.25 },
  ],
  fringeObservations: [
    { studentId: 'student-1', weekId: '2026-W28', masteryStateFlaps: 1 },
    { studentId: 'student-2', weekId: '2026-W28', masteryStateFlaps: 3 },
  ],
  edgeCalibrationObservations: [
    { predictedNecessity: 0.8, observedNecessary: true },
    { predictedNecessity: 0.4, observedNecessary: false },
  ],
} as const;

const resumableReviews = [
  {
    reviewId: 'review-1',
    cardId: 'card-1',
    paramsVersion: 'fsrs.synthetic.v1',
    predictedRetention: 0.02,
    observedRecall: false,
    reviewedAt: '2026-07-10T00:00:00.000Z',
  },
  {
    reviewId: 'review-2',
    cardId: 'card-2',
    paramsVersion: 'fsrs.synthetic.v1',
    predictedRetention: 0.04,
    observedRecall: false,
    reviewedAt: '2026-07-10T00:01:00.000Z',
  },
  {
    reviewId: 'review-3',
    cardId: 'card-3',
    paramsVersion: 'fsrs.synthetic.v2',
    predictedRetention: 0.96,
    observedRecall: true,
    reviewedAt: '2026-07-10T00:02:00.000Z',
  },
] as const;

const replayInput = {
  contractVersion: EVALUATION_CONTRACT_VERSION,
  evaluationId: 'evaluation-synthetic-1',
  candidateEngineVersion: 'srs-engine.synthetic-candidate',
  candidateParamsVersion: 'fsrs.synthetic.candidate',
  incumbentParamsVersion: 'fsrs.synthetic.incumbent',
  replayCorpusId: 'synthetic-review-log-replay.v1',
  seed: 71,
  configHash: CONFIG_HASH,
  replayInputHash: REPLAY_HASH,
  generatedAt: '2026-07-10T01:00:00.000Z',
  reviews: resumableReviews,
  ...reportMetricInputs,
  invariantMetrics: passingInvariantMetrics,
  incumbentMetrics: {
    retentionPredictionMae: 0.02,
    fringeStabilityFlapsPerStudentWeek: 2,
  },
  batchSize: 2,
  resumeCursor: null,
} as const;

describe('v3.1 synthetic simulation harness (intentional Red)', () => {
  it('generates bounded cohorts deterministically from the declared seed', () => {
    const input = {
      cohortId: 'cohort-71',
      seed: 71,
      configHash: CONFIG_HASH,
      simulationDays: 180,
      learnerCount: 32,
    } as const;

    const first = generateSyntheticCohort(input);
    const repeated = generateSyntheticCohort(input);
    const differentSeed = generateSyntheticCohort({ ...input, seed: 72 });

    expect(repeated).toEqual(first);
    expect(differentSeed.learners).not.toEqual(first.learners);
    expect(first.learners).toHaveLength(32);
    for (const learner of first.learners) {
      expect(learner.ability).toBeGreaterThanOrEqual(0);
      expect(learner.ability).toBeLessThanOrEqual(1);
      expect(learner.forgetRateMultiplier).toBeGreaterThan(0);
      expect(learner.guessProb + learner.slipProb).toBeLessThanOrEqual(1);
      expect(learner.complianceRate).toBeGreaterThanOrEqual(0);
      expect(learner.complianceRate).toBeLessThanOrEqual(1);
    }
  });

  it('passes all five invariants and reports each violation independently', () => {
    expect(evaluateSyntheticInvariants(passingAudit)).toEqual(passingInvariantMetrics);

    const violations = evaluateSyntheticInvariants({
      recommendations: [{ hardGateReady: false }],
      dailyQueues: [{ queueSize: 13, queueCap: 12, newCardCount: 4, newCardsPerDay: 3 }],
      placements: [{ terminated: false, probeCount: 25, probeBudget: 24 }],
      provisionalMastery: [{
        reviewed: false,
        elapsedDays: 7,
        previousMastery: 0.8,
        currentMastery: 0.8,
      }],
      progressionDecisions: [{
        activeMisconception: true,
        nextAction: 'normal_progression',
      }],
    });

    expect(violations.map((metric: SyntheticInvariantMetric) => metric.name))
      .toEqual(SYNTHETIC_INVARIANT_NAMES);
    expect(violations).toEqual(SYNTHETIC_INVARIANT_NAMES.map((name) => ({
      name,
      passed: false,
      checkedCount: 1,
      violationCount: 1,
    })));
  });
});

describe('v3.1 replay metrics and release gates (intentional Red)', () => {
  it('computes MAE, exactly ten calibration bins, placement, fringe, and edge metrics', () => {
    const metrics = computeReplayMetrics({
      reviews: tenBinReviews,
      ...reportMetricInputs,
    });

    // Independent fixture math: absolute errors sum to 2.5 across 10 reviews.
    expect(metrics.calibrationMetrics.retentionPredictionMae).toBeCloseTo(0.25, 12);
    expect(metrics.calibrationMetrics.bins).toHaveLength(10);
    metrics.calibrationMetrics.bins.forEach((bin: ReplayCalibrationBin, index: number) => {
      expect(bin).toMatchObject({
        binIndex: index,
        lowerBound: index / 10,
        upperBound: (index + 1) / 10,
        sampleCount: 1,
      });
    });
    expect(metrics.calibrationMetrics.maxAbsoluteError).toBeCloseTo(0.45, 12);
    expect(metrics.recommendationMetrics.placementAccuracy).toBeCloseTo(2 / 3, 12);
    expect(metrics.recommendationMetrics.fringeStabilityFlapsPerStudentWeek).toBe(2);
    expect(metrics.recommendationMetrics.edgeCalibrationBrierScore).toBeCloseTo(0.1, 12);
  });

  it('gates against the incumbent while keeping placement and edge quality report-only', () => {
    const metrics = computeReplayMetrics({
      reviews: tenBinReviews,
      ...reportMetricInputs,
    });
    const release = evaluateReplayReleaseGates({
      invariantMetrics: passingInvariantMetrics,
      ...metrics,
      incumbentMetrics: {
        retentionPredictionMae: 0.24,
        fringeStabilityFlapsPerStudentWeek: 2,
      },
    });

    expect(release.retentionPredictionMae.maximumAllowed).toBeCloseTo(0.26, 12);
    expect(release.retentionPredictionMae.passed).toBe(true);
    expect(release.calibrationMaxAbsoluteError.maximumAllowed).toBe(0.1);
    expect(release.calibrationMaxAbsoluteError.passed).toBe(false);
    expect(release.fringeStability.maximumAllowed).toBeCloseTo(2.2, 12);
    expect(release.fringeStability.passed).toBe(true);
    expect(release.allGatesPassed).toBe(false);
    expect(release.releaseRecommendation).toBe('rejected');
    expect(release.humanApprovalRequired).toBe(true);
  });

  it('is deterministic, bounded, resumable, attributed, and never auto-releases', () => {
    const first = runReplayEvaluationBatch(replayInput);
    expect(runReplayEvaluationBatch(replayInput)).toEqual(first);
    expect(first.sourceReviews).toHaveLength(2);
    expect(first.sourceReviews.every(
      (review: SourceReviewAttribution) => review.paramsVersion.length > 0,
    )).toBe(true);
    expect(first.progress).toMatchObject({
      status: 'in_progress',
      processedReviewCount: 2,
      totalReviewCount: 3,
      batchSize: 2,
    });
    expect(first.progress.nextCursor).toEqual(expect.any(String));
    expect(first.releaseMetrics.releaseRecommendation).toBe('pending');

    const completed = runReplayEvaluationBatch({
      ...replayInput,
      resumeCursor: first.progress.nextCursor,
    });
    expect(completed.sourceReviews).toHaveLength(1);
    expect(completed.progress).toMatchObject({
      status: 'completed',
      processedReviewCount: 3,
      totalReviewCount: 3,
      nextCursor: null,
    });
    expect(completed.releaseMetrics).toMatchObject({
      allGatesPassed: true,
      releaseRecommendation: 'eligible_for_human_approval',
      humanApprovalRequired: true,
    });
    expect('productionReleaseApplied' in completed.releaseMetrics).toBe(false);
  });

  it('fails closed when any source review lacks paramsVersion attribution', () => {
    expect(() => runReplayEvaluationBatch({
      ...replayInput,
      reviews: [
        { ...resumableReviews[0], paramsVersion: '' },
      ],
      batchSize: 1,
    })).toThrow(/paramsVersion/i);
  });
});
