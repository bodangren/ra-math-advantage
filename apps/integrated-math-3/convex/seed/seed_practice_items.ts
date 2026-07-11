import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { practiceItemSchema } from "@math-platform/practice-core";
import { IM3_PROBLEM_FAMILIES } from "@math-platform/math-content/problem-families/im3";

const ALL_VARIANT_KEYS = [...IM3_PROBLEM_FAMILIES].map((f) => f.variantKey);

/**
 * Convex internalMutation wrapper: seed practice items.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const seedPracticeItems = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: { practiceItemId: string; activityId: string; variantKey: string; success: boolean; error?: string }[] = [];

    const variantCounters: Record<string, number> = {};

    for (const seedVariantKey of ALL_VARIANT_KEYS) {
      const family = await ctx.db
        .query("practice_variants")
        .withIndex("by_variantKey", (q) => q.eq("variantKey", seedVariantKey))
        .unique();

      if (!family) {
        results.push({
          practiceItemId: "",
          activityId: "",
          variantKey: seedVariantKey,
          success: false,
          error: `Practice variant ${seedVariantKey} not found`,
        });
        continue;
      }

      const firstStandardCode = family.objectiveIds[0];
      if (!firstStandardCode) {
        results.push({
          practiceItemId: "",
          activityId: "",
          variantKey: seedVariantKey,
          success: false,
          error: `No objectiveIds in practice variant ${seedVariantKey}`,
        });
        continue;
      }

      const standard = await ctx.db
        .query("competency_standards")
        .withIndex("by_code", (q) => q.eq("code", firstStandardCode))
        .unique();

      const standardId: Id<"competency_standards"> | null = standard?._id ?? null;

      let activities: { _id: Id<"activities">; componentKey: string }[] = [];
      if (standardId) {
        activities = await ctx.db
          .query("activities")
          .withIndex("by_standard", (q) => q.eq("standardId", standardId))
          .take(200);
      }

      const matchingActivities = activities.filter((a) => a.componentKey === family.componentKey);

      if (matchingActivities.length === 0) {
        const allActivities = await ctx.db
          .query("activities")
          .take(200);

        const fallbackActivities = allActivities.filter((a: { componentKey: string }) => a.componentKey === family.componentKey);

        if (fallbackActivities.length > 0) {
          for (const activity of fallbackActivities) {
            const variantKey = `${seedVariantKey}:${activity._id}`;
            if (!variantCounters[variantKey]) {
              variantCounters[variantKey] = 0;
            }
            const variantNum = variantCounters[variantKey]++;
            const variantLabel = variantNum === 0 ? "Set A" : variantNum === 1 ? "Set B" : `Set ${String.fromCharCode(65 + variantNum)}`;

            const practiceItemId = `${seedVariantKey}:${activity._id}`;

            const existing = await ctx.db
              .query("practice_items")
              .withIndex("by_activityId", (q) => q.eq("activityId", activity._id))
              .first();

            if (existing) {
              results.push({
                practiceItemId: existing.practiceItemId,
                activityId: activity._id,
                variantKey,
                success: true,
              });
              continue;
            }

            const parseResult = practiceItemSchema.safeParse({
              practiceItemId,
              activityId: activity._id,
              variantKey,
              variantLabel,
            });

            if (!parseResult.success) {
              results.push({
                practiceItemId,
                activityId: activity._id,
                variantKey,
                success: false,
                error: `Validation failed: ${parseResult.error.message}`,
              });
              continue;
            }

            await ctx.db.insert("practice_items", {
              practiceItemId,
              activityId: activity._id,
              variantKey,
              legacyProblemFamilyId: seedVariantKey,
              migrationVersion: "kst-srs.v3.2",
              sourceTimestamp: Date.now(),
              variantLabel,
            });

            results.push({
              practiceItemId,
              activityId: activity._id,
              variantKey,
              success: true,
            });
          }
        } else {
          results.push({
            practiceItemId: "",
            activityId: "",
            variantKey: seedVariantKey,
            success: false,
            error: `No activities found for componentKey ${family.componentKey}`,
          });
        }
        continue;
      }

      for (const activity of matchingActivities) {
        const variantKey = `${seedVariantKey}:${activity._id}`;
        if (!variantCounters[variantKey]) {
          variantCounters[variantKey] = 0;
        }
        const variantNum = variantCounters[variantKey]++;
        const variantLabel = variantNum === 0 ? "Set A" : variantNum === 1 ? "Set B" : `Set ${String.fromCharCode(65 + variantNum)}`;

        const practiceItemId = `${seedVariantKey}:${activity._id}`;

        const existing = await ctx.db
          .query("practice_items")
          .withIndex("by_activityId", (q) => q.eq("activityId", activity._id))
          .first();

        if (existing) {
          results.push({
            practiceItemId: existing.practiceItemId,
            activityId: activity._id,
            variantKey,
            success: true,
          });
          continue;
        }

        const parseResult = practiceItemSchema.safeParse({
          practiceItemId,
          activityId: activity._id,
          variantKey,
          variantLabel,
        });

        if (!parseResult.success) {
          results.push({
            practiceItemId,
            activityId: activity._id,
            variantKey,
            success: false,
            error: `Validation failed: ${parseResult.error.message}`,
          });
          continue;
        }

        await ctx.db.insert("practice_items", {
          practiceItemId,
          activityId: activity._id,
          variantKey,
          legacyProblemFamilyId: seedVariantKey,
          migrationVersion: "kst-srs.v3.2",
          sourceTimestamp: Date.now(),
          variantLabel,
        });

        results.push({
          practiceItemId,
          activityId: activity._id,
          variantKey,
          success: true,
        });
      }
    }

    return results;
  },
});
