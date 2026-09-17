import {
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';
import { toConvexActivityId } from '@math-platform/practice-core/contract';
import {
  SubmissionSrsAdapter,
  aggregateCardsToEvidence,
  computeObjectiveProficiency,
  type PracticeSubmissionEnvelope,
  type SrsCardState,
  type SrsReviewLogEntry,
} from '@math-platform/srs-engine';
import type { CardStore, ReviewLogStore } from '@math-platform/srs-engine/adapters';

import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { v } from 'convex/values';
import {
  PRECALCULUS_PILOT_ACTIVITY_ID,
  PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
  hasCurrentTopic11Source,
  isPrecalculusPilotPublished,
  isTopic11WorkedSourcePublished,
} from './activities';
import {
  generateTopic13ConcavityFromRateChangeOutput,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
  generateTopic14PolynomialExtremaFromGraphOutput,
  generateTopic14RateSignAndTrendOutput,
  generateTopic14PolynomialEndBehaviorOutput,
  generateTopic15RealZerosAndMultiplicitiesOutput,
  generateTopic15LeastPolynomialDegreeOutput,
  generateTopic15PolynomialInequalityOutput,
  generateTopic16EquationEndBehaviorOutput,
} from '@math-platform/math-content/knowledge-space';
import { gradeTopic15PolynomialInequalitySignChart } from '../lib/practice/topic15-polynomial-inequality-sign-chart';
import { gradeTopic16EquationEndBehavior } from '../lib/practice/topic16-equation-end-behavior';
import {
  buildKstState,
  type KnowledgeSpaceEdge,
  type KnowledgeSpaceNode,
} from '@math-platform/knowledge-space-core';
import nodesJson from '../curriculum/skill-graph/nodes.json';
import edgesJson from '../curriculum/skill-graph/edges.json';

import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NODE_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
  createPrecalculusLearningEvidenceRuntime,
  type PrecalculusLearningEvidenceHistoryOptions,
  type PrecalculusLearningEvidenceStore,
} from '../lib/learning-evidence/precalc-pilot';

function loadPilotGraph(): {
  nodes: KnowledgeSpaceNode[];
  edges: KnowledgeSpaceEdge[];
} {
  const nodes = (nodesJson as { nodes: KnowledgeSpaceNode[] }).nodes
    .filter((node) => new Set<string>(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).has(node.id));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = (edgesJson as { edges: KnowledgeSpaceEdge[] }).edges
    .filter((edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId));
  return { nodes, edges };
}

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

const topic11TeacherLedLearningEvidenceResultValidator = v.union(
  v.object({
    persisted: v.boolean(),
    masteryApplied: v.literal(false),
    kstApplied: v.literal(false),
    delivery: v.union(v.literal('new'), v.literal('replay')),
    decision: learningEvidenceDecisionValidator,
  }),
  v.object({
    accepted: v.literal(false),
    reason: v.literal('submission_not_found'),
  }),
);

const pilotKnowledgeStateValidator = v.object({
  nodeId: v.string(),
  title: v.string(),
  status: v.union(
    v.literal('not_started'),
    v.literal('in_progress'),
    v.literal('mastered'),
    v.literal('decaying'),
  ),
  readiness: v.union(v.literal('ready'), v.literal('blocked'), v.literal('awaiting_teacher_exposure')),
});

export interface PrecalculusActivitySubmission {
  submissionId: string;
  userId: string;
  activityId: string;
  stableActivityId?: string;
  masteryContractVersion?: string;
  submissionData: Record<string, unknown>;
  attemptOrdinal?: number;
  score?: number;
  maxScore?: number;
  feedback?: string;
  gradedAt?: number;
  submittedAt: number;
}

export interface PrecalculusSubmissionEffect {
  learnerId: string;
  submissionId: string;
  evidence: LearningEvidenceV1;
}

export interface PrecalculusSubmissionReceipt {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: ReturnType<typeof evaluateLearningEvidenceV1>;
}

export interface PrecalculusSubmissionReceiptStore {
  findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<PrecalculusSubmissionReceipt | null>;
  append(
    learnerId: string,
    submissionId: string,
    receipt: PrecalculusSubmissionReceipt,
  ): Promise<void>;
}

export interface PrecalculusSubmissionLearningEvidenceHandlerDependencies {
  evidenceStore: PrecalculusLearningEvidenceStore;
  loadActivitySubmission: (
    submissionId: string,
  ) => Promise<PrecalculusActivitySubmission | null>;
  masteryBridge: (input: PrecalculusSubmissionEffect) => Promise<void>;
  receiptStore: PrecalculusSubmissionReceiptStore;
}

export interface PrecalculusSubmissionLearningEvidenceHandler {
  process(input: {
    learnerId: string;
    submissionId: string;
  }): Promise<
    | (PrecalculusSubmissionReceipt & { delivery: 'new' | 'replay' })
    | { accepted: false; reason: 'submission_not_found' }
    | PrecalculusAttemptOrdinalConflictResult
  >;
}

export interface PrecalculusAttemptOrdinalConflictResult {
  accepted: false;
  reason: 'attempt_ordinal_conflict';
  latestAttemptOrdinal: number;
  receivedAttemptOrdinal: number;
}

function storedTimestampToIso(value: number | undefined): string | null {
  if (value === undefined) return null;
  return Number.isFinite(value) ? new Date(value).toISOString() : null;
}

