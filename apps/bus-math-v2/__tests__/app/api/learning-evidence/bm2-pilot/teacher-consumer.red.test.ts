import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BM2_LEARNING_EVIDENCE_PILOT,
  BM2_PILOT_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/bm2-pilot';

const mocks = vi.hoisted(() => ({
  calculateScore: vi.fn(),
  fetchInternalMutation: vi.fn(),
  fetchInternalQuery: vi.fn(),
  requireActiveStudentRequestClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireActiveStudentRequestClaims: mocks.requireActiveStudentRequestClaims,
}));

vi.mock('@/lib/assessments/scoring', () => ({
  calculateScore: mocks.calculateScore,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  fetchInternalQuery: mocks.fetchInternalQuery,
  internal: {
    apiRateLimits: {
      checkAndIncrementApiRateLimit: 'internal.apiRateLimits.checkAndIncrementApiRateLimit',
    },
    activities: {
      getActivityById: 'internal.activities.getActivityById',
      submitAssessment: 'internal.activities.submitAssessment',
    },
    learningEvidence: {
      submit: 'internal.learningEvidence.submit',
    },
  },
}));

import { createBm2SubmissionLearningEvidenceHandler } from '@/convex/learningEvidence';

const { POST } = await import('@/app/api/progress/assessment/route');

const LEARNER_ID = 'profiles:bm2-daily-source-student';
const OTHER_LEARNER_ID = 'profiles:bm2-daily-source-other-student';
const SOURCE_DOCUMENT_ID = 'activities:bm2-daily-source-document';
const SUBMISSION_ID = 'activity_submissions:bm2-daily-source-submission';
const SERVER_ATTEMPT_ORDINAL = 7;
const SERVER_SUBMITTED_AT = '2026-08-19T10:15:00.000Z';
const SOURCE = BM2_LEARNING_EVIDENCE_PILOT.mappings[0]!.source;

function makeDailySourceEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: 'practice.v1',
    activityId: SOURCE_DOCUMENT_ID,
    mode: SOURCE.mode,
    status: 'submitted',
    // These browser values are deliberately forged. They cannot order evidence.
    attemptNumber: 999,
    submittedAt: '1999-01-01T00:00:00.000Z',
    answers: { q1: 'Yes', q2: 'Ledger' },
    parts: [
      { partId: 'q1', rawAnswer: 'Yes', score: 99, maxScore: 99, isCorrect: true },
      { partId: 'q2', rawAnswer: 'Ledger', score: 99, maxScore: 99, isCorrect: true },
    ],
    ...overrides,
  };
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/progress/assessment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeStoredTeacherSource(overrides: Record<string, unknown> = {}) {
  return {
    submissionId: SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: SOURCE_DOCUMENT_ID,
    activityStableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
    stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: SERVER_ATTEMPT_ORDINAL,
    submittedAt: Date.parse(SERVER_SUBMITTED_AT),
    submissionData: {
      ...makeDailySourceEnvelope(),
      activityId: SOURCE_DOCUMENT_ID,
      status: 'graded',
    },
    ...overrides,
  };
}

function createConsumerHarness(overrides: Record<string, unknown> = {}) {
  const storedEvidence: Array<Record<string, unknown>> = [];
  const receipts: Array<Record<string, unknown>> = [];
  const masteryBridge = vi.fn(async () => undefined);
  const loadActivitySubmission = vi.fn(async () => makeStoredTeacherSource(overrides));

  const handler = createBm2SubmissionLearningEvidenceHandler({
    evidenceStore: {
      listByLearnerAndNode: async () => [],
      append: async (_learnerId, evidence) => {
        storedEvidence.push(evidence as unknown as Record<string, unknown>);
      },
    },
    receiptStore: {
      findBySubmissionId: async () => null,
      append: async (_learnerId, _submissionId, receipt) => {
        receipts.push(receipt as unknown as Record<string, unknown>);
      },
    },
    loadActivitySubmission,
    masteryBridge,
  });

  return { handler, loadActivitySubmission, masteryBridge, receipts, storedEvidence };
}

