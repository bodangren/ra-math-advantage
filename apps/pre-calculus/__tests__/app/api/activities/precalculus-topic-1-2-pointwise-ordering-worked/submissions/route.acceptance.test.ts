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
      createTopic12PointwiseRateOrderingWorkedSubmission:
        'internal.activities.createTopic12PointwiseRateOrderingWorkedSubmission',
    },
    learningEvidence: {
      submitTopic12PointwiseRateOrderingWorkedSubmission:
        'internal.learningEvidence.submitTopic12PointwiseRateOrderingWorkedSubmission',
    },
  },
}));

import { POST } from '@/app/api/activities/precalculus-topic-1-2-pointwise-ordering-worked/submissions/route';

const LEARNER_ID = 'profiles:precalc-topic-1-2-pointwise-ordering-worked-student';
const WORKED_ACTIVITY_ID =
  'math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs.worked_example';
const SUBMISSION_ID = 'activity_submissions:topic-1-2-pointwise-ordering-worked';
const SERVER_SUBMITTED_AT = '2026-08-29T10:15:00.000Z';
const IDEMPOTENCY_KEY = 'precalc-topic-1-2-pointwise-ordering-worked-key';
const CREATE_REFERENCE = 'internal.activities.createTopic12PointwiseRateOrderingWorkedSubmission';
const EVIDENCE_REFERENCE = 'internal.learningEvidence.submitTopic12PointwiseRateOrderingWorkedSubmission';

const CREATE_RESULT = {
  submissionId: SUBMISSION_ID,
  attemptOrdinal: 2,
  submittedAt: SERVER_SUBMITTED_AT,
};

