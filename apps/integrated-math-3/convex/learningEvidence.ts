import {
  createIm3LearningEvidenceAdapter,
  type Im3LearningEvidenceStore,
  type Im3LearningEvidenceAdapter,
  type Im3MasteryAdvantageBridge,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
  IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from '../lib/practice/learning-evidence-pilot';
import {
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceDecisionV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';
import {
  buildPracticeSubmissionEnvelope,
  normalizePracticeValue,
  toConvexActivityId,
} from '@math-platform/practice-core/contract';
import {
  SubmissionSrsAdapter,
} from '@math-platform/srs-engine';
import { ConvexCardStore } from '../lib/srs/convexCardStore';
import { ConvexReviewLogStore } from '../lib/srs/convexReviewLogStore';
import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import { v } from 'convex/values';
import nodesDocument from '../curriculum/skill-graph/nodes.json';
import blueprintsDocument from '../curriculum/skill-graph/blueprints.json';
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3PilotSeedDocuments,
} from './seed/seed_lesson_1_1';

export type { Im3LearningEvidenceStore } from '../lib/practice/learning-evidence-pilot';

export type Im3GraphPilotPublication = {
  nodes: ReadonlyArray<{ id: string; kind?: string; reviewStatus?: string }>;
  blueprints: ReadonlyArray<{ nodeId: string; reviewStatus?: string }>;
};

const currentIm3GraphPilotPublication: Im3GraphPilotPublication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};

export function isIm3GraphPilotPublished(
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
): boolean {
  const node = publication.nodes.find((row) => row.id === IM3_PILOT_NODE);
  const blueprint = publication.blueprints.find((row) => row.nodeId === IM3_PILOT_NODE);
  return node?.kind === 'skill'
    && node.reviewStatus === 'approved'
    && blueprint?.reviewStatus === 'approved';
}

/**
 * Creates the durable IM3 handler bound to one Convex mutation transaction.
 * The evidence write and injected mastery bridge therefore share Convex's
 * atomic transaction boundary when the bridge is also backed by this context.
 */
export function createIm3ConvexLearningEvidenceHandler({
  ctx,
  masteryBridge,
}: {
  readonly ctx: MutationCtx;
  readonly masteryBridge: Im3MasteryAdvantageBridge;
}): Im3LearningEvidenceAdapter {
  return createIm3LearningEvidenceAdapter({
    store: createIm3EvidenceStore(ctx),
    masteryBridge,
  });
}

/** Compatibility name for the existing pure adapter test seam. */
export const createIm3LearningEvidenceHandler = createIm3LearningEvidenceAdapter;

const learningEvidenceDecisionValidator = v.object({
  idempotency: v.union(
    v.literal('new'),
    v.literal('replay'),
    v.literal('conflict'),
  ),
  exposureState: v.union(
    v.literal('awaiting_teacher_exposure'),
    v.literal('introduced'),
  ),
  eligible: v.boolean(),
  reason: v.union(
    v.literal('node_not_enabled'),
    v.literal('idempotency_conflict'),
    v.literal('teacher_led'),
    v.literal('awaiting_teacher_exposure'),
    v.literal('ungraded_evidence'),
    v.literal('eligible'),
  ),
  masteryBearing: v.boolean(),
});

const learningEvidenceResultValidator = v.union(
  v.object({
    persisted: v.boolean(),
    masteryApplied: v.boolean(),
    kstApplied: v.boolean(),
    delivery: v.union(v.literal('new'), v.literal('replay')),
    decision: learningEvidenceDecisionValidator,
  }),
  v.object({
    accepted: v.literal(false),
    reason: v.literal('submission_not_found'),
  }),
  v.object({
    accepted: v.literal(false),
    reason: v.literal('attempt_ordinal_conflict'),
    latestAttemptOrdinal: v.number(),
    receivedAttemptOrdinal: v.number(),
  }),
);

export interface Im3ActivitySubmission {
  submissionId: string;
  userId: string;
  activityId: string;
  activity?: {
    stableActivityId?: string;
    masteryNodeId?: string;
    componentKey?: string;
    srsEligible?: boolean;
    learningEvidenceMode?: 'worked_example';
    props?: Record<string, unknown>;
    gradingConfig?: Record<string, unknown>;
    approval?: { status?: string };
  };
  masteryContractVersion?: string;
  submissionData: {
    contractVersion?: string;
    activityId?: string;
    attemptNumber?: number;
    mode?: LearningEvidenceV1['mode'];
    submittedAt?: string;
    status?: string;
    [key: string]: unknown;
  };
  score?: number;
  maxScore?: number;
  /** Server-assigned ordinal. Never derive this from submissionData. */
  attemptOrdinal?: number;
  gradedAt?: number | string;
  /** Server insertion timestamp. Never derive this from submissionData. */
  submittedAt?: number | string;
}

export type Im3LearningEvidenceDecision = LearningEvidenceDecisionV1;

export interface Im3SubmissionReceipt {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: Im3LearningEvidenceDecision;
}

export interface Im3SubmissionReceiptStore {
  findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<Im3SubmissionReceipt | null>;
  append(
    learnerId: string,
    submissionId: string,
    receipt: Im3SubmissionReceipt,
    evidenceId?: string,
  ): Promise<void>;
}

export interface Im3SubmissionLearningEvidenceHandlerDependencies {
  evidenceStore: Im3LearningEvidenceStore;
  receiptStore: Im3SubmissionReceiptStore;
  loadActivitySubmission: (submissionId: string) => Promise<Im3ActivitySubmission | null>;
  masteryBridge: (input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }) => Promise<void>;
}

export interface Im3SubmissionLearningEvidenceHandler {
  process(input: {
    learnerId: string;
    submissionId: string;
  }): Promise<
    | (Im3SubmissionReceipt & { delivery: 'new' | 'replay' })
    | { accepted: false; reason: 'submission_not_found' }
    | {
        accepted: false;
        reason: 'attempt_ordinal_conflict';
        latestAttemptOrdinal: number;
        receivedAttemptOrdinal: number;
      }
  >;
}

export interface Im3ServerOwnedSubmissionLearningEvidenceHandler {
  process(input: { submissionId: string }): ReturnType<Im3SubmissionLearningEvidenceHandler['process']>;
}

function storedTimestampToIso(value: number | string | undefined): string | null {
  if (value === undefined) return null;
  const timestamp = typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function isExactIm3EquationWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_EQUATION_RATE_NODE
    && submission.activity?.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'rate-of-change-calculator'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3DomainRangeWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_DOMAIN_RANGE_NODE
    && submission.activity?.stableActivityId === IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3MaximumReadingWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_MAXIMUM_READING_NODE
    && submission.activity?.stableActivityId === IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3SymmetryWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_SYMMETRY_NODE
    && submission.activity?.stableActivityId === IM3_SYMMETRY_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3OneRealSolutionWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE
    && submission.activity?.stableActivityId === IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3TwoRealSolutionsWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE
    && submission.activity?.stableActivityId === IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3OneRealSolutionPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  const answers = data.answers;
  const answerRecord = answers !== null && typeof answers === 'object' && !Array.isArray(answers)
    ? answers as Record<string, unknown>
    : null;
  const tableValues = answerRecord?.table_values;
  const placedPoints = answerRecord?.placed_points;
  const parts = data.parts;
  const artifact = data.artifact;
  const artifactRecord = artifact !== null && typeof artifact === 'object' && !Array.isArray(artifact)
    ? artifact as Record<string, unknown>
    : null;
  const graphState = artifactRecord?.graphState;
  const graphStateRecord = graphState !== null && typeof graphState === 'object' && !Array.isArray(graphState)
    ? graphState as Record<string, unknown>
    : null;
  const trustedProps = submission.activity?.props;
  const trustedPropsRecord = trustedProps !== null && typeof trustedProps === 'object' && !Array.isArray(trustedProps)
    ? trustedProps
    : null;
  const tableValuesAreValid = Array.isArray(tableValues)
    && tableValues.length === 5
    && tableValues.every((point) => {
      const pointRecord = point !== null && typeof point === 'object' && !Array.isArray(point)
        ? point as Record<string, unknown>
        : null;
      return pointRecord !== null
        && Object.getPrototypeOf(point) === Object.prototype
        && Object.keys(pointRecord).length === 2
        && typeof pointRecord.x === 'number'
        && Number.isFinite(pointRecord.x)
        && typeof pointRecord.y === 'number'
        && Number.isFinite(pointRecord.y);
    });
  const placedPointsAreValid = Array.isArray(placedPoints)
    && placedPoints.length === 5
    && placedPoints.every((point) => {
      const pointRecord = point !== null && typeof point === 'object' && !Array.isArray(point)
        ? point as Record<string, unknown>
        : null;
      return pointRecord !== null
        && Object.getPrototypeOf(point) === Object.prototype
        && Object.keys(pointRecord).length === 2
        && typeof pointRecord.x === 'number'
        && Number.isFinite(pointRecord.x)
        && typeof pointRecord.y === 'number'
        && Number.isFinite(pointRecord.y);
    });
  const expectedParts = [
    ['table_values', tableValues],
    ['placed_points', placedPoints],
    ['solution', answerRecord?.solution],
  ] as const;
  const partsAreValid = Array.isArray(parts)
    && parts.length === 3
    && parts.every((part, index) => {
      const expected = expectedParts[index];
      const partRecord = part !== null && typeof part === 'object' && !Array.isArray(part)
        ? part as Record<string, unknown>
        : null;
      return expected !== undefined
        && partRecord !== null
        && Object.getPrototypeOf(part) === Object.prototype
        && Object.keys(partRecord).length === 5
        && ['partId', 'rawAnswer', 'isCorrect', 'score', 'maxScore'].every(key => key in partRecord)
        && partRecord.partId === expected[0]
        && normalizePracticeValue(partRecord.rawAnswer) === normalizePracticeValue(expected[1])
        && (partRecord.score === 0 || partRecord.score === 1)
        && partRecord.maxScore === 1
        && partRecord.isCorrect === (partRecord.score === partRecord.maxScore);
    });
  const partScoreTotal = Array.isArray(parts)
    ? parts.reduce((total, part) => {
      const partRecord = part !== null && typeof part === 'object' && !Array.isArray(part)
        ? part as Record<string, unknown>
        : null;
      return total + (typeof partRecord?.score === 'number' ? partRecord.score : Number.NaN);
    }, 0)
    : Number.NaN;
  return submission.activity?.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 9
    && ['contractVersion', 'activityId', 'attemptNumber', 'mode', 'status', 'submittedAt', 'answers', 'parts', 'artifact']
      .every(key => key in data)
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
    && typeof submission.score === 'number'
    && Number.isInteger(submission.score)
    && submission.score >= 0
    && submission.score <= 3
    && typeof submission.maxScore === 'number'
    && submission.maxScore === 3
    && Number.isFinite(submission.maxScore)
    && Number.isFinite(partScoreTotal)
    && submission.score === partScoreTotal
    && answerRecord !== null
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answerRecord).length === 3
    && ['table_values', 'placed_points', 'solution'].every(key => key in answerRecord)
    && tableValuesAreValid
    && placedPointsAreValid
    && typeof answerRecord.solution === 'number'
    && Number.isFinite(answerRecord.solution)
    && partsAreValid
    && graphStateRecord !== null
    && artifactRecord !== null
    && Object.getPrototypeOf(artifact) === Object.prototype
    && Object.keys(artifactRecord).length === 1
    && 'graphState' in artifactRecord
    && Object.getPrototypeOf(graphState) === Object.prototype
    && Object.keys(graphStateRecord).length === 6
    && ['originalEquation', 'equation', 'tableValues', 'placedPoints', 'domain', 'range']
      .every(key => key in graphStateRecord)
    && trustedPropsRecord !== null
    && trustedPropsRecord.variant === 'plot_from_equation'
    && trustedPropsRecord.responseVariant === 'one_real_solution'
    && typeof trustedPropsRecord.originalEquation === 'string'
    && trustedPropsRecord.originalEquation.trim().length > 0
    && typeof trustedPropsRecord.equation === 'string'
    && trustedPropsRecord.equation.trim().length > 0
    && Array.isArray(trustedPropsRecord.domain)
    && trustedPropsRecord.domain.length === 2
    && trustedPropsRecord.domain.every(value => typeof value === 'number' && Number.isFinite(value))
    && Array.isArray(trustedPropsRecord.range)
    && trustedPropsRecord.range.length === 2
    && trustedPropsRecord.range.every(value => typeof value === 'number' && Number.isFinite(value))
    && graphStateRecord.originalEquation === trustedPropsRecord.originalEquation
    && graphStateRecord.equation === trustedPropsRecord.equation
    && normalizePracticeValue(graphStateRecord.tableValues) === normalizePracticeValue(tableValues)
    && normalizePracticeValue(graphStateRecord.placedPoints) === normalizePracticeValue(placedPoints)
    && normalizePracticeValue(graphStateRecord.domain) === normalizePracticeValue(trustedPropsRecord.domain)
    && normalizePracticeValue(graphStateRecord.range) === normalizePracticeValue(trustedPropsRecord.range);
}

