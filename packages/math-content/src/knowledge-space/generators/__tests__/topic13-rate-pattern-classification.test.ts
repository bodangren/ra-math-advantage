import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';

import {
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
  TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
} from '../topic13-rate-pattern-classification';
import { getGenerator } from '../registry';

const SOURCE_PROMPT = 'Could each function be linear, quadratic, or neither?';
const SOURCE_VARIANT = {
  seed: 0,
  prompt: SOURCE_PROMPT,
  cases: [
    { id: 'a', functionName: 'f', xValues: [1, 2, 3, 4], yValues: [0, 1, 4, 9] },
    { id: 'b', functionName: 'g', xValues: [1, 2, 5, 10], yValues: [0, 1, 4, 9] },
    { id: 'c', functionName: 'p', xValues: [1, 1.1, 1.2, 1.3], yValues: [1, 7, 11, 13] },
  ],
} as const;

type Variant = ReturnType<typeof generateTopic13RatePatternClassification>;
type TableCase = Variant['cases'][number];
type Classification = 'linear' | 'quadratic' | 'neither' | 'cannot_determine';

function independentlyClassify(tableCase: TableCase): Classification {
  const [x0, x1, x2, x3] = tableCase.xValues, [y0, y1, y2, y3] = tableCase.yValues;
  const line = (x: number) => y0 + (x-x0)*(y1-y0)/(x1-x0);
  if (Math.abs(line(x2)-y2)<1e-8 && Math.abs(line(x3)-y3)<1e-8) return 'linear';
  const quadratic = y0*(x3-x1)*(x3-x2)/((x0-x1)*(x0-x2)) + y1*(x3-x0)*(x3-x2)/((x1-x0)*(x1-x2)) + y2*(x3-x0)*(x3-x1)/((x2-x0)*(x2-x1));
  return Math.abs(quadratic-y3)<1e-8 ? 'quadratic' : 'neither';
}

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe('Topic 1.3 rate-pattern classification generator', () => {
  it('reproduces the authored Example 1 and its reasoning at seed 0', () => {
    const variant = generateTopic13RatePatternClassification(0);
    const output = generateTopic13RatePatternClassificationOutput(0);

    expect(variant).toEqual(SOURCE_VARIANT);
    expect(output.expectedAnswer).toEqual({ a: 'quadratic', b: 'linear', c: 'quadratic' });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      'Equal input widths of 1 and constant second differences of 2 show that f could be quadratic (concave up).',
      'The input widths are 1, 3, and 5. The output changes are also 1, 3, and 5. Each average rate is 1, so g could be linear: g(x) = x - 1.',
      'Equal input widths of 0.1 and differences 6, 4, 2 with constant second differences of -2 show that p could be quadratic (concave down).',
    ]);
  });

  it('resolves the generator key to the exact Topic 1.3 node', () => {
    const generator = getGenerator('topic13-rate-pattern-classification');

    expect(generator.key).toBe('topic13-rate-pattern-classification');
    expect(generator.nodeIds).toEqual([TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID]);
  });

  it('is deterministic, varies nearby seeds, and preserves the parity cases', () => {
    expect(generateTopic13RatePatternClassification(7)).toEqual(
      generateTopic13RatePatternClassification(7),
    );
    expect(generateTopic13RatePatternClassification(1)).not.toEqual(
      generateTopic13RatePatternClassification(2),
    );

    for (const seed of [1, 3, 999]) {
      const classifications = generateTopic13RatePatternClassification(seed).cases
        .map(independentlyClassify);
      expect(classifications).toEqual(expect.arrayContaining(['linear', 'quadratic']));
    }
    for (const seed of [2, 4, 1000]) {
      const classifications = generateTopic13RatePatternClassification(seed).cases
        .map(independentlyClassify);
      expect(classifications).toEqual(expect.arrayContaining(['neither', 'quadratic']));
    }

    const generatedSignatures = new Set(
      Array.from({ length: 1000 }, (_, seed) => (
        JSON.stringify(generateTopic13RatePatternClassification(seed + 1))
      )),
    );
    expect(generatedSignatures.size).toBeGreaterThan(900);
  });

  it('keeps 10,000 generated variants independently classifiable and answer-aligned', () => {
    const correctLabels = new Set<string>();

    for (let seed = 1; seed <= 10000; seed += 1) {
      const variant = generateTopic13RatePatternClassification(seed);
      const output = generateTopic13RatePatternClassificationOutput(seed);
      const classifications = Object.fromEntries(
        variant.cases.map((tableCase) => [tableCase.id, independentlyClassify(tableCase)]),
      );

      expect(variant.cases).toHaveLength(3);
      expect(new Set(variant.cases.map((tableCase) => tableCase.id))).toEqual(new Set(['a', 'b', 'c']));
      expect(variant.cases.every((tableCase) => (
        tableCase.xValues.length === 4 &&
        tableCase.yValues.length === 4 &&
        tableCase.xValues.every(Number.isFinite) &&
        tableCase.yValues.every(Number.isFinite) &&
        tableCase.xValues.every(Number.isSafeInteger) &&
        tableCase.yValues.every(Number.isSafeInteger) &&
        tableCase.xValues.slice(1).every((value, index) => value > tableCase.xValues[index]!)
      ))).toBe(true);
      expect(Object.values(classifications)).toEqual(
        expect.arrayContaining(seed % 2 === 0
          ? ['neither', 'quadratic']
          : ['linear', 'quadratic']),
      );
      expect(Object.values(output.expectedAnswer)).toEqual(Object.values(classifications));
      for (const [id, classification] of Object.entries(classifications)) {
        expect(output.expectedAnswer[id]).toBe(classification);
        correctLabels.add(id);
      }

      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      expect(Object.keys(output.data).sort()).toEqual(['rendererProps', 'seed']);
      const rendererProps = output.data.rendererProps as Record<string, unknown>;
      expect(Object.keys(rendererProps).sort()).toEqual(['cases', 'presentationMode', 'prompt']);
      expect(rendererProps.presentationMode).toBe('independent_practice');
      const keys = serializedKeys(rendererProps);
      for (const bannedKey of [
        'classification',
        'correctAnswer',
        'correctClassification',
        'differences',
        'expectedAnswer',
        'gradingMetadata',
        'secondDifferences',
        'solution',
        'solutionSteps',
        'score',
      ]) {
        expect(keys).not.toContain(bannedKey);
      }
    }

    expect(correctLabels).toEqual(new Set(['a', 'b', 'c']));
  });

  it('rejects invalid seeds', () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic13RatePatternClassification(seed)).toThrow(RangeError);
      expect(() => generateTopic13RatePatternClassificationOutput(seed)).toThrow(RangeError);
    }
  });
});
