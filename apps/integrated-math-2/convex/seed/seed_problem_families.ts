import { internalMutation } from "../_generated/server";
import { problemFamilySchema } from "@math-platform/practice-core";
import { IM2_PROBLEM_FAMILIES } from "@math-platform/math-content/problem-families/im2";

export const seedProblemFamilies = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: { problemFamilyId: string; success: boolean; error?: string }[] = [];

    for (const family of IM2_PROBLEM_FAMILIES) {
      const parseResult = problemFamilySchema.safeParse(family);
      if (!parseResult.success) {
        results.push({
          problemFamilyId: family.variantKey,
          success: false,
          error: `Validation failed: ${parseResult.error.message}`,
        });
        continue;
      }

      const existing = await ctx.db
        .query("problem_families")
        .withIndex("by_problemFamilyId", (q) => q.eq("problemFamilyId", family.variantKey))
        .unique();

      if (existing) {
        results.push({
          problemFamilyId: family.variantKey,
          success: true,
        });
        continue;
      }

      await ctx.db.insert("problem_families", {
        problemFamilyId: family.variantKey,
        componentKey: family.componentKey,
        displayName: family.displayName,
        description: family.description,
        objectiveIds: family.objectiveIds,
        difficulty: family.difficulty,
        metadata: family.metadata,
      });

      results.push({
        problemFamilyId: family.variantKey,
        success: true,
      });
    }

    return results;
  },
});