function buildPrecalculusStoredEvidence(
  submission: PrecalculusActivitySubmission,
  learnerId: string,
  submissionId: string,
): { evidence: LearningEvidenceV1; masteryBearing: boolean } | null {
  if (
    typeof submission.userId !== 'string'
    || submission.userId.trim().length === 0
    || submission.userId !== learnerId
  ) return null;

  const data = submission.submissionData;
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  if (data.contractVersion !== 'practice.v1' || !Array.isArray(data.parts)) {
    return null;
  }

  const expectedContractVersion = 'learning-evidence.v1';
  if (submission.masteryContractVersion !== expectedContractVersion) {
    return null;
  }

  const activityId = data.activityId;
  const mode = data.mode;
  const activityMode =
    submission.stableActivityId === PRECALCULUS_PILOT_ACTIVITY_ID
    && activityId === PRECALCULUS_PILOT_ACTIVITY_ID
    && mode === 'guided_practice'
      ? {
          nodeId: PRECALCULUS_PILOT_NODE_ID,
          activityId: PRECALCULUS_PILOT_ACTIVITY_ID,
          mode: 'guided_practice' as const,
        }
      : submission.stableActivityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
        && activityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
        && mode === 'independent_practice'
          ? {
              nodeId: PRECALCULUS_PILOT_NODE_ID,
              activityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
              mode: 'independent_practice' as const,
            }
          : submission.stableActivityId === PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
            && activityId === PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
            && mode === 'guided_practice'
              ? {
                  nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
                  activityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
                  mode: 'guided_practice' as const,
                }
              : submission.stableActivityId === PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID
                && activityId === PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID
                && mode === 'independent_practice'
                  ? {
                      nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
                      activityId: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
                      mode: 'independent_practice' as const,
                    }
                  : submission.stableActivityId === PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID
                    && activityId === PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID
                    && mode === 'guided_practice'
                      ? {
                          nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
                          activityId: PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
                          mode: 'guided_practice' as const,
                        }
                      : submission.stableActivityId === PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID
                        && activityId === PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID
                        && mode === 'independent_practice'
                          ? {
                              nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
                              activityId: PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
                              mode: 'independent_practice' as const,
                            }
                          : submission.stableActivityId === PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
                            && activityId === PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
                            && mode === 'guided_practice'
                              ? {
                                  nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
                                  activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
                                  mode: 'guided_practice' as const,
                                }
                              : submission.stableActivityId === PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID
                                && activityId === PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID
                                && mode === 'independent_practice'
                                      ? {
                                          nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
                                          activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
                                          mode: 'independent_practice' as const,
                                        }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                    : submission.stableActivityId === PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID
                                      && activityId === PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID
                                      && mode === 'independent_practice'
                                        ? {
                                            nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
                                            activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
                                            mode: 'independent_practice' as const,
                                          }
                                      : submission.stableActivityId === PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID
                                        && activityId === PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID
                                        && mode === 'guided_practice'
                                        ? {
                                            nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
                                            activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
                                            mode: 'guided_practice' as const,
                                          }
                                        : submission.stableActivityId === PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID
                                          && activityId === PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID
                                          && mode === 'independent_practice'
                                            ? {
                                                nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
                                                activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
                                                mode: 'independent_practice' as const,
                                              }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                    : submission.stableActivityId === PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID
                                      && activityId === PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID
                                      && mode === 'independent_practice'
                                        ? {
                                            nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
                                            activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
                                            mode: 'independent_practice' as const,
                                          }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID
                                      && activityId === PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID
                                      && mode === 'independent_practice'
                                        ? {
                                            nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
                                            activityId: PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
                                            mode: 'independent_practice' as const,
                                          }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID
                                      && activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID
                                      && mode === 'independent_practice'
                                        ? {
                                            nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
                                            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
                                            mode: 'independent_practice' as const,
                                          }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID
                                      && activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID
                                      && mode === 'independent_practice'
                                        ? {
                                            nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
                                            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
                                            mode: 'independent_practice' as const,
                                          }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID
                                  && mode === 'independent_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
                                        mode: 'independent_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID
                                  && mode === 'independent_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
                                        mode: 'independent_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID
                                  && mode === 'independent_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
                                        mode: 'independent_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID
                                  && mode === 'independent_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
                                        mode: 'independent_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID
                                  && mode === 'independent_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
                                        mode: 'independent_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID
                                  && mode === 'independent_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
                                        mode: 'independent_practice' as const,
                                      }
                                : submission.stableActivityId === PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
                                  && activityId === PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
                                  && mode === 'guided_practice'
                                    ? {
                                        nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
                                        activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
                                        mode: 'guided_practice' as const,
                                      }
                                    : submission.stableActivityId === PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID
                                      && activityId === PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID
                                      && mode === 'independent_practice'
                                        ? {
                                            nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
                                            activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
                                            mode: 'independent_practice' as const,
                                          }
                                      : submission.stableActivityId === PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID
                                        && activityId === PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID
                                        && mode === 'guided_practice'
                                          ? {
                                              nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
                                              activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
                                              mode: 'guided_practice' as const,
                                            }
                                          : submission.stableActivityId === PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID
                                            && activityId === PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID
                                            && mode === 'independent_practice'
                                              ? {
                                                  nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
                                                  activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
                                                  mode: 'independent_practice' as const,
                                                }
                          : null;
  if (
    !activityMode
    || typeof submission.attemptOrdinal !== 'number'
    || !Number.isInteger(submission.attemptOrdinal)
    || submission.attemptOrdinal < 1
  ) {
    return null;
  }

  const occurredAt = storedTimestampToIso(submission.submittedAt);
  if (!occurredAt) return null;

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

  if (activityMode.nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID) {
    const envelopeAttemptNumber = data.attemptNumber;
    const envelopeSubmittedAt = typeof data.submittedAt === 'string'
      ? Date.parse(data.submittedAt)
      : Number.NaN;
    if (
      !Number.isInteger(score)
      || score < 0
      || score > 6
      || !Number.isInteger(maxScore)
      || maxScore !== 6
      || typeof envelopeAttemptNumber !== 'number'
      || !Number.isInteger(envelopeAttemptNumber)
      || envelopeAttemptNumber < 1
      || envelopeAttemptNumber !== submission.attemptOrdinal
      || !Number.isFinite(envelopeSubmittedAt)
      || envelopeSubmittedAt !== submission.submittedAt
    ) {
      return null;
    }
  }

  if (activityMode.nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID) {
    const envelopeAttemptNumber = data.attemptNumber;
    const envelopeSubmittedAt = typeof data.submittedAt === 'string'
      ? Date.parse(data.submittedAt)
      : Number.NaN;
    if (
      !Number.isInteger(score)
      || score < 0
      || score > 3
      || !Number.isInteger(maxScore)
      || maxScore !== 3
      || typeof envelopeAttemptNumber !== 'number'
      || !Number.isInteger(envelopeAttemptNumber)
      || envelopeAttemptNumber < 1
      || envelopeAttemptNumber !== submission.attemptOrdinal
      || !Number.isFinite(envelopeSubmittedAt)
      || envelopeSubmittedAt !== submission.submittedAt
      || typeof submission.gradedAt !== 'number'
      || !Number.isFinite(submission.gradedAt)
      || submission.gradedAt !== submission.submittedAt
    ) {
      return null;
    }
  }

  if (activityMode.nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID) {
    const envelopeAttemptNumber = data.attemptNumber;
    const envelopeSubmittedAt = typeof data.submittedAt === 'string'
      ? Date.parse(data.submittedAt)
      : Number.NaN;
    if (
      !Number.isInteger(score)
      || score < 0
      || score > 2
      || !Number.isInteger(maxScore)
      || maxScore !== 2
      || typeof envelopeAttemptNumber !== 'number'
      || !Number.isInteger(envelopeAttemptNumber)
      || envelopeAttemptNumber < 1
      || envelopeAttemptNumber !== submission.attemptOrdinal
      || !Number.isFinite(envelopeSubmittedAt)
      || envelopeSubmittedAt !== submission.submittedAt
      || typeof submission.gradedAt !== 'number'
      || !Number.isFinite(submission.gradedAt)
      || submission.gradedAt !== submission.submittedAt
    ) {
      return null;
    }
  }

  if (activityMode.nodeId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID) {
    const envelopeAttemptNumber = data.attemptNumber;
    const envelopeSubmittedAt = typeof data.submittedAt === 'string'
      ? Date.parse(data.submittedAt)
      : Number.NaN;
    if (
      !Number.isInteger(score)
      || score < 0
      || score > 2
      || !Number.isInteger(maxScore)
      || maxScore !== 2
      || typeof envelopeAttemptNumber !== 'number'
      || !Number.isInteger(envelopeAttemptNumber)
      || envelopeAttemptNumber < 1
      || envelopeAttemptNumber !== submission.attemptOrdinal
      || !Number.isFinite(envelopeSubmittedAt)
      || envelopeSubmittedAt !== submission.submittedAt
      || typeof submission.gradedAt !== 'number'
      || !Number.isFinite(submission.gradedAt)
      || submission.gradedAt !== submission.submittedAt
    ) {
      return null;
    }
  }

  if (activityMode.nodeId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID) {
    const envelopeAttemptNumber = data.attemptNumber;
    const envelopeSubmittedAt = typeof data.submittedAt === 'string'
      ? Date.parse(data.submittedAt)
      : Number.NaN;
    const answers = data.answers;
    const parts = data.parts;
    const part = Array.isArray(parts) && parts.length === 1 ? parts[0] : null;
    if (
      Object.keys(data).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
      || !Number.isSafeInteger(score)
      || score < 0
      || score > 1
      || maxScore !== 1
      || !Number.isSafeInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || typeof envelopeAttemptNumber !== 'number'
      || !Number.isSafeInteger(envelopeAttemptNumber)
      || envelopeAttemptNumber < 1
      || envelopeAttemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || typeof data.submittedAt !== 'string'
      || !Number.isFinite(envelopeSubmittedAt)
      || new Date(envelopeSubmittedAt).toISOString() !== data.submittedAt
      || envelopeSubmittedAt !== submission.submittedAt
      || typeof submission.gradedAt !== 'number'
      || !Number.isFinite(submission.gradedAt)
      || submission.gradedAt !== submission.submittedAt
      || !isRecord(answers)
      || Object.keys(answers).sort().join('|') !== 'leastDegree'
      || !Number.isSafeInteger(answers.leastDegree)
      || !Array.isArray(parts)
      || parts.length !== 1
      || !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'isCorrect|maxScore|partId|rawAnswer|score'
      || part.partId !== 'leastDegree'
      || !Number.isSafeInteger(part.rawAnswer)
      || part.rawAnswer !== answers.leastDegree
      || part.score !== score
      || part.maxScore !== 1
      || part.isCorrect !== (score === 1)
    ) {
      return null;
    }
  }

  if (activityMode.nodeId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID) {
    const expectedActivityId = activityMode.mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID;
    const expectedSeed = activityMode.mode === 'guided_practice' ? 1 : 2;
    const answers = data.answers;
    const parts = data.parts;
    const graded = gradeTopic15PolynomialInequalitySignChart(expectedSeed, answers as {
      roots: number[];
      intervalSigns: Array<'+' | '-'>;
      solution: string;
    });
    const answerRecord = isRecord(answers) ? answers : null;
    const answerRoots = answerRecord?.roots;
    const answerIntervalSigns = answerRecord?.intervalSigns;
    const answerSolution = answerRecord?.solution;
    const expectedPartIds = ['roots', 'intervalSigns', 'solution'] as const;
    if (
      typeof submission.activityId !== 'string'
      || submission.activityId.trim().length === 0
      || submission.stableActivityId !== expectedActivityId
      || Object.keys(data).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
      || data.contractVersion !== 'practice.v1'
      || data.activityId !== expectedActivityId
      || data.mode !== activityMode.mode
      || data.status !== 'graded'
      || !Number.isSafeInteger(score)
      || score < 0
      || score > 3
      || maxScore !== 3
      || !Number.isSafeInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || typeof data.attemptNumber !== 'number'
      || !Number.isSafeInteger(data.attemptNumber)
      || data.attemptNumber < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || typeof data.submittedAt !== 'string'
      || !Number.isFinite(Date.parse(data.submittedAt))
      || new Date(Date.parse(data.submittedAt)).toISOString() !== data.submittedAt
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || typeof submission.gradedAt !== 'number'
      || !Number.isFinite(submission.gradedAt)
      || submission.gradedAt !== submission.submittedAt
      || !isRecord(answers)
      || Object.keys(answers).sort().join('|') !== 'intervalSigns|roots|solution'
      || !Array.isArray(answerRoots)
      || answerRoots.length !== (activityMode.mode === 'guided_practice' ? 2 : 3)
      || answerRoots.some((root) => (
        typeof root !== 'number'
        || !Number.isFinite(root)
        || Math.abs(root) > Number.MAX_SAFE_INTEGER
      ))
      || !Array.isArray(answerIntervalSigns)
      || answerIntervalSigns.length !== answerRoots.length + 1
      || answerIntervalSigns.some((sign) => sign !== '+' && sign !== '-')
      || typeof answerSolution !== 'string'
      || answerSolution.trim().length === 0
      || !Array.isArray(parts)
      || parts.length !== expectedPartIds.length
      || expectedPartIds.some((partId, index) => {
        const part = parts[index];
        const expectedPart = graded.parts[index];
        if (
          !isRecord(part)
          || !isRecord(expectedPart)
          || Object.keys(part).sort().join('|') !== 'isCorrect|maxScore|partId|rawAnswer|score'
          || part.partId !== partId
          || part.partId !== expectedPart.partId
          || part.isCorrect !== expectedPart.isCorrect
          || part.score !== expectedPart.score
          || part.maxScore !== expectedPart.maxScore
        ) return true;
        if (partId === 'roots') {
          const expectedRawAnswer = expectedPart.rawAnswer;
          return !Array.isArray(part.rawAnswer)
            || part.rawAnswer.length !== answerRoots.length
            || part.rawAnswer.some((root, rootIndex) => root !== answerRoots[rootIndex])
            || !Array.isArray(expectedRawAnswer)
            || part.rawAnswer.some((root, rootIndex) => root !== expectedRawAnswer[rootIndex]);
        }
        if (partId === 'intervalSigns') {
          const expectedRawAnswer = expectedPart.rawAnswer;
          return !Array.isArray(part.rawAnswer)
            || part.rawAnswer.length !== answerIntervalSigns.length
            || part.rawAnswer.some((sign, signIndex) => sign !== answerIntervalSigns[signIndex])
            || !Array.isArray(expectedRawAnswer)
            || part.rawAnswer.some((sign, signIndex) => sign !== expectedRawAnswer[signIndex]);
        }
        return part.rawAnswer !== answerSolution || part.rawAnswer !== expectedPart.rawAnswer;
      })
      || score !== graded.score
      || maxScore !== graded.maxScore
    ) {
      return null;
    }
  }

  if (activityMode.nodeId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID) {
    const expectedActivityId = activityMode.mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;
    const expectedSeed = activityMode.mode === 'guided_practice' ? 1 : 2;
    const answers = data.answers;
    const parts = data.parts;
    const answerRecord = isRecord(answers) ? answers : null;
    const expectedPartIds = [
      'a_leftEnd', 'a_rightEnd', 'b_leftEnd', 'b_rightEnd',
      'c_leftEnd', 'c_rightEnd', 'd_leftEnd', 'd_rightEnd',
      'e_leftEnd', 'e_rightEnd', 'f_leftEnd', 'f_rightEnd',
    ] as const;
    if (
      typeof submission.activityId !== 'string'
      || submission.activityId.trim().length === 0
      || submission.stableActivityId !== expectedActivityId
      || Object.keys(data).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
      || data.contractVersion !== 'practice.v1'
      || data.activityId !== expectedActivityId
      || data.mode !== activityMode.mode
      || data.status !== 'graded'
      || !Number.isSafeInteger(score)
      || score < 0
      || score > 12
      || maxScore !== 12
      || !Number.isSafeInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || typeof data.attemptNumber !== 'number'
      || !Number.isSafeInteger(data.attemptNumber)
      || data.attemptNumber < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || typeof data.submittedAt !== 'string'
      || !Number.isFinite(Date.parse(data.submittedAt))
      || new Date(Date.parse(data.submittedAt)).toISOString() !== data.submittedAt
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || typeof submission.gradedAt !== 'number'
      || !Number.isFinite(submission.gradedAt)
      || submission.gradedAt !== submission.submittedAt
      || submission.feedback !== `${score}/12 polynomial equation end-behavior responses matched the server rubric.`
      || answerRecord === null
      || Object.keys(answerRecord).sort().join('|') !== expectedPartIds.join('|')
      || Object.values(answerRecord).some((answer) => answer !== 'up' && answer !== 'down')
      || !Array.isArray(parts)
      || parts.length !== expectedPartIds.length
    ) {
      return null;
    }

    const graded = gradeTopic16EquationEndBehavior(expectedSeed, answerRecord as Parameters<
      typeof gradeTopic16EquationEndBehavior
    >[1]);
    if (
      expectedPartIds.some((partId, index) => {
        const part = parts[index];
        const expectedPart = graded.parts[index];
        return !isRecord(part)
          || Object.keys(part).sort().join('|') !== 'isCorrect|maxScore|partId|rawAnswer|score'
          || part.partId !== partId
          || part.partId !== expectedPart.partId
          || part.rawAnswer !== answerRecord[partId]
          || part.rawAnswer !== expectedPart.rawAnswer
          || part.isCorrect !== expectedPart.isCorrect
          || part.score !== expectedPart.score
          || part.maxScore !== expectedPart.maxScore;
      })
      || score !== graded.score
      || maxScore !== graded.maxScore
    ) {
      return null;
    }
  }

  if (activityMode.nodeId === PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID) {
    const envelopeAttemptNumber = data.attemptNumber;
    const envelopeSubmittedAt = typeof data.submittedAt === 'string'
      ? Date.parse(data.submittedAt)
      : Number.NaN;
    if (
      !Number.isInteger(score)
      || score < 0
      || score > 2
      || !Number.isInteger(maxScore)
      || maxScore !== 2
      || typeof envelopeAttemptNumber !== 'number'
      || !Number.isInteger(envelopeAttemptNumber)
      || envelopeAttemptNumber < 1
      || envelopeAttemptNumber !== submission.attemptOrdinal
      || !Number.isFinite(envelopeSubmittedAt)
      || envelopeSubmittedAt !== submission.submittedAt
      || typeof submission.gradedAt !== 'number'
      || !Number.isFinite(submission.gradedAt)
      || submission.gradedAt !== submission.submittedAt
    ) {
      return null;
    }
  }

  return {
    masteryBearing: !(
      activityMode.nodeId === PRECALCULUS_PILOT_NODE_ID
      && activityMode.mode === 'guided_practice'
    ),
    evidence: normalizeLearningEvidenceV1({
      contractVersion: expectedContractVersion,
      nodeId: activityMode.nodeId,
      activityId: activityMode.activityId,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'mastery_advantage',
      mode: activityMode.mode,
      occurredAt,
      gradedEvidence: {
        isCorrect: score === maxScore,
        score,
        maxScore,
      },
      idempotencyKey: `precalc:mastery-advantage:submission:${submissionId}`,
    }),
  };
}

