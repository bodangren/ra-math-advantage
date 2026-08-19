import { requireDanielsonApiSession } from '@/lib/auth/server';

const COMMAND_FIELDS = new Set(['observationId', 'content']);

/** Authenticate first. Then keep only approved report command fields. */
export async function readReportingRequest(request: Request) {
  const claimsOrResponse = await requireDanielsonApiSession(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  return {
    claims: claimsOrResponse,
    command: Object.fromEntries(
      Object.entries(body).filter(([field]) => COMMAND_FIELDS.has(field)),
    ),
  };
}

type ReportingResult = { kind?: string; reason?: string };

/** Convert an internal reporting result to a stable public response. */
export function reportingResultResponse(result: ReportingResult) {
  if (result.kind === 'created' || result.kind === 'submitted') return Response.json(result);
  if (result.kind === 'response_exists') {
    return Response.json({ error: 'A final response already exists.' }, { status: 409 });
  }
  if (result.kind === 'not_found') {
    return Response.json({ error: 'The submitted observation was not found.' }, { status: 404 });
  }
  if (result.kind === 'denied') {
    return Response.json({ error: 'You do not have access to this action.' }, { status: 403 });
  }
  if (result.kind === 'invalid_comment') {
    return Response.json({ error: 'Enter a comment of 4,000 characters or fewer.' }, { status: 400 });
  }
  if (result.kind === 'invalid_response') {
    return Response.json({ error: 'Enter a response of 4,000 characters or fewer.' }, { status: 400 });
  }
  return Response.json({ error: 'The report action failed.' }, { status: 400 });
}

export async function safeReportingMutation(run: () => Promise<ReportingResult>) {
  try {
    return reportingResultResponse(await run());
  } catch {
    return Response.json({ error: 'The report action failed.' }, { status: 400 });
  }
}
