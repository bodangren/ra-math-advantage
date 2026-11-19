/**
 * Student Knowledge State — Phase 4 KST production wiring.
 *
 * Convex internalQuery that composes:
 *   SRS cards + review logs → DefaultSrsToKstBridge.convert()
 *   → getKnowledgeState → getOuterFringe → projectStudentVisualization
 *
 * All DB reads are batched via Promise.all (no N+1).
 * Authorization is at the server-component level (requireStudentSessionClaims);
 * this is an internal query called with admin credentials.
 *
 * Return value is a serializable StudentVisualizationV1 payload (no Map/Dates).
 */

import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import {
  loadFullCurriculumGraph,
  includeHistoricalEvidenceNodes,
  projectApprovedReadinessGraph,
} from "../../lib/curriculum/skill-graph-loader";
import {
  DefaultSrsToKstBridge,
  getOuterFringe,
  type SrsCardState,
} from "@math-platform/knowledge-space-core";
import {
  projectStudentVisualization,
  type StudentVisualizationV1,
} from "@math-platform/knowledge-space-practice";
import { getKnowledgeProficiencyInputs } from "../objectiveProficiency";

/**
 * Converts a Convex SRS card document into the bridge's SrsCardState shape.
 */
function toSrsCardState(card: {
  _id: Id<"srs_cards">;
  objectiveId: string;
  stability: number;
  state: "new" | "learning" | "review" | "relearning";
  lastReview?: string;
}): SrsCardState {
  return {
    cardId: String(card._id),
    objectiveId: card.objectiveId,
    stability: card.stability,
    state: card.state,
    lastReviewedAt: card.lastReview ? new Date(card.lastReview).getTime() : undefined,
  };
}

/**
 * Computes the KST-derived student knowledge state.
 *
 * Batches srs_cards + srs_review_log reads, runs the full SRS→KST pipeline,
 * and returns a validated StudentVisualizationV1 payload.
 *
 * Exported as a named function for mock-ctx testing.
 *
 * @param ctx - Convex query context
 * @param args - { studentId: Id<"profiles"> }
 * @returns StudentVisualizationV1 — validated, serializable
 */
export async function getStudentKnowledgeStateHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles"> },
): Promise<StudentVisualizationV1> {
  // 1. Load the full IM3 knowledge-space graph from rollout artifacts
  const graph = loadFullCurriculumGraph();
  const readinessGraph = projectApprovedReadinessGraph(graph);

  // 2. Batch-read SRS data (no N+1)
  const [srsCards, srsReviewLogs] = await Promise.all([
    ctx.db
      .query("srs_cards")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect(),
    ctx.db
      .query("srs_review_log")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect(),
  ]);

  // 3. Build a map of most recent review timestamp per card from review logs
  const lastReviewByCardId = new Map<string, number>();
  for (const log of srsReviewLogs) {
    const cardId = String(log.cardId);
    const existing = lastReviewByCardId.get(cardId);
    if (existing === undefined || log.reviewedAt > existing) {
      lastReviewByCardId.set(cardId, log.reviewedAt);
    }
  }

  // 4. (cont'd) Convert DB rows to bridge input shapes, supplementing lastReviewedAt
  //    from review logs when the card record lacks it.
  const cardStates: SrsCardState[] = srsCards.map((card) => {
    const state = toSrsCardState(card);
    if (state.lastReviewedAt == null) {
      const logTimestamp = lastReviewByCardId.get(String(card._id));
      if (logTimestamp != null) {
        state.lastReviewedAt = logTimestamp;
      }
    }
    return state;
  });
  const now = Date.now();
  const proficiency = await getKnowledgeProficiencyInputs(
    ctx,
    args.studentId,
    srsCards,
    srsReviewLogs,
    now,
  );

  // 5. Run the SRS→KST bridge → engine → fringe pipeline
  const bridge = new DefaultSrsToKstBridge();
  const previousState = bridge.convert({
    cards: cardStates,
    proficiencies: proficiency.assessed,
    graph,
    now,
  });
  const state = bridge.convert({
    cards: cardStates,
    proficiencies: proficiency.current,
    previousState,
    graph,
    now,
  });

  const fringe = getOuterFringe(state, readinessGraph);

  // 5. Convert KnowledgeStateEntry map → visualization learnerState record
  const learnerState: Record<
    string,
    "mastered" | "ready" | "nearly_ready" | "blocked" | "review_due"
  > = {};

  for (const [nodeId, entry] of state) {
    if (entry.state === "mastered") {
      learnerState[nodeId] = "mastered";
    } else if (entry.state === "decaying") {
      learnerState[nodeId] = "review_due";
    }
  }

  // Mark fringe-ready nodes that are not already covered
  for (const f of fringe) {
    if (!learnerState[f.nodeId]) {
      if (f.readinessState === "ready") {
        learnerState[f.nodeId] = "ready";
      } else if (f.readinessState === "nearly_ready") {
        learnerState[f.nodeId] = "nearly_ready";
      }
    }
  }

  // 6. Project to visualization payload
  const presentationGraph = includeHistoricalEvidenceNodes(
    readinessGraph,
    graph,
    new Set(Object.keys(learnerState)),
  );
  return projectStudentVisualization(
    presentationGraph.nodes,
    presentationGraph.edges,
    learnerState,
  );
}

/**
 * Convex internalQuery exposing KST-derived student knowledge state.
 *
 * Called from the server component at `app/student/knowledge-state/page.tsx`
 * via `fetchInternalQuery(internal.student.getStudentKnowledgeState, ...)`.
 */
export const getStudentKnowledgeState = internalQuery({
  args: { studentId: v.id("profiles") },
  handler: getStudentKnowledgeStateHandler,
});
