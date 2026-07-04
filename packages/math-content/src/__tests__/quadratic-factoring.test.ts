import { describe, it, expect, vi } from 'vitest';
import { generateQuadraticFactoring } from '../quadratic-factoring';
import { multiplyPoly } from '../utils/polynomial';
import { checkEquivalence } from '../algebraic';
import * as prng from '../utils/prng';

/**
 * quadratic-factoring.ts — Quadratic factoring problem generator
 *
 * Track: core-algebra-generators_20260510 (T17) Phase 3
 *
 * generateQuadraticFactoring({ seed }) returns a backward-generated quadratic
 * of the form a*x^2 + b*x + c together with its factored form and roots.
 */

interface QuadraticFactoringProblem {
  quadratic: string;
  factoredForm: string;
  a: number;
  b: number;
  c: number;
  roots: [number, number];
  steps: string[];
}

// ---------------------------------------------------------------------------
// Factored-form parser (independent of the generator's internals)
// ---------------------------------------------------------------------------

interface ParsedFactoredForm {
  leading: number;
  factorPolys: number[][]; // ascending coefficients [constant, x]
}

function parseBinomial(inner: string): { m: number; n: number } {
  const s = inner.replace(/\s/g, '');
  if (!s.includes('x')) {
    return { m: 0, n: Number(s) };
  }
  const [coeffPart, tail] = s.split('x');
  let m: number;
  if (coeffPart === '' || coeffPart === '+') {
    m = 1;
  } else if (coeffPart === '-') {
    m = -1;
  } else {
    m = Number(coeffPart);
  }
  const n = tail === '' ? 0 : Number(tail);
  if (!Number.isFinite(m) || !Number.isFinite(n)) {
    throw new Error(`Cannot parse binomial "${inner}"`);
  }
  return { m, n };
}

function parseFactoredForm(form: string): ParsedFactoredForm {
  const trimmed = form.replace(/\s/g, '');

  // Optional integer leading coefficient before the first factor, e.g. "2(x-1)(x+3)".
  let leading = 1;
  let rest = trimmed;
  const leadingMatch = rest.match(/^([+-]?\d+)(?=\()/);
  if (leadingMatch) {
    leading = Number(leadingMatch[1]);
    rest = rest.slice(leadingMatch[1].length);
  }

  const factorRegex = /\(([+-]?\d*x?[+-]?\d*)\)/g;
  const factors: Array<{ m: number; n: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = factorRegex.exec(rest)) !== null) {
    factors.push(parseBinomial(match[1]));
  }

  // Handle exponent on the last factor, e.g. "(x-2)^2".
  const powMatch = trimmed.match(/\)\^(\d+)$/);
  if (powMatch && factors.length > 0) {
    const exp = Number(powMatch[1]);
    const last = factors[factors.length - 1];
    for (let i = 1; i < exp; i++) {
      factors.push({ ...last });
    }
  }

  const factorPolys = factors.map((f) => [f.n, f.m]);
  return { leading, factorPolys };
}

function normalizePoly(poly: number[]): number[] {
  const copy = [...poly];
  while (copy.length > 1 && copy[copy.length - 1] === 0) {
    copy.pop();
  }
  return copy;
}

function expandFactoredForm(form: string): number[] {
  const { leading, factorPolys } = parseFactoredForm(form);
  let poly = [leading];
  for (const factor of factorPolys) {
    poly = multiplyPoly(poly, factor);
  }
  return normalizePoly(poly);
}

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

