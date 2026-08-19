import {
  learningEvidenceV1Schema,
  type LearningEvidenceV1,
} from '@math-platform/practice-core/learning-evidence';

import { requireActiveStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

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

function projectResult(result: unknown): unknown {
  if (typeof result !== 'object' || result === null) {
    return { accepted: true };
  }

  const source = result as Record<string, unknown>;
  const decision = source.decision;
  const projectedDecision = typeof decision === 'object' && decision !== null
    ? Object.fromEntries(
        ['idempotency', 'exposureState', 'eligible', 'reason', 'masteryBearing']
          .filter((key) => key in decision)
          .map((key) => [key, (decision as Record<string, unknown>)[key]]),
      )
    : undefined;

  return {
    ...(typeof source.persisted === 'boolean' ? { persisted: source.persisted } : {}),
    ...(typeof source.masteryApplied === 'boolean'
      ? { masteryApplied: source.masteryApplied }
      : {}),
    ...(projectedDecision && Object.keys(projectedDecision).length > 0
      ? { decision: projectedDecision }
      : {}),
  };
}

/**
 * Authenticated BM2 evidence route. Learner identity comes from the active
 * student session. The request body supplies evidence only.
 */
export async function POST(request: Request): Promise<Response> {
  const claimsOrResponse = await requireActiveStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

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

  if (parsedEvidence.data.origin !== 'mastery_advantage') {
    return jsonResponse({ error: 'Invalid learning evidence' }, 400);
  }

  let result: unknown;
  try {
    result = await fetchInternalMutation(internal.learningEvidence.submit, {
      learnerId: claimsOrResponse.sub as Id<'profiles'>,
      evidence: parsedEvidence.data as LearningEvidenceV1,
    });
  } catch {
    return jsonResponse({ error: 'Unable to record learning evidence' }, 500);
  }

  return jsonResponse(projectResult(result), 200);
}
