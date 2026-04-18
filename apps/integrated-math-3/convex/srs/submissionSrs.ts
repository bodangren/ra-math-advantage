import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { SubmissionSrsAdapter } from "../../lib/srs/submission-srs-adapter";
import { ConvexCardStore } from "../../lib/srs/convexCardStore";
import { ConvexReviewLogStore } from "../../lib/srs/convexReviewLogStore";
import type { PracticeTimingBaseline } from "../../lib/practice/timing-baseline";
import type { MutationCtx } from "../_generated/server";

async function lookupProblemFamily(
  ctx: MutationCtx,
  activityId: string
): Promise<{ problemFamilyId: string; objectiveId: string } | null> {
  const item = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) =>
      q.eq("activityId", activityId as Id<"activities">)
    )
    .first();

  if (!item) return null;

  const family = await ctx.db
    .query("problem_families")
    .withIndex("by_problemFamilyId", (q) =>
      q.eq("problemFamilyId", item.problemFamilyId)
    )
    .first();

  if (!family) return null;

  return {
    problemFamilyId: item.problemFamilyId,
    objectiveId: family.objectiveIds[0] ?? "",
  };
}

async function lookupBaseline(
  ctx: MutationCtx,
  problemFamilyId: string
): Promise<PracticeTimingBaseline | null> {
  const baseline = await ctx.db
    .query("timing_baselines")
    .withIndex("by_problem_family", (q) =>
      q.eq("problemFamilyId", problemFamilyId)
    )
    .first();

  if (!baseline) return null;

  return {
    problemFamilyId: baseline.problemFamilyId,
    sampleCount: baseline.sampleCount,
    medianActiveMs: baseline.medianActiveMs,
    p25ActiveMs: baseline.p25ActiveMs,
    p75ActiveMs: baseline.p75ActiveMs,
    p90ActiveMs: baseline.p90ActiveMs,
    lastComputedAt: baseline.lastComputedAt,
    minSamplesMet: baseline.minSamplesMet,
  };
}

export async function processSubmissionSrsHandler(
  ctx: MutationCtx,
  args: {
    studentId: string;
    activityId: string;
    submission: unknown;
  }
): Promise<
  | { ok: true; skipped: false; cardId: string; reviewId: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string }
> {
  try {
    const familyInfo = await lookupProblemFamily(ctx, args.activityId);
    if (!familyInfo) {
      return { ok: false, skipped: true, reason: "no_blueprint" };
    }

    const adapter = new SubmissionSrsAdapter({
      cardStore: new ConvexCardStore(ctx),
      reviewLogStore: new ConvexReviewLogStore(ctx),
      resolver: {
        resolve: async () => familyInfo,
      },
      baselineResolver: {
        getBaseline: async (problemFamilyId: string) =>
          lookupBaseline(ctx, problemFamilyId),
      },
    });

    const result = await adapter.processSubmission({
      submission: args.submission as import("../../lib/srs/contract").PracticeSubmissionEnvelope,
      studentId: args.studentId,
      activityId: args.activityId,
    });

    if (result.skipped) {
      return {
        ok: false,
        skipped: true,
        reason: "reason" in result ? result.reason : "unknown",
      };
    }

    if (!result.ok) {
      return {
        ok: false,
        skipped: false,
        error: "error" in result ? result.error : "unknown",
      };
    }

    return {
      ok: true,
      skipped: false,
      cardId: result.card.cardId,
      reviewId: result.reviewLog.reviewId,
    };
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export const processSubmissionSrs = internalMutation({
  args: {
    studentId: v.string(),
    activityId: v.string(),
    submission: v.any(),
  },
  handler: processSubmissionSrsHandler,
});
