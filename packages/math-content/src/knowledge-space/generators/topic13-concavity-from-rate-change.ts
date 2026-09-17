import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export type Topic13ConcavityClassification = 'concave_up' | 'concave_down' | 'neither';

export interface Topic13ConcavityTableCase {
  readonly functionName: string;
  readonly xValues: readonly number[];
  readonly yValues: readonly number[];
}

export interface Topic13ConcavityVariant extends Topic13ConcavityTableCase {
  readonly seed: number;
  readonly prompt: string;
}

export const TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID =
  'math.precalc.skill.1.3.determine-concavity-from-rate-of-change';

const SOURCE_PROMPT = 'Determine concavity.';
const GENERATED_PROMPT = 'Determine concavity from the rate-of-change pattern.';
const FUNCTION_NAME = 'k';
const SOURCE_X_VALUES = [1, 1.1, 1.2, 1.3] as const;
const SOURCE_Y_VALUES = [4, 1, -1, -2] as const;

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function buildYValues(startingY: number, firstDifferences: readonly number[]): number[] {
  return [
    startingY,
    startingY + firstDifferences[0]!,
    startingY + firstDifferences[0]! + firstDifferences[1]!,
    startingY + firstDifferences[0]! + firstDifferences[1]! + firstDifferences[2]!,
  ];
}

function sourceVariant(): Topic13ConcavityVariant {
  return {
    seed: 0,
    prompt: SOURCE_PROMPT,
    functionName: FUNCTION_NAME,
    xValues: SOURCE_X_VALUES,
    yValues: SOURCE_Y_VALUES,
  };
}

function generatedVariant(seed: number): Topic13ConcavityVariant {
  const random = mulberry32(seed);
  const xStart = randomInteger(random, -100, 100);
  const width = randomInteger(random, 1, 20);
  const startingY = randomInteger(random, -1000, 1000);
  const firstDifference = randomInteger(random, -100, 100);
  const curvature = randomInteger(random, 1, 25);
  const classIndex = (seed - 1) % 3;
  const firstDifferences = classIndex === 0
    ? [firstDifference, firstDifference + curvature, firstDifference + 2 * curvature]
    : classIndex === 1
      ? [firstDifference, firstDifference - curvature, firstDifference - 2 * curvature]
      : [firstDifference, firstDifference + curvature, firstDifference];
  const xValues = [0, 1, 2, 3].map((index) => xStart + index * width);
  const yValues = buildYValues(startingY, firstDifferences);

  return {
    seed,
    prompt: GENERATED_PROMPT,
    functionName: FUNCTION_NAME,
    xValues,
    yValues,
  };
}

function differences(values: readonly number[]): number[] {
  return values.slice(1).map((value, index) => value - values[index]!);
}

function classifyVariant(variant: Topic13ConcavityVariant): Topic13ConcavityClassification {
  const firstDifferences = differences(variant.yValues);
  if (firstDifferences.every((difference, index) => index === 0 || difference > firstDifferences[index - 1]!)) {
    return 'concave_up';
  }
  if (firstDifferences.every((difference, index) => index === 0 || difference < firstDifferences[index - 1]!)) {
    return 'concave_down';
  }
  return 'neither';
}

function sourceSolutionSteps(): Array<{ description: string }> {
  return [
    { description: 'The first differences are -3, -2, and -1.' },
    { description: 'The first differences increase from -3 to -2 to -1.' },
    { description: 'Therefore, k is concave up.' },
  ];
}

function generatedSolutionSteps(variant: Topic13ConcavityVariant): Array<{ description: string }> {
  const firstDifferences = differences(variant.yValues);
  const classification = classifyVariant(variant);
  if (classification === 'concave_up') {
    return [
      { description: `The first differences are ${firstDifferences.join(', ')}.` },
      { description: `The first differences increase from ${firstDifferences.join(' to ')}.` },
      { description: `Therefore, ${variant.functionName} is concave up.` },
    ];
  }
  if (classification === 'concave_down') {
    return [
      { description: `The first differences are ${firstDifferences.join(', ')}.` },
      { description: `The first differences decrease from ${firstDifferences.join(' to ')}.` },
      { description: `Therefore, ${variant.functionName} is concave down.` },
    ];
  }
  return [
    { description: `The first differences are ${firstDifferences.join(', ')}.` },
    { description: 'The first differences do not consistently increase or decrease.' },
    { description: `Therefore, ${variant.functionName} has neither concave-up nor concave-down behavior.` },
  ];
}

export function generateTopic13ConcavityFromRateChange(seed: number): Topic13ConcavityVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative integer');
  }
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

export function generateTopic13ConcavityFromRateChangeOutput(seed: number): GeneratorOutput {
  const variant = generateTopic13ConcavityFromRateChange(seed);
  const answer = { classification: classifyVariant(variant) };
  const rendererProps = {
    prompt: variant.prompt,
    functionName: variant.functionName,
    xValues: variant.xValues,
    yValues: variant.yValues,
    presentationMode: 'independent_practice' as const,
  };

  return {
    prompt: variant.prompt,
    data: { seed, rendererProps },
    expectedAnswer: answer,
    solutionSteps: seed === 0 ? sourceSolutionSteps() : generatedSolutionSteps(variant),
    gradingMetadata: {
      partAnswers: answer,
      partMaxScores: { classification: 1 },
      partGradingRules: { classification: 'exact_match' },
    },
  };
}
