import { NextResponse } from "next/server";
import { z } from "zod";

import { requireActiveTeacherRequestClaims } from "@/lib/auth/server";
import { fetchInternalQuery, fetchInternalMutation, internal } from "@/lib/convex/server";
import { formatRateLimitError } from "@/convex/apiRateLimits";
import { buildDeterministicSummary } from "@math-platform/practice-core/error-analysis";
import type { PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import { isPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import { buildLessonErrorSummary } from "@/lib/teacher/error-summary";
import type { SubmissionDetail } from "@/lib/teacher/submission-detail";
import { resolveTeacherAiSummaryGenerator } from "@/lib/teacher/ai-error-summary";
import type { Id } from "@/convex/_generated/dataModel";

const querySchema = z.object({
  lessonId: z.string().trim().min(1, "lessonId is required"),
  studentId: z.string().trim().min(1, "studentId is required"),
});

/**
 * Returns an AI-generated error summary for a student's lesson submissions.
 *
 * @param request - The incoming request with lessonId and studentId query params.
 * @returns A JSON response with deterministic and AI-generated summaries.
 * @throws Returns 400 for invalid params, 403 for non-teachers,
 *   404 if student/submissions not found, 500 on internal errors.
 */
export async function GET(request: Request) {
  try {
    const claims = await requireActiveTeacherRequestClaims(request);
    if (claims instanceof Response) {
      return claims;
    }

    const userId = claims.sub as Id<"profiles">;

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      lessonId: searchParams.get("lessonId"),
      studentId: searchParams.get("studentId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { lessonId, studentId } = parsed.data;

    const rateLimitResult = await fetchInternalMutation(
      internal.apiRateLimits.checkAndIncrementApiRateLimit,
      {
        userId,
        endpoint: "teacher/ai-error-summary",
      },
    );
    if (!rateLimitResult.allowed) {
      return formatRateLimitError(rateLimitResult.windowExpiresAt);
    }

    const teacher = await fetchInternalQuery(internal.teacher.getProfileWithOrg, {
      userId,
    });

    if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await fetchInternalQuery(internal.activities.getProfileById, {
      profileId: studentId as Id<"profiles">,
    });

    if (
      !student ||
      student.role !== "student" ||
      student.organizationId !== teacher.organizationId
    ) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const detail = await fetchInternalQuery(internal.teacher.getSubmissionDetail, {
      studentId: studentId as Id<"profiles">,
      lessonId: lessonId as Id<"lessons">,
      studentName: student.displayName ?? student.username ?? "Unknown",
    });

    if (!detail) {
      return NextResponse.json(
        { error: "No submissions found for this student in this lesson" },
        { status: 404 },
      );
    }

    const envelopes: PracticeSubmissionEnvelope[] = [];
    for (const phase of detail.phases) {
      if (!phase.evidence) continue;
      for (const ev of phase.evidence) {
        if (ev.kind !== "practice" || !ev.submissionData) continue;
        const data = ev.submissionData as Record<string, unknown>;
        if (isPracticeSubmissionEnvelope(data)) {
          envelopes.push(data);
        }
      }
    }

    const deterministicSummary = buildDeterministicSummary(
      lessonId,
      envelopes,
      new Map(envelopes.map((e) => [e.activityId, studentId])),
    );

    const submissionDetail: SubmissionDetail = {
      studentName: detail.studentName,
      lessonTitle: detail.lessonTitle,
      phases: detail.phases.map((phase) => ({
        ...phase,
        completedAt:
          typeof phase.completedAt === "number"
            ? new Date(phase.completedAt).toISOString()
            : phase.completedAt,
      })) as SubmissionDetail["phases"],
    };
    const lessonSummary = buildLessonErrorSummary(submissionDetail);
    const generator = resolveTeacherAiSummaryGenerator();
    const aiSummary = generator ? await generator(lessonSummary) : null;

    return NextResponse.json({
      studentName: detail.studentName,
      lessonTitle: detail.lessonTitle,
      deterministicSummary,
      aiSummary,
      aiEnabled: generator !== null,
    });
  } catch (error) {
    console.error("[ai-error-summary] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
