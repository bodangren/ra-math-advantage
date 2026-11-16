import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { internal } from '@/lib/convex/server';

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
      createTopic15LeastPolynomialDegreeSubmission:
        'internal.activities.createTopic15LeastPolynomialDegreeSubmission',
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = 'profiles:precalc-topic-1-5-least-polynomial-degree-student';
const IDEMPOTENCY_KEY = 'precalc-topic-1-5-least-polynomial-degree-key';
const MUTATION_REFERENCE = 'internal.activities.createTopic15LeastPolynomialDegreeSubmission';

type Mode = 'guided_practice' | 'independent_practice';

const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-5-least-polynomial-degree',
  score: 1,
  maxScore: 1,
  attemptOrdinal: 1,
  feedback: '1/1 least-polynomial-degree response matched the server rubric.',
} as const;

const AUTHORITY_KEYS = [
  'answer',
  'answerKey',
  'correctAnswer',
  'correctAnswers',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'normalizedAnswer',
  'solution',
  'solutionSteps',
  'steps',
  'finalAnswer',
  'authority',
  'isCorrect',
  'correctness',
  'score',
  'maxScore',
] as const;

function makeEnvelope(
  activityId: string,
  mode: Mode,
  leastDegree: number,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 4,
    submittedAt: '2026-08-30T00:00:00.000Z',
    answers: { leastDegree },
    parts: [{ partId: 'leastDegree', rawAnswer: leastDegree }],
    ...overrides,
  };
}

function makeRequest(
  body: unknown,
  idempotencyKey: string | null = IDEMPOTENCY_KEY,
  contentType: string | null = 'application/json',
): Request {
  const headers = new Headers();
  if (contentType) headers.set('content-type', contentType);
  if (idempotencyKey !== null) headers.set('Idempotency-Key', idempotencyKey);
  return new Request(
    'http://localhost/api/activities/precalculus-topic-1-5-least-polynomial-degree/submissions',
    { method: 'POST', headers, body: JSON.stringify(body) },
  );
}

async function getPost(): Promise<(request: Request) => Promise<Response>> {
  const route = await import('@/app/api/activities/precalculus-topic-1-5-least-polynomial-degree/submissions/route');
  return route.POST;
}

