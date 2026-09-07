import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gapQueue from '../../curriculum/skill-graph/generator-gap-queue.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-6-lesson-1'), 'utf8');
const multiplicationSources = ['math.im1.example.6.1.source-008', 'math.im1.example.6.1.source-009', 'math.im1.example.6.1.source-010'];
const definitions = [
  ['graph-symbolic-inequalities-on-number-lines', 'Graph symbolic inequalities on number lines', ['math.im1.example.6.1.001']],
  ['write-inequalities-from-number-line-graphs', 'Write inequalities from number-line graphs', ['math.im1.example.6.1.002']],
  ['solve-one-step-inequalities-by-addition-or-subtraction', 'Solve one-step inequalities by addition or subtraction', ['math.im1.example.6.1.003', 'math.im1.example.6.1.004', 'math.im1.example.6.1.005']],
  ['solve-inequalities-with-variable-terms-on-both-sides', 'Solve inequalities with variable terms on both sides', ['math.im1.example.6.1.003', 'math.im1.example.6.1.004', 'math.im1.example.6.1.005']],
  ['write-inequalities-from-contextual-statements', 'Write inequalities from contextual statements', ['math.im1.example.6.1.006', 'math.im1.example.6.1.007']],
  ['solve-contextual-inequalities', 'Solve contextual inequalities', ['math.im1.example.6.1.006', 'math.im1.example.6.1.007']],
  ['interpret-inequality-solutions-in-context', 'Interpret inequality solutions in context', ['math.im1.example.6.1.006', 'math.im1.example.6.1.007']],
  ['solve-one-step-inequalities-with-positive-factors', 'Solve one-step inequalities with positive factors', multiplicationSources],
  ['solve-one-step-inequalities-with-negative-factors', 'Solve one-step inequalities with negative factors and reverse the inequality symbol', multiplicationSources],
  ['graph-solved-one-step-inequalities-on-number-lines', 'Graph solved one-step inequalities on number lines', multiplicationSources],
  ['translate-comparative-statements-into-symbolic-inequalities', 'Translate comparative statements into symbolic inequalities', []],
  ['check-whether-values-satisfy-inequalities', 'Check whether values satisfy inequalities', []],
  ['diagnose-inequality-solving-errors', 'Diagnose inequality-solving errors', []],
  ['solve-literal-inequalities-with-unknown-coefficient-signs', 'Solve literal inequalities with unknown coefficient signs', []],
  ['analyze-reciprocal-inequality-order-across-sign-cases', 'Analyze reciprocal inequality order across sign cases', []],
].map(([slug, title, refs]) => [`math.im1.skill.6.1.${slug}`, title, refs] as const);

describe('Lesson 6-1 source capabilities', () => {
  it('restores visible source details and verified results', () => {
    expect(source).toContain('Problem 29 is `6x + 5 >= 7z`');
    expect(source).toContain('`c <= 15`');
    expect(source).toContain('at least 500 pieces');
    expect(source).toContain('`x >= 80`');
    expect(source).toContain('at least $22.23 per person');
    expect(source).toContain('at least 9 whole apples');
    expect(source).toContain('Problem 82 is sometimes true');
  });

  it('preserves seven IDs and adds three source-number identities for the joint heading', () => {
    for (const document of [canonical, draft, graph, standards]) {
      expect(document.nodes.find((node) => node.id === 'math.im1.example.6.1.001')?.title).toBe('Example 1: Graph Solution Sets');
      expect(document.nodes.find((node) => node.id === 'math.im1.example.6.1.002')?.title).toBe('Example 2: Write Inequalities from Graphs');
      multiplicationSources.forEach((id, index) => {
        const row = document.nodes.find((node) => node.id === id);
        expect(row?.title).toBe(`Example ${8 + index}: Solve and Graph Inequalities by Multiplication and Division`);
        expect(row?.metadata.exampleNumber).toBe(8 + index);
        expect(row?.reviewStatus).toBe('draft');
      });
    }
  });

  it('keeps each candidate draft, inactive, source-only, and contained', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '6', lesson: '1' } });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.1', targetId: id, reviewStatus: 'draft' })]);
    }
  });

  it('keeps source identities contained and does not approve restored objective 6b scope', () => {
    for (const id of multiplicationSources) {
      expect(graph.edges).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.6.1', targetId: id, reviewStatus: 'draft' }));
    }
    expect(canonical.nodes.filter((node) => node.id.startsWith('math.im1.skill.6.1.') && node.reviewStatus === 'approved')).toHaveLength(1);
  });

  it('keeps current artifact totals equal to their arrays', () => {
    expect(gapQueue.meta.totalSkills).toBe(gapQueue.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });
});
