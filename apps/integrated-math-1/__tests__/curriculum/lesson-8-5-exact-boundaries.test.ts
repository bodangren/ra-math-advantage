import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../curriculum/skill-graph');
const read = (name: string) => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const catalogs = ['nodes.json', 'draft-nodes.json', 'edges.json', 'standard-edges.json'].map(read);
const graph = read('edges.json');
const blueprints = read('blueprints.json').blueprints;
const doc = 'apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0805_practice.docx';
const prefix = 'math.im1.skill.8.5.';
const definitions = [
  ['determine-whether-a-given-sequence-is-geometric-by-checking', 'Examples 1 and 2, Problems 1-12', ['math.im1.example.8.5.014']],
  ['extend-a-geometric-sequence-forward-or-backward-using-its-common-ratio', 'Example 3, Problems 13–24; Mixed Exercises, Problem 41', ['math.im1.example.8.5.016']],
  ['evaluate-a-specified-term-of-a-geometric-sequence-with-an-explicit-formula', 'Example 4, Problems 25–28; Mixed Exercises, Problems 34–38, term-evaluation portions only', ['math.im1.example.8.5.017']],
  ['write-an-explicit-formula-for-a-geometric-sequence-from-displayed-terms', 'Example 5, Problem 29; Mixed Exercises, Problems 34–38, formula-writing portions only', ['math.im1.example.8.5.018']],
  ['determine-an-initial-term-from-two-nonconsecutive-geometric-sequence-terms', 'Mixed Exercises, Problem 44(b), second sequence initial-term response only; both real ratio signs are valid', []],
] as const;

describe('Lesson 8-5 exact source boundaries', () => {
  it.each(definitions)('preserves the exact source and blueprint boundary for %s', (suffix, reference, sources) => {
    const id = prefix + suffix;
    const canonical = catalogs[0].nodes.find((n: any) => n.id === id);
    expect(canonical).toBeDefined();
    for (const catalog of catalogs) {
      const node = catalog.nodes.find((n: any) => n.id === id);
      expect(node).toEqual(canonical);
      expect(node.sourceRefs).toEqual([doc, `${doc} (${reference})`]);
      expect(node).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
    }
    const blueprint = blueprints.find((b: any) => b.nodeId === id);
    expect(blueprint.sourceNodeIds).toEqual(sources);
    for (const field of ['workedExampleSpec', 'guidedPracticeSpec', 'independentPracticeSpec']) {
      expect(blueprint).not.toHaveProperty(field);
    }
  });

  it.each([
    ['math.im1.skill.8.1.evaluate-and-interpret-an-exponential-model-at-a-given-input', 'Lesson 8-5 Problems 30(b), 31, and 33(b) assess evaluation of an exponential model at a given input.'],
    ['math.im1.skill.8.3.write-an-exponential-growth-or-decay-model-from-context', 'Lesson 8-5 Problems 30(a) and 33(a) assess writing an exponential model from context using elapsed periods.'],
  ])('records the exact reused response for %s', (id, rationale) => {
    const edges = graph.edges.filter((e: any) => e.sourceId === 'math.im1.lesson.8.5' && e.targetId === id);
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ type: 'contains', rationale, reviewStatus: 'draft' });
  });

  it('adds only lesson containment for new capabilities', () => {
    for (const [suffix] of definitions.slice(1)) {
      const id = prefix + suffix;
      const incident = graph.edges.filter((e: any) => e.sourceId === id || e.targetId === id);
      expect(incident).toHaveLength(1);
      expect(incident[0]).toMatchObject({ type: 'contains', sourceId: 'math.im1.lesson.8.5', targetId: id });
    }
  });

  it('does not assign whole composite classification prompts or ambiguous first-sequence work', () => {
    const classifier = catalogs[0].nodes.find((n: any) => n.id === prefix + definitions[0][0]);
    expect(classifier.sourceRefs.join(' ')).not.toMatch(/Problem(?:s)? (?:32|45)/);
    const initial = catalogs[0].nodes.find((n: any) => n.id === prefix + definitions[4][0]);
    expect(initial.sourceRefs.join(' ')).toContain('second sequence initial-term response only');
    expect(initial.sourceRefs.join(' ')).toContain('both real ratio signs are valid');
  });
});
