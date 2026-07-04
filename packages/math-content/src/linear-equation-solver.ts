/**
 * Linear Equation Problem Generator
 *
 * Backward-construction strategy (T17 spec §2):
 *   1. Pick the answer `x` (either an integer in [-10, 10] or a rational
 *      fraction with denominator in [2, 6]).
 *   2. Pick integer coefficients `a ∈ [-5, 5] \ {0}` and `b ∈ [-10, 10]`.
 *   3. Compute the right-hand side `c = a*x + b` so the identity
 *      `a * answer + b === c` is guaranteed by construction.
 *   4. Render the equation as `formatLinearTerm(a, b) = c` so the
 *      display avoids `1x`, `-1x`, `+ -`, `0x`, and leading `+`.
 *
 * Determinism: same seed → identical output.
 *
 * Single-pass generation: exactly one call to `mulberry32` per
 * `generateLinearEquation({ seed })` invocation (FR-8). No re-roll loop —
 * the only retry case would be the determinant check, which never
 * applies to single equations.
 */

import { mulberry32 } from './utils/prng';
import { Fraction } from './utils/fraction';
import { formatLinearTerm } from './utils/expression-builder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LinearEquationProblem {
  /** Display equation string, e.g. `"3x + 2 = 14"`. */
  equation: string;
  /**
   * Numeric solution. Integers when the generator picks an integer answer;
   * otherwise a finite decimal (the Fraction is reduced to lowest terms and
   * then converted via `Fraction.toNumber`).
   */
  answer: number;
  /** Coefficient on `x` in the equation. */
  a: number;
  /** Constant term on the LHS. */
  b: number;
  /** Computed RHS so `a*answer + b === c` exactly. */
  c: number;
  /**
   * Family identifier for the step-by-step-solver fallback UI. Per spec §2
   * and test-strategy §4, this is `'step-by-step-solver:linear-equation'`.
   */
  familyId: 'step-by-step-solver:linear-equation';
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
 * Pick an answer as a `Fraction`. With probability 1/2 the answer is an
 * integer in [-10, 10]; otherwise a rational number with denominator
 * in [2, 6] and numerator in [-10, 10] (excluding the degenerate 0/1
 * integer case to keep the rational mix honest).
 */
function pickAnswer(rand: () => number): Fraction {
  const mode = rand(); // single draw drives integer-vs-rational mode
  if (mode < 0.5) {
    // Integer answer
    return new Fraction(randInt(rand, -10, 10), 1);
  }
  // Rational answer: denominator in [2, 6], numerator in [-10, 10]
  const den = randInt(rand, 2, 6);
  const num = randInt(rand, -10, 10);
  if (num === 0) {
    // 0/(den) is just 0; nudge to numerator 1 to keep the rational case visible
    return new Fraction(1, den);
  }
  return new Fraction(num, den);
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate a single-variable linear equation problem `a*x + b = c` with a
 * guaranteed unique solution `answer`. See module header for the
 * backward-construction strategy.
 *
 * @param options.seed — integer PRNG seed.
 * @returns A `LinearEquationProblem`.
 */
export function generateLinearEquation(options: {
  seed: number;
}): LinearEquationProblem {
  const { seed } = options;
  // Single call to mulberry32; the returned closure may be drawn from many
  // times — that does not count against the single-pass contract.
  const rand = mulberry32(seed);

  const x = pickAnswer(rand); // Fraction (integer or rational)
  const a = randNonZero(rand, 5); // [-5, 5] \ {0}
  const b = randInt(rand, -10, 10); // [-10, 10]

  // c = a*x + b  (Fraction arithmetic keeps integer math exact)
  const c = x.multiply(new Fraction(a, 1)).add(new Fraction(b, 1));

  const answer = x.toNumber();
  const cNum = c.toNumber();

  // Render c and x as decimal strings (Number.toString) so the equation
  // round-trips through `Number(rhs)` in the parser test without needing
  // fraction parsing. Round-trip identity holds because Number.toString
  // produces the unique shortest decimal representation for each double.
  const xStr = String(answer);
  const cStr = String(cNum);

  const equation = `${formatLinearTerm(a, b)} = ${cStr}`;

  // Steps: spec §2 specifies three lines: original, simplified, solution.
  // The simplified line isolates `ax` by subtracting b; the solution divides
  // by a. We format with `formatLinearTerm(a, 0)` (always the x coefficient)
  // so the display stays clean regardless of sign.
  const cMinusB = c.subtract(new Fraction(b, 1));
  const steps: string[] = [
    equation,
    `${formatLinearTerm(a, 0)} = ${String(cMinusB.toNumber())}`,
    `x = ${xStr}`,
  ];

  return {
    equation,
    answer,
    a,
    b,
    c: cNum,
    steps,
    familyId: 'step-by-step-solver:linear-equation',
  };
}