import {
  evaluateLearningEvidenceV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  PracticeSubmissionEnvelopeSchema,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';
import { toConvexActivityId } from '@math-platform/practice-core/contract';
import {
  isPrecalculusPilotPublished,
  PRECALCULUS_PILOT_ACTIVITY_ID,
  PRECALCULUS_PILOT_COMPONENT_KEY,
  PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
} from './activities';
import { gradeTopic11IntervalGraph } from '../lib/practice/topic11-interval-graph';
import { submitPrecalculusLearningEvidenceHandler } from './learningEvidence';
import {
  SubmissionSrsAdapter,
  type PracticeSubmissionEnvelope,
  type SrsCardState,
  type SrsReviewLogEntry,
} from '@math-platform/srs-engine';
import type { CardStore, ReviewLogStore } from '@math-platform/srs-engine/adapters';

import { internalMutation, type MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';

import {
  createPrecalculusLearningEvidenceRuntime,
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_PILOT_NODE_ID,
  type PrecalculusLearningEvidenceProcessResult,
  type PrecalculusLearningEvidenceStore,
} from '../lib/learning-evidence/precalc-pilot';

const gradedEvidenceValidator = v.optional(v.object({
  isCorrect: v.optional(v.boolean()),
  score: v.optional(v.number()),
  maxScore: v.optional(v.number()),
}));

const learningEvidenceValidator = v.object({
  contractVersion: v.literal('learning-evidence.v1'),
  nodeId: v.string(),
  activityId: v.string(),
  attemptOrdinal: v.number(),
  origin: v.union(v.literal('teacher_led'), v.literal('mastery_advantage')),
  mode: v.union(
    v.literal('worked_example'),
    v.literal('guided_practice'),
    v.literal('independent_practice'),
    v.literal('assessment'),
    v.literal('teaching'),
  ),
  occurredAt: v.string(),
  gradedEvidence: gradedEvidenceValidator,
  idempotencyKey: v.string(),
});

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

const learningEvidenceResultValidator = v.object({
  persisted: v.boolean(),
  masteryApplied: v.boolean(),
  decision: learningEvidenceDecisionValidator,
  kstApplied: v.literal(false),
});

const submissionLearningEvidenceResultValidator = v.union(
  v.object({
    persisted: v.boolean(), masteryApplied: v.boolean(), kstApplied: v.literal(false),
    delivery: v.union(v.literal('new'), v.literal('replay')),
    decision: learningEvidenceDecisionValidator,
  }),
  v.object({ accepted: v.literal(false), reason: v.literal('submission_not_found') }),
  v.object({
    accepted: v.literal(false), reason: v.literal('attempt_ordinal_conflict'),
    latestAttemptOrdinal: v.number(), receivedAttemptOrdinal: v.number(),
  }),
);

const routedSubmissionLearningEvidenceResultValidator = v.union(
  v.object({
    persisted: v.boolean(), masteryApplied: v.boolean(), kstApplied: v.boolean(),
    delivery: v.union(v.literal('new'), v.literal('replay')),
    decision: learningEvidenceDecisionValidator,
  }),
  v.object({ accepted: v.literal(false), reason: v.literal('submission_not_found') }),
  v.object({
    accepted: v.literal(false), reason: v.literal('attempt_ordinal_conflict'),
    latestAttemptOrdinal: v.number(), receivedAttemptOrdinal: v.number(),
  }),
);

export interface PrecalculusLearningEvidenceHandlerDependencies {
  store: PrecalculusLearningEvidenceStore;
  masteryBridge: (input: { evidence: LearningEvidenceV1 }) => Promise<void>;
}

export interface PrecalculusLearningEvidenceHandler {
  process(input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }): Promise<PrecalculusLearningEvidenceProcessResult>;
}

/**
 * Creates the app-owned pure handler used by tests and by the Convex
 * transaction. The transaction supplies the durable store and SRS bridge.
 */
export function createPrecalculusLearningEvidenceHandler({
  store,
  masteryBridge,
}: PrecalculusLearningEvidenceHandlerDependencies): PrecalculusLearningEvidenceHandler {
  const runtime = createPrecalculusLearningEvidenceRuntime({
    store,
    masteryBridge: async ({ evidence }) => masteryBridge({ evidence }),
  });

  return {
    process: runtime.process,
  };
}

type LearningEvidenceDocument = {
  learnerId: Id<'profiles'>;
  nodeId: string;
  activityId: string;
  attemptOrdinal: number;
  origin: 'teacher_led' | 'mastery_advantage';
  mode: LearningEvidenceV1['mode'];
  occurredAt: number;
  gradedEvidence?: LearningEvidenceV1['gradedEvidence'];
  idempotencyKey: string;
  createdAt: number;
};

function toContractEvidence(document: LearningEvidenceDocument): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1(learningEvidenceV1Schema.parse({
    contractVersion: 'learning-evidence.v1',
    nodeId: document.nodeId,
    activityId: document.activityId,
    attemptOrdinal: document.attemptOrdinal,
    origin: document.origin,
    mode: document.mode,
    occurredAt: new Date(document.occurredAt).toISOString(),
    gradedEvidence: document.gradedEvidence,
    idempotencyKey: document.idempotencyKey,
  }));
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
    listByLearnerAndNode: async (learnerId, nodeId) => {
      const documents = await ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_and_node', (query) => (
          query.eq('learnerId', learnerId as Id<'profiles'>).eq('nodeId', nodeId)
        ))
        .collect();
      return documents.map(toContractEvidence);
    },
    append: async (learnerId, evidence) => {
      const occurredAt = Date.parse(evidence.occurredAt);
      if (!Number.isFinite(occurredAt)) {
        throw new TypeError('occurredAt must be a valid ISO timestamp');
      }

      await ctx.db.insert('learning_evidence', {
        learnerId: learnerId as Id<'profiles'>,
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

function toSrsCard(document: {
  _id: Id<'srs_cards'>;
  studentId: Id<'profiles'>;
  objectiveId: string;
  problemFamilyId: string;
  stability: number;
  difficulty: number;
  state: SrsCardState['state'];
  dueDate: string;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string;
  createdAt: number;
  updatedAt: number;
}): SrsCardState {
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
      await ctx.db.patch(cardId as Id<'srs_cards'>, toDatabaseCard({ ...card, cardId }));
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
    saveReview: async (entry) => {
      const reviewedAt = Date.parse(entry.reviewedAt);
      await ctx.db.insert('srs_review_log', {
        cardId: entry.cardId as Id<'srs_cards'>,
        studentId: entry.studentId as Id<'profiles'>,
        rating: entry.rating,
        reviewId: entry.reviewId,
        submissionId: entry.submissionId,
        evidence: entry.evidence,
        stateBefore: entry.stateBefore,
        stateAfter: entry.stateAfter,
        reviewedAt,
      });
    },
    getReviewsByCard: async (cardId) => {
      const documents = await ctx.db
        .query('srs_review_log')
        .withIndex('by_card', (query) => query.eq('cardId', cardId as Id<'srs_cards'>))
        .collect();
      return documents.map((document) => ({
        reviewId: document.reviewId ?? `convex-review-${document._id}`,
        cardId: document.cardId,
        studentId: document.studentId,
        rating: document.rating as SrsReviewLogEntry['rating'],
        submissionId: document.submissionId ?? '',
        evidence: document.evidence,
        stateBefore: document.stateBefore,
        stateAfter: document.stateAfter,
        reviewedAt: new Date(document.reviewedAt).toISOString(),
      }));
    },
    getReviewsByStudent: async (studentId) => {
      const documents = await ctx.db
        .query('srs_review_log')
        .withIndex('by_student', (query) => query.eq('studentId', studentId as Id<'profiles'>))
        .collect();
      return documents.map((document) => ({
        reviewId: document.reviewId ?? `convex-review-${document._id}`,
        cardId: document.cardId,
        studentId: document.studentId,
        rating: document.rating as SrsReviewLogEntry['rating'],
        submissionId: document.submissionId ?? '',
        evidence: document.evidence,
        stateBefore: document.stateBefore,
        stateAfter: document.stateAfter,
        reviewedAt: new Date(document.reviewedAt).toISOString(),
      }));
    },
  };

  return { cardStore, reviewLogStore };
}

function createSrsSubmission(evidence: LearningEvidenceV1): PracticeSubmissionEnvelope {
  const gradedEvidence = evidence.gradedEvidence;
  if (!gradedEvidence) {
    throw new TypeError('Mastery Advantage SRS processing requires graded evidence');
  }

  const isCorrect = gradedEvidence.isCorrect ?? (
    gradedEvidence.score !== undefined
    && gradedEvidence.maxScore !== undefined
    && gradedEvidence.score === gradedEvidence.maxScore
  );

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
      isCorrect,
      ...(gradedEvidence.score === undefined ? {} : { score: gradedEvidence.score }),
      ...(gradedEvidence.maxScore === undefined ? {} : { maxScore: gradedEvidence.maxScore }),
    }],
  };
}

