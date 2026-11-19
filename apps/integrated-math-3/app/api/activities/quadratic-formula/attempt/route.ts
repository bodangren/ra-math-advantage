import { NextResponse } from "next/server";
import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";

const headers = { "Cache-Control": "private, no-store" };
function args(request: Request): {
  activityId: Id<"activities">;
  mode: "guided_practice" | "independent_practice";
} | null {
  const params = new URL(request.url).searchParams;
  const activityId = params.get("activityId")?.trim();
  const mode = params.get("mode")?.trim();
  if (!activityId || (mode !== "guided_practice" && mode !== "independent_practice")) return null;
  return { activityId: activityId as Id<"activities">, mode };
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).sort().join("|") === [...keys].sort().join("|");
}
const answer = (value: unknown) =>
  typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
function validProps(value: unknown, mode: "guided_practice" | "independent_practice"): boolean {
  if (!record(value)) return false;
  const guided = mode === "guided_practice";
  if (
    !exactKeys(
      value,
      guided
        ? ["prompt", "equation", "presentationMode", "fieldHelp"]
        : ["prompt", "equation", "presentationMode"],
    ) ||
    typeof value.prompt !== "string" ||
    !value.prompt ||
    typeof value.equation !== "string" ||
    !value.equation ||
    value.presentationMode !== (guided ? "guided" : "independent")
  )
    return false;
  return (
    !guided ||
    (record(value.fieldHelp) &&
      exactKeys(value.fieldHelp, ["discriminant", "x1", "x2"]) &&
      Object.values(value.fieldHelp).every((text) => typeof text === "string" && text.length > 0))
  );
}
function validResult(
  value: unknown,
  requestArgs: NonNullable<ReturnType<typeof args>>,
  start: boolean,
): boolean {
  if (!record(value) || typeof value.state !== "string") return false;
  if (value.state === "no_attempt") return !start && exactKeys(value, ["state"]);
  if (value.state === "exhausted") return start && exactKeys(value, ["state"]);
  const common =
    value.state === "pending"
      ? [
          "state",
          "pendingSubmissionId",
          "activityId",
          "mode",
          "attemptOrdinal",
          "idempotencyKey",
          "props",
        ]
      : [
          "state",
          "activityId",
          "mode",
          "attemptOrdinal",
          "props",
          "submissionId",
          "score",
          "maxScore",
          "answers",
          "parts",
        ];
  if (
    (value.state !== "pending" && value.state !== "final") ||
    !exactKeys(value, common) ||
    value.activityId !== requestArgs.activityId ||
    value.mode !== requestArgs.mode ||
    !Number.isSafeInteger(value.attemptOrdinal) ||
    Number(value.attemptOrdinal) < 1 ||
    !validProps(value.props, requestArgs.mode)
  )
    return false;
  if (value.state === "pending")
    return (
      typeof value.pendingSubmissionId === "string" &&
      value.pendingSubmissionId.length > 0 &&
      typeof value.idempotencyKey === "string" &&
      value.idempotencyKey === `qf:${value.pendingSubmissionId}`
    );
  if (
    start ||
    typeof value.submissionId !== "string" ||
    !value.submissionId ||
    typeof value.score !== "number" ||
    !Number.isFinite(value.score) ||
    value.score < 0 ||
    typeof value.maxScore !== "number" ||
    !Number.isFinite(value.maxScore) ||
    value.maxScore <= 0 ||
    value.score > value.maxScore ||
    !record(value.answers) ||
    !exactKeys(value.answers, ["discriminant", "x1", "x2"]) ||
    !Object.values(value.answers).every(answer) ||
    !Array.isArray(value.parts) ||
    value.parts.length !== 3 ||
    new Set(value.parts.map((part) => (record(part) ? part.partId : null))).size !== 3
  )
    return false;
  return value.parts.every(
    (part) =>
      record(part) &&
      exactKeys(part, ["partId", "rawAnswer", "isCorrect", "score", "maxScore"]) &&
      ["discriminant", "x1", "x2"].includes(String(part.partId)) &&
      answer(part.rawAnswer) &&
      typeof part.isCorrect === "boolean" &&
      typeof part.score === "number" &&
      Number.isFinite(part.score) &&
      typeof part.maxScore === "number" &&
      Number.isFinite(part.maxScore) &&
      part.score >= 0 &&
      part.maxScore >= 0 &&
      part.score <= part.maxScore,
  );
}
async function respond(request: Request, start: boolean) {
  const claims = await requireStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  const parsed = args(request);
  if (!parsed)
    return NextResponse.json({ error: "Invalid attempt request" }, { status: 400, headers });
  try {
    const input = { userId: claims.sub as Id<"profiles">, ...parsed };
    const result: unknown = start
      ? await fetchInternalMutation(internal.activities.startQuadraticFormulaAttempt, input)
      : await fetchInternalQuery(internal.activities.getQuadraticFormulaAttempt, input);
    if (!validResult(result, parsed, start)) throw new Error("Invalid attempt response");
    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json(
      { error: "The attempt is unavailable. Try again." },
      { status: 503, headers },
    );
  }
}
export const GET = (request: Request) => respond(request, false);
export const POST = (request: Request) => respond(request, true);
