import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { PRECALCULUS_PILOT_NODE_ID } from "@/lib/learning-evidence/precalc-pilot";

const PILOT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
const PILOT_INDEPENDENT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
const AUTHORITY_FIELDS = new Set([
  "learnerId",
  "userId",
  "submissionId",
  "score",
  "maxScore",
  "isCorrect",
  "attemptOrdinal",
  "gradedEvidence",
  "feedback",
  "idempotencyKey",
  "stableActivityId",
  "rubric",
]);
const ENVELOPE_FIELDS = new Set([
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
const ANSWER_FIELDS = new Set([
  "increasingIntervals",
  "decreasingIntervals",
  "constantIntervals",
]);
const PART_FIELDS = new Set([
  "partId",
  "rawAnswer",
  "hintsUsed",
  "revealStepsSeen",
  "changedCount",
]);

type StudentClaims = { sub: string };
type SubmissionResult = {
  submissionId: string;
  score: number;
  maxScore: number;
  attemptOrdinal: number;
  feedback: string;
};

export interface PrecalculusPilotSubmissionRouteDependencies {
  requireStudentSession: (
    request: Request,
  ) => Promise<StudentClaims | Response>;
  createSubmission: (input: {
    userId: string;
    activityId: string;
    submissionData: Record<string, unknown>;
    idempotencyKey: string;
  }) => Promise<SubmissionResult>;
}

export interface PrecalculusPilotSubmissionRoute {
  POST(request: Request): Promise<Response>;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedKeys(
  value: Record<string, unknown>,
  allowed: Set<string>,
): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

function parseSubmissionData(body: unknown): Record<string, unknown> | null {
  if (!isRecord(body) || !hasOnlyAllowedKeys(body, ENVELOPE_FIELDS))
    return null;
  if (Object.keys(body).some((key) => AUTHORITY_FIELDS.has(key))) return null;
  if (body.contractVersion !== "practice.v1") return null;
  if (
    typeof body.activityId !== "string" ||
    body.activityId.trim().length === 0 ||
    typeof body.submittedAt !== "string" ||
    body.submittedAt.trim().length === 0 ||
    !Number.isFinite(Date.parse(body.submittedAt)) ||
    typeof body.attemptNumber !== "number" ||
    !Number.isInteger(body.attemptNumber) ||
    body.attemptNumber < 1 ||
    !Array.isArray(body.parts)
  ) {
    return null;
  }
  const expectedMode =
    body.activityId === PILOT_ACTIVITY_ID
      ? "guided_practice"
      : body.activityId === PILOT_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
  if (
    expectedMode === null ||
    body.mode !== expectedMode ||
    body.status !== "submitted"
  )
    return null;
  if (
    body.parts.length !== 3 ||
    body.parts.some(
      (part) =>
        !isRecord(part) ||
        !hasOnlyAllowedKeys(part, PART_FIELDS) ||
        typeof part.partId !== "string" ||
        part.partId.trim().length === 0 ||
        typeof part.rawAnswer !== "string",
    )
  ) {
    return null;
  }

  if (
    !isRecord(body.answers) ||
    !hasOnlyAllowedKeys(body.answers, ANSWER_FIELDS)
  )
    return null;
  if (Object.keys(body.answers).length !== ANSWER_FIELDS.size) return null;
  if (Object.values(body.answers).some((value) => typeof value !== "string"))
    return null;

  const seenPartIds = new Set<string>();
  for (const part of body.parts) {
    if (
      !isRecord(part) ||
      typeof part.partId !== "string" ||
      !ANSWER_FIELDS.has(part.partId) ||
      seenPartIds.has(part.partId) ||
      part.rawAnswer !== body.answers[part.partId]
    ) {
      return null;
    }
    seenPartIds.add(part.partId);
  }
  if (seenPartIds.size !== ANSWER_FIELDS.size) return null;

  return body;
}

function parseIdempotencyKey(request: Request): string | null {
  const key = request.headers.get("Idempotency-Key") ?? "";
  return key.trim().length > 0 && key.length <= 256 ? key : null;
}

function projectSubmissionResult(result: SubmissionResult): SubmissionResult {
  if (
    !result ||
    typeof result.submissionId !== "string" ||
    result.submissionId.trim().length === 0 ||
    typeof result.score !== "number" ||
    !Number.isFinite(result.score) ||
    typeof result.maxScore !== "number" ||
    !Number.isFinite(result.maxScore) ||
    result.maxScore <= 0 ||
    result.score < 0 ||
    result.score > result.maxScore ||
    typeof result.attemptOrdinal !== "number" ||
    !Number.isInteger(result.attemptOrdinal) ||
    result.attemptOrdinal < 1 ||
    typeof result.feedback !== "string"
  ) {
    throw new Error("Invalid server submission result");
  }
  return {
    submissionId: result.submissionId,
    score: result.score,
    maxScore: result.maxScore,
    attemptOrdinal: result.attemptOrdinal,
    feedback: result.feedback,
  };
}

export function createPrecalculusPilotSubmissionRoute({
  requireStudentSession,
  createSubmission,
}: PrecalculusPilotSubmissionRouteDependencies): PrecalculusPilotSubmissionRoute {
  return {
    POST: async (request) => {
      const claimsOrResponse = await requireStudentSession(request);
      if (claimsOrResponse instanceof Response) return claimsOrResponse;
      if (!claimsOrResponse.sub)
        return jsonResponse({ error: "Unauthorized" }, 401);

      const idempotencyKey = parseIdempotencyKey(request);
      if (!idempotencyKey) {
        return jsonResponse({ error: "Idempotency-Key is required" }, 400);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
      }

      const submissionData = parseSubmissionData(body);
      if (!submissionData) {
        return jsonResponse(
          { error: "Invalid Precalculus pilot submission" },
          400,
        );
      }

      try {
        const activityId = submissionData.activityId;
        if (typeof activityId !== "string") {
          return jsonResponse(
            { error: "Invalid Precalculus pilot submission" },
            400,
          );
        }
        const result = await createSubmission({
          userId: claimsOrResponse.sub,
          activityId,
          submissionData,
          idempotencyKey,
        });
        return jsonResponse(projectSubmissionResult(result), 200);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("practice_unavailable")) {
          return jsonResponse({ error: "Practice is not available" }, 409);
        }
        if (message.includes("idempotency_conflict")) {
          return jsonResponse(
            {
              error:
                "Idempotency key was already used for a different submission",
            },
            409,
          );
        }
        return jsonResponse({ error: "Unable to create submission" }, 500);
      }
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  return createPrecalculusPilotSubmissionRoute({
    requireStudentSession: (input) => requireStudentRequestClaims(input),
    createSubmission: ({
      userId,
      activityId,
      submissionData,
      idempotencyKey,
    }) =>
      fetchInternalMutation(internal.activities.createServerOwnedSubmission, {
        userId,
        activityId,
        submissionData,
        idempotencyKey,
      }),
  }).POST(request);
}

export default POST;
