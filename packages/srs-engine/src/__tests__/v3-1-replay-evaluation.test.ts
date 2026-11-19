import { describe, expect, it } from "vitest";

import {
  EVALUATION_CONTRACT_VERSION,
  SYNTHETIC_INVARIANT_NAMES,
  replayEvaluationResultSchema,
} from "../srs/evaluation-contract";
import {
  computeReplayMetrics,
  evaluateReplayReleaseGates,
  runReplayEvaluationBatch,
} from "../srs/replay-evaluation";

const CONFIG_HASH = "a".repeat(64);
const REPLAY_HASH = "b".repeat(64);

const passingInvariants = SYNTHETIC_INVARIANT_NAMES.map((name) => ({
  name,
  passed: true,
  checkedCount: 1,
  violationCount: 0,
}));

const reviews = [
  {
    reviewId: "review-1",
    cardId: "card-1",
    paramsVersion: "fsrs.fixture.v1",
    predictedRetention: 0.02,
    observedRecall: false,
    reviewedAt: "2026-07-10T00:00:00.000Z",
  },
  {
    reviewId: "review-2",
    cardId: "card-2",
    paramsVersion: "fsrs.fixture.v1",
    predictedRetention: 0.04,
    observedRecall: false,
    reviewedAt: "2026-07-10T00:01:00.000Z",
  },
  {
    reviewId: "review-3",
    cardId: "card-3",
    paramsVersion: "fsrs.fixture.v2",
    predictedRetention: 1,
    observedRecall: true,
    reviewedAt: "2026-07-10T00:02:00.000Z",
  },
] as const;

const reportInputs = {
  placementComparisons: [
    { estimatedMastery: 0.8, firstThreeAttemptMastery: 0.55 },
    { estimatedMastery: 0.2, firstThreeAttemptMastery: 0.46 },
  ],
  fringeObservations: [
    { studentId: "student-1", weekId: "2026-W28", masteryStateFlaps: 1 },
    { studentId: "student-2", weekId: "2026-W28", masteryStateFlaps: 3 },
  ],
  edgeCalibrationObservations: [
    { predictedNecessity: 0.8, observedNecessary: true },
    { predictedNecessity: 0.4, observedNecessary: false },
  ],
} as const;

const batchInput = {
  contractVersion: EVALUATION_CONTRACT_VERSION,
  evaluationId: "evaluation-1",
  candidateEngineVersion: "engine.candidate.v1",
  candidateParamsVersion: "fsrs.candidate.v1",
  incumbentParamsVersion: "fsrs.incumbent.v1",
  replayCorpusId: "fixture-corpus.v1",
  seed: 71,
  configHash: CONFIG_HASH,
  replayInputHash: REPLAY_HASH,
  generatedAt: "2026-07-10T01:00:00.000Z",
  reviews,
  ...reportInputs,
  invariantMetrics: passingInvariants,
  incumbentMetrics: {
    retentionPredictionMae: 0.02,
    fringeStabilityFlapsPerStudentWeek: 2,
  },
  batchSize: 2,
  resumeCursor: null,
} as const;

