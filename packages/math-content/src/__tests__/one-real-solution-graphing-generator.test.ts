import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';
import { parseQuadratic } from '@math-platform/graphing-core';

import { graphingExplorerSchema } from '../schemas/graphing-explorer.schema';
import { GENERATOR_KEYS, getGenerator } from '../knowledge-space/generators/registry';

const GENERATOR_KEY = 'one-real-solution-graphing';
const ATOMIC_NODE_ID = 'math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing';
const ORIGINAL_EQUATION = '7 - x^2 = 2x + 8';
const EQUATION = 'f(x) = x^2 + 2x + 1';
const TABLE_VALUES = [
  { x: -3, y: 4 },
  { x: -2, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 4 },
];

describe('one-real-solution-graphing generator', () => {
  it('resolves the exact registry identity', () => {
    const generator = getGenerator(GENERATOR_KEY);

    expect(generator.key).toBe(GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([ATOMIC_NODE_ID]);
    expect(GENERATOR_KEYS).toContain(GENERATOR_KEY);
  });

  it('emits the exact deterministic seed 0 Independent specimen', () => {
    const generator = getGenerator(GENERATOR_KEY);
    const input = { nodeId: ATOMIC_NODE_ID, seed: 0, difficulty: 0.5 };
    const output = generator.generate(input);
    const repeat = generator.generate(input);
    const data = output.data as {
      root: number;
      scale: number;
      a: number;
      b: number;
      c: number;
      difficulty: number;
      tableValues: Array<{ x: number; y: number }>;
      rendererProps: Record<string, unknown>;
    };
    const placedPoints = TABLE_VALUES;

    expect(repeat).toEqual(output);
    expect(output.prompt).toContain(ORIGINAL_EQUATION);
    expect(output.prompt).not.toContain('x = -1');
    expect(output.prompt).not.toMatch(/solution\s+is\s+-1/i);
    expect(data).toMatchObject({
      root: -1,
      scale: 1,
      a: 1,
      b: 2,
      c: 1,
      difficulty: 0.5,
    });
    expect(data.tableValues).toEqual(TABLE_VALUES);
    expect(data.rendererProps).toEqual({
      equation: EQUATION,
      variant: 'plot_from_equation',
      responseVariant: 'one_real_solution',
      originalEquation: ORIGINAL_EQUATION,
      domain: [-4, 2],
      range: [-1, 10],
    });
    expect(output.expectedAnswer).toEqual({
      table_values: TABLE_VALUES,
      placed_points: placedPoints,
      solution: -1,
    });
    expect(Object.keys(output.expectedAnswer)).toEqual([
      'table_values',
      'placed_points',
      'solution',
    ]);
    expect(output.gradingMetadata).toEqual({
      partAnswers: {
        table_values: TABLE_VALUES,
        placed_points: placedPoints,
        solution: -1,
      },
      partMaxScores: {
        table_values: 1,
        placed_points: 1,
        solution: 1,
      },
      partGradingRules: {
        table_values: 'custom',
        placed_points: 'custom',
        solution: 'numeric_tolerance',
      },
      partTolerances: { solution: 0.01 },
    });
    expect(Object.keys(output.gradingMetadata.partAnswers)).toEqual([
      'table_values',
      'placed_points',
      'solution',
    ]);
    expect(Object.keys(output.gradingMetadata.partMaxScores)).toEqual([
      'table_values',
      'placed_points',
      'solution',
    ]);
    expect(Object.keys(output.gradingMetadata.partGradingRules)).toEqual([
      'table_values',
      'placed_points',
      'solution',
    ]);
    expect(output.solutionSteps).toHaveLength(4);
    expect(output.solutionSteps[0]?.expression).toBe('0 = x^2 + 2x + 1');
    expect(output.solutionSteps[0]?.description).toMatch(/rewrite/i);
    expect(output.solutionSteps[1]?.description).toMatch(/axis|repeated root/i);
    expect(output.solutionSteps[2]?.description).toMatch(/table|graph/i);
    expect(output.solutionSteps[3]?.description).toMatch(/solution/i);
    expect(graphingExplorerSchema.safeParse(data.rendererProps).success).toBe(true);
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
  });

  it('keeps every generated one-real-solution specimen coherent across 1000 seeds', () => {
    const generator = getGenerator(GENERATOR_KEY);
    const roots = new Set<number>();
    const scales = new Set<number>();
    const equationSignatures = new Set<string>();

    for (let seed = 0; seed < 1000; seed += 1) {
      const input = { nodeId: ATOMIC_NODE_ID, seed, difficulty: 0.5 };
      const output = generator.generate(input);
      const repeat = generator.generate(input);
      const data = output.data as {
        root: number;
        scale: number;
        a: number;
        b: number;
        c: number;
        tableValues: Array<{ x: number; y: number }>;
        rendererProps: {
          equation: string;
          variant: string;
          responseVariant: string;
          originalEquation: string;
          domain: [number, number];
          range: [number, number];
        };
      };
      const props = data.rendererProps;
      const parsed = parseQuadratic(props.equation);
      const expectedTableValues = [
        { x: data.root - 2, y: data.scale * 4 },
        { x: data.root - 1, y: data.scale },
        { x: data.root, y: 0 },
        { x: data.root + 1, y: data.scale },
        { x: data.root + 2, y: data.scale * 4 },
      ];
      const linearTerm = data.b === 0
        ? ''
        : data.b === 1
          ? 'x'
          : data.b === -1
            ? '-x'
            : `${data.b}x`;
      const originalEquation = data.b === 0
        ? `7 - ${data.scale === 1 ? '' : `${data.scale}`}x^2 = ${7 + data.c}`
        : `7 - ${data.scale === 1 ? '' : `${data.scale}`}x^2 = ${linearTerm} + ${7 + data.c}`;

      expect(repeat).toEqual(output);
      expect(Number.isInteger(data.root)).toBe(true);
      expect(data.root).toBeGreaterThanOrEqual(-4);
      expect(data.root).toBeLessThanOrEqual(4);
      expect(Number.isInteger(data.scale)).toBe(true);
      expect(data.scale).toBeGreaterThanOrEqual(1);
      expect(data.scale).toBeLessThanOrEqual(3);
      expect(data.a).toBe(data.scale);
      expect(data.b).toBe(data.root === 0 ? 0 : -2 * data.scale * data.root);
      expect(data.c).toBe(data.scale * data.root ** 2);
      expect(parsed).toEqual({ a: data.a, b: data.b, c: data.c });
      expect(parsed).not.toBeNull();
      expect(data.b ** 2 - 4 * data.a * data.c).toBe(0);
      expect(props.variant).toBe('plot_from_equation');
      expect(props.responseVariant).toBe('one_real_solution');
      expect(props.domain).toEqual([data.root - 3, data.root + 3]);
      expect(props.range[0]).toBe(-1);
      expect(Number.isFinite(props.range[1])).toBe(true);
      expect(props.range[1]).toBeGreaterThanOrEqual(4 * data.scale + 2);
      expect(props.originalEquation).toBe(originalEquation);
      expect(data.tableValues).toEqual(expectedTableValues);
      expect(output.expectedAnswer).toEqual({
        table_values: expectedTableValues,
        placed_points: expectedTableValues,
        solution: data.root,
      });
      expect(Object.keys(output.expectedAnswer)).toEqual([
        'table_values',
        'placed_points',
        'solution',
      ]);
      expect(output.gradingMetadata).toEqual({
        partAnswers: {
          table_values: expectedTableValues,
          placed_points: expectedTableValues,
          solution: data.root,
        },
        partMaxScores: {
          table_values: 1,
          placed_points: 1,
          solution: 1,
        },
        partGradingRules: {
          table_values: 'custom',
          placed_points: 'custom',
          solution: 'numeric_tolerance',
        },
        partTolerances: { solution: 0.01 },
      });
      expect(Object.keys(output.gradingMetadata.partAnswers)).toEqual([
        'table_values',
        'placed_points',
        'solution',
      ]);
      expect(Object.keys(output.gradingMetadata.partMaxScores)).toEqual([
        'table_values',
        'placed_points',
        'solution',
      ]);
      expect(Object.keys(output.gradingMetadata.partGradingRules)).toEqual([
        'table_values',
        'placed_points',
        'solution',
      ]);
      expect(output.prompt).toContain(originalEquation);
      expect(output.prompt).not.toContain(`x = ${data.root}`);
      expect(props.domain[0]).toBeLessThan(data.root - 2);
      expect(props.domain[1]).toBeGreaterThan(data.root + 2);
      expect(props.range[0]).toBeLessThan(0);
      expect(props.range[1]).toBeGreaterThan(4 * data.scale);
      for (const point of expectedTableValues) {
        expect(point.x).toBeGreaterThan(props.domain[0]);
        expect(point.x).toBeLessThan(props.domain[1]);
        expect(point.y).toBeGreaterThan(props.range[0]);
        expect(point.y).toBeLessThan(props.range[1]);
      }
      expect(graphingExplorerSchema.safeParse(props).success).toBe(true);
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);

      roots.add(data.root);
      scales.add(data.scale);
      equationSignatures.add(props.equation);
    }

    expect(roots.size).toBeGreaterThan(1);
    expect(scales.size).toBeGreaterThan(1);
    expect(equationSignatures.size).toBeGreaterThan(1);
  });
});
