import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gapQueue from '../../curriculum/skill-graph/generator-gap-queue.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-6-lesson-4'), 'utf8');
const examples = [
  ['math.im1.example.6.4.017', 'Example 1: Solve and Graph Absolute Value Inequalities', 1],
  ['math.im1.example.6.4.018', 'Example 2: Solve and Graph Absolute Value Inequalities', 2],
  ['math.im1.example.6.4.019', 'Example 3: Model Absolute Value Inequalities in Context', 3],
  ['math.im1.example.6.4.020', 'Example 4: Solve and Graph Absolute Value Inequalities', 4],
  ['math.im1.example.6.4.021', 'Example 5: Solve and Graph Absolute Value Inequalities', 5],
] as const;
const solveSources = ['math.im1.example.6.4.017', 'math.im1.example.6.4.018', 'math.im1.example.6.4.020', 'math.im1.example.6.4.021'];
const definitions = [
  ['rewrite-and-solve-less-than-absolute-value-inequalities', 'Rewrite and solve less-than absolute value inequalities as bounded and inequalities', solveSources],
  ['rewrite-and-solve-greater-than-absolute-value-inequalities', 'Rewrite and solve greater-than absolute value inequalities as exterior or inequalities', solveSources],
  ['classify-negative-bound-absolute-value-inequalities', 'Classify negative-bound absolute value inequalities as no solution or all real numbers', solveSources],
  ['isolate-scaled-absolute-value-expressions-before-solving', 'Isolate scaled or rational absolute value expressions before solving', solveSources],
  ['model-centered-within-tolerance-ranges-with-absolute-value-inequalities', 'Model centered within-tolerance ranges with absolute value inequalities', ['math.im1.example.6.4.019']],
  ['model-values-outside-centered-ranges-with-absolute-value-inequalities', 'Model values outside centered ranges with absolute value inequalities', ['math.im1.example.6.4.019']],
  ['write-absolute-value-inequalities-from-symmetric-bounded-graphs', 'Write absolute value inequalities from symmetric bounded number-line graphs', []],
  ['write-absolute-value-inequalities-from-symmetric-exterior-graphs', 'Write absolute value inequalities from symmetric exterior number-line graphs', []],
  ['solve-two-sided-bounds-on-absolute-value-expressions', 'Solve two-sided bounds on absolute value expressions', []],
  ['analyze-equivalence-and-structural-claims-about-absolute-value-inequalities', 'Analyze equivalence and structural claims about absolute value and compound inequalities', []],
  ['construct-absolute-value-inequalities-from-numerical-constraints', 'Construct absolute value inequalities from specified numerical constraints', []],
].map(([slug, title, refs]) => [`math.im1.skill.6.4.${slug}`, title, refs] as const);
const reused = new Map([
  ['math.im1.skill.6.3.solve-and-compound-inequalities-as-intersections', solveSources],
  ['math.im1.skill.6.3.solve-or-compound-inequalities-as-unions', solveSources],
  ['math.im1.skill.6.3.graph-compound-inequality-solution-sets', solveSources],
  ['math.im1.skill.6.1.interpret-inequality-solutions-in-context', ['math.im1.example.6.4.019']],
  ['math.im1.skill.6.1.diagnose-inequality-solving-errors', []],
]);

describe('Lesson 6-4 source capabilities', () => {
  it('restores readable source mathematics and exact endpoint policies', () => {
    expect(source).toContain('`|60 - s| <= 0.025s`');
    expect(source).toContain('`2400/41 <= s <= 800/13`');
    expect(source).toContain('17. `|(7c + 3)/2| <= -5` has no solution.');
    expect(source).toContain('Division by `-6` reverses both inequality symbols.');
    expect(source).toContain('`-8 <= n < -3` or `1 < n <= 6`');
    expect(source).toContain('`a < 1` or `a > 2`');
    expect(source).toContain('solution set `{x | 4 <= x}` in part a and `{4}` in part b');
    expect(source).toContain('Problems 48, 52, and 60 permit more than one valid response.');
    expect(source).not.toContain('not described');
  });

  it('preserves all five IDs and assigns the exact joint and contextual source meanings', () => {
    for (const document of [canonical, draft, graph, standards]) {
      for (const [id, title, number] of examples) {
        const row = document.nodes.find((node) => node.id === id);
        expect(row?.title).toBe(title);
        expect(row?.metadata.exampleNumber).toBe(number);
      }
    }
    const jointBodies = [canonical, draft, graph, standards].flatMap((document) =>
      solveSources.map((id) => document.nodes.find((node) => node.id === id)?.metadata.rawText),
    );
    expect(new Set(jointBodies)).toEqual(new Set(['6-4, Examples 1, 2, 4, 5 — Solve and graph absolute value inequalities']));
  });

  it('keeps eleven new candidates draft, inactive, source-only, and contained', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '6', lesson: '4' } });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.4', targetId: id, reviewStatus: 'draft' })]);
    }
  });

  it('reuses five exact capabilities without changing their ownership', () => {
    for (const [id, addedSources] of reused) {
      const row = canonical.nodes.find((node) => node.id === id);
      expect(row?.reviewStatus).toBe('draft');
      expect(row?.metadata.lesson).not.toBe('4');
      const blueprint = catalog.blueprints.find((entry) => entry.nodeId === id);
      for (const sourceId of addedSources) expect(blueprint?.sourceNodeIds).toContain(sourceId);
      expect(graph.edges).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.4', targetId: id, reviewStatus: 'draft' }));
    }
  });

  it('does not add representation-based duplicates or approval claims', () => {
    expect(canonical.nodes.some((node) => node.id.includes('absolute-value-percentages'))).toBe(false);
    expect(canonical.nodes.some((node) => node.id.includes('absolute-value-temperature'))).toBe(false);
    expect(definitions.every(([id]) => catalog.blueprints.find((row) => row.nodeId === id)?.reviewStatus === 'draft')).toBe(true);
  });

  it('keeps current artifact totals equal to their arrays', () => {
    expect(gapQueue.meta.totalSkills).toBe(gapQueue.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });
});
