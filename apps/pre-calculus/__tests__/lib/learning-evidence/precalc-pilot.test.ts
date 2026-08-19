import { describe, expect, it } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  createPrecalculusLearningEvidenceRuntime,
  type PrecalculusLearningEvidenceStore,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'student-precalc-pilot';
const PILOT_NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const NON_PILOT_NODE_ID = 'math.precalc.skill.1.1.describe-covariation-in-tandem-change';
const PILOT_ACTIVITY_ID = `${PILOT_NODE_ID}.guided_practice`;

class InMemoryEvidenceStore implements PrecalculusLearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  async findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null> {
    return this.events.find((entry) =>
      entry.learnerId === learnerId
      && entry.evidence.idempotencyKey === idempotencyKey,
    )?.evidence ?? null;
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
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T08:00:00.000Z',
    idempotencyKey: 'precalc-pilot-001',
    ...overrides,
  };
}

function createHarness() {
  const store = new InMemoryEvidenceStore();
  const masteryEvents: LearningEvidenceV1[] = [];
  const runtime = createPrecalculusLearningEvidenceRuntime({
    store,
    masteryBridge: async ({ evidence }) => {
      masteryEvents.push(evidence);
    },
  });

  return { store, masteryEvents, runtime };
}

describe('AP Precalculus learning-evidence.v1 pilot runtime', () => {
  it('enables exactly the planned Precalculus pilot node', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toEqual([PILOT_NODE_ID]);
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).not.toContain(NON_PILOT_NODE_ID);
  });

  it('denies graded Mastery Advantage evidence before teacher exposure without persistence or forwarding', async () => {
    const { masteryEvents, runtime, store } = createHarness();
    const result = await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
        idempotencyKey: 'precalc-before-exposure',
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(0);
    expect(masteryEvents).toHaveLength(0);
  });

  it('persists teacher-led exposure without forwarding graded evidence to KST or SRS', async () => {
    const { masteryEvents, runtime, store } = createHarness();
    const evidence = makeEvidence({
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
      idempotencyKey: 'precalc-teacher-exposure',
    });

    const first = await runtime.process({ learnerId: LEARNER_ID, evidence });
    const replay = await runtime.process({ learnerId: LEARNER_ID, evidence });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(1);
    expect(masteryEvents).toHaveLength(0);
  });

  it('forwards only graded Mastery Advantage evidence after exposure', async () => {
    const { masteryEvents, runtime } = createHarness();

    await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({ idempotencyKey: 'precalc-teacher-exposure-for-mastery' }),
    });
    const result = await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: '2026-08-19T09:00:00.000Z',
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
        idempotencyKey: 'precalc-after-exposure',
      }),
    });
    const ungraded = await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: '2026-08-19T09:01:00.000Z',
        idempotencyKey: 'precalc-ungraded-after-exposure',
      }),
    });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(ungraded).toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: {
        exposureState: 'introduced',
        eligible: false,
        reason: 'ungraded_evidence',
        masteryBearing: false,
      },
    });
    expect(masteryEvents).toHaveLength(1);
    expect(masteryEvents[0]).toMatchObject({
      nodeId: PILOT_NODE_ID,
      origin: 'mastery_advantage',
    });
  });

  it('does not persist an eligible event when the production KST/SRS bridge is unavailable', async () => {
    const store = new InMemoryEvidenceStore();
    const runtime = createPrecalculusLearningEvidenceRuntime({ store });

    await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({ idempotencyKey: 'precalc-teacher-exposure-without-bridge' }),
    });
    const result = await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: '2026-08-19T09:00:00.000Z',
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
        idempotencyKey: 'precalc-eligible-without-bridge',
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        eligible: true,
        masteryBearing: true,
      },
    });
    expect(store.events).toHaveLength(1);
  });

  it('rejects same-key conflicting evidence without a second downstream effect', async () => {
    const { masteryEvents, runtime, store } = createHarness();
    const original = makeEvidence({ idempotencyKey: 'precalc-conflicting-key' });

    await runtime.process({ learnerId: LEARNER_ID, evidence: original });
    const conflict = await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        idempotencyKey: original.idempotencyKey,
        occurredAt: '2026-08-19T09:00:00.000Z',
      }),
    });

    expect(conflict).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'conflict',
        reason: 'idempotency_conflict',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(1);
    expect(masteryEvents).toHaveLength(0);
  });

  it('denies a non-pilot node without persistence or forwarding', async () => {
    const { masteryEvents, runtime, store } = createHarness();
    const result = await runtime.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        nodeId: NON_PILOT_NODE_ID,
        activityId: `${NON_PILOT_NODE_ID}.guided_practice`,
        idempotencyKey: 'precalc-non-pilot',
        gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'node_not_enabled',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(0);
    expect(masteryEvents).toHaveLength(0);
  });
});
