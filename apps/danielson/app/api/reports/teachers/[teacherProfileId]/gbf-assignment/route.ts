import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { requireDanielsonApiSession } from "@/lib/auth/server";

type AssignmentResult = { kind?: string; reason?: string };

export async function POST(
  request: Request,
  context: { params: Promise<{ teacherProfileId: string }> },
) {
  const claimsOrResponse = await requireDanielsonApiSession(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  const { teacherProfileId } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length !== 0
  ) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const result = (await fetchInternalMutation(internal.gbf.assignTeacherGbfTrack, {
    actorAccountId: claimsOrResponse.sub,
    teacherProfileId,
    now: Date.now(),
  })) as AssignmentResult;
  if (result.kind === "assigned" || result.kind === "replayed") return Response.json(result);
  if (result.kind === "denied")
    return Response.json({ error: "You do not have access to this action." }, { status: 403 });
  return Response.json({ error: "The track could not be assigned." }, { status: 400 });
}
