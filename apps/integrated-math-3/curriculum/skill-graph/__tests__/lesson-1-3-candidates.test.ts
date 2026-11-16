import { describe, expect, it } from 'vitest';
import { getPropsSchema } from '@math-platform/activity-components/schemas';
import type {
  KnowledgeSpaceEdge,
  KnowledgeSpaceNode,
} from '@math-platform/knowledge-space-core';
import {
  projectActivityMap,
  projectSrsInputs,
} from '@math-platform/knowledge-space-practice';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import nodesJson from '../module-1/nodes.json';
import edgesJson from '../module-1/edges.json';
import standardEdgesJson from '../module-1/standard-edges.json';
import blueprintsJson from '../module-1/blueprints.json';

const PDF_SOURCE = 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';

const imaginaryUnitSkillId = 'math.im3.skill.1.3.understand-and-use-the-imaginary-unit-i';
const complexOperationsSkillId = 'math.im3.skill.1.3.perform-operations-with-complex-numbers';

const sourceRows = [
  {
    id: 'math.im3.example.1.3.012',
    page: 21,
    exampleNumber: 1,
    title: 'Square Roots of Negative Numbers',
    prompt: 'Simplify √−294.',
    solution: '√−294 = √(−1 · 7² · 6) = √−1 · √7² · √6 = i · 7 · √6 or 7i√6.',
    capability: 'Rewrite a square root of a negative number by using i = √−1 and simplifying the radical.',
  },
  {
    id: 'math.im3.example.1.3.013',
    page: 22,
    exampleNumber: 2,
    title: 'Products of Pure Imaginary Numbers',
    prompt: 'Simplify √−10 · √−15.',
    solution: '√−10 · √−15 = i√10 · i√15 = i² · √150 = −1 · √25 · √6 = −5√6.',
    capability: 'Multiply pure imaginary numbers by using i = √−1 and i² = −1.',
  },
  {
    id: 'math.im3.example.1.3.014',
    page: 22,
    exampleNumber: 3,
    title: 'Equation with Pure Imaginary Solutions',
    prompt: 'Solve x² + 81 = 0.',
    solution: 'x² + 81 = 0; x² = −81; x = ±√−81; x = ±9i.',
    capability: 'Solve a quadratic equation with pure imaginary solutions by using i = √−1.',
  },
  {
    id: 'math.im3.example.1.3.015',
    page: 23,
    exampleNumber: 4,
    title: 'Equate Complex Numbers',
    prompt: 'Find the values of x and y that make 5x − 7 + (y + 4)i = 13 + 11i true. Use equations relating the real and imaginary parts to solve for x and y.',
    solution: '5x − 7 = 13; 5x = 20; x = 4; y + 4 = 11; y = 7.',
    capability: 'Set the real parts equal and set the imaginary parts equal to solve for x and y.',
  },
  {
    id: 'math.im3.example.1.3.016',
    page: 24,
    exampleNumber: 5,
    title: 'Add or Subtract Complex Numbers',
    prompt: 'Simplify (8 + 3i) − (4 − 10i).',
    solution: '(8 + 3i) − (4 − 10i) = (8 − 4) + [3 − (−10)]i = 4 + 13i.',
    capability: 'Add or subtract complex numbers by combining real parts and imaginary parts.',
  },
  {
    id: 'math.im3.example.1.3.017',
    page: 24,
    exampleNumber: 6,
    title: 'Multiply Complex Numbers',
    prompt: 'ELECTRICITY The voltage V of an AC circuit can be found using the formula V = CI, where C is current and I is impedance. If C = 3 + 2j amps and I = 7 − 5j ohms, determine the voltage.',
    solution: 'V = CI = (3 + 2j)(7 − 5j) = 21 − 15j + 14j − 10j² = 21 − j − 10(−1) = 31 − j. The voltage is 31 − j volts.',
    capability: 'Multiply complex numbers by using the distributive (FOIL) method and j² = −1.',
  },
  {
    id: 'math.im3.example.1.3.018',
    page: 24,
    exampleNumber: 7,
    title: 'Divide Complex Numbers',
    prompt: 'Simplify 5i/(3 + 2i). Rationalize the denominator to simplify the fraction.',
    solution: '5i/(3 + 2i) = (5i/(3 + 2i))((3 − 2i)/(3 − 2i)) = (15i − 10i²)/(9 − 4i²) = (15i + 10)/13 = 10/13 + 15/13i.',
    capability: 'Divide complex numbers by multiplying by a complex conjugate and writing the result in a + bi form.',
  },
] as const;

const expectedSourceNodeIds = {
  [imaginaryUnitSkillId]: [
    'math.im3.example.1.3.012',
    'math.im3.example.1.3.013',
    'math.im3.example.1.3.014',
  ],
  [complexOperationsSkillId]: [
    'math.im3.example.1.3.013',
    'math.im3.example.1.3.015',
    'math.im3.example.1.3.016',
    'math.im3.example.1.3.017',
    'math.im3.example.1.3.018',
  ],
} as const;

