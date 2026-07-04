import { describe, it, expect, vi } from 'vitest';
import { generateQuadraticFormula } from '../quadratic-formula';
import * as prng from '../utils/prng';

/**
 * quadratic-formula.ts — Quadratic formula problem generator
 *
 * Track: core-algebra-generators_20260510 (T17) Phase 3
 *
 * generateQuadraticFormula({ seed }) returns a quadratic a*x^2 + b*x + c,
 * its discriminant, and its roots rendered as numeric or radical strings.
 */

interface QuadraticFormulaRoot {
  value: number | string;
  type: 'real' | 'irrational' | 'complex';
}

interface QuadraticFormulaProblem {
  quadratic: string;
  a: number;
  b: number;
  c: number;
  discriminant: number;
  roots: QuadraticFormulaRoot[];
  steps: string[];
}

// ---------------------------------------------------------------------------
// Radical / complex root parser (test-only, independent of generator)
// ---------------------------------------------------------------------------

interface EvaluatedRoot {
  value: number;
  isComplex: boolean;
  imag?: number;
}

function evaluateRoot(root: number | string): EvaluatedRoot {
  if (typeof root === 'number') {
    return { value: root, isComplex: false };
  }

  const s = root.replace(/\s/g, '');

  // Complex with explicit + or -, e.g. "(2 + i√3)/4" or "(2 - i√3)/4".
  const complexExplicit = s.match(/^\(([-+]?\d+)\s*([+-])\s*i√(\d+)\)\/(\d+)$/);
  if (complexExplicit) {
    const real = Number(complexExplicit[1]) / Number(complexExplicit[4]);
    const imag = Number(complexExplicit[3] === '0' ? 0 : complexExplicit[3]) / Number(complexExplicit[4]);
    return { value: real, isComplex: true, imag: complexExplicit[2] === '+' ? imag : -imag };
  }

  // Complex with ±, e.g. "(2 ± i√3)/4".
  const complexPlusMinus = s.match(/^\(([-+]?\d+)\s*±\s*i√(\d+)\)\/(\d+)$/);
  if (complexPlusMinus) {
    const real = Number(complexPlusMinus[1]) / Number(complexPlusMinus[3]);
    const imag = Number(complexPlusMinus[2]) / Number(complexPlusMinus[3]);
    return { value: real, isComplex: true, imag };
  }

  // Radical with ±, e.g. "(3 ± √5)/2".
  const radicalPlusMinus = s.match(/^\(([-+]?\d+)\s*±\s*√(\d+)\)\/(\d+)$/);
  if (radicalPlusMinus) {
    const aTerm = Number(radicalPlusMinus[1]);
    const rad = Number(radicalPlusMinus[2]);
    const den = Number(radicalPlusMinus[3]);
    return { value: (aTerm + Math.sqrt(rad)) / den, isComplex: false };
  }

  // Radical with explicit sign, e.g. "(3 + √5)/2" or "(3 - √5)/2".
  const radicalExplicit = s.match(/^\(([-+]?\d+)\s*([+-])\s*√(\d+)\)\/(\d+)$/);
  if (radicalExplicit) {
    const aTerm = Number(radicalExplicit[1]);
    const sign = radicalExplicit[2] === '+' ? 1 : -1;
    const rad = Number(radicalExplicit[3]);
    const den = Number(radicalExplicit[4]);
    return { value: (aTerm + sign * Math.sqrt(rad)) / den, isComplex: false };
  }

  // Plain integer or decimal.
  if (/^[-+]?\d+(\.\d+)?$/.test(s)) {
    return { value: Number(s), isComplex: false };
  }

  throw new Error(`Cannot parse quadratic formula root: "${root}"`);
}

function evaluateAt(a: number, b: number, c: number, x: number): number {
  return a * x * x + b * x + c;
}

function isPerfectSquare(n: number): boolean {
  if (n < 0) return false;
  const root = Math.floor(Math.sqrt(n));
  return root * root === n;
}

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

