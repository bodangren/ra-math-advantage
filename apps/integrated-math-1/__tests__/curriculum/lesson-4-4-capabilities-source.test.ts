import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import blueprintCatalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-4'), 'utf8');
const examples = [
  ['math.im1.example.4.4.019', 1, 'Example 1: Describe Vertical Translations'],
  ['math.im1.example.4.4.020', 2, 'Example 2: Describe Horizontal Translations'],
  ['math.im1.example.4.4.021', 3, 'Example 3: Describe Combined Translations'],
  ['math.im1.example.4.4.022', 4, 'Example 4: Translations in Context'],
  ['math.im1.example.4.4.023', 5, 'Example 5: Describe Vertical Dilations'],
  ['math.im1.example.4.4.024', 6, 'Example 6: Describe Horizontal Dilations'],
  ['math.im1.example.4.4.025', 7, 'Example 7: Reflections Across the x-Axis'],
  ['math.im1.example.4.4.026', 8, 'Example 8: Reflections Across the y-Axis'],
] as const;
const skills = [
  ['math.im1.skill.4.4.describe-translations-of-linear-functions-relative-to-the-parent-function', 'Describe translations of linear functions relative to the parent function', ['math.im1.example.4.4.019', 'math.im1.example.4.4.020', 'math.im1.example.4.4.021', 'math.im1.example.4.4.022']],
  ['math.im1.skill.4.4.describe-dilations-of-linear-functions-relative-to-the-parent-function', 'Describe dilations of linear functions relative to the parent function', ['math.im1.example.4.4.023', 'math.im1.example.4.4.024']],
  ['math.im1.skill.4.4.describe-reflections-of-linear-functions-relative-to-the-parent-function', 'Describe reflections of linear functions relative to the parent function', ['math.im1.example.4.4.025', 'math.im1.example.4.4.026']],
  ['math.im1.skill.4.4.distinguish-vertical-and-horizontal-transformations-from-a-function-rule', 'Distinguish vertical and horizontal transformations from a function rule', ['math.im1.example.4.4.019', 'math.im1.example.4.4.020', 'math.im1.example.4.4.023', 'math.im1.example.4.4.024', 'math.im1.example.4.4.025', 'math.im1.example.4.4.026']],
  ['math.im1.skill.4.4.write-transformed-linear-functions-from-verbal-descriptions', 'Write transformed linear functions from verbal descriptions', []],
  ['math.im1.skill.4.4.write-transformed-linear-functions-from-real-world-contexts', 'Write transformed linear functions from real-world contexts', ['math.im1.example.4.4.022']],
] as const;

describe('Lesson 4-4 source capabilities', () => {
  it('corrects retained worked-example titles in all embedded node catalogs', () => {
    expect(source).toContain('Write transformed linear functions from verbal descriptions and real-world contexts');
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.4.4.'));
      expect(examples.map(([id]) => rows.find((node) => node.id === id))
        .map((node) => [node?.id, node?.metadata.exampleNumber, node?.title])).toEqual(examples);
      expect(rows).toHaveLength(examples.length);
    }
  });

  it('adds identical draft and inactive atomic candidates to all node catalogs', () => {
    for (const [id, title] of skills) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft')).toBe(true);
      expect(copies.every((node) => node?.independentPracticeReady === false)).toBe(true);
      expect(copies[1]).toEqual(copies[0]);
      expect(copies[2]).toEqual(copies[0]);
      expect(copies[3]).toEqual(copies[0]);
    }
  });

  it('maps only direct demonstrations and adds only lesson containment', () => {
    for (const [id, _title, sourceNodeIds] of skills) {
      expect(blueprintCatalog.blueprints.find((row) => row.nodeId === id)).toEqual({
        nodeId: id, sourceNodeIds, alignmentNodeIds: [], reviewStatus: 'draft',
        metadata: { course: 'im1', module: '4', lesson: '4' },
      });
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([
        expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.4.4', targetId: id, reviewStatus: 'draft' }),
      ]);
    }
  });
});
