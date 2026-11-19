import { NextResponse } from "next/server";

import { calculateScore } from "@/lib/assessments/scoring";
import { requireActiveStudentRequestClaims } from "@/lib/auth/server";
import {
  practiceSubmissionEnvelopeSchema as submissionDataSchema,
  type PracticeSubmissionEnvelope,
} from "@/lib/practice/contract";
import { selectActivitySchema } from "@/lib/schemas/activity-schemas";
import { fetchInternalQuery, fetchInternalMutation, internal } from "@/lib/convex/server";
import { formatRateLimitError } from "@/convex/apiRateLimits";
import type { Id } from "@/convex/_generated/dataModel";
import { normalizePracticeSubmissionInput } from "@math-platform/practice-core/contract";
import { BM2_PILOT_SOURCE_ACTIVITY_ID } from "@/lib/learning-evidence/bm2-pilot";
import { getBm2AccountingEquationEventActivity } from "@/lib/practice/accounting-equation-event-activities";

const GENERATED_ACCOUNTING_VARIANT = /^accounting-equation-(\d+)-(assets|liabilities|equity)$/;

function parseGeneratedVariant(activityId: string): {
  hiddenTermId: "assets" | "liabilities" | "equity";
} | null {
  const match = GENERATED_ACCOUNTING_VARIANT.exec(activityId);
  if (!match) return null;
  const hiddenTermId = match[2];
  if (hiddenTermId !== "assets" && hiddenTermId !== "liabilities" && hiddenTermId !== "equity") {
    return null;
  }
  return { hiddenTermId };
}

function validateGeneratedParts(submission: PracticeSubmissionEnvelope): boolean {
  const variant = parseGeneratedVariant(submission.activityId);
  if (!variant) return false;
  const answerKeys = Object.keys(submission.answers);
  if (answerKeys.length !== 1 || answerKeys[0] !== variant.hiddenTermId) return false;
  if (submission.parts.length !== 1) return false;
  const [part] = submission.parts;
  return (
    part.partId === variant.hiddenTermId &&
    part.rawAnswer === submission.answers[variant.hiddenTermId]
  );
}

/**
 * Returns a 400 Bad Request JSON response with the given error details.
 *
 * @param details - A string error message or an object with error details.
 * @returns A NextResponse with status 400 and the error payload.
 */
function buildBadRequest(details: Record<string, unknown> | string) {
  return NextResponse.json(
    typeof details === "string"
      ? { error: details }
      : {
          error: "Invalid payload",
          details,
        },
    { status: 400 },
  );
}

/**
 * Submits an assessment progress record and returns the scored result.
 *
 * @param request - The incoming request with JSON body containing activityId
 *   and answers conforming to the practice submission contract.
 * @returns A JSON response with score, maxScore, percentage, and feedback.
 * @throws Returns 400 for invalid payloads, 404 if activity not found,
 *   422 for scoring errors, 500 on internal errors.
 */
