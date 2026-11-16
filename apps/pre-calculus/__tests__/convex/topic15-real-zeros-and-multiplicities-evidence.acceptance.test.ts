import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';
import { generateTopic15RealZerosAndMultiplicitiesOutput } from '@math-platform/math-content/knowledge-space';

import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionEffect,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from '@/convex/learningEvidence';
import { gradeTopic15RealZerosAndMultiplicities } from '@/lib/practice/topic15-real-zeros-and-multiplicities';
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
  type PrecalculusLearningEvidenceHistoryOptions,
  type PrecalculusLearningEvidenceStore,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'precalc-real-zeros-evidence-learner';
const SUBMITTED_AT = Date.parse('2026-08-30T10:00:00.000Z');
const SUBMITTED_AT_ISO = '2026-08-30T10:00:00.000Z';
const GUIDED_ID = PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ID = PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID;
const WORKED_ID = PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID;

type Mode = 'guided_practice' | 'independent_practice';
type Answers = {
  readonly a: readonly { zero: number; multiplicity: number }[];
  readonly b: readonly { zero: number; multiplicity: number }[];
};

function makeAnswers(seed: number): Answers {
  return generateTopic15RealZerosAndMultiplicitiesOutput(seed).expectedAnswer as Answers;
}

function makeSubmission(
  mode: Mode = 'guided_practice',
  options: {
    answers?: Answers;
    overrides?: Partial<PrecalculusActivitySubmission>;
    dataOverrides?: Record<string, unknown>;
  } = {},
): PrecalculusActivitySubmission {
  const seed = mode === 'guided_practice' ? 1 : 2;
  const stableActivityId = mode === 'guided_practice' ? GUIDED_ID : INDEPENDENT_ID;
  const answers = options.answers ?? makeAnswers(seed);
  const graded = gradeTopic15RealZerosAndMultiplicities(seed, answers);
  return {
    submissionId: `precalc-real-zeros-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-real-zeros-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submittedAt: SUBMITTED_AT,
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
    maxScore: 2,
    gradedAt: SUBMITTED_AT,
    ...{
      createIdempotencyKey: `precalc-real-zeros-${mode}-key`,
      feedback: `${graded.score}/2 real-zero and multiplicity responses matched the server rubric.`,
      createdAt: SUBMITTED_AT,
      updatedAt: SUBMITTED_AT,
    },
    ...options.overrides,
  } as PrecalculusActivitySubmission;
}

class InMemoryEvidenceStore implements PrecalculusLearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  async findByIdempotencyKey(learnerId: string, idempotencyKey: string) {
    return this.events.find((entry) => (
      entry.learnerId === learnerId
      && entry.evidence.idempotencyKey === idempotencyKey
    ))?.evidence ?? null;
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
    _options: PrecalculusLearningEvidenceHistoryOptions,
  ) {
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1, _submissionId?: string) {
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
    nodeId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
    activityId: WORKED_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-30T09:00:00.000Z',
    idempotencyKey: 'precalc-real-zeros-teacher-exposure',
  };
}

function createHarness(submission: PrecalculusActivitySubmission, withTeacherExposure = false) {
  const evidenceStore = new InMemoryEvidenceStore();
  if (withTeacherExposure) evidenceStore.events.push({
    learnerId: LEARNER_ID,
    evidence: makeTeacherExposure(),
  });
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
  evidenceStore.append = async (learnerId, evidence, submissionId) => {
    await originalAppend(learnerId, evidence, submissionId);
    effectOrder.push('evidence');
  };
  return { effectOrder, evidenceStore, handler, masteryBridge, receiptStore };
}

async function expectEnabled(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission, true);

  await expect(handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId })).resolves.toEqual({
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
  const expectedEvidence = {
    contractVersion: 'learning-evidence.v1' as const,
    nodeId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
    activityId: submission.stableActivityId,
    attemptOrdinal: 7,
    origin: 'mastery_advantage' as const,
    mode: submission.submissionData.mode,
    occurredAt: SUBMITTED_AT_ISO,
    gradedEvidence: {
      isCorrect: submission.score === 2,
      score: submission.score,
      maxScore: 2,
    },
    idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
  };
  expect(masteryBridge).toHaveBeenCalledWith({
    learnerId: LEARNER_ID,
    submissionId: submission.submissionId,
    evidence: expectedEvidence,
  });
  expect(evidenceStore.events).toHaveLength(2);
  expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
  expect(receiptStore.receipts.size).toBe(1);
  expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);

  await expect(handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId })).resolves.toEqual({
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
  expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
}

async function expectAwaitingExposure(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission);

  await expect(handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId })).resolves.toEqual({
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

async function expectRejected(submission: PrecalculusActivitySubmission): Promise<void> {
  const { effectOrder, evidenceStore, handler, masteryBridge, receiptStore } = createHarness(submission);

  await expect(handler.process({ learnerId: LEARNER_ID, submissionId: submission.submissionId })).resolves.toEqual({
    accepted: false,
    reason: 'submission_not_found',
  });
  expect(masteryBridge).not.toHaveBeenCalled();
  expect(evidenceStore.events).toEqual([]);
  expect(receiptStore.receipts.size).toBe(0);
  expect(effectOrder).toEqual([]);
}

describe('Topic 1.5 real zeros and multiplicities evidence mapping', () => {
  it('includes the Topic 1.5 node exactly once without duplicate allow-list entries', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => nodeId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('maps trusted %s submissions to the exact node with one replay-safe effect chain', async (_label, mode) => {
    const submission = makeSubmission(mode);
    await expectEnabled(submission);
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('waits for exact teacher exposure for %s without effects', async (_label, mode) => {
    await expectAwaitingExposure(makeSubmission(mode));
  });

  it.each([
    ['full', makeAnswers(1), 2],
    ['partial', { ...makeAnswers(1), b: [{ zero: 0, multiplicity: 3 }, { zero: 5, multiplicity: 1 }] }, 1],
    ['zero', { ...makeAnswers(1), a: [{ zero: -5, multiplicity: 4 }, { zero: 0, multiplicity: 1 }, { zero: 5, multiplicity: 2 }], b: [{ zero: 0, multiplicity: 3 }, { zero: 5, multiplicity: 1 }] }, 0],
  ] as const)('preserves trusted %s score input in exact evidence', async (_label, answers, score) => {
    const submission = makeSubmission('guided_practice', { answers });
    expect(submission.score).toBe(score);
    expect(submission.maxScore).toBe(2);
    await expectEnabled(submission);
  });

  it.each([
    ['cross-paired Guided stable ID with Independent envelope', () => {
      const submission = makeSubmission('guided_practice');
      return {
        ...submission,
        submissionData: { ...submission.submissionData, activityId: INDEPENDENT_ID, mode: 'independent_practice' },
      };
    }],
    ['cross-paired Independent stable ID with Guided envelope', () => {
      const submission = makeSubmission('independent_practice');
      return {
        ...submission,
        submissionData: { ...submission.submissionData, activityId: GUIDED_ID, mode: 'guided_practice' },
      };
    }],
    ['Guided identity with Independent mode', () => {
      const submission = makeSubmission('guided_practice');
      return { ...submission, submissionData: { ...submission.submissionData, mode: 'independent_practice' } };
    }],
    ['Independent identity with Guided mode', () => {
      const submission = makeSubmission('independent_practice');
      return { ...submission, submissionData: { ...submission.submissionData, mode: 'guided_practice' } };
    }],
    ['Worked identity', () => {
      const submission = makeSubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: WORKED_ID,
        submissionData: { ...submission.submissionData, activityId: WORKED_ID, mode: 'worked_example' },
      };
    }],
    ['unknown identity', () => {
      const submission = makeSubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: 'math.precalc.skill.test-only.unknown.guided_practice',
        submissionData: { ...submission.submissionData, activityId: 'math.precalc.skill.test-only.unknown.guided_practice' },
      };
    }],
  ] as const)('rejects %s before persistence', async (_label, makeRejectedSubmission) => {
    await expectRejected(makeRejectedSubmission());
  });

  it.each([
    ['foreign learner', () => makeSubmission('guided_practice', { overrides: { userId: 'other-learner' } })],
    ['wrong mastery contract', () => makeSubmission('guided_practice', { overrides: { masteryContractVersion: 'legacy.learning-evidence.v1' } })],
    ['missing attempt ordinal', () => makeSubmission('guided_practice', { overrides: { attemptOrdinal: undefined } })],
    ['non-number attempt ordinal', () => makeSubmission('guided_practice', { overrides: { attemptOrdinal: '7' as unknown as number } })],
    ['zero attempt ordinal', () => makeSubmission('guided_practice', { overrides: { attemptOrdinal: 0 } })],
    ['fractional attempt ordinal', () => makeSubmission('guided_practice', { overrides: { attemptOrdinal: 1.5 } })],
    ['non-finite attempt ordinal', () => makeSubmission('guided_practice', { overrides: { attemptOrdinal: Number.NaN } })],
    ['missing envelope attempt', () => makeSubmission('guided_practice', { dataOverrides: { attemptNumber: undefined } })],
    ['non-number envelope attempt', () => makeSubmission('guided_practice', { dataOverrides: { attemptNumber: '7' } })],
    ['zero envelope attempt', () => makeSubmission('guided_practice', { dataOverrides: { attemptNumber: 0 } })],
    ['fractional envelope attempt', () => makeSubmission('guided_practice', { dataOverrides: { attemptNumber: 1.5 } })],
    ['mismatched envelope attempt', () => makeSubmission('guided_practice', { dataOverrides: { attemptNumber: 6 } })],
    ['non-string envelope time', () => makeSubmission('guided_practice', { dataOverrides: { submittedAt: 123 } })],
    ['invalid envelope time', () => makeSubmission('guided_practice', { dataOverrides: { submittedAt: 'not-a-time' } })],
    ['mismatched envelope time', () => makeSubmission('guided_practice', { dataOverrides: { submittedAt: '2026-08-30T10:01:00.000Z' } })],
    ['missing stored submitted time', () => makeSubmission('guided_practice', { overrides: { submittedAt: undefined } })],
    ['non-number stored submitted time', () => makeSubmission('guided_practice', { overrides: { submittedAt: '123' as unknown as number } })],
    ['non-finite stored submitted time', () => makeSubmission('guided_practice', { overrides: { submittedAt: Number.NaN } })],
    ['missing graded time', () => makeSubmission('guided_practice', { overrides: { gradedAt: undefined } })],
    ['non-number graded time', () => makeSubmission('guided_practice', { overrides: { gradedAt: '123' as unknown as number } })],
    ['non-finite graded time', () => makeSubmission('guided_practice', { overrides: { gradedAt: Number.NaN } })],
    ['mismatched graded time', () => makeSubmission('guided_practice', { overrides: { gradedAt: SUBMITTED_AT + 1_000 } })],
    ['non-record submission data', () => ({ ...makeSubmission('guided_practice'), submissionData: null } as unknown as PrecalculusActivitySubmission)],
    ['non-array parts', () => makeSubmission('guided_practice', { dataOverrides: { parts: {} } })],
    ['wrong contract', () => makeSubmission('guided_practice', { dataOverrides: { contractVersion: 'wrong' } })],
    ['ungraded status', () => makeSubmission('guided_practice', { dataOverrides: { status: 'submitted' } })],
    ['missing score', () => makeSubmission('guided_practice', { overrides: { score: undefined } })],
    ['non-number score', () => makeSubmission('guided_practice', { overrides: { score: '2' as unknown as number } })],
    ['non-finite score', () => makeSubmission('guided_practice', { overrides: { score: Number.NaN } })],
    ['negative score', () => makeSubmission('guided_practice', { overrides: { score: -1 } })],
    ['fractional score', () => makeSubmission('guided_practice', { overrides: { score: 1.5 } })],
    ['above-maximum score', () => makeSubmission('guided_practice', { overrides: { score: 3 } })],
    ['missing max score', () => makeSubmission('guided_practice', { overrides: { maxScore: undefined } })],
    ['non-number max score', () => makeSubmission('guided_practice', { overrides: { maxScore: '2' as unknown as number } })],
    ['non-finite max score', () => makeSubmission('guided_practice', { overrides: { maxScore: Number.NaN } })],
    ['zero max score', () => makeSubmission('guided_practice', { overrides: { maxScore: 0 } })],
    ['negative max score', () => makeSubmission('guided_practice', { overrides: { maxScore: -1 } })],
    ['fractional max score', () => makeSubmission('guided_practice', { overrides: { maxScore: 1.5 } })],
    ['wrong positive max score', () => makeSubmission('guided_practice', { overrides: { maxScore: 1 } })],
  ] as const)('rejects stored %s before persistence', async (_label, makeRejectedSubmission) => {
    await expectRejected(makeRejectedSubmission());
  });
});
