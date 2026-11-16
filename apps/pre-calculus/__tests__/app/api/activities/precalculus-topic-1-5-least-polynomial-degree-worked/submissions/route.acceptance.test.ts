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
      createTopic15LeastPolynomialDegreeWorkedSubmission:
        'internal.activities.createTopic15LeastPolynomialDegreeWorkedSubmission',
    },
    learningEvidence: {
      submitTopic15LeastPolynomialDegreeWorkedSubmission:
        'internal.learningEvidence.submitTopic15LeastPolynomialDegreeWorkedSubmission',
    },
  },
}));

import { POST } from '@/app/api/activities/precalculus-topic-1-5-least-polynomial-degree-worked/submissions/route';
import { PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-topic-1-5-least-polynomial-degree-worked-route-student';
const WORKED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID;
const SUBMISSION_ID = 'activity_submissions:topic-1-5-least-polynomial-degree-worked-route';
const IDEMPOTENCY_KEY = 'precalc-topic-1-5-least-polynomial-degree-worked-route-key';
const CREATE_REFERENCE = 'internal.activities.createTopic15LeastPolynomialDegreeWorkedSubmission';
const EVIDENCE_REFERENCE = 'internal.learningEvidence.submitTopic15LeastPolynomialDegreeWorkedSubmission';
const SUBMITTED_AT = '2026-08-30T10:30:00.000Z';

const CREATE_RESULT = {
  submissionId: SUBMISSION_ID,
  attemptOrdinal: 3,
  submittedAt: SUBMITTED_AT,
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

const AUTHORITY_KEYS = [
  'answer', 'answerKey', 'correctAnswer', 'correctAnswers', 'expectedAnswer',
  'grading', 'gradingMetadata', 'normalizedAnswer', 'solution', 'solutions',
  'solutionSteps', 'steps', 'finalAnswer', 'authority', 'isCorrect', 'correctness',
  'score', 'maxScore', 'mastery', 'kst', 'nodeId',
] as const;

function makeEnvelope(
  leastDegree = 5,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId: WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-08-30T10:00:00.000Z',
    answers: { leastDegree },
    parts: [{ partId: 'leastDegree', rawAnswer: leastDegree }],
    ...overrides,
  };
}

function makeRequest(
  body: unknown,
  key: string | null = IDEMPOTENCY_KEY,
  contentType: string | null = 'application/json',
): Request {
  const headers = new Headers();
  if (key !== null) headers.set('Idempotency-Key', key);
  if (contentType !== null) headers.set('content-type', contentType);
  return new Request(
    'http://localhost/api/activities/precalculus-topic-1-5-least-polynomial-degree-worked/submissions',
    { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) },
  );
}

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectKeys(nested, keys);
    });
  }
  return keys;
}

function expectNoAuthority(value: unknown): void {
  const authority = new Set<string>(AUTHORITY_KEYS);
  expect(collectKeys(value).filter((key) => authority.has(key))).toEqual([]);
}