async function applyPrecalculusSrsReview(
  ctx: MutationCtx,
  learnerId: Id<'profiles'>,
  evidence: LearningEvidenceV1,
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
  });
  if (!result.ok) {
    throw new Error('Precalculus SRS processing failed');
  }
}

/**
 * App-owned Convex transaction for the one-node pilot. The shared evaluator
 * decides whether the event may be persisted or reach SRS. KST is deliberately
 * absent until the approved app-owned projection follow-up is implemented.
 */
export const submit = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    evidence: learningEvidenceValidator,
  },
  returns: learningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const handler = createPrecalculusLearningEvidenceHandler({
      store: createEvidenceStore(ctx),
      masteryBridge: ({ evidence }) => applyPrecalculusSrsReview(ctx, args.learnerId, evidence),
    });

    const result = await handler.process({
      learnerId: args.learnerId,
      evidence: args.evidence,
    });

    return {
      ...result,
      kstApplied: false as const,
    };
  },
});

type SelectedReceipt = {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: false;
  decision: ReturnType<typeof evaluateLearningEvidenceV1>;
};

type SelectedStoredSubmission = {
  submissionId: string;
  userId: string;
  activityId: string;
  stableActivityId?: string;
  masteryContractVersion?: string;
  submissionData: unknown;
  attemptOrdinal?: number;
  score?: number;
  maxScore?: number;
  submittedAt: number;
  gradedAt?: number;
};

