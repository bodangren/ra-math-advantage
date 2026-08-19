import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

import {
  createPrecalculusLearningEvidenceRuntime,
  type PrecalculusLearningEvidenceProcessResult,
  type PrecalculusLearningEvidenceStore,
} from '../lib/learning-evidence/precalc-pilot';

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
 * Creates the app-owned Convex boundary for the bounded Precalculus pilot.
 *
 * Persistence and KST/SRS effects stay behind injected seams until the
 * production Convex transaction can provide the required exactly-once
 * behavior. The pure runtime remains the source of policy decisions.
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
