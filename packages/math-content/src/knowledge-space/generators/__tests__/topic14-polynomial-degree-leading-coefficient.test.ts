import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';
import { describe, expect, it } from 'vitest';

import {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
  TOPIC14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
} from '../topic14-polynomial-degree-leading-coefficient';
import { getGenerator } from '../registry';

const SOURCE_VARIANT = {
  seed: 0,
  prompt: 'Find the leading coefficient and degree.',
  items: [
    {
      id: 'a',
      functionName: 'f',
      terms: [
        { coefficient: 3, exponent: 4 },
        { coefficient: 2, exponent: 1 },
        { coefficient: -7, exponent: 0 },
      ],
    },
    {
      id: 'b',
      functionName: 'y',
      terms: [
        { coefficient: 0.5, exponent: 1 },
        { coefficient: -7, exponent: 3 },
        { coefficient: 11, exponent: 0 },
      ],
    },
    {
      id: 'c',
      functionName: 'g',
      terms: [{ coefficient: 4, exponent: 0 }],
    },
  ],
} as const;

function independentlyCalculateAnswer(item: (typeof SOURCE_VARIANT.items)[number] | {
  readonly terms: readonly { readonly coefficient: number; readonly exponent: number }[];
}) {
  const leadingTerm = item.terms.reduce((current, term) => (
    term.exponent > current.exponent ? term : current
  ));
  return { degree: leadingTerm.exponent, leadingCoefficient: leadingTerm.coefficient };
}

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe('Topic 1.4 polynomial degree and leading coefficient generator', () => {
  it('reproduces the authored Example 1 at seed 0', () => {
    const variant = generateTopic14PolynomialDegreeLeadingCoefficient(0);
    const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);

    expect(variant).toEqual(SOURCE_VARIANT);
    expect(output.expectedAnswer).toEqual({
      a_degree: 4,
      a_leading_coefficient: 3,
      b_degree: 3,
      b_leading_coefficient: -7,
      c_degree: 0,
      c_leading_coefficient: 4,
    });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      'The highest exponent in f is 4, so the degree is 4 and the leading coefficient is 3.',
      'Rewrite y in descending order as -7x^3 + 0.5x + 11. The highest exponent is 3, so the degree is 3 and the leading coefficient is -7.',
      'Treat 4 as 4x^0. The degree is 0 and the leading coefficient is 4.',
    ]);
    expect(output.data).toEqual({
      seed: 0,
      rendererProps: {
        prompt: SOURCE_VARIANT.prompt,
        items: SOURCE_VARIANT.items,
        presentationMode: 'independent_practice',
      },
    });
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
  });

  it('registers the exact key and node', () => {
    const generator = getGenerator('topic14-polynomial-degree-leading-coefficient');
    expect(generator.key).toBe('topic14-polynomial-degree-leading-coefficient');
    expect(generator.nodeIds).toEqual([TOPIC14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID]);
  });

  it('is deterministic, varies nearby seeds, and derives generated solutions from terms', () => {
    const first = generateTopic14PolynomialDegreeLeadingCoefficient(17);
    expect(first).toEqual(generateTopic14PolynomialDegreeLeadingCoefficient(17));
    expect(first).not.toEqual(generateTopic14PolynomialDegreeLeadingCoefficient(18));

    const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(17);
    for (const item of first.items) {
      const answer = independentlyCalculateAnswer(item);
      const description = output.solutionSteps.find((step) => step.description.startsWith(`${item.functionName} has terms`))?.description;
      expect(description).toContain(`${answer.degree}`);
      expect(description).toContain(`${answer.leadingCoefficient}`);
      expect(description).toContain(item.terms.map((term) => `${term.coefficient}x^${term.exponent}`).join(', '));
    }
  });

  it('generates valid varied public polynomials and private answers across 10,000 seeds', () => {
    const signatures = new Set<string>();

    for (let seed = 1; seed <= 10000; seed += 1) {
      const variant = generateTopic14PolynomialDegreeLeadingCoefficient(seed);
      const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed);
      const itemsById = Object.fromEntries(variant.items.map((item) => [item.id, item]));

      expect(variant.items).toHaveLength(3);
      expect(variant.items.map((item) => item.id)).toEqual(['a', 'b', 'c']);
      for (const item of variant.items) {
        expect(item.terms.length).toBeGreaterThan(0);
        expect(new Set(item.terms.map((term) => term.exponent)).size).toBe(item.terms.length);
        expect(item.terms.every((term) => (
          Number.isSafeInteger(term.coefficient) &&
          term.coefficient !== 0 &&
          Number.isSafeInteger(term.exponent) &&
          term.exponent >= 0
        ))).toBe(true);
        const answer = independentlyCalculateAnswer(item);
        expect(output.expectedAnswer[`${item.id}_degree`]).toBe(answer.degree);
        expect(output.expectedAnswer[`${item.id}_leading_coefficient`]).toBe(answer.leadingCoefficient);
      }

      const standard = itemsById.a!;
      const standardExponents = standard.terms.map((term) => term.exponent);
      expect(standardExponents).toEqual([...standardExponents].sort((left, right) => right - left));
      expect(standardExponents[0]).toBeGreaterThanOrEqual(2);
      expect(standardExponents[0]).toBeLessThanOrEqual(6);
      expect(standardExponents).toContain(0);
      expect(standardExponents.some((exponent) => exponent > 0 && exponent !== standardExponents[0])).toBe(true);

      const reordered = itemsById.b!;
      const reorderedExponents = reordered.terms.map((term) => term.exponent);
      expect(reorderedExponents[0]).toBe(1);
      expect(reorderedExponents[0]).not.toBe(Math.max(...reorderedExponents));
      expect(reorderedExponents).toContain(0);
      expect(Math.max(...reorderedExponents)).toBeGreaterThanOrEqual(2);
      expect(Math.max(...reorderedExponents)).toBeLessThanOrEqual(6);

      const constant = itemsById.c!;
      expect(constant.terms).toEqual([{ coefficient: expect.any(Number), exponent: 0 }]);
      signatures.add(JSON.stringify(variant));

      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      expect(Object.keys(output.data).sort()).toEqual(['rendererProps', 'seed']);
      const rendererProps = output.data.rendererProps as Record<string, unknown>;
      expect(Object.keys(rendererProps).sort()).toEqual(['items', 'presentationMode', 'prompt']);
      expect(rendererProps.presentationMode).toBe('independent_practice');
      for (const key of [
        'answer',
        'correctAnswer',
        'degree',
        'differences',
        'grading',
        'gradingMetadata',
        'leadingCoefficient',
        'score',
        'solution',
        'solutionSteps',
      ]) {
        expect(serializedKeys(rendererProps)).not.toContain(key);
      }
    }

    expect(signatures.size).toBeGreaterThan(9000);
  });

  it('rejects invalid seeds', () => {
    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => generateTopic14PolynomialDegreeLeadingCoefficient(seed)).toThrow(RangeError);
      expect(() => generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed)).toThrow(RangeError);
    }
  });
});