export interface SelectedEvidenceDependencies {
  authenticateLearner(learnerId: string): Promise<boolean>;
  findReceipt(learnerId: string, submissionId: string): Promise<SelectedReceipt | null>;
  loadSubmission(submissionId: string): Promise<SelectedStoredSubmission | null>;
  sourceIsCurrent(submission: SelectedStoredSubmission): Promise<boolean>;
  findEvidence(learnerId: string, idempotencyKey: string): Promise<LearningEvidenceV1 | null>;
  listHistory(learnerId: string, nodeId: string): Promise<readonly LearningEvidenceV1[]>;
  appendEvidence(learnerId: string, submissionId: string, evidence: LearningEvidenceV1): Promise<void>;
  applySrs(learnerId: string, submissionId: string, envelope: PracticeSubmissionEnvelope): Promise<void>;
  appendReceipt(learnerId: string, submissionId: string, receipt: SelectedReceipt): Promise<void>;
}

function selectedStoredEvidence(
  submission: SelectedStoredSubmission,
  learnerId: string,
): { evidence: LearningEvidenceV1; envelope: PracticeSubmissionEnvelope; masteryBearing: boolean } | null {
  const parsed = PracticeSubmissionEnvelopeSchema.safeParse(submission.submissionData);
  if (!parsed.success) return null;
  const rawEnvelope = submission.submissionData as Record<string, unknown>;
  const allowedEnvelopeKeys = new Set([
    'activityId', 'answers', 'attemptNumber', 'contractVersion', 'mode', 'parts',
    'status', 'submittedAt', 'artifact', 'interactionHistory', 'analytics',
    'studentFeedback', 'teacherSummary', 'timing',
  ]);
  if (Object.keys(rawEnvelope).some((key) => !allowedEnvelopeKeys.has(key))) return null;
  const envelope: PracticeSubmissionEnvelope = {
    ...parsed.data,
    activityId: toConvexActivityId(parsed.data.activityId),
  };
  const mode = envelope.mode;
  const expectedActivityId = mode === 'guided_practice'
    ? PRECALCULUS_PILOT_ACTIVITY_ID
    : mode === 'independent_practice'
      ? PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
      : null;
  if (
    !expectedActivityId
    || submission.userId !== learnerId
    || submission.stableActivityId !== expectedActivityId
    || envelope.activityId !== expectedActivityId
    || envelope.status !== 'graded'
    || submission.masteryContractVersion !== 'learning-evidence.v1'
    || !Number.isSafeInteger(submission.attemptOrdinal)
    || submission.attemptOrdinal! < 1
    || envelope.attemptNumber !== submission.attemptOrdinal
    || !Number.isFinite(submission.submittedAt)
    || Date.parse(envelope.submittedAt) !== submission.submittedAt
    || submission.gradedAt !== submission.submittedAt
    || !Number.isSafeInteger(submission.score)
    || !Number.isSafeInteger(submission.maxScore)
    || submission.maxScore !== 3
  ) return null;
  const answers = envelope.answers as {
    increasingIntervals?: unknown; decreasingIntervals?: unknown; constantIntervals?: unknown;
  };
  if (
    Object.keys(answers).sort().join('|') !== 'constantIntervals|decreasingIntervals|increasingIntervals'
    ||
    typeof answers.increasingIntervals !== 'string'
    || typeof answers.decreasingIntervals !== 'string'
    || typeof answers.constantIntervals !== 'string'
  ) return null;
  const grade = gradeTopic11IntervalGraph(mode === 'guided_practice' ? 0 : 2, {
    increasingIntervals: answers.increasingIntervals,
    decreasingIntervals: answers.decreasingIntervals,
    constantIntervals: answers.constantIntervals,
  });
  if (
    grade.score !== submission.score
    || grade.maxScore !== submission.maxScore
    || envelope.parts.length !== grade.parts.length
    || grade.parts.some((expected, index) => {
      const part = envelope.parts[index];
      const rawPart = (rawEnvelope.parts as unknown[])[index];
      return typeof rawPart !== 'object' || rawPart === null || Array.isArray(rawPart)
        || Object.keys(rawPart).sort().join('|') !== 'changedCount|hintsUsed|isCorrect|maxScore|partId|rawAnswer|revealStepsSeen|score'
        || part?.partId !== expected.partId
        || part.rawAnswer !== expected.rawAnswer
        || part.isCorrect !== expected.isCorrect
        || part.score !== expected.score
        || part.maxScore !== expected.maxScore;
    })
  ) return null;
  const occurredAt = new Date(submission.submittedAt).toISOString();
  return {
    envelope,
    masteryBearing: mode === 'independent_practice',
    evidence: normalizeLearningEvidenceV1({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      activityId: expectedActivityId,
      attemptOrdinal: submission.attemptOrdinal!,
      origin: 'mastery_advantage',
      mode,
      occurredAt,
      ...(mode === 'independent_practice' ? {
        gradedEvidence: {
          isCorrect: grade.score === grade.maxScore,
          score: grade.score,
          maxScore: grade.maxScore,
        },
      } : {}),
      idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
    }),
  };
}

