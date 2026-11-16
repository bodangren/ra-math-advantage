import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../curriculum/skill-graph');
const read = (name: string) => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const catalogs = ['nodes.json', 'draft-nodes.json', 'edges.json', 'standard-edges.json'].map(read);
const graph = read('edges.json');
const blueprints = read('blueprints.json').blueprints;
const activities = read('projection/practice-v1-activity-map.json').activities;
const srs = read('projection/srs-input.json').srsInputs;
const doc = 'apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0806_practice.docx';
const prefix = 'math.im1.skill.8.6.';
const stable = prefix + 'find-the-first-several-terms-of-a-sequence-given-a-recursive';
const aggregate = prefix + 'convert-between-recursive-and-explicit-formulas-for-arithmet';
const definitions = [
  ['write-a-recursive-formula-from-displayed-sequence-terms', 'Example 3, Problems 7-12; Example 5, Problems 19(b), 20(a), and 21(a); Mixed Exercises, Problem 40', ['math.im1.example.8.6.021', 'math.im1.example.8.6.023']],
  ['write-a-recursive-formula-from-a-discrete-sequence-graph', 'Example 4, Problems 13-18', ['math.im1.example.8.6.022']],
  ['convert-an-explicit-arithmetic-formula-to-a-recursive-formula', 'Example 6, Problems 25 and 27; Mixed Exercises, Problem 30', ['math.im1.example.8.6.024']],
  ['convert-a-recursive-arithmetic-formula-to-an-explicit-formula', 'Example 6, Problems 23 and 26', ['math.im1.example.8.6.024']],
  ['convert-an-explicit-geometric-formula-to-a-recursive-formula', 'Example 6, Problems 22 and 28', ['math.im1.example.8.6.024']],
  ['convert-a-recursive-geometric-formula-to-an-explicit-formula', 'Example 6, Problems 24 and 29; Mixed Exercises, Problem 31', ['math.im1.example.8.6.024']],
] as const;

