import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gapQueue from '../../curriculum/skill-graph/generator-gap-queue.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-6-lesson-3'), 'utf8');
const examples = [
  ['math.im1.example.6.3.013', 'Example 1: Solve and Graph Compound Inequalities', 1],
  ['math.im1.example.6.3.014', 'Example 2: Model, Solve, and Graph Contextual Compound Inequalities', 2],
  ['math.im1.example.6.3.015', 'Example 2: Model, Solve, and Graph Contextual Compound Inequalities (schedule repeat)', 2],
  ['math.im1.example.6.3.016', 'Example 3: Solve and Graph Compound Inequalities', 3],
  ['math.im1.example.6.3.source-004', 'Example 4: Solve and Graph Compound Inequalities', 4],
  ['math.im1.example.6.3.source-005', 'Example 5: Write Compound Inequalities from Graphs', 5],
  ['math.im1.example.6.3.source-006', 'Example 6: Write Compound Inequalities from Graphs', 6],
] as const;
const solveSources = ['math.im1.example.6.3.013', 'math.im1.example.6.3.016', 'math.im1.example.6.3.source-004'];
const graphSources = ['math.im1.example.6.3.source-005', 'math.im1.example.6.3.source-006'];
const lesson64SolveSources = ['math.im1.example.6.4.017', 'math.im1.example.6.4.018', 'math.im1.example.6.4.020', 'math.im1.example.6.4.021'];
const lesson64Reuses = new Set([
  'math.im1.skill.6.3.solve-and-compound-inequalities-as-intersections',
  'math.im1.skill.6.3.solve-or-compound-inequalities-as-unions',
  'math.im1.skill.6.3.graph-compound-inequality-solution-sets',
]);
const definitions = [
  ['solve-and-compound-inequalities-as-intersections', 'Solve compound inequalities joined by and as intersections', solveSources],
  ['solve-or-compound-inequalities-as-unions', 'Solve compound inequalities joined by or as unions', solveSources],
  ['solve-three-part-linear-inequalities', 'Solve three-part linear inequalities by applying each operation to all three parts', solveSources],
  ['simplify-overlapping-and-special-compound-solution-sets', 'Simplify compound solution sets with overlap, absorption, all real numbers, or the empty set', solveSources],
  ['graph-compound-inequality-solution-sets', 'Graph compound inequality solution sets on number lines', solveSources],
  ['write-compound-inequalities-from-number-line-graphs', 'Write compound inequalities from number-line graphs', graphSources],
  ['model-bounded-contextual-ranges-with-compound-inequalities', 'Model bounded contextual ranges with compound inequalities', ['math.im1.example.6.3.014']],
  ['model-exterior-contextual-conditions-with-compound-inequalities', 'Model exterior or disjoint contextual conditions with compound inequalities', ['math.im1.example.6.3.014']],
  ['compare-unions-and-intersections-of-graphed-solution-sets', 'Compare unions and intersections of graphed solution sets', []],
  ['classify-structural-claims-about-compound-inequalities', 'Classify structural claims about compound inequalities as always, sometimes, or never true', []],
].map(([slug, title, refs]) => [`math.im1.skill.6.3.${slug}`, title, refs] as const);
const reused = new Map([
  ['math.im1.skill.6.1.interpret-inequality-solutions-in-context', ['math.im1.example.6.3.014']],
  ['math.im1.skill.6.1.check-whether-values-satisfy-inequalities', []],
  ['math.im1.skill.6.1.diagnose-inequality-solving-errors', []],
  ['math.im1.skill.6.2.construct-multi-step-inequalities-with-specified-solution-sets', []],
  ['math.im1.skill.6.2.analyze-dependent-geometric-constraints-with-linear-inequalities', []],
]);

describe('Lesson 6-3 source capabilities', () => {
  it('restores readable source details and verified boundary results', () => {
    expect(source).toContain('`y >= 8` or `y < -4`');
    expect(source).toContain('`2/7 < v < 10/23`');
    expect(source).toContain('Problem 46 contains a sign error');
    expect(source).toContain('`-1 <= x < 8`');
    expect(source).toContain('Problem 53 is sometimes true under the two-boundary-point interpretation.');
    expect(source).not.toContain('not described');
  });

  it('preserves retained IDs, adds exact source identities, and excludes the schedule repeat', () => {
    for (const document of [canonical, draft, graph, standards]) {
      for (const [id, title, number] of examples) {
        const row = document.nodes.find((node) => node.id === id);
        expect(row?.title).toBe(title);
        expect(row?.metadata.exampleNumber).toBe(number);
      }
    }
    expect(catalog.blueprints.every((row) => !row.sourceNodeIds.includes('math.im1.example.6.3.015'))).toBe(true);
  });

  it('keeps ten new candidates draft, inactive, source-only, and contained', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds: [...sourceNodeIds, ...(lesson64Reuses.has(id) ? lesson64SolveSources : [])], alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '6', lesson: '3' } });
      const incident = graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id);
      expect(incident).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.3', targetId: id, reviewStatus: 'draft' }));
      if (lesson64Reuses.has(id)) {
        expect(incident).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.4', targetId: id, reviewStatus: 'draft' }));
      }
      expect(incident).toHaveLength(1 + Number(lesson64Reuses.has(id)));
    }
  });

  it('reuses five exact capabilities without changing their ownership', () => {
    for (const [id, addedSources] of reused) {
      const row = canonical.nodes.find((node) => node.id === id);
      expect(row?.reviewStatus).toBe('draft');
      expect(row?.metadata.lesson).not.toBe('3');
      const blueprint = catalog.blueprints.find((entry) => entry.nodeId === id);
      for (const sourceId of addedSources) expect(blueprint?.sourceNodeIds).toContain(sourceId);
      expect(graph.edges).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.3', targetId: id, reviewStatus: 'draft' }));
    }
  });

  it('does not add rejected representation-based candidates', () => {
    expect(canonical.nodes.some((node) => node.id.includes('domain-restrictions-to-contextual-compound'))).toBe(false);
    expect(canonical.nodes.some((node) => node.id.includes('compound-bounds-that-contain-a-formula'))).toBe(false);
  });

  it('keeps current artifact totals equal to their arrays', () => {
    expect(gapQueue.meta.totalSkills).toBe(gapQueue.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });
});
