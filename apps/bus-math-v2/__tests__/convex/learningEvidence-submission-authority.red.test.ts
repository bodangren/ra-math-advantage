import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';

const LEARNING_EVIDENCE_MODULE = '../../convex/learningEvidence';
const LEARNER_ID = 'bm2-owned-submission-learner';
const SUBMISSION_ID = 'bm2-opaque-activity-submission';
const PILOT_NODE_ID = 'math.bm2.skill.1.1.apply-accounting-equation';
const PILOT_ACTIVITY_ID = 'accounting-equation';
const GENERATED_PILOT_STABLE_ACTIVITY_ID = 'accounting-equation-7-assets';
const TEACHER_ACTIVITY_ID = 'd6b57545-65f6-4c39-80d5-000100001002';
const DAILY_SOURCE_ACTIVITY_DOCUMENT_ID = 'activities:bm2-daily-source-row';

type ActivitySubmission = {
  submissionId: string;
  userId: string;
  activityId: string;
  // The opaque consumer receives this only after the production mutation
  // reloads the physical activities row referenced by activityId.
  activityStableActivityId?: string;
  stableActivityId?: string;
  masteryContractVersion?: string;
  trustedTeacherExposure?: boolean;
  attemptOrdinal?: number;
  submissionData: {
    contractVersion?: string;
    activityId: string;
    attemptNumber: number;
    mode: LearningEvidenceV1['mode'];
    submittedAt: string;
    status?: string;
    rawAnswer: string;
  };
  score: number;
  maxScore: number;
  gradedAt: string;
  submittedAt?: string;
};

type EvidenceStore = {
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(learnerId: string, evidence: LearningEvidenceV1): Promise<void>;
};

type MasteryEffect = {
  learnerId: string;
  submissionId: string;
  evidence: LearningEvidenceV1;
};

type MasteryBridge = (input: MasteryEffect) => Promise<void>;

type SubmissionReceipt = {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: {
    idempotency: 'new' | 'replay';
    exposureState: 'introduced';
    eligible: boolean;
    reason: 'eligible' | 'teacher_led';
    masteryBearing: boolean;
  };
};

type SubmissionResult =
  | (SubmissionReceipt & { delivery: 'new' | 'replay' })
  | {
    accepted: false;
    reason: 'submission_not_found';
  }
  | {
    accepted: false;
    reason: 'attempt_ordinal_conflict';
    latestAttemptOrdinal: number;
    receivedAttemptOrdinal: number;
  };

type ReceiptStore = {
  findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<SubmissionReceipt | null>;
  append(
    learnerId: string,
    submissionId: string,
    receipt: SubmissionReceipt,
  ): Promise<void>;
};

type SubmissionHandler = {
  process(input: {
    learnerId: string;
    submissionId: string;
  }): Promise<SubmissionResult>;
};

type SubmissionHandlerFactory = (dependencies: {
  evidenceStore: EvidenceStore;
  loadActivitySubmission: (submissionId: string) => Promise<ActivitySubmission | null>;
  masteryBridge: MasteryBridge;
  receiptStore: ReceiptStore;
}) => SubmissionHandler;

class InMemoryEvidenceStore implements EvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  constructor(private readonly effectOrder: string[]) {}

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
    this.effectOrder.push('evidence');
  }
}

class InMemoryReceiptStore implements ReceiptStore {
  readonly receipts = new Map<string, SubmissionReceipt>();

  constructor(private readonly effectOrder: string[]) {}

  async findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<SubmissionReceipt | null> {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(
    learnerId: string,
    submissionId: string,
    receipt: SubmissionReceipt,
  ): Promise<void> {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
    this.effectOrder.push('receipt');
  }
}

function makeTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: TEACHER_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'guided_practice',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'bm2-teacher-exposure-before-owned-submission',
  };
}

