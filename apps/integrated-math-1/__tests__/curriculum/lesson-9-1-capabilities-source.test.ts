import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../curriculum/skill-graph');
const read = (name: string) => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const catalogs = ['nodes.json', 'draft-nodes.json', 'edges.json', 'standard-edges.json'].map(read);
const graph = read('edges.json');
const blueprints = read('blueprints.json').blueprints;
const gaps = read('generator-gap-queue.json');
const matrix = read('im1-coverage-matrix.json');
const projection = read('projection/practice-v1-activity-map.json');
const srs = read('projection/srs-input.json').srsInputs;
const doc = 'apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0901_practice.docx';
const aggregate = 'math.im1.skill.9.1.calculate-the-mean-median-and-mode-of-a-data-set';
const definitions = [
  ['calculate-the-arithmetic-mean-of-a-data-set', 'mean responses in Problems 1–9; Mixed Exercises, Problems 15, 17, 19, 24(a), 25(a), 26, and 30(a), mean responses only', ['math.im1.example.9.1.001']],
  ['determine-the-median-of-a-data-set', 'median responses in Problems 1–9; Mixed Exercises, Problems 15, 19, 24(a), 25(a), 26, and 30(a), median responses only', ['math.im1.example.9.1.001']],
  ['identify-all-modes-of-a-data-set', 'mode responses in Problems 1–9; Mixed Exercises, Problems 15, 19, 22, 24(a), 25(a), 26, and 30(a), mode responses only', ['math.im1.example.9.1.001']],
  ['calculate-a-percentile-rank-under-a-stated-counting-convention', 'Problems 10–12; Mixed Exercises, Problems 18, 20, 23, 24(c), and 31', ['math.im1.example.9.1.002']],
] as const;

describe('Lesson 9-1 capability inventory', () => {
  it('keeps the two source groups distinct and draft', () => {
    const expected = [
      ['math.im1.example.9.1.001', 'Example 1: Find Mean, Median, and Mode', 'Example 1, Problems 1–9'],
      ['math.im1.example.9.1.002', 'Example 2: Find Percentile Rank', 'Example 2, Problems 10–12'],
    ];
    for (const [id, title, scope] of expected) {
      const canonical = catalogs[0].nodes.find((node: any) => node.id === id);
      expect(canonical).toMatchObject({ title, reviewStatus: 'draft', independentPracticeReady: false });
      expect(canonical.sourceRefs).toEqual([doc, `${doc} (${scope})`]);
      for (const catalog of catalogs) expect(catalog.nodes.find((node: any) => node.id === id)).toEqual(canonical);
    }
  });

  it.each(definitions)('adds the exact draft source-only boundary for %s', (suffix, scope, sourceNodeIds) => {
    const id = `math.im1.skill.9.1.${suffix}`;
    const canonical = catalogs[0].nodes.find((node: any) => node.id === id);
    expect(canonical).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
    expect(canonical.sourceRefs).toEqual([doc, `${doc} (${scope})`]);
    for (const catalog of catalogs) expect(catalog.nodes.find((node: any) => node.id === id)).toEqual(canonical);
    const blueprint = blueprints.find((value: any) => value.nodeId === id);
    expect(blueprint).toMatchObject({ sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft' });
    expect(Object.keys(blueprint).sort()).toEqual(['alignmentNodeIds', 'metadata', 'nodeId', 'reviewStatus', 'sourceNodeIds']);
    expect(graph.edges.filter((edge: any) => edge.sourceId === 'math.im1.lesson.9.1' && edge.targetId === id && edge.type === 'contains')).toHaveLength(1);
    const incident = graph.edges.filter((edge: any) => edge.sourceId === id || edge.targetId === id);
    const expectedLessons = sourceNodeIds[0] === 'math.im1.example.9.1.001' ? ['math.im1.lesson.9.1', 'math.im1.lesson.9.3'] : ['math.im1.lesson.9.1'];
    expect(incident.every((edge: any) => edge.type === 'contains' && edge.targetId === id && expectedLessons.includes(edge.sourceId))).toBe(true);
    expect(incident.map((edge: any) => edge.sourceId).sort()).toEqual(expectedLessons.sort());
  });

  it('keeps 9a source-only and removes unsupported lesson-sequence prerequisites', () => {
    for (const catalog of catalogs) expect(catalog.nodes.find((node: any) => node.id === aggregate)).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
    const aggregateBlueprint = blueprints.find((blueprint: any) => blueprint.nodeId === aggregate);
    expect(aggregateBlueprint).toMatchObject({ sourceNodeIds: [], reviewStatus: 'draft' });
    expect(Object.keys(aggregateBlueprint).sort()).toEqual(['alignmentNodeIds', 'metadata', 'nodeId', 'reviewStatus', 'sourceNodeIds']);
    expect(projection.activities.filter((activity: any) => activity.nodeId === aggregate)).toHaveLength(0);
    expect(graph.edges.some((edge: any) => edge.id === 'math.im1.edge.1270')).toBe(false);
    expect(graph.edges.some((edge: any) => edge.id === 'math.im1.edge.1271')).toBe(false);
    expect(graph.edges.filter((edge: any) => edge.sourceId === 'math.im1.lesson.9.1' && edge.targetId === aggregate && edge.type === 'contains')).toHaveLength(1);
  });

  it('keeps all four candidates inactive in derived inventory', () => {
    for (const id of [aggregate, ...definitions.map(([suffix]) => `math.im1.skill.9.1.${suffix}`)]) {
      expect(projection.activities.some((activity: any) => activity.nodeId === id)).toBe(false);
      expect(projection.srsInputs.find((row: any) => row.nodeId === id)).toMatchObject({ generatorReady: false });
      expect(srs.find((row: any) => row.nodeId === id)).toEqual(projection.srsInputs.find((row: any) => row.nodeId === id));
      expect(gaps.queue.some((row: any) => row.nodeId === id)).toBe(true);
      expect(matrix.skills.find((row: any) => row.skillId === id)).toMatchObject({ status: 'gap', module: '9' });
    }
  });
});
