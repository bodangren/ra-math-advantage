/**
 * Exponential & Logarithmic Problem Generator
 *
 * Generates three problem types deterministically from a PRNG seed:
 *
 *   'log' — log₁₀(Ax + C) = D   (base-10 logarithm)
 *   'ln'  — ln(Ax + C) = D       (natural logarithm, base e)
 *   'exp' — 2^x = N               (exponential equation)
 *
 * Domain safety: for log/ln problems, the generator ensures the argument
 * (Ax + C) is positive at the solution x. If the initial seed produces
 * an invalid domain, the seed is incremented by 1 and retried (re-roll).
 *
 * Convention: LaTeX formatting uses \log, \ln, and \exp commands.
 */

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
// PRNG — same linear-congruential algorithm as polynomial-division.ts
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
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

  const equation = `\\exp(${exponent} \\cdot \\ln 2) = ${N} \\quad \\text{or} \\quad 2^{x} = ${N}`;

  const steps = [
    `Recognize: 2^x = ${N}`,
    `Take log₂ of both sides: x = \\log_{2}(${N})`,
    `Since 2^${exponent} = ${N}, we have x = ${exponent}`,
  ];

  return { problemType: 'exp', equation, answer, domain, familyId: 'step-by-step-solver:exp-log', steps };
}

// ---------------------------------------------------------------------------
// Domain validation
// ---------------------------------------------------------------------------

/**
 * Check whether the solution satisfies the domain constraint.
 *
 * For log/ln: the argument (Ax + C) must be positive at x = answer.
 * For exp: always valid (defined for all real x).
 */
function isDomainValid(problem: ExpLogProblem): boolean {
  if (problem.problemType === 'exp') return true;

  // For log/ln, domain is a half-line. The answer must be strictly inside.
  const { min, max } = problem.domain;
  return problem.answer > min && problem.answer < max;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate an exponential or logarithmic problem.
 *
 * Deterministic: same seed → identical output.
 *
 * Domain safety: if the initial seed produces a log/ln problem whose
 * solution violates the domain constraint (Ax + C ≤ 0), the seed is
 * incremented by 1 and the problem is regenerated (re-roll).
 *
 * @param options.seed — PRNG seed (integer).
 * @returns An ExpLogProblem with equation, answer, domain, and steps.
 */
export function generateExpLogProblem(options: {
  seed: number;
}): ExpLogProblem {
  let { seed } = options;

  // eslint-disable-next-line no-constant-condition
  while (true) {
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

    // Domain check: if the solution is outside the valid region, re-roll.
    if (isDomainValid(problem)) {
      return problem;
    }
    seed += 1;
  }
}
