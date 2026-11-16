import { describe, expect, it } from 'vitest';
import moduleNodesJson from '../module-1/nodes.json';
import rootNodesJson from '../nodes.json';
import draftNodesJson from '../draft-nodes.json';
import moduleEdgesJson from '../module-1/edges.json';
import rootEdgesJson from '../edges.json';
import moduleStandardEdgesJson from '../module-1/standard-edges.json';
import rootStandardEdgesJson from '../standard-edges.json';
import moduleBlueprintsJson from '../module-1/blueprints.json';
import rootBlueprintsJson from '../blueprints.json';

const TARGET_NODE_ID =
  'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing';
const EXAMPLE_ONE_ATOMIC_NODE_ID =
  'math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing';
const BROAD_NODE_IDS = [
  'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
  'math.im3.skill.1.2.interpret-solutions-roots-in-context',
];
const EXPECTED_NODE = {
  id: TARGET_NODE_ID,
  kind: 'skill',
  title: 'Find two numbers with a given sum and product by graphing a quadratic equation',
  domain: 'math.im3',
  description: 'Find two numbers with a given sum and product by graphing a quadratic equation.',
  sourceRefs: [
    'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-2, Example 2)',
    'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=14',
  ],
  reviewStatus: 'draft',
  metadata: { course: 'im3', module: '1', lesson: '2' },
  independentPracticeReady: true,
};
const EXPECTED_BLUEPRINT = {
  nodeId: TARGET_NODE_ID,
  sourceNodeIds: ['math.im3.example.1.2.008'],
  alignmentNodeIds: ['math.standard.ccss.hsa-rei-b-4'],
  rendererKey: 'graphing-explorer',
  rendererModeMap: {
    worked: 'graphing-explorer',
    guidedPractice: 'graphing-explorer',
    independentPractice: 'graphing-explorer',
  },
  workedExampleSpec: {
    prompt: 'Use a quadratic equation to find two real numbers with a sum of 24 and a product of 143.',
    givens: [
      'x(24 - x) = 143',
      '0 = x^2 - 24x + 143',
      'f(x) = x^2 - 24x + 143',
    ],
    target: {
      related_function: 'f(x) = x^2 - 24x + 143',
      axis_of_symmetry: 'x = 12',
      x_values: [10, 11, 12, 13, 14],
      y_values: [3, 0, -1, 0, 3],
      solutions: ['x = 11', 'x = 13'],
    },
    steps: [
      {
        description: 'Represent the two numbers with x and 24 - x',
        expression: 'x(24 - x) = 143',
        result: 'Let x represent one number and 24 - x represent the other.',
      },
      {
        description: 'Rewrite the equation in standard form',
        expression: '0 = x^2 - 24x + 143',
        result: 'Subtract 24x - x^2 from each side.',
      },
      {
        description: 'Find the axis of symmetry',
        expression: 'x = 12',
        result: 'x = -b/(2a) = -(-24)/(2(1)) = 12.',
      },
      {
        description: 'Make the five-point table and graph',
        expression: '(10, 3), (11, 0), (12, -1), (13, 0), (14, 3)',
        result: 'Plot the five points and connect them with a parabola.',
      },
      {
        description: 'Identify the zeros and contextual numbers',
        expression: 'x = 11 or x = 13; the two numbers are 11 and 13',
        result: 'The two numbers are 11 and 13.',
      },
    ],
    explanation: 'The zeros of the function are 11 and 13, so the two numbers are 11 and 13.',
    rendererProps: {
      equation: 'f(x) = x^2 - 24x + 143',
      variant: 'plot_from_equation',
      responseVariant: 'two_real_solutions',
      originalEquation: 'x(24 - x) = 143',
      points: [[10, 3], [11, 0], [12, -1], [13, 0], [14, 3]],
      domain: [8, 16],
      range: [-2, 8],
      sum: 24,
      product: 143,
    },
  },
  guidedPracticeSpec: {
    scaffoldedPrompt: 'Find two real numbers with a sum of 26 and a product of 168 by graphing.',
    stepPrompts: [
      'Represent the two numbers with x and 26 - x.',
      'Rewrite x(26 - x) = 168 in standard form.',
      'Find the axis of symmetry and complete the five-value table.',
      'Graph the five points and state both solutions.',
    ],
    hints: [
      'Let x represent one number. The other number is 26 - x.',
      'Rewrite the equation as 0 = x^2 - 26x + 168.',
      'Use x = 13 as the axis of symmetry.',
      'Read the two x-intercepts from the graph.',
    ],
    checksPerStep: [
      { check: 'x(26 - x) = 168' },
      { check: '0 = x^2 - 26x + 168' },
      { check: 'The axis of symmetry is x = 13.' },
      { check: 'The solutions are x = 12 and x = 14.' },
    ],
    revealPolicy: 'one_at_a_time',
    rendererProps: {
      equation: 'f(x) = x^2 - 26x + 168',
      variant: 'plot_from_equation',
      responseVariant: 'two_real_solutions',
      originalEquation: 'x(26 - x) = 168',
      points: [[11, 3], [12, 0], [13, -1], [14, 0], [15, 3]],
      domain: [9, 17],
      range: [-2, 8],
      sum: 26,
      product: 168,
    },
  },
  independentPracticeSpec: {
    variantParameters: {
      axis: {
        type: 'integer',
        min: 8,
        max: 16,
        step: 1,
        description: 'The axis of symmetry of the related quadratic.',
      },
      distance: {
        type: 'integer',
        min: 1,
        max: 2,
        step: 1,
        description: 'The distance from the axis to each real solution.',
      },
    },
    answerSchema: {
      table_values: {
        type: 'array',
        description: 'Five numeric table points with x and y coordinates.',
      },
      placed_points: {
        type: 'array',
        description: 'Five plotted points with x and y coordinates.',
      },
      solutions: {
        type: 'array',
        description: 'The two real-number solutions.',
      },
    },
    gradingRules: [
      { partId: 'table_values', ruleType: 'custom', maxScore: 1 },
      { partId: 'placed_points', ruleType: 'custom', maxScore: 1 },
      { partId: 'solutions', ruleType: 'custom', maxScore: 1 },
    ],
    replayPolicy: 'unique_seeds',
    rendererProps: {
      equation: 'f(x) = x^2 - 16x + 60',
      variant: 'plot_from_equation',
      responseVariant: 'two_real_solutions',
      originalEquation: 'x(16 - x) = 60',
      points: [[6, 0], [7, -3], [8, -4], [9, -3], [10, 0]],
      domain: [4, 12],
      range: [-5, 5],
      sum: 16,
      product: 60,
    },
  },
  generatorKey: 'two-real-solutions-graphing',
  gradingSpec: {
    partIds: ['table_values', 'placed_points', 'solutions'],
    passingScore: 3,
    partialCredit: true,
    rubric: [
      { criteria: 'Complete the five-value table.', points: 1, partId: 'table_values' },
      { criteria: 'Plot the five points.', points: 1, partId: 'placed_points' },
      { criteria: 'Identify both solutions.', points: 1, partId: 'solutions' },
    ],
  },
  reviewStatus: 'draft',
  metadata: { course: 'im3', module: '1', lesson: '2' },
};
const EXPECTED_CONTAINS_EDGE = {
  id: 'math.im3.edge.m1.160',
  type: 'contains',
  sourceId: 'math.im3.lesson.1.2',
  targetId: TARGET_NODE_ID,
  weight: 1,
  confidence: 'high',
  reviewStatus: 'draft',
  metadata: { course: 'im3', module: '1' },
  rationale: 'Skill contained in Lesson 1.2',
  sourceRefs: [
    'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-2, Example 2)',
    'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=14',
  ],
};
const EXPECTED_GENERATED_BY_EDGE = {
  id: 'math.im3.edge.m1.161',
  type: 'generated_by',
  sourceId: TARGET_NODE_ID,
  targetId: 'math.im3.generator.m1.two-real-solutions-graphing',
  weight: 1,
  confidence: 'high',
  reviewStatus: 'draft',
  metadata: { course: 'im3', module: '1' },
  rationale: `Skill ${TARGET_NODE_ID} generated by math.im3.generator.m1.two-real-solutions-graphing`,
  sourceRefs: [{ source: 'pilot', note: 'Module 1 pilot generator' }],
  derived: true,
  derivationMethod: 'generator-registry-mapping',
};
const EXPECTED_ALIGNMENT_EDGE = {
  id: 'math.alignment.im3-skill-1-2-find-two-numbers-with-given-sum-and-product-by-graphing-to-ccss-hsa-rei-b-4',
  type: 'aligned_to_standard',
  sourceId: TARGET_NODE_ID,
  targetId: 'math.standard.ccss.hsa-rei-b-4',
  weight: 0.8,
  confidence: 'high',
  sourceRefs: [
    {
      source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=14',
      note: 'Primary alignment for authored Example 2',
    },
  ],
  reviewStatus: 'draft',
  rationale: 'Primary alignment for the authored Example 2 given-sum-and-product graphing capability',
  metadata: { isPrimary: true, course: 'im3' },
};

