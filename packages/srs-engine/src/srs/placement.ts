import { isPlacementEstimate, isPlacementSeededCard } from "./contract";
import type { PlacementConfidence, PlacementEstimate, PlacementSeededCard } from "./contract";
import { createCard, reviewCard } from "./scheduler";

export {
  PLACEMENT_POLICY_VERSION,
  PLACEMENT_DECISION_PROBE_COUNT,
  PLACEMENT_TIE_BREAK_PROBE_COUNT,
  DEFAULT_PLACEMENT_PROBE_BUDGET,
  DEFAULT_PLACEMENT_STAGNATION_LIMIT,
  PLACEMENT_PROBE_OUTCOMES,
  PLACEMENT_DECISIONS,
  PLACEMENT_FRONTIER_STATUSES,
  PLACEMENT_STOPPING_REASONS,
  placementProbeOutcomeSchema,
  placementDecisionDirectionSchema,
  placementFrontierStatusSchema,
  placementStoppingReasonSchema,
  placementConfidenceCapSchema,
  placementProbeInstrumentSnapshotSchema,
  placementProbeEvidenceSchema,
  placementProbeDecisionSchema,
  placementFrontierNodeStateSchema,
  placementFrontierStateSchema,
  resolvePlacementStoppingReason,
  isPlacementProbeEvidenceV31,
  isPlacementProbeDecisionV31,
  isPlacementFrontierStateV31,
} from "./placement-contract";
export type {
  PlacementProbeOutcome,
  PlacementDecisionDirection,
  PlacementFrontierStatus,
  PlacementStoppingReason,
  PlacementConfidenceCap,
  PlacementProbeInstrumentSnapshot,
  PlacementProbeEvidenceV31,
  PlacementProbeDecisionV31,
  PlacementFrontierNodeState,
  PlacementFrontierStateV31,
} from "./placement-contract";

export { isPlacementEstimate, isPlacementSeededCard };

export type {
  PlacementConfidence,
  PlacementEvidenceType,
  PlacementEstimate,
  PlacementCardProvenance,
  PlacementSeededCard,
} from "./contract";

/** Confidence horizons in days from kst-srs.v3.2 §11.4. */
export const PLACEMENT_STABILITY_HORIZONS = Object.freeze({
  low: 5,
  medium: 15,
  high: 30,
});

/** Minimal graph edge consumed by placement synthesis without importing KST packages. */
export interface PlacementGraphEdge {
  sourceId: string;
  targetId: string;
  weight: number;
}

/** Domain/app adapter supplies graph topology to the SRS-owned placement engine. */
export interface PlacementGraphAdapter {
  prerequisiteEdges: readonly PlacementGraphEdge[];
}

export interface PlacementSeedConfig {
  studentId: string;
  placedAt: string;
  hardGateThreshold: number;
  masteryEnter?: number;
  confidenceHorizons?: Partial<typeof PLACEMENT_STABILITY_HORIZONS>;
}

function downgradeConfidence(confidence: PlacementConfidence): PlacementConfidence {
  if (confidence === "high") return "medium";
  return "low";
}

function validateGraph(graph: PlacementGraphAdapter, hardGateThreshold: number): void {
  if (!Number.isFinite(hardGateThreshold) || hardGateThreshold < 0) {
    throw new Error("hardGateThreshold must be a finite non-negative number");
  }
  for (const edge of graph.prerequisiteEdges) {
    if (!edge.sourceId || !edge.targetId || !Number.isFinite(edge.weight) || edge.weight < 0) {
      throw new Error("Placement graph contains an invalid prerequisite edge");
    }
  }
}

/**
 * Apply the v3 hard-edge-only evidence closure to direct placement estimates.
 * Direct evidence always wins; inferred evidence takes the shortest available path.
 */
