import { describe, expect, it } from 'vitest';
import { stepByStepSolverSchema } from '@math-platform/math-content/schemas';
import nodesJson from '../module-1/nodes.json';
import blueprintsJson from '../module-1/blueprints.json';

const SOURCE_PDF = 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';
const SOLVE_SKILL = 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring';
const SPECIAL_PATTERN_SKILL =
  'math.im3.skill.1.4.recognize-special-factor-patterns-gcf-trinomials-difference';

type LessonNode = {
  id: string;
  title: string;
  sourceRefs: string[];
  reviewStatus: string;
  metadata: {
    exampleNumber: number;
    rawText: string;
  };
};

type RendererSpec = {
  rendererProps?: unknown;
};

type LessonBlueprint = {
  nodeId: string;
  sourceNodeIds: string[];
  rendererKey: string;
  rendererModeMap: Record<string, string>;
  reviewStatus: string;
  workedExampleSpec?: RendererSpec;
  guidedPracticeSpec?: RendererSpec;
  independentPracticeSpec?: unknown;
  generatorKey?: string;
};

const lessonNodes = (nodesJson as { nodes: LessonNode[] }).nodes;
const lessonBlueprints = (blueprintsJson as { blueprints: LessonBlueprint[] }).blueprints;

const sourceExamples = [
  {
    id: 'math.im3.example.1.4.019',
    exampleNumber: 1,
    page: 27,
    title: 'Example 1: Factor by Using the Distributive Property',
    prompt: 'Solve 12x^2 - 2x = x by factoring. Check your solution.',
    solutionMarker: '3x(4x - 1) = 0',
  },
  {
    id: 'math.im3.example.1.4.020',
    exampleNumber: 2,
    page: 28,
    title: 'Example 2: Factor a Trinomial',
    prompt: 'Solve x^2 - 6x - 9 = 18 by factoring. Check your solution.',
    solutionMarker: '(x + 3)(x - 9) = 0',
  },
  {
    id: 'math.im3.example.1.4.021',
    exampleNumber: 3,
    page: 28,
    title: 'Example 3: Solve an Equation by Factoring',
    prompt:
      'ACCELERATION The equation d = vt + 1/2 at^2 represents the displacement d of a car traveling at an initial velocity v where the acceleration a is constant over a given time t. Find how long it takes a car to accelerate from 30 mph to 45 mph if the car moved 605 feet and accelerated slowly at a rate of 2 feet per second squared.',
    solutionMarker: 't = 11 s',
  },
  {
    id: 'math.im3.example.1.4.022',
    exampleNumber: 4,
    page: 29,
    title: 'Example 4: Factor a Trinomial Where a is Not 1',
    prompt: 'Solve 3x^2 + 5x + 15 = 17 by factoring. Check your solution.',
    solutionMarker: '(3x - 1)(x + 2) = 0',
  },
  {
    id: 'math.im3.example.1.4.023',
    exampleNumber: 5,
    page: 30,
    title: 'Example 5: Factor a Difference of Squares',
    prompt: 'Solve 81 = x^2 by factoring. Check your solution.',
    solutionMarker: '(9 + x)(9 - x) = 0',
  },
  {
    id: 'math.im3.example.1.4.024',
    exampleNumber: 6,
    page: 30,
    title: 'Example 6: Factor a Perfect Square Trinomial',
    prompt: 'Solve 16y^2 - 22y + 23 = 26y - 13 by factoring. Check your solution.',
    solutionMarker: '(4y - 6)^2 = 0',
  },
  {
    id: 'math.im3.example.1.4.025',
    exampleNumber: 7,
    page: 30,
    title: 'Example 7: Complex Solutions',
    prompt: 'Solve x^2 = -144 by factoring. Check your solution.',
    solutionMarker: '(x + 12i)(x - 12i) = 0',
  },
] as const;

const exampleIds = sourceExamples.map((example) => example.id);
const specialPatternExampleIds = exampleIds.filter(
  (id) => id !== 'math.im3.example.1.4.021',
);

describe('IM3 Lesson 1-4 candidate reconciliation', () => {
  it('records the exact PDF page, title, prompt, and solution marker for each example', () => {
    for (const sourceExample of sourceExamples) {
      const node = lessonNodes.find((candidate) => candidate.id === sourceExample.id);

      expect(node).toBeDefined();
      expect(node?.title).toBe(sourceExample.title);
      expect(node?.reviewStatus).toBe('draft');
      expect(node?.metadata.exampleNumber).toBe(sourceExample.exampleNumber);
      expect(node?.sourceRefs).toContain(`${SOURCE_PDF}#page=${sourceExample.page}`);
      expect(node?.metadata.rawText).toContain(sourceExample.prompt);
      expect(node?.metadata.rawText).toContain(sourceExample.solutionMarker);
    }
  });

  it('uses both owned skills with a many-to-many source mapping', () => {
    const solveBlueprint = lessonBlueprints.find((blueprint) => blueprint.nodeId === SOLVE_SKILL);
    const specialPatternBlueprint = lessonBlueprints.find(
      (blueprint) => blueprint.nodeId === SPECIAL_PATTERN_SKILL,
    );

    expect(solveBlueprint).toBeDefined();
    expect(specialPatternBlueprint).toBeDefined();
    expect(solveBlueprint?.sourceNodeIds).toEqual(exampleIds);
    expect(specialPatternBlueprint?.sourceNodeIds).toEqual(specialPatternExampleIds);
    expect(solveBlueprint?.sourceNodeIds).toContain('math.im3.example.1.4.021');
    expect(specialPatternBlueprint?.sourceNodeIds).not.toContain('math.im3.example.1.4.021');
  });

  it('has one draft blueprint for each owned skill', () => {
    const ownedBlueprints = lessonBlueprints.filter((blueprint) =>
      [SOLVE_SKILL, SPECIAL_PATTERN_SKILL].includes(blueprint.nodeId),
    );

    expect(ownedBlueprints).toHaveLength(2);
    expect(new Set(ownedBlueprints.map((blueprint) => blueprint.nodeId))).toEqual(
      new Set([SOLVE_SKILL, SPECIAL_PATTERN_SKILL]),
    );
    expect(ownedBlueprints.every((blueprint) => blueprint.reviewStatus === 'draft')).toBe(true);
  });

  it('uses exact step-by-step solver props for available Worked and Guided modes', () => {
    for (const blueprint of lessonBlueprints.filter((candidate) =>
      [SOLVE_SKILL, SPECIAL_PATTERN_SKILL].includes(candidate.nodeId),
    )) {
      for (const spec of [blueprint.workedExampleSpec, blueprint.guidedPracticeSpec]) {
        const result = stepByStepSolverSchema.safeParse(spec?.rendererProps);

        expect(result.success, `${blueprint.nodeId} has invalid solver props`).toBe(true);
        expect(result.success && result.data.problemType).toBe('factoring');
        expect(result.success && result.data.steps?.length).toBeGreaterThan(0);
      }
      expect(blueprint.rendererKey).toBe('step-by-step-solver');
    }
  });

  it('keeps Independent mode unavailable without an exact generator and grader path', () => {
    for (const blueprint of lessonBlueprints.filter((candidate) =>
      [SOLVE_SKILL, SPECIAL_PATTERN_SKILL].includes(candidate.nodeId),
    )) {
      expect(blueprint.independentPracticeSpec).toBeUndefined();
      expect(blueprint.rendererModeMap.independentPractice).toBeUndefined();
      expect(blueprint.generatorKey).toBeUndefined();
    }
  });
});