/**
 * Creates the server-owned Precalculus submission boundary. It reads only the
 * stored activity submission and never accepts client-calculated evidence.
 */
export function createPrecalculusSubmissionLearningEvidenceHandler({
  evidenceStore,
  loadActivitySubmission,
  masteryBridge,
  receiptStore,
}: PrecalculusSubmissionLearningEvidenceHandlerDependencies):
  PrecalculusSubmissionLearningEvidenceHandler {
  return {
    process: async ({ learnerId, submissionId }) => {
      if (typeof learnerId !== 'string' || learnerId.trim().length === 0) {
        throw new TypeError('learnerId must be a non-empty authenticated identity');
      }

      const existingReceipt = await receiptStore.findBySubmissionId(learnerId, submissionId);
      if (existingReceipt) return { ...existingReceipt, delivery: 'replay' as const };

      const submission = await loadActivitySubmission(submissionId);
      if (!submission) return { accepted: false, reason: 'submission_not_found' };

      const stored = buildPrecalculusStoredEvidence(
        submission,
        learnerId,
        submissionId,
      );
      if (!stored) return { accepted: false, reason: 'submission_not_found' };

      const [existingEvidence, acceptedByNode] = await Promise.all([
        evidenceStore.findByIdempotencyKey(learnerId, stored.evidence.idempotencyKey),
        evidenceStore.listByLearnerAndNode(
          learnerId,
          stored.evidence.nodeId,
          {
            activityId: stored.evidence.activityId,
            origin: stored.evidence.origin,
            occurredAt: stored.evidence.occurredAt,
          },
        ),
      ]);
      const acceptedEvidence = existingEvidence
        && !acceptedByNode.some((item) => item.idempotencyKey === existingEvidence.idempotencyKey)
        ? [...acceptedByNode, existingEvidence]
        : acceptedByNode;
      const latestAttemptOrdinal = acceptedEvidence.reduce<number | null>(
        (latest, evidence) => {
          if (
            evidence.nodeId !== stored.evidence.nodeId
            || evidence.activityId !== stored.evidence.activityId
            || evidence.origin !== stored.evidence.origin
          ) {
            return latest;
          }
          return latest === null
            ? evidence.attemptOrdinal
            : Math.max(latest, evidence.attemptOrdinal);
        },
        null,
      );
      if (
        latestAttemptOrdinal !== null
        && stored.evidence.attemptOrdinal <= latestAttemptOrdinal
      ) {
        return {
          accepted: false,
          reason: 'attempt_ordinal_conflict',
          latestAttemptOrdinal,
          receivedAttemptOrdinal: stored.evidence.attemptOrdinal,
        };
      }
      const evaluatedDecision = evaluateLearningEvidenceV1({
        evidence: stored.evidence,
        acceptedEvidence,
        enabledNodeIds: PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
      });
      const decision = stored.masteryBearing
        ? evaluatedDecision
        : { ...evaluatedDecision, masteryBearing: false };

      if (existingEvidence || decision.idempotency === 'replay') {
        throw new Error(
          'Precalculus learning evidence exists without a submission receipt; refusing replay synthesis',
        );
      }

      if (
        decision.idempotency !== 'new'
        || (
          decision.reason !== 'teacher_led'
          && decision.reason !== 'eligible'
          && decision.reason !== 'ungraded_evidence'
        )
      ) {
        return {
          persisted: false,
          masteryApplied: false,
          kstApplied: false,
          decision,
          delivery: 'new' as const,
        };
      }

      const effect = { learnerId, submissionId, evidence: stored.evidence };
      if (stored.masteryBearing) {
        await masteryBridge(effect);
      }
      await evidenceStore.append(learnerId, stored.evidence, submissionId);

      const receipt: PrecalculusSubmissionReceipt = {
        persisted: true,
        masteryApplied: stored.masteryBearing,
        kstApplied: false,
        decision,
      };
      await receiptStore.append(
        learnerId,
        submissionId,
        receipt,
      );

      return { ...receipt, delivery: 'new' as const };
    },
  };
}

function toContractEvidence(document: Doc<'learning_evidence'>): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1({
    contractVersion: 'learning-evidence.v1',
    nodeId: document.nodeId,
    activityId: document.activityId,
    attemptOrdinal: document.attemptOrdinal,
    origin: document.origin,
    mode: document.mode,
    occurredAt: new Date(document.occurredAt).toISOString(),
    gradedEvidence: document.gradedEvidence,
    idempotencyKey: document.idempotencyKey,
  });
}

function createEvidenceStore(ctx: MutationCtx): PrecalculusLearningEvidenceStore {
  return {
    findByIdempotencyKey: async (learnerId, idempotencyKey) => {
      const document = await ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_and_idempotency_key', (query) => (
          query.eq('learnerId', learnerId as Id<'profiles'>).eq('idempotencyKey', idempotencyKey)
        ))
        .unique();
      return document ? toContractEvidence(document) : null;
    },
    listByLearnerAndNode: async (
      learnerId,
      nodeId,
      options: PrecalculusLearningEvidenceHistoryOptions,
    ) => {
      const documents: Doc<'learning_evidence'>[] = [];
      const seen = new Set<string>();
      const addDocument = (document: Doc<'learning_evidence'> | null) => {
        if (document && !seen.has(String(document._id))) {
          seen.add(String(document._id));
          documents.push(document);
        }
      };
      const occurredAt = Date.parse(options.occurredAt);
      const latestTeacherQuery = ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_node_origin_occurred_at', (query) => {
          return query
            .eq('learnerId', learnerId as Id<'profiles'>)
            .eq('nodeId', nodeId)
            .eq('origin', 'teacher_led')
            .lte('occurredAt', occurredAt);
        })
        .order('desc');
      addDocument(await latestTeacherQuery.first());

      const latestAttempt = await ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_node_activity_origin_attempt', (query) => (
          query
            .eq('learnerId', learnerId as Id<'profiles'>)
            .eq('nodeId', nodeId)
            .eq('activityId', options.activityId)
            .eq('origin', options.origin)
        ))
        .order('desc')
        .first();
      addDocument(latestAttempt);

      return documents.map(toContractEvidence);
    },
    append: async (learnerId, evidence, submissionId) => {
      const occurredAt = Date.parse(evidence.occurredAt);
      if (!Number.isFinite(occurredAt)) {
        throw new TypeError('occurredAt must be a valid ISO timestamp');
      }

      await ctx.db.insert('learning_evidence', {
        learnerId: learnerId as Id<'profiles'>,
        ...(submissionId
          ? { submissionId: submissionId as Id<'activity_submissions'> }
          : {}),
        nodeId: evidence.nodeId,
        activityId: evidence.activityId,
        attemptOrdinal: evidence.attemptOrdinal,
        origin: evidence.origin,
        mode: evidence.mode,
        occurredAt,
        gradedEvidence: evidence.gradedEvidence,
        idempotencyKey: evidence.idempotencyKey,
        createdAt: Date.now(),
      });
    },
  };
}

