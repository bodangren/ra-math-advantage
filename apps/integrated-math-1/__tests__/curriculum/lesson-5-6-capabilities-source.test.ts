import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gapQueue from '../../curriculum/skill-graph/generator-gap-queue.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-5-lesson-6'), 'utf8');
const definitions = [
  ['find-inverse-relations-from-tables', 'Find inverse relations from tables', ['math.im1.example.5.6.022']],
  ['find-inverse-relations-from-ordered-pairs', 'Find inverse relations from ordered pairs', ['math.im1.example.5.6.023']],
  ['relate-domain-and-range-under-inversion', 'Relate domain and range under inversion', ['math.im1.example.5.6.022', 'math.im1.example.5.6.023']],
  ['graph-inverse-relations-by-reflecting-across-y-equals-x', 'Graph inverse relations by reflecting across y = x', ['math.im1.example.5.6.024']],
  ['find-inverses-of-nonconstant-linear-functions-algebraically', 'Find inverses of nonconstant linear functions algebraically', ['math.im1.example.5.6.025', 'math.im1.example.5.6.026', 'math.im1.example.5.6.027']],
  ['interpret-inverse-function-inputs-and-outputs-in-context', 'Interpret inverse-function inputs and outputs in context', ['math.im1.example.5.6.027']],
  ['use-inverse-functions-to-solve-contextual-problems', 'Use inverse functions to solve contextual problems', ['math.im1.example.5.6.027']],
  ['write-inverse-functions-from-linear-equations-in-two-variables', 'Write inverse functions from linear equations in two variables', []],
  ['construct-inverse-linear-equations-from-slope-and-point-conditions', 'Construct inverse linear equations from slope and point conditions', []],
  ['match-linear-functions-with-graphs-of-their-inverses', 'Match linear functions with graphs of their inverses', []],
  ['verify-inverse-relations-by-reversing-ordered-pairs', 'Verify inverse relations by reversing ordered pairs', []],
  ['verify-inverse-functions-by-graphing-with-y-equals-x', 'Verify inverse functions by graphing with y = x', []],
  ['relate-slopes-of-nonconstant-linear-functions-and-their-inverses', 'Relate slopes of nonconstant linear functions and their inverses', []],
  ['relate-intercepts-of-linear-relations-and-their-inverses', 'Relate intercepts of linear relations and their inverses', []],
  ['distinguish-inverse-function-notation-from-reciprocal-notation', 'Distinguish inverse-function notation from reciprocal notation', []],
  ['solve-unknown-parameters-from-inverse-function-conditions', 'Solve unknown parameters from inverse-function conditions', []],
  ['evaluate-whether-point-evidence-proves-functions-are-inverses', 'Evaluate whether point evidence proves functions are inverses', []],
].map(([slug, title, refs]) => [`math.im1.skill.5.6.${slug}`, title, refs] as const);

describe('Lesson 5-6 source capabilities', () => {
  it('restores source mathematics and domain limits', () => {
    expect(source).toContain('V(h) = 12πh');
    expect(source).toContain('V^-1(x) = x / (12π)');
    expect(source).toContain('420π cubic feet gives a height of 35 feet');
    expect(source).toContain('Positive profit requires more than `36 / 7.6`');
    expect(source).toContain('at least 5 dozen');
    expect(source).toContain('9 pieces and `108 feet`');
    expect(source).toContain('f^-1(x) = (1 - 5x) / 4');
    expect(source).toContain('Problem 49 is sometimes true');
  });

  it('qualifies inverse-function statements', () => {
    expect(source).toContain('A constant linear function does not have an inverse function on its full domain.');
    expect(source).toContain('The inverse slope is `1/m`, not `-1/m`.');
    expect(source).toContain('`f^-1(x)` does not mean `1/f(x)`');
    expect(source).toContain('One reversed input-output pair does not prove that two complete functions are inverses.');
  });

  it('preserves and corrects exact worked-example identities', () => {
    const titles = [
      'Example 1: Find the Inverse from a Table',
      'Example 2: Find the Inverse from Ordered Pairs',
      'Example 3: Graph the Inverse of a Function',
      'Example 4: Find the Inverse of a Linear Function',
      'Example 5: Find the Inverse of Linear Functions with Fractional Coefficients',
      'Example 6: Use Inverse Functions in Context',
    ];
    for (const document of [canonical, draft, graph, standards]) {
      titles.forEach((title, index) => expect(document.nodes.find((node) => node.id === `math.im1.example.5.6.0${22 + index}`)?.title).toBe(title));
    }
  });

  it('keeps each atomic candidate draft, inactive, source-only, and contained', () => {
    for (const [id, title, sourceNodeIds] of definitions) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '5', lesson: '6' } });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.5.6', targetId: id, reviewStatus: 'draft' })]);
    }
  });

  it('preserves the stable aggregate and current artifact totals', () => {
    expect(canonical.nodes.find((node) => node.id === 'math.im1.skill.5.6.find-the-inverse-of-a-relation-given-its-graph-table-or-set')?.reviewStatus).toBe('approved');
    expect(gapQueue.meta.totalSkills).toBe(gapQueue.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });
});
