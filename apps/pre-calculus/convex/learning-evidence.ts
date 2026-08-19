import {
  learningEvidenceFingerprintV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core/learning-evidence';
import { toConvexActivityId } from '@math-platform/practice-core/contract';
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
  fingerprint: string;
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
        fingerprint: learningEvidenceFingerprintV1(evidence),
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
