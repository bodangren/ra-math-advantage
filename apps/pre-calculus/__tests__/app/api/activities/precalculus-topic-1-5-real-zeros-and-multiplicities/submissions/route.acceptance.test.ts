import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
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
      createTopic15RealZerosAndMultiplicitiesSubmission:
        'internal.activities.createTopic15RealZerosAndMultiplicitiesSubmission',
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = 'profiles:precalc-topic-1-5-real-zeros-and-multiplicities-student';
const IDEMPOTENCY_KEY = 'precalc-topic-1-5-real-zeros-and-multiplicities-key';

type Pair = { zero: number; multiplicity: number };
type Answers = { a: Pair[]; b: Pair[] };
type Mode = 'guided_practice' | 'independent_practice';

const SEED_1_ANSWERS: Answers = {
  a: [
    { zero: -5, multiplicity: 3 },
    { zero: 0, multiplicity: 1 },
    { zero: 5, multiplicity: 2 },
  ],
  b: [
    { zero: 0, multiplicity: 2 },
    { zero: 5, multiplicity: 1 },
  ],
};

const SEED_2_ANSWERS: Answers = {
  a: [
    { zero: -2, multiplicity: 2 },
    { zero: 0, multiplicity: 2 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -3, multiplicity: 2 },
    { zero: 3, multiplicity: 3 },
  ],
};

const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-5-real-zeros-and-multiplicities',
  score: 2,
  maxScore: 2,
  attemptOrdinal: 1,
  feedback: '2/2 real-zero and multiplicity responses matched the server rubric.',
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

function cloneAnswers(answers: Answers): Answers {
  return {
    a: answers.a.map((pair) => ({ ...pair })),
    b: answers.b.map((pair) => ({ ...pair })),
  };
}

function makeEnvelope(
  activityId: string,
  mode: Mode,
  answers: Answers,
  overrides: Record<string, unknown> = {},
) {
  return {
    contractVersion: 'practice.v1' as const,
    activityId,
    mode,
    status: 'submitted' as const,
    attemptNumber: 4,
    submittedAt: '2026-08-30T00:00:00.000Z',
    answers,
    parts: [
      { partId: 'a', rawAnswer: answers.a },
      { partId: 'b', rawAnswer: answers.b },
    ],
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
    'http://localhost/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions',
    { method: 'POST', headers, body: JSON.stringify(body) },
  );
}

