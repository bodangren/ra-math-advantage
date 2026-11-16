import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';

import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from '@/convex/learningEvidence';
import { createPrecalculusLearningEvidenceRuntime } from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'student-precalc-convex-pilot';
const PILOT_NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const PILOT_ACTIVITY_ID = `${PILOT_NODE_ID}.guided_practice`;
const SERVER_SUBMISSION_ID = 'server-owned-precalc-submission';

type EvidenceStore = {
  findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null>;
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(
    learnerId: string,
    evidence: LearningEvidenceV1,
    submissionId?: string,
  ): Promise<void>;
};

class InMemoryEvidenceStore implements EvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  constructor(private readonly effectOrder: string[] = []) {}

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

  async append(
    learnerId: string,
    evidence: LearningEvidenceV1,
  ): Promise<void> {
    this.events.push({ learnerId, evidence });
    this.effectOrder.push('evidence');
  }
}

class InMemoryReceiptStore implements PrecalculusSubmissionReceiptStore {
  readonly receipts = new Map<string, PrecalculusSubmissionReceipt>();

  constructor(private readonly effectOrder: string[]) {}

  async findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<PrecalculusSubmissionReceipt | null> {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(
    learnerId: string,
    submissionId: string,
    receipt: PrecalculusSubmissionReceipt,
  ): Promise<void> {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
    this.effectOrder.push('receipt');
  }
}

function makeTeacherExposure(
  overrides: Partial<LearningEvidenceV1> = {},
): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: `${PILOT_NODE_ID}.teacher-led-exposure`,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    idempotencyKey: 'precalc-trusted-teacher-exposure',
    ...overrides,
  };
}

