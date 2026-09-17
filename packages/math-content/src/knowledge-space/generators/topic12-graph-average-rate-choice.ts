import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export interface Topic12GraphAverageRateChoicePoint {
  readonly x: number;
  readonly y: number;
}

export interface Topic12GraphAverageRateChoiceOption {
  readonly id: string;
  readonly label: string;
  readonly startInput: number;
  readonly endInput: number;
}

export interface Topic12GraphAverageRateChoiceVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
  readonly xLabel: string;
  readonly yLabel: string;
  readonly graphPoints: readonly Topic12GraphAverageRateChoicePoint[];
  readonly options: readonly Topic12GraphAverageRateChoiceOption[];
  readonly correctOptionId: string;
  readonly solutionSteps: readonly string[];
}

export const TOPIC12_GRAPH_AVERAGE_RATE_CHOICE_NODE_ID =
  'math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change';

const SOURCE_PROMPT = 'The figure shows the graph of y = h(x). On which interval is the average rate of change of h greatest?';
const GENERATED_PROMPT = 'This hypothetical graph shows y = h(x). On which interval is the average rate of change of h greatest?';
const SOURCE_OPTIONS: readonly Topic12GraphAverageRateChoiceOption[] = [
  { id: 'A', label: 'A', startInput: 2, endInput: 3 },
  { id: 'B', label: 'B', startInput: 3, endInput: 5 },
  { id: 'C', label: 'C', startInput: 5, endInput: 7 },
  { id: 'D', label: 'D', startInput: 7, endInput: 8 },
];
const SOURCE_GRAPH_POINTS: readonly Topic12GraphAverageRateChoicePoint[] = [
  { x: 0.8, y: 0 },
  { x: 1, y: 7 },
  { x: 1.3, y: 8.6 },
  { x: 2, y: 6 },
  { x: 2.2, y: 5.2 },
  { x: 3, y: 6 },
  { x: 3.5, y: 6.6 },
  { x: 4, y: 6 },
  { x: 5, y: 4 },
  { x: 5.2, y: 3.8 },
  { x: 6.6, y: 7.3 },
  { x: 7, y: 6 },
  { x: 7.7, y: 1.2 },
  { x: 8, y: 3 },
  { x: 8.2, y: 10.8 },
];

function calculateRate(
  points: readonly Topic12GraphAverageRateChoicePoint[],
  option: Topic12GraphAverageRateChoiceOption,
): number {
  const start = points.find((point) => point.x === option.startInput)!;
  const end = points.find((point) => point.x === option.endInput)!;
  return (end.y - start.y) / (end.x - start.x);
}

function buildOptions(intervals: readonly (readonly [number, number])[]): readonly Topic12GraphAverageRateChoiceOption[] {
  return intervals.map(([startInput, endInput], index) => ({
    id: String.fromCharCode(65 + index),
    label: String.fromCharCode(65 + index),
    startInput,
    endInput,
  }));
}

function buildSolutionSteps(
  points: readonly Topic12GraphAverageRateChoicePoint[],
  options: readonly Topic12GraphAverageRateChoiceOption[],
  finalStatement: string,
): readonly string[] {
  const steps = options.map((option) => {
    const start = points.find((point) => point.x === option.startInput)!;
    const end = points.find((point) => point.x === option.endInput)!;
    const outputChange = end.y - start.y;
    const inputChange = end.x - start.x;
    const rate = calculateRate(points, option);
    return `Option ${option.id}: (change in output)/(change in input) = (${end.y} - ${start.y}) / (${end.x} - ${start.x}) = ${outputChange} / ${inputChange} = ${rate}.`;
  });
  return [...steps, finalStatement];
}

function findGreatestOptionId(
  points: readonly Topic12GraphAverageRateChoicePoint[],
  options: readonly Topic12GraphAverageRateChoiceOption[],
): string {
  const rates = options.map((option) => calculateRate(points, option));
  const greatestIndex = rates.reduce((bestIndex, rate, index) => (
    rate > rates[bestIndex]! ? index : bestIndex
  ), 0);
  return options[greatestIndex]!.id;
}

function buildGeneratedPoints(
  rates: readonly number[],
  startY: number,
): readonly Topic12GraphAverageRateChoicePoint[] {
  const points: Topic12GraphAverageRateChoicePoint[] = [{ x: 0, y: startY }, { x: 1, y: startY }];
  let currentY = startY;
  rates.forEach((rate, index) => {
    const startX = 1 + index * 2;
    points.push({ x: startX + 1, y: currentY + rate });
    currentY += rate * 2;
    points.push({ x: startX + 2, y: currentY });
  });
  points.push({ x: 10, y: currentY });
  return points;
}

export function generateTopic12GraphAverageRateChoice(seed: number): Topic12GraphAverageRateChoiceVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative integer');
  }

  if (seed === 0) {
    return {
      seed: 0,
      prompt: SOURCE_PROMPT,
      domain: [0, 9],
      range: [0, 11],
      xLabel: 'x',
      yLabel: 'h(x)',
      graphPoints: SOURCE_GRAPH_POINTS,
      options: SOURCE_OPTIONS,
      correctOptionId: findGreatestOptionId(SOURCE_GRAPH_POINTS, SOURCE_OPTIONS),
      solutionSteps: buildSolutionSteps(
        SOURCE_GRAPH_POINTS,
        SOURCE_OPTIONS,
        'The rates are 0, -1, 1, and -3. The greatest average rate is 1, so option C is correct.',
      ),
    };
  }

  const random = mulberry32(seed);
  const greatestIndex = Math.floor(random() * 4);
  const rates = Array.from({ length: 4 }, (_, index) => (
    index === greatestIndex ? 1.1 + random() * 0.2 : -0.4 + random() * 0.8
  ));
  const startY = 4 + random() * 0.5;
  const graphPoints = buildGeneratedPoints(rates, startY);
  const options = buildOptions([[1, 3], [3, 5], [5, 7], [7, 9]]);
  const correctOptionId = findGreatestOptionId(graphPoints, options);

  return {
    seed,
    prompt: GENERATED_PROMPT,
    domain: [0, 10],
    range: [0, 11],
    xLabel: 'x',
    yLabel: 'h(x)',
    graphPoints,
    options,
    correctOptionId,
    solutionSteps: buildSolutionSteps(
      graphPoints,
      options,
      `The greatest average rate is ${calculateRate(graphPoints, options.find((option) => option.id === correctOptionId)!)}, so option ${correctOptionId} is correct.`,
    ),
  };
}

export function generateTopic12GraphAverageRateChoiceOutput(seed: number): GeneratorOutput {
  const variant = generateTopic12GraphAverageRateChoice(seed);
  const expectedAnswer = { selectedOptionId: variant.correctOptionId };

  return {
    prompt: variant.prompt,
    data: {
      seed,
      prompt: variant.prompt,
      domain: variant.domain,
      range: variant.range,
      xLabel: variant.xLabel,
      yLabel: variant.yLabel,
      graphPoints: variant.graphPoints,
      options: variant.options,
    },
    expectedAnswer,
    solutionSteps: variant.solutionSteps.map((description) => ({ description })),
    gradingMetadata: {
      partAnswers: expectedAnswer,
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: 'exact_match' },
    },
  };
}