describe('Lesson 8-6 exact graph boundaries', () => {
  it('preserves exact source-group identities in every catalog', () => {
    const groups = [
      ['019', 'Examples 1 and 2, Problems 1-6: Generate terms from recursive rules', 'draft'],
      ['020', 'Examples 1 and 2: rejected duplicate source identity', 'rejected'],
      ['021', 'Example 3, Problems 7-12: Write recursive formulas from displayed sequences', 'draft'],
      ['022', 'Example 4, Problems 13-18: Write recursive formulas from discrete graphs', 'draft'],
      ['023', 'Example 5, Problems 19-21: Write recursive and explicit formulas in contexts', 'draft'],
      ['024', 'Example 6, Problems 22-29: Convert between recursive and explicit formulas', 'draft'],
    ];
    for (const [number, title, reviewStatus] of groups) {
      const id = `math.im1.example.8.6.${number}`;
      const canonical = catalogs[0].nodes.find((node: any) => node.id === id);
      expect(canonical).toMatchObject({ title, reviewStatus, independentPracticeReady: false });
      expect(canonical.sourceRefs).toEqual([doc, `${doc} (${number === '019' ? 'Examples 1 and 2, Problems 1-6' : number === '020' ? 'Examples 1 and 2, duplicate' : `Example ${Number(number) - 18}, Problems ${number === '021' ? '7-12' : number === '022' ? '13-18' : number === '023' ? '19-21' : '22-29'}`})`]);
      for (const catalog of catalogs) expect(catalog.nodes.find((node: any) => node.id === id)).toEqual(canonical);
    }
  });

  it.each(definitions)('records the exact response boundary for %s', (suffix, reference, sourceNodeIds) => {
    const id = prefix + suffix;
    const canonical = catalogs[0].nodes.find((node: any) => node.id === id);
    expect(canonical.sourceRefs).toEqual([doc, `${doc} (${reference})`]);
    expect(canonical).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
    for (const catalog of catalogs) expect(catalog.nodes.find((node: any) => node.id === id)).toEqual(canonical);
    expect(blueprints.find((row: any) => row.nodeId === id).sourceNodeIds).toEqual(sourceNodeIds);
    expect(srs.find((row: any) => row.nodeId === id)).toMatchObject({ generatorKey: null, generatorReady: false, prerequisites: [] });
  });

  it('keeps stable rows source-only and supports general affine evaluation', () => {
    const node = catalogs[0].nodes.find((row: any) => row.id === stable);
    expect(node.title).toBe('Generate terms of a sequence from an initial condition and recursive rule');
    expect(node.sourceRefs).toEqual([doc, `${doc} (Examples 1 and 2, Problems 1-6; includes affine, arithmetic, geometric, negative-factor, and fractional-coefficient rules)`]);
    for (const id of [stable, aggregate, ...definitions.map(([suffix]) => prefix + suffix)]) {
      const blueprint = blueprints.find((row: any) => row.nodeId === id);
      for (const field of ['workedExampleSpec', 'guidedPracticeSpec', 'independentPracticeSpec']) expect(blueprint).not.toHaveProperty(field);
      expect(activities.filter((row: any) => row.nodeId === id)).toHaveLength(0);
    }
  });

  it('adds only reviewed containment and preserves manual boundaries', () => {
    const expected = [stable, aggregate, ...definitions.map(([suffix]) => prefix + suffix),
      'math.im1.skill.4.5.extend-an-arithmetic-sequence',
      'math.im1.skill.4.5.write-an-explicit-equation-for-an-arithmetic-sequence',
      'math.im1.skill.8.5.write-an-explicit-formula-for-a-geometric-sequence-from-displayed-terms'];
    const contains = graph.edges.filter((edge: any) => edge.type === 'contains' && edge.sourceId === 'math.im1.lesson.8.6');
    expect(contains.map((edge: any) => edge.targetId).filter((id: string) => id.includes('.skill.')).sort()).toEqual(expected.sort());
    expect(contains.some((edge: any) => edge.targetId === 'math.im1.example.8.6.020')).toBe(false);
    for (const [suffix] of definitions) {
      const id = prefix + suffix;
      expect(graph.edges.filter((edge: any) => edge.sourceId === id || edge.targetId === id)).toHaveLength(1);
    }
    expect(graph.edges.some((edge: any) => ['math.im1.edge.1050', 'math.im1.edge.1269'].includes(edge.id))).toBe(false);
    expect(graph.edges.find((edge: any) => edge.id === 'math.im1.edge.1055').rationale).toBe('Lesson 8-6 retains this broad source-only planning aggregate.');
    expect(graph.edges.find((edge: any) => edge.id === 'math.im1.edge.1056').rationale).toBe('Lesson 8-6 Examples 1 and 2, Problems 1-6 assess recursive sequence evaluation.');
    expect(graph.edges.find((edge: any) => edge.id === 'math.im1.edge.g43.reuse-arithmetic-extension').rationale).toBe('Lesson 8-6 Problem 19(a) assesses arithmetic sequence extension.');
    expect(graph.edges.find((edge: any) => edge.id === 'math.im1.edge.g43.reuse-arithmetic-explicit').rationale).toBe('Lesson 8-6 Problem 19(c) assesses explicit arithmetic formula writing.');
    expect(graph.edges.find((edge: any) => edge.id === 'math.im1.edge.g43.reuse-geometric-explicit').rationale).toBe('Lesson 8-6 Problems 20(b) and 21(b) assess explicit geometric formula writing from exact tables.');
  });

  it('records finite-list nonuniqueness for Problem 40', () => {
    const node = catalogs[0].nodes.find((row: any) => row.id === prefix + definitions[0][0]);
    expect(node.description).toContain('A finite list can support more than one valid recursive rule');
    expect(node.description).toContain('reproduces the displayed terms');
  });

});
