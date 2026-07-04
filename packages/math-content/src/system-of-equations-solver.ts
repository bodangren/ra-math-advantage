/**
 * System of Linear Equations Problem Generator
 *
 * Backward-construction strategy (T17 spec §2 / §4 test-strategy):
 *   1. Pick integer solution `(x, y)` with `x, y ∈ [-6, 6]`.
 *   2. Pick non-zero integer coefficients `a1, b1, a2 ∈ [-5, 5] \ {0}`.
 *   3. Pick an initial `b2 ∈ [-5, 5] \ {0}` and ensure the system is
 *      non-degenerate by adjusting `b2` if the determinant
 *      `a1*b2 - a2*b1` happens to be zero (single retry, no PRNG re-roll).
 *   4. Compute the right-hand sides `c1 = a1*x + b1*y` and
 *      `c2 = a2*x + b2*y` so the identity is guaranteed by construction.
 *   5. Render the LHS as `formatLinearXY(a, b, 'x', 'y')` so the display
 *      avoids `1x`, `-1x`, `1y`, `-1y`, `+ -`, and leading `+`.
 *
 * Determinism: same seed → identical output.
 *
 * Single-pass generation: exactly one call to `mulberry32` per
 * `generateSystemOfEquations({ seed })` invocation (FR-8). The
 * determinant-guard retry only swaps the initial `b2` candidate for a
 * deterministic offset; it does not draw additional PRNG values.
 */

import { mulberry32 } from './utils/prng';
import { formatLinearTerm } from './utils/expression-builder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SystemOfEquationsProblem {
  /** Pair of formatted equation strings, e.g. `["3x + 2y = 14", "5x - y = 1"]`. */
  equations: [string, string];
  /** Unique integer solution. */
  answer: { x: number; y: number };
  /** Coefficient on x in equation 1. */
  a1: number;
  /** Coefficient on y in equation 1. */
  b1: number;
  /** Computed RHS for equation 1 so `a1*x + b1*y === c1`. */
  c1: number;
  /** Coefficient on x in equation 2. */
  a2: number;
  /** Coefficient on y in equation 2. */
  b2: number;
  /** Computed RHS for equation 2 so `a2*x + b2*y === c2`. */
  c2: number;
  /**
   * Family identifier for the step-by-step-solver fallback UI. Per
   * test-strategy §4, this is `'step-by-step-solver:system-of-equations'`.
   */
  familyId: 'step-by-step-solver:system-of-equations';
  /** Step-by-step solution breakdown. */
  steps: string[];
}

// ---------------------------------------------------------------------------
// Helpers (local — kept private to this module)
// ---------------------------------------------------------------------------

/** Pick an integer in [lo, hi] (inclusive) via a single PRNG draw. */
function randInt(rand: () => number, lo: number, hi: number): number {
  return Math.floor(rand() * (hi - lo + 1)) + lo;
}

/** Pick a non-zero integer in [−hi, −1] ∪ [1, hi]. */
function randNonZero(rand: () => number, hi: number): number {
  let n: number;
  do {
    n = randInt(rand, -hi, hi);
  } while (n === 0);
  return n;
}

/**
 * Format a two-variable linear term `a*x + b*y` with the same 1/-1 collapse
 * rules as `formatLinearTerm`. Avoids `1x`, `-1x`, `1y`, `-1y`, `+ -`, and
 * leading `+`. If both coefficients are 0 the output is `"0"` (a degenerate
 * case the generator never produces because coefficients are non-zero).
 */
function formatLinearXY(
  aX: number,
  bY: number,
  varX: string = 'x',
  varY: string = 'y',
): string {
  const xTerm =
    aX === 0
      ? null
      : aX === 1
        ? varX
        : aX === -1
          ? `-${varX}`
          : `${aX}${varX}`;
  const yTerm =
    bY === 0
      ? null
      : bY === 1
        ? varY
        : bY === -1
          ? `-${varY}`
          : `${bY}${varY}`;

  if (xTerm === null && yTerm === null) return '0';
  if (xTerm === null) return yTerm as string;
  if (yTerm === null) return xTerm;
  // Both present: combine with ` + ` or ` - ` separator so the y-term's
  // leading sign is never written as `+ -`.
  if (yTerm.startsWith('-')) {
    return `${xTerm} - ${yTerm.slice(1)}`;
  }
  return `${xTerm} + ${yTerm}`;
}

