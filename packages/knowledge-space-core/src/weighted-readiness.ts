// Weighted readiness — Phase 2 implementation (kst-srs.v2 §5).
//
// Pure, deterministic computation of prerequisite-weighted readiness.
// Domain-neutral: no app, convex, or curriculum imports.

import type { KnowledgeSpace } from './types';
import type {
  KnowledgeStateEntry,
  MasteryConfig,
  ReadinessState,
} from './mastery-state';
import { normalizeMasteryConfig } from './mastery-state';

/**
 * Result of a weighted readiness computation.
 */
export interface ReadinessResult {
  /** Gated weighted readiness score in [0, 1] (kst-srs.v3.2 §2.5). */
  score: number;
  /** Three-way readiness state (kst-srs.v2 §5.2). */
  state: ReadinessState;
}

/**
 * Compute the weighted readiness score for a node given the current knowledge
 * state and the prerequisite structure.
 *
 * Formula (kst-srs.v3.2 §2.5):
 *   readiness(B) = gate(B) × comp(B)
 *
 * `gate` is the minimum mastery across hard prerequisites and `comp` is the
 * weighted mastery average across soft prerequisites. An absent group is a
 * neutral factor of 1. This preserves the v2 weighted-average result for
 * graphs with no hard-gate edges.
 *
 * @param nodeId - The target node whose readiness is being computed
 * @param state - Current knowledge state (per-node entries)
 * @param graph - Knowledge space graph with typed edges
 * @param config - Optional per-call override of the v3 engine configuration
 * @returns ReadinessResult with score and state label
 */
export function computeWeightedReadiness(
  nodeId: string,
  state: ReadonlyMap<string, KnowledgeStateEntry>,
  graph: KnowledgeSpace,
  config?: Partial<MasteryConfig>,
): ReadinessResult {
  const normalizedConfig = normalizeMasteryConfig(config);

  // Filter prerequisite edges targeting this node
  const prereqEdges = graph.edges.filter(
    (e) => e.type === 'prerequisite_for' && e.targetId === nodeId,
  );

  // No prerequisites → full readiness
  if (prereqEdges.length === 0) {
    return { score: 1, state: 'ready' };
  }

  const hardPrerequisites = prereqEdges.filter(
    (edge) => edge.weight >= normalizedConfig.hardGateThreshold,
  );
  const softPrerequisites = prereqEdges.filter(
    (edge) => edge.weight < normalizedConfig.hardGateThreshold,
  );

  const gate = hardPrerequisites.length === 0
    ? 1
    : Math.min(
        ...hardPrerequisites.map((edge) => state.get(edge.sourceId)?.mastery ?? 0),
      );

  const totalSoftWeight = softPrerequisites.reduce(
    (sum, edge) => sum + edge.weight,
    0,
  );
  const comp = totalSoftWeight === 0
    ? 1
    : softPrerequisites.reduce(
        (sum, edge) => sum + edge.weight * (state.get(edge.sourceId)?.mastery ?? 0),
        0,
      ) / totalSoftWeight;

  const score = gate * comp;

  // Map to readiness state band (kst-srs.v2 §5.2)
  let s: ReadinessState;
  if (score >= normalizedConfig.readyThreshold) {
    s = 'ready';
  } else if (score >= normalizedConfig.nearThreshold) {
    s = 'nearly_ready';
  } else {
    s = 'blocked';
  }

  return { score, state: s };
}

/**
 * Default weighted readiness function conforming to the `ReadinessFn` seam
 * contract (outer-fringe.ts). Wraps `computeWeightedReadiness` into a
 * `(nodeId, state) => number` signature.
 *
 * The graph context is captured via closure — callers must create a bound
 * instance by closing over a `KnowledgeSpace` reference.
 *
 * @param graph - Knowledge space graph to use for prerequisite lookups
 * @returns A `ReadinessFn`-compatible function
 */
export function createDefaultWeightedReadinessFn(
  graph: KnowledgeSpace,
  config?: Partial<MasteryConfig>,
): (nodeId: string, state: Map<string, KnowledgeStateEntry>) => number {
  return (nodeId: string, state: Map<string, KnowledgeStateEntry>): number => {
    return computeWeightedReadiness(nodeId, state, graph, config).score;
  };
}
