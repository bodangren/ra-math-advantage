import { z } from "zod";

import type { PlacementEstimate } from "./contract";
import {
  DEFAULT_PLACEMENT_PROBE_BUDGET,
  DEFAULT_PLACEMENT_STAGNATION_LIMIT,
  PLACEMENT_POLICY_VERSION,
  placementFrontierStateSchema,
  placementProbeDecisionSchema,
  placementProbeEvidenceSchema,
  placementProbeInstrumentSnapshotSchema,
  placementProbeOutcomeSchema,
  resolvePlacementStoppingReason,
} from "./placement-contract";
import type {
  PlacementProbeDecisionV31,
  PlacementProbeInstrumentSnapshot,
  PlacementProbeOutcome,
  PlacementFrontierStateV31,
  PlacementStoppingReason,
} from "./placement-contract";
import { guessFloorRefSchema } from "./proficiency-evidence-contract";
import type { GuessFloorRef } from "./proficiency-evidence-contract";
import { expandPlacementEvidence } from "./placement";

const MAX_REPRESENTATIVES_PER_CONTENT_GROUP = 3;

const adaptivePlacementNodeSchema = z.strictObject({
  nodeId: z.string().trim().min(1),
  contentGroup: z.string().trim().min(1),
  unlockValue: z.number().finite(),
});

const adaptivePlacementEdgeSchema = z.strictObject({
  sourceId: z.string().trim().min(1),
  targetId: z.string().trim().min(1),
  weight: z.number().finite().min(0).max(1),
});

const rawProbeResultSchema = z.strictObject({
  probeId: z.string().trim().min(1),
  outcome: placementProbeOutcomeSchema,
  rawPerformance: z.number().finite().min(0).max(1),
});

export interface AdaptivePlacementNode {
  nodeId: string;
  contentGroup: string;
  unlockValue: number;
}

export interface AdaptivePlacementEdge {
  sourceId: string;
  targetId: string;
  weight: number;
}

export interface AdaptivePlacementProbeRequest {
  nodeId: string;
  probeIndex: 1 | 2 | 3;
}

export interface AdaptivePlacementProbeResult {
  probeId: string;
  outcome: PlacementProbeOutcome;
  rawPerformance: number;
}

export interface AdaptivePlacementConfig {
  entryPointNodeId: string;
  nodes: readonly AdaptivePlacementNode[];
  prerequisiteEdges: readonly AdaptivePlacementEdge[];
  hardGateThreshold: number;
  guessFloor: GuessFloorRef;
  instrument: PlacementProbeInstrumentSnapshot;
  probe(request: AdaptivePlacementProbeRequest): Promise<AdaptivePlacementProbeResult>;
  probeBudget?: number;
  stagnationLimit?: number;
}

export interface AdaptivePlacementResult {
  policyVersion: typeof PLACEMENT_POLICY_VERSION;
  decisions: PlacementProbeDecisionV31[];
  estimates: PlacementEstimate[];
  probesUsed: number;
  stoppingReason: PlacementStoppingReason;
  /**
   * Auditable terminal snapshot. It exposes pending probe counts at bounded
   * stops, but intentionally does not promise durable cross-process resume.
   */
  frontierState: PlacementFrontierStateV31;
}

type ValidatedConfig = Omit<AdaptivePlacementConfig, "nodes" | "prerequisiteEdges"> & {
  nodes: AdaptivePlacementNode[];
  prerequisiteEdges: AdaptivePlacementEdge[];
  probeBudget: number;
  stagnationLimit: number;
};

function compareNodeIds(left: string, right: string): number {
  return left.localeCompare(right);
}

function compareRepresentativeNodes(
  left: AdaptivePlacementNode,
  right: AdaptivePlacementNode,
): number {
  return right.unlockValue - left.unlockValue || compareNodeIds(left.nodeId, right.nodeId);
}

function assertPositiveInteger(value: unknown, field: string): asserts value is number {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
}

