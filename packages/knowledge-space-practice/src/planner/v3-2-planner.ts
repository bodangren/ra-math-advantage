import {
  DEFAULT_PLANNER_V3_2_WEIGHTS,
  plannerGraphReleaseInputV3_2Schema,
  plannerGraphReleaseOutputV3_2Schema,
  plannerPriorityScoreV3_2Schema,
  plannerTermsV3_2Schema,
  plannerWeightsV3_2Schema,
  type PlannerGraphReleaseInputV3_2,
  type PlannerGraphReleaseOutputV3_2,
  type PlannerPriorityScoreV3_2,
  type PlannerTermsV3_2,
  type PlannerWeightsV3_2,
} from './v3-2-contract';

const SPARSE_WEIGHTS: PlannerWeightsV3_2 = { a: 0, b: 0, c: 0, d: 0.3, e: 0.7 };

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export interface ScorePlannerCandidateInputV3_2 {
  readonly nodeId: string;
  readonly rankingMode: 'normalized-prerequisite' | 'utility-led';
  readonly terms: PlannerTermsV3_2;
  readonly weights?: PlannerWeightsV3_2;
}

export function scorePlannerCandidateV3_2(
  input: ScorePlannerCandidateInputV3_2,
): PlannerPriorityScoreV3_2 {
  const terms = plannerTermsV3_2Schema.parse(input.terms);
  const defaultWeights =
    input.rankingMode === 'utility-led'
      ? SPARSE_WEIGHTS
      : DEFAULT_PLANNER_V3_2_WEIGHTS;
  const weights = plannerWeightsV3_2Schema.parse(input.weights ?? defaultWeights);
  const contributions = {
    readiness: weights.a * terms.readiness,
    unlockValue: weights.b * terms.unlockValue,
    goalProximity: weights.c * terms.goalProximity,
    weaknessFit: weights.d * terms.weaknessFit,
    utility: weights.e * terms.utility,
  };
  const composite = Object.values(contributions).reduce((sum, value) => sum + value, 0);
  return plannerPriorityScoreV3_2Schema.parse({
    schemaVersion: 'planner.priority.v3.2',
    nodeId: input.nodeId,
    rankingMode: input.rankingMode,
    composite,
    terms,
    weights,
    contributions,
    tieBreak: {
      rule: 'priority_desc_node_id_asc.v1',
      priority: composite,
      nodeId: input.nodeId,
    },
  });
}

export function rankPlannerPriorityScoresV3_2(
  scores: readonly PlannerPriorityScoreV3_2[],
): PlannerPriorityScoreV3_2[] {
  const parsed = scores.map((score) => plannerPriorityScoreV3_2Schema.parse(score));
  const ids = new Set(parsed.map((score) => score.nodeId));
  if (ids.size !== parsed.length) throw new Error('Planner scores contain duplicate node IDs');
  return [...parsed].sort(
    (left, right) =>
      right.composite - left.composite || compareStrings(left.nodeId, right.nodeId),
  );
}

function reachableSkillCount(
  startId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  skillIds: ReadonlySet<string>,
): number {
  const seen = new Set<string>([startId]);
  const queue = [...(adjacency.get(startId) ?? [])];
  let count = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const nodeId = queue[index];
    if (!nodeId || seen.has(nodeId)) continue;
    seen.add(nodeId);
    if (skillIds.has(nodeId)) count += 1;
    queue.push(...(adjacency.get(nodeId) ?? []));
  }
  return count;
}

function shortestGoalDistance(
  startId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  goalIds: ReadonlySet<string>,
): number | null {
  if (goalIds.has(startId)) return 0;
  const seen = new Set<string>([startId]);
  let frontier = [...(adjacency.get(startId) ?? [])];
  for (let distance = 1; frontier.length > 0; distance += 1) {
    const next: string[] = [];
    for (const nodeId of frontier.sort(compareStrings)) {
      if (seen.has(nodeId)) continue;
      if (goalIds.has(nodeId)) return distance;
      seen.add(nodeId);
      next.push(...(adjacency.get(nodeId) ?? []));
    }
    frontier = next;
  }
  return null;
}

