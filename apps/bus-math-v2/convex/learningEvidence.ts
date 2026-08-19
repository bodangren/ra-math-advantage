import {
  evaluateLearningEvidenceV1,
  learningEvidenceFingerprintV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core/learning-evidence';
import {
  buildPracticeSubmissionEnvelope,
  toConvexActivityId,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core/contract';
import {
  SubmissionSrsAdapter,
  type SrsCardState,
  type SrsReviewLogEntryV31,
} from '@math-platform/srs-engine';
import type { CardStore, ReviewLogStore } from '@math-platform/srs-engine/adapters';

import { internalMutation, type MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { v } from 'convex/values';

import {
  BM2_LEARNING_EVIDENCE_PILOT,
  BM2_PILOT_NODE,
  BM2_PILOT_PROBLEM_FAMILY_ID,
  bm2ProblemFamilyIdToVariantKey,
  bm2VariantKeyToProblemFamilyId,
  validateBm2LearningEvidencePilotManifest,
} from '../lib/learning-evidence/bm2-pilot';

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
});

/** Persistence for normalized BM2 learning-evidence records. */
export interface Bm2LearningEvidenceStore {
  findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null>;
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(learnerId: string, evidence: LearningEvidenceV1): Promise<void>;
}

/** The existing BM2 KST/SRS bridge for eligible Mastery Advantage evidence. */
export type Bm2MasteryAdvantageBridge = (input: {
  evidence: LearningEvidenceV1;
}) => Promise<void>;

export type Bm2LearningEvidenceDecision = ReturnType<typeof evaluateLearningEvidenceV1>;

export interface Bm2LearningEvidenceProcessResult {
  persisted: boolean;
  masteryApplied: boolean;
  decision: Bm2LearningEvidenceDecision;
}

export interface Bm2LearningEvidenceHandlerDependencies {
  store: Bm2LearningEvidenceStore;
  masteryBridge: Bm2MasteryAdvantageBridge;
}

export interface Bm2LearningEvidenceHandler {
  process(input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }): Promise<Bm2LearningEvidenceProcessResult>;
}

function canonicalizeEvidence(evidence: LearningEvidenceV1): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1(learningEvidenceV1Schema.parse(evidence));
}

function addExistingEvidence(
  acceptedEvidence: readonly LearningEvidenceV1[],
  existingEvidence: LearningEvidenceV1 | null,
): readonly LearningEvidenceV1[] {
  if (existingEvidence === null) return acceptedEvidence;
  if (acceptedEvidence.some((item) => item.idempotencyKey === existingEvidence.idempotencyKey)) {
    return acceptedEvidence;
  }
  return [...acceptedEvidence, existingEvidence];
}

function operationKey(learnerId: string, idempotencyKey: string): string {
  return JSON.stringify([learnerId, idempotencyKey]);
}

function isPersistableDecision(
  decision: ReturnType<typeof evaluateLearningEvidenceV1>,
): boolean {
  return decision.reason === 'teacher_led'
    || decision.reason === 'ungraded_evidence'
    || decision.reason === 'eligible';
}

/**
 * Creates the app-owned Convex boundary for the exact BM2 pilot manifest.
 *
 * The injected store owns evidence persistence. The injected bridge owns the
 * existing KST/SRS effect. Teacher-led and pre-exposure events never reach it.
 */
