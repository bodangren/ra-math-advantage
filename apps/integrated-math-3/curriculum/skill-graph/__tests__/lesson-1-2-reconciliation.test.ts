import { describe, expect, it } from 'vitest';
import { getPropsSchema } from '@math-platform/activity-components/schemas';
import { buildGraphingSubmission } from '@math-platform/math-content/schemas';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import { projectActivityMap } from '@math-platform/knowledge-space-practice';
import {
  practiceSubmissionEnvelopeSchema,
  toConvexActivityId,
} from '@math-platform/practice-core/contract';
import { gradeServerOwnedSubmission } from '../../../lib/activities/server-grading';
import type {
  KnowledgeBlueprint,
  ProjectedActivity,
} from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';
import nodesJson from '../module-1/nodes.json';
import blueprintsJson from '../module-1/blueprints.json';

const PDF_PATH = 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';

const EXAMPLES = [
  {
    id: 'math.im3.example.1.2.007',
    page: 13,
    title: 'Example 1: One Real Solution',
    prompt: 'Solve 10 - x^2 = 4x + 14 by graphing.',
    solution: 'The zero of the function is -2. Therefore, the solution of the equation is -2 or {x | x = -2}.',
  },
  {
    id: 'math.im3.example.1.2.008',
    page: 14,
    title: 'Example 2: Two Real Solutions',
    prompt: 'Use a quadratic equation to find two real numbers with a sum of 24 and a product of 143.',
    solution: 'Thus, the two numbers with a sum of 24 and a product of 143 are 11 and 13.',
  },
  {
    id: 'math.im3.example.1.2.009',
    page: 15,
    title: 'Example 3: Estimate Roots',
    prompt: 'Solve -x^2 + 3x + 7 = 0 by graphing. If the exact roots cannot be found, state the consecutive integers between which the roots are located.',
    solution: 'The x-intercepts of the graph indicate that one solution is between -2 and -1, and the other solution is between 4 and 5.',
  },
  {
    id: 'math.im3.example.1.2.010',
    page: 15,
    title: 'Example 4: Solve by Using a Table',
    prompt: 'Use a table to solve -x^2 + 5x - 1 = 0.',
    solution: 'The zeros of the function are at approximately 0.209 and 4.791, so the solutions to the equation are approximately 0.209 and 4.791.',
  },
  {
    id: 'math.im3.example.1.2.011',
    page: 16,
    title: 'Example 5: Solve by Using a Calculator',
    prompt: 'A kicker punts a football. The height of the ball after t seconds is given by h(t) = -16t^2 + 50t + h0, where h0 is the initial height. If the ball is 1.5 feet above the ground when the punter’s foot meets the ball, how long will it take the ball to hit the ground?',
    solution: 'The zero is approximately 3.15. Thus, the ball hit the ground approximately 3.15 seconds after it was punted.',
  },
] as const;

const SOLVE_SKILL = 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing';
const INTERPRET_SKILL = 'math.im3.skill.1.2.interpret-solutions-roots-in-context';

const nodes = (nodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const blueprints = (
  blueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] }
).blueprints;

function getOwnedBlueprints(): KnowledgeBlueprint[] {
  return blueprints.filter((blueprint) => (
    blueprint.nodeId === SOLVE_SKILL || blueprint.nodeId === INTERPRET_SKILL
  ));
}

function getOwnedActivities(): ProjectedActivity[] {
  return projectActivityMap(nodes, [], getOwnedBlueprints());
}

