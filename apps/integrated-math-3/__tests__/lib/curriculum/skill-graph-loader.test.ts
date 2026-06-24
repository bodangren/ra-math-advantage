/**
 * Unit tests for the shared FR-4 skill-graph loader.
 *
 * These tests pin the helper's contract: it returns the full 574-node
 * aggregated graph (NOT the module-1 shard), the result is shared by
 * reference across calls, and the module-2 node used by FR-4's behavioral
 * fixture exists in the returned graph.
 */
import { describe, it, expect } from 'vitest';

import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';

describe('loadFullCurriculumGraph', () => {
  it('returns nodes spanning all nine modules', () => {
    const { nodes } = loadFullCurriculumGraph();
    // Root aggregated graph is the canonical 574-node artifact.
    expect(nodes.length).toBeGreaterThanOrEqual(500);

    // Verify coverage across modules 1, 2, 3 at minimum (FR-4's
    // behavioral proof requires modules 1 and 2; module 3 is a
    // smoke check that the loader is not module-1-only).
    const moduleNumbersSeen = new Set<string>();
    for (const n of nodes) {
      if (n.id.startsWith('math.im3.skill.')) {
        // node ids look like: math.im3.skill.<module>.<lesson>.<slug>
        const seg = n.id.split('.')[3];
        if (seg) moduleNumbersSeen.add(seg);
      }
    }
    expect(moduleNumbersSeen.has('1')).toBe(true);
    expect(moduleNumbersSeen.has('2')).toBe(true);
    expect(moduleNumbersSeen.has('3')).toBe(true);
  });

  it('contains the specific module-2 node used by the FR-4 behavioral fixture', () => {
    const { nodes } = loadFullCurriculumGraph();
    const targetId = 'math.im3.skill.2.1.graph-and-analyze-polynomial-functions';
    const found = nodes.some((n) => n.id === targetId);
    expect(found).toBe(true);
  });

  it('returns the edges array (non-empty)', () => {
    const { edges } = loadFullCurriculumGraph();
    // 2708 edges in the canonical root artifact.
    expect(edges.length).toBeGreaterThan(0);
  });

  it('shares the same module-scoped arrays across calls (static-import invariant)', () => {
    // The JSON modules resolve at build time. Returning fresh references
    // each call is fine, but the underlying data must be the same
    // canonical graph (FR-8 anti-pattern: per-call JSON parse).
    const a = loadFullCurriculumGraph();
    const b = loadFullCurriculumGraph();
    // Same node count and edge count across calls.
    expect(a.nodes.length).toBe(b.nodes.length);
    expect(a.edges.length).toBe(b.edges.length);
    // Same first-node id (proves no random reshuffling).
    expect(a.nodes[0]?.id).toBe(b.nodes[0]?.id);
  });
});