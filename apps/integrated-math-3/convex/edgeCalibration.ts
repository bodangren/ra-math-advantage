/**
 * Edge Calibration Convex Adapter
 *
 * Phase 3 persistence layer for the edge calibration system.
 * Reads existing calibration state, runs the pure review-queue builder
 * from srs-engine, and writes results back in batched operations.
 *
 * Key constraints (test-strategy.md §3):
 *   - N+1 guard: batch reads/writes with Promise.all
 *   - Graph is never auto-edited (NFR): only touches edge_calibration
 *     and calibration_review_queue tables
 */

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
  updatePosterior,
  buildReviewQueueItem,
  posteriorMean,
  type EdgeCalibration,
  type CalibrationObservation,
  type ReviewQueueBuildInput,
} from "@math-platform/srs-engine";

type MutationCtx = import("./_generated/server").MutationCtx;
type QueryCtx = import("./_generated/server").QueryCtx;

type EdgeInput = {
  edgeId: string;
  authoredWeight: number;
  authoredConfidence: string;
  observations: CalibrationObservation[];
  derived?: boolean;
};

/**
 * Refreshes the edge calibration state and rebuilds the review queue.
 * @param {MutationCtx} ctx - The mutation context
 * @param {{ courseKey: string; edges: EdgeInput[] }} args - The course key and edge observations
 * @returns {Promise<{ flagged: number }>} Object with the count of flagged edges
 */
export async function refreshCalibrationReviewQueueHandler(
  ctx: MutationCtx,
  args: { courseKey: string; edges: EdgeInput[] },
): Promise<{ flagged: number }> {
  if (args.edges.length === 0) {
    return { flagged: 0 };
  }

  const existingRows = await ctx.db
    .query("edge_calibration")
    .withIndex("by_edge")
    .collect();

  const existingByEdge = new Map<string, EdgeCalibration>();
  for (const row of existingRows) {
    existingByEdge.set(row.edgeId, {
      edgeId: row.edgeId,
      alpha: row.alpha,
      beta: row.beta,
      status: row.status,
      lastUpdated: row.lastUpdated,
    });
  }

  const now = Date.now();
  const queueItems = new Map<string, Record<string, unknown>>();
  const calibrationInserts: Promise<unknown>[] = [];

  for (const edge of args.edges) {
    let state: EdgeCalibration = existingByEdge.get(edge.edgeId) ?? {
      edgeId: edge.edgeId,
      alpha: 0,
      beta: 0,
      status: "untested",
      lastUpdated: now,
    };

    for (const obs of edge.observations) {
      state = updatePosterior(state, obs, { now });
    }

    const verdicts = new Map<string, { a?: boolean; b?: boolean }>();
    for (const obs of edge.observations) {
      const existing = verdicts.get(obs.studentId) ?? {};
      if (obs.a !== undefined) existing.a = obs.a;
      if (obs.b !== undefined) existing.b = obs.b;
      verdicts.set(obs.studentId, existing);
    }
    // Override classifyStatus: the spec defines "untested" as "no student
    // has attempted B without a verdict on A." A confounding breaker is
    // when b is defined but a is undefined (student attempted B without A).
    // If there IS a confounding breaker, the edge is untested. Otherwise,
    // if there are paired observations, classify by posterior.
    const hasConfoundingBreaker = [...verdicts.values()].some(
      (v) => v.b !== undefined && v.a === undefined,
    );
    const hasPairedObs = [...verdicts.values()].some(
      (v) => v.a !== undefined && v.b !== undefined,
    );
    if (hasConfoundingBreaker || !hasPairedObs) {
      state = { ...state, status: 'untested' };
    } else {
      const mean = posteriorMean(state.alpha, state.beta);
      const totalEvidence = state.alpha + state.beta;
      if (mean > 0.5 && totalEvidence > 2) {
        state = { ...state, status: 'confirmed' };
      } else if (mean < 0.5 && totalEvidence > 2) {
        state = { ...state, status: 'refuted' };
      } else {
        state = { ...state, status: 'untested' };
      }
    }

    const calDoc = {
      edgeId: state.edgeId,
      alpha: state.alpha,
      beta: state.beta,
      lastUpdated: now,
      status: state.status,
    };
    calibrationInserts.push(ctx.db.insert("edge_calibration" as never, calDoc as never));

    const input: ReviewQueueBuildInput = {
      edgeId: edge.edgeId,
      authoredWeight: edge.authoredWeight,
      authoredConfidence: edge.authoredConfidence,
      calibration: state,
      observations: edge.observations,
      derived: edge.derived,
    };

    const queueItem = buildReviewQueueItem(input, {
      now,
      weightThreshold: 0.5,
      confidenceThreshold: 1.5,
    });
    if (queueItem !== null) {
      queueItems.set(queueItem.edgeId, {
        edgeId: queueItem.edgeId,
        contingencyTable: queueItem.contingencyTable,
        authoredWeight: queueItem.authoredWeight,
        authoredConfidence: queueItem.authoredConfidence,
        calibratedWeight: queueItem.calibratedWeight,
        calibratedConfidence: queueItem.calibratedConfidence,
        divergence: queueItem.divergence,
        flaggedAt: queueItem.flaggedAt,
      });
    }
  }

  const queueInserts = [...queueItems.values()].map((doc) =>
    ctx.db.insert("calibration_review_queue" as never, doc as never),
  );

  await Promise.all([...calibrationInserts, ...queueInserts]);

  return { flagged: queueInserts.length };
}

export const refreshCalibrationReviewQueue = internalMutation({
  args: {
    courseKey: v.string(),
    edges: v.array(
      v.object({
        edgeId: v.string(),
        authoredWeight: v.number(),
        authoredConfidence: v.string(),
        observations: v.array(
          v.object({
            studentId: v.string(),
            a: v.boolean(),
            b: v.boolean(),
          }),
        ),
        derived: v.optional(v.boolean()),
      }),
    ),
  },
  handler: refreshCalibrationReviewQueueHandler,
});

/**
 * Lists the calibration review queue for a course.
 * @param {QueryCtx} ctx - The query context
 * @param {{ courseKey: string }} _args - The course key (unused, reserved for future filtering)
 * @returns {Promise<Doc<"calibration_review_queue">[]>} Array of calibration review queue entries
 */
export async function listCalibrationReviewQueueHandler(
  ctx: QueryCtx,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _args: { courseKey: string },
) {
  const rows = await ctx.db
    .query("calibration_review_queue")
    .withIndex("by_flagged_at")
    .collect();

  return rows;
}

export const listCalibrationReviewQueue = internalQuery({
  args: {
    courseKey: v.string(),
  },
  handler: listCalibrationReviewQueueHandler,
});
