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
import { formatPolynomial } from '../../utils/polynomial-format';
import type { MathGenerator } from './registry';

// ---------------------------------------------------------------------------
// polynomial-operations adapter
// ---------------------------------------------------------------------------

export const polynomialOperationsAdapter: MathGenerator = {
  key: 'polynomial-operations',
  nodeIds: [
    'math.im3.skill.2.3.add-and-subtract-polynomials',
    'math.im3.skill.2.3.multiply-polynomials',
    'math.im3.skill.2.aleks.polynomial-add-subtract',
    'math.im3.skill.2.aleks.polynomial-multiplication',
  ],
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
  nodeIds: [
    'math.im3.skill.2.4.divide-polynomials-by-using-long-division',
    'math.im3.skill.2.aleks.polynomial-long-division',
  ],
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
  nodeIds: [
    'math.im3.skill.7.4.graph-and-analyze-rational-functions-with-vertical-and-horiz',
    'math.im3.skill.7.aleks.rational-function-asymptote-analysis',
  ],
  description: 'Generates rational-function analysis problems (holes, asymptotes, intercepts).',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generateRationalProblem({ seed: input.seed });

    const prompt = `Analyze the rational function ${problem.equation}. Identify the hole(s), vertical asymptote(s), horizontal asymptote, and x-intercept(s).`;

    // Grade the horizontal asymptote as a student-enterable scalar value:
    //   - If numerator degree < denominator degree → HA is y = 0, student enters "0"
    //   - Otherwise → HA is the numeric ratio y = aNum/aDen
    const haValue: number | 'none' = problem.horizontalAsymptote?.isZero
      ? 'none'
      : (problem.horizontalAsymptote?.ratio ?? 'none');

    const gradingMetadata: GradingMetadata = {
      partAnswers: {
        holes: problem.holes,
        verticalAsymptotes: problem.verticalAsymptotes,
        horizontalAsymptote: haValue,
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
        horizontalAsymptote: haValue === 'none' ? 'exact_match' : 'numeric_tolerance',
        xIntercepts: 'exact_match',
      },
      partTolerances: haValue === 'none' ? undefined : { horizontalAsymptote: 0.001 },
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
        horizontalAsymptote: haValue,
        xIntercepts: problem.xIntercepts,
      },
      solutionSteps: [
        { description: 'Factor the numerator and denominator.' },
        { description: 'Identify common factors to find holes.', expression: `holes: ${JSON.stringify(problem.holes)}`, value: problem.holes },
        { description: 'Find zeros of the remaining denominator for vertical asymptotes.', expression: `vertical asymptotes: ${JSON.stringify(problem.verticalAsymptotes)}`, value: problem.verticalAsymptotes },
        { description: 'Compare leading terms for the horizontal asymptote.', expression: `horizontal asymptote: y = ${typeof haValue === 'number' ? haValue : 'none'}`, value: haValue },
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
  nodeIds: [
    'math.im3.skill.5.2.solve-exponential-equations-in-one-variable',
    'math.im3.skill.6.2.solve-logarithmic-equations-using-properties-of-equality',
    'math.im3.skill.6.3.solve-exponential-equations-by-using-common-logarithms',
    'math.im3.skill.6.4.solve-exponential-equations-by-using-natural-logarithms',
  ],
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
