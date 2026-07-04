/**
 * Quadratic Factoring Generator
 *
 * Backward-generation strategy (spec §3):
 *   1. Pick integer roots r1, r2 (positive, negative, or zero).
 *   2. Pick leading coefficient a (1 for monic, 2-5 for hard).
 *   3. Expand a(x - r1)(x - r2) → a x^2 - a(r1+r2)x + a r1 r2.
 *
 * Cases distributed by the first PRNG draw so that 100 seeds cover all
 * required forms (monic, a>1, perfect square, difference of squares,
 * mixed signs, both negative).
 *
 * Deterministic: same seed → identical output. Uses mulberry32 (not
 * Math.random) per spec.
 */

import { mulberry32 } from './utils/prng';
import { formatQuadratic } from './utils/expression-builder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuadraticFactoringProblem {
  quadratic: string;
  factoredForm: string;
  a: number;
  b: number;
  c: number;
  roots: [number, number];
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
  do {
    n = randInt(rand, -hi, hi);
  } while (n === 0);
  return n;
}

function formatBinomial(root: number): string {
  if (root === 0) return '(x)';
  if (root > 0) return `(x - ${root})`;
  return `(x + ${-root})`;
}

function buildFactoredForm(a: number, r1: number, r2: number, isSquare: boolean): string {
  if (isSquare) {
    const binom = formatBinomial(r1);
    return a === 1 ? `${binom}^2` : `${a}${binom}^2`;
  }
  const b1 = formatBinomial(r1);
  const b2 = formatBinomial(r2);
  return a === 1 ? `${b1}${b2}` : `${a}${b1}${b2}`;
}

function buildSteps(
  a: number,
  b: number,
  c: number,
  p: number,
  q: number,
  factoredForm: string,
  kind: 'standard' | 'perfect-square' | 'diff-squares' | 'zero-root',
): string[] {
  const ac = a * c;
  const steps: string[] = [];
  steps.push(`Start with the quadratic in standard form: a = ${a}, b = ${b}, c = ${c}. The quadratic is ${formatQuadratic(a, b, c)}.`);

  if (kind === 'perfect-square') {
    steps.push(`Notice this is a perfect square trinomial. Compute a*c = ${ac}. The factor pair of ${ac} that sums to b = ${b} is (${p}, ${q}) (both equal).`);
    steps.push(`Rewrite the middle term ${b}x as (${p} + ${q})x = ${p}x + ${q}x and split into two terms.`);
    steps.push(`Group the four terms into two pairs and factor each group to reveal the common binomial.`);
    steps.push(`Combine to obtain the factored form: ${factoredForm}.`);
  } else if (kind === 'diff-squares') {
    steps.push(`Notice the middle coefficient is zero (b = 0) — this is a difference of squares. Compute a*c = ${ac}. The factor pair of ${ac} that sums to b = 0 is (${p}, ${q}).`);
    steps.push(`Rewrite the middle term 0x as (${p} + ${q})x = ${p}x + ${q}x.`);
    steps.push(`Group the four terms into two pairs: (a x^2 + ${p}x) and (${q}x + ${c}), then factor each group.`);
    steps.push(`Combine to obtain the factored form: ${factoredForm}.`);
  } else if (kind === 'zero-root') {
    steps.push(`Since c = 0, the quadratic has a root at x = 0. Compute a*c = ${ac}. The factor pair of ${ac} that sums to b = ${b} is (${p}, ${q}).`);
    steps.push(`Rewrite the middle term ${b}x as (${p} + ${q})x and split into two terms.`);
    steps.push(`Group the four terms into two pairs and factor x out of each group.`);
    steps.push(`Combine to obtain the factored form: ${factoredForm}.`);
  } else {
    steps.push(`Compute a*c = ${ac}. Find a factor pair of ${ac} that sums to b = ${b}: the pair is (${p}, ${q}).`);
    steps.push(`Rewrite the middle term ${b}x as (${p} + ${q})x and split into two terms.`);
    steps.push(`Group the four terms into two pairs and factor each group.`);
    steps.push(`Combine to obtain the factored form: ${factoredForm}.`);
  }
  return steps;
}

