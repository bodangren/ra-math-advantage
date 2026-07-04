import { describe, it, expect, vi } from 'vitest';
import { generateSystemOfEquations } from '../system-of-equations-solver';
import * as prng from '../utils/prng';

/**
 * system-of-equations-solver.ts — System of linear equations problem generator
 *
 * Track: core-algebra-generators_20260510 (T17) Phase 2
 *
 * generateSystemOfEquations({ seed }) returns a backward-generated 2x2 system
 *   a1*x + b1*y = c1
 *   a2*x + b2*y = c2
 * with a unique integer solution { x, y } and non-zero determinant.
 */

interface SystemOfEquationsProblem {
  equations: [string, string];
  answer: { x: number; y: number };
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
  steps: string[];
}

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

describe('system-of-equations-solver return shape', () => {
  it('returns all required top-level keys', () => {
    const r = generateSystemOfEquations({ seed: 1 });
    expect(r).toHaveProperty('equations');
    expect(r).toHaveProperty('answer');
    expect(r).toHaveProperty('a1');
    expect(r).toHaveProperty('b1');
    expect(r).toHaveProperty('c1');
    expect(r).toHaveProperty('a2');
    expect(r).toHaveProperty('b2');
    expect(r).toHaveProperty('c2');
    expect(r).toHaveProperty('steps');
  });

  it('equations is a pair of non-empty strings', () => {
    const r = generateSystemOfEquations({ seed: 1 });
    expect(Array.isArray(r.equations)).toBe(true);
    expect(r.equations).toHaveLength(2);
    for (const eq of r.equations) {
      expect(typeof eq).toBe('string');
      expect(eq.length).toBeGreaterThan(0);
      expect(eq).toContain('=');
    }
  });

  it('answer is an object with finite x and y', () => {
    const r = generateSystemOfEquations({ seed: 1 });
    expect(typeof r.answer).toBe('object');
    expect(Number.isFinite(r.answer.x)).toBe(true);
    expect(Number.isFinite(r.answer.y)).toBe(true);
  });

  it('all coefficients are finite numbers', () => {
    const r = generateSystemOfEquations({ seed: 1 });
    for (const key of ['a1', 'b1', 'c1', 'a2', 'b2', 'c2'] as const) {
      expect(Number.isFinite(r[key])).toBe(true);
    }
  });

  it('steps is a non-empty string array', () => {
    const r = generateSystemOfEquations({ seed: 1 });
    expect(Array.isArray(r.steps)).toBe(true);
    expect(r.steps.length).toBeGreaterThan(0);
    for (const s of r.steps) {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe('system-of-equations-solver determinism', () => {
  it('same seed produces identical output', () => {
    const a = generateSystemOfEquations({ seed: 1 });
    const b = generateSystemOfEquations({ seed: 1 });
    expect(a).toEqual(b);
  });

  it('same seed produces identical output across 10 consecutive seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const first = generateSystemOfEquations({ seed });
      const second = generateSystemOfEquations({ seed });
      expect(first).toEqual(second);
    }
  });

  it('different seeds produce different output', () => {
    const a = generateSystemOfEquations({ seed: 1 });
    const b = generateSystemOfEquations({ seed: 99 });
    const same =
      a.equations[0] === b.equations[0] &&
      a.equations[1] === b.equations[1] &&
      a.answer.x === b.answer.x &&
      a.answer.y === b.answer.y;
    expect(same).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Backward-generation correctness falsifier
// ---------------------------------------------------------------------------

describe('system-of-equations-solver backward-generation correctness', () => {
  it('answer satisfies both equations for seed 1', () => {
    const r = generateSystemOfEquations({ seed: 1 });
    const lhs1 = r.a1 * r.answer.x + r.b1 * r.answer.y;
    const lhs2 = r.a2 * r.answer.x + r.b2 * r.answer.y;
    expect(lhs1).toBeCloseTo(r.c1, 9);
    expect(lhs2).toBeCloseTo(r.c2, 9);
  });

  it('answer satisfies both equations across 50 seeds (independent substitution)', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateSystemOfEquations({ seed });
      const lhs1 = r.a1 * r.answer.x + r.b1 * r.answer.y;
      const lhs2 = r.a2 * r.answer.x + r.b2 * r.answer.y;
      expect(lhs1).toBeCloseTo(r.c1, 9);
      expect(lhs2).toBeCloseTo(r.c2, 9);
    }
  });
});

// ---------------------------------------------------------------------------
// Determinant and solvability guards
// ---------------------------------------------------------------------------

describe('system-of-equations-solver determinant guard', () => {
  it('determinant is never zero across 200 seeds', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateSystemOfEquations({ seed });
      const det = r.a1 * r.b2 - r.a2 * r.b1;
      expect(det).not.toBe(0);
    }
  });

  it('equations are not scalar multiples of each other across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateSystemOfEquations({ seed });
      const det = r.a1 * r.b2 - r.a2 * r.b1;
      expect(det).not.toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Formatting and steps guards
// ---------------------------------------------------------------------------

describe('system-of-equations-solver formatting and steps', () => {
  it('equation strings never contain forbidden formatting artifacts', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { equations } = generateSystemOfEquations({ seed });
      for (const eq of equations) {
        expect(eq).not.toMatch(/(^|[^0-9])1x/);
        expect(eq).not.toMatch(/(^|[^0-9])-1x/);
        expect(eq).not.toMatch(/(^|[^0-9])1y/);
        expect(eq).not.toMatch(/(^|[^0-9])-1y/);
        expect(eq).not.toMatch(/\+\s*-/);
        expect(eq).not.toMatch(/^\+/);
      }
    }
  });

  it('steps array has at least 4 entries covering system, method, and both solutions', () => {
    const r = generateSystemOfEquations({ seed: 1 });
    expect(r.steps.length).toBeGreaterThanOrEqual(4);
    const joined = r.steps.join(' ').toLowerCase();
    expect(joined).toMatch(/x\s*=|solve.*x|x is/);
    expect(joined).toMatch(/y\s*=|solve.*y|y is/);
  });
});

// ---------------------------------------------------------------------------
// Edge-case coverage
// ---------------------------------------------------------------------------

describe('system-of-equations-solver edge-case coverage', () => {
  it('produces negative x, negative y, and both-positive solutions across 200 seeds', () => {
    let negativeX = false;
    let negativeY = false;
    let bothPositive = false;

    for (let seed = 0; seed < 200; seed++) {
      const r = generateSystemOfEquations({ seed });
      if (r.answer.x < 0) negativeX = true;
      if (r.answer.y < 0) negativeY = true;
      if (r.answer.x > 0 && r.answer.y > 0) bothPositive = true;
    }

    expect(negativeX).toBe(true);
    expect(negativeY).toBe(true);
    expect(bothPositive).toBe(true);
  });

  it('handles seed 0, negative seeds, and a large seed without crashing', () => {
    for (const seed of [0, -1, -42, 2 ** 31]) {
      const r = generateSystemOfEquations({ seed });
      expect(Number.isFinite(r.answer.x)).toBe(true);
      expect(Number.isFinite(r.answer.y)).toBe(true);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Single-pass generation (no re-roll) — FR-8
// ---------------------------------------------------------------------------

describe('system-of-equations-solver single-pass generation', () => {
  it('makes exactly one call to mulberry32 per generation', () => {
    const spy = vi.spyOn(prng, 'mulberry32');
    try {
      for (let seed = 1; seed <= 20; seed++) {
        spy.mockClear();
        generateSystemOfEquations({ seed });
        expect(spy).toHaveBeenCalledTimes(1);
      }
    } finally {
      spy.mockRestore();
    }
  });
});