function createPrecalculusReceiptStore(ctx: MutationCtx, now: number): PrecalculusSubmissionReceiptStore {
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
        decision: document.decision as ReturnType<typeof evaluateLearningEvidenceV1>,
      };
    },
    append: async (learnerId, submissionId, receipt) => {
      await ctx.db.insert('learning_evidence_receipts', {
        learnerId: learnerId as Id<'profiles'>,
        submissionId: submissionId as Id<'activity_submissions'>,
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

function toSrsCard(document: Doc<'srs_cards'>): SrsCardState {
  return {
    cardId: document._id,
    studentId: document.studentId,
    objectiveId: document.objectiveId,
    variantKey: document.problemFamilyId,
    stability: document.stability,
    difficulty: document.difficulty,
    state: document.state,
    dueDate: document.dueDate,
    elapsedDays: document.elapsedDays,
    scheduledDays: document.scheduledDays,
    reps: document.reps,
    lapses: document.lapses,
    lastReview: document.lastReview ?? null,
    createdAt: new Date(document.createdAt).toISOString(),
    updatedAt: new Date(document.updatedAt).toISOString(),
  };
}

function toDatabaseCard(card: SrsCardState) {
  return {
    studentId: card.studentId as Id<'profiles'>,
    objectiveId: card.objectiveId,
    problemFamilyId: card.variantKey,
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    dueDate: card.dueDate,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.lastReview ?? undefined,
    createdAt: Date.parse(card.createdAt),
    updatedAt: Date.parse(card.updatedAt),
  };
}

function createSrsStores(ctx: MutationCtx): {
  cardStore: CardStore;
  reviewLogStore: ReviewLogStore;
} {
  const getCardByVariant = async (studentId: string, variantKey: string) => {
    const document = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_and_problem_family', (query) => (
        query.eq('studentId', studentId as Id<'profiles'>).eq('problemFamilyId', variantKey)
      ))
      .unique();
    return document ? toSrsCard(document) : null;
  };

  const saveCardAndReview = async (
    card: SrsCardState,
    reviewLog: SrsReviewLogEntry,
  ) => {
    const existing = await getCardByVariant(card.studentId, card.variantKey);
    const cardId = existing
      ? existing.cardId
      : await ctx.db.insert('srs_cards', toDatabaseCard(card));

    if (existing) {
      await ctx.db.patch(cardId as Id<'srs_cards'>, toDatabaseCard(card));
    }

    const reviewedAt = Date.parse(reviewLog.reviewedAt);
    if (!Number.isFinite(reviewedAt)) {
      throw new TypeError('reviewedAt must be a valid ISO timestamp');
    }

    await ctx.db.insert('srs_review_log', {
      cardId: cardId as Id<'srs_cards'>,
      studentId: card.studentId as Id<'profiles'>,
      rating: reviewLog.rating,
      reviewId: reviewLog.reviewId,
      submissionId: reviewLog.submissionId,
      evidence: reviewLog.evidence,
      stateBefore: reviewLog.stateBefore,
      stateAfter: reviewLog.stateAfter,
      reviewedAt,
    });

    return { cardId: cardId as string, reviewId: reviewLog.reviewId };
  };

  const cardStore: CardStore = {
    getCard: async (id) => {
      const document = await ctx.db.get('srs_cards', id as Id<'srs_cards'>);
      return document ? toSrsCard(document) : null;
    },
    getCardsByStudent: async (studentId) => {
      const documents = await ctx.db
        .query('srs_cards')
        .withIndex('by_student', (query) => query.eq('studentId', studentId as Id<'profiles'>))
        .collect();
      return documents.map(toSrsCard);
    },
    getCardsByObjective: async (objectiveId) => {
      const documents = await ctx.db
        .query('srs_cards')
        .withIndex('by_objective', (query) => query.eq('objectiveId', objectiveId))
        .collect();
      return documents.map(toSrsCard);
    },
    getCardByStudentAndVariant: getCardByVariant,
    getDueCards: async (studentId, now) => {
      const documents = await ctx.db
        .query('srs_cards')
        .withIndex('by_student_and_due', (query) => query.eq('studentId', studentId as Id<'profiles'>))
        .collect();
      const nowMs = Date.parse(now);
      return documents
        .filter((document) => Date.parse(document.dueDate) <= nowMs)
        .map(toSrsCard);
    },
    saveCard: async (card) => {
      const existing = await getCardByVariant(card.studentId, card.variantKey);
      if (existing) {
        await ctx.db.patch(existing.cardId as Id<'srs_cards'>, toDatabaseCard(card));
      } else {
        await ctx.db.insert('srs_cards', toDatabaseCard(card));
      }
    },
    saveCards: async (cards) => {
      for (const card of cards) {
        await cardStore.saveCard(card);
      }
    },
    saveCardAndReview,
  };

  const reviewLogStore: ReviewLogStore = {
    saveReview: async () => {
      throw new Error('Precalculus learning-evidence SRS persistence requires the atomic save boundary');
    },
    getReviewsByCard: async () => [],
    getReviewsByStudent: async () => [],
  };

  return { cardStore, reviewLogStore };
}

function createSrsSubmission(evidence: LearningEvidenceV1): PracticeSubmissionEnvelope {
  const gradedEvidence = evidence.gradedEvidence;
  if (!gradedEvidence) {
    throw new TypeError('Mastery Advantage SRS processing requires graded evidence');
  }

  return {
    contractVersion: 'practice.v1',
    activityId: toConvexActivityId(evidence.activityId),
    mode: evidence.mode,
    status: 'graded',
    attemptNumber: evidence.attemptOrdinal,
    submittedAt: evidence.occurredAt,
    answers: {},
    parts: [{
      partId: 'learning-evidence-graded-outcome',
      rawAnswer: null,
      isCorrect: gradedEvidence.isCorrect,
    }],
  };
}

async function applyPrecalculusSrsReview(
  ctx: MutationCtx,
  learnerId: Id<'profiles'>,
  evidence: LearningEvidenceV1,
  options: { now: number; submissionId: string },
): Promise<void> {
  const { cardStore, reviewLogStore } = createSrsStores(ctx);
  const adapter = new SubmissionSrsAdapter({
    cardStore,
    reviewLogStore,
    resolver: {
      resolve: async (activityId) => activityId === evidence.activityId
        ? {
            variantKey: evidence.activityId,
            objectiveId: evidence.nodeId,
          }
        : null,
    },
    baselineResolver: {
      getBaseline: async () => null,
    },
    requireAtomicPersistence: true,
  });

  const result = await adapter.processSubmission({
    submission: createSrsSubmission(evidence),
    studentId: learnerId,
    activityId: evidence.activityId,
    now: new Date(options.now).toISOString(),
    submissionId: options.submissionId,
  });
  if (!result.ok) {
    throw new Error('Precalculus SRS processing failed');
  }
}

function cardElapsedDays(card: { lastReview?: string | number; elapsedDays: number }, now: number) {
  const reviewedAt = typeof card.lastReview === 'number' ? card.lastReview : Date.parse(card.lastReview ?? '');
  return Number.isFinite(reviewedAt) ? Math.max(0, (now - reviewedAt) / 86400000) : card.elapsedDays;
}

async function getPracticeKnowledgeState(
  ctx: QueryCtx, args: { learnerId: Id<'profiles'>; now: number }, nodeId: string, title: string, variants: readonly string[],
) {
  const cards = await ctx.db.query('srs_cards').withIndex('by_student_and_objective', q =>
    q.eq('studentId', args.learnerId).eq('objectiveId', nodeId)).collect();
  const allowedCards = cards.filter(card => variants.includes(card.problemFamilyId));
  if (allowedCards.length === 0) return { nodeId, title, status: 'not_started' as const, readiness: 'ready' as const };
  const variantEvidences = aggregateCardsToEvidence(allowedCards.map(card => ({
    stability: card.stability, elapsedDays: cardElapsedDays(card, args.now), difficulty: card.difficulty,
    reps: card.reps, lapses: card.lapses, variantKey: card.problemFamilyId,
  })), {});
  const proficiency = computeObjectiveProficiency({ objectiveId: nodeId, priority: 'essential', minVariants: variants.length, variantEvidences });
  const { state } = buildKstState(allowedCards.map(card => ({
    cardId: String(card._id), objectiveId: card.objectiveId, stability: card.stability, state: card.state,
    lastReviewedAt: typeof card.lastReview === 'number' ? card.lastReview : Date.parse(card.lastReview ?? ''),
  })), [proficiency], loadPilotGraph(), args.now);
  const level = state.get(nodeId)?.state;
  const status = level === 'mastered' ? 'mastered' as const : level === 'decaying' ? 'decaying' as const : 'in_progress' as const;
  return { nodeId, title, status, readiness: 'ready' as const };
}

export async function getPracticeReadiness(ctx: QueryCtx, learnerId: Id<'profiles'>, nodeId: string, now: number): Promise<'ready' | 'blocked' | 'awaiting_teacher_exposure'> {
  const introduction = await ctx.db.query('learning_evidence').withIndex('by_learner_node_origin_occurred_at', q =>
    q.eq('learnerId', learnerId).eq('nodeId', nodeId).eq('origin', 'teacher_led')).order('desc').take(1);
  if (!introduction.length) return 'awaiting_teacher_exposure';
  const prerequisites = (edgesJson.edges as KnowledgeSpaceEdge[]).filter(edge => edge.type === 'prerequisite_for'
    && edge.targetId === nodeId && (edge.reviewStatus === 'reviewed' || edge.reviewStatus === 'approved'));
  for (const edge of prerequisites) {
    const cards = await ctx.db.query('srs_cards').withIndex('by_student_and_objective', q =>
      q.eq('studentId', learnerId).eq('objectiveId', edge.sourceId)).take(100);
    const variantEvidences = aggregateCardsToEvidence(cards.filter(card =>
      card.problemFamilyId === `${edge.sourceId}.guided_practice` || card.problemFamilyId === `${edge.sourceId}.independent_practice`
    ).map(card => ({ stability: card.stability, elapsedDays: cardElapsedDays(card, now), difficulty: card.difficulty,
      reps: card.reps, lapses: card.lapses, variantKey: card.problemFamilyId })), {});
    if (!computeObjectiveProficiency({ objectiveId: edge.sourceId, priority: 'essential', minVariants: 2, variantEvidences }).isProficient) return 'blocked';
  }
  return 'ready';
}

export async function getPrecalculusPilotKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_PILOT_NODE_ID, 'Identify intervals of increase, decrease, and constant behavior from graphs', [
    PRECALCULUS_PILOT_ACTIVITY_ID,
    PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export async function getPrecalculusPhysicalContextKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID, 'Select a graph that models a physical context', [
    PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
    PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusPilotKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusPilotKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export const getPrecalculusPhysicalContextKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusPhysicalContextKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic12KnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_12_NODE_ID, 'Compare average rates of change across intervals', [
    PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic12KnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic12KnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic12GraphAverageRateKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID, 'Compute and interpret the average rate of change', [
    PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic12GraphAverageRateKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic12GraphAverageRateKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic12PointwiseLeastRateKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID, 'Identify the least pointwise rate of change from graphs', [
    PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic12PointwiseLeastRateKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic12PointwiseLeastRateKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic12PointwiseRateOrderingKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID, 'Compare pointwise rates of change from graphs', [
    PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic12PointwiseRateOrderingKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic12PointwiseRateOrderingKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID, 'Model negative-rate contexts', [
    PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic12NegativeRateContextKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic12NegativeRateContextKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID, 'Determine negative-rate intervals for quadratics', [
    PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID, 'Classify linear vs quadratic functions from rate-of-change patterns', [
    PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic13RatePatternClassificationKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic13RatePatternClassificationKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic13ConcavityKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID, 'Determine concavity from rate-of-change behavior', [
    PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic13ConcavityKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic13ConcavityKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID, 'Identify polynomial degree and leading coefficient', [
    PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getTopic14PolynomialDegreeLeadingCoefficientKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getTopic14PolynomialDegreeLeadingCoefficientKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID, 'Identify relative and absolute extrema from graphs', [
    PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic14PolynomialExtremaKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic14PolynomialExtremaKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic14RateSignAndTrendKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID, 'Describe rate-of-change behavior on intervals using precise language', [
    PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic14RateSignAndTrendKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic14RateSignAndTrendKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic14PolynomialEndBehaviorKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID, 'Determine polynomial end behavior from the leading term', [
    PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic14PolynomialEndBehaviorKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic14PolynomialEndBehaviorKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID, 'Find real zeros and multiplicities from factored form', [
    PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic15LeastPolynomialDegreeKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID, 'Determine least polynomial degree from zeros and conjugate pairs', [
    PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic15LeastPolynomialDegreeKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic15LeastPolynomialDegreeKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic15PolynomialInequalityKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID, 'Solve polynomial inequalities using sign charts', [
    PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic15PolynomialInequalityKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic15PolynomialInequalityKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<'profiles'>; now: number },
) {
  return getPracticeKnowledgeState(ctx, args, PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID, 'Determine polynomial end behavior from equations', [
    PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
    PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  ]);
}

export const getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState = internalQuery({
  args: {
    learnerId: v.id('profiles'),
    now: v.number(),
  },
  returns: pilotKnowledgeStateValidator,
  handler: async (ctx, args) => {
    const state = await getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeStateHandler(ctx, args);
    return { ...state, readiness: await getPracticeReadiness(ctx, args.learnerId, state.nodeId, args.now) };
  },
});

export async function submitPrecalculusLearningEvidenceHandler(
  ctx: MutationCtx,
  args: { learnerId: Id<'profiles'>; submissionId: Id<'activity_submissions'> },
  publication?: Parameters<typeof isPrecalculusPilotPublished>[0],
) {
  const storedSubmission = await ctx.db.get('activity_submissions', args.submissionId);
  if (
    storedSubmission
    && (
      storedSubmission.stableActivityId === PRECALCULUS_PILOT_ACTIVITY_ID
      || storedSubmission.stableActivityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
    )
    && !isPrecalculusPilotPublished(publication)
  ) {
    return { accepted: false as const, reason: 'submission_not_found' as const };
  }
  const serverNow = Date.now();
  const handler = createPrecalculusSubmissionLearningEvidenceHandler({
    evidenceStore: createEvidenceStore(ctx),
    receiptStore: createPrecalculusReceiptStore(ctx, serverNow),
    loadActivitySubmission: async (submissionId) => {
      const submission = await ctx.db.get(
        'activity_submissions',
        submissionId as Id<'activity_submissions'>,
      );
      if (!submission) return null;

      return {
        submissionId: String(submission._id),
        userId: String(submission.userId),
        activityId: String(submission.activityId),
        stableActivityId: submission.stableActivityId,
        masteryContractVersion: submission.masteryContractVersion,
        submissionData: submission.submissionData,
        attemptOrdinal: submission.attemptOrdinal,
        score: submission.score,
        maxScore: submission.maxScore,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      };
    },
    masteryBridge: ({ evidence, submissionId }) => applyPrecalculusSrsReview(
      ctx,
      args.learnerId,
      evidence,
      { now: serverNow, submissionId },
    ),
  });

  return handler.process({
    learnerId: args.learnerId,
    submissionId: String(args.submissionId),
  });
}

/**
 * App-owned Convex transaction for the one-node pilot. The activity submission
 * is the only source for ownership, timing, attempt, and grading fields.
 */
export const submit = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: learningEvidenceResultValidator,
  handler: (ctx, args) => submitPrecalculusLearningEvidenceHandler(ctx, args),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPhysicalContextWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { selectedOptionId: string };
  parts: [{ partId: 'selectedOptionId'; rawAnswer: string }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).join('|') !== 'selectedOptionId'
    || typeof answers.selectedOptionId !== 'string'
    || answers.selectedOptionId.trim().length === 0
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'selectedOptionId'
    || typeof parts[0].rawAnswer !== 'string'
    || parts[0].rawAnswer !== answers.selectedOptionId
  ) return false;

  return true;
}

function isTopic12TableAverageRateWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { selectedOptionId: string };
  parts: [{ partId: 'selectedOptionId'; rawAnswer: string }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'selectedOptionId'
    || typeof answers.selectedOptionId !== 'string'
    || answers.selectedOptionId.trim().length === 0
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'selectedOptionId'
    || typeof parts[0].rawAnswer !== 'string'
    || parts[0].rawAnswer !== answers.selectedOptionId
  ) return false;

  return true;
}

function isTopic12GraphAverageRateWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { selectedOptionId: string };
  parts: [{ partId: 'selectedOptionId'; rawAnswer: string }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).join('|') !== 'selectedOptionId'
    || typeof answers.selectedOptionId !== 'string'
    || answers.selectedOptionId.trim().length === 0
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'selectedOptionId'
    || typeof parts[0].rawAnswer !== 'string'
    || parts[0].rawAnswer !== answers.selectedOptionId
  ) return false;

  return true;
}

function isTopic12PointwiseLeastRateWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { selectedOptionId: string };
  parts: [{ partId: 'selectedOptionId'; rawAnswer: string }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'selectedOptionId'
    || typeof answers.selectedOptionId !== 'string'
    || answers.selectedOptionId.trim().length === 0
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'selectedOptionId'
    || typeof parts[0].rawAnswer !== 'string'
    || parts[0].rawAnswer !== answers.selectedOptionId
  ) return false;

  return true;
}

function isTopic12PointwiseRateOrderingWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { orderedPointIds: ['B', 'C', 'A'] };
  parts: [{ partId: 'orderedPointIds'; rawAnswer: ['B', 'C', 'A'] }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  const orderedPointIds = isRecord(answers) ? answers.orderedPointIds : undefined;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'orderedPointIds'
    || !Array.isArray(orderedPointIds)
    || orderedPointIds.length !== 3
    || orderedPointIds[0] !== 'B'
    || orderedPointIds[1] !== 'C'
    || orderedPointIds[2] !== 'A'
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'orderedPointIds'
    || !Array.isArray(parts[0].rawAnswer)
    || parts[0].rawAnswer.length !== orderedPointIds.length
    || parts[0].rawAnswer.some((pointId, index) => pointId !== orderedPointIds[index])
  ) return false;

  return true;
}

function isTopic12NegativeRateContextWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { selectedOptionId: string };
  parts: [{ partId: 'selectedOptionId'; rawAnswer: string }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'selectedOptionId'
    || typeof answers.selectedOptionId !== 'string'
    || !['A', 'B', 'C', 'D'].includes(answers.selectedOptionId)
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'selectedOptionId'
    || parts[0].rawAnswer !== answers.selectedOptionId
  ) return false;

  return true;
}

function isTopic12QuadraticNegativeRateIntervalWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { selectedOptionId: string };
  parts: [{ partId: 'selectedOptionId'; rawAnswer: string }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'selectedOptionId'
    || typeof answers.selectedOptionId !== 'string'
    || !['A', 'B', 'C', 'D'].includes(answers.selectedOptionId)
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'selectedOptionId'
    || parts[0].rawAnswer !== answers.selectedOptionId
  ) return false;

  return true;
}

function isTopic13RatePatternClassificationWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { a: string; b: string; c: string };
  parts: [
    { partId: 'a'; rawAnswer: string },
    { partId: 'b'; rawAnswer: string },
    { partId: 'c'; rawAnswer: string },
  ];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'a|b|c'
    || !['linear', 'quadratic', 'neither', 'cannot_determine'].includes(answers.a as string)
    || !['linear', 'quadratic', 'neither', 'cannot_determine'].includes(answers.b as string)
    || !['linear', 'quadratic', 'neither', 'cannot_determine'].includes(answers.c as string)
  ) return false;

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 3) return false;
  const expectedPartIds = ['a', 'b', 'c'] as const;
  if (expectedPartIds.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'partId|rawAnswer'
      || part.partId !== partId
      || typeof part.rawAnswer !== 'string'
      || part.rawAnswer !== answers[partId]
    );
  })) return false;

  return true;
}

function isTopic13ConcavityWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { classification: 'concave_up' };
  parts: [{ partId: 'classification'; rawAnswer: 'concave_up' }];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const answers = value.answers;
  const expectedClassification = (generateTopic13ConcavityFromRateChangeOutput(0).expectedAnswer as {
    classification: string;
  }).classification;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'classification'
    || answers.classification !== expectedClassification
  ) return false;

  const parts = value.parts;
  if (
    !Array.isArray(parts)
    || parts.length !== 1
    || !isRecord(parts[0])
    || Object.keys(parts[0]).sort().join('|') !== 'partId|rawAnswer'
    || parts[0].partId !== 'classification'
    || parts[0].rawAnswer !== expectedClassification
  ) return false;

  return true;
}

