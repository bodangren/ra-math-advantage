import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

const LEARNING_EVIDENCE_MODULE = '../../convex/learning-evidence';
const LEARNER_ID = 'student-precalc-pilot';
const PILOT_NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const PILOT_ACTIVITY_ID = `${PILOT_NODE_ID}.guided_practice`;

type LearningEvidenceResult = {
  persisted: boolean;
  masteryApplied: boolean;
  decision: Record<string, unknown>;
};

type MasteryBridgeInput = {
  evidence: LearningEvidenceV1;
};

interface LearningEvidenceStore {
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

type LearningEvidenceHandler = {
  process(input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }): Promise<LearningEvidenceResult>;
};

type LearningEvidenceHandlerFactory = (dependencies: {
  store: LearningEvidenceStore;
  masteryBridge: (input: MasteryBridgeInput) => Promise<void>;
}) => LearningEvidenceHandler;

class InMemoryEvidenceStore implements LearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  async findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null> {
    return this.events.find((entry) => (
      entry.learnerId === learnerId
      && entry.evidence.idempotencyKey === idempotencyKey
    ))?.evidence ?? null;
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]> {
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1): Promise<void> {
    this.events.push({ learnerId, evidence });
  }
}

function makeEvidence(
  overrides: Partial<LearningEvidenceV1> = {},
): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: PILOT_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'mastery_advantage',
    mode: 'guided_practice',
    occurredAt: '2026-08-19T09:00:00.000Z',
    gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    idempotencyKey: 'precalc-convex-attempt-1',
    ...overrides,
  };
}

async function loadLearningEvidenceHandlerFactory(): Promise<LearningEvidenceHandlerFactory> {
  let loadedModule: Record<string, unknown>;

  try {
    loadedModule = await vi.importActual<Record<string, unknown>>(LEARNING_EVIDENCE_MODULE);
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : '';
    throw new Error(
      'Missing AP Precalculus learning-evidence production boundary. '
      + 'Add apps/pre-calculus/convex/learning-evidence.ts and export '
      + `createPrecalculusLearningEvidenceHandler(dependencies).${detail}`,
    );
  }

  const factory = loadedModule.createPrecalculusLearningEvidenceHandler;
  if (typeof factory !== 'function') {
    throw new Error(
      'AP Precalculus learning-evidence boundary must export '
      + 'createPrecalculusLearningEvidenceHandler(dependencies).',
    );
  }

  return factory as LearningEvidenceHandlerFactory;
}

async function createHarness() {
  const store = new InMemoryEvidenceStore();
  const srsEffects: LearningEvidenceV1[] = [];
  const cardWrites: LearningEvidenceV1[] = [];
  const reviewWrites: LearningEvidenceV1[] = [];
  const masteryBridge = vi.fn(async ({ evidence }: MasteryBridgeInput) => {
    srsEffects.push(evidence);
    cardWrites.push(evidence);
    reviewWrites.push(evidence);
  });
  const factory = await loadLearningEvidenceHandlerFactory();
  const handler = factory({ store, masteryBridge });

  return {
    cardWrites,
    handler,
    masteryBridge,
    reviewWrites,
    srsEffects,
    store,
  };
}

describe('AP Precalculus Convex learning-evidence boundary', () => {
  it('declares the exact return validator on the internal submit mutation', async () => {
    const source = await readFile(
      resolve(process.cwd(), 'convex/learning-evidence.ts'),
      'utf8',
    );

    expect(source).toMatch(/export const submit = internalMutation\(\{[\s\S]*?returns: learningEvidenceResultValidator,[\s\S]*?handler:/);
    expect(source).toMatch(/const learningEvidenceResultValidator = v\.object\(\{[\s\S]*?persisted: v\.boolean\(\),[\s\S]*?masteryApplied: v\.boolean\(\),[\s\S]*?decision: learningEvidenceDecisionValidator,[\s\S]*?kstApplied: v\.literal\(false\),[\s\S]*?\}\);/);
  });

  it('persists teacher exposure once and treats a same-key replay as a replay', async () => {
    const { handler, masteryBridge, store } = await createHarness();
    const exposure = makeEvidence({
      activityId: `${PILOT_NODE_ID}.teacher-led-exposure`,
      origin: 'teacher_led',
      mode: 'teaching',
      gradedEvidence: undefined,
      idempotencyKey: 'precalc-teacher-exposure-replay',
    });

    const first = await handler.process({ learnerId: LEARNER_ID, evidence: exposure });
    const replay = await handler.process({ learnerId: LEARNER_ID, evidence: exposure });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: { idempotency: 'new', exposureState: 'introduced' },
    });
    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: { idempotency: 'replay', exposureState: 'introduced' },
    });
    expect(store.events).toHaveLength(1);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('does not write evidence, cards, or reviews before teacher exposure', async () => {
    const { cardWrites, handler, masteryBridge, reviewWrites, store } = await createHarness();

    const result = await handler.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({ idempotencyKey: 'precalc-before-exposure' }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        exposureState: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(0);
    expect(cardWrites).toHaveLength(0);
    expect(reviewWrites).toHaveLength(0);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('applies one SRS effect for a graded post-exposure event, including a replay', async () => {
    const {
      cardWrites,
      handler,
      masteryBridge,
      reviewWrites,
      srsEffects,
      store,
    } = await createHarness();
    const exposure = makeEvidence({
      activityId: `${PILOT_NODE_ID}.teacher-led-exposure`,
      origin: 'teacher_led',
      mode: 'teaching',
      gradedEvidence: undefined,
      idempotencyKey: 'precalc-teacher-exposure-before-srs',
    });
    const gradedAttempt = makeEvidence({
      idempotencyKey: 'precalc-graded-post-exposure',
      occurredAt: '2026-08-19T10:00:00.000Z',
    });

    await handler.process({ learnerId: LEARNER_ID, evidence: exposure });
    const first = await handler.process({ learnerId: LEARNER_ID, evidence: gradedAttempt });
    const replay = await handler.process({ learnerId: LEARNER_ID, evidence: gradedAttempt });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: { masteryBearing: true },
    });
    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: { idempotency: 'replay' },
    });
    expect(store.events).toHaveLength(2);
    expect(srsEffects).toHaveLength(1);
    expect(cardWrites).toHaveLength(1);
    expect(reviewWrites).toHaveLength(1);
    expect(masteryBridge).toHaveBeenCalledTimes(1);
  });
});