function loadModule1Graph(): {
  nodes: KnowledgeSpaceNode[];
  edges: KnowledgeSpaceEdge[];
} {
  const moduleNodes = (nodesJson as { nodes: KnowledgeSpaceNode[] }).nodes
    .filter((node) => node.metadata?.module === '1' || node.kind === 'domain');
  const moduleNodeIds = new Set(moduleNodes.map((node) => node.id));
  const standardNodes = (standardEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes
    .filter((node) => node.kind === 'standard');
  const nodes = [...moduleNodes, ...standardNodes.filter((node) => !moduleNodeIds.has(node.id))];
  const edges = [
    ...(edgesJson as { edges: KnowledgeSpaceEdge[] }).edges
      .filter((edge) => moduleNodeIds.has(edge.sourceId) || moduleNodeIds.has(edge.targetId)),
    ...(standardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges
      .filter((edge) => moduleNodeIds.has(edge.sourceId)),
  ];
  return { nodes, edges };
}

function loadBlueprints(): KnowledgeBlueprint[] {
  return (
    blueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] }
  ).blueprints;
}

function findBlueprint(blueprints: KnowledgeBlueprint[], nodeId: string): KnowledgeBlueprint {
  const blueprint = blueprints.find((candidate) => candidate.nodeId === nodeId);
  expect(blueprint).toBeDefined();
  return blueprint!;
}

describe('IM3 Lesson 1-3 candidate reconciliation', () => {
  it('records each authored example with its exact PDF page, title, prompt, and capability', () => {
    const nodes = (nodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;

    for (const row of sourceRows) {
      const node = nodes.find((candidate) => candidate.id === row.id);
      expect(node).toBeDefined();
      expect(node?.kind).toBe('worked_example');
      expect(node?.reviewStatus).toBe('draft');
      expect(node?.title).toBe(`Example ${row.exampleNumber}: ${row.title}`);
      expect(node?.sourceRefs).toContain(`${PDF_SOURCE}#page=${row.page}`);
      expect(node?.metadata).toMatchObject({
        exampleNumber: row.exampleNumber,
        sourceLesson: '1-3',
        rawText: `1-3, Example ${row.exampleNumber} — ${row.title}`,
        authoredTitle: row.title,
        sourcePrompt: row.prompt,
        sourceSolution: row.solution,
        demonstratedCapability: row.capability,
      });
    }
  });

  it('uses one draft blueprint for each owned skill and maps examples many-to-many', () => {
    const blueprints = loadBlueprints();
    const owned = blueprints.filter((blueprint) => (
      blueprint.nodeId === imaginaryUnitSkillId
      || blueprint.nodeId === complexOperationsSkillId
    ));

    expect(owned.map((blueprint) => blueprint.nodeId).sort()).toEqual([
      complexOperationsSkillId,
      imaginaryUnitSkillId,
    ].sort());

    for (const [skillId, sourceNodeIds] of Object.entries(expectedSourceNodeIds)) {
      const blueprint = findBlueprint(blueprints, skillId);
      expect(blueprint.reviewStatus).toBe('draft');
      expect(blueprint.sourceNodeIds).toEqual(sourceNodeIds);
    }

    expect(findBlueprint(blueprints, imaginaryUnitSkillId).sourceNodeIds).toContain(
      'math.im3.example.1.3.013',
    );
    expect(findBlueprint(blueprints, complexOperationsSkillId).sourceNodeIds).toContain(
      'math.im3.example.1.3.013',
    );
  });

  it('projects valid existing solver props only for the supported imaginary-unit candidate', () => {
    const graph = loadModule1Graph();
    const blueprints = loadBlueprints();
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints)
      .filter((activity) => activity.nodeId === imaginaryUnitSkillId);

    expect(activities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
    ]);
    expect(activities).toHaveLength(2);

    for (const activity of activities) {
      const schema = getPropsSchema(activity.rendererKey);
      expect(schema).toBeDefined();
      expect(schema!.safeParse(activity.props).success).toBe(true);
      expect(activity.props.problemType).toBe('square_root_property');
      expect(activity.props.problemType).not.toBe('factoring');
      expect(activity.srsEligible).toBe(false);
    }
  });

  it('keeps complex-number operations unavailable because the existing solver has no exact method', () => {
    const graph = loadModule1Graph();
    const blueprints = loadBlueprints();
    const blueprint = findBlueprint(blueprints, complexOperationsSkillId);
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints)
      .filter((activity) => activity.nodeId === complexOperationsSkillId);
    const solverSchema = getPropsSchema('step-by-step-solver');

    expect(solverSchema?.safeParse({
      problemType: 'complex',
      equation: 'z = (3 + 2i)(7 − 5i)',
      steps: [],
    }).success).toBe(false);
    expect(blueprint.workedExampleSpec).toBeUndefined();
    expect(blueprint.guidedPracticeSpec).toBeUndefined();
    expect(blueprint.independentPracticeSpec).toBeUndefined();
    expect(blueprint.rendererModeMap).toEqual({});
    expect(blueprint.generatorKey).toBeUndefined();
    expect(blueprint.gradingSpec).toBeUndefined();
    expect(activities).toEqual([]);
  });

  it('keeps independent practice unavailable when no real generator and server grader exist', () => {
    const graph = loadModule1Graph();
    const blueprints = loadBlueprints();
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints)
      .filter((activity) => (
        activity.nodeId === imaginaryUnitSkillId
        || activity.nodeId === complexOperationsSkillId
      ));
    const srsEntries = projectSrsInputs(graph.nodes, graph.edges, blueprints)
      .filter((entry) => (
        entry.nodeId === imaginaryUnitSkillId
        || entry.nodeId === complexOperationsSkillId
      ));

    expect(activities.some((activity) => activity.mode === 'independent_practice')).toBe(false);
    expect(activities.some((activity) => activity.srsEligible)).toBe(false);
    expect(srsEntries).toHaveLength(2);
    expect(srsEntries.every((entry) => entry.generatorReady === false)).toBe(true);
  });
});