describe("v3.1 replay metric computation", () => {
  it("uses ten fixed bins, including retention 1 in bin 9, and independent report metrics", () => {
    const result = computeReplayMetrics({ reviews, ...reportInputs });

    expect(result.calibrationMetrics.retentionPredictionMae).toBeCloseTo(0.02, 12);
    expect(result.calibrationMetrics.bins).toHaveLength(10);
    expect(result.calibrationMetrics.bins[9]).toMatchObject({
      binIndex: 9,
      sampleCount: 1,
      meanPredictedRetention: 1,
      observedRecallRate: 1,
    });
    expect(result.calibrationMetrics.maxAbsoluteError).toBeCloseTo(0.03, 12);
    expect(result.recommendationMetrics).toEqual({
      placementAccuracy: 0.5,
      placementSampleCount: 2,
      fringeStabilityFlapsPerStudentWeek: 2,
      fringeStudentWeekCount: 2,
      edgeCalibrationBrierScore: 0.1,
      edgeCalibrationSampleCount: 2,
    });
  });

  it("returns schema-correct neutral metrics for empty samples", () => {
    expect(
      computeReplayMetrics({
        reviews: [],
        placementComparisons: [],
        fringeObservations: [],
        edgeCalibrationObservations: [],
      }),
    ).toEqual({
      calibrationMetrics: {
        retentionPredictionMae: 0,
        bins: Array.from({ length: 10 }, (_, index) => ({
          binIndex: index,
          lowerBound: index / 10,
          upperBound: (index + 1) / 10,
          sampleCount: 0,
          meanPredictedRetention: null,
          observedRecallRate: null,
        })),
        maxAbsoluteError: 0,
      },
      recommendationMetrics: {
        placementAccuracy: null,
        placementSampleCount: 0,
        fringeStabilityFlapsPerStudentWeek: 0,
        fringeStudentWeekCount: 0,
        edgeCalibrationBrierScore: null,
        edgeCalibrationSampleCount: 0,
      },
    });
  });

  it("does not mutate metric source arrays", () => {
    const input = {
      reviews: reviews.map((review) => ({ ...review })),
      placementComparisons: reportInputs.placementComparisons.map((item) => ({ ...item })),
      fringeObservations: reportInputs.fringeObservations.map((item) => ({ ...item })),
      edgeCalibrationObservations: reportInputs.edgeCalibrationObservations.map((item) => ({
        ...item,
      })),
    };
    const before = structuredClone(input);

    computeReplayMetrics(input);

    expect(input).toEqual(before);
  });
});

describe("v3.1 replay release gates", () => {
  it("applies only the three normative gates and still requires human approval", () => {
    const metrics = computeReplayMetrics({ reviews, ...reportInputs });
    const result = evaluateReplayReleaseGates({
      invariantMetrics: passingInvariants,
      ...metrics,
      incumbentMetrics: {
        retentionPredictionMae: 0,
        fringeStabilityFlapsPerStudentWeek: 2,
      },
    });

    expect(result).toMatchObject({
      invariantsPassed: true,
      allGatesPassed: true,
      releaseRecommendation: "eligible_for_human_approval",
      humanApprovalRequired: true,
      retentionPredictionMae: { maximumAllowed: 0.02, passed: true },
      calibrationMaxAbsoluteError: { maximumAllowed: 0.1, passed: true },
      fringeStability: { maximumAllowed: 2.2, passed: true },
    });
    expect("placementAccuracy" in result).toBe(false);
    expect("edgeCalibrationBrierScore" in result).toBe(false);
    expect("productionReleaseApplied" in result).toBe(false);
  });

  it("requires every invariant exactly once in canonical order", () => {
    const metrics = computeReplayMetrics({ reviews, ...reportInputs });
    const common = {
      ...metrics,
      incumbentMetrics: {
        retentionPredictionMae: 0.02,
        fringeStabilityFlapsPerStudentWeek: 2,
      },
    };

    expect(() =>
      evaluateReplayReleaseGates({
        invariantMetrics: passingInvariants.slice(0, -1),
        ...common,
      }),
    ).toThrow(/invariant/i);
    expect(() =>
      evaluateReplayReleaseGates({
        invariantMetrics: [...passingInvariants].reverse(),
        ...common,
      }),
    ).toThrow(/canonical order/i);
    expect(() =>
      evaluateReplayReleaseGates({
        invariantMetrics: passingInvariants.map((metric, index) =>
          index === 0 ? { ...metric, checkedCount: 0 } : metric,
        ),
        ...common,
      }),
    ).toThrow(/non-empty evidence/i);
  });

  it("rejects release eligibility without both review and fringe evidence", () => {
    const emptyMetrics = computeReplayMetrics({
      reviews: [],
      placementComparisons: [],
      fringeObservations: [],
      edgeCalibrationObservations: [],
    });

    expect(
      evaluateReplayReleaseGates({
        invariantMetrics: passingInvariants,
        ...emptyMetrics,
        incumbentMetrics: {
          retentionPredictionMae: 0,
          fringeStabilityFlapsPerStudentWeek: 0,
        },
      }),
    ).toMatchObject({
      allGatesPassed: false,
      releaseRecommendation: "rejected",
    });
  });
});

