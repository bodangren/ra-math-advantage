import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { nodeId, projectPerpendicularBisector } from "../../lib/practice/perpendicular-bisector";

const modes = ["worked_example", "guided_practice", "independent_practice"] as const;
const seeds = [60, 202, 303] as const;
export async function seedPerpendicularBisectorPilotHandler(ctx: MutationCtx) {
  const now = Date.now(),
    ids = [];
  for (const [index, mode] of modes.entries()) {
    const stableActivityId = `${nodeId}.${mode}`,
      seed = seeds[index];
    const props = projectPerpendicularBisector(
      { nodeId, seed, difficulty: 1 },
      mode,
      stableActivityId,
    );
    const existing = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (q) => q.eq("stableActivityId", stableActivityId))
      .unique();
    const value = {
      stableActivityId,
      masteryNodeId: nodeId,
      learningEvidenceMode: mode,
      generatorSeed: seed,
      generatorDifficulty: 1,
      componentKey: "im2-question",
      displayName: `Perpendicular bisector: ${mode.replaceAll("_", " ")}`,
      props,
      gradingConfig: { autoGrade: true, partialCredit: false },
      updatedAt: now,
    };
    const changed =
      existing !== null &&
      JSON.stringify({
        stableActivityId: existing.stableActivityId,
        masteryNodeId: existing.masteryNodeId,
        learningEvidenceMode: existing.learningEvidenceMode,
        generatorSeed: existing.generatorSeed,
        generatorDifficulty: existing.generatorDifficulty,
        componentKey: existing.componentKey,
        displayName: existing.displayName,
        props: existing.props,
        gradingConfig: existing.gradingConfig,
      }) !==
        JSON.stringify({
          stableActivityId: value.stableActivityId,
          masteryNodeId: value.masteryNodeId,
          learningEvidenceMode: value.learningEvidenceMode,
          generatorSeed: value.generatorSeed,
          generatorDifficulty: value.generatorDifficulty,
          componentKey: value.componentKey,
          displayName: value.displayName,
          props: value.props,
          gradingConfig: value.gradingConfig,
        });
    const id = existing
      ? (await ctx.db.patch(existing._id, {
          ...value,
          ...(changed ? { approval: undefined, srsEligible: false } : {}),
        }),
        existing._id)
      : await ctx.db.insert("activities", { ...value, srsEligible: false, createdAt: now });
    ids.push(id);
  }
  return ids;
}
export const seedPerpendicularBisectorPilot = internalMutation({
  args: {},
  returns: v.array(v.id("activities")),
  handler: seedPerpendicularBisectorPilotHandler,
});
