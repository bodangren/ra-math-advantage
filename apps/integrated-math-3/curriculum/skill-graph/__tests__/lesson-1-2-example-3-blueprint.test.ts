import { describe, expect, it } from 'vitest';
import { graphingExplorerSchema } from '@math-platform/math-content/schemas';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import { knowledgeBlueprintSchema } from '@math-platform/knowledge-space-practice';
import moduleBlueprintsJson from '../module-1/blueprints.json';
import rootBlueprintsJson from '../blueprints.json';

const TARGET_NODE_ID = 'math.im3.skill.1.2.estimate-roots-by-graphing';
const EXAMPLE_TWO_NODE_ID =
  'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing';
const GENERATOR_KEY = 'estimate-roots-by-graphing';

const EXPECTED_BLUEPRINT = {
  nodeId: TARGET_NODE_ID,
  sourceNodeIds: ['math.im3.example.1.2.009'],
  alignmentNodeIds: ['math.standard.ccss.hsa-rei-b-4'],
  rendererKey: 'graphing-explorer',
  rendererModeMap: {
    worked: 'graphing-explorer',
    guidedPractice: 'graphing-explorer',
    independentPractice: 'graphing-explorer',
  },
  workedExampleSpec: {
    prompt:
      'Solve -x^2 + 3x + 7 = 0 by graphing. If the exact roots cannot be found, state the consecutive integers between which the roots are located.',
    givens: ['-x^2 + 3x + 7 = 0', 'f(x) = -x^2 + 3x + 7'],
    target: {
      related_function: 'f(x) = -x^2 + 3x + 7',
      axis_of_symmetry: 'x = 1.5',
      x_values: [-2, -1, 0, 1, 2, 3, 4, 5],
      y_values: [-3, 3, 7, 9, 9, 7, 3, -3],
      root_intervals: [[-2, -1], [4, 5]],
    },
    steps: [
      {
        description: 'Rewrite the equation as the related function',
        expression: 'f(x) = -x^2 + 3x + 7',
      },
      {
        description: 'Find the axis of symmetry',
        expression: 'x = 1.5',
      },
      {
        description: 'Complete the table of values',
        expression:
          '(-2, -3), (-1, 3), (0, 7), (1, 9), (2, 9), (3, 7), (4, 3), (5, -3)',
      },
      {
        description: 'Plot the points and connect the curve',
        expression:
          '(-2, -3), (-1, 3), (0, 7), (1, 9), (2, 9), (3, 7), (4, 3), (5, -3)',
      },
      {
        description: 'State the consecutive-integer root intervals',
        expression: 'x is between -2 and -1, and x is between 4 and 5',
      },
    ],
    explanation:
      'The graph changes sign between -2 and -1 and between 4 and 5, so the roots lie in those consecutive-integer intervals.',
    rendererProps: {
      equation: 'f(x) = -x^2 + 3x + 7',
      variant: 'plot_from_equation',
      responseVariant: 'estimated_root_intervals',
      originalEquation: '-x^2 + 3x + 7 = 0',
      points: [
        [-2, -3],
        [-1, 3],
        [0, 7],
        [1, 9],
        [2, 9],
        [3, 7],
        [4, 3],
        [5, -3],
      ],
    },
  },
  guidedPracticeSpec: {
    scaffoldedPrompt:
      'Solve -x^2 + x + 7 = 0 by graphing. State the consecutive integers between which the roots are located.',
    stepPrompts: [
      'Rewrite the equation as the related function.',
      'Find the axis of symmetry.',
      'Complete the table of values for eight consecutive integer x-values.',
      'Plot the eight points and connect the curve.',
      'State the two consecutive-integer root intervals.',
    ],
    hints: [
      'Move all terms to one side and write the related function.',
      'Use x = -b/(2a) to find the axis of symmetry.',
      'Evaluate the function at eight consecutive integer x-values.',
      'Plot the points and connect them with a curve.',
      'Use sign changes in the table and x-intercepts in the graph to identify each interval.',
    ],
    checksPerStep: [
      { check: 'The equation is written as a related function.' },
      { check: 'The axis of symmetry is identified.' },
      { check: 'The eight table values are complete.' },
      { check: 'All eight points are plotted.' },
      { check: 'Two ordered consecutive-integer intervals are stated.' },
    ],
    revealPolicy: 'one_at_a_time',
    rendererProps: {
      equation: 'f(x) = -x^2 + x + 7',
      variant: 'plot_from_equation',
      responseVariant: 'estimated_root_intervals',
      originalEquation: '-x^2 + x + 7 = 0',
      points: [
        [-3, -5],
        [-2, 1],
        [-1, 5],
        [0, 7],
        [1, 7],
        [2, 5],
        [3, 1],
        [4, -5],
      ],
    },
  },
  independentPracticeSpec: {
    variantParameters: {
      axisFloor: {
        type: 'integer',
        min: -3,
        max: 3,
        step: 1,
        description: 'The integer at the lower end of the symmetry interval.',
      },
      verticalShift: {
        type: 'integer',
        min: 7,
        max: 9,
        step: 1,
        description: 'The vertical shift of the quadratic.',
      },
    },
    answerSchema: {
      table_values: {
        type: 'array',
        description: 'Eight numeric table points with x and y coordinates.',
      },
      placed_points: {
        type: 'array',
        description: 'Eight plotted points with x and y coordinates.',
      },
      root_intervals: {
        type: 'array',
        description:
          'Two ordered pairs of consecutive integers that bound the roots from left to right.',
      },
    },
    gradingRules: [
      { partId: 'table_values', ruleType: 'custom', maxScore: 1 },
      { partId: 'placed_points', ruleType: 'custom', maxScore: 1 },
      { partId: 'root_intervals', ruleType: 'custom', maxScore: 1 },
    ],
    replayPolicy: 'unique_seeds',
    rendererProps: {
      equation: 'f(x) = -x^2 - 5x + 3',
      variant: 'plot_from_equation',
      responseVariant: 'estimated_root_intervals',
      originalEquation: '-x^2 - 5x + 3 = 0',
      points: [
        [-6, -3],
        [-5, 3],
        [-4, 7],
        [-3, 9],
        [-2, 9],
        [-1, 7],
        [0, 3],
        [1, -3],
      ],
    },
  },
  generatorKey: GENERATOR_KEY,
  gradingSpec: {
    partIds: ['table_values', 'placed_points', 'root_intervals'],
    passingScore: 3,
    partialCredit: true,
    rubric: [
      { criteria: 'Complete the eight-value table.', points: 1, partId: 'table_values' },
      { criteria: 'Plot the eight points.', points: 1, partId: 'placed_points' },
      { criteria: 'Identify both root intervals.', points: 1, partId: 'root_intervals' },
    ],
  },
  reviewStatus: 'draft',
  metadata: { course: 'im3', module: '1', lesson: '2' },
};