const EVIDENCE_NEW = {
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

const EVIDENCE_REPLAY = {
  ...EVIDENCE_NEW,
  persisted: false,
  delivery: 'replay',
  decision: { ...EVIDENCE_NEW.decision, idempotency: 'replay' },
};

function makeRequest(
  body: unknown,
  idempotencyKey = IDEMPOTENCY_KEY,
  contentType = 'application/json',
): Request {
  return new Request('http://localhost/api/activities/precalculus-topic-1-2-pointwise-ordering-worked/submissions', {
    method: 'POST',
    headers: {
      'content-type': contentType,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/activities/precalculus-topic-1-2-pointwise-ordering-worked/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it('stores and consumes the raw source B,C,A ordering in order', async () => {
    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }, IDEMPOTENCY_KEY, 'application/json; charset=utf-8'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      CREATE_REFERENCE,
      {
        userId: LEARNER_ID,
        activityId: WORKED_ACTIVITY_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
        submissionData: expect.objectContaining({
          contractVersion: 'practice.v1',
          activityId: WORKED_ACTIVITY_ID,
          mode: 'worked_example',
          status: 'submitted',
          answers: { orderedPointIds: ['B', 'C', 'A'] },
          parts: [{ partId: 'orderedPointIds', rawAnswer: ['B', 'C', 'A'] }],
        }),
      },
    );
    const createInput = mocks.fetchInternalMutation.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(Object.keys(createInput)).toEqual(['userId', 'activityId', 'idempotencyKey', 'submissionData']);
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
    expect(JSON.stringify(submissionData)).not.toMatch(/learner|score|correct|answerKey|expected|solution|grade/i);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      EVIDENCE_REFERENCE,
      { learnerId: LEARNER_ID, submissionId: SUBMISSION_ID },
    );
  });

  it('accepts a replay only after validating the replay evidence result', async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['missing', undefined],
    ['blank', '   '],
  ])('rejects a %s Idempotency-Key before any mutation', async (_label, key) => {
    const request = key === undefined
      ? new Request('http://localhost/api/activities/precalculus-topic-1-2-pointwise-ordering-worked/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderedPointIds: ['B', 'C', 'A'] }),
      })
      : makeRequest({ orderedPointIds: ['B', 'C', 'A'] }, key);

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['malformed JSON', new Request('http://localhost/api/activities/precalculus-topic-1-2-pointwise-ordering-worked/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': IDEMPOTENCY_KEY },
      body: '{',
    })],
    ['missing ordering', makeRequest({})],
    ['non-array ordering', makeRequest({ orderedPointIds: 'B,C,A' })],
    ['duplicate label', makeRequest({ orderedPointIds: ['B', 'B', 'A'] })],
    ['unknown label', makeRequest({ orderedPointIds: ['B', 'C', 'D'] })],
    ['short ordering', makeRequest({ orderedPointIds: ['B', 'C'] })],
    ['long ordering', makeRequest({ orderedPointIds: ['B', 'C', 'A', 'D'] })],
    ['wrong permutation', makeRequest({ orderedPointIds: ['A', 'C', 'B'] })],
    ['extra outer field', makeRequest({ orderedPointIds: ['B', 'C', 'A'], score: 1 })],
    ['client activity field', makeRequest({ orderedPointIds: ['B', 'C', 'A'], activityId: WORKED_ACTIVITY_ID })],
    ['client learner field', makeRequest({ orderedPointIds: ['B', 'C', 'A'], learnerId: LEARNER_ID })],
    ['client time field', makeRequest({ orderedPointIds: ['B', 'C', 'A'], submittedAt: SERVER_SUBMITTED_AT })],
    ['client attempt field', makeRequest({ orderedPointIds: ['B', 'C', 'A'], attemptNumber: 1 })],
    ['wrong content type', makeRequest({ orderedPointIds: ['B', 'C', 'A'] }, IDEMPOTENCY_KEY, 'text/plain')],
  ])('rejects %s without calling Convex', async (_label, request) => {
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['a teacher role', { sub: LEARNER_ID, role: 'teacher' }, 403],
    ['a missing role', { sub: LEARNER_ID }, 403],
    ['a missing subject', { role: 'student' }, 401],
    ['a blank subject', { sub: '  ', role: 'student' }, 401],
  ] as const)('rejects %s before calling Convex', async (_label, claims, status) => {
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(claims);

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response.status).toBe(status);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('passes through an authentication response', async () => {
    const authResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response).toBe(authResponse);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns a safe 500 when authentication throws', async () => {
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error('internal auth detail'));

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({ error: 'Unable to authenticate request' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps only the exact idempotency conflict sentinel to 409', async () => {
    mocks.fetchInternalMutation.mockReset().mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ error: expect.stringMatching(/idempotency|conflict/i) }));
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('returns a safe 500 for other mutation errors', async () => {
    mocks.fetchInternalMutation.mockReset().mockRejectedValueOnce(new Error('private backend detail'));

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to record the Topic 1.2 pointwise rate-ordering Worked submission',
    });
  });

  it.each([
    ['incomplete create result', { submissionId: SUBMISSION_ID }],
    ['create result with grade field', { ...CREATE_RESULT, score: 1 }],
    ['create result with extra field', { ...CREATE_RESULT, extra: true }],
    ['blank create submission ID', { ...CREATE_RESULT, submissionId: ' ' }],
    ['invalid create ordinal', { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ['invalid create timestamp', { ...CREATE_RESULT, submittedAt: 'not-a-date' }],
  ])('returns a safe 500 for %s', async (_label, invalidResult) => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(invalidResult);

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to record the Topic 1.2 pointwise rate-ordering Worked submission',
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['evidence rejection', { accepted: false, reason: 'submission_not_found' }],
    ['malformed evidence result', { persisted: true }],
    ['eligible evidence result', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, eligible: true } }],
    ['mastery evidence result', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, masteryBearing: true } }],
    ['inconsistent new persistence', { ...EVIDENCE_NEW, persisted: false }],
    ['inconsistent replay persistence', { ...EVIDENCE_REPLAY, persisted: true }],
    ['inconsistent delivery', { ...EVIDENCE_NEW, delivery: 'replay' }],
  ])('returns a safe 500 when evidence returns %s', async (_label, evidenceResult) => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(evidenceResult);

    const response = await POST(makeRequest({ orderedPointIds: ['B', 'C', 'A'] }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to record the Topic 1.2 pointwise rate-ordering Worked submission',
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });
});
