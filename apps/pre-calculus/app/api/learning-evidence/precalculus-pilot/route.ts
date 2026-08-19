import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';

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

function isEvidenceBody(body: unknown): body is { evidence: LearningEvidenceV1 } {
  return typeof body === 'object'
    && body !== null
    && 'evidence' in body;
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

      const result = await submitLearningEvidence({
        learnerId: session.user.id,
        evidence: body.evidence,
      });

      return jsonResponse(result ?? { accepted: true }, 200);
    },
  };
}
