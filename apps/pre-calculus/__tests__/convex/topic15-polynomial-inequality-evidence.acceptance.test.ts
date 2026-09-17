import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';

import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionEffect,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from '@/convex/learningEvidence';
import { gradeTopic15PolynomialInequalitySignChart } from '@/lib/practice/topic15-polynomial-inequality-sign-chart';
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
  type PrecalculusLearningEvidenceHistoryOptions,
  type PrecalculusLearningEvidenceStore,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'precalc-polynomial-inequality-evidence-learner';
const SUBMITTED_AT = Date.parse('2026-08-30T10:00:00.000Z');
const SUBMITTED_AT_ISO = '2026-08-30T10:00:00.000Z';
const GUIDED_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID;
const WORKED_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID;

type Mode = 'guided_practice' | 'independent_practice';
type Answers = {
  roots: number[];
  intervalSigns: Array<'+' | '-'>;
  solution: string;
};
type StoredPart = Record<string, unknown>;

const GUIDED_ANSWER: Answers = {
  roots: [5, -2],
  intervalSigns: ['-', '-', '+'],
  solution: '  (-∞, 5]  ',
};
const INDEPENDENT_ANSWER: Answers = {
  roots: [2, 1, -3],
  intervalSigns: ['-', '+', '-', '+'],
  solution: ' (1.0, 2) U (-infinity, -3) ',
};
const FRACTIONAL_GUIDED_ANSWER: Answers = {
  roots: [5, -2.5],
  intervalSigns: ['-', '-', '+'],
  solution: '  (-∞, 5]  ',
};

