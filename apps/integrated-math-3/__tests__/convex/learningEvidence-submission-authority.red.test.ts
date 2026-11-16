import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';
import { getGenerator } from '@math-platform/math-content/knowledge-space';

import { createIm3SubmissionLearningEvidenceHandler } from '@/convex/learningEvidence';
import {
  buildIm3DomainRangeGuidedSeed2Documents,
  buildIm3DomainRangeIndependentSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3ProfitMaximumIndependentSeedDocuments,
  buildIm3ProfitModelIndependentSeedDocuments,
  buildIm3CompareMaximumGuidedSeedDocuments,
  buildIm3CompareMaximumIndependentSeedDocuments,
  buildIm3CompareMaximumWorkedSeedDocument,
  buildIm3SymmetryGuidedSeedDocuments,
  buildIm3SymmetryIndependentSeedDocuments,
  buildIm3SymmetryWorkedSeedDocument,
} from '@/convex/seed/seed_lesson_1_1';
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

const LEARNER_ID = 'im3-owned-submission-learner';
const SUBMISSION_ID = 'im3-opaque-activity-submission';
const PILOT_NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';
const PILOT_STABLE_ACTIVITY_ID = `${PILOT_NODE_ID}.independent_practice`;
const PILOT_ACTIVITY_DOCUMENT_ID = 'im3-pilot-activity-document';
const GUIDED_STABLE_ACTIVITY_ID = IM3_GUIDED_PRACTICE_ACTIVITY_ID;
const GUIDED_ACTIVITY_DOCUMENT_ID = 'im3-guided-activity-document';
const GUIDED_SUBMISSION_ID = 'im3-guided-opaque-activity-submission';
const EQUATION_GUIDED_ACTIVITY_DOCUMENT_ID = 'im3-equation-guided-activity-document';
const EQUATION_GUIDED_SUBMISSION_ID = 'im3-equation-guided-opaque-activity-submission';
const EQUATION_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'im3-equation-independent-activity-document';
const EQUATION_INDEPENDENT_SUBMISSION_ID = 'im3-equation-independent-opaque-activity-submission';
const DOMAIN_RANGE_GUIDED_ACTIVITY_DOCUMENT_ID = 'im3-domain-range-guided-activity-document';
const DOMAIN_RANGE_GUIDED_SUBMISSION_ID = 'im3-domain-range-guided-opaque-activity-submission';
const DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID = 'im3-domain-range-guided-seed-2-activity-document';
const DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID = 'im3-domain-range-guided-seed-2-opaque-activity-submission';
const DOMAIN_RANGE_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'im3-domain-range-independent-activity-document';
const DOMAIN_RANGE_INDEPENDENT_SUBMISSION_ID = 'im3-domain-range-independent-opaque-activity-submission';
const DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID = 'im3-domain-range-independent-seed-2-activity-document';
const DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID = 'im3-domain-range-independent-seed-2-opaque-activity-submission';
const PROFIT_MODEL_GUIDED_ACTIVITY_DOCUMENT_ID = 'im3-profit-model-guided-activity-document';
const PROFIT_MODEL_GUIDED_SUBMISSION_ID = 'im3-profit-model-guided-opaque-activity-submission';
const PROFIT_MODEL_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'im3-profit-model-independent-activity-document';
const PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID = 'im3-profit-model-independent-opaque-activity-submission';
const PROFIT_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID = 'im3-profit-maximum-guided-activity-document';
const PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID = 'im3-profit-maximum-guided-opaque-activity-submission';
const PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'im3-profit-maximum-independent-activity-document';
const PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID = 'im3-profit-maximum-independent-opaque-activity-submission';
const GRAPH_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID = 'im3-graph-guided-seed-2-activity-document';
const GRAPH_GUIDED_SEED_2_SUBMISSION_ID = 'im3-graph-guided-seed-2-opaque-activity-submission';
const GRAPH_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID = 'im3-graph-independent-seed-2-activity-document';
const GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID = 'im3-graph-independent-seed-2-opaque-activity-submission';
const SYMMETRY_GUIDED_ACTIVITY_DOCUMENT_ID = 'im3-symmetry-guided-activity-document';
const SYMMETRY_GUIDED_SUBMISSION_ID = 'im3-symmetry-guided-opaque-activity-submission';
const SYMMETRY_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'im3-symmetry-independent-activity-document';
const SYMMETRY_INDEPENDENT_SUBMISSION_ID = 'im3-symmetry-independent-opaque-activity-submission';
const SYMMETRY_WORKED_ACTIVITY_DOCUMENT_ID = 'im3-symmetry-worked-activity-document';
const SYMMETRY_WORKED_SUBMISSION_ID = 'im3-symmetry-worked-opaque-activity-submission';
const COMPARE_MAXIMUM_WORKED_ACTIVITY_DOCUMENT_ID = 'im3-compare-maximum-worked-activity-document';
const COMPARE_MAXIMUM_WORKED_SUBMISSION_ID = 'im3-compare-maximum-worked-opaque-activity-submission';
const COMPARE_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID = 'im3-compare-maximum-guided-activity-document';
const COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID = 'im3-compare-maximum-guided-opaque-activity-submission';
const COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'im3-compare-maximum-independent-activity-document';
const COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID = 'im3-compare-maximum-independent-opaque-activity-submission';
const PILOT_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: PILOT_NODE_ID,
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GUIDED_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: PILOT_NODE_ID,
  seed: 1,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GRAPH_GUIDED_SEED_2_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: PILOT_NODE_ID,
  seed: 2,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GRAPH_INDEPENDENT_SEED_2_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: PILOT_NODE_ID,
  seed: 3,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const INCORRECT_PILOT_TABLE = PILOT_POINTS.map((point, index) => (
  index === 0 ? { ...point, y: point.y + 1 } : point
));

type ActivitySubmission = {
  submissionId: string;
  userId: string;
  activityId: string;
  activity: {
    stableActivityId: string;
    masteryNodeId: string;
    componentKey: string;
    learningEvidenceMode?: 'worked_example';
    srsEligible: boolean;
  };
  masteryContractVersion: 'learning-evidence.v1';
  attemptOrdinal: number;
  submissionData: {
    contractVersion: 'practice.v1';
    activityId: string;
    attemptNumber: number;
    mode: LearningEvidenceV1['mode'];
    submittedAt: string;
    status: 'graded';
    answers: Record<string, unknown>;
    parts: Array<{
      partId: string;
      rawAnswer: unknown;
      isCorrect?: boolean;
      score?: number;
      maxScore?: number;
      misconceptionTags?: string[];
    }>;
    artifact?: {
      graphState: {
        equation: string;
        vertex: [number, number];
        yIntercept: [number, number];
        placedPoints: Array<{ x: number; y: number }>;
        domain: [number, number];
        range: [number, number];
      };
    };
  };
  score: number;
  maxScore: number;
  submittedAt: number;
  gradedAt: number;
};

type UngradedWorkedSubmission = Omit<
  ActivitySubmission,
  'submissionData' | 'score' | 'maxScore' | 'gradedAt'
> & {
  submissionData: Omit<ActivitySubmission['submissionData'], 'status'> & {
    status: 'submitted';
  };
  score?: undefined;
  maxScore?: undefined;
  gradedAt?: undefined;
};

type SubmissionDecision = {
  idempotency: 'new' | 'replay';
  exposureState: 'introduced' | 'awaiting_teacher_exposure';
  eligible: boolean;
  reason: 'eligible' | 'awaiting_teacher_exposure' | 'node_not_enabled';
  masteryBearing: boolean;
};

type SubmissionReceipt = {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: SubmissionDecision;
};

type EvidenceStore = {
  findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null>;
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(
    learnerId: string,
    evidence: LearningEvidenceV1,
    submissionId: string,
  ): Promise<string>;
};

type ReceiptStore = {
  findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<SubmissionReceipt | null>;
  append(
    learnerId: string,
    submissionId: string,
    receipt: SubmissionReceipt,
    evidenceId?: string,
  ): Promise<void>;
};

class InMemoryEvidenceStore implements EvidenceStore {
  readonly events: Array<{
    learnerId: string;
    evidence: LearningEvidenceV1;
    submissionId?: string;
  }> = [];

  constructor(private readonly effectOrder: string[]) {}

  async findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null> {
    return this.events.find((entry) => (
      entry.learnerId === learnerId
      && entry.evidence.idempotencyKey === idempotencyKey
    ))?.evidence ?? null;
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]> {
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(
    learnerId: string,
    evidence: LearningEvidenceV1,
    submissionId: string,
  ): Promise<string> {
    this.events.push({ learnerId, evidence, submissionId });
    this.effectOrder.push('evidence');
    return `evidence-${this.events.length}`;
  }
}

class InMemoryReceiptStore implements ReceiptStore {
  readonly receipts = new Map<string, SubmissionReceipt>();

  constructor(private readonly effectOrder: string[]) {}

  async findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<SubmissionReceipt | null> {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(
    learnerId: string,
    submissionId: string,
    receipt: SubmissionReceipt,
    _evidenceId?: string,
  ): Promise<void> {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
    this.effectOrder.push('receipt');
  }
}

function makeTeacherExposure(
  overrides: Partial<LearningEvidenceV1> = {},
): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: `${PILOT_NODE_ID}.worked_example`,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'im3-teacher-exposure-before-owned-submission',
    ...overrides,
  };
}

