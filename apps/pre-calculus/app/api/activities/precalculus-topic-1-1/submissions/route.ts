import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

type StudentClaims = {
  sub: string;
  role: string;
};

type SourceSubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

export interface PrecalculusTopic11DailyRouteDependencies {
  requireStudentSession: (request: Request) => Promise<StudentClaims | Response>;
  createSourceSubmission: (input: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: {
      contractVersion: "practice.v1";
      activityId: typeof PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID;
      mode: "worked_example";
      status: "submitted";
      answers: Record<string, never>;
      parts: [];
    };
  }) => Promise<SourceSubmissionResult>;
}

export interface PrecalculusTopic11DailyRoute {
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

function parseIdempotencyKey(request: Request): string | null {
  const key = request.headers.get("Idempotency-Key");
  return key !== null && key.trim().length > 0 && key.length <= 256 ? key : null;
}

function buildSourceSubmissionData() {
  return {
    contractVersion: "practice.v1" as const,
    activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    mode: "worked_example" as const,
    status: "submitted" as const,
    answers: {},
    parts: [] as [],
  };
}

function validateSourceSubmissionResult(result: SourceSubmissionResult): SourceSubmissionResult {
  const submittedAt =
    isRecord(result) && typeof result.submittedAt === "string"
      ? Date.parse(result.submittedAt)
      : Number.NaN;
  if (
    !isRecord(result) ||
    Object.keys(result).sort().join(",") !== "attemptOrdinal,submissionId,submittedAt" ||
    typeof result.submissionId !== "string" ||
    result.submissionId.trim().length === 0 ||
    typeof result.attemptOrdinal !== "number" ||
    !Number.isInteger(result.attemptOrdinal) ||
    result.attemptOrdinal < 1 ||
    typeof result.submittedAt !== "string" ||
    !Number.isFinite(submittedAt) ||
    new Date(submittedAt).toISOString() !== result.submittedAt
  ) {
    throw new Error("Invalid server Topic 1.1 source submission result");
  }
  return result;
}

export function createPrecalculusTopic11DailyRoute({
  requireStudentSession,
  createSourceSubmission,
}: PrecalculusTopic11DailyRouteDependencies): PrecalculusTopic11DailyRoute {
  return {
    POST: async (request) => {
      const claimsOrResponse = await requireStudentSession(request);
      if (claimsOrResponse instanceof Response) return claimsOrResponse;
      if (!claimsOrResponse.sub) return jsonResponse({ error: "Unauthorized" }, 401);
      if (claimsOrResponse.role !== "student") {
        return jsonResponse({ error: "Forbidden" }, 403);
      }

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

      if (!isRecord(body) || Object.keys(body).length !== 0) {
        return jsonResponse({ error: "Only a Topic 1.1 Worked acknowledgement is accepted" }, 400);
      }

      const submissionData = buildSourceSubmissionData();
      try {
        const source = validateSourceSubmissionResult(
          await createSourceSubmission({
            userId: claimsOrResponse.sub,
            activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
            idempotencyKey,
            submissionData,
          }),
        );
        return jsonResponse(
          {
            submissionId: source.submissionId,
            attemptOrdinal: source.attemptOrdinal,
            submittedAt: source.submittedAt,
          },
          200,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("idempotency_conflict")) {
          return jsonResponse(
            { error: "Idempotency key was already used for a different submission" },
            409,
          );
        }
        return jsonResponse({ error: "Unable to record the Topic 1.1 daily submission" }, 500);
      }
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  const claimsOrResponse = await requireStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

  const route = createPrecalculusTopic11DailyRoute({
    requireStudentSession: async () => claimsOrResponse,
    createSourceSubmission: ({ userId, activityId, idempotencyKey, submissionData }) =>
      fetchInternalMutation(internal.activities.createTopic11DailySubmission, {
        userId,
        activityId,
        idempotencyKey,
        submissionData,
      }),
  });

  return route.POST(request);
}

export default POST;
