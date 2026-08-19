import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireRequestSessionClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireRequestSessionClaims: mocks.requireRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    learningEvidence: {
      submit: 'internal.learningEvidence.submit',
    },
  },
}));

import { POST } from '@/app/api/learning-evidence/precalculus-pilot/route';

const SERVER_LEARNER_ID = 'authenticated-precalc-learner';
const CLIENT_LEARNER_ID = 'client-supplied-learner';
const PILOT_NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';

function makeEvidence(
  overrides: Partial<LearningEvidenceV1> = {},
): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: `${PILOT_NODE_ID}.guided_practice`,
    attemptOrdinal: 1,
    origin: 'mastery_advantage',
    mode: 'guided_practice',
    occurredAt: '2026-08-19T10:00:00.000Z',
    gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    idempotencyKey: 'precalc-production-route-attempt-1',
    ...overrides,
  };
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/learning-evidence/precalculus-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const KST_FAIL_CLOSED_RESULT = {
  persisted: true,
  masteryApplied: true,
  kstApplied: false,
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'eligible',
    masteryBearing: true,
  },
} as const;

describe('AP Precalculus production learning-evidence route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRequestSessionClaims.mockResolvedValue({ sub: SERVER_LEARNER_ID });
    mocks.fetchInternalMutation.mockResolvedValue(KST_FAIL_CLOSED_RESULT);
  });

  it('uses only the authenticated learner ID for the internal transaction', async () => {
    const evidence = makeEvidence();

    const response = await POST(makeRequest({
      learnerId: CLIENT_LEARNER_ID,
      evidence,
    }));

    expect(response.status).toBe(200);
    expect(mocks.requireRequestSessionClaims).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.learningEvidence.submit',
      { learnerId: SERVER_LEARNER_ID, evidence },
    );
  });

  it('rejects forged teacher-led evidence before calling the internal transaction', async () => {
    const evidence = makeEvidence({ origin: 'teacher_led' });

    const response = await POST(makeRequest({ evidence }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns the authentication response without calling the transaction', async () => {
    mocks.requireRequestSessionClaims.mockResolvedValue(new Response(
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

  it('returns the explicit fail-closed KST state with the transaction result', async () => {
    const response = await POST(makeRequest({ evidence: makeEvidence() }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(KST_FAIL_CLOSED_RESULT);
  });
});
