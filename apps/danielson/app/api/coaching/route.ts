import { requireDanielsonApiSession } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";

export async function POST(request: Request) {
  const claims = await requireDanielsonApiSession(request);
  if (claims instanceof Response) return claims;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      return Response.json({ error: "Invalid coaching request." }, { status: 400 });
    const input = body as Record<string, unknown>;
    const allowed =
      input.kind === "create"
        ? [
            "teacherProfileId",
            "skillId",
            "action",
            "support",
            "followUpDate",
            "baselineObservationId",
          ]
        : [
            "cycleId",
            "expectedRevision",
            "kind",
            "reflection",
            "conclusion",
            "followUpObservationId",
            "action",
            "support",
            "followUpDate",
          ];
    const command = Object.fromEntries(
      Object.entries(input).filter(([name]) => allowed.includes(name)),
    );
    const result = await fetchInternalMutation(
      input.kind === "create" ? internal.coaching.createCycle : internal.coaching.updateCycle,
      { ...command, actorAccountId: claims.sub },
    );
    if (result.kind === "saved") return Response.json(result);
    if (result.kind === "denied")
      return Response.json(
        { error: "You do not have access to this coaching cycle." },
        { status: 403 },
      );
    if (result.kind === "conflict")
      return Response.json(
        { error: "This cycle changed or is complete. Reload the page." },
        { status: 409 },
      );
    return Response.json(
      {
        error:
          "Check the fields. Select published evidence for this teacher and target. Follow-up evidence must be later than the baseline.",
      },
      { status: 400 },
    );
  } catch {
    return Response.json(
      { error: "The coaching change was not saved. Check the fields and try again." },
      { status: 400 },
    );
  }
}
