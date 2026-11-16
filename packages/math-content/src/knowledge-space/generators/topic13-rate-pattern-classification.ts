import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export type Topic13RatePatternClassification =
  | 'linear'
  | 'quadratic'
  | 'neither'
  | 'cannot_determine';

export type Topic13RatePatternClassificationCaseId = 'a' | 'b' | 'c';

export interface Topic13RatePatternClassificationTableCase {
  readonly id: Topic13RatePatternClassificationCaseId;
  readonly functionName: string;
  readonly xValues: readonly number[];
  readonly yValues: readonly number[];
}

export interface Topic13RatePatternClassificationVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly cases: readonly Topic13RatePatternClassificationTableCase[];
}

export const TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID =
  'math.precalc.skill.1.3.classify-linear-vs-quadratic-from-rate-patterns';

const SOURCE_PROMPT = 'Could each function be linear, quadratic, or neither?';
const GENERATED_PROMPT = 'Could each function be linear, quadratic, or neither? Use the table values to classify each function.';
const CASE_IDS: readonly Topic13RatePatternClassificationCaseId[] = ['a', 'b', 'c'];

type UnlabeledCase = Omit<Topic13RatePatternClassificationTableCase, 'id'>;

const SOURCE_CASES: readonly UnlabeledCase[] = [
  { functionName: 'f', xValues: [1, 2, 3, 4], yValues: [0, 1, 4, 9] },
  { functionName: 'g', xValues: [1, 2, 5, 10], yValues: [0, 1, 4, 9] },
  { functionName: 'p', xValues: [1, 1.1, 1.2, 1.3], yValues: [1, 7, 11, 13] },
];

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  return shuffled;
}

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function randomNonZeroInteger(random: () => number): number {
  const value = randomInteger(random, -4, 4);
  return value === 0 ? 1 : value;
}

function generatedQuadraticCase(random: () => number): UnlabeledCase {
  const xStart = randomInteger(random, -3, 3);
  const width = randomInteger(random, 1, 3);
  const startingY = randomInteger(random, -5, 5);
  const firstDifference = randomNonZeroInteger(random);
  const secondDifference = randomNonZeroInteger(random);
  const xValues = [0, 1, 2, 3].map((index) => xStart + index * width);
  const yValues = [0, 1, 2, 3].map((index) => (
    startingY + index * firstDifference + (index * (index - 1) / 2) * secondDifference
  ));

  return { functionName: 'q', xValues, yValues };
}

function generatedLinearCase(random: () => number): UnlabeledCase {
  const xStart = randomInteger(random, -3, 3);
  const width = randomInteger(random, 1, 3);
  const startingY = randomInteger(random, -5, 5);
  const firstDifference = randomNonZeroInteger(random);
  const xValues = [0, 1, 2, 3].map((index) => xStart + index * width);
  const yValues = [0, 1, 2, 3].map((index) => startingY + index * firstDifference);

  return { functionName: 'l', xValues, yValues };
}

function generatedUnequalWidthCase(random: () => number): UnlabeledCase {
  const xStart = randomInteger(random, -3, 3);
  const firstGap = randomInteger(random, 1, 2);
  const secondGap = firstGap + randomInteger(random, 1, 2);
  const thirdGap = secondGap + randomInteger(random, 1, 2);
  const startingY = randomInteger(random, -5, 5);
  const firstDifference = randomNonZeroInteger(random);
  const secondDifference = randomNonZeroInteger(random);
  const thirdDifference = randomNonZeroInteger(random);
  const xValues = [
    xStart,
    xStart + firstGap,
    xStart + firstGap + secondGap,
    xStart + firstGap + secondGap + thirdGap,
  ];
  const yValues = [
    startingY,
    startingY + firstDifference,
    startingY + firstDifference + secondDifference,
    startingY + firstDifference + secondDifference + thirdDifference,
  ];

  return { functionName: 'w', xValues, yValues };
}

function generatedNeitherCase(random: () => number): UnlabeledCase {
  const xStart = randomInteger(random, -3, 3);
  const width = randomInteger(random, 1, 3);
  const startingY = randomInteger(random, -5, 5);
  const firstDifference = randomNonZeroInteger(random);
  const firstSecondDifference = randomNonZeroInteger(random);
  let secondSecondDifference = randomNonZeroInteger(random);
  while (secondSecondDifference === firstSecondDifference) {
    secondSecondDifference = randomNonZeroInteger(random);
  }
  const firstDifferences = [
    firstDifference,
    firstDifference + firstSecondDifference,
    firstDifference + firstSecondDifference + secondSecondDifference,
  ];
  const xValues = [0, 1, 2, 3].map((index) => xStart + index * width);
  const yValues = [
    startingY,
    startingY + firstDifferences[0]!,
    startingY + firstDifferences[0]! + firstDifferences[1]!,
    startingY + firstDifferences[0]! + firstDifferences[1]! + firstDifferences[2]!,
  ];

  return { functionName: 'h', xValues, yValues };
}

