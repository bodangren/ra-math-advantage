import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic14RateSignAndTrendOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
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
      createTopic14RateSignAndTrendSubmission:
        'internal.activities.createTopic14RateSignAndTrendSubmission',
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = 'profiles:precalc-topic-1-4-rate-sign-and-trend-student';
const IDEMPOTENCY_KEY = 'precalc-topic-1-4-rate-sign-and-trend-key';
const ANSWER_IDS = ['rateSign', 'rateTrend'] as const;
type AnswerId = (typeof ANSWER_IDS)[number];
type Mode = 'guided_practice' | 'independent_practice';
type RawAnswers = Record<string, unknown>;
type RawParts = Array<Record<string, unknown>> | null;

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
] as const;

const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-4-rate-sign-and-trend',
  score: 2,
  maxScore: 2,
  attemptOrdinal: 1,
  feedback: '2/2 rate sign and trend responses matched the server rubric.',
} as const;

function answerStrings(seed: number): Record<AnswerId, string> {
  const answer = generateTopic14RateSignAndTrendOutput(seed).expectedAnswer as Record<string, string>;
  return Object.fromEntries(ANSWER_IDS.map((id) => [id, answer[id]])) as Record<AnswerId, string>;
}

function makeEnvelope(
  activityId: string,
  mode: Mode,
  answers: RawAnswers,
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
    parts: ANSWER_IDS.map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    })),
    ...overrides,
  };
}

