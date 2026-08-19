import { describe, expect, it, vi } from 'vitest';

const ROUTE_MODULE = '../../../../../app/api/learning-evidence/precalculus-pilot/route';
const AUTHENTICATED_LEARNER_ID = 'authenticated-precalc-learner';
const CLIENT_LEARNER_ID = 'client-supplied-precalc-learner';
const SUBMISSION_ID = 'opaque-precalc-activity-submission-id';

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

type Route = {
  POST(request: Request): Promise<Response>;
};

type RouteFactory = (dependencies: {
  getServerSession: () => Promise<{ user: { id: string } } | null>;
  submitLearningEvidence: (input: {
    learnerId: string;
    submissionId: string;
  }) => Promise<unknown>;
}) => Route;

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/learning-evidence/precalculus-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function loadRouteFactory(): Promise<RouteFactory> {
  const source = await vi.importActual<Record<string, unknown>>(ROUTE_MODULE);
  const factory = source.createPrecalculusPilotRoute;

  if (typeof factory !== 'function') {
    throw new Error('AP Precalculus must export createPrecalculusPilotRoute(dependencies).');
  }

  return factory as RouteFactory;
}

async function createHarness() {
  const getServerSession = vi.fn(async () => ({
    user: { id: AUTHENTICATED_LEARNER_ID },
  }));
  const submitLearningEvidence = vi.fn(async () => ({
    ...SAFE_APPLIED_RESULT,
    submission: { submissionData: { rawAnswer: 'must-not-leave-the-server' } },
  }));
  const route = (await loadRouteFactory())({ getServerSession, submitLearningEvidence });

  return { getServerSession, route, submitLearningEvidence };
}

describe('AP Precalculus public learning-evidence submission authority', () => {
  it('accepts exactly one opaque submission ID and returns only the safe server result', async () => {
    const { getServerSession, route, submitLearningEvidence } = await createHarness();

    const response = await route.POST(makeRequest({ submissionId: SUBMISSION_ID }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(SAFE_APPLIED_RESULT);
    expect(JSON.stringify(body)).not.toContain('must-not-leave-the-server');
    expect(getServerSession).toHaveBeenCalledTimes(1);
    expect(submitLearningEvidence).toHaveBeenCalledWith({
      learnerId: AUTHENTICATED_LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
    expect(submitLearningEvidence.mock.calls[0]?.[0]).not.toHaveProperty('evidence');
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
    const { route, submitLearningEvidence } = await createHarness();

    const response = await route.POST(makeRequest(requestBody));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.stringContaining(field),
    }));
    expect(submitLearningEvidence).not.toHaveBeenCalled();
  });
});
