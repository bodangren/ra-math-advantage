import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { computeTimingBaseline, type PracticeTimingBaseline } from "../lib/practice/timing-baseline";
import type { Doc, Id } from "./_generated/dataModel";

const MAX_SUBMISSIONS_PER_BATCH = 500;

type TimingSummary = {
  activeMs: number;
  confidence: "high" | "medium" | "low";
};

export const getTimingBaseline = internalQuery({
  args: {
    problemFamilyId: v.string(),
  },
  handler: async (ctx, args) => {
    const baseline = await ctx.db
      .query("timing_baselines")
      .withIndex("by_problem_family", (q) =>
        q.eq("problemFamilyId", args.problemFamilyId)
      )
      .unique();
    return baseline;
  },
});

export const recomputeTimingBaseline = internalMutation({
  args: {
    problemFamilyId: v.string(),
    activityIds: v.array(v.id("activities")),
    minSamples: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const eligibleTimings = await collectEligibleTimings(ctx, args.activityIds);

    const baselineInput = {
      problemFamilyId: args.problemFamilyId,
      timings: eligibleTimings,
      minSamples: args.minSamples,
      computedAt: new Date().toISOString(),
    };

    const baseline = computeTimingBaseline(baselineInput);

    const existing = await ctx.db
      .query("timing_baselines")
      .withIndex("by_problem_family", (q) =>
        q.eq("problemFamilyId", args.problemFamilyId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, baseline);
    } else {
      await ctx.db.insert("timing_baselines", baseline);
    }

    return baseline;
  },
});

export const batchRecomputeTimingBaselines = internalMutation({
  args: {
    recomputations: v.array(
      v.object({
        problemFamilyId: v.string(),
        activityIds: v.array(v.id("activities")),
        minSamples: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: PracticeTimingBaseline[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < args.recomputations.length; i += BATCH_SIZE) {
      const batch = args.recomputations.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (recomp) => {
          const eligibleTimings = await collectEligibleTimings(ctx, recomp.activityIds);

          const baseline = computeTimingBaseline({
            problemFamilyId: recomp.problemFamilyId,
            timings: eligibleTimings,
            minSamples: recomp.minSamples,
            computedAt: new Date().toISOString(),
          });

          const existing = await ctx.db
            .query("timing_baselines")
            .withIndex("by_problem_family", (q) =>
              q.eq("problemFamilyId", recomp.problemFamilyId)
            )
            .unique();

          if (existing) {
            await ctx.db.patch(existing._id, baseline);
          } else {
            await ctx.db.insert("timing_baselines", baseline);
          }

          return baseline;
        })
      );
      results.push(...batchResults);
    }

    return results;
  },
});

export const getStaleBaselines = internalQuery({
  args: {
    maxAgeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoff = new Date(Date.now() - args.maxAgeMs).toISOString();
    const stale: Doc<"timing_baselines">[] = [];

    const allBaselines = await ctx.db
      .query("timing_baselines")
      .take(1000);

    for (const baseline of allBaselines) {
      if (baseline.lastComputedAt < cutoff) {
        stale.push(baseline);
      }
    }

    return stale;
  },
});

async function collectEligibleTimings(
  ctx: MutationCtx | QueryCtx,
  activityIds: Id<"activities">[]
): Promise<TimingSummary[]> {
  const eligibleTimings: TimingSummary[] = [];

  for (const activityId of activityIds) {
    const submissions = await ctx.db
      .query("activity_submissions")
      .withIndex("by_activity", (q) =>
        q.eq("activityId", activityId)
      )
      .take(MAX_SUBMISSIONS_PER_BATCH);

    for (const submission of submissions) {
      const timing = (submission.submissionData as { timing?: TimingSummary })?.timing;
      if (!timing) continue;
      if (timing.confidence === "low") continue;
      eligibleTimings.push({
        activeMs: timing.activeMs,
        confidence: timing.confidence,
      });
    }
  }

  return eligibleTimings;
}