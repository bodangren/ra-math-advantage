import { describe, expect, it } from 'vitest';

import type {
  KnowledgeSpaceEdge,
  KnowledgeSpaceNode,
  KnowledgeStateEntry,
} from '@math-platform/knowledge-space-core';
import { projectStudentVisualization } from '../projections/visualization';

function skill(id: string): KnowledgeSpaceNode {
  return {
    id,
    kind: 'skill',
    title: id,
    domain: 'test',
    sourceRefs: ['test'],
    reviewStatus: 'draft',
    metadata: {},
  };
}

function edge(sourceId: string, targetId: string, weight: number): KnowledgeSpaceEdge {
  return {
    id: `${sourceId}->${targetId}`,
    type: 'prerequisite_for',
    sourceId,
    targetId,
    weight,
    confidence: 'high',
    sourceRefs: ['test'],
    reviewStatus: 'draft',
  };
}

function state(nodeId: string, mastery: number): KnowledgeStateEntry {
  return {
    nodeId,
    mastery,
    retention: mastery,
    isProficient: mastery >= 0.9,
    state: mastery >= 0.9 ? 'mastered' : mastery > 0 ? 'inProgress' : 'untouched',
  };
}

describe('student projection canonical gated readiness', () => {
  it('uses numeric canonical knowledge state instead of binary prerequisite inference', () => {
    const nodes = [skill('A'), skill('C'), skill('D'), skill('B')];
    const edges = [
      edge('A', 'B', 1),
      edge('C', 'B', 0.5),
      edge('D', 'B', 0.5),
    ];
    const knowledgeState = new Map([
      ['A', state('A', 0.92)],
      ['C', state('C', 1)],
      ['D', state('D', 0.7)],
      ['B', state('B', 0)],
    ]);

    const result = projectStudentVisualization(nodes, edges, {}, { knowledgeState });

    expect(result.nearlyReady.map((node) => node.nodeId)).toContain('B');
    expect(result.blocked.map((node) => node.nodeId)).not.toContain('B');
  });

  it('honors the shared engine configuration in the projection', () => {
    const nodes = [skill('A'), skill('B')];
    const edges = [edge('A', 'B', 0.8)];
    const knowledgeState = new Map([
      ['A', state('A', 0.75)],
      ['B', state('B', 0)],
    ]);

    const result = projectStudentVisualization(nodes, edges, {}, {
      knowledgeState,
      masteryConfig: {
        hardGateThreshold: 0.75,
        nearThreshold: 0.7,
        readyThreshold: 0.9,
      },
    });

    expect(result.nearlyReady.map((node) => node.nodeId)).toContain('B');
  });
});
