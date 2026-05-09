import { describe, it, expect } from 'vitest';
import { knowledgeSpaceSchema, validateKnowledgeSpace, getNodesMissingRequiredAlignments, getIndependentPracticeNodesMissingGenerators, getInvalidEdgePairings } from '@math-platform/knowledge-space-core';
import { validateMathNodeMetadata, mathDomainAdapter } from '@math-platform/math-content/knowledge-space';
import type { KnowledgeSpace, KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import nodesJson from '../module-1/nodes.json';
import edgesJson from '../module-1/edges.json';
import standardEdgesJson from '../module-1/standard-edges.json';

function loadModule1Graph(): KnowledgeSpace {
  const module1Nodes = (nodesJson as { nodes: KnowledgeSpaceNode[] }).nodes
    .filter(n => n.metadata?.module === '1' || n.kind === 'domain');
  const module1NodeIds = new Set(module1Nodes.map(n => n.id));
  const module1Edges = (edgesJson as { edges: KnowledgeSpaceEdge[] }).edges
    .filter(e => module1NodeIds.has(e.sourceId) && module1NodeIds.has(e.targetId));
  const standardEdgeSourceIds = new Set(
    (standardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges
      .filter(e => module1NodeIds.has(e.sourceId))
      .map(e => e.sourceId),
  );
  const standardNodes = (standardEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes
    .filter(n => n.kind === 'standard' || module1NodeIds.has(n.id));
  const allNodes = [...module1Nodes];
  const seenIds = new Set(allNodes.map(n => n.id));
  for (const n of standardNodes) {
    if (!seenIds.has(n.id)) {
      allNodes.push(n);
      seenIds.add(n.id);
    }
  }
  const standardEdgesForModule1 = (standardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges
    .filter(e => module1NodeIds.has(e.sourceId) || module1NodeIds.has(e.targetId));
  const allEdges = [...module1Edges, ...standardEdgesForModule1];
  return { nodes: allNodes, edges: allEdges };
}

describe('Module 1 Graph Validation', () => {
  it('loads Module 1 graph artifacts without error', () => {
    const graph = loadModule1Graph();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('validates against knowledgeSpaceSchema', () => {
    const graph = loadModule1Graph();
    const result = knowledgeSpaceSchema.safeParse(graph);
    if (!result.success) {
      console.error('Schema validation errors:', JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it('passes validateKnowledgeSpace with no errors', () => {
    const graph = loadModule1Graph();
    const result = validateKnowledgeSpace(graph);
    if (!result.valid) {
      console.error('Validation errors:', result.errors);
    }
    expect(result.valid).toBe(true);
  });

  it('has no dangling edges', () => {
    const graph = loadModule1Graph();
    const result = validateKnowledgeSpace(graph);
    const danglingErrors = result.errors.filter(e => e.code === 'DANGLING_EDGE');
    expect(danglingErrors).toHaveLength(0);
  });

  it('has no duplicate node IDs', () => {
    const graph = loadModule1Graph();
    const result = validateKnowledgeSpace(graph);
    const dupErrors = result.errors.filter(e => e.code === 'DUPLICATE_NODE_ID');
    expect(dupErrors).toHaveLength(0);
  });

  it('has no invalid edge endpoint pairings', () => {
    const graph = loadModule1Graph();
    const violations = getInvalidEdgePairings(graph);
    expect(violations).toHaveLength(0);
  });

  it('all skill/worked_example/task_blueprint nodes have standard alignment or documented exception', () => {
    const graph = loadModule1Graph();
    const missing = getNodesMissingRequiredAlignments(graph);
    if (missing.length > 0) {
      console.error('Nodes missing alignment:', missing);
    }
    expect(missing).toHaveLength(0);
  });

  it('all independentPracticeReady nodes have generated_by edge or exception', () => {
    const graph = loadModule1Graph();
    const missing = getIndependentPracticeNodesMissingGenerators(graph);
    expect(missing).toHaveLength(0);
  });

  it('has required node kinds for Module 1 pilot', () => {
    const graph = loadModule1Graph();
    const kinds = new Set(graph.nodes.map(n => n.kind));
    expect(kinds.has('domain')).toBe(true);
    expect(kinds.has('skill')).toBe(true);
    expect(kinds.has('worked_example')).toBe(true);
    expect(kinds.has('standard')).toBe(true);
  });

  it('all Module 1 node metadata validates against math domain adapter', () => {
    const graph = loadModule1Graph();
    const module1Nodes = graph.nodes.filter(
      n => n.kind !== 'standard' && n.kind !== 'domain',
    );
    const errors: string[] = [];
    for (const node of module1Nodes) {
      const result = validateMathNodeMetadata(node);
      if (!result.valid) {
        errors.push(`${node.id}: ${result.errors?.join('; ')}`);
      }
    }
    if (errors.length > 0) {
      console.error('Metadata validation errors:', errors);
    }
    expect(errors).toHaveLength(0);
  });

  it('has Module 1 structural edges (contains, prerequisite_for, supports)', () => {
    const graph = loadModule1Graph();
    const structuralEdgeTypes = new Set(['contains', 'prerequisite_for', 'supports', 'appears_in_context']);
    const structuralEdges = graph.edges.filter(e => structuralEdgeTypes.has(e.type));
    expect(structuralEdges.length).toBeGreaterThan(0);
  });

  it('has Module 1 alignment edges (aligned_to_standard)', () => {
    const graph = loadModule1Graph();
    const alignmentEdges = graph.edges.filter(e => e.type === 'aligned_to_standard');
    expect(alignmentEdges.length).toBeGreaterThan(0);
  });
});