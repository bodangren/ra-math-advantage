import { requireActiveTeacherRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

/** Verify one Guided notebook submission as trusted teacher exposure. */
export async function POST(request: Request): Promise<Response> {
  const claimsOrResponse = await requireActiveTeacherRequestClaims(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (
    typeof record.learnerId !== 'string'
    || typeof record.submissionId !== 'string'
    || Object.keys(record).some((key) => !['learnerId', 'submissionId'].includes(key))
  ) {
    return Response.json({ error: 'learnerId and submissionId are required' }, { status: 400 });
  }

  let result;
  try {
    result = await fetchInternalMutation(internal.learningEvidence.verifyTeacherExposure, {
      teacherId: claimsOrResponse.sub as Id<'profiles'>,
      learnerId: record.learnerId as Id<'profiles'>,
      submissionId: record.submissionId as Id<'activity_submissions'>,
    });
  } catch {
    return Response.json({ error: 'Unable to verify teacher exposure' }, { status: 500 });
  }
  if (result && typeof result === 'object' && 'accepted' in result && result.accepted === false) {
    return Response.json({ error: 'Submission not found' }, { status: 404 });
  }
  return Response.json(result);
}
