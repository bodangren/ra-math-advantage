import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PRECALCULUS_PILOT_NODE_ID } from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic11IntervalGraph } from '@/lib/practice/topic11-interval-graph';

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
      createServerOwnedSubmission: 'internal.activities.createServerOwnedSubmission',
    },
  },
}));

const LEARNER_ID = 'profiles:authenticated-precalc-student';
const SERVER_SUBMISSION_ID = 'activity_submissions:server-owned-precalc-pilot';
const SERVER_PILOT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
const SERVER_INDEPENDENT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
const CREATE_IDEMPOTENCY_KEY = 'precalc-pilot-create-key';
const LONG_OPAQUE_KEY = `opaque-key-${'x'.repeat(257)}`;
const SAFE_SERVER_FEEDBACK = '3/3 interval classifications matched the server rubric.';
const SEED_TWO = generateTopic11IntervalGraph(2);
const SEED_TWO_ANSWERS = {
  increasingIntervals: SEED_TWO.increasingIntervals.map(([start, end]) => `[${start},${end}]`).join(' U '),
  decreasingIntervals: SEED_TWO.decreasingIntervals.map(([start, end]) => `[${start},${end}]`).join(' U '),
  constantIntervals: 'none',
};

const RAW_ENVELOPE = {
  contractVersion: 'practice.v1' as const,
  activityId: SERVER_PILOT_ACTIVITY_ID,
  mode: 'guided_practice' as const,
  status: 'submitted' as const,
  // This browser number is not the server evidence ordinal.
  attemptNumber: 99,
  submittedAt: '2026-08-19T10:00:00.000Z',
  answers: {
    increasingIntervals: '[-3,-1]',
    decreasingIntervals: '[-1,3]',
    constantIntervals: '[3,5]',
  },
  parts: [
    { partId: 'increasingIntervals', rawAnswer: '[-3,-1]' },
    { partId: 'decreasingIntervals', rawAnswer: '[-1,3]' },
    { partId: 'constantIntervals', rawAnswer: '[3,5]' },
  ],
};

const SERVER_OWNED_RESULT = {
  submissionId: SERVER_SUBMISSION_ID,
  score: 3,
  maxScore: 3,
  feedback: SAFE_SERVER_FEEDBACK,
  attemptOrdinal: 4,
} as const;

function makeRequest(
  body: unknown,
  idempotencyKey: string | null = CREATE_IDEMPOTENCY_KEY,
): Request {
  return new Request('http://localhost/api/activities/precalculus-pilot/submissions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(idempotencyKey === null ? {} : { 'Idempotency-Key': idempotencyKey }),
    },
    body: JSON.stringify(body),
  });
}

async function loadPost(): Promise<(request: Request) => Promise<Response>> {
  try {
    const route = await vi.importActual<Record<string, unknown>>(
      '@/app/api/activities/precalculus-pilot/submissions/route',
    );
    if (typeof route.POST !== 'function') {
      throw new Error('POST is not exported');
    }
    return route.POST as (request: Request) => Promise<Response>;
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : '';
    throw new Error(
      'Missing AP Precalculus public server-owned submission producer. Export POST from '
        + `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts.${detail}`,
    );
  }
}

