import { NextRequest, NextResponse } from "next/server";
import { requireActiveRequestSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Fetches a single activity by ID for the authenticated student, teacher, or admin.
 *
 * @param request - The incoming Next.js request with session cookie.
 * @param params - Route params containing the activityId string.
 * @returns A JSON response with the activity data, redacted for students.
 * @throws Returns 403 if the user lacks access, 404 if not found, 500 on errors.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  try {
    const claims = await requireActiveRequestSessionClaims(request);
    if (claims instanceof Response) {
      return claims;
    }

    const userId = claims.sub as Id<"profiles">;

    const profile = await fetchInternalQuery(internal.api.getProfile, {
      userId: userId,
    });

    if (!profile?.role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (profile.role !== "student" && profile.role !== "teacher" && profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { activityId } = await params;
    if (!activityId?.trim()) {
      return NextResponse.json({ error: "Invalid activity ID format" }, { status: 400 });
    }

    const activity = await fetchInternalQuery(internal.activities.getActivityById, {
      activityId: activityId as Id<"activities">,
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const responsePayload =
      profile.role === "student" ? buildStudentSafeActivity(activity) : activity;

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Strips grading config and sensitive fields from an activity for student consumption.
 *
 * @param activity - The raw activity record to sanitize.
 * @returns A copy of the activity with gradingConfig nulled and props redacted.
 */
function buildStudentSafeActivity(activity: Record<string, unknown>) {
  const props = redactSensitiveFields(activity.props, String(activity.componentKey)) as Record<
    string,
    unknown
  >;
  const original = activity.props as Record<string, unknown>;
  if (
    activity.componentKey === "fill-in-the-blank" &&
    original.showWordList &&
    Array.isArray(original.sentences)
  ) {
    props.wordBank = [
      ...new Set(
        original.sentences
          .flatMap((sentence) => [sentence.answer, ...(sentence.alternativeAnswers ?? [])])
          .filter((word) => typeof word === "string"),
      ),
    ].sort();
  }
  return {
    ...activity,
    gradingConfig: null,
    props,
  };
}

/**
 * Recursively removes sensitive keys like correctAnswer from a nested value.
 *
 * @param value - The value to sanitize (object, array, or primitive).
 * @returns A deep copy with sensitive keys stripped.
 */
function redactSensitiveFields(value: unknown, componentKey: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveFields(item, componentKey));
  }

  if (value && typeof value === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (
        [
          "correctAnswer",
          "answer",
          "answerFormula",
          "alternativeAnswers",
          "expectedValue",
          "expectedFormula",
          "explanation",
        ].includes(key) ||
        (componentKey === "notebook-organizer" && key === "category")
      ) {
        continue;
      }
      redacted[key] = redactSensitiveFields(nestedValue, componentKey);
    }
    return redacted;
  }

  return value;
}
