import { NextResponse } from "next/server";
import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function projectOpaqueEvidenceResult(result: unknown): Record<string, unknown> {
  if (!isRecord(result)) {
    throw new Error("Invalid opaque evidence result");
  }

  const decision = result.decision;
  if (
    typeof result.persisted !== "boolean" ||
    typeof result.masteryApplied !== "boolean" ||
    typeof result.kstApplied !== "boolean" ||
    (result.delivery !== "new" && result.delivery !== "replay") ||
    !isRecord(decision) ||
    typeof decision.idempotency !== "string" ||
    typeof decision.exposureState !== "string" ||
    typeof decision.eligible !== "boolean" ||
    typeof decision.reason !== "string" ||
    typeof decision.masteryBearing !== "boolean"
  ) {
    throw new Error("Invalid opaque evidence result");
  }

  return {
    persisted: result.persisted,
    masteryApplied: result.masteryApplied,
    kstApplied: result.kstApplied,
    delivery: result.delivery,
    decision: {
      idempotency: decision.idempotency,
      exposureState: decision.exposureState,
      eligible: decision.eligible,
      reason: decision.reason,
      masteryBearing: decision.masteryBearing,
    },
  };
}

/**
 * Handles POST requests for the IM3 pilot's opaque learning-evidence delivery.
 * The preceding authenticated create route owns raw answers and grading.
 */
export async function POST(request: Request) {
  const authResult = await requireStudentRequestClaims(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const body: unknown = await request.json();
    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "Submission body must contain one opaque submissionId" },
        { status: 400 },
      );
    }

    const keys = Object.keys(body);
    const unexpectedKey = keys.find((key) => key !== "submissionId");
    if (unexpectedKey) {
      return NextResponse.json(
        { error: `Field ${unexpectedKey} is not accepted by the opaque submission route` },
        { status: 400 },
      );
    }

    if (!Object.prototype.hasOwnProperty.call(body, "submissionId")) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    const submissionId = body.submissionId;
    if (typeof submissionId !== "string" || submissionId.trim().length === 0) {
      return NextResponse.json(
        { error: "submissionId must be a non-empty string" },
        { status: 400 },
      );
    }

    const result = await fetchInternalMutation(internal.learningEvidence.submit, {
      learnerId: authResult.sub as `profiles:${string}`,
      submissionId: submissionId as `activity_submissions:${string}`,
    });

    if (isRecord(result) && result.accepted === false) {
      if (result.reason === "submission_not_found") {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      if (
        result.reason === "attempt_ordinal_conflict" &&
        typeof result.latestAttemptOrdinal === "number" &&
        Number.isFinite(result.latestAttemptOrdinal) &&
        typeof result.receivedAttemptOrdinal === "number" &&
        Number.isFinite(result.receivedAttemptOrdinal)
      ) {
        return NextResponse.json(
          { error: "Submission conflicts with an existing attempt" },
          { status: 409 },
        );
      }

      throw new Error("Invalid opaque evidence result");
    }

    return NextResponse.json(projectOpaqueEvidenceResult(result));
  } catch (error) {
    console.error("Error processing opaque activity submission:", error);
    return NextResponse.json({ error: "Failed to submit activity" }, { status: 500 });
  }
}