function makeSubmission(overrides: Partial<ActivitySubmission> = {}): ActivitySubmission {
  return {
    submissionId: SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: 'bm2-pilot-activity-document',
    activityStableActivityId: TEACHER_ACTIVITY_ID,
    stableActivityId: GENERATED_PILOT_STABLE_ACTIVITY_ID,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submittedAt: '2026-08-19T10:00:00.000Z',
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: PILOT_ACTIVITY_ID,
      attemptNumber: 2,
      mode: 'independent_practice',
      submittedAt: '2026-08-19T10:00:00.000Z',
      status: 'graded',
      rawAnswer: 'server-only-bm2-answer',
    },
    score: 0,
    maxScore: 2,
    gradedAt: '2026-08-19T10:01:00.000Z',
    ...overrides,
  };
}

function makeDailyTeacherSourceSubmission(
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  return {
    submissionId: SUBMISSION_ID,
    userId: LEARNER_ID,
    // This is the physical Convex foreign key selected by the daily route.
    activityId: DAILY_SOURCE_ACTIVITY_DOCUMENT_ID,
    activityStableActivityId: TEACHER_ACTIVITY_ID,
    // This is the authored Unit 1 Lesson 1 identity resolved from that row.
    stableActivityId: TEACHER_ACTIVITY_ID,
    masteryContractVersion: 'learning-evidence.v1',
    // These two values are assigned at the stored-submission boundary.
    attemptOrdinal: 41,
    submittedAt: '2026-08-19T10:00:00.000Z',
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: DAILY_SOURCE_ACTIVITY_DOCUMENT_ID,
      // Browser-controlled values deliberately disagree with the stored fields.
      attemptNumber: 999,
      mode: 'guided_practice',
      submittedAt: '1999-01-01T00:00:00.000Z',
      status: 'graded',
      rawAnswer: 'daily-source-raw-answer',
    },
    score: 2,
    maxScore: 2,
    gradedAt: '2026-08-19T10:00:01.000Z',
    ...overrides,
  };
}

async function loadSubmissionHandlerFactory(): Promise<SubmissionHandlerFactory> {
  const source = await vi.importActual<Record<string, unknown>>(LEARNING_EVIDENCE_MODULE);
  const factory = source.createBm2SubmissionLearningEvidenceHandler;

  if (typeof factory !== 'function') {
    throw new Error(
      'BM2 must export createBm2SubmissionLearningEvidenceHandler(dependencies) '
      + 'for server-owned activity submissions.',
    );
  }

  return factory as SubmissionHandlerFactory;
}

async function createHarness(options: {
  submission?: ActivitySubmission | null;
  masteryFailure?: Error;
  seedTeacherExposure?: boolean;
} = {}) {
  const submission = Object.hasOwn(options, 'submission')
    ? options.submission ?? null
    : makeSubmission();
  const effectOrder: string[] = [];
  const evidenceStore = new InMemoryEvidenceStore(effectOrder);
  const receiptStore = new InMemoryReceiptStore(effectOrder);
  const teacherExposure = makeTeacherExposure();
  if (options.seedTeacherExposure !== false) {
    evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: teacherExposure });
  }
  const loadActivitySubmission = vi.fn(async (submissionId: string) => (
    submission?.submissionId === submissionId ? submission : null
  ));
  const masteryBridge = vi.fn(async (): Promise<void> => {
    effectOrder.push('mastery');
    if (options.masteryFailure) throw options.masteryFailure;
  });
  const handler = (await loadSubmissionHandlerFactory())({
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
    teacherExposure,
  };
}