function isTopic14PolynomialDegreeLeadingCoefficientWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: {
    a_degree: string;
    a_leading_coefficient: string;
    b_degree: string;
    b_leading_coefficient: string;
    c_degree: string;
    c_leading_coefficient: string;
  };
  parts: [
    { partId: 'a_degree'; rawAnswer: string },
    { partId: 'a_leading_coefficient'; rawAnswer: string },
    { partId: 'b_degree'; rawAnswer: string },
    { partId: 'b_leading_coefficient'; rawAnswer: string },
    { partId: 'c_degree'; rawAnswer: string },
    { partId: 'c_leading_coefficient'; rawAnswer: string },
  ];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) return false;

  const expectedSourceAnswer = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0).expectedAnswer as Record<string, number>;
  const sourceAnswers = {
    a_degree: String(expectedSourceAnswer.a_degree),
    a_leading_coefficient: String(expectedSourceAnswer.a_leading_coefficient),
    b_degree: String(expectedSourceAnswer.b_degree),
    b_leading_coefficient: String(expectedSourceAnswer.b_leading_coefficient),
    c_degree: String(expectedSourceAnswer.c_degree),
    c_leading_coefficient: String(expectedSourceAnswer.c_leading_coefficient),
  };
  const answers = value.answers;
  const expectedAnswerIds = [
    'a_degree',
    'a_leading_coefficient',
    'b_degree',
    'b_leading_coefficient',
    'c_degree',
    'c_leading_coefficient',
  ] as const;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== expectedAnswerIds.join('|')
    || expectedAnswerIds.some((answerId) => (
      typeof answers[answerId] !== 'string'
      || answers[answerId] !== sourceAnswers[answerId]
    ))
  ) return false;

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== expectedAnswerIds.length) return false;
  if (expectedAnswerIds.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'partId|rawAnswer'
      || part.partId !== partId
      || part.rawAnswer !== sourceAnswers[partId]
    );
  })) return false;

  return true;
}

