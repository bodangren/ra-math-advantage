import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';

import {
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
  TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
} from '../topic12-pointwise-rate-ordering';
import { getGenerator } from '../registry';

const SOURCE_GRAPH_POINTS = [
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
  graphPoints: readonly { x: number; y: number }[],
  pointIndex: number,
): number {
  const previous = graphPoints[pointIndex - 1]!;
  const next = graphPoints[pointIndex + 1]!;
  return (next.y - previous.y) / (next.x - previous.x);
}

function recomputeOrder(variant: ReturnType<typeof generateTopic12PointwiseRateOrdering>): string[] {
  return [...variant.labeledPoints]
    .sort((left, right) => (
      centeredSlope(variant.graphPoints, left.pointIndex)
      - centeredSlope(variant.graphPoints, right.pointIndex)
    ))
    .map((point) => point.id);
}

describe('Topic 1.2 pointwise rate-ordering generator', () => {
  it('reproduces the authored Example 1 source shape and order at seed 0', () => {
    const variant = generateTopic12PointwiseRateOrdering(0);

    expect(variant.prompt).toBe('The figure shows the graph of a function f in the xy-plane with three labeled points. Order the rates of change of f at the three labeled points from least to greatest.');
    expect(variant.domain).toEqual([-5, 5]);
    expect(variant.range).toEqual([-4, 4]);
    expect(variant.xLabel).toBe('x');
    expect(variant.yLabel).toBe('y');
    expect(variant.graphPoints).toEqual(SOURCE_GRAPH_POINTS);
    expect(variant.graphPoints[1]!.y).toBeGreaterThan(variant.graphPoints[0]!.y);
    expect(variant.graphPoints[2]!.y).toBeGreaterThan(variant.graphPoints[1]!.y);
    expect(variant.graphPoints[4]!.y).toBeGreaterThan(variant.graphPoints[3]!.y);
    expect(variant.graphPoints[4]!.y).toBeGreaterThan(variant.graphPoints[5]!.y);
    expect(variant.labeledPoints).toEqual([
      { id: 'A', label: 'A', pointIndex: 2, x: -3, y: 0 },
      { id: 'B', label: 'B', pointIndex: 5, x: -1, y: 1 },
      { id: 'C', label: 'C', pointIndex: 8, x: 2.3, y: -2.1 },
    ]);
    expect(recomputeOrder(variant)).toEqual(['B', 'C', 'A']);
    expect(variant.solutionSteps).toEqual([
      'Compare the local direction and steepness at A, B, and C.',
      'Point B has the least rate, point C is next, and point A has the greatest rate.',
      'Therefore, the least-to-greatest order is B < C < A.',
    ]);
    expect(variant.solutionSteps.join(' ')).not.toMatch(/\b[fg]\s*\(/);
  });

  it('resolves through the registry with the exact Example 1 skill', () => {
    const generator = getGenerator('topic12-pointwise-rate-ordering');

    expect(generator.key).toBe('topic12-pointwise-rate-ordering');
    expect(generator.nodeIds).toEqual([TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID]);
    expect(generator.description).toContain('orderings');
    expect(generator.description).not.toContain('choices');
  });

  it('is deterministic and varies the computed ordering', () => {
    expect(generateTopic12PointwiseRateOrdering(42)).toEqual(generateTopic12PointwiseRateOrdering(42));
    expect(generateTopic12PointwiseRateOrdering(1)).not.toEqual(generateTopic12PointwiseRateOrdering(2));

    const orders = new Set(
      Array.from({ length: 1000 }, (_, seed) => recomputeOrder(generateTopic12PointwiseRateOrdering(seed)).join('|')),
    );
    expect(orders.size).toBeGreaterThanOrEqual(3);
  });

  it('keeps 1,000 variants bounded with a recomputed unique rate order', () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const variant = generateTopic12PointwiseRateOrdering(seed);
      const order = recomputeOrder(variant);
      const output = generateTopic12PointwiseRateOrderingOutput(seed);
      const outputData = output.data as Record<string, unknown>;
      expect(output.expectedAnswer).toEqual({ orderedPointIds: order });
      for (const key of ['correctOptionId', 'options', 'expectedAnswer', 'gradingMetadata', 'solutionSteps', 'slope', 'slopes', 'localSlope', 'localSlopes', 'derivative']) {
        expect(outputData).not.toHaveProperty(key);
      }
      expect(variant.graphPoints).toHaveLength(12);
      expect(variant.graphPoints.every((point) => (
        point.x >= variant.domain[0]
        && point.x <= variant.domain[1]
        && point.y >= variant.range[0]
        && point.y <= variant.range[1]
      ))).toBe(true);
      expect(variant.graphPoints.every((point, index) => (
        index === 0 || point.x > variant.graphPoints[index - 1]!.x
      ))).toBe(true);
      expect(variant.labeledPoints).toHaveLength(3);
      expect(new Set(variant.labeledPoints.map((point) => point.id))).toEqual(new Set(['A', 'B', 'C']));
      expect(variant.labeledPoints.every((point) => (
        variant.graphPoints[point.pointIndex]?.x === point.x
        && variant.graphPoints[point.pointIndex]?.y === point.y
      ))).toBe(true);
      expect(new Set(variant.labeledPoints.map((point) => centeredSlope(variant.graphPoints, point.pointIndex))).size).toBe(3);
      expect(order).toHaveLength(3);
      expect(new Set(order)).toEqual(new Set(['A', 'B', 'C']));
    }
  });

  it('adapts to GeneratorOutput without public answer, grading, or slope leakage', () => {
    const variant = generateTopic12PointwiseRateOrdering(0);
    const output = generateTopic12PointwiseRateOrderingOutput(0);

    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(output.expectedAnswer).toEqual({ orderedPointIds: ['B', 'C', 'A'] });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { orderedPointIds: ['B', 'C', 'A'] },
      partMaxScores: { orderedPointIds: 1 },
      partGradingRules: { orderedPointIds: 'exact_match' },
    });
    expect(output.solutionSteps).toEqual(variant.solutionSteps.map((description) => ({ description })));

    const data = output.data as Record<string, unknown>;
    expect(Object.keys(data).sort()).toEqual([
      'domain',
      'graphPoints',
      'labeledPoints',
      'prompt',
      'range',
      'seed',
      'xLabel',
      'yLabel',
    ]);
    for (const key of [
      'correctOptionId',
      'options',
      'expectedAnswer',
      'gradingMetadata',
      'solutionSteps',
      'slope',
      'slopes',
      'localSlope',
      'localSlopes',
      'derivative',
    ]) {
      expect(data).not.toHaveProperty(key);
    }
  });

  it('rejects invalid seeds', () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic12PointwiseRateOrdering(seed)).toThrow(RangeError);
      expect(() => generateTopic12PointwiseRateOrderingOutput(seed)).toThrow(RangeError);
    }
  });
});
