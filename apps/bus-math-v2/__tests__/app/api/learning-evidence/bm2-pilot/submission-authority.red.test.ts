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

const AUTHENTICATED_LEARNER_ID = 'authenticated-bm2-learner';
const CLIENT_LEARNER_ID = 'client-supplied-bm2-learner';
const SUBMISSION_ID = 'opaque-bm2-activity-submission-id';

const SAFE_APPLIED_RESULT = {
  persisted: true,
  masteryApplied: true,
  kstApplied: true,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'eligible',
    masteryBearing: true,
  },
} as const;

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/learning-evidence/bm2-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('BM2 public learning-evidence submission authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveStudentRequestClaims.mockResolvedValue({
      sub: AUTHENTICATED_LEARNER_ID,
      role: 'student',
    });
  });

  it('accepts exactly one opaque submission ID and returns only the safe server result', async () => {
    mocks.fetchInternalMutation.mockResolvedValue({
      ...SAFE_APPLIED_RESULT,
      submission: { submissionData: { rawAnswer: 'must-not-leave-the-server' } },
    });

    const response = await POST(makeRequest({ submissionId: SUBMISSION_ID }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(SAFE_APPLIED_RESULT);
    expect(JSON.stringify(body)).not.toContain('must-not-leave-the-server');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.learningEvidence.submit',
      { learnerId: AUTHENTICATED_LEARNER_ID, submissionId: SUBMISSION_ID },
    );
    expect(mocks.fetchInternalMutation.mock.calls[0]?.[1]).not.toHaveProperty('evidence');
  });

  it.each([
    ['learnerId', { learnerId: CLIENT_LEARNER_ID, submissionId: SUBMISSION_ID }],
    ['gradedEvidence', {
      submissionId: SUBMISSION_ID,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    }],
    ['evidence', {
      submissionId: SUBMISSION_ID,
      evidence: { gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 } },
    }],
  ])('rejects client-supplied %s before the server transaction', async (field, requestBody) => {
    const response = await POST(makeRequest(requestBody));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.stringContaining(field),
    }));
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
