import {
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from "@math-platform/practice-core";

export const PRECALCULUS_PILOT_NODE_ID =
  "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs" as const;

export const PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID =
  "math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context" as const;

export const PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID =
  `${PRECALCULUS_PILOT_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY =
  "precalculus-topic-1-1-daily-curriculum" as const;

export const PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID}.worked_example` as const;
export const PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_12_NODE_ID =
  "math.precalc.skill.1.2.compare-rates-of-change-across-intervals" as const;
export const PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID =
  "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change" as const;
export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID =
  "math.precalc.skill.1.2.model-negative-rate-contexts" as const;
export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID =
  "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics" as const;
export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID =
  "math.precalc.skill.1.3.classify-linear-vs-quadratic-from-rate-patterns" as const;
export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID =
  "math.precalc.skill.1.3.determine-concavity-from-rate-of-change" as const;
export const PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID =
  "math.precalc.skill.1.4.identify-polynomial-degree-and-leading-coefficient" as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID =
  "math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs" as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID =
  "math.precalc.skill.1.4.describe-rate-of-change-behavior-on-intervals" as const;
export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID =
  "math.precalc.skill.1.4.determine-end-behavior-from-leading-term" as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID =
  "math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form" as const;
export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID =
  "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs" as const;
export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID =
  "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts" as const;
export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID =
  "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations" as const;
export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID =
  "math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs" as const;
export const PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID =
  "math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs" as const;
export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID}.independent_practice` as const;
export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID}.worked_example` as const;
export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID}.guided_practice` as const;
export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID =
  `${PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID}.independent_practice` as const;

export const PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS = Object.freeze([
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
  PRECALCULUS_TOPIC_12_NODE_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
] as const);

export interface PrecalculusLearningEvidenceHistoryOptions {
  activityId: string;
  origin: LearningEvidenceV1["origin"];
  occurredAt: string;
}

export interface PrecalculusLearningEvidenceStore {
  findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null>;
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
    options: PrecalculusLearningEvidenceHistoryOptions,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(learnerId: string, evidence: LearningEvidenceV1, submissionId?: string): Promise<void>;
}

export type PrecalculusMasteryAdvantageBridge = (input: {
  learnerId: string;
  evidence: LearningEvidenceV1;
}) => Promise<void>;

export interface PrecalculusLearningEvidenceProcessInput {
  learnerId: string;
  evidence: LearningEvidenceV1;
}

export type PrecalculusLearningEvidenceDecision = ReturnType<typeof evaluateLearningEvidenceV1>;

export interface PrecalculusLearningEvidenceProcessResult {
  persisted: boolean;
  masteryApplied: boolean;
  decision: PrecalculusLearningEvidenceDecision;
}

export interface PrecalculusLearningEvidenceRuntime {
  process(
    input: PrecalculusLearningEvidenceProcessInput,
  ): Promise<PrecalculusLearningEvidenceProcessResult>;
}

interface PrecalculusLearningEvidenceRuntimeOptions {
  store: PrecalculusLearningEvidenceStore;
  masteryBridge: PrecalculusMasteryAdvantageBridge;
}

function appendIfMissing(
  acceptedEvidence: readonly LearningEvidenceV1[],
  existingEvidence: LearningEvidenceV1 | null,
): readonly LearningEvidenceV1[] {
  if (!existingEvidence) return acceptedEvidence;
  if (acceptedEvidence.some((item) => item.idempotencyKey === existingEvidence.idempotencyKey)) {
    return acceptedEvidence;
  }
  return [...acceptedEvidence, existingEvidence];
}

export function createPrecalculusLearningEvidenceRuntime({
  store,
  masteryBridge,
}: PrecalculusLearningEvidenceRuntimeOptions): PrecalculusLearningEvidenceRuntime {
  return {
    process: async ({ learnerId, evidence }) => {
      if (typeof learnerId !== "string" || learnerId.trim().length === 0) {
        throw new TypeError("learnerId must be a non-empty authenticated identity");
      }

      const canonicalEvidence = normalizeLearningEvidenceV1(evidence);
      const [existingEvidence, acceptedByNode] = await Promise.all([
        store.findByIdempotencyKey(learnerId, canonicalEvidence.idempotencyKey),
        store.listByLearnerAndNode(learnerId, canonicalEvidence.nodeId, {
          activityId: canonicalEvidence.activityId,
          origin: canonicalEvidence.origin,
          occurredAt: canonicalEvidence.occurredAt,
        }),
      ]);
      const acceptedEvidence = appendIfMissing(acceptedByNode, existingEvidence);
      const decision = evaluateLearningEvidenceV1({
        evidence: canonicalEvidence,
        acceptedEvidence,
        enabledNodeIds: PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
      });

      if (
        decision.idempotency !== "new" ||
        (decision.reason !== "teacher_led" &&
          decision.reason !== "eligible" &&
          decision.reason !== "ungraded_evidence")
      ) {
        return {
          persisted: false,
          masteryApplied: false,
          decision,
        };
      }

      if (decision.masteryBearing) {
        await masteryBridge({ learnerId, evidence: canonicalEvidence });
      }

      await store.append(learnerId, canonicalEvidence);
      return {
        persisted: true,
        masteryApplied: decision.masteryBearing,
        decision,
      };
    },
  };
}
