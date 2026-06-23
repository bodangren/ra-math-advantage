/**
 * Adapters for the Phase 1–4 advanced math generators so they conform to the
 * knowledge-space-practice `GeneratorInput → GeneratorOutput` contract.
 *
 * These adapters wrap the lower-level generators (which take `{ seed: number }`
 * and return domain-specific objects) into `MathGenerator` entries that can be
 * looked up via `getGenerator` in `registry.ts`.
 */

import type { GeneratorInput, GeneratorOutput, GradingMetadata } from '@math-platform/knowledge-space-practice';
import { generatePolynomialOperation } from '../../polynomial-operations';
import { generatePolynomialDivision } from '../../polynomial-division';
import { generateRationalProblem } from '../../rational-analyzer';
import { generateExpLogProblem } from '../../exp-log-solver';
import type { MathGenerator } from './registry';

// ---------------------------------------------------------------------------
// Polynomial formatting (ascending-degree order: index k = coeff of x^k)
// ---------------------------------------------------------------------------

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

function formatPolynomial(coeffs: number[]): string {
  if (coeffs.length === 0) return '0';

  const parts: string[] = [];
  for (let deg = coeffs.length - 1; deg >= 0; deg--) {
    const c = coeffs[deg];
    if (c === 0) continue;

    const absC = Math.abs(c);
    const sign = c < 0 ? '−' : '+';
    const coeffStr = absC === 1 && deg > 0 ? '' : String(absC);

    let varStr: string;
    if (deg === 0) {
      varStr = '';
    } else if (deg === 1) {
      varStr = 'x';
    } else {
      const sup = String(deg)
        .split('')
        .map((d) => SUPERSCRIPTS[d] ?? `^${d}`)
        .join('');
      varStr = `x${sup}`;
    }

    const term = `${coeffStr}${varStr}`;
    if (parts.length === 0) {
      parts.push(c < 0 ? `−${term}` : term);
    } else {
      parts.push(`${sign} ${term}`);
    }
  }

  return parts.length > 0 ? parts.join(' ') : '0';
}

// ---------------------------------------------------------------------------
// polynomial-operations adapter
// ---------------------------------------------------------------------------

export const polynomialOperationsAdapter: MathGenerator = {
  key: 'polynomial-operations',
  nodeIds: [],
  description: 'Generates polynomial arithmetic problems (add, subtract, multiply).',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generatePolynomialOperation({ seed: input.seed });

    const prompt = `Compute (${formatPolynomial(problem.dividend)}) ${problem.operator} (${formatPolynomial(problem.divisor)}).`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: { result: problem.result },
      partMaxScores: { result: 1 },
      partGradingRules: { result: 'exact_match' },
    };

    return {
      prompt,
      data: {
        dividend: problem.dividend,
        divisor: problem.divisor,
        operator: problem.operator,
        result: problem.result,
      },
      expectedAnswer: { result: problem.result },
      solutionSteps: [
        { description: `Perform the ${problem.operator} operation on the two polynomials.` },
        { description: 'Combine like terms to obtain the result.', expression: formatPolynomial(problem.result), value: problem.result },
      ],
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// polynomial-division adapter
// ---------------------------------------------------------------------------

export const polynomialDivisionAdapter: MathGenerator = {
  key: 'polynomial-division',
  nodeIds: [],
  description: 'Generates polynomial long-division problems using backward construction.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generatePolynomialDivision({ seed: input.seed });

    const prompt = `Divide ${formatPolynomial(problem.dividend)} by ${formatPolynomial(problem.divisor)}. Give the quotient and remainder.`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: {
        quotient: problem.quotient,
        remainder: problem.remainder,
      },
      partMaxScores: { quotient: 1, remainder: 1 },
      partGradingRules: { quotient: 'exact_match', remainder: 'exact_match' },
    };

    return {
      prompt,
      data: {
        dividend: problem.dividend,
        divisor: problem.divisor,
        quotient: problem.quotient,
        remainder: problem.remainder,
      },
      expectedAnswer: {
        quotient: problem.quotient,
        remainder: problem.remainder,
      },
      solutionSteps: [
        { description: 'Set up the long division of the dividend by the divisor.' },
        { description: 'Divide term by term to find the quotient.', expression: formatPolynomial(problem.quotient), value: problem.quotient },
        { description: 'The remaining terms form the remainder.', expression: formatPolynomial(problem.remainder), value: problem.remainder },
      ],
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// rational-analyzer adapter
// ---------------------------------------------------------------------------

export const rationalAnalyzerAdapter: MathGenerator = {
  key: 'rational-analyzer',
  nodeIds: [],
  description: 'Generates rational-function analysis problems (holes, asymptotes, intercepts).',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generateRationalProblem({ seed: input.seed });

    const prompt = `Analyze the rational function ${problem.equation}. Identify the hole(s), vertical asymptote(s), horizontal asymptote, and x-intercept(s).`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: {
        holes: problem.holes,
        verticalAsymptotes: problem.verticalAsymptotes,
        horizontalAsymptote: problem.horizontalAsymptote,
        xIntercepts: problem.xIntercepts,
      },
      partMaxScores: {
        holes: 1,
        verticalAsymptotes: 1,
        horizontalAsymptote: 1,
        xIntercepts: 1,
      },
      partGradingRules: {
        holes: 'exact_match',
        verticalAsymptotes: 'exact_match',
        horizontalAsymptote: 'exact_match',
        xIntercepts: 'exact_match',
      },
    };

    return {
      prompt,
      data: {
        numerator: problem.numerator,
        denominator: problem.denominator,
        equation: problem.equation,
      },
      expectedAnswer: {
        holes: problem.holes,
        verticalAsymptotes: problem.verticalAsymptotes,
        horizontalAsymptote: problem.horizontalAsymptote,
        xIntercepts: problem.xIntercepts,
      },
      solutionSteps: [
        { description: 'Factor the numerator and denominator.' },
        { description: 'Identify common factors to find holes.', expression: `holes: ${JSON.stringify(problem.holes)}`, value: problem.holes },
        { description: 'Find zeros of the remaining denominator for vertical asymptotes.', expression: `vertical asymptotes: ${JSON.stringify(problem.verticalAsymptotes)}`, value: problem.verticalAsymptotes },
        { description: 'Compare leading terms for the horizontal asymptote.', expression: `horizontal asymptote: ${JSON.stringify(problem.horizontalAsymptote)}`, value: problem.horizontalAsymptote },
        { description: 'Find zeros of the numerator that are not holes for x-intercepts.', expression: `x-intercepts: ${JSON.stringify(problem.xIntercepts)}`, value: problem.xIntercepts },
      ],
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// exp-log-solver adapter
// ---------------------------------------------------------------------------

export const expLogSolverAdapter: MathGenerator = {
  key: 'exp-log-solver',
  nodeIds: [],
  description: 'Generates exponential and logarithmic equation problems.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generateExpLogProblem({ seed: input.seed });

    const prompt = `Solve the equation ${problem.equation}.`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: { answer: problem.answer },
      partMaxScores: { answer: 1 },
      partGradingRules: { answer: 'numeric_tolerance' },
      partTolerances: { answer: 0.01 },
    };

    return {
      prompt,
      data: {
        equation: problem.equation,
        problemType: problem.problemType,
        domain: problem.domain,
      },
      expectedAnswer: { answer: problem.answer },
      solutionSteps: problem.steps.map((step) => ({ description: step })),
      gradingMetadata,
    };
  },
};
