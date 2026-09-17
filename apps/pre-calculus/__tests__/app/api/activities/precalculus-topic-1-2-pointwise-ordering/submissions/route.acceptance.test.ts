import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic12PointwiseRateOrderingOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
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
      createTopic12PointwiseRateOrderingSubmission:
        'internal.activities.createTopic12PointwiseRateOrderingSubmission',
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = 'profiles:precalc-topic-1-2-pointwise-ordering-student';
const IDEMPOTENCY_KEY = 'precalc-topic-1-2-pointwise-ordering-key';
const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-2-pointwise-ordering',
  score: 1,
  maxScore: 1,
  attemptOrdinal: 1,
  feedback: '1/1 pointwise selections matched the server rubric.',
} as const;

function generatedOrder(seed: number): string[] {
  return [...(generateTopic12PointwiseRateOrderingOutput(seed).expectedAnswer as {
    orderedPointIds: readonly string[];
  }).orderedPointIds];
}

function makeEnvelope(
  activityId: string,
  mode: 'guided_practice' | 'independent_practice',
  orderedPointIds: string[],
) {
  return {
    contractVersion: 'practice.v1' as const,
    activityId,
    mode,
    status: 'submitted' as const,
    attemptNumber: 4,
    submittedAt: '2026-08-28T10:15:00.000Z',
    answers: { orderedPointIds },
    parts: [{ partId: 'orderedPointIds' as const, rawAnswer: orderedPointIds }],
  };
}

function makeRequest(body: unknown, idempotencyKey: string | null = IDEMPOTENCY_KEY): Request {
  return new Request('http://localhost/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(idempotencyKey === null ? {} : { 'Idempotency-Key': idempotencyKey }),
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/activities/precalculus-topic-1-2-pointwise-ordering/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided', GUIDED_ACTIVITY_ID, 'guided_practice', 1],
    ['Independent', INDEPENDENT_ACTIVITY_ID, 'independent_practice', 2],
  ] as const)('accepts the exact %s envelope and forwards the generated order', async (
    _label,
    activityId,
    mode,
    seed,
  ) => {
    const submissionData = makeEnvelope(activityId, mode, generatedOrder(seed));
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions/route');

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createTopic12PointwiseRateOrderingSubmission',
      {
        userId: LEARNER_ID,
        activityId,
        submissionData,
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    );
    expect(internal).not.toHaveProperty('learningEvidence');
  });

  it('passes through auth responses and rejects non-student or invalid claims before mutation', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions/route');
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1));

    const authResponse = new Response('Forbidden', { status: 403 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(submissionData))).resolves.toBe(authResponse);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: 'teacher' });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty('status', 403);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: 'student' });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty('status', 401);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), null],
    ['blank key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), '  '],
    ['mismatched mode', makeEnvelope(GUIDED_ACTIVITY_ID, 'independent_practice', generatedOrder(1)), IDEMPOTENCY_KEY],
    ['unknown activity', makeEnvelope('math.precalc.skill.1.2.other.guided_practice', 'guided_practice', generatedOrder(1)), IDEMPOTENCY_KEY],
    ['duplicate labels', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', ['A', 'A', 'B']), answers: { orderedPointIds: ['A', 'A', 'B'] } }, IDEMPOTENCY_KEY],
    ['unknown label', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', ['A', 'B', 'D']), IDEMPOTENCY_KEY],
    ['short array', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', ['A', 'B']), IDEMPOTENCY_KEY],
    ['long array', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', ['A', 'B', 'C', 'A']), IDEMPOTENCY_KEY],
    ['non-array answer', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), answers: { orderedPointIds: 'A,B,C' } }, IDEMPOTENCY_KEY],
    ['mismatched part', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), parts: [{ partId: 'orderedPointIds', rawAnswer: ['A', 'C', 'B'] }] }, IDEMPOTENCY_KEY],
    ['extra outer learner field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), userId: LEARNER_ID }, IDEMPOTENCY_KEY],
    ['extra outer grade field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), score: 1 }, IDEMPOTENCY_KEY],
    ['extra outer correctness field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), isCorrect: true }, IDEMPOTENCY_KEY],
    ['extra answer field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), answers: { orderedPointIds: generatedOrder(1), score: 1 } }, IDEMPOTENCY_KEY],
    ['extra part field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), parts: [{ partId: 'orderedPointIds', rawAnswer: generatedOrder(1), isCorrect: true }] }, IDEMPOTENCY_KEY],
    ['invalid attempt number', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), attemptNumber: 0 }, IDEMPOTENCY_KEY],
    ['invalid submittedAt', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)), submittedAt: 'not-a-date' }, IDEMPOTENCY_KEY],
  ] as const)('rejects %s before the ordering mutation', async (_label, body, key) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions/route');

    const response = await POST(makeRequest(body, key));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON before the ordering mutation', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions/route');
    const request = new Request('http://localhost/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': IDEMPOTENCY_KEY },
      body: '{',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns 409 only for the exact idempotency conflict sentinel', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions/route');
    const submissionData = makeEnvelope(INDEPENDENT_ACTIVITY_ID, 'independent_practice', generatedOrder(2));
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(409);
  });

  it.each([
    ['extra server result field', { ...SERVER_RESULT, internal: 'hidden' }],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['invalid score', { ...SERVER_RESULT, score: 2 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 2 }],
    ['invalid ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['invalid feedback', { ...SERVER_RESULT, feedback: 1 }],
  ] as const)('returns a safe 500 for %s', async (_label, serverResult) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions/route');
    mocks.fetchInternalMutation.mockResolvedValueOnce(serverResult);

    const response = await POST(makeRequest(
      makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1)),
    ));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to create Topic 1.2 pointwise ordering practice submission',
    });
  });

  it('returns safe 500 responses for auth and non-conflict mutation errors', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions/route');
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', generatedOrder(1));

    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error('secret auth detail'));
    const authError = await POST(makeRequest(submissionData));
    expect(authError.status).toBe(500);
    await expect(authError.text()).resolves.not.toContain('secret auth detail');

    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('secret backend detail'));
    const mutationError = await POST(makeRequest(submissionData));
    expect(mutationError.status).toBe(500);
    await expect(mutationError.text()).resolves.not.toContain('secret backend detail');
  });
});