describe('BM2 daily teacher-source producer and opaque consumer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalQuery.mockResolvedValue({
      id: SOURCE_DOCUMENT_ID,
      stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
      componentKey: 'comprehension-quiz',
      displayName: 'Unit 1 Lesson 1 Daily Source',
      description: 'Teacher-led daily source activity.',
      gradingConfig: { autoGrade: true, partialCredit: false },
      standardId: 'standards:bm2-daily-source',
      createdAt: SERVER_SUBMITTED_AT,
      updatedAt: SERVER_SUBMITTED_AT,
      props: {
        title: 'Daily source check',
        description: 'Teacher-led source activity.',
        showExplanations: false,
        allowRetry: true,
        questions: [
          {
            id: 'q1',
            text: 'Choose Yes.',
            type: 'multiple-choice',
            options: ['Yes', 'No'],
            correctAnswer: 'Yes',
          },
          {
            id: 'q2',
            text: 'Type Ledger.',
            type: 'short-answer',
            correctAnswer: 'Ledger',
          },
        ],
      },
    });
    mocks.calculateScore.mockReturnValue({
      score: 2,
      maxScore: 2,
      percentage: 100,
      feedback: 'Server score',
    });
    mocks.fetchInternalMutation.mockImplementation(async (reference: unknown) => {
      if (reference === 'internal.apiRateLimits.checkAndIncrementApiRateLimit') {
        return { allowed: true, remaining: 59, windowExpiresAt: Date.now() + 60_000 };
      }
      if (reference === 'internal.activities.submitAssessment') return { id: SUBMISSION_ID };
      if (reference === 'internal.learningEvidence.submit') {
        return {
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
        };
      }
      throw new Error(`Unexpected mutation: ${String(reference)}`);
    });
  });

  it('posts a forged daily source envelope, then delivers only its opaque submission ID to the trusted consumer', async () => {
    const envelope = makeDailySourceEnvelope();
    const request = makeRequest(envelope);
    request.headers.set('Idempotency-Key', envelope.submittedAt);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      'internal.activities.submitAssessment',
      expect.objectContaining({ userId: LEARNER_ID, activityId: SOURCE_DOCUMENT_ID }),
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      3,
      'internal.learningEvidence.submit',
      { learnerId: LEARNER_ID, submissionId: SUBMISSION_ID },
    );
    const consumerInput = mocks.fetchInternalMutation.mock.calls[2]?.[1] as Record<string, unknown>;
    expect(consumerInput).toEqual({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });
    expect(consumerInput).not.toHaveProperty('evidence');
    expect(consumerInput).not.toHaveProperty('activityId');
    expect(consumerInput).not.toHaveProperty('attemptNumber');
    expect(consumerInput).not.toHaveProperty('submittedAt');
  });

  it('uses stored top-level server ordinal and time, not forged browser fields, for teacher evidence', async () => {
    const {
      handler,
      loadActivitySubmission,
      masteryBridge,
      receipts,
      storedEvidence,
    } = createConsumerHarness();

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(loadActivitySubmission).toHaveBeenCalledWith(SUBMISSION_ID);
    expect(result).toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      decision: expect.objectContaining({ reason: 'teacher_led', masteryBearing: false }),
    }));
    expect(storedEvidence).toHaveLength(1);
    expect(storedEvidence[0]).toEqual(expect.objectContaining({
      origin: 'teacher_led',
      activityId: SOURCE.activityId,
      mode: SOURCE.mode,
      attemptOrdinal: SERVER_ATTEMPT_ORDINAL,
      occurredAt: SERVER_SUBMITTED_AT,
    }));
    expect(storedEvidence[0]).not.toHaveProperty('gradedEvidence');
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(receipts).toEqual([expect.objectContaining({ masteryApplied: false, kstApplied: false })]);
  });

  it('rejects an owner mismatch before it creates teacher evidence or KST/SRS effects', async () => {
    const { handler, masteryBridge, receipts, storedEvidence } = createConsumerHarness({
      userId: OTHER_LEARNER_ID,
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID })).resolves.toEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(storedEvidence).toEqual([]);
    expect(receipts).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('rejects a stable source mismatch even when nested browser fields imitate the daily source', async () => {
    const { handler, masteryBridge, receipts, storedEvidence } = createConsumerHarness({
      stableActivityId: 'math.bm2.not-the-daily-source',
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID })).resolves.toEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(storedEvidence).toEqual([]);
    expect(receipts).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('rejects a physical source-row mismatch before it creates teacher evidence or KST/SRS effects', async () => {
    const { handler, masteryBridge, receipts, storedEvidence } = createConsumerHarness({
      activityStableActivityId: 'math.bm2.not-the-daily-source',
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID })).resolves.toEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(storedEvidence).toEqual([]);
    expect(receipts).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('rejects a stored mode mismatch before it creates teacher evidence or KST/SRS effects', async () => {
    const stored = makeStoredTeacherSource();
    const { handler, masteryBridge, receipts, storedEvidence } = createConsumerHarness({
      submissionData: {
        ...(stored.submissionData as Record<string, unknown>),
        mode: 'independent_practice',
      },
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID })).resolves.toEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(storedEvidence).toEqual([]);
    expect(receipts).toEqual([]);
    expect(masteryBridge).not.toHaveBeenCalled();
  });
});
