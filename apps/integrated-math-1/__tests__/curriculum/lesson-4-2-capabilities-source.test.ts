import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import blueprintCatalog from '../../curriculum/skill-graph/blueprints.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-2'), 'utf8');
const lessonId = 'math.im1.lesson.4.2';
const examples = [
  ['math.im1.example.4.2.005', 1, 'Example 1: Find the Rate of Change from a Table'],
  ['math.im1.example.4.2.006', 2, 'Example 2: Find the Rate of Change from a Graph'],
  ['math.im1.example.4.2.007', 3, 'Example 3: Determine Whether a Function Is Linear'],
  ['math.im1.example.4.2.008', 4, 'Example 4: Determine Whether a Function Is Linear'],
  ['math.im1.example.4.2.009', 5, 'Example 5: Find the Slope Through Two Points'],
  ['math.im1.example.4.2.010', 6, 'Example 6: Find the Slope Through Two Points'],
  ['math.im1.example.4.2.source-007', 7, 'Example 7: Find the Slope Through Two Points'],
  ['math.im1.example.4.2.source-008', 8, 'Example 8: Find the Slope Through Two Points'],
  ['math.im1.example.4.2.source-009', 9, 'Example 9: Find an Unknown Coordinate Given Slope'],
  ['math.im1.example.4.2.011', 10, 'Example 10: Slope in Real-World Contexts'],
] as const;
const skills = [
  ['math.im1.skill.4.2.calculate-the-rate-of-change-from-a-table', 'Calculate the rate of change from a table', ['math.im1.example.4.2.005']],
  ['math.im1.skill.4.2.calculate-the-rate-of-change-from-a-graph', 'Calculate the rate of change from a graph', ['math.im1.example.4.2.006']],
  ['math.im1.skill.4.2.calculate-the-rate-of-change-from-real-world-data', 'Calculate the rate of change from real-world data', []],
  ['math.im1.skill.4.2.determine-whether-a-function-is-linear-by-checking-for-a-con', 'Determine whether a function is linear by checking for a constant rate of change', ['math.im1.example.4.2.007', 'math.im1.example.4.2.008']],
  ['math.im1.skill.4.2.compute-the-slope-of-a-line-passing-through-two-given-points', 'Compute the slope of a line passing through two given points', ['math.im1.example.4.2.009', 'math.im1.example.4.2.010', 'math.im1.example.4.2.source-007', 'math.im1.example.4.2.source-008']],
  ['math.im1.skill.4.2.solve-for-an-unknown-coordinate-given-two-points-and-a-targe', 'Solve for an unknown coordinate given two points and a target slope', ['math.im1.example.4.2.source-009']],
] as const;

describe('Lesson 4-2 source capabilities', () => {
  it('uses one exact identity for each worked example in all node catalogs', () => {
    for (const document of [canonical, draft, graph, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.4.2.'));
      expect(examples.map(([id]) => rows.find((node) => node.id === id))
        .map((node) => [node?.id, node?.metadata.exampleNumber, node?.title])).toEqual(examples);
      expect(rows).toHaveLength(examples.length);
      expect(source).toContain('## Example 3 and 4 — Determine Whether a Function Is Linear');
      expect(source).toContain('## Examples 5 through 8 — Find the Slope Through Two Points');
      for (const node of rows) {
        expect(node.sourceRefs[0]).toContain('curriculum/modules/module-4-lesson-2');
      }
    }
  });

  it('adds draft, inactive capability rows and exact source-only blueprints', () => {
    for (const [id, title, sourceNodeIds] of skills) {
      const copies = [canonical, draft, graph, standards].map((document) => document.nodes.find((node) => node.id === id));
      expect(copies.every(Boolean)).toBe(true);
      expect(copies.every((node) => node?.title === title && node.reviewStatus === 'draft')).toBe(true);
      expect(copies.every((node) => !node || !('independentPracticeReady' in node) || node.independentPracticeReady === false)).toBe(true);
      expect(copies[1]).toEqual(copies[0]);
      expect(copies[2]).toEqual(copies[0]);
      expect(copies[3]).toEqual(copies[0]);

      const blueprint = blueprintCatalog.blueprints.find((row) => row.nodeId === id);
      expect(blueprint).toEqual({
        nodeId: id,
        sourceNodeIds,
        alignmentNodeIds: [],
        reviewStatus: 'draft',
        metadata: { course: 'im1', module: '4', lesson: '2' },
      });
    }
  });

  it('adds only exact lesson containment for the new rows', () => {
    const ids = [...skills.map(([id]) => id), ...examples.slice(6, 9).map(([id]) => id)];
    for (const id of ids) {
      const related = graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id);
      expect(related).toHaveLength(id === 'math.im1.skill.4.2.calculate-the-rate-of-change-from-a-table' ? 2 : 1);
      expect(related).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'contains', sourceId: lessonId, targetId: id, reviewStatus: 'draft' })]));
      expect(related.every((edge) => edge.type === 'contains' && edge.targetId === id)).toBe(true);
    }
  });

  it('maps the explicit context capability only to Example 10', () => {
    const context = blueprintCatalog.blueprints.find((row) => row.nodeId === 'math.im1.skill.4.2.interpret-slope-and-rate-of-change-in-real-world-contexts-in');
    expect(context?.sourceNodeIds).toEqual(['math.im1.example.4.2.011']);
  });
});
