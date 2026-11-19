import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";
import { describe, expect, it } from "vitest";

import {
  generateTopic15LeastPolynomialDegree,
  generateTopic15LeastPolynomialDegreeOutput,
  TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
  getGenerator,
} from "../../index";

const GENERATOR_KEY = "topic15-least-polynomial-degree-from-zeros-and-conjugate-pairs";

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe("Topic 1.5 least polynomial degree generator", () => {
  it("reproduces the authored Example 2 at seed 0", () => {
    const variant = generateTopic15LeastPolynomialDegree(0);
    const output = generateTopic15LeastPolynomialDegreeOutput(0);

    expect(variant).toEqual({
      seed: 0,
      prompt:
        "The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?",
      givenNonrealZero: "i√3",
      realZeroCount: 3,
    });
    expect(output.expectedAnswer).toEqual({ leastDegree: 5 });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      "Because f has real coefficients, x = -i√3 is also a zero.",
      "The conjugate pair contributes 2 nonreal zeros, and the graph shows at least 3 real zeros.",
      "Therefore, the least possible degree is 2 + 3 = 5.",
    ]);
    expect(output.data).toEqual({
      seed: 0,
      rendererProps: {
        prompt: variant.prompt,
        givenNonrealZero: "i√3",
        realZeroCount: 3,
        presentationMode: "independent_practice",
      },
    });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { leastDegree: 5 },
      partMaxScores: { leastDegree: 1 },
      partGradingRules: { leastDegree: "exact_match" },
    });
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
  });

  it("resolves through the registry and public knowledge-space exports", () => {
    const generator = getGenerator(GENERATOR_KEY);

    expect(generator.key).toBe(GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID]);
    expect(TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID).toBe(
      "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs",
    );
    expect(
      generator.generate({
        nodeId: TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
        seed: 7,
        difficulty: 0.5,
      }),
    ).toEqual(generateTopic15LeastPolynomialDegreeOutput(7));
  });

  it("is deterministic and produces varied public positive-seed variants", () => {
    const publicVariants = new Set<string>();

    for (let seed = 1; seed <= 50; seed += 1) {
      const variant = generateTopic15LeastPolynomialDegree(seed);
      const output = generateTopic15LeastPolynomialDegreeOutput(seed);
      const rendererProps = output.data.rendererProps as Record<string, unknown>;

      expect(variant).toEqual(generateTopic15LeastPolynomialDegree(seed));
      expect(output).toEqual(generateTopic15LeastPolynomialDegreeOutput(seed));
      expect(variant.seed).toBe(seed);
      expect(Number.isInteger(variant.realZeroCount)).toBe(true);
      expect(variant.realZeroCount).toBeGreaterThanOrEqual(1);
      expect(variant.realZeroCount).toBeLessThanOrEqual(5);
      expect(variant.givenNonrealZero).toMatch(/i/);
      const pureImaginaryMatch = variant.givenNonrealZero.match(/^(\d*)i$/);
      const complexMatch = variant.givenNonrealZero.match(/^(-?\d+) ([+-]) (\d*)i$/);
      const realPart = pureImaginaryMatch ? 0 : Number(complexMatch?.[1]);
      const imaginaryPart = pureImaginaryMatch
        ? Number(pureImaginaryMatch[1] || 1)
        : Number(complexMatch?.[3] || 1);
      expect(Number.isInteger(realPart)).toBe(true);
      expect(realPart).toBeGreaterThanOrEqual(-4);
      expect(realPart).toBeLessThanOrEqual(4);
      expect(Number.isInteger(imaginaryPart)).toBe(true);
      expect(imaginaryPart).toBeGreaterThanOrEqual(1);
      expect(imaginaryPart).toBeLessThanOrEqual(5);
      expect(complexMatch || pureImaginaryMatch).not.toBeNull();
      expect(variant.givenNonrealZero).not.toContain("1i");
      expect(rendererProps).toEqual({
        prompt: variant.prompt,
        givenNonrealZero: variant.givenNonrealZero,
        realZeroCount: variant.realZeroCount,
        presentationMode: "independent_practice",
      });
      expect(Object.keys(rendererProps).sort()).toEqual([
        "givenNonrealZero",
        "presentationMode",
        "prompt",
        "realZeroCount",
      ]);
      expect(output.expectedAnswer).toEqual({ leastDegree: variant.realZeroCount + 2 });
      expect(output.gradingMetadata).toEqual({
        partAnswers: { leastDegree: variant.realZeroCount + 2 },
        partMaxScores: { leastDegree: 1 },
        partGradingRules: { leastDegree: "exact_match" },
      });
      const solutionText = output.solutionSteps.map((step) => step.description).join(" ");
      expect(solutionText).toContain("conjugate");
      expect(solutionText).toContain(`shows at least ${variant.realZeroCount} real zeros`);
      expect(solutionText).toContain(`= ${variant.realZeroCount + 2}.`);
      expect(serializedKeys(rendererProps)).not.toContain("conjugate");
      for (const key of [
        "answer",
        "correctAnswer",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "leastDegree",
        "partAnswers",
        "solution",
        "solutionSteps",
      ]) {
        expect(serializedKeys(rendererProps)).not.toContain(key);
      }
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      publicVariants.add(
        JSON.stringify({
          prompt: variant.prompt,
          givenNonrealZero: variant.givenNonrealZero,
          realZeroCount: variant.realZeroCount,
        }),
      );
    }

    expect(publicVariants.size).toBeGreaterThanOrEqual(10);
  });

  it("rejects invalid seeds", () => {
    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      "1",
      null,
      undefined,
    ]) {
      expect(() => generateTopic15LeastPolynomialDegree(seed as number)).toThrow(RangeError);
      expect(() => generateTopic15LeastPolynomialDegreeOutput(seed as number)).toThrow(RangeError);
    }
  });
});
