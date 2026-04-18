import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { practiceItemSchema } from "../../lib/practice/practice-item";
import {
  MODULE1_PROBLEM_FAMILIES,
} from "./problem-families/module-1";
import {
  MODULE2_PROBLEM_FAMILIES,
} from "./problem-families/module-2";
import {
  MODULE3_PROBLEM_FAMILIES,
} from "./problem-families/module-3";
import {
  MODULE4_PROBLEM_FAMILIES,
} from "./problem-families/module-4";
import {
  MODULE5_PROBLEM_FAMILIES,
} from "./problem-families/module-5";
import {
  MODULE6_PROBLEM_FAMILIES,
} from "./problem-families/module-6";
import {
  MODULE7_PROBLEM_FAMILIES,
} from "./problem-families/module-7";
import {
  MODULE8_PROBLEM_FAMILIES,
} from "./problem-families/module-8";
import {
  MODULE9_PROBLEM_FAMILIES,
} from "./problem-families/module-9";

const ALL_PROBLEM_FAMILY_IDS = [
  ...MODULE1_PROBLEM_FAMILIES,
  ...MODULE2_PROBLEM_FAMILIES,
  ...MODULE3_PROBLEM_FAMILIES,
  ...MODULE4_PROBLEM_FAMILIES,
  ...MODULE5_PROBLEM_FAMILIES,
  ...MODULE6_PROBLEM_FAMILIES,
  ...MODULE7_PROBLEM_FAMILIES,
  ...MODULE8_PROBLEM_FAMILIES,
  ...MODULE9_PROBLEM_FAMILIES,
].map((f) => f.problemFamilyId);

export const seedPracticeItems = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: { practiceItemId: string; activityId: string; problemFamilyId: string; success: boolean; error?: string }[] = [];

    const variantCounters: Record<string, number> = {};

    for (const problemFamilyId of ALL_PROBLEM_FAMILY_IDS) {
      const family = await ctx.db
        .query("problem_families")
        .withIndex("by_problemFamilyId", (q) => q.eq("problemFamilyId", problemFamilyId))
        .unique();

      if (!family) {
        results.push({
          practiceItemId: "",
          activityId: "",
          problemFamilyId,
          success: false,
          error: `Problem family ${problemFamilyId} not found`,
        });
        continue;
      }

      const firstStandardCode = family.objectiveIds[0];
      if (!firstStandardCode) {
        results.push({
          practiceItemId: "",
          activityId: "",
          problemFamilyId,
          success: false,
          error: `No objectiveIds in problem family ${problemFamilyId}`,
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
          .collect();
      }

      const matchingActivities = activities.filter((a) => a.componentKey === family.componentKey);

      if (matchingActivities.length === 0) {
        const allActivities = await ctx.db
          .query("activities")
          .take(200);

        const fallbackActivities = allActivities.filter((a: { componentKey: string }) => a.componentKey === family.componentKey);

        if (fallbackActivities.length > 0) {
          for (const activity of fallbackActivities) {
            const variantKey = `${problemFamilyId}:${activity._id}`;
            if (!variantCounters[variantKey]) {
              variantCounters[variantKey] = 0;
            }
            const variantNum = variantCounters[variantKey]++;
            const variantLabel = variantNum === 0 ? "Set A" : variantNum === 1 ? "Set B" : `Set ${String.fromCharCode(65 + variantNum)}`;

            const practiceItemId = `${problemFamilyId}:${activity._id}`;

            const existing = await ctx.db
              .query("practice_items")
              .withIndex("by_activityId", (q) => q.eq("activityId", activity._id))
              .first();

            if (existing) {
              results.push({
                practiceItemId: existing.practiceItemId,
                activityId: activity._id,
                problemFamilyId,
                success: true,
              });
              continue;
            }

            const parseResult = practiceItemSchema.safeParse({
              practiceItemId,
              activityId: activity._id,
              problemFamilyId,
              variantLabel,
            });

            if (!parseResult.success) {
              results.push({
                practiceItemId,
                activityId: activity._id,
                problemFamilyId,
                success: false,
                error: `Validation failed: ${parseResult.error.message}`,
              });
              continue;
            }

            await ctx.db.insert("practice_items", {
              practiceItemId,
              activityId: activity._id,
              problemFamilyId,
              variantLabel,
            });

            results.push({
              practiceItemId,
              activityId: activity._id,
              problemFamilyId,
              success: true,
            });
          }
        } else {
          results.push({
            practiceItemId: "",
            activityId: "",
            problemFamilyId,
            success: false,
            error: `No activities found for componentKey ${family.componentKey}`,
          });
        }
        continue;
      }

      for (const activity of matchingActivities) {
        const variantKey = `${problemFamilyId}:${activity._id}`;
        if (!variantCounters[variantKey]) {
          variantCounters[variantKey] = 0;
        }
        const variantNum = variantCounters[variantKey]++;
        const variantLabel = variantNum === 0 ? "Set A" : variantNum === 1 ? "Set B" : `Set ${String.fromCharCode(65 + variantNum)}`;

        const practiceItemId = `${problemFamilyId}:${activity._id}`;

        const existing = await ctx.db
          .query("practice_items")
          .withIndex("by_activityId", (q) => q.eq("activityId", activity._id))
          .first();

        if (existing) {
          results.push({
            practiceItemId: existing.practiceItemId,
            activityId: activity._id,
            problemFamilyId,
            success: true,
          });
          continue;
        }

        const parseResult = practiceItemSchema.safeParse({
          practiceItemId,
          activityId: activity._id,
          problemFamilyId,
          variantLabel,
        });

        if (!parseResult.success) {
          results.push({
            practiceItemId,
            activityId: activity._id,
            problemFamilyId,
            success: false,
            error: `Validation failed: ${parseResult.error.message}`,
          });
          continue;
        }

        await ctx.db.insert("practice_items", {
          practiceItemId,
          activityId: activity._id,
          problemFamilyId,
          variantLabel,
        });

        results.push({
          practiceItemId,
          activityId: activity._id,
          problemFamilyId,
          success: true,
        });
      }
    }

    return results;
  },
});