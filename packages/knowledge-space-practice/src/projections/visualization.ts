import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import type {
  VisualNodeV1,
  VisualEdgeV1,
  StudentVisualizationV1,
  ParentVisualizationV1,
  TeacherVisualizationV1,
  TeacherHeatmapCell,
  PrerequisiteGap,
  InterventionGroup,
} from './types';

// ---------------------------------------------------------------------------
// Node state helpers
// ---------------------------------------------------------------------------

function computeNodeState(
  nodeId: string,
  learnerState: Record<string, 'mastered' | 'ready' | 'blocked' | 'review_due'>,
  nodeMap: Map<string, KnowledgeSpaceNode>,
  edges: KnowledgeSpaceEdge[],
  masteredIds: Set<string>,
): 'mastered' | 'ready' | 'blocked' | 'review_due' | 'unknown' {
  if (learnerState[nodeId]) return learnerState[nodeId];
  if (masteredIds.has(nodeId)) return 'mastered';

  // Check if prerequisites are met
  const prereqEdges = edges.filter(
    (e) => e.type === 'prerequisite_for' && e.targetId === nodeId,
  );
  if (prereqEdges.length > 0) {
    const allPrereqsMet = prereqEdges.every((e) =>
      masteredIds.has(e.sourceId) || learnerState[e.sourceId] === 'mastered',
    );
    if (!allPrereqsMet) return 'blocked';
    return 'ready';
  }

  return 'unknown';
}

function toVisualNode(
  node: KnowledgeSpaceNode,
  state: VisualNodeV1['state'],
): VisualNodeV1 {
  return {
    nodeId: node.id,
    title: node.title,
    description: node.description,
    state,
    difficulty: node.difficulty,
    domain: node.domain,
  };
}

function toVisualEdges(
  edges: KnowledgeSpaceEdge[],
  edgeTypes: Array<'prerequisite' | 'supports' | 'extends'>,
): VisualEdgeV1[] {
  const edgeTypeMap: Record<string, VisualEdgeV1['type']> = {
    prerequisite_for: 'prerequisite',
    supports: 'supports',
    extends: 'extends',
  };

  return edges
    .filter((e) => edgeTypeMap[e.type] && edgeTypes.includes(edgeTypeMap[e.type]))
    .map((e) => ({
      sourceId: e.sourceId,
      targetId: e.targetId,
      type: edgeTypeMap[e.type] as VisualEdgeV1['type'],
      weight: e.weight,
    }));
}

// ---------------------------------------------------------------------------
// Student visualization
// ---------------------------------------------------------------------------

/**
 * Generate student-facing visualization from the knowledge space and optional
 * learner state. Nodes are partitioned into mastered, ready, blocked, review-due,
 * and recommended-next buckets based on learner state and prerequisite structure.
 *
 * Student, parent, and teacher visualizations render role-specific projection
 * payloads — they do not expose raw graph files. UI components must consume
 * these payloads rather than inferring canonical graph state.
 *
 * @param nodes - Knowledge space nodes
 * @param edges - Knowledge space edges
 * @param learnerState - Optional mapping from node IDs to mastery states
 * @returns StudentVisualizationV1 validated against studentVisualizationV1Schema
 */
export function projectStudentVisualization(
  nodes: KnowledgeSpaceNode[],
  edges: KnowledgeSpaceEdge[],
  learnerState: Record<string, 'mastered' | 'ready' | 'blocked' | 'review_due'> = {},
): StudentVisualizationV1 {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const masteredIds = new Set(
    Object.entries(learnerState)
      .filter(([, s]) => s === 'mastered')
      .map(([id]) => id),
  );

  const skillAndTaskNodes = nodes.filter(
    (n) => n.kind === 'skill' || n.kind === 'task_blueprint',
  );

  const mastered: VisualNodeV1[] = [];
  const ready: VisualNodeV1[] = [];
  const blocked: VisualNodeV1[] = [];
  const reviewDue: VisualNodeV1[] = [];
  const unknown: VisualNodeV1[] = [];

  for (const node of skillAndTaskNodes) {
    const state = computeNodeState(node.id, learnerState, nodeMap, edges, masteredIds);
    const vn = toVisualNode(node, state);

    switch (state) {
      case 'mastered':
        mastered.push(vn);
        break;
      case 'ready':
        ready.push(vn);
        break;
      case 'blocked':
        blocked.push(vn);
        break;
      case 'review_due':
        reviewDue.push(vn);
        break;
      default:
        unknown.push(vn);
        break;
    }
  }

  // Recommended next: first ready nodes, then unknown nodes
  const recommendedNext: VisualNodeV1[] = [...ready, ...unknown].slice(0, 5);

  const visualEdges = toVisualEdges(edges, ['prerequisite', 'supports', 'extends']);

  // Stable sort each bucket
  const sortNodes = (arr: VisualNodeV1[]) =>
    arr.sort((a, b) => a.nodeId.localeCompare(b.nodeId));

  sortNodes(mastered);
  sortNodes(ready);
  sortNodes(blocked);
  sortNodes(reviewDue);
  sortNodes(recommendedNext);
  visualEdges.sort((a, b) => {
    const srcCmp = a.sourceId.localeCompare(b.sourceId);
    if (srcCmp !== 0) return srcCmp;
    return a.targetId.localeCompare(b.targetId);
  });

  return {
    schemaVersion: 'v1',
    mastered,
    ready,
    blocked,
    reviewDue,
    recommendedNext,
    edges: visualEdges,
  };
}

