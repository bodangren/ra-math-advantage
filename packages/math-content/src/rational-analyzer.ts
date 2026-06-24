/**
 * Rational Asymptote & Feature Generator
 *
 * Generates a rational function f(x) = P(x) / Q(x) with pre-computed
 * structural features: holes, vertical asymptotes, horizontal asymptote,
 * and x-intercepts.
 *
 * Construction (backward, mirrors polynomial-division.ts):
 *   1. Pick hole root h (integer).
 *   2. Pick vertical-asymptote root v (integer, v ≠ h).
 *   3. Pick x-intercept root z (integer, z ≠ h).
 *   4. Pick non-monic leading coefficients aNum, aDen ∈ {1, 2, 3}.
 *   5. P(x) = aNum·(x − h)(x − z),  Q(x) = aDen·(x − h)(x − v).
 *   6. Expand via multiplyPoly.
 *
 * The non-monic coefficients ensure the horizontal-asymptote ratio
 * (aNum/aDen) varies across seeds, making the HA feature pedagogically
 * meaningful rather than trivially y = 1.
 *
 * Convention: ascending degree order — index k = coefficient of x^k.
 *   (x − r) in ascending order is [−r, 1].
 */

import { multiplyPoly } from './utils/polynomial';
import { seededRandom } from './utils/prng';
import { formatPolynomial } from './utils/polynomial-format';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HorizontalAsymptote {
  /** Highest-degree coefficient of the numerator. */
  leadingDegreeNum: number;
  /** Highest-degree coefficient of the denominator. */
  leadingDegreeDen: number;
  /** leadingDegreeNum / leadingDegreeDen. */
  ratio: number;
  /** True when numerator degree < denominator degree (horizontal asymptote y = 0). */
  isZero: boolean;
}

export interface RationalProblem {
  /** Numerator polynomial coefficients in ascending degree order. */
  numerator: number[];
  /** Denominator polynomial coefficients in ascending degree order. */
  denominator: number[];
  /** x-values where both P and Q share a root (removable discontinuities). */
  holes: number[];
  /** x-values where Q(x) = 0 but P(x) ≠ 0 (vertical asymptotes). */
  verticalAsymptotes: number[];
  /** Horizontal asymptote analysis. Null if degrees are equal but leading
   *  coefficients are zero (degenerate). */
  horizontalAsymptote: HorizontalAsymptote | null;
  /** Real roots of the numerator that are NOT holes. */
  xIntercepts: number[];
  /** Family identifier for the step-by-step-solver fallback UI. */
  familyId: 'step-by-step-solver:rational';
  /** Display equation string, e.g. "(x² + 7x) / (x² + 6x)". */
  equation: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick an integer in [lo, hi] (inclusive) via the PRNG. */
function randInt(rand: () => number, lo: number, hi: number): number {
  return Math.floor(rand() * (hi - lo + 1)) + lo;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a rational-function analysis problem.
 *
 * Deterministic: same seed → identical output.
 *
 * @param options.seed — PRNG seed (integer).
 * @returns A RationalProblem with structural features pre-computed.
 */
export function generateRationalProblem(options: {
  seed: number;
}): RationalProblem {
  const { seed } = options;
  const rand = seededRandom(seed);

  // Step 1: Pick three integers for hole (h), vertical asymptote (v),
  // and x-intercept (z). Range [−9, 9] keeps problems readable.
  const h = randInt(rand, -9, 9);

  // v must differ from h
  let v: number;
  do {
    v = randInt(rand, -9, 9);
  } while (v === h);

  // z must differ from both h and v: if z = h the root cancels (second hole);
  // if z = v the root cancels the VA factor (second hole, no vertical asymptote).
  let z: number;
  do {
    z = randInt(rand, -9, 9);
  } while (z === h || z === v);

  // Step 2: Build factor arrays in ascending degree order.
  //   (x − r) = [−r, 1]
  const factorH = [-h, 1];
  const factorV = [-v, 1];
  const factorZ = [-z, 1];

  // Step 3: Pick non-monic leading coefficients via two extra PRNG draws.
  //   aNum, aDen ∈ {1, 2, 3} — this ensures the horizontal-asymptote
  //   ratio (aNum / aDen) varies across seeds, making HA pedagogically
  //   meaningful rather than trivially y = 1.
  const aNum = Math.floor(rand() * 3) + 1; // 1, 2, or 3
  const aDen = Math.floor(rand() * 3) + 1; // 1, 2, or 3

  // Step 4: Expand with non-monic leading coefficients.
  //   P(x) = aNum · (x−h)(x−z)
  //   Q(x) = aDen · (x−h)(x−v)
  const baseNum = multiplyPoly(factorH, factorZ);   // (x−h)(x−z)
  const baseDen = multiplyPoly(factorH, factorV);   // (x−h)(x−v)
  const numerator = baseNum.map(c => c * aNum);
  const denominator = baseDen.map(c => c * aDen);

  // Step 5: Horizontal asymptote.
  // Both numerator and denominator are degree 2 (product of two linear
  // factors, scaled by a constant), so degrees always match. The horizontal
  // asymptote is y = (leading coeff of P) / (leading coeff of Q).
  const leadingNum = numerator[numerator.length - 1];
  const leadingDen = denominator[denominator.length - 1];

  const numDeg = numerator.length - 1;
  const denDeg = denominator.length - 1;
  const horizontalAsymptote: HorizontalAsymptote = {
    leadingDegreeNum: leadingNum,
    leadingDegreeDen: leadingDen,
    ratio: leadingNum / leadingDen,
    isZero: numDeg < denDeg,
  };

  // Step 6: Build the display equation for the step-by-step-solver fallback.
  const numeratorStr = formatPolynomial(numerator);
  const denominatorStr = formatPolynomial(denominator);
  const equation = `(${numeratorStr}) / (${denominatorStr})`;

  return {
    numerator,
    denominator,
    holes: [h],
    verticalAsymptotes: [v],
    horizontalAsymptote,
    xIntercepts: [z],
    familyId: 'step-by-step-solver:rational',
    equation,
  };
}
