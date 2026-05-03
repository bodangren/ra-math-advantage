import { internalMutation } from "../_generated/server";
import { OBJECTIVE_POLICIES } from "./objective_policies";
import { objectivePolicySchema } from "@math-platform/srs-engine";

export const seedObjectivePolicies = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: { standardId: string; success: boolean; error?: string }[] = [];
    const courseKey = "integrated-math-2";

    for (const policy of OBJECTIVE_POLICIES) {
      const parseResult = objectivePolicySchema.safeParse(policy);
      if (!parseResult.success) {
        results.push({
          standardId: policy.standardId,
          success: false,
          error: `Validation failed: ${parseResult.error.message}`,
        });
        continue;
      }

      const standard = await ctx.db
        .query("competency_standards")
        .withIndex("by_code", (q) => q.eq("code", policy.standardId))
        .unique();

      if (!standard) {
        results.push({
          standardId: policy.standardId,
          success: false,
          error: `Competency standard ${policy.standardId} not found`,
        });
        continue;
      }

      const existing = await ctx.db
        .query("objective_policies")
        .withIndex("by_standardId", (q) => q.eq("standardId", standard._id))
        .collect();

      const alreadyExists = existing.some((record) => record.courseKey === courseKey);
      if (alreadyExists) {
        results.push({
          standardId: policy.standardId,
          success: true,
        });
        continue;
      }

      await ctx.db.insert("objective_policies", {
        standardId: standard._id,
        policy: policy.policy,
        courseKey: policy.courseKey,
        priority: policy.priority,
      });

      results.push({
        standardId: policy.standardId,
        success: true,
      });
    }

    return results;
  },
});
