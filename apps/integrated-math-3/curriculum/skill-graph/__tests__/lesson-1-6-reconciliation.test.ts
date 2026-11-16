import { describe, expect, it } from 'vitest';
import {
  discriminantAnalyzerSchema,
  stepByStepSolverSchema,
} from '@math-platform/math-content/schemas';
import { projectActivityMap } from '@math-platform/knowledge-space-practice';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';
import nodesJson from '../module-1/nodes.json';
import blueprintsJson from '../module-1/blueprints.json';

const SOURCE_PDF =
  'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';
const FORMULA_SKILL =
  'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations';
const DISCRIMINANT_SKILL =
  'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol';

const SOURCE_EXAMPLES = [
  {
    id: 'math.im3.example.1.6.036',
    page: 43,
    title: 'Example 1: Real Roots, c Is Positive',
    prompt:
      'At the World Championship Punkin Chunkin contest in Bridgeville, Delaware, pumpkins are launched hundreds of yards. The path of a pumpkin can be modeled by h = -4.9t^2 + 11.7t + 42, where h is the height and t is the number of seconds after launch. Part A Use the Quadratic Formula to solve 0 = -4.9t^2 + 11.7t + 42. Part B Interpret the roots.',
    capability:
      'Use the Quadratic Formula to solve a quadratic equation and interpret roots in context.',
  },
  {
    id: 'math.im3.example.1.6.037',
    page: 44,
    title: 'Example 2: Real Roots, c Is Negative',
    prompt: 'Solve x^2 + 4x - 17 = 0 by using the Quadratic Formula.',
    capability:
      'Use the Quadratic Formula to solve a quadratic equation with two real irrational roots.',
  },
  {
    id: 'math.im3.example.1.6.038',
    page: 44,
    title: 'Example 3: Complex Roots',
    prompt: 'Solve 5x^2 + 8x + 11 = 0 by using the Quadratic Formula.',
    capability:
      'Use the Quadratic Formula to solve a quadratic equation with two complex roots.',
  },
  {
    id: 'math.im3.example.1.6.039',
    page: 46,
    title: 'Example 4: The Discriminant, Real Roots',
    prompt:
      'Examine 2x^2 - 10x + 7 = 0. Part A Find the value of the discriminant for 2x^2 - 10x + 7 = 0. Part B Describe the number and type of roots for the equation.',
    capability:
      'Use the discriminant to find its value and determine that the equation has two real irrational roots.',
  },
  {
    id: 'math.im3.example.1.6.040',
    page: 46,
    title: 'Example 5: The Discriminant, Complex Roots',
    prompt:
      'Examine -5x^2 + 10x - 15 = 0. Part A Find the value of the discriminant for -5x^2 + 10x - 15 = 0. Part B Describe the number and type of roots for the equation.',
    capability:
      'Use the discriminant to find its value and determine that the equation has two complex roots.',
  },
] as const;

type JsonRecord = Record<string, any>;

const nodes = (nodesJson as { nodes: JsonRecord[] }).nodes;
const blueprints = (blueprintsJson as { blueprints: JsonRecord[] }).blueprints;

function getNode(id: string): JsonRecord {
  const node = nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Missing node ${id}`);
  return node;
}

function getBlueprint(id: string): JsonRecord {
  const matches = blueprints.filter((candidate) => candidate.nodeId === id);
  expect(matches, `Expected one blueprint for ${id}`).toHaveLength(1);
  return matches[0]!;
}

describe('IM3 Lesson 1-6 PDF reconciliation', () => {
  it('records each authored example with its exact source page, title, prompt, and capability', () => {
    for (const example of SOURCE_EXAMPLES) {
      const node = getNode(example.id);

      expect(node.kind).toBe('worked_example');
      expect(node.title).toBe(example.title);
      expect(node.reviewStatus).toBe('draft');
      expect(node.sourceRefs).toContain(`${SOURCE_PDF}#page=${example.page}`);
      expect(node.metadata.exampleNumber).toBe(Number(example.id.slice(-3)) - 35);
      expect(node.metadata.rawText).toContain(`Prompt: ${example.prompt}`);
      expect(node.metadata.rawText).toContain(
        `Demonstrated capability: ${example.capability}`,
      );
    }
  });

  it('maps the examples to the two skills as a many-to-many source relation', () => {
    const formula = getBlueprint(FORMULA_SKILL);
    const discriminant = getBlueprint(DISCRIMINANT_SKILL);

    expect(formula.sourceNodeIds).toEqual([
      'math.im3.example.1.6.036',
      'math.im3.example.1.6.037',
      'math.im3.example.1.6.038',
    ]);
    expect(discriminant.sourceNodeIds).toEqual([
      'math.im3.example.1.6.039',
      'math.im3.example.1.6.040',
    ]);
    expect(formula.sourceNodeIds).not.toContain(DISCRIMINANT_SKILL);
    expect(discriminant.sourceNodeIds).not.toContain(FORMULA_SKILL);
    expect(formula.reviewStatus).toBe('draft');
    expect(discriminant.reviewStatus).toBe('draft');
  });

  it('has one candidate blueprint per owned skill with valid existing component props', () => {
    const formula = getBlueprint(FORMULA_SKILL);
    const discriminant = getBlueprint(DISCRIMINANT_SKILL);

    expect(stepByStepSolverSchema.safeParse(formula.workedExampleSpec.rendererProps).success).toBe(true);
    expect(stepByStepSolverSchema.safeParse(formula.guidedPracticeSpec.rendererProps).success).toBe(true);
    expect(discriminantAnalyzerSchema.safeParse(discriminant.workedExampleSpec.rendererProps).success).toBe(true);
    expect(discriminantAnalyzerSchema.safeParse(discriminant.guidedPracticeSpec.rendererProps).success).toBe(true);

    expect(formula.rendererModeMap).toEqual({
      worked: 'step-by-step-solver',
      guidedPractice: 'step-by-step-solver',
    });
    expect(discriminant.rendererModeMap).toEqual({
      worked: 'discriminant-analyzer',
      guidedPractice: 'discriminant-analyzer',
    });
    expect(formula.workedExampleSpec.rendererProps.steps.length).toBeGreaterThan(1);
    expect(formula.guidedPracticeSpec.rendererProps.steps.length).toBeGreaterThan(1);
    expect(discriminant.workedExampleSpec.target).toMatchObject({
      discriminant: 44,
      rootType: 'two real irrational roots',
    });
    expect(discriminant.guidedPracticeSpec.rendererProps.coefficients).toEqual({
      a: -5,
      b: 10,
      c: -15,
    });
  });

  it('keeps unsupported independent practice unavailable and out of the activity projection', () => {
    const ownedBlueprints = [getBlueprint(FORMULA_SKILL), getBlueprint(DISCRIMINANT_SKILL)];

    for (const blueprint of ownedBlueprints) {
      expect(blueprint.independentPracticeSpec).toBeUndefined();
      expect(blueprint.rendererModeMap.independentPractice).toBeUndefined();
      expect(blueprint.generatorKey).toBeUndefined();
    }

    const ownedNodes = nodes.filter((node) =>
      [FORMULA_SKILL, DISCRIMINANT_SKILL].includes(node.id),
    ) as unknown as KnowledgeSpaceNode[];
    const rows = projectActivityMap(
      ownedNodes,
      [],
      ownedBlueprints as unknown as KnowledgeBlueprint[],
    );

    expect(rows).not.toContainEqual(
      expect.objectContaining({ mode: 'independent_practice' }),
    );
    expect(rows.every((row) => row.srsEligible === false)).toBe(true);
  });
});
