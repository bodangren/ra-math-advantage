import {
  evaluateLearningEvidenceV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core/learning-evidence';

import {
  BM2_LEARNING_EVIDENCE_PILOT,
  validateBm2LearningEvidencePilotManifest,
} from '../lib/learning-evidence/bm2-pilot';

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
