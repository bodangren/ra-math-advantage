import { describe, expect, it } from "vitest";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";

import {
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
  TOPIC12_QUADRATIC_NEGATIVE_RATE_INTERVAL_CHOICE_NODE_ID,
} from "../topic12-quadratic-negative-rate-interval-choice";
import { getGenerator } from "../registry";

const SOURCE_PROMPT =
  "The function k is defined by k(x) = 3.16 + 4.2x - 0.85x^2 for -10 <= x <= 10. Which statement about k is correct?";
const SOURCE_OPTIONS = [
  { id: "A", label: "A", rateSign: "positive", startInput: -10, endInput: 8.348 },
  { id: "B", label: "B", rateSign: "positive", startInput: -0.663, endInput: 5.605 },
  { id: "C", label: "C", rateSign: "negative", startInput: -10, endInput: 2.47 },
  { id: "D", label: "D", rateSign: "negative", startInput: 2.47, endInput: 10 },
] as const;

type Variant = ReturnType<typeof generateTopic12QuadraticNegativeRateIntervalChoice>;
type Option = Variant["options"][number];

function isMathematicallyTrue(variant: Variant, option: Option): boolean {
  const vertexX = -variant.linearCoefficient / (2 * variant.quadraticCoefficient);
  const roundingTolerance = 0.001;
  if (option.rateSign === "negative") {
    return option.startInput >= vertexX - roundingTolerance && option.endInput > vertexX;
  }
  return option.startInput < vertexX && option.endInput <= vertexX + roundingTolerance;
}

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe("Topic 1.2 quadratic negative-rate interval generator", () => {
  it("reproduces the authored Example 5 at seed 0", () => {
    const variant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
    const output = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);

    expect(variant).toEqual({
      seed: 0,
      prompt: SOURCE_PROMPT,
      functionName: "k",
      constantTerm: 3.16,
      linearCoefficient: 4.2,
      quadraticCoefficient: -0.85,
      domain: [-10, 10],
      options: SOURCE_OPTIONS,
    });
    expect(output.expectedAnswer).toEqual({ selectedOptionId: "D" });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      "The quadratic opens downward.",
      "The vertex is at x = 2.470.",
      "The rate is negative to the right of the vertex, so option D is correct.",
    ]);
  });

  it("resolves through the registry with the exact source skill", () => {
    const generator = getGenerator("topic12-quadratic-negative-rate-interval-choice");

    expect(generator.key).toBe("topic12-quadratic-negative-rate-interval-choice");
    expect(generator.nodeIds).toEqual([TOPIC12_QUADRATIC_NEGATIVE_RATE_INTERVAL_CHOICE_NODE_ID]);
  });

  it("is deterministic and varies the generated contexts and correct labels", () => {
    expect(generateTopic12QuadraticNegativeRateIntervalChoice(42)).toEqual(
      generateTopic12QuadraticNegativeRateIntervalChoice(42),
    );
    expect(generateTopic12QuadraticNegativeRateIntervalChoice(1)).not.toEqual(
      generateTopic12QuadraticNegativeRateIntervalChoice(2),
    );

    const correctLabels = new Set(
      Array.from(
        { length: 1000 },
        (_, seed) =>
          generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).expectedAnswer
            .selectedOptionId,
      ),
    );
    expect(correctLabels.size).toBeGreaterThanOrEqual(3);
  });

  it("keeps 1,000 variants bounded with one independently identified true statement", () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const variant = generateTopic12QuadraticNegativeRateIntervalChoice(seed);
      const output = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed);
      const vertexX = -variant.linearCoefficient / (2 * variant.quadraticCoefficient);
      const trueOptions = variant.options.filter((option) => isMathematicallyTrue(variant, option));

      expect(variant.options).toHaveLength(4);
      expect(new Set(variant.options.map((option) => option.id))).toEqual(
        new Set(["A", "B", "C", "D"]),
      );
      expect(new Set(variant.options.map((option) => option.label))).toEqual(
        new Set(["A", "B", "C", "D"]),
      );
      expect(variant.options.every((option) => option.id === option.label)).toBe(true);
      expect(
        new Set(variant.options.map((option) => `${option.startInput}|${option.endInput}`)).size,
      ).toBe(4);
      expect(variant.prompt).not.toMatch(/\+\s+-|-\s+-/);
      expect(variant.quadraticCoefficient).toBeLessThan(0);
      expect(variant.domain[0]).toBeLessThan(variant.domain[1]);
      expect(vertexX).toBeGreaterThan(variant.domain[0]);
      expect(vertexX).toBeLessThan(variant.domain[1]);
      expect(
        variant.options.every(
          (option) =>
            option.startInput >= variant.domain[0] &&
            option.endInput <= variant.domain[1] &&
            option.startInput < option.endInput,
        ),
      ).toBe(true);
      expect(trueOptions).toHaveLength(1);
      expect(output.expectedAnswer).toEqual({ selectedOptionId: trueOptions[0]!.id });

      const data = output.data as Record<string, unknown>;
      expect(Object.keys(data).sort()).toEqual(["rendererProps", "seed"]);
      const rendererProps = data.rendererProps as Record<string, unknown>;
      expect(Object.keys(rendererProps).sort()).toEqual([
        "constantTerm",
        "domain",
        "functionName",
        "linearCoefficient",
        "options",
        "presentationMode",
        "prompt",
        "quadraticCoefficient",
      ]);
      const keys = serializedKeys(data).map((key) => key.toLowerCase());
      for (const key of [
        "correctoptionid",
        "expectedanswer",
        "gradingmetadata",
        "solutionsteps",
        "vertexx",
        "score",
        "correctness",
        "solution",
      ]) {
        expect(keys).not.toContain(key);
      }
    }
  });

  it("validates the server output and keeps authority out of public data", () => {
    const variant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
    const output = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);

    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(output.expectedAnswer).toEqual({ selectedOptionId: "D" });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { selectedOptionId: "D" },
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: "exact_match" },
    });
    expect(output.solutionSteps).toEqual([
      { description: "The quadratic opens downward." },
      { description: "The vertex is at x = 2.470." },
      { description: "The rate is negative to the right of the vertex, so option D is correct." },
    ]);
    expect(output.data).toEqual({
      seed: 0,
      rendererProps: {
        prompt: variant.prompt,
        functionName: variant.functionName,
        constantTerm: variant.constantTerm,
        linearCoefficient: variant.linearCoefficient,
        quadraticCoefficient: variant.quadraticCoefficient,
        domain: variant.domain,
        options: variant.options,
        presentationMode: "independent_practice",
      },
    });
  });

  it("rejects invalid seeds", () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic12QuadraticNegativeRateIntervalChoice(seed)).toThrow(RangeError);
      expect(() => generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed)).toThrow(
        RangeError,
      );
    }
  });
});
