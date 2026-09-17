import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';

import { getGenerator } from '../registry';
import {
  generateTopic15RealZerosAndMultiplicities,
  generateTopic15RealZerosAndMultiplicitiesOutput,
  TOPIC15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
} from '../topic15-real-zeros-and-multiplicities';

const GENERATOR_KEY = 'topic15-real-zeros-and-multiplicities-from-factored-form';
const SOURCE_ITEMS = [
  {
    id: 'a',
    functionName: 'f',
    expression: '-2x^3(x+1)(x-4)^2',
  },
  {
    id: 'b',
    functionName: 'g',
    expression: '3(x^2 - 4)(x - 2)^4',
  },
] as const;
const SOURCE_ANSWERS = {
  a: [
    { zero: -1, multiplicity: 1 },
    { zero: 0, multiplicity: 3 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -2, multiplicity: 1 },
    { zero: 2, multiplicity: 5 },
  ],
} as const;

function factorText(zero: number, multiplicity: number): string {
  const factor = zero === 0
    ? 'x'
    : zero < 0
      ? `(x+${Math.abs(zero)})`
      : `(x-${zero})`;
  return multiplicity === 1 ? factor : `${factor}^${multiplicity}`;
}

function expectPublicProps(value: unknown): void {
  expect(value).toBeDefined();
  expect(Object.keys(value as object).sort()).toEqual(['items', 'presentationMode', 'prompt']);
  const props = value as { items: Array<Record<string, unknown>> };
  for (const item of props.items) {
    expect(Object.keys(item).sort()).toEqual(['expression', 'functionName', 'id']);
  }
  const forbidden = new Set([
    'answer',
    'answers',
    'correctAnswer',
    'correctAnswers',
    'grading',
    'gradingMetadata',
    'multiplicity',
    'solution',
    'solutionSteps',
    'steps',
    'zero',
    'zeros',
  ]);
  const visit = (entry: unknown): void => {
    if (Array.isArray(entry)) {
      for (const child of entry) visit(child);
      return;
    }
    if (!entry || typeof entry !== 'object') return;
    for (const [key, child] of Object.entries(entry)) {
      expect(forbidden.has(key)).toBe(false);
      visit(child);
    }
  };
  visit(value);
}

describe('Topic 1.5 real zeros and multiplicities generator', () => {
  it('reproduces the complete authored Example 1 at seed 0', () => {
    const output = generateTopic15RealZerosAndMultiplicitiesOutput(0);

    expect(output.prompt).toBe('Find all real zeros with multiplicity.');
    expect(output.data.rendererProps).toEqual({
      prompt: 'Find all real zeros with multiplicity.',
      items: SOURCE_ITEMS,
      presentationMode: 'independent_practice',
    });
    expect(output.expectedAnswer).toEqual(SOURCE_ANSWERS);
    expect(output.gradingMetadata).toEqual({
      partAnswers: SOURCE_ANSWERS,
      partMaxScores: { a: 1, b: 1 },
      partGradingRules: { a: 'custom', b: 'custom' },
    });
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      'For f(x) = -2x^3(x+1)(x-4)^2, the real zeros are x = 0 (multiplicity 3), x = -1 (multiplicity 1), and x = 4 (multiplicity 2).',
      'For g(x) = 3(x^2 - 4)(x - 2)^4, factor x^2 - 4 as (x - 2)(x + 2).',
      'Then g(x) = 3(x - 2)^5(x + 2), so x = 2 has multiplicity 5 and x = -2 has multiplicity 1.',
    ]);
    expectPublicProps(output.data.rendererProps);
  });

  it('generates deterministic bounded items with answers derived in ascending order', () => {
    const outputs = Array.from({ length: 200 }, (_, index) =>
      generateTopic15RealZerosAndMultiplicitiesOutput(index + 1));
    const answerShapes = new Set(outputs.map((output) => JSON.stringify(output.expectedAnswer)));

    expect(answerShapes.size).toBeGreaterThan(20);
    for (const output of outputs) {
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    }
    for (const output of outputs) {
      const props = output.data.rendererProps as {
        items: Array<{ id: string; expression: string }>;
        presentationMode: string;
      };
      expect(props.presentationMode).toBe('independent_practice');
      expect(props.items).toHaveLength(2);
      expectPublicProps(props);
      expect(output.gradingMetadata.partAnswers).toEqual(output.expectedAnswer);
      for (const item of props.items) {
        const answers = output.expectedAnswer[item.id] as Array<{ zero: number; multiplicity: number }>;
        expect(answers.length === 2 || answers.length === 3).toBe(true);
        expect(answers.some((pair) => pair.multiplicity > 1)).toBe(true);
        expect(answers).toEqual([...answers].sort((left, right) => left.zero - right.zero));
        for (const pair of answers) {
          expect(item.expression).toContain(factorText(pair.zero, pair.multiplicity));
        }
      }
    }
  });

  it('exposes the exact registry identity and output contract', () => {
    const generator = getGenerator(GENERATOR_KEY);
    expect(generator.key).toBe(GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([TOPIC15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID]);
    expect(generator.generate({
      nodeId: TOPIC15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
      seed: 7,
      difficulty: 0.5,
    })).toEqual(generateTopic15RealZerosAndMultiplicitiesOutput(7));
    expect(generateTopic15RealZerosAndMultiplicities(7)).toEqual(
      generateTopic15RealZerosAndMultiplicities(7),
    );
  });

  it('rejects invalid seeds at the normal runtime boundary', () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '1']) {
      expect(() => generateTopic15RealZerosAndMultiplicities(seed as never)).toThrow(RangeError);
      expect(() => generateTopic15RealZerosAndMultiplicitiesOutput(seed as never)).toThrow(RangeError);
    }
  });
});
