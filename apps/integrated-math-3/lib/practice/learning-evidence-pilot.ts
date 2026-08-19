import {
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceDecisionV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';

/** The single IM3 node enabled by the bounded learning-evidence pilot. */
export const IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS = Object.freeze([
  'math.im3.skill.1.1.graph-quadratic-functions',
] as const);

/** App-owned persistence for accepted learning evidence. */
export interface Im3LearningEvidenceStore {
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

/** The existing IM3 SRS/KST bridge for eligible Mastery Advantage evidence. */
export type Im3MasteryAdvantageBridge = (input: {
  learnerId: string;
  evidence: LearningEvidenceV1;
}) => Promise<void>;

/** Input accepted by the IM3 evidence adapter. */
export interface Im3LearningEvidenceProcessInput {
  readonly learnerId: string;
  readonly evidence: LearningEvidenceV1;
}

/** Observable result of one IM3 evidence delivery. */
export interface Im3LearningEvidenceProcessResult {
  readonly persisted: boolean;
  readonly masteryApplied: boolean;
  readonly decision: LearningEvidenceDecisionV1;
}

export interface Im3LearningEvidenceAdapter {
  process(
    input: Im3LearningEvidenceProcessInput,
  ): Promise<Im3LearningEvidenceProcessResult>;
}

function operationKey(learnerId: string, idempotencyKey: string): string {
  return JSON.stringify([learnerId, idempotencyKey]);
}

/**
 * Creates the IM3 app adapter for the one-node teacher-first pilot.
 *
 * The adapter stores only normalized contract records. It never writes KST or
 * SRS state directly. The injected bridge owns that existing app path.
 */
export function createIm3LearningEvidenceAdapter({
  store,
  masteryBridge,
}: {
  readonly store: Im3LearningEvidenceStore;
  readonly masteryBridge: Im3MasteryAdvantageBridge;
}): Im3LearningEvidenceAdapter {
  const inFlight = new Map<string, Promise<Im3LearningEvidenceProcessResult>>();

  async function processInternal(
    input: Im3LearningEvidenceProcessInput,
  ): Promise<Im3LearningEvidenceProcessResult> {
    const evidence = normalizeLearningEvidenceV1(input.evidence);
    const acceptedByKey = await store.findByIdempotencyKey(
      input.learnerId,
      evidence.idempotencyKey,
    );
    const acceptedEvidence = await store.listByLearnerAndNode(
      input.learnerId,
      evidence.nodeId,
    );
    const decision = evaluateLearningEvidenceV1({
      evidence,
      acceptedEvidence: acceptedByKey === null
        ? acceptedEvidence
        : acceptedEvidence.some(
            (accepted) => accepted.idempotencyKey === evidence.idempotencyKey,
          )
          ? acceptedEvidence
          : [...acceptedEvidence, acceptedByKey],
      enabledNodeIds: IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
    });

    if (decision.idempotency !== 'new') {
      return {
        persisted: false,
        masteryApplied: false,
        decision,
      };
    }

    if (decision.reason === 'node_not_enabled'
      || decision.reason === 'awaiting_teacher_exposure') {
      return {
        persisted: false,
        masteryApplied: false,
        decision,
      };
    }

    await store.append(input.learnerId, evidence);

    if (!decision.masteryBearing) {
      return {
        persisted: true,
        masteryApplied: false,
        decision,
      };
    }

    await masteryBridge({ learnerId: input.learnerId, evidence });
    return {
      persisted: true,
      masteryApplied: true,
      decision,
    };
  }

  async function process(
    input: Im3LearningEvidenceProcessInput,
  ): Promise<Im3LearningEvidenceProcessResult> {
    if (input.learnerId.trim().length === 0) {
      throw new TypeError('learnerId must be a non-empty authenticated identity');
    }

    const normalizedEvidence = normalizeLearningEvidenceV1(input.evidence);
    const key = operationKey(input.learnerId, normalizedEvidence.idempotencyKey);
    const previous = inFlight.get(key);
    const operation = (previous ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => processInternal({
        ...input,
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
