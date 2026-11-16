import { describe, expect, it, vi } from 'vitest';
import type { LearningEvidenceV1 } from '@math-platform/practice-core';

import {
  createIm3LearningEvidenceHandler,
  type Im3LearningEvidenceStore,
} from '@/convex/learningEvidence';

const LEARNER_ID = 'student-im3-handler';
const PILOT_NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';
const PILOT_ACTIVITY_ID = `${PILOT_NODE_ID}.independent_practice`;

class InMemoryEvidenceStore implements Im3LearningEvidenceStore {
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
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T08:30:00.000Z',
    idempotencyKey: 'im3-handler-evidence-1',
    ...overrides,
  };
}

function createHarness() {
  const store = new InMemoryEvidenceStore();
  const masteryBridge = vi.fn(async () => undefined);
  const handler = createIm3LearningEvidenceHandler({ store, masteryBridge });

  return { handler, masteryBridge, store };
}

describe('IM3 learning-evidence Convex handler seam', () => {
  it('persists teacher-led evidence without calling the mastery bridge', async () => {
    const { handler, masteryBridge, store } = createHarness();

    const result = await handler.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });

    expect(result).toMatchObject({
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
    expect(store.events).toHaveLength(1);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('denies pre-exposure Mastery Advantage evidence without any write', async () => {
    const { handler, masteryBridge, store } = createHarness();

    const result = await handler.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
        idempotencyKey: 'im3-handler-before-exposure',
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(0);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('calls the mastery bridge once for graded evidence after exposure', async () => {
    const { handler, masteryBridge, store } = createHarness();

    await handler.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({ idempotencyKey: 'im3-handler-exposure' }),
    });
    const masteryEvidence = makeEvidence({
      origin: 'mastery_advantage',
      mode: 'independent_practice',
      occurredAt: '2026-08-19T09:00:00.000Z',
      gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      idempotencyKey: 'im3-handler-mastery-1',
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      evidence: masteryEvidence,
    });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledTimes(1);
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      evidence: masteryEvidence,
    });
    expect(store.events).toHaveLength(2);
  });

  it('returns replay for the same normalized payload without a second bridge call', async () => {
    const { handler, masteryBridge } = createHarness();
    const exposure = makeEvidence({ idempotencyKey: 'im3-handler-replay-exposure' });
    const masteryEvidence = makeEvidence({
      origin: 'mastery_advantage',
      mode: 'independent_practice',
      occurredAt: '2026-08-19T09:00:00.000Z',
      gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      idempotencyKey: 'im3-handler-replay-mastery',
    });

    await handler.process({ learnerId: LEARNER_ID, evidence: exposure });
    await handler.process({ learnerId: LEARNER_ID, evidence: masteryEvidence });
    const replay = await handler.process({ learnerId: LEARNER_ID, evidence: masteryEvidence });

    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledTimes(1);
  });

  it('rejects a conflicting same-key payload without a second write', async () => {
    const { handler, masteryBridge, store } = createHarness();
    const original = makeEvidence({ idempotencyKey: 'im3-handler-conflict' });

    await handler.process({ learnerId: LEARNER_ID, evidence: original });
    const conflict = await handler.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-19T09:00:00.000Z',
        gradedEvidence: { isCorrect: true, score: 5, maxScore: 6 },
        idempotencyKey: original.idempotencyKey,
      }),
    });

    expect(conflict).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'conflict',
        exposureState: 'introduced',
        eligible: false,
        reason: 'idempotency_conflict',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(1);
    expect(masteryBridge).not.toHaveBeenCalled();
  });
});
