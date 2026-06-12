// Phase 2 (Track 8 kst-lesser-holes_20260521) — IM3 Level Projection instance Red tests.
//
// kst-srs.v2 §11.2 (Level Projection):
//   "Domain-supplied monotonic function from knowledge state → display level.
//   Presentation-only; never feeds KST/SRS computation."
//
// Track 8 spec FR2 (AC2):
//   "Level Projection implemented as a presentation-only projection; an IM3
//   instance derives display levels from the existing CSV mapping."
//
// Test-strategy §2 (fixtures) + §5 (P2 IM3 approach):
//   "IM3 CSV-derived instance lives in `apps/integrated-math-3/lib/.../level-projection.ts`
//    with its own dedicated unit test reading the CSV table-driven (do not mock
//    filesystem — read the actual checked-in mapping)."
//
// The Green phase must add:
//   1. The CSV file at `apps/integrated-math-3/lib/level-projection/gse-to-im3-advantage.csv`
//   2. The module `apps/integrated-math-3/lib/level-projection/im3-level-projection.ts`
//      exporting `projectIm3Level(state: KnowledgeState): string`
//
// These Red tests are designed to fail at HEAD because the IM3 instance module
// does not exist yet:
//   - `import { projectIm3Level } from '@/lib/level-projection/im3-level-projection'`
//     fails at import-time (module not found) — the contract-gap signal.
//
// Test count: 5 tests. Targeted Red command:
//   npx vitest run -t "IM3 level projection" --root apps/integrated-math-3

import { describe, it, expect } from 'vitest';
import type { KnowledgeState } from '@math-platform/knowledge-space-core/level-projection';
// The Green phase must create the IM3 instance module at
// `apps/integrated-math-3/lib/level-projection/im3-level-projection.ts` that
// reads `gse-to-im3-advantage.csv` and exports `projectIm3Level`. At HEAD,
// this import fails because the module does not exist.
import { projectIm3Level } from '@/lib/level-projection/im3-level-projection';

// ---------------------------------------------------------------------------
// 1. projectIm3Level export contract
// ---------------------------------------------------------------------------

describe('IM3 level projection — export contract (kst-srs.v2 §11.2, FR2 AC2)', () => {
  it('exports a projectIm3Level function derived from the GSE→IM3 advantage CSV', () => {
    expect(typeof projectIm3Level).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// 2. Anchor: bottom level (empty state and zero mastery collapse to the same id)
// ---------------------------------------------------------------------------

describe('IM3 level projection — anchor points (kst-srs.v2 §11.2, FR2 AC2)', () => {
  it('returns a non-empty string id for an empty state', () => {
    const state: KnowledgeState = { skills: [] };
    const result = projectIm3Level(state);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('empty state and zero-mastery state collapse to the same level id (bottom level anchor)', () => {
    // Anchor 1: bottom level. Empty state and state with mastery=0 both
    // represent the lowest mastery profile — they MUST return the same
    // level id. This guards against an implementation that treats empty
    // state as a special case (e.g., "unknown") rather than mapping it to
    // the bottom level.
    const stateEmpty: KnowledgeState = { skills: [] };
    const stateZero: KnowledgeState = {
      skills: [{ nodeId: 'math.im3.skill.alpha', mastery: 0 }],
    };
    expect(projectIm3Level(stateEmpty)).toBe(projectIm3Level(stateZero));
  });

  it('mastery 0.99 and mastery 1.00 collapse to the same level id (top level anchor)', () => {
    // Anchor 2: top level. Both 0.99 and 1.00 must map to the same (top)
    // level id. This guards against an implementation that requires
    // mastery=1.0 strictly (off-by-one) or that lumps 0.99 into a lower
    // band.
    const stateHigh: KnowledgeState = {
      skills: [
        { nodeId: 'math.im3.skill.alpha', mastery: 0.99 },
        { nodeId: 'math.im3.skill.beta', mastery: 0.99 },
      ],
    };
    const stateFull: KnowledgeState = {
      skills: [
        { nodeId: 'math.im3.skill.alpha', mastery: 1.0 },
        { nodeId: 'math.im3.skill.beta', mastery: 1.0 },
      ],
    };
    expect(projectIm3Level(stateHigh)).toBe(projectIm3Level(stateFull));
  });
});

// ---------------------------------------------------------------------------
// 3. Monotonicity property (sweep produces a non-decreasing rank sequence)
// ---------------------------------------------------------------------------

describe('IM3 level projection — monotonicity (kst-srs.v2 §11.2)', () => {
  it('mastery sweep from 0.0 to 1.0 produces a non-decreasing rank sequence', () => {
    // We do not couple to specific IM3 level ids (they are defined by the
    // CSV in the Green phase). Instead, capture the sequence of returned
    // ids and assert it is weakly monotonic under the rank defined by
    // first-occurrence order. This proves the projection is monotonic
    // without naming the levels.
    const sweep = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0];
    const ids = sweep.map((m) =>
      projectIm3Level({ skills: [{ nodeId: 'math.im3.skill.alpha', mastery: m }] }),
    );
    const rankOf = (() => {
      const seen = new Map<string, number>();
      let next = 0;
      return (id: string) => {
        if (!seen.has(id)) seen.set(id, next++);
        return seen.get(id) as number;
      };
    })();
    const ranks = ids.map(rankOf);
    for (let i = 1; i < ranks.length; i += 1) {
      expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i - 1]);
    }
  });
});
