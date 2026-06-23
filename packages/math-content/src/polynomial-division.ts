import { addPoly, multiplyPoly } from './utils/polynomial';

/**
 * Polynomial long-division problem expressed as Q(x)·D(x) + R(x) = P(x).
 */
export interface PolynomialDivision {
  dividend: number[];
  divisor: number[];
  quotient: number[];
  remainder: number[];
}

/**
 * Linear congruential PRNG (same form as polynomial-operations.ts).
 */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Ascending-order coefficient array builder. Same shape as the operations
 * generator, but with a smaller coefficient range because long-division
 * problems become unreadable with large numbers.
 */
function generateCoefficients(
  rand: () => number,
  degree: number,
  leadingRange: [number, number],
  otherRange: [number, number] = [-3, 3],
): number[] {
  const poly: number[] = [];
  for (let i = 0; i < degree; i++) {
    const c =
      Math.floor(rand() * (otherRange[1] - otherRange[0] + 1)) + otherRange[0];
    poly.push(c);
  }
  const leadingMag =
    Math.floor(rand() * (leadingRange[1] - leadingRange[0] + 1)) +
    leadingRange[0];
  poly.push(rand() < 0.5 ? -leadingMag : leadingMag);
  return poly;
}

/**
 * Generate a long-division problem using backward construction:
 *
 *   1. Pick Quotient Q(x) and Divisor D(x) with non-zero leading terms.
 *   2. Pick Remainder R(x) whose degree is strictly less than deg(D).
 *   3. Compute the Dividend P(x) = Q(x)·D(x) + R(x) via convolution.
 *
 * This guarantees the result is the correct quotient/remainder pair for
 * the generated dividend, with no trial-division and no rounding risk.
 *
 * Deterministic: same seed → same {dividend, divisor, quotient, remainder}.
 */
export function generatePolynomialDivision(options: {
  seed: number;
}): PolynomialDivision {
  const { seed } = options;
  const rand = seededRandom(seed);

  // Keep degrees small for readable long-division prompts.
  const quotientDeg = Math.floor(rand() * 2) + 1; // 1..2
  const divisorDeg = Math.floor(rand() * 2) + 1; // 1..2

  const quotient = generateCoefficients(rand, quotientDeg, [1, 3]);
  const divisor = generateCoefficients(rand, divisorDeg, [1, 3]);

  // Remainder degree MUST be strictly less than divisor degree, so the
  // division is proper and the resulting P = Q·D + R identity holds.
  const maxRemainderDeg = divisorDeg - 1;
  const remainderDeg =
    maxRemainderDeg > 0 ? Math.floor(rand() * (maxRemainderDeg + 1)) : 0;

  // Leading coefficient of R may legitimately be 0 (remainder can vanish),
  // so leadingRange starts at 0.
  const remainder = generateCoefficients(rand, remainderDeg, [0, 3]);

  // P = Q·D + R
  const product = multiplyPoly(quotient, divisor);

  // Pad R with leading zeros on the LOW-degree side until its length
  // matches the product. With ascending-order coefficients, this is
  // "unshift(0)" — adding x⁰, x¹, … terms equal to zero until alignment.
  const paddedRemainder = [...remainder];
  while (paddedRemainder.length < product.length) {
    paddedRemainder.unshift(0);
  }

  const dividend = addPoly(product, paddedRemainder);

  return { dividend, divisor, quotient, remainder };
}