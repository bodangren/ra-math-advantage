import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export interface Topic12PointwiseLeastRateChoicePoint {
  readonly x: number;
  readonly y: number;
}

export interface Topic12PointwiseLeastRateChoiceLabeledPoint {
  readonly id: string;
  readonly label: string;
  readonly pointIndex: number;
  readonly x: number;
  readonly y: number;
}

export interface Topic12PointwiseLeastRateChoiceOption {
  readonly id: string;
  readonly label: string;
  readonly pointIndex: number;
}

export interface Topic12PointwiseLeastRateChoiceVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
  readonly xLabel: string;
  readonly yLabel: string;
  readonly graphPoints: readonly Topic12PointwiseLeastRateChoicePoint[];
  readonly labeledPoints: readonly Topic12PointwiseLeastRateChoiceLabeledPoint[];
  readonly options: readonly Topic12PointwiseLeastRateChoiceOption[];
  readonly correctOptionId: string;
  readonly solutionSteps: readonly string[];
}

export const TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID =
  'math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs';

const SOURCE_PROMPT = 'The figure shows the graph of a function g in the xy-plane with four labeled points. Of the following points, at which is the rate of change of g the least?';
const GENERATED_PROMPT = 'This hypothetical graph shows a function g in the xy-plane with four labeled points. At which labeled point is the rate of change least?';
const DOMAIN: readonly [number, number] = [-5, 5];
const RANGE: readonly [number, number] = [-4, 4];
const LABELS = ['A', 'B', 'C', 'D'] as const;
const LABELED_POINT_INDICES = [2, 4, 8, 11] as const;
const SOURCE_GRAPH_POINTS: readonly Topic12PointwiseLeastRateChoicePoint[] = [
  { x: -5, y: -1 },
  { x: -4.2, y: -1.4 },
  { x: -3.5, y: -1.2 },
  { x: -2.2, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 2 },
  { x: 1.2, y: 2.6 },
  { x: 1.5, y: 2.65 },
  { x: 2.3, y: 2.3 },
  { x: 3, y: 1.5 },
  { x: 3.6, y: 0 },
  { x: 4, y: -1 },
  { x: 4.8, y: -4 },
];

function centeredSlope(
  points: readonly Topic12PointwiseLeastRateChoicePoint[],
  pointIndex: number,
): number {
  const previous = points[pointIndex - 1]!;
  const next = points[pointIndex + 1]!;
  return (next.y - previous.y) / (next.x - previous.x);
}

function buildLabeledPoints(
  points: readonly Topic12PointwiseLeastRateChoicePoint[],
  pointIndices: readonly number[],
): readonly Topic12PointwiseLeastRateChoiceLabeledPoint[] {
  return LABELS.map((label, index) => {
    const pointIndex = pointIndices[index]!;
    const point = points[pointIndex]!;
    return {
      id: label,
      label,
      pointIndex,
      x: point.x,
      y: point.y,
    };
  });
}

function buildOptions(
  pointIndices: readonly number[],
): readonly Topic12PointwiseLeastRateChoiceOption[] {
  return LABELS.map((label, index) => ({
    id: label,
    label,
    pointIndex: pointIndices[index]!,
  }));
}

function findLeastOptionId(
  points: readonly Topic12PointwiseLeastRateChoicePoint[],
  options: readonly Topic12PointwiseLeastRateChoiceOption[],
): string {
  const slopes = options.map((option) => centeredSlope(points, option.pointIndex));
  const leastIndex = slopes.reduce((bestIndex, slope, index) => (
    slope < slopes[bestIndex]! ? index : bestIndex
  ), 0);
  return options[leastIndex]!.id;
}

function buildSolutionSteps(correctOptionId: string): readonly string[] {
  return [
    'Compare the local direction and steepness at points A, B, C, and D.',
    `Point ${correctOptionId} has the steepest downward local behavior, so its rate of change is least.`,
    `Therefore, option ${correctOptionId} is correct.`,
  ];
}

function transformSourceGraph(
  random: () => number,
): readonly Topic12PointwiseLeastRateChoicePoint[] {
  const xScale = 0.82 + random() * 0.12;
  const xTranslation = -0.2 + random() * 0.4;
  const yScale = 0.82 + random() * 0.12;
  const yTranslation = -0.1 + random() * 0.2;

  return SOURCE_GRAPH_POINTS.map((point) => ({
    x: point.x * xScale + xTranslation,
    y: point.y * yScale + yTranslation,
  }));
}

function permutePointIndices(random: () => number): readonly number[] {
  const pointIndices = [...LABELED_POINT_INDICES];
  for (let index = pointIndices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pointIndices[index], pointIndices[swapIndex]] = [pointIndices[swapIndex]!, pointIndices[index]!];
  }
  return pointIndices;
}

export function generateTopic12PointwiseLeastRateChoice(seed: number): Topic12PointwiseLeastRateChoiceVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative integer');
  }

  if (seed === 0) {
    const options = buildOptions(LABELED_POINT_INDICES);
    const correctOptionId = findLeastOptionId(SOURCE_GRAPH_POINTS, options);
    return {
      seed: 0,
      prompt: SOURCE_PROMPT,
      domain: DOMAIN,
      range: RANGE,
      xLabel: 'x',
      yLabel: 'y',
      graphPoints: SOURCE_GRAPH_POINTS,
      labeledPoints: buildLabeledPoints(SOURCE_GRAPH_POINTS, LABELED_POINT_INDICES),
      options,
      correctOptionId,
      solutionSteps: buildSolutionSteps(correctOptionId),
    };
  }

  const random = mulberry32(seed);
  const graphPoints = transformSourceGraph(random);
  const pointIndices = permutePointIndices(random);
  const options = buildOptions(pointIndices);
  const correctOptionId = findLeastOptionId(graphPoints, options);

  return {
    seed,
    prompt: GENERATED_PROMPT,
    domain: DOMAIN,
    range: RANGE,
    xLabel: 'x',
    yLabel: 'y',
    graphPoints,
    labeledPoints: buildLabeledPoints(graphPoints, pointIndices),
    options,
    correctOptionId,
    solutionSteps: buildSolutionSteps(correctOptionId),
  };
}

export function generateTopic12PointwiseLeastRateChoiceOutput(seed: number): GeneratorOutput {
  const variant = generateTopic12PointwiseLeastRateChoice(seed);
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
      labeledPoints: variant.labeledPoints,
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
