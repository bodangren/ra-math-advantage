import { requireActiveStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

function parseSubmissionId(body: unknown): { submissionId: string | null; error?: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { submissionId: null, error: 'submissionId is required' };
  }

  const keys = Object.keys(body);
  if (!keys.includes('submissionId')) {
    return { submissionId: null, error: 'submissionId is required' };
  }
  if (keys.length !== 1) {
    return {
      submissionId: null,
      error: `Only submissionId is accepted; rejected field(s): ${keys
        .filter((key) => key !== 'submissionId')
        .join(', ')}`,
    };
  }

  const submissionId = (body as { submissionId?: unknown }).submissionId;
  return typeof submissionId === 'string' && submissionId.trim().length > 0
    ? { submissionId }
    : { submissionId: null, error: 'submissionId is required' };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function projectResult(result: unknown): Record<string, unknown> | null {
  if (!isRecord(result)) return null;

  if (
    Object.keys(result).length !== 5
    || !Object.prototype.hasOwnProperty.call(result, 'persisted')
    || !Object.prototype.hasOwnProperty.call(result, 'masteryApplied')
    || !Object.prototype.hasOwnProperty.call(result, 'kstApplied')
    || !Object.prototype.hasOwnProperty.call(result, 'delivery')
    || !Object.prototype.hasOwnProperty.call(result, 'decision')
  ) return null;

  const decision = result.decision;
  if (
    typeof result.persisted !== 'boolean'
    || typeof result.masteryApplied !== 'boolean'
    || typeof result.kstApplied !== 'boolean'
    || (result.delivery !== 'new' && result.delivery !== 'replay')
    || !isRecord(decision)
    || Object.keys(decision).length !== 5
    || !Object.prototype.hasOwnProperty.call(decision, 'idempotency')
    || !Object.prototype.hasOwnProperty.call(decision, 'exposureState')
    || !Object.prototype.hasOwnProperty.call(decision, 'eligible')
    || !Object.prototype.hasOwnProperty.call(decision, 'reason')
    || !Object.prototype.hasOwnProperty.call(decision, 'masteryBearing')
  ) {
    return null;
  }

  return {
    persisted: result.persisted,
    masteryApplied: result.masteryApplied,
    kstApplied: result.kstApplied,
    delivery: result.delivery,
    decision: {
      idempotency: decision.idempotency,
      exposureState: decision.exposureState,
      eligible: decision.eligible,
      reason: decision.reason,
      masteryBearing: decision.masteryBearing,
    },
  };
}

/**
 * Authenticated BM2 evidence route. Learner identity comes from the active
 * student session. The request body supplies only the opaque submission ID.
 */
export async function POST(request: Request): Promise<Response> {
  const claimsOrResponse = await requireActiveStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsedSubmission = parseSubmissionId(body);
  if (parsedSubmission.submissionId === null) {
    return Response.json(
      { error: parsedSubmission.error ?? 'submissionId is required' },
      { status: 400 },
    );
  }

  let result: unknown;
  try {
    result = await fetchInternalMutation(internal.learningEvidence.submit, {
      learnerId: claimsOrResponse.sub as Id<'profiles'>,
      submissionId: parsedSubmission.submissionId as Id<'activity_submissions'>,
    });
  } catch {
    return Response.json({ error: 'Unable to record learning evidence' }, { status: 500 });
  }

  if (
    typeof result === 'object'
    && result !== null
    && (result as { accepted?: unknown }).accepted === false
    && (result as { reason?: unknown }).reason === 'submission_not_found'
  ) {
    return Response.json({ error: 'Submission not found' }, { status: 404 });
  }

  if (
    isRecord(result)
    && result.accepted === false
    && result.reason === 'attempt_ordinal_conflict'
    && typeof result.latestAttemptOrdinal === 'number'
    && Number.isFinite(result.latestAttemptOrdinal)
    && typeof result.receivedAttemptOrdinal === 'number'
    && Number.isFinite(result.receivedAttemptOrdinal)
  ) {
    return Response.json(
      { error: 'The submission attempt is no longer current' },
      { status: 409 },
    );
  }

  const projected = projectResult(result);
  if (!projected) {
    return Response.json({ error: 'Unable to record learning evidence' }, { status: 500 });
  }

  return Response.json(projected, { status: 200 });
}
