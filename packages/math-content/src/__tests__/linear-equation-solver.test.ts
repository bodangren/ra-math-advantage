import { describe, it, expect, vi } from 'vitest';
import { generateLinearEquation } from '../linear-equation-solver';
import * as prng from '../utils/prng';

/**
 * linear-equation-solver.ts — Linear equation problem generator
 *
 * Track: core-algebra-generators_20260510 (T17) Phase 2
 *
 * generateLinearEquation({ seed }) returns a backward-generated problem of the
 * form a*x + b = c with a guaranteed unique solution `answer`.
 */

// ---------------------------------------------------------------------------
// Equation parser (independent of the generator's internals)
// ---------------------------------------------------------------------------

interface ParsedLinearEquation {
  a: number;
  b: number;
  c: number;
}

/**
 * Parse a formatted linear equation of the form "ax + b = c" or "ax - b = c"
 * and recover the integer coefficients. This parser only needs to handle the
 * canonical output of the expression builder: no "1x", "-1x", "+ -", "0x", or
 * leading "+".
 */
function parseLinearEquation(equation: string): ParsedLinearEquation {
  const normalized = equation.replace(/\s/g, '');
  const [lhs, rhs] = normalized.split('=');
  if (!lhs || rhs === undefined) {
    throw new Error(`Cannot parse equation (missing =): ${equation}`);
  }
  const c = Number(rhs);
  if (!Number.isFinite(c)) {
    throw new Error(`Cannot parse RHS as finite number: ${rhs}`);
  }

  // Normalize implicit coefficients so that every x term has an explicit
  // numeric multiplier.
  let expr = lhs;
  expr = expr.replace(/^-x/, '-1x');
  expr = expr.replace(/^x/, '1x');
  expr = expr.replace(/\+x/g, '+1x');
  expr = expr.replace(/-x/g, '-1x');

  const parts = expr.split('x');
  if (parts.length === 1) {
    // Degenerate constant-only LHS (should not happen because a ≠ 0).
    return { a: 0, b: Number(expr), c };
  }
  if (parts.length !== 2) {
    throw new Error(`Ambiguous equation format: ${equation}`);
  }

  const aStr = parts[0];
  const a = aStr === '' ? 1 : aStr === '-' ? -1 : Number(aStr);
  const bStr = parts[1];
  const b = bStr === '' ? 0 : Number(bStr);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error(`Cannot parse coefficients from equation: ${equation}`);
  }

  return { a, b, c };
}

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

