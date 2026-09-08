import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gaps from '../../curriculum/skill-graph/generator-gap-queue.json';
import matrix from '../../curriculum/skill-graph/im1-coverage-matrix.json';
import map from '../../curriculum/skill-graph/projection/practice-v1-activity-map.json';
import srs from '../../curriculum/skill-graph/projection/srs-input.json';

const lesson = 'math.im1.lesson.8.2';
const aggregate = 'math.im1.skill.8.2.describe-transformations-of-exponential-functions-verbally-a';
const graphEquation = 'math.im1.skill.8.2.write-equations-for-transformed-exponential-functions-given';
const slugs = [
  'describe-vertical-translations-of-exponential-functions-from-equations',
  'describe-horizontal-translations-of-exponential-functions-from-equations',
  'describe-reflections-of-exponential-functions-from-equations',
  'describe-vertical-dilations-of-exponential-functions-from-equations',
  'describe-horizontal-dilations-of-exponential-functions-from-equations',
  'write-a-transformed-exponential-equation-from-a-verbal-description',
  'justify-equivalent-exponential-transformations-using-properties-of-exponents',
  'determine-and-justify-the-common-point-of-two-exponential-functions',
];
const ids = slugs.map((slug) => `math.im1.skill.8.2.${slug}`);
const sourceMappings = [
  ['math.im1.example.8.2.004'],
  ['math.im1.example.8.2.004'],
  ['math.im1.example.8.2.004'],
  ['math.im1.example.8.2.004', 'math.im1.example.8.2.006'],
  ['math.im1.example.8.2.004'],
  ['math.im1.example.8.2.006'],
  [],
  [],
];
const reuses = [
  'math.im1.skill.8.1.graph-an-exponential-function-from-its-equation',
  'math.im1.skill.8.1.evaluate-and-interpret-an-exponential-model-at-a-given-input',
];

const nodeCopies = [canonical, draft, graph, standards];

describe('Lesson 8-2 graph source boundary', () => {
  it('keeps three corrected draft source groups in every node copy', () => {
    const expected = [
      ['math.im1.example.8.2.004', 'Examples 1–3, 6–7, and 10–12: Describe exponential transformations from equations'],
      ['math.im1.example.8.2.005', 'Examples 4–5 and 9: Write transformed exponential equations from graphs'],
      ['math.im1.example.8.2.006', 'Example 8: Interpret and apply dilations in exponential contexts'],
    ];
    for (const copy of nodeCopies) {
      for (const [id, title] of expected) {
        expect(copy.nodes.find((node) => node.id === id)).toMatchObject({ id, title, reviewStatus: 'draft', independentPracticeReady: false });
      }
    }
  });

  it('keeps 8c inactive and repairs exact graph-to-equation skill 8d', () => {
    for (const copy of nodeCopies) {
      expect(copy.nodes.find((node) => node.id === aggregate)).toMatchObject({ reviewStatus: 'draft', independentPracticeReady: false });
      expect(copy.nodes.find((node) => node.id === graphEquation)).toMatchObject({ title: 'Write an equation for a transformed exponential function from its graph', reviewStatus: 'draft', independentPracticeReady: false });
    }
    expect(catalog.blueprints.find((row) => row.nodeId === aggregate)).toMatchObject({ sourceNodeIds: [], reviewStatus: 'draft' });
    expect(catalog.blueprints.find((row) => row.nodeId === graphEquation)).toMatchObject({ sourceNodeIds: ['math.im1.example.8.2.005'], reviewStatus: 'draft' });
    expect(map.activities.filter((row) => [aggregate, graphEquation].includes(row.nodeId))).toEqual([]);
  });

  it('adds eight exact draft inactive source-only atoms', () => {
    for (const [index, id] of ids.entries()) {
      const copies = nodeCopies.map((copy) => copy.nodes.find((node) => node.id === id));
      expect(copies[0]).toMatchObject({ id, kind: 'skill', reviewStatus: 'draft', independentPracticeReady: false });
      expect(copies.slice(1)).toEqual([copies[0], copies[0], copies[0]]);
      const blueprint = catalog.blueprints.find((row) => row.nodeId === id);
      expect(blueprint).toMatchObject({ nodeId: id, sourceNodeIds: sourceMappings[index], reviewStatus: 'draft' });
      expect(blueprint).not.toHaveProperty('rendererKey');
      expect(blueprint).not.toHaveProperty('workedExampleSpec');
    }
  });

  it('adds ten exact containments without transfer or evidence claims', () => {
    for (const id of [...ids, ...reuses]) {
      expect(graph.edges.filter((edge) => edge.type === 'contains' && edge.sourceId === lesson && edge.targetId === id)).toHaveLength(1);
    }
    for (const id of ids) {
      expect(graph.edges.filter((edge) => edge.sourceId === id || edge.targetId === id)).toEqual([
        expect.objectContaining({ type: 'contains', sourceId: lesson, targetId: id }),
      ]);
    }
    expect(map.activities.filter((row) => ids.includes(row.nodeId))).toEqual([]);
  });

  it('removes sequence prerequisites and keeps all selected planning rows inactive', () => {
    expect(graph.edges.some((edge) => ['math.im1.edge.1265', 'math.im1.edge.1266'].includes(edge.id))).toBe(false);
    const selected = [aggregate, graphEquation, ...ids];
    expect(map.srsInputs.filter((row) => selected.includes(row.nodeId) && row.generatorReady === false)).toHaveLength(10);
    expect(srs.srsInputs.filter((row) => selected.includes(row.nodeId) && row.generatorReady === false)).toHaveLength(10);
    const downstream = 'math.im1.skill.8.3.apply-the-compound-interest-formula-to-investment-and-deprec';
    for (const rows of [map.srsInputs, srs.srsInputs]) {
      expect(rows.find((row) => row.nodeId === aggregate)?.prerequisites).not.toContain('math.im1.skill.8.1.identify-exponential-behavior-from-data-using-common-ratios');
      expect(rows.find((row) => row.nodeId === downstream)?.prerequisites).not.toContain(graphEquation);
    }
  });

  it('keeps derived inventories and audit totals exact', () => {
    expect(gaps.meta.totalSkills).toBe(gaps.queue.length);
    expect(matrix.totalSkills).toBe(matrix.skills.length);
    expect(matrix.counts.gap).toBe(gaps.queue.length);
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
    const audit = readFileSync(resolve(import.meta.dirname, '../../../../measure/skill-graph-im1-rollout-audit.md'), 'utf8');
    expect(audit).toContain(`**Current inventory**: ${canonical.nodes.length} canonical nodes. The edge artifact contains ${graph.nodes.length} embedded nodes and ${graph.edges.length.toLocaleString('en-US')} edges.`);
    expect(audit).toContain(`Skills with a blueprint row: ${catalog.blueprints.length}.`);
  });
});
