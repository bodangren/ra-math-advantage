import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

const ROUTE_MODULE = '../../../../../app/api/learning-evidence/precalculus-pilot/route';
const SERVER_LEARNER_ID = 'session-learner-precalc';
const CLIENT_LEARNER_ID = 'client-supplied-learner';
const PILOT_NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';

type ServerSession = {
  user: {
    id: string;
  };
};

type SubmittedEvidence = {
  learnerId: string;
  evidence: LearningEvidenceV1;
};

type PrecalculusPilotRoute = {
  POST(request: Request): Promise<Response>;
};

type PrecalculusPilotRouteFactory = (dependencies: {
  getServerSession: () => Promise<ServerSession | null>;
  submitLearningEvidence: (input: SubmittedEvidence) => Promise<unknown>;
}) => PrecalculusPilotRoute;

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
    idempotencyKey: 'precalc-route-attempt-1',
    ...overrides,
  };
}

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/learning-evidence/precalculus-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function loadPrecalculusPilotRouteFactory(): Promise<PrecalculusPilotRouteFactory> {
  let module: Record<string, unknown>;

  try {
    module = await vi.importActual<Record<string, unknown>>(ROUTE_MODULE);
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : '';
    throw new Error(
      'Missing AP Precalculus learning-evidence route boundary. '
      + 'Add apps/pre-calculus/app/api/learning-evidence/precalculus-pilot/route.ts '
      + `and export createPrecalculusPilotRoute(dependencies).${detail}`,
    );
  }

  const factory = module.createPrecalculusPilotRoute;
  if (typeof factory !== 'function') {
    throw new Error(
      'AP Precalculus learning-evidence route must export '
      + 'createPrecalculusPilotRoute(dependencies).',
    );
  }

  return factory as PrecalculusPilotRouteFactory;
}

async function createHarness() {
  const getServerSession = vi.fn(async (): Promise<ServerSession> => ({
    user: { id: SERVER_LEARNER_ID },
  }));
  const submitLearningEvidence = vi.fn(async () => ({ accepted: true }));
  const factory = await loadPrecalculusPilotRouteFactory();
  const route = factory({ getServerSession, submitLearningEvidence });

  return { getServerSession, route, submitLearningEvidence };
}

describe('AP Precalculus learning-evidence route', () => {
  it('resolves the learner from the server session before it submits evidence', async () => {
    const { getServerSession, route, submitLearningEvidence } = await createHarness();
    const evidence = makeEvidence();

    const response = await route.POST(makeRequest({ evidence }));

    expect(response.ok).toBe(true);
    expect(getServerSession).toHaveBeenCalledTimes(1);
    expect(submitLearningEvidence).toHaveBeenCalledWith(expect.objectContaining({
      learnerId: SERVER_LEARNER_ID,
      evidence,
    }));
  });

  it('does not allow a client-supplied learner ID to select the learner', async () => {
    const { getServerSession, route, submitLearningEvidence } = await createHarness();
    const evidence = makeEvidence({ idempotencyKey: 'precalc-route-client-learner-id' });

    const response = await route.POST(makeRequest({
      learnerId: CLIENT_LEARNER_ID,
      evidence,
    }));

    expect(getServerSession).toHaveBeenCalledTimes(1);

    if (response.status >= 400 && response.status < 500) {
      expect(submitLearningEvidence).not.toHaveBeenCalled();
      return;
    }

    expect(response.ok).toBe(true);
    expect(submitLearningEvidence).toHaveBeenCalledWith(expect.objectContaining({
      learnerId: SERVER_LEARNER_ID,
      evidence,
    }));
    expect(submitLearningEvidence).not.toHaveBeenCalledWith(expect.objectContaining({
      learnerId: CLIENT_LEARNER_ID,
    }));
  });
});
