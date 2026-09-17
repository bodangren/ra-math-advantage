import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import {
  knowledgeBlueprintSchema,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
} from '@math-platform/knowledge-space-practice';
import {
  generateTopic15PolynomialInequalityOutput,
  getGenerator,
} from '@math-platform/math-content/knowledge-space';
import {
  getPropsSchema,
  polynomialInequalitySignChartSchema,
} from '@math-platform/math-content';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, '../../../curriculum/skill-graph');
const EXAMPLE_ID = 'math.precalc.example.1.5.003';
const SKILL_ID = 'math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts';
const SOURCE_REF = 'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 3)';
const RENDERER_KEY = 'polynomial-inequality-sign-chart';
const GENERATOR_KEY = 'topic15-polynomial-inequality-sign-chart';
const ALIGNMENT_IDS = ['math.standard.ccss.hsa-apr-b-3'] as const;
const PLACEHOLDER_IDS = [
  'math.precalc.skill.1.5.find-zeros-with-multiplicity-and-graph-behavior',
  'math.precalc.skill.1.5.apply-complex-conjugate-zeros-theorem',
] as const;
const GUIDED_STEPS = [
  'Find and sort the distinct real roots.',
  'Test one value in each interval and record the sign.',
  'Use the inequality operator to write the interval union.',
] as const;
const GUIDED_HELP = {
  roots: 'Enter the sorted distinct real roots.',
  intervalSigns: 'Enter one sign for each interval from left to right.',
  solution: 'Write the solution as an interval union.',
} as const;

type JsonDocument = {
  nodes?: Array<Record<string, unknown>>;
  blueprints?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), 'utf8')) as JsonDocument;
}

