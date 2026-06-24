/**
 * Shared full-curriculum skill-graph loader for IM3 Convex handlers.
 *
 * FR-4 — both `convex/student.ts` and `convex/parent/visualization.ts` need
 * the full multi-module knowledge graph (574 nodes / 2708 edges across
 * modules 1–9), not just module-1's shard. Loading the root aggregated
 * artifact once and sharing it across handlers keeps the handlers trivial
 * and the deployable artifact single-source-of-truth.
 *
 * Why root, not per-module shards:
 *   - Root `skill-graph/{nodes,edges}.json` is the canonical aggregated graph
 *     maintained as the single source of truth
 *     (`apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-graph-validation.test.ts`
 *     cross-validates root vs. per-module).
 *   - Per-module shard concatenation at runtime would require fs-at-runtime
 *     enumeration, which is incompatible with bundled Convex deploys.
 *   - The 574-vs-582 root-vs-shards node divergence is documented in
 *     `_artifacts/graph-source-decision.md` and is an upstream curriculum
 *     concern, not an FR-4 concern.
 *
 * The JSON modules resolve at build time (TypeScript
 * `resolveJsonModule: true` is on, see `apps/integrated-math-3/tsconfig.json`
 * and `apps/integrated-math-3/convex/tsconfig.json`), so the helper is a
 * module-scoped static import — no per-call JSON parsing on the hot path.
 */
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';

import fullNodesJson from '../../curriculum/skill-graph/nodes.json';
import fullEdgesJson from '../../curriculum/skill-graph/edges.json';

/**
 * The full IM3 curriculum skill graph (574 nodes / 2708 edges spanning all
 * nine modules). Returned by reference — the underlying arrays are module
 * constants and are shared across all callers.
 *
 * @returns { nodes, edges } — the root aggregated graph.
 */
export function loadFullCurriculumGraph(): {
  nodes: KnowledgeSpaceNode[];
  edges: KnowledgeSpaceEdge[];
} {
  return {
    nodes: (fullNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes,
    edges: (fullEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges,
  };
}