export function createSelectedSubmissionEvidenceHandler(deps: SelectedEvidenceDependencies) {
  return async (input: { learnerId: string; submissionId: string }) => {
    if (!await deps.authenticateLearner(input.learnerId)) {
      throw new Error('Inactive student identity');
    }
    const receipt = await deps.findReceipt(input.learnerId, input.submissionId);
    if (receipt) return { ...receipt, delivery: 'replay' as const };
    const submission = await deps.loadSubmission(input.submissionId);
    if (!submission) return { accepted: false as const, reason: 'submission_not_found' as const };
    const stored = selectedStoredEvidence(submission, input.learnerId);
    if (submission.submissionId !== input.submissionId || !stored || !await deps.sourceIsCurrent(submission)) {
      return { accepted: false as const, reason: 'submission_not_found' as const };
    }
    const existing = await deps.findEvidence(input.learnerId, stored.evidence.idempotencyKey);
    const history = await deps.listHistory(input.learnerId, PRECALCULUS_PILOT_NODE_ID);
    if (existing) {
      throw new Error('Learning evidence exists without its submission receipt');
    }
    const latest = history
      .filter((item) => item.origin === 'mastery_advantage' && item.activityId === stored.evidence.activityId)
      .reduce((value, item) => Math.max(value, item.attemptOrdinal), 0);
    if (stored.evidence.attemptOrdinal <= latest) {
      return {
        accepted: false as const, reason: 'attempt_ordinal_conflict' as const,
        latestAttemptOrdinal: latest, receivedAttemptOrdinal: stored.evidence.attemptOrdinal,
      };
    }
    const evaluated = evaluateLearningEvidenceV1({
      evidence: stored.evidence,
      acceptedEvidence: history,
      enabledNodeIds: PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
    });
    const decision = stored.masteryBearing
      ? evaluated
      : { ...evaluated, masteryBearing: false };
    if (!['eligible', 'ungraded_evidence'].includes(decision.reason)) {
      return { persisted: false, masteryApplied: false, kstApplied: false as const, decision, delivery: 'new' as const };
    }
    if (stored.masteryBearing) {
      await deps.applySrs(input.learnerId, input.submissionId, stored.envelope);
    }
    await deps.appendEvidence(input.learnerId, input.submissionId, stored.evidence);
    const nextReceipt: SelectedReceipt = {
      persisted: true, masteryApplied: stored.masteryBearing, kstApplied: false, decision,
    };
    await deps.appendReceipt(input.learnerId, input.submissionId, nextReceipt);
    return { ...nextReceipt, delivery: 'new' as const };
  };
}