function isTopic14PolynomialExtremaWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: {
    relative_minimum_x: string;
    relative_maximum_x: string;
    absolute_minimum_x: string;
  };
  parts: [
    { partId: 'relative_minimum_x'; rawAnswer: string },
    { partId: 'relative_maximum_x'; rawAnswer: string },
    { partId: 'absolute_minimum_x'; rawAnswer: string },
  ];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) return false;

  const expectedSourceAnswer = generateTopic14PolynomialExtremaFromGraphOutput(0).expectedAnswer as {
    relative_minimum_x: number;
    relative_maximum_x: number;
    absolute_minimum_x: number;
  };
  const sourceAnswers = {
    relative_minimum_x: String(expectedSourceAnswer.relative_minimum_x),
    relative_maximum_x: String(expectedSourceAnswer.relative_maximum_x),
    absolute_minimum_x: String(expectedSourceAnswer.absolute_minimum_x),
  };
  const answerIds = [
    'relative_minimum_x',
    'relative_maximum_x',
    'absolute_minimum_x',
  ] as const;
  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'absolute_minimum_x|relative_maximum_x|relative_minimum_x'
    || answerIds.some((answerId) => (
      typeof answers[answerId] !== 'string'
      || answers[answerId] !== sourceAnswers[answerId]
    ))
  ) return false;

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== answerIds.length) return false;
  return !answerIds.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'partId|rawAnswer'
      || part.partId !== partId
      || part.rawAnswer !== sourceAnswers[partId]
      || part.rawAnswer !== answers[partId]
    );
  });
}

function isTopic14RateSignAndTrendWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: {
    rateSign: string;
    rateTrend: string;
  };
  parts: [
    { partId: 'rateSign'; rawAnswer: string },
    { partId: 'rateTrend'; rawAnswer: string },
  ];
} {
  if (!isRecord(value)) return false;
  if (
    Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt'
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) return false;

  const expectedSourceAnswer = generateTopic14RateSignAndTrendOutput(0).expectedAnswer as {
    rateSign: string;
    rateTrend: string;
  };
  const sourceAnswers = {
    rateSign: String(expectedSourceAnswer.rateSign),
    rateTrend: String(expectedSourceAnswer.rateTrend),
  };
  const partIds = ['rateSign', 'rateTrend'] as const;
  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'rateSign|rateTrend'
    || partIds.some((partId) => (
      typeof answers[partId] !== 'string'
      || answers[partId] !== sourceAnswers[partId]
    ))
  ) return false;

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== partIds.length) return false;
  return !partIds.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'partId|rawAnswer'
      || part.partId !== partId
      || part.rawAnswer !== sourceAnswers[partId]
      || part.rawAnswer !== answers[partId]
    );
  });
}

function isTopic14PolynomialEndBehaviorWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: {
    leftEnd: string;
    rightEnd: string;
  };
  parts: [
    { partId: 'leftEnd'; rawAnswer: string },
    { partId: 'rightEnd'; rawAnswer: string },
  ];
} {
  if (!isRecord(value)) return false;
  const expectedFields = [
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ];
  if (Object.keys(value).sort().join('|') !== expectedFields.join('|')) return false;
  if (
    value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) return false;

  const expected = generateTopic14PolynomialEndBehaviorOutput(0).expectedAnswer as {
    leftEnd: string;
    rightEnd: string;
  };
  const sourceAnswers = {
    leftEnd: String(expected.leftEnd),
    rightEnd: String(expected.rightEnd),
  };
  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'leftEnd|rightEnd'
    || answers.leftEnd !== sourceAnswers.leftEnd
    || answers.rightEnd !== sourceAnswers.rightEnd
  ) return false;

  const parts = value.parts;
  const partIds = ['leftEnd', 'rightEnd'] as const;
  if (!Array.isArray(parts) || parts.length !== partIds.length) return false;
  return !partIds.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'partId|rawAnswer'
      || part.partId !== partId
      || part.rawAnswer !== sourceAnswers[partId]
    );
  });
}

function isTopic15RealZerosAndMultiplicitiesWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: {
    a: Array<{ zero: number; multiplicity: number }>;
    b: Array<{ zero: number; multiplicity: number }>;
  };
  parts: [
    { partId: 'a'; rawAnswer: Array<{ zero: number; multiplicity: number }> },
    { partId: 'b'; rawAnswer: Array<{ zero: number; multiplicity: number }> },
  ];
} {
  if (!isRecord(value)) return false;
  const expectedFields = [
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ];
  if (Object.keys(value).sort().join('|') !== expectedFields.join('|')) return false;
  if (
    value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) return false;

  const expected = generateTopic15RealZerosAndMultiplicitiesOutput(0).expectedAnswer as {
    a: Array<{ zero: number; multiplicity: number }>;
    b: Array<{ zero: number; multiplicity: number }>;
  };
  const sourceAnswers = {
    a: expected.a.map((pair) => ({ zero: pair.zero, multiplicity: pair.multiplicity })),
    b: expected.b.map((pair) => ({ zero: pair.zero, multiplicity: pair.multiplicity })),
  };
  const samePairs = (candidate: unknown, expectedPairs: Array<{ zero: number; multiplicity: number }>) => (
    Array.isArray(candidate)
    && candidate.length === expectedPairs.length
    && !candidate.some((pair, index) => (
      !isRecord(pair)
      || Object.keys(pair).sort().join('|') !== 'multiplicity|zero'
      || typeof pair.zero !== 'number'
      || !Number.isFinite(pair.zero)
      || typeof pair.multiplicity !== 'number'
      || !Number.isFinite(pair.multiplicity)
      || pair.zero !== expectedPairs[index]!.zero
      || pair.multiplicity !== expectedPairs[index]!.multiplicity
    ))
  );

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'a|b'
    || !samePairs(answers.a, sourceAnswers.a)
    || !samePairs(answers.b, sourceAnswers.b)
  ) return false;

  const parts = value.parts;
  const partIds = ['a', 'b'] as const;
  if (!Array.isArray(parts) || parts.length !== partIds.length) return false;
  return !partIds.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'partId|rawAnswer'
      || part.partId !== partId
      || !samePairs(part.rawAnswer, sourceAnswers[partId])
    );
  });
}

function isExactTopic11Acknowledgement(
  submission: Record<string, unknown>,
  activity: Record<string, unknown>,
): boolean {
  const data = submission.submissionData;
  return submission.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && submission.masteryContractVersion === 'learning-evidence.v1'
    && Number.isInteger(submission.attemptOrdinal)
    && (submission.attemptOrdinal as number) > 0
    && typeof submission.submittedAt === 'number'
    && Number.isFinite(submission.submittedAt)
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.feedback === undefined
    && submission.gradedAt === undefined
    && activity.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && activity.componentKey === PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY
    && activity.displayName === 'Topic 1.1: Identify Graph Intervals with Your Teacher'
    && activity.description === 'Worked-example source activity for classifying increasing, decreasing, and constant intervals.'
    && isRecord(activity.props)
    && Object.keys(activity.props).sort().join('|') === 'mode|nodeId|source'
    && activity.props.nodeId === PRECALCULUS_PILOT_NODE_ID
    && activity.props.mode === 'worked_example'
    && activity.props.source === 'teacher_led'
    && isRecord(activity.gradingConfig)
    && Object.keys(activity.gradingConfig).join('|') === 'variantSeed'
    && activity.gradingConfig.variantSeed === 0
    && activity.approval !== undefined
    && isRecord(activity.approval)
    && activity.approval.status === 'approved'
    && isRecord(data)
    && Object.keys(data).sort().join('|') === 'activityId|answers|contractVersion|mode|parts|status'
    && data.contractVersion === 'practice.v1'
    && data.activityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && data.mode === 'worked_example'
    && data.status === 'submitted'
    && isRecord(data.answers)
    && Object.keys(data.answers).length === 0
    && Array.isArray(data.parts)
    && data.parts.length === 0;
}

