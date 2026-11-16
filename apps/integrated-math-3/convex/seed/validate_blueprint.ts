import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

type ValidationViolation = {
  type: string;
  id: string;
  message: string;
};

type ValidationReport = {
  passed: boolean;
  totalChecks: number;
  violations: ValidationViolation[];
};

type ValidationInput = {
  timingBaselines: { variantKey: string }[];
  practiceItems: { practiceItemId: string; activityId: string; variantKey: string }[];
  problemFamilies: { variantKey: string; objectiveIds: string[] }[];
  activities: { _id: Id<"activities"> }[];
  competencyStandards: { _id: Id<"competency_standards">; code: string }[];
  objectivePolicies: { standardId: string }[];
};

/**
 * Validates seed blueprint data integrity by checking foreign key references.
 * @param {ValidationInput} input - The blueprint data to validate
 * @returns {ValidationReport} Validation report with passed status and any violations
 */
export function runBlueprintValidation(input: ValidationInput): ValidationReport {
  const violations: ValidationViolation[] = [];
  let totalChecks = 0;

  const variantKeys = new Set(input.problemFamilies.map((f) => f.variantKey));
  const activityIds = new Set(input.activities.map((a) => a._id));
  const standardCodes = new Set(input.competencyStandards.map((s) => s.code));

  for (const baseline of input.timingBaselines) {
    totalChecks++;
    if (!variantKeys.has(baseline.variantKey)) {
      violations.push({
        type: "timing_baseline_missing_family",
        id: baseline.variantKey,
        message: `timing_baselines references missing variantKey: ${baseline.variantKey}`,
      });
    }
  }

  for (const item of input.practiceItems) {
    totalChecks++;
    if (!variantKeys.has(item.variantKey)) {
      violations.push({
        type: "practice_item_missing_family",
        id: item.practiceItemId,
        message: `practice_items references missing variantKey: ${item.variantKey}`,
      });
    }

    totalChecks++;
    if (!activityIds.has(item.activityId as Id<"activities">)) {
      violations.push({
        type: "practice_item_missing_activity",
        id: item.practiceItemId,
        message: `practice_items references missing activityId: ${item.activityId}`,
      });
    }
  }

  for (const family of input.problemFamilies) {
    for (const objectiveId of family.objectiveIds) {
      totalChecks++;
      if (!standardCodes.has(objectiveId)) {
        violations.push({
          type: "problem_family_missing_standard",
          id: family.variantKey,
          message: `practice_variants ${family.variantKey} references missing objectiveId: ${objectiveId}`,
        });
      }
    }
  }

  for (const policy of input.objectivePolicies) {
    totalChecks++;
    if (!standardCodes.has(policy.standardId)) {
      violations.push({
        type: "objective_policy_missing_standard",
        id: policy.standardId,
        message: `objective_policies references missing standardId: ${policy.standardId}`,
      });
    }
  }

  return {
    passed: violations.length === 0,
    totalChecks,
    violations,
  };
}

/**
 * Convex internalMutation wrapper: validate blueprint.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const validateBlueprint = internalMutation({
  args: {},
  handler: async (ctx) => {
    const timingBaselines = await ctx.db.query("timing_baselines").take(1000);
    const practiceItems = await ctx.db.query("practice_items").take(1000);
    const problemFamilies = await ctx.db.query("practice_variants").take(1000);
    const activities = await ctx.db.query("activities").take(1000);
    const competencyStandards = await ctx.db.query("competency_standards").collect();
    const objectivePolicies = await ctx.db.query("objective_policies").take(1000);

    const report = runBlueprintValidation({
      timingBaselines: timingBaselines.map((b) => ({ variantKey: b.variantKey })),
      practiceItems: practiceItems.map((i) => ({
        practiceItemId: i.practiceItemId,
        activityId: i.activityId,
        variantKey: i.variantKey,
      })),
      problemFamilies: problemFamilies.map((f) => ({
        variantKey: f.variantKey,
        objectiveIds: f.objectiveIds,
      })),
      activities: activities.map((a) => ({ _id: a._id })),
      competencyStandards: competencyStandards.map((s) => ({ _id: s._id, code: s.code })),
      objectivePolicies: objectivePolicies.map((p) => ({ standardId: p.standardId })),
    });

    return report;
  },
});