describe('quadratic-factoring return shape', () => {
  it('returns all required top-level keys', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    expect(r).toHaveProperty('quadratic');
    expect(r).toHaveProperty('factoredForm');
    expect(r).toHaveProperty('a');
    expect(r).toHaveProperty('b');
    expect(r).toHaveProperty('c');
    expect(r).toHaveProperty('roots');
    expect(r).toHaveProperty('steps');
  });

  it('quadratic and factoredForm are non-empty strings', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    expect(typeof r.quadratic).toBe('string');
    expect(r.quadratic.length).toBeGreaterThan(0);
    expect(typeof r.factoredForm).toBe('string');
    expect(r.factoredForm.length).toBeGreaterThan(0);
  });

  it('coefficients a, b, c are finite integers', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    expect(Number.isFinite(r.a)).toBe(true);
    expect(Number.isFinite(r.b)).toBe(true);
    expect(Number.isFinite(r.c)).toBe(true);
    expect(Number.isInteger(r.a)).toBe(true);
    expect(Number.isInteger(r.b)).toBe(true);
    expect(Number.isInteger(r.c)).toBe(true);
  });

  it('roots is a pair of finite numbers', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    expect(Array.isArray(r.roots)).toBe(true);
    expect(r.roots).toHaveLength(2);
    expect(Number.isFinite(r.roots[0])).toBe(true);
    expect(Number.isFinite(r.roots[1])).toBe(true);
  });

  it('steps is a non-empty string array', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
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

describe('quadratic-factoring determinism', () => {
  it('same seed produces identical output', () => {
    const a = generateQuadraticFactoring({ seed: 1 });
    const b = generateQuadraticFactoring({ seed: 1 });
    expect(a).toEqual(b);
  });

  it('same seed produces identical output across 10 consecutive seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const first = generateQuadraticFactoring({ seed });
      const second = generateQuadraticFactoring({ seed });
      expect(first).toEqual(second);
    }
  });

  it('different seeds produce different output', () => {
    const a = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    const b = generateQuadraticFactoring({ seed: 99 }) as QuadraticFactoringProblem;
    const same =
      a.quadratic === b.quadratic &&
      a.factoredForm === b.factoredForm &&
      a.a === b.a &&
      a.b === b.b &&
      a.c === b.c;
    expect(same).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Backward-generation correctness falsifier
// ---------------------------------------------------------------------------

describe('quadratic-factoring backward-generation correctness', () => {
  it('expansion of factoredForm equals ax^2 + bx + c for seed 1', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    const expanded = expandFactoredForm(r.factoredForm);
    const expected = normalizePoly([r.c, r.b, r.a]);
    expect(expanded).toEqual(expected);
  });

  it('coefficients match the roots via Vieta for seed 1', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    const [r1, r2] = r.roots;
    expect(r.b).toBe(-r.a * (r1 + r2));
    expect(r.c).toBe(r.a * r1 * r2);
  });

  it('factoredForm expands to the quadratic across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateQuadraticFactoring({ seed }) as QuadraticFactoringProblem;
      const expanded = expandFactoredForm(r.factoredForm);
      const expected = normalizePoly([r.c, r.b, r.a]);
      expect(expanded).toEqual(expected);
    }
  });

  it('roots satisfy the quadratic across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateQuadraticFactoring({ seed }) as QuadraticFactoringProblem;
      for (const root of r.roots) {
        const value = r.a * root * root + r.b * root + r.c;
        expect(value).toBe(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Formatting guards
// ---------------------------------------------------------------------------

describe('quadratic-factoring formatting guards', () => {
  it('quadratic string never contains forbidden formatting artifacts', () => {
    for (let seed = 0; seed < 50; seed++) {
      const r = generateQuadraticFactoring({ seed }) as QuadraticFactoringProblem;
      expect(r.quadratic).not.toMatch(/(^|[^0-9])1x\^2/);
      expect(r.quadratic).not.toMatch(/(^|[^0-9])-1x\^2/);
      expect(r.quadratic).not.toMatch(/\+\s*-/);
      expect(r.quadratic).not.toMatch(/^\+/);
    }
  });

  it('factoredForm string never contains forbidden formatting artifacts', () => {
    for (let seed = 0; seed < 50; seed++) {
      const r = generateQuadraticFactoring({ seed }) as QuadraticFactoringProblem;
      expect(r.factoredForm).not.toMatch(/(^|[^0-9])1x\^2/);
      expect(r.factoredForm).not.toMatch(/(^|[^0-9])-1x\^2/);
      expect(r.factoredForm).not.toMatch(/\+\s*-/);
      expect(r.factoredForm).not.toMatch(/^\+/);
    }
  });
});

// ---------------------------------------------------------------------------
// Step content
// ---------------------------------------------------------------------------

describe('quadratic-factoring solution steps', () => {
  it('steps include the required grouping-step phrases', () => {
    const r = generateQuadraticFactoring({ seed: 1 }) as QuadraticFactoringProblem;
    const joined = r.steps.join('\n').toLowerCase();
    expect(joined).toContain('quadratic');
    expect(joined).toContain('factor pair');
    expect(joined).toContain('rewrite');
    expect(joined).toContain('middle');
    expect(joined).toContain('group');
    expect(joined).toContain('factored form');
  });
});

// ---------------------------------------------------------------------------
// Case coverage
// ---------------------------------------------------------------------------

describe('quadratic-factoring case coverage', () => {
  it('covers all required special forms across 100 seeds', () => {
    let monicEasy = false;
    let aGreaterThanOne = false;
    let perfectSquare = false;
    let differenceOfSquares = false;
    let oneNegativeOnePositive = false;
    let bothNegative = false;

    for (let seed = 0; seed < 100; seed++) {
      const r = generateQuadraticFactoring({ seed }) as QuadraticFactoringProblem;
      const [r1, r2] = r.roots;

      if (r.a === 1) monicEasy = true;
      if (r.a > 1) aGreaterThanOne = true;
      if (r1 === r2) perfectSquare = true;
      if (r.b === 0 && r.c < 0 && r1 === -r2) differenceOfSquares = true;
      if ((r1 < 0 && r2 > 0) || (r1 > 0 && r2 < 0)) oneNegativeOnePositive = true;
      if (r1 < 0 && r2 < 0) bothNegative = true;
    }

    expect(monicEasy).toBe(true);
    expect(aGreaterThanOne).toBe(true);
    expect(perfectSquare).toBe(true);
    expect(differenceOfSquares).toBe(true);
    expect(oneNegativeOnePositive).toBe(true);
    expect(bothNegative).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Expression-equivalence grading sanity
// ---------------------------------------------------------------------------

describe('quadratic-factoring expression equivalence', () => {
  it('checkEquivalence accepts both orderings of the factors', () => {
    const stored = '(x - 2)(x + 3)';
    const swapped = '(x + 3)(x - 2)';
    expect(checkEquivalence(stored, swapped)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Single-pass generation (no re-roll) — FR-8
// ---------------------------------------------------------------------------

describe('quadratic-factoring single-pass generation', () => {
  it('makes exactly one call to mulberry32 per generation', () => {
    const spy = vi.spyOn(prng, 'mulberry32');
    try {
      for (let seed = 1; seed <= 20; seed++) {
        spy.mockClear();
        generateQuadraticFactoring({ seed });
        expect(spy).toHaveBeenCalledTimes(1);
      }
    } finally {
      spy.mockRestore();
    }
  });
});
