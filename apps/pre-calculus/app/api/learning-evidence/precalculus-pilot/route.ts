import {
  learningEvidenceV1Schema,
  type LearningEvidenceV1,
} from '@math-platform/practice-core/learning-evidence';

import {
  requireRequestSessionClaims,
} from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

export interface PrecalculusPilotSession {
  user: {
    id: string;
  };
}

export interface PrecalculusPilotRouteDependencies {
  getServerSession: () => Promise<PrecalculusPilotSession | null>;
  submitLearningEvidence: (input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }) => Promise<unknown>;
}

export interface PrecalculusPilotRoute {
  POST(request: Request): Promise<Response>;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function isEvidenceBody(body: unknown): body is { evidence: unknown } {
  return typeof body === 'object'
    && body !== null
    && 'evidence' in body;
}

function projectDecision(decision: unknown): Record<string, unknown> | undefined {
  if (typeof decision !== 'object' || decision === null) return undefined;

  const source = decision as Record<string, unknown>;
  const projected: Record<string, unknown> = {};
  for (const key of [
    'idempotency',
    'exposureState',
    'eligible',
    'reason',
    'masteryBearing',
  ]) {
    if (key in source) projected[key] = source[key];
  }

  return Object.keys(projected).length > 0 ? projected : undefined;
}

function projectResult(result: unknown): unknown {
  if (typeof result !== 'object' || result === null) {
    return { accepted: true };
  }

  const source = result as Record<string, unknown>;
  const decision = projectDecision(source.decision);
  if (decision === undefined && !('persisted' in source) && !('masteryApplied' in source)) {
    return { accepted: true };
  }

  return {
    ...(typeof source.persisted === 'boolean' ? { persisted: source.persisted } : {}),
    ...(typeof source.masteryApplied === 'boolean'
      ? { masteryApplied: source.masteryApplied }
      : {}),
    ...(decision ? { decision } : {}),
  };
}

/**
 * Creates the Precalculus pilot route with authentication and persistence
 * supplied by the app boundary.
 */
export function createPrecalculusPilotRoute({
  getServerSession,
  submitLearningEvidence,
}: PrecalculusPilotRouteDependencies): PrecalculusPilotRoute {
  return {
    POST: async (request) => {
      const session = await getServerSession();
      if (!session?.user?.id) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }

      if (!isEvidenceBody(body)) {
        return jsonResponse({ error: 'Evidence is required' }, 400);
      }

      const parsedEvidence = learningEvidenceV1Schema.safeParse(body.evidence);
      if (!parsedEvidence.success) {
        return jsonResponse({ error: 'Invalid learning evidence' }, 400);
      }

      let result: unknown;
      try {
        result = await submitLearningEvidence({
          learnerId: session.user.id,
          evidence: parsedEvidence.data,
        });
      } catch {
        return jsonResponse({ error: 'Unable to record learning evidence' }, 500);
      }

      return jsonResponse(projectResult(result), 200);
    },
  };
}

/**
 * Production route. The custom Precalculus session is the only source of
 * learner identity. The request body can provide evidence, but not ownership.
 */
export async function POST(request: Request): Promise<Response> {
  const claimsOrResponse = await requireRequestSessionClaims(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

  const route = createPrecalculusPilotRoute({
    getServerSession: async () => ({ user: { id: claimsOrResponse.sub } }),
    submitLearningEvidence: ({ learnerId, evidence }) => fetchInternalMutation(
      internal.learningEvidence.submit,
      { learnerId, evidence },
    ),
  });

  return route.POST(request);
}