/** Confirms a verified learner acknowledgement as teacher-led exposure. */
export const submitTopic11TeacherSubmission = internalMutation({
  args: {
    teacherId: v.id('profiles'),
    learnerId: v.id('profiles'),
    classId: v.id('classes'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const [teacher, learner, classroom, enrollment, submission] = await Promise.all([
      ctx.db.get('profiles', args.teacherId),
      ctx.db.get('profiles', args.learnerId),
      ctx.db.get('classes', args.classId),
      ctx.db.query('class_enrollments').withIndex('by_class_and_student', (query) => (
        query.eq('classId', args.classId).eq('studentId', args.learnerId)
      )).unique(),
      ctx.db.get('activity_submissions', args.submissionId),
    ]);
    const [teacherCredential, learnerCredential] = await Promise.all([
      teacher ? ctx.db.query('auth_credentials').withIndex('by_username', (query) => query.eq('username', teacher.username)).unique() : null,
      learner ? ctx.db.query('auth_credentials').withIndex('by_username', (query) => query.eq('username', learner.username)).unique() : null,
    ]);
    const validCredential = (profile: typeof teacher, credential: typeof teacherCredential) => (
      profile && credential && credential.isActive && credential.profileId === profile._id
      && credential.username === profile.username && credential.role === profile.role
      && credential.organizationId === profile.organizationId
    );
    if (!teacher || teacher.role !== 'teacher' || !validCredential(teacher, teacherCredential)
      || !learner || learner.role !== 'student' || !validCredential(learner, learnerCredential)
      || teacher.organizationId !== learner.organizationId
      || !classroom || classroom.teacherId !== args.teacherId || classroom.archived
      || enrollment?.status !== 'active' || !submission || submission.userId !== args.learnerId) {
      throw new Error('unauthorized_exposure');
    }
    const activity = await ctx.db.get('activities', submission.activityId);
    const now = Date.now();
    if (!activity || !isExactTopic11Acknowledgement(submission, activity)
      || submission.submittedAt > now
      || !Number.isFinite(activity.createdAt) || activity.createdAt > submission.submittedAt
      || !isRecord(activity.approval) || !Number.isFinite(activity.approval.reviewedAt)
      || (activity.approval.reviewedAt as number) > submission.submittedAt) {
      throw new Error('invalid_source_submission');
    }
    const lesson = await ctx.db.query('lessons')
      .withIndex('by_unit_and_order', (query) => query.eq('unitNumber', 1).eq('orderIndex', 1)).unique();
    const assignment = lesson ? await ctx.db.query('class_lessons')
      .withIndex('by_class_and_lesson', (query) => query.eq('classId', args.classId).eq('lessonId', lesson._id)).unique() : null;
    if (!lesson || !assignment || enrollment.enrolledAt > submission.submittedAt
      || assignment.assignedAt > submission.submittedAt) {
      throw new Error('invalid_source_assignment');
    }
    const attemptOrdinal = submission.attemptOrdinal;
    if (attemptOrdinal === undefined) throw new Error('invalid_source_submission');
    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      attemptOrdinal,
      origin: 'teacher_led',
      mode: 'teaching',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const prior = await ctx.db.query('learning_evidence')
      .withIndex('by_learner_and_idempotency_key', (query) => (
        query.eq('learnerId', args.learnerId).eq('idempotencyKey', evidence.idempotencyKey)
      )).unique();
    if (!prior && (!isTopic11WorkedSourcePublished()
      || !await hasCurrentTopic11Source(ctx, lesson._id, activity._id, submission.submittedAt))) {
      throw new Error('invalid_source_assignment');
    }
    const result = await runtime.process({ learnerId: String(args.learnerId), evidence });
    if (result.decision.idempotency === 'conflict') throw new Error('idempotency_conflict');
    return {
      ...result,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
    };
  },
});

function isTopic16EquationEndBehaviorWorkedSubmissionData(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const partIds = [
    'a_leftEnd', 'a_rightEnd', 'b_leftEnd', 'b_rightEnd',
    'c_leftEnd', 'c_rightEnd', 'd_leftEnd', 'd_rightEnd',
    'e_leftEnd', 'e_rightEnd', 'f_leftEnd', 'f_rightEnd',
  ] as const;
  if (Object.keys(value).sort().join('|') !== 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt') {
    return false;
  }
  if (
    value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isSafeInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(Date.parse(value.submittedAt)).toISOString() !== value.submittedAt
  ) {
    return false;
  }

  const expectedAnswers = generateTopic16EquationEndBehaviorOutput(0).expectedAnswer as Record<string, unknown>;
  const answers = value.answers;
  const parts = value.parts;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== partIds.join('|')
    || partIds.some((partId) => answers[partId] !== expectedAnswers[partId])
    || !Array.isArray(parts)
    || parts.length !== partIds.length
  ) {
    return false;
  }
  return !partIds.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || Object.keys(part).sort().join('|') !== 'partId|rawAnswer'
      || part.partId !== partId
      || part.rawAnswer !== answers[partId]
      || part.rawAnswer !== expectedAnswers[partId]
    );
  });
}