function makeSubmission(overrides: Partial<ActivitySubmission> = {}): ActivitySubmission {
  return {
    submissionId: SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: PILOT_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: PILOT_STABLE_ACTIVITY_ID,
      masteryNodeId: PILOT_NODE_ID,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: 'client-supplied-activity-id',
      attemptNumber: 99,
      mode: 'independent_practice',
      submittedAt: '2026-08-19T11:00:00.000Z',
      status: 'graded',
      answers: {
        tableValues: INCORRECT_PILOT_TABLE,
        placedPoints: [],
      },
      parts: [
        { partId: 'table_values', rawAnswer: INCORRECT_PILOT_TABLE, isCorrect: false, score: 0, maxScore: 1 },
        { partId: 'placed_points', rawAnswer: [], isCorrect: false, score: 0, maxScore: 1 },
      ],
    },
    score: 0,
    maxScore: 2,
    submittedAt: Date.parse('2026-08-19T11:00:00.000Z'),
    gradedAt: Date.parse('2026-08-19T10:05:00.000Z'),
    ...overrides,
  };
}

function makeSymmetryWorkedExposure(): LearningEvidenceV1 {
  const worked = buildIm3SymmetryWorkedSeedDocument(0);
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: worked.masteryNodeId,
    activityId: worked.stableActivityId,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-20T14:00:00.000Z',
    idempotencyKey: 'im3-symmetry-worked-exposure-before-owned-submission',
  };
}

function makeCompareMaximumWorkedExposure(): LearningEvidenceV1 {
  const worked = buildIm3CompareMaximumWorkedSeedDocument(0);
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: worked.masteryNodeId,
    activityId: worked.stableActivityId,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-20T14:00:00.000Z',
    idempotencyKey: 'im3-compare-maximum-worked-exposure-before-practice-submission',
  };
}

function makeSymmetryWorkedSubmission(): UngradedWorkedSubmission {
  const worked = buildIm3SymmetryWorkedSeedDocument(0);
  return {
    submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: SYMMETRY_WORKED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: worked.stableActivityId,
      masteryNodeId: worked.masteryNodeId,
      componentKey: worked.componentKey,
      learningEvidenceMode: worked.learningEvidenceMode,
      srsEligible: worked.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 1,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: SYMMETRY_WORKED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 1,
      mode: 'worked_example',
      submittedAt: '2026-08-20T14:30:00.000Z',
      status: 'submitted',
      answers: {},
      parts: [],
    },
    submittedAt: Date.parse('2026-08-20T14:31:00.000Z'),
  };
}

function makeCompareMaximumWorkedSubmission(): UngradedWorkedSubmission {
  const worked = buildIm3CompareMaximumWorkedSeedDocument(0);
  return {
    submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: worked.stableActivityId,
      masteryNodeId: worked.masteryNodeId,
      componentKey: worked.componentKey,
      learningEvidenceMode: worked.learningEvidenceMode,
      srsEligible: worked.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 1,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 1,
      mode: 'worked_example',
      submittedAt: '2026-08-20T14:30:00.000Z',
      status: 'submitted',
      answers: {},
      parts: [],
    },
    submittedAt: Date.parse('2026-08-20T14:31:00.000Z'),
  };
}

