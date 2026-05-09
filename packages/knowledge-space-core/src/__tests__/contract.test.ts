import { describe, it, expect } from 'vitest';
import { knowledgeSpaceSchema } from '../schemas';
import {
  validateKnowledgeSpace,
  getDanglingEdges,
  getDuplicateNodeIds,
  getDuplicateEdges,
  getNodesMissingRequiredAlignments,
  getIndependentPracticeNodesMissingGenerators,
  validateNodeMetadataWithAdapter,
} from '../validation';
import type {
  KnowledgeSpace,
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
  DomainAdapter,
} from '../types';
import { syntheticMathFixture, syntheticEnglishGseFixture } from '../fixtures';

// ---------------------------------------------------------------------------
// Task 1.1 — Valid fixture tests
// ---------------------------------------------------------------------------

describe('contract — valid fixtures', () => {
  it('parses a minimal synthetic math-like knowledge space', () => {
    const result = knowledgeSpaceSchema.safeParse(syntheticMathFixture);
    expect(result.success, result.error?.message).toBe(true);
    if (result.success) {
      expect(result.data.nodes.length).toBeGreaterThanOrEqual(5);
      expect(result.data.edges.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('parses a synthetic English/GSE-like knowledge space', () => {
    const result = knowledgeSpaceSchema.safeParse(syntheticEnglishGseFixture);
    expect(result.success, result.error?.message).toBe(true);
    if (result.success) {
      expect(result.data.nodes.length).toBeGreaterThanOrEqual(3);
      expect(result.data.edges.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('accepts nodes of every defined kind', () => {
    const kinds: KnowledgeSpaceNode['kind'][] = [
      'domain',
      'content_group',
      'instructional_unit',
      'standard',
      'skill',
      'concept',
      'worked_example',
      'task_blueprint',
      'generator',
      'renderer',
      'misconception',
    ];

    for (const kind of kinds) {
      const space: KnowledgeSpace = {
        nodes: [{ ...syntheticMathFixture.nodes[0], kind }],
        edges: [],
      };
      const result = knowledgeSpaceSchema.safeParse(space);
      expect(result.success, `kind ${kind} should be valid`).toBe(true);
    }
  });

  it('accepts every defined edge type', () => {
    const edgeTypes: KnowledgeSpaceEdge['type'][] = [
      'contains',
      'appears_in_context',
      'aligned_to_standard',
      'prerequisite_for',
      'supports',
      'extends',
      'equivalent_to',
      'common_misconception_with',
      'rendered_by',
      'generated_by',
      'evidenced_by',
    ];

    // Nodes needed to satisfy endpoint pairing rules
    const skillNode: KnowledgeSpaceNode = {
      ...syntheticMathFixture.nodes[0],
      id: 'test:skill',
      kind: 'skill',
    };
    const standardNode: KnowledgeSpaceNode = {
      ...skillNode,
      id: 'test:standard',
      kind: 'standard',
    };
    const rendererNode: KnowledgeSpaceNode = {
      ...skillNode,
      id: 'test:renderer',
      kind: 'renderer',
    };
    const generatorNode: KnowledgeSpaceNode = {
      ...skillNode,
      id: 'test:generator',
      kind: 'generator',
    };
    const misconceptionNode: KnowledgeSpaceNode = {
      ...skillNode,
      id: 'test:misconception',
      kind: 'misconception',
    };

    // Pick the right target for each constrained edge type
    const targetForType: Record<string, KnowledgeSpaceNode> = {
      aligned_to_standard: standardNode,
      rendered_by: rendererNode,
      generated_by: generatorNode,
      common_misconception_with: misconceptionNode,
    };

    for (const type of edgeTypes) {
      const target = targetForType[type] ?? skillNode;
      const space: KnowledgeSpace = {
        nodes: [skillNode, standardNode, rendererNode, generatorNode, misconceptionNode],
        edges: [
          {
            id: `edge:${type}`,
            type,
            sourceId: skillNode.id,
            targetId: target.id,
            weight: 0.5,
            confidence: 'medium',
            sourceRefs: ['test'],
            reviewStatus: 'draft',
          },
        ],
      };
      const result = knowledgeSpaceSchema.safeParse(space);
      expect(result.success, `edge type ${type} should be valid`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 1.2 — Structural failure tests
// ---------------------------------------------------------------------------

describe('contract — structural failures', () => {
  it('rejects duplicate node IDs', () => {
    const node: KnowledgeSpaceNode = syntheticMathFixture.nodes[0];
    const space: KnowledgeSpace = { nodes: [node, node], edges: [] };
    const result = knowledgeSpaceSchema.safeParse(space);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.toLowerCase().includes('duplicate'))).toBe(true);
    }
  });

  it('rejects dangling edge source', () => {
    const space: KnowledgeSpace = {
      nodes: [syntheticMathFixture.nodes[0]],
      edges: [
        {
          ...syntheticMathFixture.edges[0],
          sourceId: 'nonexistent:node',
        },
      ],
    };
    const result = knowledgeSpaceSchema.safeParse(space);
    expect(result.success).toBe(false);
  });

  it('rejects dangling edge target', () => {
    const space: KnowledgeSpace = {
      nodes: [syntheticMathFixture.nodes[0]],
      edges: [
        {
          ...syntheticMathFixture.edges[0],
          targetId: 'nonexistent:node',
        },
      ],
    };
    const result = knowledgeSpaceSchema.safeParse(space);
    expect(result.success).toBe(false);
  });

  it('rejects duplicate exact edges', () => {
    const nodeA = syntheticMathFixture.nodes[0];
    const nodeB = { ...nodeA, id: 'node:b' };
    const edge: KnowledgeSpaceEdge = {
      id: 'edge:test',
      type: 'supports',
      sourceId: nodeA.id,
      targetId: nodeB.id,
      weight: 0.5,
      confidence: 'medium',
      sourceRefs: ['test'],
      reviewStatus: 'draft',
    };
    const space: KnowledgeSpace = {
      nodes: [nodeA, nodeB],
      edges: [edge, edge],
    };
    const result = knowledgeSpaceSchema.safeParse(space);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.toLowerCase().includes('duplicate'))).toBe(true);
    }
  });

  it('rejects invalid edge endpoint pairing (rendered_by must target renderer)', () => {
    // rendered_by source must be a node that can be rendered, target must be a renderer
    const skillNode: KnowledgeSpaceNode = {
      ...syntheticMathFixture.nodes[0],
      kind: 'skill',
    };
    const standardNode: KnowledgeSpaceNode = {
      ...skillNode,
      id: 'node:standard',
      kind: 'standard',
    };
    const space: KnowledgeSpace = {
      nodes: [skillNode, standardNode],
      edges: [
        {
          id: 'edge:rendered-by-wrong',
          type: 'rendered_by',
          sourceId: skillNode.id,
          targetId: standardNode.id, // target should be 'renderer', not 'standard'
          weight: 1,
          confidence: 'high',
          sourceRefs: ['test'],
          reviewStatus: 'draft',
        },
      ],
    };
    const result = knowledgeSpaceSchema.safeParse(space);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Task 1.3 — Readiness validation tests
// ---------------------------------------------------------------------------

describe('contract — readiness validation', () => {
  it('flags skill nodes missing required standard alignment', () => {
    const skill: KnowledgeSpaceNode = {
      id: 'skill:no-standard',
      kind: 'skill',
      title: 'Untethered Skill',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
    };
    const space: KnowledgeSpace = { nodes: [skill], edges: [] };
    const issues = getNodesMissingRequiredAlignments(space);
    expect(issues.some((i) => i.nodeId === skill.id)).toBe(true);
  });

  it('does not flag skill nodes that have a standards alignment edge', () => {
    const skill: KnowledgeSpaceNode = {
      id: 'skill:with-standard',
      kind: 'skill',
      title: 'Tethered Skill',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
    };
    const standard: KnowledgeSpaceNode = {
      id: 'std:ccss.alg.rei.b.4',
      kind: 'standard',
      title: 'Solve quadratic equations',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
    };
    const space: KnowledgeSpace = {
      nodes: [skill, standard],
      edges: [
        {
          id: 'edge:align',
          type: 'aligned_to_standard',
          sourceId: skill.id,
          targetId: standard.id,
          weight: 1,
          confidence: 'high',
          sourceRefs: ['test'],
          reviewStatus: 'draft',
        },
      ],
    };
    const issues = getNodesMissingRequiredAlignments(space);
    expect(issues.some((i) => i.nodeId === skill.id)).toBe(false);
  });

  it('does not flag skill nodes that have a documented alignment exception', () => {
    const skill: KnowledgeSpaceNode = {
      id: 'skill:with-exception',
      kind: 'skill',
      title: 'Skill With Exception',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
      exceptions: [
        {
          type: 'alignment',
          reason: 'No applicable standard in current catalog',
          reviewer: 'test',
          date: '2026-01-01',
        },
      ],
    };
    const space: KnowledgeSpace = { nodes: [skill], edges: [] };
    const issues = getNodesMissingRequiredAlignments(space);
    expect(issues.some((i) => i.nodeId === skill.id)).toBe(false);
  });

  it('flags independentPracticeReady nodes missing generator edge', () => {
    const blueprint: KnowledgeSpaceNode = {
      id: 'blueprint:no-gen',
      kind: 'task_blueprint',
      title: 'Orphan Blueprint',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
      independentPracticeReady: true,
    };
    const space: KnowledgeSpace = { nodes: [blueprint], edges: [] };
    const issues = getIndependentPracticeNodesMissingGenerators(space);
    expect(issues.some((i) => i.nodeId === blueprint.id)).toBe(true);
  });

  it('does not flag independentPracticeReady nodes that have a generated_by edge', () => {
    const blueprint: KnowledgeSpaceNode = {
      id: 'blueprint:with-gen',
      kind: 'task_blueprint',
      title: 'Blueprint With Generator',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
      independentPracticeReady: true,
    };
    const generator: KnowledgeSpaceNode = {
      id: 'gen:quadratic',
      kind: 'generator',
      title: 'Quadratic Generator',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
    };
    const space: KnowledgeSpace = {
      nodes: [blueprint, generator],
      edges: [
        {
          id: 'edge:gen',
          type: 'generated_by',
          sourceId: blueprint.id,
          targetId: generator.id,
          weight: 1,
          confidence: 'high',
          sourceRefs: ['test'],
          reviewStatus: 'draft',
        },
      ],
    };
    const issues = getIndependentPracticeNodesMissingGenerators(space);
    expect(issues.some((i) => i.nodeId === blueprint.id)).toBe(false);
  });

  it('does not flag independentPracticeReady nodes with a generator exception', () => {
    const blueprint: KnowledgeSpaceNode = {
      id: 'blueprint:gen-exception',
      kind: 'task_blueprint',
      title: 'Blueprint With Gen Exception',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
      independentPracticeReady: true,
      exceptions: [
        {
          type: 'generator',
          reason: 'Uses hand-authored fixed item pool',
          reviewer: 'test',
          date: '2026-01-01',
        },
      ],
    };
    const space: KnowledgeSpace = { nodes: [blueprint], edges: [] };
    const issues = getIndependentPracticeNodesMissingGenerators(space);
    expect(issues.some((i) => i.nodeId === blueprint.id)).toBe(false);
  });

  it('allows a domain adapter to reject invalid metadata while core stays neutral', () => {
    const skillNode: KnowledgeSpaceNode = syntheticMathFixture.nodes[0];

    const mathAdapter: DomainAdapter = {
      domain: 'math.test',
      validateNodeMetadata: (node: KnowledgeSpaceNode) => {
        // Math adapter rejects nodes without a course/module reference
        if (!node.metadata?.course) {
          return { valid: false, errors: ['math node must have course metadata'] };
        }
        return { valid: true };
      },
    };

    // This node has no course metadata — adapter should reject
    const result = validateNodeMetadataWithAdapter(skillNode, mathAdapter);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('math node must have course metadata');
  });

  it('allows a domain adapter to accept valid domain metadata', () => {
    const skillNode: KnowledgeSpaceNode = {
      ...syntheticMathFixture.nodes[0],
      metadata: { course: 'im3', module: 'm1' },
    };

    const mathAdapter: DomainAdapter = {
      domain: 'math.test',
      validateNodeMetadata: (node: KnowledgeSpaceNode) => {
        if (!node.metadata?.course) {
          return { valid: false, errors: ['math node must have course metadata'] };
        }
        return { valid: true };
      },
    };

    const result = validateNodeMetadataWithAdapter(skillNode, mathAdapter);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateKnowledgeSpace — aggregate validation
// ---------------------------------------------------------------------------

describe('validateKnowledgeSpace', () => {
  it('returns no errors for a valid graph', () => {
    const result = validateKnowledgeSpace(syntheticMathFixture);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns all violation categories for an invalid graph', () => {
    const node: KnowledgeSpaceNode = syntheticMathFixture.nodes[0];
    const badSpace: KnowledgeSpace = {
      nodes: [node, { ...node, id: node.id }], // duplicate
      edges: [
        {
          id: 'edge:dangling',
          type: 'supports',
          sourceId: 'nonexistent:source',
          targetId: node.id,
          weight: 0.5,
          confidence: 'medium',
          sourceRefs: ['test'],
          reviewStatus: 'draft',
        },
      ],
    };
    const result = validateKnowledgeSpace(badSpace);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Helper validators — edge cases
// ---------------------------------------------------------------------------

describe('validateKnowledgeSpace — edge cases', () => {
  it('returns errors for nodes that require alignment but lack it', () => {
    const skill: KnowledgeSpaceNode = {
      id: 'skill:alone',
      kind: 'skill',
      title: 'Lone Skill',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
    };
    const space: KnowledgeSpace = { nodes: [skill], edges: [] };
    const result = validateKnowledgeSpace(space);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_ALIGNMENT')).toBe(true);
  });

  it('returns errors for independentPracticeReady nodes missing generators', () => {
    const blueprint: KnowledgeSpaceNode = {
      id: 'bp:no-gen',
      kind: 'task_blueprint',
      title: 'No Generator',
      domain: 'math.test',
      sourceRefs: ['synthetic'],
      reviewStatus: 'draft',
      metadata: {},
      independentPracticeReady: true,
    };
    const space: KnowledgeSpace = { nodes: [blueprint], edges: [] };
    const result = validateKnowledgeSpace(space);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MISSING_GENERATOR')).toBe(true);
  });

  it('getDanglingEdges finds dangling source and target', () => {
    const node: KnowledgeSpaceNode = syntheticMathFixture.nodes[0];
    const graph: KnowledgeSpace = {
      nodes: [node],
      edges: [
        {
          id: 'edge:no-source',
          type: 'supports',
          sourceId: 'gone:source',
          targetId: node.id,
          weight: 0.5,
          confidence: 'medium',
          sourceRefs: ['test'],
          reviewStatus: 'draft',
        },
        {
          id: 'edge:no-target',
          type: 'supports',
          sourceId: node.id,
          targetId: 'gone:target',
          weight: 0.5,
          confidence: 'medium',
          sourceRefs: ['test'],
          reviewStatus: 'draft',
        },
      ],
    };
    const dangling = getDanglingEdges(graph);
    expect(dangling).toHaveLength(2);
  });

  it('getDuplicateNodeIds returns duplicate IDs', () => {
    const node: KnowledgeSpaceNode = syntheticMathFixture.nodes[0];
    const graph: KnowledgeSpace = { nodes: [node, node], edges: [] };
    const dups = getDuplicateNodeIds(graph);
    expect(dups).toHaveLength(1);
    expect(dups[0]).toBe(node.id);
  });

  it('getDuplicateEdges returns duplicate edge signatures', () => {
    const nodeA = syntheticMathFixture.nodes[0];
    const nodeB = { ...nodeA, id: 'node:b' };
    const edge: KnowledgeSpaceEdge = {
      id: 'edge:dup',
      type: 'supports',
      sourceId: nodeA.id,
      targetId: nodeB.id,
      weight: 0.5,
      confidence: 'medium',
      sourceRefs: ['test'],
      reviewStatus: 'draft',
    };
    const graph: KnowledgeSpace = {
      nodes: [nodeA, nodeB],
      edges: [edge, { ...edge, id: 'edge:dup2' }],
    };
    const dups = getDuplicateEdges(graph);
    expect(dups.length).toBeGreaterThan(0);
  });
});
