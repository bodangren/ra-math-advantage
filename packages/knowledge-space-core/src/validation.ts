// Validation helpers for knowledge-space.v1

import type {
  KnowledgeSpace,
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
  DomainAdapter,
  ValidationResult,
  ValidationError,
  NodeKind,
  EdgeType,
} from './types';

// ---------------------------------------------------------------------------
// Edge endpoint pairing rules (mirrors the rules in schemas.ts)
// ---------------------------------------------------------------------------

type EdgeEndpointRule = { edgeType: EdgeType; targetKinds: NodeKind[] };

const EDGE_ENDPOINT_RULES: EdgeEndpointRule[] = [
  { edgeType: 'rendered_by', targetKinds: ['renderer'] },
  { edgeType: 'generated_by', targetKinds: ['generator'] },
  { edgeType: 'aligned_to_standard', targetKinds: ['standard'] },
  { edgeType: 'common_misconception_with', targetKinds: ['misconception'] },
];

export function getInvalidEdgePairings(
  graph: KnowledgeSpace,
): Array<{ edgeId: string; message: string }> {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const rulesByType = new Map(EDGE_ENDPOINT_RULES.map((r) => [r.edgeType, r]));
  const violations: Array<{ edgeId: string; message: string }> = [];

  for (const edge of graph.edges) {
    const rule = rulesByType.get(edge.type);
    if (!rule) continue;
    const target = nodeMap.get(edge.targetId);
    if (target && !rule.targetKinds.includes(target.kind)) {
      violations.push({
        edgeId: edge.id,
        message: `Edge "${edge.id}" of type "${edge.type}" must target a node of kind ${rule.targetKinds.join(' | ')}, but targets "${target.kind}"`,
      });
    }
  }
  return violations;
}

// Nodes that must have standard alignment (skill, worked_example, task_blueprint)
const NODES_REQUIRING_ALIGNMENT: Set<string> = new Set([
  'skill',
  'worked_example',
  'task_blueprint',
]);

export function validateKnowledgeSpace(space: KnowledgeSpace): ValidationResult {
  const errors: ValidationError[] = [];

  // Duplicate node IDs
  const dupNodeIds = getDuplicateNodeIds(space);
  for (const id of dupNodeIds) {
    errors.push({ code: 'DUPLICATE_NODE_ID', message: `Duplicate node ID "${id}"`, nodeId: id });
  }

  // Dangling edges
  const dangling = getDanglingEdges(space);
  for (const edge of dangling) {
    errors.push({
      code: 'DANGLING_EDGE',
      message: `Edge "${edge.id}" references a node that does not exist`,
      edgeId: edge.id,
    });
  }

  // Duplicate edges
  const dupEdges = getDuplicateEdges(space);
  for (const dup of dupEdges) {
    errors.push({
      code: 'DUPLICATE_EDGE',
      message: `Duplicate edge (${dup.sourceId} → ${dup.targetId} [${dup.type}])`,
    });
  }

  // Missing required alignment
  const missingAlignments = getNodesMissingRequiredAlignments(space);
  for (const item of missingAlignments) {
    errors.push({
      code: 'MISSING_REQUIRED_ALIGNMENT',
      message: `Node "${item.nodeId}" requires a standard alignment edge or documented exception`,
      nodeId: item.nodeId,
    });
  }

  // Missing generators for independent-practice-ready nodes
  const missingGenerators = getIndependentPracticeNodesMissingGenerators(space);
  for (const item of missingGenerators) {
    errors.push({
      code: 'MISSING_GENERATOR',
      message: `Node "${item.nodeId}" is marked independentPracticeReady but lacks a generated_by edge or exception`,
      nodeId: item.nodeId,
    });
  }

  // Invalid edge endpoint pairings
  const pairingViolations = getInvalidEdgePairings(space);
  for (const v of pairingViolations) {
    errors.push({
      code: 'INVALID_EDGE_PAIRING',
      message: v.message,
      edgeId: v.edgeId,
    });
  }

  return { valid: errors.length === 0, errors };
}

export function getDanglingEdges(graph: KnowledgeSpace): KnowledgeSpaceEdge[] {
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  return graph.edges.filter(
    (e) => !nodeIds.has(e.sourceId) || !nodeIds.has(e.targetId),
  );
}

export function getDuplicateNodeIds(graph: KnowledgeSpace): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const node of graph.nodes) {
    if (seen.has(node.id)) dups.add(node.id);
    else seen.add(node.id);
  }
  return Array.from(dups);
}

export function getDuplicateEdges(graph: KnowledgeSpace): Array<{
  sourceId: string;
  targetId: string;
  type: string;
}> {
  const seen = new Map<string, number>();
  const dups: Array<{ sourceId: string; targetId: string; type: string }> = [];
  for (const edge of graph.edges) {
    const key = `${edge.sourceId}::${edge.targetId}::${edge.type}`;
    const count = (seen.get(key) ?? 0) + 1;
    if (count === 2) {
      dups.push({ sourceId: edge.sourceId, targetId: edge.targetId, type: edge.type });
    }
    seen.set(key, count);
  }
  return dups;
}

function hasExceptionOfType(
  node: KnowledgeSpaceNode,
  exceptionType: string,
): boolean {
  return (node.exceptions ?? []).some((e) => e.type === exceptionType);
}

export function getNodesMissingRequiredAlignments(
  graph: KnowledgeSpace,
): Array<{ nodeId: string }> {
  const nodesWithAlignmentEdge = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.type === 'aligned_to_standard') {
      nodesWithAlignmentEdge.add(edge.sourceId);
    }
  }

  return graph.nodes
    .filter(
      (n) =>
        NODES_REQUIRING_ALIGNMENT.has(n.kind) &&
        !nodesWithAlignmentEdge.has(n.id) &&
        !hasExceptionOfType(n, 'alignment'),
    )
    .map((n) => ({ nodeId: n.id }));
}

export function getIndependentPracticeNodesMissingGenerators(
  graph: KnowledgeSpace,
): Array<{ nodeId: string }> {
  const nodesWithGeneratorEdge = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.type === 'generated_by') {
      nodesWithGeneratorEdge.add(edge.sourceId);
    }
  }

  return graph.nodes
    .filter(
      (n) =>
        n.independentPracticeReady === true &&
        !nodesWithGeneratorEdge.has(n.id) &&
        !hasExceptionOfType(n, 'generator'),
    )
    .map((n) => ({ nodeId: n.id }));
}

export function validateNodeMetadataWithAdapter(
  node: KnowledgeSpaceNode,
  adapter: DomainAdapter,
): { valid: boolean; errors?: string[] } {
  return adapter.validateNodeMetadata(node);
}
