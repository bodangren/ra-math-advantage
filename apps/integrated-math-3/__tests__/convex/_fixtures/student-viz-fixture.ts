import type {
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
} from '@math-platform/knowledge-space-core';

/**
 * Minimal frozen knowledge-space slice for the Phase 2 backend-exposure
 * tests. Four skill nodes + two prerequisite edges give a deterministic
 * ready/blocked partition and a small `recommendedNext` ranking.
 *
 * Per test-strategy.md §2, this fixture is sliced from the IM3 M1 graph
 * shape but uses synthetic IDs so the backend test does not couple to the
 * full 500+ node graph.
 */

export const fixtureNodes: KnowledgeSpaceNode[] = [
  {
    id: 'math.im3.test.skill.a',
    kind: 'skill',
    title: 'Test skill A',
    domain: 'math.im3.test',
    reviewStatus: 'draft',
    metadata: {},
    difficulty: 0.3,
  },
  {
    id: 'math.im3.test.skill.b',
    kind: 'skill',
    title: 'Test skill B',
    domain: 'math.im3.test',
    reviewStatus: 'draft',
    metadata: {},
    difficulty: 0.5,
  },
  {
    id: 'math.im3.test.skill.c',
    kind: 'skill',
    title: 'Test skill C',
    domain: 'math.im3.test',
    reviewStatus: 'draft',
    metadata: {},
    difficulty: 0.7,
  },
  {
    id: 'math.im3.test.skill.d',
    kind: 'skill',
    title: 'Test skill D',
    domain: 'math.im3.test',
    reviewStatus: 'draft',
    metadata: {},
    difficulty: 0.4,
  },
];

export const fixtureEdges: KnowledgeSpaceEdge[] = [
  {
    id: 'math.im3.test.edge.a-to-c',
    type: 'prerequisite_for',
    sourceId: 'math.im3.test.skill.a',
    targetId: 'math.im3.test.skill.c',
    weight: 0.8,
    confidence: 'high',
    reviewStatus: 'draft',
  },
  {
    id: 'math.im3.test.edge.b-to-c',
    type: 'prerequisite_for',
    sourceId: 'math.im3.test.skill.b',
    targetId: 'math.im3.test.skill.c',
    weight: 0.8,
    confidence: 'high',
    reviewStatus: 'draft',
  },
];

export const fixtureLearnerState: Record<
  string,
  'mastered' | 'ready' | 'blocked' | 'review_due'
> = {
  'math.im3.test.skill.a': 'mastered',
  'math.im3.test.skill.b': 'ready',
};
