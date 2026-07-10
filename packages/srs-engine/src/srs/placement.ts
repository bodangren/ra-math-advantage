import {
  isPlacementEstimate,
  isPlacementSeededCard,
} from './contract';
import type {
  PlacementConfidence,
  PlacementEstimate,
  PlacementSeededCard,
} from './contract';
import { createCard, reviewCard } from './scheduler';

export {
  isPlacementEstimate,
  isPlacementSeededCard,
};

export type {
  PlacementConfidence,
  PlacementEvidenceType,
  PlacementEstimate,
  PlacementCardProvenance,
  PlacementSeededCard,
} from './contract';

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
  if (confidence === 'high') return 'medium';
  return 'low';
}

function validateGraph(
  graph: PlacementGraphAdapter,
  hardGateThreshold: number,
): void {
  if (!Number.isFinite(hardGateThreshold) || hardGateThreshold < 0) {
    throw new Error('hardGateThreshold must be a finite non-negative number');
  }
  for (const edge of graph.prerequisiteEdges) {
    if (!edge.sourceId || !edge.targetId || !Number.isFinite(edge.weight) || edge.weight < 0) {
      throw new Error('Placement graph contains an invalid prerequisite edge');
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
  const nodeOrder: string[] = [];
  for (const estimate of estimates) {
    if (!isPlacementEstimate(estimate)) {
      throw new Error('Invalid placement estimate');
    }
    if (estimate.evidenceType !== 'direct') {
      throw new Error('Placement closure input must contain direct evidence only');
    }
    if (!directByNode.has(estimate.nodeId)) nodeOrder.push(estimate.nodeId);
    directByNode.set(estimate.nodeId, estimate);
  }

  const resolved = new Map(directByNode);
  const queue = [...directByNode.values()].filter((estimate) => estimate.masteryEstimate > 0);
  const hardParents = new Map<string, PlacementGraphEdge[]>();
  for (const edge of graph.prerequisiteEdges) {
    if (edge.weight < hardGateThreshold) continue;
    const parents = hardParents.get(edge.targetId) ?? [];
    parents.push(edge);
    hardParents.set(edge.targetId, parents);
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
        evidenceType: 'inferred',
        inferenceDepth: child.inferenceDepth + 1,
      };
      const existing = resolved.get(candidate.nodeId);
      if (existing && existing.inferenceDepth <= candidate.inferenceDepth) continue;
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
  if (!config.studentId.trim()) throw new Error('studentId is required');
  if (!Number.isFinite(Date.parse(config.placedAt))) {
    throw new Error('placedAt must be a valid ISO timestamp');
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
  const firstGood = reviewCard(createCard({
    studentId: config.studentId,
    objectiveId: '__placement-difficulty__',
    now: config.placedAt,
  }), 'Good', config.placedAt);
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
        state: 'review',
        dueDate,
        elapsedDays: 0,
        scheduledDays: stability,
        reps: 1,
        lapses: 0,
        lastReview: config.placedAt,
        createdAt: config.placedAt,
        updatedAt: config.placedAt,
        placement: {
          source: 'placement',
          evidenceType: estimate.evidenceType,
          confidence: estimate.confidence,
          inferenceDepth: estimate.inferenceDepth,
          placedAt: config.placedAt,
        },
      } satisfies PlacementSeededCard;
    });
}
