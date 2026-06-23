import { describe, it, expect } from 'vitest';
import { addPoly, subtractPoly, multiplyPoly } from '../utils/polynomial';
import { generatePolynomialOperation } from '../polynomial-operations';
import { generatePolynomialDivision } from '../polynomial-division';

// ---------------------------------------------------------------------------
// utils/polynomial.ts — Low-level array convolution primitives
// ---------------------------------------------------------------------------
describe('utils/polynomial.ts', () => {
  describe('addPoly', () => {
    it('adds two same-length polynomials', () => {
      expect(addPoly([1, 2, 3], [4, 5, 6])).toEqual([5, 7, 9]);
    });

    it('pads shorter polynomial with implicit zeros', () => {
      expect(addPoly([1, 2], [3, 4, 5])).toEqual([4, 6, 5]);
    });
  });

  describe('subtractPoly', () => {
    it('subtracts second polynomial from first', () => {
      expect(subtractPoly([5, 7, 9], [1, 2, 3])).toEqual([4, 5, 6]);
    });
  });

  describe('multiplyPoly', () => {
    it('multiplies (x+2)(x+3) = x²+5x+6', () => {
      expect(multiplyPoly([1, 2], [1, 3])).toEqual([1, 5, 6]);
    });

    it('multiplies (x²-1)(x+1) = x³+x²-x-1', () => {
      expect(multiplyPoly([1, 0, -1], [1, 1])).toEqual([1, 1, -1, -1]);
    });

    it('zero polynomial absorbs multiplication', () => {
      expect(multiplyPoly([0], [1, 2, 3])).toEqual([0, 0, 0]);
    });
  });
});

// ---------------------------------------------------------------------------
// polynomial-operations.ts — Cycles through add/sub/mul with determinism
// ---------------------------------------------------------------------------
describe('polynomial-operations.ts', () => {
  const seed = 42;

  it('returns correct shape for polynomial operation', () => {
    const result = generatePolynomialOperation({ seed });
    expect(result).toHaveProperty('dividend');
    expect(result).toHaveProperty('divisor');
    expect(result).toHaveProperty('operator');
    expect(result).toHaveProperty('result');
    expect(Array.isArray(result.dividend)).toBe(true);
    expect(Array.isArray(result.divisor)).toBe(true);
    expect(Array.isArray(result.result)).toBe(true);
    expect(['+', '−', '×']).toContain(result.operator);
  });

  it('cycles operation type across seeds', () => {
    // With three consecutive seeds, we should see all three operators
    const ops = [0, 1, 2].map((i) =>
      generatePolynomialOperation({ seed: i }).operator
    );
    const uniqueOps = new Set(ops);
    expect(uniqueOps.size).toBe(3);
  });

  it('is deterministic — same seed produces same output', () => {
    const a = generatePolynomialOperation({ seed });
    const b = generatePolynomialOperation({ seed });
    expect(a).toEqual(b);
  });

  it('produces mathematically correct result', () => {
    const result = generatePolynomialOperation({ seed });
    if (result.operator === '+') {
      expect(addPoly(result.dividend, result.divisor)).toEqual(result.result);
    } else if (result.operator === '−') {
      expect(subtractPoly(result.dividend, result.divisor)).toEqual(result.result);
    } else if (result.operator === '×') {
      expect(multiplyPoly(result.dividend, result.divisor)).toEqual(result.result);
    }
  });
});

// ---------------------------------------------------------------------------
// polynomial-division.ts — Backward generation: Q·D + R = P
// ---------------------------------------------------------------------------
describe('polynomial-division.ts', () => {
  const seed = 42;

  it('returns correct shape for polynomial division', () => {
    const result = generatePolynomialDivision({ seed });
    expect(result).toHaveProperty('dividend');
    expect(result).toHaveProperty('divisor');
    expect(result).toHaveProperty('quotient');
    expect(result).toHaveProperty('remainder');
    expect(Array.isArray(result.dividend)).toBe(true);
    expect(Array.isArray(result.divisor)).toBe(true);
    expect(Array.isArray(result.quotient)).toBe(true);
    expect(Array.isArray(result.remainder)).toBe(true);
  });

  it('satisfies Q(x)·D(x) + R(x) = P(x) for seed 42', () => {
    const { dividend, divisor, quotient, remainder } = generatePolynomialDivision({ seed });
    const product = multiplyPoly(quotient, divisor);

    // Pad remainder to match product length for addition
    // (pad HIGH-degree side — ascending order, so push(0))
    const paddedRemainder = [...remainder];
    while (paddedRemainder.length < product.length) {
      paddedRemainder.push(0);
    }

    const reconstructed = addPoly(product, paddedRemainder);
    expect(reconstructed).toEqual(dividend);
  });

  it('remainder degree is strictly less than divisor degree', () => {
    const { divisor, remainder } = generatePolynomialDivision({ seed });
    // Remainder degree = remainder.length - 1
    // Divisor degree = divisor.length - 1
    // We need: remainder.length - 1 < divisor.length - 1
    // i.e., remainder.length < divisor.length
    expect(remainder.length).toBeLessThan(divisor.length);
  });

  it('is deterministic — same seed produces same output', () => {
    const a = generatePolynomialDivision({ seed });
    const b = generatePolynomialDivision({ seed });
    expect(a).toEqual(b);
  });
});
