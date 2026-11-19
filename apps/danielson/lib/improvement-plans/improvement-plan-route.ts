import { requireDanielsonApiSession } from "@/lib/auth/server";

const COMMAND_FIELDS = new Set([
  "teacherProfileId",
  "planId",
  "versionId",
  "requestId",
  "expectedRevision",
  "departmentId",
  "reviewMeetingDate",
  "requestedPlanEndDate",
  "purpose",
  "areasOfConcern",
  "expectedStandard",
  "requiredActions",
  "evidenceOfImprovement",
  "schoolSupport",
  "successfulCompletionCriteria",
  "targets",
  "kind",
  "outcome",
  "note",
]);

/** Authenticate first. Then keep only approved PIP command fields. */
export async function readImprovementPlanRequest(request: Request) {
  const claimsOrResponse = await requireDanielsonApiSession(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  return {
    claims: claimsOrResponse,
    command: Object.fromEntries(
      Object.entries(body).filter(([field]) => COMMAND_FIELDS.has(field)),
    ),
  };
}

type ImprovementPlanResult = { kind?: string; reason?: string };

/** Convert an internal PIP result to a stable public response. */
export function improvementPlanResultResponse(result: ImprovementPlanResult) {
  if (["proposed", "replayed", "approved", "acknowledged", "closed"].includes(result.kind ?? "")) {
    return Response.json(result);
  }
  if (result.kind === "not_found") {
    return Response.json({ error: "The improvement plan was not found." }, { status: 404 });
  }
  if (result.kind === "denied") {
    return Response.json({ error: "You do not have access to this action." }, { status: 403 });
  }
  if (
    [
      "revision_conflict",
      "idempotency_conflict",
      "open_plan_exists",
      "acknowledgment_exists",
    ].includes(result.kind ?? "")
  ) {
    return Response.json(
      { error: "The improvement plan changed. Refresh the page and try again." },
      { status: 409 },
    );
  }
  if (result.kind === "evidence_capacity_exceeded" || result.kind === "capacity_exceeded") {
    return Response.json(
      { error: "The improvement plan exceeded its safe data capacity." },
      { status: 503 },
    );
  }
  return Response.json(
    { error: result.reason ?? "The improvement plan action failed." },
    { status: 400 },
  );
}

export async function safeImprovementPlanMutation(run: () => Promise<ImprovementPlanResult>) {
  try {
    return improvementPlanResultResponse(await run());
  } catch {
    return Response.json({ error: "The improvement plan action failed." }, { status: 400 });
  }
}
