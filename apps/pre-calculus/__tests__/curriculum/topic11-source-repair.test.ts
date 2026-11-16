import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.join(process.cwd(), 'curriculum');
const graph = path.join(root, 'skill-graph');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const json = <T>(file: string): T => JSON.parse(fs.readFileSync(path.join(graph, file), 'utf8')) as T;

const newSkills = [
  'math.precalc.skill.1.1.identify-function-sign-on-intervals-from-graphs',
  'math.precalc.skill.1.1.determine-rate-of-change-sign-from-graphs',
  'math.precalc.skill.1.1.identify-rate-change-and-concavity-on-intervals',
];
const existingSkills = [
  'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs',
  'math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context',
];

describe('Topic 1.1 source repair', () => {
  it('preserves the rejected legacy covariation identity without transferring evidence', () => {
    const legacyId = 'math.precalc.skill.1.1.describe-covariation-in-tandem-change';
    for (const file of ['nodes.json', 'draft-nodes.json', 'edges.json', 'standard-edges.json']) {
      const document = json<{ nodes: Array<Record<string, unknown>>; edges?: Array<Record<string, unknown>> }>(file);
      expect(document.nodes.find((entry) => entry.id === legacyId)).toMatchObject({
        reviewStatus: 'rejected',
        independentPracticeReady: false,
        exceptions: [expect.objectContaining({ type: 'other' })],
      });
      expect(document.edges?.some((edge) => edge.sourceId === legacyId || edge.targetId === legacyId) ?? false).toBe(false);
    }
    const blueprints = json<{ blueprints: Array<{ nodeId: string }> }>('blueprints.json').blueprints;
    expect(blueprints.some((entry) => entry.nodeId === legacyId)).toBe(false);
    const activities = json<{ activities: Array<{ nodeId: string }> }>('projection/practice-v1-activity-map.json').activities;
    expect(activities.some((entry) => entry.nodeId === legacyId)).toBe(false);
    const combined = json<{ srsInputs: Array<{ nodeId: string; generatorReady: boolean }> }>('projection/practice-v1-activity-map.json');
    const standalone = json<{ inputs: Array<{ nodeId: string; generatorReady: boolean }> }>('projection/srs-input.json');
    expect(combined.srsInputs.find((entry) => entry.nodeId === legacyId)).toMatchObject({ generatorReady: false });
    expect(standalone.inputs.find((entry) => entry.nodeId === legacyId)).toMatchObject({ generatorReady: false });
    expect(fs.readFileSync(path.join(graph, 'projection/teacher-evidence-map.json'), 'utf8')).not.toContain(legacyId);
  });
  it('restores the ten missing source examples with exact identity', () => {
    for (const file of ['nodes.json', 'draft-nodes.json', 'edges.json', 'standard-edges.json']) {
      const nodes = json<{ nodes: Array<Record<string, unknown>> }>(file).nodes;
      for (let number = 3; number <= 12; number += 1) {
        const id = `math.precalc.example.1.1.${String(number).padStart(3, '0')}`;
        const node = nodes.find((entry) => entry.id === id);
        expect(node, `${file} ${id}`).toMatchObject({ kind: 'worked_example', reviewStatus: 'draft' });
        expect((node?.metadata as { exampleNumber?: number })?.exampleNumber).toBe(number);
      }
    }
  });

  it('adds only the three source-supported draft capabilities and keeps Topic 1.1 inactive', () => {
    for (const file of ['nodes.json', 'draft-nodes.json', 'edges.json', 'standard-edges.json']) {
      const nodes = json<{ nodes: Array<Record<string, unknown>> }>(file).nodes;
      for (const id of [...existingSkills, ...newSkills]) {
        expect(nodes.find((entry) => entry.id === id)).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
      }
      expect(nodes.some((entry) => entry.id === 'math.precalc.skill.1.1.describe-covariation-from-graphs-tables-or-verbal-descriptions')).toBe(false);
      expect(nodes.some((entry) => entry.id === 'math.precalc.skill.1.1.identify-independent-dependent-domain-and-range-roles')).toBe(false);
    }
  });

  it('stores source-only blueprints and exact draft containment', () => {
    const blueprints = json<{ blueprints: Array<Record<string, unknown>> }>('blueprints.json').blueprints;
    for (const id of newSkills) {
      expect(blueprints.find((entry) => entry.nodeId === id)).toMatchObject({
        nodeId: id,
        reviewStatus: 'draft',
        independentPracticeReady: false,
      });
    }
    const edges = json<{ edges: Array<Record<string, unknown>> }>('edges.json').edges;
    for (const id of [...existingSkills, ...newSkills]) {
      expect(edges).toContainEqual(expect.objectContaining({ type: 'contains', sourceId: 'math.precalc.lesson.1.1', targetId: id, reviewStatus: 'draft' }));
    }
  });

  it('corrects source definitions, CED identity, model limits, and recovered examples', () => {
    const lesson = read('modules/unit-01-polynomial-rational/lesson-1-1/lesson.md');
    expect(lesson).toContain('The domain is the set of input values.');
    expect(lesson).toContain('The range is the set of output values.');
    expect(lesson).not.toContain('Also called the domain');
    expect(lesson).toContain('Authored extension');
    expect(lesson).toContain('approximately 2.60 seconds');
    for (let number = 1; number <= 12; number += 1) expect(lesson).toContain(`**Example ${number}:**`);
    expect(lesson).toContain('Option A is a straight increasing line.');
    expect(lesson).toContain('The graph is a smooth curve through A(0,-2), B(2,0), C(4,2), D(7,-1), E(8,-2), and F(9,-1).');
    expect(lesson).toContain('The arc from F to G is concave down.');
    expect(lesson).toContain('uses straight segments from $(0,-2)$ to $(3,4)$');
    expect(lesson).toContain('It is concave down for $-5 < x < -1$ and concave up for $-1 < x < 5$.');
    expect(lesson).toContain('(D) The rate of change is positive from E to F.');

    const topic = read('topics/unit-1-topic-1.1.md');
    expect(topic).toContain('Describe how the input and output values of a function vary together by comparing function values.');
    expect(topic).toContain('LO 1.1.B');
    expect(topic).toContain('construction remains a coverage gap');
  });
});
