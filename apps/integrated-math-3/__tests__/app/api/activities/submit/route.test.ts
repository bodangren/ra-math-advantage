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
      submitActivity: 'activities:submitActivity',
    },
  },
}));

import { POST } from '@/app/api/activities/submit/route';

const SERVER_LEARNER_ID = 'authenticated-im3-learner';
const FORGED_LEARNER_ID = 'forged-browser-learner';
const PILOT_ACTIVITY_ID = 'activities:im3-public-create-boundary-pilot';

const GENERIC_ENVELOPE = {
  contractVersion: 'practice.v1',
  activityId: 'generic-im3-activity',
  mode: 'assessment',
  status: 'submitted',
  attemptNumber: 2,
  submittedAt: '2026-08-20T10:00:00.000Z',
  answers: { q1: 'A', q2: 'B' },
  parts: [
    { partId: 'q1', rawAnswer: 'A' },
    { partId: 'q2', rawAnswer: 'B' },
  ],
  artifact: { graph: 'client-artifact' },
  interactionHistory: [{ type: 'hint', at: '2026-08-20T09:59:00.000Z' }],
  analytics: { timeSpent: 120 },
  studentFeedback: 'I am ready to submit.',
  timing: {
    startedAt: '2026-08-20T09:58:00.000Z',
    submittedAt: '2026-08-20T10:00:00.000Z',
    wallClockMs: 120000,
    activeMs: 110000,
    idleMs: 10000,
    pauseCount: 0,
    focusLossCount: 0,
    visibilityHiddenCount: 0,
    confidence: 'high',
  },
} as const;

function makeRequest(
  body: unknown,
  idempotencyKey: string | null = 'im3-generic-submit-key',
): Request {
  return new Request('http://localhost/api/activities/submit', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(idempotencyKey === null ? {} : { 'Idempotency-Key': idempotencyKey }),
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/activities/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: SERVER_LEARNER_ID,
      username: 'alice',
      role: 'student',
    });
    mocks.fetchInternalMutation.mockResolvedValue({
      id: 'generic-im3-submission',
      score: 6,
      maxScore: 8,
    });
  });

  it('forwards one full generic practice.v1 envelope under the authenticated learner', async () => {
    const response = await POST(makeRequest({
      ...GENERIC_ENVELOPE,
      learnerId: FORGED_LEARNER_ID,
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      submissionId: 'generic-im3-submission',
      score: 6,
      maxScore: 8,
    });
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'activities:submitActivity',
      {
        userId: SERVER_LEARNER_ID,
        activityId: GENERIC_ENVELOPE.activityId,
        submissionData: GENERIC_ENVELOPE,
        idempotencyKey: 'im3-generic-submit-key',
      },
    );

    const submitted = mocks.fetchInternalMutation.mock.calls[0]?.[1];
    expect(submitted).not.toHaveProperty('learnerId');
    expect(submitted.submissionData).not.toHaveProperty('learnerId');
  });

  it('forwards the exact equation-rate Worked envelope under the authenticated learner', async () => {
    const equationWorkedEnvelope = {
      contractVersion: 'practice.v1',
      activityId: 'activities:im3-equation-rate-worked',
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: {},
      parts: [],
    } as const;

    const response = await POST(makeRequest({
      ...equationWorkedEnvelope,
      learnerId: FORGED_LEARNER_ID,
    }, 'im3-equation-rate-worked-route-key'));

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'activities:submitActivity',
      {
        userId: SERVER_LEARNER_ID,
        activityId: equationWorkedEnvelope.activityId,
        submissionData: equationWorkedEnvelope,
        idempotencyKey: 'im3-equation-rate-worked-route-key',
      },
    );

    const forwarded = mocks.fetchInternalMutation.mock.calls[0]?.[1];
    expect(forwarded.userId).toBe(SERVER_LEARNER_ID);
    expect(forwarded).not.toHaveProperty('learnerId');
    expect(forwarded.submissionData).not.toHaveProperty('learnerId');
    expect(Object.keys(forwarded.submissionData).sort()).toEqual([
      'activityId',
      'answers',
      'attemptNumber',
      'contractVersion',
      'mode',
      'parts',
      'status',
      'submittedAt',
    ]);
  });

  it('rejects a missing idempotency key before the mutation', async () => {
    const response = await POST(makeRequest(GENERIC_ENVELOPE, null));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: expect.stringMatching(/idempotency/i),
    });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects an invalid generic envelope before the mutation', async () => {
    const response = await POST(makeRequest({
      ...GENERIC_ENVELOPE,
      contractVersion: 'practice.v2',
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.any(String),
    }));
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects an opaque submission ID at the generic route before the mutation', async () => {
    const response = await POST(makeRequest({ submissionId: 'activity_submissions:opaque-only' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.any(String),
    }));
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns the authentication response without calling the generic mutation', async () => {
    mocks.requireStudentRequestClaims.mockResolvedValue(new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    ));

    const response = await POST(makeRequest(GENERIC_ENVELOPE));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns a safe HTTP 500 when the generic mutation rejects a mastery pilot', async () => {
    mocks.fetchInternalMutation.mockRejectedValueOnce(
      new Error('IM3 Mastery Advantage submissions must use the server-owned create path'),
    );

    const response = await POST(makeRequest({
      ...GENERIC_ENVELOPE,
      activityId: PILOT_ACTIVITY_ID,
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to submit activity' });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'activities:submitActivity',
      expect.objectContaining({
        userId: SERVER_LEARNER_ID,
        activityId: PILOT_ACTIVITY_ID,
        idempotencyKey: 'im3-generic-submit-key',
      }),
    );
  });

  it('returns a safe HTTP 409 for an exact idempotency conflict', async () => {
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));

    const response = await POST(makeRequest(GENERIC_ENVELOPE));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: 'Idempotency key was already used for a different submission',
    });
  });
});
