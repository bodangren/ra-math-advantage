import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic12PointwiseLeastRateChoice } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
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
      createTopic12PointwiseLeastRateSubmission:
        'internal.activities.createTopic12PointwiseLeastRateSubmission',
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = 'profiles:precalc-topic-1-2-pointwise-practice-student';
const IDEMPOTENCY_KEY = 'precalc-topic-1-2-pointwise-practice-key';
const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-2-pointwise-practice',
  score: 1,
  maxScore: 1,
  attemptOrdinal: 1,
  feedback: '1/1 pointwise selections matched the server rubric.',
} as const;

function makeEnvelope(
  activityId: string,
  mode: 'guided_practice' | 'independent_practice',
  selectedOptionId: string,
) {
  return {
    contractVersion: 'practice.v1' as const,
    activityId,
    mode,
    status: 'submitted' as const,
    attemptNumber: 4,
    submittedAt: '2026-08-28T10:15:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId' as const, rawAnswer: selectedOptionId }],
  };
}

function makeRequest(body: unknown, idempotencyKey: string | null = IDEMPOTENCY_KEY): Request {
  return new Request('http://localhost/api/activities/precalculus-topic-1-2-pointwise/submissions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(idempotencyKey === null ? {} : { 'Idempotency-Key': idempotencyKey }),
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/activities/precalculus-topic-1-2-pointwise/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided', GUIDED_ACTIVITY_ID, 'guided_practice', 1],
    ['Independent', INDEPENDENT_ACTIVITY_ID, 'independent_practice', 2],
  ] as const)('accepts the exact %s raw envelope and calls only the pointwise mutation', async (
    _label,
    activityId,
    mode,
    seed,
  ) => {
    const selectedOptionId = generateTopic12PointwiseLeastRateChoice(seed).correctOptionId;
    const submissionData = makeEnvelope(activityId, mode, selectedOptionId);
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise/submissions/route');

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createTopic12PointwiseLeastRateSubmission',
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
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise/submissions/route');
    const submissionData = makeEnvelope(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      generateTopic12PointwiseLeastRateChoice(1).correctOptionId,
    );

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
    ['missing key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), null],
    ['blank key', makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), '  '],
    ['mismatched mode', makeEnvelope(GUIDED_ACTIVITY_ID, 'independent_practice', 'D'), IDEMPOTENCY_KEY],
    ['unknown activity', makeEnvelope('math.precalc.skill.1.2.other.guided_practice', 'guided_practice', 'D'), IDEMPOTENCY_KEY],
    ['extra outer learner field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), userId: LEARNER_ID }, IDEMPOTENCY_KEY],
    ['extra outer grade field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), score: 1 }, IDEMPOTENCY_KEY],
    ['extra outer correctness field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), isCorrect: true }, IDEMPOTENCY_KEY],
    ['extra answer field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), answers: { selectedOptionId: 'D', score: 1 } }, IDEMPOTENCY_KEY],
    ['extra part field', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), parts: [{ partId: 'selectedOptionId', rawAnswer: 'D', isCorrect: true }] }, IDEMPOTENCY_KEY],
    ['mismatched raw part', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), parts: [{ partId: 'selectedOptionId', rawAnswer: 'A' }] }, IDEMPOTENCY_KEY],
    ['invalid attempt number', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), attemptNumber: 0 }, IDEMPOTENCY_KEY],
    ['invalid submittedAt', { ...makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D'), submittedAt: 'not-a-date' }, IDEMPOTENCY_KEY],
  ] as const)('rejects %s before the pointwise mutation', async (_label, body, key) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise/submissions/route');

    const response = await POST(makeRequest(body, key));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON before the pointwise mutation', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise/submissions/route');
    const request = new Request('http://localhost/api/activities/precalculus-topic-1-2-pointwise/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': IDEMPOTENCY_KEY },
      body: '{',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns 409 only for the exact idempotency conflict sentinel', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise/submissions/route');
    const submissionData = makeEnvelope(
      INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
      generateTopic12PointwiseLeastRateChoice(2).correctOptionId,
    );
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Idempotency key was already used for a different submission',
    });
  });

  it.each([
    ['extra server result field', { ...SERVER_RESULT, internal: 'hidden' }],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['invalid score', { ...SERVER_RESULT, score: 2 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 2 }],
    ['invalid ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['invalid feedback', { ...SERVER_RESULT, feedback: 1 }],
  ] as const)('returns a safe 500 for %s', async (_label, serverResult) => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise/submissions/route');
    const submissionData = makeEnvelope(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      generateTopic12PointwiseLeastRateChoice(1).correctOptionId,
    );
    mocks.fetchInternalMutation.mockResolvedValueOnce(serverResult);

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to create Topic 1.2 pointwise least-rate practice submission',
    });
  });

  it('returns safe 500 responses for auth and non-conflict mutation errors', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-topic-1-2-pointwise/submissions/route');
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', 'D');

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
