import { describe, expect, it } from 'vitest';
import { getPropsSchema } from '@math-platform/activity-components/schemas';
import { knowledgeBlueprintSchema } from '@math-platform/knowledge-space-practice';
import nodesJson from '../module-1/nodes.json';
import blueprintsJson from '../module-1/blueprints.json';

const PDF_SOURCE =
  'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';
const SOLVE_SKILL =
  'math.im3.skill.1.5.solve-quadratic-equations-by-completing-the-square';
const VERTEX_SKILL =
  'math.im3.skill.1.5.connect-completing-the-square-to-vertex-form';
const SOLVER_RENDERER = 'step-by-step-solver';

const expectedExamples = [
  {
    id: 'math.im3.example.1.5.026',
    number: 1,
    page: 33,
    title: 'Solve a Quadratic Equation with Rational Roots',
    prompt: 'Solve x² − 4x + 4 = 25 by using the Square Root Property.',
    capability: 'Use the Square Root Property to solve a quadratic equation with rational roots.',
  },
  {
    id: 'math.im3.example.1.5.027',
    number: 2,
    page: 34,
    title: 'Solve a Quadratic Equation with Irrational Roots',
    prompt: 'Solve x² + 24x + 144 = 192 by using the Square Root Property.',
    capability: 'Use the Square Root Property to solve a quadratic equation with irrational roots.',
  },
  {
    id: 'math.im3.example.1.5.028',
    number: 3,
    page: 34,
    title: 'Solve a Quadratic Equation with Complex Solutions',
    prompt: 'Solve 2x² − 92x + 1058 = −72 by using the Square Root Property.',
    capability: 'Use the Square Root Property to solve a quadratic equation with complex solutions.',
  },
  {
    id: 'math.im3.example.1.5.029',
    number: 4,
    page: 35,
    title: 'Complete the Square',
    prompt: 'Find the value of c that makes x² − 7x + c a perfect square. Then write the expression as a perfect square trinomial.',
    capability: 'Find and use one-half of b squared to write a perfect square trinomial.',
  },
  {
    id: 'math.im3.example.1.5.030',
    number: 5,
    page: 35,
    title: 'Solve by Completing the Square',
    prompt: 'Solve x² + 18x − 4 = 0 by completing the square.',
    capability: 'Solve a quadratic equation by completing the square and applying the Square Root Property.',
  },
  {
    id: 'math.im3.example.1.5.031',
    number: 7,
    page: 36,
    title: 'Solve When a Is Not 1',
    prompt: 'Solve 4x² − 12x − 27 = 0 by completing the square.',
    capability: 'Solve a quadratic equation by first making the coefficient of x² equal to 1.',
  },
  {
    id: 'math.im3.example.1.5.032',
    number: 8,
    page: 36,
    title: 'Solve Equations with Imaginary Solutions',
    prompt: 'Solve 3x² − 72x + 465 = 0 by completing the square.',
    capability: 'Solve a quadratic equation with imaginary solutions by completing the square.',
  },
  {
    id: 'math.im3.example.1.5.033',
    number: 9,
    page: 37,
    title: 'Write Functions in Vertex Form',
    prompt: 'Write y = −x² − 12x − 9 in vertex form.',
    capability: 'Rewrite a quadratic function in vertex form by completing the square.',
  },
  {
    id: 'math.im3.example.1.5.034',
    number: 10,
    page: 37,
    title: 'Determine the Vertex and Axis of Symmetry',
    prompt: 'Consider y = 3x² − 12x + 5. Part A: Write the function in vertex form. Part B: Find the axis of symmetry. Part C: Find the vertex and state whether the vertex is a maximum or minimum.',
    capability: 'Use vertex form to determine the axis of symmetry, vertex, and minimum value.',
  },
  {
    id: 'math.im3.example.1.5.035',
    number: 11,
    page: 38,
    title: 'Model with a Quadratic Function',
    prompt: 'FIREWORKS If a firework is launched 1 foot off the ground at a velocity of 128 feet per second, write a function for the situation. Then find and interpret the axis of symmetry and vertex.',
    capability: 'Model a projectile with a quadratic function and interpret its vertex and axis of symmetry.',
  },
] as const;

const nodes = (nodesJson as { nodes: Array<Record<string, any>> }).nodes;
const blueprints = (
  blueprintsJson as { blueprints: Array<Record<string, any>> }
).blueprints;

function lessonExamples() {
  return nodes
    .filter(
      (node) =>
        node.kind === 'worked_example' &&
        node.metadata?.course === 'im3' &&
        node.metadata?.module === '1' &&
        node.metadata?.lesson === '5',
    )
    .sort((left, right) => left.metadata.exampleNumber - right.metadata.exampleNumber);
}

function ownedBlueprints() {
  return blueprints.filter(
    (blueprint) => blueprint.nodeId === SOLVE_SKILL || blueprint.nodeId === VERTEX_SKILL,
  );
}

