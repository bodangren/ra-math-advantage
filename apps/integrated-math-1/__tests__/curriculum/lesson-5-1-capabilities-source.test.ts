import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-5-lesson-1'), 'utf8');
const examples = [
  ['math.im1.example.5.1.001', 1, 'Example 1: Write an Equation Given a Point and a Slope'],
  ['math.im1.example.5.1.002', 2, 'Example 2: Model Real-World Situations with Linear Equations'],
  ['math.im1.example.5.1.003', 3, 'Example 3: Write an Equation Given Two Points'],
  ['math.im1.example.5.1.004', 2, 'Example 2: Model Real-World Situations with Linear Equations'],
  ['math.im1.example.5.1.005', 3, 'Example 3: Write an Equation Given Two Points'],
  ['math.im1.example.5.1.006', 4, 'Example 4: Write Equations from Data and Models'],
] as const;
const skills = [
  ['write-slope-intercept-equations-from-a-point-and-slope', 'Write slope-intercept equations from a point and slope', ['math.im1.example.5.1.001']],
  ['model-contexts-from-a-rate-and-initial-value', 'Model real-world contexts from a rate and initial value', ['math.im1.example.5.1.002']],
  ['write-slope-intercept-equations-from-two-points', 'Write slope-intercept equations from two points', ['math.im1.example.5.1.003']],
  ['write-horizontal-and-vertical-line-equations-from-two-points', 'Write horizontal and vertical line equations from two points', ['math.im1.example.5.1.003']],
  ['model-contexts-from-two-data-points', 'Model real-world contexts from two data points', ['math.im1.example.5.1.006']],
  ['determine-whether-a-point-lies-on-a-line', 'Determine whether a point lies on a line', []],
  ['find-an-additional-point-on-a-line', 'Find an additional point on a line', []],
  ['write-linear-equations-from-graphs', 'Write linear equations from graphs', []],
  ['write-linear-equations-from-tables', 'Write linear equations from tables', []],
  ['interpret-slope-and-y-intercept-in-context', 'Interpret slope and y-intercept in context', []],
].map(([slug, title, refs]) => [`math.im1.skill.5.1.${slug}`, title, refs] as const);

describe('Lesson 5-1 source capabilities', () => {
  it('states the vertical-line exception and the integer population model', () => {
    expect(source).toContain('The points [ (-6, 5) ] and [ (-6, -4) ] define [ x = -6 ].');
    expect(source).toContain('A vertical line does not have slope-intercept form.');
    expect(source).toContain('p = 5441t + 123000');
    expect(source).toContain('p(17) = 215497');
  });

  it('preserves all source identities and excludes duplicate rows from new mappings', () => {
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.5.1.'));
      expect(examples.map(([id]) => rows.find((node) => node.id === id)).map((node) => [node?.id, node?.metadata.exampleNumber, node?.title])).toEqual(examples);
    }
    for (const [id, title, sourceNodeIds] of skills) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft' && node.independentPracticeReady === false)).toBe(true);
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      expect(catalog.blueprints.find((row) => row.nodeId === id)).toEqual({ nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft', metadata: { course: 'im1', module: '5', lesson: '1' } });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.5.1', targetId: id, reviewStatus: 'draft' })]);
    }
  });
});