export function expandPlacementEvidence(
  estimates: readonly PlacementEstimate[],
  graph: PlacementGraphAdapter,
  hardGateThreshold: number,
): PlacementEstimate[] {
  validateGraph(graph, hardGateThreshold);

  const directByNode = new Map<string, PlacementEstimate>();
  for (const estimate of estimates) {
    if (!isPlacementEstimate(estimate)) {
      throw new Error("Invalid placement estimate");
    }
    if (estimate.evidenceType !== "direct") {
      throw new Error("Placement closure input must contain direct evidence only");
    }
    directByNode.set(estimate.nodeId, estimate);
  }

  const directNodeIds = [...directByNode.keys()].sort((left, right) => left.localeCompare(right));
  const nodeOrder: string[] = [...directNodeIds];
  const resolved = new Map(directByNode);
  const queue = directNodeIds.flatMap((nodeId) => {
    const estimate = directByNode.get(nodeId);
    return estimate && estimate.masteryEstimate > 0 ? [estimate] : [];
  });
  const hardParents = new Map<string, PlacementGraphEdge[]>();
  for (const edge of graph.prerequisiteEdges) {
    if (edge.weight < hardGateThreshold) continue;
    const parents = hardParents.get(edge.targetId) ?? [];
    parents.push(edge);
    hardParents.set(edge.targetId, parents);
  }
  for (const parents of hardParents.values()) {
    parents.sort(
      (left, right) =>
        left.sourceId.localeCompare(right.sourceId) ||
        left.targetId.localeCompare(right.targetId) ||
        left.weight - right.weight,
    );
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const child = queue[cursor];
    if (!child) continue;
    for (const edge of hardParents.get(child.nodeId) ?? []) {
      if (directByNode.has(edge.sourceId)) continue;
      const candidate: PlacementEstimate = {
        nodeId: edge.sourceId,
        masteryEstimate: child.masteryEstimate,
        confidence: downgradeConfidence(child.confidence),
        evidenceType: "inferred",
        inferenceDepth: child.inferenceDepth + 1,
      };
      const existing = resolved.get(candidate.nodeId);
      if (
        existing &&
        (existing.inferenceDepth < candidate.inferenceDepth ||
          (existing.inferenceDepth === candidate.inferenceDepth &&
            existing.masteryEstimate >= candidate.masteryEstimate))
      )
        continue;
      if (!existing) nodeOrder.push(candidate.nodeId);
      resolved.set(candidate.nodeId, candidate);
      queue.push(candidate);
    }
  }

  return nodeOrder.flatMap((nodeId) => {
    const estimate = resolved.get(nodeId);
    return estimate ? [estimate] : [];
  });
}

function validateSeedConfig(config: PlacementSeedConfig): void {
  if (!config.studentId.trim()) throw new Error("studentId is required");
  if (!Number.isFinite(Date.parse(config.placedAt))) {
    throw new Error("placedAt must be a valid ISO timestamp");
  }
  for (const [confidence, horizon] of Object.entries(config.confidenceHorizons ?? {})) {
    if (!Number.isFinite(horizon) || (horizon ?? 0) <= 0) {
      throw new Error(`confidence horizon ${confidence} must be positive and finite`);
    }
  }
}

/** Synthesize the canonical v3 placement review cards, including hard-edge closure. */
export function synthesizePlacementCards(
  estimates: readonly PlacementEstimate[],
  graph: PlacementGraphAdapter,
  config: PlacementSeedConfig,
): PlacementSeededCard[] {
  validateSeedConfig(config);
  const horizons = { ...PLACEMENT_STABILITY_HORIZONS, ...config.confidenceHorizons };
  const expanded = expandPlacementEvidence(estimates, graph, config.hardGateThreshold);
  const firstGood = reviewCard(
    createCard({
      studentId: config.studentId,
      objectiveId: "__placement-difficulty__",
      now: config.placedAt,
    }),
    "Good",
    config.placedAt,
  );
  const placedAtMs = Date.parse(config.placedAt);

  return expanded
    .filter((estimate) => estimate.masteryEstimate > 0)
    .map((estimate) => {
      const stability = horizons[estimate.confidence] * estimate.masteryEstimate;
      const dueDate = new Date(placedAtMs + stability * 86_400_000).toISOString();
      return {
        cardId: `placement:${config.studentId}:${estimate.nodeId}`,
        studentId: config.studentId,
        objectiveId: estimate.nodeId,
        variantKey: estimate.nodeId,
        stability,
        difficulty: firstGood.difficulty,
        state: "review",
        dueDate,
        elapsedDays: 0,
        scheduledDays: stability,
        reps: 1,
        lapses: 0,
        lastReview: config.placedAt,
        createdAt: config.placedAt,
        updatedAt: config.placedAt,
        placement: {
          source: "placement",
          evidenceType: estimate.evidenceType,
          confidence: estimate.confidence,
          inferenceDepth: estimate.inferenceDepth,
          placedAt: config.placedAt,
        },
      } satisfies PlacementSeededCard;
    });
}
