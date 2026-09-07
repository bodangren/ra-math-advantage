import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import blueprintCatalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-3'), 'utf8');
const lessonId = 'math.im1.lesson.4.3';
const examples = [
  ['math.im1.example.4.3.012', 1, 'Example 1: Write Equations from Slope and y-Intercept'],
  ['math.im1.example.4.3.013', 2, 'Example 2: Rewrite in Slope-Intercept Form'],
  ['math.im1.example.4.3.014', 3, 'Example 3: Model Real-World Situations'],
  ['math.im1.example.4.3.015', 4, 'Example 4: Graph from Slope and y-Intercept'],
  ['math.im1.example.4.3.016', 5, 'Example 5: Graph Linear Functions'],
  ['math.im1.example.4.3.017', 6, 'Example 6: Graph Linear Functions'],
  ['math.im1.example.4.3.018', 7, 'Example 7: Equation, Graph, and Evaluation'],
] as const;
const skills = [
  ['math.im1.skill.4.3.write-slope-intercept-equations-from-slope-and-y-intercept', 'Write linear equations in slope-intercept form from a slope and y-intercept', ['math.im1.example.4.3.012']],
  ['math.im1.skill.4.3.rewrite-standard-form-equations-in-slope-intercept-form', 'Rewrite linear equations from standard form into slope-intercept form', ['math.im1.example.4.3.013']],
  ['math.im1.skill.4.3.model-contexts-with-slope-intercept-equations-and-interpret-parameters', 'Model real-world situations with slope-intercept equations and interpret slope and intercept', ['math.im1.example.4.3.014', 'math.im1.example.4.3.018']],
  ['math.im1.skill.4.3.graph-linear-functions-from-slope-intercept-or-standard-form', 'Graph linear functions given in slope-intercept form or standard form', ['math.im1.example.4.3.015', 'math.im1.example.4.3.016', 'math.im1.example.4.3.017', 'math.im1.example.4.3.018']],
] as const;

describe('Lesson 4-3 source capabilities', () => {
  it('corrects each retained worked-example title without changing its identity', () => {
    expect(source).toContain("## Today's Goals");
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.4.3.'));
      expect(examples.map(([id]) => rows.find((node) => node.id === id))
        .map((node) => [node?.id, node?.metadata.exampleNumber, node?.title])).toEqual(examples);
      expect(rows).toHaveLength(examples.length);
    }
  });

  it('adds identical draft and inactive source-capability rows to all node catalogs', () => {
    for (const [id, title] of skills) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft')).toBe(true);
      expect(copies.every((node) => node?.independentPracticeReady === false)).toBe(true);
      expect(copies[1]).toEqual(copies[0]);
      expect(copies[2]).toEqual(copies[0]);
      expect(copies[3]).toEqual(copies[0]);
    }
  });

  it('uses only direct demonstrations and adds no renderer or inferred relationship', () => {
    for (const [id, _title, sourceNodeIds] of skills) {
      expect(blueprintCatalog.blueprints.find((row) => row.nodeId === id)).toEqual({
        nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft',
        metadata: { course: 'im1', module: '4', lesson: '3' },
      });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([
        expect.objectContaining({ type: 'contains', sourceId: lessonId, targetId: id, reviewStatus: 'draft' }),
      ]);
    }
  });
});