const moduleBlueprints = (moduleBlueprintsJson as { blueprints: unknown[] }).blueprints;
const rootBlueprints = (rootBlueprintsJson as { blueprints: unknown[] }).blueprints;

describe('Lesson 1.2 Example 3 blueprint', () => {
  it('defines the exact blueprint in both mirrors and matches the generator contract', () => {
    expect(knowledgeBlueprintSchema.safeParse(EXPECTED_BLUEPRINT).success).toBe(true);

    for (const rendererProps of [
      EXPECTED_BLUEPRINT.workedExampleSpec.rendererProps,
      EXPECTED_BLUEPRINT.guidedPracticeSpec.rendererProps,
      EXPECTED_BLUEPRINT.independentPracticeSpec.rendererProps,
    ]) {
      expect(graphingExplorerSchema.safeParse(rendererProps).success).toBe(true);
    }

    const generator = getGenerator(GENERATOR_KEY);
    const seededOutputs = [
      generator.generate({ nodeId: TARGET_NODE_ID, seed: 0, difficulty: 0.5 }),
      generator.generate({ nodeId: TARGET_NODE_ID, seed: 1, difficulty: 0.5 }),
      generator.generate({ nodeId: TARGET_NODE_ID, seed: 2, difficulty: 0.5 }),
    ];
    const rendererSpecs = [
      EXPECTED_BLUEPRINT.workedExampleSpec,
      EXPECTED_BLUEPRINT.guidedPracticeSpec,
      EXPECTED_BLUEPRINT.independentPracticeSpec,
    ];

    for (const [index, output] of seededOutputs.entries()) {
      const data = output.data as {
        rendererProps: Record<string, unknown>;
        tableValues: Array<Record<string, unknown>>;
        rootIntervals: Array<Array<number>>;
      };
      expect(data.rendererProps).toEqual(rendererSpecs[index].rendererProps);
      expect(output.expectedAnswer).toEqual({
        table_values: data.tableValues,
        placed_points: data.tableValues,
        root_intervals: data.rootIntervals,
      });
      expect(output.gradingMetadata).toEqual({
        partAnswers: output.expectedAnswer,
        partMaxScores: { table_values: 1, placed_points: 1, root_intervals: 1 },
        partGradingRules: {
          table_values: 'custom',
          placed_points: 'custom',
          root_intervals: 'custom',
        },
      });
      expect(Object.keys(output.expectedAnswer)).toEqual(EXPECTED_BLUEPRINT.gradingSpec.partIds);
      expect(EXPECTED_BLUEPRINT.gradingSpec.rubric).toHaveLength(3);
    }

    for (const blueprints of [moduleBlueprints, rootBlueprints]) {
      const matches = blueprints.filter(
        (blueprint) =>
          (blueprint as { nodeId?: string }).nodeId === TARGET_NODE_ID,
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(EXPECTED_BLUEPRINT);

      const targetIndex = blueprints.indexOf(matches[0]!);
      const exampleTwoIndex = blueprints.findIndex(
        (blueprint) =>
          (blueprint as { nodeId?: string }).nodeId === EXAMPLE_TWO_NODE_ID,
      );
      expect(targetIndex).toBe(exampleTwoIndex + 1);
    }
  });
});