function assertDag(
  nodeIds: ReadonlySet<string>,
  prerequisiteEdges: readonly AdaptivePlacementEdge[],
): void {
  const indegree = new Map([...nodeIds].map((nodeId) => [nodeId, 0]));
  const children = new Map<string, string[]>();

  for (const edge of prerequisiteEdges) {
    indegree.set(edge.targetId, (indegree.get(edge.targetId) ?? 0) + 1);
    children.set(edge.sourceId, [...(children.get(edge.sourceId) ?? []), edge.targetId]);
  }

  const queue = [...indegree]
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId)
    .sort(compareNodeIds);
  let visited = 0;

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId) continue;
    visited += 1;
    for (const childId of (children.get(nodeId) ?? []).sort(compareNodeIds)) {
      const nextDegree = (indegree.get(childId) ?? 0) - 1;
      indegree.set(childId, nextDegree);
      if (nextDegree === 0) {
        queue.push(childId);
        queue.sort(compareNodeIds);
      }
    }
  }

  if (visited !== nodeIds.size) {
    throw new Error("Adaptive placement prerequisite graph must be a DAG");
  }
}

function validateConfig(config: AdaptivePlacementConfig): ValidatedConfig {
  if (!config || typeof config !== "object") {
    throw new Error("Adaptive placement config is required");
  }
  if (typeof config.entryPointNodeId !== "string" || !config.entryPointNodeId.trim()) {
    throw new Error("entryPointNodeId is required");
  }
  if (typeof config.probe !== "function") {
    throw new Error("probe must be a function");
  }
  if (
    !Number.isFinite(config.hardGateThreshold) ||
    config.hardGateThreshold < 0 ||
    config.hardGateThreshold > 1
  ) {
    throw new Error("hardGateThreshold must be a finite number in [0, 1]");
  }

  const nodes = z.array(adaptivePlacementNodeSchema).parse(config.nodes);
  const prerequisiteEdges = z.array(adaptivePlacementEdgeSchema).parse(config.prerequisiteEdges);
  const nodeById = new Map<string, AdaptivePlacementNode>();
  for (const node of nodes) {
    if (nodeById.has(node.nodeId)) {
      throw new Error(`Adaptive placement nodeId must be unique: ${node.nodeId}`);
    }
    nodeById.set(node.nodeId, node);
  }
  if (!nodeById.has(config.entryPointNodeId)) {
    throw new Error("entryPointNodeId must reference a declared node");
  }

  const edgeKeys = new Set<string>();
  for (const edge of prerequisiteEdges) {
    if (!nodeById.has(edge.sourceId) || !nodeById.has(edge.targetId)) {
      throw new Error("Adaptive placement edge must reference declared nodes");
    }
    if (edge.sourceId === edge.targetId) {
      throw new Error("Adaptive placement graph cannot contain self edges");
    }
    const key = `${edge.sourceId}\u0000${edge.targetId}`;
    if (edgeKeys.has(key)) {
      throw new Error(
        `Adaptive placement edge must be unique: ${edge.sourceId} -> ${edge.targetId}`,
      );
    }
    edgeKeys.add(key);
  }

  const guessFloor = guessFloorRefSchema.parse(config.guessFloor);
  const instrument = placementProbeInstrumentSnapshotSchema.parse(config.instrument);
  if (instrument.guessFloorPolicyVersion !== guessFloor.policyVersion) {
    throw new Error("instrument guess-floor provenance must match guessFloor policyVersion");
  }

  const probeBudget = config.probeBudget ?? DEFAULT_PLACEMENT_PROBE_BUDGET;
  const stagnationLimit = config.stagnationLimit ?? DEFAULT_PLACEMENT_STAGNATION_LIMIT;
  assertPositiveInteger(probeBudget, "probeBudget");
  assertPositiveInteger(stagnationLimit, "stagnationLimit");

  // The domain contract declares the full prerequisite graph as a DAG. Soft
  // edges do not drive placement, but a soft cycle is still invalid topology.
  assertDag(new Set(nodeById.keys()), prerequisiteEdges);

  return {
    ...config,
    entryPointNodeId: config.entryPointNodeId,
    nodes: [...nodeById.values()].sort((left, right) => compareNodeIds(left.nodeId, right.nodeId)),
    prerequisiteEdges: [...prerequisiteEdges].sort(
      (left, right) =>
        compareNodeIds(left.sourceId, right.sourceId) ||
        compareNodeIds(left.targetId, right.targetId) ||
        left.weight - right.weight,
    ),
    guessFloor,
    instrument,
    probeBudget,
    stagnationLimit,
  };
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  if (leftSet.size !== rightSet.size) return false;
  return [...rightSet].every((value) => leftSet.has(value));
}