describe('Lesson 1.2 Example 2 atomic node', () => {
  it('defines the exact two-real-solutions skill in all node mirrors', () => {
    const catalogs = [
      moduleNodesJson.nodes,
      rootNodesJson.nodes,
      draftNodesJson.nodes,
      rootEdgesJson.nodes,
      rootStandardEdgesJson.nodes,
    ];

    for (const nodes of catalogs) {
      expect(nodes.filter((node) => node.id === TARGET_NODE_ID)).toEqual([EXPECTED_NODE]);

      const targetIndex = nodes.findIndex((node) => node.id === TARGET_NODE_ID);
      const exampleOneIndex = nodes.findIndex(
        (node) => node.id === EXAMPLE_ONE_ATOMIC_NODE_ID,
      );
      expect(targetIndex).toBe(exampleOneIndex + 1);

      for (const broadNodeId of BROAD_NODE_IDS) {
        const broadNodes = nodes.filter((node) => node.id === broadNodeId);
        expect(broadNodes).toHaveLength(1);
        expect(broadNodes[0]).not.toEqual(EXPECTED_NODE);
      }
    }
  });

  it('defines the exact completed blueprint in both mirrors', () => {
    const blueprintCatalogs = [moduleBlueprintsJson.blueprints, rootBlueprintsJson.blueprints];

    for (const blueprints of blueprintCatalogs) {
      const targetBlueprints = blueprints.filter((blueprint) => blueprint.nodeId === TARGET_NODE_ID);
      expect(targetBlueprints).toEqual([EXPECTED_BLUEPRINT]);

      const targetIndex = blueprints.findIndex((blueprint) => blueprint.nodeId === TARGET_NODE_ID);
      const exampleOneIndex = blueprints.findIndex(
        (blueprint) => blueprint.nodeId === 'math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing',
      );
      expect(targetIndex).toBe(exampleOneIndex + 1);
    }

    expect(moduleBlueprintsJson.blueprints.filter((blueprint) => blueprint.nodeId === TARGET_NODE_ID))
      .toEqual(rootBlueprintsJson.blueprints.filter((blueprint) => blueprint.nodeId === TARGET_NODE_ID));
  });

  it('defines the exact Example 2 lesson and standard edges in all graph mirrors', () => {
    const edgeCatalogs = [
      {
        edges: moduleEdgesJson.edges,
        expected: [EXPECTED_CONTAINS_EDGE, EXPECTED_GENERATED_BY_EDGE],
      },
      {
        edges: rootEdgesJson.edges,
        expected: [EXPECTED_CONTAINS_EDGE, EXPECTED_GENERATED_BY_EDGE, EXPECTED_ALIGNMENT_EDGE],
      },
      {
        edges: moduleStandardEdgesJson.edges,
        expected: [EXPECTED_ALIGNMENT_EDGE],
      },
      {
        edges: rootStandardEdgesJson.edges,
        expected: [EXPECTED_ALIGNMENT_EDGE],
      },
    ];

    for (const { edges, expected } of edgeCatalogs) {
      const incidentEdges = edges.filter(
        (edge) => edge.sourceId === TARGET_NODE_ID || edge.targetId === TARGET_NODE_ID,
      );
      expect([...incidentEdges].sort((a, b) => a.id.localeCompare(b.id))).toEqual(
        [...expected].sort((a, b) => a.id.localeCompare(b.id)),
      );
    }
  });
});
