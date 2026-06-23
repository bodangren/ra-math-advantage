/**
 * Polynomial Convolution Utilities
 *
 * Convention: coefficient arrays are stored in ASCENDING degree order —
 * index k is the coefficient of x^k.
 *
 *   Examples:
 *     constant 5          → [5]
 *     1 + 2x              → [1, 2]
 *     5 + 4x + 3x²        → [5, 4, 3]
 *     x² + 5x + 6         → [6, 5, 1]
 *
 * When two polynomials have different lengths, the shorter is implicitly
 * padded with zeros at the END (the high-degree side).
 *
 *   addPoly([1, 2], [3, 4, 5])
 *     → [1, 2, 0] + [3, 4, 5]
 *     → [4, 6, 5]
 */

/**
 * Add two polynomials element-wise, zero-padding the shorter on the right.
 */
export function addPoly(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const result: number[] = new Array(len).fill(0);
  for (let i = 0; i < len; i++) {
    const av = i < a.length ? a[i] : 0;
    const bv = i < b.length ? b[i] : 0;
    result[i] = av + bv;
  }
  return result;
}

/**
 * Subtract polynomial b from polynomial a, zero-padding the shorter on the right.
 */
export function subtractPoly(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const result: number[] = new Array(len).fill(0);
  for (let i = 0; i < len; i++) {
    const av = i < a.length ? a[i] : 0;
    const bv = i < b.length ? b[i] : 0;
    result[i] = av - bv;
  }
  return result;
}

/**
 * Multiply two polynomials via discrete convolution.
 * Result has length a.length + b.length - 1.
 */
export function multiplyPoly(a: number[], b: number[]): number[] {
  if (a.length === 0 || b.length === 0) {
    return [];
  }
  const result: number[] = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
}