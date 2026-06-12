// Phase 1 (Track 8 kst-lesser-holes_20260521) — Task 1.2 contract Red tests.
//
// kst-srs.v2 §11.2 (Level Projection): "Domain-supplied monotonic function from
// knowledge state → display level. Presentation-only; never feeds KST/SRS
// computation."
//
// kst-srs.v2 §11.3 (progressTrend Fix): "Replace static mastered-ratio with real
// time-delta of mastered-count over a window. `unknown` produced on insufficient
// history."
//
// Phase 1 deliverable is the TYPE contract: the Green phase must export
//   - `LevelProjectionFn` (signature: knowledge-state → display-level) and its
//     Zod schemas (knowledgeStateSchema, displayLevelSchema) from
//     `../level-projection`.
//   - `MasterySnapshot` and `progressTrendHistorySchema` from `../progress-trend`.
//
// Phase 2 (level-projection.test.ts) and Phase 3 (progress-trend.test.ts) will
// exercise the behavior. Phase 1 only locks the contract surface so later phases
// can build on stable types.
//
// Red signal: each test below fails because the contract modules do not yet
// exist (import-time failure surfaces as a vitest file-load error in the runner).

import { describe, it, expect } from 'vitest';

import {
  knowledgeStateSchema,
  displayLevelSchema,
  type LevelProjectionFn,
} from '../level-projection';

import {
  masterySnapshotSchema,
  progressTrendHistorySchema,
} from '../progress-trend';

// ---------------------------------------------------------------------------
// 1. Level Projection type contract
// ---------------------------------------------------------------------------

describe('Level Projection — type contract (kst-srs.v2 §11.2)', () => {
  it('exports knowledgeStateSchema accepting a state with skill entries', () => {
    const result = knowledgeStateSchema.safeParse({
      skills: [
        { nodeId: 'math.im3.skill.alpha', mastery: 0.85 },
        { nodeId: 'math.im3.skill.beta', mastery: 0.4 },
      ],
    });
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true);
  });

  it('exports displayLevelSchema accepting an array of level descriptors', () => {
    const result = displayLevelSchema.safeParse([
      { id: 'L1', title: 'Level 1', minMastery: 0 },
      { id: 'L2', title: 'Level 2', minMastery: 0.5 },
      { id: 'L3', title: 'Level 3', minMastery: 0.9 },
    ]);
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true);
  });

  it('LevelProjectionFn signature: knowledge-state → display-level id', () => {
    // This test is type-only: the function body assigns the correct return type
    // and the type system will reject a malformed signature. The runtime assertion
    // locks the contract for downstream phases.
    const fn: LevelProjectionFn = (state) => {
      // simple monotonic implementation: average mastery → index
      const avg = state.skills.reduce((s, e) => s + e.mastery, 0) / state.skills.length;
      if (avg >= 0.9) return 'L3';
      if (avg >= 0.5) return 'L2';
      return 'L1';
    };
    const out = fn({
      skills: [
        { nodeId: 'math.im3.skill.alpha', mastery: 0.95 },
      ],
    });
    expect(out).toBe('L3');
  });
});

// ---------------------------------------------------------------------------
// 2. progressTrend history type contract
// ---------------------------------------------------------------------------

describe('progressTrend — history type contract (kst-srs.v2 §11.3)', () => {
  it('exports masterySnapshotSchema accepting a timestamp + masteredNodeIds pair', () => {
    const result = masterySnapshotSchema.safeParse({
      timestamp: 1_700_000_000_000,
      masteredNodeIds: ['math.im3.skill.alpha', 'math.im3.skill.beta'],
    });
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true);
  });

  it('exports progressTrendHistorySchema accepting an array of mastery snapshots', () => {
    const result = progressTrendHistorySchema.safeParse([
      { timestamp: 1_700_000_000_000, masteredNodeIds: ['math.im3.skill.alpha'] },
      { timestamp: 1_700_000_500_000, masteredNodeIds: ['math.im3.skill.alpha', 'math.im3.skill.beta'] },
    ]);
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true);
  });
});
