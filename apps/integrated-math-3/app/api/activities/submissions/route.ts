import { NextResponse } from "next/server";
import {
  normalizePracticeValue,
  practiceSubmissionEnvelopeSchema,
  PRACTICE_CONTRACT_VERSION,
} from "@math-platform/practice-core/contract";
import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";

export async function GET(request: Request) {
  const authResult = await requireStudentRequestClaims(request);
  if (authResult instanceof Response) return authResult;
  const activityId = new URL(request.url).searchParams.get("activityId")?.trim();
  if (!activityId) {
    return NextResponse.json(
      { error: "activityId is required" },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  try {
    const result = await fetchInternalQuery(internal.activities.getSelectedWorkedAcknowledgement, {
      userId: authResult.sub as `profiles:${string}`,
      activityId: activityId as `activities:${string}`,
    });
    return NextResponse.json(result ?? { acknowledged: false }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error reading selected Worked acknowledgement:", error);
    return NextResponse.json(
      { error: "Failed to read Worked acknowledgement" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

const ENVELOPE_KEYS = new Set([
  "contractVersion",
  "activityId",
  "mode",
  "status",
  "attemptNumber",
  "submittedAt",
  "answers",
  "parts",
  "artifact",
  "interactionHistory",
  "analytics",
  "studentFeedback",
  "teacherSummary",
  "timing",
]);

const IM3_ROLLOUT_ANSWER_PART_SHAPES = [
  [
    { answerKey: "table_values", partId: "table_values" },
    { answerKey: "placed_points", partId: "placed_points" },
  ],
  [
    { answerKey: "fA", partId: "f_a" },
    { answerKey: "fB", partId: "f_b" },
    { answerKey: "rate", partId: "rate" },
  ],
  [
    { answerKey: "domain", partId: "domain" },
    { answerKey: "range", partId: "range" },
  ],
  [
    { answerKey: "priceBase", partId: "priceBase" },
    { answerKey: "priceStep", partId: "priceStep" },
    { answerKey: "salesBase", partId: "salesBase" },
    { answerKey: "salesLoss", partId: "salesLoss" },
    { answerKey: "coefficientA", partId: "coefficientA" },
    { answerKey: "coefficientB", partId: "coefficientB" },
    { answerKey: "coefficientC", partId: "coefficientC" },
  ],
  [
    { answerKey: "optimalIncreases", partId: "optimalIncreases" },
    { answerKey: "optimalPrice", partId: "optimalPrice" },
    { answerKey: "maximumProfit", partId: "maximumProfit" },
  ],
  [{ answerKey: "maximum_value", partId: "maximum_value" }],
  [{ answerKey: "placed_points", partId: "placed_points" }],
  [{ answerKey: "greater_maximum", partId: "greater_maximum" }],
  [
    { answerKey: "table_values", partId: "table_values" },
    { answerKey: "placed_points", partId: "placed_points" },
    { answerKey: "solutions", partId: "solutions" },
  ],
] as const;

function isFinitePointArray(value: unknown, expectedLength: number): boolean {
  return (
    Array.isArray(value) &&
    value.length === expectedLength &&
    value.every((candidate) => {
      if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
        return false;
      }
      const point = candidate as Record<string, unknown>;
      return (
        Object.getPrototypeOf(point) === Object.prototype &&
        Object.keys(point).sort().join("|") === "x|y" &&
        typeof point.x === "number" &&
        Number.isFinite(point.x) &&
        typeof point.y === "number" &&
        Number.isFinite(point.y)
      );
    })
  );
}

function validateIm3RolloutEnvelope(
  submission: ReturnType<typeof practiceSubmissionEnvelopeSchema.parse>,
): boolean {
  if (submission.mode === "worked_example") {
    return (
      submission.status === "submitted" &&
      Object.keys(submission.answers).length === 0 &&
      submission.parts.length === 0
    );
  }
  if (
    (submission.mode !== "independent_practice" && submission.mode !== "guided_practice") ||
    submission.status !== "submitted"
  ) {
    return false;
  }

  const answerPartShape = IM3_ROLLOUT_ANSWER_PART_SHAPES.find((shape) => {
    const expectedAnswerKeys = new Set<string>(shape.map(({ answerKey }) => answerKey));
    const answerKeys = Object.keys(submission.answers);
    const expectedPartIds = new Set<string>(shape.map(({ partId }) => partId));
    const submittedPartIds = submission.parts.map((part) => part.partId);
    return (
      answerKeys.length === expectedAnswerKeys.size &&
      answerKeys.every((answerKey) => expectedAnswerKeys.has(answerKey)) &&
      submittedPartIds.length === expectedPartIds.size &&
      new Set(submittedPartIds).size === expectedPartIds.size &&
      submittedPartIds.every((partId) => expectedPartIds.has(partId))
    );
  });
  if (!answerPartShape) return false;

  const isSelectedQuadraticShape = answerPartShape === IM3_ROLLOUT_ANSWER_PART_SHAPES[0];
  if (
    isSelectedQuadraticShape &&
    submission.parts.some(
      (part) =>
        part.isCorrect !== undefined || part.score !== undefined || part.maxScore !== undefined,
    )
  ) {
    return false;
  }

  const isSymmetryShape = answerPartShape === IM3_ROLLOUT_ANSWER_PART_SHAPES[6];
  if (isSymmetryShape) {
    const answerPoints = submission.answers.placed_points;
    const part = submission.parts.find((candidate) => candidate.partId === "placed_points");
    if (!isFinitePointArray(answerPoints, 3) || !isFinitePointArray(part?.rawAnswer, 3)) {
      return false;
    }
  }

  const isCompareMaximumShape = answerPartShape === IM3_ROLLOUT_ANSWER_PART_SHAPES[7];
  if (isCompareMaximumShape) {
    const part = submission.parts.find((candidate) => candidate.partId === "greater_maximum");
    if (
      (submission.answers.greater_maximum !== "first" &&
        submission.answers.greater_maximum !== "second") ||
      (part?.rawAnswer !== "first" && part?.rawAnswer !== "second")
    ) {
      return false;
    }
  }

  const isTwoRealSolutionsShape = answerPartShape === IM3_ROLLOUT_ANSWER_PART_SHAPES[8];
  if (isTwoRealSolutionsShape) {
    const tablePart = submission.parts.find((candidate) => candidate.partId === "table_values");
    const placedPointsPart = submission.parts.find(
      (candidate) => candidate.partId === "placed_points",
    );
    const solutionsPart = submission.parts.find((candidate) => candidate.partId === "solutions");
    const solutions = submission.answers.solutions;
    const hasFiniteSolutions =
      Array.isArray(solutions) &&
      solutions.length === 2 &&
      solutions.every((value) => typeof value === "number" && Number.isFinite(value));
    const hasNoClientGradeFields = submission.parts.every(
      (part) =>
        part.isCorrect === undefined && part.score === undefined && part.maxScore === undefined,
    );
    if (
      !isFinitePointArray(submission.answers.table_values, 5) ||
      !isFinitePointArray(tablePart?.rawAnswer, 5) ||
      !isFinitePointArray(submission.answers.placed_points, 5) ||
      !isFinitePointArray(placedPointsPart?.rawAnswer, 5) ||
      !hasFiniteSolutions ||
      !Array.isArray(solutionsPart?.rawAnswer) ||
      solutionsPart.rawAnswer.length !== 2 ||
      !solutionsPart.rawAnswer.every(
        (value) => typeof value === "number" && Number.isFinite(value),
      ) ||
      !hasNoClientGradeFields
    ) {
      return false;
    }
  }

  const isProfitModelShape =
    answerPartShape === IM3_ROLLOUT_ANSWER_PART_SHAPES[3] ||
    answerPartShape === IM3_ROLLOUT_ANSWER_PART_SHAPES[4];
  for (const { answerKey, partId } of answerPartShape) {
    const part = submission.parts.find((candidate) => candidate.partId === partId);
    if (!part) return false;
    const submittedAnswer = submission.answers[answerKey];
    const rawAnswer =
      isProfitModelShape &&
      typeof submittedAnswer === "object" &&
      submittedAnswer !== null &&
      "answer" in submittedAnswer
        ? submittedAnswer.answer
        : submittedAnswer;
    if (normalizePracticeValue(part.rawAnswer) !== normalizePracticeValue(rawAnswer)) {
      return false;
    }
  }
  return true;
}

/**
 * Creates the immutable Convex submission receipt from raw authenticated
 * student input. Grade fields and submission identity are server-owned.
 */
export async function POST(request: Request) {
  const authResult = await requireStudentRequestClaims(request);
  if (authResult instanceof Response) return authResult;

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length > 80) {
    return NextResponse.json({ error: "A non-empty Idempotency-Key is required" }, { status: 400 });
  }

  try {
    const body: unknown = await request.json().catch(() => null);
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Submission envelope must be an object" }, { status: 400 });
    }

    const extraKey = Object.keys(body).find((key) => !ENVELOPE_KEYS.has(key));
    if (extraKey) {
      return NextResponse.json(
        { error: `Field ${extraKey} is not accepted by the server-owned submission route` },
        { status: 400 },
      );
    }

    const validation = practiceSubmissionEnvelopeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid practice submission envelope", details: validation.error.format() },
        { status: 400 },
      );
    }

    if (validation.data.contractVersion !== PRACTICE_CONTRACT_VERSION) {
      return NextResponse.json(
        { error: `Invalid contract version: ${validation.data.contractVersion}` },
        { status: 400 },
      );
    }

    if (!validateIm3RolloutEnvelope(validation.data)) {
      return NextResponse.json(
        { error: "Invalid IM3 rollout answer and part set" },
        { status: 400 },
      );
    }

    const result = await fetchInternalMutation(internal.activities.createServerOwnedSubmission, {
      userId: authResult.sub as `profiles:${string}`,
      activityId: validation.data.activityId as `activities:${string}`,
      submissionData: validation.data,
      idempotencyKey,
    });

    return NextResponse.json(
      "acknowledged" in result
        ? { submissionId: result.submissionId, acknowledged: true }
        : { submissionId: result.submissionId, score: result.score, maxScore: result.maxScore },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("idempotency_conflict")) {
      return NextResponse.json(
        { error: "Idempotency key was already used for a different submission" },
        { status: 409 },
      );
    }
    console.error("Error creating server-owned activity submission:", error);
    return NextResponse.json({ error: "Failed to create activity submission" }, { status: 503 });
  }
}
