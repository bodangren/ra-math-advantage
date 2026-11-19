import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type PolynomialEndBehaviorPracticeMode = "guided_practice" | "independent_practice";

const ANSWER_IDS = ["leftEnd", "rightEnd"] as const;
type AnswerId = (typeof ANSWER_IDS)[number];

type PolynomialEndBehaviorSubmissionData = {
  contractVersion: "practice.v1";
  activityId: string;
  mode: PolynomialEndBehaviorPracticeMode;
  status: "submitted";
  attemptNumber: number;
  submittedAt: string;
  answers: Record<AnswerId, string>;
  parts: Array<{ partId: AnswerId; rawAnswer: string }>;
};

type PolynomialEndBehaviorSubmissionResult = {
  submissionId: string;
  score: number;
  maxScore: number;
  attemptOrdinal: number;
  feedback: string;
};

type StudentClaims = { sub: string; role: string };

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string): boolean {
  return Object.keys(value).sort().join("|") === keys;
}

function expectedMode(activityId: string): PolynomialEndBehaviorPracticeMode | null {
  if (activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID) {
    return "guided_practice";
  }
  if (activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID) {
    return "independent_practice";
  }
  return null;
}

function parseSubmissionData(value: unknown): PolynomialEndBehaviorSubmissionData | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(
      value,
      "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt",
    ) ||
    value.contractVersion !== "practice.v1" ||
    typeof value.activityId !== "string" ||
    value.activityId.trim().length === 0 ||
    typeof value.mode !== "string" ||
    value.status !== "submitted" ||
    typeof value.attemptNumber !== "number" ||
    !Number.isInteger(value.attemptNumber) ||
    value.attemptNumber < 1 ||
    typeof value.submittedAt !== "string" ||
    value.submittedAt.trim().length === 0 ||
    !Number.isFinite(Date.parse(value.submittedAt))
  ) {
    return null;
  }

  const answers = value.answers;
  if (
    !isRecord(answers) ||
    !hasExactKeys(answers, "leftEnd|rightEnd") ||
    ANSWER_IDS.some((answerId) => typeof answers[answerId] !== "string")
  ) {
    return null;
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== ANSWER_IDS.length) return null;
  for (const [index, partId] of ANSWER_IDS.entries()) {
    const part = parts[index];
    if (
      !isRecord(part) ||
      !hasExactKeys(part, "partId|rawAnswer") ||
      part.partId !== partId ||
      typeof part.rawAnswer !== "string" ||
      part.rawAnswer !== answers[partId]
    ) {
      return null;
    }
  }

  const mode = expectedMode(value.activityId);
  if (mode === null || value.mode !== mode) return null;
  return value as unknown as PolynomialEndBehaviorSubmissionData;
}

function parseIdempotencyKey(request: Request): string | null {
  const key = request.headers.get("Idempotency-Key")?.trim() ?? "";
  return key.length > 0 ? key : null;
}

function validateSubmissionResult(value: unknown): PolynomialEndBehaviorSubmissionResult {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, "attemptOrdinal|feedback|maxScore|score|submissionId") ||
    typeof value.submissionId !== "string" ||
    value.submissionId.trim().length === 0 ||
    typeof value.score !== "number" ||
    !Number.isInteger(value.score) ||
    value.score < 0 ||
    value.score > 2 ||
    value.maxScore !== 2 ||
    typeof value.attemptOrdinal !== "number" ||
    !Number.isInteger(value.attemptOrdinal) ||
    value.attemptOrdinal < 1 ||
    typeof value.feedback !== "string"
  ) {
    throw new Error("Invalid server Topic 1.4 polynomial end behavior submission result");
  }
  return value as unknown as PolynomialEndBehaviorSubmissionResult;
}

export async function POST(request: Request): Promise<Response> {
  let claimsOrResponse: StudentClaims | Response;
  try {
    claimsOrResponse = await requireStudentRequestClaims(request);
  } catch {
    return jsonResponse({ error: "Unable to authenticate request" }, 500);
  }
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  if (typeof claimsOrResponse.sub !== "string" || claimsOrResponse.sub.trim().length === 0) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  if (claimsOrResponse.role !== "student") return jsonResponse({ error: "Forbidden" }, 403);

  const idempotencyKey = parseIdempotencyKey(request);
  if (!idempotencyKey) return jsonResponse({ error: "Idempotency-Key is required" }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  const submissionData = parseSubmissionData(body);
  if (!submissionData) {
    return jsonResponse({ error: "Invalid Topic 1.4 polynomial end behavior submission" }, 400);
  }

  try {
    const result = validateSubmissionResult(
      await fetchInternalMutation(
        internal.activities.createTopic14PolynomialEndBehaviorSubmission,
        {
          userId: claimsOrResponse.sub,
          activityId: submissionData.activityId,
          submissionData,
          idempotencyKey,
        },
      ),
    );
    return jsonResponse(result, 200);
  } catch (error) {
    if (error instanceof Error && error.message === "idempotency_conflict") {
      return jsonResponse(
        { error: "Idempotency key was already used for a different submission" },
        409,
      );
    }
    return jsonResponse(
      { error: "Unable to create Topic 1.4 polynomial end behavior practice submission" },
      500,
    );
  }
}

export default POST;
