import {
  knowledgeSpaceSchema,
  validateKnowledgeSpace,
  type KnowledgeSpace,
  type KnowledgeSpaceEdge,
  type KnowledgeSpaceNode,
} from '@math-platform/knowledge-space-core';

import { APPROVED_TLAC_SOURCE_INVENTORY } from './source-inventory';

type DanielsonSourceRef = { source: string; location?: string };
export type DanielsonNode = Omit<KnowledgeSpaceNode, 'kind' | 'sourceRefs' | 'reviewStatus' | 'metadata'> & {
  kind: 'domain' | 'content_group' | 'instructional_unit' | 'skill';
  sourceRefs: DanielsonSourceRef[];
  reviewStatus: 'approved';
  metadata: Record<string, unknown>;
};
export type DanielsonEdge = Omit<KnowledgeSpaceEdge, 'type' | 'confidence' | 'sourceRefs' | 'reviewStatus' | 'metadata'> & {
  type: 'contains' | 'prerequisite_for';
  confidence: 'high';
  sourceRefs: DanielsonSourceRef[];
  reviewStatus: 'approved' | 'reviewed';
  metadata: Record<string, unknown>;
};
export type DanielsonGraph = { nodes: DanielsonNode[]; edges: DanielsonEdge[] };

export const DANIELSON_COMPONENT_IDS = [
  '1a', '1b', '1c', '1d', '1e', '1f',
  '2a', '2b', '2c', '2d', '2e',
  '3a', '3b', '3c', '3d', '3e',
  '4a', '4b', '4c', '4d', '4e', '4f',
] as const;

export type DanielsonComponentId = (typeof DANIELSON_COMPONENT_IDS)[number];

const FRAMEWORK_SOURCE = {
  source: 'Danielson Framework for Teaching 2022',
  location: 'src/data/danielson.ts',
};
const TLAC_SOURCE = {
  source: 'Teach Like a Champion 3.0',
};

const DOMAIN_TITLES: Record<string, string> = {
  '1': 'Planning and Preparation',
  '2': 'Learning Environments',
  '3': 'Learning Experiences',
  '4': 'Principled Teaching',
};

const COMPONENT_TITLES: Record<DanielsonComponentId, string> = {
  '1a': 'Applying Knowledge of Content and Pedagogy',
  '1b': 'Knowing and Valuing Students',
  '1c': 'Setting Instructional Outcomes',
  '1d': 'Using Resources Effectively',
  '1e': 'Planning Coherent Instruction',
  '1f': 'Designing and Analyzing Assessments',
  '2a': 'Cultivating Respectful and Affirming Environments',
  '2b': 'Fostering a Culture for Learning',
  '2c': 'Maintaining Purposeful Environments',
  '2d': 'Supporting Positive Student Behavior',
  '2e': 'Organizing Spaces for Learning',
  '3a': 'Communicating About Purpose and Content',
  '3b': 'Using Questioning and Discussion Techniques',
  '3c': 'Engaging Students in Learning',
  '3d': 'Using Assessment for Learning',
  '3e': 'Responding Flexibly to Student Needs',
  '4a': 'Engaging in Reflective Practice',
  '4b': 'Documenting Student Progress',
  '4c': 'Engaging Families and Communities',
  '4d': 'Contributing to School Community and Culture',
  '4e': 'Growing and Developing Professionally',
  '4f': 'Acting in Service of Students',
};

const alignmentException = {
  type: 'alignment' as const,
  reason: 'Danielson skills align directly to app-owned components; no standard nodes are imported in Track 2.',
};

function rootNode(): DanielsonNode {
  return {
    id: 'danielson.framework.2022',
    kind: 'domain',
    title: 'Framework for Teaching 2022',
    domain: 'danielson',
    sourceRefs: [FRAMEWORK_SOURCE],
    reviewStatus: 'approved',
    metadata: { frameworkVersion: '2022' },
  };
}

function domainNode(number: string): DanielsonNode {
  return {
    id: `danielson.framework.domain.${number}`,
    kind: 'content_group',
    title: `Domain ${number}: ${DOMAIN_TITLES[number]}`,
    domain: 'danielson',
    sourceRefs: [FRAMEWORK_SOURCE],
    reviewStatus: 'approved',
    metadata: { domainNumber: Number(number) },
  };
}