describe('linear-equation-solver return shape', () => {
  it('returns all required top-level keys', () => {
    const r = generateLinearEquation({ seed: 1 });
    expect(r).toHaveProperty('equation');
    expect(r).toHaveProperty('answer');
    expect(r).toHaveProperty('a');
    expect(r).toHaveProperty('b');
    expect(r).toHaveProperty('c');
    expect(r).toHaveProperty('steps');
  });

  it('equation is a non-empty string', () => {
    const r = generateLinearEquation({ seed: 1 });
    expect(typeof r.equation).toBe('string');
    expect(r.equation.length).toBeGreaterThan(0);
  });

  it('answer is a finite number', () => {
    const r = generateLinearEquation({ seed: 1 });
    expect(typeof r.answer).toBe('number');
    expect(Number.isFinite(r.answer)).toBe(true);
  });

  it('coefficients a, b, c are finite numbers', () => {
    const r = generateLinearEquation({ seed: 1 });
    expect(Number.isFinite(r.a)).toBe(true);
    expect(Number.isFinite(r.b)).toBe(true);
    expect(Number.isFinite(r.c)).toBe(true);
  });

  it('steps is a non-empty string array', () => {
    const r = generateLinearEquation({ seed: 1 });
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

describe('linear-equation-solver determinism', () => {
  it('same seed produces identical output', () => {
    const a = generateLinearEquation({ seed: 1 });
    const b = generateLinearEquation({ seed: 1 });
    expect(a).toEqual(b);
  });

  it('same seed produces identical output across 10 consecutive seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const first = generateLinearEquation({ seed });
      const second = generateLinearEquation({ seed });
      expect(first).toEqual(second);
    }
  });

  it('different seeds produce different output', () => {
    const a = generateLinearEquation({ seed: 1 });
    const b = generateLinearEquation({ seed: 99 });
    const same = a.equation === b.equation && a.answer === b.answer;
    expect(same).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Backward-generation correctness falsifier
// ---------------------------------------------------------------------------

describe('linear-equation-solver backward-generation correctness', () => {
  it('answer satisfies a * answer + b === c for seed 1', () => {
    const r = generateLinearEquation({ seed: 1 });
    expect(r.a * r.answer + r.b).toBeCloseTo(r.c, 9);
  });

  it('parsed coefficients match the returned a, b, c and satisfy the equation', () => {
    const r = generateLinearEquation({ seed: 1 });
    const parsed = parseLinearEquation(r.equation);
    expect(parsed.a).toBe(r.a);
    expect(parsed.b).toBe(r.b);
    expect(parsed.c).toBe(r.c);
    expect(parsed.a * r.answer + parsed.b).toBeCloseTo(parsed.c, 9);
  });

  it('answer satisfies the equation across 50 seeds (independent substitution)', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateLinearEquation({ seed });
      const lhs = r.a * r.answer + r.b;
      expect(lhs).toBeCloseTo(r.c, 9);
    }
  });

  it('parsed equation is consistent with the returned coefficients across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateLinearEquation({ seed });
      const parsed = parseLinearEquation(r.equation);
      expect(parsed.a).toBe(r.a);
      expect(parsed.b).toBe(r.b);
      expect(parsed.c).toBe(r.c);
    }
  });
});

// ---------------------------------------------------------------------------
// Coefficient and formatting guards
// ---------------------------------------------------------------------------

describe('linear-equation-solver coefficient guards', () => {
  it('a is never 0 across 200 seeds', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateLinearEquation({ seed });
      expect(r.a).not.toBe(0);
    }
  });

  it('equation string never contains forbidden formatting artifacts', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { equation } = generateLinearEquation({ seed });
      expect(equation).not.toMatch(/(^|[^0-9])1x/);
      expect(equation).not.toMatch(/(^|[^0-9])-1x/);
      expect(equation).not.toMatch(/\+\s*-/);
      expect(equation).not.toMatch(/^\+/);
    }
  });

  it('steps array has at least 3 entries and the last step contains the answer', () => {
    const r = generateLinearEquation({ seed: 1 });
    expect(r.steps.length).toBeGreaterThanOrEqual(3);
    const lastStep = r.steps[r.steps.length - 1];
    expect(lastStep).toContain(String(r.answer));
  });
});

// ---------------------------------------------------------------------------
// Edge-case coverage
// ---------------------------------------------------------------------------

describe('linear-equation-solver edge-case coverage', () => {
  it('produces negative, positive, integer, and rational answers across 200 seeds', () => {
    let negative = false;
    let positive = false;
    let integer = false;
    let rational = false;

    for (let seed = 0; seed < 200; seed++) {
      const r = generateLinearEquation({ seed });
      if (r.answer < 0) negative = true;
      if (r.answer > 0) positive = true;
      if (Number.isInteger(r.answer)) integer = true;
      if (!Number.isInteger(r.answer)) rational = true;
    }

    expect(negative).toBe(true);
    expect(positive).toBe(true);
    expect(integer).toBe(true);
    expect(rational).toBe(true);
  });

  it('handles seed 0, negative seeds, and a large seed without crashing', () => {
    for (const seed of [0, -1, -42, 2 ** 31]) {
      const r = generateLinearEquation({ seed });
      expect(Number.isFinite(r.answer)).toBe(true);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Single-pass generation (no re-roll) — FR-8
// ---------------------------------------------------------------------------

describe('linear-equation-solver single-pass generation', () => {
  it('makes exactly one call to mulberry32 per generation', () => {
    const spy = vi.spyOn(prng, 'mulberry32');
    try {
      for (let seed = 1; seed <= 20; seed++) {
        spy.mockClear();
        generateLinearEquation({ seed });
        expect(spy).toHaveBeenCalledTimes(1);
      }
    } finally {
      spy.mockRestore();
    }
  });
});