// ---------------------------------------------------------------------------
// Parent visualization
// ---------------------------------------------------------------------------

/**
 * Generate parent-facing visualization with plain-language summaries. Translates
 * graph state into what the learner can do, what to focus on next, what's blocking
 * progress, and how progress is trending.
 *
 * @param nodes - Knowledge space nodes
 * @param edges - Knowledge space edges
 * @param learnerState - Optional mapping from node IDs to mastery states
 * @returns ParentVisualizationV1 validated against parentVisualizationV1Schema
 */
export function projectParentVisualization(
  nodes: KnowledgeSpaceNode[],
  edges: KnowledgeSpaceEdge[],
  learnerState: Record<string, string> = {},
): ParentVisualizationV1 {
  const studentViz = projectStudentVisualization(
    nodes,
    edges,
    learnerState as Record<string, 'mastered' | 'ready' | 'blocked' | 'review_due'>,
  );

  // Can-do summary from mastered nodes
  const masteredTitles = studentViz.mastered.map((n) => n.title);
  const canDoSummary =
    masteredTitles.length > 0
      ? `Can ${masteredTitles.join(', ')}`
      : 'No skills mastered yet';

  // Next focus from recommended next
  const nextFocus =
    studentViz.recommendedNext.length > 0
      ? `Practice: ${studentViz.recommendedNext[0].title}`
      : 'Continue current practice';

  // Blockers from blocked nodes
  const blockers = studentViz.blocked.map((n) => n.title);

  // Progress trend
  const masteredCount = studentViz.mastered.length;
  const totalSkillNodes = studentViz.mastered.length +
    studentViz.ready.length +
    studentViz.blocked.length +
    studentViz.reviewDue.length;

  let progressTrend: ParentVisualizationV1['progressTrend'] = 'unknown';
  if (totalSkillNodes > 0) {
    const ratio = masteredCount / totalSkillNodes;
    if (ratio >= 0.7) progressTrend = 'improving';
    else if (ratio >= 0.3) progressTrend = 'stable';
    else progressTrend = 'declining';
  }

  // All visual nodes for parent view
  const allNodes = [
    ...studentViz.mastered,
    ...studentViz.ready,
    ...studentViz.blocked,
    ...studentViz.reviewDue,
  ];
  allNodes.sort((a, b) => a.nodeId.localeCompare(b.nodeId));

  return {
    schemaVersion: 'v1',
    canDoSummary,
    nextFocus,
    blockers,
    progressTrend,
    nodes: allNodes,
  };
}

// ---------------------------------------------------------------------------
// Teacher visualization
// ---------------------------------------------------------------------------

/**
 * Generate teacher-facing visualization including class heatmap, bottleneck
 * nodes, prerequisite gaps, misconception clusters, intervention groups, and
 * standards coverage.
 *
 * @param nodes - Knowledge space nodes
 * @param edges - Knowledge space edges
 * @param classStats - Optional mapping from node IDs to { mastered, total } counts
 * @returns TeacherVisualizationV1 validated against teacherVisualizationV1Schema
 */