function makeCompareMaximumGuidedSubmission(): ActivitySubmission {
  const documents = buildIm3CompareMaximumGuidedSeedDocuments(
    COMPARE_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T15:00:00.000Z'),
  );
  const generated = getGenerator('quadratic-graph-analysis').generate({
    nodeId: IM3_COMPARE_MAXIMUM_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const answer = generated.expectedAnswer.greater_maximum as 'first' | 'second';
  return {
    submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: COMPARE_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: documents.activity.stableActivityId,
      masteryNodeId: documents.activity.masteryNodeId,
      componentKey: documents.activity.componentKey,
      srsEligible: documents.activity.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: COMPARE_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T15:00:00.000Z',
      status: 'graded',
      answers: { greater_maximum: answer },
      parts: [{
        partId: 'greater_maximum',
        rawAnswer: answer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse('2026-08-20T15:01:00.000Z'),
    gradedAt: Date.parse('2026-08-20T15:05:00.000Z'),
  };
}

function makeCompareMaximumIndependentSubmission(): ActivitySubmission {
  const documents = buildIm3CompareMaximumIndependentSeedDocuments(
    COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T16:00:00.000Z'),
  );
  const generated = getGenerator('quadratic-graph-analysis').generate({
    nodeId: IM3_COMPARE_MAXIMUM_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const answer = generated.expectedAnswer.greater_maximum as 'first' | 'second';
  return {
    submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: documents.activity.stableActivityId,
      masteryNodeId: documents.activity.masteryNodeId,
      componentKey: documents.activity.componentKey,
      srsEligible: documents.activity.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 3,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T16:00:00.000Z',
      status: 'graded',
      answers: { greater_maximum: answer },
      parts: [{
        partId: 'greater_maximum',
        rawAnswer: answer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse('2026-08-20T16:01:00.000Z'),
    gradedAt: Date.parse('2026-08-20T16:05:00.000Z'),
  };
}

function makeSymmetryGuidedSubmission(): ActivitySubmission {
  const documents = buildIm3SymmetryGuidedSeedDocuments(
    SYMMETRY_GUIDED_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T15:00:00.000Z'),
  );
  const generated = getGenerator('quadratic-graph-analysis').generate({
    nodeId: IM3_SYMMETRY_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props = documents.activity.props as {
    equation: string;
    vertex: [number, number];
    yIntercept: [number, number];
    domain: [number, number];
    range: [number, number];
  };
  const points = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
  return {
    submissionId: SYMMETRY_GUIDED_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: SYMMETRY_GUIDED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: documents.activity.stableActivityId,
      masteryNodeId: documents.activity.masteryNodeId,
      componentKey: documents.activity.componentKey,
      srsEligible: documents.activity.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 1,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: SYMMETRY_GUIDED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 1,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T15:00:00.000Z',
      status: 'graded',
      answers: { placed_points: points },
      parts: [{
        partId: 'placed_points',
        rawAnswer: points,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
      artifact: {
        graphState: {
          equation: props.equation,
          vertex: props.vertex,
          yIntercept: props.yIntercept,
          placedPoints: points,
          domain: props.domain,
          range: props.range,
        },
      },
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse('2026-08-20T15:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T15:05:00.000Z'),
  };
}

function makeSymmetryIndependentSubmission(): ActivitySubmission {
  const documents = buildIm3SymmetryIndependentSeedDocuments(
    SYMMETRY_INDEPENDENT_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T16:00:00.000Z'),
  );
  const generated = getGenerator('quadratic-graph-analysis').generate({
    nodeId: IM3_SYMMETRY_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const props = documents.activity.props as {
    equation: string;
    vertex: [number, number];
    yIntercept: [number, number];
    domain: [number, number];
    range: [number, number];
  };
  const points = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
  return {
    submissionId: SYMMETRY_INDEPENDENT_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: SYMMETRY_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: documents.activity.stableActivityId,
      masteryNodeId: documents.activity.masteryNodeId,
      componentKey: documents.activity.componentKey,
      srsEligible: documents.activity.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 1,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: SYMMETRY_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 1,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T16:00:00.000Z',
      status: 'graded',
      answers: { placed_points: points },
      parts: [{
        partId: 'placed_points',
        rawAnswer: points,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
      artifact: {
        graphState: {
          equation: props.equation,
          vertex: props.vertex,
          yIntercept: props.yIntercept,
          placedPoints: points,
          domain: props.domain,
          range: props.range,
        },
      },
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse('2026-08-20T16:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T16:05:00.000Z'),
  };
}

function makeGuidedSubmission(overrides: Partial<ActivitySubmission> = {}): ActivitySubmission {
  return makeSubmission({
    submissionId: GUIDED_SUBMISSION_ID,
    activityId: GUIDED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: GUIDED_STABLE_ACTIVITY_ID,
      masteryNodeId: PILOT_NODE_ID,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    },
    submissionData: {
      ...makeSubmission().submissionData,
      activityId: 'client-supplied-guided-activity-id',
      mode: 'guided_practice',
      answers: {
        tableValues: GUIDED_POINTS,
        placedPoints: GUIDED_POINTS,
      },
      parts: [
        { partId: 'table_values', rawAnswer: GUIDED_POINTS, isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'placed_points', rawAnswer: GUIDED_POINTS, isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 2,
    maxScore: 2,
    ...overrides,
  });
}

function makeGraphGuidedSeed2Submission(
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  return makeSubmission({
    submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
    activityId: GRAPH_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: PILOT_NODE_ID,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: GRAPH_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T18:00:00.000Z',
      status: 'graded',
      answers: {
        tableValues: GRAPH_GUIDED_SEED_2_POINTS,
        placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
      },
      parts: [
        { partId: 'table_values', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'placed_points', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 2,
    maxScore: 2,
    submittedAt: Date.parse('2026-08-20T18:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T18:05:00.000Z'),
    ...overrides,
  });
}

function makeGraphIndependentSeed2Submission(
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  const generated = buildIm3GraphIndependentSeed2Documents(
    GRAPH_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T19:00:00.000Z'),
    { nodeReviewStatus: 'approved', blueprintReviewStatus: 'approved' },
  );
  const points = GRAPH_INDEPENDENT_SEED_2_POINTS;
  return makeSubmission({
    submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
    activityId: GRAPH_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: generated.activity.stableActivityId,
      masteryNodeId: generated.activity.masteryNodeId,
      componentKey: generated.activity.componentKey,
      srsEligible: generated.activity.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: GRAPH_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 3,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T19:00:00.000Z',
      status: 'graded',
      answers: {
        tableValues: points,
        placedPoints: points,
      },
      parts: [
        { partId: 'table_values', rawAnswer: points, isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'placed_points', rawAnswer: points, isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 2,
    maxScore: 2,
    submittedAt: Date.parse('2026-08-20T19:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T19:05:00.000Z'),
    ...overrides,
  });
}

function makeEquationWorkedExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: IM3_EQUATION_RATE_NODE,
    activityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-20T09:00:00.000Z',
    idempotencyKey: 'im3-equation-worked-exposure-before-guided-submission',
  };
}

function makeEquationGuidedSubmission(): ActivitySubmission {
  return {
    submissionId: EQUATION_GUIDED_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: EQUATION_GUIDED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      componentKey: 'rate-of-change-calculator',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: EQUATION_GUIDED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T10:00:00.000Z',
      status: 'graded',
      answers: { fA: 24, fB: 0, rate: -8 },
      parts: [
        { partId: 'f_a', rawAnswer: 24, isCorrect: true, score: 2, maxScore: 2 },
        { partId: 'f_b', rawAnswer: 0, isCorrect: true, score: 2, maxScore: 2 },
        { partId: 'rate', rawAnswer: -8, isCorrect: true, score: 3, maxScore: 3 },
      ],
    },
    score: 7,
    maxScore: 7,
    submittedAt: Date.parse('2026-08-20T10:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T10:05:00.000Z'),
  };
}

function makeEquationIndependentSubmission(): ActivitySubmission {
  return {
    submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: EQUATION_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      componentKey: 'rate-of-change-calculator',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: EQUATION_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 3,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T11:00:00.000Z',
      status: 'graded',
      answers: { fA: -2, fB: -26, rate: -6 },
      parts: [
        { partId: 'f_a', rawAnswer: -2, isCorrect: true, score: 2, maxScore: 2 },
        { partId: 'f_b', rawAnswer: -26, isCorrect: true, score: 2, maxScore: 2 },
        { partId: 'rate', rawAnswer: -6, isCorrect: true, score: 3, maxScore: 3 },
      ],
    },
    score: 7,
    maxScore: 7,
    submittedAt: Date.parse('2026-08-20T11:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T11:05:00.000Z'),
  };
}

function makeDomainRangeWorkedExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: IM3_DOMAIN_RANGE_NODE,
    activityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-20T12:00:00.000Z',
    idempotencyKey: 'im3-domain-range-worked-exposure-before-practice-submission',
  };
}

function makeDomainRangeGuidedSubmission(): ActivitySubmission {
  return {
    submissionId: DOMAIN_RANGE_GUIDED_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: DOMAIN_RANGE_GUIDED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: DOMAIN_RANGE_GUIDED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T13:00:00.000Z',
      status: 'graded',
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: -2.25 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'range', rawAnswer: { relation: 'gte', boundary: -2.25 }, isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 2,
    maxScore: 2,
    submittedAt: Date.parse('2026-08-20T13:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T13:05:00.000Z'),
  };
}

function makeDomainRangeGuidedSeed2Submission(): ActivitySubmission {
  const generated = buildIm3DomainRangeGuidedSeed2Documents(
    DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T13:30:00.000Z'),
  );
  return {
    submissionId: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: generated.activity.stableActivityId,
      masteryNodeId: generated.activity.masteryNodeId,
      componentKey: generated.activity.componentKey,
      srsEligible: generated.activity.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T13:30:00.000Z',
      status: 'graded',
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'lte', boundary: -0.75 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'range', rawAnswer: { relation: 'lte', boundary: -0.75 }, isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 2,
    maxScore: 2,
    submittedAt: Date.parse('2026-08-20T13:30:00.000Z'),
    gradedAt: Date.parse('2026-08-20T13:35:00.000Z'),
  };
}

function makeDomainRangeIndependentSubmission(): ActivitySubmission {
  return {
    submissionId: DOMAIN_RANGE_INDEPENDENT_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 3,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T14:00:00.000Z',
      status: 'graded',
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'lte', boundary: -1 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'range', rawAnswer: { relation: 'lte', boundary: -1 }, isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 2,
    maxScore: 2,
    submittedAt: Date.parse('2026-08-20T14:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T14:05:00.000Z'),
  };
}

function makeDomainRangeIndependentSeed2Submission(): ActivitySubmission {
  const generated = buildIm3DomainRangeIndependentSeed2Documents(
    DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T14:30:00.000Z'),
  );
  return {
    submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: generated.activity.stableActivityId,
      masteryNodeId: generated.activity.masteryNodeId,
      componentKey: generated.activity.componentKey,
      srsEligible: generated.activity.srsEligible,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T14:30:00.000Z',
      status: 'graded',
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: 1.75 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'range', rawAnswer: { relation: 'gte', boundary: 1.75 }, isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 2,
    maxScore: 2,
    submittedAt: Date.parse('2026-08-20T14:30:00.000Z'),
    gradedAt: Date.parse('2026-08-20T14:35:00.000Z'),
  };
}

function makeProfitModelWorkedExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: IM3_PROFIT_MODEL_NODE,
    activityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-20T15:00:00.000Z',
    idempotencyKey: 'im3-profit-model-worked-exposure-before-guided-submission',
  };
}

function makeProfitMaximumWorkedExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: IM3_PROFIT_MAXIMUM_NODE,
    activityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-20T15:30:00.000Z',
    idempotencyKey: 'im3-profit-maximum-worked-exposure-before-guided-submission',
  };
}

function makeProfitModelGuidedSubmission(
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  return makeSubmission({
    submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
    activityId: PROFIT_MODEL_GUIDED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      componentKey: 'fill-in-the-blank',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: PROFIT_MODEL_GUIDED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T16:00:00.000Z',
      status: 'graded',
      answers: {
        priceBase: '230',
        priceStep: '10',
        salesBase: '270',
        salesLoss: '10',
        coefficientA: '-100',
        coefficientB: '400',
        coefficientC: '62100',
      },
      parts: [
        { partId: 'priceBase', rawAnswer: '230', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'priceStep', rawAnswer: '10', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'salesBase', rawAnswer: '270', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'salesLoss', rawAnswer: '10', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'coefficientA', rawAnswer: '-100', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'coefficientB', rawAnswer: '400', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'coefficientC', rawAnswer: '62100', isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 7,
    maxScore: 7,
    submittedAt: Date.parse('2026-08-20T16:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T16:05:00.000Z'),
    ...overrides,
  });
}

function makeProfitMaximumGuidedSubmission(
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  const generated = buildIm3ProfitMaximumGuidedSeedDocuments(
    PROFIT_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T16:30:00.000Z'),
  );
  const blanks = generated.activity.props.blanks;
  return makeSubmission({
    submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
    activityId: PROFIT_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      componentKey: 'fill-in-the-blank',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: PROFIT_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T16:30:00.000Z',
      status: 'graded',
      answers: Object.fromEntries(blanks.map((blank) => [blank.id, {
        answer: blank.correctAnswer,
        isCorrect: false,
        usedWordBank: true,
      }])),
      parts: blanks.map((blank) => ({
        partId: blank.id,
        rawAnswer: blank.correctAnswer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    },
    score: 3,
    maxScore: 3,
    submittedAt: Date.parse('2026-08-20T16:30:00.000Z'),
    gradedAt: Date.parse('2026-08-20T16:35:00.000Z'),
    ...overrides,
  });
}

function makeProfitMaximumIndependentSubmission(
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  const generated = buildIm3ProfitMaximumIndependentSeedDocuments(
    PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T17:00:00.000Z'),
  );
  const blanks = generated.activity.props.blanks;
  return makeSubmission({
    submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    activityId: PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      componentKey: 'fill-in-the-blank',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 3,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T17:00:00.000Z',
      status: 'graded',
      answers: Object.fromEntries(blanks.map((blank) => [blank.id, {
        answer: blank.correctAnswer,
        isCorrect: false,
        usedWordBank: true,
      }])),
      parts: blanks.map((blank) => ({
        partId: blank.id,
        rawAnswer: blank.correctAnswer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    },
    score: 3,
    maxScore: 3,
    submittedAt: Date.parse('2026-08-20T17:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T17:05:00.000Z'),
    ...overrides,
  });
}

function makeProfitModelIndependentSubmission(
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  const generated = buildIm3ProfitModelIndependentSeedDocuments(
    PROFIT_MODEL_INDEPENDENT_ACTIVITY_DOCUMENT_ID as never,
    Date.parse('2026-08-20T17:00:00.000Z'),
  );
  const blanks = generated.activity.props.blanks;
  return makeSubmission({
    submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
    activityId: PROFIT_MODEL_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
    activity: {
      stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      componentKey: 'fill-in-the-blank',
      srsEligible: true,
    },
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: PROFIT_MODEL_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 3,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T17:00:00.000Z',
      status: 'graded',
      answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
      parts: blanks.map((blank) => ({
        partId: blank.id,
        rawAnswer: blank.correctAnswer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    },
    score: 7,
    maxScore: 7,
    submittedAt: Date.parse('2026-08-20T17:00:00.000Z'),
    gradedAt: Date.parse('2026-08-20T17:05:00.000Z'),
    ...overrides,
  });
}

type DomainRangeSubmissionFactory = () => ActivitySubmission;
type DomainRangeSubmissionMutation = (submission: ActivitySubmission) => void;

const DOMAIN_RANGE_GUARD_CASES: Array<[
  string,
  DomainRangeSubmissionFactory,
  DomainRangeSubmissionMutation,
]> = [
  ['Guided wrong stable ID', makeDomainRangeGuidedSubmission, (submission) => {
    submission.activity.stableActivityId = `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}.lookalike`;
  }],
  ['Guided wrong node', makeDomainRangeGuidedSubmission, (submission) => {
    submission.activity.masteryNodeId = `${IM3_DOMAIN_RANGE_NODE}.lookalike`;
  }],
  ['Guided wrong component', makeDomainRangeGuidedSubmission, (submission) => {
    submission.activity.componentKey = 'step-by-step-solver';
  }],
  ['Guided srsEligible false', makeDomainRangeGuidedSubmission, (submission) => {
    submission.activity.srsEligible = false;
  }],
  ['Guided wrong mode', makeDomainRangeGuidedSubmission, (submission) => {
    submission.submissionData.mode = 'independent_practice';
  }],
  ['Guided mismatched physical activity ID', makeDomainRangeGuidedSubmission, (submission) => {
    submission.submissionData.activityId = 'different-domain-range-guided-activity-document';
  }],
  ['Independent wrong stable ID', makeDomainRangeIndependentSubmission, (submission) => {
    submission.activity.stableActivityId = `${IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID}.lookalike`;
  }],
  ['Independent wrong node', makeDomainRangeIndependentSubmission, (submission) => {
    submission.activity.masteryNodeId = `${IM3_DOMAIN_RANGE_NODE}.lookalike`;
  }],
  ['Independent wrong component', makeDomainRangeIndependentSubmission, (submission) => {
    submission.activity.componentKey = 'step-by-step-solver';
  }],
  ['Independent srsEligible false', makeDomainRangeIndependentSubmission, (submission) => {
    submission.activity.srsEligible = false;
  }],
  ['Independent wrong mode', makeDomainRangeIndependentSubmission, (submission) => {
    submission.submissionData.mode = 'guided_practice';
  }],
  ['Independent mismatched physical activity ID', makeDomainRangeIndependentSubmission, (submission) => {
    submission.submissionData.activityId = 'different-domain-range-independent-activity-document';
  }],
  ['Independent seed-2 wrong stable ID', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.activity.stableActivityId = `${IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike`;
  }],
  ['Independent seed-2 wrong node', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.activity.masteryNodeId = `${IM3_DOMAIN_RANGE_NODE}.lookalike`;
  }],
  ['Independent seed-2 wrong component', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.activity.componentKey = 'step-by-step-solver';
  }],
  ['Independent seed-2 srsEligible false', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.activity.srsEligible = false;
  }],
  ['Independent seed-2 wrong mode', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.submissionData.mode = 'guided_practice';
  }],
  ['Independent seed-2 wrong status', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.submissionData.status = 'submitted' as never;
  }],
  ['Independent seed-2 mismatched physical activity ID', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.submissionData.activityId = 'different-domain-range-independent-seed-2-activity-document';
  }],
  ['Independent seed-2 invalid attempt metadata', makeDomainRangeIndependentSeed2Submission, (submission) => {
    submission.attemptOrdinal = 0;
  }],
  ['Guided seed-2 wrong stable ID', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.activity.stableActivityId = `${IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID}.lookalike`;
  }],
  ['Guided seed-2 wrong node', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.activity.masteryNodeId = `${IM3_DOMAIN_RANGE_NODE}.lookalike`;
  }],
  ['Guided seed-2 wrong component', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.activity.componentKey = 'step-by-step-solver';
  }],
  ['Guided seed-2 srsEligible false', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.activity.srsEligible = false;
  }],
  ['Guided seed-2 wrong mode', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.submissionData.mode = 'independent_practice';
  }],
  ['Guided seed-2 wrong status', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.submissionData.status = 'submitted' as never;
  }],
  ['Guided seed-2 mismatched physical activity ID', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.submissionData.activityId = 'different-domain-range-guided-seed-2-activity-document';
  }],
  ['Guided seed-2 invalid attempt metadata', makeDomainRangeGuidedSeed2Submission, (submission) => {
    submission.attemptOrdinal = 0;
  }],
];

async function createHarness({
  includeTeacherExposure = true,
  teacherExposure = makeTeacherExposure(),
  submission = makeSubmission(),
}: {
  includeTeacherExposure?: boolean;
  teacherExposure?: LearningEvidenceV1;
  submission?: ActivitySubmission | UngradedWorkedSubmission | null;
} = {}) {
  const effectOrder: string[] = [];
  const evidenceStore = new InMemoryEvidenceStore(effectOrder);
  const receiptStore = new InMemoryReceiptStore(effectOrder);
  if (includeTeacherExposure) {
    evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: teacherExposure });
  }

  const loadActivitySubmission = vi.fn(async (submissionId: string) => (
    submission?.submissionId === submissionId ? submission : null
  ));
  const masteryBridge = vi.fn(async () => {
    effectOrder.push('mastery');
  });
  const handler = createIm3SubmissionLearningEvidenceHandler({
    evidenceStore,
    receiptStore,
    loadActivitySubmission,
    masteryBridge,
  });

  return {
    effectOrder,
    evidenceStore,
    receiptStore,
    teacherExposure,
    handler,
    loadActivitySubmission,
    masteryBridge,
  };
}

describe('IM3 server-owned learning-evidence submissions', () => {
  it('uses the stored server grade and applies mastery, evidence, then a receipt', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      loadActivitySubmission,
      masteryBridge,
      receiptStore,
    } = await createHarness();

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        nodeId: PILOT_NODE_ID,
        activityId: PILOT_STABLE_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-19T10:05:00.000Z',
        gradedEvidence: { isCorrect: false, score: 0, maxScore: 2 },
        idempotencyKey: `im3:mastery-advantage:submission:${SUBMISSION_ID}`,
      }),
    };

    expect(loadActivitySubmission).toHaveBeenCalledWith(SUBMISSION_ID);
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId: SUBMISSION_ID,
      evidence: expectedEffect.evidence,
    });
    const serializedOutputs = JSON.stringify({
      result,
      evidence: evidenceStore.events,
      mastery: masteryBridge.mock.calls,
    });
    expect(serializedOutputs).not.toContain('tableValues');
    expect(serializedOutputs).not.toContain('placedPoints');
    expect(serializedOutputs).not.toContain('table_values');
    expect(serializedOutputs).not.toContain('placed_points');
    expect(serializedOutputs).not.toContain('rawAnswer');
    expect(serializedOutputs).not.toContain('partId');
    expect(serializedOutputs).not.toContain('answers');
    expect(serializedOutputs).not.toContain('parts');
    expect(serializedOutputs).not.toContain('vertex_x');
    expect(receiptStore.receipts.size).toBe(1);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${SUBMISSION_ID}`)).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
    });
  });

  it('accepts exact eligible Guided evidence after teacher exposure with the server grade', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission: makeGuidedSubmission() });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GUIDED_SUBMISSION_ID,
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        nodeId: PILOT_NODE_ID,
        activityId: GUIDED_STABLE_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: '2026-08-19T10:05:00.000Z',
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
        idempotencyKey: `im3:mastery-advantage:submission:${GUIDED_SUBMISSION_ID}`,
      }),
    };

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId: GUIDED_SUBMISSION_ID,
      evidence: expectedEffect.evidence,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds Guided evidence effects until teacher exposure exists', async () => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission: makeGuidedSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('accepts exact profit-model Guided evidence after profit-model Worked exposure', async () => {
    const submission = makeProfitModelGuidedSubmission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeProfitModelWorkedExposure(),
      submission,
    });

    expect(submission.submissionData.parts).toEqual([
      { partId: 'priceBase', rawAnswer: '230', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'priceStep', rawAnswer: '10', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'salesBase', rawAnswer: '270', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'salesLoss', rawAnswer: '10', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'coefficientA', rawAnswer: '-100', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'coefficientB', rawAnswer: '400', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'coefficientC', rawAnswer: '62100', isCorrect: true, score: 1, maxScore: 1 },
    ]);

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
    });

    const expectedEvidence = expect.objectContaining({
      nodeId: IM3_PROFIT_MODEL_NODE,
      activityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      attemptOrdinal: 2,
      origin: 'mastery_advantage',
      mode: 'guided_practice',
      occurredAt: '2026-08-20T16:05:00.000Z',
      gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
      idempotencyKey: `im3:mastery-advantage:submission:${PROFIT_MODEL_GUIDED_SUBMISSION_ID}`,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
      evidence: expectedEvidence,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('accepts exact maximum-profit Guided evidence after maximum-profit Worked exposure', async () => {
    const submission = makeProfitMaximumGuidedSubmission();
    const generated = buildIm3ProfitMaximumGuidedSeedDocuments(
      PROFIT_MAXIMUM_GUIDED_ACTIVITY_DOCUMENT_ID as never,
      Date.parse('2026-08-20T16:30:00.000Z'),
    );
    const expectedAnswers = Object.fromEntries(
      generated.activity.props.blanks.map((blank) => [blank.id, {
        answer: blank.correctAnswer,
        isCorrect: false,
        usedWordBank: true,
      }]),
    );
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeProfitMaximumWorkedExposure(),
      submission,
    });

    expect(submission.submissionData.answers).toEqual(expectedAnswers);
    expect(submission.submissionData.parts).toHaveLength(3);

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    const expectedEvidence = expect.objectContaining({
      contractVersion: 'learning-evidence.v1',
      nodeId: IM3_PROFIT_MAXIMUM_NODE,
      activityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      attemptOrdinal: 2,
      origin: 'mastery_advantage',
      mode: 'guided_practice',
      occurredAt: '2026-08-20T16:35:00.000Z',
      gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
      idempotencyKey: `im3:mastery-advantage:submission:${PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID}`,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toEqual({
      learnerId: LEARNER_ID,
      evidence: expectedEvidence,
      submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds maximum-profit Guided evidence effects until maximum-profit Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission: makeProfitMaximumGuidedSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it.each([
    ['wrong stable ID', makeProfitMaximumGuidedSubmission({
      activity: {
        stableActivityId: `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike`,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong node', makeProfitMaximumGuidedSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: `${IM3_PROFIT_MAXIMUM_NODE}.lookalike`,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong component', makeProfitMaximumGuidedSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['srsEligible false', makeProfitMaximumGuidedSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: false,
      },
    })],
    ['wrong mode', makeProfitMaximumGuidedSubmission({
      submissionData: {
        ...makeProfitMaximumGuidedSubmission().submissionData,
        mode: 'independent_practice',
      },
    })],
    ['mismatched physical activity ID', makeProfitMaximumGuidedSubmission({
      submissionData: {
        ...makeProfitMaximumGuidedSubmission().submissionData,
        activityId: 'different-profit-maximum-guided-activity-document',
      },
    })],
    ['maxScore is not 3', makeProfitMaximumGuidedSubmission({
      score: 2,
      maxScore: 2,
    })],
  ])('rejects maximum-profit Guided evidence with %s before effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      teacherExposure: makeProfitMaximumWorkedExposure(),
      submission,
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('accepts exact graph Guided seed-2 evidence after graph Worked exposure', async () => {
    const submission = makeGraphGuidedSeed2Submission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
    });

    const expectedEvidence = {
      contractVersion: 'learning-evidence.v1' as const,
      nodeId: PILOT_NODE_ID,
      activityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      attemptOrdinal: 2,
      origin: 'mastery_advantage' as const,
      mode: 'guided_practice' as const,
      occurredAt: '2026-08-20T18:05:00.000Z',
      gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
      idempotencyKey: `im3:mastery-advantage:submission:${GRAPH_GUIDED_SEED_2_SUBMISSION_ID}`,
    };

    expect(submission.submissionData.answers).toEqual({
      tableValues: GRAPH_GUIDED_SEED_2_POINTS,
      placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
    });
    expect(submission.submissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'placed_points', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({ learnerId: LEARNER_ID, evidence: expectedEvidence });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
      {
        learnerId: LEARNER_ID,
        evidence: expectedEvidence,
        submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
      },
    ]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds graph Guided seed-2 evidence effects until graph Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission: makeGraphGuidedSeed2Submission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it.each([
    ['wrong stable ID', makeGraphGuidedSeed2Submission({
      activity: {
        stableActivityId: `${IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID}.lookalike`,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['wrong node', makeGraphGuidedSeed2Submission({
      activity: {
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: `${PILOT_NODE_ID}.lookalike`,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['wrong component', makeGraphGuidedSeed2Submission({
      activity: {
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['false eligibility', makeGraphGuidedSeed2Submission({
      activity: {
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'graphing-explorer',
        srsEligible: false,
      },
    })],
    ['wrong mode', makeGraphGuidedSeed2Submission({
      submissionData: {
        ...makeGraphGuidedSeed2Submission().submissionData,
        mode: 'independent_practice',
      },
    })],
    ['wrong status', makeGraphGuidedSeed2Submission({
      submissionData: {
        ...makeGraphGuidedSeed2Submission().submissionData,
        status: 'submitted' as never,
      },
    })],
    ['mismatched physical activity ID', makeGraphGuidedSeed2Submission({
      submissionData: {
        ...makeGraphGuidedSeed2Submission().submissionData,
        activityId: 'different-graph-guided-seed-2-activity-document',
      },
    })],
    ['invalid attempt metadata', makeGraphGuidedSeed2Submission({ attemptOrdinal: 0 })],
    ['invalid grade metadata', makeGraphGuidedSeed2Submission({ gradedAt: Number.NaN })],
  ])('rejects graph Guided seed-2 evidence with %s before effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      teacherExposure: makeTeacherExposure(),
      submission,
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('accepts exact graph Independent seed-2 evidence after graph Worked exposure', async () => {
    const submission = makeGraphIndependentSeed2Submission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    const expectedEvidence = {
      contractVersion: 'learning-evidence.v1' as const,
      nodeId: PILOT_NODE_ID,
      activityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      attemptOrdinal: 3,
      origin: 'mastery_advantage' as const,
      mode: 'independent_practice' as const,
      occurredAt: '2026-08-20T19:05:00.000Z',
      gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
      idempotencyKey: `im3:mastery-advantage:submission:${GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID}`,
    };

    expect(submission.submissionData.answers).toEqual({
      tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
      placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
    });
    expect(submission.submissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'placed_points', rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({ learnerId: LEARNER_ID, evidence: expectedEvidence });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
      {
        learnerId: LEARNER_ID,
        evidence: expectedEvidence,
        submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
      },
    ]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds graph Independent seed-2 evidence effects until graph Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission: makeGraphIndependentSeed2Submission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it.each([
    ['wrong stable ID', makeGraphIndependentSeed2Submission({
      activity: {
        stableActivityId: `${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike`,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['wrong node', makeGraphIndependentSeed2Submission({
      activity: {
        stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: `${PILOT_NODE_ID}.lookalike`,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['wrong component', makeGraphIndependentSeed2Submission({
      activity: {
        stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['false eligibility', makeGraphIndependentSeed2Submission({
      activity: {
        stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'graphing-explorer',
        srsEligible: false,
      },
    })],
    ['wrong mode', makeGraphIndependentSeed2Submission({
      submissionData: {
        ...makeGraphIndependentSeed2Submission().submissionData,
        mode: 'guided_practice',
      },
    })],
    ['wrong status', makeGraphIndependentSeed2Submission({
      submissionData: {
        ...makeGraphIndependentSeed2Submission().submissionData,
        status: 'submitted' as never,
      },
    })],
    ['mismatched physical activity ID', makeGraphIndependentSeed2Submission({
      submissionData: {
        ...makeGraphIndependentSeed2Submission().submissionData,
        activityId: 'different-graph-independent-seed-2-activity-document',
      },
    })],
    ['invalid attempt metadata', makeGraphIndependentSeed2Submission({ attemptOrdinal: 0 })],
    ['invalid grade metadata', makeGraphIndependentSeed2Submission({ gradedAt: Number.NaN })],
  ])('rejects graph Independent seed-2 evidence with %s before effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      teacherExposure: makeTeacherExposure(),
      submission,
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('accepts exact maximum-profit Independent evidence after maximum-profit Worked exposure', async () => {
    const submission = makeProfitMaximumIndependentSubmission();
    const generated = buildIm3ProfitMaximumIndependentSeedDocuments(
      PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_DOCUMENT_ID as never,
      Date.parse('2026-08-20T17:00:00.000Z'),
    );
    const expectedAnswers = Object.fromEntries(
      generated.activity.props.blanks.map((blank) => [blank.id, {
        answer: blank.correctAnswer,
        isCorrect: false,
        usedWordBank: true,
      }]),
    );
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeProfitMaximumWorkedExposure(),
      submission,
    });

    expect(submission.submissionData.answers).toEqual(expectedAnswers);
    expect(submission.submissionData.parts).toEqual(generated.activity.props.blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
      isCorrect: true,
      score: 1,
      maxScore: 1,
    })));

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });
    const expectedEvidence = expect.objectContaining({
      contractVersion: 'learning-evidence.v1',
      nodeId: IM3_PROFIT_MAXIMUM_NODE,
      activityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      attemptOrdinal: 3,
      origin: 'mastery_advantage',
      mode: 'independent_practice',
      occurredAt: '2026-08-20T17:05:00.000Z',
      gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
      idempotencyKey: `im3:mastery-advantage:submission:${PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID}`,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toEqual({
      learnerId: LEARNER_ID,
      evidence: expectedEvidence,
      submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds maximum-profit Independent evidence effects until maximum-profit Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission: makeProfitMaximumIndependentSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it.each([
    ['wrong stable ID', makeProfitMaximumIndependentSubmission({
      activity: {
        stableActivityId: `${IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID}.lookalike`,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong node', makeProfitMaximumIndependentSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: `${IM3_PROFIT_MAXIMUM_NODE}.lookalike`,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong component', makeProfitMaximumIndependentSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        componentKey: 'step-by-step-solver',
        srsEligible: true,
      },
    })],
    ['srsEligible false', makeProfitMaximumIndependentSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: false,
      },
    })],
    ['wrong mode', makeProfitMaximumIndependentSubmission({
      submissionData: {
        ...makeProfitMaximumIndependentSubmission().submissionData,
        mode: 'guided_practice',
      },
    })],
    ['mismatched physical activity ID', makeProfitMaximumIndependentSubmission({
      submissionData: {
        ...makeProfitMaximumIndependentSubmission().submissionData,
        activityId: 'different-profit-maximum-independent-activity-document',
      },
    })],
    ['maxScore is not 3', makeProfitMaximumIndependentSubmission({
      score: 2,
      maxScore: 2,
    })],
  ])('rejects maximum-profit Independent evidence with %s before effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      teacherExposure: makeProfitMaximumWorkedExposure(),
      submission,
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('withholds profit-model Guided evidence effects until Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission: makeProfitModelGuidedSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('accepts exact profit-model Independent evidence after profit-model Worked exposure', async () => {
    const submission = makeProfitModelIndependentSubmission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeProfitModelWorkedExposure(),
      submission,
    });

    expect(submission.submissionData.answers).toEqual(
      Object.fromEntries(submission.submissionData.parts.map((part) => [part.partId, part.rawAnswer])),
    );
    expect(submission.submissionData.parts).toHaveLength(7);
    expect(submission.submissionData.parts.every((part) => (
      part.isCorrect === true && part.score === 1 && part.maxScore === 1
    ))).toBe(true);

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
    });

    const expectedEvidence = expect.objectContaining({
      nodeId: IM3_PROFIT_MODEL_NODE,
      activityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      attemptOrdinal: 3,
      origin: 'mastery_advantage',
      mode: 'independent_practice',
      occurredAt: '2026-08-20T17:05:00.000Z',
      gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
      idempotencyKey: `im3:mastery-advantage:submission:${PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID}`,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
      evidence: expectedEvidence,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds profit-model Independent evidence effects until Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission: makeProfitModelIndependentSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it.each([
    ['wrong stable ID', makeProfitModelIndependentSubmission({
      activity: {
        stableActivityId: `${IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID}.lookalike`,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong node', makeProfitModelIndependentSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: `${IM3_PROFIT_MODEL_NODE}.lookalike`,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong component', makeProfitModelIndependentSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['srsEligible false', makeProfitModelIndependentSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: false,
      },
    })],
    ['wrong mode', makeProfitModelIndependentSubmission({
      submissionData: {
        ...makeProfitModelIndependentSubmission().submissionData,
        mode: 'guided_practice',
      },
    })],
    ['mismatched physical activity ID', makeProfitModelIndependentSubmission({
      submissionData: {
        ...makeProfitModelIndependentSubmission().submissionData,
        activityId: 'different-profit-model-independent-activity-document',
      },
    })],
  ])('rejects profit-model Independent evidence with %s before effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      teacherExposure: makeProfitModelWorkedExposure(),
      submission,
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    ['wrong stable ID', makeProfitModelGuidedSubmission({
      activity: {
        stableActivityId: `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}.lookalike`,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong node', makeProfitModelGuidedSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        masteryNodeId: `${IM3_PROFIT_MODEL_NODE}.lookalike`,
        componentKey: 'fill-in-the-blank',
        srsEligible: true,
      },
    })],
    ['wrong component', makeProfitModelGuidedSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['srsEligible false', makeProfitModelGuidedSubmission({
      activity: {
        stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        componentKey: 'fill-in-the-blank',
        srsEligible: false,
      },
    })],
    ['wrong mode', makeProfitModelGuidedSubmission({
      submissionData: {
        ...makeProfitModelGuidedSubmission().submissionData,
        mode: 'independent_practice',
      },
    })],
    ['mismatched physical activity ID', makeProfitModelGuidedSubmission({
      submissionData: {
        ...makeProfitModelGuidedSubmission().submissionData,
        activityId: 'different-profit-model-guided-activity-document',
      },
    })],
  ])('rejects profit-model Guided evidence with %s before effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      teacherExposure: makeProfitModelWorkedExposure(),
      submission,
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    ['a Guided lookalike identity', makeGuidedSubmission({
      activity: {
        stableActivityId: `${GUIDED_STABLE_ACTIVITY_ID}.lookalike`,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
    ['a Guided submission in Independent mode', makeGuidedSubmission({
      submissionData: {
        ...makeGuidedSubmission().submissionData,
        mode: 'independent_practice',
      },
    })],
    ['an ineligible Guided activity', makeGuidedSubmission({
      activity: {
        stableActivityId: GUIDED_STABLE_ACTIVITY_ID,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'graphing-explorer',
        srsEligible: false,
      },
    })],
  ])('rejects %s without evidence or a mastery effect', async (_label, submission) => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({ submission });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('aborts before evidence and receipt persistence when the mastery effect fails', async () => {
    const effectOrder: string[] = [];
    const evidenceStore = new InMemoryEvidenceStore(effectOrder);
    const receiptStore = new InMemoryReceiptStore(effectOrder);
    evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: makeTeacherExposure() });
    const masteryBridge = vi.fn(async () => {
      effectOrder.push('mastery');
      throw new Error('Mastery effect failed');
    });
    const handler = createIm3SubmissionLearningEvidenceHandler({
      evidenceStore,
      receiptStore,
      loadActivitySubmission: vi.fn(async () => makeSubmission()),
      masteryBridge,
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .rejects.toThrow('Mastery effect failed');

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(1);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual(['mastery']);
  });

  it('does not use client misconception tags in the Mastery Advantage evidence', async () => {
    const submission = makeSubmission();
    const clientOnlyTag = 'client-forged-misconception-tag';
    submission.submissionData.parts[0] = {
      ...submission.submissionData.parts[0],
      misconceptionTags: [clientOnlyTag],
    };

    const { handler, masteryBridge } = await createHarness({ submission });

    await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(masteryBridge).toHaveBeenCalledWith(expect.objectContaining({
      evidence: expect.objectContaining({
        gradedEvidence: { isCorrect: false, score: 0, maxScore: 2 },
      }),
    }));
    expect(JSON.stringify(masteryBridge.mock.calls)).not.toContain(clientOnlyTag);
  });

  it('rejects an unknown submission without evidence or a mastery effect', async () => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({ submission: null });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('rejects a submission owned by another learner without evidence or a mastery effect', async () => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      submission: makeSubmission({ userId: 'other-im3-learner' }),
    });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    ['a submission for a non-pilot activity', makeSubmission({
      activity: {
        stableActivityId: 'math.im3.skill.1.1.non-pilot.independent_practice',
        masteryNodeId: 'math.im3.skill.1.1.non-pilot',
        componentKey: 'graphing-explorer',
        srsEligible: true,
      },
    })],
  ])('rejects %s without adding evidence or a mastery effect', async (_label, submission) => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({ submission });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('returns the stored receipt on replay before reading mutable submission data again', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      loadActivitySubmission,
      masteryBridge,
      receiptStore,
    } = await createHarness();

    const first = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });
    const replay = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(first).toMatchObject({ persisted: true, delivery: 'new' });
    expect(replay).toEqual({ ...first, delivery: 'replay' });
    expect(loadActivitySubmission).toHaveBeenCalledTimes(1);
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
  });

  it('withholds Mastery Advantage effects until the same learner has teacher-led exposure', async () => {
    const {
      evidenceStore,
      handler,
      loadActivitySubmission,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({ includeTeacherExposure: false });

    const first = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(first).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);

    // Exposure can arrive later. Replay must return the original negative
    // decision, not re-evaluate the now-mutable exposure state.
    evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: teacherExposure });
    const replay = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(replay).toEqual({ ...first, delivery: 'replay' });
    expect(loadActivitySubmission).toHaveBeenCalledTimes(1);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it.each([
    ['a non-SRS activity', makeSubmission({
      activity: {
        stableActivityId: PILOT_STABLE_ACTIVITY_ID,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'graphing-explorer',
        srsEligible: false,
      },
    })],
    ['a non-graphing activity', makeSubmission({
      activity: {
        stableActivityId: PILOT_STABLE_ACTIVITY_ID,
        masteryNodeId: PILOT_NODE_ID,
        componentKey: 'step-by-step-solver',
        srsEligible: true,
      },
    })],
  ])('rejects the stored activity when it is %s', async (_label, submission) => {
    const { evidenceStore, handler, masteryBridge, receiptStore, teacherExposure } =
      await createHarness({ submission });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    ['a non-positive server attempt ordinal', makeSubmission({ attemptOrdinal: 0 })],
    ['an out-of-range server score', makeSubmission({ score: 3 })],
    ['a missing server grade timestamp', makeSubmission({ gradedAt: Number.NaN })],
    ['a missing mastery contract version', makeSubmission({ masteryContractVersion: undefined })],
  ])('rejects %s before pilot evidence effects', async (_label, submission) => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({ submission });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID })).rejects.toThrow(
      'IM3 server-owned pilot submission has invalid grading metadata',
    );
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('uses server gradedAt instead of the client or receipt submission time for exposure ordering', async () => {
    const lateTeacherExposure = makeTeacherExposure({
      occurredAt: '2026-08-19T10:10:00.000Z',
      idempotencyKey: 'teacher-exposure-after-server-grade',
    });
    const { evidenceStore, handler, masteryBridge, receiptStore } = await createHarness({
      teacherExposure: lateTeacherExposure,
    });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      decision: {
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: lateTeacherExposure }]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('accepts exact equation Guided evidence after equation Worked exposure with the server grade', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeEquationWorkedExposure(),
      submission: makeEquationGuidedSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: EQUATION_GUIDED_SUBMISSION_ID,
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        nodeId: IM3_EQUATION_RATE_NODE,
        activityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: '2026-08-20T10:05:00.000Z',
        gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
        idempotencyKey: `im3:mastery-advantage:submission:${EQUATION_GUIDED_SUBMISSION_ID}`,
      }),
    };

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId: EQUATION_GUIDED_SUBMISSION_ID,
      evidence: expectedEffect.evidence,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds equation Guided evidence effects until equation Worked exposure exists', async () => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      teacherExposure: makeEquationWorkedExposure(),
      submission: makeEquationGuidedSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: EQUATION_GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it.each([
    ['a wrong stable ID', (submission: ActivitySubmission) => {
      submission.activity.stableActivityId = `${IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID}.lookalike`;
    }],
    ['a wrong node', (submission: ActivitySubmission) => {
      submission.activity.masteryNodeId = `${IM3_EQUATION_RATE_NODE}.lookalike`;
    }],
    ['a wrong component', (submission: ActivitySubmission) => {
      submission.activity.componentKey = 'graphing-explorer';
    }],
    ['srsEligible false', (submission: ActivitySubmission) => {
      submission.activity.srsEligible = false;
    }],
    ['a wrong mode', (submission: ActivitySubmission) => {
      submission.submissionData.mode = 'independent_practice';
    }],
    ['a mismatched physical envelope activity ID', (submission: ActivitySubmission) => {
      submission.submissionData.activityId = 'different-equation-guided-activity-document';
    }],
  ])('rejects equation Guided evidence with %s before effects', async (_label, mutate) => {
    const submission = makeEquationGuidedSubmission();
    mutate(submission);
    const teacherExposure = makeEquationWorkedExposure();
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission, teacherExposure });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: EQUATION_GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('accepts exact equation Independent evidence after equation Worked exposure with the server grade', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeEquationWorkedExposure(),
      submission: makeEquationIndependentSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        nodeId: IM3_EQUATION_RATE_NODE,
        activityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-20T11:05:00.000Z',
        gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
        idempotencyKey: `im3:mastery-advantage:submission:${EQUATION_INDEPENDENT_SUBMISSION_ID}`,
      }),
    };

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
      evidence: expectedEffect.evidence,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds equation Independent evidence effects until equation Worked exposure exists', async () => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      teacherExposure: makeEquationWorkedExposure(),
      submission: makeEquationIndependentSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it.each([
    ['a wrong stable ID', (submission: ActivitySubmission) => {
      submission.activity.stableActivityId = `${IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID}.lookalike`;
    }],
    ['a wrong node', (submission: ActivitySubmission) => {
      submission.activity.masteryNodeId = `${IM3_EQUATION_RATE_NODE}.lookalike`;
    }],
    ['a wrong component', (submission: ActivitySubmission) => {
      submission.activity.componentKey = 'graphing-explorer';
    }],
    ['srsEligible false', (submission: ActivitySubmission) => {
      submission.activity.srsEligible = false;
    }],
    ['a wrong mode', (submission: ActivitySubmission) => {
      submission.submissionData.mode = 'guided_practice';
    }],
    ['a mismatched physical envelope activity ID', (submission: ActivitySubmission) => {
      submission.submissionData.activityId = 'different-equation-independent-activity-document';
    }],
  ])('rejects equation Independent evidence with %s before effects', async (_label, mutate) => {
    const submission = makeEquationIndependentSubmission();
    mutate(submission);
    const teacherExposure = makeEquationWorkedExposure();
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission, teacherExposure });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    [
      'Guided',
      makeDomainRangeGuidedSubmission(),
      DOMAIN_RANGE_GUIDED_SUBMISSION_ID,
      IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      'guided_practice',
      '2026-08-20T13:05:00.000Z',
    ],
    [
      'Independent',
      makeDomainRangeIndependentSubmission(),
      DOMAIN_RANGE_INDEPENDENT_SUBMISSION_ID,
      IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
      '2026-08-20T14:05:00.000Z',
    ],
  ])('accepts exact domain-range %s evidence after Worked exposure', async (
    _label,
    submission,
    submissionId,
    stableActivityId,
    mode,
    occurredAt,
  ) => {
    expect(submission.activity).toMatchObject({
      stableActivityId,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    });
    expect(submission.activityId).toBe(submission.submissionData.activityId);
    expect(submission.masteryContractVersion).toBe('learning-evidence.v1');
    expect(submission.submissionData).toMatchObject({
      contractVersion: 'practice.v1',
      mode,
      status: 'graded',
      attemptNumber: submission.attemptOrdinal,
    });

    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeDomainRangeWorkedExposure(),
      submission,
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_DOMAIN_RANGE_NODE,
        activityId: stableActivityId,
        attemptOrdinal: submission.attemptOrdinal,
        origin: 'mastery_advantage',
        mode,
        occurredAt,
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
        idempotencyKey: `im3:mastery-advantage:submission:${submissionId}`,
      }),
    };

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId,
      evidence: expectedEffect.evidence,
    });
    expect(receiptStore.receipts.size).toBe(1);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${submissionId}`)).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
    });
  });

  it('accepts domain-range Guided seed-2 evidence after Worked exposure', async () => {
    const submission = makeDomainRangeGuidedSeed2Submission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeDomainRangeWorkedExposure(),
      submission,
    });

    expect(submission.activity).toEqual({
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: 'practice.v1',
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T13:30:00.000Z',
      status: 'graded',
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'lte', boundary: -0.75 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'range', rawAnswer: { relation: 'lte', boundary: -0.75 }, isCorrect: true, score: 1, maxScore: 1 },
      ],
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_DOMAIN_RANGE_NODE,
        activityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: '2026-08-20T13:35:00.000Z',
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
        idempotencyKey: `im3:mastery-advantage:submission:${DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID}`,
      }),
    };

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toEqual({
      learnerId: LEARNER_ID,
      evidence: expectedEffect.evidence,
      submissionId: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('accepts domain-range Independent seed-2 evidence after Worked exposure', async () => {
    const submission = makeDomainRangeIndependentSeed2Submission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      teacherExposure: makeDomainRangeWorkedExposure(),
      submission,
    });

    expect(submission.activity).toEqual({
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: 'practice.v1',
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 2,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T14:30:00.000Z',
      status: 'graded',
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: 1.75 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'range', rawAnswer: { relation: 'gte', boundary: 1.75 }, isCorrect: true, score: 1, maxScore: 1 },
      ],
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_DOMAIN_RANGE_NODE,
        activityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-20T14:35:00.000Z',
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
        idempotencyKey: `im3:mastery-advantage:submission:${DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID}`,
      }),
    };

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toEqual({
      learnerId: LEARNER_ID,
      evidence: expectedEffect.evidence,
      submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds domain-range evidence until domain-range Worked exposure exists', async () => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      teacherExposure: makeDomainRangeWorkedExposure(),
      submission: makeDomainRangeGuidedSubmission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_GUIDED_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds domain-range Guided seed-2 evidence until domain-range Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      teacherExposure: makeDomainRangeWorkedExposure(),
      submission: makeDomainRangeGuidedSeed2Submission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('withholds domain-range Independent seed-2 evidence until domain-range Worked exposure exists', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      teacherExposure: makeDomainRangeWorkedExposure(),
      submission: makeDomainRangeIndependentSeed2Submission(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(effectOrder).toEqual(['receipt']);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('rejects domain-range Guided seed-2 invalid grade metadata before effects', async () => {
    const submission = makeDomainRangeGuidedSeed2Submission();
    submission.gradedAt = Number.NaN;
    const teacherExposure = makeDomainRangeWorkedExposure();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission, teacherExposure });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).rejects.toThrow('IM3 server-owned pilot submission has invalid grading metadata');

    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('rejects domain-range Independent seed-2 invalid grade metadata before effects', async () => {
    const submission = makeDomainRangeIndependentSeed2Submission();
    submission.gradedAt = Number.NaN;
    const teacherExposure = makeDomainRangeWorkedExposure();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission, teacherExposure });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).rejects.toThrow('IM3 server-owned pilot submission has invalid grading metadata');

    expect(effectOrder).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each(DOMAIN_RANGE_GUARD_CASES)('rejects domain-range %s before effects', async (
    _label,
    createSubmission,
    mutate,
  ) => {
    const submission = createSubmission();
    mutate(submission);
    const teacherExposure = makeDomainRangeWorkedExposure();
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission, teacherExposure });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    ['Guided', makeSymmetryGuidedSubmission(), SYMMETRY_GUIDED_SUBMISSION_ID, 'guided_practice'],
    ['Independent', makeSymmetryIndependentSubmission(), SYMMETRY_INDEPENDENT_SUBMISSION_ID, 'independent_practice'],
  ] as const)('accepts exact symmetry %s evidence after Worked exposure', async (
    _label,
    submission,
    submissionId,
    mode,
  ) => {
    const teacherExposure = makeSymmetryWorkedExposure();
    expect(teacherExposure).toMatchObject({
      nodeId: IM3_SYMMETRY_NODE,
      activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
      origin: 'teacher_led',
      mode: 'worked_example',
    });
    expect(submission.activity).toMatchObject({
      stableActivityId: mode === 'guided_practice'
        ? IM3_SYMMETRY_GUIDED_ACTIVITY_ID
        : IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    });
    expect(submission.activityId).toBe(submission.submissionData.activityId);
    expect(submission.masteryContractVersion).toBe('learning-evidence.v1');
    expect(submission.attemptOrdinal).toBe(submission.submissionData.attemptNumber);
    expect(submission).toMatchObject({
      score: 1,
      maxScore: 1,
      submittedAt: expect.any(Number),
      gradedAt: expect.any(Number),
    });
    expect(submission.submissionData).toMatchObject({
      contractVersion: 'practice.v1',
      mode,
      status: 'graded',
      parts: [{
        partId: 'placed_points',
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    });
    const expectedDocuments = mode === 'guided_practice'
      ? buildIm3SymmetryGuidedSeedDocuments(
        SYMMETRY_GUIDED_ACTIVITY_DOCUMENT_ID as never,
        Date.parse('2026-08-20T15:00:00.000Z'),
      )
      : buildIm3SymmetryIndependentSeedDocuments(
        SYMMETRY_INDEPENDENT_ACTIVITY_DOCUMENT_ID as never,
        Date.parse('2026-08-20T16:00:00.000Z'),
      );
    const expectedProps = expectedDocuments.activity.props as {
      equation: string;
      vertex: [number, number];
      yIntercept: [number, number];
      domain: [number, number];
      range: [number, number];
    };
    const submittedPoints = submission.submissionData.answers.placed_points as Array<{ x: number; y: number }>;
    expect(submission.submissionData.artifact).toEqual({
      graphState: {
        equation: expectedProps.equation,
        vertex: expectedProps.vertex,
        yIntercept: expectedProps.yIntercept,
        placedPoints: submittedPoints,
        domain: expectedProps.domain,
        range: expectedProps.range,
      },
    });

    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ teacherExposure, submission });
    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_SYMMETRY_NODE,
        activityId: submission.activity.stableActivityId,
        attemptOrdinal: submission.attemptOrdinal,
        origin: 'mastery_advantage',
        mode,
        occurredAt: new Date(submission.gradedAt).toISOString(),
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
        idempotencyKey: `im3:mastery-advantage:submission:${submissionId}`,
      }),
    };

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]).toMatchObject({
      submissionId,
      evidence: expectedEffect.evidence,
    });
    expect(receiptStore.receipts.size).toBe(1);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${submissionId}`)).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
    });

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId,
    });

    expect(replay).toMatchObject({ ...result, delivery: 'replay' });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('consumes the exact symmetry Worked submission without prior exposure', async () => {
    const submission = makeSymmetryWorkedSubmission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission,
    });

    expect(submission.activity).toMatchObject({
      stableActivityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      componentKey: 'graphing-explorer',
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
    });
    expect(submission.activityId).toBe(submission.submissionData.activityId);
    expect(submission.masteryContractVersion).toBe('learning-evidence.v1');
    expect(submission.attemptOrdinal).toBe(submission.submissionData.attemptNumber);
    expect(submission.submissionData).toEqual({
      contractVersion: 'practice.v1',
      activityId: SYMMETRY_WORKED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 1,
      mode: 'worked_example',
      submittedAt: '2026-08-20T14:30:00.000Z',
      status: 'submitted',
      answers: {},
      parts: [],
    });
    expect(submission.score).toBeUndefined();
    expect(submission.maxScore).toBeUndefined();
    expect(submission.gradedAt).toBeUndefined();

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual(['evidence', 'receipt']);
    expect(evidenceStore.events).toEqual([{
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_SYMMETRY_NODE,
        activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt: new Date(submission.submittedAt).toISOString(),
        idempotencyKey: `im3:teacher-led:submission:${SYMMETRY_WORKED_SUBMISSION_ID}`,
      },
      submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
    }]);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${SYMMETRY_WORKED_SUBMISSION_ID}`)).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
    });

    expect(replay).toEqual({ ...result, delivery: 'replay' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual(['evidence', 'receipt']);
    expect(evidenceStore.events).toHaveLength(1);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('consumes the exact compare-maximum Worked submission without prior exposure', async () => {
    const submission = makeCompareMaximumWorkedSubmission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      includeTeacherExposure: false,
      submission,
    });

    expect(submission.activity).toMatchObject({
      stableActivityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: 'graphing-explorer',
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
    });
    expect(submission.activityId).toBe(submission.submissionData.activityId);
    expect(submission.masteryContractVersion).toBe('learning-evidence.v1');
    expect(submission.attemptOrdinal).toBe(submission.submissionData.attemptNumber);
    expect(submission.submissionData).toEqual({
      contractVersion: 'practice.v1',
      activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_DOCUMENT_ID,
      attemptNumber: 1,
      mode: 'worked_example',
      submittedAt: '2026-08-20T14:30:00.000Z',
      status: 'submitted',
      answers: {},
      parts: [],
    });
    expect(submission.score).toBeUndefined();
    expect(submission.maxScore).toBeUndefined();
    expect(submission.gradedAt).toBeUndefined();

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual(['evidence', 'receipt']);
    expect(evidenceStore.events).toEqual([{
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_COMPARE_MAXIMUM_NODE,
        activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt: new Date(submission.submittedAt).toISOString(),
        idempotencyKey: `im3:teacher-led:submission:${COMPARE_MAXIMUM_WORKED_SUBMISSION_ID}`,
      },
      submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
    }]);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${COMPARE_MAXIMUM_WORKED_SUBMISSION_ID}`)).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
    });

    expect(replay).toEqual({ ...result, delivery: 'replay' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual(['evidence', 'receipt']);
    expect(evidenceStore.events).toHaveLength(1);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('accepts exact compare-maximum Guided evidence after Worked exposure', async () => {
    const teacherExposure = makeCompareMaximumWorkedExposure();
    const submission = makeCompareMaximumGuidedSubmission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ teacherExposure, submission });

    expect(teacherExposure).toEqual({
      contractVersion: 'learning-evidence.v1',
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: '2026-08-20T14:00:00.000Z',
      idempotencyKey: 'im3-compare-maximum-worked-exposure-before-practice-submission',
    });
    expect(submission.activity).toMatchObject({
      stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    });
    expect(submission.activityId).toBe(submission.submissionData.activityId);
    expect(submission.masteryContractVersion).toBe('learning-evidence.v1');
    expect(submission.attemptOrdinal).toBe(submission.submissionData.attemptNumber);
    expect(submission.score).toBe(1);
    expect(submission.maxScore).toBe(1);
    expect(Number.isFinite(submission.submittedAt)).toBe(true);
    expect(Number.isFinite(submission.gradedAt)).toBe(true);
    expect(submission.submissionData).toEqual({
      contractVersion: 'practice.v1',
      activityId: submission.activityId,
      attemptNumber: 2,
      mode: 'guided_practice',
      submittedAt: '2026-08-20T15:00:00.000Z',
      status: 'graded',
      answers: {
        greater_maximum: submission.submissionData.answers.greater_maximum,
      },
      parts: [{
        partId: 'greater_maximum',
        rawAnswer: submission.submissionData.answers.greater_maximum,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_COMPARE_MAXIMUM_NODE,
        activityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        attemptOrdinal: submission.attemptOrdinal,
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: new Date(submission.gradedAt).toISOString(),
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
        idempotencyKey: `im3:mastery-advantage:submission:${COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID}`,
      },
    };

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: teacherExposure },
      {
        learnerId: LEARNER_ID,
        evidence: expectedEffect.evidence,
        submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
      },
    ]);
    expect(receiptStore.receipts.size).toBe(1);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID}`)).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toEqual({ ...result, delivery: 'replay' });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('accepts exact compare-maximum Independent evidence after Worked exposure', async () => {
    const teacherExposure = makeCompareMaximumWorkedExposure();
    const submission = makeCompareMaximumIndependentSubmission();
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ teacherExposure, submission });

    expect(teacherExposure).toMatchObject({
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      origin: 'teacher_led',
      mode: 'worked_example',
    });
    expect(submission.activity).toMatchObject({
      stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
    });
    expect(submission.activityId).toBe(submission.submissionData.activityId);
    expect(submission.masteryContractVersion).toBe('learning-evidence.v1');
    expect(submission.attemptOrdinal).toBe(3);
    expect(submission.attemptOrdinal).toBe(submission.submissionData.attemptNumber);
    expect(Number.isFinite(submission.submittedAt)).toBe(true);
    expect(Number.isFinite(submission.gradedAt)).toBe(true);
    expect(submission.score).toBe(1);
    expect(submission.maxScore).toBe(1);
    expect(submission.submissionData).toEqual({
      contractVersion: 'practice.v1',
      activityId: submission.activityId,
      attemptNumber: 3,
      mode: 'independent_practice',
      submittedAt: '2026-08-20T16:00:00.000Z',
      status: 'graded',
      answers: {
        greater_maximum: submission.submissionData.answers.greater_maximum,
      },
      parts: [{
        partId: 'greater_maximum',
        rawAnswer: submission.submissionData.answers.greater_maximum,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: 'learning-evidence.v1',
        nodeId: IM3_COMPARE_MAXIMUM_NODE,
        activityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: new Date(submission.gradedAt).toISOString(),
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
        idempotencyKey: `im3:mastery-advantage:submission:${COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID}`,
      },
    };

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });

    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: teacherExposure },
      {
        learnerId: LEARNER_ID,
        evidence: expectedEffect.evidence,
        submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
      },
    ]);
    expect(receiptStore.receipts.size).toBe(1);

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toEqual({ ...result, delivery: 'replay' });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
  });
});
