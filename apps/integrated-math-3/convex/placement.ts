import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

interface SeedPlacementResultsArgs {
  studentId: Id<"profiles">;
  results: ReadonlyArray<{
    nodeId: string;
    masteryEstimate: number;
    confidence: "low" | "medium";
  }>;
  now?: number;
}

/**
 * Seeds or updates placement results for a student.
 * @param {MutationCtx} ctx - The mutation context
 * @param {SeedPlacementResultsArgs} args - The student ID and placement results with mastery estimates
 * @returns {Promise<{ persistedIds: Id<"placement_results">[] }>} Object with persisted result IDs
 * @throws Error if confidence or masteryEstimate values are invalid
 */
export async function seedPlacementResultsHandler(
  ctx: MutationCtx,
  args: SeedPlacementResultsArgs,
) {
  const now = args.now ?? Date.now();

  for (const r of args.results) {
    if (r.confidence !== "low" && r.confidence !== "medium") {
      throw new Error(
        `Invalid confidence value: "${r.confidence}". Placement seeds must be low or medium.`,
      );
    }
    if (r.masteryEstimate < 0 || r.masteryEstimate > 1) {
      throw new Error(
        `Invalid masteryEstimate: ${r.masteryEstimate}. Must be in [0, 1].`,
      );
    }
  }

  const persistedIds: Id<"placement_results">[] = [];

  for (const r of args.results) {
    const existing = await ctx.db
      .query("placement_results")
      .withIndex("by_student_and_node", (q) =>
        q.eq("studentId", args.studentId).eq("nodeId", r.nodeId),
      )
      .unique();

    if (existing) {
      const updates = {
        masteryEstimate: r.masteryEstimate,
        confidence: r.confidence,
        source: "placement",
        createdAt: now,
      };
      await ctx.db.patch(existing._id, updates);
      Object.assign(existing, updates);
      persistedIds.push(existing._id);
    } else {
      const id = await ctx.db.insert("placement_results", {
        studentId: args.studentId,
        nodeId: r.nodeId,
        masteryEstimate: r.masteryEstimate,
        confidence: r.confidence,
        source: "placement",
        createdAt: now,
      });
      persistedIds.push(id);
    }
  }

  return { persistedIds };
}

/**
 * Checks whether a student has any placement results.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: Id<"profiles"> }} args - The student ID
 * @returns {Promise<boolean>} True if at least one placement result exists
 */
export async function hasPlacementResultsHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles"> },
) {
  const row = await ctx.db
    .query("placement_results")
    .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
    .first();
  return row !== null;
}

/**
 * Retrieves all placement results for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: Id<"profiles"> }} args - The student ID
 * @returns {Promise<Doc<"placement_results">[]>} Array of placement result documents
 */
export async function getStudentPlacementResultsHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles"> },
) {
  return ctx.db
    .query("placement_results")
    .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
    .collect();
}

/**
 * Internal mutation that seeds or updates placement results for a student.
 * Upserts `placement_results` rows keyed by (studentId, nodeId); existing
 * rows are patched in place, new rows are inserted with `source: "placement"`.
 * @returns {Promise<{ persistedIds: Id<"placement_results">[] }>} Array of persisted placement result IDs
 */
export const seedPlacementResults = internalMutation({
  args: {
    studentId: v.id("profiles"),
    results: v.array(
      v.object({
        nodeId: v.string(),
        masteryEstimate: v.number(),
        confidence: v.union(v.literal("low"), v.literal("medium")),
      }),
    ),
    now: v.optional(v.number()),
  },
  handler: seedPlacementResultsHandler,
});

/**
 * Internal query that checks whether a student has any placement results.
 * @returns {Promise<boolean>} True if at least one placement result exists for the student
 */
export const hasPlacementResults = internalQuery({
  args: {
    studentId: v.id("profiles"),
  },
  handler: hasPlacementResultsHandler,
});

/**
 * Internal query that retrieves all placement results for a student.
 * @returns {Promise<Array<Doc<"placement_results">>>} Array of placement result documents
 */
export const getStudentPlacementResults = internalQuery({
  args: {
    studentId: v.id("profiles"),
  },
  handler: getStudentPlacementResultsHandler,
});