describe('IM3 Lesson 1-5 candidate reconciliation', () => {
  it('keeps the ten local examples on their exact PDF pages with exact titles and prompts', () => {
    const examples = lessonExamples();

    expect(examples).toHaveLength(10);
    expect(examples.map((node) => node.metadata.exampleNumber)).toEqual(
      expectedExamples.map((example) => example.number),
    );
    expect(examples.find((node) => node.metadata.exampleNumber === 6)).toBeUndefined();

    for (const expected of expectedExamples) {
      const node = nodes.find((candidate) => candidate.id === expected.id);

      expect(node).toBeDefined();
      expect(node?.title).toBe(`Example ${expected.number}: ${expected.title}`);
      expect(node?.reviewStatus).toBe('draft');
      expect(node?.sourceRefs).toContain(`${PDF_SOURCE}#page=${expected.page}`);
      expect(node?.metadata?.rawText).toContain(`Prompt: ${expected.prompt}`);
      expect(node?.metadata?.rawText).toContain(
        `Demonstrated capability: ${expected.capability}`,
      );
    }
  });

  it('maps each source in both directions without assigning Square Root Property examples to owned skills', () => {
    const [solveBlueprint, vertexBlueprint] = ownedBlueprints();
    const sourceToSkills = new Map<string, string[]>();

    for (const blueprint of [solveBlueprint, vertexBlueprint]) {
      for (const sourceNodeId of blueprint.sourceNodeIds) {
        const skills = sourceToSkills.get(sourceNodeId) ?? [];
        skills.push(blueprint.nodeId);
        sourceToSkills.set(sourceNodeId, skills);
      }
    }

    expect(solveBlueprint.sourceNodeIds).toEqual([
      'math.im3.example.1.5.029',
      'math.im3.example.1.5.030',
      'math.im3.example.1.5.031',
      'math.im3.example.1.5.032',
    ]);
    expect(vertexBlueprint.sourceNodeIds).toEqual([
      'math.im3.example.1.5.033',
      'math.im3.example.1.5.034',
      'math.im3.example.1.5.035',
    ]);
    expect(sourceToSkills.has('math.im3.example.1.5.026')).toBe(false);
    expect(sourceToSkills.has('math.im3.example.1.5.027')).toBe(false);
    expect(sourceToSkills.has('math.im3.example.1.5.028')).toBe(false);
    expect([...sourceToSkills.keys()]).toHaveLength(7);
  });

  it('has one draft blueprint per owned skill and validates its existing renderer props', () => {
    const owned = ownedBlueprints();
    const propsSchema = getPropsSchema(SOLVER_RENDERER);

    expect(owned).toHaveLength(2);
    expect(new Set(owned.map((blueprint) => blueprint.nodeId))).toEqual(
      new Set([SOLVE_SKILL, VERTEX_SKILL]),
    );
    expect(propsSchema).toBeDefined();

    for (const blueprint of owned) {
      expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
      expect(blueprint.reviewStatus).toBe('draft');
      expect(blueprint.rendererKey).toBe(SOLVER_RENDERER);
      expect(blueprint.rendererModeMap).toEqual({
        worked: SOLVER_RENDERER,
        guidedPractice: SOLVER_RENDERER,
      });
      expect(blueprint.independentPracticeSpec).toBeUndefined();
      expect(blueprint.generatorKey).toBeUndefined();
      expect(blueprint.gradingSpec).toBeUndefined();

      const worked = blueprint.workedExampleSpec;
      const guided = blueprint.guidedPracticeSpec;

      expect(worked?.rendererProps).toBeDefined();
      expect(guided?.rendererProps).toBeDefined();
      expect(propsSchema?.safeParse(worked?.rendererProps).success).toBe(true);
      expect(propsSchema?.safeParse(guided?.rendererProps).success).toBe(true);
      expect(worked?.steps.length).toBeGreaterThan(1);
      expect(worked?.steps.every((step: Record<string, any>) => step.expression)).toBe(true);
      expect(Object.keys(worked?.target ?? {})).not.toHaveLength(0);
      expect(worked?.explanation).toBeTruthy();
      expect(guided?.stepPrompts.length).toBeGreaterThan(1);
      expect(guided?.hints.length).toBeGreaterThan(0);
      expect(guided?.checksPerStep.length).toBeGreaterThan(0);
      expect(guided?.rendererProps?.steps.length).toBeGreaterThan(1);
    }
  });

  it('leaves independent practice unavailable because no generator or server grader is present', () => {
    for (const blueprint of ownedBlueprints()) {
      expect(blueprint.rendererModeMap.independentPractice).toBeUndefined();
      expect(blueprint.independentPracticeSpec).toBeUndefined();
      expect(blueprint.generatorKey).toBeUndefined();
      expect(blueprint.gradingSpec).toBeUndefined();
    }
  });
});
