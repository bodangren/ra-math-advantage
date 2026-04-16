import { internalMutation } from "../_generated/server";
import { problemFamilySchema } from "../../lib/practice/problem-family";
import { MODULE1_PROBLEM_FAMILIES } from "./problem-families/module-1";
import { MODULE2_PROBLEM_FAMILIES } from "./problem-families/module-2";
import { MODULE3_PROBLEM_FAMILIES } from "./problem-families/module-3";
import { MODULE4_PROBLEM_FAMILIES } from "./problem-families/module-4";
import { MODULE5_PROBLEM_FAMILIES } from "./problem-families/module-5";
import { MODULE6_PROBLEM_FAMILIES } from "./problem-families/module-6";
import { MODULE7_PROBLEM_FAMILIES } from "./problem-families/module-7";
import { MODULE8_PROBLEM_FAMILIES } from "./problem-families/module-8";
import { MODULE9_PROBLEM_FAMILIES } from "./problem-families/module-9";

const ALL_PROBLEM_FAMILIES = [
  ...MODULE1_PROBLEM_FAMILIES,
  ...MODULE2_PROBLEM_FAMILIES,
  ...MODULE3_PROBLEM_FAMILIES,
  ...MODULE4_PROBLEM_FAMILIES,
  ...MODULE5_PROBLEM_FAMILIES,
  ...MODULE6_PROBLEM_FAMILIES,
  ...MODULE7_PROBLEM_FAMILIES,
  ...MODULE8_PROBLEM_FAMILIES,
  ...MODULE9_PROBLEM_FAMILIES,
];

export const seedProblemFamilies = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: { problemFamilyId: string; success: boolean; error?: string }[] = [];

    for (const family of ALL_PROBLEM_FAMILIES) {
      const parseResult = problemFamilySchema.safeParse(family);
      if (!parseResult.success) {
        results.push({
          problemFamilyId: family.problemFamilyId,
          success: false,
          error: `Validation failed: ${parseResult.error.message}`,
        });
        continue;
      }

      const existing = await ctx.db
        .query("problem_families")
        .withIndex("by_problemFamilyId", (q) => q.eq("problemFamilyId", family.problemFamilyId))
        .unique();

      if (existing) {
        results.push({
          problemFamilyId: family.problemFamilyId,
          success: true,
        });
        continue;
      }

      await ctx.db.insert("problem_families", {
        problemFamilyId: family.problemFamilyId,
        componentKey: family.componentKey,
        displayName: family.displayName,
        description: family.description,
        objectiveIds: family.objectiveIds,
        difficulty: family.difficulty,
        metadata: family.metadata,
      });

      results.push({
        problemFamilyId: family.problemFamilyId,
        success: true,
      });
    }

    return results;
  },
});