function isExactIm3TwoRealSolutionsPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  const answers = data.answers;
  const answerRecord = answers !== null && typeof answers === 'object' && !Array.isArray(answers)
    ? answers as Record<string, unknown>
    : null;
  const tableValues = answerRecord?.table_values;
  const placedPoints = answerRecord?.placed_points;
  const solutions = answerRecord?.solutions;
  const parts = data.parts;
  const artifact = data.artifact;
  const artifactRecord = artifact !== null && typeof artifact === 'object' && !Array.isArray(artifact)
    ? artifact as Record<string, unknown>
    : null;
  const graphState = artifactRecord?.graphState;
  const graphStateRecord = graphState !== null && typeof graphState === 'object' && !Array.isArray(graphState)
    ? graphState as Record<string, unknown>
    : null;
  const trustedProps = submission.activity?.props;
  const trustedPropsRecord = trustedProps !== null && typeof trustedProps === 'object' && !Array.isArray(trustedProps)
    ? trustedProps
    : null;
  const tableValuesAreValid = Array.isArray(tableValues)
    && tableValues.length === 5
    && tableValues.every((point) => {
      const pointRecord = point !== null && typeof point === 'object' && !Array.isArray(point)
        ? point as Record<string, unknown>
        : null;
      return pointRecord !== null
        && Object.getPrototypeOf(point) === Object.prototype
        && Object.keys(pointRecord).length === 2
        && typeof pointRecord.x === 'number'
        && Number.isFinite(pointRecord.x)
        && typeof pointRecord.y === 'number'
        && Number.isFinite(pointRecord.y);
    });
  const placedPointsAreValid = Array.isArray(placedPoints)
    && placedPoints.length === 5
    && placedPoints.every((point) => {
      const pointRecord = point !== null && typeof point === 'object' && !Array.isArray(point)
        ? point as Record<string, unknown>
        : null;
      return pointRecord !== null
        && Object.getPrototypeOf(point) === Object.prototype
        && Object.keys(pointRecord).length === 2
        && typeof pointRecord.x === 'number'
        && Number.isFinite(pointRecord.x)
        && typeof pointRecord.y === 'number'
        && Number.isFinite(pointRecord.y);
    });
  const solutionsAreValid = Array.isArray(solutions)
    && solutions.length === 2
    && solutions.every((solution) => typeof solution === 'number' && Number.isFinite(solution));
  const expectedParts = [
    ['table_values', tableValues],
    ['placed_points', placedPoints],
    ['solutions', solutions],
  ] as const;
  const partsAreValid = Array.isArray(parts)
    && parts.length === 3
    && parts.every((part, index) => {
      const expected = expectedParts[index];
      const partRecord = part !== null && typeof part === 'object' && !Array.isArray(part)
        ? part as Record<string, unknown>
        : null;
      return expected !== undefined
        && partRecord !== null
        && Object.getPrototypeOf(part) === Object.prototype
        && Object.keys(partRecord).length === 5
        && ['partId', 'rawAnswer', 'isCorrect', 'score', 'maxScore'].every(key => key in partRecord)
        && partRecord.partId === expected[0]
        && normalizePracticeValue(partRecord.rawAnswer) === normalizePracticeValue(expected[1])
        && (partRecord.score === 0 || partRecord.score === 1)
        && partRecord.maxScore === 1
        && partRecord.isCorrect === (partRecord.score === partRecord.maxScore);
    });
  const partScoreTotal = Array.isArray(parts)
    ? parts.reduce((total, part) => {
      const partRecord = part !== null && typeof part === 'object' && !Array.isArray(part)
        ? part as Record<string, unknown>
        : null;
      return total + (typeof partRecord?.score === 'number' ? partRecord.score : Number.NaN);
    }, 0)
    : Number.NaN;
  return submission.activity?.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 9
    && ['contractVersion', 'activityId', 'attemptNumber', 'mode', 'status', 'submittedAt', 'answers', 'parts', 'artifact']
      .every(key => key in data)
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
    && typeof submission.score === 'number'
    && Number.isInteger(submission.score)
    && submission.score >= 0
    && submission.score <= 3
    && typeof submission.maxScore === 'number'
    && submission.maxScore === 3
    && Number.isFinite(submission.maxScore)
    && Number.isFinite(partScoreTotal)
    && submission.score === partScoreTotal
    && answerRecord !== null
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answerRecord).length === 3
    && ['table_values', 'placed_points', 'solutions'].every(key => key in answerRecord)
    && tableValuesAreValid
    && placedPointsAreValid
    && solutionsAreValid
    && partsAreValid
    && graphStateRecord !== null
    && artifactRecord !== null
    && Object.getPrototypeOf(artifact) === Object.prototype
    && Object.keys(artifactRecord).length === 1
    && 'graphState' in artifactRecord
    && Object.getPrototypeOf(graphState) === Object.prototype
    && Object.keys(graphStateRecord).length === 6
    && ['originalEquation', 'equation', 'tableValues', 'placedPoints', 'domain', 'range']
      .every(key => key in graphStateRecord)
    && trustedPropsRecord !== null
    && trustedPropsRecord.variant === 'plot_from_equation'
    && trustedPropsRecord.responseVariant === 'two_real_solutions'
    && typeof trustedPropsRecord.originalEquation === 'string'
    && trustedPropsRecord.originalEquation.trim().length > 0
    && typeof trustedPropsRecord.equation === 'string'
    && trustedPropsRecord.equation.trim().length > 0
    && Array.isArray(trustedPropsRecord.domain)
    && trustedPropsRecord.domain.length === 2
    && trustedPropsRecord.domain.every(value => typeof value === 'number' && Number.isFinite(value))
    && Array.isArray(trustedPropsRecord.range)
    && trustedPropsRecord.range.length === 2
    && trustedPropsRecord.range.every(value => typeof value === 'number' && Number.isFinite(value))
    && graphStateRecord.originalEquation === trustedPropsRecord.originalEquation
    && graphStateRecord.equation === trustedPropsRecord.equation
    && normalizePracticeValue(graphStateRecord.tableValues) === normalizePracticeValue(tableValues)
    && normalizePracticeValue(graphStateRecord.placedPoints) === normalizePracticeValue(placedPoints)
    && normalizePracticeValue(graphStateRecord.domain) === normalizePracticeValue(trustedPropsRecord.domain)
    && normalizePracticeValue(graphStateRecord.range) === normalizePracticeValue(trustedPropsRecord.range);
}

function isExactIm3CompareMaximumWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE
    && submission.activity?.stableActivityId === IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3ProfitModelWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_PROFIT_MODEL_NODE
    && submission.activity?.stableActivityId === IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'fill-in-the-blank'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3ProfitMaximumWorkedSubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const attemptOrdinal = submission.attemptOrdinal;
  const answers = data.answers;
  const parts = data.parts;
  return submission.activity?.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE
    && submission.activity?.stableActivityId === IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID
    && submission.activity.componentKey === 'fill-in-the-blank'
    && submission.activity.learningEvidenceMode === 'worked_example'
    && submission.activity.srsEligible === false
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && typeof attemptOrdinal === 'number'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 0
    && Array.isArray(parts)
    && parts.length === 0
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION;
}

