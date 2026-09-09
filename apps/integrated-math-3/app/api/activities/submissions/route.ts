import { NextResponse } from "next/server";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";

export async function GET(request: Request) {
  const claims = await requireStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  const activityId = new URL(request.url).searchParams.get("activityId")?.trim();
  const receipt = new URL(request.url).searchParams.get("receipt");
  if (!activityId) {
    return NextResponse.json({ error: "activityId is required" }, {
      status: 400,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  if (receipt !== null && receipt !== "lesson-1-6-quiz") return NextResponse.json({ error: "Unknown receipt selector" }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  try {
    const result = await fetchInternalQuery(
      receipt === "lesson-1-6-quiz" ? internal.activities.getLesson16QuizReceipt : internal.activities.getSelectedWorkedAcknowledgement,
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
  const qfIds = ["discriminant", "x1", "x2"];
  const quizIds = ["discriminant-purpose", "zero-discriminant-real-solution-count"];
  const quizOptions: Record<string, string[]> = { "discriminant-purpose": ["The sum of the roots", "The number and type of solutions", "The product of the roots", "The axis of symmetry"], "zero-discriminant-real-solution-count": ["0", "1", "2", "Cannot determine"] };
  if (Object.keys(value.answers).sort().join("|") === quizIds.slice().sort().join("|")) {
    if (value.mode !== "independent_practice" || value.parts.length !== 2 || new Set(value.parts.map(part => part.partId)).size !== 2) return false;
    return quizIds.every(key => {
      const answer = value.answers[key];
      const part = value.parts.find(candidate => candidate.partId === key);
      return typeof answer === "string" && quizOptions[key].includes(answer) && part !== undefined && part.rawAnswer === answer && part.isCorrect === undefined && part.score === undefined && part.maxScore === undefined;
    });
  }
  if (Object.keys(value.answers).sort().join("|") === qfIds.slice().sort().join("|")) {
    if (value.parts.length !== 3 || new Set(value.parts.map((part) => part.partId)).size !== 3)
      return false;
    return qfIds.every((key) => {
      const answer = value.answers[key];
      const part = value.parts.find((candidate) => candidate.partId === key);
      return part !== undefined
        && (typeof answer === "string" || (typeof answer === "number" && Number.isFinite(answer)))
        && JSON.stringify(answer) === JSON.stringify(part.rawAnswer)
        && part.isCorrect === undefined && part.score === undefined && part.maxScore === undefined;
    }) && String(value.answers.discriminant).trim() !== ""
      && String(value.answers.x1).trim() !== "";
  }
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
  const pendingSubmissionId = request.headers.get("X-Pending-Submission-Id")?.trim();
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
  const isQf = Object.keys(parsed.data.answers).includes("discriminant");
  const isQuiz = Object.keys(parsed.data.answers).includes("discriminant-purpose");
  if (pendingSubmissionId && !isQf)
    return NextResponse.json({ error: "A pending handle is only valid for a quadratic-formula submission" }, { status: 400 });
  try {
    const result = await fetchInternalMutation(
      internal.activities.createServerOwnedSubmission,
      {
        userId: claims.sub as `profiles:${string}`,
        activityId: parsed.data.activityId as `activities:${string}`,
        submissionData: parsed.data,
        idempotencyKey,
        ...(pendingSubmissionId ? { pendingSubmissionId: pendingSubmissionId as `activity_submissions:${string}` } : {}),
      },
    );
    if (isQuiz && (Object.keys(result).sort().join("|") !== "id|maxScore|score|submissionId" || typeof result.submissionId !== "string" || !Number.isInteger(result.score) || result.score < 0 || result.score > 2 || result.maxScore !== 2)) throw new Error("Invalid Lesson 1.6 quiz receipt");
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
