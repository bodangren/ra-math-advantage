import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';
import { describe, expect, it } from 'vitest';

import {
  generateTopic14PolynomialEndBehavior,
  generateTopic14PolynomialEndBehaviorOutput,
  TOPIC14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
  getGenerator,
} from '../../index';

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe('Topic 1.4 polynomial end behavior generator', () => {
  it('reproduces the authored Example 4 at seed 0', () => {
    const variant = generateTopic14PolynomialEndBehavior(0);
    const output = generateTopic14PolynomialEndBehaviorOutput(0);

    expect(variant).toEqual({
      seed: 0,
      prompt: 'Determine the end behavior of f(x) = -3x^4 from its leading term.',
      functionName: 'f',
      leadingTerm: { coefficient: -3, exponent: 4 },
    });
    expect(output.expectedAnswer).toEqual({
      leftEnd: 'negative_infinity',
      rightEnd: 'negative_infinity',
    });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      'The leading term is -3x^4.',
      'The degree is 4, which is even.',
      'The leading coefficient is -3, which is negative.',
      'An even degree gives the same end direction, and a negative leading coefficient makes both ends fall.',
      'As x approaches negative infinity, f(x) approaches negative infinity.',
      'As x approaches positive infinity, f(x) approaches negative infinity.',
    ]);
    expect(output.data).toEqual({
      seed: 0,
      rendererProps: {
        prompt: variant.prompt,
        functionName: 'f',
        leadingTerm: { coefficient: -3, exponent: 4 },
        presentationMode: 'independent_practice',
      },
    });
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
  });

  it('resolves through the registry and public knowledge-space exports', () => {
    const generator = getGenerator('topic14-polynomial-end-behavior');

    expect(generator.key).toBe('topic14-polynomial-end-behavior');
    expect(generator.nodeIds).toEqual([TOPIC14_POLYNOMIAL_END_BEHAVIOR_NODE_ID]);
    expect(TOPIC14_POLYNOMIAL_END_BEHAVIOR_NODE_ID).toBe(
      'math.precalc.skill.1.4.determine-end-behavior-from-leading-term',
    );
  });

  it('is deterministic and varies nearby positive seeds', () => {
    expect(generateTopic14PolynomialEndBehavior(17)).toEqual(
      generateTopic14PolynomialEndBehavior(17),
    );
    expect(generateTopic14PolynomialEndBehavior(17)).not.toEqual(
      generateTopic14PolynomialEndBehavior(18),
    );
  });

  it('generates bounded coefficient and exponent patterns across positive seeds', () => {
    const patterns = new Set<string>();

    for (let seed = 1; seed <= 200; seed += 1) {
      const variant = generateTopic14PolynomialEndBehavior(seed);
      const output = generateTopic14PolynomialEndBehaviorOutput(seed);
      const { coefficient, exponent } = variant.leadingTerm;

      expect(variant.functionName).toBe('f');
      expect(Number.isSafeInteger(coefficient)).toBe(true);
      expect(Math.abs(coefficient)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(coefficient)).toBeLessThanOrEqual(9);
      expect(Number.isSafeInteger(exponent)).toBe(true);
      expect(exponent).toBeGreaterThanOrEqual(2);
      expect(exponent).toBeLessThanOrEqual(7);
      const rightEnd = coefficient > 0 ? 'positive_infinity' : 'negative_infinity';
      const leftEnd = exponent % 2 === 0
        ? rightEnd
        : rightEnd === 'positive_infinity' ? 'negative_infinity' : 'positive_infinity';
      expect(output.expectedAnswer).toEqual({ leftEnd, rightEnd });
      const solutionText = output.solutionSteps.map((step) => step.description).join(' ');
      expect(solutionText).not.toContain('positive_infinity');
      expect(solutionText).not.toContain('negative_infinity');
      expect(solutionText).toContain(`f(x) approaches ${leftEnd.replace('_', ' ')}.`);
      expect(solutionText).toContain(`f(x) approaches ${rightEnd.replace('_', ' ')}.`);
      expect(Object.keys(output.data).sort()).toEqual(['rendererProps', 'seed']);
      const rendererProps = output.data.rendererProps as Record<string, unknown>;
      expect(Object.keys(rendererProps).sort()).toEqual([
        'functionName',
        'leadingTerm',
        'presentationMode',
        'prompt',
      ]);
      expect(rendererProps.presentationMode).toBe('independent_practice');
      for (const key of [
        'answer',
        'correctAnswer',
        'expectedAnswer',
        'grading',
        'gradingMetadata',
        'leftEnd',
        'rightEnd',
        'score',
        'solution',
        'solutionSteps',
      ]) {
        expect(serializedKeys(rendererProps)).not.toContain(key);
      }
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      patterns.add(`${coefficient > 0 ? 'positive' : 'negative'}-${exponent % 2 === 0 ? 'even' : 'odd'}`);
    }

    expect(patterns).toEqual(new Set([
      'positive-even',
      'positive-odd',
      'negative-even',
      'negative-odd',
    ]));
  });

  it('rejects invalid seeds', () => {
    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      '1',
      null,
      undefined,
    ]) {
      expect(() => generateTopic14PolynomialEndBehavior(seed as number)).toThrow(RangeError);
      expect(() => generateTopic14PolynomialEndBehaviorOutput(seed as number)).toThrow(RangeError);
    }
  });
});
