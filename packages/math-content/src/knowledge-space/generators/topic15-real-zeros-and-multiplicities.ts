import type { GeneratorOutput, GradingMetadata } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export type Topic15RealZerosAndMultiplicitiesItemId = 'a' | 'b';

export interface Topic15RealZerosAndMultiplicitiesItem {
  readonly id: Topic15RealZerosAndMultiplicitiesItemId;
  readonly functionName: 'f' | 'g';
  readonly expression: string;
}

export interface Topic15RealZerosAndMultiplicitiesPair {
  readonly zero: number;
  readonly multiplicity: number;
}

export interface Topic15RealZerosAndMultiplicitiesAnswers {
  readonly a: readonly Topic15RealZerosAndMultiplicitiesPair[];
  readonly b: readonly Topic15RealZerosAndMultiplicitiesPair[];
}

export interface Topic15RealZerosAndMultiplicitiesVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly items: readonly Topic15RealZerosAndMultiplicitiesItem[];
}

const SOURCE_PROMPT = 'Find all real zeros with multiplicity.';

export const TOPIC15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID =
  'math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form';

const SOURCE_ITEMS: readonly Topic15RealZerosAndMultiplicitiesItem[] = [
  { id: 'a', functionName: 'f', expression: '-2x^3(x+1)(x-4)^2' },
  { id: 'b', functionName: 'g', expression: '3(x^2 - 4)(x - 2)^4' },
];

const SOURCE_ANSWERS: Topic15RealZerosAndMultiplicitiesAnswers = {
  a: [
    { zero: -1, multiplicity: 1 },
    { zero: 0, multiplicity: 3 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -2, multiplicity: 1 },
    { zero: 2, multiplicity: 5 },
  ],
};

type BuiltItem = {
  readonly item: Topic15RealZerosAndMultiplicitiesItem;
  readonly answers: readonly Topic15RealZerosAndMultiplicitiesPair[];
};

type BuiltVariant = {
  readonly variant: Topic15RealZerosAndMultiplicitiesVariant;
  readonly answers: Topic15RealZerosAndMultiplicitiesAnswers;
};

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function randomNonZeroInteger(random: () => number, minimum: number, maximum: number): number {
  let value = 0;
  while (value === 0) value = randomInteger(random, minimum, maximum);
  return value;
}

function formatFactor(zero: number, multiplicity: number): string {
  const factor = zero === 0
    ? 'x'
    : zero < 0
      ? `(x+${Math.abs(zero)})`
      : `(x-${zero})`;
  return multiplicity === 1 ? factor : `${factor}^${multiplicity}`;
}

function formatExpression(coefficient: number, pairs: readonly Topic15RealZerosAndMultiplicitiesPair[]): string {
  const coefficientText = coefficient === 1 ? '' : coefficient === -1 ? '-' : String(coefficient);
  return `${coefficientText}${pairs.map((pair) => formatFactor(pair.zero, pair.multiplicity)).join('')}`;
}

function formatPairs(pairs: readonly Topic15RealZerosAndMultiplicitiesPair[]): string {
  return pairs
    .map((pair) => `x = ${pair.zero} (multiplicity ${pair.multiplicity})`)
    .join(', ');
}

function sourceSolutionSteps(): Array<{ description: string }> {
  return [
    { description: 'For f(x) = -2x^3(x+1)(x-4)^2, the real zeros are x = 0 (multiplicity 3), x = -1 (multiplicity 1), and x = 4 (multiplicity 2).' },
    { description: 'For g(x) = 3(x^2 - 4)(x - 2)^4, factor x^2 - 4 as (x - 2)(x + 2).' },
    { description: 'Then g(x) = 3(x - 2)^5(x + 2), so x = 2 has multiplicity 5 and x = -2 has multiplicity 1.' },
  ];
}

function generatedSolutionSteps(
  items: readonly Topic15RealZerosAndMultiplicitiesItem[],
  answers: Topic15RealZerosAndMultiplicitiesAnswers,
): Array<{ description: string }> {
  return items.map((item) => ({
    description: `For ${item.functionName}(x) = ${item.expression}, the real zeros are ${formatPairs(answers[item.id])}.`,
  }));
}

function generatedItem(
  random: () => number,
  id: Topic15RealZerosAndMultiplicitiesItemId,
  functionName: 'f' | 'g',
): BuiltItem {
  const rootCount = randomInteger(random, 2, 3);
  const roots: number[] = [];
  while (roots.length < rootCount) {
    const root = randomInteger(random, -5, 5);
    if (!roots.includes(root)) roots.push(root);
  }
  roots.sort((left, right) => left - right);

  const pairs = roots.map((zero) => ({
    zero,
    multiplicity: randomInteger(random, 1, 3),
  }));
  if (!pairs.some((pair) => pair.multiplicity > 1)) {
    pairs[pairs.length - 1]!.multiplicity = 2;
  }

  const coefficient = randomNonZeroInteger(random, -6, 6);
  return {
    item: {
      id,
      functionName,
      expression: formatExpression(coefficient, pairs),
    },
    answers: pairs,
  };
}

function generatedVariant(seed: number): BuiltVariant {
  const random = mulberry32(seed);
  const itemA = generatedItem(random, 'a', 'f');
  const itemB = generatedItem(random, 'b', 'g');
  const items = [itemA.item, itemB.item];
  const answers: Topic15RealZerosAndMultiplicitiesAnswers = {
    a: itemA.answers,
    b: itemB.answers,
  };
  return {
    variant: {
      seed,
      prompt: SOURCE_PROMPT,
      items,
    },
    answers,
  };
}

function sourceVariant(): BuiltVariant {
  return {
    variant: {
      seed: 0,
      prompt: SOURCE_PROMPT,
      items: SOURCE_ITEMS,
    },
    answers: SOURCE_ANSWERS,
  };
}

function buildForSeed(seed: number): BuiltVariant {
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

function validateSeed(seed: number): void {
  if (!Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative safe integer');
  }
}

export function generateTopic15RealZerosAndMultiplicities(
  seed: number,
): Topic15RealZerosAndMultiplicitiesVariant {
  validateSeed(seed);
  return buildForSeed(seed).variant;
}

export function generateTopic15RealZerosAndMultiplicitiesOutput(seed: number): GeneratorOutput {
  validateSeed(seed);
  const { variant, answers } = buildForSeed(seed);
  const answerRecord: Record<string, unknown> = { a: answers.a, b: answers.b };
  const gradingMetadata: GradingMetadata = {
    partAnswers: answerRecord,
    partMaxScores: { a: 1, b: 1 },
    partGradingRules: { a: 'custom', b: 'custom' },
  };

  return {
    prompt: variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: variant.prompt,
        items: variant.items,
        presentationMode: 'independent_practice',
      },
    },
    expectedAnswer: answerRecord,
    solutionSteps: seed === 0
      ? sourceSolutionSteps()
      : generatedSolutionSteps(variant.items, answers),
    gradingMetadata,
  };
}
