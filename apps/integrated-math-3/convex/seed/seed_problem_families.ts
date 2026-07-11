import { internalMutation } from "../_generated/server";
import { problemFamilySchema } from "@math-platform/practice-core";
import { IM3_PROBLEM_FAMILIES } from "@math-platform/math-content/problem-families/im3";

/**
 * Convex internalMutation wrapper: seed problem families.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const seedProblemFamilies = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: { variantKey: string; success: boolean; error?: string }[] = [];

    for (const family of IM3_PROBLEM_FAMILIES) {
      const parseResult = problemFamilySchema.safeParse(family);
      if (!parseResult.success) {
        results.push({
          variantKey: family.variantKey,
          success: false,
          error: `Validation failed: ${parseResult.error.message}`,
        });
        continue;
      }

      const existing = await ctx.db
        .query("practice_variants")
        .withIndex("by_variantKey", (q) => q.eq("variantKey", family.variantKey))
        .unique();

      if (existing) {
        results.push({
          variantKey: family.variantKey,
          success: true,
        });
        continue;
      }

      await ctx.db.insert("practice_variants", {
        variantKey: family.variantKey,
        legacyProblemFamilyId: family.variantKey,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: Date.now(),
        componentKey: family.componentKey,
        displayName: family.displayName,
        description: family.description,
        objectiveIds: family.objectiveIds,
        difficulty: family.difficulty,
        metadata: family.metadata,
      });

      results.push({
        variantKey: family.variantKey,
        success: true,
      });
    }

    return results;
  },
});
