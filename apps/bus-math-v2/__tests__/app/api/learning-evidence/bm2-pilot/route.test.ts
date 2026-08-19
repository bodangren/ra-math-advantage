import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

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
const PILOT_NODE_ID = 'math.bm2.skill.1.1.apply-accounting-equation';

function makeEvidence(
  overrides: Partial<LearningEvidenceV1> = {},
): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: 'accounting-equation',
    attemptOrdinal: 1,
    origin: 'mastery_advantage',
    mode: 'independent_practice',
    occurredAt: '2026-08-19T10:00:00.000Z',
    gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    idempotencyKey: 'bm2-production-route-attempt-1',
    ...overrides,
  };
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/learning-evidence/bm2-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const RESULT = {
  persisted: true,
  masteryApplied: true,
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'eligible',
    masteryBearing: true,
  },
} as const;

describe('BM2 production learning-evidence route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveStudentRequestClaims.mockResolvedValue({
      sub: SERVER_LEARNER_ID,
      role: 'student',
    });
    mocks.fetchInternalMutation.mockResolvedValue(RESULT);
  });

  it('uses only the authenticated learner ID for the internal transaction', async () => {
    const evidence = makeEvidence();

    const response = await POST(makeRequest({
      learnerId: CLIENT_LEARNER_ID,
      evidence,
    }));

    expect(response.status).toBe(200);
    expect(mocks.requireActiveStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.learningEvidence.submit',
      { learnerId: SERVER_LEARNER_ID, evidence },
    );
  });

  it('returns the authentication response without calling the transaction', async () => {
    mocks.requireActiveStudentRequestClaims.mockResolvedValue(new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    ));

    const response = await POST(makeRequest({ evidence: makeEvidence() }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['an unknown v1 envelope field', { ...makeEvidence(), rawAnswer: 'not allowed' }],
    ['a nested unknown v1 field', {
      ...makeEvidence(),
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1, rawAnswer: 'not allowed' },
    }],
    ['a noncanonical v1 timestamp', {
      ...makeEvidence(),
      occurredAt: '2026-08-19T10:00:00+00:00',
    }],
  ])('rejects %s before it calls the transaction', async (_label, evidence) => {
    const response = await POST(makeRequest({ evidence }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid learning evidence' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns the persisted decision without exposing raw submission data', async () => {
    const response = await POST(makeRequest({ evidence: makeEvidence() }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(RESULT);
  });
});
