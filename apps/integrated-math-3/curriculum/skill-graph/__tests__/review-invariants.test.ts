import { expect, it } from 'vitest';
import nodesDoc from '../nodes.json';
import edgesDoc from '../edges.json';
import blueprintsDoc from '../blueprints.json';
it('uses one consistent node representation', () => expect(edgesDoc.nodes).toEqual(nodesDoc.nodes));
it('contains every worked example in its declared lesson', () => {
 for (const node of nodesDoc.nodes.filter(node => node.kind === 'worked_example')) {
  const metadata = node.metadata as {module?: string; lesson?: string};
  expect(edgesDoc.edges.some(edge => edge.type === 'contains' && edge.sourceId === `math.im3.lesson.${metadata.module}.${metadata.lesson}` && edge.targetId === node.id),node.id).toBe(true);
 }
});
it('does not convert sequence alone into a prerequisite', () => {
 expect(edgesDoc.edges.filter(edge => (edge as {derivationMethod?: string}).derivationMethod === 'lesson-sequence-prerequisite-v1')).toHaveLength(0);
});
it('resolves each blueprint to existing source nodes', () => {
 const ids = new Set(nodesDoc.nodes.map(node => node.id));
 for (const blueprint of blueprintsDoc.blueprints) {
  expect(blueprint.sourceNodeIds.length,blueprint.nodeId).toBeGreaterThan(0);
  expect(blueprint.sourceNodeIds.every(id => ids.has(id))).toBe(true);
 }
});