export function projectTeacherVisualization(
  nodes: KnowledgeSpaceNode[],
  edges: KnowledgeSpaceEdge[],
  classStats: Record<string, { mastered: number; total: number }> = {},
): TeacherVisualizationV1 {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // --- Heatmap ---
  const heatmap: TeacherHeatmapCell[] = [];
  const skillNodes = nodes.filter((n) => n.kind === 'skill' || n.kind === 'task_blueprint');

  for (const node of skillNodes) {
    const stats = classStats[node.id];
    heatmap.push({
      nodeId: node.id,
      title: node.title,
      masteredCount: stats?.mastered ?? 0,
      totalCount: stats?.total ?? 0,
      proficiencyRate: stats && stats.total > 0 ? stats.mastered / stats.total : 0,
    });
  }
  heatmap.sort((a, b) => a.nodeId.localeCompare(b.nodeId));

  // --- Bottleneck nodes (lowest proficiency) ---
  const sortedByProficiency = [...heatmap]
    .filter((c) => c.totalCount > 0)
    .sort((a, b) => a.proficiencyRate - b.proficiencyRate);
  const bottleneckNodes: VisualNodeV1[] = sortedByProficiency.slice(0, 3).map((c) => ({
    nodeId: c.nodeId,
    title: c.title,
    state: c.proficiencyRate < 0.4 ? 'blocked' : c.proficiencyRate < 0.7 ? 'review_due' : 'ready',
    difficulty: nodeMap.get(c.nodeId)?.difficulty,
  }));

  // --- Prerequisite gaps ---
  const prerequisiteGaps: PrerequisiteGap[] = [];
  for (const node of skillNodes) {
    const prereqEdges = edges.filter(
      (e) => e.type === 'prerequisite_for' && e.targetId === node.id,
    );
    if (prereqEdges.length === 0) continue;

    const stats = classStats[node.id];
    const proficiency = stats && stats.total > 0 ? stats.mastered / stats.total : 0;

    if (proficiency < 0.6) {
      prerequisiteGaps.push({
        nodeId: node.id,
        title: node.title,
        missingPrerequisites: prereqEdges.map((e) => e.sourceId),
        blockingLevel: proficiency < 0.3 ? 'full' : 'partial',
      });
    }
  }
  prerequisiteGaps.sort((a, b) => a.nodeId.localeCompare(b.nodeId));

  // --- Misconception clusters ---
  const misconceptionNodes = nodes.filter((n) => n.kind === 'misconception');
  const misconceptionClusters = misconceptionNodes.map((m) => {
    const relatedNodeIds = edges
      .filter(
        (e) =>
          e.type === 'common_misconception_with' &&
          (e.sourceId === m.id || e.targetId === m.id),
      )
      .map((e) => (e.sourceId === m.id ? e.targetId : e.sourceId));

    return {
      label: m.title,
      relatedNodeIds,
    };
  });

  // --- Intervention groups ---
  const LOW_PROFICIENCY_THRESHOLD = 0.4;
  const lowNodes = heatmap.filter(
    (c) => c.totalCount > 0 && c.proficiencyRate < LOW_PROFICIENCY_THRESHOLD,
  );

  const interventionGroups: InterventionGroup[] = [];
  if (lowNodes.length > 0) {
    interventionGroups.push({
      groupId: 'intervention.low-proficiency',
      label: 'Low Proficiency Skills',
      nodeIds: lowNodes.map((c) => c.nodeId),
      studentCount: Math.max(...lowNodes.map((c) => c.totalCount - c.masteredCount), 0),
    });
  }

  // --- Standards coverage ---
  const standardNodes = nodes.filter((n) => n.kind === 'standard');
  const standardsCoverage = standardNodes.map((std) => {
    const alignedSkillIds = edges
      .filter(
        (e) => e.type === 'aligned_to_standard' && e.targetId === std.id,
      )
      .map((e) => e.sourceId);

    let totalProficiency = 0;
    let count = 0;
    for (const skillId of alignedSkillIds) {
      const stats = classStats[skillId];
      if (stats && stats.total > 0) {
        totalProficiency += stats.mastered / stats.total;
        count++;
      }
    }

    return {
      standardId: std.id,
      title: std.title,
      proficiencyRate: count > 0 ? totalProficiency / count : 0,
    };
  });
  standardsCoverage.sort((a, b) => a.standardId.localeCompare(b.standardId));

  return {
    schemaVersion: 'v1',
    heatmap,
    bottleneckNodes,
    prerequisiteGaps,
    misconceptionClusters,
    interventionGroups,
    standardsCoverage,
  };
}