describe("v3.1 bounded replay batches", () => {
  it("resumes deterministically and remains pending until the complete replay", () => {
    const inputBefore = structuredClone(batchInput);
    const first = runReplayEvaluationBatch(batchInput);

    expect(runReplayEvaluationBatch(batchInput)).toEqual(first);
    expect(batchInput).toEqual(inputBefore);
    expect(first.sourceReviews.map((review) => review.reviewId)).toEqual(["review-1", "review-2"]);
    expect(first.progress).toMatchObject({
      status: "in_progress",
      processedReviewCount: 2,
      totalReviewCount: 3,
      batchSize: 2,
      startCursor: null,
    });
    expect(first.progress.nextCursor).toMatch(/^replay\.v1\./);
    expect(first.releaseMetrics).toMatchObject({
      allGatesPassed: false,
      releaseRecommendation: "pending",
      humanApprovalRequired: true,
    });
    expect(replayEvaluationResultSchema.parse(first)).toEqual(first);

    const completed = runReplayEvaluationBatch({
      ...batchInput,
      resumeCursor: first.progress.nextCursor,
    });
    expect(completed.sourceReviews.map((review) => review.reviewId)).toEqual(["review-3"]);
    expect(completed.progress).toMatchObject({
      status: "completed",
      processedReviewCount: 3,
      totalReviewCount: 3,
      nextCursor: null,
    });
    expect(completed.calibrationMetrics.retentionPredictionMae).toBeCloseTo(0.02, 12);
    expect(completed.releaseMetrics.releaseRecommendation).toBe("eligible_for_human_approval");
  });

  it("rejects malformed, stale, mismatched, and out-of-range cursors", () => {
    const first = runReplayEvaluationBatch(batchInput);
    const cursor = first.progress.nextCursor;

    expect(() => runReplayEvaluationBatch({ ...batchInput, resumeCursor: "not-a-cursor" })).toThrow(
      /cursor/i,
    );
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        evaluationId: "evaluation-2",
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*evaluation/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        configHash: "c".repeat(64),
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*config/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        replayInputHash: "d".repeat(64),
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*replay/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        replayCorpusId: "fixture-corpus.v2",
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*corpus/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        candidateEngineVersion: "engine.candidate.v2",
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*candidate engine/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        seed: 72,
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*seed/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        reviews: reviews.slice(0, 2),
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*source reviews|cursor.*offset/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        reviews: reviews.map((review, index) =>
          index === 1 ? { ...review, paramsVersion: "fsrs.fixture.changed" } : review,
        ),
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*source reviews/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        placementComparisons: [
          ...reportInputs.placementComparisons,
          { estimatedMastery: 0.5, firstThreeAttemptMastery: 0.5 },
        ],
        resumeCursor: cursor,
      }),
    ).toThrow(/cursor.*evaluation inputs/i);
  });

  it("rejects missing attribution, duplicate IDs, and non-canonical review order", () => {
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        reviews: [{ ...reviews[0], paramsVersion: "" }],
        batchSize: 1,
      }),
    ).toThrow(/paramsVersion/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        reviews: [{ ...reviews[0], paramsVersion: "   " }],
        batchSize: 1,
      }),
    ).toThrow(/paramsVersion/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        reviews: [reviews[0], { ...reviews[1], reviewId: reviews[0].reviewId }],
      }),
    ).toThrow(/reviewId.*unique/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        reviews: [reviews[1], reviews[0]],
      }),
    ).toThrow(/order/i);
  });

  it("rejects ambiguous release identity and timestamps preceding processed reviews", () => {
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        candidateParamsVersion: batchInput.incumbentParamsVersion,
      }),
    ).toThrow(/must differ/i);
    expect(() =>
      runReplayEvaluationBatch({
        ...batchInput,
        generatedAt: "2026-07-09T23:59:00.000Z",
      }),
    ).toThrow(/generatedAt.*predate/i);
  });
});