/** Count consecutive observations for which the frontier set did not change. */
export function nextPlacementStagnationCount(
  previousFrontierNodeIds: readonly string[],
  nextFrontierNodeIds: readonly string[],
  currentCount: number,
): number {
  if (!Number.isInteger(currentCount) || currentCount < 0) {
    throw new Error("currentCount must be a non-negative integer");
  }
  if (
    previousFrontierNodeIds.some((nodeId) => typeof nodeId !== "string" || !nodeId) ||
    nextFrontierNodeIds.some((nodeId) => typeof nodeId !== "string" || !nodeId)
  ) {
    throw new Error("frontier node IDs must be non-empty strings");
  }
  return sameStringSet(previousFrontierNodeIds, nextFrontierNodeIds) ? currentCount + 1 : 0;
}

function outcomeWeight(outcome: PlacementProbeOutcome): number {
  if (outcome === "pass") return 1;
  if (outcome === "partial") return 0.5;
  return 0;
}

function resolveDecision(outcomes: readonly PlacementProbeOutcome[]): "advance" | "retreat" {
  return outcomes.reduce((total, outcome) => total + outcomeWeight(outcome), 0) >
    outcomes.length / 2
    ? "advance"
    : "retreat";
}

/**
 * Execute the normative v3.1 adaptive-frontier placement walk.
 *
 * Only hard prerequisite edges participate in traversal or evidence closure;
 * ordering is canonicalized so adapter storage order cannot change the result.
 */
