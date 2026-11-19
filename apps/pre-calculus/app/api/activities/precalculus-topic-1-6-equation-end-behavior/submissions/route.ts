import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type StudentClaims = {
  sub: string;
  role: string;
};

type PracticeMode = "guided_practice" | "independent_practice";
type PartId =
  | "a_leftEnd"
  | "a_rightEnd"
  | "b_leftEnd"
  | "b_rightEnd"
  | "c_leftEnd"
  | "c_rightEnd"
  | "d_leftEnd"
  | "d_rightEnd"
  | "e_leftEnd"
  | "e_rightEnd"
  | "f_leftEnd"
  | "f_rightEnd";
type Answer = "up" | "down";
type Answers = Record<PartId, Answer>;
type SubmissionData = {
  contractVersion: "practice.v1";
  activityId: string;
  mode: PracticeMode;
  status: "submitted";
  attemptNumber: number;
  submittedAt: string;
  answers: Answers;
  parts: Array<{ partId: PartId; rawAnswer: Answer }>;
};
type SubmissionResult = {
  submissionId: string;
  score: number;
  maxScore: 12;
  attemptOrdinal: number;
  feedback: string;
};

const PART_IDS: PartId[] = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
];

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

function isAnswer(value: unknown): value is Answer {
  return value === "up" || value === "down";
}

function isCanonicalIso(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function expectedMode(activityId: string): PracticeMode | null {
  if (activityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID) {
    return "guided_practice";
  }
  if (
    activityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID
  ) {
    return "independent_practice";
  }
  return null;
}

function parseSubmissionData(value: unknown): SubmissionData | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(
      value,
      "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt",
    ) ||
    value.contractVersion !== "practice.v1" ||
    typeof value.activityId !== "string" ||
    value.status !== "submitted" ||
    typeof value.attemptNumber !== "number" ||
    !Number.isSafeInteger(value.attemptNumber) ||
    value.attemptNumber < 1 ||
    !isCanonicalIso(value.submittedAt)
  ) {
    return null;
  }

  const mode = expectedMode(value.activityId);
  if (mode === null || value.mode !== mode) return null;

  const answers = value.answers;
  if (
    !isRecord(answers) ||
    !hasExactKeys(answers, PART_IDS.join("|")) ||
    !PART_IDS.every((partId) => isAnswer(answers[partId]))
  ) {
    return null;
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== PART_IDS.length) return null;
  if (
    !PART_IDS.every((partId, index) => {
      const part = parts[index];
      return (
        isRecord(part) &&
        hasExactKeys(part, "partId|rawAnswer") &&
        part.partId === partId &&
        part.rawAnswer === answers[partId]
      );
    })
  ) {
    return null;
  }

  return value as unknown as SubmissionData;
}

function validateSubmissionResult(value: unknown): SubmissionResult {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, "attemptOrdinal|feedback|maxScore|score|submissionId") ||
    typeof value.submissionId !== "string" ||
    value.submissionId.trim().length === 0 ||
    typeof value.score !== "number" ||
    !Number.isSafeInteger(value.score) ||
    value.score < 0 ||
    value.score > 12 ||
    value.maxScore !== 12 ||
    typeof value.attemptOrdinal !== "number" ||
    !Number.isSafeInteger(value.attemptOrdinal) ||
    value.attemptOrdinal < 1 ||
    typeof value.feedback !== "string" ||
    value.feedback.trim().length === 0
  ) {
    throw new Error("Invalid server Topic 1.6 equation end behavior submission result");
  }
  return value as unknown as SubmissionResult;
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

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() ?? "";
  if (idempotencyKey.length === 0)
    return jsonResponse({ error: "Idempotency-Key is required" }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  const submissionData = parseSubmissionData(body);
  if (!submissionData) {
    return jsonResponse({ error: "Invalid Topic 1.6 equation end behavior submission" }, 400);
  }

  try {
    const result = validateSubmissionResult(
      await fetchInternalMutation(internal.activities.createTopic16EquationEndBehaviorSubmission, {
        userId: claimsOrResponse.sub,
        activityId: submissionData.activityId,
        idempotencyKey,
        submissionData,
      }),
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
      { error: "Unable to create Topic 1.6 equation end behavior submission" },
      500,
    );
  }
}

export default POST;
