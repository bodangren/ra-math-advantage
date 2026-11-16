// Outer fringe — Phase 2 implementation (kst-srs.v2 §4).
//
// Implements weighted readiness as the default prerequisite gating strategy
// with the readinessFn seam for custom overrides. Standalone exported
// function (FR3 — not buried in the visualization projection).

import type { KnowledgeSpace } from './types';
import type {
  KnowledgeStateEntry,
  MasteryConfig,
  ReadinessState,
} from './mastery-state';
import { normalizeMasteryConfig } from './mastery-state';
import { computeWeightedReadiness } from './weighted-readiness';

/**
 * A single outer-fringe entry (kst-srs.v2 §4).
 *
 * - `nodeId` — the fringe candidate.
 * - `readiness` — composite readiness score in [0, 1].
 * - `readinessState` — three-way label derived from `readiness`
 *   against `MasteryThresholds`.
 */
export interface FringeEntry {
  nodeId: string;
  readiness?: number;
  readinessState?: ReadinessState;
}

/** A required-shape entry in the versioned kst-srs.v3.2 fringe result. */
export interface FringeEntryV3 {
  nodeId: string;
  readiness: number;
}

/** The two readiness buckets defined by kst-srs.v3.2 §2.6. */
export interface OuterFringeV3 {
  ready: FringeEntryV3[];
  nearly_ready: FringeEntryV3[];
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
 * are sufficiently satisfied (weighted readiness by default, custom via
 * optional `readinessFn`).
 *
 * **Default behavior (no readinessFn):** Uses `computeWeightedReadiness`.
 * Fringe = ready ∪ nearly_ready (blocked nodes are excluded). Each entry
 * carries its readiness score and state label.
 *
 * **Custom readinessFn:** All non-mastered nodes are included regardless
 * of readiness score. Readiness state is derived from the score against
 * `MasteryThresholds`.
 *
 * Standalone exported function (FR3).
 *
 * @param state - Current knowledge state (per-node entries)
 * @param graph - Knowledge space graph
 * @param readinessFn - Optional custom readiness function (default: weighted readiness)
 * @returns FringeEntry[] — candidate nodes for the planner
 */
export function getOuterFringe(
  state: Map<string, KnowledgeStateEntry>,
  graph: KnowledgeSpace,
  readinessFn?: ReadinessFn,
  config?: Partial<MasteryConfig>,
): FringeEntry[] {
  const normalizedConfig = normalizeMasteryConfig(config);

  const result: FringeEntry[] = [];

  for (const node of graph.nodes) {
    const entry = state.get(node.id);

    // Already mastered → exclude from fringe
    if (entry && entry.state === 'mastered') continue;

    if (readinessFn) {
      // Custom readiness function: include ALL non-mastered nodes
      const readinessScore = readinessFn(node.id, state);

      // Coarse label from threshold band
      const readinessState: FringeEntry['readinessState'] =
        readinessScore >= normalizedConfig.readyThreshold
          ? 'ready'
          : readinessScore >= normalizedConfig.nearThreshold
            ? 'nearly_ready'
            : 'blocked';

      result.push({
        nodeId: node.id,
        readiness: readinessScore,
        readinessState,
      });
    } else {
      // Default: weighted readiness. Only include ready ∪ nearly_ready.
      const { score, state: readinessState } =
        computeWeightedReadiness(node.id, state, graph, normalizedConfig);

      if (readinessState === 'blocked') continue;

      result.push({
        nodeId: node.id,
        readiness: score,
        readinessState,
      });
    }
  }

  return result;
}

/**
 * Compute the versioned kst-srs.v3.2 outer fringe.
 *
 * Only skill nodes participate. Mastered and blocked skills are excluded,
 * and the remaining candidates are partitioned into required-shape `ready`
 * and `nearly_ready` buckets. `getOuterFringe` remains the flat v2-compatible
 * surface for existing consumers.
 */
export function getOuterFringeV3(
  state: Map<string, KnowledgeStateEntry>,
  graph: KnowledgeSpace,
  config?: Partial<MasteryConfig>,
  readinessFn?: ReadinessFn,
): OuterFringeV3 {
  const normalizedConfig = normalizeMasteryConfig(config);
  const result: OuterFringeV3 = { ready: [], nearly_ready: [] };

  for (const node of graph.nodes) {
    if (node.kind !== 'skill' || state.get(node.id)?.state === 'mastered') {
      continue;
    }

    const readiness = readinessFn
      ? readinessFn(node.id, state)
      : computeWeightedReadiness(node.id, state, graph, normalizedConfig).score;

    if (readiness >= normalizedConfig.readyThreshold) {
      result.ready.push({ nodeId: node.id, readiness });
    } else if (readiness >= normalizedConfig.nearThreshold) {
      result.nearly_ready.push({ nodeId: node.id, readiness });
    }
  }

  return result;
}
