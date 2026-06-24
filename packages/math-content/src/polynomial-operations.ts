import { addPoly, multiplyPoly, subtractPoly } from './utils/polynomial';
import { seededRandom } from './utils/prng';
import { generateCoefficients } from './utils/coefficients';

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

  const dividend = generateCoefficients(rand, dividendDeg, [1, 5], [-5, 5]);
  const divisor = generateCoefficients(rand, divisorDeg, [1, 5], [-5, 5]);

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