async function authenticateSelectedLearner(ctx: MutationCtx, learnerId: Id<'profiles'>) {
  const profile = await ctx.db.get('profiles', learnerId);
  const credential = profile
    ? await ctx.db.query('auth_credentials').withIndex('by_username', (q) => q.eq('username', profile.username)).unique()
    : null;
  return Boolean(profile && profile.role === 'student' && credential?.isActive
    && credential.profileId === profile._id && credential.username === profile.username
    && credential.role === profile.role && credential.organizationId === profile.organizationId);
}

async function sourceIsCurrent(ctx: MutationCtx, submission: SelectedStoredSubmission) {
  if (!isPrecalculusPilotPublished()) return false;
  const activity = await ctx.db.get('activities', submission.activityId as Id<'activities'>);
  const mode = submission.stableActivityId === PRECALCULUS_PILOT_ACTIVITY_ID
    ? 'guided_practice' : 'independent_practice';
  const seed = mode === 'guided_practice' ? 0 : 2;
  const displayName = mode === 'guided_practice'
    ? 'Mastery Advantage: Identify Graph Intervals'
    : 'Independent Practice: Classify Graph Intervals';
  const description = mode === 'guided_practice'
    ? 'Classify the increasing, decreasing, and constant intervals from a graph.'
    : 'Classify the increasing, decreasing, and constant intervals from a generated graph.';
  const props = activity?.props as Record<string, unknown> | undefined;
  const grading = activity?.gradingConfig as Record<string, unknown> | undefined;
  return Boolean(activity && activity._id === submission.activityId
    && activity.stableActivityId === submission.stableActivityId
    && activity.componentKey === PRECALCULUS_PILOT_COMPONENT_KEY
    && activity.displayName === displayName
    && activity.description === description
    && activity.approval?.status === 'approved'
    && props && Object.keys(props).length === 2 && props.nodeId === PRECALCULUS_PILOT_NODE_ID && props.mode === mode
    && grading && Object.keys(grading).length === 1 && grading.variantSeed === seed);
}

