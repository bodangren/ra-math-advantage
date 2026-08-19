import {
  evaluateLearningEvidenceV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core/learning-evidence';

export const PRECALCULUS_PILOT_NODE_ID =
  'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs' as const;

export const PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS = Object.freeze([
  PRECALCULUS_PILOT_NODE_ID,
] as const);

export interface PrecalculusLearningEvidenceStore {
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

export type PrecalculusMasteryAdvantageBridge = (input: {
  learnerId: string;
  evidence: LearningEvidenceV1;
}) => Promise<void>;

export interface PrecalculusLearningEvidenceProcessInput {
  learnerId: string;
  evidence: LearningEvidenceV1;
}

export type PrecalculusLearningEvidenceDecision = ReturnType<
  typeof evaluateLearningEvidenceV1
>;

export interface PrecalculusLearningEvidenceProcessResult {
  persisted: boolean;
  masteryApplied: boolean;
  decision: PrecalculusLearningEvidenceDecision;
}

export interface PrecalculusLearningEvidenceRuntime {
  process(
    input: PrecalculusLearningEvidenceProcessInput,
  ): Promise<PrecalculusLearningEvidenceProcessResult>;
  enabledNodeIds(): typeof PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS;
}

interface PrecalculusLearningEvidenceRuntimeOptions {
  store: PrecalculusLearningEvidenceStore;
  masteryBridge?: PrecalculusMasteryAdvantageBridge;
}

function canonicalizeEvidence(evidence: LearningEvidenceV1): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1(learningEvidenceV1Schema.parse(evidence));
}

function appendIfMissing(
  acceptedEvidence: readonly LearningEvidenceV1[],
  existingEvidence: LearningEvidenceV1 | null,
): readonly LearningEvidenceV1[] {
  if (!existingEvidence) return acceptedEvidence;
  if (acceptedEvidence.some((item) => item.idempotencyKey === existingEvidence.idempotencyKey)) {
    return acceptedEvidence;
  }
  return [...acceptedEvidence, existingEvidence];
}

function isPersistableDecision(decision: PrecalculusLearningEvidenceDecision): boolean {
  return decision.reason === 'teacher_led'
    || decision.reason === 'eligible'
    || decision.reason === 'ungraded_evidence';
}

export function createPrecalculusLearningEvidenceRuntime({
  store,
  masteryBridge,
}: PrecalculusLearningEvidenceRuntimeOptions): PrecalculusLearningEvidenceRuntime {
  return {
    enabledNodeIds: () => PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
    process: async ({ learnerId, evidence }) => {
      if (typeof learnerId !== 'string' || learnerId.trim().length === 0) {
        throw new TypeError('learnerId must be a non-empty authenticated identity');
      }

      const canonicalEvidence = canonicalizeEvidence(evidence);
      const [existingEvidence, acceptedByNode] = await Promise.all([
        store.findByIdempotencyKey(learnerId, canonicalEvidence.idempotencyKey),
        store.listByLearnerAndNode(learnerId, canonicalEvidence.nodeId),
      ]);
      const acceptedEvidence = appendIfMissing(
        acceptedByNode.map(canonicalizeEvidence),
        existingEvidence ? canonicalizeEvidence(existingEvidence) : null,
      );
      const decision = evaluateLearningEvidenceV1({
        evidence: canonicalEvidence,
        acceptedEvidence,
        enabledNodeIds: PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
      });

      if (decision.idempotency !== 'new' || !isPersistableDecision(decision)) {
        return {
          persisted: false,
          masteryApplied: false,
          decision,
        };
      }

      if (decision.masteryBearing) {
        // A missing bridge is a safe production stop. It cannot turn an
        // eligible decision into a local KST or SRS mutation.
        if (!masteryBridge) {
          return {
            persisted: false,
            masteryApplied: false,
            decision,
          };
        }

        await masteryBridge({ learnerId, evidence: canonicalEvidence });
      }

      await store.append(learnerId, canonicalEvidence);
      return {
        persisted: true,
        masteryApplied: decision.masteryBearing,
        decision,
      };
    },
  };
}

export const createPrecalculusLearningEvidenceAdapter =
  createPrecalculusLearningEvidenceRuntime;
