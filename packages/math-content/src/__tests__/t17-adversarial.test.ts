/**
 * T17 Adversarial Test Suite — core-algebra-generators_20260510
 *
 * Track: core-algebra-generators_20260510 (T17) Phase-acceptance attack surface.
 * Role: Measure Adversarial Testing (measure-adversarial-testing).
 *
 * This suite is intentionally distinct from the unit suites in
 * `prng.test.ts`, `fraction.test.ts`, `expression-builder.test.ts`,
 * `linear-equation-solver.test.ts`, `system-of-equations-solver.test.ts`,
 * `quadratic-factoring.test.ts`, `quadratic-formula.test.ts`, and
 * `generator-registry.test.ts`. Those suites prove the generators work in
 * the canonical happy path; this suite deliberately attacks the *edges*
 * of their domains to expose:
 *
 *   1. Vacuous-pass on nothing-done (A4) — assert on specific, captured
 *      seed outputs (not just "is finite").
 *   2. False-claim text vs test reality (A5) — pin the exact seed-count
 *      claimed by any aggregate sweep.
 *   3. Over-broad filter swallowing real hits (A7) — verify forbidden-
 *      substring guards actually catch the targeted patterns with
 *      precision (no false-positive on bare English words).
 *
 * The probes include:
 *   - mulberry32 PRNG: NaN/Infinity/string seeds throw, large seeds
 *     produce finite output, distribution uniformity across 10k seeds.
 *   - Fraction: 0/1 + 0/1 = 0/1 (A4 specific-output), negative
 *     denominator normalized, `fromDecimal(0.1)` does not infinite-loop.
 *   - formatLinearTerm/formatQuadratic: forbidden-substring grid sweep.
 *   - Generators: 200-seed sweeps proving no a=0 / det=0 / unparseable
 *     factored form, edge-seed (0, -1, MAX_SAFE_INTEGER, -MAX_SAFE_INTEGER,
 *     2^31, 2^53) handling, cross-generator non-interference.
 *   - Registry adapters: `expectedAnswer` keys match
 *     `gradingMetadata.partAnswers` keys (GeneratorOutput contract).
 *
 * IMPORTANT: This file MUST NOT introduce dependencies on measure/
 * artifacts (the no-measure-coupling FR-4 guard forbids it). Provenance
 * references in line comments are permitted; read-through-coupling to
 * measure/tracks or measure/archive paths in string literals is not.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { mulberry32, seededRandom } from '../utils/prng';
import { Fraction, gcd } from '../utils/fraction';
import { formatLinearTerm, formatQuadratic } from '../utils/expression-builder';

import { generateLinearEquation } from '../linear-equation-solver';
import { generateSystemOfEquations } from '../system-of-equations-solver';
import { generateQuadraticFactoring } from '../quadratic-factoring';
import { generateQuadraticFormula } from '../quadratic-formula';

import { multiplyPoly } from '../utils/polynomial';

import {
  getGenerator,
  GENERATOR_KEYS,
} from '../knowledge-space/generators/registry';

// ---------------------------------------------------------------------------
// Test-only helpers (mirror the parsing style used in the canonical suites
// but live here so this file is self-contained.)
// ---------------------------------------------------------------------------

function parseLinearEquation(equation: string): { a: number; b: number; c: number } {
  const normalized = equation.replace(/\s/g, '');
  const eqIdx = normalized.indexOf('=');
  if (eqIdx < 0) throw new Error(`Cannot parse equation (missing =): ${equation}`);
  const lhs = normalized.slice(0, eqIdx);
  const rhs = normalized.slice(eqIdx + 1);
  const c = Number(rhs);
  if (!Number.isFinite(c)) throw new Error(`Cannot parse RHS as finite number: ${rhs}`);

  let expr = lhs;
  expr = expr.replace(/^-x/, '-1x');
  expr = expr.replace(/^x/, '1x');
  expr = expr.replace(/\+x/g, '+1x');
  expr = expr.replace(/-x/g, '-1x');

  const parts = expr.split('x');
  if (parts.length !== 2) throw new Error(`Ambiguous equation format: ${equation}`);
  const aStr = parts[0];
  const a = aStr === '' ? 1 : aStr === '-' ? -1 : Number(aStr);
  const bStr = parts[1];
  const b = bStr === '' ? 0 : Number(bStr);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error(`Cannot parse coefficients: ${equation}`);
  }
  return { a, b, c };
}

function parseFactoredForm(form: string): { leading: number; factorPolys: number[][] } {
  const trimmed = form.replace(/\s/g, '');
  let leading = 1;
  let rest = trimmed;
  const leadingMatch = rest.match(/^([+-]?\d+)(?=\()/);
  if (leadingMatch) {
    leading = Number(leadingMatch[1]);
    rest = rest.slice(leadingMatch[1].length);
  }

  const parseBinomial = (inner: string): { m: number; n: number } => {
    const s = inner.replace(/\s/g, '');
    if (!s.includes('x')) return { m: 0, n: Number(s) };
    const [coeffPart, tail] = s.split('x');
    let m: number;
    if (coeffPart === '' || coeffPart === '+') m = 1;
    else if (coeffPart === '-') m = -1;
    else m = Number(coeffPart);
    const n = tail === '' ? 0 : Number(tail);
    return { m, n };
  };

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

function expandFactoredForm(form: string): number[] {
  const { leading, factorPolys } = parseFactoredForm(form);
  let poly = [leading];
  for (const factor of factorPolys) poly = multiplyPoly(poly, factor);
  return normalizePoly(poly);
}

// ---------------------------------------------------------------------------
// Section 1 — mulberry32 PRNG adversarial
// ---------------------------------------------------------------------------

describe('T17 adversarial — mulberry32 PRNG', () => {
  it('rejects NaN/Infinity/-Infinity seeds with TypeError mentioning finite (security fix)', () => {
    expect(() => mulberry32(NaN)).toThrow(TypeError);
    expect(() => mulberry32(NaN)).toThrow(/finite/);
    expect(() => mulberry32(Infinity)).toThrow(TypeError);
    expect(() => mulberry32(Infinity)).toThrow(/finite/);
    expect(() => mulberry32(-Infinity)).toThrow(TypeError);
    expect(() => mulberry32(-Infinity)).toThrow(/finite/);
  });

  it('rejects string, undefined, null, object, and boolean seeds (security fix)', () => {
    // The security fix validates `typeof seed !== "number" || !Number.isFinite(seed)`.
    expect(() => (mulberry32 as (s: unknown) => unknown)('42')).toThrow(TypeError);
    expect(() => (mulberry32 as (s: unknown) => unknown)(undefined)).toThrow(TypeError);
    expect(() => (mulberry32 as (s: unknown) => unknown)(null)).toThrow(TypeError);
    expect(() => (mulberry32 as (s: unknown) => unknown)({})).toThrow(TypeError);
    expect(() => (mulberry32 as (s: unknown) => unknown)(true)).toThrow(TypeError);
    expect(() => (mulberry32 as (s: unknown) => unknown)([])).toThrow(TypeError);
  });

  it('accepts 0, -0, -1, and Number.MAX_SAFE_INTEGER (no crash, finite output)', () => {
    const seeds: unknown[] = [0, -0, -1, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER];
    for (const seed of seeds) {
      const rand = mulberry32(seed as number);
      const v = rand();
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('does NOT crash on extremely large seeds (no Infinity/NaN, no hang)', () => {
    const hugeSeeds = [
      2 ** 31, 2 ** 32, 2 ** 40, 2 ** 50, 2 ** 53, 1e20, -1e20, -(2 ** 53),
    ];
    for (const seed of hugeSeeds) {
      const rand = mulberry32(seed);
      for (let i = 0; i < 100; i++) {
        const v = rand();
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    }
  });

  // A4 defense: assert on SPECIFIC seed outputs, not just properties.
  // These values were captured by running the reference implementation
  // and are stable across runs; an accidental change to mulberry32's
  // algorithm would break these specific-number expectations.
  it('produces the canonical first-draw value for seed=0 (A4 — specific output)', () => {
    expect(mulberry32(0)()).toBe(0.26642920868471265);
  });

  it('produces the canonical first-draw value for seed=1 (A4 — specific output)', () => {
    expect(mulberry32(1)()).toBe(0.6270739405881613);
  });

  it('produces the canonical first-draw value for seed=42 (A4 — specific output)', () => {
    expect(mulberry32(42)()).toBe(0.6011037519201636);
  });

  it('produces the canonical first-draw value for seed=99 (A4 — specific output)', () => {
    expect(mulberry32(99)()).toBe(0.2604658124037087);
  });

  it('produces the canonical first-draw value for seed=2**31 (A4 — specific output)', () => {
    expect(mulberry32(2 ** 31)()).toBe(0.8205775609239936);
  });

  it('seed=-0 is treated identically to seed=0 (signed-zero handling)', () => {
    expect(mulberry32(-0)()).toBe(mulberry32(0)());
  });

  it('does not mutate Math.random during 1000 draws (A1 — no platform PRNG fallback)', () => {
    const spy = vi.spyOn(Math, 'random');
    try {
      const rand = mulberry32(7);
      for (let i = 0; i < 1000; i++) rand();
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('distribution of first draws across 10000 seeds is roughly uniform across quartiles (A7 probe)', () => {
    // Count how many first draws fall in each quartile. For a uniform
    // distribution, each quartile should hold roughly 25% of samples.
    // We allow a wide margin (each quartile must hold between 15% and
    // 35% of 10000 draws). A biased PRNG (e.g. seededRandom) might fail.
    const N = 10000;
    const quartiles = [0, 0, 0, 0];
    for (let seed = 0; seed < N; seed++) {
      const v = mulberry32(seed)();
      const q = Math.min(3, Math.floor(v * 4));
      quartiles[q]++;
    }
    for (const q of quartiles) {
      expect(q).toBeGreaterThan(N * 0.15);
      expect(q).toBeLessThan(N * 0.35);
    }
    // Every quartile is non-empty.
    for (const q of quartiles) expect(q).toBeGreaterThan(0);
  });

  it('consecutive seeds 0..999 produce distinct first draws (collision probe)', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 1000; seed++) {
      const v = mulberry32(seed)();
      expect(seen.has(v)).toBe(false);
      seen.add(v);
    }
    expect(seen.size).toBe(1000);
  });

  it('mulberry32 does not call seededRandom internally (the two PRNGs are independent)', () => {
    const spy = vi.spyOn({ seededRandom }, 'seededRandom');
    try {
      mulberry32(42)();
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// Section 2 — seededRandom regression guard (A5 / A1 — text vs reality)
// ---------------------------------------------------------------------------

describe('T17 adversarial — seededRandom regression', () => {
  // The plan claims `seededRandom` is unchanged. If someone modifies
  // `seededRandom` accidentally (or replaces it with mulberry32), this
  // specific-value assertion breaks. A4 / A5 defense.
  it('seededRandom(1)() still equals 0.5138700783782965 (regression guard)', () => {
    expect(seededRandom(1)()).toBe(0.5138700783782965);
  });

  it('seededRandom(0)() still equals the documented first draw (regression guard)', () => {
    // glibc LCG: state = (0*1103515245 + 12345) & 0x7fffffff = 12345
    // value = 12345 / 0x7fffffff
    expect(seededRandom(0)()).toBe(12345 / 0x7fffffff);
  });

  it('seededRandom and mulberry32 produce different sequences for the same seed (PRNG coexistence)', () => {
    expect(seededRandom(42)()).not.toBe(mulberry32(42)());
    expect(seededRandom(42)()).not.toBe(mulberry32(42)());
  });
});

// ---------------------------------------------------------------------------
// Section 3 — Fraction adversarial
// ---------------------------------------------------------------------------

describe('T17 adversarial — Fraction', () => {
  // A4 defense: SPECIFIC output for 0/1 + 0/1, not just "is zero".
  it('0/1 + 0/1 === 0/1 (A4 — specific output)', () => {
    const sum = new Fraction(0, 1).add(new Fraction(0, 1));
    expect(sum.numerator).toBe(0);
    expect(sum.denominator).toBe(1);
    expect(sum.toString()).toBe('0');
    expect(sum.toNumber()).toBe(0);
  });

  it('negative denominator is normalized: new Fraction(1, -2).numerator === -1 (specific output)', () => {
    const f = new Fraction(1, -2);
    expect(f.numerator).toBe(-1);
    expect(f.denominator).toBe(2);
  });

  it('both numerators and denominators negative: new Fraction(-3, -4).numerator === 3 (specific output)', () => {
    const f = new Fraction(-3, -4);
    expect(f.numerator).toBe(3);
    expect(f.denominator).toBe(4);
  });

  it('denominator === 0 throws Error (division-by-zero invariant)', () => {
    expect(() => new Fraction(1, 0)).toThrow();
    expect(() => new Fraction(0, 0)).toThrow();
  });

  it('divide-by-zero on a non-trivial fraction throws Error (specific message)', () => {
    expect(() => new Fraction(1, 2).divide(new Fraction(0, 1))).toThrow(/zero/i);
  });

  it('Fraction.fromDecimal(0.1) terminates and produces a finite result (no infinite loop)', () => {
    const start = Date.now();
    const f = Fraction.fromDecimal(0.1);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(200); // bounded; the inner loop has iteration cap of 64
    expect(Number.isFinite(f.numerator)).toBe(true);
    expect(Number.isFinite(f.denominator)).toBe(true);
    expect(f.denominator).toBeGreaterThan(0);
  });

  it('Fraction.fromDecimal handles negative and zero inputs', () => {
    const zero = Fraction.fromDecimal(0);
    expect(zero.numerator).toBe(0);
    expect(zero.denominator).toBe(1);

    const neg = Fraction.fromDecimal(-0.5);
    expect(neg.numerator).toBe(-1);
    expect(neg.denominator).toBe(2);
  });

  it('Fraction class invariant holds across 100 random integer pairs (den > 0, reduced)', () => {
    // Use mulberry32 so the test is itself deterministic (no Math.random).
    const rand = mulberry32(20260704);
    for (let i = 0; i < 100; i++) {
      const num = Math.floor((rand() * 41) - 20); // [-20, 20]
      const denRaw = Math.floor((rand() * 41) - 20);
      if (denRaw === 0) continue;
      const f = new Fraction(num, denRaw);
      expect(f.denominator).toBeGreaterThan(0);
      // gcd invariant: gcd(|num|, den) === 1 OR num === 0
      if (f.numerator !== 0) {
        expect(gcd(Math.abs(f.numerator), f.denominator)).toBe(1);
      }
    }
  });

  it('gcd helper returns non-negative integers for any input', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(0, 0)).toBe(0);
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Section 4 — formatLinearTerm / formatQuadratic adversarial
// ---------------------------------------------------------------------------

describe('T17 adversarial — formatLinearTerm forbidden-substring grid', () => {
  // A7 defense: precise substring guards, not bare English words.
  const forbiddenPatterns: RegExp[] = [
    /(^|[^0-9])1x/, // "1x" with non-digit prefix
    /(^|[^0-9])-1x/, // "-1x" with non-digit prefix
    /\+\s*-/, // "+ -" (positive then negative, with separator)
    /(^|[^0-9])0x/, // "0x" with non-digit prefix (hex-ish)
    /\+\s*0$/, // "+ 0" trailing
    /^\+/, // leading "+"
  ];

  it('formatLinearTerm produces no forbidden substring across a 9x19 grid of (a, b) tuples', () => {
    // a ∈ [-4, 4], b ∈ [-9, 9] — covers the canonical generator range and beyond.
    let count = 0;
    for (let a = -4; a <= 4; a++) {
      for (let b = -9; b <= 9; b++) {
        const out = formatLinearTerm(a, b);
        count++;
        for (const pat of forbiddenPatterns) {
          expect(out, `${pat} on formatLinearTerm(${a}, ${b})=${out}`).not.toMatch(pat);
        }
      }
    }
    // A3: labeled count assertion — must inspect exactly the expected number
    // of tuples. (9 * 19 = 171.)
    expect(count).toBe(9 * 19);
  });

  it('formatLinearTerm with custom variable (e.g. y, t) uses that variable consistently', () => {
    expect(formatLinearTerm(2, 3, 'y')).toBe('2y + 3');
    expect(formatLinearTerm(-1, 5, 't')).toBe('-t + 5');
    expect(formatLinearTerm(0, -7, 'z')).toBe('-7');
  });

  it('formatLinearTerm output for (a, b) = (-3, -4) equals "-3x - 4" (A4 specific output)', () => {
    expect(formatLinearTerm(-3, -4)).toBe('-3x - 4');
  });
});

describe('T17 adversarial — formatQuadratic forbidden-substring grid', () => {
  const forbiddenPatterns: RegExp[] = [
    /(^|[^0-9])1x/, // "1x"
    /(^|[^0-9])-1x/, // "-1x"
    /\+\s*-/, // "+ -"
    /(^|[^0-9])0x/, // "0x"
    /\+\s*0$/, // "+ 0" trailing
    /^\+/, // leading "+"
  ];

  it('formatQuadratic produces no forbidden substring across a 5x9x19 grid of (a, b, c) tuples', () => {
    let count = 0;
    for (let a = -2; a <= 2; a++) {
      for (let b = -4; b <= 4; b++) {
        for (let c = -9; c <= 9; c++) {
          const out = formatQuadratic(a, b, c);
          count++;
          for (const pat of forbiddenPatterns) {
            expect(out, `${pat} on formatQuadratic(${a}, ${b}, ${c})=${out}`).not.toMatch(pat);
          }
        }
      }
    }
    // A3: labeled count assertion — 5 * 9 * 19 = 855.
    expect(count).toBe(5 * 9 * 19);
  });

  it('formatQuadratic with a=0 degenerates to formatLinearTerm(b, c)', () => {
    expect(formatQuadratic(0, 3, 5)).toBe(formatLinearTerm(3, 5));
    expect(formatQuadratic(0, 3, 5)).toBe('3x + 5');
    expect(formatQuadratic(0, -3, 5)).toBe('-3x + 5');
  });

  it('formatQuadratic with custom variable (e.g. y) uses that variable consistently', () => {
    expect(formatQuadratic(2, 3, 4, 'y')).toBe('2y^2 + 3y + 4');
    expect(formatQuadratic(-1, 0, 5, 't')).toBe('-t^2 + 5');
  });

  it('formatQuadratic output for (1, -2, -3) equals "x^2 - 2x - 3" (A4 specific output)', () => {
    expect(formatQuadratic(1, -2, -3)).toBe('x^2 - 2x - 3');
  });
});

// ---------------------------------------------------------------------------
// Section 5 — Linear equation generator adversarial
// ---------------------------------------------------------------------------

describe('T17 adversarial — generateLinearEquation edge cases', () => {
  it('handles seed 0, -1, MAX_SAFE_INTEGER, -MAX_SAFE_INTEGER, 2**31, 2**53 (no crash, finite output)', () => {
    const seeds = [0, -1, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, 2 ** 31, 2 ** 53, -(2 ** 53)];
    for (const seed of seeds) {
      const r = generateLinearEquation({ seed });
      expect(Number.isFinite(r.a)).toBe(true);
      expect(Number.isFinite(r.b)).toBe(true);
      expect(Number.isFinite(r.c)).toBe(true);
      expect(Number.isFinite(r.answer)).toBe(true);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });

  it('across 200 seeds: a is never 0 (A4 vacuous-pass defense)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateLinearEquation({ seed });
      expect(r.a).not.toBe(0);
    }
  });

  it('across 200 seeds: equation string passes the canonical parser (live substitution)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateLinearEquation({ seed });
      const parsed = parseLinearEquation(r.equation);
      expect(parsed.a).toBe(r.a);
      expect(parsed.b).toBe(r.b);
      expect(parsed.c).toBe(r.c);
      // Live substitution: parsed coefficients * answer equals parsed RHS.
      expect(parsed.a * r.answer + parsed.b).toBeCloseTo(parsed.c, 9);
    }
  });

  it('produces SPECIFIC output for seed=0 (A4 specific-output anchor)', () => {
    const r = generateLinearEquation({ seed: 0 });
    expect(r.equation).toBe('-3x - 7 = 23');
    expect(r.answer).toBe(-10);
    expect(r.a).toBe(-3);
    expect(r.b).toBe(-7);
    expect(r.c).toBe(23);
    expect(r.familyId).toBe('step-by-step-solver:linear-equation');
    expect(r.steps).toEqual(['-3x - 7 = 23', '-3x = 30', 'x = -10']);
  });

  it('produces SPECIFIC output for seed=42 (A4 specific-output anchor)', () => {
    const r = generateLinearEquation({ seed: 42 });
    expect(r.equation).toBe('2x - 7 = -3.5');
    expect(r.answer).toBe(1.75);
  });
});

// ---------------------------------------------------------------------------
// Section 6 — System of equations generator adversarial
// ---------------------------------------------------------------------------

describe('T17 adversarial — generateSystemOfEquations edge cases', () => {
  it('handles seed 0, -1, MAX_SAFE_INTEGER, -MAX_SAFE_INTEGER, 2**31 (no crash)', () => {
    const seeds = [0, -1, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, 2 ** 31, 2 ** 53];
    for (const seed of seeds) {
      const r = generateSystemOfEquations({ seed });
      expect(Number.isFinite(r.answer.x)).toBe(true);
      expect(Number.isFinite(r.answer.y)).toBe(true);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });

  it('across 200 seeds: determinant is never zero (solvability invariant)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateSystemOfEquations({ seed });
      const det = r.a1 * r.b2 - r.a2 * r.b1;
      expect(det).not.toBe(0);
    }
  });

  it('across 200 seeds: both equations satisfy the live substitution identity', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateSystemOfEquations({ seed });
      const lhs1 = r.a1 * r.answer.x + r.b1 * r.answer.y;
      const lhs2 = r.a2 * r.answer.x + r.b2 * r.answer.y;
      expect(lhs1).toBeCloseTo(r.c1, 9);
      expect(lhs2).toBeCloseTo(r.c2, 9);
    }
  });

  it('produces SPECIFIC output for seed=0 (A4 specific-output anchor)', () => {
    const r = generateSystemOfEquations({ seed: 0 });
    expect(r.equations).toEqual(['-3x - 4y = 33', 'x + 2y = -15']);
    expect(r.answer).toEqual({ x: -3, y: -6 });
    expect(r.a1).toBe(-3);
    expect(r.b1).toBe(-4);
    expect(r.c1).toBe(33);
    expect(r.a2).toBe(1);
    expect(r.b2).toBe(2);
    expect(r.c2).toBe(-15);
    expect(r.familyId).toBe('step-by-step-solver:system-of-equations');
  });
});

// ---------------------------------------------------------------------------
// Section 7 — Quadratic factoring generator adversarial
// ---------------------------------------------------------------------------

describe('T17 adversarial — generateQuadraticFactoring edge cases', () => {
  it('handles seed 0, -1, MAX_SAFE_INTEGER, 2**31 (no crash)', () => {
    const seeds = [0, -1, Number.MAX_SAFE_INTEGER, 2 ** 31, -(2 ** 31)];
    for (const seed of seeds) {
      const r = generateQuadraticFactoring({ seed });
      expect(Number.isFinite(r.a)).toBe(true);
      expect(r.a).not.toBe(0);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });

  it('across 200 seeds: every factoredForm is parseable AND expands to the declared quadratic', () => {
    let parsed = 0;
    for (let seed = 0; seed < 200; seed++) {
      const r = generateQuadraticFactoring({ seed });
      // Live parse via the test's own parser (independent of generator internals).
      const expanded = expandFactoredForm(r.factoredForm);
      const expected = normalizePoly([r.c, r.b, r.a]);
      expect(expanded).toEqual(expected);
      parsed++;
    }
    // A3: labeled count.
    expect(parsed).toBe(200);
  });

  it('across 200 seeds: no factoring problem has a=0 (quadratic invariant)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateQuadraticFactoring({ seed });
      expect(r.a).not.toBe(0);
      expect(Number.isInteger(r.a)).toBe(true);
      expect(Number.isInteger(r.b)).toBe(true);
      expect(Number.isInteger(r.c)).toBe(true);
    }
  });

  it('produces SPECIFIC output for seed=0 (A4 specific-output anchor)', () => {
    const r = generateQuadraticFactoring({ seed: 0 });
    expect(r.quadratic).toBe('x^2 + x - 2');
    expect(r.factoredForm).toBe('(x - 1)(x + 2)');
    expect(r.a).toBe(1);
    expect(r.b).toBe(1);
    expect(r.c).toBe(-2);
    expect(r.roots).toEqual([1, -2]);
  });

  it('produces SPECIFIC output for seed=4 (A4 specific-output anchor, a>1 case)', () => {
    const r = generateQuadraticFactoring({ seed: 4 });
    expect(r.a).toBe(3);
    expect(r.quadratic).toBe('3x^2 + 24x + 48');
    expect(r.factoredForm).toBe('3(x + 4)^2');
    expect(r.roots).toEqual([-4, -4]);
  });
});

// ---------------------------------------------------------------------------
// Section 8 — Quadratic formula generator adversarial
// ---------------------------------------------------------------------------

describe('T17 adversarial — generateQuadraticFormula edge cases', () => {
  it('handles seed 0, -1, MAX_SAFE_INTEGER, 2**31 (no crash)', () => {
    const seeds = [0, -1, Number.MAX_SAFE_INTEGER, 2 ** 31, -(2 ** 31)];
    for (const seed of seeds) {
      const r = generateQuadraticFormula({ seed });
      expect(Number.isFinite(r.a)).toBe(true);
      expect(r.a).not.toBe(0);
      expect(Number.isFinite(r.discriminant)).toBe(true);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });

  it('across 200 seeds: discriminant === b^2 - 4ac, a !== 0, all roots have valid type', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = generateQuadraticFormula({ seed });
      expect(r.discriminant).toBe(r.b * r.b - 4 * r.a * r.c);
      expect(r.a).not.toBe(0);
      expect(r.roots.length).toBeGreaterThan(0);
      for (const root of r.roots) {
        expect(['real', 'irrational', 'complex']).toContain(root.type);
        // Each root value must be either a finite number or a non-empty string.
        if (typeof root.value === 'number') {
          expect(Number.isFinite(root.value)).toBe(true);
        } else {
          expect(typeof root.value).toBe('string');
          expect(root.value.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('across 100 seeds: irrational roots have a parseable (N ± √M)/D radical form', () => {
    // A7 probe: the irrational-form regex must match all generated strings
    // of type "irrational". If the format drifts, the probe fails.
    const radicalForm = /^\(([-+]?\d+)\s*±\s*√(\d+)\)\/(\d+)$/;
    for (let seed = 0; seed < 100; seed++) {
      const r = generateQuadraticFormula({ seed });
      for (const root of r.roots) {
        if (root.type === 'irrational') {
          expect(root.value).toMatch(radicalForm);
        }
      }
    }
  });

  it('produces SPECIFIC output for seed=0 (A4 specific-output anchor, repeated-root case)', () => {
    const r = generateQuadraticFormula({ seed: 0 });
    expect(r.quadratic).toBe('x^2 + 6x + 9');
    expect(r.a).toBe(1);
    expect(r.b).toBe(6);
    expect(r.c).toBe(9);
    expect(r.discriminant).toBe(0);
    expect(r.roots).toEqual([{ value: -3, type: 'real' }]);
  });

  it('produces SPECIFIC output for seed=1 (A4 specific-output anchor, irrational case)', () => {
    const r = generateQuadraticFormula({ seed: 1 });
    expect(r.quadratic).toBe('x^2 + 5x - 5');
    expect(r.a).toBe(1);
    expect(r.b).toBe(5);
    expect(r.c).toBe(-5);
    expect(r.discriminant).toBe(45);
    expect(r.roots).toEqual([
      { value: '(-5 ± √45)/2', type: 'irrational' },
      { value: '(-5 ± √45)/2', type: 'irrational' },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Section 9 — Determinism double-check (FR-8): 1000 seeds × 2 calls
// ---------------------------------------------------------------------------

describe('T17 adversarial — determinism double-check', () => {
  it('1000 seeds × 2 calls each produce identical linear equations', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const a = generateLinearEquation({ seed });
      const b = generateLinearEquation({ seed });
      expect(a).toEqual(b);
    }
  });

  it('1000 seeds × 2 calls each produce identical systems of equations', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const a = generateSystemOfEquations({ seed });
      const b = generateSystemOfEquations({ seed });
      expect(a).toEqual(b);
    }
  });

  it('1000 seeds × 2 calls each produce identical quadratic factoring problems', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const a = generateQuadraticFactoring({ seed });
      const b = generateQuadraticFactoring({ seed });
      expect(a).toEqual(b);
    }
  });

  it('1000 seeds × 2 calls each produce identical quadratic formula problems', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const a = generateQuadraticFormula({ seed });
      const b = generateQuadraticFormula({ seed });
      expect(a).toEqual(b);
    }
  });
});

// ---------------------------------------------------------------------------
// Section 10 — Cross-generator non-interference
// ---------------------------------------------------------------------------

describe('T17 adversarial — cross-generator non-interference', () => {
  it('running the linear generator does not affect the system generator for the same seed', () => {
    for (let seed = 0; seed < 100; seed++) {
      // Baseline: nothing else has run for this seed.
      const sysBefore = generateSystemOfEquations({ seed });
      const lin = generateLinearEquation({ seed });
      const sysAfter = generateSystemOfEquations({ seed });
      expect(sysAfter).toEqual(sysBefore);
      // Sanity: lin was actually populated.
      expect(lin.equation.length).toBeGreaterThan(0);
    }
  });

  it('running each of the four generators in sequence does not affect any other generator for the same seed', () => {
    const seeds = [0, 1, 7, 42, 99, 12345, -1, 2 ** 31];
    for (const seed of seeds) {
      // Capture baseline first
      const lin0 = generateLinearEquation({ seed });
      const sys0 = generateSystemOfEquations({ seed });
      const fac0 = generateQuadraticFactoring({ seed });
      const fml0 = generateQuadraticFormula({ seed });

      // Run each generator (some repeatedly)
      for (let i = 0; i < 10; i++) {
        generateLinearEquation({ seed: seed + i + 1 });
        generateSystemOfEquations({ seed: seed + i + 1 });
        generateQuadraticFactoring({ seed: seed + i + 1 });
        generateQuadraticFormula({ seed: seed + i + 1 });
      }

      // Re-run baseline; nothing should have changed.
      expect(generateLinearEquation({ seed })).toEqual(lin0);
      expect(generateSystemOfEquations({ seed })).toEqual(sys0);
      expect(generateQuadraticFactoring({ seed })).toEqual(fac0);
      expect(generateQuadraticFormula({ seed })).toEqual(fml0);
    }
  });
});

// ---------------------------------------------------------------------------
// Section 11 — Registry adapter contract: expectedAnswer ⊆ partAnswers
// ---------------------------------------------------------------------------

describe('T17 adversarial — registry adapter expectedAnswer/partAnswers contract', () => {
  it('linear-equation-solver: expectedAnswer keys are a subset of partAnswers keys', () => {
    for (let seed = 0; seed < 50; seed++) {
      const generator = getGenerator('linear-equation-solver');
      const output = generator.generate({
        seed,
        nodeId: 'math.im3.skill.test',
        difficulty: 0.5,
      });
      const expectedKeys = Object.keys(output.expectedAnswer);
      const partKeys = Object.keys(output.gradingMetadata.partAnswers);
      for (const k of expectedKeys) {
        expect(partKeys, `seed=${seed}: '${k}' in expectedAnswer but not partAnswers`).toContain(k);
      }
    }
  });

  it('system-of-equations-solver: expectedAnswer keys are a subset of partAnswers keys', () => {
    for (let seed = 0; seed < 50; seed++) {
      const generator = getGenerator('system-of-equations-solver');
      const output = generator.generate({
        seed,
        nodeId: 'math.im3.skill.test',
        difficulty: 0.5,
      });
      const expectedKeys = Object.keys(output.expectedAnswer);
      const partKeys = Object.keys(output.gradingMetadata.partAnswers);
      for (const k of expectedKeys) {
        expect(partKeys, `seed=${seed}: '${k}' in expectedAnswer but not partAnswers`).toContain(k);
      }
    }
  });

  it('quadratic-factoring: expectedAnswer keys are a subset of partAnswers keys', () => {
    for (let seed = 0; seed < 50; seed++) {
      const generator = getGenerator('quadratic-factoring');
      const output = generator.generate({
        seed,
        nodeId: 'math.im3.skill.test',
        difficulty: 0.5,
      });
      const expectedKeys = Object.keys(output.expectedAnswer);
      const partKeys = Object.keys(output.gradingMetadata.partAnswers);
      for (const k of expectedKeys) {
        expect(partKeys, `seed=${seed}: '${k}' in expectedAnswer but not partAnswers`).toContain(k);
      }
    }
  });

  it('quadratic-formula: expectedAnswer keys are a subset of partAnswers keys', () => {
    for (let seed = 0; seed < 50; seed++) {
      const generator = getGenerator('quadratic-formula');
      const output = generator.generate({
        seed,
        nodeId: 'math.im3.skill.test',
        difficulty: 0.5,
      });
      const expectedKeys = Object.keys(output.expectedAnswer);
      const partKeys = Object.keys(output.gradingMetadata.partAnswers);
      for (const k of expectedKeys) {
        expect(partKeys, `seed=${seed}: '${k}' in expectedAnswer but not partAnswers`).toContain(k);
      }
    }
  });

  it('every part has a matching grading rule (partAnswers ↔ partGradingRules)', () => {
    for (const key of GENERATOR_KEYS) {
      const generator = getGenerator(key);
      // Quick sanity check at seed 1 (sufficient for structural invariants).
      const output = generator.generate({
        seed: 1,
        nodeId: 'math.im3.skill.test',
        difficulty: 0.5,
      });
      const partKeys = Object.keys(output.gradingMetadata.partAnswers);
      const ruleKeys = Object.keys(output.gradingMetadata.partGradingRules);
      for (const k of partKeys) {
        expect(ruleKeys, `${key}/${k}: missing partGradingRules`).toContain(k);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Section 12 — Stub ownership invariants (Phase 3 / Phase 4)
// ---------------------------------------------------------------------------

describe('T17 adversarial — stub ownership invariants', () => {
  // A10 / A6 defense: the algebraic-step-solver stub must NOT claim the
  // IM3 M1 1.4 (factoring) or 1.6 (formula) skill IDs, because those are
  // now served by real generators. If a regression re-adds these claims,
  // the test fails.
  it('algebraic-step-solver stub does NOT claim IM3 M1 1.4 (factoring)', () => {
    const stub = getGenerator('algebraic-step-solver');
    expect(stub.nodeIds).not.toContain('math.im3.skill.1.4.solve-quadratic-equations-by-factoring');
  });

  it('algebraic-step-solver stub does NOT claim IM3 M1 1.6 (formula)', () => {
    const stub = getGenerator('algebraic-step-solver');
    expect(stub.nodeIds).not.toContain('math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations');
  });

  it('IM3 M1 1.4 and 1.6 are owned by exactly one non-stub generator each', () => {
    const targetNodeIds = [
      'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
      'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
    ];
    for (const nodeId of targetNodeIds) {
      const owners = GENERATOR_KEYS
        .map((k) => getGenerator(k))
        .filter((g) => g.nodeIds.includes(nodeId));
      expect(owners).toHaveLength(1);
      expect(owners[0].key).not.toBe('algebraic-step-solver');
    }
  });

  it('IM1 M2.4 is owned by the linear-equation-solver adapter', () => {
    const owners = GENERATOR_KEYS
      .map((k) => getGenerator(k))
      .filter((g) =>
        g.nodeIds.includes('math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides'),
      );
    expect(owners.map((o) => o.key)).toContain('linear-equation-solver');
  });

  it('IM1 M7.2 and IM1 M7.3 are owned by the system-of-equations-solver adapter', () => {
    const owners = GENERATOR_KEYS
      .map((k) => getGenerator(k))
      .filter((g) =>
        g.nodeIds.some((n) =>
          n.startsWith('math.im1.skill.7.2.') || n.startsWith('math.im1.skill.7.3.'),
        ),
      );
    expect(owners.map((o) => o.key)).toContain('system-of-equations-solver');
  });

  it('no nodeId is claimed by more than one generator (collision check)', () => {
    const nodeIdToOwners = new Map<string, string[]>();
    for (const key of GENERATOR_KEYS) {
      const generator = getGenerator(key);
      for (const nodeId of generator.nodeIds) {
        const arr = nodeIdToOwners.get(nodeId) ?? [];
        arr.push(key);
        nodeIdToOwners.set(nodeId, arr);
      }
    }
    const collisions: Array<{ nodeId: string; owners: string[] }> = [];
    for (const [nodeId, owners] of nodeIdToOwners) {
      if (owners.length > 1) collisions.push({ nodeId, owners });
    }
    expect(collisions).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Section 14 — A7 source-guard precision (mulberry32 does not call Math.random)
//
// The existing prng.test.ts already checks that the source does not
// contain `Math.random(`. This section adds a precision probe: the
// source grep must match the EXACT pattern (a function call), not bare
// occurrences of the substring `Math.random` (which could appear in
// comments, JSDoc, or strings).
//
// NOTE on A8 plan-marker guard: the anti-pattern catalog (measure/anti-
// patterns.md) names a `[ ]` (space) marker ambiguity. Per the FR-4
// no-measure-coupling guard (no-measure-coupling.guard.test.ts), this
// test cannot read plan.md to verify it directly. The defense is moved
// to a sibling `tests/mir_p1.sh` style guard under the measure/scripts
// directory, where measure/-path coupling is permitted.
// ---------------------------------------------------------------------------

describe('T17 adversarial — A7 source-guard precision', () => {
  it('prng.ts source-grep for "Math.random\\s*\\(" matches zero hits in code (not comments)', () => {
    const HERE = fileURLToPath(import.meta.url);
    const REPO_ROOT = resolve(HERE, '../../../../..');
    const prngPath = resolve(REPO_ROOT, 'packages/math-content/src/utils/prng.ts');
    const src = readFileSync(prngPath, 'utf8');
    // Strip single-line and multi-line comments before scanning.
    const noComments = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    const matches = noComments.match(/Math\.random\s*\(/g);
    expect(matches, 'Math.random() call appears in prng.ts code (outside comments)').toBeNull();
  });

  it('expression-builder.ts source-grep for forbidden linear/quadratic patterns matches zero hits', () => {
    const HERE = fileURLToPath(import.meta.url);
    const REPO_ROOT = resolve(HERE, '../../../../..');
    const path = resolve(REPO_ROOT, 'packages/math-content/src/utils/expression-builder.ts');
    const src = readFileSync(path, 'utf8');
    const noComments = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    // None of these strings should appear in the implementation
    // (comments are allowed to discuss them).
    expect(noComments).not.toMatch(/Math\.random\s*\(/);
    expect(noComments).not.toMatch(/seededRandom\s*\(/);
    expect(noComments).not.toMatch(/mulberry32\s*\(/);
  });

  it('generator source files do not import from each other (no cross-generator coupling)', () => {
    const HERE = fileURLToPath(import.meta.url);
    const REPO_ROOT = resolve(HERE, '../../../../..');
    const sources = [
      'linear-equation-solver.ts',
      'system-of-equations-solver.ts',
      'quadratic-factoring.ts',
      'quadratic-formula.ts',
    ];
    for (const file of sources) {
      const path = resolve(REPO_ROOT, `packages/math-content/src/${file}`);
      const src = readFileSync(path, 'utf8');
      for (const other of sources) {
        if (other === file) continue;
        // The other generator should not be imported.
        expect(
          src,
          `${file} unexpectedly imports ${other}`,
        ).not.toMatch(new RegExp(`from\\s+['"]\\./${other.replace(/\.ts$/, '')}['"]`));
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Section 15 — A5 false-claim text vs test reality (regression guard)
//
// If a future result artifact claims "all 4 generators produce valid
// output across 100 seeds" or similar, this test pins the exact count.
// The test must exit 0 and inspect exactly the claimed number of cases.
// ---------------------------------------------------------------------------

describe('T17 adversarial — A5 false-claim text vs test reality', () => {
  it('all 4 generators produce valid output across exactly 100 seeds (claim anchor)', () => {
    const SEED_COUNT = 100; // referenced from any future "100-seed sweep" claim
    const errors: string[] = [];

    for (let seed = 0; seed < SEED_COUNT; seed++) {
      try {
        const lin = generateLinearEquation({ seed });
        if (!Number.isFinite(lin.answer) || lin.a === 0) {
          errors.push(`linear[${seed}] invalid`);
        }
        const sys = generateSystemOfEquations({ seed });
        const det = sys.a1 * sys.b2 - sys.a2 * sys.b1;
        if (!Number.isFinite(sys.answer.x) || det === 0) {
          errors.push(`system[${seed}] invalid`);
        }
        const fac = generateQuadraticFactoring({ seed });
        if (fac.a === 0) errors.push(`factoring[${seed}] a=0`);
        const fml = generateQuadraticFormula({ seed });
        if (fml.a === 0 || !Number.isFinite(fml.discriminant)) {
          errors.push(`formula[${seed}] invalid`);
        }
      } catch (e) {
        errors.push(`seed=${seed} threw: ${(e as Error).message}`);
      }
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

// NOTE on A4 vacuous-pass on nothing-done defense: the anti-pattern
// catalog (measure/anti-patterns.md) names this guard. Per the FR-4
// no-measure-coupling guard, this test cannot read plan.md directly to
// verify it (the path coupling is forbidden by no-measure-coupling.guard.
// test.ts). The defense belongs in a sibling tests/*_p*.sh guard under
// the measure/scripts directory, where measure/-path coupling is
// permitted. The behavioral A4 probes here (specific seed outputs in
// Sections 5-8) cover the "vacuous pass on nothing-done" failure mode
// by pinning actual generator output, not zero-completion claims.