describe('POST /api/activities/precalculus-topic-1-5-least-polynomial-degree-worked/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it('forwards the exact Worked envelope, exposes only the create result, and calls exposure second', async () => {
    const envelope = makeEnvelope();
    const request = makeRequest(envelope, ` ${IDEMPOTENCY_KEY} `);
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: envelope,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
    expect(mocks.fetchInternalMutation.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.fetchInternalMutation.mock.invocationCallOrder[1]);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expectNoAuthority(mocks.fetchInternalMutation.mock.calls);
  });

  it('forwards a finite wrong scalar unchanged and maps producer rejection safely', async () => {
    const envelope = makeEnvelope(4);
    mocks.fetchInternalMutation.mockReset().mockRejectedValueOnce(new Error('private source detail'));

    const response = await POST(makeRequest(envelope));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private source detail');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: envelope,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('authenticates before headers, body, or internal calls', async () => {
    const authResponse = new Response('Unauthorized', { status: 401 });
    const request = makeRequest('{', IDEMPOTENCY_KEY, null);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(request)).resolves.toBe(authResponse);

    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error('private auth detail'));
    const authFailure = await POST(makeRequest('{', IDEMPOTENCY_KEY, null));
    expect(authFailure.status).toBe(500);
    await expect(authFailure.text()).resolves.not.toContain('private auth detail');

    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: 'student' });
    expect((await POST(makeRequest(makeEnvelope()))).status).toBe(401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: '  ', role: 'student' });
    expect((await POST(makeRequest(makeEnvelope()))).status).toBe(401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: 'teacher' });
    expect((await POST(makeRequest(makeEnvelope()))).status).toBe(403);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('requires a trimmed key before JSON parsing and accepts JSON without content type', async () => {
    expect((await POST(makeRequest('{', null, null))).status).toBe(400);
    expect((await POST(makeRequest(makeEnvelope(), '   ', null))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();

    const response = await POST(makeRequest(makeEnvelope(), ` ${IDEMPOTENCY_KEY} `, null));
    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed JSON before mutation', async () => {
    expect((await POST(makeRequest('{'))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['extra outer field', { ...makeEnvelope(), score: 1 }],
    ['missing outer field', makeEnvelope(5, { status: undefined })],
    ['wrong activity', makeEnvelope(5, { activityId: 'wrong.activity' })],
    ['wrong mode', makeEnvelope(5, { mode: 'guided_practice' })],
    ['wrong status', makeEnvelope(5, { status: 'graded' })],
    ['zero attempt', makeEnvelope(5, { attemptNumber: 0 })],
    ['fractional attempt', makeEnvelope(5, { attemptNumber: 1.5 })],
    ['unsafe attempt', makeEnvelope(5, { attemptNumber: Number.MAX_SAFE_INTEGER + 1 })],
    ['non-number attempt', makeEnvelope(5, { attemptNumber: '1' })],
    ['invalid time', makeEnvelope(5, { submittedAt: 'not-a-date' })],
    ['noncanonical time', makeEnvelope(5, { submittedAt: '2026-08-30' })],
    ['non-string time', makeEnvelope(5, { submittedAt: 1 })],
  ] as const)('rejects %s before mutation', async (_label, body) => {
    expect((await POST(makeRequest(body))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each(AUTHORITY_KEYS)('rejects top-level authority field %s before mutation', async (field) => {
    expect((await POST(makeRequest({ ...makeEnvelope(), [field]: true }))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing answers', makeEnvelope(5, { answers: undefined })],
    ['extra answer field', makeEnvelope(5, { answers: { leastDegree: 5, score: 1 } })],
    ['non-record answers', makeEnvelope(5, { answers: null })],
    ['missing leastDegree', makeEnvelope(5, { answers: {} })],
    ['fractional leastDegree', makeEnvelope(4.5)],
    ['unsafe leastDegree', makeEnvelope(Number.MAX_SAFE_INTEGER + 1)],
    ['non-number leastDegree', makeEnvelope(5, { answers: { leastDegree: '5' } })],
    ['missing parts', makeEnvelope(5, { parts: undefined })],
    ['non-array parts', makeEnvelope(5, { parts: {} })],
    ['empty parts', makeEnvelope(5, { parts: [] })],
    ['extra part field', makeEnvelope(5, { parts: [{ partId: 'leastDegree', rawAnswer: 5, score: 1 }] })],
    ['wrong part id', makeEnvelope(5, { parts: [{ partId: 'wrong', rawAnswer: 5 }] })],
    ['fractional raw answer', makeEnvelope(5, { parts: [{ partId: 'leastDegree', rawAnswer: 4.5 }] })],
    ['unsafe raw answer', makeEnvelope(5, { parts: [{ partId: 'leastDegree', rawAnswer: Number.MAX_SAFE_INTEGER + 1 }] })],
    ['non-number raw answer', makeEnvelope(5, { parts: [{ partId: 'leastDegree', rawAnswer: '5' }] })],
    ['mismatched raw answer', makeEnvelope(5, { parts: [{ partId: 'leastDegree', rawAnswer: 4 }] })],
    ['extra part item', makeEnvelope(5, { parts: [{ partId: 'leastDegree', rawAnswer: 5 }, { partId: 'leastDegree', rawAnswer: 5 }] })],
    ['non-record part', makeEnvelope(5, { parts: [null] })],
  ] as const)('rejects %s before mutation', async (_label, body) => {
    expect((await POST(makeRequest(body))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('validates the exact three-key create result before exposure', async () => {
    const invalidResults = [
      { submissionId: '', attemptOrdinal: 3, submittedAt: SUBMITTED_AT },
      { submissionId: 1, attemptOrdinal: 3, submittedAt: SUBMITTED_AT },
      { submissionId: SUBMISSION_ID, attemptOrdinal: 0, submittedAt: SUBMITTED_AT },
      { submissionId: SUBMISSION_ID, attemptOrdinal: 1.5, submittedAt: SUBMITTED_AT },
      { submissionId: SUBMISSION_ID, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1, submittedAt: SUBMITTED_AT },
      { submissionId: SUBMISSION_ID, attemptOrdinal: 3, submittedAt: 'not-a-date' },
      { submissionId: SUBMISSION_ID, attemptOrdinal: 3, submittedAt: '2026-08-30' },
      { submissionId: SUBMISSION_ID, attemptOrdinal: 3, submittedAt: 1 },
      { submissionId: SUBMISSION_ID, attemptOrdinal: 3, submittedAt: SUBMITTED_AT, score: 1 },
      null,
    ];

    for (const result of invalidResults) {
      mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(result);
      const response = await POST(makeRequest(makeEnvelope()));
      expect(response.status).toBe(500);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    }
  });

  it.each([
    ['non-record exposure', null],
    ['extra outer field', { ...EVIDENCE_NEW, extra: true }],
    ['missing outer field', { ...EVIDENCE_NEW, persisted: undefined }],
    ['wrong persisted type', { ...EVIDENCE_NEW, persisted: 'true' }],
    ['wrong mastery flag', { ...EVIDENCE_NEW, masteryApplied: true }],
    ['wrong kst flag', { ...EVIDENCE_NEW, kstApplied: true }],
    ['wrong delivery', { ...EVIDENCE_NEW, delivery: 'bad' }],
    ['wrong idempotency', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, idempotency: 'bad' } }],
    ['wrong exposure state', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, exposureState: 'awaiting_teacher_exposure' } }],
    ['wrong eligibility', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, eligible: true } }],
    ['wrong reason', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, reason: 'eligible' } }],
    ['wrong mastery bearing', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, masteryBearing: true } }],
    ['non-record decision', { ...EVIDENCE_NEW, decision: null }],
    ['extra decision field', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, extra: true } }],
    ['missing decision field', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, reason: undefined } }],
    ['new delivery with replay decision', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, idempotency: 'replay' } }],
    ['replay delivery with new decision', { ...EVIDENCE_REPLAY, delivery: 'new' }],
    ['replay persisted true', { ...EVIDENCE_REPLAY, persisted: true }],
  ] as const)('rejects %s exposure result safely', async (_label, result) => {
    mocks.fetchInternalMutation.mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(result);
    const response = await POST(makeRequest(makeEnvelope()));
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it('accepts a replay exposure result and returns only the create result', async () => {
    mocks.fetchInternalMutation.mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);
    const response = await POST(makeRequest(makeEnvelope()));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
  });

  it('maps only create conflicts to 409 and hides all other failures', async () => {
    mocks.fetchInternalMutation.mockReset().mockRejectedValueOnce(new Error('idempotency_conflict'));
    const conflictResponse = await POST(makeRequest(makeEnvelope()));
    expect(conflictResponse.status).toBe(409);
    await expect(conflictResponse.text()).resolves.not.toContain('idempotency_conflict');

    mocks.fetchInternalMutation.mockReset().mockRejectedValueOnce(new Error('private create detail'));
    const otherResponse = await POST(makeRequest(makeEnvelope()));
    expect(otherResponse.status).toBe(500);
    await expect(otherResponse.text()).resolves.not.toContain('private create detail');
  });

  it('hides exposure failures and performs create before exposure', async () => {
    mocks.fetchInternalMutation.mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error('private exposure detail'));
    const response = await POST(makeRequest(makeEnvelope()));
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private exposure detail');
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REFERENCE, expect.any(Object));
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
  });

  it('retries the same raw Worked envelope and key after exposure failure', async () => {
    const envelope = makeEnvelope();
    const request = makeRequest(envelope, ` ${IDEMPOTENCY_KEY} `);
    mocks.fetchInternalMutation.mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error('private exposure detail'))
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const first = await POST(request);
    expect(first.status).toBe(500);
    const retry = await POST(makeRequest(envelope, ` ${IDEMPOTENCY_KEY} `));
    expect(retry.status).toBe(200);
    await expect(retry.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: envelope,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(3, CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: envelope,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(4, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
  });
});
