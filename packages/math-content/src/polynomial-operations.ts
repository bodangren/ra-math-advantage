import { addPoly, multiplyPoly, subtractPoly } from './utils/polynomial';

/**
 * Operator symbol rendered in the prompt and used as the discriminator
 * for cycling through generation modes.
 *
 * Uses U+2212 MINUS SIGN and U+00D7 MULTIPLICATION SIGN so the operator
 * matches LaTeX-friendly typography.
 */
export type PolynomialOperator = '+' | '−' | '×';

export interface PolynomialOperation {
  dividend: number[];
  divisor: number[];
  operator: PolynomialOperator;
  result: number[];
}

/**
 * Linear congruential PRNG matching the pattern already used elsewhere in
 * math-content (see problem-families/im1/generators.ts). Producing a fresh
 * PRNG per call keeps generators deterministic for a given seed.
 */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Build a coefficient array of the requested degree in ascending order
 * (index k = coefficient of x^k). The leading coefficient (last index)
 * is always non-zero; intermediate coefficients are uniform integers.
 */
function generateCoefficients(
  rand: () => number,
  degree: number,
  leadingRange: [number, number],
  otherRange: [number, number] = [-5, 5],
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
 * Generate a polynomial arithmetic problem (add, subtract, or multiply).
 *
 * Determinism: same seed → same output. The operator cycles add → subtract
 * → multiply deterministically based on `Math.abs(seed) % 3`, so three
 * consecutive seeds produce all three operators.
 */
export function generatePolynomialOperation(options: {
  seed: number;
}): PolynomialOperation {
  const { seed } = options;
  const rand = seededRandom(seed);

  // Cycle the operator deterministically. Using modulo rather than the
  // PRNG keeps the three operator classes guaranteed-visible across a
  // small consecutive seed run.
  const operator: PolynomialOperator =
    (['+', '−', '×'] as const)[Math.abs(seed) % 3];

  // Pick small degrees so the prompts remain tractable.
  const dividendDeg = Math.floor(rand() * 3) + 1; // 1..3
  const divisorDeg = Math.floor(rand() * 3) + 1; // 1..3

  const dividend = generateCoefficients(rand, dividendDeg, [1, 5]);
  const divisor = generateCoefficients(rand, divisorDeg, [1, 5]);

  let result: number[];
  if (operator === '+') {
    result = addPoly(dividend, divisor);
  } else if (operator === '−') {
    result = subtractPoly(dividend, divisor);
  } else {
    result = multiplyPoly(dividend, divisor);
  }

  return { dividend, divisor, operator, result };
}