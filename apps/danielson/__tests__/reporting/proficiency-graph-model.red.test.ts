import { describe, expect, it } from 'vitest';

import { projectCurrentProficiency } from '../../lib/reporting/projections';
import { buildDanielsonGraph } from '../../lib/proficiency/graph';
import { buildProficiencyGraphModel } from '../../lib/reporting/proficiency-graph';

function priorities() {
  const graph = buildDanielsonGraph().graph;
  const componentBySkill = new Map(
    graph.edges
      .filter((edge) => edge.type === 'contains')
      .filter((edge) => graph.nodes.some((node) => node.id === edge.targetId && node.kind === 'skill'))
      .map((edge) => [edge.targetId, edge.sourceId]),
  );
  return graph.nodes
    .filter((node) => node.kind === 'skill')
    .map((node, index) => ({
      teacherId: 'teacher_profiles:graph',
      skillId: node.id,
      componentId: componentBySkill.get(node.id),
      due: index === 0,
      dueAt: '2026-10-28T00:00:00.000Z',
      overdueDays: index === 0 ? 4 : 0,
      currentProficiency: index === 0
        ? { rawRating: 2, points: 80, passes: false }
        : { rawRating: 3, points: 90, passes: true },
      evidenceGaps: [],
      approvedPriorityInputs: ['current_proficiency', 'due_status'],
      sourceRecordId: `observation_records:${encodeURIComponent(node.id)}`,
    }));
}

describe('teacher proficiency graph model', () => {
  it('builds a collapsed deterministic hierarchy without mutating report data', () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const snapshot = structuredClone(current);
    const first = buildProficiencyGraphModel(current);
    const second = buildProficiencyGraphModel(current);

    expect(first.nodes).toHaveLength(27);
    expect(first.edges).toHaveLength(26);
    expect(first.nodes.find((node) => node.kind === 'framework')).toMatchObject({ x: 0, y: 0 });
    expect(first.nodes.filter((node) => node.kind === 'skill')).toHaveLength(0);
    expect(first).toEqual(second);
    expect(current).toEqual(snapshot);
  });

  it('expands one component with only its direct skills and replaces the prior expansion', () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const firstComponent = current.domains[0].components[0];
    const secondComponent = current.domains[0].components[1];
    const first = buildProficiencyGraphModel(current, { expandedComponentId: firstComponent.componentId });
    const second = buildProficiencyGraphModel(current, { expandedComponentId: secondComponent.componentId });

    expect(first.nodes.filter((node) => node.kind === 'skill').map((node) => node.id))
      .toEqual(firstComponent.skills.map((skill) => skill.skillId));
    expect(first.edges.filter((edge) => edge.kind === 'contains' && edge.targetId.includes('.skill.')))
      .toHaveLength(firstComponent.skills.length);
    expect(second.nodes.some((node) => node.id === firstComponent.skills[0]?.skillId)).toBe(false);
  });

  it('projects skill status, due state, target rank, and evidence without private fields', () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const targetSkillId = current.priorityTargets[0]?.skillId;
    const component = current.domains
      .flatMap((domain) => domain.components)
      .find((candidate) => candidate.skills.some((skill) => skill.skillId === targetSkillId));
    if (!component) throw new Error('priority target component missing');
    const model = buildProficiencyGraphModel(current, { expandedComponentId: component.componentId });
    const skill = model.nodes.find((node) => node.kind === 'skill');

    expect(skill).toMatchObject({
      state: 'below_proficient',
      due: true,
      overdueDays: 4,
      sourceRecordId: expect.stringContaining('observation_records:'),
    });
    expect(skill).toHaveProperty('priorityRank');
    expect(skill).not.toHaveProperty('comment');
    expect(skill).not.toHaveProperty('response');
  });

  it('computes bounds from the deterministic node positions', () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const model = buildProficiencyGraphModel(current);

    expect(model.bounds.minX).toBeLessThan(model.bounds.maxX);
    expect(model.bounds.minY).toBeLessThan(model.bounds.maxY);
    expect(model.bounds.width).toBe(model.bounds.maxX - model.bounds.minX);
    expect(model.bounds.height).toBe(model.bounds.maxY - model.bounds.minY);
  });
});
