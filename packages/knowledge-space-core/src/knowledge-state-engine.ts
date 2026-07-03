// Knowledge state engine — Phase 1 signature stub (kst-srs.v2 §3.5).
//
// Phase 1 owns the function **signature only**. The hysteresis enter/exit
// algorithm (§3.3), retention decay (§3.3), and misconception-lifecycle
// pinning (§3.7) are Phase 2/3 work. This module exists so that downstream
// modules (the bridge, the outer-fringe, the production wiring) can be
// compile-time anchored against a single shared contract.
//
// Domain-neutral boundary: no app, convex, curriculum, or srs-engine imports.

import type { KnowledgeSpace } from './types';
import type {
  KnowledgeStateEntry,
  MasteryThresholds,
} from './mastery-state';

/**
 * Minimal student shape consumed by the engine. The structural `{ id: string }`
 * requirement lets callers pass either a domain-specific `StudentId` or a
 * richer student envelope — see kst-srs.v2 §3.5.
 */
export interface KnowledgeStateStudentRef {
  id: string;
}

/**
 * Generic evidence record. Phase 1 keeps the shape minimal; richer
 * evidence types (proficiency results, SRS card states) are introduced
 * via the SRS bridge in Phase 3.
 */
export type KnowledgeStateEvidence = {
  /** Source identifier (objective id, card id, or external probe id). */
  sourceId: string;
  /** Optional observation timestamp (epoch ms). */
  observedAt?: number;
  /** Optional mastery contribution in [0, 1]. */
  mastery?: number;
  /** Optional retention contribution in [0, 1]. */
  retention?: number;
  /** Optional proficiency flag. */
  isProficient?: boolean;
};

/**
 * Time-aware signature for the v2 knowledge-state engine (kst-srs.v2 §3.5).
 *
 * Returns an empty `Map<NodeId, KnowledgeStateEntry>` in Phase 1; the
 * hysteresis algorithm is filled in by Phase 2 (see plan §2 — Task
 * "Implement getKnowledgeState with hysteresis"). Returning a `Map` (rather
 * than throwing) keeps the contract test as a true positive signal —
 * test-strategy §1.4.
 *
 * @param student - Student reference (structural `{ id: string }`)
 * @param evidence - Read-only evidence list (typed as `readonly` to keep callers honest)
 * @param graph - Knowledge space graph
 * @param now - Reference timestamp (epoch ms) — injected for determinism, never `Date.now()`
 * @param thresholds - Optional per-call override of mastery thresholds
 */
export function getKnowledgeState(
  _student: KnowledgeStateStudentRef,
  _evidence: readonly KnowledgeStateEvidence[],
  _graph: KnowledgeSpace,
  _now: number,
  _thresholds?: Partial<MasteryThresholds>,
): Map<string, KnowledgeStateEntry> {
  // Phase 2 implements hysteresis enter/exit, retention decay, and
  // misconception lifecycle pinning per kst-srs.v2 §3.2/§3.3/§3.7.
  return new Map<string, KnowledgeStateEntry>();
}