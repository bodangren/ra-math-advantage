import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { projectActivityMap, projectSrsInputs } from '@math-platform/knowledge-space-practice';
const root = path.join(process.cwd(), 'curriculum/skill-graph');
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(root, file + '.json'), 'utf8'));
const draftActivityNodeIds = [
  'math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs',
  'math.precalc.skill.1.2.compare-rates-of-change-across-intervals',
  'math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change',
  'math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics',
  'math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs',
  'math.precalc.skill.1.2.model-negative-rate-contexts',
  'math.precalc.skill.1.3.classify-linear-vs-quadratic-from-rate-patterns',
  'math.precalc.skill.1.3.determine-concavity-from-rate-of-change',
  'math.precalc.skill.1.4.describe-rate-of-change-behavior-on-intervals',
  'math.precalc.skill.1.4.determine-end-behavior-from-leading-term',
  'math.precalc.skill.1.4.identify-polynomial-degree-and-leading-coefficient',
  'math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs',
  'math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs',
  'math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form',
  'math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts',
  'math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations',
] as const;
function validateBlueprintLifecycle(blueprint: any, nodes: any[], activities: any[], srsInputs: any[]) {
  const modeSpecs = [blueprint.workedExampleSpec, blueprint.guidedPracticeSpec, blueprint.independentPracticeSpec];
  const isSourceOnly = modeSpecs.every((spec) => spec === undefined);
  if (isSourceOnly) {
    const node = nodes.find((candidate) => candidate.id === blueprint.nodeId);
    expect(blueprint.reviewStatus, blueprint.nodeId).toBe('draft');
    expect(node, blueprint.nodeId).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
    expect(blueprint.sourceNodeIds.length, blueprint.nodeId).toBeGreaterThan(0);
    for (const sourceId of blueprint.sourceNodeIds) expect(nodes.some((candidate) => candidate.id === sourceId)).toBe(true);
    expect(activities.some((row) => row.nodeId === blueprint.nodeId), blueprint.nodeId).toBe(false);
    const planningRows = srsInputs.filter((row) => row.nodeId === blueprint.nodeId);
    expect(planningRows.length, blueprint.nodeId).toBeGreaterThan(0);
    expect(planningRows.every((row) => row.generatorReady === false), blueprint.nodeId).toBe(true);
    return;
  }
  expect(blueprint.workedExampleSpec?.steps.length, blueprint.nodeId).toBeGreaterThan(0);
  expect(blueprint.guidedPracticeSpec?.checksPerStep.length, blueprint.nodeId).toBeGreaterThan(0);
}
describe('canonical course graph', () => {
  it('keeps every compatibility catalog consistent with canonical nodes', () => {
    const nodes = read('nodes').nodes;
    expect(new Set(nodes.map((n: any) => n.id)).size).toBe(nodes.length);
    for (const name of ['edges', 'standard-edges', 'draft-nodes']) expect(read(name).nodes).toEqual(nodes);
    const graph = read('edges');
    expect(graph.meta.totalNodes).toBe(nodes.length); expect(graph.meta.totalEdges).toBe(graph.edges.length);
    const ids = new Set(nodes.map((n: any) => n.id));
    for (const edge of graph.edges) { expect(ids.has(edge.sourceId)).toBe(true); expect(ids.has(edge.targetId)).toBe(true); }
  });
  it('keeps reviewed prerequisite relationships acyclic', () => {
    const edges = read('edges').edges.filter((edge: any) => edge.type === 'prerequisite_for');
    expect(edges.length).toBeGreaterThan(2);
    const visited = new Set<string>(), active = new Set<string>();
    const visit = (id: string) => {
      expect(active.has(id), `Prerequisite cycle at ${id}`).toBe(false);
      if (visited.has(id)) return;
      active.add(id);
      for (const edge of edges.filter((edge: any) => edge.sourceId === id)) {
        expect(edge.reviewStatus).toBe('reviewed'); visit(edge.targetId);
      }
      active.delete(id); visited.add(id);
    };
    for (const edge of edges) visit(edge.sourceId);
  });
  it('stores the current activity and SRS projections', () => {
    const nodes = read('nodes').nodes, edges = read('edges').edges, blueprints = read('blueprints').blueprints;
    expect(read('projection/practice-v1-activity-map').activities).toEqual(JSON.parse(JSON.stringify(projectActivityMap(nodes, edges, blueprints))));
    expect(read('projection/srs-input').inputs).toEqual(JSON.parse(JSON.stringify(projectSrsInputs(nodes, edges, blueprints))));
  });
  it('keeps all 32 draft Guided and Independent activity rows inactive', () => {
    const activities = read('projection/practice-v1-activity-map').activities;
    const selected = activities.filter(
      (row: any) =>
        draftActivityNodeIds.includes(row.nodeId) &&
        (row.mode === 'guided_practice' ||
          row.mode === 'independent_practice'),
    );
    expect(selected).toHaveLength(32);
    for (const nodeId of draftActivityNodeIds) {
      expect(
        selected
          .filter((row: any) => row.nodeId === nodeId)
          .map((row: any) => row.mode)
          .sort(),
      ).toEqual(['guided_practice', 'independent_practice']);
    }
    expect(selected.every((row: any) => row.srsEligible === false)).toBe(true);
  });
  it('accepts safe source-only drafts and requires substantive content for authored modes', () => {
    const nodes = read('nodes').nodes;
    const activities = read('projection/practice-v1-activity-map').activities;
    const blueprints = read('blueprints').blueprints;
    const edges = read('edges').edges;
    const srsInputs = projectSrsInputs(nodes, edges, blueprints);
    for (const blueprint of blueprints) {
      expect(JSON.stringify(blueprint), blueprint.nodeId).not.toMatch(/STUB:|See curriculum|"Hint 1"|"Step 1"/);
      validateBlueprintLifecycle(blueprint, nodes, activities, srsInputs);
    }
  });
  it('rejects unsafe source-only rows and incomplete authored modes', () => {
    const source = { id: 'source', kind: 'worked_example', reviewStatus: 'draft' };
    const draftNode = { id: 'skill', kind: 'skill', reviewStatus: 'draft', independentPracticeReady: false };
    expect(() => validateBlueprintLifecycle({ nodeId: 'skill', sourceNodeIds: ['source'], reviewStatus: 'reviewed' }, [source, draftNode], [], [])).toThrow();
    expect(() => validateBlueprintLifecycle({ nodeId: 'skill', sourceNodeIds: ['source'], reviewStatus: 'draft' }, [source, { ...draftNode, independentPracticeReady: true }], [], [])).toThrow();
    expect(() => validateBlueprintLifecycle({ nodeId: 'skill', sourceNodeIds: ['source'], reviewStatus: 'draft' }, [source, draftNode], [], [{ nodeId: 'skill', generatorReady: true }])).toThrow();
    expect(() => validateBlueprintLifecycle({ nodeId: 'skill', sourceNodeIds: ['source'], reviewStatus: 'draft', workedExampleSpec: {} }, [source, draftNode], [], [])).toThrow();
  });
});
