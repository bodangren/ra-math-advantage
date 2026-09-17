import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { upsertIm3PilotSeed } from "./seed_lesson_1_1";

/**
 * Focused entry point for pilot seed tooling.
 * `seedLesson1` owns the canonical pilot upsert. This mutation reuses the
 * same builder and conflict checks for a pilot-only seed.
 */
export const seedIm3Pilot = internalMutation({
  args: {},
  returns: v.object({
    activityId: v.id("activities"),
    stableActivityId: v.string(),
    variantKey: v.string(),
    practiceItemId: v.string(),
  }),
  handler: async (ctx) => upsertIm3PilotSeed(ctx, Date.now()),
});
