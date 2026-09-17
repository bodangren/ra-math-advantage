import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const GRAPH_DIR = path.join(process.cwd(), 'curriculum/skill-graph');
const SOURCE_ID = 'math.precalc.example.1.5.003';
const SKILL_ID = 'math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts';
const SOURCE_REF =
  'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 3)';

type Catalog = {
  nodes: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
};

function readCatalog(fileName: string): Catalog {
  return JSON.parse(
    fs.readFileSync(path.join(GRAPH_DIR, fileName), 'utf8'),
  ) as Catalog;
}

function findNodes(catalog: Catalog, id: string): Array<Record<string, unknown>> {
  return catalog.nodes.filter((node) => node.id === id);
}

describe('Topic 1.5 Example 3 source-to-skill graph link', () => {
  it('keeps the exact authored Example 3 source node mirrored', () => {
    const expectedSource = {
      id: SOURCE_ID,
      kind: 'worked_example',
      title: 'Example 3: Solve [(x - 3)(x + 1)(x + 4) > 0].',
      domain: 'math.precalc',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      metadata: {
        course: 'precalc',
        module: '1',
        lesson: '5',
        exampleNumber: 3,
        sourceLesson: '1-5',
        rawText:
          'Solve [(x - 3)(x + 1)(x + 4) > 0].\nRoots: [x = -4], [x = -1], [x = 3]. Test intervals:\n- [(-infty, -4)]: test [x = -5] → [(-)(-)(-) = -]. Not part of solution.\n- [(-4, -1)]: test [x = -2] → [(-)(+)(-) = +]. **Solution.**\n- [(-1, 3)]: test [x = 0] → [(-)(+)(+) = -]. Not part of solution.\n- [(3, infty)]: test [x = 4] → [(+)(+)(+) = +]. **Solution.**\nSolution: [(-4, -1) cup (3, infty)].',
      },
    };
    const nodesCatalog = readCatalog('nodes.json');
    const draftCatalog = readCatalog('draft-nodes.json');

    expect(findNodes(nodesCatalog, SOURCE_ID)).toEqual([expectedSource]);
    expect(findNodes(draftCatalog, SOURCE_ID)).toEqual([expectedSource]);
  });

  it('mirrors the exact source-supported sign-chart capability with runtime fields', () => {
    const expectedSkill = {
      id: SKILL_ID,
      kind: 'skill',
      title: 'Solve polynomial inequalities using sign charts',
      domain: 'math.precalc',
      description:
        'Find the real zeros, test the sign on each interval, and write the solution to a polynomial inequality in interval notation.',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
      rendererKey: 'polynomial-inequality-sign-chart',
      generatorKey: 'topic15-polynomial-inequality-sign-chart',
      independentPracticeReady: true,
    };
    const nodesCatalog = readCatalog('nodes.json');
    const draftCatalog = readCatalog('draft-nodes.json');

    expect(findNodes(nodesCatalog, SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draftCatalog, SKILL_ID)).toEqual([expectedSkill]);
    expect(Object.keys(expectedSkill)).toHaveLength(11);
    for (const catalog of [nodesCatalog, draftCatalog]) {
      const skill = findNodes(catalog, SKILL_ID);
      expect(skill).toHaveLength(1);
      expect(skill[0]).toHaveProperty('rendererKey', 'polynomial-inequality-sign-chart');
      expect(skill[0]).toHaveProperty('generatorKey', 'topic15-polynomial-inequality-sign-chart');
      expect(skill[0]).toHaveProperty('independentPracticeReady', true);
      expect(skill[0]).not.toHaveProperty('readiness');
    }
  });

  it('keeps one exclusive direct Example 3 support edge', () => {
    const edgesCatalog = readCatalog('edges.json');
    const expectedEdge = {
      id: 'math.precalc.edge.0399',
      type: 'supports',
      sourceId: SOURCE_ID,
      targetId: SKILL_ID,
      weight: 1,
      confidence: 'high',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      rationale: 'Example 3 supports solving polynomial inequalities by testing interval signs.',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
    };
    const directSupportEdges = (edgesCatalog.edges ?? []).filter(
      (edge) => edge.type === 'supports' && edge.sourceId === SOURCE_ID,
    );

    expect(directSupportEdges).toEqual([expectedEdge]);
  });
});
