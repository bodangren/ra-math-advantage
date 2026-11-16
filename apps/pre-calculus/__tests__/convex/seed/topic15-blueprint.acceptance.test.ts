import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import {
  knowledgeBlueprintSchema,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
} from '@math-platform/knowledge-space-practice';
import {
  generateTopic15RealZerosAndMultiplicitiesOutput,
  getGenerator,
} from '@math-platform/math-content/knowledge-space';
import {
  getPropsSchema,
  realZerosAndMultiplicitiesSchema,
} from '@math-platform/math-content';

const GRAPH_DIR = path.join(process.cwd(), 'curriculum/skill-graph');
const SOURCE_ID = 'math.precalc.example.1.5.001';
const SKILL_ID = 'math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form';
const SOURCE_REF =
  'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 1)';
const RENDERER_KEY = 'real-zeros-and-multiplicities';
const GENERATOR_KEY = 'topic15-real-zeros-and-multiplicities-from-factored-form';
const ALIGNMENT_IDS = [
  'math.standard.ccss.hsa-apr-b-3',
  'math.standard.ccss.n-cn-c-7',
];

type JsonDocument = {
  nodes?: Array<Record<string, unknown> & { id: string }>;
  blueprints?: Array<Record<string, unknown> & { nodeId: string }>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), 'utf8')) as JsonDocument;
}

function findOne<T extends { id?: string; nodeId?: string }>(rows: T[], key: string, value: string): T {
  const matches = rows.filter((row) => row[key as keyof T] === value);
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

function liveModeProps() {
  const workedOutput = generateTopic15RealZerosAndMultiplicitiesOutput(0);
  const guidedOutput = generateTopic15RealZerosAndMultiplicitiesOutput(1);
  const independentOutput = generateTopic15RealZerosAndMultiplicitiesOutput(2);
  const workedRendererProps = workedOutput.data.rendererProps as Record<string, unknown>;
  const guidedRendererProps = guidedOutput.data.rendererProps as Record<string, unknown>;
  const workedProps = {
    ...workedRendererProps,
    presentationMode: 'worked_example',
    correctAnswers: workedOutput.expectedAnswer,
    steps: workedOutput.solutionSteps.map((step) => step.description),
    finalAnswer:
      'For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).',
  };
  const guidedProps = {
    ...guidedRendererProps,
    presentationMode: 'guided_practice',
    guidedSteps: [
      'Identify each factor that can make the function equal zero.',
      'Count the repeated factors for each zero.',
    ],
    fieldHelp: 'List the zeros in ascending order and give the multiplicity of each zero.',
  };
  const independentProps = independentOutput.data.rendererProps;

    return {
      workedOutput,
      guidedOutput,
      workedProps,
      guidedProps,
      independentProps,
    };
}

describe('Topic 1.5 Example 1 zeros and multiplicities blueprint', () => {
  it('mirrors the ready capability node and preserves its source mapping', () => {
    const expectedSkill = {
      id: SKILL_ID,
      kind: 'skill',
      title: 'Find real zeros and multiplicities from factored form',
      domain: 'math.precalc',
      description: 'Find the real zeros and their multiplicities from a factored polynomial expression.',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
      rendererKey: RENDERER_KEY,
      generatorKey: GENERATOR_KEY,
      independentPracticeReady: true,
    };

    const rootSkill = findOne(readJson('nodes.json').nodes!, 'id', SKILL_ID);
    const draftSkill = findOne(readJson('draft-nodes.json').nodes!, 'id', SKILL_ID);
    expect(rootSkill).toEqual(expectedSkill);
    expect(draftSkill).toEqual(expectedSkill);
    expect(rootSkill).toEqual(draftSkill);
    expect(rootSkill).toHaveProperty('independentPracticeReady', true);
  });

  it('uses live three-mode props and the exact custom grading contract', () => {
    const blueprint = findOne(readJson('blueprints.json').blueprints!, 'nodeId', SKILL_ID);
    const {
      workedOutput,
      guidedOutput,
      workedProps,
      guidedProps,
      independentProps,
    } = liveModeProps();

    expect(blueprint).toEqual({
      nodeId: SKILL_ID,
      sourceNodeIds: [SOURCE_ID],
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
          'The factored expressions are f(x) = -2x^3(x+1)(x-4)^2 and g(x) = 3(x^2 - 4)(x - 2)^4.',
        ],
        target: workedOutput.expectedAnswer,
        steps: workedOutput.solutionSteps.map((step) => ({ description: step.description })),
        explanation:
          'Read the zeros from the factors. Factor x^2 - 4 as (x - 2)(x + 2), then combine the repeated x - 2 factors.',
        rendererProps: workedProps,
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: guidedOutput.prompt,
        stepPrompts: guidedProps.guidedSteps,
        hints: [
          'Look for each factor that can equal zero.',
          'A repeated factor gives the matching zero a higher multiplicity.',
        ],
        checksPerStep: [
          { check: 'Each listed zero comes from a factor.' },
          { check: 'Each multiplicity counts the repeated factors.' },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: guidedProps,
      },
      independentPracticeSpec: {
        variantParameters: {
          seed: {
            type: 'integer',
            min: 0,
            description: 'Deterministic Topic 1.5 real zeros and multiplicities variant seed',
          },
        },
        answerSchema: { a: 'array', b: 'array' },
        gradingRules: [
          { partId: 'a', ruleType: 'custom', maxScore: 1 },
          { partId: 'b', ruleType: 'custom', maxScore: 1 },
        ],
        replayPolicy: 'any_seed',
        rendererProps: independentProps,
      },
      generatorKey: GENERATOR_KEY,
      gradingSpec: {
        partIds: ['a', 'b'],
        passingScore: 2,
        partialCredit: true,
        rubric: [
          { criteria: 'Identify all real zeros and their multiplicities for f.', points: 1, partId: 'a' },
          { criteria: 'Identify all real zeros and their multiplicities for g.', points: 1, partId: 'b' },
        ],
      },
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
    });

    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(blueprint as never).valid).toBe(true);
    expect(validateModeSupport(blueprint as never).valid).toBe(true);
    expect(validateGradingCompatibility(blueprint as never).valid).toBe(true);
    expect(realZerosAndMultiplicitiesSchema.safeParse(workedProps).success).toBe(true);
    expect(realZerosAndMultiplicitiesSchema.safeParse(guidedProps).success).toBe(true);
    expect(realZerosAndMultiplicitiesSchema.safeParse(independentProps).success).toBe(true);
    expect(getPropsSchema(RENDERER_KEY)).toBe(realZerosAndMultiplicitiesSchema);
    expect(getGenerator(GENERATOR_KEY).nodeIds).toEqual([SKILL_ID]);
    expectNoAuthority(guidedProps);
    expectNoAuthority(independentProps);
  });

  it('keeps the three broad Topic 1.5 placeholder blueprints unchanged', () => {
    const blueprints = readJson('blueprints.json').blueprints!;
    for (const id of [
      'math.precalc.skill.1.5.find-zeros-with-multiplicity-and-graph-behavior',
      'math.precalc.skill.1.5.apply-complex-conjugate-zeros-theorem',
      'math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts',
    ]) {
      expect(blueprints.filter((blueprint) => blueprint.nodeId === id)).toHaveLength(1);
    }
    expect(blueprints.filter((blueprint) => blueprint.nodeId === SKILL_ID)).toHaveLength(1);
  });
});
