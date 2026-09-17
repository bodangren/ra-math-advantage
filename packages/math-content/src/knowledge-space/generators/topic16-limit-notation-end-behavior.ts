import type { GeneratorOutput, GradingMetadata } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export type Topic16LimitNotationEnd = 'positive_infinity' | 'negative_infinity';
export type Topic16LimitNotationItemId = 'a' | 'b';
export type Topic16LimitNotationFunctionName = 'f' | 'g';
export type Topic16LimitNotationPartId = `${Topic16LimitNotationItemId}_${'leftLimit' | 'rightLimit'}`;

export interface Topic16LimitNotationItem {
  readonly id: Topic16LimitNotationItemId;
  readonly functionName: Topic16LimitNotationFunctionName;
  readonly expression: string;
}

export type Topic16LimitNotationAnswers = Record<
  Topic16LimitNotationPartId,
  Topic16LimitNotationEnd
>;

export interface Topic16LimitNotationVariant extends Record<string, unknown> {
  readonly seed: number;
  readonly prompt: string;
  readonly items: readonly Topic16LimitNotationItem[];
}

const SOURCE_PROMPT =
  'Write limit statements for the end behavior of the following polynomials.';

const SOURCE_ITEMS: readonly Topic16LimitNotationItem[] = [
  { id: 'a', functionName: 'f', expression: '-3x^4' },
  { id: 'b', functionName: 'g', expression: '5x^3 + 2x^2 - 7' },
];

const SOURCE_LEADING_TERMS = [
  { coefficient: -3, exponent: 4 },
  { coefficient: 5, exponent: 3 },
] as const;

const SOURCE_ANSWERS: Topic16LimitNotationAnswers = {
  a_leftLimit: 'negative_infinity',
  a_rightLimit: 'negative_infinity',
  b_leftLimit: 'negative_infinity',
  b_rightLimit: 'positive_infinity',
};

const SOURCE_SOLUTION_STEPS = [
  'a) The leading term is -3x^4. The degree is even and the leading coefficient is negative, so lim(x to -infinity) f(x) = -infinity and lim(x to infinity) f(x) = -infinity.',
  'b) The leading term is 5x^3. The degree is odd and the leading coefficient is positive, so lim(x to -infinity) g(x) = -infinity and lim(x to infinity) g(x) = infinity.',
] as const;

const ITEM_IDS: readonly Topic16LimitNotationItemId[] = ['a', 'b'];

export const TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID =
  'math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation';

type LeadingTerm = {
  readonly coefficient: number;
  readonly exponent: number;
};

type BuiltItem = {
  readonly item: Topic16LimitNotationItem;
  readonly leadingTerm: LeadingTerm;
};

type BuiltVariant = {
  readonly variant: Topic16LimitNotationVariant;
  readonly leadingTerms: readonly LeadingTerm[];
};

function validateSeed(seed: number): void {
  if (typeof seed !== 'number' || !Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative safe integer');
  }
}

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function formatCoefficient(coefficient: number): string {
  return coefficient === 1 ? '' : coefficient === -1 ? '-' : String(coefficient);
}

function formatEnd(end: Topic16LimitNotationEnd): string {
  return end.replace('_', ' ');
}

function classifyEnds(leadingTerm: LeadingTerm): {
  readonly leftLimit: Topic16LimitNotationEnd;
  readonly rightLimit: Topic16LimitNotationEnd;
} {
  const rightLimit: Topic16LimitNotationEnd = leadingTerm.coefficient > 0
    ? 'positive_infinity'
    : 'negative_infinity';
  const leftLimit = leadingTerm.exponent % 2 === 0
    ? rightLimit
    : rightLimit === 'positive_infinity' ? 'negative_infinity' : 'positive_infinity';
  return { leftLimit, rightLimit };
}

function buildAnswers(leadingTerms: readonly LeadingTerm[]): Topic16LimitNotationAnswers {
  const answers = {} as Topic16LimitNotationAnswers;
  for (const [index, leadingTerm] of leadingTerms.entries()) {
    const itemId = ITEM_IDS[index];
    if (!itemId) throw new Error('Missing Topic 1.6 limit-notation item identity');
    const ends = classifyEnds(leadingTerm);
    answers[`${itemId}_leftLimit`] = ends.leftLimit;
    answers[`${itemId}_rightLimit`] = ends.rightLimit;
  }
  return answers;
}

function signedTerm(coefficient: number, exponent: number): string {
  const sign = coefficient < 0 ? '-' : '+';
  return `${sign} ${formatCoefficient(Math.abs(coefficient))}x${exponent === 1 ? '' : `^${exponent}`}`;
}

function signedConstant(constant: number): string {
  return `${constant < 0 ? '-' : '+'} ${Math.abs(constant)}`;
}

