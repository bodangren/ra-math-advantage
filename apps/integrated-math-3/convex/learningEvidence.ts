import {
  createIm3LearningEvidenceAdapter,
  type Im3LearningEvidenceStore,
  type Im3LearningEvidenceAdapter,
  type Im3LearningEvidenceProcessInput,
  type Im3LearningEvidenceProcessResult,
  type Im3MasteryAdvantageBridge,
} from '../lib/practice/learning-evidence-pilot';
import {
  learningEvidenceFingerprintV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';
import type { Id, Doc } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';

export type { Im3LearningEvidenceStore } from '../lib/practice/learning-evidence-pilot';

/** Dependencies supplied by an eventual app-owned Convex transaction. */
export interface Im3LearningEvidenceHandlerDependencies {
  readonly store: Im3LearningEvidenceStore;
  readonly masteryBridge: Im3MasteryAdvantageBridge;
}

/** Pure IM3 handler seam for the bounded learning-evidence pilot. */
export interface Im3LearningEvidenceHandler {
  process(
    input: Im3LearningEvidenceProcessInput,
  ): Promise<Im3LearningEvidenceProcessResult>;
}

/**
 * Creates the IM3 handler without binding it to a Convex schema or hook.
 *
 * The existing adapter owns normalization, the shared evaluator call, the
 * teacher-first policy, and idempotent bridge gating.
 */
export function createIm3LearningEvidenceHandler({
  store,
  masteryBridge,
}: Im3LearningEvidenceHandlerDependencies): Im3LearningEvidenceHandler {
  const adapter: Im3LearningEvidenceAdapter = createIm3LearningEvidenceAdapter({
    store,
    masteryBridge,
  });

  return {
    process: (input) => adapter.process(input),
  };
}

function evidenceFromDocument(
  document: Doc<'learning_evidence'>,
): LearningEvidenceV1 {
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
}): Im3LearningEvidenceHandler {
  const store: Im3LearningEvidenceStore = {
    async findByIdempotencyKey(learnerId, idempotencyKey) {
      const document = await ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_and_idempotency_key', (q) =>
          q.eq('learnerId', learnerId as Id<'profiles'>)
            .eq('idempotencyKey', idempotencyKey),
        )
        .unique();

      return document === null ? null : evidenceFromDocument(document);
    },

    async listByLearnerAndNode(learnerId, nodeId) {
      const documents = await ctx.db
        .query('learning_evidence')
        .withIndex('by_learner_and_node', (q) =>
          q.eq('learnerId', learnerId as Id<'profiles'>).eq('nodeId', nodeId),
        )
        .collect();

      return documents.map(evidenceFromDocument);
    },

    async append(learnerId, evidence) {
      const normalized = normalizeLearningEvidenceV1(evidence);
      await ctx.db.insert('learning_evidence', {
        learnerId: learnerId as Id<'profiles'>,
        contractVersion: normalized.contractVersion,
        nodeId: normalized.nodeId,
        activityId: normalized.activityId,
        attemptOrdinal: normalized.attemptOrdinal,
        origin: normalized.origin,
        mode: normalized.mode,
        occurredAt: Date.parse(normalized.occurredAt),
        ...(normalized.gradedEvidence === undefined
          ? {}
          : { gradedEvidence: normalized.gradedEvidence }),
        idempotencyKey: normalized.idempotencyKey,
        fingerprint: learningEvidenceFingerprintV1(normalized),
        createdAt: Date.now(),
      });
    },
  };

  return createIm3LearningEvidenceHandler({ store, masteryBridge });
}
