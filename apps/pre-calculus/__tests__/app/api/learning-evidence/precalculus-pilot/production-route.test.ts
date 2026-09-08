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
    selectedLearningEvidence: {
      submitSelected: 'selectedLearningEvidence:submitSelected',
    },
  },
}));

import { POST } from '@/app/api/learning-evidence/precalculus-pilot/route';

const SERVER_LEARNER_ID = 'authenticated-precalc-learner';
const CLIENT_LEARNER_ID = 'client-supplied-learner';
const SERVER_SUBMISSION_ID = 'server-owned-precalc-submission';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/learning-evidence/precalculus-pilot', {
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

const ATTEMPT_ORDINAL_CONFLICT = {
  accepted: false,
  reason: 'attempt_ordinal_conflict',
  latestAttemptOrdinal: 8,
  receivedAttemptOrdinal: 2,
} as const;

describe('AP Precalculus production learning-evidence route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const studentClaims = { sub: SERVER_LEARNER_ID, role: 'student' };
    mocks.requireStudentRequestClaims.mockResolvedValue(studentClaims);
    mocks.fetchInternalMutation.mockResolvedValue(APPLIED_RESULT);
  });

  it('uses the authenticated learner and server-owned submission ID only', async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      ...APPLIED_RESULT,
      submission: { submissionData: { rawAnswer: 'do-not-return' } },
    });

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(APPLIED_RESULT);
    expect(JSON.stringify(body)).not.toContain('do-not-return');
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'selectedLearningEvidence:submitSelected',
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
    expect(mocks.fetchInternalMutation.mock.calls[0]?.[1]).not.toHaveProperty('evidence');
  });

  it.each(['teacher', 'admin'] as const)(
    'rejects an authenticated %s before the evidence transaction',
    async (_role) => {
      const forbidden = new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      );
      mocks.requireStudentRequestClaims.mockResolvedValue(forbidden);

      const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

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
    await expect(response.json()).resolves.toEqual({ error: 'Rejected field(s): gradedEvidence' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['an unknown submission', 'unknown-precalc-submission'],
    ['a submission owned by another learner', 'other-learner-precalc-submission'],
  ])('does not disclose %s', async (_label, submissionId) => {
    mocks.fetchInternalMutation.mockResolvedValueOnce(SUBMISSION_NOT_FOUND);

    const response = await POST(makeRequest({ submissionId }));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Submission not found' });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'selectedLearningEvidence:submitSelected',
      { learnerId: SERVER_LEARNER_ID, submissionId },
    );
  });

  it('maps the exact stored attempt-ordinal conflict to one safe HTTP 409 response', async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce(ATTEMPT_ORDINAL_CONFLICT);

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(409);
    const payload = await response.json() as Record<string, unknown>;
    expect(Object.keys(payload)).toStrictEqual(['error']);
    expect(payload.error).toEqual('The submission attempt is no longer current');
    expect(JSON.stringify(payload)).not.toContain('attempt_ordinal_conflict');
    expect(JSON.stringify(payload)).not.toContain('8');
    expect(JSON.stringify(payload)).not.toContain('2');
  });

  it.each([
    ['a partial ordinal conflict', {
      accepted: false,
      reason: 'attempt_ordinal_conflict',
    }],
    ['an unrecognized false result', {
      accepted: false,
      reason: 'unexpected_internal_reason',
    }],
    ['a partial durable result', {
      persisted: true,
      delivery: 'new',
    }],
    ['a primitive result', false],
  ])('rejects %s as an internal failure instead of returning false success', async (_label, result) => {
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: 'Unable to record learning evidence',
    });
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
      'selectedLearningEvidence:submitSelected',
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      'selectedLearningEvidence:submitSelected',
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
  });

  it('returns the authentication response without calling the transaction', async () => {
    mocks.requireStudentRequestClaims.mockResolvedValue(new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    ));

    const response = await POST(makeRequest({ submissionId: SERVER_SUBMISSION_ID }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