function isExactIm3EquationPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  return submission.activity?.masteryNodeId === IM3_EQUATION_RATE_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'rate-of-change-calculator'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null;
}

function isExactIm3DomainRangePracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  return submission.activity?.masteryNodeId === IM3_DOMAIN_RANGE_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null;
}

function isExactIm3MaximumReadingPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  const answers = data.answers;
  const answerRecord = answers !== null && typeof answers === 'object' && !Array.isArray(answers)
    ? answers as Record<string, unknown>
    : null;
  const parts = data.parts;
  const part = Array.isArray(parts) ? parts[0] : undefined;
  const partRecord = part !== null && typeof part === 'object' ? part as Record<string, unknown> : null;
  return submission.activity?.masteryNodeId === IM3_MAXIMUM_READING_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
    && typeof submission.score === 'number'
    && Number.isFinite(submission.score)
    && typeof submission.maxScore === 'number'
    && Number.isFinite(submission.maxScore)
    && submission.maxScore === 1
    && submission.score >= 0
    && submission.score <= 1
    && (submission.score === 0 || submission.score === 1)
    && answers !== null
    && typeof answers === 'object'
    && !Array.isArray(answers)
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answers).length === 1
    && Object.keys(answers)[0] === 'maximum_value'
    && answerRecord !== null
    && typeof answerRecord.maximum_value === 'number'
    && Number.isFinite(answerRecord.maximum_value)
    && Array.isArray(parts)
    && parts.length === 1
    && partRecord !== null
    && partRecord.partId === 'maximum_value'
    && typeof partRecord.rawAnswer === 'number'
    && Number.isFinite(partRecord.rawAnswer)
    && partRecord.rawAnswer === answerRecord.maximum_value
    && partRecord.isCorrect === (submission.score === submission.maxScore)
    && partRecord.score === submission.score
    && partRecord.maxScore === submission.maxScore;
}

function isExactIm3SymmetryPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  const answers = data.answers;
  const answerRecord = answers !== null && typeof answers === 'object' && !Array.isArray(answers)
    ? answers as Record<string, unknown>
    : null;
  const points = answerRecord?.placed_points;
  const parts = data.parts;
  const part = Array.isArray(parts) ? parts[0] : undefined;
  const partRecord = part !== null && typeof part === 'object' && !Array.isArray(part)
    ? part as Record<string, unknown>
    : null;
  return submission.activity?.masteryNodeId === IM3_SYMMETRY_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
    && typeof submission.score === 'number'
    && Number.isFinite(submission.score)
    && typeof submission.maxScore === 'number'
    && Number.isFinite(submission.maxScore)
    && submission.maxScore === 1
    && (submission.score === 0 || submission.score === 1)
    && answerRecord !== null
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answerRecord).length === 1
    && Object.keys(answerRecord)[0] === 'placed_points'
    && Array.isArray(points)
    && points.length === 3
    && points.every((point) => {
      const pointRecord = point !== null && typeof point === 'object' && !Array.isArray(point)
        ? point as Record<string, unknown>
        : null;
      return pointRecord !== null
        && Object.getPrototypeOf(point) === Object.prototype
        && Object.keys(pointRecord).length === 2
        && typeof pointRecord.x === 'number'
        && Number.isFinite(pointRecord.x)
        && typeof pointRecord.y === 'number'
        && Number.isFinite(pointRecord.y);
    })
    && Array.isArray(parts)
    && parts.length === 1
    && partRecord !== null
    && partRecord.partId === 'placed_points'
    && Array.isArray(partRecord.rawAnswer)
    && normalizePracticeValue(partRecord.rawAnswer) === normalizePracticeValue(points)
    && partRecord.isCorrect === (submission.score === submission.maxScore)
    && partRecord.score === submission.score
    && partRecord.maxScore === submission.maxScore;
}

function isExactIm3CompareMaximumPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  const answers = data.answers;
  const answerRecord = answers !== null && typeof answers === 'object' && !Array.isArray(answers)
    ? answers as Record<string, unknown>
    : null;
  const parts = data.parts;
  const part = Array.isArray(parts) ? parts[0] : undefined;
  const partRecord = part !== null && typeof part === 'object' && !Array.isArray(part)
    ? part as Record<string, unknown>
    : null;
  return submission.activity?.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && Object.keys(data).length === 8
    && Object.keys(data).every((key) => [
      'contractVersion',
      'activityId',
      'attemptNumber',
      'mode',
      'status',
      'submittedAt',
      'answers',
      'parts',
    ].includes(key))
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null
    && submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
    && typeof submission.score === 'number'
    && Number.isFinite(submission.score)
    && typeof submission.maxScore === 'number'
    && Number.isFinite(submission.maxScore)
    && submission.maxScore === 1
    && (submission.score === 0 || submission.score === 1)
    && answerRecord !== null
    && Object.getPrototypeOf(answers) === Object.prototype
    && Object.keys(answerRecord).length === 1
    && Object.keys(answerRecord)[0] === 'greater_maximum'
    && (answerRecord.greater_maximum === 'first' || answerRecord.greater_maximum === 'second')
    && Array.isArray(parts)
    && parts.length === 1
    && partRecord !== null
    && partRecord.partId === 'greater_maximum'
    && (partRecord.rawAnswer === 'first' || partRecord.rawAnswer === 'second')
    && partRecord.rawAnswer === answerRecord.greater_maximum
    && partRecord.isCorrect === (submission.score === submission.maxScore)
    && partRecord.score === submission.score
    && partRecord.maxScore === submission.maxScore;
}

function isExactIm3ProfitModelPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  return submission.activity?.masteryNodeId === IM3_PROFIT_MODEL_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'fill-in-the-blank'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && submission.maxScore === 7;
}

function isExactIm3ProfitMaximumPracticeSubmission(
  submission: Im3ActivitySubmission,
  stableActivityId: string,
  mode: 'guided_practice' | 'independent_practice',
): boolean {
  const data = submission.submissionData;
  return submission.activity?.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE
    && submission.activity?.stableActivityId === stableActivityId
    && submission.activity.componentKey === 'fill-in-the-blank'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === mode
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && submission.maxScore === 3;
}

function getSubmissionOwner(submission: Im3ActivitySubmission): string | null {
  const owner = submission.userId;
  return typeof owner === 'string' && owner.trim().length > 0 ? owner : null;
}

function canonicalSelectedContent(value: unknown): string {
  return JSON.stringify(value, (_key, entry) => (
    entry !== null && typeof entry === 'object' && !Array.isArray(entry)
      ? Object.fromEntries(Object.keys(entry).sort().map((key) => [key, entry[key]]))
      : entry
  ));
}

export function hasCurrentSelectedActivityIdentity(
  submission: Pick<Im3ActivitySubmission, 'activity' | 'activityId'>,
  mode: 'guided' | 'independent',
): boolean {
  const activity = submission.activity;
  if (!activity || activity.approval?.status !== 'approved') return false;
  const expected = mode === 'guided'
    ? buildIm3GuidedPilotSeedDocuments(submission.activityId as Id<'activities'>, 0).activity
    : buildIm3PilotSeedDocuments(submission.activityId as Id<'activities'>, 0).activity;
  return activity.learningEvidenceMode === undefined
    && canonicalSelectedContent(activity.props) === canonicalSelectedContent(expected.props)
    && canonicalSelectedContent(activity.gradingConfig) === canonicalSelectedContent(expected.gradingConfig);
}

function isPersistableDecision(decision: LearningEvidenceDecisionV1): boolean {
  return decision.reason === 'teacher_led'
    || decision.reason === 'ungraded_evidence'
    || decision.reason === 'eligible';
}

function highestAttemptOrdinal(
  evidence: LearningEvidenceV1,
  acceptedEvidence: readonly LearningEvidenceV1[],
): number | null {
  let highest: number | null = null;
  for (const accepted of acceptedEvidence) {
    if (
      accepted.nodeId !== evidence.nodeId
      || accepted.activityId !== evidence.activityId
      || accepted.origin !== evidence.origin
    ) {
      continue;
    }
    if (highest === null || accepted.attemptOrdinal > highest) {
      highest = accepted.attemptOrdinal;
    }
  }
  return highest;
}

