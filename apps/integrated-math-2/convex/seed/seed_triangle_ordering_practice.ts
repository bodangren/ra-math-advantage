import { convexToJson, v, type Value } from "convex/values";
import { internalMutation, type MutationCtx } from "../_generated/server";
import {
  projectTriangleItem,
  triangleModes,
  triangleNodeIds,
} from "../../lib/practice/triangle-ordering";

const reviewedFields = [
  "stableActivityId",
  "masteryNodeId",
  "learningEvidenceMode",
  "generatorSeed",
  "generatorDifficulty",
  "componentKey",
  "displayName",
  "props",
  "gradingConfig",
] as const;
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value === "object" && value !== null)
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  return value;
}
function sameReviewedContent(existing: Record<string, unknown>, expected: Record<string, unknown>) {
  const stored = Object.fromEntries(reviewedFields.map((key) => [key, existing[key]]));
  return (
    JSON.stringify(canonical(convexToJson(stored as Value))) ===
    JSON.stringify(canonical(convexToJson(expected as Value)))
  );
}
export async function seedTriangleOrderingPracticeHandler(ctx: MutationCtx) {
  const now = Date.now();
  const ids = [];
  for (const nodeId of Object.values(triangleNodeIds)) {
    for (const { mode, seed } of triangleModes(nodeId)) {
      const stableActivityId = `${nodeId}.${mode}`;
      const reviewed = {
        stableActivityId,
        masteryNodeId: nodeId,
        learningEvidenceMode: mode,
        generatorSeed: seed,
        generatorDifficulty: 1,
        componentKey: "im2-question",
        displayName: `Triangle ordering: ${mode.replaceAll("_", " ")}`,
        props: projectTriangleItem(nodeId, mode, seed, 1, stableActivityId),
        gradingConfig: { autoGrade: true, partialCredit: false },
      };
      const existing = await ctx.db
        .query("activities")
        .withIndex("by_stable_activity_id", (query) =>
          query.eq("stableActivityId", stableActivityId),
        )
        .unique();
      if (!existing) {
        ids.push(
          await ctx.db.insert("activities", {
            ...reviewed,
            srsEligible: false,
            createdAt: now,
            updatedAt: now,
          }),
        );
        continue;
      }
      if (!sameReviewedContent(existing, reviewed))
        await ctx.db.patch(existing._id, {
          ...reviewed,
          approval: undefined,
          srsEligible: false,
          updatedAt: now,
        });
      ids.push(existing._id);
    }
  }
  return ids;
}
export const seedTriangleOrderingPractice = internalMutation({
  args: {},
  returns: v.array(v.id("activities")),
  handler: seedTriangleOrderingPracticeHandler,
});
