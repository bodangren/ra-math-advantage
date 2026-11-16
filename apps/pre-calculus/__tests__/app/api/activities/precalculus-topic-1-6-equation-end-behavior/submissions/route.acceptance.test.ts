import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

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
      createTopic16EquationEndBehaviorSubmission:
        'internal.activities.createTopic16EquationEndBehaviorSubmission',
    },
  },
}));

const ROUTE_URL =
  'http://localhost/api/activities/precalculus-topic-1-6-equation-end-behavior/submissions';
const ROUTE_MODULE =
  '@/app/api/activities/precalculus-topic-1-6-equation-end-behavior/submissions/route';
const CREATE_REF = 'internal.activities.createTopic16EquationEndBehaviorSubmission';
const LEARNER_ID = 'profiles:topic16-equation-end-behavior-route';
const IDEMPOTENCY_KEY = 'topic16-equation-end-behavior-route-key';
const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;
const PART_IDS = [
  'a_leftEnd',
  'a_rightEnd',
  'b_leftEnd',
  'b_rightEnd',
  'c_leftEnd',
  'c_rightEnd',
  'd_leftEnd',
  'd_rightEnd',
  'e_leftEnd',
  'e_rightEnd',
  'f_leftEnd',
  'f_rightEnd',
] as const;
type PartId = typeof PART_IDS[number];
type Answers = Record<PartId, unknown>;

const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic16-equation-end-behavior',
  score: 12,
  maxScore: 12,
  attemptOrdinal: 1,
  feedback: '12/12 polynomial equation end-behavior responses matched the server rubric.',
} as const;
const ZERO_SERVER_RESULT = {
  ...SERVER_RESULT,
  score: 0,
  feedback: '0/12 polynomial equation end-behavior responses matched the server rubric.',
} as const;

function sourceAnswers(seed: number): Answers {
  return generateTopic16EquationEndBehaviorOutput(seed).expectedAnswer as Answers;
}

