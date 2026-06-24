import { describe, it, expect } from 'vitest';
import {
  generatePolynomialOperation,
  generatePolynomialDivision,
  generateRationalProblem,
  generateExpLogProblem,
  addPoly,
  subtractPoly,
  multiplyPoly,
} from '../index';

// ---------------------------------------------------------------------------
// Index re-export contract tests
// ---------------------------------------------------------------------------

describe('index.ts re-exports', () => {
  it('re-exports generatePolynomialOperation', () => {
    expect(typeof generatePolynomialOperation).toBe('function');
  });

  it('re-exports generatePolynomialDivision', () => {
    expect(typeof generatePolynomialDivision).toBe('function');
  });

  it('re-exports generateRationalProblem', () => {
    expect(typeof generateRationalProblem).toBe('function');
  });

  it('re-exports generateExpLogProblem', () => {
    expect(typeof generateExpLogProblem).toBe('function');
  });

  it('re-exports addPoly, subtractPoly, multiplyPoly', () => {
    expect(typeof addPoly).toBe('function');
    expect(typeof subtractPoly).toBe('function');
    expect(typeof multiplyPoly).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// QA harness — edge case: sparse polynomial (missing middle terms)
// ---------------------------------------------------------------------------

describe('QA harness: sparse polynomial edge cases', () => {
  it('polynomial-operations seed 523 produces sparse result [8, 0, 0, 4] (8 + 4x³)', () => {
    // Seed 523: operator is '−' (523 % 3 = 2 → index 2 is '×'... wait)
    // Let's verify deterministically by calling the generator directly.
    const problem = generatePolynomialOperation({ seed: 523 });

    // The subtraction of these two polynomials:
    //   dividend: [3, -1, 4, 1]  = 3 − x + 4x² + x³
    //   divisor:  [-5, -1, 4, -3] = −5 − x + 4x² − 3x³
    //   result:   [8, 0, 0, 4]   = 8 + 4x³  (missing x and x² terms)
    expect(problem.result).toEqual([8, 0, 0, 4]);

    // Verify the missing middle terms are exactly zero
    expect(problem.result[1]).toBe(0);
    expect(problem.result[2]).toBe(0);

    // Verify the edge terms are non-zero
    expect(problem.result[0]).not.toBe(0);
    expect(problem.result[3]).not.toBe(0);
  });

  it('multiplyPoly handles sparse inputs correctly', () => {
    // (x − 1)(x² + x + 1) = x³ − 1  →  ascending [-1, 0, 0, 1]
    //   [-1, 1] × [1, 1, 1]
    const result = multiplyPoly([-1, 1], [1, 1, 1]);
    expect(result).toEqual([-1, 0, 0, 1]);
  });

  it('addPoly handles sparse arrays of different lengths', () => {
    // [1, 0, 0, 3] + [0, 2] = [1, 2, 0, 3]
    const result = addPoly([1, 0, 0, 3], [0, 2]);
    expect(result).toEqual([1, 2, 0, 3]);
  });

  it('subtractPoly produces sparse result from dense inputs', () => {
    // [3, -1, 4, 1] - [-5, -1, 4, -3] = [8, 0, 0, 4]
    const result = subtractPoly([3, -1, 4, 1], [-5, -1, 4, -3]);
    expect(result).toEqual([8, 0, 0, 4]);
  });
});