describe('POST /api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided', GUIDED_ACTIVITY_ID, 'guided_practice', SEED_1_ANSWERS, 1],
    ['Independent', INDEPENDENT_ACTIVITY_ID, 'independent_practice', SEED_2_ANSWERS, 2],
  ] as const)('forwards the exact %s envelope and preserves finite malformed choices', async (
    _label,
    activityId,
    mode,
    sourceAnswers,
    _seed,
  ) => {
    const answers = cloneAnswers(sourceAnswers);
    answers.a[0] = { zero: 7.5, multiplicity: 9 };
    const submissionData = makeEnvelope(activityId, mode, answers);
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');

    const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createTopic15RealZerosAndMultiplicitiesSubmission',
      {
        userId: LEARNER_ID,
        activityId,
        submissionData,
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    );
    expect(JSON.stringify(submissionData)).toContain('7.5');
    expect(JSON.stringify(submissionData)).not.toMatch(
      /answerKey|correctAnswer|expectedAnswer|grading|score|solution|authority/,
    );
    expect(internal).not.toHaveProperty('learningEvidence');
  });

  it('passes through auth responses and rejects invalid claims before mutation', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS));
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

  it('accepts valid JSON without content type and rejects malformed JSON before mutation', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS));
    const validResponse = await POST(makeRequest(body, IDEMPOTENCY_KEY, null));
    expect(validResponse.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createTopic15RealZerosAndMultiplicitiesSubmission',
      {
        userId: LEARNER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        submissionData: body,
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    );

    mocks.fetchInternalMutation.mockClear();
    const malformedJson = new Request(
      'http://localhost/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Idempotency-Key': IDEMPOTENCY_KEY },
        body: '{',
      },
    );
    const malformedResponse = await POST(malformedJson);
    expect(malformedResponse.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS)), null],
    ['blank key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS)), '  '],
    ['extra outer field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS)), score: 2 }, IDEMPOTENCY_KEY],
    ['missing outer field', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS), { status: undefined }), IDEMPOTENCY_KEY],
    ['unknown activity', makeEnvelope('math.precalc.skill.1.5.unknown.independent_practice', 'independent_practice', cloneAnswers(SEED_2_ANSWERS)), IDEMPOTENCY_KEY],
    ['Worked activity', makeEnvelope('math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form.worked_example', 'guided_practice', cloneAnswers(SEED_1_ANSWERS)), IDEMPOTENCY_KEY],
    ['mismatched mode', makeEnvelope(GUIDED_ACTIVITY_ID, 'independent_practice', cloneAnswers(SEED_2_ANSWERS)), IDEMPOTENCY_KEY],
    ['wrong contract', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS), { contractVersion: 'practice.v2' }), IDEMPOTENCY_KEY],
    ['wrong status', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS), { status: 'graded' }), IDEMPOTENCY_KEY],
    ['zero attempt', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS), { attemptNumber: 0 }), IDEMPOTENCY_KEY],
    ['fractional attempt', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS), { attemptNumber: 1.5 }), IDEMPOTENCY_KEY],
    ['invalid timestamp', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS), { submittedAt: 'not-a-date' }), IDEMPOTENCY_KEY],
  ] as const)('rejects %s before the mutation', async (_label, body, key) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    const response = await POST(makeRequest(body, key));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing answer', (answers: Answers): Record<string, unknown> => {
      const { b: _missing, ...remaining } = answers;
      return remaining;
    }],
    ['extra answer', (answers: Answers): Record<string, unknown> => ({ ...answers, score: '2' })],
    ['non-record answers', (_answers: Answers): unknown[] => []],
    ['non-array answer a', (answers: Answers): Record<string, unknown> => ({ ...answers, a: {} })],
    ['non-array answer b', (answers: Answers): Record<string, unknown> => ({ ...answers, b: null })],
  ] as const)('rejects %s before the mutation', async (_label, makeAnswers) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    const answers = makeAnswers(cloneAnswers(SEED_1_ANSWERS));
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answers as Answers);
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['short a array', (answers: Answers): Answers => ({ ...answers, a: answers.a.slice(0, 1) })],
    ['long b array', (answers: Answers): Answers => ({ ...answers, b: [...answers.b, { zero: 8, multiplicity: 1 }, { zero: 9, multiplicity: 1 }] })],
    ['non-record pair', (answers: Answers): Answers => ({ ...answers, a: [null, ...answers.a.slice(1)] as unknown as Pair[] })],
    ['missing pair field', (answers: Answers): Answers => ({ ...answers, a: [{ zero: answers.a[0].zero }, ...answers.a.slice(1)] as Pair[] })],
    ['extra pair field', (answers: Answers): Answers => ({ ...answers, a: [{ ...answers.a[0], answer: 1 }, ...answers.a.slice(1)] as Pair[] })],
    ['non-number zero', (answers: Answers): Answers => ({ ...answers, a: [{ ...answers.a[0], zero: '0' }, ...answers.a.slice(1)] as Pair[] })],
    ['non-number multiplicity', (answers: Answers): Answers => ({ ...answers, b: [{ ...answers.b[0], multiplicity: null }, ...answers.b.slice(1)] as Pair[] })],
    ['non-finite pair value', (answers: Answers): Answers => ({ ...answers, b: [{ ...answers.b[0], zero: null }, ...answers.b.slice(1)] as Pair[] })],
  ] as const)('rejects %s before the mutation', async (_label, mutateAnswers) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    const answers = mutateAnswers(cloneAnswers(SEED_1_ANSWERS));
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answers);
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing part', (answers: Answers): unknown[] => [{ partId: 'a', rawAnswer: answers.a }]],
    ['extra part', (answers: Answers): unknown[] => [
      { partId: 'a', rawAnswer: answers.a },
      { partId: 'b', rawAnswer: answers.b },
      { partId: 'a', rawAnswer: answers.a },
    ]],
    ['non-array parts', (_answers: Answers): null => null],
    ['parts out of order', (answers: Answers): unknown[] => [
      { partId: 'b', rawAnswer: answers.b },
      { partId: 'a', rawAnswer: answers.a },
    ]],
    ['duplicate part', (answers: Answers): unknown[] => [
      { partId: 'a', rawAnswer: answers.a },
      { partId: 'a', rawAnswer: answers.a },
    ]],
    ['unknown part', (answers: Answers): unknown[] => [
      { partId: 'c', rawAnswer: answers.a },
      { partId: 'b', rawAnswer: answers.b },
    ]],
    ['missing part field', (answers: Answers): unknown[] => [
      { partId: 'a' },
      { partId: 'b', rawAnswer: answers.b },
    ]],
    ['extra part field', (answers: Answers): unknown[] => [
      { partId: 'a', rawAnswer: answers.a, authority: 'blocked' },
      { partId: 'b', rawAnswer: answers.b },
    ]],
    ['mismatched raw part', (answers: Answers): unknown[] => [
      { partId: 'a', rawAnswer: answers.b },
      { partId: 'b', rawAnswer: answers.b },
    ]],
    ['non-record part', (answers: Answers): unknown[] => [
      null,
      { partId: 'b', rawAnswer: answers.b },
    ]],
  ] as const)('rejects %s before the mutation', async (_label, makeParts) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    const answers = cloneAnswers(SEED_1_ANSWERS);
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answers, { parts: makeParts(answers) });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each(AUTHORITY_KEYS)('rejects top-level authority field %s before the mutation', async (authorityKey) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS), { [authorityKey]: 'blocked' });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps only the exact idempotency conflict to 409', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));
    const response = await POST(makeRequest(
      makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS)),
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
    ['score above maximum', { ...SERVER_RESULT, score: 3 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 1 }],
    ['zero ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['fractional ordinal', { ...SERVER_RESULT, attemptOrdinal: 1.5 }],
    ['non-string ordinal', { ...SERVER_RESULT, attemptOrdinal: '1' }],
    ['non-string feedback', { ...SERVER_RESULT, feedback: 1 }],
  ] as const)('returns safe 500 for %s', async (_label, result) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);
    const response = await POST(makeRequest(
      makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS)),
    ));
    expect(response.status).toBe(500);
    const responseText = await response.text();
    expect(responseText).not.toContain(JSON.stringify(result));
    expect(responseText).not.toContain('hidden');
  });

  it('returns a safe 500 for non-conflict mutation errors', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions/route');
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('private mutation detail'));
    const response = await POST(makeRequest(
      makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', cloneAnswers(SEED_1_ANSWERS)),
    ));
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private mutation detail');
  });
});
