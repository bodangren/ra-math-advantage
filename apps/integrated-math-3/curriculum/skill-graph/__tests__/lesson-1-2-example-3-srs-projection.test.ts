import { describe, expect, it } from 'vitest';
import { projectSrsInputs } from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceEdge, KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import moduleNodesJson from '../module-1/nodes.json';
import moduleEdgesJson from '../module-1/edges.json';
import moduleBlueprintsJson from '../module-1/blueprints.json';
import moduleProjectionJson from '../module-1/projection/practice-v1-activity-map.json';
import courseProjectionJson from '../projection/practice-v1-activity-map.json';
import rootSrsJson from '../projection/srs-input.json';

const TARGET_NODE_ID = 'math.im3.skill.1.2.estimate-roots-by-graphing';
const DOMAIN_RANGE_NODE_ID =
  'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
const EXAMPLE_TWO_NODE_ID =
  'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing';

const EXPECTED_ROW = {
  nodeId: TARGET_NODE_ID,
  blueprintId: `${TARGET_NODE_ID}.blueprint`,
  standards: ['math.standard.ccss.hsa-rei-b-4'],
  prerequisites: [],
  difficulty: 0.5,
  generatorKey: 'estimate-roots-by-graphing',
  generatorReady: false,
  equivalentNodeIds: [],
};

const moduleNodes = (moduleNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const moduleEdges = (moduleEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
const moduleBlueprints =
  (moduleBlueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] }).blueprints;
const moduleSrsInputs = (moduleProjectionJson as { srsInputs: typeof EXPECTED_ROW[] }).srsInputs;
const courseSrsInputs = (courseProjectionJson as { srsInputs: typeof EXPECTED_ROW[] }).srsInputs;
const rootSrsInputs = (rootSrsJson as { srsInputs: typeof EXPECTED_ROW[] }).srsInputs;
const storedLocations = [
  { name: 'Module 1 combined projection', rows: moduleSrsInputs },
  { name: 'course combined projection', rows: courseSrsInputs },
  { name: 'standalone SRS projection', rows: rootSrsInputs },
];

describe('Lesson 1.2 Example 3 SRS projection', () => {
  it('produces the exact fresh Example 3 SRS row', () => {
    const freshRows = projectSrsInputs(moduleNodes, moduleEdges, moduleBlueprints).filter(
      (row) => row.nodeId === TARGET_NODE_ID,
    );
    expect(freshRows).toEqual([EXPECTED_ROW]);
    expect(freshRows[0]?.generatorReady).toBe(false);
  });

  it.each(storedLocations)('stores the exact row in $name', ({ rows }) => {
    const matches = rows.filter((row) => row.nodeId === TARGET_NODE_ID);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual(EXPECTED_ROW);

    const targetIndex = rows.findIndex((row) => row.nodeId === TARGET_NODE_ID);
    const domainRangeIndex = rows.findIndex(
      (row) => row.nodeId === DOMAIN_RANGE_NODE_ID,
    );
    const exampleTwoIndex = rows.findIndex(
      (row) => row.nodeId === EXAMPLE_TWO_NODE_ID,
    );
    expect(targetIndex).toBe(domainRangeIndex + 1);
    expect(targetIndex).toBe(exampleTwoIndex - 1);
  });
});
