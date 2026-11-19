import { describe, expect, it } from "vitest";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";

import {
  generateTopic12PointwiseLeastRateChoice,
  generateTopic12PointwiseLeastRateChoiceOutput,
  TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID,
} from "../topic12-pointwise-least-rate-choice";
import { getGenerator } from "../registry";

const SOURCE_GRAPH_POINTS = [
  { x: -5, y: -1 },
  { x: -4.2, y: -1.4 },
  { x: -3.5, y: -1.2 },
  { x: -2.2, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 2 },
  { x: 1.2, y: 2.6 },
  { x: 1.5, y: 2.65 },
  { x: 2.3, y: 2.3 },
  { x: 3, y: 1.5 },
  { x: 3.6, y: 0 },
  { x: 4, y: -1 },
  { x: 4.8, y: -4 },
];

const SOURCE_OPTIONS = [
  { id: "A", label: "A", pointIndex: 2 },
  { id: "B", label: "B", pointIndex: 4 },
  { id: "C", label: "C", pointIndex: 8 },
  { id: "D", label: "D", pointIndex: 11 },
];

function centeredSlope(
  graphPoints: readonly { x: number; y: number }[],
  pointIndex: number,
): number {
  const previous = graphPoints[pointIndex - 1]!;
  const next = graphPoints[pointIndex + 1]!;
  return (next.y - previous.y) / (next.x - previous.x);
}

describe("Topic 1.2 pointwise least-rate generator", () => {
  it("reproduces the source Example 2 contract at seed 0", () => {
    const variant = generateTopic12PointwiseLeastRateChoice(0);

    expect(variant.prompt).toBe(
      "The figure shows the graph of a function g in the xy-plane with four labeled points. Of the following points, at which is the rate of change of g the least?",
    );
    expect(variant.domain).toEqual([-5, 5]);
    expect(variant.range).toEqual([-4, 4]);
    expect(variant.xLabel).toBe("x");
    expect(variant.yLabel).toBe("y");
    expect(variant.graphPoints).toEqual(SOURCE_GRAPH_POINTS);
    expect(variant.labeledPoints).toEqual([
      { id: "A", label: "A", pointIndex: 2, x: -3.5, y: -1.2 },
      { id: "B", label: "B", pointIndex: 4, x: -1, y: 1 },
      { id: "C", label: "C", pointIndex: 8, x: 2.3, y: 2.3 },
      { id: "D", label: "D", pointIndex: 11, x: 4, y: -1 },
    ]);
    expect(variant.options).toEqual(SOURCE_OPTIONS);
    expect(variant.correctOptionId).toBe("D");

    const slopes = variant.options.map((option) =>
      centeredSlope(variant.graphPoints, option.pointIndex),
    );
    expect(slopes[0]).toBeGreaterThan(0);
    expect(slopes[1]).toBeGreaterThan(slopes[0]);
    expect(slopes[2]).toBeLessThan(0);
    expect(slopes[3]).toBeLessThan(slopes[2] - 1);
    expect(slopes[3]).toBe(Math.min(...slopes));
    expect(variant.solutionSteps.length).toBeGreaterThanOrEqual(2);
    expect(variant.solutionSteps.join(" ")).toMatch(/D has the steepest downward local behavior/i);
    expect(variant.solutionSteps.join(" ")).toMatch(/option D is correct/i);
    expect(variant.prompt).not.toMatch(/\b[fg]\s*\(/);
    expect(variant.solutionSteps.join(" ")).not.toMatch(/\b[fg]\s*\(/);
    expect(variant.solutionSteps.join(" ")).not.toContain("=");
  });

  it("resolves through the registry with the exact pointwise skill", () => {
    const generator = getGenerator("topic12-pointwise-least-rate-choice");

    expect(generator.key).toBe("topic12-pointwise-least-rate-choice");
    expect(generator.nodeIds).toEqual([TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID]);
  });

  it("is deterministic and varies the correct labeled point", () => {
    expect(generateTopic12PointwiseLeastRateChoice(42)).toEqual(
      generateTopic12PointwiseLeastRateChoice(42),
    );

    const correctOptionIds = new Set(
      Array.from(
        { length: 1000 },
        (_, seed) => generateTopic12PointwiseLeastRateChoice(seed).correctOptionId,
      ),
    );
    expect(correctOptionIds.size).toBeGreaterThanOrEqual(3);
  });

  it("keeps 1,000 graphs bounded with one recomputed least centered slope", () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const variant = generateTopic12PointwiseLeastRateChoice(seed);
      const slopes = variant.options.map((option) =>
        centeredSlope(variant.graphPoints, option.pointIndex),
      );
      const least = Math.min(...slopes);
      const leastIndexes = slopes.filter((slope) => Math.abs(slope - least) <= 1e-9);

      expect(variant.graphPoints.length).toBeGreaterThanOrEqual(6);
      expect(
        variant.graphPoints.every(
          (point) =>
            point.x >= variant.domain[0] &&
            point.x <= variant.domain[1] &&
            point.y >= variant.range[0] &&
            point.y <= variant.range[1],
        ),
      ).toBe(true);
      expect(
        variant.graphPoints.every(
          (point, index) => index === 0 || point.x > variant.graphPoints[index - 1]!.x,
        ),
      ).toBe(true);
      expect(variant.options).toHaveLength(4);
      expect(new Set(variant.options.map((option) => option.id)).size).toBe(4);
      expect(new Set(variant.options.map((option) => option.label)).size).toBe(4);
      expect(new Set(variant.options.map((option) => option.pointIndex)).size).toBe(4);
      expect(variant.labeledPoints).toHaveLength(4);
      expect(
        variant.labeledPoints.every(
          (point) =>
            variant.graphPoints[point.pointIndex]?.x === point.x &&
            variant.graphPoints[point.pointIndex]?.y === point.y,
        ),
      ).toBe(true);
      expect(leastIndexes).toHaveLength(1);
      expect(variant.options[slopes.indexOf(least)]!.id).toBe(variant.correctOptionId);
      expect(variant.solutionSteps.length).toBeGreaterThanOrEqual(2);
      expect(variant.solutionSteps.every((step) => step.trim().length > 0)).toBe(true);
      expect(variant.solutionSteps.join(" ")).not.toMatch(/stub|placeholder|see curriculum/i);
    }
  });

  it("adapts to GeneratorOutput without answer, solution, or slope leakage in public data", () => {
    const variant = generateTopic12PointwiseLeastRateChoice(0);
    const output = generateTopic12PointwiseLeastRateChoiceOutput(0);

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

    const data = output.data as Record<string, unknown>;
    expect(Object.keys(data).sort()).toEqual([
      "domain",
      "graphPoints",
      "labeledPoints",
      "options",
      "prompt",
      "range",
      "seed",
      "xLabel",
      "yLabel",
    ]);
    for (const key of [
      "correctOptionId",
      "expectedAnswer",
      "gradingMetadata",
      "solutionSteps",
      "slope",
      "slopes",
      "localSlope",
      "localSlopes",
    ]) {
      expect(data).not.toHaveProperty(key);
    }
  });

  it("rejects invalid seeds", () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic12PointwiseLeastRateChoice(seed)).toThrow(RangeError);
      expect(() => generateTopic12PointwiseLeastRateChoiceOutput(seed)).toThrow(RangeError);
    }
  });
});