// ---------------------------------------------------------------------------
// Case generators
// ---------------------------------------------------------------------------

interface Case {
  a: number;
  r1: number;
  r2: number;
  kind: 'standard' | 'perfect-square' | 'diff-squares' | 'zero-root';
}

function caseMonicPositive(rand: () => number): Case {
  const r1 = randInt(rand, 1, 6);
  let r2 = randInt(rand, 1, 6);
  while (r2 === r1) r2 = randInt(rand, 1, 6);
  return { a: 1, r1, r2, kind: 'standard' };
}

function caseMonicMixed(rand: () => number): Case {
  const r1 = randInt(rand, 1, 6);
  const r2 = -randInt(rand, 1, 6);
  return { a: 1, r1, r2, kind: 'standard' };
}

function caseMonicBothNegative(rand: () => number): Case {
  const r1 = -randInt(rand, 1, 6);
  let r2 = -randInt(rand, 1, 6);
  while (r2 === r1) r2 = -randInt(rand, 1, 6);
  return { a: 1, r1, r2, kind: 'standard' };
}

function casePerfectSquare(rand: () => number): Case {
  const r = randNonZero(rand, 6);
  return { a: 1, r1: r, r2: r, kind: 'perfect-square' };
}

function caseDiffSquares(rand: () => number): Case {
  const r = randInt(rand, 1, 6);
  return { a: 1, r1: r, r2: -r, kind: 'diff-squares' };
}

function caseAGt1(rand: () => number): Case {
  const a = randInt(rand, 2, 5);
  const subMode = rand();
  if (subMode < 0.35) {
    // a>1 perfect square
    const r = randNonZero(rand, 4);
    return { a, r1: r, r2: r, kind: 'perfect-square' };
  }
  // a>1 distinct roots
  const r1 = randNonZero(rand, 4);
  let r2 = randNonZero(rand, 4);
  // Avoid making this a perfect-square (handled above) and avoid both zero
  let safety = 0;
  while (r2 === r1 && safety++ < 20) r2 = randNonZero(rand, 4);
  if (r1 === 0 || r2 === 0) {
    return { a, r1, r2, kind: 'zero-root' };
  }
  return { a, r1, r2, kind: 'standard' };
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate a quadratic factoring problem.
 *
 * Deterministic: same seed → identical output. Single call to `mulberry32`.
 */
export function generateQuadraticFactoring(options: { seed: number }): QuadraticFactoringProblem {
  const { seed } = options;
  const rand = mulberry32(seed);

  const mode = Math.floor(rand() * 6);
  let cs: Case;
  switch (mode) {
    case 0: cs = caseMonicPositive(rand); break;
    case 1: cs = caseMonicMixed(rand); break;
    case 2: cs = caseMonicBothNegative(rand); break;
    case 3: cs = casePerfectSquare(rand); break;
    case 4: cs = caseDiffSquares(rand); break;
    case 5:
    default: cs = caseAGt1(rand); break;
  }

  const { a, r1, r2, kind } = cs;
  const bRaw = -a * (r1 + r2);
  const cRaw = a * r1 * r2;
  // Normalize -0 to 0 so downstream equality checks (e.g. normalizePoly in
  // tests) do not see -0 vs 0.
  const b = bRaw === 0 ? 0 : bRaw;
  const c = cRaw === 0 ? 0 : cRaw;
  const isSquare = r1 === r2;
  const factoredForm = buildFactoredForm(a, r1, r2, isSquare);
  const quadratic = formatQuadratic(a, b, c);

  // Factor pair for grouping: p = -a*r1, q = -a*r2 (p+q = b, p*q = a*c).
  const p = -a * r1;
  const q = -a * r2;

  const steps = buildSteps(a, b, c, p, q, factoredForm, kind);

  return {
    quadratic,
    factoredForm,
    a,
    b,
    c,
    roots: [r1, r2],
    steps,
  };
}
