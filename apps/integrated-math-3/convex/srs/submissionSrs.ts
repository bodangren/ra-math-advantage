import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { SubmissionSrsAdapter } from "@math-platform/srs-engine";
import { ConvexCardStore } from "../../lib/srs/convexCardStore";
import { ConvexReviewLogStore } from "../../lib/srs/convexReviewLogStore";
import type { PracticeTimingBaseline } from "@math-platform/practice-core";
import type { MutationCtx } from "../_generated/server";

/**
 * Looks up the variant and objective for an activity.
 * @param {MutationCtx} ctx - The mutation context
 * @param {string} activityId - The activity ID to look up
 * @returns {Promise<{ variantKey: string; objectiveId: string } | null>} The variant key and objective ID, or null if not found
 */
async function lookupVariant(
  ctx: MutationCtx,
  activityId: string
): Promise<{ variantKey: string; objectiveId: string } | null> {
  const item = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) =>
      q.eq("activityId", activityId as Id<"activities">)
    )
    .first();

  if (!item) return null;

  const family = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) =>
      q.eq("variantKey", item.variantKey)
    )
    .first();

  if (!family) return null;

  return {
    variantKey: item.variantKey,
    objectiveId: family.objectiveIds[0] ?? "",
  };
}

/**
 * Looks up the timing baseline for a variant.
 * @param {MutationCtx} ctx - The mutation context
 * @param {string} variantKey - The variant key to look up
 * @returns {Promise<PracticeTimingBaseline | null>} The timing baseline, or null if not found
 */
async function lookupBaseline(
  ctx: MutationCtx,
  variantKey: string
): Promise<PracticeTimingBaseline | null> {
  const baseline = await ctx.db
    .query("timing_baselines")
    .withIndex("by_variant", (q) =>
      q.eq("variantKey", variantKey)
    )
    .first();

  if (!baseline) return null;

  return {
    variantKey: baseline.variantKey,
    sampleCount: baseline.sampleCount,
    medianActiveMs: baseline.medianActiveMs,
    p25ActiveMs: baseline.p25ActiveMs,
    p75ActiveMs: baseline.p75ActiveMs,
    p90ActiveMs: baseline.p90ActiveMs,
    lastComputedAt: baseline.lastComputedAt,
    minSamplesMet: baseline.minSamplesMet,
  };
}

/**
 * Processes a student submission through the SRS adapter.
 * @param {MutationCtx} ctx - The mutation context
 * @param {{ studentId: string; activityId: string; submission: unknown }} args - The student ID, activity ID, and submission data
 * @returns {Promise<{ ok: true; skipped: false; cardId: string; reviewId: string } | { ok: false; skipped: true; reason: string } | { ok: false; skipped: false; error: string }>} Result with card/review IDs, skip reason, or error message
 */
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
    const familyInfo = await lookupVariant(ctx, args.activityId);
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
        getBaseline: async (variantKey: string) =>
          lookupBaseline(ctx, variantKey),
      },
    });

    const result = await adapter.processSubmission({
      submission: args.submission as import("@math-platform/srs-engine").PracticeSubmissionEnvelope,
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
