import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';
import { describe, expect, it } from 'vitest';

import {
  generateTopic14PolynomialExtremaFromGraph,
  generateTopic14PolynomialExtremaFromGraphOutput,
  TOPIC14_POLYNOMIAL_EXTREMA_FROM_GRAPH_NODE_ID,
} from '../topic14-polynomial-extrema-from-graph';
import { getGenerator } from '../registry';

const SOURCE_POINTS = [
  { x: -1, y: 664 },
  { x: -0.75, y: 475.26171875 },
  { x: -0.5, y: 325.6875 },
  { x: -0.25, y: 210.44921875 },
  { x: 0, y: 125 },
  { x: 0.25, y: 65.07421875 },
  { x: 0.5, y: 26.6875 },
  { x: 0.75, y: 6.13671875 },
  { x: 1, y: 0 },
  { x: 1.25, y: 5.13671875 },
  { x: 1.5, y: 18.6875 },
  { x: 1.75, y: 38.07421875 },
  { x: 2, y: 61 },
  { x: 2.25, y: 85.44921875 },
  { x: 2.5, y: 109.6875 },
  { x: 2.75, y: 132.26171875 },
  { x: 3, y: 152 },
  { x: 3.25, y: 168.01171875 },
  { x: 3.5, y: 179.6875 },
  { x: 3.75, y: 186.69921875 },
  { x: 4, y: 189 },
  { x: 4.25, y: 186.82421875 },
  { x: 4.5, y: 180.6875 },
  { x: 4.75, y: 171.38671875 },
  { x: 5, y: 160 },
] as const;

const SOURCE_PROPS = {
  prompt: 'Use the graph of polynomial g to identify its extrema.',
  functionName: 'g',
  coefficients: [3, -44, 204, -288, 125],
  domain: [-1, 5],
  points: SOURCE_POINTS,
  presentationMode: 'independent_practice',
} as const;