function findOne(rows: Array<Record<string, unknown>>, key: string, value: string): Record<string, unknown> {
  const matches = rows.filter((row) => row[key] === value);
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

const AUTHORITY_KEYS = [
  'answer', 'answerKey', 'correctAnswer', 'correctAnswers', 'expectedAnswer',
  'grading', 'gradingMetadata', 'isCorrect', 'maxScore', 'normalizedAnswer',
  'score', 'solution', 'solutionSteps', 'steps', 'finalAnswer', 'authority',
] as const;

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe('Topic 1.5 Example 3 polynomial-inequality blueprint', () => {
  it('mirrors the exact source-backed sign-chart skill in both node catalogs', () => {
    const expectedSkill = {
      id: SKILL_ID,
      kind: 'skill',
      title: 'Solve polynomial inequalities using sign charts',
      domain: 'math.precalc',
      description: 'Find the real zeros, test the sign on each interval, and write the solution to a polynomial inequality in interval notation.',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
      rendererKey: RENDERER_KEY,
      generatorKey: GENERATOR_KEY,
      independentPracticeReady: true,
    };
    const node = findOne(readJson('nodes.json').nodes!, 'id', SKILL_ID);
    const draftNode = findOne(readJson('draft-nodes.json').nodes!, 'id', SKILL_ID);

    expect(node).toEqual(expectedSkill);
    expect(draftNode).toEqual(expectedSkill);
    expect(node).toEqual(draftNode);
    expect(node).toHaveProperty('independentPracticeReady', true);
    expect(draftNode).toHaveProperty('independentPracticeReady', true);
  });

  it('uses live three-mode props with the exact structured grading contract', () => {
    const workedOutput = generateTopic15PolynomialInequalityOutput(0);
    const guidedOutput = generateTopic15PolynomialInequalityOutput(1);
    const independentOutput = generateTopic15PolynomialInequalityOutput(2);
    const workedProps = {
      ...(workedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: 'worked_example',
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: 'The solution is (-4, -1) ∪ (3, ∞).',
    };
    const guidedProps = {
      ...(guidedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: 'guided_practice',
      guidedSteps: GUIDED_STEPS,
      fieldHelp: GUIDED_HELP,
    };
    const independentProps = independentOutput.data.rendererProps;
    const blueprint = findOne(readJson('blueprints.json').blueprints!, 'nodeId', SKILL_ID);

    expect(blueprint).toEqual({
      nodeId: SKILL_ID,
      sourceNodeIds: [EXAMPLE_ID],
      alignmentNodeIds: ALIGNMENT_IDS,
      rendererKey: RENDERER_KEY,
      rendererModeMap: {
        worked: RENDERER_KEY,
        guidedPractice: RENDERER_KEY,
        independentPractice: RENDERER_KEY,
      },
      workedExampleSpec: {
        prompt: workedOutput.prompt,
        givens: [
          'Solve (x - 3)(x + 1)(x + 4) > 0 by finding the zeros, testing signs on each interval, and applying the strict inequality.',
        ],
        target: workedOutput.expectedAnswer,
        steps: workedOutput.solutionSteps.map((step) => ({ description: step.description })),
        explanation: 'Find the critical points, test one value in each interval, and apply the strict endpoint rule.',
        rendererProps: workedProps,
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: guidedOutput.prompt,
        stepPrompts: GUIDED_STEPS,
        hints: [
          'Enter the distinct real roots in ascending order.',
          'Record the sign for each interval from left to right.',
          'Write the interval union that satisfies the inequality.',
        ],
        checksPerStep: [
          { check: 'The distinct roots are entered in ascending order.' },
          { check: 'One sign is recorded for each interval.' },
          { check: 'The interval union follows the inequality and endpoint rules.' },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: guidedProps,
      },
      independentPracticeSpec: {
        variantParameters: {
          seed: {
            type: 'integer',
            min: 0,
            description: 'Deterministic Topic 1.5 polynomial inequality sign-chart variant seed',
          },
        },
        answerSchema: { roots: 'array', intervalSigns: 'array', solution: 'string' },
        gradingRules: [
          { partId: 'roots', ruleType: 'custom', maxScore: 1 },
          { partId: 'intervalSigns', ruleType: 'exact_match', maxScore: 1 },
          { partId: 'solution', ruleType: 'custom', maxScore: 1 },
        ],
        replayPolicy: 'any_seed',
        rendererProps: independentProps,
      },
      generatorKey: GENERATOR_KEY,
      gradingSpec: {
        partIds: ['roots', 'intervalSigns', 'solution'],
        passingScore: 3,
        partialCredit: true,
        rubric: [
          { criteria: 'Identify and order the distinct real roots.', points: 1, partId: 'roots' },
          { criteria: 'Record the interval signs from left to right.', points: 1, partId: 'intervalSigns' },
          { criteria: 'Write the solution as an interval union.', points: 1, partId: 'solution' },
        ],
      },
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
    });

    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(blueprint as never).valid).toBe(true);
    expect(validateModeSupport(blueprint as never).valid).toBe(true);
    expect(validateGradingCompatibility(blueprint as never).valid).toBe(true);
    expect(polynomialInequalitySignChartSchema.safeParse(workedProps).success).toBe(true);
    expect(polynomialInequalitySignChartSchema.safeParse(guidedProps).success).toBe(true);
    expect(polynomialInequalitySignChartSchema.safeParse(independentProps).success).toBe(true);
    expect(getPropsSchema(RENDERER_KEY)).toBe(polynomialInequalitySignChartSchema);
    expect(getGenerator(GENERATOR_KEY).nodeIds).toEqual([SKILL_ID]);
    expectNoAuthority(Object.fromEntries(Object.entries(guidedProps).filter(([key]) => key !== 'fieldHelp')));
    expectNoAuthority(independentProps);
  });

  it('preserves the other two broad Topic 1.5 placeholder blueprints', () => {
    const blueprints = readJson('blueprints.json').blueprints!;
    for (const id of PLACEHOLDER_IDS) {
      const placeholder = findOne(blueprints, 'nodeId', id);
      expect(placeholder.reviewStatus).toBe('draft');
      expect(placeholder.metadata).toMatchObject({ course: 'precalc', unit: '1', lesson: '5' });
      expect(placeholder).not.toHaveProperty('generatorKey');
      expect(placeholder).not.toHaveProperty('gradingSpec');
      expect(placeholder).toHaveProperty('exceptions');
    }
    expect(blueprints.filter((blueprint) => blueprint.nodeId === SKILL_ID)).toHaveLength(1);
  });
});
