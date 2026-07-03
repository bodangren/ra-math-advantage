// SRS → KST bridge contract — Phase 1 interface only (kst-srs.v2 §5 + §3).
//
// Phase 1 owns the structural types and the `SrsToKstBridge` interface; the
// concrete implementation lands in Phase 3 (see plan §3). The structural
// type for `ObjectiveProficiencyResult` is **re-declared locally** to keep
// `knowledge-space-core` dependency-free — see test-strategy §1.4 risk #3.
// A Phase 3 round-trip test guards against drift.
//
// Domain-neutral boundary: no app, convex, curriculum, or srs-engine imports.

// ---------------------------------------------------------------------------
// Structural SRS types — re-declared to avoid a runtime dependency on
// packages/srs-engine. Compatible with `ObjectiveProficiencyResult` from
// packages/srs-engine/src/srs/objective-proficiency.ts. A drift-detection
// test is owned by Phase 3.
// ---------------------------------------------------------------------------

/**
 * Structural mirror of `ObjectiveProficiencyResult` from
 * `packages/srs-engine/src/srs/objective-proficiency.ts`. Kept narrow on
 * purpose — Phase 1 only needs the fields the bridge forwards.
 */
export interface ObjectiveProficiencyResult {
  objectiveId: string;
  /** Per-objective retention in [0, 1]. */
  retentionStrength: number;
  /** Per-objective practice coverage in [0, 1]. */
  practiceCoverage: number;
  /** Whether proficiency evidence meets the objective's policy. */
  isProficient: boolean;
}

/**
 * Structural mirror of an SRS card state. The shape matches the minimum
 * the v2 bridge needs; richer card fields (due-date, review count, etc.)
 * are forwarded as opaque metadata by Phase 3.
 */
export interface SrsCardState {
  cardId: string;
  objectiveId: string;
  /** Optional FSRS-style stability in days. */
  stability?: number;
  /** Optional raw review state. */
  state?: 'new' | 'learning' | 'review' | 'relearning';
}

// ---------------------------------------------------------------------------
// Bridge input/output
// ---------------------------------------------------------------------------

/**
 * Input to the SRS → KST bridge (kst-srs.v2 §5).
 */
export interface SrsBridgeInput {
  /** Per-card SRS state. */
  cards: readonly SrsCardState[];
  /** Per-objective proficiency results (structural mirror of srs-engine output). */
  proficiencyResults: readonly ObjectiveProficiencyResult[];
}

/**
 * Output of the SRS → KST bridge — the learner-state envelope consumed by
 * `getKnowledgeState`. The `evidence` field is the cross-module contract
 * seam (see srs-bridge-contract.test.ts).
 */
export interface LearnerStateOutput {
  /**
   * Evidence records consumable by `getKnowledgeState`'s `evidence`
   * parameter. The types are structurally compatible by construction
   * (Phase 3 adds the round-trip drift test).
   */
  evidence: ReadonlyArray<{
    sourceId: string;
    observedAt?: number;
    mastery?: number;
    retention?: number;
    isProficient?: boolean;
  }>;
  /** Optional reference timestamp emitted by the bridge. */
  generatedAt?: number;
}

// ---------------------------------------------------------------------------
// Bridge interface — Phase 1 contract only, no concrete implementation
// ---------------------------------------------------------------------------

/**
 * The SRS → KST bridge contract (kst-srs.v2 §5). Concrete implementations
 * are added in Phase 3. Phase 1 exports the **interface only** (no concrete
 * `buildLearnerState` value) — the srs-bridge-contract.test.ts guards
 * against accidental Phase 1 implementation drift.
 */
export interface SrsToKstBridge {
  /**
   * Build a `LearnerStateOutput` from SRS card states and objective
   * proficiency results.
   *
   * @param input - Combined SRS card states + objective proficiency
   * @param now - Reference timestamp (epoch ms) injected by the caller
   */
  buildLearnerState(input: SrsBridgeInput, now: number): LearnerStateOutput;
}