export function buildIm3StoredEvidence(
  submission: Im3ActivitySubmission,
  learnerId: string,
  submissionId: string,
): { evidence: LearningEvidenceV1; masteryBearing: boolean } | null {
  if (getSubmissionOwner(submission) !== learnerId) return null;

  const data = submission.submissionData;
  if (data.contractVersion !== 'practice.v1') return null;
  const storedContractVersion = submission.masteryContractVersion
    ?? (typeof data.masteryContractVersion === 'string'
      ? data.masteryContractVersion
      : undefined);
  if (storedContractVersion !== IM3_LEARNING_EVIDENCE_CONTRACT_VERSION) {
    return null;
  }

  const attemptOrdinal = submission.attemptOrdinal;
  if (
    typeof attemptOrdinal !== 'number'
    || !Number.isInteger(attemptOrdinal)
    || attemptOrdinal < 1
  ) {
    return null;
  }

  const stableActivityId = submission.activity?.stableActivityId;
  const masteryNodeId = submission.activity?.masteryNodeId;
  const componentKey = submission.activity?.componentKey;
  const srsEligible = submission.activity?.srsEligible;
  const isEquationWorked = isExactIm3EquationWorkedSubmission(submission);
  const isDomainRangeWorked = isExactIm3DomainRangeWorkedSubmission(submission);
  const isMaximumReadingWorked = isExactIm3MaximumReadingWorkedSubmission(submission);
  const isSymmetryWorked = isExactIm3SymmetryWorkedSubmission(submission);
  const isCompareMaximumWorked = isExactIm3CompareMaximumWorkedSubmission(submission);
  const isOneRealSolutionWorked = isExactIm3OneRealSolutionWorkedSubmission(submission);
  const isTwoRealSolutionsWorked = isExactIm3TwoRealSolutionsWorkedSubmission(submission);
  const isOneRealSolutionGuided = isExactIm3OneRealSolutionPracticeSubmission(
    submission,
    IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isOneRealSolutionIndependent = isExactIm3OneRealSolutionPracticeSubmission(
    submission,
    IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isTwoRealSolutionsGuided = isExactIm3TwoRealSolutionsPracticeSubmission(
    submission,
    IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isTwoRealSolutionsIndependent = isExactIm3TwoRealSolutionsPracticeSubmission(
    submission,
    IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isProfitModelWorked = isExactIm3ProfitModelWorkedSubmission(submission);
  const isProfitMaximumWorked = isExactIm3ProfitMaximumWorkedSubmission(submission);
  const isProfitMaximumGuided = isExactIm3ProfitMaximumPracticeSubmission(
    submission,
    IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isProfitMaximumIndependent = isExactIm3ProfitMaximumPracticeSubmission(
    submission,
    IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isEquationGuided = isExactIm3EquationPracticeSubmission(
    submission,
    IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isEquationIndependent = isExactIm3EquationPracticeSubmission(
    submission,
    IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isEquationMastery = isEquationGuided || isEquationIndependent;
  const isDomainRangeGuided = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isDomainRangeGuidedSeed2 = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
    'guided_practice',
  );
  const isDomainRangeIndependent = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isDomainRangeIndependentSeed2 = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
    'independent_practice',
  );
  const isDomainRangeMastery = isDomainRangeGuided || isDomainRangeGuidedSeed2 || isDomainRangeIndependent || isDomainRangeIndependentSeed2;
  const isMaximumReadingGuided = isExactIm3MaximumReadingPracticeSubmission(
    submission,
    IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isMaximumReadingIndependent = isExactIm3MaximumReadingPracticeSubmission(
    submission,
    IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isMaximumReadingMastery = isMaximumReadingGuided || isMaximumReadingIndependent;
  const isSymmetryGuided = isExactIm3SymmetryPracticeSubmission(
    submission,
    IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isSymmetryIndependent = isExactIm3SymmetryPracticeSubmission(
    submission,
    IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isSymmetryMastery = isSymmetryGuided || isSymmetryIndependent;
  const isCompareMaximumGuided = isExactIm3CompareMaximumPracticeSubmission(
    submission,
    IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isCompareMaximumIndependent = isExactIm3CompareMaximumPracticeSubmission(
    submission,
    IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isCompareMaximumMastery = isCompareMaximumGuided || isCompareMaximumIndependent;
  const isProfitModelGuided = isExactIm3ProfitModelPracticeSubmission(
    submission,
    IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isProfitModelIndependent = isExactIm3ProfitModelPracticeSubmission(
    submission,
    IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isProfitModelMastery = isProfitModelGuided || isProfitModelIndependent;
  const isProfitMaximumMastery = isProfitMaximumGuided || isProfitMaximumIndependent;
  const isGraphGuidedSeed2 = stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID
    && masteryNodeId === IM3_PILOT_NODE
    && componentKey === 'graphing-explorer'
    && srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === 'guided_practice'
    && data.status === 'graded'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.score === 'number'
    && Number.isFinite(submission.score)
    && typeof submission.maxScore === 'number'
    && Number.isFinite(submission.maxScore)
    && submission.maxScore === 2
    && submission.score >= 0
    && submission.score <= submission.maxScore
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null;
  const isGraphIndependentSeed2 = stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
    && masteryNodeId === IM3_PILOT_NODE
    && componentKey === 'graphing-explorer'
    && srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === 'independent_practice'
    && data.status === 'graded'
    && Number.isInteger(attemptOrdinal)
    && attemptOrdinal > 0
    && data.attemptNumber === attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.score === 'number'
    && Number.isFinite(submission.score)
    && typeof submission.maxScore === 'number'
    && Number.isFinite(submission.maxScore)
    && submission.maxScore === 2
    && submission.score >= 0
    && submission.score <= submission.maxScore
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null;
  const isPilotActivity = masteryNodeId === IM3_PILOT_NODE
    && componentKey === 'graphing-explorer';
  if (!isPilotActivity && !isEquationWorked && !isDomainRangeWorked && !isMaximumReadingWorked && !isSymmetryWorked && !isCompareMaximumWorked && !isOneRealSolutionWorked && !isTwoRealSolutionsWorked && !isProfitModelWorked && !isProfitMaximumWorked && !isEquationMastery && !isDomainRangeMastery && !isMaximumReadingMastery && !isProfitModelMastery && !isProfitMaximumMastery && !isSymmetryMastery && !isCompareMaximumMastery && !isOneRealSolutionGuided && !isOneRealSolutionIndependent && !isTwoRealSolutionsGuided && !isTwoRealSolutionsIndependent && !isGraphGuidedSeed2 && !isGraphIndependentSeed2) return null;

  // A student-owned Worked acknowledgement is not trusted teacher evidence.
  const isTeacherLed = false;
  const isMasteryAdvantage = (
    (stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
      && data.mode === 'independent_practice'
      && hasCurrentSelectedActivityIdentity(submission, 'independent'))
    || (stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
      && data.mode === 'guided_practice'
      && hasCurrentSelectedActivityIdentity(submission, 'guided'))
    || isEquationMastery
    || isDomainRangeMastery
    || isMaximumReadingMastery
    || isProfitModelMastery
    || isProfitMaximumMastery
    || isSymmetryMastery
    || isCompareMaximumMastery
    || isOneRealSolutionGuided
    || isOneRealSolutionIndependent
    || isTwoRealSolutionsGuided
    || isTwoRealSolutionsIndependent
    || isGraphGuidedSeed2
    || isGraphIndependentSeed2
  )
    && srsEligible === true;
  if (!isTeacherLed && !isMasteryAdvantage && !isEquationWorked && !isDomainRangeWorked && !isMaximumReadingWorked && !isSymmetryWorked && !isCompareMaximumWorked && !isOneRealSolutionWorked && !isTwoRealSolutionsWorked && !isProfitModelWorked && !isProfitMaximumWorked && !isProfitMaximumMastery && !isMaximumReadingMastery && !isSymmetryMastery && !isCompareMaximumMastery && !isOneRealSolutionGuided && !isOneRealSolutionIndependent && !isTwoRealSolutionsGuided && !isTwoRealSolutionsIndependent && !isGraphGuidedSeed2 && !isGraphIndependentSeed2) return null;

  const occurredAt = storedTimestampToIso(
    isMasteryAdvantage ? submission.gradedAt : submission.submittedAt,
  );
  if (!occurredAt) return null;

  if (isDomainRangeWorked) {
    return null;
  }

  if (isMaximumReadingWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_MAXIMUM_READING_NODE,
        activityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isSymmetryWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_SYMMETRY_NODE,
        activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isCompareMaximumWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_COMPARE_MAXIMUM_NODE,
        activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isOneRealSolutionWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_ONE_REAL_SOLUTION_NODE,
        activityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isTwoRealSolutionsWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
        activityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isEquationWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_EQUATION_RATE_NODE,
        activityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isProfitModelWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_PROFIT_MODEL_NODE,
        activityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isProfitMaximumWorked) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_PROFIT_MAXIMUM_NODE,
        activityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (isTeacherLed) {
    return {
      masteryBearing: false,
      evidence: normalizeLearningEvidenceV1({
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: IM3_PILOT_NODE,
        activityId: IM3_TEACHER_LED_ACTIVITY_ID,
        attemptOrdinal,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt,
        idempotencyKey: `im3:teacher-led:submission:${submissionId}`,
      }),
    };
  }

  if (data.status !== 'graded') return null;
  const score = submission.score;
  const maxScore = submission.maxScore;
  const gradedAt = storedTimestampToIso(submission.gradedAt);
  if (
    typeof score !== 'number'
    || !Number.isFinite(score)
    || typeof maxScore !== 'number'
    || !Number.isFinite(maxScore)
    || maxScore <= 0
    || score < 0
    || score > maxScore
    || gradedAt === null
  ) {
    return null;
  }

  const evidenceNodeId = isGraphGuidedSeed2 || isGraphIndependentSeed2
    ? IM3_PILOT_NODE
    : isEquationMastery
    ? IM3_EQUATION_RATE_NODE
    : isMaximumReadingMastery
      ? IM3_MAXIMUM_READING_NODE
    : isSymmetryMastery
      ? IM3_SYMMETRY_NODE
    : isOneRealSolutionGuided || isOneRealSolutionIndependent
      ? IM3_ONE_REAL_SOLUTION_NODE
    : isTwoRealSolutionsGuided || isTwoRealSolutionsIndependent
      ? IM3_TWO_REAL_SOLUTIONS_NODE
    : isCompareMaximumMastery
      ? IM3_COMPARE_MAXIMUM_NODE
    : isDomainRangeMastery
      ? IM3_DOMAIN_RANGE_NODE
      : isProfitModelMastery
        ? IM3_PROFIT_MODEL_NODE
        : isProfitMaximumMastery
          ? IM3_PROFIT_MAXIMUM_NODE
        : IM3_PILOT_NODE;
  const evidenceActivityId = isGraphGuidedSeed2
    ? IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID
    : isGraphIndependentSeed2
      ? IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
    : isEquationGuided
    ? IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID
    : isEquationIndependent
      ? IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID
      : isMaximumReadingGuided
        ? IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID
      : isMaximumReadingIndependent
        ? IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID
      : isSymmetryGuided
        ? IM3_SYMMETRY_GUIDED_ACTIVITY_ID
      : isSymmetryIndependent
        ? IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID
      : isOneRealSolutionGuided
        ? IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
      : isOneRealSolutionIndependent
        ? IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID
      : isTwoRealSolutionsGuided
        ? IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
      : isTwoRealSolutionsIndependent
        ? IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID
      : isCompareMaximumGuided
        ? IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID
      : isCompareMaximumIndependent
        ? IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID
      : isDomainRangeGuidedSeed2
        ? IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID
      : isDomainRangeGuided
        ? IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID
        : isDomainRangeIndependentSeed2
          ? IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID
        : isDomainRangeIndependent
          ? IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
          : isProfitModelGuided
            ? IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID
          : isProfitModelIndependent
              ? IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
            : isProfitMaximumGuided
              ? IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
            : isProfitMaximumIndependent
              ? IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
            : stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
              ? IM3_GUIDED_PRACTICE_ACTIVITY_ID
              : IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
  const evidenceMode = isGraphGuidedSeed2
    ? 'guided_practice'
    : isGraphIndependentSeed2
      ? 'independent_practice'
    : isEquationGuided
    ? 'guided_practice'
    : isEquationIndependent
      ? 'independent_practice'
      : isMaximumReadingGuided
        ? 'guided_practice'
      : isMaximumReadingIndependent
        ? 'independent_practice'
      : isSymmetryGuided
        ? 'guided_practice'
      : isSymmetryIndependent
        ? 'independent_practice'
      : isOneRealSolutionGuided
        ? 'guided_practice'
      : isOneRealSolutionIndependent
        ? 'independent_practice'
      : isTwoRealSolutionsGuided
        ? 'guided_practice'
      : isTwoRealSolutionsIndependent
        ? 'independent_practice'
      : isCompareMaximumGuided
        ? 'guided_practice'
      : isCompareMaximumIndependent
        ? 'independent_practice'
      : isDomainRangeGuidedSeed2
        ? 'guided_practice'
        : isDomainRangeGuided
        ? 'guided_practice'
        : isDomainRangeIndependentSeed2
          ? 'independent_practice'
        : isDomainRangeIndependent
          ? 'independent_practice'
          : isProfitModelGuided
            ? 'guided_practice'
          : isProfitModelIndependent
              ? 'independent_practice'
            : isProfitMaximumGuided
              ? 'guided_practice'
            : isProfitMaximumIndependent
              ? 'independent_practice'
            : stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
              ? 'guided_practice'
              : 'independent_practice';

  return {
    masteryBearing: true,
    evidence: normalizeLearningEvidenceV1({
      contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
      nodeId: evidenceNodeId,
      activityId: evidenceActivityId,
      attemptOrdinal,
      origin: 'mastery_advantage',
      mode: evidenceMode,
      occurredAt,
      gradedEvidence: {
        isCorrect: score === maxScore,
        score,
        maxScore,
      },
      idempotencyKey: `im3:mastery-advantage:submission:${submissionId}`,
    }),
  };
}

function isExactIm3TeacherLedSubmission(submission: Im3ActivitySubmission): boolean {
  const isGraphTeacherLed = submission.activity?.masteryNodeId === IM3_PILOT_NODE
    && submission.activity?.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.submissionData.mode === 'worked_example';
  return isGraphTeacherLed
    || isExactIm3EquationWorkedSubmission(submission)
    || isExactIm3DomainRangeWorkedSubmission(submission)
    || isExactIm3MaximumReadingWorkedSubmission(submission)
    || isExactIm3SymmetryWorkedSubmission(submission)
    || isExactIm3CompareMaximumWorkedSubmission(submission)
    || isExactIm3OneRealSolutionWorkedSubmission(submission)
    || isExactIm3TwoRealSolutionsWorkedSubmission(submission)
    || isExactIm3ProfitModelWorkedSubmission(submission)
    || isExactIm3ProfitMaximumWorkedSubmission(submission);
}

function isExactIm3MasterySubmission(submission: Im3ActivitySubmission): boolean {
  const data = submission.submissionData;
  const isExactGraphGuidedSeed2 = submission.activity?.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID
    && submission.activity?.masteryNodeId === IM3_PILOT_NODE
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === 'guided_practice'
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.score === 'number'
    && Number.isFinite(submission.score)
    && typeof submission.maxScore === 'number'
    && Number.isFinite(submission.maxScore)
    && submission.maxScore === 2
    && submission.score >= 0
    && submission.score <= submission.maxScore
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null;
  const isExactGraphIndependentSeed2 = submission.activity?.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
    && submission.activity?.masteryNodeId === IM3_PILOT_NODE
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true
    && typeof submission.activityId === 'string'
    && submission.activityId === data.activityId
    && data.contractVersion === 'practice.v1'
    && data.mode === 'independent_practice'
    && data.status === 'graded'
    && typeof submission.attemptOrdinal === 'number'
    && Number.isInteger(submission.attemptOrdinal)
    && submission.attemptOrdinal > 0
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && typeof submission.score === 'number'
    && Number.isFinite(submission.score)
    && typeof submission.maxScore === 'number'
    && Number.isFinite(submission.maxScore)
    && submission.maxScore === 2
    && submission.score >= 0
    && submission.score <= submission.maxScore
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && storedTimestampToIso(submission.submittedAt) !== null
    && typeof submission.gradedAt === 'number'
    && Number.isFinite(submission.gradedAt)
    && storedTimestampToIso(submission.gradedAt) !== null;
  const isExactMasteryActivity = (
    (submission.activity?.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
      && submission.submissionData.mode === 'independent_practice'
      && hasCurrentSelectedActivityIdentity(submission, 'independent'))
    || (submission.activity?.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
      && submission.submissionData.mode === 'guided_practice'
      && hasCurrentSelectedActivityIdentity(submission, 'guided'))
    || isExactGraphGuidedSeed2
    || isExactGraphIndependentSeed2
  );
  const isExactGraphMasteryActivity = submission.activity?.masteryNodeId === IM3_PILOT_NODE
    && isExactMasteryActivity
    && submission.activity.componentKey === 'graphing-explorer'
    && submission.activity.srsEligible === true;
  const isExactDomainRangeGuided = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactDomainRangeGuidedSeed2 = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactDomainRangeIndependent = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactDomainRangeIndependentSeed2 = isExactIm3DomainRangePracticeSubmission(
    submission,
    IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactMaximumReadingGuided = isExactIm3MaximumReadingPracticeSubmission(
    submission,
    IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactMaximumReadingIndependent = isExactIm3MaximumReadingPracticeSubmission(
    submission,
    IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactMaximumReadingMastery = isExactMaximumReadingGuided || isExactMaximumReadingIndependent;
  const isExactSymmetryGuided = isExactIm3SymmetryPracticeSubmission(
    submission,
    IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactSymmetryIndependent = isExactIm3SymmetryPracticeSubmission(
    submission,
    IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactSymmetryMastery = isExactSymmetryGuided || isExactSymmetryIndependent;
  const isExactOneRealSolutionGuided = isExactIm3OneRealSolutionPracticeSubmission(
    submission,
    IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactOneRealSolutionIndependent = isExactIm3OneRealSolutionPracticeSubmission(
    submission,
    IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactTwoRealSolutionsGuided = isExactIm3TwoRealSolutionsPracticeSubmission(
    submission,
    IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactTwoRealSolutionsIndependent = isExactIm3TwoRealSolutionsPracticeSubmission(
    submission,
    IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactCompareMaximumGuided = isExactIm3CompareMaximumPracticeSubmission(
    submission,
    IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactCompareMaximumIndependent = isExactIm3CompareMaximumPracticeSubmission(
    submission,
    IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactCompareMaximumMastery = isExactCompareMaximumGuided || isExactCompareMaximumIndependent;
  const isExactProfitModelGuided = isExactIm3ProfitModelPracticeSubmission(
    submission,
    IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactProfitModelIndependent = isExactIm3ProfitModelPracticeSubmission(
    submission,
    IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  const isExactProfitMaximumGuided = isExactIm3ProfitMaximumPracticeSubmission(
    submission,
    IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
    'guided_practice',
  );
  const isExactProfitMaximumIndependent = isExactIm3ProfitMaximumPracticeSubmission(
    submission,
    IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    'independent_practice',
  );
  return isExactGraphMasteryActivity
    || isExactIm3EquationPracticeSubmission(
      submission,
      IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      'guided_practice',
    )
    || isExactIm3EquationPracticeSubmission(
      submission,
      IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
    )
    || isExactDomainRangeGuidedSeed2
    || isExactDomainRangeGuided
    || isExactDomainRangeIndependentSeed2
    || isExactDomainRangeIndependent
    || isExactMaximumReadingMastery
    || isExactSymmetryMastery
    || isExactOneRealSolutionGuided
    || isExactOneRealSolutionIndependent
    || isExactTwoRealSolutionsGuided
    || isExactTwoRealSolutionsIndependent
    || isExactCompareMaximumMastery
    || isExactProfitModelGuided
    || isExactProfitModelIndependent
    || isExactProfitMaximumGuided
    || isExactProfitMaximumIndependent;
}

/**
 * Creates the receipt-first IM3 boundary. It accepts only a trusted learner
 * ID plus an opaque server-owned submission ID and grades from stored fields.
 */
export function createIm3SubmissionLearningEvidenceHandler({
  evidenceStore,
  receiptStore,
  loadActivitySubmission,
  masteryBridge,
}: Im3SubmissionLearningEvidenceHandlerDependencies): Im3SubmissionLearningEvidenceHandler {
  return {
    process: async ({ learnerId, submissionId }) => {
      if (typeof learnerId !== 'string' || learnerId.trim().length === 0) {
        throw new TypeError('learnerId must be a non-empty authenticated identity');
      }

      const existingReceipt = await receiptStore.findBySubmissionId(learnerId, submissionId);
      if (existingReceipt) return { ...existingReceipt, delivery: 'replay' as const };

      const submission = await loadActivitySubmission(submissionId);
      if (!submission) return { accepted: false, reason: 'submission_not_found' as const };
      if (getSubmissionOwner(submission) !== learnerId) {
        // Do not disclose whether an opaque ID belongs to another learner.
        return { accepted: false, reason: 'submission_not_found' as const };
      }

      if (
        !isExactIm3TeacherLedSubmission(submission)
        && !isExactIm3MasterySubmission(submission)
      ) {
        return { accepted: false, reason: 'submission_not_found' as const };
      }

      const stored = buildIm3StoredEvidence(
        submission,
        learnerId,
        submissionId,
      );
      if (!stored) {
        throw new Error('IM3 server-owned pilot submission has invalid grading metadata');
      }

      const existingEvidence = await evidenceStore.findByIdempotencyKey(
        learnerId,
        stored.evidence.idempotencyKey,
      );
      if (existingEvidence) {
        throw new Error(
          'IM3 learning evidence exists without a submission receipt; refusing replay synthesis',
        );
      }

      const acceptedEvidence = await evidenceStore.listByLearnerAndNode(
        learnerId,
        stored.evidence.nodeId,
        {
          activityId: stored.evidence.activityId,
          origin: stored.evidence.origin,
          occurredAt: stored.evidence.occurredAt,
        },
      );
      const latestAttemptOrdinal = highestAttemptOrdinal(stored.evidence, acceptedEvidence);
      if (
        latestAttemptOrdinal !== null
        && stored.evidence.attemptOrdinal <= latestAttemptOrdinal
      ) {
        return {
          accepted: false,
          reason: 'attempt_ordinal_conflict' as const,
          latestAttemptOrdinal,
          receivedAttemptOrdinal: stored.evidence.attemptOrdinal,
        };
      }

      const decision = evaluateLearningEvidenceV1({
        evidence: stored.evidence,
        acceptedEvidence,
        enabledNodeIds: IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
      });
      if (decision.reason === 'awaiting_teacher_exposure') {
        const receipt: Im3SubmissionReceipt = {
          persisted: false,
          masteryApplied: false,
          kstApplied: false,
          decision,
        };
        await receiptStore.append(learnerId, submissionId, receipt);
        return { ...receipt, delivery: 'new' as const };
      }

      if (decision.idempotency !== 'new' || !isPersistableDecision(decision)) {
        return {
          persisted: false,
          masteryApplied: false,
          kstApplied: false,
          delivery: 'new' as const,
          decision,
        };
      }

      let kstApplied = false;
      if (stored.masteryBearing) {
        await masteryBridge({
          learnerId,
          evidence: stored.evidence,
        });
        kstApplied = true;
      }

      const evidenceId = await evidenceStore.append(
        learnerId,
        stored.evidence,
        submissionId,
      );
      const receipt: Im3SubmissionReceipt = {
        persisted: true,
        masteryApplied: stored.masteryBearing,
        kstApplied,
        decision,
      };
      await receiptStore.append(
        learnerId,
        submissionId,
        receipt,
        evidenceId === undefined ? undefined : String(evidenceId),
      );
      return { ...receipt, delivery: 'new' as const };
    },
  };
}

function toContractEvidence(document: Doc<'learning_evidence'>): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1({
    contractVersion: document.contractVersion,
    nodeId: document.nodeId,
    activityId: document.activityId,
    attemptOrdinal: document.attemptOrdinal,
    origin: document.origin,
    mode: document.mode,
    occurredAt: new Date(document.occurredAt).toISOString(),
    ...(document.gradedEvidence === undefined
      ? {}
      : { gradedEvidence: document.gradedEvidence }),
    idempotencyKey: document.idempotencyKey,
  });
}

function createIm3EvidenceStore(ctx: MutationCtx): Im3LearningEvidenceStore & {
  append(
    learnerId: string,
    evidence: LearningEvidenceV1,
    submissionId?: string,
  ): Promise<Id<'learning_evidence'>>;
} {
  return {
    findByIdempotencyKey: async (learnerId, idempotencyKey) => {
      const document = await ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_and_idempotency_key', (query) => (
          query
            .eq('learnerId', learnerId as Id<'profiles'>)
            .eq('idempotencyKey', idempotencyKey)
        ))
        .unique();
      return document ? toContractEvidence(document) : null;
    },
    listByLearnerAndNode: async (learnerId, nodeId, options) => {
      const documents: Doc<'learning_evidence'>[] = [];
      const seen = new Set<string>();
      const addDocument = (document: Doc<'learning_evidence'> | null) => {
        if (document && !seen.has(String(document._id))) {
          seen.add(String(document._id));
          documents.push(document);
        }
      };
      const occurredAt = options?.occurredAt === undefined
        ? Number.NaN
        : Date.parse(options.occurredAt);
      const latestTeacherQuery = ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_node_origin_occurred_at', (query) => {
          const scoped = query
            .eq('learnerId', learnerId as Id<'profiles'>)
            .eq('nodeId', nodeId)
            .eq('origin', 'teacher_led');
          return Number.isFinite(occurredAt) && typeof scoped.lte === 'function'
            ? scoped.lte('occurredAt', occurredAt)
            : scoped;
        })
        .order('desc');
      addDocument(await latestTeacherQuery.first());

      if (options?.activityId !== undefined && options.origin !== undefined) {
        const latestAttempt = await ctx.db
          .query('learning_evidence')
          .withIndex('by_learner_node_activity_origin_attempt', (query) => (
            query
              .eq('learnerId', learnerId as Id<'profiles'>)
              .eq('nodeId', nodeId)
              .eq('activityId', options.activityId!)
              .eq('origin', options.origin!)
          ))
          .order('desc')
          .first();
        addDocument(latestAttempt);
      }

      return documents.map(toContractEvidence);
    },
    append: async (learnerId, evidence, submissionId) => {
      const occurredAt = Date.parse(evidence.occurredAt);
      if (!Number.isFinite(occurredAt)) {
        throw new TypeError('occurredAt must be a valid ISO timestamp');
      }
      return ctx.db.insert('learning_evidence', {
        learnerId: learnerId as Id<'profiles'>,
        ...(submissionId
          ? { submissionId: submissionId as Id<'activity_submissions'> }
          : {}),
        contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
        nodeId: evidence.nodeId,
        activityId: evidence.activityId,
        attemptOrdinal: evidence.attemptOrdinal,
        origin: evidence.origin,
        mode: evidence.mode,
        occurredAt,
        ...(evidence.gradedEvidence === undefined
          ? {}
          : { gradedEvidence: evidence.gradedEvidence }),
        idempotencyKey: evidence.idempotencyKey,
        createdAt: Date.now(),
      });
    },
  };
}

function createIm3ReceiptStore(ctx: MutationCtx, now: number): Im3SubmissionReceiptStore {
  return {
    findBySubmissionId: async (learnerId, submissionId) => {
      const document = await ctx.db
        .query('learning_evidence_receipts')
        .withIndex('by_learner_and_submission_id', (query) => (
          query
            .eq('learnerId', learnerId as Id<'profiles'>)
            .eq('submissionId', submissionId as Id<'activity_submissions'>)
        ))
        .unique();
      if (!document) return null;
      return {
        persisted: document.persisted,
        masteryApplied: document.masteryApplied,
        kstApplied: document.kstApplied,
        decision: document.decision as Im3LearningEvidenceDecision,
      };
    },
    append: async (learnerId, submissionId, receipt, evidenceId) => {
      await ctx.db.insert('learning_evidence_receipts', {
        learnerId: learnerId as Id<'profiles'>,
        submissionId: submissionId as Id<'activity_submissions'>,
        ...(evidenceId ? { evidenceId: evidenceId as Id<'learning_evidence'> } : {}),
        persisted: receipt.persisted,
        masteryApplied: receipt.masteryApplied,
        kstApplied: receipt.kstApplied,
        decision: receipt.decision,
        createdAt: now,
        updatedAt: now,
      });
    },
  };
}

function createSrsSubmission(evidence: LearningEvidenceV1) {
  const gradedEvidence = evidence.gradedEvidence;
  if (!gradedEvidence) {
    throw new TypeError('IM3 Mastery Advantage SRS processing requires graded evidence');
  }
  const isCorrect = gradedEvidence.isCorrect ?? (
    gradedEvidence.score !== undefined
    && gradedEvidence.maxScore !== undefined
    && gradedEvidence.score === gradedEvidence.maxScore
  );
  return buildPracticeSubmissionEnvelope({
    activityId: toConvexActivityId(evidence.activityId),
    mode: evidence.mode,
    status: 'graded',
    attemptNumber: evidence.attemptOrdinal,
    submittedAt: evidence.occurredAt,
    answers: {},
    parts: [{
      partId: 'learning-evidence-graded-outcome',
      rawAnswer: null,
      isCorrect,
      ...(gradedEvidence.score === undefined ? {} : { score: gradedEvidence.score }),
      ...(gradedEvidence.maxScore === undefined ? {} : { maxScore: gradedEvidence.maxScore }),
    }],
  });
}

async function createSelectedGraphSrsSubmission(
  ctx: MutationCtx,
  learnerId: string,
  evidence: LearningEvidenceV1,
  submissionId: string,
) {
  if (
    evidence.activityId !== IM3_GUIDED_PRACTICE_ACTIVITY_ID
    && evidence.activityId !== IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
  ) {
    return createSrsSubmission(evidence);
  }

  const submission = await ctx.db.get(
    'activity_submissions',
    submissionId as Id<'activity_submissions'>,
  );
  const activity = submission
    ? await ctx.db.get('activities', submission.activityId)
    : null;
  if (!submission || !activity) {
    throw new Error('The IM3 selected graph SRS source submission is missing');
  }

  const gradedParts = submission.submissionData.parts;
  const partGradesAreValid = gradedParts.length > 0 && gradedParts.every((part) => (
    typeof part.score === 'number'
    && Number.isFinite(part.score)
    && typeof part.maxScore === 'number'
    && Number.isFinite(part.maxScore)
    && part.maxScore > 0
    && part.score >= 0
    && part.score <= part.maxScore
    && part.isCorrect === (part.score === part.maxScore)
  ));
  const partScore = gradedParts.reduce((total, part) => total + (part.score ?? Number.NaN), 0);
  const partMaxScore = gradedParts.reduce((total, part) => total + (part.maxScore ?? Number.NaN), 0);
  if (
    !partGradesAreValid
    || !Number.isFinite(partScore)
    || !Number.isFinite(partMaxScore)
    || partScore !== submission.score
    || partMaxScore !== submission.maxScore
  ) {
    throw new Error('The IM3 selected graph SRS stored grade does not match its graded parts');
  }

  const stored = buildIm3StoredEvidence({
    submissionId: String(submission._id),
    userId: String(submission.userId),
    activityId: String(submission.activityId),
    activity: {
      stableActivityId: activity.stableActivityId,
      masteryNodeId: activity.masteryNodeId,
      componentKey: activity.componentKey,
      srsEligible: activity.srsEligible,
      learningEvidenceMode: activity.learningEvidenceMode,
      props: activity.props,
      gradingConfig: activity.gradingConfig,
      approval: activity.approval,
    },
    masteryContractVersion: submission.masteryContractVersion,
    submissionData: submission.submissionData,
    score: submission.score,
    maxScore: submission.maxScore,
    attemptOrdinal: submission.attemptOrdinal,
    submittedAt: submission.submittedAt,
    gradedAt: submission.gradedAt,
  }, learnerId, submissionId);
  if (
    !stored
    || !stored.masteryBearing
    || stored.evidence.nodeId !== evidence.nodeId
    || stored.evidence.activityId !== evidence.activityId
    || stored.evidence.mode !== evidence.mode
    || stored.evidence.attemptOrdinal !== evidence.attemptOrdinal
    || stored.evidence.gradedEvidence?.score !== evidence.gradedEvidence?.score
    || stored.evidence.gradedEvidence?.maxScore !== evidence.gradedEvidence?.maxScore
    || stored.evidence.gradedEvidence?.isCorrect !== evidence.gradedEvidence?.isCorrect
  ) {
    throw new Error('The IM3 selected graph SRS source submission is invalid');
  }

  const data = submission.submissionData;
  return buildPracticeSubmissionEnvelope({
    activityId: toConvexActivityId(String(submission.activityId)),
    mode: data.mode,
    status: data.status,
    attemptNumber: data.attemptNumber,
    submittedAt: data.submittedAt,
    answers: data.answers,
    parts: data.parts,
    artifact: data.artifact,
    interactionHistory: data.interactionHistory,
    analytics: data.analytics,
    studentFeedback: data.studentFeedback,
    teacherSummary: data.teacherSummary,
    timing: data.timing,
  });
}

async function applyIm3SrsReview(
  ctx: MutationCtx,
  learnerId: string,
  evidence: LearningEvidenceV1,
  options: { now: number; submissionId: string },
): Promise<void> {
  const srsSubmission = await createSelectedGraphSrsSubmission(
    ctx,
    learnerId,
    evidence,
    options.submissionId,
  );
  const isSelectedGraphSubmission =
    evidence.activityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
    || evidence.activityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
  const selectedRatingInput = isSelectedGraphSubmission
    ? {
        parts: srsSubmission.parts.map((part) => {
          if (part.isCorrect === undefined) {
            throw new Error('The IM3 selected graph SRS part is not server graded');
          }
          return {
            partId: part.partId,
            isCorrect: part.isCorrect,
            hintsUsed: part.hintsUsed ?? 0,
            revealStepsSeen: 0,
            totalRevealSteps: 0,
            misconceptionTags: part.misconceptionTags ?? [],
          };
        }),
        severityByTag: {},
      }
    : undefined;
  const adapter = new SubmissionSrsAdapter({
    cardStore: new ConvexCardStore(ctx),
    reviewLogStore: new ConvexReviewLogStore(ctx),
    resolver: {
      resolve: async (activityId) => {
        if (activityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID) {
          return {
            variantKey: IM3_PILOT_VARIANT_KEY,
            objectiveId: IM3_PILOT_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_EQUATION_RATE_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_EQUATION_RATE_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_MAXIMUM_READING_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_MAXIMUM_READING_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID) {
          return {
            variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
            objectiveId: IM3_DOMAIN_RANGE_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_DOMAIN_RANGE_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID) {
          return {
            variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
            objectiveId: IM3_DOMAIN_RANGE_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_DOMAIN_RANGE_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_PROFIT_MODEL_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_PROFIT_MODEL_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_PROFIT_MAXIMUM_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_COMPARE_MAXIMUM_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_COMPARE_MAXIMUM_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_SYMMETRY_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_SYMMETRY_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID) {
          return {
            variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
            objectiveId: IM3_TWO_REAL_SOLUTIONS_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_TWO_REAL_SOLUTIONS_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID) {
          return {
            variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
            objectiveId: IM3_PILOT_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID) {
          return {
            variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
            objectiveId: IM3_PILOT_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        if (activityId === IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID) {
          return {
            variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
            objectiveId: IM3_PROFIT_MAXIMUM_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          };
        }
        return activityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
          ? {
            variantKey: IM3_GUIDED_VARIANT_KEY,
            objectiveId: IM3_PILOT_NODE,
            schedulerContext: {
              objectivePriority: 'essential' as const,
              config: { requestRetentionByPriority: {} },
            },
          }
          : null;
      },
    },
    baselineResolver: { getBaseline: async () => null },
    requireAtomicPersistence: true,
  });
  const result = await adapter.processSubmission({
    submission: srsSubmission,
    studentId: learnerId,
    activityId: evidence.activityId,
    now: new Date(options.now).toISOString(),
    submissionId: options.submissionId,
    ...(selectedRatingInput === undefined
      ? {}
      : { ratingInputV31: selectedRatingInput }),
  });
  if (!result.ok || result.skipped) {
    throw new Error('The IM3 learning-evidence SRS boundary rejected eligible evidence');
  }
}

/**
 * Convex-bound opaque submission handler. The caller supplies the learner ID
 * already derived from its authenticated session.
 */
export function createIm3ServerOwnedSubmissionHandler({
  ctx,
  masteryBridge,
  learnerId,
}: {
  readonly ctx: MutationCtx;
  readonly masteryBridge: (input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }) => Promise<void>;
  readonly learnerId: string;
}): Im3ServerOwnedSubmissionLearningEvidenceHandler {
  const handler = createIm3SubmissionLearningEvidenceHandler({
    evidenceStore: createIm3EvidenceStore(ctx),
    receiptStore: createIm3ReceiptStore(ctx, Date.now()),
    loadActivitySubmission: async (submissionId) => {
      const submission = await ctx.db.get(
        'activity_submissions',
        submissionId as Id<'activity_submissions'>,
      );
      if (!submission) return null;
      const activity = await ctx.db.get('activities', submission.activityId);
      if (!activity) return null;
      return {
        submissionId: String(submission._id),
        userId: String(submission.userId),
        activityId: String(submission.activityId),
        activity: {
          stableActivityId: activity.stableActivityId,
          masteryNodeId: activity.masteryNodeId,
          componentKey: activity.componentKey,
          srsEligible: activity.srsEligible,
          learningEvidenceMode: activity.learningEvidenceMode,
          props: activity.props,
          gradingConfig: activity.gradingConfig,
          approval: activity.approval,
        },
        masteryContractVersion: submission.masteryContractVersion,
        submissionData: submission.submissionData,
        score: submission.score,
        maxScore: submission.maxScore,
        attemptOrdinal: submission.attemptOrdinal,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      };
    },
    masteryBridge,
  });

  return {
    process: async ({ submissionId }) => {
      return handler.process({ learnerId, submissionId });
    },
  };
}

type TeacherExposureArgs = {
  teacherId: Id<'profiles'>;
  studentId: Id<'profiles'>;
  classId: Id<'classes'>;
  submissionId: Id<'activity_submissions'>;
  idempotencyKey: string;
};

async function isActivityInPublishedLesson(
  ctx: QueryCtx | MutationCtx,
  lessonId: Id<'lessons'>,
  activityId: Id<'activities'>,
): Promise<boolean> {
  const versions = (await ctx.db.query('lesson_versions')
    .withIndex('by_lesson', (query) => query.eq('lessonId', lessonId)).collect())
    .filter((version) => version.status === 'published')
    .sort((left, right) => right.version - left.version);
  const current = versions[0];
  if (!current) return false;
  const phases = await ctx.db.query('phase_versions')
    .withIndex('by_lesson_version', (query) => query.eq('lessonVersionId', current._id)).collect();
  for (const phase of phases) {
    if (phase.phaseType !== 'worked_example') continue;
    const sections = await ctx.db.query('phase_sections')
      .withIndex('by_phase_version', (query) => query.eq('phaseVersionId', phase._id)).collect();
    if (sections.some((section) => {
      if (section.sectionType !== 'activity') return false;
      const content = section.content as { activityId?: unknown; componentKey?: unknown };
      return String(content.activityId) === String(activityId)
        && content.componentKey === 'graphing-explorer';
    })) return true;
  }
  return false;
}

function isExactIm3GraphWorkedAcknowledgement(
  submission: Doc<'activity_submissions'>,
  activity: Doc<'activities'>,
): boolean {
  const data = submission.submissionData;
  const props = activity.props as { variant?: unknown; equation?: unknown };
  const grading = activity.gradingConfig;
  return submission.masteryContractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
    && Number.isInteger(submission.attemptOrdinal)
    && (submission.attemptOrdinal ?? 0) > 0
    && Number.isFinite(submission.submittedAt)
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.gradedAt === undefined
    && Object.keys(data).sort().join('|') === 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    && data.contractVersion === 'practice.v1'
    && data.activityId === String(activity._id)
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && data.attemptNumber === submission.attemptOrdinal
    && typeof data.submittedAt === 'string'
    && storedTimestampToIso(data.submittedAt) === data.submittedAt
    && Object.keys(data.answers).length === 0
    && data.parts.length === 0
    && Object.keys(props ?? {}).sort().join('|') === 'equation|variant'
    && Object.keys(grading ?? {}).sort().join('|') === 'autoGrade|partialCredit'
    && grading?.autoGrade === false
    && grading.partialCredit === false
    && props.variant === 'plot_from_equation'
    && props.equation === 'f(x) = x^2';
}

export async function recordIm3GraphTeacherExposureHandler(
  ctx: MutationCtx,
  args: TeacherExposureArgs,
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
) {
  const key = args.idempotencyKey.trim();
  if (!key) throw new Error('invalid_exposure');
  if (!isIm3GraphPilotPublished(publication)) throw new Error('unpublished_curriculum');
  const [teacher, student, classroom, enrollment, submission] = await Promise.all([
    ctx.db.get('profiles', args.teacherId),
    ctx.db.get('profiles', args.studentId),
    ctx.db.get('classes', args.classId),
    ctx.db.query('class_enrollments').withIndex('by_class_and_student', (query) => (
      query.eq('classId', args.classId).eq('studentId', args.studentId)
    )).unique(),
    ctx.db.get('activity_submissions', args.submissionId),
  ]);
  if (
    !teacher || teacher.role !== 'teacher'
    || !student || student.role !== 'student'
    || student.organizationId !== teacher.organizationId
    || !classroom || classroom.teacherId !== args.teacherId || classroom.archived
    || enrollment?.status !== 'active'
  ) throw new Error('unauthorized_exposure');
  if (!submission || submission.userId !== args.studentId) {
    throw new Error('invalid_source_submission');
  }
  const activity = await ctx.db.get('activities', submission.activityId);
  if (
    !activity
    || activity.masteryNodeId !== IM3_PILOT_NODE
    || activity.stableActivityId !== IM3_TEACHER_LED_ACTIVITY_ID
    || activity.componentKey !== 'graphing-explorer'
    || activity.learningEvidenceMode !== 'worked_example'
    || activity.srsEligible !== false
    || activity.approval?.status !== 'approved'
    || !isExactIm3GraphWorkedAcknowledgement(submission, activity)
  ) throw new Error('invalid_source_submission');
  const lesson = await ctx.db.query('lessons')
    .withIndex('by_slug', (query) => query.eq('slug', 'module-1-lesson-1'))
    .unique();
  const assignment = lesson
    ? await ctx.db.query('class_lessons')
      .withIndex('by_class_and_lesson', (query) => (
        query.eq('classId', args.classId).eq('lessonId', lesson._id)
      )).unique()
    : null;
  if (
    !assignment
    || !lesson
    || !await isActivityInPublishedLesson(ctx, lesson._id, activity._id)
    || submission.submittedAt < Math.max(enrollment.enrolledAt, assignment.assignedAt)
  ) throw new Error('invalid_source_assignment');
  const sourceRows = await ctx.db.query('learning_evidence')
    .withIndex('by_learner_and_submission_id', (query) => (
      query.eq('learnerId', args.studentId).eq('submissionId', args.submissionId)
    )).collect();
  const sameSource = sourceRows.find((row) => row.origin === 'teacher_led');
  const existing = await ctx.db.query('learning_evidence')
    .withIndex('by_learner_and_idempotency_key', (query) => (
      query.eq('learnerId', args.studentId).eq('idempotencyKey', key)
    )).unique();
  const isCanonicalReplay = (row: Doc<'learning_evidence'>) => (
    row.submissionId === args.submissionId
    && row.contractVersion === IM3_LEARNING_EVIDENCE_CONTRACT_VERSION
    && row.nodeId === IM3_PILOT_NODE
    && row.activityId === IM3_TEACHER_LED_ACTIVITY_ID
    && row.attemptOrdinal === submission.attemptOrdinal
    && row.origin === 'teacher_led'
    && row.mode === 'teaching'
  );
  if (existing) {
    if (!isCanonicalReplay(existing)) {
      throw new Error('idempotency_conflict');
    }
    return { evidenceId: existing._id, replay: true };
  }
  if (sameSource) {
    if (!isCanonicalReplay(sameSource)) throw new Error('idempotency_conflict');
    return { evidenceId: sameSource._id, replay: true };
  }
  const now = Date.now();
  const evidenceId = await ctx.db.insert('learning_evidence', {
    learnerId: args.studentId,
    submissionId: args.submissionId,
    contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
    nodeId: IM3_PILOT_NODE,
    activityId: IM3_TEACHER_LED_ACTIVITY_ID,
    attemptOrdinal: submission.attemptOrdinal ?? 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: now,
    idempotencyKey: key,
    createdAt: now,
  });
  return { evidenceId, replay: false };
}

export const recordIm3GraphTeacherExposure = internalMutation({
  args: {
    teacherId: v.id('profiles'), studentId: v.id('profiles'), classId: v.id('classes'),
    submissionId: v.id('activity_submissions'), idempotencyKey: v.string(),
  },
  returns: v.object({ evidenceId: v.id('learning_evidence'), replay: v.boolean() }),
  handler: recordIm3GraphTeacherExposureHandler,
});

export async function getIm3GraphTeacherExposureCandidatesHandler(
  ctx: QueryCtx,
  args: { teacherId: Id<'profiles'> },
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
) {
  if (!isIm3GraphPilotPublished(publication)) return [];
  const teacher = await ctx.db.get('profiles', args.teacherId);
  if (!teacher || teacher.role !== 'teacher') return [];
  const lesson = await ctx.db.query('lessons')
    .withIndex('by_slug', (query) => query.eq('slug', 'module-1-lesson-1')).unique();
  const activity = await ctx.db.query('activities')
    .withIndex('by_stable_activity_id', (query) => query.eq('stableActivityId', IM3_TEACHER_LED_ACTIVITY_ID))
    .unique();
  if (!lesson || !activity || activity.approval?.status !== 'approved'
    || activity.componentKey !== 'graphing-explorer' || activity.srsEligible !== false
    || activity.masteryNodeId !== IM3_PILOT_NODE || activity.learningEvidenceMode !== 'worked_example') return [];
  if (!await isActivityInPublishedLesson(ctx, lesson._id, activity._id)) return [];
  const classes = (await ctx.db.query('classes')
    .withIndex('by_teacher', (query) => query.eq('teacherId', args.teacherId)).collect())
    .filter((row) => !row.archived);
  const candidates = [];
  for (const classroom of classes) {
    const assignment = await ctx.db.query('class_lessons')
      .withIndex('by_class_and_lesson', (query) => (
        query.eq('classId', classroom._id).eq('lessonId', lesson._id)
      )).unique();
    if (!assignment) continue;
    const enrollments = (await ctx.db.query('class_enrollments')
      .withIndex('by_class', (query) => query.eq('classId', classroom._id)).collect())
      .filter((row) => row.status === 'active');
    for (const enrollment of enrollments) {
      const student = await ctx.db.get('profiles', enrollment.studentId);
      if (!student || student.role !== 'student' || student.organizationId !== teacher.organizationId) continue;
      const submissions = await ctx.db.query('activity_submissions')
        .withIndex('by_user_and_activity', (query) => (
          query.eq('userId', enrollment.studentId).eq('activityId', activity._id)
        )).collect();
      for (const submission of submissions) {
        if (submission.submittedAt < Math.max(enrollment.enrolledAt, assignment.assignedAt)) continue;
        if (!isExactIm3GraphWorkedAcknowledgement(submission, activity)) continue;
        const evidence = await ctx.db.query('learning_evidence')
          .withIndex('by_learner_and_submission_id', (query) => (
            query.eq('learnerId', enrollment.studentId).eq('submissionId', submission._id)
          )).collect();
        if (evidence.some((row) => row.origin === 'teacher_led')) continue;
        candidates.push({
          classId: classroom._id, studentId: enrollment.studentId, submissionId: submission._id,
          className: classroom.name, studentName: student.displayName ?? student.username,
          lessonTitle: lesson.title, response: JSON.stringify(submission.submissionData),
          score: submission.score ?? null, maxScore: submission.maxScore ?? null,
          submittedAt: submission.submittedAt,
        });
      }
    }
  }
  return candidates;
}

export const getIm3GraphTeacherExposureCandidates = internalQuery({
  args: { teacherId: v.id('profiles') },
  returns: v.array(v.object({
    classId: v.id('classes'), studentId: v.id('profiles'), submissionId: v.id('activity_submissions'),
    className: v.string(), studentName: v.string(), lessonTitle: v.string(), response: v.string(),
    score: v.union(v.number(), v.null()), maxScore: v.union(v.number(), v.null()), submittedAt: v.number(),
  })),
  handler: getIm3GraphTeacherExposureCandidatesHandler,
});

export async function submitIm3PublishedEvidenceHandler(
  ctx: MutationCtx,
  args: { learnerId: Id<'profiles'>; submissionId: Id<'activity_submissions'> },
  publication: Im3GraphPilotPublication = currentIm3GraphPilotPublication,
) {
  const submission = await ctx.db.get('activity_submissions', args.submissionId);
  const activity = submission ? await ctx.db.get('activities', submission.activityId) : null;
  const isExactGraphActivity = activity?.masteryNodeId === IM3_PILOT_NODE
    && typeof activity.stableActivityId === 'string'
    && activity.stableActivityId.startsWith(`${IM3_PILOT_NODE}.`);
  if (isExactGraphActivity && !isIm3GraphPilotPublished(publication)) {
    throw new Error('unpublished_curriculum');
  }
  const serverNow = Date.now();
  const handler = createIm3ServerOwnedSubmissionHandler({
    ctx, learnerId: String(args.learnerId),
    masteryBridge: async ({ learnerId, evidence }) => {
      const marker = ':submission:';
      const markerIndex = evidence.idempotencyKey.lastIndexOf(marker);
      const submissionId = markerIndex >= 0
        ? evidence.idempotencyKey.slice(markerIndex + marker.length)
        : String(args.submissionId);
      await applyIm3SrsReview(ctx, learnerId, evidence, { now: serverNow, submissionId });
    },
  });
  return handler.process({ submissionId: String(args.submissionId) });
}

/** Internal mutation called by the authenticated opaque submission route. */
export const submit = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: learningEvidenceResultValidator,
  handler: submitIm3PublishedEvidenceHandler,
});
