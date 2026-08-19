import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

import {
  createBm2LearningEvidenceHandler,
  type Bm2LearningEvidenceStore,
} from '../../convex/learningEvidence';

const LEARNER_ID = 'student-bm2-convex-pilot';
const PILOT_NODE_ID = 'math.bm2.skill.1.1.apply-accounting-equation';
const PILOT_ACTIVITY_ID = 'accounting-equation';
const FROZEN_SOURCE_ACTIVITY_ID = 'd6b57545-65f6-4c39-80d5-000100001002';

class InMemoryEvidenceStore implements Bm2LearningEvidenceStore {
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
    mode: 'independent_practice',
    occurredAt: '2026-08-19T09:00:00.000Z',
    gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    idempotencyKey: 'bm2-convex-attempt-1',
    ...overrides,
  };
}

function createHarness() {
  const store = new InMemoryEvidenceStore();
  const masteryBridge = vi.fn(async () => undefined);
  const handler = createBm2LearningEvidenceHandler({ store, masteryBridge });

  return { handler, masteryBridge, store };
}

describe('BM2 Convex learning-evidence boundary', () => {
  it('persists teacher-led exposure without invoking the mastery bridge', async () => {
    const { handler, masteryBridge, store } = createHarness();
    const exposure = makeEvidence({
      activityId: FROZEN_SOURCE_ACTIVITY_ID,
      origin: 'teacher_led',
      mode: 'guided_practice',
      gradedEvidence: undefined,
      idempotencyKey: 'bm2-convex-teacher-exposure',
    });

    const result = await handler.process({ learnerId: LEARNER_ID, evidence: exposure });

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
    expect(store.events).toEqual([{ learnerId: LEARNER_ID, evidence: exposure }]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it.each([
    ['a non-frozen activity', { activityId: PILOT_ACTIVITY_ID, mode: 'guided_practice' as const }],
    ['a non-frozen mode', { activityId: FROZEN_SOURCE_ACTIVITY_ID, mode: 'teaching' as const }],
  ])('rejects teacher-led evidence from %s', async (_label, sourceOverride) => {
    const { handler, masteryBridge, store } = createHarness();

    await expect(handler.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        ...sourceOverride,
        origin: 'teacher_led',
        gradedEvidence: undefined,
        idempotencyKey: `bm2-convex-invalid-teacher-source-${_label}`,
      }),
    })).rejects.toThrow('frozen source activity and mode');

    expect(store.events).toHaveLength(0);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('denies pre-exposure Mastery Advantage evidence without writes', async () => {
    const { handler, masteryBridge, store } = createHarness();

    const result = await handler.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({ idempotencyKey: 'bm2-convex-before-exposure' }),
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

  it('bridges one eligible post-exposure event and ignores its replay', async () => {
    const { handler, masteryBridge, store } = createHarness();
    const exposure = makeEvidence({
      activityId: FROZEN_SOURCE_ACTIVITY_ID,
      origin: 'teacher_led',
      mode: 'guided_practice',
      gradedEvidence: undefined,
      idempotencyKey: 'bm2-convex-exposure-before-bridge',
    });
    const attempt = makeEvidence({ idempotencyKey: 'bm2-convex-post-exposure' });

    await handler.process({ learnerId: LEARNER_ID, evidence: exposure });
    const first = await handler.process({ learnerId: LEARNER_ID, evidence: attempt });
    const replay = await handler.process({ learnerId: LEARNER_ID, evidence: attempt });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: { idempotency: 'new', reason: 'eligible', masteryBearing: true },
    });
    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: { idempotency: 'replay', reason: 'eligible', masteryBearing: true },
    });
    expect(store.events).toHaveLength(2);
    expect(masteryBridge).toHaveBeenCalledTimes(1);
    expect(masteryBridge).toHaveBeenCalledWith({ evidence: attempt });
  });

  it('rejects a same-key conflict without a write or bridge call', async () => {
    const { handler, masteryBridge, store } = createHarness();
    const exposure = makeEvidence({
      activityId: FROZEN_SOURCE_ACTIVITY_ID,
      origin: 'teacher_led',
      mode: 'guided_practice',
      gradedEvidence: undefined,
      idempotencyKey: 'bm2-convex-conflict-exposure',
    });
    const original = makeEvidence({ idempotencyKey: 'bm2-convex-conflict' });
    const conflict = makeEvidence({
      idempotencyKey: original.idempotencyKey,
      gradedEvidence: { isCorrect: false, score: 0, maxScore: 1 },
    });

    await handler.process({ learnerId: LEARNER_ID, evidence: exposure });
    await handler.process({ learnerId: LEARNER_ID, evidence: original });
    const result = await handler.process({ learnerId: LEARNER_ID, evidence: conflict });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'conflict',
        reason: 'idempotency_conflict',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(2);
    expect(masteryBridge).toHaveBeenCalledTimes(1);
  });
});