function buildSolutionSteps(
  variant: Topic13RatePatternClassificationVariant,
): Array<{ description: string }> {
  if (variant.seed === 0) {
    return [
      { description: 'Equal input widths of 1 and constant second differences of 2 show that f could be quadratic (concave up).' },
      { description: 'The input widths are 1, 3, and 5. The output changes are also 1, 3, and 5. Each average rate is 1, so g could be linear: g(x) = x - 1.' },
      { description: 'Equal input widths of 0.1 and differences 6, 4, 2 with constant second differences of -2 show that p could be quadratic (concave down).' },
    ];
  }
  return variant.cases.map((tableCase) => ({ description: solutionDescription(tableCase) }));
}

function sourceVariant(): Topic13RatePatternClassificationVariant {
  return {
    seed: 0,
    prompt: SOURCE_PROMPT,
    cases: SOURCE_CASES.map((tableCase, index) => ({
      id: CASE_IDS[index]!,
      functionName: tableCase.functionName,
      xValues: tableCase.xValues,
      yValues: tableCase.yValues,
    })),
  };
}

function generatedVariant(seed: number): Topic13RatePatternClassificationVariant {
  const random = mulberry32(seed);
  const parityCase = seed % 2 === 0
    ? generatedNeitherCase(random)
    : generatedLinearCase(random);
  const cases = shuffle([
    generatedQuadraticCase(random),
    generatedUnequalWidthCase(random),
    parityCase,
  ], random);

  return {
    seed,
    prompt: GENERATED_PROMPT,
    cases: cases.map((tableCase, index) => ({
      id: CASE_IDS[index]!,
      functionName: tableCase.functionName,
      xValues: tableCase.xValues,
      yValues: tableCase.yValues,
    })),
  };
}

function equalWithin(left: number, right: number): boolean {
  return Math.abs(left - right) <= 1e-9;
}

function differences(values: readonly number[]): number[] {
  return values.slice(1).map((value, index) => value - values[index]!);
}

function classifyTableCase(
  tableCase: Topic13RatePatternClassificationTableCase,
): Topic13RatePatternClassification {
  if (
    tableCase.xValues.length !== 4 ||
    tableCase.yValues.length !== 4 ||
    !tableCase.xValues.every(Number.isFinite) ||
    !tableCase.yValues.every(Number.isFinite) ||
    !tableCase.xValues.slice(1).every((value, index) => value > tableCase.xValues[index]!)
  ) {
    throw new Error('rate-pattern classification generator received invalid table geometry');
  }
  const widths = differences(tableCase.xValues);
  const rates = differences(tableCase.yValues).map((change, index) => change / widths[index]!);
  if (rates.every(rate => equalWithin(rate, rates[0]!))) return 'linear';
  const secondDividedDifferences = differences(rates).map((change, index) =>
    change / (tableCase.xValues[index + 2]! - tableCase.xValues[index]!));
  if (secondDividedDifferences.every(value => equalWithin(value, secondDividedDifferences[0]!))) return 'quadratic';
  return 'neither';
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

function solutionDescription(
  tableCase: Topic13RatePatternClassificationTableCase,
): string {
  const rates = differences(tableCase.yValues).map((change, index) =>
    change / (tableCase.xValues[index + 1]! - tableCase.xValues[index]!));
  const classification = classifyTableCase(tableCase);
  if (classification === 'linear') return `The average rates are ${rates.map(formatNumber).join(', ')}. They are equal, so ${tableCase.functionName} could be linear.`;
  const divided = differences(rates).map((change, index) =>
    change / (tableCase.xValues[index + 2]! - tableCase.xValues[index]!));
  return `Divide each change in adjacent average rates by the span of the three inputs. The results are ${divided.map(formatNumber).join(', ')}. ${classification === 'quadratic' ? 'They are equal and nonzero, so the table could be quadratic.' : 'They are unequal, so no linear or quadratic function fits all four points.'}`;
}

function expectedAnswer(variant: Topic13RatePatternClassificationVariant): Record<string, unknown> {
  return Object.fromEntries(variant.cases.map((tableCase) => [
    tableCase.id,
    classifyTableCase(tableCase),
  ]));
}

export function generateTopic13RatePatternClassification(
  seed: number,
): Topic13RatePatternClassificationVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative integer');
  }
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

export function generateTopic13RatePatternClassificationOutput(seed: number): GeneratorOutput {
  const variant = generateTopic13RatePatternClassification(seed);
  const answer = expectedAnswer(variant);
  const rendererProps = {
    prompt: variant.prompt,
    cases: variant.cases,
    presentationMode: 'independent_practice' as const,
  };

  return {
    prompt: variant.prompt,
    data: { seed, rendererProps },
    expectedAnswer: answer,
    solutionSteps: buildSolutionSteps(variant),
    gradingMetadata: {
      partAnswers: answer,
      partMaxScores: { a: 1, b: 1, c: 1 },
      partGradingRules: { a: 'exact_match', b: 'exact_match', c: 'exact_match' },
    },
  };
}
