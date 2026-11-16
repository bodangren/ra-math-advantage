import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';

import {
  generateTopic13ConcavityFromRateChange,
  generateTopic13ConcavityFromRateChangeOutput,
  TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID,
} from '../topic13-concavity-from-rate-change';
import { getGenerator } from '../registry';

type Classification = 'concave_up' | 'concave_down' | 'neither';
type PublicTable = { xValues: readonly number[]; yValues: readonly number[] };

const SOURCE_VARIANT = {
  seed: 0,
  prompt: 'Determine concavity.',
  functionName: 'k',
  xValues: [1, 1.1, 1.2, 1.3],
  yValues: [4, 1, -1, -2],
} as const;

function independentlyClassify(table: PublicTable): Classification {
  const widths = table.xValues.slice(1).map((value, index) => value - table.xValues[index]!);
  expect(widths.every((width) => Math.abs(width - widths[0]!) < 1e-9)).toBe(true);
  const firstDifferences = table.yValues.slice(1).map((value, index) => value - table.yValues[index]!);
  if (firstDifferences.every((difference, index) => index === 0 || difference > firstDifferences[index - 1]!)) return 'concave_up';
  if (firstDifferences.every((difference, index) => index === 0 || difference < firstDifferences[index - 1]!)) return 'concave_down';
  return 'neither';
}

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe('Topic 1.3 concavity from rate-change generator', () => {
  it('reproduces the authored Example 2 at seed 0', () => {
    const variant = generateTopic13ConcavityFromRateChange(0);
    const output = generateTopic13ConcavityFromRateChangeOutput(0);

    expect(variant).toEqual(SOURCE_VARIANT);
    expect(output.expectedAnswer).toEqual({ classification: 'concave_up' });
    expect(output.data).toEqual({
      seed: 0,
      rendererProps: {
        prompt: SOURCE_VARIANT.prompt,
        functionName: SOURCE_VARIANT.functionName,
        xValues: SOURCE_VARIANT.xValues,
        yValues: SOURCE_VARIANT.yValues,
        presentationMode: 'independent_practice',
      },
    });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { classification: 'concave_up' },
      partMaxScores: { classification: 1 },
      partGradingRules: { classification: 'exact_match' },
    });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      'The first differences are -3, -2, and -1.',
      'The first differences increase from -3 to -2 to -1.',
      'Therefore, k is concave up.',
    ]);
  });

  it('registers the exact key and node', () => {
    const generator = getGenerator('topic13-concavity-from-rate-change');
    expect(generator.key).toBe('topic13-concavity-from-rate-change');
    expect(generator.nodeIds).toEqual([TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID]);
  });

  it('is deterministic, varies, and produces all three classes', () => {
    expect(generateTopic13ConcavityFromRateChange(17)).toEqual(generateTopic13ConcavityFromRateChange(17));
    expect(generateTopic13ConcavityFromRateChange(1)).not.toEqual(generateTopic13ConcavityFromRateChange(2));
    const seed3 = generateTopic13ConcavityFromRateChange(3);
    const seed3Differences = seed3.yValues.slice(1).map((value, index) => value - seed3.yValues[index]!);
    expect(seed3Differences[0]).toBeLessThan(seed3Differences[1]!);
    expect(seed3Differences[1]).toBeGreaterThan(seed3Differences[2]!);
    const classes = new Set([1, 2, 3].map((seed) => independentlyClassify(generateTopic13ConcavityFromRateChange(seed))));
    expect(classes).toEqual(new Set(['concave_up', 'concave_down', 'neither']));
  });

  it('keeps public props safe and valid across 10,000 generated seeds', () => {
    const signatures = new Set<string>();
    for (let seed = 1; seed <= 10000; seed += 1) {
      const variant = generateTopic13ConcavityFromRateChange(seed);
      const output = generateTopic13ConcavityFromRateChangeOutput(seed);
      const classification = independentlyClassify(variant);
      expect(variant.xValues).toHaveLength(4);
      expect(variant.yValues).toHaveLength(4);
      expect(variant.xValues.every(Number.isFinite)).toBe(true);
      expect(variant.yValues.every(Number.isFinite)).toBe(true);
      expect(variant.xValues.every(Number.isSafeInteger)).toBe(true);
      expect(variant.yValues.every(Number.isSafeInteger)).toBe(true);
      expect(variant.xValues.slice(1).every((value, index) => value > variant.xValues[index]!)).toBe(true);
      expect(new Set(variant.xValues.slice(1).map((value, index) => value - variant.xValues[index]!)).size).toBe(1);
      expect(output.expectedAnswer).toEqual({ classification });
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      expect(Object.keys(output.data).sort()).toEqual(['rendererProps', 'seed']);
      const rendererProps = output.data.rendererProps as Record<string, unknown>;
      expect(Object.keys(rendererProps).sort()).toEqual(['functionName', 'presentationMode', 'prompt', 'xValues', 'yValues']);
      expect(rendererProps.presentationMode).toBe('independent_practice');
      for (const key of ['classification', 'correctAnswer', 'expectedAnswer', 'gradingMetadata', 'solution', 'solutionSteps', 'score', 'vertex']) {
        expect(serializedKeys(rendererProps)).not.toContain(key);
      }
      signatures.add(JSON.stringify(variant));
      expect(classification).toBe(seed % 3 === 1 ? 'concave_up' : seed % 3 === 2 ? 'concave_down' : 'neither');
    }
    expect(signatures.size).toBeGreaterThan(9000);
  });

  it('rejects invalid seeds', () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic13ConcavityFromRateChange(seed)).toThrow(RangeError);
      expect(() => generateTopic13ConcavityFromRateChangeOutput(seed)).toThrow(RangeError);
    }
  });
});