function makeRequest(
  body: unknown,
  idempotencyKey: string | null = IDEMPOTENCY_KEY,
  contentType = 'application/json',
): Request {
  const headers = new Headers();
  if (contentType) headers.set('content-type', contentType);
  if (idempotencyKey !== null) headers.set('Idempotency-Key', idempotencyKey);
  return new Request('http://localhost/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('POST /api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided', GUIDED_ACTIVITY_ID, 'guided_practice', 1],
    ['Independent', INDEPENDENT_ACTIVITY_ID, 'independent_practice', 2],
  ] as const)('forwards the exact live %s envelope and preserves malformed choices', async (
    _label,
    activityId,
    mode,
    seed,
  ) => {
    const answers = answerStrings(seed);
    answers.rateSign = 'not-a-canonical-choice';
    const submissionData = makeEnvelope(activityId, mode, answers);
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');

    const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createTopic14RateSignAndTrendSubmission',
      {
        userId: LEARNER_ID,
        activityId,
        submissionData,
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    );
    expect(JSON.stringify(submissionData)).toContain('not-a-canonical-choice');
    expect(JSON.stringify(submissionData)).not.toMatch(/answerKey|correctAnswer|expectedAnswer|grading|score|solution|authority/);
    expect(internal).not.toHaveProperty('learningEvidence');
  });

  it('passes through auth responses and rejects invalid claims before mutation', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1));
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
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1));
    const requestWithoutContentType = makeRequest(body, IDEMPOTENCY_KEY, '');

    const validResponse = await POST(requestWithoutContentType);
    expect(validResponse.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createTopic14RateSignAndTrendSubmission',
      {
        userId: LEARNER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        submissionData: body,
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    );

    mocks.fetchInternalMutation.mockClear();
    const malformedJson = new Request('http://localhost/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': IDEMPOTENCY_KEY },
      body: '{',
    });
    const malformedResponse = await POST(malformedJson);
    expect(malformedResponse.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1)), null],
    ['blank key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1)), '  '],
    ['extra outer field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1)), score: 2 }, IDEMPOTENCY_KEY],
    ['missing outer field', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1), { status: undefined }), IDEMPOTENCY_KEY],
    ['unknown activity', makeEnvelope('math.precalc.skill.1.4.unknown.guided_practice', 'guided_practice', answerStrings(1)), IDEMPOTENCY_KEY],
    ['mismatched mode', makeEnvelope(GUIDED_ACTIVITY_ID, 'independent_practice', answerStrings(2)), IDEMPOTENCY_KEY],
    ['wrong contract', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1), { contractVersion: 'practice.v2' }), IDEMPOTENCY_KEY],
    ['wrong status', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1), { status: 'graded' }), IDEMPOTENCY_KEY],
    ['zero attempt', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1), { attemptNumber: 0 }), IDEMPOTENCY_KEY],
    ['fractional attempt', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1), { attemptNumber: 1.5 }), IDEMPOTENCY_KEY],
    ['invalid timestamp', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1), { submittedAt: 'not-a-date' }), IDEMPOTENCY_KEY],
  ] as const)('rejects %s before the mutation', async (_label, body, key) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');

    const response = await POST(makeRequest(body, key));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing answer', (answers: RawAnswers): RawAnswers => {
      const { rateTrend: _missing, ...remaining } = answers;
      return remaining;
    }],
    ['extra answer', (answers: RawAnswers): RawAnswers => ({ ...answers, score: '2' })],
    ['non-string answer', (answers: RawAnswers): RawAnswers => ({ ...answers, rateSign: 1 })],
  ] as const)('rejects %s before the mutation', async (_label, makeAnswers) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', makeAnswers(answerStrings(1)));

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing part', (answers: RawAnswers): RawParts => ANSWER_IDS.slice(0, 1).map((partId) => ({ partId, rawAnswer: answers[partId] }))],
    ['extra part', (answers: RawAnswers): RawParts => [...ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })), { partId: 'rateSign', rawAnswer: answers.rateSign }]],
    ['extra part field', (answers: RawAnswers): RawParts => ANSWER_IDS.map((partId, index) => index === 0
      ? { partId, rawAnswer: answers[partId], authority: 'blocked' }
      : { partId, rawAnswer: answers[partId] })],
    ['parts out of order', (answers: RawAnswers): RawParts => [
      { partId: 'rateTrend', rawAnswer: answers.rateTrend },
      { partId: 'rateSign', rawAnswer: answers.rateSign },
    ]],
    ['duplicate part', (answers: RawAnswers): RawParts => [
      { partId: 'rateSign', rawAnswer: answers.rateSign },
      { partId: 'rateSign', rawAnswer: answers.rateSign },
    ]],
    ['mismatched raw part', (answers: RawAnswers): RawParts => [
      { partId: 'rateSign', rawAnswer: answers.rateTrend },
      { partId: 'rateTrend', rawAnswer: answers.rateTrend },
    ]],
    ['non-array parts', (_answers: RawAnswers): RawParts => null],
  ] as const)('rejects %s before the mutation', async (_label, makeParts) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    const answers = answerStrings(1);
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answers, { parts: makeParts(answers) });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each(AUTHORITY_KEYS)('rejects top-level authority field %s before the mutation', async (authorityKey) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', answerStrings(1), { [authorityKey]: 'blocked' });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps only the exact idempotency conflict to 409', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest(makeEnvelope(
      INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
      answerStrings(2),
    )));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Idempotency key was already used for a different submission',
    });
  });

  it.each([
    ['extra result field', { ...SERVER_RESULT, hidden: true }],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['negative score', { ...SERVER_RESULT, score: -1 }],
    ['fractional score', { ...SERVER_RESULT, score: 1.5 }],
    ['score above maximum', { ...SERVER_RESULT, score: 3 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 1 }],
    ['zero ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['non-string feedback', { ...SERVER_RESULT, feedback: 1 }],
  ] as const)('returns safe 500 for %s', async (_label, result) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);

    const response = await POST(makeRequest(makeEnvelope(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      answerStrings(1),
    )));

    expect(response.status).toBe(500);
    const responseText = await response.text();
    expect(responseText).not.toContain(JSON.stringify(result));
    expect(responseText).not.toContain('hidden');
  });

  it('returns a safe 500 for non-conflict mutation errors', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions/route');
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('private mutation detail'));

    const response = await POST(makeRequest(makeEnvelope(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      answerStrings(1),
    )));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('private mutation detail');
  });
});
