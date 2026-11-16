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
      createTopic13RatePatternClassificationWorkedSubmission:
        'internal.activities.createTopic13RatePatternClassificationWorkedSubmission',
    },
    learningEvidence: {
      submitTopic13RatePatternClassificationWorkedSubmission:
        'internal.learningEvidence.submitTopic13RatePatternClassificationWorkedSubmission',
    },
  },
}));

import { POST } from '@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification-worked/submissions/route';
import { generateTopic13RatePatternClassificationOutput } from '@math-platform/math-content/knowledge-space';

const LEARNER_ID = 'profiles:precalc-rate-pattern-worked-route-student';
const WORKED_ACTIVITY_ID = 'math.precalc.skill.1.3.classify-linear-vs-quadratic-from-rate-patterns.worked_example';
const SUBMISSION_ID = 'activity_submissions:rate-pattern-worked-route';
const SERVER_SUBMITTED_AT = '2026-08-29T10:30:00.000Z';
const IDEMPOTENCY_KEY = 'precalc-rate-pattern-worked-route-key';
const CREATE_REFERENCE = 'internal.activities.createTopic13RatePatternClassificationWorkedSubmission';
const EVIDENCE_REFERENCE = 'internal.learningEvidence.submitTopic13RatePatternClassificationWorkedSubmission';

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

type Answers = {
  a: string;
  b: string;
  c: string;
};

function sourceAnswers(): Answers {
  return generateTopic13RatePatternClassificationOutput(0).expectedAnswer as Answers;
}

function makeRequest(body: unknown, key = IDEMPOTENCY_KEY, contentType = 'application/json') {
  return new Request(
    'http://localhost/api/activities/precalculus-topic-1-3-rate-pattern-classification-worked/submissions',
    {
      method: 'POST',
      headers: { 'content-type': contentType, 'Idempotency-Key': key },
      body: JSON.stringify(body),
    },
  );
}

function makeMalformedJsonRequest(key = IDEMPOTENCY_KEY) {
  return new Request(
    'http://localhost/api/activities/precalculus-topic-1-3-rate-pattern-classification-worked/submissions',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': key },
      body: '{',
    },
  );
}

