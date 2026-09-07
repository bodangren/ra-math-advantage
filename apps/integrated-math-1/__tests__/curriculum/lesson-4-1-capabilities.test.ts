import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import nodes from '@/curriculum/skill-graph/nodes.json';
import draft from '@/curriculum/skill-graph/draft-nodes.json';
import edges from '@/curriculum/skill-graph/edges.json';
import blueprints from '@/curriculum/skill-graph/blueprints.json';

const graphId = 'math.im1.skill.4.1.graph-linear-equations-by-making-a-table-of-values-and-by-fi';
const targets = [
  ['math.im1.skill.4.1.interpret-intercepts-in-the-context-of-real-world-situations', ['math.im1.example.4.1.004']],
  ['math.im1.skill.4.1.rewrite-linear-equations-in-equivalent-forms-to-identify-int', []],
] as const;

describe('IM1 Lesson 4.1 atomic capabilities', () => {
  it('keeps graphing separate and maps each capability to exact source examples', () => {
    expect(blueprints.blueprints.find((row) => row.nodeId === graphId)?.sourceNodeIds).toEqual([
      'math.im1.example.4.1.001', 'math.im1.example.4.1.002',
    ]);
    for (const [id, sourceNodeIds] of targets) {
      const node = nodes.nodes.find((row) => row.id === id);
      expect(node).toMatchObject({ kind: 'skill', reviewStatus: 'draft', independentPracticeReady: false });
      expect(draft.nodes.find((row) => row.id === id)).toEqual(node);
      expect(edges.nodes.find((row) => row.id === id)).toEqual(node);
      expect(blueprints.blueprints.find((row) => row.nodeId === id)).toMatchObject({ sourceNodeIds, reviewStatus: 'draft' });
    }
  });

  it('keeps the new capabilities source-only and adds only draft containment', () => {
    const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-4-lesson-1'), 'utf8');
    expect(source).toContain('Interpret intercepts in the context of real-world situations modeled by linear functions.');
    expect(source).toContain('Rewrite linear equations in equivalent forms to identify intercepts and slope.');
    for (const [id] of targets) {
      const blueprint = blueprints.blueprints.find((row) => row.nodeId === id);
      expect(blueprint).not.toHaveProperty('rendererKey');
      expect(blueprint).not.toHaveProperty('workedExampleSpec');
      expect(blueprint).not.toHaveProperty('guidedPracticeSpec');
      expect(blueprint).not.toHaveProperty('independentPracticeSpec');
      expect(edges.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([
        expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.4.1', targetId: id, reviewStatus: 'draft' }),
      ]);
    }
  });
});
