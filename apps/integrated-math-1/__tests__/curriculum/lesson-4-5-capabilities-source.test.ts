import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import blueprintCatalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-5'), 'utf8');
const lessonId = 'math.im1.lesson.4.5';
const examples = [
  ['math.im1.example.4.5.027', 1, 'Example 1: Determine Whether a Sequence Is Arithmetic'],
  ['math.im1.example.4.5.028', 2, 'Example 2: Find the Common Difference and Next Three Terms'],
  ['math.im1.example.4.5.029', 3, 'Example 3: Write an Equation and Find the 7th Term'],
  ['math.im1.example.4.5.030', 4, 'Example 4: Model Real-World Situations with Arithmetic Sequences'],
] as const;
const skills = [
  ['math.im1.skill.4.5.find-the-common-difference-of-an-arithmetic-sequence', 'Find the common difference of an arithmetic sequence', ['math.im1.example.4.5.028']],
  ['math.im1.skill.4.5.extend-an-arithmetic-sequence', 'Extend an arithmetic sequence using its common difference', ['math.im1.example.4.5.028']],
  ['math.im1.skill.4.5.write-an-explicit-equation-for-an-arithmetic-sequence', 'Write an explicit equation for an arithmetic sequence', ['math.im1.example.4.5.029']],
  ['math.im1.skill.4.5.use-an-explicit-equation-to-find-a-sequence-term', 'Use an explicit equation to find a specified term of an arithmetic sequence', ['math.im1.example.4.5.029']],
  ['math.im1.skill.4.5.model-a-real-world-situation-with-an-arithmetic-sequence', 'Model a real-world situation with an arithmetic sequence', ['math.im1.example.4.5.030']],
  ['math.im1.skill.4.5.graph-an-arithmetic-sequence-as-a-discrete-function', 'Graph an arithmetic sequence as a discrete function', ['math.im1.example.4.5.030']],
  ['math.im1.skill.4.5.answer-contextual-questions-with-an-arithmetic-sequence-model', 'Answer contextual questions with an arithmetic sequence model', ['math.im1.example.4.5.030']],
] as const;

describe('Lesson 4-5 source capabilities', () => {
  it('indexes the cooler model from the amount before the first cup', () => {
    expect(source).toContain('f(0) = 128');
    expect(source).toContain('f(n) = 128 - 4n, \\quad 0 \\le n \\le 32');
    expect(source).toContain('f(1) = 124');
    expect(source).toContain('f(14) = 128 - 4(14) = 72');
    expect(source).not.toContain('f(14) = 132 - 4(14)');
  });

  it('corrects each retained worked-example title without changing its identity', () => {
    expect(source).toContain("## Today's Goals");
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.4.5.'));
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

  it('uses only direct source sections and adds only lesson containment', () => {
    for (const [id, _title, sourceNodeIds] of skills) {
      expect(blueprintCatalog.blueprints.find((row) => row.nodeId === id)).toEqual({
        nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft',
        metadata: { course: 'im1', module: '4', lesson: '5' },
      });
      const incident = graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id);
      expect(incident).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: lessonId, targetId: id, reviewStatus: 'draft' }));
      const allowedLessons = id.endsWith('extend-an-arithmetic-sequence') || id.endsWith('write-an-explicit-equation-for-an-arithmetic-sequence')
        ? [lessonId, 'math.im1.lesson.8.6'] : [lessonId];
      expect(incident.every((edge) => edge.type === 'contains' && allowedLessons.includes(edge.sourceId))).toBe(true);
      expect(incident).toHaveLength(allowedLessons.length);
      expect(incident.map((edge) => edge.sourceId).sort()).toEqual(allowedLessons.sort());
    }
  });
});
