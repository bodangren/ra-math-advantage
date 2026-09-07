import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import nodes from '@/curriculum/skill-graph/nodes.json';
import embedded from '@/curriculum/skill-graph/draft-nodes.json';
import blueprints from '@/curriculum/skill-graph/blueprints.json';
import edges from '@/curriculum/skill-graph/edges.json';

const prefix = 'math.im1.skill.3.2.';
const oldId = `${prefix}evaluate-functions-using-function-notation-for-numerical-and`;
const targets = [
  [`${prefix}evaluate-functions-at-numerical-inputs`, 'math.im1.example.3.2.008', 'f(4) = 3(4) + 2 = 14'],
  [`${prefix}evaluate-functions-at-algebraic-inputs`, 'math.im1.example.3.2.008', 'g(3b) = (3b)^2 - (3b) = 9b^2 - 3b'],
  [`${prefix}interpret-function-values-in-context`, 'math.im1.example.3.2.009', 'monthly cost for 3 phones is 275 dollars'],
];

describe('IM1 function evaluation capability boundaries', () => {
  it('preserves the legacy objective as a draft aggregate without Independent readiness', () => {
    expect(nodes.nodes.find((node) => node.id === oldId)).toMatchObject({
      reviewStatus: 'draft', independentPracticeReady: false,
      metadata: { taxonomyRole: 'legacy_objective_aggregator' },
    });
  });

  it('gives each assessed operation a stable draft identity and exact source example', () => {
    const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-3-lesson-2'), 'utf8');
    for (const [id, example, excerpt] of targets) {
      expect(source).toContain(excerpt);
      const node = nodes.nodes.find((row) => row.id === id);
      expect(node).toMatchObject({ kind: 'skill', reviewStatus: 'draft', independentPracticeReady: false });
      expect(embedded.nodes.find((row) => row.id === id)).toEqual(node);
      expect(blueprints.blueprints.find((row) => row.nodeId === id)).toMatchObject({
        sourceNodeIds: [example], reviewStatus: 'draft',
      });
    }
  });

  it('keeps source-only capabilities out of generated practice and inferred prerequisite chains', () => {
    for (const [id] of targets) {
      const blueprint = blueprints.blueprints.find((row) => row.nodeId === id);
      expect(blueprint).toBeDefined();
      expect(blueprint).not.toHaveProperty('rendererKey');
      expect(blueprint).not.toHaveProperty('workedExampleSpec');
      expect(blueprint).not.toHaveProperty('guidedPracticeSpec');
      expect(blueprint).not.toHaveProperty('independentPracticeSpec');
      expect(edges.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([
        expect.objectContaining({ type: 'contains', sourceId: 'math.im1.lesson.3.2', targetId: id, reviewStatus: 'draft' }),
      ]);
      for (const file of ['practice-v1-activity-map.json', 'srs-input.json', 'teacher-evidence-map.json']) {
        expect(readFileSync(resolve(import.meta.dirname, '../../curriculum/skill-graph/projection', file), 'utf8')).not.toContain(id);
      }
      expect(edges.edges.find((edge) => edge.type === 'contains'
        && edge.sourceId === 'math.im1.lesson.3.2' && edge.targetId === id)).toMatchObject({ reviewStatus: 'draft' });
    }
  });
});
