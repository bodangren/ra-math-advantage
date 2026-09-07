import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import course from '../../curriculum/skill-graph/edges.json';
import alignment from '../../curriculum/skill-graph/standard-edges.json';

const expected = [...draft.nodes, ...canonical.nodes.filter(node => node.kind === 'standard')];
const byId = (nodes: typeof expected) => Object.fromEntries(nodes.map(node => [node.id, node]));

describe('IM1 embedded node source contract', () => {
  it.each([['course', course], ['alignment', alignment]] as const)('%s uses the draft and standard sources without changing review status', (_name, graph) => {
    expect(byId(graph.nodes)).toEqual(byId(expected));
    expect(new Set(graph.nodes.map(node => node.id)).size).toBe(graph.nodes.length);
  });

  it.each([['course', course], ['alignment', alignment]] as const)('%s resolves every stored edge endpoint', (_name, graph) => {
    const ids = new Set(graph.nodes.map(node => node.id));
    const dangling = graph.edges.flatMap(edge => [edge.sourceId, edge.targetId].filter(id => !ids.has(id)));
    expect([...new Set(dangling)]).toEqual([]);
  });

  it('reports actual current node, edge, and alignment confidence counts', () => {
    expect(course.meta.totalNodes).toBe(course.nodes.length);
    expect(course.meta.totalEdges).toBe(course.edges.length);
    expect(alignment.metadata.alignmentStats.totalEdges).toBe(alignment.edges.length);
    expect(alignment.metadata.alignmentStats.highConfidence).toBe(alignment.edges.filter(edge => edge.confidence === 'high').length);
    expect(alignment.metadata.alignmentStats.mediumConfidence).toBe(alignment.edges.filter(edge => edge.confidence === 'medium').length);
    expect(alignment.metadata.alignmentStats.lowConfidence).toBe(alignment.edges.filter(edge => edge.confidence === 'low').length);
  });
});