export function createBm2LearningEvidenceHandler({
  store,
  masteryBridge,
}: Bm2LearningEvidenceHandlerDependencies): Bm2LearningEvidenceHandler {
  validateBm2LearningEvidencePilotManifest();

  const inFlight = new Map<string, Promise<Bm2LearningEvidenceProcessResult>>();

  async function processInternal({
    learnerId,
    evidence,
  }: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }): Promise<Bm2LearningEvidenceProcessResult> {
    const normalizedEvidence = canonicalizeEvidence(evidence);
    const [existingEvidence, acceptedByNode] = await Promise.all([
      store.findByIdempotencyKey(learnerId, normalizedEvidence.idempotencyKey),
      store.listByLearnerAndNode(learnerId, normalizedEvidence.nodeId),
    ]);
    const acceptedEvidence = addExistingEvidence(
      acceptedByNode.map(canonicalizeEvidence),
      existingEvidence === null ? null : canonicalizeEvidence(existingEvidence),
    );
    const decision = evaluateLearningEvidenceV1({
      evidence: normalizedEvidence,
      acceptedEvidence,
      enabledNodeIds: BM2_LEARNING_EVIDENCE_PILOT.enabledNodeIds,
    });

    if (decision.idempotency !== 'new' || !isPersistableDecision(decision)) {
      return {
        persisted: false,
        masteryApplied: false,
        decision,
      };
    }

    if (decision.masteryBearing) {
      await masteryBridge({ evidence: normalizedEvidence });
    }

    await store.append(learnerId, normalizedEvidence);
    return {
      persisted: true,
      masteryApplied: decision.masteryBearing,
      decision,
    };
  }

  async function process({
    learnerId,
    evidence,
  }: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }): Promise<Bm2LearningEvidenceProcessResult> {
    if (typeof learnerId !== 'string' || learnerId.trim().length === 0) {
      throw new TypeError('learnerId must be a non-empty authenticated identity');
    }

    const normalizedEvidence = canonicalizeEvidence(evidence);
    const key = operationKey(learnerId, normalizedEvidence.idempotencyKey);
    const previous = inFlight.get(key);
    const operation = (previous ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => processInternal({
        learnerId,
        evidence: normalizedEvidence,
      }));
    inFlight.set(key, operation);

    try {
      return await operation;
    } finally {
      if (inFlight.get(key) === operation) inFlight.delete(key);
    }
  }

  return { process };
}

