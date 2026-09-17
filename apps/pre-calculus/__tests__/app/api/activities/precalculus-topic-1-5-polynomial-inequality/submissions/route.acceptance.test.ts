import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
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
      createTopic15PolynomialInequalitySubmission:
        'internal.activities.createTopic15PolynomialInequalitySubmission',
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = 'profiles:precalc-topic-1-5-polynomial-inequality-student';
const IDEMPOTENCY_KEY = 'precalc-topic-1-5-polynomial-inequality-key';
const MUTATION_REFERENCE = 'internal.activities.createTopic15PolynomialInequalitySubmission';

type Mode = 'guided_practice' | 'independent_practice';
type Answers = {
  roots: number[];
  intervalSigns: Array<'+' | '-'>;
  solution: string;
};

const GUIDED_ANSWERS: Answers = {
  roots: [5, -2],
  intervalSigns: ['-', '-', '+'],
  solution: '  (-∞, 5]  ',
};
const INDEPENDENT_ANSWERS: Answers = {
  roots: [2, 1, -3],
  intervalSigns: ['-', '-', '-', '+'],
  solution: ' (1.0, 2) U (-infinity, -3) ',
};
const GUIDED_WRONG_ANSWERS: Answers = {
  roots: [5, -1],
  intervalSigns: ['+', '-', '+'],
  solution: '  (-∞, 5]  ',
};
const FRACTIONAL_GUIDED_ANSWERS: Answers = {
  roots: [5, -2.5],
  intervalSigns: ['-', '-', '+'],
  solution: '  (-∞, 5]  ',
};

const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-5-polynomial-inequality',
  score: 3,
  maxScore: 3,
  attemptOrdinal: 1,
  feedback: '3/3 polynomial-inequality-sign-chart response matched the server rubric.',
} as const;
const WRONG_SERVER_RESULT = {
  ...SERVER_RESULT,
  score: 2,
  feedback: '2/3 polynomial-inequality-sign-chart response matched the server rubric.',
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
  answers: Answers,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-30T00:00:00.000Z',
    answers,
    parts: [
      { partId: 'roots', rawAnswer: answers.roots },
      { partId: 'intervalSigns', rawAnswer: answers.intervalSigns },
      { partId: 'solution', rawAnswer: answers.solution },
    ],
    ...overrides,
  };
}

function makeRequest(body: unknown, key: string | null = IDEMPOTENCY_KEY): Request {
  const headers = new Headers();
  if (key !== null) headers.set('Idempotency-Key', key);
  return new Request(
    'http://localhost/api/activities/precalculus-topic-1-5-polynomial-inequality/submissions',
    { method: 'POST', headers, body: JSON.stringify(body) },
  );
}

async function getPost(): Promise<(request: Request) => Promise<Response>> {
  const route = await import('@/app/api/activities/precalculus-topic-1-5-polynomial-inequality/submissions/route');
  return route.POST;
}