function resolveDiversityGroup(
  nodeId: string,
  containsParents: ReadonlyMap<string, readonly string[]>,
  kindByNode: ReadonlyMap<string, string>,
) {
  const candidates: Array<{
    nodeId: string;
    kind: 'instructional_unit' | 'content_group';
    distance: number;
  }> = [];
  const seen = new Set<string>([nodeId]);
  let frontier = [...(containsParents.get(nodeId) ?? [])];
  for (let distance = 1; frontier.length > 0; distance += 1) {
    const next: string[] = [];
    for (const ancestorId of frontier.sort(compareStrings)) {
      if (seen.has(ancestorId)) continue;
      seen.add(ancestorId);
      const kind = kindByNode.get(ancestorId);
      if (kind === 'instructional_unit' || kind === 'content_group') {
        candidates.push({ nodeId: ancestorId, kind, distance });
      }
      next.push(...(containsParents.get(ancestorId) ?? []));
    }
    frontier = next;
  }
  candidates.sort((left, right) => {
    const kindOrder = Number(left.kind !== 'instructional_unit') - Number(right.kind !== 'instructional_unit');
    return kindOrder || left.distance - right.distance || compareStrings(left.nodeId, right.nodeId);
  });
  const chosen = candidates[0];
  return chosen
    ? {
        groupId: chosen.nodeId,
        ancestorNodeId: chosen.nodeId,
        ancestorKind: chosen.kind,
        distance: chosen.distance,
      }
    : {
        groupId: nodeId,
        ancestorNodeId: null,
        ancestorKind: 'self_fallback' as const,
        distance: 0,
      };
}

export function precomputePlannerGraphV3_2(
  rawInput: PlannerGraphReleaseInputV3_2,
): PlannerGraphReleaseOutputV3_2 {
  const input = plannerGraphReleaseInputV3_2Schema.parse(rawInput);
  const nodes = [...input.nodes].sort((left, right) => compareStrings(left.nodeId, right.nodeId));
  const skillIds = new Set(nodes.filter((node) => node.kind === 'skill').map((node) => node.nodeId));
  const kindByNode = new Map(nodes.map((node) => [node.nodeId, node.kind]));
  const adjacency = new Map<string, string[]>();
  const containsParents = new Map<string, string[]>();
  const skillsWithInEdge = new Set<string>();
  for (const edge of [...input.edges].sort((left, right) => compareStrings(left.edgeId, right.edgeId))) {
    if (edge.type === 'prerequisite_for') {
      adjacency.set(edge.sourceId, [...(adjacency.get(edge.sourceId) ?? []), edge.targetId]);
      if (skillIds.has(edge.targetId)) skillsWithInEdge.add(edge.targetId);
    } else {
      containsParents.set(edge.targetId, [...(containsParents.get(edge.targetId) ?? []), edge.sourceId]);
    }
  }
  for (const neighbors of adjacency.values()) neighbors.sort(compareStrings);
  for (const parents of containsParents.values()) parents.sort(compareStrings);

  const goalIds = new Set(input.goalNodeIds);
  const rawReach = [...skillIds]
    .sort(compareStrings)
    .map((nodeId) => ({
      nodeId,
      downstreamReach: reachableSkillCount(nodeId, adjacency, skillIds),
      goalDistance: shortestGoalDistance(nodeId, adjacency, goalIds),
      diversityGroup: resolveDiversityGroup(nodeId, containsParents, kindByNode),
    }));
  const maxReach = Math.max(0, ...rawReach.map((entry) => entry.downstreamReach));
  const skillCount = skillIds.size;
  const ratio = skillCount === 0 ? 0 : skillsWithInEdge.size / skillCount;
  return plannerGraphReleaseOutputV3_2Schema.parse({
    schemaVersion: 'planner.graph-release-output.v3.2',
    graphReleaseId: input.graphReleaseId,
    graphContentHash: input.graphContentHash,
    precomputeInputHash: input.precomputeInputHash,
    domain: input.domain,
    goalNodeIds: [...input.goalNodeIds].sort(compareStrings),
    skillCount,
    skillsWithPrerequisiteInEdge: skillsWithInEdge.size,
    prerequisiteInEdgeRatio: ratio,
    sparseThreshold: 0.05,
    rankingMode: ratio < 0.05 ? 'utility-led' : 'normalized-prerequisite',
    maxReach,
    reachByNode: rawReach.map((entry) => ({
      ...entry,
      normalizedUnlockValue:
        maxReach === 0 ? 0 : Math.log1p(entry.downstreamReach) / Math.log1p(maxReach),
      goalProximity: entry.goalDistance === null ? 0 : 1 / (1 + entry.goalDistance),
    })),
  });
}
