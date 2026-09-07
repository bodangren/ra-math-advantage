import { describe, expect, it } from 'vitest';
import nodesDocument from '../../curriculum/skill-graph/nodes.json';
import draftNodesDocument from '../../curriculum/skill-graph/draft-nodes.json';
import edgesDocument from '../../curriculum/skill-graph/edges.json';
import blueprintsDocument from '../../curriculum/skill-graph/blueprints.json';

const newSkills = [
  ['math.im1.skill.1.1.evaluate-numerical-expressions-accurately-using-the-order-of', '1'],
  ['math.im1.skill.1.2.evaluate-algebraic-expressions-by-substituting-given-values', '2'],
  ['math.im1.skill.1.3.use-the-commutative-associative-identity-and-inverse-propert', '3'],
  ['math.im1.skill.1.4.use-the-distributive-property-to-simplify-algebraic-expressi', '4'],
  ['math.im1.skill.1.5.evaluate-absolute-value-expressions-by-substituting-given-va', '5'],
  ['math.im1.skill.1.6.determine-a-reasonable-level-of-accuracy-when-performing-mul', '6'],
] as const;

describe('IM1 Module 1 graph source coverage', () => {
  it('includes each omitted scheduled objective as a draft skill in all node copies', () => {
    for (const [id] of newSkills) {
      const canonicalRows = nodesDocument.nodes.filter((node) => node.id === id);
      const draftRows = draftNodesDocument.nodes.filter((node) => node.id === id);
      const embeddedRows = edgesDocument.nodes.filter((node) => node.id === id);

      expect(canonicalRows, id).toHaveLength(1);
      expect(draftRows, id).toHaveLength(1);
      expect(embeddedRows, id).toHaveLength(1);
      expect(draftRows[0]).toEqual(canonicalRows[0]);
      expect(embeddedRows[0]).toEqual(canonicalRows[0]);
      expect(canonicalRows[0]).toMatchObject({ kind: 'skill', reviewStatus: 'draft' });
      expect(canonicalRows[0]?.sourceRefs).toContain('apps/integrated-math-1/curriculum/module-1-class-period-plan.md');
      expect(canonicalRows[0]).not.toMatchObject({ independentPracticeReady: true });
    }
  });

  it('contains each new skill in its exact lesson without inferred prerequisites', () => {
    for (const [id, lesson] of newSkills) {
      const incoming = edgesDocument.edges.filter((edge) => edge.targetId === id);
      expect(incoming).toEqual([
        expect.objectContaining({
          type: 'contains',
          sourceId: `math.im1.lesson.1.${lesson}`,
          reviewStatus: 'draft',
        }),
      ]);
    }
  });

  it('maps the six existing objective blueprints to their current exact examples', () => {
    const expected = new Map([
      ['math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express', ['math.im1.example.1.1.001', 'math.im1.example.1.1.002']],
      ['math.im1.skill.1.2.translate-between-algebraic-expressions-and-verbal-expressio', ['math.im1.example.1.2.007', 'math.im1.example.1.2.008', 'math.im1.example.1.2.009']],
      ['math.im1.skill.1.3.identify-and-apply-the-reflexive-symmetric-and-transitive-pr', ['math.im1.example.1.3.013', 'math.im1.example.1.3.014', 'math.im1.example.1.3.015']],
      ['math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume', ['math.im1.example.1.4.019', 'math.im1.example.1.4.020']],
      ['math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista', ['math.im1.example.1.5.026']],
      ['math.im1.skill.1.6.use-ratios-and-percentages-as-metrics-to-model-real-world-si', ['math.im1.example.1.6.030', 'math.im1.example.1.6.031', 'math.im1.example.1.6.032']],
    ]);

    for (const [nodeId, sourceNodeIds] of expected) {
      expect(blueprintsDocument.blueprints.find((row) => row.nodeId === nodeId)?.sourceNodeIds).toEqual(sourceNodeIds);
      for (const sourceNodeId of sourceNodeIds) {
        const sourceRows = nodesDocument.nodes.filter((node) => node.id === sourceNodeId);
        expect(sourceRows, sourceNodeId).toHaveLength(1);
        expect(sourceRows[0]?.kind).toBe('worked_example');
        expect(sourceRows[0]?.metadata?.lesson).toBe(nodeId.split('.')[4]);
      }
    }
  });
});