function makeEnvelope(
  activityId: string,
  mode: 'guided_practice' | 'independent_practice',
  answers: Answers,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 17,
    submittedAt: '2026-08-30T00:00:00.000Z',
    answers,
    parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

function makeRequest(body: unknown, key: string | null = IDEMPOTENCY_KEY): Request {
  const headers = new Headers();
  if (key !== null) headers.set('Idempotency-Key', key);
  return new Request(ROUTE_URL, { method: 'POST', headers, body: JSON.stringify(body) });
}

async function getPost(): Promise<(request: Request) => Promise<Response>> {
  const route = await vi.importActual<{ POST: (request: Request) => Promise<Response> }>(ROUTE_MODULE);
  return route.POST;
}

async function expectSafeError(response: Response, status: number) {
  expect(response.status).toBe(status);
  const text = await response.text();
  expect(text).not.toContain('private');
  expect(text).not.toContain('activity_submissions');
  expect(text).not.toContain('learning-evidence');
  expect(text).not.toContain('correctAnswer');
  expect(text).not.toContain('expectedAnswer');
}

function expectExactEnvelope(body: Record<string, unknown>) {
  expect(Object.keys(body).sort()).toStrictEqual([
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ]);
  expect(Object.keys(body.answers as object).sort()).toStrictEqual([...PART_IDS].sort());
  const parts = body.parts as Array<Record<string, unknown>>;
  expect(parts.map((part) => part.partId)).toStrictEqual(PART_IDS);
  for (const part of parts) {
    expect(Object.keys(part).sort()).toStrictEqual(['partId', 'rawAnswer']);
  }
}

describe('POST /api/activities/precalculus-topic-1-6-equation-end-behavior/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided seed 1', GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1)],
    ['Independent seed 2', INDEPENDENT_ACTIVITY_ID, 'independent_practice', sourceAnswers(2)],
  ] as const)('forwards the exact %s raw envelope with one mutation call', async (_label, activityId, mode, answers) => {
    const POST = await getPost();
    const submissionData = makeEnvelope(activityId, mode, answers);
    const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expectExactEnvelope(submissionData);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(CREATE_REF, {
      userId: LEARNER_ID,
      activityId,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData,
    });
  });

  it('preserves a well-formed wrong answer without route grading', async () => {
    const POST = await getPost();
    const answers = sourceAnswers(1);
    const wrongAnswers = {
      ...answers,
      a_leftEnd: answers.a_leftEnd === 'up' ? 'down' : 'up',
    };
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', wrongAnswers);
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      ...SERVER_RESULT,
      score: 11,
      feedback: '11/12 polynomial equation end-behavior responses matched the server rubric.',
    });

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual({
      ...SERVER_RESULT,
      score: 11,
      feedback: '11/12 polynomial equation end-behavior responses matched the server rubric.',
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(CREATE_REF, {
      userId: LEARNER_ID,
      activityId: GUIDED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData,
    });
    expect((submissionData.answers as Answers).a_leftEnd).toBe(wrongAnswers.a_leftEnd);
  });

  it('accepts a valid score-0 server result', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(ZERO_SERVER_RESULT);
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1));

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(ZERO_SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('authenticates with the actual Request before reading headers or body', async () => {
    const POST = await getPost();
    const json = vi.fn(() => Promise.reject(new Error('body must not be read')));
    const getHeader = vi.fn(() => { throw new Error('headers must not be read'); });
    const request = { headers: { get: getHeader }, json } as unknown as Request;
    const authResponse = new Response('Signed out', { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    await expect(POST(request)).resolves.toBe(authResponse);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(getHeader).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('preserves auth Responses and rejects invalid claims before mutation', async () => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1));
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
    await expectSafeError(await POST(makeRequest(body)), 500);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing key', null],
    ['blank key', '   '],
  ] as const)('rejects %s before body parsing or mutation', async (_label, key) => {
    const POST = await getPost();
    const request = makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1)), key);
    const json = vi.spyOn(request, 'json');

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(json).not.toHaveBeenCalled();
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON safely before mutation', async () => {
    const POST = await getPost();
    const request = new Request(ROUTE_URL, {
      method: 'POST',
      headers: { 'Idempotency-Key': IDEMPOTENCY_KEY },
      body: '{',
    });

    await expectSafeError(await POST(request), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['extra outer field', (body: Record<string, unknown>) => { body.extra = true; }],
    ['missing outer field', (body: Record<string, unknown>) => { delete body.parts; }],
    ['wrong contract', (body: Record<string, unknown>) => { body.contractVersion = 'practice.v2'; }],
    ['wrong activity', (body: Record<string, unknown>) => { body.activityId = 'activity:wrong'; }],
    ['wrong mode', (body: Record<string, unknown>) => { body.mode = 'independent_practice'; }],
    ['wrong status', (body: Record<string, unknown>) => { body.status = 'graded'; }],
    ['zero attempt', (body: Record<string, unknown>) => { body.attemptNumber = 0; }],
    ['fractional attempt', (body: Record<string, unknown>) => { body.attemptNumber = 1.5; }],
    ['unsafe attempt', (body: Record<string, unknown>) => { body.attemptNumber = Number.MAX_SAFE_INTEGER + 1; }],
    ['non-number attempt', (body: Record<string, unknown>) => { body.attemptNumber = '1'; }],
    ['invalid timestamp', (body: Record<string, unknown>) => { body.submittedAt = 'not-a-date'; }],
    ['non-string timestamp', (body: Record<string, unknown>) => { body.submittedAt = 1; }],
  ] as const)('rejects malformed outer envelope: %s', async (_label, mutate) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1));
    mutate(body);

    await expectSafeError(await POST(makeRequest(body)), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing answer key', {}],
    ['extra answer key', { ...sourceAnswers(1), extra: 'up' }],
    ['non-record answers', null],
    ['wrong answer value', { ...sourceAnswers(1), a_leftEnd: 'UP' }],
    ['answer authority field', { ...sourceAnswers(1), answerKey: 'up' }],
  ] as const)('rejects malformed answers: %s', async (_label, answers) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1));
    body.answers = answers;

    await expectSafeError(await POST(makeRequest(body)), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing parts', undefined],
    ['non-array parts', {}],
    ['wrong part count', [{ partId: PART_IDS[0], rawAnswer: 'up' }]],
    ['wrong part order', [
      { partId: PART_IDS[1], rawAnswer: 'up' },
      { partId: PART_IDS[0], rawAnswer: 'up' },
      ...PART_IDS.slice(2).map((partId) => ({ partId, rawAnswer: 'up' })),
    ]],
    ['wrong part ID', PART_IDS.map((partId, index) => ({
      partId: index === 0 ? 'wrong_part' : partId,
      rawAnswer: 'up',
    }))],
    ['raw answer mismatch', PART_IDS.map((partId, index) => ({
      partId,
      rawAnswer: index === 0 ? 'UP' : 'up',
    }))],
    ['extra part field', PART_IDS.map((partId, index) => ({
      partId,
      rawAnswer: 'up',
      ...(index === 0 ? { score: 1 } : {}),
    }))],
    ['non-record part', [null, ...PART_IDS.slice(1).map((partId) => ({ partId, rawAnswer: 'up' }))]],
  ] as const)('rejects malformed parts: %s', async (_label, parts) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1), { parts });

    await expectSafeError(await POST(makeRequest(body)), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    'answer',
    'answerKey',
    'correctAnswer',
    'correctAnswers',
    'expectedAnswer',
    'grading',
    'gradingMetadata',
    'normalizedAnswer',
    'solution',
    'solutions',
    'solutionSteps',
    'steps',
    'finalAnswer',
    'authority',
    'isCorrect',
    'correctness',
    'score',
    'maxScore',
    'feedback',
  ] as const)('rejects forbidden outer authority or grade field: %s', async (field) => {
    const POST = await getPost();
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', sourceAnswers(1), { [field]: 'forbidden' });

    await expectSafeError(await POST(makeRequest(body)), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each(['answerKey', 'correctAnswer', 'expectedAnswer', 'grading', 'score'] as const)(
    'rejects nested authority or grade field in answers: %s',
    async (field) => {
      const POST = await getPost();
      const answers = { ...sourceAnswers(1), [field]: 'forbidden' } as Answers;
      const parts = PART_IDS.map((partId) => ({
        partId,
        rawAnswer: answers[partId],
      }));
      const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answers, { parts });

      await expectSafeError(await POST(makeRequest(body)), 400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it.each(['answerKey', 'correctAnswer', 'expectedAnswer', 'grading', 'score'] as const)(
    'rejects nested authority or grade field in parts: %s',
    async (field) => {
      const POST = await getPost();
      const answers = sourceAnswers(1);
      const parts = PART_IDS.map((partId, index) => ({
        partId,
        rawAnswer: answers[partId],
        ...(index === 0 ? { [field]: 'forbidden' } : {}),
      }));
      const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answers, { parts });

      await expectSafeError(await POST(makeRequest(body)), 400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['non-object result', null],
    ['extra result field', { ...SERVER_RESULT, hidden: true }],
    ['missing result field', (() => {
      const result = { ...SERVER_RESULT } as Record<string, unknown>;
      delete result.feedback;
      return result;
    })()],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['non-string submission ID', { ...SERVER_RESULT, submissionId: 1 }],
    ['negative score', { ...SERVER_RESULT, score: -1 }],
    ['score above max', { ...SERVER_RESULT, score: 13 }],
    ['fractional score', { ...SERVER_RESULT, score: 1.5 }],
    ['non-number score', { ...SERVER_RESULT, score: '12' }],
    ['wrong max score', { ...SERVER_RESULT, maxScore: 11 }],
    ['zero ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['fractional ordinal', { ...SERVER_RESULT, attemptOrdinal: 1.5 }],
    ['unsafe ordinal', { ...SERVER_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 }],
    ['non-number ordinal', { ...SERVER_RESULT, attemptOrdinal: '1' }],
    ['blank feedback', { ...SERVER_RESULT, feedback: ' ' }],
    ['non-string feedback', { ...SERVER_RESULT, feedback: 1 }],
  ] as const)('rejects corrupt server result safely: %s', async (_label, result) => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);

    await expectSafeError(await POST(makeRequest(makeEnvelope(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      sourceAnswers(1),
    ))), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('maps only idempotency_conflict to a safe 409', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));

    await expectSafeError(await POST(makeRequest(makeEnvelope(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      sourceAnswers(1),
    ))), 409);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('maps other mutation errors to a safe 500 and never calls another mutation', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('private mutation detail'));

    await expectSafeError(await POST(makeRequest(makeEnvelope(
      INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
      sourceAnswers(2),
    ))), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation.mock.calls.map(([ref]) => ref)).toStrictEqual([CREATE_REF]);
  });
});