function sourceVariant(): BuiltVariant {
  return {
    variant: {
      seed: 0,
      prompt: SOURCE_PROMPT,
      items: SOURCE_ITEMS,
    },
    leadingTerms: SOURCE_LEADING_TERMS,
  };
}

function generatedVariant(seed: number): BuiltVariant {
  const random = mulberry32(seed);
  const itemAPattern = (seed - 1) % 4;
  const itemBPattern = Math.floor((seed - 1) / 4) % 4;

  const itemACoefficient = (itemAPattern === 0 || itemAPattern === 1 ? 1 : -1)
    * randomInteger(random, 1, 9);
  const itemAExponentChoices = itemAPattern === 0 || itemAPattern === 2
    ? [2, 4, 6]
    : [3, 5, 7];
  const itemAExponent = itemAExponentChoices[randomInteger(random, 0, itemAExponentChoices.length - 1)]!;

  const itemBLeadingCoefficient = (itemBPattern === 0 || itemBPattern === 1 ? 1 : -1)
    * randomInteger(random, 1, 9);
  const itemBExponentChoices = itemBPattern === 0 || itemBPattern === 2
    ? [4, 6]
    : [3, 5, 7];
  const itemBExponent = itemBExponentChoices[randomInteger(random, 0, itemBExponentChoices.length - 1)]!;
  const itemBLowerExponent = randomInteger(random, 1, itemBExponent - 1);
  const itemBLowerCoefficient = (random() < 0.5 ? -1 : 1) * randomInteger(random, 1, 8);
  let itemBConstant = randomInteger(random, -8, 8);
  if (itemBConstant === 0) itemBConstant = 1;

  const itemA: BuiltItem = {
    item: {
      id: 'a',
      functionName: 'f',
      expression: `${formatCoefficient(itemACoefficient)}x^${itemAExponent}`,
    },
    leadingTerm: { coefficient: itemACoefficient, exponent: itemAExponent },
  };
  const itemB: BuiltItem = {
    item: {
      id: 'b',
      functionName: 'g',
      expression: `${formatCoefficient(itemBLeadingCoefficient)}x^${itemBExponent} ${signedTerm(itemBLowerCoefficient, itemBLowerExponent)} ${signedConstant(itemBConstant)}`,
    },
    leadingTerm: { coefficient: itemBLeadingCoefficient, exponent: itemBExponent },
  };

  return {
    variant: {
      seed,
      prompt: SOURCE_PROMPT,
      items: [itemA.item, itemB.item],
    },
    leadingTerms: [itemA.leadingTerm, itemB.leadingTerm],
  };
}

function buildVariant(seed: number): BuiltVariant {
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

function solutionSteps(
  items: readonly Topic16LimitNotationItem[],
  leadingTerms: readonly LeadingTerm[],
  answers: Topic16LimitNotationAnswers,
): Array<{ description: string }> {
  return items.map((item, index) => {
    const leadingTerm = leadingTerms[index]!;
    const parity = leadingTerm.exponent % 2 === 0 ? 'even' : 'odd';
    const sign = leadingTerm.coefficient > 0 ? 'positive' : 'negative';
    const left = answers[`${item.id}_leftLimit`];
    const right = answers[`${item.id}_rightLimit`];
    return {
      description: `${item.id}) The leading term is ${item.expression.split(' ')[0]}. The degree is ${leadingTerm.exponent}, which is ${parity}, and the leading coefficient is ${sign}. Therefore, lim(x to -infinity) ${item.functionName}(x) = ${formatEnd(left)} and lim(x to infinity) ${item.functionName}(x) = ${formatEnd(right)}.`,
    };
  });
}

function gradingMetadata(answers: Topic16LimitNotationAnswers): GradingMetadata {
  const partIds = Object.keys(answers);
  return {
    partAnswers: answers,
    partMaxScores: Object.fromEntries(partIds.map((partId) => [partId, 1])),
    partGradingRules: Object.fromEntries(partIds.map((partId) => [partId, 'exact_match'])),
  };
}

export function generateTopic16LimitNotationEndBehavior(
  seed: number,
): Topic16LimitNotationVariant {
  validateSeed(seed);
  return buildVariant(seed).variant;
}

export function generateTopic16LimitNotationEndBehaviorOutput(seed: number): GeneratorOutput {
  validateSeed(seed);
  const built = buildVariant(seed);
  const answers = seed === 0 ? SOURCE_ANSWERS : buildAnswers(built.leadingTerms);
  return {
    prompt: built.variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: built.variant.prompt,
        items: built.variant.items,
        presentationMode: 'independent_practice',
      },
    },
    expectedAnswer: answers,
    solutionSteps: seed === 0
      ? SOURCE_SOLUTION_STEPS.map((description) => ({ description }))
      : solutionSteps(built.variant.items, built.leadingTerms, answers),
    gradingMetadata: gradingMetadata(answers),
  };
}
