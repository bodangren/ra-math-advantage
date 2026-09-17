import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export type Topic14PolynomialItemId = 'a' | 'b' | 'c';

export interface Topic14PolynomialTerm {
  readonly coefficient: number;
  readonly exponent: number;
}

export interface Topic14PolynomialItem {
  readonly id: Topic14PolynomialItemId;
  readonly functionName: string;
  readonly terms: readonly Topic14PolynomialTerm[];
}

export interface Topic14PolynomialDegreeLeadingCoefficientVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly items: readonly Topic14PolynomialItem[];
}

export const TOPIC14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID =
  'math.precalc.skill.1.4.identify-polynomial-degree-and-leading-coefficient';

const PROMPT = 'Find the leading coefficient and degree.';
const ITEM_IDS: readonly Topic14PolynomialItemId[] = ['a', 'b', 'c'];

const SOURCE_VARIANT: Topic14PolynomialDegreeLeadingCoefficientVariant = {
  seed: 0,
  prompt: PROMPT,
  items: [
    {
      id: 'a',
      functionName: 'f',
      terms: [
        { coefficient: 3, exponent: 4 },
        { coefficient: 2, exponent: 1 },
        { coefficient: -7, exponent: 0 },
      ],
    },
    {
      id: 'b',
      functionName: 'y',
      terms: [
        { coefficient: 0.5, exponent: 1 },
        { coefficient: -7, exponent: 3 },
        { coefficient: 11, exponent: 0 },
      ],
    },
    {
      id: 'c',
      functionName: 'g',
      terms: [{ coefficient: 4, exponent: 0 }],
    },
  ],
};

type PolynomialAnswer = { readonly degree: number; readonly leadingCoefficient: number };

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function randomNonZeroInteger(random: () => number): number {
  let value = 0;
  while (value === 0) value = randomInteger(random, -9, 9);
  return value;
}

function generatedVariant(seed: number): Topic14PolynomialDegreeLeadingCoefficientVariant {
  const random = mulberry32(seed);
  const degreeA = randomInteger(random, 2, 6);
  const degreeB = randomInteger(random, 2, 6);
  const leadingA = randomNonZeroInteger(random);
  const lowerA = randomNonZeroInteger(random);
  const constantA = randomNonZeroInteger(random);
  const linearB = randomNonZeroInteger(random);
  const leadingB = randomNonZeroInteger(random);
  const middleB = randomNonZeroInteger(random);
  const constantB = randomNonZeroInteger(random);
  const constantC = randomNonZeroInteger(random);

  const itemA: Topic14PolynomialItem = {
    id: 'a',
    functionName: 'f',
    terms: [
      { coefficient: leadingA, exponent: degreeA },
      { coefficient: lowerA, exponent: degreeA - 1 },
      { coefficient: constantA, exponent: 0 },
    ],
  };
  const itemB: Topic14PolynomialItem = {
    id: 'b',
    functionName: 'g',
    terms: degreeB === 2
      ? [
        { coefficient: linearB, exponent: 1 },
        { coefficient: leadingB, exponent: degreeB },
        { coefficient: constantB, exponent: 0 },
      ]
      : [
        { coefficient: linearB, exponent: 1 },
        { coefficient: leadingB, exponent: degreeB },
        { coefficient: middleB, exponent: degreeB - 1 },
        { coefficient: constantB, exponent: 0 },
      ],
  };
  const itemC: Topic14PolynomialItem = {
    id: 'c',
    functionName: 'h',
    terms: [{ coefficient: constantC, exponent: 0 }],
  };

  return { seed, prompt: PROMPT, items: [itemA, itemB, itemC] };
}

function deriveAnswer(item: Topic14PolynomialItem): PolynomialAnswer {
  if (item.terms.length === 0) {
    throw new Error('polynomial degree generator received an empty term list');
  }
  let leadingTerm = item.terms[0]!;
  for (const term of item.terms.slice(1)) {
    if (term.exponent > leadingTerm.exponent) leadingTerm = term;
  }
  return { degree: leadingTerm.exponent, leadingCoefficient: leadingTerm.coefficient };
}

function sourceSolutionSteps(): Array<{ description: string }> {
  return [
    { description: 'The highest exponent in f is 4, so the degree is 4 and the leading coefficient is 3.' },
    { description: 'Rewrite y in descending order as -7x^3 + 0.5x + 11. The highest exponent is 3, so the degree is 3 and the leading coefficient is -7.' },
    { description: 'Treat 4 as 4x^0. The degree is 0 and the leading coefficient is 4.' },
  ];
}

function generatedSolutionSteps(
  variant: Topic14PolynomialDegreeLeadingCoefficientVariant,
): Array<{ description: string }> {
  return variant.items.map((item) => {
    const answer = deriveAnswer(item);
    const terms = item.terms
      .map((term) => `${term.coefficient}x^${term.exponent}`)
      .join(', ');
    return {
      description: `${item.functionName} has terms ${terms}. The highest exponent is ${answer.degree}, so the degree is ${answer.degree} and the leading coefficient is ${answer.leadingCoefficient}.`,
    };
  });
}

function expectedAnswer(
  variant: Topic14PolynomialDegreeLeadingCoefficientVariant,
): Record<string, number> {
  return Object.fromEntries(variant.items.flatMap((item) => {
    const answer = deriveAnswer(item);
    return [
      [`${item.id}_degree`, answer.degree],
      [`${item.id}_leading_coefficient`, answer.leadingCoefficient],
    ];
  }));
}

export function generateTopic14PolynomialDegreeLeadingCoefficient(
  seed: number,
): Topic14PolynomialDegreeLeadingCoefficientVariant {
  if (!Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative safe integer');
  }
  if (seed === 0) return SOURCE_VARIANT;

  return generatedVariant(seed);
}

export function generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed: number): GeneratorOutput {
  const variant = generateTopic14PolynomialDegreeLeadingCoefficient(seed);
  const answer = expectedAnswer(variant);
  const rendererProps = {
    prompt: variant.prompt,
    items: variant.items,
    presentationMode: 'independent_practice' as const,
  };

  return {
    prompt: variant.prompt,
    data: { seed, rendererProps },
    expectedAnswer: answer,
    solutionSteps: seed === 0 ? sourceSolutionSteps() : generatedSolutionSteps(variant),
    gradingMetadata: {
      partAnswers: answer,
      partMaxScores: Object.fromEntries(ITEM_IDS.flatMap((id) => [
        [`${id}_degree`, 1],
        [`${id}_leading_coefficient`, 1],
      ])),
      partGradingRules: Object.fromEntries(ITEM_IDS.flatMap((id) => [
        [`${id}_degree`, 'exact_match'],
        [`${id}_leading_coefficient`, 'exact_match'],
      ])),
    },
  };
}
