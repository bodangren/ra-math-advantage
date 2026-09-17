import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';
import { parseQuadratic } from '@math-platform/graphing-core';

import { graphingExplorerSchema } from '../schemas/graphing-explorer.schema';
import { getGenerator } from '../knowledge-space/generators/registry';

const SYMMETRY_NODE_ID =
  'math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry';

describe('quadratic-graph-analysis symmetry-graph generator', () => {
  it('generates deterministic source-aligned symmetry graph practice', () => {
    const generator = getGenerator('quadratic-graph-analysis');
    const parameterTriples = new Set<string>();
    const equations = new Set<string>();

    expect(generator.nodeIds).toContain(SYMMETRY_NODE_ID);

    for (let seed = 0; seed < 1000; seed += 1) {
      const input = { nodeId: SYMMETRY_NODE_ID, seed, difficulty: 0.5 };
      const output = generator.generate(input);
      const repeat = generator.generate(input);
      const data = output.data as {
        vertexX: number;
        vertexY: number;
        verticalScale: number;
        yInterceptY: number;
        a: number;
        b: number;
        c: number;
        rendererProps: {
          equation: string;
          variant: string;
          responseVariant: string;
          vertex: [number, number];
          yIntercept: [number, number];
          domain: [number, number];
          range: [number, number];
        };
      };
      const props = data.rendererProps;
      const reflection = { x: 2 * data.vertexX, y: data.yInterceptY };
      const expectedPoints = [
        { x: data.vertexX, y: data.vertexY },
        { x: 0, y: data.yInterceptY },
        reflection,
      ];

      expect(repeat).toEqual(output);
      expect(generator.nodeIds).toContain(SYMMETRY_NODE_ID);
      expect([1, 2]).toContain(data.vertexX);
      expect(data.vertexY).toBeGreaterThanOrEqual(-3);
      expect(data.vertexY).toBeLessThanOrEqual(3);
      expect([-3, -2, -1, 1, 2, 3]).toContain(data.verticalScale);
      expect(data.verticalScale).not.toBe(0);
      expect(data.a).toBe(data.verticalScale);
      expect(data.b).toBe(-2 * data.verticalScale * data.vertexX);
      expect(data.c).toBe(data.yInterceptY);
      expect(data.yInterceptY).toBe(
        data.verticalScale * data.vertexX ** 2 + data.vertexY,
      );
      parameterTriples.add(
        `${data.vertexX},${data.vertexY},${data.verticalScale}`,
      );
      equations.add(props.equation);

      const quadraticTerm =
        data.a === 1 ? 'x^2' : data.a === -1 ? '-x^2' : `${data.a}x^2`;
      const linearTerm =
        data.b === 0
          ? ''
          : data.b > 0
            ? ` + ${data.b === 1 ? 'x' : `${data.b}x`}`
            : ` - ${Math.abs(data.b) === 1 ? 'x' : `${Math.abs(data.b)}x`}`;
      const constantTerm =
        data.c === 0 ? '' : data.c > 0 ? ` + ${data.c}` : ` - ${Math.abs(data.c)}`;
      expect(props.equation).toBe(`y = ${quadraticTerm}${linearTerm}${constantTerm}`);

      expect(props.variant).toBe('plot_from_equation');
      expect(props.responseVariant).toBe('symmetry_graph');
      expect(props.vertex).toEqual([data.vertexX, data.vertexY]);
      expect(props.yIntercept).toEqual([0, data.yInterceptY]);
      expect(props.domain).toEqual([-3, 7]);
      const minimumY = Math.min(data.vertexY, data.yInterceptY);
      const maximumY = Math.max(data.vertexY, data.yInterceptY);
      const verticalSpan = Math.ceil(
        (Math.abs(data.vertexY - data.yInterceptY) + 6) / 10,
      ) * 10;
      expect(props.range).toEqual([
        minimumY - 3,
        minimumY - 3 + verticalSpan,
      ]);
      expect((props.range[1] - props.range[0]) % 10).toBe(0);
      expect(props.range[0]).toBeLessThanOrEqual(minimumY - 3);
      expect(props.range[1]).toBeGreaterThanOrEqual(maximumY + 3);
      expect(Object.keys(props)).toEqual([
        'equation',
        'variant',
        'responseVariant',
        'vertex',
        'yIntercept',
        'domain',
        'range',
      ]);
      expect(graphingExplorerSchema.safeParse(props).success).toBe(true);
      const parsed = parseQuadratic(props.equation);
      expect(parsed).not.toBeNull();
      if (!parsed) throw new Error('Expected the emitted equation to parse');
      expect(parsed.a).toBe(data.a);
      expect(parsed.b).toBe(data.b);
      expect(parsed.c).toBe(data.c);

      for (const point of expectedPoints) {
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
        expect(point.y).toBe(parsed.a * point.x ** 2 + parsed.b * point.x + parsed.c);
        expect(point.x).toBeGreaterThan(props.domain[0]);
        expect(point.x).toBeLessThan(props.domain[1]);
        expect(point.y).toBeGreaterThan(props.range[0]);
        expect(point.y).toBeLessThan(props.range[1]);
      }

      expect(output.prompt).toContain(`(${data.vertexX}, ${data.vertexY})`);
      expect(output.prompt).toContain(`(0, ${data.yInterceptY})`);
      expect(output.prompt).not.toContain(props.equation);
      expect(output.prompt).not.toContain(`(${reflection.x}, ${reflection.y})`);
      expect(output.prompt).not.toMatch(/\b(?:a|b|c)\s*=/i);

      expect(Object.keys(output.expectedAnswer)).toEqual(['placed_points']);
      expect(output.expectedAnswer).toEqual({ placed_points: expectedPoints });
      expect(Object.keys(output.gradingMetadata)).toEqual([
        'partAnswers',
        'partMaxScores',
        'partGradingRules',
      ]);
      expect(output.gradingMetadata).toEqual({
        partAnswers: { placed_points: expectedPoints },
        partMaxScores: { placed_points: 1 },
        partGradingRules: { placed_points: 'custom' },
      });
      expect(output.solutionSteps).toHaveLength(4);
      expect(output.solutionSteps[0]?.description).toMatch(/vertex.*axis/i);
      expect(output.solutionSteps[1]?.description).toMatch(/y-intercept/i);
      expect(output.solutionSteps[2]?.description).toMatch(/reflect/i);
      expect(output.solutionSteps[3]?.description).toMatch(/parabola/i);
      expect(output.solutionSteps[3]?.description).toContain(
        data.verticalScale < 0 ? 'downward-opening' : 'upward-opening',
      );
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    }

    expect(parameterTriples.size).toBeGreaterThan(1);
    expect(equations.size).toBeGreaterThan(1);
  });
});
