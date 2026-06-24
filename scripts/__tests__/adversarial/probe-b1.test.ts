import { describe, it, expect } from 'vitest';
import { projectActivityMap } from '../packages/knowledge-space-practice/src/projections/activity-map';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge, KnowledgeBlueprint } from '../packages/knowledge-space-practice/src/types';

describe('FR-13 adversarial: 5-skill concept', () => {
  it('emits exactly 5 distinct nodeId rows for a 5-skill concept', () => {
    const skills: KnowledgeSpaceNode[] = Array.from({ length: 5 }, (_, i) => ({
      id: `math.precalc.skill.unit-circle.skill-${i}`,
      kind: 'skill',
      title: `Skill ${i}`,
      reviewStatus: 'approved',
      metadata: {},
    }));
    const concept: KnowledgeSpaceNode = {
      id: 'math.precalc.concept.5skill',
      kind: 'concept',
      title: '5-skill concept',
      reviewStatus: 'approved',
      metadata: {},
    };
    const edges: KnowledgeSpaceEdge[] = skills.map((s, i) => ({
      id: `e-${i}`,
      type: 'contains',
      sourceId: concept.id,
      targetId: s.id,
      confidence: 'high',
      weight: 1,
      reviewStatus: 'approved',
    }));
    const blueprint: KnowledgeBlueprint = {
      nodeId: concept.id,
      sourceNodeIds: [],
      alignmentNodeIds: [],
      rendererKey: 'concept-explorer',
      workedExampleSpec: { prompt: 'p', givens: [], steps: [], target: { answer: 'x' }, explanation: '' } as any,
      reviewStatus: 'draft',
      metadata: {},
    };
    const rows = projectActivityMap([concept, ...skills], edges, [blueprint]);
    const distinctNodeIds = new Set(rows.map((r) => r.nodeId));
    expect(distinctNodeIds.size).toBe(5);
    for (const s of skills) {
      expect(distinctNodeIds.has(s.id)).toBe(true);
    }
  });
});
