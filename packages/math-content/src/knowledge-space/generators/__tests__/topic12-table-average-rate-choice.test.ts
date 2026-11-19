import { describe, expect, it } from "vitest";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";

import { tableAverageRateChoiceSchema } from "../../../schemas/table-average-rate-choice.schema";
import {
  generateTopic12TableAverageRateChoice,
  generateTopic12TableAverageRateChoiceOutput,
  TOPIC12_TABLE_AVERAGE_RATE_CHOICE_NODE_ID,
} from "../topic12-table-average-rate-choice";
import { getGenerator } from "../registry";

const seedZeroRows = [
  { input: 1800, output: 41.24 },
  { input: 1850, output: 46.1 },
  { input: 1900, output: 53.63 },
  { input: 1950, output: 70.65 },
  { input: 2000, output: 81.83 },
];

describe("Topic 1.2 table average-rate generator", () => {
  it("resolves the registered generator for the exact comparison skill", () => {
    const generator = getGenerator("topic12-table-average-rate-choice");

    expect(generator.key).toBe("topic12-table-average-rate-choice");
    expect(generator.nodeIds).toEqual([TOPIC12_TABLE_AVERAGE_RATE_CHOICE_NODE_ID]);
  });

  it("reproduces the authored Example 6 at seed 0", () => {
    const variant = generateTopic12TableAverageRateChoice(0);

    expect(variant.rows).toEqual(seedZeroRows);
    expect(variant.options).toEqual([
      { id: "A", label: "A", startInput: 1800, endInput: 1850 },
      { id: "B", label: "B", startInput: 1850, endInput: 1900 },
      { id: "C", label: "C", startInput: 1900, endInput: 1950 },
      { id: "D", label: "D", startInput: 1950, endInput: 2000 },
    ]);
    expect(variant.correctOptionId).toBe("C");
    expect(variant.prompt).toBe(
      "The table gives the life expectancy of US females born in a given year. Over which interval is the average rate of change in life expectancy greatest?",
    );
    expect(variant.inputLabel).toBe("Birth year");
    expect(variant.outputLabel).toBe("Life expectancy (years)");
    expect(variant.solutionSteps).toHaveLength(4);
    expect(
      variant.solutionSteps.every(
        (step) => step.includes("change in output") && step.includes("change in input"),
      ),
    ).toBe(true);
  });

  it("keeps synthetic generated values explicitly hypothetical", () => {
    const variant = generateTopic12TableAverageRateChoice(1);

    expect(variant.prompt).toMatch(/hypothetical/i);
  });

  it("is deterministic, varies by seed, and rejects invalid seeds", () => {
    expect(generateTopic12TableAverageRateChoice(17)).toEqual(
      generateTopic12TableAverageRateChoice(17),
    );
    expect(generateTopic12TableAverageRateChoice(17)).not.toEqual(
      generateTopic12TableAverageRateChoice(18),
    );
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic12TableAverageRateChoice(seed)).toThrow(RangeError);
    }
  });

  it("generates valid rows, options, and a uniquely greatest recomputed rate", () => {
    for (let seed = 0; seed < 60; seed += 1) {
      const variant = generateTopic12TableAverageRateChoice(seed);
      const rates = variant.options.map((option) => {
        const start = variant.rows.find((row) => row.input === option.startInput)!;
        const end = variant.rows.find((row) => row.input === option.endInput)!;
        return (end.output - start.output) / (end.input - start.input);
      });
      const greatest = Math.max(...rates);

      expect(variant.rows).toHaveLength(5);
      expect(
        variant.rows.every(
          (row, index) => index === 0 || row.input > variant.rows[index - 1]!.input,
        ),
      ).toBe(true);
      expect(new Set(variant.options.map((option) => option.id)).size).toBe(4);
      expect(rates.filter((rate) => rate === greatest)).toHaveLength(1);
      expect(variant.options[rates.indexOf(greatest)]!.id).toBe(variant.correctOptionId);
      expect(
        tableAverageRateChoiceSchema.safeParse({
          prompt: variant.prompt,
          inputLabel: variant.inputLabel,
          outputLabel: variant.outputLabel,
          rows: variant.rows,
          options: variant.options,
          presentationMode: "independent_practice",
        }).success,
      ).toBe(true);
    }
  });

  it("adapts to GeneratorOutput without answer leakage in Independent props", () => {
    const variant = generateTopic12TableAverageRateChoice(0);
    const output = generateTopic12TableAverageRateChoiceOutput(0);

    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(output.expectedAnswer).toEqual({ selectedOptionId: variant.correctOptionId });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { selectedOptionId: variant.correctOptionId },
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: "exact_match" },
    });
    expect(output.solutionSteps).toEqual(
      variant.solutionSteps.map((description) => ({ description })),
    );

    const rendererProps = (output.data as { rendererProps: Record<string, unknown> }).rendererProps;
    expect(tableAverageRateChoiceSchema.safeParse(rendererProps).success).toBe(true);
    for (const key of [
      "correctOptionId",
      "finalAnswer",
      "steps",
      "expectedAnswer",
      "gradingMetadata",
      "isCorrect",
      "correctAnswer",
    ]) {
      expect(rendererProps).not.toHaveProperty(key);
    }
  });
});
