import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import type { KnowledgeBlueprint, ProjectedActivity } from '@math-platform/knowledge-space-practice';
import {
  projectActivityMap,
  projectSrsInputs,
} from '@math-platform/knowledge-space-practice';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, '../../../curriculum/skill-graph');
const NODE_ID = 'math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts';
const SOURCE_ID = 'math.precalc.example.1.5.003';
const RENDERER_KEY = 'polynomial-inequality-sign-chart';
const GENERATOR_KEY = 'topic15-polynomial-inequality-sign-chart';
const STANDARD_ID = 'math.standard.ccss.hsa-apr-b-3';
const MODES = ['worked_example', 'guided_practice', 'independent_practice'] as const;

type JsonDocument = {
  activities?: ProjectedActivity[];
  blueprints?: KnowledgeBlueprint[];
  edges?: Array<Record<string, unknown>>;
  inputs?: Array<Record<string, unknown>>;
  items?: Array<{ nodeId: string }>;
  nodes?: Array<Record<string, unknown>>;
  srsInputs?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(
    fs.readFileSync(path.join(GRAPH_DIR, fileName), 'utf8'),
  ) as JsonDocument;
}

const expectedNode = {
  id: NODE_ID,
  kind: 'skill',
  title: 'Solve polynomial inequalities using sign charts',
  domain: 'math.precalc',
  description: 'Find the real zeros, test the sign on each interval, and write the solution to a polynomial inequality in interval notation.',
  sourceRefs: [
    'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 3)',
  ],
  reviewStatus: 'draft',
  metadata: { course: 'precalc', unit: '1', lesson: '5' },
  rendererKey: RENDERER_KEY,
  generatorKey: GENERATOR_KEY,
  independentPracticeReady: true,
};

describe('Topic 1.5 Example 3 graph readiness', () => {
  it('promotes the exact sign-chart node and its derived projections', () => {
    const nodesDocumentValue = readJson('nodes.json');
    const draftNodesDocumentValue = readJson('draft-nodes.json');
    const rootNodes = nodesDocumentValue.nodes!;
    const draftNodes = draftNodesDocumentValue.nodes!;
    const rootMatches = rootNodes.filter((node) => node.id === NODE_ID);
    const draftMatches = draftNodes.filter((node) => node.id === NODE_ID);

    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(expectedNode);
    expect(draftMatches[0]).toEqual(expectedNode);
    expect(rootMatches[0]).toEqual(draftMatches[0]);

    const nodes = rootNodes as unknown as Parameters<typeof projectActivityMap>[0];
    const edges = readJson('edges.json').edges! as unknown as Parameters<typeof projectActivityMap>[1];
    const blueprints = readJson('blueprints.json').blueprints!;
    const expectedActivities = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === NODE_ID);
    const storedActivities = readJson('projection/practice-v1-activity-map.json').activities!
      .filter((row) => row.nodeId === NODE_ID);

    expect(expectedActivities).toHaveLength(3);
    expect(storedActivities).toHaveLength(3);
    expect(storedActivities).toEqual(expectedActivities);
    expect(storedActivities.map((row) => row.mode)).toEqual(MODES);
    expect(storedActivities.map((row) => row.stableActivityId)).toEqual(
      MODES.map((mode) => `${NODE_ID}.${mode}`),
    );
    expect(storedActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);

    const expectedSrs = projectSrsInputs(nodes, edges, blueprints)
      .filter((row) => row.nodeId === NODE_ID);
    const storedCombinedSrs = readJson('projection/practice-v1-activity-map.json').srsInputs!
      .filter((row) => row.nodeId === NODE_ID);
    const storedStandaloneSrs = readJson('projection/srs-input.json').inputs!
      .filter((row) => row.nodeId === NODE_ID);

    expect(expectedSrs).toHaveLength(1);
    expect(storedCombinedSrs).toHaveLength(1);
    expect(storedCombinedSrs).toEqual(expectedSrs);
    expect(storedCombinedSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });
    expect(storedStandaloneSrs).toHaveLength(1);
    const standaloneCore = storedStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(storedStandaloneSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });

    const generatorGapQueue = readJson('generator-gap-queue.json');
    expect(generatorGapQueue.items!.filter((item) => item.nodeId === NODE_ID)).toHaveLength(0);

    const blueprint = blueprints.filter((candidate) => candidate.nodeId === NODE_ID);
    expect(blueprint).toHaveLength(1);
    expect(blueprint[0]).toMatchObject({
      nodeId: NODE_ID,
      sourceNodeIds: [SOURCE_ID],
      alignmentNodeIds: [STANDARD_ID],
      rendererKey: RENDERER_KEY,
      generatorKey: GENERATOR_KEY,
    });

    const edgesDocumentValue = readJson('edges.json');
    expect(edgesDocumentValue.edges!.some((edge) =>
      edge.id === 'math.precalc.edge.0399'
      && edge.type === 'supports'
      && edge.sourceId === SOURCE_ID
      && edge.targetId === NODE_ID,
    )).toBe(true);
    expect(new Set(readJson('projection/practice-v1-activity-map.json').activities!
      .map((row) => row.stableActivityId)).size)
      .toBe(readJson('projection/practice-v1-activity-map.json').activities!.length);
  });
});