function makeRequestWithoutIdempotencyKey(body: unknown) {
  return new Request(
    'http://localhost/api/activities/precalculus-topic-1-3-rate-pattern-classification-worked/submissions',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
}

describe('POST /api/activities/precalculus-topic-1-3-rate-pattern-classification-worked/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it.each([
    ['source', sourceAnswers()],
    ['alternative raw', { a: 'linear', b: 'neither', c: 'cannot_determine' }],
  ] as const)('forwards the %s classifications without client grading', async (_label, answers) => {
    expect(sourceAnswers()).toStrictEqual({ a: 'quadratic', b: 'linear', c: 'quadratic' });
    const response = await POST(makeRequest(answers));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      CREATE_REFERENCE,
      expect.objectContaining({
        userId: LEARNER_ID,
        activityId: WORKED_ACTIVITY_ID,
        idempotencyKey: IDEMPOTENCY_KEY,
      }),
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      EVIDENCE_REFERENCE,
      { learnerId: LEARNER_ID, submissionId: SUBMISSION_ID },
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
    expect(submissionData.activityId).toBe(WORKED_ACTIVITY_ID);
    expect(submissionData.contractVersion).toBe('practice.v1');
    expect(submissionData.mode).toBe('worked_example');
    expect(submissionData.status).toBe('submitted');
    expect(submissionData.attemptNumber).toBe(1);
    expect(typeof submissionData.submittedAt).toBe('string');
    expect(Number.isFinite(Date.parse(submissionData.submittedAt as string))).toBe(true);
    expect(submissionData.answers).toStrictEqual(answers);
    expect(submissionData.parts).toStrictEqual([
      { partId: 'a', rawAnswer: answers.a },
      { partId: 'b', rawAnswer: answers.b },
      { partId: 'c', rawAnswer: answers.c },
    ]);
    expect(createInput).not.toHaveProperty('learnerId');
    expect(submissionData).not.toHaveProperty('correctClassifications');
    expect(submissionData).not.toHaveProperty('expectedAnswer');
    expect(submissionData).not.toHaveProperty('score');
    expect(submissionData).not.toHaveProperty('solutionSteps');
  });

  it('accepts a replay teacher-led result and calls both mutations once', async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['missing', makeRequestWithoutIdempotencyKey(sourceAnswers())],
    ['blank', makeRequest(sourceAnswers(), '   ')],
  ])('rejects a %s Idempotency-Key before both mutations', async (_label, request) => {
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['wrong content type', makeRequest(sourceAnswers(), IDEMPOTENCY_KEY, 'text/plain')],
    ['missing a', makeRequest({ b: 'cannot_determine', c: 'quadratic' })],
    ['missing b', makeRequest({ a: 'quadratic', c: 'quadratic' })],
    ['missing c', makeRequest({ a: 'quadratic', b: 'cannot_determine' })],
    ['extra field', makeRequest({ ...sourceAnswers(), score: 3 })],
    ['non-string value', makeRequest({ ...sourceAnswers(), a: 1 })],
    ['invalid value', makeRequest({ ...sourceAnswers(), a: 'Quadratic' })],
    ['blank value', makeRequest({ ...sourceAnswers(), a: ' ' })],
    ['array body', makeRequest([sourceAnswers()])],
  ])('rejects %s without calling either mutation', async (_label, request) => {
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON before calling either mutation', async () => {
    const response = await POST(makeMalformedJsonRequest());

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['teacher claims', { sub: LEARNER_ID, role: 'teacher' }, 403],
    ['missing role', { sub: LEARNER_ID }, 403],
    ['missing subject', { role: 'student' }, 401],
    ['blank subject', { sub: '  ', role: 'student' }, 401],
  ] as const)('rejects %s before calling either mutation', async (_label, claims, status) => {
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(claims);

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(status);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('passes through an authentication Response', async () => {
    const authResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response).toBe(authResponse);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns a safe 500 when authentication throws', async () => {
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error('secret auth detail'));

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('secret auth detail');
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps only the exact idempotency conflict sentinel to 409', async () => {
    mocks.fetchInternalMutation.mockReset().mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(409);
    await expect(response.text()).resolves.not.toContain('idempotency_conflict');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('does not map an evidence idempotency conflict to 409', async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('idempotency_conflict');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it('returns a safe 500 for other create errors', async () => {
    mocks.fetchInternalMutation.mockReset().mockRejectedValueOnce(new Error('private backend detail'));

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private backend detail');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['missing create result', { submissionId: SUBMISSION_ID, attemptOrdinal: 2 }],
    ['extra create field', { ...CREATE_RESULT, score: 1 }],
    ['blank create ID', { ...CREATE_RESULT, submissionId: ' ' }],
    ['invalid create ordinal', { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ['invalid create timestamp', { ...CREATE_RESULT, submittedAt: 'not-a-date' }],
  ])('returns a safe 500 for %s without calling evidence', async (_label, result) => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(result);

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['rejected evidence', { accepted: false, reason: 'submission_not_found' }],
    ['malformed evidence', { persisted: true }],
    ['eligible evidence', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, eligible: true } }],
    ['mastery evidence', { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, masteryBearing: true } }],
    ['inconsistent new persistence', { ...EVIDENCE_NEW, persisted: false }],
    ['inconsistent replay persistence', { ...EVIDENCE_REPLAY, persisted: true }],
    ['inconsistent delivery', { ...EVIDENCE_NEW, delivery: 'replay' }],
  ])('returns a safe 500 for %s', async (_label, evidenceResult) => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(evidenceResult);

    const response = await POST(makeRequest(sourceAnswers()));

    expect(response.status).toBe(500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it('does not call evidence when create returns an invalid result', async () => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce({ submissionId: SUBMISSION_ID });

    await POST(makeRequest(sourceAnswers()));

    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });
});