export async function submitSelectedEvidenceHandler(
  ctx: MutationCtx,
  args: { learnerId: Id<'profiles'>; submissionId: Id<'activity_submissions'> },
) {
  const now = Date.now();
  const handler = createSelectedSubmissionEvidenceHandler({
    authenticateLearner: (learnerId) => authenticateSelectedLearner(ctx, learnerId as Id<'profiles'>),
    findReceipt: async (learnerId, submissionId) => {
      const row = await ctx.db.query('learning_evidence_receipts')
        .withIndex('by_learner_and_submission_id', (q) => q.eq('learnerId', learnerId as Id<'profiles'>).eq('submissionId', submissionId as Id<'activity_submissions'>)).unique();
      return row ? { persisted: row.persisted, masteryApplied: row.masteryApplied, kstApplied: false, decision: row.decision } : null;
    },
    loadSubmission: async (submissionId) => {
      const row = await ctx.db.get('activity_submissions', submissionId as Id<'activity_submissions'>);
      return row ? { ...row, submissionId: String(row._id), userId: String(row.userId), activityId: String(row.activityId) } : null;
    },
    sourceIsCurrent: (submission) => sourceIsCurrent(ctx, submission),
    findEvidence: async (learnerId, key) => {
      const row = await ctx.db.query('learning_evidence').withIndex('by_learner_and_idempotency_key', (q) => q.eq('learnerId', learnerId as Id<'profiles'>).eq('idempotencyKey', key)).unique();
      return row ? toContractEvidence(row) : null;
    },
    listHistory: async (learnerId, nodeId) => (await ctx.db.query('learning_evidence').withIndex('by_learner_and_node', (q) => q.eq('learnerId', learnerId as Id<'profiles'>).eq('nodeId', nodeId)).collect()).map(toContractEvidence),
    appendEvidence: async (learnerId, submissionId, evidence) => {
      const occurredAt = Date.parse(evidence.occurredAt);
      await ctx.db.insert('learning_evidence', {
        learnerId: learnerId as Id<'profiles'>, submissionId: submissionId as Id<'activity_submissions'>,
        nodeId: evidence.nodeId, activityId: evidence.activityId, attemptOrdinal: evidence.attemptOrdinal,
        origin: evidence.origin, mode: evidence.mode, occurredAt,
        ...(evidence.gradedEvidence ? { gradedEvidence: evidence.gradedEvidence } : {}),
        idempotencyKey: evidence.idempotencyKey, createdAt: now,
      });
    },
    applySrs: async (learnerId, submissionId, envelope) => {
      const { cardStore, reviewLogStore } = createSrsStores(ctx);
      const adapter = new SubmissionSrsAdapter({
        cardStore, reviewLogStore,
        resolver: { resolve: async () => ({ variantKey: envelope.activityId, objectiveId: PRECALCULUS_PILOT_NODE_ID }) },
        baselineResolver: { getBaseline: async () => null }, requireAtomicPersistence: true,
      });
      const result = await adapter.processSubmission({ submission: envelope, studentId: learnerId, activityId: envelope.activityId, now: new Date(now).toISOString(), submissionId });
      if (!result.ok) throw new Error('Precalculus SRS processing failed');
    },
    appendReceipt: async (learnerId, submissionId, receipt) => {
      await ctx.db.insert('learning_evidence_receipts', { learnerId: learnerId as Id<'profiles'>, submissionId: submissionId as Id<'activity_submissions'>, ...receipt, createdAt: now, updatedAt: now });
    },
  });
  return handler({ learnerId: String(args.learnerId), submissionId: String(args.submissionId) });
}

export const submitSelected = internalMutation({
  args: { learnerId: v.id('profiles'), submissionId: v.id('activity_submissions') },
  returns: submissionLearningEvidenceResultValidator,
  handler: submitSelectedEvidenceHandler,
});

export async function submitRoutedEvidenceHandler(
  ctx: MutationCtx,
  args: { learnerId: Id<'profiles'>; submissionId: Id<'activity_submissions'> },
) {
  const durableEvidence = await ctx.db.query('learning_evidence')
    .withIndex('by_learner_and_submission_id', (q) => q
      .eq('learnerId', args.learnerId)
      .eq('submissionId', args.submissionId))
    .unique();
  const durableSelected = durableEvidence?.activityId === PRECALCULUS_PILOT_ACTIVITY_ID
    || durableEvidence?.activityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID;
  const submission = durableSelected
    ? null
    : await ctx.db.get('activity_submissions', args.submissionId);
  if (
    durableSelected
    || submission?.stableActivityId === PRECALCULUS_PILOT_ACTIVITY_ID
    || submission?.stableActivityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
  ) {
    return submitSelectedEvidenceHandler(ctx, args);
  }
  return submitPrecalculusLearningEvidenceHandler(ctx, args);
}

export const submitRouted = internalMutation({
  args: { learnerId: v.id('profiles'), submissionId: v.id('activity_submissions') },
  returns: routedSubmissionLearningEvidenceResultValidator,
  handler: submitRoutedEvidenceHandler,
});
