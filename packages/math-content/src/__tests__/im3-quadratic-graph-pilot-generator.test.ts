import { describe, expect, it } from 'vitest';

import { graphingExplorerSchema } from '../schemas';
import { getGenerator } from '../knowledge-space';

const NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';

describe('quadratic graph pilot generator', () => {
  it('projects seed 0 to the exact table-and-graph renderer contract', () => {
    const output = getGenerator('quadratic-graph-analysis').generate({
      nodeId: NODE_ID,
      seed: 0,
      difficulty: 0.5,
    });

    const tableValues = [
      { x: -2, y: -5 },
      { x: -1, y: -2 },
      { x: 0, y: -1 },
      { x: 1, y: -2 },
      { x: 2, y: -5 },
    ];
    const rendererProps = {
      equation: 'y = -x^2 - 1',
      variant: 'plot_from_equation',
      responseVariant: 'table_graph',
      domain: [-5, 5],
      range: [-10, 10],
    };

    expect(output.data.rendererProps).toEqual(rendererProps);
    expect(graphingExplorerSchema.parse(output.data.rendererProps)).toEqual(rendererProps);
    expect(output.expectedAnswer).toEqual({
      table_values: tableValues,
      placed_points: tableValues,
    });
    expect(output.gradingMetadata).toMatchObject({
      partAnswers: {
        table_values: tableValues,
        placed_points: tableValues,
      },
      partMaxScores: { table_values: 1, placed_points: 1 },
      partGradingRules: { table_values: 'custom', placed_points: 'custom' },
    });
    expect(output.data.rendererProps).not.toHaveProperty('table_values');
    expect(output.data.rendererProps).not.toHaveProperty('placed_points');
  });

  it('is deterministic for the same input', () => {
    const generator = getGenerator('quadratic-graph-analysis');
    const input = { nodeId: NODE_ID, seed: 0, difficulty: 0.5 };

    expect(generator.generate(input)).toEqual(generator.generate(input));
  });

  it('generates the fixed Guided table for an upward quadratic with a nonzero linear term', () => {
    const output = getGenerator('quadratic-graph-analysis').generate({
      nodeId: NODE_ID,
      seed: 1,
      difficulty: 0.5,
    });
    const tableValues = [
      { x: -2, y: 4 },
      { x: -1, y: 0 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
      { x: 2, y: 0 },
    ];

    expect(output.data.rendererProps).toMatchObject({
      equation: 'y = x^2 - x - 2',
      responseVariant: 'table_graph',
    });
    expect(output.expectedAnswer).toEqual({
      table_values: tableValues,
      placed_points: tableValues,
    });
  });

});
