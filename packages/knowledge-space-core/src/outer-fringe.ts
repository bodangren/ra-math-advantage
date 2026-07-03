// Outer fringe — Phase 2 implementation (kst-srs.v2 §4).
//
// Implements binary prerequisite gating and the readinessFn seam for
// weighted readiness. Standalone exported function (FR3 — not buried
// in the visualization projection).

import type { KnowledgeSpace } from './types';
import type { KnowledgeStateEntry } from './mastery-state';
import { MASTERY_THRESHOLDS_DEFAULT } from './mastery-state';

/**
 * A single outer-fringe entry (kst-srs.v2 §4).
 *
 * - `nodeId` — the fringe candidate.
 * - `readiness` — optional composite readiness score in [0, 1] (computed by
 *   the supplied `readinessFn`; binary gating uses `0` / `1`).
 * - `readinessState` — coarse label (`ready` | `nearly_ready` | `blocked`)
 *   derived from `readiness` against `MasteryThresholds`.
 */
export interface FringeEntry {
  nodeId: string;
  readiness?: number;
  readinessState?: 'ready' | 'nearly_ready' | 'blocked';
}

/**
 * Optional readiness seam. Returns a composite readiness score in [0, 1] for
 * the given node, given the current learner state. Track 2 (Weighted
 * Readiness) plugs a weighted-prerequisite implementation into this seam.
 */
export type ReadinessFn = (
  nodeId: string,
  state: Map<string, KnowledgeStateEntry>,
) => number;

/**
 * Get the outer fringe: nodes that are not yet mastered whose prerequisites
 * are satisfied (binary gating by default, weighted via optional `readinessFn`).
 *
 * Standalone exported function (FR3).
 *
 * @param state - Current knowledge state (per-node entries)
 * @param graph - Knowledge space graph
 * @param readinessFn - Optional custom readiness function (default: binary prerequisite check)
 * @returns FringeEntry[] — candidate nodes for the planner
 */
export function getOuterFringe(
  state: Map<string, KnowledgeStateEntry>,
  graph: KnowledgeSpace,
  readinessFn?: ReadinessFn,
): FringeEntry[] {
  const thresholds = MASTERY_THRESHOLDS_DEFAULT;

  // Index prerequisite edges by target node
  const prereqsByTarget = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (edge.type === 'prerequisite_for') {
      const list = prereqsByTarget.get(edge.targetId) ?? [];
      list.push(edge.sourceId);
      prereqsByTarget.set(edge.targetId, list);
    }
  }

  const result: FringeEntry[] = [];

  for (const node of graph.nodes) {
    const entry = state.get(node.id);

    // Already mastered → exclude from fringe
    if (entry && entry.state === 'mastered') continue;

    if (readinessFn) {
      // Delegate to the custom readiness function
      const readinessScore = readinessFn(node.id, state);

      // Coarse label from threshold band
      const readinessState: FringeEntry['readinessState'] =
        readinessScore >= thresholds.readyThreshold
          ? 'ready'
          : readinessScore >= thresholds.nearThreshold
            ? 'nearly_ready'
            : 'blocked';

      result.push({
        nodeId: node.id,
        readiness: readinessScore,
        readinessState,
      });
    } else {
      // Binary prerequisite gating: all prereqs must be mastered
      const prereqIds = prereqsByTarget.get(node.id) ?? [];

      const allPrereqsMastered = prereqIds.length === 0 ||
        prereqIds.every((pid) => {
          const p = state.get(pid);
          return p != null && p.state === 'mastered';
        });

      if (allPrereqsMastered) {
        result.push({
          nodeId: node.id,
          readiness: prereqIds.length === 0 ? 1 : undefined,
          readinessState: 'ready',
        });
      }
    }
  }

  return result;
}