describe('POST /api/activities/precalculus-topic-1-5-polynomial-inequality/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided correct', GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS, SERVER_RESULT],
    ['Independent correct', INDEPENDENT_ACTIVITY_ID, 'independent_practice', INDEPENDENT_ANSWERS, SERVER_RESULT],
    ['Guided wrong but well formed', GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_WRONG_ANSWERS, WRONG_SERVER_RESULT],
    ['Guided fractional root wrong but well formed', GUIDED_ACTIVITY_ID, 'guided_practice', FRACTIONAL_GUIDED_ANSWERS, WRONG_SERVER_RESULT],
  ] as const)('forwards the exact %s raw envelope', async (_label, activityId, mode, answers, result) => {
    const POST = await getPost();
    const submissionData = makeEnvelope(activityId, mode, answers);
    const request = makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `);
    mocks.fetchInternalMutation.mockResolvedValue(result);

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(result);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(MUTATION_REFERENCE, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: IDEMPOTENCY_KEY,
    });
    expect((submissionData.answers as Answers).roots).toBe(answers.roots);
    expect((submissionData.answers as Answers).intervalSigns).toBe(answers.intervalSigns);
    expect((submissionData.answers as Answers).solution).toBe(answers.solution);
    expect((submissionData.parts as Array<Record<string, unknown>>).map((part) => part.rawAnswer))
      .toStrictEqual([answers.roots, answers.intervalSigns, answers.solution]);
    expect(internal).not.toHaveProperty('learningEvidence');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('authenticates with the actual Request before reading headers, body, or calling Convex', async () => {
    const POST = await getPost();
    const json = vi.fn(() => Promise.reject(new Error('body must not be read')));
    const getHeader = vi.fn(() => {
      throw new Error('headers must not be read');
    });
    const request = {
      headers: { get: getHeader },
      json,
    } as unknown as Request;
    const authResponse = new Response('Forbidden', { status: 403 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    await expect(POST(request)).resolves.toBe(authResponse);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(getHeader).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('preserves auth Responses and rejects invalid claims before reading the key or body', async () => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS);
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

  it('requires a trimmed nonblank key and valid JSON before mutation', async () => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS);

    for (const key of [null, '  ']) {
      const response = await POST(makeRequest(body, key));
      expect(response.status).toBe(400);
    }

    const malformed = new Request(
      'http://localhost/api/activities/precalculus-topic-1-5-polynomial-inequality/submissions',
      { method: 'POST', headers: { 'Idempotency-Key': IDEMPOTENCY_KEY }, body: '{' },
    );
    const response = await POST(malformed);
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['extra outer field', (body: Record<string, unknown>) => { body.extra = true; }],
    ['missing outer field', (body: Record<string, unknown>) => { delete body.status; }],
    ['unknown activity', (body: Record<string, unknown>) => { body.activityId = 'unknown'; }],
    ['mismatched mode', (body: Record<string, unknown>) => { body.mode = 'independent_practice'; }],
    ['wrong contract', (body: Record<string, unknown>) => { body.contractVersion = 'practice.v2'; }],
    ['wrong status', (body: Record<string, unknown>) => { body.status = 'graded'; }],
    ['zero attempt', (body: Record<string, unknown>) => { body.attemptNumber = 0; }],
    ['fractional attempt', (body: Record<string, unknown>) => { body.attemptNumber = 1.5; }],
    ['unsafe attempt', (body: Record<string, unknown>) => { body.attemptNumber = Number.MAX_SAFE_INTEGER + 1; }],
    ['non-number attempt', (body: Record<string, unknown>) => { body.attemptNumber = '1'; }],
    ['invalid timestamp', (body: Record<string, unknown>) => { body.submittedAt = 'not-a-date'; }],
    ['non-string timestamp', (body: Record<string, unknown>) => { body.submittedAt = 1; }],
  ] as const)('rejects %s before mutation', async (_label, mutate) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS);
    mutate(body);

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing answer key', {}],
    ['extra answer key', { ...GUIDED_ANSWERS, extra: 1 }],
    ['non-record answers', []],
    ['wrong root count', { ...GUIDED_ANSWERS, roots: [5] }],
    ['non-array roots', { ...GUIDED_ANSWERS, roots: null }],
    ['non-number root', { ...GUIDED_ANSWERS, roots: [5, ' -2'] }],
    ['non-finite root', { ...GUIDED_ANSWERS, roots: [5, Number.NaN] }],
    ['unsafe root', { ...GUIDED_ANSWERS, roots: [5, Number.MAX_SAFE_INTEGER + 1] }],
    ['wrong sign count', { ...GUIDED_ANSWERS, intervalSigns: ['-', '+'] }],
    ['non-array interval signs', { ...GUIDED_ANSWERS, intervalSigns: null }],
    ['invalid sign', { ...GUIDED_ANSWERS, intervalSigns: ['-', '?', '+'] }],
    ['non-string solution', { ...GUIDED_ANSWERS, solution: 5 }],
    ['blank solution', { ...GUIDED_ANSWERS, solution: '   ' }],
  ] as const)('rejects malformed Guided answers: %s', async (_label, answers) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS, { answers });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects malformed Independent answer lengths before mutation', async () => {
    const POST = await getPost();
    const body = makeEnvelope(INDEPENDENT_ACTIVITY_ID, 'independent_practice', INDEPENDENT_ANSWERS, {
      answers: { ...INDEPENDENT_ANSWERS, intervalSigns: ['-', '+', '-'] },
    });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects malformed Independent root lengths before mutation', async () => {
    const POST = await getPost();
    const body = makeEnvelope(INDEPENDENT_ACTIVITY_ID, 'independent_practice', INDEPENDENT_ANSWERS, {
      answers: { ...INDEPENDENT_ANSWERS, roots: [2, 1] },
    });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing parts', []],
    ['extra part', [
      { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots },
      { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
    ]],
    ['non-array parts', null],
    ['wrong part order', [
      { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
      { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
    ]],
    ['wrong part ID', [
      { partId: 'answer', rawAnswer: GUIDED_ANSWERS.roots },
      { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
    ]],
    ['raw roots mismatch', [
      { partId: 'roots', rawAnswer: [-2, 5] },
      { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
    ]],
    ['raw signs mismatch', [
      { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots },
      { partId: 'intervalSigns', rawAnswer: ['+', '-', '+'] },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
    ]],
    ['raw solution mismatch', [
      { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots },
      { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
      { partId: 'solution', rawAnswer: 'wrong' },
    ]],
    ['extra part field', [
      { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots, score: 1 },
      { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
    ]],
    ['non-record part', [null, ...[
      { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
      { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
    ]]],
  ] as const)('rejects malformed parts: %s', async (_label, parts) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS, { parts });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each(AUTHORITY_KEYS)('rejects top-level authority field %s before mutation', async (key) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS, { [key]: 'blocked' });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps only the exact idempotency conflict to 409', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest(
      makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS),
    ));

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
    ['fractional score', { ...SERVER_RESULT, score: 1.5 }],
    ['unsafe score', { ...SERVER_RESULT, score: Number.MAX_SAFE_INTEGER + 1 }],
    ['score above maximum', { ...SERVER_RESULT, score: 4 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 1 }],
    ['zero ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['fractional ordinal', { ...SERVER_RESULT, attemptOrdinal: 1.5 }],
    ['unsafe ordinal', { ...SERVER_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 }],
    ['non-string ordinal', { ...SERVER_RESULT, attemptOrdinal: '1' }],
    ['blank feedback', { ...SERVER_RESULT, feedback: ' ' }],
    ['non-string feedback', { ...SERVER_RESULT, feedback: 1 }],
  ] as const)('returns safe 500 for invalid result: %s', async (_label, result) => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);

    const response = await POST(makeRequest(
      makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS),
    ));

    expect(response.status).toBe(500);
    const responseText = await response.text();
    expect(responseText).not.toContain(JSON.stringify(result));
    expect(responseText).not.toContain('hidden');
  });

  it('returns a safe 500 for non-conflict mutation errors', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('private mutation detail'));

    const response = await POST(makeRequest(
      makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS),
    ));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private mutation detail');
  });
});
