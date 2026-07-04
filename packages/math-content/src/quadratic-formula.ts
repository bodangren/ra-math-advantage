/**
 * Quadratic Formula Generator
 *
 * Generates a quadratic a x^2 + b x + c = 0 together with its roots
 * (computed via the quadratic formula) and step-by-step solution.
 *
 * Four regimes distributed by the first PRNG draw so that 100 seeds cover:
 *   - two integer roots  (disc > 0, perfect square, a=1 or 2)
 *   - repeated root      (disc = 0)
 *   - two irrational     (disc > 0, not perfect square, forward-gen)
 *   - complex conjugate  (disc < 0, forward-gen)
 *
 * Deterministic: same seed → identical output. Uses mulberry32.
 */

import { mulberry32 } from './utils/prng';
import { formatQuadratic } from './utils/expression-builder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuadraticFormulaRootType = 'real' | 'irrational' | 'complex';

export interface QuadraticFormulaRoot {
  value: number | string;
  type: QuadraticFormulaRootType;
}

export interface QuadraticFormulaProblem {
  quadratic: string;
  a: number;
  b: number;
  c: number;
  discriminant: number;
  roots: QuadraticFormulaRoot[];
  steps: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randInt(rand: () => number, lo: number, hi: number): number {
  return Math.floor(rand() * (hi - lo + 1)) + lo;
}

function randNonZero(rand: () => number, hi: number): number {
  let n: number;
  let safety = 0;
  do {
    n = randInt(rand, -hi, hi);
  } while (n === 0 && safety++ < 100);
  if (n === 0) {
    throw new Error('randNonZero: unable to select a non-zero value after 100 attempts');
  }
  return n;
}

function isPerfectSquare(n: number): boolean {
  if (n < 0) return false;
  const r = Math.floor(Math.sqrt(n));
  return r * r === n;
}

// ---------------------------------------------------------------------------
// Case generators
// ---------------------------------------------------------------------------

interface Case {
  a: number;
  b: number;
  c: number;
  roots: QuadraticFormulaRoot[];
  rootKind: 'integer' | 'repeated' | 'irrational' | 'complex';
  rootTypeDesc: string;
}

function caseIntegerRoots(rand: () => number): Case {
  const a = rand() < 0.5 ? 1 : randInt(rand, 2, 3);
  const r1 = randNonZero(rand, 5);
  let r2 = randNonZero(rand, 5);
  let safety = 0;
  while (r2 === r1 && safety++ < 20) r2 = randNonZero(rand, 5);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  return {
    a, b, c,
    roots: [
      { value: r1, type: 'real' },
      { value: r2, type: 'real' },
    ],
    rootKind: 'integer',
    rootTypeDesc: 'two distinct real integer roots',
  };
}

function caseRepeated(rand: () => number): Case {
  const a = rand() < 0.5 ? 1 : randInt(rand, 2, 3);
  const r = randNonZero(rand, 5);
  const b = -2 * a * r;
  const c = a * r * r;
  return {
    a, b, c,
    roots: [{ value: r, type: 'real' }],
    rootKind: 'repeated',
    rootTypeDesc: 'one repeated real root',
  };
}

function caseIrrational(rand: () => number): Case {
  const a = rand() < 0.6 ? 1 : 2;
  const b = randNonZero(rand, 5);
  // Iterate c from -6..6 to find a valid irrational case.
  let chosen: { a: number; b: number; c: number } | null = null;
  for (let c = -6; c <= 6; c++) {
    if (c === 0) continue;
    const disc = b * b - 4 * a * c;
    if (disc > 0 && !isPerfectSquare(disc)) {
      chosen = { a, b, c };
      break;
    }
  }
  if (!chosen) {
    chosen = { a: 1, b: 1, c: -1 }; // fallback: x^2 + x - 1 = 0, disc=5
  }
  const { a: aa, b: bb, c: cc } = chosen;
  const disc = bb * bb - 4 * aa * cc;
  const negB = -bb;
  const den = 2 * aa;
  const rootStr = `(${negB} ± √${disc})/${den}`;
  return {
    a: aa, b: bb, c: cc,
    roots: [
      { value: rootStr, type: 'irrational' },
      { value: rootStr, type: 'irrational' },
    ],
    rootKind: 'irrational',
    rootTypeDesc: 'two irrational roots (radical form)',
  };
}

function caseComplex(rand: () => number): Case {
  const a = rand() < 0.6 ? 1 : 2;
  const b = randInt(rand, -4, 4);
  let chosen: { a: number; b: number; c: number } | null = null;
  for (let c = 1; c <= 6; c++) {
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      chosen = { a, b, c };
      break;
    }
  }
  if (!chosen) {
    chosen = { a: 1, b: 0, c: 1 }; // fallback: x^2 + 1 = 0, disc=-4
  }
  const { a: aa, b: bb, c: cc } = chosen;
  const disc = bb * bb - 4 * aa * cc;
  const negB = -bb;
  const radMag = -disc;
  const den = 2 * aa;
  const rootStr = `(${negB} ± i√${radMag})/${den}`;
  return {
    a: aa, b: bb, c: cc,
    roots: [
      { value: rootStr, type: 'complex' },
      { value: rootStr, type: 'complex' },
    ],
    rootKind: 'complex',
    rootTypeDesc: 'two complex conjugate roots',
  };
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function buildSteps(
  a: number,
  b: number,
  c: number,
  disc: number,
  rootTypeDesc: string,
  rootSample: string,
): string[] {
  const steps: string[] = [];
  steps.push(`Identify the coefficients: a = ${a}, b = ${b}, c = ${c}. The quadratic is ${formatQuadratic(a, b, c)}.`);
  steps.push(`Compute the discriminant: b^2 - 4ac = ${b}^2 - 4(${a})(${c}) = ${disc}.`);
  steps.push(`Because the discriminant is ${disc > 0 ? 'positive' : disc === 0 ? 'zero' : 'negative'}, the root type (nature) is ${rootTypeDesc}.`);
  steps.push(`Apply the quadratic formula: x = (-b ± √(discriminant)) / (2a) = (-(${b}) ± √${disc}) / (2·${a}).`);
  steps.push(`Simplify to obtain the root(s): x = ${rootSample}.`);
  return steps;
}

function rootSample(roots: QuadraticFormulaRoot[]): string {
  if (roots.length === 1) return String(roots[0].value);
  return String(roots[0].value);
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate a quadratic formula problem.
 *
 * Deterministic: same seed → identical output. Single call to `mulberry32`.
 */
export function generateQuadraticFormula(options: { seed: number }): QuadraticFormulaProblem {
  const { seed } = options;
  const rand = mulberry32(seed);

  const mode = Math.floor(rand() * 4);
  let cs: Case;
  switch (mode) {
    case 0: cs = caseIntegerRoots(rand); break;
    case 1: cs = caseRepeated(rand); break;
    case 2: cs = caseIrrational(rand); break;
    case 3:
    default: cs = caseComplex(rand); break;
  }

  const { a, b, c, roots, rootTypeDesc } = cs;
  const discriminant = b * b - 4 * a * c;
  const quadratic = formatQuadratic(a, b, c);
  const steps = buildSteps(a, b, c, discriminant, rootTypeDesc, rootSample(roots));

  return {
    quadratic,
    a,
    b,
    c,
    discriminant,
    roots,
    steps,
  };
}
