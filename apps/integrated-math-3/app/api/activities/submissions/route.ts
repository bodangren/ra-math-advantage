import { NextResponse } from "next/server";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";

export async function GET(request: Request) {
  const claims = await requireStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  const activityId = new URL(request.url).searchParams.get("activityId")?.trim();
  if (!activityId) {
    return NextResponse.json({ error: "activityId is required" }, {
      status: 400,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  try {
    const result = await fetchInternalQuery(
      internal.activities.getSelectedWorkedAcknowledgement,
      {
        userId: claims.sub as `profiles:${string}`,
        activityId: activityId as `activities:${string}`,
      },
    );
    return NextResponse.json(result ?? { acknowledged: false }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to read Worked acknowledgement" }, {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}

function finitePoints(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every((candidate) => {
      if (
        typeof candidate !== "object" ||
        candidate === null ||
        Array.isArray(candidate)
      )
        return false;
      const point = candidate as Record<string, unknown>;
      return (
        Object.keys(point).sort().join("|") === "x|y" &&
        typeof point.x === "number" &&
        Number.isFinite(point.x) &&
        typeof point.y === "number" &&
        Number.isFinite(point.y)
      );
    })
  );
}
function validSelectedEnvelope(
  value: ReturnType<typeof practiceSubmissionEnvelopeSchema.parse>,
): boolean {
  if (value.mode === "worked_example") {
    return value.status === "submitted"
      && Object.keys(value.answers).length === 0
      && value.parts.length === 0;
  }
  if (
    (value.mode !== "guided_practice" &&
      value.mode !== "independent_practice") ||
    value.status !== "submitted"
  )
    return false;
  if (
    Object.keys(value.answers).sort().join("|") !==
      "placed_points|table_values" ||
    value.parts.length !== 2 ||
    new Set(value.parts.map((part) => part.partId)).size !== 2
  )
    return false;
  return ["table_values", "placed_points"].every((key) => {
    const answer = value.answers[key];
    const part = value.parts.find((candidate) => candidate.partId === key);
    return (
      finitePoints(answer) &&
      finitePoints(part?.rawAnswer) &&
      JSON.stringify(answer) === JSON.stringify(part?.rawAnswer) &&
      part?.isCorrect === undefined &&
      part?.score === undefined &&
      part?.maxScore === undefined
    );
  });
}
/** Create one server-owned selected quadratic submission for the authenticated student. */
export async function POST(request: Request) {
  const claims = await requireStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length > 80)
    return NextResponse.json(
      { error: "A non-empty Idempotency-Key is required" },
      { status: 400 },
    );
  const body: unknown = await request.json().catch(() => null);
  const parsed = practiceSubmissionEnvelopeSchema.safeParse(body);
  if (!parsed.success || !validSelectedEnvelope(parsed.data))
    return NextResponse.json(
      { error: "Invalid selected IM3 submission" },
      { status: 400 },
    );
  try {
    const result = await fetchInternalMutation(
      internal.activities.createServerOwnedSubmission,
      {
        userId: claims.sub as `profiles:${string}`,
        activityId: parsed.data.activityId as `activities:${string}`,
        submissionData: parsed.data,
        idempotencyKey,
      },
    );
    return NextResponse.json("acknowledged" in result
      ? { submissionId: result.submissionId, acknowledged: true }
      : { submissionId: result.submissionId, score: result.score, maxScore: result.maxScore });
  } catch (error) {
    if (error instanceof Error && error.message.includes("idempotency_conflict"))
      return NextResponse.json(
        {
          error: "Idempotency key was already used for a different submission",
        },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Failed to create activity submission" },
      { status: 503 },
    );
  }
}