describe('POST /api/activities/precalculus-topic-1-5-least-polynomial-degree/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided correct', GUIDED_ACTIVITY_ID, 'guided_practice', 5],
    ['Independent correct', INDEPENDENT_ACTIVITY_ID, 'independent_practice', 4],
    ['Guided wrong finite integer', GUIDED_ACTIVITY_ID, 'guided_practice', 6],
  ] as const)('forwards the exact %s envelope', async (_label, activityId, mode, leastDegree) => {
    const POST = await getPost();
    const submissionData = makeEnvelope(activityId, mode, leastDegree);
    const request = makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `);
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(MUTATION_REFERENCE, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: IDEMPOTENCY_KEY,
    });
    expect((submissionData.answers as Record<string, unknown>).leastDegree).toBe(leastDegree);
    expect((submissionData.parts as Array<Record<string, unknown>>)[0]!.rawAnswer).toBe(leastDegree);
    expect(JSON.stringify(submissionData)).not.toMatch(
      /answerKey|correctAnswer|expectedAnswer|grading|score|maxScore|solution|authority/,
    );
    expect(internal).not.toHaveProperty('learningEvidence');
  });

  it('authenticates before reading the body or calling the mutation', async () => {
    const POST = await getPost();
    const json = vi.fn(() => Promise.reject(new Error('body must not be read')));
    const request = {
      headers: new Headers({ 'Idempotency-Key': IDEMPOTENCY_KEY }),
      json,
    } as unknown as Request;
    const authResponse = new Response('Forbidden', { status: 403 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    await expect(POST(request)).resolves.toBe(authResponse);
    expect(json).not.toHaveBeenCalled();
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('passes through auth responses and rejects invalid claims before mutation', async () => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5);
    const authResponse = new Response('Forbidden', { status: 403 });

    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(body))).resolves.toBe(authResponse);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: 'student' });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty('status', 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: '  ', role: 'student' });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty('status', 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: 'teacher' });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty('status', 403);
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error('private auth detail'));
    const errorResponse = await POST(makeRequest(body));
    expect(errorResponse.status).toBe(500);
    await expect(errorResponse.text()).resolves.not.toContain('private auth detail');
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects a missing or blank key and malformed JSON before mutation', async () => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5);

    for (const key of [null, '  ']) {
      const response = await POST(makeRequest(body, key));
      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    }

    const malformed = new Request(
      'http://localhost/api/activities/precalculus-topic-1-5-least-polynomial-degree/submissions',
      {
        method: 'POST',
        headers: { 'Idempotency-Key': IDEMPOTENCY_KEY },
        body: '{',
      },
    );
    const response = await POST(malformed);
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['extra outer field', { score: 1 }],
    ['missing outer field', { status: undefined }],
    ['unknown activity', { activityId: 'math.precalc.skill.1.5.unknown.independent_practice', mode: 'independent_practice' }],
    ['Worked activity', { activityId: 'math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs.worked_example' }],
    ['mismatched mode', { activityId: GUIDED_ACTIVITY_ID, mode: 'independent_practice' }],
    ['wrong contract', { contractVersion: 'practice.v2' }],
    ['wrong status', { status: 'graded' }],
    ['zero attempt', { attemptNumber: 0 }],
    ['fractional attempt', { attemptNumber: 1.5 }],
    ['unsafe attempt', { attemptNumber: Number.MAX_SAFE_INTEGER + 1 }],
    ['non-number attempt', { attemptNumber: '1' }],
    ['invalid timestamp', { submittedAt: 'not-a-date' }],
    ['non-string timestamp', { submittedAt: 1 }],
  ] as const)('rejects %s before the mutation', async (_label, overrides) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5, overrides);
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing answer key', {}],
    ['extra answer key', { leastDegree: 5, extra: 1 }],
    ['non-record answers', []],
    ['non-number answer', { leastDegree: '5' }],
    ['non-finite answer', { leastDegree: Number.NaN }],
    ['fractional answer', { leastDegree: 4.5 }],
    ['unsafe answer', { leastDegree: Number.MAX_SAFE_INTEGER + 1 }],
  ] as const)('rejects %s before the mutation', async (_label, answers) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5, { answers });
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing part', []],
    ['extra part', [
      { partId: 'leastDegree', rawAnswer: 5 },
      { partId: 'leastDegree', rawAnswer: 5 },
    ]],
    ['non-array parts', null],
    ['wrong part ID', [{ partId: 'wrong', rawAnswer: 5 }]],
    ['missing part field', [{ partId: 'leastDegree' }]],
    ['extra part field', [{ partId: 'leastDegree', rawAnswer: 5, score: 1 }]],
    ['mismatched raw part', [{ partId: 'leastDegree', rawAnswer: 6 }]],
    ['non-number raw part', [{ partId: 'leastDegree', rawAnswer: '5' }]],
    ['non-record part', [null]],
  ] as const)('rejects %s before the mutation', async (_label, parts) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5, { parts });
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each(AUTHORITY_KEYS)('rejects top-level authority field %s before the mutation', async (authorityKey) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5, { [authorityKey]: 'blocked' });
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps only the exact idempotency conflict to 409', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));
    const response = await POST(makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5)));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Idempotency key was already used for a different submission',
    });
  });

  it.each([
    ['non-object result', null],
    ['extra result field', { ...SERVER_RESULT, hidden: true }],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['non-string submission ID', { ...SERVER_RESULT, submissionId: 1 }],
    ['negative score', { ...SERVER_RESULT, score: -1 }],
    ['fractional score', { ...SERVER_RESULT, score: 0.5 }],
    ['score above maximum', { ...SERVER_RESULT, score: 2 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 2 }],
    ['zero ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['fractional ordinal', { ...SERVER_RESULT, attemptOrdinal: 1.5 }],
    ['unsafe ordinal', { ...SERVER_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 }],
    ['non-string ordinal', { ...SERVER_RESULT, attemptOrdinal: '1' }],
    ['non-string feedback', { ...SERVER_RESULT, feedback: 1 }],
  ] as const)('returns safe 500 for %s', async (_label, result) => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);
    const response = await POST(makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5)));

    expect(response.status).toBe(500);
    const responseText = await response.text();
    expect(responseText).not.toContain(JSON.stringify(result));
    expect(responseText).not.toContain('hidden');
  });

  it('returns a safe 500 for non-conflict mutation errors', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('private mutation detail'));
    const response = await POST(makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 5)));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private mutation detail');
  });
});