export const submitTopic16EquationEndBehaviorWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const workedOutput = generateTopic16EquationEndBehaviorOutput(0);
    const expectedWorkedProps = {
      ...(workedOutput.data as { rendererProps: Record<string, unknown> }).rendererProps,
      presentationMode: 'worked_example' as const,
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: 'The six polynomial end behaviors are shown above.',
    };
    const forbiddenStoredFields = [
      'masteryContractVersion', 'score', 'maxScore', 'feedback', 'gradedAt',
      'evidence', 'kst', 'srs', 'correctness', 'isCorrect', 'answer', 'answerKey',
      'correctAnswer', 'correctAnswers', 'expectedAnswer', 'grading', 'gradingMetadata',
      'normalizedAnswer', 'solution', 'solutions', 'solutionSteps', 'steps', 'finalAnswer',
      'authority',
    ];
    if (
      Object.keys(submission).filter((field) => field !== '_creationTime').sort().join('|')
        !== '_id|activityId|attemptOrdinal|createIdempotencyKey|createdAt|stableActivityId|submissionData|submittedAt|updatedAt|userId'
      || (Object.hasOwn(submission, '_creationTime') && (
        typeof submission._creationTime !== 'number'
        || !Number.isFinite(submission._creationTime)
      ))
      || typeof submission.activityId !== 'string'
      || submission.activityId.trim().length === 0
      || !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY
      || !isRecord(activity.props)
      || JSON.stringify(activity.props) !== JSON.stringify(expectedWorkedProps)
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || typeof submission.createIdempotencyKey !== 'string'
      || submission.createIdempotencyKey.trim().length === 0
      || !isTopic16EquationEndBehaviorWorkedSubmissionData(submission.submissionData)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isSafeInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || submission.submissionData.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(submission.submissionData.submittedAt as string) !== submission.submittedAt
      || typeof submission.createdAt !== 'number'
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || typeof submission.updatedAt !== 'number'
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || forbiddenStoredFields.some((field) => Object.hasOwn(submission, field))
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
      activityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-6-equation-end-behavior:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque physical Worked submission ID. The stored row and
 * its provisioned activity provide every evidence field. This path remains
 * ungraded and does not call the mastery bridge.
 */
export const submitPhysicalContextWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG.variantSeed
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID
      || !isPhysicalContextWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:physical-context:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque Topic 1.2 Worked submission ID. The stored row and
 * its provisioned activity provide every evidence field. This path remains
 * ungraded and does not call the mastery bridge.
 */
export const submitTopic12TableAverageRateWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG.variantSeed
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID
      || !isTopic12TableAverageRateWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-2:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque Topic 1.2 graph Worked submission ID. The stored row
 * and its provisioned activity provide every evidence field. This path remains
 * ungraded and does not call the mastery bridge.
 */
export const submitTopic12GraphAverageRateWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID
      || !isTopic12GraphAverageRateWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-2-graph:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque Topic 1.2 pointwise Worked submission ID. The
 * stored row and its provisioned activity provide every evidence field. This
 * path remains ungraded and does not call the mastery bridge.
 */
export const submitTopic12PointwiseLeastRateWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID
      || !isTopic12PointwiseLeastRateWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-2-pointwise:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque Topic 1.2 pointwise rate-ordering Worked submission ID.
 * The stored row and its provisioned activity provide every evidence field.
 * This path remains ungraded and does not call the mastery bridge.
 */
export const submitTopic12PointwiseRateOrderingWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID
      || !isTopic12PointwiseRateOrderingWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-2-pointwise-ordering:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque Topic 1.2 negative-rate context Worked submission ID.
 * The stored row and its provisioned activity provide every evidence field.
 * This path remains ungraded and does not call the mastery bridge.
 */
export const submitTopic12NegativeRateContextWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID
      || !isTopic12NegativeRateContextWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-2-negative-rate-context:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque Topic 1.2 quadratic negative-rate interval Worked
 * submission ID. The stored row and its provisioned activity provide every
 * evidence field. This path remains ungraded and does not call the mastery
 * bridge.
 */
export const submitTopic12QuadraticNegativeRateIntervalWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID
      || !isTopic12QuadraticNegativeRateIntervalWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-2-quadratic-negative-rate-interval:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

/**
 * Consumes only an opaque Topic 1.3 rate-pattern classification Worked
 * submission ID. The stored row and its activity document provide every
 * teacher-exposure field. This path remains ungraded and does not call
 * mastery, SRS, or KST code.
 */
export const submitTopic13RatePatternClassificationWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID
      || !isTopic13RatePatternClassificationWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-3-rate-pattern-classification:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

export const submitTopic13ConcavityWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID
      || !isTopic13ConcavityWorkedSubmissionData(submission.submissionData)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || submission.submissionData.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(submission.submissionData.submittedAt) !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      activityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-3-concavity:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

export const submitTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID
      || !isTopic14PolynomialDegreeLeadingCoefficientWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || Object.hasOwn(submission, 'masteryContractVersion')
      || Object.hasOwn(submission, 'score')
      || Object.hasOwn(submission, 'maxScore')
      || Object.hasOwn(submission, 'feedback')
      || Object.hasOwn(submission, 'gradedAt')
      || Object.hasOwn(submission, 'correctness')
      || Object.hasOwn(submission, 'expectedAnswer')
      || Object.hasOwn(submission, 'answerKey')
      || Object.hasOwn(submission, 'correctAnswer')
      || Object.hasOwn(submission, 'correctAnswers')
      || Object.hasOwn(submission, 'solution')
      || Object.hasOwn(submission, 'solutionSteps')
      || Object.hasOwn(submission, 'gradingMetadata')
      || Object.hasOwn(submission, 'finalAnswer')
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-4-polynomial-degree-leading-coefficient:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

export const submitTopic14PolynomialExtremaWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    const forbiddenStoredFields = [
      'masteryContractVersion',
      'score',
      'maxScore',
      'feedback',
      'gradedAt',
      'correctness',
      'isCorrect',
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutions',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ];
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
      || !isTopic14PolynomialExtremaWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || typeof submission.createdAt !== 'number'
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || typeof submission.updatedAt !== 'number'
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || forbiddenStoredFields.some((field) => Object.hasOwn(submission, field))
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-4-polynomial-extrema:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

export const submitTopic14RateSignAndTrendWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const data = submission.submissionData;
    const forbiddenStoredFields = [
      'masteryContractVersion',
      'score',
      'maxScore',
      'feedback',
      'gradedAt',
      'correctness',
      'isCorrect',
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutions',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ];
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID
      || !isTopic14RateSignAndTrendWorkedSubmissionData(data)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || data.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(data.submittedAt) !== submission.submittedAt
      || typeof submission.createdAt !== 'number'
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || typeof submission.updatedAt !== 'number'
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || forbiddenStoredFields.some((field) => Object.hasOwn(submission, field))
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
      activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-4-rate-sign-and-trend:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

export const submitTopic14PolynomialEndBehaviorWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const forbiddenStoredFields = [
      'masteryContractVersion',
      'score',
      'maxScore',
      'feedback',
      'gradedAt',
      'correctness',
      'isCorrect',
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutions',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ];
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY
      || typeof activity.gradingConfig.variantSeed !== 'number'
      || !Number.isInteger(activity.gradingConfig.variantSeed)
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || !isTopic14PolynomialEndBehaviorWorkedSubmissionData(submission.submissionData)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || submission.submissionData.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(submission.submissionData.submittedAt) !== submission.submittedAt
      || typeof submission.createdAt !== 'number'
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || typeof submission.updatedAt !== 'number'
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || forbiddenStoredFields.some((field) => Object.hasOwn(submission, field))
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-4-polynomial-end-behavior:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

export const submitTopic15RealZerosAndMultiplicitiesWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const forbiddenStoredFields = [
      'masteryContractVersion',
      'score',
      'maxScore',
      'feedback',
      'gradedAt',
      'correctness',
      'isCorrect',
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutions',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ];
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY
      || typeof activity.gradingConfig.variantSeed !== 'number'
      || !Number.isInteger(activity.gradingConfig.variantSeed)
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
      || !isTopic15RealZerosAndMultiplicitiesWorkedSubmissionData(submission.submissionData)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || submission.submissionData.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(submission.submissionData.submittedAt) !== submission.submittedAt
      || typeof submission.createdAt !== 'number'
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || typeof submission.updatedAt !== 'number'
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || forbiddenStoredFields.some((field) => Object.hasOwn(submission, field))
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
      activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-5-real-zeros-and-multiplicities:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

function isTopic15LeastPolynomialDegreeWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { leastDegree: number };
  parts: [{ partId: 'leastDegree'; rawAnswer: number }];
} {
  if (!isRecord(value)) return false;
  const expectedFields = [
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ];
  if (Object.keys(value).sort().join('|') !== expectedFields.join('|')) return false;
  if (
    value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isSafeInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) return false;

  const expected = generateTopic15LeastPolynomialDegreeOutput(0).expectedAnswer;
  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join('|') !== 'leastDegree'
    || typeof answers.leastDegree !== 'number'
    || !Number.isSafeInteger(answers.leastDegree)
    || answers.leastDegree !== expected.leastDegree
  ) return false;

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 1) return false;
  const part = parts[0];
  return (
    isRecord(part)
    && Object.keys(part).sort().join('|') === 'partId|rawAnswer'
    && part.partId === 'leastDegree'
    && typeof part.rawAnswer === 'number'
    && Number.isSafeInteger(part.rawAnswer)
    && part.rawAnswer === expected.leastDegree
    && part.rawAnswer === answers.leastDegree
  );
}

export const submitTopic15LeastPolynomialDegreeWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const forbiddenStoredFields = [
      'masteryContractVersion',
      'score',
      'maxScore',
      'feedback',
      'gradedAt',
      'correctness',
      'isCorrect',
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutions',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ];
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY
      || typeof activity.gradingConfig.variantSeed !== 'number'
      || !Number.isSafeInteger(activity.gradingConfig.variantSeed)
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID
      || !isTopic15LeastPolynomialDegreeWorkedSubmissionData(submission.submissionData)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isSafeInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || submission.submissionData.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(submission.submissionData.submittedAt) !== submission.submittedAt
      || typeof submission.createdAt !== 'number'
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || typeof submission.updatedAt !== 'number'
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || forbiddenStoredFields.some((field) => Object.hasOwn(submission, field))
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-5-least-polynomial-degree:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});

function isTopic15PolynomialInequalityWorkedSubmissionData(value: unknown): value is {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: {
    roots: number[];
    intervalSigns: Array<'+' | '-'>;
    solution: string;
  };
  parts: [
    { partId: 'roots'; rawAnswer: number[] },
    { partId: 'intervalSigns'; rawAnswer: Array<'+' | '-'> },
    { partId: 'solution'; rawAnswer: string },
  ];
} {
  if (!isRecord(value)) return false;
  const expectedFields = [
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ];
  if (Object.keys(value).sort().join('|') !== expectedFields.join('|')) return false;
  if (
    value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isSafeInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) return false;

  const expected = generateTopic15PolynomialInequalityOutput(0).expectedAnswer;
  const expectedRoots = expected.roots as number[];
  const expectedIntervalSigns = expected.intervalSigns as Array<'+' | '-'>;
  const expectedSolution = expected.solution as string;
  const answers = value.answers;
  if (!isRecord(answers) || Object.keys(answers).sort().join('|') !== 'intervalSigns|roots|solution') return false;
  const roots = answers.roots;
  const intervalSigns = answers.intervalSigns;
  if (
    !Array.isArray(roots)
    || roots.length !== 3
    || !roots.every((root) => (
      typeof root === 'number'
      && Number.isFinite(root)
      && Math.abs(root) <= Number.MAX_SAFE_INTEGER
    ))
    || JSON.stringify(roots) !== JSON.stringify(expectedRoots)
    || !Array.isArray(intervalSigns)
    || intervalSigns.length !== 4
    || !intervalSigns.every((sign) => sign === '+' || sign === '-')
    || JSON.stringify(intervalSigns) !== JSON.stringify(expectedIntervalSigns)
    || typeof answers.solution !== 'string'
    || answers.solution.trim().length === 0
    || answers.solution !== expectedSolution
  ) return false;

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 3) return false;
  const rootsPart = parts[0];
  const intervalSignsPart = parts[1];
  const solutionPart = parts[2];
  return (
    isRecord(rootsPart)
    && Object.keys(rootsPart).sort().join('|') === 'partId|rawAnswer'
    && rootsPart.partId === 'roots'
    && JSON.stringify(rootsPart.rawAnswer) === JSON.stringify(roots)
    && JSON.stringify(rootsPart.rawAnswer) === JSON.stringify(expectedRoots)
    && isRecord(intervalSignsPart)
    && Object.keys(intervalSignsPart).sort().join('|') === 'partId|rawAnswer'
    && intervalSignsPart.partId === 'intervalSigns'
    && JSON.stringify(intervalSignsPart.rawAnswer) === JSON.stringify(intervalSigns)
    && JSON.stringify(intervalSignsPart.rawAnswer) === JSON.stringify(expectedIntervalSigns)
    && isRecord(solutionPart)
    && Object.keys(solutionPart).sort().join('|') === 'partId|rawAnswer'
    && solutionPart.partId === 'solution'
    && solutionPart.rawAnswer === answers.solution
    && solutionPart.rawAnswer === expectedSolution
  );
}

export const submitTopic15PolynomialInequalityWorkedSubmission = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    submissionId: v.id('activity_submissions'),
  },
  returns: topic11TeacherLedLearningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const submission = await ctx.db.get('activity_submissions', args.submissionId);
    if (!submission || submission.userId !== args.learnerId) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const activity = await ctx.db.get('activities', submission.activityId);
    const forbiddenStoredFields = [
      'masteryContractVersion',
      'score',
      'maxScore',
      'feedback',
      'gradedAt',
      'correctness',
      'isCorrect',
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutions',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ];
    if (
      !activity
      || activity._id !== submission.activityId
      || activity.stableActivityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== 'worked_example'
      || !isRecord(activity.gradingConfig)
      || Object.keys(activity.gradingConfig).sort().join('|') !== 'generatorKey|variantSeed'
      || activity.gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY
      || typeof activity.gradingConfig.variantSeed !== 'number'
      || !Number.isSafeInteger(activity.gradingConfig.variantSeed)
      || activity.gradingConfig.variantSeed !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG.variantSeed
      || submission._id !== args.submissionId
      || submission.activityId !== activity._id
      || submission.stableActivityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
      || typeof submission.createIdempotencyKey !== 'string'
      || submission.createIdempotencyKey.trim().length === 0
      || !isTopic15PolynomialInequalityWorkedSubmissionData(submission.submissionData)
      || typeof submission.attemptOrdinal !== 'number'
      || !Number.isSafeInteger(submission.attemptOrdinal)
      || submission.attemptOrdinal < 1
      || submission.submissionData.attemptNumber !== submission.attemptOrdinal
      || typeof submission.submittedAt !== 'number'
      || !Number.isFinite(submission.submittedAt)
      || Date.parse(submission.submissionData.submittedAt) !== submission.submittedAt
      || typeof submission.createdAt !== 'number'
      || !Number.isFinite(submission.createdAt)
      || submission.createdAt !== submission.submittedAt
      || typeof submission.updatedAt !== 'number'
      || !Number.isFinite(submission.updatedAt)
      || submission.updatedAt !== submission.submittedAt
      || forbiddenStoredFields.some((field) => Object.hasOwn(submission, field))
    ) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }

    const evidence = normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
      activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: new Date(submission.submittedAt).toISOString(),
      idempotencyKey: `precalc:topic-1-5-polynomial-inequality:teacher-led:submission:${String(args.submissionId)}`,
    });
    const runtime = createPrecalculusLearningEvidenceRuntime({
      store: createEvidenceStore(ctx),
      masteryBridge: async () => undefined,
    });
    const result = await runtime.process({
      learnerId: String(args.learnerId),
      evidence,
    });
    return {
      persisted: result.persisted,
      masteryApplied: false as const,
      kstApplied: false as const,
      delivery: result.decision.idempotency === 'replay' ? 'replay' as const : 'new' as const,
      decision: result.decision,
    };
  },
});