/**
 * Advance `b2` to the next non-zero integer in the [-5, 5] cycle. Deterministic
 * (no PRNG draws). Returns the new value of `b2` and the resulting determinant.
 */
function nextB2WithNonSingularDeterminant(
  b2: number,
  a1: number,
  a2: number,
  b1: number,
): { b2: number; det: number } {
  // b2 is in [-5, 5] \ {0}. Walk forward, wrapping around the cycle, skipping
  // 0. The 1d range [-5..5]\{0} has only 10 candidates; in the worst case we
  // visit all of them, but in practice we escape in 1-2 steps because there
  // is at most one singular b2 for a fixed (a1, a2, b1).
  let candidate = b2;
  for (let i = 0; i < 11; i++) {
    candidate = candidate + 1;
    if (candidate > 5) candidate = -5;
    if (candidate === 0) candidate = 1;
    const det = a1 * candidate - a2 * b1;
    if (det !== 0) {
      return { b2: candidate, det };
    }
  }
  // Defensive fallback — should be unreachable given the math above.
  return { b2: candidate === 0 ? 1 : candidate, det: a1 * candidate - a2 * b1 };
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate a 2×2 linear system with a guaranteed unique integer solution.
 * See module header for the backward-construction strategy.
 *
 * @param options.seed — integer PRNG seed.
 * @returns A `SystemOfEquationsProblem`.
 */
export function generateSystemOfEquations(options: {
  seed: number;
}): SystemOfEquationsProblem {
  const { seed } = options;
  // Single call to mulberry32; subsequent draws come from the closure.
  const rand = mulberry32(seed);

  const x = randInt(rand, -6, 6);
  const y = randInt(rand, -6, 6);
  const a1 = randNonZero(rand, 5);
  const b1 = randNonZero(rand, 5);
  const a2 = randNonZero(rand, 5);
  let b2 = randNonZero(rand, 5);

  // Determinant guard: walk b2 forward through the [-5..5]\{0} cycle until
  // det = a1*b2 - a2*b1 is non-zero. No additional PRNG draws.
  let det = a1 * b2 - a2 * b1;
  if (det === 0) {
    const adjusted = nextB2WithNonSingularDeterminant(b2, a1, a2, b1);
    b2 = adjusted.b2;
    det = adjusted.det;
  }
  // det must now be non-zero by construction
  if (det === 0) {
    // Unreachable, but keep a hard fallback so we never produce a degenerate
    // system even if the cycle logic above were to drift.
    b2 = b2 === 5 ? -5 : b2 + 1;
    if (b2 === 0) b2 = 1;
    det = a1 * b2 - a2 * b1;
  }

  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;

  const eq1 = `${formatLinearXY(a1, b1)} = ${c1}`;
  const eq2 = `${formatLinearXY(a2, b2)} = ${c2}`;

  // Solve symbolically so the steps show the work, not a magic result.
  // det was computed above; divide to recover x then back-substitute for y.
  const xSolved = (c1 * b2 - c2 * b1) / det;
  const ySolved = (a1 * c2 - a2 * c1) / det;

  const steps: string[] = [
    `Solve the system: ${eq1}, ${eq2}`,
    `Method: elimination — multiply the equations to align one variable, then subtract.`,
    `Determinant is ${det} (non-zero, so the system has a unique solution).`,
    `x = ${xSolved}`,
    `Substitute x back into equation 1 to find y.`,
    `y = ${ySolved}`,
  ];

  return {
    equations: [eq1, eq2],
    answer: { x: xSolved, y: ySolved },
    a1,
    b1,
    c1,
    a2,
    b2,
    c2,
    steps,
    familyId: 'step-by-step-solver:system-of-equations',
  };
}

// Re-export the linear-term formatter so callers wiring up custom bivariate
// prompts can format single-variable subsets consistently with this module.
export { formatLinearTerm };