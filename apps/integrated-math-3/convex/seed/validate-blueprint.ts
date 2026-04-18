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
  timingBaselines: { problemFamilyId: string }[];
  practiceItems: { practiceItemId: string; activityId: string; problemFamilyId: string }[];
  problemFamilies: { problemFamilyId: string; objectiveIds: string[] }[];
  activities: { _id: Id<"activities"> }[];
  competencyStandards: { _id: Id<"competency_standards">; code: string }[];
  objectivePolicies: { standardId: string }[];
};

export function runBlueprintValidation(input: ValidationInput): ValidationReport {
  const violations: ValidationViolation[] = [];
  let totalChecks = 0;

  const problemFamilyIds = new Set(input.problemFamilies.map((f) => f.problemFamilyId));
  const activityIds = new Set(input.activities.map((a) => a._id));
  const standardCodes = new Set(input.competencyStandards.map((s) => s.code));

  for (const baseline of input.timingBaselines) {
    totalChecks++;
    if (!problemFamilyIds.has(baseline.problemFamilyId)) {
      violations.push({
        type: "timing_baseline_missing_family",
        id: baseline.problemFamilyId,
        message: `timing_baselines references missing problemFamilyId: ${baseline.problemFamilyId}`,
      });
    }
  }

  for (const item of input.practiceItems) {
    totalChecks++;
    if (!problemFamilyIds.has(item.problemFamilyId)) {
      violations.push({
        type: "practice_item_missing_family",
        id: item.practiceItemId,
        message: `practice_items references missing problemFamilyId: ${item.problemFamilyId}`,
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
          id: family.problemFamilyId,
          message: `problem_families ${family.problemFamilyId} references missing objectiveId: ${objectiveId}`,
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

export const validateBlueprint = internalMutation({
  args: {},
  handler: async (ctx) => {
    const timingBaselines = await ctx.db.query("timing_baselines").take(1000);
    const practiceItems = await ctx.db.query("practice_items").take(1000);
    const problemFamilies = await ctx.db.query("problem_families").take(1000);
    const activities = await ctx.db.query("activities").take(1000);
    const competencyStandards = await ctx.db.query("competency_standards").collect();
    const objectivePolicies = await ctx.db.query("objective_policies").take(1000);

    const report = runBlueprintValidation({
      timingBaselines: timingBaselines.map((b) => ({ problemFamilyId: b.problemFamilyId })),
      practiceItems: practiceItems.map((i) => ({
        practiceItemId: i.practiceItemId,
        activityId: i.activityId,
        problemFamilyId: i.problemFamilyId,
      })),
      problemFamilies: problemFamilies.map((f) => ({
        problemFamilyId: f.problemFamilyId,
        objectiveIds: f.objectiveIds,
      })),
      activities: activities.map((a) => ({ _id: a._id })),
      competencyStandards: competencyStandards.map((s) => ({ _id: s._id, code: s.code })),
      objectivePolicies: objectivePolicies.map((p) => ({ standardId: p.standardId })),
    });

    return report;
  },
});
