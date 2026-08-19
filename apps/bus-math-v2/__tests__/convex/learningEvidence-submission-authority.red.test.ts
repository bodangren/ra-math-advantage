import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

const LEARNING_EVIDENCE_MODULE = '../../convex/learningEvidence';
const LEARNER_ID = 'bm2-owned-submission-learner';
const SUBMISSION_ID = 'bm2-opaque-activity-submission';
const PILOT_NODE_ID = 'math.bm2.skill.1.1.apply-accounting-equation';
const PILOT_ACTIVITY_ID = 'accounting-equation';
const TEACHER_ACTIVITY_ID = 'd6b57545-65f6-4c39-80d5-000100001002';

type ActivitySubmission = {
  submissionId: string;
  userId: string;
  activityId: string;
  submissionData: {
    activityId: string;
    attemptNumber: number;
    mode: LearningEvidenceV1['mode'];
    submittedAt: string;
    rawAnswer: string;
  };
  score: number;
  maxScore: number;
  gradedAt: string;
};

type EvidenceStore = {
  findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null>;
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(learnerId: string, evidence: LearningEvidenceV1): Promise<void>;
};

type SubmissionEffect = {
  learnerId: string;
  submissionId: string;
  evidence: LearningEvidenceV1;
};

type SubmissionReceipt = {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: {
    idempotency: 'new' | 'replay';
    exposureState: 'introduced';
    eligible: true;
    reason: 'eligible';
    masteryBearing: true;
  };
};

type SubmissionResult =
  | (SubmissionReceipt & { delivery: 'new' | 'replay' })
  | {
    accepted: false;
    reason: 'submission_not_found';
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
    evidenceId?: string,
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
  kstBridge: (input: SubmissionEffect) => Promise<void>;
  srsBridge: (input: SubmissionEffect) => Promise<void>;
  receiptStore: ReceiptStore;
}) => SubmissionHandler;

class InMemoryEvidenceStore implements EvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  constructor(private readonly effectOrder: string[]) {}

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
    submissionData: {
      activityId: PILOT_ACTIVITY_ID,
      attemptNumber: 2,
      mode: 'independent_practice',
      submittedAt: '2026-08-19T10:00:00.000Z',
      rawAnswer: 'server-only-bm2-answer',
    },
    score: 0,
    maxScore: 2,
    gradedAt: '2026-08-19T10:01:00.000Z',
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

async function createHarness({
  submission = makeSubmission(),
}: {
  submission?: ActivitySubmission | null;
} = {}) {
  const effectOrder: string[] = [];
  const evidenceStore = new InMemoryEvidenceStore(effectOrder);
  const receiptStore = new InMemoryReceiptStore(effectOrder);
  const teacherExposure = makeTeacherExposure();
  evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: teacherExposure });
  const loadActivitySubmission = vi.fn(async (submissionId: string) => (
    submission?.submissionId === submissionId ? submission : null
  ));
  const kstBridge = vi.fn(async () => {
    effectOrder.push('kst');
  });
  const srsBridge = vi.fn(async () => {
    effectOrder.push('srs');
  });
  const handler = (await loadSubmissionHandlerFactory())({
    evidenceStore,
    loadActivitySubmission,
    kstBridge,
    receiptStore,
    srsBridge,
  });

  return {
    effectOrder,
    evidenceStore,
    handler,
    kstBridge,
    loadActivitySubmission,
    receiptStore,
    srsBridge,
    teacherExposure,
  };
}

describe('BM2 server-owned learning-evidence submissions', () => {
  it('derives server grades and applies SRS, KST, evidence, then receipt', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      kstBridge,
      loadActivitySubmission,
      receiptStore,
      srsBridge,
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
    expect(srsBridge).toHaveBeenCalledWith(expectedEffect);
    expect(kstBridge).toHaveBeenCalledWith(expectedEffect);
    expect(effectOrder).toEqual(['srs', 'kst', 'evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
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
  ])('rejects %s without an evidence, KST, or SRS effect', async (_label, submission) => {
    const {
      evidenceStore,
      handler,
      kstBridge,
      srsBridge,
      teacherExposure,
    } = await createHarness({ submission });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(kstBridge).not.toHaveBeenCalled();
    expect(srsBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
  });

  it('returns the original logical result on replay without another downstream effect', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      kstBridge,
      receiptStore,
      srsBridge,
    } = await createHarness();

    const first = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });
    const replay = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(first).toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
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
    expect(kstBridge).toHaveBeenCalledTimes(1);
    expect(srsBridge).toHaveBeenCalledTimes(1);
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['srs', 'kst', 'evidence', 'receipt']);
  });
});
