/**
 * Phase 4 — Task 1: Graph-loader test (RED/GREEN)
 *
 * Verifies the full IM3 knowledge-space graph loads from rollout artifacts
 * with non-zero nodes/edges. The graph MUST come from real rollout data
 * (curriculum/skill-graph/nodes.json + edges.json), not a hand-written fake.
 *
 * Per test-strategy.md §4.1, this test should pass immediately since
 * `loadFullCurriculumGraph` is pre-existing. It serves as the falsifiable
 * contract test for "graph is loadable at runtime."
 */

import { describe, it, expect } from 'vitest';
import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';

describe('Phase 4 — loadFullCurriculumGraph (graph artifact loading)', () => {
  it('loads non-zero nodes from real rollout artifacts', () => {
    const { nodes } = loadFullCurriculumGraph();
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('loads non-zero edges from real rollout artifacts', () => {
    const { edges } = loadFullCurriculumGraph();
    expect(edges.length).toBeGreaterThan(0);
  });

  it('nodes have valid KnowledgeSpaceNode shape (id + kind fields)', () => {
    const { nodes } = loadFullCurriculumGraph();
    for (const node of nodes) {
      expect(typeof node.id).toBe('string');
      expect(node.id.length).toBeGreaterThan(0);
      expect(typeof node.kind).toBe('string');
      expect(node.kind.length).toBeGreaterThan(0);
    }
  });

  it('edges have valid KnowledgeSpaceEdge shape (id + type + sourceId + targetId)', { timeout: 15000 }, () => {
    const { edges } = loadFullCurriculumGraph();
    for (const edge of edges) {
      expect(typeof edge.id).toBe('string');
      expect(edge.id.length).toBeGreaterThan(0);
      expect(typeof edge.type).toBe('string');
      expect(typeof edge.sourceId).toBe('string');
      expect(typeof edge.targetId).toBe('string');
    }
  });

  it('contains prerequisite_for edges (structural edges needed for fringe computation)', () => {
    const { edges } = loadFullCurriculumGraph();
    const prereqEdges = edges.filter((e) => e.type === 'prerequisite_for');
    // Closed-system validation caveat (lessons-learned 2026-05-10):
    // course-level validation is meaningful only for structural edges.
    // We assert that prerequisite_for edges exist but do not validate
    // their pedagogical correctness — that is upstream curriculum work.
    expect(prereqEdges.length).toBeGreaterThan(0);
  });

  it('contains skill nodes (needed for knowledge state computation)', () => {
    const { nodes } = loadFullCurriculumGraph();
    const skillNodes = nodes.filter((n) => n.kind === 'skill');
    expect(skillNodes.length).toBeGreaterThan(0);
  });

  it('returns a valid KnowledgeSpace-compatible shape', () => {
    const graph = loadFullCurriculumGraph();
    // The KnowledgeSpace type is { nodes: KnowledgeSpaceNode[]; edges: KnowledgeSpaceEdge[] }
    // TypeScript enforces this at compile time, but we also assert runtime shape.
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
    // All nodes have ids
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    expect(nodeIds.size).toBe(graph.nodes.length); // no duplicate ids
  });

  it('node IDs are unique', () => {
    const { nodes } = loadFullCurriculumGraph();
    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('edge IDs are unique', () => {
    const { edges } = loadFullCurriculumGraph();
    const ids = edges.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
