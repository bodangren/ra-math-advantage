import { describe, it, expect } from 'vitest';
import { multiplyPoly } from '../utils/polynomial';
import { generateRationalProblem } from '../rational-analyzer';
// @ts-ignore — node:fs is used only in vitest tests; @types/node is not installed in this package
import { readFileSync } from 'node:fs';

/**
 * Evaluate a polynomial at x given ascending-order coefficients.
 * p[0] + p[1]*x + p[2]*x² + …
 */
function evalPoly(p: number[], x: number): number {
  let result = 0;
  let xPow = 1;
  for (let i = 0; i < p.length; i++) {
    result += p[i] * xPow;
    xPow *= x;
  }
  return result;
}

// ---------------------------------------------------------------------------
// rational-analyzer.ts — Rational asymptote & feature generator
// ---------------------------------------------------------------------------

describe('rational-analyzer.ts', () => {
  // ---- Return shape ----

  describe('return shape', () => {
    it('returns all required top-level keys', () => {
      const r = generateRationalProblem({ seed: 1 });
      expect(r).toHaveProperty('numerator');
      expect(r).toHaveProperty('denominator');
      expect(r).toHaveProperty('holes');
      expect(r).toHaveProperty('verticalAsymptotes');
      expect(r).toHaveProperty('horizontalAsymptote');
      expect(r).toHaveProperty('xIntercepts');
      expect(r).toHaveProperty('familyId');
      expect(r).toHaveProperty('equation');
    });

    it('numerator and denominator are non-empty coefficient arrays', () => {
      const r = generateRationalProblem({ seed: 1 });
      expect(Array.isArray(r.numerator)).toBe(true);
      expect(Array.isArray(r.denominator)).toBe(true);
      expect(r.numerator.length).toBeGreaterThanOrEqual(2);
      expect(r.denominator.length).toBeGreaterThanOrEqual(2);
    });

    it('holes, verticalAsymptotes, xIntercepts are number arrays', () => {
      const r = generateRationalProblem({ seed: 1 });
      expect(Array.isArray(r.holes)).toBe(true);
      expect(Array.isArray(r.verticalAsymptotes)).toBe(true);
      expect(Array.isArray(r.xIntercepts)).toBe(true);
    });
  });

  // ---- Seed 1 structural verification ----
  // PRNG seed 1 yields: h=0, v=-6, z=-7

  describe('seed 1 — structural verification', () => {
    it('has exactly one hole, one VA, and one x-intercept', () => {
      const r = generateRationalProblem({ seed: 1 });
      expect(r.holes).toHaveLength(1);
      expect(r.verticalAsymptotes).toHaveLength(1);
      expect(r.xIntercepts).toHaveLength(1);
    });

    it('hole and VA are distinct', () => {
      const r = generateRationalProblem({ seed: 1 });
      expect(r.holes[0]).not.toBe(r.verticalAsymptotes[0]);
    });

    it('P(x) = (x-h)(x-z) — ascending order [-h,1]*[-z,1]', () => {
      const r = generateRationalProblem({ seed: 1 });
      const h = r.holes[0];
      const z = r.xIntercepts[0];
      // (x - h) in ascending order is [-h, 1]
      const expectedNum = multiplyPoly([-h, 1], [-z, 1]);
      expect(r.numerator).toEqual(expectedNum);
    });

    it('Q(x) = (x-h)(x-v) — ascending order [-h,1]*[-v,1]', () => {
      const r = generateRationalProblem({ seed: 1 });
      const h = r.holes[0];
      const v = r.verticalAsymptotes[0];
      const expectedDen = multiplyPoly([-h, 1], [-v, 1]);
      expect(r.denominator).toEqual(expectedDen);
    });
  });

  // ---- Determinism ----

  describe('determinism', () => {
    it('same seed produces identical output', () => {
      const a = generateRationalProblem({ seed: 1 });
      const b = generateRationalProblem({ seed: 1 });
      expect(a).toEqual(b);
    });

    it('different seeds produce different structures', () => {
      const a = generateRationalProblem({ seed: 1 });
      const b = generateRationalProblem({ seed: 42 });
      const numeratorSame = JSON.stringify(a.numerator) === JSON.stringify(b.numerator);
      const denominatorSame = JSON.stringify(a.denominator) === JSON.stringify(b.denominator);
      expect(numeratorSame && denominatorSame).toBe(false);
    });
  });

  // ---- Horizontal asymptote ----

  describe('horizontal asymptote', () => {
    it('horizontal asymptote ratio varies across seeds', () => {
      const ratios = new Set<number>();
      for (let seed = 1; seed <= 50; seed++) {
        const r = generateRationalProblem({ seed });
        ratios.add(r.horizontalAsymptote!.ratio);
      }
      // At HEAD (before FR-7): ratios = { 1 } (size 1).
      // After FR-7: multiple ratios from aNum/aDen ∈ {1,2,3}.
      expect(ratios.size).toBeGreaterThan(1);
    });

    it('at least one of seeds 1..50 has horizontalAsymptote.ratio !== 1', () => {
      const found = Array.from({ length: 50 }, (_, i) => i + 1)
        .map(seed => generateRationalProblem({ seed }))
        .some(r => r.horizontalAsymptote!.ratio !== 1);
      expect(found).toBe(true);
    });

    it('source does not hardcode isZero: false', () => {
      const src = readFileSync(
        new URL('../rational-analyzer.ts', import.meta.url).pathname,
        'utf8'
      );
      // Before FR-7: `isZero: false, // degrees always equal`
      // After FR-7: computed expression `isZero: numDeg < denDeg`
      expect(src).not.toMatch(/isZero:\s*false,?\s*\/\/\s*degrees always/);
    });
  });

  // ---- Invariants across many seeds ----

  describe('invariants (seeds 1–50)', () => {
    it('hole ≠ vertical asymptote', () => {
      for (let seed = 1; seed <= 50; seed++) {
        const r = generateRationalProblem({ seed });
        for (const h of r.holes) {
          for (const v of r.verticalAsymptotes) {
            expect(h).not.toBe(v);
          }
        }
      }
    });

    it('x-intercepts exclude hole values', () => {
      for (let seed = 1; seed <= 50; seed++) {
        const r = generateRationalProblem({ seed });
        for (const z of r.xIntercepts) {
          for (const h of r.holes) {
            expect(z).not.toBe(h);
          }
        }
      }
    });
  });

  // ---- Mathematical correctness ----

  describe('mathematical correctness (seeds 1–20)', () => {
    it('P(h) = 0 and Q(h) = 0 for every hole h', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const r = generateRationalProblem({ seed });
        for (const h of r.holes) {
          expect(evalPoly(r.numerator, h)).toBeCloseTo(0, 8);
          expect(evalPoly(r.denominator, h)).toBeCloseTo(0, 8);
        }
      }
    });

    it('Q(v) = 0 and P(v) ≠ 0 for every vertical asymptote v', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const r = generateRationalProblem({ seed });
        for (const v of r.verticalAsymptotes) {
          expect(evalPoly(r.denominator, v)).toBeCloseTo(0, 8);
          expect(evalPoly(r.numerator, v)).not.toBeCloseTo(0, 5);
        }
      }
    });

    it('P(z) = 0 for every x-intercept z', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const r = generateRationalProblem({ seed });
        for (const z of r.xIntercepts) {
          expect(evalPoly(r.numerator, z)).toBeCloseTo(0, 8);
        }
      }
    });
  });

  // ---- Step-by-step-solver fallback ----

  describe('step-by-step-solver fallback', () => {
    it('familyId is step-by-step-solver:rational', () => {
      const r = generateRationalProblem({ seed: 1 });
      expect(r.familyId).toBe('step-by-step-solver:rational');
    });

    it('equation is a non-empty string with /', () => {
      const r = generateRationalProblem({ seed: 1 });
      expect(typeof r.equation).toBe('string');
      expect(r.equation.length).toBeGreaterThan(0);
      expect(r.equation).toContain('/');
    });
  });
});
