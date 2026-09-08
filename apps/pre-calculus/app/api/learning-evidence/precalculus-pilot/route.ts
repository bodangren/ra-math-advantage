import {
  requireStudentRequestClaims,
} from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

export interface PrecalculusPilotSession {
  user: {
    id: string;
    role?: 'student' | 'teacher' | 'admin';
  };
}

export interface PrecalculusPilotRouteDependencies {
  getServerSession: (request: Request) => Promise<PrecalculusPilotSession | null>;
  submitLearningEvidence: (input: {
    learnerId: string;
    submissionId: string;
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

function parseSubmissionId(body: unknown): { value: string | null; error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { value: null, error: 'submissionId is required' };
  const keys = Object.keys(body);
  const rejected = keys.filter((key) => key !== 'submissionId');
  if (rejected.length > 0) return { value: null, error: `Rejected field(s): ${rejected.join(', ')}` };
  if (keys.length !== 1) return { value: null, error: 'submissionId is required' };
  const value = (body as { submissionId?: unknown }).submissionId;
  return typeof value === 'string' && value.trim().length > 0
    ? { value, error: '' }
    : { value: null, error: 'submissionId is required' };
}

function projectDecision(decision: unknown): Record<string, unknown> | undefined {
  if (typeof decision !== 'object' || decision === null || Array.isArray(decision)) return undefined;

  const source = decision as Record<string, unknown>;
  if (
    Object.keys(source).sort().join('|') !== 'eligible|exposureState|idempotency|masteryBearing|reason'
    || typeof source.idempotency !== 'string'
    || !['new', 'replay', 'conflict'].includes(source.idempotency)
    || typeof source.exposureState !== 'string'
    || !['awaiting_teacher_exposure', 'introduced'].includes(source.exposureState)
    || typeof source.eligible !== 'boolean'
    || typeof source.reason !== 'string'
    || !['awaiting_teacher_exposure', 'ungraded_evidence', 'eligible'].includes(source.reason)
    || typeof source.masteryBearing !== 'boolean'
  ) return undefined;
  return {
    idempotency: source.idempotency, exposureState: source.exposureState,
    eligible: source.eligible, reason: source.reason, masteryBearing: source.masteryBearing,
  };
}

function projectResult(result: unknown): unknown {
  if (typeof result !== 'object' || result === null) {
    return null;
  }

  const source = result as Record<string, unknown>;
  const decision = projectDecision(source.decision);
  if (
    decision === undefined
    || typeof source.persisted !== 'boolean'
    || typeof source.masteryApplied !== 'boolean'
    || source.kstApplied !== false
    || (source.delivery !== 'new' && source.delivery !== 'replay')
  ) {
    return null;
  }

  const awaitingExposure = decision.reason === 'awaiting_teacher_exposure';
  const independentEvidence = decision.reason === 'eligible';
  // A replay returns the original decision stored by the first delivery.
  if (
    decision.idempotency !== 'new'
    || decision.eligible !== independentEvidence
    || decision.masteryBearing !== independentEvidence
    || (decision.exposureState === 'introduced') !== !awaitingExposure
    || source.persisted !== !awaitingExposure
    || source.masteryApplied !== independentEvidence
    || awaitingExposure && source.delivery !== 'new'
  ) return null;

  return {
    ...(typeof source.persisted === 'boolean' ? { persisted: source.persisted } : {}),
    ...(typeof source.masteryApplied === 'boolean'
      ? { masteryApplied: source.masteryApplied }
      : {}),
    ...(typeof source.kstApplied === 'boolean' ? { kstApplied: source.kstApplied } : {}),
    ...(source.delivery === 'new' || source.delivery === 'replay' ? { delivery: source.delivery } : {}),
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
      const session = await getServerSession(request);
      if (!session?.user?.id) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      if (session.user.role !== undefined && session.user.role !== 'student') {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }

      const parsedSubmission = parseSubmissionId(body);
      if (!parsedSubmission.value) return jsonResponse({ error: parsedSubmission.error }, 400);

      let result: unknown;
      try {
        result = await submitLearningEvidence({
          learnerId: session.user.id,
          submissionId: parsedSubmission.value,
        });
      } catch {
        return jsonResponse({ error: 'Unable to record learning evidence' }, 500);
      }

      if (typeof result === 'object' && result !== null) {
        const rejected = result as Record<string, unknown>;
        if (rejected.accepted === false && rejected.reason === 'submission_not_found') {
          return jsonResponse({ error: 'Submission not found' }, 404);
        }
        if (
          rejected.accepted === false
          && rejected.reason === 'attempt_ordinal_conflict'
          && typeof rejected.latestAttemptOrdinal === 'number'
          && Number.isFinite(rejected.latestAttemptOrdinal)
          && typeof rejected.receivedAttemptOrdinal === 'number'
          && Number.isFinite(rejected.receivedAttemptOrdinal)
        ) {
          return jsonResponse({ error: 'The submission attempt is no longer current' }, 409);
        }
      }

      const projected = projectResult(result);
      return projected
        ? jsonResponse(projected, 200)
        : jsonResponse({ error: 'Unable to record learning evidence' }, 500);
    },
  };
}

/**
 * Production route. The custom Precalculus session is the only source of
 * learner identity. The request body can provide only an opaque submission ID.
 */
export async function POST(request: Request): Promise<Response> {
  const claimsOrResponse = await requireStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

  const route = createPrecalculusPilotRoute({
    getServerSession: async () => ({ user: { id: claimsOrResponse.sub, role: 'student' } }),
    submitLearningEvidence: ({ learnerId, submissionId }) => fetchInternalMutation(
      internal.selectedLearningEvidence.submitSelected,
      { learnerId, submissionId },
    ),
  });

  return route.POST(request);
}
