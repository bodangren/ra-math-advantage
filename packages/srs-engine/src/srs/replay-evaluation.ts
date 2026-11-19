import {
  EVALUATION_CONTRACT_VERSION,
  MAX_DETERMINISTIC_SEED,
  MAX_REPLAY_BATCH_SIZE,
  SYNTHETIC_INVARIANT_NAMES,
  recommendationEvaluationMetricsSchema,
  replayCalibrationMetricsSchema,
  replayEvaluationResultSchema,
  replayReleaseMetricsSchema,
  sourceReviewAttributionSchema,
  syntheticInvariantMetricSchema,
} from "./evaluation-contract";
import type {
  RecommendationEvaluationMetrics,
  ReplayCalibrationMetrics,
  ReplayEvaluationResultV31,
  ReplayReleaseMetrics,
  SourceReviewAttribution,
  SyntheticInvariantMetric,
} from "./evaluation-contract";

export type PlacementComparison = {
  estimatedMastery: number;
  firstThreeAttemptMastery: number;
};

export type FringeObservation = {
  studentId: string;
  weekId: string;
  masteryStateFlaps: number;
};

export type EdgeCalibrationObservation = {
  predictedNecessity: number;
  observedNecessary: boolean;
};

export type ReplayMetricInput = {
  reviews: ReadonlyArray<SourceReviewAttribution>;
  placementComparisons: ReadonlyArray<PlacementComparison>;
  fringeObservations: ReadonlyArray<FringeObservation>;
  edgeCalibrationObservations: ReadonlyArray<EdgeCalibrationObservation>;
};

export type ReplayMetricResult = {
  calibrationMetrics: ReplayCalibrationMetrics;
  recommendationMetrics: RecommendationEvaluationMetrics;
};

export type ReplayReleaseGateInput = ReplayMetricResult & {
  invariantMetrics: ReadonlyArray<SyntheticInvariantMetric>;
  incumbentMetrics: {
    retentionPredictionMae: number;
    fringeStabilityFlapsPerStudentWeek: number;
  };
};

export type ReplayEvaluationBatchInput = ReplayMetricInput & {
  contractVersion: typeof EVALUATION_CONTRACT_VERSION;
  evaluationId: string;
  candidateEngineVersion: string;
  candidateParamsVersion: string;
  incumbentParamsVersion: string;
  replayCorpusId: string;
  seed: number;
  configHash: string;
  replayInputHash: string;
  invariantMetrics: ReadonlyArray<SyntheticInvariantMetric>;
  incumbentMetrics: ReplayReleaseGateInput["incumbentMetrics"];
  batchSize: number;
  resumeCursor: string | null;
  generatedAt: string;
};

type CalibrationAccumulator = {
  sampleCount: number;
  absoluteErrorSum: number;
  bins: Array<{
    sampleCount: number;
    predictedRetentionSum: number;
    observedRecallCount: number;
  }>;
};

type ReplayCursorPayload = {
  version: "replay.cursor.v1";
  evaluationId: string;
  seed: number;
  candidateEngineVersion: string;
  candidateParamsVersion: string;
  incumbentParamsVersion: string;
  replayCorpusId: string;
  configHash: string;
  replayInputHash: string;
  sourceReviewsHash: string;
  evaluationInputsHash: string;
  totalReviewCount: number;
  offset: number;
};

const SHA_256_PATTERN = /^[a-f0-9]{64}$/;
const CURSOR_PREFIX = "replay.v1";
const PLACEMENT_AGREEMENT_TOLERANCE = 0.25;

