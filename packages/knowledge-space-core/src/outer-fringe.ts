// Outer fringe — Phase 1 signature stub (kst-srs.v2 §4).
//
// Standalone exported function (FR3 — not buried in the visualization
// projection). Phase 2 implements weighted readiness and binary prerequisite
// gating; Phase 1 owns the signature and the `readinessFn` seam so Track 2
// can swap in weighted readiness without a contract change.

import type { KnowledgeSpace } from './types';
import type { KnowledgeStateEntry } from './mastery-state';

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
 * Outer-fringe signature (kst-srs.v2 §4.2).
 *
 * Returns `[]` in Phase 1; the binary prerequisite gating and weighted
 * readiness logic are filled in by Phase 2 (see plan §2 — Task
 * "Implement getOuterFringe"). The standalone top-level export is a
 * deliberate FR3 requirement — visualization projections consume this
 * function but never re-implement it.
 */
export function getOuterFringe(
  _state: Map<string, KnowledgeStateEntry>,
  _graph: KnowledgeSpace,
  _readinessFn?: ReadinessFn,
): FringeEntry[] {
  // Phase 2 implements fringe membership: nodes where every prerequisite
  // is satisfied (binary v1, weighted v2) and `state !== 'mastered'`.
  return [];
}