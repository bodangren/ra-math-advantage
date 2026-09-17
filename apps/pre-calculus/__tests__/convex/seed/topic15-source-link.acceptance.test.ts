import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const GRAPH_DIR = path.join(process.cwd(), 'curriculum/skill-graph');
const SOURCE_ID = 'math.precalc.example.1.5.001';
const SECOND_SOURCE_ID = 'math.precalc.example.1.5.002';
const SKILL_ID =
  'math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form';
const SECOND_SKILL_ID =
  'math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs';
const SOURCE_REF =
  'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 1)';
const SECOND_SOURCE_REF =
  'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 2)';
const PLACEHOLDER_SKILL_IDS = [
  'math.precalc.skill.1.5.find-zeros-with-multiplicity-and-graph-behavior',
  'math.precalc.skill.1.5.apply-complex-conjugate-zeros-theorem',
] as const;

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

describe('Topic 1.5 Example 1 source-to-skill graph link', () => {
  it('keeps the exact authored Example 1 source node mirrored', () => {
    const expectedSource = {
      id: SOURCE_ID,
      kind: 'worked_example',
      title: 'Example 1: Find all real zeros with multiplicity.',
      domain: 'math.precalc',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      metadata: {
        course: 'precalc',
        module: '1',
        lesson: '5',
        exampleNumber: 1,
        sourceLesson: '1-5',
        rawText:
          'Find all real zeros with multiplicity.\na) [f(x) = -2x^3(x+1)(x-4)^2] → Degree: [3 + 1 + 2 = 6]. Zeros: [x = 0] (mult. 3), [x = -1] (mult. 1), [x = 4] (mult. 2).\nb) [g(x) = 3(x^2 - 4)(x - 2)^4 = 3(x-2)(x+2)(x-2)^4] → Zeros: [x = 2] (mult. 5), [x = -2] (mult. 1).',
      },
    };
    const nodesCatalog = readCatalog('nodes.json');
    const draftCatalog = readCatalog('draft-nodes.json');

    expect(findNodes(nodesCatalog, SOURCE_ID)).toEqual([expectedSource]);
    expect(findNodes(draftCatalog, SOURCE_ID)).toEqual([expectedSource]);

    const expectedSecondSource = {
      id: SECOND_SOURCE_ID,
      kind: 'worked_example',
      title: 'Example 2: The zero [x = isqrt{3}] is given for polynomial [f]. Since complex zeros come in',
      domain: 'math.precalc',
      sourceRefs: [SECOND_SOURCE_REF],
      reviewStatus: 'draft',
      metadata: {
        course: 'precalc',
        module: '1',
        lesson: '5',
        exampleNumber: 2,
        sourceLesson: '1-5',
        rawText:
          'The zero [x = isqrt{3}] is given for polynomial [f]. Since complex zeros come in conjugate pairs, [x = -isqrt{3}] is also a zero. The graph shows at least 3 real zeros. So: 2 complex + 3 real = least degree 5.',
      },
    };
    expect(findNodes(nodesCatalog, SECOND_SOURCE_ID)).toEqual([expectedSecondSource]);
    expect(findNodes(draftCatalog, SECOND_SOURCE_ID)).toEqual([expectedSecondSource]);
  });

  it('mirrors the exact capability with its accepted generator and renderer keys', () => {
    const expectedSkill = {
      id: SKILL_ID,
      kind: 'skill',
      title: 'Find real zeros and multiplicities from factored form',
      domain: 'math.precalc',
      description: 'Find the real zeros and their multiplicities from a factored polynomial expression.',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
      rendererKey: 'real-zeros-and-multiplicities',
      generatorKey: 'topic15-real-zeros-and-multiplicities-from-factored-form',
      independentPracticeReady: true,
    };
    const nodesCatalog = readCatalog('nodes.json');
    const draftCatalog = readCatalog('draft-nodes.json');

    expect(findNodes(nodesCatalog, SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draftCatalog, SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(nodesCatalog, SKILL_ID)[0]).toHaveProperty('independentPracticeReady', true);
    expect(findNodes(draftCatalog, SKILL_ID)[0]).toHaveProperty('independentPracticeReady', true);
  });

  it('mirrors the exact Example 2 capability with runtime keys and readiness', () => {
    const expectedSkill = {
      id: SECOND_SKILL_ID,
      kind: 'skill',
      title: 'Determine least polynomial degree from zeros and conjugate pairs',
      domain: 'math.precalc',
      description: 'Determine the least possible degree of a real-coefficient polynomial by counting given zeros, multiplicities, and required conjugate zeros.',
      sourceRefs: [SECOND_SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
      rendererKey: 'least-polynomial-degree',
      generatorKey: 'topic15-least-polynomial-degree-from-zeros-and-conjugate-pairs',
      independentPracticeReady: true,
    };
    const nodesCatalog = readCatalog('nodes.json');
    const draftCatalog = readCatalog('draft-nodes.json');

    expect(findNodes(nodesCatalog, SECOND_SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draftCatalog, SECOND_SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(nodesCatalog, SECOND_SKILL_ID)).toHaveLength(1);
    expect(findNodes(draftCatalog, SECOND_SKILL_ID)).toHaveLength(1);
    expect(findNodes(nodesCatalog, SECOND_SKILL_ID)[0]).toHaveProperty('independentPracticeReady', true);
    expect(findNodes(draftCatalog, SECOND_SKILL_ID)[0]).toHaveProperty('independentPracticeReady', true);
  });

  it('keeps exclusive Example 1 and Example 2 support edges and preserves broad placeholders', () => {
    const edgesCatalog = readCatalog('edges.json');
    const exampleOneSupportEdges = edgesCatalog.edges!.filter(
      (edge) => edge.type === 'supports' && edge.sourceId === SOURCE_ID,
    );
    expect(exampleOneSupportEdges).toEqual([
      {
        id: 'math.precalc.edge.0397',
        type: 'supports',
        sourceId: SOURCE_ID,
        targetId: SKILL_ID,
        weight: 1,
        confidence: 'high',
        sourceRefs: [SOURCE_REF],
        reviewStatus: 'draft',
        rationale: 'Example 1 supports finding real zeros and multiplicities from factored form.',
        metadata: { course: 'precalc', unit: '1', lesson: '5' },
      },
    ]);
    expect(edgesCatalog.edges!.filter(
      (edge) => edge.type === 'supports' && edge.sourceId === SECOND_SOURCE_ID,
    )).toEqual([
      {
        id: 'math.precalc.edge.0398',
        type: 'supports',
        sourceId: SECOND_SOURCE_ID,
        targetId: SECOND_SKILL_ID,
        weight: 1,
        confidence: 'high',
        sourceRefs: [SECOND_SOURCE_REF],
        reviewStatus: 'draft',
        rationale: 'Example 2 supports determining the least polynomial degree by accounting for conjugate nonreal zeros.',
        metadata: { course: 'precalc', unit: '1', lesson: '5' },
      },
    ]);
    const nodesCatalog = readCatalog('nodes.json');
    for (const placeholderId of PLACEHOLDER_SKILL_IDS) {
      expect(findNodes(nodesCatalog, placeholderId)).toHaveLength(1);
    }
  });
});
