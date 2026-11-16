import {
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceDecisionV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';

/** The single IM3 node enabled by the teacher-first pilot. */
export const IM3_PILOT_NODE =
  'math.im3.skill.1.1.graph-quadratic-functions' as const;

/** Atomic IM3 Example 4 equation-rate skill. */
export const IM3_EQUATION_RATE_NODE =
  'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation' as const;
export const IM3_EQUATION_RATE_WORKED_ACTIVITY_ID = `${IM3_EQUATION_RATE_NODE}.worked_example` as const;
export const IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID = `${IM3_EQUATION_RATE_NODE}.guided_practice` as const;
export const IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID = `${IM3_EQUATION_RATE_NODE}.independent_practice` as const;

/** Atomic IM3 Example 1 domain-and-range skill. */
export const IM3_DOMAIN_RANGE_NODE =
  'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph' as const;
export const IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE}.worked_example` as const;
export const IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE}.guided_practice` as const;
export const IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID =
  `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}:seed-2` as const;
export const IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY =
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID;
export const IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE}.independent_practice` as const;
export const IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID =
  `${IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID}:seed-2` as const;
export const IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY =
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID;

/** Atomic IM3 Example 2 maximum-reading skill. */
export const IM3_MAXIMUM_READING_NODE =
  'math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph' as const;
export const IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID = `${IM3_MAXIMUM_READING_NODE}.worked_example` as const;
export const IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID = `${IM3_MAXIMUM_READING_NODE}.guided_practice` as const;
export const IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID = `${IM3_MAXIMUM_READING_NODE}.independent_practice` as const;

/** Atomic IM3 Example 2 symmetry graph skill. */
export const IM3_SYMMETRY_NODE =
  'math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry' as const;
export const IM3_SYMMETRY_WORKED_ACTIVITY_ID = `${IM3_SYMMETRY_NODE}.worked_example` as const;
export const IM3_SYMMETRY_GUIDED_ACTIVITY_ID = `${IM3_SYMMETRY_NODE}.guided_practice` as const;
export const IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID = `${IM3_SYMMETRY_NODE}.independent_practice` as const;

/** Atomic IM3 Lesson 1.2 one-real-solution skill. */
export const IM3_ONE_REAL_SOLUTION_NODE =
  'math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing' as const;
export const IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID = `${IM3_ONE_REAL_SOLUTION_NODE}.worked_example` as const;
export const IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID = `${IM3_ONE_REAL_SOLUTION_NODE}.guided_practice` as const;
export const IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID = `${IM3_ONE_REAL_SOLUTION_NODE}.independent_practice` as const;

export const IM3_TWO_REAL_SOLUTIONS_NODE =
  'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing' as const;
export const IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID = `${IM3_TWO_REAL_SOLUTIONS_NODE}.worked_example` as const;
export const IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID = `${IM3_TWO_REAL_SOLUTIONS_NODE}.guided_practice` as const;
export const IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID = `${IM3_TWO_REAL_SOLUTIONS_NODE}.independent_practice` as const;

/** Atomic IM3 Example 2 compare-maximum skill. */
export const IM3_COMPARE_MAXIMUM_NODE =
  'math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions' as const;
export const IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID = `${IM3_COMPARE_MAXIMUM_NODE}.worked_example` as const;
export const IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID = `${IM3_COMPARE_MAXIMUM_NODE}.guided_practice` as const;
export const IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID = `${IM3_COMPARE_MAXIMUM_NODE}.independent_practice` as const;

/** Identity constants for the not-yet-enabled IM3 profit-model path. */
export const IM3_PROFIT_MODEL_NODE =
  'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context' as const;
export const IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID = `${IM3_PROFIT_MODEL_NODE}.guided_practice` as const;
export const IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID = `${IM3_PROFIT_MODEL_NODE}.worked_example` as const;
export const IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID = `${IM3_PROFIT_MODEL_NODE}.independent_practice` as const;
export const IM3_PROFIT_MAXIMUM_NODE =
  'math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model' as const;
export const IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID = `${IM3_PROFIT_MAXIMUM_NODE}.worked_example` as const;
export const IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID = `${IM3_PROFIT_MAXIMUM_NODE}.guided_practice` as const;
export const IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID = `${IM3_PROFIT_MAXIMUM_NODE}.independent_practice` as const;

/** Stable activity used to record teacher-led first exposure. */
export const IM3_TEACHER_LED_ACTIVITY_ID = `${IM3_PILOT_NODE}.worked_example` as const;

/** Stable activity used for later graded Mastery Advantage evidence. */
export const IM3_MASTERY_ADVANTAGE_ACTIVITY_ID =
  `${IM3_PILOT_NODE}.independent_practice` as const;

/** Stable activity used for the non-ready Guided graph pilot. */
export const IM3_GUIDED_PRACTICE_ACTIVITY_ID =
  `${IM3_PILOT_NODE}.guided_practice` as const;

/** Stable variant identity for the non-ready Guided graph pilot. */
export const IM3_GUIDED_VARIANT_KEY = IM3_GUIDED_PRACTICE_ACTIVITY_ID;

export const IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID =
  `${IM3_GUIDED_PRACTICE_ACTIVITY_ID}:seed-2` as const;
export const IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY =
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID;

export const IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID =
  `${IM3_MASTERY_ADVANTAGE_ACTIVITY_ID}:seed-2` as const;
export const IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY =
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID;

/** Stable SRS variant identity for the exact pilot activity. */
export const IM3_PILOT_VARIANT_KEY = IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;

export const IM3_LEARNING_EVIDENCE_CONTRACT_VERSION = 'learning-evidence.v1' as const;

/** The IM3 nodes in the bounded learning-evidence pilot allow-list. */
export const IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS = Object.freeze([
  IM3_PILOT_NODE,
  IM3_EQUATION_RATE_NODE,
  IM3_DOMAIN_RANGE_NODE,
  IM3_MAXIMUM_READING_NODE,
  IM3_SYMMETRY_NODE,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_TWO_REAL_SOLUTIONS_NODE,
] as const);

/** Exact source-to-mastery mapping approved for the IM3 pilot. */
export const IM3_LEARNING_EVIDENCE_PILOT = Object.freeze({
  enabledNodeIds: Object.freeze([
    IM3_PILOT_NODE,
    IM3_DOMAIN_RANGE_NODE,
    IM3_MAXIMUM_READING_NODE,
    IM3_SYMMETRY_NODE,
    IM3_COMPARE_MAXIMUM_NODE,
    IM3_PROFIT_MODEL_NODE,
    IM3_PROFIT_MAXIMUM_NODE,
    IM3_ONE_REAL_SOLUTION_NODE,
  ]),
  mappings: Object.freeze([
    {
      nodeId: IM3_PILOT_NODE,
      source: Object.freeze({
        activityId: IM3_TEACHER_LED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_GUIDED_VARIANT_KEY,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_PILOT_VARIANT_KEY,
      }),
    },
    {
      nodeId: IM3_DOMAIN_RANGE_NODE,
      source: Object.freeze({
        activityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      }),
    },
    {
      nodeId: IM3_MAXIMUM_READING_NODE,
      source: Object.freeze({
        activityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      }),
    },
    {
      nodeId: IM3_SYMMETRY_NODE,
      source: Object.freeze({
        activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      }),
    },
    {
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      source: Object.freeze({
        activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      }),
    },
    {
      nodeId: IM3_PROFIT_MODEL_NODE,
      source: Object.freeze({
        activityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      }),
    },
    {
      nodeId: IM3_PROFIT_MAXIMUM_NODE,
      source: Object.freeze({
        activityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      }),
    },
    {
      nodeId: IM3_ONE_REAL_SOLUTION_NODE,
      source: Object.freeze({
        activityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
        mode: 'worked_example' as const,
      }),
      guided: Object.freeze({
        activityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice' as const,
        variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      }),
      masteryAdvantage: Object.freeze({
        activityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice' as const,
        variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      }),
    },
  ]),
});

/** App-owned persistence for accepted learning evidence. */
export interface Im3LearningEvidenceHistoryOptions {
  activityId?: string;
  origin?: LearningEvidenceV1['origin'];
  occurredAt?: string;
}

export interface Im3LearningEvidenceStore {
  findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null>;
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
    options?: Im3LearningEvidenceHistoryOptions,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(
    learnerId: string,
    evidence: LearningEvidenceV1,
    submissionId?: string,
  ): Promise<string | void>;
}

/** The existing IM3 SRS/KST bridge for eligible Mastery Advantage evidence. */
export type Im3MasteryAdvantageBridge = (input: {
  learnerId: string;
  evidence: LearningEvidenceV1;
}) => Promise<void>;

/** Input accepted by the IM3 evidence adapter. */
export interface Im3LearningEvidenceProcessInput {
  readonly learnerId: string;
  readonly evidence: LearningEvidenceV1;
}

/** Observable result of one IM3 evidence delivery. */
export interface Im3LearningEvidenceProcessResult {
  readonly persisted: boolean;
  readonly masteryApplied: boolean;
  readonly decision: LearningEvidenceDecisionV1;
}

export interface Im3LearningEvidenceAdapter {
  process(
    input: Im3LearningEvidenceProcessInput,
  ): Promise<Im3LearningEvidenceProcessResult>;
}

/**
 * Creates the IM3 app adapter for the one-node teacher-first pilot.
 *
 * The adapter stores only normalized contract records. It never writes KST or
 * SRS state directly. The injected bridge owns that existing app path.
 */
export function createIm3LearningEvidenceAdapter({
  store,
  masteryBridge,
}: {
  readonly store: Im3LearningEvidenceStore;
  readonly masteryBridge: Im3MasteryAdvantageBridge;
}): Im3LearningEvidenceAdapter {
  async function processInternal(
    input: Im3LearningEvidenceProcessInput,
  ): Promise<Im3LearningEvidenceProcessResult> {
    const evidence = normalizeLearningEvidenceV1(input.evidence);
    const acceptedByKey = await store.findByIdempotencyKey(
      input.learnerId,
      evidence.idempotencyKey,
    );
    const acceptedEvidence = await store.listByLearnerAndNode(
      input.learnerId,
      evidence.nodeId,
      {
        activityId: evidence.activityId,
        origin: evidence.origin,
        occurredAt: evidence.occurredAt,
      },
    );
    const decision = evaluateLearningEvidenceV1({
      evidence,
      acceptedEvidence: acceptedByKey === null
        ? acceptedEvidence
        : acceptedEvidence.some(
            (accepted) => accepted.idempotencyKey === evidence.idempotencyKey,
          )
          ? acceptedEvidence
          : [...acceptedEvidence, acceptedByKey],
      enabledNodeIds: IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
    });

    if (decision.idempotency !== 'new') {
      return {
        persisted: false,
        masteryApplied: false,
        decision,
      };
    }

    if (decision.reason === 'node_not_enabled'
      || decision.reason === 'awaiting_teacher_exposure') {
      return {
        persisted: false,
        masteryApplied: false,
        decision,
      };
    }

    await store.append(input.learnerId, evidence);

    if (!decision.masteryBearing) {
      return {
        persisted: true,
        masteryApplied: false,
        decision,
      };
    }

    await masteryBridge({ learnerId: input.learnerId, evidence });
    return {
      persisted: true,
      masteryApplied: true,
      decision,
    };
  }

  async function process(
    input: Im3LearningEvidenceProcessInput,
  ): Promise<Im3LearningEvidenceProcessResult> {
    if (input.learnerId.trim().length === 0) {
      throw new TypeError('learnerId must be a non-empty authenticated identity');
    }

    const normalizedEvidence = normalizeLearningEvidenceV1(input.evidence);
    return processInternal({
      ...input,
      evidence: normalizedEvidence,
    });
  }

  return { process };
}