function assertFiniteProbability(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${field} must be finite and within [0, 1]`);
  }
}

function assertNonBlankUnpadded(value: string, field: string): void {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    throw new TypeError(`${field} must be a non-empty, whitespace-free value`);
  }
}

function parseReviews(source: ReadonlyArray<SourceReviewAttribution>): SourceReviewAttribution[] {
  if (!Array.isArray(source)) throw new TypeError("reviews must be an array");

  const reviews = source.map((review, index) => {
    if (review === null || typeof review !== "object") {
      throw new TypeError(`reviews[${index}] must be an object`);
    }
    assertNonBlankUnpadded(review.reviewId, `reviews[${index}].reviewId`);
    assertNonBlankUnpadded(review.cardId, `reviews[${index}].cardId`);
    assertNonBlankUnpadded(review.paramsVersion, `reviews[${index}].paramsVersion`);
    return sourceReviewAttributionSchema.parse(review);
  });
  const reviewIds = new Set<string>();
  for (let index = 0; index < reviews.length; index += 1) {
    const review = reviews[index];
    if (reviewIds.has(review.reviewId)) {
      throw new TypeError("reviewId must be unique across the replay corpus");
    }
    reviewIds.add(review.reviewId);

    if (index > 0) {
      const previous = reviews[index - 1];
      const reviewTime = Date.parse(review.reviewedAt);
      const previousTime = Date.parse(previous.reviewedAt);
      const outOfOrder =
        reviewTime < previousTime ||
        (reviewTime === previousTime && review.reviewId.localeCompare(previous.reviewId) <= 0);
      if (outOfOrder) {
        throw new TypeError("source reviews must be in canonical reviewedAt/reviewId order");
      }
    }
  }
  return reviews;
}

function validatePlacementComparisons(
  comparisons: ReadonlyArray<PlacementComparison>,
): PlacementComparison[] {
  if (!Array.isArray(comparisons)) {
    throw new TypeError("placementComparisons must be an array");
  }
  return comparisons.map((comparison, index) => {
    if (comparison === null || typeof comparison !== "object") {
      throw new TypeError(`placementComparisons[${index}] must be an object`);
    }
    assertFiniteProbability(
      comparison.estimatedMastery,
      `placementComparisons[${index}].estimatedMastery`,
    );
    assertFiniteProbability(
      comparison.firstThreeAttemptMastery,
      `placementComparisons[${index}].firstThreeAttemptMastery`,
    );
    return { ...comparison };
  });
}

function validateFringeObservations(
  observations: ReadonlyArray<FringeObservation>,
): FringeObservation[] {
  if (!Array.isArray(observations)) {
    throw new TypeError("fringeObservations must be an array");
  }
  const studentWeeks = new Set<string>();
  return observations.map((observation, index) => {
    if (observation === null || typeof observation !== "object") {
      throw new TypeError(`fringeObservations[${index}] must be an object`);
    }
    assertNonBlankUnpadded(observation.studentId, `fringeObservations[${index}].studentId`);
    assertNonBlankUnpadded(observation.weekId, `fringeObservations[${index}].weekId`);
    if (!Number.isInteger(observation.masteryStateFlaps) || observation.masteryStateFlaps < 0) {
      throw new RangeError(`fringeObservations[${index}].masteryStateFlaps must be nonnegative`);
    }
    const key = `${observation.studentId}\u0000${observation.weekId}`;
    if (studentWeeks.has(key)) {
      throw new TypeError("fringe observations must be unique per student-week");
    }
    studentWeeks.add(key);
    return { ...observation };
  });
}

function validateEdgeCalibrationObservations(
  observations: ReadonlyArray<EdgeCalibrationObservation>,
): EdgeCalibrationObservation[] {
  if (!Array.isArray(observations)) {
    throw new TypeError("edgeCalibrationObservations must be an array");
  }
  return observations.map((observation, index) => {
    if (observation === null || typeof observation !== "object") {
      throw new TypeError(`edgeCalibrationObservations[${index}] must be an object`);
    }
    assertFiniteProbability(
      observation.predictedNecessity,
      `edgeCalibrationObservations[${index}].predictedNecessity`,
    );
    if (typeof observation.observedNecessary !== "boolean") {
      throw new TypeError(
        `edgeCalibrationObservations[${index}].observedNecessary must be boolean`,
      );
    }
    return { ...observation };
  });
}

function emptyCalibrationAccumulator(): CalibrationAccumulator {
  return {
    sampleCount: 0,
    absoluteErrorSum: 0,
    bins: Array.from({ length: 10 }, () => ({
      sampleCount: 0,
      predictedRetentionSum: 0,
      observedRecallCount: 0,
    })),
  };
}

function appendReviews(
  initial: CalibrationAccumulator,
  reviews: ReadonlyArray<SourceReviewAttribution>,
): CalibrationAccumulator {
  const accumulator = {
    sampleCount: initial.sampleCount,
    absoluteErrorSum: initial.absoluteErrorSum,
    bins: initial.bins.map((bin) => ({ ...bin })),
  };
  for (const review of reviews) {
    const observed = review.observedRecall ? 1 : 0;
    const binIndex = Math.min(9, Math.floor(review.predictedRetention * 10));
    accumulator.sampleCount += 1;
    accumulator.absoluteErrorSum += Math.abs(review.predictedRetention - observed);
    accumulator.bins[binIndex].sampleCount += 1;
    accumulator.bins[binIndex].predictedRetentionSum += review.predictedRetention;
    accumulator.bins[binIndex].observedRecallCount += observed;
  }
  return accumulator;
}

function calibrationMetricsFromAccumulator(
  accumulator: CalibrationAccumulator,
): ReplayCalibrationMetrics {
  const bins = accumulator.bins.map((bin, index) => ({
    binIndex: index,
    lowerBound: index / 10,
    upperBound: (index + 1) / 10,
    sampleCount: bin.sampleCount,
    meanPredictedRetention:
      bin.sampleCount === 0 ? null : bin.predictedRetentionSum / bin.sampleCount,
    observedRecallRate: bin.sampleCount === 0 ? null : bin.observedRecallCount / bin.sampleCount,
  }));
  const populatedErrors = bins.flatMap((bin) =>
    bin.meanPredictedRetention === null || bin.observedRecallRate === null
      ? []
      : [Math.abs(bin.meanPredictedRetention - bin.observedRecallRate)],
  );
  return replayCalibrationMetricsSchema.parse({
    retentionPredictionMae:
      accumulator.sampleCount === 0 ? 0 : accumulator.absoluteErrorSum / accumulator.sampleCount,
    bins,
    maxAbsoluteError: populatedErrors.length === 0 ? 0 : Math.max(...populatedErrors),
  });
}

function computeRecommendationMetrics(
  placementComparisons: ReadonlyArray<PlacementComparison>,
  fringeObservations: ReadonlyArray<FringeObservation>,
  edgeCalibrationObservations: ReadonlyArray<EdgeCalibrationObservation>,
): RecommendationEvaluationMetrics {
  const placementMatches = placementComparisons.filter(
    (comparison) =>
      Math.abs(comparison.estimatedMastery - comparison.firstThreeAttemptMastery) <=
      PLACEMENT_AGREEMENT_TOLERANCE + 1e-12,
  ).length;
  const fringeTotal = fringeObservations.reduce(
    (sum, observation) => sum + observation.masteryStateFlaps,
    0,
  );
  const edgeBrierTotal = edgeCalibrationObservations.reduce((sum, observation) => {
    const observed = observation.observedNecessary ? 1 : 0;
    return sum + (observation.predictedNecessity - observed) ** 2;
  }, 0);

  return recommendationEvaluationMetricsSchema.parse({
    placementAccuracy:
      placementComparisons.length === 0 ? null : placementMatches / placementComparisons.length,
    placementSampleCount: placementComparisons.length,
    fringeStabilityFlapsPerStudentWeek:
      fringeObservations.length === 0 ? 0 : fringeTotal / fringeObservations.length,
    fringeStudentWeekCount: fringeObservations.length,
    edgeCalibrationBrierScore:
      edgeCalibrationObservations.length === 0
        ? null
        : edgeBrierTotal / edgeCalibrationObservations.length,
    edgeCalibrationSampleCount: edgeCalibrationObservations.length,
  });
}

/** Compute deterministic replay calibration and report-only recommendation metrics. */
export function computeReplayMetrics(input: ReplayMetricInput): ReplayMetricResult {
  if (input === null || typeof input !== "object") {
    throw new TypeError("replay metric input must be an object");
  }
  const reviews = parseReviews(input.reviews);
  const placementComparisons = validatePlacementComparisons(input.placementComparisons);
  const fringeObservations = validateFringeObservations(input.fringeObservations);
  const edgeObservations = validateEdgeCalibrationObservations(input.edgeCalibrationObservations);
  return {
    calibrationMetrics: calibrationMetricsFromAccumulator(
      appendReviews(emptyCalibrationAccumulator(), reviews),
    ),
    recommendationMetrics: computeRecommendationMetrics(
      placementComparisons,
      fringeObservations,
      edgeObservations,
    ),
  };
}

function parseInvariantMetrics(
  source: ReadonlyArray<SyntheticInvariantMetric>,
): SyntheticInvariantMetric[] {
  if (!Array.isArray(source) || source.length !== SYNTHETIC_INVARIANT_NAMES.length) {
    throw new TypeError("invariant metrics must contain all five canonical invariants");
  }
  const metrics = source.map((metric) => syntheticInvariantMetricSchema.parse(metric));
  metrics.forEach((metric, index) => {
    if (metric.name !== SYNTHETIC_INVARIANT_NAMES[index]) {
      throw new TypeError("invariant metrics must be in canonical order");
    }
    if (metric.checkedCount === 0) {
      throw new TypeError(`invariant ${metric.name} requires non-empty evidence`);
    }
  });
  return metrics;
}

/** Evaluate the three normative replay gates without applying a release. */
export function evaluateReplayReleaseGates(input: ReplayReleaseGateInput): ReplayReleaseMetrics {
  if (input === null || typeof input !== "object") {
    throw new TypeError("replay release input must be an object");
  }
  const invariantMetrics = parseInvariantMetrics(input.invariantMetrics);
  const calibrationMetrics = replayCalibrationMetricsSchema.parse(input.calibrationMetrics);
  const recommendationMetrics = recommendationEvaluationMetricsSchema.parse(
    input.recommendationMetrics,
  );
  assertFiniteProbability(
    input.incumbentMetrics.retentionPredictionMae,
    "incumbentMetrics.retentionPredictionMae",
  );
  const incumbentFringe = input.incumbentMetrics.fringeStabilityFlapsPerStudentWeek;
  if (!Number.isFinite(incumbentFringe) || incumbentFringe < 0) {
    throw new RangeError(
      "incumbentMetrics.fringeStabilityFlapsPerStudentWeek must be finite and nonnegative",
    );
  }

  const retentionMaximum = input.incumbentMetrics.retentionPredictionMae + 0.02;
  const fringeMaximum = incumbentFringe * 1.1;
  const invariantsPassed = invariantMetrics.every((metric) => metric.passed);
  const retentionPassed = calibrationMetrics.retentionPredictionMae <= retentionMaximum;
  const calibrationPassed = calibrationMetrics.maxAbsoluteError <= 0.1;
  const fringePassed = recommendationMetrics.fringeStabilityFlapsPerStudentWeek <= fringeMaximum;
  const hasRequiredEvidence =
    calibrationMetrics.bins.some((bin) => bin.sampleCount > 0) &&
    recommendationMetrics.fringeStudentWeekCount > 0;
  const allGatesPassed =
    invariantsPassed && hasRequiredEvidence && retentionPassed && calibrationPassed && fringePassed;

  return replayReleaseMetricsSchema.parse({
    invariantsPassed,
    retentionPredictionMae: {
      candidateValue: calibrationMetrics.retentionPredictionMae,
      incumbentValue: input.incumbentMetrics.retentionPredictionMae,
      maximumAllowed: retentionMaximum,
      thresholdRule: "incumbent_plus_0.02",
      passed: retentionPassed,
    },
    calibrationMaxAbsoluteError: {
      candidateValue: calibrationMetrics.maxAbsoluteError,
      incumbentValue: null,
      maximumAllowed: 0.1,
      thresholdRule: "fixed_0.10",
      passed: calibrationPassed,
    },
    fringeStability: {
      candidateValue: recommendationMetrics.fringeStabilityFlapsPerStudentWeek,
      incumbentValue: incumbentFringe,
      maximumAllowed: fringeMaximum,
      thresholdRule: "incumbent_times_1.10",
      passed: fringePassed,
    },
    allGatesPassed,
    releaseRecommendation: allGatesPassed ? "eligible_for_human_approval" : "rejected",
    humanApprovalRequired: true,
  });
}

function checksum(value: string): string {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ code, 0x85ebca6b) >>> 0;
  }
  return first.toString(16).padStart(8, "0") + second.toString(16).padStart(8, "0");
}

function hashSourceReviews(reviews: ReadonlyArray<SourceReviewAttribution>): string {
  return checksum(JSON.stringify(reviews));
}

function encodeCursor(payload: ReplayCursorPayload): string {
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `${CURSOR_PREFIX}.${encoded}.${checksum(encoded)}`;
}

function decodeCursor(cursor: string): ReplayCursorPayload {
  if (typeof cursor !== "string") throw new TypeError("replay cursor must be a string");
  const match = /^replay\.v1\.(.+)\.([a-f0-9]{16})$/.exec(cursor);
  if (match === null || checksum(match[1]) !== match[2]) {
    throw new TypeError("malformed replay cursor");
  }
  let value: unknown;
  try {
    value = JSON.parse(decodeURIComponent(match[1]));
  } catch {
    throw new TypeError("malformed replay cursor");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("malformed replay cursor");
  }
  const payload = value as Partial<ReplayCursorPayload>;
  if (
    payload.version !== "replay.cursor.v1" ||
    !Number.isInteger(payload.offset) ||
    !Number.isInteger(payload.totalReviewCount)
  ) {
    throw new TypeError("malformed replay cursor");
  }
  return payload as ReplayCursorPayload;
}

function validateBatchIdentity(input: ReplayEvaluationBatchInput): void {
  const stringFields = [
    ["evaluationId", input.evaluationId],
    ["candidateEngineVersion", input.candidateEngineVersion],
    ["candidateParamsVersion", input.candidateParamsVersion],
    ["incumbentParamsVersion", input.incumbentParamsVersion],
    ["replayCorpusId", input.replayCorpusId],
  ] as const;
  for (const [field, value] of stringFields) assertNonBlankUnpadded(value, field);
  if (input.candidateParamsVersion === input.incumbentParamsVersion) {
    throw new TypeError("candidateParamsVersion must differ from incumbentParamsVersion");
  }
  if (input.contractVersion !== EVALUATION_CONTRACT_VERSION) {
    throw new TypeError(`contractVersion must be ${EVALUATION_CONTRACT_VERSION}`);
  }
  if (!Number.isInteger(input.seed) || input.seed < 0 || input.seed > MAX_DETERMINISTIC_SEED) {
    throw new RangeError("seed is outside the deterministic seed range");
  }
  if (!SHA_256_PATTERN.test(input.configHash)) {
    throw new TypeError("configHash must be a lowercase SHA-256 digest");
  }
  if (!SHA_256_PATTERN.test(input.replayInputHash)) {
    throw new TypeError("replayInputHash must be a lowercase SHA-256 digest");
  }
  if (
    !Number.isInteger(input.batchSize) ||
    input.batchSize < 1 ||
    input.batchSize > MAX_REPLAY_BATCH_SIZE
  ) {
    throw new RangeError(`batchSize must be between 1 and ${MAX_REPLAY_BATCH_SIZE}`);
  }
  if (!Number.isFinite(Date.parse(input.generatedAt))) {
    throw new TypeError("generatedAt must be a valid datetime");
  }
}

function validateCursorIdentity(
  cursor: ReplayCursorPayload,
  input: ReplayEvaluationBatchInput,
  sourceReviewsHash: string,
  evaluationInputsHash: string,
  reviewCount: number,
): void {
  const identityFields = [
    ["evaluation", cursor.evaluationId, input.evaluationId],
    ["seed", cursor.seed, input.seed],
    ["candidate engine", cursor.candidateEngineVersion, input.candidateEngineVersion],
    ["candidate params", cursor.candidateParamsVersion, input.candidateParamsVersion],
    ["incumbent params", cursor.incumbentParamsVersion, input.incumbentParamsVersion],
    ["corpus", cursor.replayCorpusId, input.replayCorpusId],
    ["config", cursor.configHash, input.configHash],
    ["replay input", cursor.replayInputHash, input.replayInputHash],
    ["source reviews", cursor.sourceReviewsHash, sourceReviewsHash],
    ["evaluation inputs", cursor.evaluationInputsHash, evaluationInputsHash],
  ] as const;
  for (const [label, actual, expected] of identityFields) {
    if (actual !== expected) throw new TypeError(`replay cursor ${label} mismatch`);
  }
  if (cursor.totalReviewCount !== reviewCount) {
    throw new TypeError("replay cursor source reviews count mismatch");
  }
  if (cursor.offset <= 0 || cursor.offset >= reviewCount) {
    throw new RangeError("replay cursor offset is outside the resumable range");
  }
}

/** Process one bounded, resumable replay batch and return a versioned artifact. */
export function runReplayEvaluationBatch(
  input: ReplayEvaluationBatchInput,
): ReplayEvaluationResultV31 {
  if (input === null || typeof input !== "object") {
    throw new TypeError("replay batch input must be an object");
  }
  validateBatchIdentity(input);
  const reviews = parseReviews(input.reviews);
  if (reviews.length === 0) throw new TypeError("replay requires non-empty source reviews");
  const placementComparisons = validatePlacementComparisons(input.placementComparisons);
  const fringeObservations = validateFringeObservations(input.fringeObservations);
  const edgeObservations = validateEdgeCalibrationObservations(input.edgeCalibrationObservations);
  const invariantMetrics = parseInvariantMetrics(input.invariantMetrics);
  // Validate release baselines before any replay math is performed.
  assertFiniteProbability(
    input.incumbentMetrics.retentionPredictionMae,
    "incumbentMetrics.retentionPredictionMae",
  );
  if (
    !Number.isFinite(input.incumbentMetrics.fringeStabilityFlapsPerStudentWeek) ||
    input.incumbentMetrics.fringeStabilityFlapsPerStudentWeek < 0
  ) {
    throw new RangeError("incumbent fringe stability must be finite and nonnegative");
  }

  const sourceReviewsHash = hashSourceReviews(reviews);
  const evaluationInputsHash = checksum(
    JSON.stringify({
      placementComparisons,
      fringeObservations,
      edgeObservations,
      invariantMetrics,
      incumbentMetrics: input.incumbentMetrics,
    }),
  );
  const cursor = input.resumeCursor === null ? null : decodeCursor(input.resumeCursor);
  if (cursor !== null) {
    validateCursorIdentity(cursor, input, sourceReviewsHash, evaluationInputsHash, reviews.length);
  }
  const startOffset = cursor?.offset ?? 0;
  const endOffset = Math.min(reviews.length, startOffset + input.batchSize);
  const batchReviews = reviews.slice(startOffset, endOffset);
  const processedReviews = reviews.slice(0, endOffset);
  const latestProcessedReviewTime = Math.max(
    ...processedReviews.map((review) => Date.parse(review.reviewedAt)),
  );
  if (Date.parse(input.generatedAt) < latestProcessedReviewTime) {
    throw new RangeError("generatedAt cannot predate a processed source review");
  }
  const accumulator = appendReviews(emptyCalibrationAccumulator(), processedReviews);
  const calibrationMetrics = calibrationMetricsFromAccumulator(accumulator);
  const recommendationMetrics = computeRecommendationMetrics(
    placementComparisons,
    fringeObservations,
    edgeObservations,
  );
  const completed = endOffset === reviews.length;
  const evaluatedReleaseMetrics = evaluateReplayReleaseGates({
    invariantMetrics,
    calibrationMetrics,
    recommendationMetrics,
    incumbentMetrics: input.incumbentMetrics,
  });
  const releaseMetrics = completed
    ? evaluatedReleaseMetrics
    : replayReleaseMetricsSchema.parse({
        ...evaluatedReleaseMetrics,
        allGatesPassed: false,
        releaseRecommendation: "pending",
      });
  const nextCursor = completed
    ? null
    : encodeCursor({
        version: "replay.cursor.v1",
        evaluationId: input.evaluationId,
        seed: input.seed,
        candidateEngineVersion: input.candidateEngineVersion,
        candidateParamsVersion: input.candidateParamsVersion,
        incumbentParamsVersion: input.incumbentParamsVersion,
        replayCorpusId: input.replayCorpusId,
        configHash: input.configHash,
        replayInputHash: input.replayInputHash,
        sourceReviewsHash,
        evaluationInputsHash,
        totalReviewCount: reviews.length,
        offset: endOffset,
      });

  return replayEvaluationResultSchema.parse({
    contractVersion: EVALUATION_CONTRACT_VERSION,
    evaluationId: input.evaluationId,
    candidateEngineVersion: input.candidateEngineVersion,
    candidateParamsVersion: input.candidateParamsVersion,
    incumbentParamsVersion: input.incumbentParamsVersion,
    replayCorpusId: input.replayCorpusId,
    seed: input.seed,
    configHash: input.configHash,
    replayInputHash: input.replayInputHash,
    progress: {
      status: completed ? "completed" : "in_progress",
      processedReviewCount: endOffset,
      totalReviewCount: reviews.length,
      batchSize: input.batchSize,
      startCursor: input.resumeCursor,
      nextCursor,
    },
    sourceReviews: batchReviews,
    invariantMetrics,
    calibrationMetrics,
    recommendationMetrics,
    releaseMetrics,
    generatedAt: input.generatedAt,
  });
}