export async function runAdaptivePlacement(
  input: AdaptivePlacementConfig,
): Promise<AdaptivePlacementResult> {
  const config = validateConfig(input);
  const nodeById = new Map(config.nodes.map((node) => [node.nodeId, node]));
  const hardEdges = config.prerequisiteEdges.filter(
    (edge) => edge.weight >= config.hardGateThreshold,
  );
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  for (const edge of hardEdges) {
    parents.set(edge.targetId, [...(parents.get(edge.targetId) ?? []), edge.sourceId]);
    children.set(edge.sourceId, [...(children.get(edge.sourceId) ?? []), edge.targetId]);
  }
  for (const adjacency of [...parents.values(), ...children.values()]) {
    adjacency.sort(compareNodeIds);
  }

  const decisions: PlacementProbeDecisionV31[] = [];
  const directEstimates: PlacementEstimate[] = [];
  const resolved = new Set<string>();
  const scheduled = new Set<string>([config.entryPointNodeId]);
  const excludedRepresentatives = new Set<string>();
  const representativesByBucket = new Map<string, Set<string>>();
  const depthByNode = new Map<string, number>([[config.entryPointNodeId, 0]]);
  const probeCountByNode = new Map<string, number>();
  // The domain-selected entry point is the explicit eligibility exception: a
  // mid-graph start may have unresolved hard parents by design.
  let frontier = [config.entryPointNodeId];
  let probesUsed = 0;
  let unchangedProbeCount = 0;
  let forcedStoppingReason: PlacementStoppingReason | null = null;

  function compareFrontierNodeIds(leftId: string, rightId: string): number {
    const leftDepth = depthByNode.get(leftId) ?? 0;
    const rightDepth = depthByNode.get(rightId) ?? 0;
    const left = nodeById.get(leftId);
    const right = nodeById.get(rightId);
    if (!left || !right) return compareNodeIds(leftId, rightId);
    return (
      Math.abs(leftDepth) - Math.abs(rightDepth) ||
      leftDepth - rightDepth ||
      left.contentGroup.localeCompare(right.contentGroup) ||
      compareRepresentativeNodes(left, right)
    );
  }

  function addCandidates(
    candidateIds: readonly string[],
    requireResolvedParents: boolean,
    candidateDepth: number,
  ): void {
    const eligible = candidateIds.filter((nodeId) => {
      if (resolved.has(nodeId) || scheduled.has(nodeId) || excludedRepresentatives.has(nodeId))
        return false;
      return (
        !requireResolvedParents ||
        (parents.get(nodeId) ?? []).every((parentId) => resolved.has(parentId))
      );
    });

    const candidatesByBucket = new Map<string, string[]>();
    for (const nodeId of eligible) {
      const node = nodeById.get(nodeId);
      if (!node) continue;
      depthByNode.set(nodeId, candidateDepth);
      const bucket = `${candidateDepth}\u0000${node.contentGroup}`;
      candidatesByBucket.set(bucket, [...(candidatesByBucket.get(bucket) ?? []), nodeId]);
    }

    for (const [bucket, newNodeIds] of [...candidatesByBucket].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const selected = representativesByBucket.get(bucket) ?? new Set<string>();
      const locked = [...selected].filter((nodeId) => resolved.has(nodeId));
      const pending = [...selected].filter((nodeId) => !resolved.has(nodeId));
      const slots = Math.max(0, MAX_REPRESENTATIVES_PER_CONTENT_GROUP - locked.length);
      const chosen = [...new Set([...pending, ...newNodeIds])]
        .map((nodeId) => nodeById.get(nodeId))
        .filter((node): node is AdaptivePlacementNode => node !== undefined)
        .sort(compareRepresentativeNodes)
        .slice(0, slots)
        .map((node) => node.nodeId);
      const chosenSet = new Set(chosen);

      for (const nodeId of pending) {
        if (chosenSet.has(nodeId)) continue;
        frontier = frontier.filter((frontierId) => frontierId !== nodeId);
        scheduled.delete(nodeId);
        excludedRepresentatives.add(nodeId);
      }
      for (const nodeId of newNodeIds) {
        if (!chosenSet.has(nodeId)) {
          excludedRepresentatives.add(nodeId);
          continue;
        }
        if (!scheduled.has(nodeId)) {
          scheduled.add(nodeId);
          frontier.push(nodeId);
        }
      }
      representativesByBucket.set(bucket, new Set([...locked, ...chosen]));
    }
    frontier.sort(compareFrontierNodeIds);
  }

  while (frontier.length > 0 && !forcedStoppingReason) {
    if (probesUsed >= config.probeBudget) {
      forcedStoppingReason = "probe_budget_exhausted";
      break;
    }

    const nodeId = frontier[0];
    if (!nodeId) break;
    const probeEvidence = [];
    let openingPairUnanimous = false;

    for (let index = 1; index <= 3; index += 1) {
      if (probesUsed >= config.probeBudget) {
        forcedStoppingReason = "probe_budget_exhausted";
        break;
      }

      const previousFrontier = [...frontier];
      const raw = rawProbeResultSchema.parse(
        await config.probe({
          nodeId,
          probeIndex: index as 1 | 2 | 3,
        }),
      );
      const guessCorrectedPerformance = Math.max(
        0,
        (raw.rawPerformance - config.guessFloor.value) / (1 - config.guessFloor.value),
      );
      const evidence = placementProbeEvidenceSchema.parse({
        policyVersion: PLACEMENT_POLICY_VERSION,
        probeId: raw.probeId,
        nodeId,
        probeIndex: index,
        outcome: raw.outcome,
        rawPerformance: raw.rawPerformance,
        guessCorrectedPerformance,
        guessFloor: config.guessFloor,
        instrument: config.instrument,
      });
      probeEvidence.push(evidence);
      probesUsed += 1;
      probeCountByNode.set(nodeId, probeEvidence.length);

      if (index === 2) {
        openingPairUnanimous =
          probeEvidence[0]?.outcome === probeEvidence[1]?.outcome &&
          (probeEvidence[0]?.outcome === "pass" || probeEvidence[0]?.outcome === "fail");
      }
      const decisionComplete = index === 3 || (index === 2 && openingPairUnanimous);
      if (decisionComplete) {
        const decision = placementProbeDecisionSchema.parse({
          policyVersion: PLACEMENT_POLICY_VERSION,
          nodeId,
          probes: probeEvidence,
          decision: resolveDecision(probeEvidence.map((probe) => probe.outcome)),
          confidenceCap: config.instrument.highFidelity ? "high" : "medium",
        });
        decisions.push(decision);

        const confidence = config.instrument.highFidelity ? "high" : "medium";
        directEstimates.push({
          nodeId,
          masteryEstimate:
            probeEvidence.reduce((total, probe) => total + probe.guessCorrectedPerformance, 0) /
            probeEvidence.length,
          confidence,
          evidenceType: "direct",
          inferenceDepth: 0,
        });
        resolved.add(nodeId);
        frontier = frontier.filter((candidateId) => candidateId !== nodeId);

        if (decision.decision === "advance") {
          addCandidates(children.get(nodeId) ?? [], true, (depthByNode.get(nodeId) ?? 0) + 1);
        } else {
          // A retreat deliberately walks toward unresolved prerequisites; it
          // cannot require those parents' own ancestors to already be resolved.
          addCandidates(parents.get(nodeId) ?? [], false, (depthByNode.get(nodeId) ?? 0) - 1);
        }
      }

      unchangedProbeCount = nextPlacementStagnationCount(
        previousFrontier,
        frontier,
        unchangedProbeCount,
      );
      if (probesUsed >= config.probeBudget) {
        forcedStoppingReason = "probe_budget_exhausted";
        break;
      }
      if (unchangedProbeCount >= config.stagnationLimit) {
        forcedStoppingReason = "frontier_stagnated";
        break;
      }
      if (decisionComplete) break;
    }
  }

  const frontierNodes = frontier.map((nodeId) => ({
    nodeId,
    contentGroup: nodeById.get(nodeId)?.contentGroup ?? null,
    status: resolved.has(nodeId) ? ("mastered" as const) : ("eligible" as const),
    probeCount: probeCountByNode.get(nodeId) ?? 0,
  }));
  const stoppingReason =
    forcedStoppingReason ??
    resolvePlacementStoppingReason({
      frontier: frontierNodes,
      probesUsed,
      probeBudget: config.probeBudget,
      unchangedProbeCount,
      stagnationLimit: config.stagnationLimit,
    }) ??
    "frontier_resolved";
  const frontierState = placementFrontierStateSchema.parse({
    policyVersion: PLACEMENT_POLICY_VERSION,
    entryPointNodeId: config.entryPointNodeId,
    frontier: frontierNodes,
    probesUsed,
    probeBudget: config.probeBudget,
    unchangedProbeCount,
    stagnationLimit: config.stagnationLimit,
    stoppingReason,
  });

  const decisionByNode = new Map(decisions.map((decision) => [decision.nodeId, decision.decision]));
  const closureInputs = directEstimates.map((estimate) =>
    decisionByNode.get(estimate.nodeId) === "advance"
      ? estimate
      : { ...estimate, masteryEstimate: 0 },
  );
  const inferredEstimates = expandPlacementEvidence(
    closureInputs,
    { prerequisiteEdges: hardEdges },
    config.hardGateThreshold,
  ).filter((estimate) => estimate.evidenceType === "inferred");

  return {
    policyVersion: PLACEMENT_POLICY_VERSION,
    decisions,
    estimates: [...directEstimates, ...inferredEstimates],
    probesUsed,
    stoppingReason,
    frontierState,
  };
}