export async function POST(request: Request) {
  try {
    const claimsOrResponse = await requireActiveStudentRequestClaims(request);
    if (claimsOrResponse instanceof Response) {
      return claimsOrResponse;
    }

    const userId = claimsOrResponse.sub as Id<"profiles">;

    let submission;
    try {
      const body = await request.json();
      submission = submissionDataSchema.parse(normalizePracticeSubmissionInput(body));
    } catch (parseError) {
      console.error("Invalid practice submission payload", parseError);
      return buildBadRequest("Invalid payload");
    }

    const rateLimitResult = await fetchInternalMutation(
      internal.apiRateLimits.checkAndIncrementApiRateLimit,
      {
        userId,
        endpoint: "assessment",
      },
    );
    if (!rateLimitResult.allowed) {
      return formatRateLimitError(rateLimitResult.windowExpiresAt);
    }

    const eventActivity = getBm2AccountingEquationEventActivity(submission.activityId);
    if (eventActivity) {
      const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
      if (!idempotencyKey) {
        return buildBadRequest(
          "Idempotency-Key is required for accounting equation event practice.",
        );
      }
      if (submission.status !== "submitted" || submission.mode !== eventActivity.mode) {
        return buildBadRequest("The accounting equation event mode or status is invalid.");
      }
      if (
        submission.parts.some(
          (part) =>
            part.normalizedAnswer !== undefined ||
            part.isCorrect !== undefined ||
            part.score !== undefined ||
            part.maxScore !== undefined ||
            part.misconceptionTags !== undefined,
        )
      ) {
        return buildBadRequest("Client grade fields are not accepted.");
      }
      if (eventActivity.mode !== "worked_example" && Object.keys(submission.answers).length === 0) {
        return buildBadRequest("answers must include at least one entry.");
      }

      try {
        const result = await fetchInternalMutation(
          internal.activities.createAccountingEquationEventSubmission,
          {
            userId,
            activityId: submission.activityId,
            submissionData: { ...submission, mode: eventActivity.mode },
            idempotencyKey,
          },
        );
        return NextResponse.json(
          "acknowledged" in result
            ? result
            : {
                ...result,
                percentage:
                  result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0,
              },
        );
      } catch (error) {
        if (error instanceof Error && error.message === "idempotency_conflict") {
          return NextResponse.json(
            { error: "Idempotency key was already used for a different submission." },
            { status: 409 },
          );
        }
        throw error;
      }
    }

    if (Object.keys(submission.answers).length === 0) {
      return buildBadRequest("answers must include at least one entry.");
    }

    if (GENERATED_ACCOUNTING_VARIANT.test(submission.activityId)) {
      if (submission.mode !== "independent_practice" || submission.status !== "submitted") {
        return buildBadRequest(
          "Generated accounting-equation practice requires independent_practice and submitted.",
        );
      }
      if (!validateGeneratedParts(submission)) {
        return buildBadRequest(
          "Generated accounting-equation parts do not match the submitted answer.",
        );
      }

      const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
      if (!idempotencyKey) {
        return buildBadRequest("Idempotency-Key is required for generated practice.");
      }

      try {
        const result = await fetchInternalMutation(
          internal.activities.createServerOwnedSubmission,
          {
            userId,
            activityId: submission.activityId,
            submissionData: { ...submission, mode: submission.mode },
            idempotencyKey,
          },
        );
        return NextResponse.json(result);
      } catch (error) {
        if (error instanceof Error && error.message === "idempotency_conflict") {
          return NextResponse.json(
            { error: "Idempotency key was already used for a different submission." },
            { status: 409 },
          );
        }
        throw error;
      }
    }

    const activityRecord = await fetchInternalQuery(internal.activities.getActivityById, {
      activityId: submission.activityId as never,
    });

    if (!activityRecord) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const isAuthoredPilotSource = activityRecord.stableActivityId === BM2_PILOT_SOURCE_ACTIVITY_ID;
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() || submission.submittedAt;
    if (isAuthoredPilotSource && !request.headers.get("Idempotency-Key")?.trim()) {
      return buildBadRequest("Idempotency-Key is required for the authored pilot.");
    }

    let activity;
    try {
      activity = selectActivitySchema.parse({
        ...activityRecord,
        description: activityRecord.description ?? null,
        standardId: activityRecord.standardId ?? null,
        gradingConfig: activityRecord.gradingConfig ?? null,
        createdAt: new Date(activityRecord.createdAt),
        updatedAt: new Date(activityRecord.updatedAt),
      });
    } catch (error) {
      console.error("Invalid activity configuration", error);
      return NextResponse.json({ error: "Activity configuration is invalid." }, { status: 500 });
    }

    let score;
    try {
      score = activity.gradingConfig?.autoGrade
        ? calculateScore(activity, submission.answers)
        : {
            score: 0,
            maxScore: 0,
            percentage: 0,
            feedback: "Your work is saved for teacher review.",
          };
    } catch (error) {
      console.error("[assessment] Scoring error:", error);
      return NextResponse.json({ error: "Unable to score submission" }, { status: 422 });
    }

    let activitySubmission;
    try {
      activitySubmission = await fetchInternalMutation(internal.activities.submitAssessment, {
        userId: userId as never,
        activityId: activityRecord.id as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submissionData: submission as any,
        score: score.score,
        maxScore: score.maxScore,
        feedback: score.feedback,
        ...(idempotencyKey === undefined ? {} : { idempotencyKey }),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("required_answers_missing"))
        return NextResponse.json(
          {
            error:
              "Answer every required prompt before submitting. You can save partial work as a draft.",
          },
          { status: 400 },
        );
      if (error instanceof Error && error.message.includes("attempt_limit_reached"))
        return NextResponse.json(
          { error: "No attempts remain. Ask your teacher for help." },
          { status: 409 },
        );
      if (error instanceof Error && error.message.includes("idempotency_conflict")) {
        return NextResponse.json(
          { error: "Idempotency key was already used for a different submission." },
          { status: 409 },
        );
      }
      throw error;
    }

    const savedScore = activitySubmission.score ?? score.score;
    const savedMaxScore = activitySubmission.maxScore ?? score.maxScore;
    const response = {
      attemptOrdinal: activitySubmission.attemptOrdinal,
      score: savedScore,
      maxScore: savedMaxScore,
      percentage: savedMaxScore > 0 ? Math.round((savedScore / savedMaxScore) * 100) : 0,
      feedback: activitySubmission.feedback ?? score.feedback,
    };
    return NextResponse.json(
      isAuthoredPilotSource ? { ...response, submissionId: activitySubmission.id } : response,
    );
  } catch (error) {
    console.error("[assessment] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