function toContractEvidence(document: Doc<'learning_evidence'>): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1(learningEvidenceV1Schema.parse({
    contractVersion: document.contractVersion,
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

function createEvidenceStore(ctx: MutationCtx): Bm2LearningEvidenceStore {
  return {
    findByIdempotencyKey: async (learnerId, idempotencyKey) => {
      const document = await ctx.db
        .query('learning_evidence')
        .withIndex('by_student_and_idempotency_key', (query) => (
          query.eq('studentId', learnerId as Id<'profiles'>).eq('idempotencyKey', idempotencyKey)
        ))
        .unique();
      return document ? toContractEvidence(document) : null;
    },
    listByLearnerAndNode: async (learnerId, nodeId) => {
      const documents = await ctx.db
        .query('learning_evidence')
        .withIndex('by_student_and_node', (query) => (
          query.eq('studentId', learnerId as Id<'profiles'>).eq('nodeId', nodeId)
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
        studentId: learnerId as Id<'profiles'>,
        contractVersion: 'learning-evidence.v1',
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

function toSrsCard(document: Doc<'srs_cards'>): SrsCardState {
  return {
    cardId: document.cardId,
    studentId: document.studentId,
    objectiveId: document.objectiveId,
    variantKey: bm2ProblemFamilyIdToVariantKey(document.problemFamilyId),
    stability: document.stability,
    difficulty: document.difficulty,
    state: document.state,
    dueDate: document.dueDate,
    elapsedDays: document.elapsedDays,
    scheduledDays: document.scheduledDays,
    reps: document.reps,
    lapses: document.lapses,
    lastReview: document.lastReview,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function toDatabaseCard(card: SrsCardState) {
  return {
    cardId: card.cardId,
    studentId: card.studentId as Id<'profiles'>,
    objectiveId: card.objectiveId,
    problemFamilyId: bm2VariantKeyToProblemFamilyId(card.variantKey),
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    dueDate: card.dueDate,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.lastReview,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

function createSrsStores(ctx: MutationCtx): {
  cardStore: CardStore;
  reviewLogStore: ReviewLogStore;
} {
  const getCardDocumentByVariant = async (studentId: string, variantKey: string) => {
    const document = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (query) => (
        query
          .eq('studentId', studentId as Id<'profiles'>)
          .eq('problemFamilyId', bm2VariantKeyToProblemFamilyId(variantKey))
      ))
      .unique();
    return document ?? null;
  };

  const getCardByVariant = async (studentId: string, variantKey: string) => {
    const document = await getCardDocumentByVariant(studentId, variantKey);
    return document ? toSrsCard(document) : null;
  };

  const saveCardAndReview = async (
    card: SrsCardState,
    reviewLog: SrsReviewLogEntryV31,
  ) => {
    const existing = await getCardDocumentByVariant(card.studentId, card.variantKey);
    if (existing) {
      await ctx.db.patch(existing._id, toDatabaseCard(card));
    } else {
      await ctx.db.insert('srs_cards', toDatabaseCard(card));
    }

    const reviewedAt = Date.parse(reviewLog.reviewedAt);
    if (!Number.isFinite(reviewedAt)) {
      throw new TypeError('reviewedAt must be a valid ISO timestamp');
    }
    const scheduledAt = existing ? Date.parse(existing.dueDate) : Date.parse(card.createdAt);

    await ctx.db.insert('srs_review_log', {
      studentId: card.studentId as Id<'profiles'>,
      problemFamilyId: bm2VariantKeyToProblemFamilyId(card.variantKey),
      rating: reviewLog.rating,
      scheduledAt: Number.isFinite(scheduledAt) ? scheduledAt : reviewedAt,
      reviewedAt,
      elapsedDays: card.elapsedDays,
      scheduledDays: card.scheduledDays,
      stateBefore: reviewLog.stateBefore,
      stateAfter: reviewLog.stateAfter,
    });

    return { cardId: card.cardId, reviewId: reviewLog.reviewId };
  };

  const cardStore: CardStore = {
    // BM2 stores a legacy string cardId without a cardId index. Submission
    // processing uses the indexed student/variant lookup below.
    getCard: async () => null,
    getCardsByStudent: async (studentId) => {
      const documents = await ctx.db
        .query('srs_cards')
        .withIndex('by_student', (query) => query.eq('studentId', studentId as Id<'profiles'>))
        .collect();
      return documents
        .filter((document) => document.problemFamilyId === BM2_PILOT_PROBLEM_FAMILY_ID)
        .map(toSrsCard);
    },
    // The existing BM2 schema has no objective-only index. The atomic
    // submission path does not call this method.
    getCardsByObjective: async () => [],
    getCardByStudentAndVariant: getCardByVariant,
    getDueCards: async (studentId, now) => {
      const nowMs = Date.parse(now);
      const documents = await ctx.db
        .query('srs_cards')
        .withIndex('by_student', (query) => query.eq('studentId', studentId as Id<'profiles'>))
        .collect();
      return documents
        .filter((document) => (
          document.problemFamilyId === BM2_PILOT_PROBLEM_FAMILY_ID
          && Date.parse(document.dueDate) <= nowMs
        ))
        .map(toSrsCard);
    },
    saveCard: async (card) => {
      const existing = await getCardDocumentByVariant(card.studentId, card.variantKey);
      if (existing) {
        await ctx.db.patch(existing._id, toDatabaseCard(card));
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
    // Atomic persistence is required for this production boundary. This
    // fallback is retained only to satisfy the shared adapter interface.
    saveReview: async () => {
      throw new Error('BM2 learning-evidence SRS persistence requires the atomic save boundary');
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

async function applyBm2SrsReview(
  ctx: MutationCtx,
  learnerId: Id<'profiles'>,
  evidence: LearningEvidenceV1,
): Promise<void> {
  const masteryMapping = BM2_LEARNING_EVIDENCE_PILOT.mappings[0].masteryAdvantage;
  const { cardStore, reviewLogStore } = createSrsStores(ctx);
  const adapter = new SubmissionSrsAdapter({
    cardStore,
    reviewLogStore,
    resolver: {
      resolve: async (activityId) => activityId === masteryMapping.activityId
        ? {
            variantKey: masteryMapping.variantKey,
            objectiveId: BM2_PILOT_NODE,
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
    activityId: masteryMapping.activityId,
  });
  if (!result.ok || result.skipped) {
    throw new Error('The BM2 learning-evidence SRS boundary rejected eligible evidence');
  }
}

/**
 * Authenticated route callers invoke this internal transaction. The
 * transaction persists evidence and, only for eligible post-exposure graded
 * evidence, applies the canonical BM2 SRS boundary in the same transaction.
 */
export const submit = internalMutation({
  args: {
    learnerId: v.id('profiles'),
    evidence: learningEvidenceValidator,
  },
  returns: learningEvidenceResultValidator,
  handler: async (ctx, args) => {
    const handler = createBm2LearningEvidenceHandler({
      store: createEvidenceStore(ctx),
      masteryBridge: ({ evidence }) => applyBm2SrsReview(ctx, args.learnerId, evidence),
    });

    return handler.process({
      learnerId: args.learnerId,
      evidence: args.evidence,
    });
  },
});