describe('BM2 server-owned learning-evidence submissions', () => {
  it('derives server grades and applies mastery, evidence, then receipt', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      loadActivitySubmission,
      masteryBridge,
      receiptStore,
    } = await createHarness();

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    const expectedEffect = {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
      evidence: expect.objectContaining({
        nodeId: PILOT_NODE_ID,
        activityId: PILOT_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-19T10:00:00.000Z',
        gradedEvidence: { isCorrect: false, score: 0, maxScore: 2 },
      }),
    };

    expect(loadActivitySubmission).toHaveBeenCalledWith(SUBMISSION_ID);
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(JSON.stringify(result)).not.toContain('server-only-bm2-answer');
    expect(evidenceStore.events[1]?.evidence).not.toHaveProperty('rawAnswer');
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${SUBMISSION_ID}`)).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
    });
  });

  it('rejects a forged or legacy mastery row when only nested submission data imitates the pilot', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      submission: makeSubmission({
        stableActivityId: undefined,
        attemptOrdinal: undefined,
        submissionData: {
          ...makeSubmission().submissionData,
          activityId: PILOT_ACTIVITY_ID,
          attemptNumber: 999,
          mode: 'independent_practice',
          submittedAt: '2026-08-19T10:00:00.000Z',
        },
      }),
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .resolves.toEqual({ accepted: false, reason: 'submission_not_found' });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual([]);
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('uses the stored generated stable identity and server attempt ordinal instead of nested browser fields', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
    } = await createHarness({
      submission: makeSubmission({
        stableActivityId: GENERATED_PILOT_STABLE_ACTIVITY_ID,
        attemptOrdinal: 41,
        submittedAt: '2026-08-19T10:00:00.000Z',
        submissionData: {
          ...makeSubmission().submissionData,
          activityId: PILOT_ACTIVITY_ID,
          attemptNumber: 999,
          submittedAt: '1999-01-01T00:00:00.000Z',
        },
      }),
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .resolves.toMatchObject({
        persisted: true,
        masteryApplied: true,
        kstApplied: false,
        delivery: 'new',
      });

    const storedEvidence = evidenceStore.events[1]?.evidence;
    expect(storedEvidence).toMatchObject({
      activityId: PILOT_ACTIVITY_ID,
      attemptOrdinal: 41,
      occurredAt: '2026-08-19T10:00:00.000Z',
      origin: 'mastery_advantage',
    });
    expect(storedEvidence?.attemptOrdinal).not.toBe(999);
    expect(storedEvidence?.occurredAt).not.toBe('1999-01-01T00:00:00.000Z');
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
  });

  it('derives daily teacher exposure from the stored source FK, server ordinal, and server time only', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({
      submission: makeDailyTeacherSourceSubmission({ trustedTeacherExposure: true }),
      seedTeacherExposure: false,
    });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual(['evidence', 'receipt']);
    expect(receiptStore.receipts.size).toBe(1);
    expect(evidenceStore.events).toEqual([{
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: 'learning-evidence.v1',
        nodeId: PILOT_NODE_ID,
        activityId: TEACHER_ACTIVITY_ID,
        attemptOrdinal: 41,
        origin: 'teacher_led',
        mode: 'guided_practice',
        occurredAt: '2026-08-19T10:00:00.000Z',
        idempotencyKey: `bm2:teacher-led:submission:${SUBMISSION_ID}`,
      },
    }]);
    const dailyEvidence = evidenceStore.events[0]?.evidence;
    expect(dailyEvidence).not.toHaveProperty('gradedEvidence');
    expect(JSON.stringify(dailyEvidence)).not.toContain('daily-source-raw-answer');
    expect(dailyEvidence?.attemptOrdinal).not.toBe(999);
    expect(dailyEvidence?.occurredAt).not.toBe('1999-01-01T00:00:00.000Z');
  });

  it('does not treat a student Guided submission as trusted teacher exposure', async () => {
    const { evidenceStore, handler, masteryBridge, receiptStore } = await createHarness({
      submission: makeDailyTeacherSourceSubmission(),
      seedTeacherExposure: false,
    });
    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it.each([
    ['a stored row owned by another learner', makeDailyTeacherSourceSubmission({ userId: 'another-learner' })],
    ['a source physical activity with no stable identity', makeDailyTeacherSourceSubmission({
      activityStableActivityId: undefined,
    })],
    ['a source physical activity with the wrong stable identity', makeDailyTeacherSourceSubmission({
      activityStableActivityId: 'd6b57545-65f6-4c39-80d5-000100009999',
    })],
    ['the wrong authored source identity', makeDailyTeacherSourceSubmission({
      stableActivityId: 'd6b57545-65f6-4c39-80d5-000100009999',
    })],
    ['a browser activity ID that does not match the stored physical foreign key', makeDailyTeacherSourceSubmission({
      submissionData: {
        ...makeDailyTeacherSourceSubmission().submissionData,
        activityId: 'activities:bm2-different-source-row',
      },
    })],
    ['the wrong stored source mode', makeDailyTeacherSourceSubmission({
      submissionData: {
        ...makeDailyTeacherSourceSubmission().submissionData,
        mode: 'assessment',
      },
    })],
  ])('rejects daily teacher evidence from %s before all effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness({ submission, seedTeacherExposure: false });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .resolves.toEqual({ accepted: false, reason: 'submission_not_found' });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual([]);
    expect(evidenceStore.events).toEqual([]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('rejects a generated mastery row when its referenced physical activity is not the exact pilot source', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({
      submission: makeSubmission({
        activityStableActivityId: 'd6b57545-65f6-4c39-80d5-000100009999',
      }),
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .resolves.toEqual({ accepted: false, reason: 'submission_not_found' });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual([]);
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it('fails closed before evidence or receipt persistence when the mastery effect fails', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = await createHarness({ masteryFailure: new Error('Mastery effect failed') });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .rejects.toThrow('Mastery effect failed');

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(effectOrder).toEqual(['mastery']);
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    ['an unknown submission', null],
    ['a submission owned by another learner', makeSubmission({ userId: 'other-bm2-learner' })],
    ['a non-pilot activity', makeSubmission({
      submissionData: {
        activityId: 'unapproved-bm2-activity',
        attemptNumber: 2,
        mode: 'independent_practice',
        submittedAt: '2026-08-19T10:00:00.000Z',
        rawAnswer: 'server-only-bm2-answer',
      },
    })],
  ])('rejects %s without evidence or a mastery effect', async (_label, submission) => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      teacherExposure,
    } = await createHarness({ submission });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
  });

  it('returns the original logical result on replay without another downstream effect', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = await createHarness();

    const first = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });
    const replay = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(first).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(replay).toEqual({ ...first, delivery: 'replay' });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
  });

  it.each([1, 2])(
    'rejects a non-increasing attempt ordinal (%s) in the exact mastery scope before effects',
    async (receivedAttemptOrdinal) => {
      const {
        effectOrder,
        evidenceStore,
        handler,
        masteryBridge,
      } = await createHarness({
        submission: makeSubmission({
          // The stored top-level ordinal is authoritative. The nested field is
          // browser data and must not affect this conflict decision.
          attemptOrdinal: receivedAttemptOrdinal,
          submissionData: {
            ...makeSubmission().submissionData,
            attemptNumber: 999,
          },
        }),
      });

      evidenceStore.events.push({
        learnerId: LEARNER_ID,
        evidence: {
          contractVersion: 'learning-evidence.v1',
          nodeId: PILOT_NODE_ID,
          activityId: PILOT_ACTIVITY_ID,
          attemptOrdinal: 2,
          origin: 'mastery_advantage',
          mode: 'independent_practice',
          occurredAt: '2026-08-19T09:30:00.000Z',
          gradedEvidence: { isCorrect: false, score: 0, maxScore: 2 },
          idempotencyKey: 'bm2-prior-mastery-attempt',
        },
      });

      await expect(
        handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }),
      ).resolves.toEqual({
        accepted: false,
        reason: 'attempt_ordinal_conflict',
        latestAttemptOrdinal: 2,
        receivedAttemptOrdinal,
      });
      expect(masteryBridge).not.toHaveBeenCalled();
      expect(effectOrder).toEqual([]);
      expect(evidenceStore.events).toHaveLength(2);
    },
  );
});
