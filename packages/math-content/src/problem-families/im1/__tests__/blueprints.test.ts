// These checks verify catalog structure. They do not prove usable student practice.
// Source-only candidates remain visible as gaps. App tests verify actual rendering.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  knowledgeBlueprintSchema,
  projectActivityMap,
  type KnowledgeBlueprint,
} from '@math-platform/knowledge-space-practice';
import { IM1_GENERATORS } from '../generators';
import { VERTICAL_SLICE_MODULE } from '../vertical-slice';

const root = resolve(import.meta.dirname, '../../../../../../apps/integrated-math-1/curriculum/skill-graph');
const blueprints = JSON.parse(readFileSync(resolve(root, 'blueprints.json'), 'utf8')).blueprints as KnowledgeBlueprint[];
const { nodes } = JSON.parse(readFileSync(resolve(root, 'nodes.json'), 'utf8')) as {
  nodes: Parameters<typeof projectActivityMap>[0];
};
const moduleRows = blueprints.filter(row => row.metadata.module === VERTICAL_SLICE_MODULE);
const registeredNodes = new Set(IM1_GENERATORS.flatMap(entry => entry.nodeIds));
const registeredRows = moduleRows.filter(row => registeredNodes.has(row.nodeId));
const sourceOnlyRows = moduleRows.filter(row => !registeredNodes.has(row.nodeId));

describe('IM1 registered blueprint structure', () => {
  it('has one exact-node blueprint for each registered generator binding', () => {
    expect(IM1_GENERATORS.length).toBeGreaterThan(0);
    expect(registeredRows.map(row => row.nodeId).sort()).toEqual([...registeredNodes].sort());
    for (const entry of IM1_GENERATORS) {
      for (const id of entry.nodeIds) {
        const row = registeredRows.find(row => row.nodeId === id)!;
        expect(row.generatorKey).toBe(entry.skillIdKey);
      }
    }
  });

  it('validates the three mode specifications for each registered binding', () => {
    for (const row of registeredRows) {
      const parsed = knowledgeBlueprintSchema.parse(row);
      expect(parsed.workedExampleSpec).toBeDefined();
      expect(parsed.guidedPracticeSpec).toBeDefined();
      expect(parsed.independentPracticeSpec).toBeDefined();
      expect(Object.keys(parsed.independentPracticeSpec!.answerSchema).length).toBeGreaterThan(0);
      expect(parsed.independentPracticeSpec!.gradingRules.length).toBeGreaterThan(0);
    }
  });

  it('projects the three modes on their exact owning capability', () => {
    const modes = ['worked_example', 'guided_practice', 'independent_practice'];
    for (const row of registeredRows) {
      const parsed = knowledgeBlueprintSchema.parse(row);
      const projected = projectActivityMap(nodes, [], [parsed]);
      expect(projected.map(activity => activity.mode)).toEqual(modes);
      expect(projected.map(activity => activity.stableActivityId)).toEqual(modes.map(mode => `${row.nodeId}.${mode}`));
      expect(projected.every(activity => activity.nodeId === row.nodeId)).toBe(true);
      for (const activity of projected) {
        const spec = activity.mode === 'worked_example' ? parsed.workedExampleSpec!
          : activity.mode === 'guided_practice' ? parsed.guidedPracticeSpec!
          : parsed.independentPracticeSpec!;
        if (spec.rendererProps) expect(activity.props).toEqual(spec.rendererProps);
        else expect(Object.keys(activity.props).length).toBeGreaterThan(0);
        if (parsed.reviewStatus !== 'approved') expect(activity.srsEligible).toBe(false);
      }
    }
  });

  it('keeps source-only candidates explicit and does not project empty practice', () => {
    expect(sourceOnlyRows.length).toBeGreaterThan(0);
    for (const row of sourceOnlyRows) {
      expect(row.generatorKey).toBeUndefined();
      expect(row.workedExampleSpec).toBeUndefined();
      expect(row.guidedPracticeSpec).toBeUndefined();
      expect(row.independentPracticeSpec).toBeUndefined();
      expect(row.reviewStatus).toBe('draft');
    }
    expect(projectActivityMap(nodes, [], sourceOnlyRows)).toEqual([]);
  });
});
