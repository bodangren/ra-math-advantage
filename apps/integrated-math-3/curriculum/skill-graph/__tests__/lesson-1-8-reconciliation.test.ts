import { describe, expect, it } from 'vitest';
import nodesJson from '../module-1/nodes.json';
import blueprintsJson from '../module-1/blueprints.json';

type LessonNode = {
  id: string;
  kind: string;
  title: string;
  sourceRefs?: string[];
  reviewStatus: string;
  metadata?: Record<string, unknown>;
};

type LessonBlueprint = {
  nodeId: string;
  sourceNodeIds: string[];
  rendererKey: string;
  rendererModeMap: Record<string, string>;
  workedExampleSpec?: Record<string, unknown>;
  guidedPracticeSpec?: Record<string, unknown>;
  independentPracticeSpec?: Record<string, unknown>;
  generatorKey?: string;
  gradingSpec?: Record<string, unknown>;
  reviewStatus: string;
};

const PDF_SOURCE = 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';

const examples = [
  {
    nodeId: 'math.im3.example.1.8.046',
    exampleNumber: 1,
    page: 57,
    authoredTitle: 'Solve a Linear-Quadratic System by Using Substitution',
    prompt: 'Solve the system of equations: x = 2y^2 + 3y + 1; -x + y = -1.',
    capability: 'Solve a linear-quadratic system by substitution and report both ordered-pair solutions.',
  },
  {
    nodeId: 'math.im3.example.1.8.047',
    exampleNumber: 2,
    page: 58,
    authoredTitle: 'Solve a Linear-Quadratic System by Using Elimination',
    prompt: 'Solve the system of equations: x^2 = y + 5; -x + y = 7.',
    capability: 'Solve a linear-quadratic system by elimination and report both ordered-pair solutions.',
  },
  {
    nodeId: 'math.im3.example.1.8.048',
    exampleNumber: 3,
    page: 58,
    authoredTitle: 'Use a System to Solve a Quadratic Equation',
    prompt: 'Use a system of equations to solve x^2 - 2x + 6 = 4x + 1.',
    capability: 'Rewrite a quadratic equation as a linear-quadratic system and use intersections to find the equation solutions.',
  },
  {
    nodeId: 'math.im3.example.1.8.049',
    exampleNumber: 4,
    page: 59,
    authoredTitle: 'Solve a Linear-Quadratic System by Graphing',
    prompt: 'A software developer determines that her company can model their revenue R from a given product in hundreds of thousands of dollars given the unit price of the product x in dollars with the function R = -0.1x^2 + 4x. Create a linear-quadratic system and solve it graphically to determine the price for which the company will earn $4.2 million.',
    capability: 'Model a revenue condition as a linear-quadratic system, graph it, and interpret zero intersections in context.',
  },
  {
    nodeId: 'math.im3.example.1.8.050',
    exampleNumber: 5,
    page: 60,
    authoredTitle: 'Solve a Quadratic-Quadratic System Graphically',
    prompt: 'Solve the system of equations by graphing: y = x^2; x = 1/5(y - 6)^2 + 6/5.',
    capability: 'Solve a system of two quadratic relations graphically by constructing a value table and identifying intersections.',
  },
  {
    nodeId: 'math.im3.example.1.8.051',
    exampleNumber: 6,
    page: 61,
    authoredTitle: 'Solve a Quadratic-Quadratic System Algebraically',
    prompt: 'Solve the system of equations: 2x^2 - y = 4; y = -1/2x^2 + 6.',
    capability: 'Solve a system of two quadratic equations algebraically by substitution and verify the ordered-pair solutions.',
  },
  {
    nodeId: 'math.im3.example.1.8.052',
    exampleNumber: 7,
    page: 62,
    authoredTitle: 'Use a System to Solve a Quadratic Equation',
    prompt: 'Use a system of equations to solve 2x^2 - 3x + 8 = 11 - 4x^2.',
    capability: 'Rewrite an equation as a system of two quadratic functions and use graph intersections to find the equation solutions.',
  },
] as const;

const linearQuadraticSkill = 'math.im3.skill.1.8.solve-systems-involving-a-linear-and-a-quadratic-equation';
const quadraticQuadraticSkill = 'math.im3.skill.1.8.solve-systems-of-two-quadratic-equations';

const nodes = (nodesJson as { nodes: LessonNode[] }).nodes;
const blueprints = (blueprintsJson as { blueprints: LessonBlueprint[] }).blueprints;

describe('IM3 Module 1 Lesson 1-8 reconciliation', () => {
  it('records all seven authored examples with exact PDF pages, titles, prompts, and capabilities', () => {
    for (const expected of examples) {
      const node = nodes.find((candidate) => candidate.id === expected.nodeId);
      expect(node).toBeDefined();
      expect(node?.kind).toBe('worked_example');
      expect(node?.title).toBe(`Example ${expected.exampleNumber}: ${expected.authoredTitle}`);
      expect(node?.sourceRefs).toContain(`${PDF_SOURCE}#page=${expected.page}`);
      expect(node?.reviewStatus).toBe('draft');
      expect(node?.metadata).toMatchObject({
        exampleNumber: expected.exampleNumber,
        pdfPage: expected.page,
        authoredTitle: expected.authoredTitle,
        prompt: expected.prompt,
        demonstratedCapability: expected.capability,
      });
    }
  });

  it('maps examples to the two owned skills as a many-to-many relation', () => {
    const bySkill = new Map([
      [linearQuadraticSkill, ['math.im3.example.1.8.046', 'math.im3.example.1.8.047', 'math.im3.example.1.8.048', 'math.im3.example.1.8.049']],
      [quadraticQuadraticSkill, ['math.im3.example.1.8.050', 'math.im3.example.1.8.051', 'math.im3.example.1.8.052']],
    ]);

    for (const [skillId, sourceNodeIds] of bySkill) {
      const blueprint = blueprints.find((candidate) => candidate.nodeId === skillId);
      expect(blueprint).toBeDefined();
      expect(blueprint?.sourceNodeIds).toEqual(sourceNodeIds);
      expect(blueprint?.reviewStatus).toBe('draft');
    }

    expect(new Set(Array.from(bySkill.values()).flat())).toEqual(new Set(examples.map((example) => example.nodeId)));
  });

  it('keeps unsupported modalities unavailable without a false solver method or grader', () => {
    const systemBlueprints = blueprints.filter((candidate) => (
      candidate.nodeId === linearQuadraticSkill || candidate.nodeId === quadraticQuadraticSkill
    ));
    expect(systemBlueprints).toHaveLength(2);

    for (const blueprint of systemBlueprints) {
      expect(blueprint.rendererModeMap).toEqual({});
      expect(blueprint.rendererKey).toBe('graphing-explorer');
      expect(blueprint.workedExampleSpec).toBeUndefined();
      expect(blueprint.guidedPracticeSpec).toBeUndefined();
      expect(blueprint.independentPracticeSpec).toBeUndefined();
      expect(blueprint.generatorKey).toBeUndefined();
      expect(blueprint.gradingSpec).toBeUndefined();
    }
  });
});
