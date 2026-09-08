import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../curriculum/skill-graph');
const read = (name: string) => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const catalogs = ['nodes.json', 'draft-nodes.json', 'edges.json', 'standard-edges.json'].map(read);
const graph = read('edges.json');
const blueprints = read('blueprints.json').blueprints;
const projection = read('projection/practice-v1-activity-map.json');
const srs = read('projection/srs-input.json').srsInputs;
const gaps = read('generator-gap-queue.json');
const matrix = read('im1-coverage-matrix.json');
const lesson = 'math.im1.lesson.9.2';
const doc = 'apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0902_practice.docx';
const definitions = [
  ['construct-a-quantitative-dot-plot', 'Problems 1 and 2', ['math.im1.example.9.2.003']],
  ['scale-a-dot-plot-number-line', 'Problem 2', ['math.im1.example.9.2.003']],
  ['construct-a-bar-graph-from-categorical-frequencies', 'Problem 3', ['math.im1.example.9.2.005']],
  ['construct-a-histogram-from-grouped-frequencies', 'Problem 5', []],
  ['classify-count-data-as-discrete', 'Mixed Exercises, Problem 6, classification response only', []],
  ['select-an-appropriate-data-display-and-justify-the-choice', 'Mixed Exercises, Problem 8(a)', []],
  ['choose-histogram-intervals-for-measurement-data', 'Mixed Exercises, Problem 11', []],
  ['construct-a-categorical-dot-display-from-frequencies', 'Mixed Exercises, Problem 12(a)', []],
  ['identify-the-greatest-value-in-a-data-set', 'Mixed Exercises, Problem 7(c)', []],
  ['count-values-below-a-threshold', 'Mixed Exercises, Problem 9(b)', []],
  ['count-represented-categories', 'Mixed Exercises, Problem 12(b)', []],
  ['identify-the-category-with-the-greatest-frequency', 'Mixed Exercises, Problem 12(c)', []],
  ['draw-and-justify-conclusions-from-a-data-display', 'Mixed Exercises, Problems 13 and 16', []],
  ['explain-when-and-how-to-construct-a-histogram', 'Mixed Exercises, Problem 14', []],
  ['explain-why-a-dot-plot-scale-may-be-needed', 'Mixed Exercises, Problem 15', []],
  ['compare-bar-graphs-and-histograms', 'Mixed Exercises, Problem 17', []],
] as const;
const ids = definitions.map(([slug]) => `math.im1.skill.9.2.${slug}`);
const aggregates = ['math.im1.skill.9.2.construct-dot-plots-bar-graphs-and-histograms-to-represent-d', 'math.im1.skill.9.2.analyze-data-displays-to-draw-conclusions-and-answer-questio'];

describe('Lesson 9-2 capability inventory', () => {
  it('keeps two canonical source groups and rejects duplicate or phantom identities', () => {
    const expected = new Map([
      ['math.im1.example.9.2.003', ['Examples 1 and 2: Construct quantitative dot plots', 'Examples 1 and 2, Problems 1 and 2', 'draft']],
      ['math.im1.example.9.2.005', ['Examples 3 and 4: Construct a categorical bar graph and classify data', 'Examples 3 and 4, Problems 3 and 4', 'draft']],
      ['math.im1.example.9.2.004', ['', '', 'rejected']], ['math.im1.example.9.2.006', ['', '', 'rejected']], ['math.im1.example.9.2.007', ['', '', 'rejected']],
    ]);
    for (const [id, [title, scope, status]] of expected) for (const catalog of catalogs) {
      const node = catalog.nodes.find((value: any) => value.id === id);
      expect(node).toMatchObject({ reviewStatus: status, independentPracticeReady: false });
      if (status === 'rejected') { expect(node.sourceRefs[0]).toBe(doc); expect(node.sourceRefs[1]).toMatch(/rejected (duplicate|phantom) source identity/); }
      else { expect(node.title).toBe(title); expect(node.sourceRefs).toEqual([doc, `${doc} (${scope})`]); }
    }
    for (const id of ['math.im1.example.9.2.004', 'math.im1.example.9.2.006', 'math.im1.example.9.2.007']) expect(graph.edges.some((edge: any) => edge.type === 'contains' && edge.targetId === id)).toBe(false);
  });

  it.each(definitions)('adds exact draft source-only capability %s', (slug, scope, sourceNodeIds) => {
    const id = `math.im1.skill.9.2.${slug}`;
    const canonical = catalogs[0].nodes.find((node: any) => node.id === id);
    expect(canonical).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false, sourceRefs: [doc, `${doc} (${scope})`] });
    for (const catalog of catalogs) expect(catalog.nodes.find((node: any) => node.id === id)).toEqual(canonical);
    expect(blueprints.find((row: any) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '9', lesson: '2' } });
    expect(graph.edges.filter((edge: any) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ sourceId: lesson, targetId: id, type: 'contains' })]);
  });

  it('keeps both aggregates source-only and removes unsupported sequence evidence', () => {
    for (const id of aggregates) {
      for (const catalog of catalogs) expect(catalog.nodes.find((node: any) => node.id === id)).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
      const bp = blueprints.find((row: any) => row.nodeId === id);
      expect(Object.keys(bp).sort()).toEqual(['alignmentNodeIds', 'metadata', 'nodeId', 'reviewStatus', 'sourceNodeIds']);
      expect(projection.activities.filter((row: any) => row.nodeId === id)).toHaveLength(0);
    }
    expect(graph.edges.some((edge: any) => edge.id === 'math.im1.edge.1272')).toBe(false);
  });

  it('keeps all selected rows inactive in derived inventory', () => {
    for (const id of [...aggregates, ...ids]) {
      expect(projection.activities.some((row: any) => row.nodeId === id)).toBe(false);
      expect(projection.srsInputs.find((row: any) => row.nodeId === id)).toMatchObject({ generatorReady: false });
      expect(srs.find((row: any) => row.nodeId === id)).toEqual(projection.srsInputs.find((row: any) => row.nodeId === id));
      expect(gaps.queue.some((row: any) => row.nodeId === id)).toBe(true);
      expect(matrix.skills.some((row: any) => row.skillId === id && row.status === 'gap')).toBe(true);
    }
  });
});