function evaluatePolynomial(coefficients: readonly number[], x: number): number {
  return coefficients.reduce((sum, coefficient, index) => (
    sum + coefficient * x ** (4 - index)
  ), 0);
}

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe('Topic 1.4 polynomial extrema from graph generator', () => {
  it('reproduces the authored Example 2 at seed 0', () => {
    const variant = generateTopic14PolynomialExtremaFromGraph(0);
    const output = generateTopic14PolynomialExtremaFromGraphOutput(0);

    expect(variant).toEqual({
      seed: 0,
      prompt: SOURCE_PROPS.prompt,
      functionName: 'g',
      coefficients: [3, -44, 204, -288, 125],
      domain: [-1, 5],
      points: SOURCE_POINTS,
    });
    expect(output.expectedAnswer).toEqual({
      relative_minimum_x: 1,
      relative_maximum_x: 4,
      absolute_minimum_x: 1,
    });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      'The graph changes from decreasing to increasing at x = 1, so x = 1 is a relative minimum.',
      'The graph changes from increasing to decreasing at x = 4, so x = 4 is a relative maximum.',
      'The lowest value overall occurs at x = 1, so g(1) is the absolute minimum.',
    ]);
    expect(output.data).toEqual({
      seed: 0,
      rendererProps: SOURCE_PROPS,
    });
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
  });

  it('registers the exact key and node through the public registry', () => {
    const generator = getGenerator('topic14-polynomial-extrema-from-graph');

    expect(generator.key).toBe('topic14-polynomial-extrema-from-graph');
    expect(generator.nodeIds).toEqual([TOPIC14_POLYNOMIAL_EXTREMA_FROM_GRAPH_NODE_ID]);
    expect(TOPIC14_POLYNOMIAL_EXTREMA_FROM_GRAPH_NODE_ID).toBe(
      'math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs',
    );
  });

  it('is deterministic and changes nearby positive seeds', () => {
    expect(generateTopic14PolynomialExtremaFromGraph(17)).toEqual(
      generateTopic14PolynomialExtremaFromGraph(17),
    );
    expect(generateTopic14PolynomialExtremaFromGraph(17)).not.toEqual(
      generateTopic14PolynomialExtremaFromGraph(18),
    );
  });

  it('generates safe graph samples and independent extrema across 10,000 seeds', () => {
    const signatures = new Set<string>();

    for (let seed = 1; seed <= 10000; seed += 1) {
      const variant = generateTopic14PolynomialExtremaFromGraph(seed);
      const output = generateTopic14PolynomialExtremaFromGraphOutput(seed);
      const { domain, coefficients, points } = variant;
      const answer = output.expectedAnswer;

      expect(points[0]).toEqual({ x: domain[0], y: points[0]!.y });
      expect(points.at(-1)).toEqual({ x: domain[1], y: points.at(-1)!.y });
      expect(points).toHaveLength((domain[1] - domain[0]) * 4 + 1);
      points.forEach((point, index) => {
        expect(point.x).toBe(domain[0] + index * 0.25);
        expect(point.y).toBe(evaluatePolynomial(coefficients, point.x));
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
        expect(Math.abs(point.x)).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
        expect(Math.abs(point.y)).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      });
      expect(coefficients.every((coefficient) => (
        Number.isSafeInteger(coefficient)
      ))).toBe(true);

      const minimumIndex = points.findIndex((point) => point.x === answer.absolute_minimum_x);
      const relativeMinimumIndex = points.findIndex((point) => point.x === answer.relative_minimum_x);
      const relativeMaximumIndex = points.findIndex((point) => point.x === answer.relative_maximum_x);
      expect(minimumIndex).toBeGreaterThanOrEqual(0);
      expect(relativeMinimumIndex).toBeGreaterThan(0);
      expect(relativeMinimumIndex).toBeLessThan(points.length - 1);
      expect(relativeMaximumIndex).toBeGreaterThan(0);
      expect(relativeMaximumIndex).toBeLessThan(points.length - 1);
      expect(points[minimumIndex]!.y).toBe(Math.min(...points.map((point) => point.y)));
      expect(points[relativeMinimumIndex - 1]!.y).toBeGreaterThan(points[relativeMinimumIndex]!.y);
      expect(points[relativeMinimumIndex + 1]!.y).toBeGreaterThan(points[relativeMinimumIndex]!.y);
      expect(points[relativeMaximumIndex - 1]!.y).toBeLessThan(points[relativeMaximumIndex]!.y);
      expect(points[relativeMaximumIndex + 1]!.y).toBeLessThan(points[relativeMaximumIndex]!.y);
      expect(answer.absolute_minimum_x).toBe(answer.relative_minimum_x);
      expect(answer.relative_minimum_x).not.toBe(answer.relative_maximum_x);
      expect(Object.keys(output.data).sort()).toEqual(['rendererProps', 'seed']);
      const rendererProps = output.data.rendererProps as Record<string, unknown>;
      expect(Object.keys(rendererProps).sort()).toEqual([
        'coefficients',
        'domain',
        'functionName',
        'points',
        'presentationMode',
        'prompt',
      ]);
      expect(rendererProps.presentationMode).toBe('independent_practice');
      for (const key of [
        'answer',
        'absoluteMinimum',
        'correctAnswer',
        'degree',
        'extrema',
        'grading',
        'gradingMetadata',
        'leadingCoefficient',
        'relativeMaximum',
        'relativeMinimum',
        'score',
        'solution',
        'solutionSteps',
      ]) {
        expect(serializedKeys(rendererProps)).not.toContain(key);
      }
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      signatures.add(JSON.stringify(variant));
    }

    expect(signatures.size).toBeGreaterThan(1000);
  });

  it('rejects invalid seeds', () => {
    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => generateTopic14PolynomialExtremaFromGraph(seed)).toThrow(RangeError);
      expect(() => generateTopic14PolynomialExtremaFromGraphOutput(seed)).toThrow(RangeError);
    }
  });
});
