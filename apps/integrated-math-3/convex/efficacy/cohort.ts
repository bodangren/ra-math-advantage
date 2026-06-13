import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import {
  computeRetentionCurve,
  computeReviewSuccessRate,
} from "@math-platform/efficacy-core";
import type { SrsCardState, SrsReviewLogEntry } from "@math-platform/srs-engine";
import type { MetricResult, RetentionPoint, ReviewSuccessRate } from "@math-platform/efficacy-core";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type CohortMetricsResult = {
  status: "ok" | "suppressed";
  classId: string;
  n: number;
  metrics: {
    retention?: MetricResult<RetentionPoint[]>;
    reviewSuccess?: ReviewSuccessRate;
  };
};

export async function aggregateCohortMetricsHandler(
  ctx: QueryCtx,
  args: {
    classId: Id<"classes">;
    windowStartMs: number;
    windowEndMs: number;
  },
): Promise<CohortMetricsResult> {
  const { classId, windowStartMs, windowEndMs } = args;

  const allEnrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class", (q) => q.eq("classId", classId))
    .collect();

  const activeEnrollments = allEnrollments.filter(
    (e) => e.status === "active",
  );

  const activeStudentIds = new Set(activeEnrollments.map((e) => e.studentId));
  const n = activeStudentIds.size;

  if (n === 0) {
    return {
      status: "ok",
      classId,
      n: 0,
      metrics: {},
    };
  }

  const allCards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student")
    .collect();
  const studentCards: SrsCardState[] = allCards
    .filter((c) => activeStudentIds.has(c.studentId))
    .map((c) => ({
      cardId: c._id as unknown as string,
      studentId: c.studentId,
      objectiveId: c.objectiveId,
      problemFamilyId: c.problemFamilyId,
      stability: c.stability,
      difficulty: c.difficulty,
      state: c.state as SrsCardState["state"],
      dueDate: c.dueDate,
      elapsedDays: c.elapsedDays,
      scheduledDays: c.scheduledDays,
      reps: c.reps,
      lapses: c.lapses,
      lastReview: c.lastReview ?? null,
      createdAt: new Date(c.createdAt).toISOString(),
      updatedAt: new Date(c.updatedAt).toISOString(),
    }));

  const allReviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student")
    .collect();
  const studentReviews: SrsReviewLogEntry[] = allReviews
    .filter((r) => activeStudentIds.has(r.studentId))
    .filter((r) => r.reviewedAt >= windowStartMs && r.reviewedAt < windowEndMs)
    .map((r) => ({
      cardId: r.cardId,
      studentId: r.studentId,
      rating: r.rating as SrsReviewLogEntry["rating"],
      reviewId: r.reviewId ?? "",
      submissionId: r.submissionId ?? "",
      evidence: r.evidence as SrsReviewLogEntry["evidence"],
      stateBefore: r.stateBefore as SrsReviewLogEntry["stateBefore"],
      stateAfter: r.stateAfter as SrsReviewLogEntry["stateAfter"],
      reviewedAt: new Date(r.reviewedAt).toISOString(),
    }));

  const retention = computeRetentionCurve({
    cards: studentCards,
    windowStartMs,
    windowEndMs,
    bucketMs: MS_PER_DAY,
  });

  const reviewSuccess = computeReviewSuccessRate({
    reviewLogs: studentReviews,
    windowStartMs,
    windowEndMs,
  });

  return {
    status: "ok",
    classId,
    n,
    metrics: {
      retention,
      reviewSuccess: reviewSuccess.value,
    },
  };
}

export const cohort = internalQuery({
  args: {
    classId: v.id("classes"),
    windowStartMs: v.number(),
    windowEndMs: v.number(),
  },
  handler: aggregateCohortMetricsHandler,
});