function makeMasterySubmission(
  overrides: Partial<PrecalculusActivitySubmission> = {},
): PrecalculusActivitySubmission {
  return {
    submissionId: SERVER_SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: 'precalc-pilot-activity-document',
    stableActivityId: PILOT_ACTIVITY_ID,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: PILOT_ACTIVITY_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: {
        increasingIntervals: '[-3,-1]',
        decreasingIntervals: '[-1,3]',
        constantIntervals: '[3,5]',
      },
      parts: [
        { partId: 'increasingIntervals', rawAnswer: '[-3,-1]', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'decreasingIntervals', rawAnswer: '[-1,3]', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'constantIntervals', rawAnswer: '[3,5]', isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 3,
    maxScore: 3,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
    ...overrides,
  };
}

function createTrustedTeacherHarness() {
  const effectOrder: string[] = [];
  const store = new InMemoryEvidenceStore(effectOrder);
  const masteryBridge = vi.fn(async (_input: { learnerId: string; evidence: LearningEvidenceV1 }) => undefined);
  const handler = createPrecalculusLearningEvidenceRuntime({ store, masteryBridge });

  return { effectOrder, handler, masteryBridge, store };
}

function createSubmissionHarness({
  submission = makeMasterySubmission(),
}: {
  submission?: PrecalculusActivitySubmission | null;
} = {}) {
  const effectOrder: string[] = [];
  const evidenceStore = new InMemoryEvidenceStore(effectOrder);
  const receiptStore = new InMemoryReceiptStore(effectOrder);
  const loadActivitySubmission = vi.fn(async (submissionId: string) => (
    submission?.submissionId === submissionId ? submission : null
  ));
  const teacherMasteryBridge = vi.fn(async (
    _input: { learnerId: string; evidence: LearningEvidenceV1 },
  ) => undefined);
  const teacherLedHandler = createPrecalculusLearningEvidenceRuntime({
    store: evidenceStore,
    masteryBridge: teacherMasteryBridge,
  });
  const masteryBridge = vi.fn(async (): Promise<void> => {
    effectOrder.push('mastery');
  });
  const handler = createPrecalculusSubmissionLearningEvidenceHandler({
    evidenceStore,
    loadActivitySubmission,
    masteryBridge,
    receiptStore,
  });

  return {
    effectOrder,
    evidenceStore,
    handler,
    loadActivitySubmission,
    masteryBridge,
    receiptStore,
    teacherLedHandler,
    teacherMasteryBridge,
  };
}

describe('AP Precalculus Convex learning-evidence boundary', () => {
  it('stores Guided evidence after trusted exposure without applying mastery', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      loadActivitySubmission,
      masteryBridge,
      receiptStore,
      teacherLedHandler,
      teacherMasteryBridge,
    } = createSubmissionHarness();
    const exposure = makeTeacherExposure();

    await expect(teacherLedHandler.process({ learnerId: LEARNER_ID, evidence: exposure })).resolves.toEqual({
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
    expect(teacherMasteryBridge).not.toHaveBeenCalled();
    effectOrder.length = 0;

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    });

    expect(loadActivitySubmission).toHaveBeenCalledWith(SERVER_SUBMISSION_ID);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual(['evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: false,
      },
    });
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${SERVER_SUBMISSION_ID}`)).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain('[-3,-1]');
    expect(evidenceStore.events[1]?.evidence).not.toHaveProperty('rawAnswer');
  });

  it('does not call the mastery bridge for Guided evidence', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherLedHandler,
    } = createSubmissionHarness();

    await teacherLedHandler.process({
      learnerId: LEARNER_ID,
      evidence: makeTeacherExposure(),
    });
    const evidenceCountBeforeAttempt = evidenceStore.events.length;
    const receiptCountBeforeAttempt = receiptStore.receipts.size;
    effectOrder.length = 0;
    masteryBridge.mockRejectedValueOnce(new Error('mastery bridge failed'));

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    })).resolves.toMatchObject({ persisted: true, masteryApplied: false });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toHaveLength(evidenceCountBeforeAttempt + 1);
    expect(receiptStore.receipts.size).toBe(receiptCountBeforeAttempt + 1);
    expect(effectOrder).toEqual(['evidence', 'receipt']);
  });

  it.each([
    ['an unknown submission', null],
    ['a submission owned by another learner', makeMasterySubmission({ userId: 'other-precalc-learner' })],
    ['a non-pilot activity', makeMasterySubmission({
      submissionData: {
        ...makeMasterySubmission().submissionData,
        activityId: 'unapproved-precalc-activity',
      },
    })],
  ])('rejects %s without a mastery effect, evidence, or a receipt', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createSubmissionHarness({ submission });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it('denies a server-owned mastery submission before trusted exposure without writes', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createSubmissionHarness();

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    })).resolves.toEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it('returns the original logical receipt on submission replay without another effect', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherLedHandler,
    } = createSubmissionHarness();

    await teacherLedHandler.process({
      learnerId: LEARNER_ID,
      evidence: makeTeacherExposure(),
    });
    effectOrder.length = 0;

    const first = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    });
    const bridgeCallsBeforeReplay = masteryBridge.mock.calls.length;
    const evidenceCountBeforeReplay = evidenceStore.events.length;
    const receiptCountBeforeReplay = receiptStore.receipts.size;
    const effectsBeforeReplay = [...effectOrder];
    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: SERVER_SUBMISSION_ID,
    });

    expect(replay).toEqual({ ...first, delivery: 'replay' });
    expect(masteryBridge).toHaveBeenCalledTimes(bridgeCallsBeforeReplay);
    expect(evidenceStore.events).toHaveLength(evidenceCountBeforeReplay);
    expect(receiptStore.receipts.size).toBe(receiptCountBeforeReplay);
    expect(effectOrder).toEqual(effectsBeforeReplay);
  });

  it('records graded trusted teacher-led exposure without a mastery effect', async () => {
    const { handler, masteryBridge, store } = createTrustedTeacherHarness();
    const exposure = makeTeacherExposure();

    await expect(handler.process({ learnerId: LEARNER_ID, evidence: exposure })).resolves.toEqual({
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

  it('rejects malformed trusted teacher-led evidence before persistence', async () => {
    const { handler, masteryBridge, store } = createTrustedTeacherHarness();
    const malformed = {
      ...makeTeacherExposure(),
      rawAnswer: 'not allowed in learning-evidence.v1',
    };

    await expect(handler.process({
      learnerId: LEARNER_ID,
      evidence: malformed as LearningEvidenceV1,
    })).rejects.toThrow();

    expect(store.events).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('rejects an empty authenticated learner identity before persistence', async () => {
    const { handler, masteryBridge, store } = createTrustedTeacherHarness();

    await expect(handler.process({
      learnerId: '   ',
      evidence: makeTeacherExposure({ idempotencyKey: 'precalc-empty-learner-id' }),
    })).rejects.toThrow('learnerId must be a non-empty authenticated identity');

    expect(store.events).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('keeps separately constructed trusted teacher-led replay and one-field conflicts exactly once', async () => {
    const { handler, masteryBridge, store } = createTrustedTeacherHarness();
    const original = makeTeacherExposure({ idempotencyKey: 'precalc-teacher-led-replay' });
    const replayCandidate = makeTeacherExposure({ idempotencyKey: original.idempotencyKey });
    const conflict = makeTeacherExposure({
      idempotencyKey: original.idempotencyKey,
      occurredAt: '2026-08-19T09:01:00.000Z',
    });

    const first = await handler.process({ learnerId: LEARNER_ID, evidence: original });
    const replay = await handler.process({ learnerId: LEARNER_ID, evidence: replayCandidate });
    const conflictResult = await handler.process({ learnerId: LEARNER_ID, evidence: conflict });

    expect(replay).toEqual({
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
    expect(conflictResult).toEqual({
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
    expect(first).toMatchObject({ persisted: true, masteryApplied: false });
    expect(store.events).toEqual([{ learnerId: LEARNER_ID, evidence: original }]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });
});
