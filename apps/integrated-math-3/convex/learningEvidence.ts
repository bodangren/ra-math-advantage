import {
  createIm3LearningEvidenceAdapter,
  type Im3LearningEvidenceAdapter,
  type Im3LearningEvidenceProcessInput,
  type Im3LearningEvidenceProcessResult,
  type Im3LearningEvidenceStore,
  type Im3MasteryAdvantageBridge,
} from '../lib/practice/learning-evidence-pilot';

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
