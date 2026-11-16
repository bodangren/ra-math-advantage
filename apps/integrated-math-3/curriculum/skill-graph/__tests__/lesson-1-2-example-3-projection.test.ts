import { describe, expect, it } from 'vitest';
import { graphingExplorerSchema } from '@math-platform/math-content/schemas';
import { projectActivityMap } from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceEdge, KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import moduleNodesJson from '../module-1/nodes.json';
import moduleEdgesJson from '../module-1/edges.json';
import moduleBlueprintsJson from '../module-1/blueprints.json';
import moduleProjectionJson from '../module-1/projection/practice-v1-activity-map.json';
import rootProjectionJson from '../projection/practice-v1-activity-map.json';

const TARGET_NODE_ID = 'math.im3.skill.1.2.estimate-roots-by-graphing';
const EXAMPLE_TWO_WORKED_ID =
  'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing.worked_example';
const DOMAIN_RANGE_INDEPENDENT_ID =
  'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph.independent_practice';

const gradingConfig = {
  partIds: ['table_values', 'placed_points', 'root_intervals'],
  passingScore: 3,
  partialCredit: true,
  rubric: [
    { criteria: 'Complete the eight-value table.', points: 1, partId: 'table_values' },
    { criteria: 'Plot the eight points.', points: 1, partId: 'placed_points' },
    { criteria: 'Identify both root intervals.', points: 1, partId: 'root_intervals' },
  ],
};

const EXPECTED_ROWS = [
  {
    stableActivityId: `${TARGET_NODE_ID}.worked_example`,
    nodeId: TARGET_NODE_ID,
    sourceNodeIds: ['math.im3.example.1.2.009'],
    rendererKey: 'graphing-explorer',
    mode: 'worked_example',
    alignmentNodeIds: ['math.standard.ccss.hsa-rei-b-4'],
    props: {
      equation: 'f(x) = -x^2 + 3x + 7',
      variant: 'plot_from_equation',
      responseVariant: 'estimated_root_intervals',
      originalEquation: '-x^2 + 3x + 7 = 0',
      points: [[-2, -3], [-1, 3], [0, 7], [1, 9], [2, 9], [3, 7], [4, 3], [5, -3]],
    },
    gradingConfig,
    srsEligible: false,
  },
  {
    stableActivityId: `${TARGET_NODE_ID}.guided_practice`,
    nodeId: TARGET_NODE_ID,
    sourceNodeIds: ['math.im3.example.1.2.009'],
    rendererKey: 'graphing-explorer',
    mode: 'guided_practice',
    alignmentNodeIds: ['math.standard.ccss.hsa-rei-b-4'],
    props: {
      equation: 'f(x) = -x^2 + x + 7',
      variant: 'plot_from_equation',
      responseVariant: 'estimated_root_intervals',
      originalEquation: '-x^2 + x + 7 = 0',
      points: [[-3, -5], [-2, 1], [-1, 5], [0, 7], [1, 7], [2, 5], [3, 1], [4, -5]],
    },
    gradingConfig,
    srsEligible: false,
  },
  {
    stableActivityId: `${TARGET_NODE_ID}.independent_practice`,
    nodeId: TARGET_NODE_ID,
    sourceNodeIds: ['math.im3.example.1.2.009'],
    rendererKey: 'graphing-explorer',
    mode: 'independent_practice',
    alignmentNodeIds: ['math.standard.ccss.hsa-rei-b-4'],
    props: {
      equation: 'f(x) = -x^2 - 5x + 3',
      variant: 'plot_from_equation',
      responseVariant: 'estimated_root_intervals',
      originalEquation: '-x^2 - 5x + 3 = 0',
      points: [[-6, -3], [-5, 3], [-4, 7], [-3, 9], [-2, 9], [-1, 7], [0, 3], [1, -3]],
    },
    gradingConfig,
    srsEligible: false,
  },
];

const moduleNodes = (moduleNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const moduleEdges = (moduleEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
const moduleBlueprints =
  (moduleBlueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] }).blueprints;
const moduleActivities = (moduleProjectionJson as { activities: typeof EXPECTED_ROWS }).activities;
const rootActivities = (rootProjectionJson as { activities: typeof EXPECTED_ROWS }).activities;

describe('Lesson 1.2 Example 3 activity projection', () => {
  it('stores the exact Example 3 activity rows in both projection mirrors', () => {
    for (const row of EXPECTED_ROWS) {
      expect(graphingExplorerSchema.safeParse(row.props).success).toBe(true);
    }

    const freshRows = projectActivityMap(moduleNodes, moduleEdges, moduleBlueprints).filter(
      (row) => row.nodeId === TARGET_NODE_ID,
    );
    expect(freshRows).toEqual(EXPECTED_ROWS);
    expect(freshRows.map((row) => row.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(freshRows.map((row) => row.stableActivityId)).toEqual(
      EXPECTED_ROWS.map((row) => row.stableActivityId),
    );
    expect(freshRows.map((row) => row.srsEligible)).toEqual([false, false, false]);

    const moduleTargetRows = moduleActivities.filter((row) => row.nodeId === TARGET_NODE_ID);
    expect(moduleTargetRows).toEqual(EXPECTED_ROWS);
    const moduleTargetIndex = moduleActivities.findIndex((row) => row.nodeId === TARGET_NODE_ID);
    expect(moduleActivities[moduleTargetIndex - 1]?.stableActivityId).toBe(
      DOMAIN_RANGE_INDEPENDENT_ID,
    );
    expect(moduleActivities[moduleTargetIndex + EXPECTED_ROWS.length]?.stableActivityId).toBe(
      EXAMPLE_TWO_WORKED_ID,
    );

    const rootTargetRows = rootActivities.filter((row) => row.nodeId === TARGET_NODE_ID);
    expect(rootTargetRows).toEqual(EXPECTED_ROWS);
    const rootTargetIndex = rootActivities.findIndex((row) => row.nodeId === TARGET_NODE_ID);
    expect(rootActivities[rootTargetIndex - 1]?.stableActivityId).toBe(
      DOMAIN_RANGE_INDEPENDENT_ID,
    );
    expect(rootActivities[rootTargetIndex + EXPECTED_ROWS.length]?.stableActivityId).toBe(
      EXAMPLE_TWO_WORKED_ID,
    );
  });
});
