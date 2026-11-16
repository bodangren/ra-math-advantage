import { describe, expect, it } from 'vitest';
import type { KnowledgeSpaceEdge, KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';
import {
  includeHistoricalEvidenceNodes,
  loadFullCurriculumGraph,
  projectApprovedReadinessGraph,
} from '@/lib/curriculum/skill-graph-loader';

const node = (id: string, reviewStatus: KnowledgeSpaceNode['reviewStatus'] = 'approved', kind: KnowledgeSpaceNode['kind'] = 'skill'): KnowledgeSpaceNode => ({
  id, kind, reviewStatus, title: id, domain: 'test', metadata: {},
});

const edge = (sourceId: string, targetId: string, reviewStatus: KnowledgeSpaceEdge['reviewStatus']): KnowledgeSpaceEdge => ({
  id: `${sourceId}->${targetId}:${reviewStatus}`,
  type: 'prerequisite_for', sourceId, targetId, reviewStatus,
  weight: 1, confidence: 'high',
});

describe('IM3 approved readiness graph boundary', () => {
  it('returns no eligible skill for the current all-candidate IM3 graph', () => {
    const graph = projectApprovedReadinessGraph(loadFullCurriculumGraph());
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  it('keeps a true approved root and ignores a rejected prerequisite', () => {
    const root = node('root');
    const rejectedSource = node('rejected-source', 'draft');
    const graph = projectApprovedReadinessGraph({
      nodes: [root, rejectedSource],
      edges: [edge(rejectedSource.id, root.id, 'rejected')],
    });
    expect(graph.nodes.map((item) => item.id)).toEqual(['root']);
    expect(graph.edges).toEqual([]);
  });

  it.each(['draft', 'reviewed'] as const)('quarantines a target with a %s prerequisite', (status) => {
    const source = node('source');
    const target = node('target');
    const graph = projectApprovedReadinessGraph({ nodes: [source, target], edges: [edge(source.id, target.id, status)] });
    expect(graph.nodes.map((item) => item.id)).toEqual(['source']);
  });

  it('quarantines malformed approved targets and propagates quarantine to descendants', () => {
    const root = node('root');
    const target = node('target');
    const descendant = node('descendant');
    const graph = projectApprovedReadinessGraph({
      nodes: [root, target, descendant],
      edges: [edge('missing', target.id, 'approved'), edge(target.id, descendant.id, 'approved')],
    });
    expect(graph.nodes.map((item) => item.id)).toEqual(['root']);
    expect(graph.edges).toEqual([]);
  });

  it('keeps a closed approved prerequisite path', () => {
    const source = node('source');
    const target = node('target');
    const accepted = edge(source.id, target.id, 'approved');
    const graph = projectApprovedReadinessGraph({ nodes: [source, target, node('draft', 'draft')], edges: [accepted] });
    expect(graph.nodes.map((item) => item.id)).toEqual(['source', 'target']);
    expect(graph.edges).toEqual([accepted]);
  });

  it('adds an evidenced historical node without restoring its edges', () => {
    const root = node('root');
    const historical = node('historical', 'draft');
    const full = { nodes: [root, historical], edges: [edge(historical.id, root.id, 'draft')] };
    const readiness = projectApprovedReadinessGraph(full);
    const presentation = includeHistoricalEvidenceNodes(readiness, full, new Set([historical.id]));
    expect(presentation.nodes.map((item) => item.id)).toEqual(['historical']);
    expect(presentation.edges).toEqual([]);
  });
});