function componentNode(componentId: DanielsonComponentId): DanielsonNode {
  return {
    id: `danielson.framework.component.${componentId}`,
    kind: 'instructional_unit',
    title: `${componentId}: ${COMPONENT_TITLES[componentId]}`,
    domain: 'danielson',
    sourceRefs: [FRAMEWORK_SOURCE],
    reviewStatus: 'approved',
    metadata: { componentId },
  };
}

function skillNode(skill: (typeof APPROVED_TLAC_SOURCE_INVENTORY)[number]): DanielsonNode {
  return {
    id: `danielson.tlac.skill.${skill.id}`,
    kind: 'skill',
    title: skill.title,
    domain: 'danielson',
    sourceRefs: [{ ...TLAC_SOURCE, location: skill.sourceLocation }],
    reviewStatus: 'approved',
    metadata: {
      techniqueId: skill.id,
      componentId: skill.componentId,
      sourceId: 'sibling.tlac3.modules',
    },
    exceptions: [alignmentException],
  };
}

function containsEdge(
  parentId: string,
  childId: string,
  sourceRefs: DanielsonSourceRef[] = [FRAMEWORK_SOURCE],
): DanielsonEdge {
  return {
    id: `danielson.edge.contains.${parentId.replaceAll('.', '-')}.${childId.replaceAll('.', '-')}`,
    type: 'contains',
    sourceId: parentId,
    targetId: childId,
    weight: 1,
    confidence: 'high',
    sourceRefs,
    reviewStatus: 'approved',
    metadata: {},
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export type DanielsonGraphBuild = {
  graph: DanielsonGraph;
};

function buildGraph(): DanielsonGraph {
  const root = rootNode();
  const domains = ['1', '2', '3', '4'].map(domainNode);
  const components = DANIELSON_COMPONENT_IDS.map(componentNode);
  const skills = APPROVED_TLAC_SOURCE_INVENTORY.map(skillNode);
  const edges: DanielsonEdge[] = [];

  for (const domain of domains) {
    edges.push(containsEdge(root.id, domain.id));
  }
  for (const component of components) {
    const componentId = String(component.metadata.componentId);
    edges.push(containsEdge(
      `danielson.framework.domain.${componentId[0]}`,
      component.id,
    ));
  }
  for (const skill of APPROVED_TLAC_SOURCE_INVENTORY) {
    edges.push(containsEdge(
      `danielson.framework.component.${skill.componentId}`,
      `danielson.tlac.skill.${skill.id}`,
      [{ ...TLAC_SOURCE, location: skill.sourceLocation }],
    ));
  }

  return { nodes: [root, ...domains, ...components, ...skills], edges };
}

/** Build the Danielson graph from the app-owned framework and skill data. */
export function buildDanielsonGraph(): DanielsonGraphBuild {
  return { graph: clone(buildGraph()) };
}

export function getComponentSkillIds(
  graph: KnowledgeSpace,
  componentId: string,
): string[] {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  return graph.edges
    .filter((edge) => edge.type === 'contains' && edge.sourceId === componentId)
    .filter((edge) => nodeById.get(edge.targetId)?.kind === 'skill')
    .map((edge) => edge.targetId)
    .sort();
}

export type DanielsonGraphIssue = {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type DanielsonGraphValidation = {
  valid: boolean;
  issues: DanielsonGraphIssue[];
};

/** Validate the canonical graph plus Danielson's fixed hierarchy rules. */
export function validateDanielsonGraph(graph: KnowledgeSpace): DanielsonGraphValidation {
  const issues: DanielsonGraphIssue[] = [];
  const canonicalSchema = knowledgeSpaceSchema.safeParse(graph);
  if (!canonicalSchema.success) {
    return {
      valid: false,
      issues: canonicalSchema.error.issues.map((issue) => ({
        code: 'CANONICAL_SCHEMA',
        message: issue.message,
      })),
    };
  }
  issues.push(...validateKnowledgeSpace(graph).errors);

  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const edgeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      issues.push({
        code: 'DUPLICATE_EDGE_ID',
        message: `Duplicate edge ID "${edge.id}"`,
        edgeId: edge.id,
      });
    }
    edgeIds.add(edge.id);
  }

  const rootId = 'danielson.framework.2022';
  const rootNodes = graph.nodes.filter((node) => node.kind === 'domain');
  if (rootNodes.length !== 1 || rootNodes[0]?.id !== rootId) {
    issues.push({
      code: 'INVALID_FRAMEWORK_ROOT',
      message: `Danielson graph must contain exactly one framework root (${rootId})`,
      nodeId: rootNodes[0]?.id,
    });
  }

  const expectedDomainIds = new Set(['1', '2', '3', '4'].map(
    (number) => `danielson.framework.domain.${number}`,
  ));
  const domainNodes = graph.nodes.filter((node) => node.kind === 'content_group');
  if (domainNodes.length !== expectedDomainIds.size) {
    issues.push({
      code: 'INVALID_DOMAIN_COUNT',
      message: 'Danielson graph must contain exactly four domain nodes',
    });
  }
  for (const id of expectedDomainIds) {
    if (nodeById.get(id)?.kind !== 'content_group') {
      issues.push({ code: 'MISSING_DOMAIN_NODE', message: `Missing Danielson domain node "${id}"`, nodeId: id });
    }
  }

  const expectedComponentIds = new Set(
    DANIELSON_COMPONENT_IDS.map((componentId) => `danielson.framework.component.${componentId}`),
  );
  const componentNodes = graph.nodes.filter((node) => node.kind === 'instructional_unit');
  if (componentNodes.length !== expectedComponentIds.size) {
    issues.push({
      code: 'INVALID_COMPONENT_COUNT',
      message: 'Danielson graph must contain exactly 22 component nodes',
    });
  }
  for (const id of expectedComponentIds) {
    if (nodeById.get(id)?.kind !== 'instructional_unit') {
      issues.push({ code: 'MISSING_COMPONENT_NODE', message: `Missing Danielson component node "${id}"`, nodeId: id });
    }
  }

  const containmentParents = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (edge.type === 'contains') {
      const parents = containmentParents.get(edge.targetId) ?? [];
      parents.push(edge.sourceId);
      containmentParents.set(edge.targetId, parents);
    }
    if (edge.type === 'prerequisite_for') {
      issues.push({ code: 'PROHIBITED_PREREQUISITE', message: 'Track 2 cannot activate GBF prerequisite edges', edgeId: edge.id });
    }
  }
  for (const node of graph.nodes) {
    const parents = containmentParents.get(node.id) ?? [];
    if (node.id === rootId) {
      if (parents.length > 0) {
        issues.push({ code: 'ROOT_HAS_PARENT', message: `Framework root "${rootId}" cannot have a containment parent`, nodeId: rootId });
      }
    } else if (parents.length !== 1) {
      issues.push({ code: 'INVALID_CONTAINMENT_PARENT_COUNT', message: `Node "${node.id}" must have exactly one containment parent`, nodeId: node.id });
    }
    if (node.kind === 'instructional_unit') {
      const componentId = typeof node.metadata.componentId === 'string'
        ? node.metadata.componentId
        : node.id.split('.').at(-1);
      const expectedParent = componentId
        ? `danielson.framework.domain.${componentId.charAt(0)}`
        : undefined;
      if (expectedParent && parents.length === 1 && parents[0] !== expectedParent) {
        issues.push({
          code: 'INVALID_COMPONENT_DOMAIN_PARENT',
          message: `Component "${node.id}" must be contained by "${expectedParent}"`,
          nodeId: node.id,
        });
      }
    }
    if (node.kind === 'skill' && typeof node.metadata.componentId === 'string') {
      const expectedParent = `danielson.framework.component.${node.metadata.componentId}`;
      if (parents.length === 1 && parents[0] !== expectedParent) {
        issues.push({
          code: 'MAPPING_COMPONENT_MISMATCH',
          message: `Skill "${node.id}" must be contained by its mapped component "${expectedParent}"`,
          nodeId: node.id,
        });
      }
    }
  }
  return { valid: issues.length === 0, issues };
}
