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
  getGenerator,
  generateTopic15LeastPolynomialDegreeOutput,
} from '@math-platform/math-content/knowledge-space';
import {
  getPropsSchema,
  leastPolynomialDegreeSchema,
} from '@math-platform/math-content';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, '../../../curriculum/skill-graph');
const SOURCE_ID = 'math.precalc.example.1.5.002';
const SKILL_ID =
  'math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs';
const SOURCE_REF =
  'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 2)';
const RENDERER_KEY = 'least-polynomial-degree';
const GENERATOR_KEY = 'topic15-least-polynomial-degree-from-zeros-and-conjugate-pairs';
const ALIGNMENT_IDS = [
  'math.standard.ccss.hsa-apr-b-3',
  'math.standard.ccss.n-cn-c-7',
];
const PLACEHOLDER_IDS = [
  'math.precalc.skill.1.5.find-zeros-with-multiplicity-and-graph-behavior',
  'math.precalc.skill.1.5.apply-complex-conjugate-zeros-theorem',
] as const;

type JsonDocument = {
  nodes?: Array<Record<string, unknown>>;
  blueprints?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(
    fs.readFileSync(path.join(GRAPH_DIR, fileName), 'utf8'),
  ) as JsonDocument;
}

function findOne<T extends Record<string, unknown>>(
  rows: T[],
  key: string,
  value: string,
): T {
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

describe('Topic 1.5 Example 2 least-degree blueprint', () => {
  it('mirrors the exact ready capability node', () => {
    const expectedSkill = {
      id: SKILL_ID,
      kind: 'skill',
      title: 'Determine least polynomial degree from zeros and conjugate pairs',
      domain: 'math.precalc',
      description: 'Determine the least possible degree of a real-coefficient polynomial by counting given zeros, multiplicities, and required conjugate zeros.',
      sourceRefs: [SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
      rendererKey: RENDERER_KEY,
      generatorKey: GENERATOR_KEY,
      independentPracticeReady: true,
    };
    const nodes = readJson('nodes.json').nodes!;
    const draftNodes = readJson('draft-nodes.json').nodes!;
    const node = findOne(nodes, 'id', SKILL_ID);
    const draftNode = findOne(draftNodes, 'id', SKILL_ID);

    expect(node).toEqual(expectedSkill);
    expect(draftNode).toEqual(expectedSkill);
    expect(node).toEqual(draftNode);
    expect(node).toHaveProperty('independentPracticeReady', true);
    expect(draftNode).toHaveProperty('independentPracticeReady', true);
  });

  it('uses live three-mode props and the accepted one-part contract', () => {
    const workedOutput = generateTopic15LeastPolynomialDegreeOutput(0);
    const guidedOutput = generateTopic15LeastPolynomialDegreeOutput(1);
    const independentOutput = generateTopic15LeastPolynomialDegreeOutput(2);
    const workedProps = {
      ...(workedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: 'worked_example',
      correctAnswer: workedOutput.expectedAnswer.leastDegree,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: 'The least possible degree is 5.',
    };
    const guidedProps = {
      ...(guidedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: 'guided_practice',
      guidedSteps: [
        'Identify the conjugate zero.',
        'Count the conjugate pair and the real zeros.',
      ],
      fieldHelp: 'Add 2 for the conjugate pair to the number of real zeros.',
    };
    const independentProps = independentOutput.data.rendererProps;
    const blueprint = findOne(readJson('blueprints.json').blueprints!, 'nodeId', SKILL_ID);

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
          'The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros.',
        ],
        target: workedOutput.expectedAnswer,
        steps: workedOutput.solutionSteps.map((step) => ({ description: step.description })),
        explanation: 'Because f has real coefficients, the conjugate -i√3 is also a zero. Count 2 nonreal zeros and 3 real zeros.',
        rendererProps: workedProps,
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: guidedOutput.prompt,
        stepPrompts: guidedProps.guidedSteps,
        hints: [
          'Add the conjugate zero to the given nonreal zero.',
          'Count the conjugate pair and the real zeros.',
        ],
        checksPerStep: [
          { check: 'The conjugate zero is identified.' },
          { check: 'The pair and real zeros are counted.' },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: guidedProps,
      },
      independentPracticeSpec: {
        variantParameters: {
          seed: {
            type: 'integer',
            min: 0,
            description: 'Deterministic Topic 1.5 least polynomial degree variant seed',
          },
        },
        answerSchema: { leastDegree: 'number' },
        gradingRules: [
          { partId: 'leastDegree', ruleType: 'exact_match', maxScore: 1 },
        ],
        replayPolicy: 'any_seed',
        rendererProps: independentProps,
      },
      generatorKey: GENERATOR_KEY,
      gradingSpec: {
        partIds: ['leastDegree'],
        passingScore: 1,
        partialCredit: false,
        rubric: [{
          criteria: 'Identify the least possible degree.',
          points: 1,
          partId: 'leastDegree',
        }],
      },
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '5' },
    });

    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(blueprint as never).valid).toBe(true);
    expect(validateModeSupport(blueprint as never).valid).toBe(true);
    expect(validateGradingCompatibility(blueprint as never).valid).toBe(true);
    expect(leastPolynomialDegreeSchema.safeParse(workedProps).success).toBe(true);
    expect(leastPolynomialDegreeSchema.safeParse(guidedProps).success).toBe(true);
    expect(leastPolynomialDegreeSchema.safeParse(independentProps).success).toBe(true);
    expect(getPropsSchema(RENDERER_KEY)).toBe(leastPolynomialDegreeSchema);
    expect(getGenerator(GENERATOR_KEY).nodeIds).toEqual([SKILL_ID]);
    expectNoAuthority(guidedProps);
    expectNoAuthority(independentProps);
  });

  it('preserves both broad Topic 1.5 placeholder blueprints', () => {
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