function makeSubmission(
  mode: Mode = 'guided_practice',
  options: {
    answers?: Answers;
    overrides?: Partial<PrecalculusActivitySubmission>;
    dataOverrides?: Record<string, unknown>;
  } = {},
): PrecalculusActivitySubmission {
  const answers = options.answers ?? (mode === 'guided_practice' ? GUIDED_ANSWER : INDEPENDENT_ANSWER);
  const stableActivityId = mode === 'guided_practice' ? GUIDED_ID : INDEPENDENT_ID;
  const graded = gradeTopic15PolynomialInequalitySignChart(
    mode === 'guided_practice' ? 1 : 2,
    answers,
  );
  return {
    submissionId: `precalc-polynomial-inequality-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-polynomial-inequality-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: 'graded',
      submittedAt: SUBMITTED_AT_ISO,
      answers,
      parts: graded.parts,
      ...options.dataOverrides,
    },
    score: graded.score,
    maxScore: 3,
    gradedAt: SUBMITTED_AT,
    submittedAt: SUBMITTED_AT,
    ...options.overrides,
  } as PrecalculusActivitySubmission;
}

function withData(
  submission: PrecalculusActivitySubmission,
  mutate: (data: Record<string, unknown>) => void,
): PrecalculusActivitySubmission {
  const data = { ...submission.submissionData };
  mutate(data);
  return { ...submission, submissionData: data };
}

function withPart(
  submission: PrecalculusActivitySubmission,
  mutate: (part: StoredPart) => void,
): PrecalculusActivitySubmission {
  return withData(submission, (data) => {
    const parts = [...(data.parts as StoredPart[])];
    const part = { ...parts[0]! };
    mutate(part);
    parts[0] = part;
    data.parts = parts;
  });
}

class InMemoryEvidenceStore implements PrecalculusLearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];
  readonly idempotencyLookups: Array<{ learnerId: string; idempotencyKey: string }> = [];
  readonly nodeLookups: Array<{
    learnerId: string;
    nodeId: string;
    options: PrecalculusLearningEvidenceHistoryOptions;
  }> = [];

  async findByIdempotencyKey(learnerId: string, idempotencyKey: string) {
    this.idempotencyLookups.push({ learnerId, idempotencyKey });
    return this.events.find((entry) => (
      entry.learnerId === learnerId && entry.evidence.idempotencyKey === idempotencyKey
    ))?.evidence ?? null;
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
    options: PrecalculusLearningEvidenceHistoryOptions,
  ) {
    this.nodeLookups.push({ learnerId, nodeId, options });
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1) {
    this.events.push({ learnerId, evidence });
  }
}

class InMemoryReceiptStore implements PrecalculusSubmissionReceiptStore {
  readonly receipts = new Map<string, PrecalculusSubmissionReceipt>();

  async findBySubmissionId(learnerId: string, submissionId: string) {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(learnerId: string, submissionId: string, receipt: PrecalculusSubmissionReceipt) {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
  }
}

function makeTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    activityId: WORKED_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-30T09:00:00.000Z',
    idempotencyKey: 'precalc-polynomial-inequality-teacher-exposure',
  };
}

function createHarness(
  submission: PrecalculusActivitySubmission,
  withTeacherExposure = false,
) {
  const evidenceStore = new InMemoryEvidenceStore();
  if (withTeacherExposure) {
    evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: makeTeacherExposure() });
  }
  const receiptStore = new InMemoryReceiptStore();
  const effectOrder: string[] = [];
  const masteryBridge = vi.fn(async (_effect: PrecalculusSubmissionEffect) => {
    effectOrder.push('mastery');
  });
  const handler = createPrecalculusSubmissionLearningEvidenceHandler({
    evidenceStore,
    loadActivitySubmission: async (submissionId) => (
      submissionId === submission.submissionId ? submission : null
    ),
    masteryBridge,
    receiptStore: {
      findBySubmissionId: receiptStore.findBySubmissionId.bind(receiptStore),
      append: async (learnerId, submissionId, receipt) => {
        await receiptStore.append(learnerId, submissionId, receipt);
        effectOrder.push('receipt');
      },
    },
  });
  const originalAppend = evidenceStore.append.bind(evidenceStore);
  evidenceStore.append = async (
    learnerId: string,
    evidence: LearningEvidenceV1,
    submissionId?: string,
  ) => {
    void submissionId;
    await originalAppend(learnerId, evidence);
    effectOrder.push('evidence');
  };
  return { effectOrder, evidenceStore, handler, masteryBridge, receiptStore };
}

async function expectEnabled(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission, true);
  const expectedActivityId = submission.stableActivityId!;
  const expectedKey = `precalc:mastery-advantage:submission:${submission.submissionId}`;
  const expectedEvidence: LearningEvidenceV1 = {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    activityId: expectedActivityId,
    attemptOrdinal: submission.attemptOrdinal!,
    origin: 'mastery_advantage',
    mode: submission.submissionData.mode as Mode,
    occurredAt: SUBMITTED_AT_ISO,
    gradedEvidence: {
      isCorrect: submission.score === submission.maxScore,
      score: submission.score!,
      maxScore: submission.maxScore!,
    },
    idempotencyKey: expectedKey,
  };

  await expect(handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }))
    .resolves.toEqual({
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
  expect(evidenceStore.idempotencyLookups).toEqual([{
    learnerId: LEARNER_ID,
    idempotencyKey: expectedKey,
  }]);
  expect(evidenceStore.nodeLookups).toEqual([{
    learnerId: LEARNER_ID,
    nodeId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    options: {
      activityId: expectedActivityId,
      origin: 'mastery_advantage',
      occurredAt: SUBMITTED_AT_ISO,
    },
  }]);
  expect(masteryBridge).toHaveBeenCalledWith({
    learnerId: LEARNER_ID,
    submissionId: submission.submissionId,
    evidence: expectedEvidence,
  });
  expect(evidenceStore.events).toHaveLength(2);
  expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
  expect(receiptStore.receipts.size).toBe(1);
  expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);

  await expect(handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }))
    .resolves.toEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'replay',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
  expect(masteryBridge).toHaveBeenCalledOnce();
  expect(evidenceStore.events).toHaveLength(2);
  expect(receiptStore.receipts.size).toBe(1);
  expect(evidenceStore.idempotencyLookups).toHaveLength(1);
  expect(evidenceStore.nodeLookups).toHaveLength(1);
  expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
}

async function expectAwaitingExposure(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission);

  await expect(handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId }))
    .resolves.toEqual({
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
}

async function expectRejected(
  submission: PrecalculusActivitySubmission,
  learnerId: string = LEARNER_ID,
): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission);

  await expect(handler.process({ learnerId, submissionId: submission.submissionId })).resolves.toEqual({
    accepted: false,
    reason: 'submission_not_found',
  });
  expect(masteryBridge).not.toHaveBeenCalled();
  expect(evidenceStore.events).toEqual([]);
  expect(receiptStore.receipts.size).toBe(0);
  expect(effectOrder).toEqual([]);
}

describe('Topic 1.5 polynomial-inequality evidence mapping', () => {
  it('enables the Example 3 node exactly once without duplicate allow-list entries', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => (nodeId as string) === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ['Guided correct', 3, makeSubmission('guided_practice')],
    ['Guided partial with finite fractional root', 2, makeSubmission('guided_practice', {
      answers: FRACTIONAL_GUIDED_ANSWER,
    })],
    ['Independent correct', 3, makeSubmission('independent_practice')],
  ])('maps a valid %s row to exact evidence after teacher exposure', async (
    _label,
    expectedScore,
    submission,
  ) => {
    expect(submission.score).toBe(expectedScore);
    expect(submission.maxScore).toBe(3);
    await expectEnabled(submission);
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('waits for exact teacher exposure for %s without effects', async (_label, mode) => {
    await expectAwaitingExposure(makeSubmission(mode));
  });

  it('rejects a foreign learner with no effects', async () => {
    await expectRejected(makeSubmission(), LEARNER_ID + '-other');
  });

  it.each([
    ['blank physical activity ID', makeSubmission('guided_practice', { overrides: { activityId: '' } })],
    ['missing stable activity ID', (() => {
      const submission = makeSubmission();
      delete submission.stableActivityId;
      return submission;
    })()],
    ['wrong stable activity ID', makeSubmission('guided_practice', { overrides: { stableActivityId: INDEPENDENT_ID } })],
    ['cross-paired Guided stable ID and Independent envelope', withData(makeSubmission(), (data) => {
      data.activityId = INDEPENDENT_ID;
      data.mode = 'independent_practice';
    })],
    ['cross-paired Independent stable ID and Guided envelope', withData(makeSubmission('independent_practice'), (data) => {
      data.activityId = GUIDED_ID;
      data.mode = 'guided_practice';
    })],
    ['wrong mastery contract', makeSubmission('guided_practice', { overrides: { masteryContractVersion: 'wrong' } })],
    ['non-record envelope', { ...makeSubmission(), submissionData: null } as unknown as PrecalculusActivitySubmission],
    ['extra envelope field', withData(makeSubmission(), (data) => { data.extra = true; })],
    ['missing envelope field', withData(makeSubmission(), (data) => { delete data.status; })],
    ['wrong envelope contract', withData(makeSubmission(), (data) => { data.contractVersion = 'practice.v0'; })],
    ['wrong envelope status', withData(makeSubmission(), (data) => { data.status = 'submitted'; })],
    ['missing envelope activity ID', withData(makeSubmission(), (data) => { delete data.activityId; })],
    ['wrong envelope mode', withData(makeSubmission(), (data) => { data.mode = 'independent_practice'; })],
    ['missing row attempt ordinal', makeSubmission('guided_practice', { overrides: { attemptOrdinal: undefined } })],
    ['row attempt ordinal wrong type', makeSubmission('guided_practice', { overrides: { attemptOrdinal: '7' as unknown as number } })],
    ['row attempt ordinal zero', makeSubmission('guided_practice', { overrides: { attemptOrdinal: 0 } })],
    ['row attempt ordinal fractional', makeSubmission('guided_practice', { overrides: { attemptOrdinal: 1.5 } })],
    ['row attempt ordinal unsafe', makeSubmission('guided_practice', { overrides: { attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 } })],
    ['missing envelope attempt number', withData(makeSubmission(), (data) => { delete data.attemptNumber; })],
    ['envelope attempt number wrong type', withData(makeSubmission(), (data) => { data.attemptNumber = '7'; })],
    ['envelope attempt number zero', withData(makeSubmission(), (data) => { data.attemptNumber = 0; })],
    ['envelope attempt number fractional', withData(makeSubmission(), (data) => { data.attemptNumber = 1.5; })],
    ['envelope attempt number unsafe', withData(makeSubmission(), (data) => { data.attemptNumber = Number.MAX_SAFE_INTEGER + 1; })],
    ['envelope attempt number mismatch', withData(makeSubmission(), (data) => { data.attemptNumber = 8; })],
    ['row submitted time wrong type', makeSubmission('guided_practice', { overrides: { submittedAt: '10' as unknown as number } })],
    ['row submitted time nonfinite', makeSubmission('guided_practice', { overrides: { submittedAt: Number.NaN } })],
    ['row submitted time mismatch', makeSubmission('guided_practice', { overrides: { submittedAt: SUBMITTED_AT + 1000 } })],
    ['envelope submitted time wrong type', withData(makeSubmission(), (data) => { data.submittedAt = 10; })],
    ['envelope submitted time invalid', withData(makeSubmission(), (data) => { data.submittedAt = 'not-a-time'; })],
    ['envelope submitted time noncanonical', withData(makeSubmission(), (data) => { data.submittedAt = '2026-08-30T10:00:00Z'; })],
    ['envelope submitted time mismatch', withData(makeSubmission(), (data) => { data.submittedAt = '2026-08-30T10:00:01.000Z'; })],
    ['graded time wrong type', makeSubmission('guided_practice', { overrides: { gradedAt: '10' as unknown as number } })],
    ['graded time nonfinite', makeSubmission('guided_practice', { overrides: { gradedAt: Number.NaN } })],
    ['graded time mismatch', makeSubmission('guided_practice', { overrides: { gradedAt: SUBMITTED_AT + 1000 } })],
    ['answers non-record', withData(makeSubmission(), (data) => { data.answers = null; })],
    ['answers extra field', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, extra: true }; })],
    ['answers missing field', withData(makeSubmission(), (data) => { data.answers = { roots: GUIDED_ANSWER.roots, intervalSigns: GUIDED_ANSWER.intervalSigns }; })],
    ['Guided wrong root count', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, roots: [5] }; })],
    ['Independent wrong root count', withData(makeSubmission('independent_practice'), (data) => { data.answers = { ...INDEPENDENT_ANSWER, roots: [2, 1] }; })],
    ['Guided wrong sign count', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, intervalSigns: ['-', '+'] }; })],
    ['Independent wrong sign count', withData(makeSubmission('independent_practice'), (data) => { data.answers = { ...INDEPENDENT_ANSWER, intervalSigns: ['-', '+', '-'] }; })],
    ['root non-number', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, roots: [5, 'x'] }; })],
    ['root non-finite', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, roots: [5, Number.NaN] }; })],
    ['root beyond safe magnitude', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, roots: [5, Number.MAX_SAFE_INTEGER + 1] }; })],
    ['invalid sign', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, intervalSigns: ['-', '?', '+'] }; })],
    ['blank solution', withData(makeSubmission(), (data) => { data.answers = { ...GUIDED_ANSWER, solution: '   ' }; })],
    ['parts non-array', withData(makeSubmission(), (data) => { data.parts = {}; })],
    ['parts missing', withData(makeSubmission(), (data) => { delete data.parts; })],
    ['parts empty', withData(makeSubmission(), (data) => { data.parts = []; })],
    ['parts extra item', withData(makeSubmission(), (data) => {
      data.parts = [...(data.parts as StoredPart[]), { partId: 'solution', rawAnswer: GUIDED_ANSWER.solution }];
    })],
    ['parts reordered', withData(makeSubmission(), (data) => {
      const parts = data.parts as StoredPart[];
      data.parts = [parts[1], parts[0], parts[2]];
    })],
    ['part non-record', withData(makeSubmission(), (data) => { data.parts = [null, ...(data.parts as StoredPart[]).slice(1)]; })],
    ['part extra field', withPart(makeSubmission(), (part) => { part.extra = true; })],
    ['part wrong ID', withPart(makeSubmission(), (part) => { part.partId = 'wrong'; })],
    ['part raw roots mismatch', withPart(makeSubmission(), (part) => { part.rawAnswer = [-2, 5]; })],
    ['part raw signs mismatch', withData(makeSubmission(), (data) => {
      const parts = [...(data.parts as StoredPart[])];
      parts[1] = { ...parts[1], rawAnswer: ['+', '-', '+'] };
      data.parts = parts;
    })],
    ['part raw solution mismatch', withData(makeSubmission(), (data) => {
      const parts = [...(data.parts as StoredPart[])];
      parts[2] = { ...parts[2], rawAnswer: 'wrong' };
      data.parts = parts;
    })],
    ['part correctness mismatch', withPart(makeSubmission(), (part) => { part.isCorrect = false; })],
    ['part score mismatch', withPart(makeSubmission(), (part) => { part.score = 0; })],
    ['part max score mismatch', withPart(makeSubmission(), (part) => { part.maxScore = 2; })],
    ['row score mismatch', makeSubmission('guided_practice', { overrides: { score: 0 } })],
    ['row max score mismatch', makeSubmission('guided_practice', { overrides: { maxScore: 2 } })],
    ['row score wrong type', makeSubmission('guided_practice', { overrides: { score: '1' as unknown as number } })],
    ['row score nonfinite', makeSubmission('guided_practice', { overrides: { score: Number.NaN } })],
    ['row score fractional', makeSubmission('guided_practice', { overrides: { score: 0.5 } })],
    ['row max score wrong type', makeSubmission('guided_practice', { overrides: { maxScore: '3' as unknown as number } })],
    ['row max score nonfinite', makeSubmission('guided_practice', { overrides: { maxScore: Number.NaN } })],
    ['nested forbidden answer authority', withData(makeSubmission(), (data) => {
      data.answers = { ...GUIDED_ANSWER, answerKey: 'hidden' };
    })],
  ] as const)('rejects %s with no effects', async (_label, submission) => {
    await expectRejected(submission);
  });
});