describe('POST /api/activities/precalculus-pilot/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_OWNED_RESULT);
  });

  it('accepts a long opaque key with the student-only gate and server-owned Topic 1.1 rubric', async () => {
    const POST = await loadPost();
    const request = makeRequest(RAW_ENVELOPE, LONG_OPAQUE_KEY);

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_OWNED_RESULT);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId: LEARNER_ID,
        activityId: SERVER_PILOT_ACTIVITY_ID,
        submissionData: RAW_ENVELOPE,
        idempotencyKey: LONG_OPAQUE_KEY,
      },
    );
    const producerInput = mocks.fetchInternalMutation.mock.calls[0]?.[1];
    expect(producerInput).not.toHaveProperty('score');
    expect(producerInput).not.toHaveProperty('maxScore');
    expect(producerInput).not.toHaveProperty('isCorrect');
    expect(producerInput).not.toHaveProperty('attemptOrdinal');
    expect(producerInput).not.toHaveProperty('submissionId');
    expect(producerInput).not.toHaveProperty('learnerId');
    expect(SERVER_OWNED_RESULT.feedback).not.toContain('[-3,-1]');
    expect(SERVER_OWNED_RESULT.feedback).not.toContain('[-1,3]');
    expect(SERVER_OWNED_RESULT.feedback).not.toContain('[3,5]');
  });

  it('accepts the exact Independent activity and forwards its exact activity and mode pair', async () => {
    const POST = await loadPost();
    const independentEnvelope = {
      ...RAW_ENVELOPE,
      activityId: SERVER_INDEPENDENT_ACTIVITY_ID,
      mode: 'independent_practice' as const,
      answers: SEED_TWO_ANSWERS,
      parts: [
        { partId: 'increasingIntervals', rawAnswer: SEED_TWO_ANSWERS.increasingIntervals },
        { partId: 'decreasingIntervals', rawAnswer: SEED_TWO_ANSWERS.decreasingIntervals },
        { partId: 'constantIntervals', rawAnswer: SEED_TWO_ANSWERS.constantIntervals },
      ],
    };

    const response = await POST(makeRequest(independentEnvelope));

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      expect.objectContaining({
        activityId: SERVER_INDEPENDENT_ACTIVITY_ID,
        submissionData: independentEnvelope,
      }),
    );
  });

  it.each([
    ['a guided activity with Independent mode', {
      ...RAW_ENVELOPE,
      mode: 'independent_practice' as const,
    }],
    ['an Independent activity with Guided mode', {
      ...RAW_ENVELOPE,
      activityId: SERVER_INDEPENDENT_ACTIVITY_ID,
    }],
    ['an unknown activity', {
      ...RAW_ENVELOPE,
      activityId: `${PRECALCULUS_PILOT_NODE_ID}.unknown_practice`,
    }],
  ] as const)('rejects %s as an invalid activity and mode pair', async (_label, body) => {
    const POST = await loadPost();

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('requires a create idempotency key before server storage or grading', async () => {
    const POST = await loadPost();

    const response = await POST(makeRequest(RAW_ENVELOPE, null));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.stringMatching(/idempotency/i),
    }));
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('reuses the same opaque create key for a replay without letting the browser choose a new ordinal', async () => {
    const POST = await loadPost();
    mocks.fetchInternalMutation
      .mockResolvedValueOnce({ ...SERVER_OWNED_RESULT, attemptOrdinal: 4 })
      .mockResolvedValueOnce({ ...SERVER_OWNED_RESULT, attemptOrdinal: 4 });

    const first = await POST(makeRequest(RAW_ENVELOPE));
    const replay = await POST(makeRequest(RAW_ENVELOPE));

    expect(first.status).toBe(200);
    expect(replay.status).toBe(200);
    await expect(first.json()).resolves.toStrictEqual(SERVER_OWNED_RESULT);
    await expect(replay.json()).resolves.toStrictEqual(SERVER_OWNED_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      'internal.activities.createServerOwnedSubmission',
      expect.objectContaining({
        idempotencyKey: CREATE_IDEMPOTENCY_KEY,
        activityId: SERVER_PILOT_ACTIVITY_ID,
      }),
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      'internal.activities.createServerOwnedSubmission',
      expect.objectContaining({
        idempotencyKey: CREATE_IDEMPOTENCY_KEY,
        activityId: SERVER_PILOT_ACTIVITY_ID,
      }),
    );
  });

  it('returns HTTP 409 for an exact idempotency_conflict on a same-key request with a different Topic 1.1 payload', async () => {
    const POST = await loadPost();
    const conflictingAnswers = {
      ...RAW_ENVELOPE.answers,
      constantIntervals: '[2,5]',
    };
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(SERVER_OWNED_RESULT)
      .mockRejectedValueOnce(new Error('idempotency_conflict'));

    const first = await POST(makeRequest(RAW_ENVELOPE));
    const conflict = await POST(makeRequest({
      ...RAW_ENVELOPE,
      answers: conflictingAnswers,
      parts: [
        { partId: 'increasingIntervals', rawAnswer: '[-3,-1]' },
        { partId: 'decreasingIntervals', rawAnswer: '[-1,3]' },
        { partId: 'constantIntervals', rawAnswer: '[2,5]' },
      ],
    }));

    expect(first.status).toBe(200);
    expect(conflict.status).toBe(409);
    await expect(conflict.json()).resolves.toEqual({
      error: 'Idempotency key was already used for a different submission',
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      'internal.activities.createServerOwnedSubmission',
      expect.objectContaining({
        idempotencyKey: CREATE_IDEMPOTENCY_KEY,
        activityId: SERVER_PILOT_ACTIVITY_ID,
        submissionData: expect.objectContaining({
          answers: conflictingAnswers,
        }),
      }),
    );
  });

  it('maps a producer error that only contains idempotency_conflict to safe HTTP 500', async () => {
    const POST = await loadPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(
      new Error('upstream idempotency_conflict diagnostic'),
    );

    const response = await POST(makeRequest(RAW_ENVELOPE));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Unable to create submission' });
  });

  it('rejects client grading metadata nested in a raw Topic 1.1 part before server storage or grading', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest({
      ...RAW_ENVELOPE,
      parts: [
        {
          ...RAW_ENVELOPE.parts[0],
          score: 3,
          maxScore: 3,
          isCorrect: true,
        },
        ...RAW_ENVELOPE.parts.slice(1),
      ],
    }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['a duplicate canonical part ID', {
      ...RAW_ENVELOPE,
      parts: [
        RAW_ENVELOPE.parts[0],
        RAW_ENVELOPE.parts[1],
        { ...RAW_ENVELOPE.parts[0] },
      ],
    }],
    ['a missing canonical part ID despite three submitted parts', {
      ...RAW_ENVELOPE,
      parts: [
        RAW_ENVELOPE.parts[0],
        RAW_ENVELOPE.parts[1],
        { ...RAW_ENVELOPE.parts[1] },
      ],
    }],
    ['an unknown part ID', {
      ...RAW_ENVELOPE,
      parts: [
        RAW_ENVELOPE.parts[0],
        RAW_ENVELOPE.parts[1],
        { partId: 'unknownIntervals', rawAnswer: '[3,5]' },
      ],
    }],
    ['a raw part answer that disagrees with the named answer', {
      ...RAW_ENVELOPE,
      parts: [
        { ...RAW_ENVELOPE.parts[0], rawAnswer: '[0,1]' },
        ...RAW_ENVELOPE.parts.slice(1),
      ],
    }],
  ] as const)(
    'rejects %s before server storage or grading',
    async (_label, body) => {
      const POST = await loadPost();

      const response = await POST(makeRequest(body));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it('returns a forbidden student-gate response for an authenticated non-student without invoking the producer', async () => {
    mocks.requireStudentRequestClaims.mockResolvedValue(new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { 'content-type': 'application/json' } },
    ));
    const POST = await loadPost();

    const response = await POST(makeRequest(RAW_ENVELOPE));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns an unauthorized student-gate response without invoking the producer', async () => {
    mocks.requireStudentRequestClaims.mockResolvedValue(new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    ));
    const POST = await loadPost();

    const response = await POST(makeRequest(RAW_ENVELOPE));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    'submissionId',
    'score',
    'maxScore',
    'grade',
    'isCorrect',
    'learnerId',
    'attemptOrdinal',
    'feedback',
    'idempotencyKey',
    'stableActivityId',
    'rubric',
  ])('rejects the client-controlled %s field before server storage or grading', async (field) => {
    const POST = await loadPost();
    const response = await POST(makeRequest({ ...RAW_ENVELOPE, [field]: 'forged' }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
