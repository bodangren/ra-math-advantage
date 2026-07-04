import { describe, it, expect } from 'vitest';
import {
  generateLinearEquation,
  generateSystemOfEquations,
  generateQuadraticFactoring,
  generateQuadraticFormula,
} from '../index';
import { multiplyPoly } from '../utils/polynomial';

/**
 * T17 QA harness — runs every new algebra generator across 50 seeds and
 * asserts structural + mathematical correctness. Mirrors the existing
 * pattern in generator-registry.test.ts (FR-19 50-seed sweeps).
 */

function parseFactoredForm(form: string): { leading: number; factorPolys: number[][] } {
  const trimmed = form.replace(/\s/g, '');
  let leading = 1;
  let rest = trimmed;
  const leadingMatch = rest.match(/^([+-]?\d+)(?=\()/);
  if (leadingMatch) {
    leading = Number(leadingMatch[1]);
    rest = rest.slice(leadingMatch[1].length);
  }
  function parseBinomial(inner: string): { m: number; n: number } {
    if (!inner.includes('x')) return { m: 0, n: Number(inner) };
    const [coeffPart, tail] = inner.split('x');
    let m: number;
    if (coeffPart === '' || coeffPart === '+') m = 1;
    else if (coeffPart === '-') m = -1;
    else m = Number(coeffPart);
    const n = tail === '' ? 0 : Number(tail);
    return { m, n };
  }
  const factorRegex = /\(([+-]?\d*x?[+-]?\d*)\)/g;
  const factors: Array<{ m: number; n: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = factorRegex.exec(rest)) !== null) {
    factors.push(parseBinomial(match[1]));
  }
  const powMatch = trimmed.match(/\)\^(\d+)$/);
  if (powMatch && factors.length > 0) {
    const exp = Number(powMatch[1]);
    const last = factors[factors.length - 1];
    for (let i = 1; i < exp; i++) factors.push({ ...last });
  }
  return { leading, factorPolys: factors.map((f) => [f.n, f.m]) };
}

function normalizePoly(p: number[]): number[] {
  const copy = [...p];
  while (copy.length > 1 && copy[copy.length - 1] === 0) copy.pop();
  return copy;
}

function expandFactored(form: string): number[] {
  const { leading, factorPolys } = parseFactoredForm(form);
  let poly = [leading];
  for (const f of factorPolys) poly = multiplyPoly(poly, f);
  return normalizePoly(poly);
}

describe('T17 QA harness — 50-seed sweep of every new algebra generator', () => {
  it('linear-equation-solver: answer satisfies ax+b=c across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateLinearEquation({ seed });
      expect(Number.isFinite(r.a)).toBe(true);
      expect(Number.isFinite(r.b)).toBe(true);
      expect(Number.isFinite(r.c)).toBe(true);
      expect(r.a).not.toBe(0);
      expect(r.a * r.answer + r.b).toBeCloseTo(r.c, 9);
      expect(r.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('system-of-equations-solver: answer satisfies both equations across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateSystemOfEquations({ seed });
      const { x, y } = r.answer;
      expect(r.a1 * x + r.b1 * y).toBeCloseTo(r.c1, 9);
      expect(r.a2 * x + r.b2 * y).toBeCloseTo(r.c2, 9);
      const det = r.a1 * r.b2 - r.a2 * r.b1;
      expect(det).not.toBe(0);
      expect(r.steps.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('quadratic-factoring: factoredForm expands to ax^2+bx+c across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateQuadraticFactoring({ seed });
      const expanded = expandFactored(r.factoredForm);
      const expected = normalizePoly([r.c === 0 ? 0 : r.c, r.b === 0 ? 0 : r.b, r.a]);
      expect(expanded).toEqual(expected);
      for (const root of r.roots) {
        expect(r.a * root * root + r.b * root + r.c).toBe(0);
      }
      expect(r.steps.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('quadratic-formula: discriminant matches b^2-4ac and real roots satisfy ax^2+bx+c across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateQuadraticFormula({ seed });
      expect(r.discriminant).toBe(r.b * r.b - 4 * r.a * r.c);
      expect(r.a).not.toBe(0);
      for (const root of r.roots) {
        if (root.type === 'real' && typeof root.value === 'number') {
          expect(r.a * root.value * root.value + r.b * root.value + r.c).toBeCloseTo(0, 9);
        }
      }
      expect(r.steps.length).toBeGreaterThanOrEqual(4);
    }
  });
});
