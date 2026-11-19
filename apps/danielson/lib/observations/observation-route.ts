import { requireDanielsonApiSession } from "@/lib/auth/server";

const COMMAND_FIELDS = new Set([
  "draftId",
  "teacherProfileId",
  "observationType",
  "schoolYear",
  "observedAt",
  "componentIds",
  "expectedRevision",
  "expectedVersion",
  "items",
  "confirmed",
  "submissionKey",
  "observationId",
  "idempotencyKey",
  "reason",
  "changedItems",
  "cursor",
  "limit",
]);

/** Authenticate first. Then return only approved observation command fields. */
export async function readObservationRequest(request: Request) {
  const claimsOrResponse = await requireDanielsonApiSession(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const command = Object.fromEntries(
    Object.entries(body).filter(([field]) => COMMAND_FIELDS.has(field)),
  );
  return { claims: claimsOrResponse, command };
}
