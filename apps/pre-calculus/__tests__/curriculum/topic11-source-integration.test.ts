import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { projectActivityMap, projectSrsInputs } from '@math-platform/knowledge-space-practice';
import { knowledgeSpaceNodeSchema } from '@math-platform/knowledge-space-core/schemas';

const graphRoot = path.resolve(__dirname, '../../curriculum/skill-graph');
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(graphRoot, `${name}.json`), 'utf8'));
const prefix = 'math.precalc.skill.1.1.';
const legacy = `${prefix}describe-covariation-in-tandem-change`;
const direction = `${prefix}identify-intervals-of-increase-decrease-from-graphs`;
const context = `${prefix}select-a-graph-that-models-a-physical-context`;
const sign = `${prefix}identify-function-sign-on-intervals-from-graphs`;
const rate = `${prefix}determine-rate-of-change-sign-from-graphs`;
const concavity = `${prefix}identify-rate-change-and-concavity-on-intervals`;
const capabilities = [direction, context, sign, rate, concavity];
const exampleId = (number: number) => `math.precalc.example.1.1.${String(number).padStart(3, '0')}`;

describe('Topic 1.1 source integration', () => {
  it('preserves the legacy identity as rejected and keeps five distinct draft capabilities', () => {
    for (const name of ['nodes', 'draft-nodes', 'edges', 'standard-edges']) {
      const nodes = read(name).nodes;
      expect(nodes.filter((node: any) => node.id === legacy)).toHaveLength(1);
      for (const node of nodes.filter((row: any) => row.id.startsWith(prefix) || row.id.startsWith('math.precalc.example.1.1.'))) {
        expect(knowledgeSpaceNodeSchema.safeParse(node).success, node.id).toBe(true);
      }
      expect(nodes.find((node: any) => node.id === legacy)).toMatchObject({ reviewStatus: 'rejected', independentPracticeReady: false });
      for (const id of capabilities) {
        expect(nodes.filter((node: any) => node.id === id)).toHaveLength(1);
        expect(nodes.find((node: any) => node.id === id)).toMatchObject({ kind: 'skill', reviewStatus: 'draft', independentPracticeReady: false });
      }
      for (let number = 1; number <= 12; number += 1) {
        expect(nodes.find((node: any) => node.id === exampleId(number))).toMatchObject({ kind: 'worked_example', reviewStatus: 'draft' });
      }
    }
  });

  it('maps explicit source actions without an equivalence or legacy evidence transfer', () => {
    const edges = read('edges').edges;
    const mappings: Array<[string, number[]]> = [
      [context, [1]], [direction, [2, 3, 4, 5, 8, 9, 10, 11]],
      [sign, [3, 4, 5, 10]], [rate, [6, 12]], [concavity, [3, 4, 7, 8, 11, 12]],
    ];
    for (const [id, examples] of mappings) {
      const support = edges.filter((edge: any) => edge.type === 'supports' && edge.targetId === id);
      expect(support.map((edge: any) => edge.sourceId).sort()).toEqual(examples.map(exampleId).sort());
      expect(support.every((edge: any) => edge.reviewStatus === 'draft')).toBe(true);
      expect(edges).toContainEqual(expect.objectContaining({ sourceId: 'math.precalc.lesson.1.1', targetId: id, type: 'contains', reviewStatus: 'draft' }));
    }
    expect(edges.some((edge: any) => edge.sourceId === legacy || edge.targetId === legacy)).toBe(false);
    expect(edges.some((edge: any) => edge.type === 'equivalent_to' && (capabilities.includes(edge.sourceId) || capabilities.includes(edge.targetId)))).toBe(false);
  });

  it('keeps source-only drafts out of activities and derives inactive SRS planning rows', () => {
    const nodes = read('nodes').nodes;
    const edges = read('edges').edges;
    const blueprints = read('blueprints').blueprints;
    expect(blueprints.some((blueprint: any) => blueprint.nodeId === legacy)).toBe(false);
    for (const id of capabilities) {
      const blueprint = blueprints.find((row: any) => row.nodeId === id);
      expect(blueprint).toMatchObject({ reviewStatus: 'draft' });
      expect(blueprint.sourceNodeIds.length).toBeGreaterThan(0);
      expect(JSON.stringify(blueprint)).not.toMatch(/STUB|See curriculum|"Step 1"|"Hint 1"/);
    }
    const selected = (row: { nodeId: string }) => row.nodeId.startsWith(prefix);
    const activities = projectActivityMap(nodes, edges, blueprints).filter(selected);
    const planning = projectSrsInputs(nodes, edges, blueprints).filter(selected);
    expect(planning).toHaveLength(6);
    expect(planning.every((row) => row.generatorReady === false)).toBe(true);
    expect(activities.some((row) => row.nodeId === legacy || row.srsEligible)).toBe(false);
    for (const id of [sign, rate, concavity]) expect(activities.some((row) => row.nodeId === id)).toBe(false);
    const combined = read('projection/practice-v1-activity-map');
    expect(combined.activities.filter(selected)).toEqual(JSON.parse(JSON.stringify(activities)));
    expect(combined.srsInputs.filter(selected)).toEqual(JSON.parse(JSON.stringify(planning)));
    expect(read('projection/srs-input').inputs.filter(selected)).toEqual(JSON.parse(JSON.stringify(planning)));
    expect(combined.teacherEvidence.standards.some((row: any) => row.nodeIds.includes(legacy))).toBe(false);
    expect(combined.teacherEvidence.skills.some((row: any) => row.nodeId === legacy)).toBe(false);
    expect(combined.teacherEvidence.attemptArtifacts.some((row: any) => row.nodeId === legacy)).toBe(false);
    expect(combined.teacherEvidence.skills.filter(selected).every((row: any) => row.independentPracticeReady === false)).toBe(true);
    const sourceOnlyIds = blueprints.filter((row: any) => capabilities.includes(row.nodeId)
      && !row.workedExampleSpec && !row.guidedPracticeSpec && !row.independentPracticeSpec)
      .map((row: any) => row.nodeId).sort();
    expect(read('generator-gap-queue').items.filter(selected).map((row: any) => row.nodeId).sort()).toEqual(sourceOnlyIds);
  });
});
