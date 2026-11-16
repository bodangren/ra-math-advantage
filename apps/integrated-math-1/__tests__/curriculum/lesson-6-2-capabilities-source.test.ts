import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gapQueue from '../../curriculum/skill-graph/generator-gap-queue.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-6-lesson-2'), 'utf8');
const examples = [
  ['math.im1.example.6.2.008', 'Example 1: Write and Solve Contextual Inequalities', 1],
  ['math.im1.example.6.2.009', 'Example 2: Translate, Solve, and Graph Verbal Inequalities', 2],
  ['math.im1.example.6.2.010', 'Example 3: Solve and Graph Multi-Step Inequalities', 3],
  ['math.im1.example.6.2.011', 'Example 2: Translate, Solve, and Graph Verbal Inequalities (schedule repeat)', 2],
  ['math.im1.example.6.2.012', 'Example 3: Solve and Graph Multi-Step Inequalities (schedule repeat)', 3],
] as const;
const definitions = [
  ['solve-multi-step-linear-inequalities-by-simplifying-and-collecting-terms', 'Solve multi-step linear inequalities by simplifying and collecting terms', ['math.im1.example.6.2.008', 'math.im1.example.6.2.009', 'math.im1.example.6.2.010']],
  ['apply-the-distributive-property-in-linear-inequalities', 'Apply the Distributive Property in linear inequalities, including a negative factor', ['math.im1.example.6.2.010']],
  ['classify-no-solution-and-all-real-number-inequalities', 'Classify inequalities as no solution or all real numbers after variable terms cancel', ['math.im1.example.6.2.010']],
  ['generalize-contextual-inequality-models-with-parameterized-unit-intervals', 'Generalize contextual inequality models with parameterized unit intervals', ['math.im1.example.6.2.008']],
  ['construct-multi-step-inequalities-with-specified-solution-sets', 'Construct multi-step inequalities with specified solution sets and algebraic properties', []],
  ['explain-and-justify-multi-step-inequality-transformations', 'Explain and justify transformations in multi-step inequality solutions', []],
  ['analyze-dependent-geometric-constraints-with-linear-inequalities', 'Analyze dependent geometric constraints with linear inequalities', []],
].map(([slug, title, refs]) => [`math.im1.skill.6.2.${slug}`, title, refs] as const);
const lesson63Reuses = new Set([
  'math.im1.skill.6.2.construct-multi-step-inequalities-with-specified-solution-sets',
  'math.im1.skill.6.2.analyze-dependent-geometric-constraints-with-linear-inequalities',
]);

const reused = new Map([
  ['math.im1.skill.6.1.write-inequalities-from-contextual-statements', ['math.im1.example.6.2.008']],
  ['math.im1.skill.6.1.solve-contextual-inequalities', ['math.im1.example.6.2.008']],
  ['math.im1.skill.6.1.interpret-inequality-solutions-in-context', ['math.im1.example.6.2.008']],
  ['math.im1.skill.6.1.graph-solved-one-step-inequalities-on-number-lines', ['math.im1.example.6.2.009', 'math.im1.example.6.2.010']],
  ['math.im1.skill.6.1.translate-comparative-statements-into-symbolic-inequalities', ['math.im1.example.6.2.009']],
  ['math.im1.skill.6.1.check-whether-values-satisfy-inequalities', []],
  ['math.im1.skill.6.1.solve-literal-inequalities-with-unknown-coefficient-signs', []],
]);

describe('Lesson 6-2 source capabilities', () => {
  it('restores the readable source and verified boundary results', () => {
    expect(source).toContain('The oldest brother has no maximum age under the stated inequality.');
    expect(source).toContain('`2 < a <= 14/3`');
    expect(source).toContain('Problem 45 has many valid constructions.');
    expect(source).toContain('Problem 46 depends on the sign of `a`');
    expect(source).toContain('Problem 50 gives `y > -3` for the first inequality and `y > 3` for the other three.');
    expect(source).toContain('Problem 52 requires separate cases for `a > 0` and `a < 0`.');
    expect(source).not.toContain('was not extracted');
  });

  it('preserves source IDs and distinguishes actual examples from schedule repeats', () => {
    for (const document of [canonical, draft, graph, standards]) {
      for (const [id, title, number] of examples) {
        const row = document.nodes.find((node) => node.id === id);
        expect(row?.title).toBe(title);
        expect(row?.metadata.exampleNumber).toBe(number);
      }
    }
    expect(catalog.blueprints.every((row) => !(row.sourceNodeIds as readonly string[]).includes('math.im1.example.6.2.011') && !(row.sourceNodeIds as readonly string[]).includes('math.im1.example.6.2.012'))).toBe(true);
  });

  it('keeps each new candidate draft, inactive, source-only, and contained', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '6', lesson: '2' } });
      const incident = graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id);
      expect(incident).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.2', targetId: id, reviewStatus: 'draft' }));
      if (lesson63Reuses.has(id)) {
        expect(incident).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.3', targetId: id, reviewStatus: 'draft' }));
      }
      expect(incident).toHaveLength(1 + Number(lesson63Reuses.has(id)));
    }
  });

  it('reuses exact Lesson 6-1 capabilities without changing ownership', () => {
    for (const [id, addedSources] of reused) {
      const row = canonical.nodes.find((node) => node.id === id);
      expect(row?.metadata).toEqual({ course: 'im1', module: '6', lesson: '1' });
      expect(row?.reviewStatus).toBe('draft');
      const blueprint = catalog.blueprints.find((entry) => entry.nodeId === id);
      for (const sourceId of addedSources) expect(blueprint?.sourceNodeIds).toContain(sourceId);
      expect(graph.edges).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.2', targetId: id, reviewStatus: 'draft' }));
    }
    expect(graph.edges).not.toContainEqual(expect.objectContaining({
      type: 'contains',
      sourceId: 'math.im1.lesson.6.2',
      targetId: 'math.im1.skill.6.1.diagnose-inequality-solving-errors',
    }));
  });

  it('keeps current artifact totals equal to their arrays', () => {
    expect(gapQueue.meta.totalSkills).toBe(gapQueue.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });
});
