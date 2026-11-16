import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireStudentRequestClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: mocks.requireStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    activities: {
      createPhysicalContextWorkedSubmission: 'internal.activities.createPhysicalContextWorkedSubmission',
    },
    learningEvidence: {
      submitPhysicalContextWorkedSubmission: 'internal.learningEvidence.submitPhysicalContextWorkedSubmission',
    },
  },
}));

import { POST } from '@/app/api/activities/precalculus-physical-context-worked/submissions/route';

const LEARNER_ID = 'profiles:precalc-physical-context-student';
const WORKED_ACTIVITY_ID =
  'math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context.worked_example';
const SUBMISSION_ID = 'activity_submissions:physical-context-worked';
const SERVER_SUBMITTED_AT = '2026-08-19T10:15:00.000Z';
const IDEMPOTENCY_KEY = 'precalc-physical-context-worked-key';

function makeRequest(body: unknown, idempotencyKey = IDEMPOTENCY_KEY): Request {
  return new Request(
    'http://localhost/api/activities/precalculus-physical-context-worked/submissions',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(body),
    },
  );
}

const TEACHER_EVIDENCE_NEW = {
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

const TEACHER_EVIDENCE_REPLAY = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'replay',
  decision: {
    idempotency: 'replay',
    exposureState: 'introduced',
    eligible: false,
    reason: 'teacher_led',
    masteryBearing: false,
  },
};

describe('POST /api/activities/precalculus-physical-context-worked/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockImplementation(async (reference: unknown) => {
      if (reference === 'internal.activities.createPhysicalContextWorkedSubmission') {
        return {
          submissionId: SUBMISSION_ID,
          attemptOrdinal: 2,
          submittedAt: SERVER_SUBMITTED_AT,
        };
      }
      if (reference === 'internal.learningEvidence.submitPhysicalContextWorkedSubmission') {
        return TEACHER_EVIDENCE_NEW;
      }
      throw new Error(`Unexpected mutation: ${String(reference)}`);
    });
  });

  it('stores and consumes one raw Worked selection through opaque server calls', async () => {
    const response = await POST(makeRequest({ selectedOptionId: 'D' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual({
      submissionId: SUBMISSION_ID,
      attemptOrdinal: 2,
      submittedAt: SERVER_SUBMITTED_AT,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      'internal.activities.createPhysicalContextWorkedSubmission',
      expect.objectContaining({
        userId: LEARNER_ID,
        activityId: WORKED_ACTIVITY_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
        submissionData: expect.objectContaining({
          contractVersion: 'practice.v1',
          activityId: WORKED_ACTIVITY_ID,
          mode: 'worked_example',
          status: 'submitted',
          answers: { selectedOptionId: 'D' },
          parts: [{ partId: 'selectedOptionId', rawAnswer: 'D' }],
        }),
      }),
    );
    const createInput = mocks.fetchInternalMutation.mock.calls[0]?.[1] as Record<string, unknown>;
    const submissionData = createInput.submissionData as Record<string, unknown>;
    expect(Object.keys(submissionData).sort()).toEqual([
      'activityId',
      'answers',
      'attemptNumber',
      'contractVersion',
      'mode',
      'parts',
      'status',
      'submittedAt',
    ]);
    expect(submissionData).not.toHaveProperty('score');
    expect(submissionData).not.toHaveProperty('isCorrect');
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      'internal.learningEvidence.submitPhysicalContextWorkedSubmission',
      { learnerId: LEARNER_ID, submissionId: SUBMISSION_ID },
    );
  });

  it('accepts a safe replay result without adding authority fields', async () => {
    mocks.fetchInternalMutation.mockImplementation(async (reference: unknown) => (
      reference === 'internal.activities.createPhysicalContextWorkedSubmission'
        ? { submissionId: SUBMISSION_ID, attemptOrdinal: 2, submittedAt: SERVER_SUBMITTED_AT }
        : TEACHER_EVIDENCE_REPLAY
    ));

    const response = await POST(makeRequest({ selectedOptionId: 'D' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual({
      submissionId: SUBMISSION_ID,
      attemptOrdinal: 2,
      submittedAt: SERVER_SUBMITTED_AT,
    });
  });

  it.each([
    ['missing', undefined],
    ['blank', '   '],
  ])('rejects a %s Idempotency-Key before any mutation', async (_label, key) => {
    const request = key === undefined
      ? new Request('http://localhost/api/activities/precalculus-physical-context-worked/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selectedOptionId: 'D' }),
      })
      : makeRequest({ selectedOptionId: 'D' }, key);

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['malformed JSON', new Request('http://localhost/api/activities/precalculus-physical-context-worked/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': IDEMPOTENCY_KEY },
      body: '{',
    })],
    ['a missing selection', makeRequest({})],
    ['a blank selection', makeRequest({ selectedOptionId: ' ' })],
    ['an extra field', makeRequest({ selectedOptionId: 'D', score: 1 })],
    ['a forged activity field', makeRequest({ selectedOptionId: 'D', activityId: WORKED_ACTIVITY_ID })],
    ['a forged learner field', makeRequest({ selectedOptionId: 'D', learnerId: LEARNER_ID })],
    ['a forged grade field', makeRequest({ selectedOptionId: 'D', isCorrect: true })],
  ])('rejects %s without calling Convex', async (_label, request) => {
    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ error: expect.any(String) }));
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['a teacher role', { sub: LEARNER_ID, role: 'teacher' }],
    ['a missing role', { sub: LEARNER_ID }],
    ['a missing learner claim', { role: 'student' }],
  ])('rejects %s before calling Convex', async (_label, claims) => {
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(claims);

    const response = await POST(makeRequest({ selectedOptionId: 'D' }));

    expect(response.status).toBe('sub' in claims && claims.sub ? 403 : 401);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('passes through an authentication response', async () => {
    const authResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    const response = await POST(makeRequest({ selectedOptionId: 'D' }));

    expect(response).toBe(authResponse);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps the exact idempotency conflict sentinel to 409', async () => {
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest({ selectedOptionId: 'D' }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ error: expect.stringMatching(/idempotency|conflict/i) }));
  });

  it.each([
    ['an incomplete server submission result', { submissionId: SUBMISSION_ID }],
    ['a server submission result with a grade', {
      submissionId: SUBMISSION_ID,
      attemptOrdinal: 2,
      submittedAt: SERVER_SUBMITTED_AT,
      score: 1,
    }],
  ])('returns a safe 500 for %s', async (_label, sourceResult) => {
    mocks.fetchInternalMutation.mockResolvedValueOnce(sourceResult);

    const response = await POST(makeRequest({ selectedOptionId: 'D' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to record the physical-context Worked submission',
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['an incomplete evidence result', { persisted: true }],
    ['an eligible evidence result', {
      ...TEACHER_EVIDENCE_NEW,
      decision: { ...TEACHER_EVIDENCE_NEW.decision, eligible: true },
    }],
    ['a graded evidence result', {
      ...TEACHER_EVIDENCE_NEW,
      masteryApplied: true,
    }],
  ])('returns a safe 500 for %s', async (_label, evidenceResult) => {
    mocks.fetchInternalMutation.mockImplementationOnce(async () => ({
      submissionId: SUBMISSION_ID,
      attemptOrdinal: 2,
      submittedAt: SERVER_SUBMITTED_AT,
    })).mockImplementationOnce(async () => evidenceResult);

    const response = await POST(makeRequest({ selectedOptionId: 'D' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to record the physical-context Worked submission',
    });
  });
});
