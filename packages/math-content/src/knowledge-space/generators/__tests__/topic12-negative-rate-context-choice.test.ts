import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';

import {
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
  TOPIC12_NEGATIVE_RATE_CONTEXT_CHOICE_NODE_ID,
} from '../topic12-negative-rate-context-choice';
import { getGenerator } from '../registry';

const SOURCE_PROMPT = 'The graph of the function y = f(x) in the xy-plane always has a negative rate of change. Which of the following definitions for the variables x and y would best model the function f?';
const SOURCE_OPTIONS = [
  {
    id: 'A',
    label: 'A',
    xDefinition: 'the age, in years, of a young child',
    yDefinition: 'the height, in inches, of the young child',
  },
  {
    id: 'B',
    label: 'B',
    xDefinition: 'the total number of points scored in a basketball game',
    yDefinition: 'the time remaining, in seconds, in the game',
  },
  {
    id: 'C',
    label: 'C',
    xDefinition: 'the time, in seconds, since a ball was thrown straight up in the air',
    yDefinition: 'the height, in feet, of the ball',
  },
  {
    id: 'D',
    label: 'D',
    xDefinition: 'the radius, in meters, of a circle',
    yDefinition: 'the area, in square inches, of the circle',
  },
] as const;

const ALWAYS_NEGATIVE_PAIRS = new Set([
  'pages read|pages remaining in a fixed book',
  'units sold|units remaining in fixed inventory',
  'elapsed countdown time|time remaining',
  'quantity drained|quantity remaining in a tank',
  'the total number of points scored in a basketball game|the time remaining, in seconds, in the game',
]);

const POSITIVE_PAIRS = new Set([
  'the age, in years, of a young child|the height, in inches, of the young child',
  'the radius, in meters, of a circle|the area, in square inches, of the circle',
  'age of a child|height of the child',
  'radius of a circle|area of the circle',
  'distance traveled|fuel used by a vehicle',
  'side length of a square|area of the square',
]);

const NOT_ALWAYS_NEGATIVE_PAIRS = new Set([
  'the time, in seconds, since a ball was thrown straight up in the air|the height, in feet, of the ball',
  'time since a toy rocket launched|rocket height',
  'time after sunrise|air temperature',
  'elapsed time for a Ferris wheel car|height of the Ferris wheel car',
  'time since high tide|water level at the shore',
]);

function pairKey(option: { xDefinition: string; yDefinition: string }): string {
  return `${option.xDefinition}|${option.yDefinition}`;
}

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

function semanticKind(option: { xDefinition: string; yDefinition: string }): 'negative' | 'positive' | 'not-always-negative' {
  const key = pairKey(option);
  if (ALWAYS_NEGATIVE_PAIRS.has(key)) return 'negative';
  if (POSITIVE_PAIRS.has(key)) return 'positive';
  if (NOT_ALWAYS_NEGATIVE_PAIRS.has(key)) return 'not-always-negative';
  throw new Error(`Unknown test context: ${key}`);
}

describe('Topic 1.2 negative-rate context generator', () => {
  it('reproduces the authored Example 4 at seed 0', () => {
    const variant = generateTopic12NegativeRateContextChoice(0);

    expect(variant.prompt).toBe(SOURCE_PROMPT);
    expect(Object.keys(variant).sort()).toEqual(['options', 'prompt', 'seed']);
    expect(variant.options).toEqual(SOURCE_OPTIONS);
    expect(variant.options.every((option) => Object.keys(option).sort().join('|') === 'id|label|xDefinition|yDefinition')).toBe(true);
    expect(variant.options.find((option) => semanticKind(option) === 'negative')?.id).toBe('B');
    expect(generateTopic12NegativeRateContextChoiceOutput(0).expectedAnswer).toEqual({ selectedOptionId: 'B' });
    const solution = generateTopic12NegativeRateContextChoiceOutput(0).solutionSteps.map((step) => step.description).join(' ');
    expect(solution).toContain('x increases while y decreases');
    expect(solution).toContain('option B is correct');
  });

  it('resolves through the registry with the exact source skill', () => {
    const generator = getGenerator('topic12-negative-rate-context-choice');

    expect(generator.key).toBe('topic12-negative-rate-context-choice');
    expect(generator.nodeIds).toEqual([TOPIC12_NEGATIVE_RATE_CONTEXT_CHOICE_NODE_ID]);
  });

  it('is deterministic and varies contexts and correct labels', () => {
    expect(generateTopic12NegativeRateContextChoice(42)).toEqual(generateTopic12NegativeRateContextChoice(42));
    expect(generateTopic12NegativeRateContextChoice(1)).not.toEqual(generateTopic12NegativeRateContextChoice(2));

    const correctLabels = new Set(
      Array.from({ length: 1000 }, (_, seed) => generateTopic12NegativeRateContextChoiceOutput(seed).expectedAnswer.selectedOptionId),
    );
    expect(correctLabels.size).toBeGreaterThanOrEqual(3);
  });

  it('has four unique labeled choices and one independently identified negative pair across 1,000 seeds', () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const variant = generateTopic12NegativeRateContextChoice(seed);
      const output = generateTopic12NegativeRateContextChoiceOutput(seed);
      const options = variant.options;

      expect(options).toHaveLength(4);
      expect(new Set(options.map((option) => option.id))).toEqual(new Set(['A', 'B', 'C', 'D']));
      expect(new Set(options.map((option) => option.label))).toEqual(new Set(['A', 'B', 'C', 'D']));
      expect(new Set(options.map(pairKey)).size).toBe(4);
      expect(options.every((option) => option.xDefinition.trim() && option.yDefinition.trim())).toBe(true);
      expect(options.filter((option) => semanticKind(option) === 'negative')).toHaveLength(1);
      expect(options.filter((option) => semanticKind(option) === 'positive')).toHaveLength(2);
      expect(options.filter((option) => semanticKind(option) === 'not-always-negative')).toHaveLength(1);
      expect(output.expectedAnswer).toEqual({
        selectedOptionId: options.find((option) => semanticKind(option) === 'negative')!.id,
      });

      const data = output.data as Record<string, unknown>;
      expect(Object.keys(data).sort()).toEqual(['rendererProps', 'seed']);
      const keys = serializedKeys(data).map((key) => key.toLowerCase());
      for (const key of [
        'correctoptionid',
        'expectedanswer',
        'gradingmetadata',
        'solutionsteps',
        'relationship',
        'score',
      ]) {
        expect(keys).not.toContain(key);
      }
    }
  });

  it('validates the server output and keeps answer authority out of public data', () => {
    const output = generateTopic12NegativeRateContextChoiceOutput(0);

    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(output.expectedAnswer).toEqual({ selectedOptionId: 'B' });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { selectedOptionId: 'B' },
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: 'exact_match' },
    });
    expect((output.data as { rendererProps: Record<string, unknown> }).rendererProps).toEqual({
      prompt: SOURCE_PROMPT,
      options: SOURCE_OPTIONS,
      presentationMode: 'independent_practice',
    });
  });

  it('rejects invalid seeds', () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic12NegativeRateContextChoice(seed)).toThrow(RangeError);
      expect(() => generateTopic12NegativeRateContextChoiceOutput(seed)).toThrow(RangeError);
    }
  });
});
