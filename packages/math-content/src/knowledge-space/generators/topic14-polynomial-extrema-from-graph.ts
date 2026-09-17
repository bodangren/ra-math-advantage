import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export interface Topic14PolynomialExtremaPoint {
  readonly x: number;
  readonly y: number;
}

export type Topic14PolynomialExtremaCoefficients = readonly [
  number,
  number,
  number,
  number,
  number,
];

export type Topic14PolynomialExtremaDomain = readonly [number, number];

export interface Topic14PolynomialExtremaFromGraphVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly functionName: 'g';
  readonly coefficients: Topic14PolynomialExtremaCoefficients;
  readonly domain: Topic14PolynomialExtremaDomain;
  readonly points: readonly Topic14PolynomialExtremaPoint[];
}

export const TOPIC14_POLYNOMIAL_EXTREMA_FROM_GRAPH_NODE_ID =
  'math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs';

const PROMPT = 'Use the graph of polynomial g to identify its extrema.';
const SAMPLE_STEP = 0.25;

type ExtremaAnswer = {
  readonly relative_minimum_x: number;
  readonly relative_maximum_x: number;
  readonly absolute_minimum_x: number;
};

type BuiltVariant = {
  readonly variant: Topic14PolynomialExtremaFromGraphVariant;
  readonly answer: ExtremaAnswer;
};

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function evaluatePolynomial(
  coefficients: Topic14PolynomialExtremaCoefficients,
  x: number,
): number {
  return coefficients.reduce((sum, coefficient, index) => (
    sum + coefficient * x ** (4 - index)
  ), 0);
}

function samplePoints(
  coefficients: Topic14PolynomialExtremaCoefficients,
  domain: Topic14PolynomialExtremaDomain,
): Topic14PolynomialExtremaPoint[] {
  const points: Topic14PolynomialExtremaPoint[] = [];
  for (let x = domain[0]; x <= domain[1] + Number.EPSILON; x += SAMPLE_STEP) {
    points.push({ x, y: evaluatePolynomial(coefficients, x) });
  }
  return points;
}

function buildVariant(
  seed: number,
  a: number,
  b: number,
  c: number,
  verticalShift: number,
): BuiltVariant {
  const coefficients = [
    3,
    -4 * (a + b + c),
    6 * (a * b + a * c + b * c),
    -12 * a * b * c,
    0,
  ] as [number, number, number, number, number];
  const baseAtA = evaluatePolynomial(coefficients, a);
  coefficients[4] = verticalShift - baseAtA;
  const domain: Topic14PolynomialExtremaDomain = [a - 2, b + 1];

  return {
    variant: {
      seed,
      prompt: PROMPT,
      functionName: 'g',
      coefficients,
      domain,
      points: samplePoints(coefficients, domain),
    },
    answer: {
      relative_minimum_x: a,
      relative_maximum_x: b,
      absolute_minimum_x: a,
    },
  };
}

function buildForSeed(seed: number): BuiltVariant {
  if (seed === 0) return buildVariant(0, 1, 4, 6, 0);

  const random = mulberry32(seed);
  const a = randomInteger(random, -12, 12);
  const firstGap = randomInteger(random, 4, 8);
  const secondGap = randomInteger(random, 2, firstGap - 1);
  const b = a + firstGap;
  const c = b + secondGap;
  const verticalShift = randomInteger(random, -20, 20);

  return buildVariant(seed, a, b, c, verticalShift);
}

function generatedSolutionSteps(answer: ExtremaAnswer): Array<{ description: string }> {
  return [
    {
      description: `The graph changes from decreasing to increasing at x = ${answer.relative_minimum_x}, so x = ${answer.relative_minimum_x} is a relative minimum.`,
    },
    {
      description: `The graph changes from increasing to decreasing at x = ${answer.relative_maximum_x}, so x = ${answer.relative_maximum_x} is a relative maximum.`,
    },
    {
      description: `Within the displayed domain, the lowest value is at x = ${answer.absolute_minimum_x}, so g(${answer.absolute_minimum_x}) is the absolute minimum.`,
    },
  ];
}

function sourceSolutionSteps(): Array<{ description: string }> {
  return [
    {
      description: 'The graph changes from decreasing to increasing at x = 1, so x = 1 is a relative minimum.',
    },
    {
      description: 'The graph changes from increasing to decreasing at x = 4, so x = 4 is a relative maximum.',
    },
    {
      description: 'The lowest value overall occurs at x = 1, so g(1) is the absolute minimum.',
    },
  ];
}

function validateSeed(seed: number): void {
  if (!Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative safe integer');
  }
}

export function generateTopic14PolynomialExtremaFromGraph(
  seed: number,
): Topic14PolynomialExtremaFromGraphVariant {
  validateSeed(seed);
  return buildForSeed(seed).variant;
}

export function generateTopic14PolynomialExtremaFromGraphOutput(
  seed: number,
): GeneratorOutput {
  validateSeed(seed);
  const built = buildForSeed(seed);
  const { variant, answer } = built;
  const solutionSteps = seed === 0 ? sourceSolutionSteps() : generatedSolutionSteps(answer);

  return {
    prompt: variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: variant.prompt,
        functionName: variant.functionName,
        coefficients: variant.coefficients,
        domain: variant.domain,
        points: variant.points,
        presentationMode: 'independent_practice',
      },
    },
    expectedAnswer: answer,
    solutionSteps,
    gradingMetadata: {
      partAnswers: answer,
      partMaxScores: {
        relative_minimum_x: 1,
        relative_maximum_x: 1,
        absolute_minimum_x: 1,
      },
      partGradingRules: {
        relative_minimum_x: 'exact_match',
        relative_maximum_x: 'exact_match',
        absolute_minimum_x: 'exact_match',
      },
    },
  };
}
