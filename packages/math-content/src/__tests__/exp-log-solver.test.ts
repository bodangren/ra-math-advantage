import { describe, it, expect, vi } from 'vitest';
import { generateExpLogProblem } from '../exp-log-solver';
import * as prng from '../utils/prng';
// @ts-ignore — node:fs is used only in vitest tests; @types/node is not installed in this package
import { readFileSync } from 'node:fs';

/**
 * exp-log-solver.ts — Exponential & Logarithmic problem generator
 *
 * Spec: measure/tracks/advanced-math-generators_20260510/spec.md §3
 *
 * generateExpLogProblem({ seed }) returns:
 *   problemType: 'log' | 'exp' | 'ln'
 *   equation:    LaTeX string containing \log, \ln, or 2^{x}
 *   answer:      number (numeric solution)
 *   domain:      { min: number, max: number }
 *   familyId:    'step-by-step-solver:exp-log'
 *   steps:       string[]
 */

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

describe('exp-log-solver return shape', () => {
  it('returns all required top-level keys', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(r).toHaveProperty('problemType');
    expect(r).toHaveProperty('equation');
    expect(r).toHaveProperty('answer');
    expect(r).toHaveProperty('domain');
    expect(r).toHaveProperty('familyId');
    expect(r).toHaveProperty('steps');
  });

  it('problemType is one of log, exp, ln', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(['log', 'exp', 'ln']).toContain(r.problemType);
  });

  it('answer is a number', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(typeof r.answer).toBe('number');
    expect(Number.isFinite(r.answer)).toBe(true);
  });

  it('domain has min and max numbers', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(typeof r.domain.min).toBe('number');
    expect(typeof r.domain.max).toBe('number');
    expect(r.domain.min).toBeLessThan(r.domain.max);
  });

  it('equation is a non-empty string', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(typeof r.equation).toBe('string');
    expect(r.equation.length).toBeGreaterThan(0);
  });

  it('familyId is step-by-step-solver:exp-log', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(r.familyId).toBe('step-by-step-solver:exp-log');
  });

  it('steps is a non-empty string array', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(Array.isArray(r.steps)).toBe(true);
    expect(r.steps.length).toBeGreaterThan(0);
    for (const s of r.steps) {
      expect(typeof s).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe('determinism', () => {
  it('same seed produces identical output', () => {
    const a = generateExpLogProblem({ seed: 1 });
    const b = generateExpLogProblem({ seed: 1 });
    expect(a).toEqual(b);
  });

  it('different seeds produce different output', () => {
    const a = generateExpLogProblem({ seed: 1 });
    const b = generateExpLogProblem({ seed: 99 });
    // At minimum, the equation or answer should differ
    const same = a.equation === b.equation && a.answer === b.answer;
    expect(same).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// LaTeX formatting
// ---------------------------------------------------------------------------

describe('LaTeX formatting', () => {
  it('equation contains LaTeX formatting (\\log, \\ln, or 2^{x})', () => {
    const r = generateExpLogProblem({ seed: 1 });
    const hasLatex =
      r.equation.includes('\\log') ||
      r.equation.includes('\\ln') ||
      r.equation.includes('2^{x}');
    expect(hasLatex).toBe(true);
  });

  it('log equations contain \\log', () => {
    // Find a seed that produces a 'log' type
    const found = Array.from({ length: 50 }, (_, i) => i + 1)
      .some(seed => {
        const r = generateExpLogProblem({ seed });
        if (r.problemType === 'log') {
          expect(r.equation).toContain('\\log');
          return true;
        }
        return false;
      });
    expect(found).toBe(true);
  });

  it('ln equations contain \\ln', () => {
    const found = Array.from({ length: 50 }, (_, i) => i + 1)
      .some(seed => {
        const r = generateExpLogProblem({ seed });
        if (r.problemType === 'ln') {
          expect(r.equation).toContain('\\ln');
          return true;
        }
        return false;
      });
    expect(found).toBe(true);
  });

  it('exp equations contain 2^{x} LaTeX', () => {
    const found = Array.from({ length: 50 }, (_, i) => i + 1)
      .some(seed => {
        const r = generateExpLogProblem({ seed });
        if (r.problemType === 'exp') {
          expect(r.equation).toContain('2^{x}');
          return true;
        }
        return false;
      });
    expect(found).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Single-pass generation (no re-roll) — FR-8
// ---------------------------------------------------------------------------

describe('single-pass generation', () => {
  it('generateExpLogProblem makes exactly one call to seededRandom (no re-roll)', () => {
    const spy = vi.spyOn(prng, 'seededRandom');
    try {
      for (let seed = 1; seed <= 20; seed++) {
        spy.mockClear();
        generateExpLogProblem({ seed });
        // Single-pass = exactly one seededRandom call per generation.
        // A re-roll loop would call seededRandom multiple times.
        expect(spy).toHaveBeenCalledTimes(1);
      }
    } finally {
      spy.mockRestore();
    }
  });

  it('source contains no while(true) re-roll', () => {
    const src = readFileSync(
      new URL('../exp-log-solver.ts', import.meta.url).pathname,
      'utf8'
    );
    expect(src).not.toMatch(/while\s*\(\s*true\s*\)/);
    expect(src).not.toMatch(/no-constant-condition/);
    expect(src).not.toMatch(/seed\s*\+=\s*1/);
  });
});

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

describe('steps', () => {
  it('steps contain at least 2 entries', () => {
    const r = generateExpLogProblem({ seed: 1 });
    expect(r.steps.length).toBeGreaterThanOrEqual(2);
  });

  it('steps are non-empty strings', () => {
    const r = generateExpLogProblem({ seed: 1 });
    for (const s of r.steps) {
      expect(s.length).toBeGreaterThan(0);
    }
  });
});
