/**
 * Phase 3 Red — Deterministic sticky A/B assignment primitive (Task 1 of Phase 3).
 *
 * Asserts FR3 assignment behavior per test-strategy §6 Phase 3:
 *   "Assignment primitive is `assign({ studentId, experimentId, variants, hash }) => variantId`.
 *    Test determinism (same input → same output across 10k iterations), distribution
 *    (chi-square *only* on a fixed seed range, not flaky percentages), stickiness
 *    (registry mutation does not reassign existing students)."
 *
 * Hash injection (test-strategy §3 item 5) — tests pin a local FNV-1a hash; the
 * production wiring (sha256 of `studentId|experimentId`) is owned by the Green
 * closeout's "command-construction" test (test-strategy §9), not here.
 *
 * Imports `../../src/experiment/assign` which does not yet exist at HEAD —
 * Red command must fail with ERR_MODULE_NOT_FOUND for at least the import
 * line, then surface the missing-impl state on every assertion.
 */

import { describe, it, expect } from 'vitest';

import { assign, type AssignVariant } from '../../src/experiment/assign';

// ── Local FNV-1a 32-bit hash (test-only) ──────────────────────────────
// Deterministic, pure, no Math.random. Maps an arbitrary string to [0, 1).
function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

// ── Two-variant A/B fixture ───────────────────────────────────────────
const A_B_VARIANTS: AssignVariant[] = [
  { id: 'control', weight: 1 },
  { id: 'treatment', weight: 1 },
];

// ── Three-variant 50/30/20 fixture (fixed ratios for chi-square) ──────
const THREE_VARIANTS: AssignVariant[] = [
  { id: 'a', weight: 5 },
  { id: 'b', weight: 3 },
  { id: 'c', weight: 2 },
];

describe('assign (Phase 3 Red — Task 1)', () => {
  it('returns the same variantId for the same (studentId, experimentId) across 10k iterations', () => {
    const first = assign({
      studentId: 'stu_42',
      experimentId: 'exp_kst_v2',
      variants: A_B_VARIANTS,
      hash: fnv1a,
    });
    for (let i = 0; i < 10_000; i++) {
      const result = assign({
        studentId: 'stu_42',
        experimentId: 'exp_kst_v2',
        variants: A_B_VARIANTS,
        hash: fnv1a,
      });
      expect(result).toBe(first);
    }
  });

  it('hashes BOTH studentId AND experimentId (different experimentId → may give different variant)', () => {
    const studentA = 'stu_alpha';
    const exp1 = assign({ studentId: studentA, experimentId: 'exp_1', variants: A_B_VARIANTS, hash: fnv1a });
    const exp2 = assign({ studentId: studentA, experimentId: 'exp_2', variants: A_B_VARIANTS, hash: fnv1a });
    // Hash must be experiment-specific, not just student-specific. We assert
    // the function is sensitive to experimentId by checking that the underlying
    // hash outputs differ for the two strings.
    expect(fnv1a(`${studentA}|exp_1`)).not.toBe(fnv1a(`${studentA}|exp_2`));
    // The variant assignment *may* coincidentally match for some students, but
    // it must not be the case that the assignment is invariant to experimentId
    // for every student. Scan 20 students to prove the assignments can diverge.
    let diverged = false;
    for (let i = 0; i < 20; i++) {
      const sid = `stu_${i.toString().padStart(2, '0')}`;
      const a = assign({ studentId: sid, experimentId: 'exp_1', variants: A_B_VARIANTS, hash: fnv1a });
      const b = assign({ studentId: sid, experimentId: 'exp_2', variants: A_B_VARIANTS, hash: fnv1a });
      if (a !== b) { diverged = true; break; }
    }
    expect(diverged).toBe(true);
    // Reference the two to silence unused-var warnings; the assignment of
    // studentA above is the contract pin.
    expect([exp1, exp2].length).toBe(2);
  });

  it('returns one of the declared variant ids (never an unknown id)', () => {
    const variantIds = new Set(A_B_VARIANTS.map((v) => v.id));
    for (let i = 0; i < 50; i++) {
      const result = assign({
        studentId: `stu_${i}`,
        experimentId: 'exp_xyz',
        variants: A_B_VARIANTS,
        hash: fnv1a,
      });
      expect(variantIds.has(result)).toBe(true);
    }
  });

  it('returns the only variant for a single-variant experiment (deterministic, no choice)', () => {
    const only: AssignVariant[] = [{ id: 'only', weight: 1 }];
    for (let i = 0; i < 20; i++) {
      const result = assign({
        studentId: `stu_${i}`,
        experimentId: 'exp_single',
        variants: only,
        hash: fnv1a,
      });
      expect(result).toBe('only');
    }
  });

  it('throws when given an empty variants list (no experiment can have zero variants)', () => {
    expect(() =>
      assign({
        studentId: 'stu_1',
        experimentId: 'exp_empty',
        variants: [],
        hash: fnv1a,
      }),
    ).toThrow();
  });

  it('throws when any variant weight is non-positive', () => {
    expect(() =>
      assign({
        studentId: 'stu_1',
        experimentId: 'exp_bad',
        variants: [
          { id: 'a', weight: 1 },
          { id: 'b', weight: 0 },
        ],
        hash: fnv1a,
      }),
    ).toThrow();
  });

  // ── Live-behavior distribution test (chi-square on a fixed seed range) ──
  // Critical value for df=1, alpha=0.05: 3.841. We assert the observed
  // chi-square statistic stays below this threshold for 1000 students on
  // a 50/50 split. This is a live-behavior test (real assignment, not a
  // percentage) and must use a fixed seed range (no Math.random) per
  // test-strategy §6 Phase 3 + §7.
  it('distributes a 50/50 A/B split within the chi-square critical value (df=1, alpha=0.05) over 1000 students', () => {
    const counts: Record<string, number> = { control: 0, treatment: 0 };
    const N = 1000;
    for (let i = 0; i < N; i++) {
      const sid = `stu_${i.toString().padStart(4, '0')}`;
      const v = assign({
        studentId: sid,
        experimentId: 'exp_dist_5050',
        variants: A_B_VARIANTS,
        hash: fnv1a,
      });
      counts[v] = (counts[v] ?? 0) + 1;
    }
    const expected = N / 2;
    const chiSquare = A_B_VARIANTS.reduce((acc, v) => {
      const observed = counts[v.id] ?? 0;
      return acc + ((observed - expected) ** 2) / expected;
    }, 0);
    // 3.841 = chi-square critical value df=1, alpha=0.05.
    // If the assignment is well-distributed, observed chi-square < 3.841.
    expect(chiSquare).toBeLessThan(3.841);
  });

  it('distributes a 5/3/2 weighted split within the chi-square critical value (df=2, alpha=0.05) over 3000 students', () => {
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    const N = 3000;
    const totalWeight = THREE_VARIANTS.reduce((a, v) => a + v.weight, 0);
    for (let i = 0; i < N; i++) {
      const sid = `stu_${i.toString().padStart(4, '0')}`;
      const v = assign({
        studentId: sid,
        experimentId: 'exp_dist_532',
        variants: THREE_VARIANTS,
        hash: fnv1a,
      });
      counts[v] = (counts[v] ?? 0) + 1;
    }
    // 5.991 = chi-square critical value df=2, alpha=0.05.
    const chiSquare = THREE_VARIANTS.reduce((acc, v) => {
      const observed = counts[v.id] ?? 0;
      const expected = (N * v.weight) / totalWeight;
      return acc + ((observed - expected) ** 2) / expected;
    }, 0);
    expect(chiSquare).toBeLessThan(5.991);
  });
});
