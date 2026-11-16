import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireActiveStudentRequestClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireActiveStudentRequestClaims: mocks.requireActiveStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    learningEvidence: {
      submit: 'internal.learningEvidence.submit',
    },
  },
}));

import { POST } from '@/app/api/learning-evidence/bm2-pilot/route';

const SERVER_LEARNER_ID = 'authenticated-bm2-learner';
const CLIENT_LEARNER_ID = 'client-supplied-learner';
const SERVER_SUBMISSION_ID = 'server-owned-bm2-submission';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/learning-evidence/bm2-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const APPLIED_RESULT = {
  persisted: true,
  masteryApplied: true,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'eligible',
    masteryBearing: true,
  },
} as const;

const REPLAY_RESULT = { ...APPLIED_RESULT, delivery: 'replay' } as const;

const SUBMISSION_NOT_FOUND = {
  accepted: false,
  reason: 'submission_not_found',
} as const;

describe('BM2 production learning-evidence route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveStudentRequestClaims.mockResolvedValue({
      sub: SERVER_LEARNER_ID,
      role: 'student',
    });
    mocks.fetchInternalMutation.mockResolvedValue(APPLIED_RESULT);
  });

  it('uses the authenticated learner and server-owned submission ID only', async () => {
    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(APPLIED_RESULT);
    expect(mocks.requireActiveStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.learningEvidence.submit',
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
    expect(mocks.fetchInternalMutation.mock.calls[0]?.[1]).not.toHaveProperty('evidence');
  });

  it.each([
    ['learnerId', { learnerId: CLIENT_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID }],
    ['evidence', {
      submissionId: SERVER_SUBMISSION_ID,
      evidence: { gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 } },
    }],
    ['gradedEvidence', {
      submissionId: SERVER_SUBMISSION_ID,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    }],
    ['extra', { submissionId: SERVER_SUBMISSION_ID, extra: 'not accepted' }],
  ])('rejects client-supplied %s before the server transaction', async (field, body) => {
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.stringContaining(field),
    }));
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects a request without a server-owned submission ID', async () => {
    const response = await POST(makeRequest({
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'submissionId is required' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['an unknown submission', 'unknown-bm2-submission'],
    ['a submission owned by another learner', 'other-learner-bm2-submission'],
    ['a submission whose referenced physical activity is not the BM2 source', 'wrong-source-bm2-submission'],
    ['a submission missing stored source authority', 'missing-authority-bm2-submission'],
  ])('does not disclose %s', async (_label, submissionId) => {
    mocks.fetchInternalMutation.mockResolvedValueOnce(SUBMISSION_NOT_FOUND);

    const response = await POST(makeRequest({ submissionId }));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Submission not found' });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.learningEvidence.submit',
      { learnerId: SERVER_LEARNER_ID, submissionId },
    );
  });

  it('maps a stored server ordinal conflict to a generic HTTP 409 response', async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      accepted: false,
      reason: 'attempt_ordinal_conflict',
      latestAttemptOrdinal: 8,
      receivedAttemptOrdinal: 2,
    });

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(409);
    const payload = await response.json() as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(['error']);
    expect(payload.error).toEqual(expect.any(String));
    expect(JSON.stringify(payload)).not.toContain('attempt_ordinal_conflict');
    expect(JSON.stringify(payload)).not.toContain('8');
  });

  it('fails safely for a partial stored server ordinal conflict', async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      accepted: false,
      reason: 'attempt_ordinal_conflict',
      latestAttemptOrdinal: 8,
    });

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(500);
    const payload = await response.json() as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(['error']);
    expect(JSON.stringify(payload)).not.toContain('latestAttemptOrdinal');
    expect(JSON.stringify(payload)).not.toContain('receivedAttemptOrdinal');
    expect(JSON.stringify(payload)).not.toContain('8');
  });

  it('fails safely for an internal result with a private decision field', async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      ...APPLIED_RESULT,
      decision: {
        ...APPLIED_RESULT.decision,
        privateDecisionDetail: 'must-not-reach-browser',
      },
    });

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(500);
    const payload = await response.json() as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(['error']);
    expect(JSON.stringify(payload)).not.toContain('privateDecisionDetail');
    expect(JSON.stringify(payload)).not.toContain('must-not-reach-browser');
  });

  it('maps an incomplete or unexpected durable result to a generic HTTP 500 response', async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
      internalSubmissionId: 'must-not-reach-browser',
    });

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(500);
    const payload = await response.json() as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(['error']);
    expect(payload.error).toEqual(expect.any(String));
    expect(JSON.stringify(payload)).not.toContain('awaiting_teacher_exposure');
    expect(JSON.stringify(payload)).not.toContain('must-not-reach-browser');
  });

  it('replays one server-owned submission without another KST or SRS effect', async () => {
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(APPLIED_RESULT)
      .mockResolvedValueOnce(REPLAY_RESULT);

    const first = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));
    const replay = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(APPLIED_RESULT);
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(REPLAY_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      'internal.learningEvidence.submit',
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      'internal.learningEvidence.submit',
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
  });

  it('returns the authentication response without calling the transaction', async () => {
    mocks.requireActiveStudentRequestClaims.mockResolvedValue(new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    ));

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
