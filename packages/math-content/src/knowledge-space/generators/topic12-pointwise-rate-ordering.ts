import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export interface Topic12PointwiseRateOrderingPoint {
  readonly x: number;
  readonly y: number;
}

export interface Topic12PointwiseRateOrderingLabeledPoint {
  readonly id: string;
  readonly label: string;
  readonly pointIndex: number;
  readonly x: number;
  readonly y: number;
}

export interface Topic12PointwiseRateOrderingVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
  readonly xLabel: string;
  readonly yLabel: string;
  readonly graphPoints: readonly Topic12PointwiseRateOrderingPoint[];
  readonly labeledPoints: readonly Topic12PointwiseRateOrderingLabeledPoint[];
  readonly solutionSteps: readonly string[];
}

export const TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID =
  'math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs';

const SOURCE_PROMPT = 'The figure shows the graph of a function f in the xy-plane with three labeled points. Order the rates of change of f at the three labeled points from least to greatest.';
const GENERATED_PROMPT = 'This hypothetical graph shows a function f in the xy-plane with three labeled points. Order the rates of change of f at the labeled points from least to greatest.';
const DOMAIN: readonly [number, number] = [-5, 5];
const RANGE: readonly [number, number] = [-4, 4];
const LABELS = ['A', 'B', 'C'] as const;
const LABELED_POINT_INDICES = [2, 5, 8] as const;
const LABEL_PERMUTATIONS: readonly (readonly string[])[] = [
  ['A', 'B', 'C'],
  ['A', 'C', 'B'],
  ['B', 'A', 'C'],
  ['B', 'C', 'A'],
  ['C', 'A', 'B'],
  ['C', 'B', 'A'],
];
const SOURCE_GRAPH_POINTS: readonly Topic12PointwiseRateOrderingPoint[] = [
  { x: -4.2, y: -4 },
  { x: -3.7, y: -2.4 },
  { x: -3, y: 0 },
  { x: -2.3, y: 0.8 },
  { x: -1.7, y: 1.25 },
  { x: -1, y: 1 },
  { x: 0, y: 0 },
  { x: 1.4, y: -1.5 },
  { x: 2.3, y: -2.1 },
  { x: 2.9, y: -1.8 },
  { x: 4, y: 0 },
  { x: 5, y: 4 },
];

function centeredSlope(
  points: readonly Topic12PointwiseRateOrderingPoint[],
  pointIndex: number,
): number {
  const previous = points[pointIndex - 1]!;
  const next = points[pointIndex + 1]!;
  return (next.y - previous.y) / (next.x - previous.x);
}

function buildLabeledPoints(
  points: readonly Topic12PointwiseRateOrderingPoint[],
  labelsByPosition: readonly string[],
): readonly Topic12PointwiseRateOrderingLabeledPoint[] {
  return labelsByPosition.map((label, index) => {
    const pointIndex = LABELED_POINT_INDICES[index]!;
    const point = points[pointIndex]!;
    return {
      id: label,
      label,
      pointIndex,
      x: point.x,
      y: point.y,
    };
  }).sort((left, right) => LABELS.indexOf(left.id as typeof LABELS[number]) - LABELS.indexOf(right.id as typeof LABELS[number]));
}

function findOrderedPointIds(
  points: readonly Topic12PointwiseRateOrderingPoint[],
  labeledPoints: readonly Topic12PointwiseRateOrderingLabeledPoint[],
): readonly string[] {
  return [...labeledPoints]
    .sort((left, right) => (
      centeredSlope(points, left.pointIndex) - centeredSlope(points, right.pointIndex)
    ))
    .map((point) => point.id);
}

function buildSolutionSteps(orderedPointIds: readonly string[]): readonly string[] {
  return [
    'Compare the local direction and steepness at A, B, and C.',
    `Point ${orderedPointIds[0]} has the least rate, point ${orderedPointIds[1]} is next, and point ${orderedPointIds[2]} has the greatest rate.`,
    `Therefore, the least-to-greatest order is ${orderedPointIds.join(' < ')}.`,
  ];
}

function transformSourceGraph(
  random: () => number,
): readonly Topic12PointwiseRateOrderingPoint[] {
  const xScale = 0.82 + random() * 0.08;
  const xTranslation = -0.1 + random() * 0.2;
  const yScale = 0.82 + random() * 0.08;
  const yTranslation = -0.1 + random() * 0.2;

  return SOURCE_GRAPH_POINTS.map((point) => ({
    x: point.x * xScale + xTranslation,
    y: point.y * yScale + yTranslation,
  }));
}

export function generateTopic12PointwiseRateOrdering(seed: number): Topic12PointwiseRateOrderingVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative integer');
  }

  if (seed === 0) {
    const labeledPoints = buildLabeledPoints(SOURCE_GRAPH_POINTS, LABELS);
    const orderedPointIds = findOrderedPointIds(SOURCE_GRAPH_POINTS, labeledPoints);
    return {
      seed: 0,
      prompt: SOURCE_PROMPT,
      domain: DOMAIN,
      range: RANGE,
      xLabel: 'x',
      yLabel: 'y',
      graphPoints: SOURCE_GRAPH_POINTS,
      labeledPoints,
      solutionSteps: buildSolutionSteps(orderedPointIds),
    };
  }

  const random = mulberry32(seed);
  const graphPoints = transformSourceGraph(random);
  const orderedLabels = LABEL_PERMUTATIONS[Math.floor(random() * LABEL_PERMUTATIONS.length)]!;
  const labelsByPosition = [orderedLabels[2]!, orderedLabels[0]!, orderedLabels[1]!];
  const labeledPoints = buildLabeledPoints(graphPoints, labelsByPosition);
  const orderedPointIds = findOrderedPointIds(graphPoints, labeledPoints);

  return {
    seed,
    prompt: GENERATED_PROMPT,
    domain: DOMAIN,
    range: RANGE,
    xLabel: 'x',
    yLabel: 'y',
    graphPoints,
    labeledPoints,
    solutionSteps: buildSolutionSteps(orderedPointIds),
  };
}

export function generateTopic12PointwiseRateOrderingOutput(seed: number): GeneratorOutput {
  const variant = generateTopic12PointwiseRateOrdering(seed);
  const expectedAnswer = { orderedPointIds: [...findOrderedPointIds(variant.graphPoints, variant.labeledPoints)] };

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
    },
    expectedAnswer,
    solutionSteps: variant.solutionSteps.map((description) => ({ description })),
    gradingMetadata: {
      partAnswers: expectedAnswer,
      partMaxScores: { orderedPointIds: 1 },
      partGradingRules: { orderedPointIds: 'exact_match' },
    },
  };
}