describe('quadratic-formula return shape', () => {
  it('returns all required top-level keys', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    expect(r).toHaveProperty('quadratic');
    expect(r).toHaveProperty('a');
    expect(r).toHaveProperty('b');
    expect(r).toHaveProperty('c');
    expect(r).toHaveProperty('discriminant');
    expect(r).toHaveProperty('roots');
    expect(r).toHaveProperty('steps');
  });

  it('quadratic is a non-empty string', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    expect(typeof r.quadratic).toBe('string');
    expect(r.quadratic.length).toBeGreaterThan(0);
  });

  it('coefficients a, b, c are finite numbers and a is not zero', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    expect(Number.isFinite(r.a)).toBe(true);
    expect(Number.isFinite(r.b)).toBe(true);
    expect(Number.isFinite(r.c)).toBe(true);
    expect(r.a).not.toBe(0);
  });

  it('discriminant is a finite integer', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    expect(Number.isFinite(r.discriminant)).toBe(true);
    expect(Number.isInteger(r.discriminant)).toBe(true);
  });

  it('roots is an array of { value, type } entries', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    expect(Array.isArray(r.roots)).toBe(true);
    expect(r.roots.length).toBeGreaterThan(0);
    for (const root of r.roots) {
      expect(root).toHaveProperty('value');
      expect(root).toHaveProperty('type');
      expect(['real', 'irrational', 'complex']).toContain(root.type);
    }
  });

  it('steps is a non-empty string array', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
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

describe('quadratic-formula determinism', () => {
  it('same seed produces identical output', () => {
    const a = generateQuadraticFormula({ seed: 1 });
    const b = generateQuadraticFormula({ seed: 1 });
    expect(a).toEqual(b);
  });

  it('same seed produces identical output across 10 consecutive seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const first = generateQuadraticFormula({ seed });
      const second = generateQuadraticFormula({ seed });
      expect(first).toEqual(second);
    }
  });

  it('different seeds produce different output', () => {
    const a = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    const b = generateQuadraticFormula({ seed: 99 }) as QuadraticFormulaProblem;
    const same =
      a.quadratic === b.quadratic &&
      a.discriminant === b.discriminant &&
      a.a === b.a &&
      a.b === b.b &&
      a.c === b.c;
    expect(same).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Backward-generation correctness falsifier
// ---------------------------------------------------------------------------

describe('quadratic-formula backward-generation correctness', () => {
  it('declared rational roots satisfy the quadratic for seed 1', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    for (const root of r.roots) {
      if (root.type === 'real' && typeof root.value === 'number') {
        expect(evaluateAt(r.a, r.b, r.c, root.value)).toBeCloseTo(0, 9);
      }
    }
  });

  it('rational real roots satisfy the quadratic across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateQuadraticFormula({ seed }) as QuadraticFormulaProblem;
      for (const root of r.roots) {
        if (root.type === 'real' && typeof root.value === 'number') {
          expect(evaluateAt(r.a, r.b, r.c, root.value)).toBeCloseTo(0, 9);
        }
      }
    }
  });

  it('irrational roots satisfy the quadratic across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateQuadraticFormula({ seed }) as QuadraticFormulaProblem;
      for (const root of r.roots) {
        if (root.type === 'irrational' && typeof root.value === 'string') {
          const parsed = evaluateRoot(root.value);
          expect(parsed.isComplex).toBe(false);
          expect(evaluateAt(r.a, r.b, r.c, parsed.value)).toBeCloseTo(0, 9);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Discriminant consistency
// ---------------------------------------------------------------------------

describe('quadratic-formula discriminant consistency', () => {
  it('discriminant equals b^2 - 4ac for seed 1', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    expect(r.discriminant).toBe(r.b * r.b - 4 * r.a * r.c);
  });

  it('discriminant equals b^2 - 4ac across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = generateQuadraticFormula({ seed }) as QuadraticFormulaProblem;
      expect(r.discriminant).toBe(r.b * r.b - 4 * r.a * r.c);
    }
  });
});

// ---------------------------------------------------------------------------
// Formatting guards
// ---------------------------------------------------------------------------

describe('quadratic-formula formatting guards', () => {
  it('quadratic string never contains forbidden formatting artifacts', () => {
    for (let seed = 0; seed < 50; seed++) {
      const r = generateQuadraticFormula({ seed }) as QuadraticFormulaProblem;
      expect(r.quadratic).not.toMatch(/(^|[^0-9])1x\^2/);
      expect(r.quadratic).not.toMatch(/(^|[^0-9])-1x\^2/);
      expect(r.quadratic).not.toMatch(/\+\s*-/);
      expect(r.quadratic).not.toMatch(/^\+/);
    }
  });
});

// ---------------------------------------------------------------------------
// Step content
// ---------------------------------------------------------------------------

describe('quadratic-formula solution steps', () => {
  it('steps include the required quadratic-formula phrases', () => {
    const r = generateQuadraticFormula({ seed: 1 }) as QuadraticFormulaProblem;
    const joined = r.steps.join('\n').toLowerCase();
    expect(joined).toContain('a');
    expect(joined).toContain('b');
    expect(joined).toContain('c');
    expect(joined).toContain('discriminant');
    expect(joined).toMatch(/root\s*type|nature/);
    expect(joined).toContain('quadratic formula');
    expect(joined).toContain('simplify');
  });
});

// ---------------------------------------------------------------------------
// Case coverage
// ---------------------------------------------------------------------------

describe('quadratic-formula case coverage', () => {
  it('covers all required root regimes across 100 seeds', () => {
    let twoIntegerRoots = false;
    let twoIrrationalRoots = false;
    let repeatedRoot = false;
    let complexConjugate = false;
    let monic = false;
    let aGreaterThanOne = false;

    for (let seed = 0; seed < 100; seed++) {
      const r = generateQuadraticFormula({ seed }) as QuadraticFormulaProblem;

      if (r.a === 1) monic = true;
      if (r.a > 1) aGreaterThanOne = true;

      if (r.discriminant === 0) {
        repeatedRoot = true;
      } else if (r.discriminant > 0) {
        if (isPerfectSquare(r.discriminant)) {
          const allReal = r.roots.every((root) => root.type === 'real');
          const allInteger = r.roots.every(
            (root) => root.type === 'real' && typeof root.value === 'number' && Number.isInteger(root.value),
          );
          if (allReal && allInteger) twoIntegerRoots = true;
        } else {
          const allIrrational = r.roots.every((root) => root.type === 'irrational');
          if (allIrrational) twoIrrationalRoots = true;
        }
      } else {
        const allComplex = r.roots.every((root) => root.type === 'complex');
        if (allComplex) complexConjugate = true;
      }
    }

    expect(twoIntegerRoots).toBe(true);
    expect(twoIrrationalRoots).toBe(true);
    expect(repeatedRoot).toBe(true);
    expect(complexConjugate).toBe(true);
    expect(monic).toBe(true);
    expect(aGreaterThanOne).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Single-pass generation (no re-roll) — FR-8
// ---------------------------------------------------------------------------

describe('quadratic-formula single-pass generation', () => {
  it('makes exactly one call to mulberry32 per generation', () => {
    const spy = vi.spyOn(prng, 'mulberry32');
    try {
      for (let seed = 1; seed <= 20; seed++) {
        spy.mockClear();
        generateQuadraticFormula({ seed });
        expect(spy).toHaveBeenCalledTimes(1);
      }
    } finally {
      spy.mockRestore();
    }
  });
});
