import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic11PhysicalContextGraphChoice } from '@math-platform/math-content/knowledge-space';

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
      createPhysicalContextSubmission: 'internal.activities.createPhysicalContextSubmission',
    },
  },
}));

const LEARNER_ID = 'profiles:precalc-physical-context-practice-student';
const IDEMPOTENCY_KEY = 'precalc-physical-context-practice-key';
const SERVER_RESULT = {
  submissionId: 'activity_submissions:physical-context-practice',
  score: 1,
  maxScore: 1,
  attemptOrdinal: 2,
  feedback: '1/1 graph selections matched the server rubric.',
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
    attemptNumber: 7,
    submittedAt: '2026-08-20T10:15:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId' as const, rawAnswer: selectedOptionId }],
  };
}

function makeRequest(body: unknown, idempotencyKey: string | null = IDEMPOTENCY_KEY): Request {
  return new Request('http://localhost/api/activities/precalculus-physical-context/submissions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(idempotencyKey === null ? {} : { 'Idempotency-Key': idempotencyKey }),
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/activities/precalculus-physical-context/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ['Guided', PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID, 'guided_practice', 1],
    ['Independent', PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID, 'independent_practice', 2],
  ] as const)('accepts the exact %s raw practice envelope and calls only the physical mutation', async (
    _label,
    activityId,
    mode,
    seed,
  ) => {
    const selectedOptionId = generateTopic11PhysicalContextGraphChoice(seed).correctOptionId;
    const submissionData = makeEnvelope(activityId, mode, selectedOptionId);
    const { POST } = await import('@/app/api/activities/precalculus-physical-context/submissions/route');

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createPhysicalContextSubmission',
      {
        userId: LEARNER_ID,
        activityId,
        submissionData,
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    );
  });

  it('rejects non-student claims before the physical mutation', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-physical-context/submissions/route');
    const submissionData = makeEnvelope(
      PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      'guided_practice',
      generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
    );

    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: 'teacher' });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty('status', 403);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty('status', 403);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: 'student' });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty('status', 401);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing key', makeEnvelope(
      PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      'guided_practice',
      generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
    ), null],
    ['mismatched mode', makeEnvelope(
      PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      'independent_practice',
      generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
    ), IDEMPOTENCY_KEY],
    ['unknown activity', makeEnvelope(
      'math.precalc.skill.1.1.unknown.independent_practice',
      'independent_practice',
      generateTopic11PhysicalContextGraphChoice(2).correctOptionId,
    ), IDEMPOTENCY_KEY],
    ['extra outer authority field', {
      ...makeEnvelope(
        PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        'guided_practice',
        generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
      ),
      score: 1,
    }, IDEMPOTENCY_KEY],
    ['extra answer field', {
      ...makeEnvelope(
        PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        'guided_practice',
        generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
      ),
      answers: { selectedOptionId: 'C', score: 1 },
    }, IDEMPOTENCY_KEY],
    ['extra part field', {
      ...makeEnvelope(
        PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        'guided_practice',
        generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
      ),
      parts: [{ partId: 'selectedOptionId', rawAnswer: 'C', isCorrect: true }],
    }, IDEMPOTENCY_KEY],
    ['mismatched raw part', {
      ...makeEnvelope(
        PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        'guided_practice',
        generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
      ),
      parts: [{ partId: 'selectedOptionId', rawAnswer: 'A' }],
    }, IDEMPOTENCY_KEY],
    ['invalid attempt number', {
      ...makeEnvelope(
        PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        'guided_practice',
        generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
      ),
      attemptNumber: 0,
    }, IDEMPOTENCY_KEY],
    ['invalid submittedAt', {
      ...makeEnvelope(
        PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
        'guided_practice',
        generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
      ),
      submittedAt: 'not-a-date',
    }, IDEMPOTENCY_KEY],
  ] as const)('rejects %s before the physical mutation', async (_label, body, key) => {
    const { POST } = await import('@/app/api/activities/precalculus-physical-context/submissions/route');

    const response = await POST(makeRequest(body, key));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns 409 for the exact idempotency conflict sentinel', async () => {
    const { POST } = await import('@/app/api/activities/precalculus-physical-context/submissions/route');
    const submissionData = makeEnvelope(
      PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
      generateTopic11PhysicalContextGraphChoice(2).correctOptionId,
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
    ['invalid score', { ...SERVER_RESULT, score: 2 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 2 }],
    ['invalid ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
  ] as const)('returns a safe 500 for %s', async (_label, serverResult) => {
    const { POST } = await import('@/app/api/activities/precalculus-physical-context/submissions/route');
    const submissionData = makeEnvelope(
      PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      'guided_practice',
      generateTopic11PhysicalContextGraphChoice(1).correctOptionId,
    );
    mocks.fetchInternalMutation.mockResolvedValueOnce(serverResult);

    const response = await POST(makeRequest(submissionData));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to create physical-context practice submission',
    });
  });
});
