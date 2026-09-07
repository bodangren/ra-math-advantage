import { describe, expect, it } from 'vitest';
import type { KnowledgeSpaceEdge, KnowledgeSpaceNode, ReviewStatus } from '@math-platform/knowledge-space-core';
import { projectSrsInputs } from '../projections/srs';
import { projectTeacherEvidence } from '../projections/teacher-evidence';

function skill(id: string, reviewStatus: ReviewStatus = 'approved'): KnowledgeSpaceNode {
  return { id, kind: 'skill', title: id, domain: 'synthetic', reviewStatus, metadata: {} };
}

function equivalent(sourceId: string, targetId: string, reviewStatus: ReviewStatus = 'approved'): KnowledgeSpaceEdge {
  return { id: `${sourceId}:${targetId}`, type: 'equivalent_to', sourceId, targetId, reviewStatus, weight: 1, confidence: 'high' };
}

describe('accepted equivalence in learning projections', () => {
  it.each(['draft', 'reviewed', 'rejected'] as const)('does not turn a %s suggestion into learner identity', (status) => {
    const nodes = [skill('course-a.skill'), skill('course-b.skill')];
    const edges = [equivalent(nodes[0].id, nodes[1].id, status)];

    expect(projectSrsInputs(nodes, edges, []).map((row) => row.equivalentNodeIds)).toEqual([[], []]);
    const teacher = projectTeacherEvidence(nodes, edges);
    expect(teacher.skills.map((row) => row.equivalentNodeIds)).toEqual([[], []]);
    expect(teacher.equivalentComponents).toEqual([]);
    expect(teacher.skills.map((row) => row.nodeId)).toEqual(nodes.map((node) => node.id));
  });

  it.each(['draft', 'reviewed', 'rejected'] as const)('does not infer identity through a %s endpoint', (status) => {
    const nodes = [skill('course-a.skill'), skill('course-b.skill', status)];
    const edges = [equivalent(nodes[0].id, nodes[1].id)];
    expect(projectSrsInputs(nodes, edges, []).every((row) => row.equivalentNodeIds.length === 0)).toBe(true);
    const teacher = projectTeacherEvidence(nodes, edges);
    expect(teacher.skills.every((row) => row.equivalentNodeIds.length === 0)).toBe(true);
    expect(teacher.equivalentComponents).toEqual([]);
  });

  it('keeps an approved skill relationship bidirectional without linking a draft bridge', () => {
    const nodes = [skill('course-a.skill'), skill('course-b.skill'), skill('course-c.skill')];
    const edges = [equivalent(nodes[0].id, nodes[1].id), equivalent(nodes[1].id, nodes[2].id, 'draft')];
    const srs = projectSrsInputs(nodes, edges, []);
    expect(srs.map((row) => row.equivalentNodeIds)).toEqual([[nodes[1].id], [nodes[0].id], []]);
    const teacher = projectTeacherEvidence(nodes, edges);
    expect(teacher.skills.map((row) => row.equivalentNodeIds)).toEqual([[nodes[1].id], [nodes[0].id], []]);
    expect(teacher.equivalentComponents.map((group) => group.nodeIds)).toEqual([[nodes[0].id, nodes[1].id]]);
    expect(teacher.equivalentComponents[0].edgeCount).toBe(1);
  });

  it('does not use a worked example, concept, or missing node as a skill identity', () => {
    const nodes: KnowledgeSpaceNode[] = [skill('course-a.skill'), { ...skill('course-b.example'), kind: 'worked_example' }, { ...skill('course-b.concept'), kind: 'concept' }];
    const edges = ['course-b.example', 'course-b.concept', 'course-b.missing'].map((id) => equivalent(nodes[0].id, id));
    expect(projectSrsInputs(nodes, edges, [])[0].equivalentNodeIds).toEqual([]);
    const teacher = projectTeacherEvidence(nodes, edges);
    expect(teacher.skills[0].equivalentNodeIds).toEqual([]);
    expect(teacher.equivalentComponents).toEqual([]);
  });
});
