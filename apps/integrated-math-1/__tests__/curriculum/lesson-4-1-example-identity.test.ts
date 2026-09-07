import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import edges from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import activities from '../../curriculum/skill-graph/projection/practice-v1-activity-map.json';
import teacher from '../../curriculum/skill-graph/projection/teacher-evidence-map.json';

const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-1'), 'utf8');
const expected = [
  ['math.im1.example.4.1.001', 'Example 1: Graph by Making a Table'],
  ['math.im1.example.4.1.002', 'Example 2: Graph Using x- and y-Intercepts'],
  ['math.im1.example.4.1.004', 'Example 3: Interpret Intercepts in Context'],
];

describe('Lesson 4-1 source example identity', () => {
  it('uses one retained identity per actual source heading in all catalogs', () => {
    for (const document of [canonical, draft, edges, standards]) {
      const rows = document.nodes.filter((node) => node.id.startsWith('math.im1.example.4.1.'));
      expect(rows.map(({ id, title }) => [id, title])).toEqual(expected);
      for (const node of rows) {
        expect(source).toContain(`## ${node.title.replace(': ', ' — ')}`);
        expect(node.sourceRefs[0]).toContain('curriculum/modules/module-4-lesson-1');
      }
    }
  });

  it('removes the duplicate from graph edges and derived teacher/activity references', () => {
    for (const document of [canonical, draft, edges, standards, activities, teacher]) {
      expect(JSON.stringify(document).includes('math.im1.example.4.1.003')).toBe(false);
    }
    for (const type of ['contains', 'appears_in_context']) {
      expect(edges.edges.filter((edge) => edge.type === type &&
        [edge.sourceId, edge.targetId].includes('math.im1.example.4.1.002'))).toHaveLength(1);
    }
  });
});
