/**
 * Exponential & Logarithmic Problem Generator
 *
 * Generates three problem types deterministically from a PRNG seed:
 *
 *   'log' — log₁₀(Ax + C) = D   (base-10 logarithm)
 *   'ln'  — ln(Ax + C) = D       (natural logarithm, base e)
 *   'exp' — 2^x = N               (exponential equation)
 *
 * By construction, the argument (Ax + C) at the solution equals 10^D (log)
 * or e^D (ln), both strictly positive, so the domain constraint is always
 * satisfied without re-rolling.
 *
 * Convention: LaTeX formatting uses \log, \ln, and \exp commands.
 */

import { seededRandom } from './utils/prng';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExpLogProblem {
  /** The class of problem. */
  problemType: 'log' | 'exp' | 'ln';
  /** LaTeX equation string, e.g. "\\log_{10}(3x + 7) = 1". */
  equation: string;
  /** Numeric solution to the equation. */
  answer: number;
  /** Domain constraint: x must be in (domain.min, domain.max). */
  domain: { min: number; max: number };
  /** Family identifier for the step-by-step-solver fallback UI. */
  familyId: 'step-by-step-solver:exp-log';
  /** Step-by-step solution breakdown. */
  steps: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick an integer in [lo, hi] (inclusive) via the PRNG. */
function randInt(rand: () => number, lo: number, hi: number): number {
  return Math.floor(rand() * (hi - lo + 1)) + lo;
}

/** Pick a non-zero integer in [−hi, −1] ∪ [1, hi]. */
function randNonZero(rand: () => number, hi: number): number {
  let n: number;
  do {
    n = randInt(rand, -hi, hi);
  } while (n === 0);
  return n;
}

/** Round to a fixed number of decimal places for display. */
function roundTo(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

// ---------------------------------------------------------------------------
// Individual problem generators
// ---------------------------------------------------------------------------

function generateLogProblem(rand: () => number): ExpLogProblem {
  // log₁₀(Ax + C) = D  where D ∈ {1, 2} for clean integer answers.
  const A = randNonZero(rand, 5);
  const C = randInt(rand, -10, 10);
  const D = randInt(rand, 1, 2);

  // Solve: Ax + C = 10^D  →  x = (10^D - C) / A
  const answer = (10 ** D - C) / A;

  // Domain: Ax + C > 0  →  x > -C/A  (if A > 0) or x < -C/A (if A < 0)
  const boundary = -C / A;
  const domain = A > 0
    ? { min: boundary, max: Infinity }
    : { min: -Infinity, max: boundary };

  // Format Ax+C for display
  const cSign = C >= 0 ? ` + ${C}` : ` - ${Math.abs(C)}`;
  const aCoeff = Math.abs(A) === 1 ? (A < 0 ? '-' : '') : String(A);
  const arg = `${aCoeff}x${cSign}`;

  const equation = `\\log_{10}(${arg}) = ${D}`;

  const steps = [
    `Rewrite in exponential form: 10^${D} = ${arg}`,
    `Simplify: ${10 ** D} = ${arg}`,
    `Solve for x: x = (${10 ** D} - (${C})) / ${A} = ${roundTo(answer, 6)}`,
  ];

  return { problemType: 'log', equation, answer, domain, familyId: 'step-by-step-solver:exp-log', steps };
}

function generateLnProblem(rand: () => number): ExpLogProblem {
  // ln(Ax + C) = D
  const A = randNonZero(rand, 5);
  const C = randInt(rand, -10, 10);
  const D = randInt(rand, 1, 3);

  // Solve: Ax + C = e^D  →  x = (e^D - C) / A
  const eD = Math.E ** D;
  const answer = roundTo((eD - C) / A, 6);

  // Domain: Ax + C > 0
  const boundary = -C / A;
  const domain = A > 0
    ? { min: boundary, max: Infinity }
    : { min: -Infinity, max: boundary };

  const cSign = C >= 0 ? ` + ${C}` : ` - ${Math.abs(C)}`;
  const aCoeff = Math.abs(A) === 1 ? (A < 0 ? '-' : '') : String(A);
  const arg = `${aCoeff}x${cSign}`;

  const equation = `\\ln(${arg}) = ${D}`;

  const steps = [
    `Rewrite in exponential form: e^${D} = ${arg}`,
    `Simplify: ${roundTo(eD, 4)} = ${arg}`,
    `Solve for x: x = (${roundTo(eD, 4)} - (${C})) / ${A} = ${roundTo(answer, 6)}`,
  ];

  return { problemType: 'ln', equation, answer, domain, familyId: 'step-by-step-solver:exp-log', steps };
}

function generateExpProblem(rand: () => number): ExpLogProblem {
  // 2^x = N  where N is a power of 2 for a clean integer answer.
  const exponent = randInt(rand, 1, 8);
  const N = 2 ** exponent;

  // Solve: x = log₂(N) = exponent
  const answer = exponent;

  // Domain: exponential is defined for all real x, so domain is (−∞, ∞)
  const domain = { min: -Infinity, max: Infinity };

  const equation = `2^{x} = ${N}`;

  const steps = [
    `Recognize: 2^x = ${N}`,
    `Take log base 2 of both sides: x = log₂(${N})`,
    `Since 2^${exponent} = ${N}, we have x = ${exponent}`,
  ];

  return { problemType: 'exp', equation, answer, domain, familyId: 'step-by-step-solver:exp-log', steps };
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate an exponential or logarithmic problem.
 *
 * Deterministic: same seed → identical output.
 *
 * By construction, the argument (Ax + C) at the solution equals 10^D (log)
 * or e^D (ln), both strictly positive, so the domain constraint is always
 * satisfied. No re-roll is needed.
 *
 * @param options.seed — PRNG seed (integer).
 * @returns An ExpLogProblem with equation, answer, domain, and steps.
 */
export function generateExpLogProblem(options: {
  seed: number;
}): ExpLogProblem {
  const { seed } = options;
  const rand = seededRandom(seed);

  // Deterministically pick problem type from the first PRNG draw.
  const typeDraw = rand();
  let problem: ExpLogProblem;
  if (typeDraw < 1 / 3) {
    problem = generateLogProblem(rand);
  } else if (typeDraw < 2 / 3) {
    problem = generateLnProblem(rand);
  } else {
    problem = generateExpProblem(rand);
  }

  return problem;
}