describe('IM3 Lesson 1-2 source reconciliation', () => {
  it('records each authored example with its exact PDF page, title, prompt, and solution', () => {
    for (const example of EXAMPLES) {
      const node = nodes.find((candidate) => candidate.id === example.id);
      expect(node).toBeDefined();
      expect(node?.title).toBe(example.title);
      expect(node?.reviewStatus).toBe('draft');
      expect(node?.sourceRefs).toContain(`${PDF_PATH}#page=${example.page}`);
      expect(node?.sourceRefs?.some(
        (reference) => typeof reference === 'string' && reference.endsWith('#page=17'),
      )).toBe(false);
      expect(node?.metadata?.exampleNumber).toBe(Number(example.id.split('.').at(-1)) - 6);
      expect(node?.metadata?.rawText).toContain(example.prompt);
      expect(node?.metadata?.rawText).toContain(example.solution);
    }
  });

  it('keeps one draft blueprint for each owned skill and maps examples many-to-many', () => {
    expect(getOwnedBlueprints()).toHaveLength(2);

    const solve = blueprints.find((blueprint) => blueprint.nodeId === SOLVE_SKILL);
    const interpret = blueprints.find((blueprint) => blueprint.nodeId === INTERPRET_SKILL);
    expect(solve?.reviewStatus).toBe('draft');
    expect(interpret?.reviewStatus).toBe('draft');
    expect(solve?.sourceNodeIds).toEqual(EXAMPLES.map((example) => example.id));
    expect(interpret?.sourceNodeIds).toEqual([
      'math.im3.example.1.2.008',
      'math.im3.example.1.2.011',
    ]);
    expect(solve?.sourceNodeIds).toContain('math.im3.example.1.2.008');
    expect(interpret?.sourceNodeIds).toContain('math.im3.example.1.2.008');
  });

  it('uses exact graphing props for completed Worked mode and scaffolded Guided mode', () => {
    const expectedProps: Record<string, Record<string, unknown>> = {
      [`${SOLVE_SKILL}:worked_example`]: {
        equation: 'f(x) = x^2 + 4x + 4',
        variant: 'plot_from_equation',
      },
      [`${SOLVE_SKILL}:guided_practice`]: {
        equation: 'f(x) = -x^2 + 3x + 7',
        variant: 'find_intercepts',
      },
      [`${INTERPRET_SKILL}:worked_example`]: {
        equation: 'f(x) = -16x^2 + 50x + 1.5',
        variant: 'plot_from_equation',
      },
      [`${INTERPRET_SKILL}:guided_practice`]: {
        equation: 'f(x) = -16x^2 + 50x + 1.5',
        variant: 'find_intercepts',
      },
    };

    for (const blueprint of getOwnedBlueprints()) {
      expect(blueprint.workedExampleSpec?.steps.length).toBeGreaterThan(0);
      expect(blueprint.guidedPracticeSpec?.stepPrompts.length).toBeGreaterThan(0);
      expect(blueprint.guidedPracticeSpec?.hints.length).toBeGreaterThan(0);
      expect(blueprint.guidedPracticeSpec?.checksPerStep.length).toBeGreaterThan(0);
    }

    const activities = getOwnedActivities();
    expect(activities).toHaveLength(4);
    for (const activity of activities) {
      const key = `${activity.nodeId}:${activity.mode}`;
      expect(activity.props).toEqual(expectedProps[key]);
      expect(getPropsSchema(activity.rendererKey)?.safeParse(activity.props).success).toBe(true);
    }
  });

  it('keeps Independent mode unavailable without a compatible answer and grader contract', () => {
    const solveGenerator = getGenerator('solve-quadratic-by-graphing');
    const generated = solveGenerator.generate({
      nodeId: SOLVE_SKILL,
      seed: 42,
      difficulty: 0.5,
    });
    expect(Object.keys(generated.expectedAnswer)).toEqual(['solution_1', 'solution_2']);

    const graphSubmission = practiceSubmissionEnvelopeSchema.parse(buildGraphingSubmission({
      activityId: toConvexActivityId('activities:lesson-1-2'),
      mode: 'practice',
      placedPoints: [],
      intercepts: [],
      hints: [],
      interactionHistory: [],
      equation: 'f(x) = x^2 + 4x + 4',
      assessPointsCorrectness: () => false,
      assessInterceptsCorrectness: () => false,
    }));
    expect(Object.keys(graphSubmission.answers)).toEqual(['placedPoints', 'intercepts']);
    expect(graphSubmission.answers).not.toHaveProperty('solution_1');
    expect(graphSubmission.answers).not.toHaveProperty('solution_2');

    const graded = gradeServerOwnedSubmission(
      {
        id: 'activities:lesson-1-2',
        stableActivityId: `${SOLVE_SKILL}.independent_practice`,
        masteryNodeId: SOLVE_SKILL,
        componentKey: 'graphing-explorer',
        srsEligible: false,
        props: {
          canonicalAnswers: generated.expectedAnswer,
          gradingRules: [
            { partId: 'solution_1', ruleType: 'numeric_tolerance', tolerance: 0.01, maxScore: 3 },
            { partId: 'solution_2', ruleType: 'numeric_tolerance', tolerance: 0.01, maxScore: 3 },
          ],
        },
      },
      graphSubmission,
    );
    expect(graded.score).toBe(0);
    expect(graded.submissionData.parts.map((part) => part.partId)).toEqual(['solution_1', 'solution_2']);
    expect(graded.submissionData.parts.every((part) => part.rawAnswer === null)).toBe(true);

    for (const blueprint of getOwnedBlueprints()) {
      expect(blueprint.independentPracticeSpec).toBeUndefined();
      expect(blueprint.generatorKey).toBeUndefined();
      expect(blueprint.rendererModeMap.independentPractice).toBeUndefined();
    }
    expect(nodes.find((node) => node.id === SOLVE_SKILL)?.independentPracticeReady).toBeUndefined();
    expect(nodes.find((node) => node.id === INTERPRET_SKILL)?.independentPracticeReady).toBeUndefined();
    expect(getOwnedActivities().some((activity) => activity.mode === 'independent_practice')).toBe(false);
    expect(getOwnedActivities().every((activity) => activity.srsEligible === false)).toBe(true);
    expect(() => getGenerator(INTERPRET_SKILL)).toThrow(/Unknown generator key/);
  });
});
