import { describe, expect, it } from "vitest";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";
import { getGenerator } from "../registry";
import { generateTopic11IntervalGraph } from "../topic11-interval-graph";

const NODE_ID = "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";

const seedZeroVariant = {
  seed: 0,
  domain: [0, 9],
  changePoints: [3, 7],
  points: [
    { x: 0, y: 1 },
    { x: 3, y: 7 },
    { x: 7, y: 2 },
    { x: 9, y: 6 },
  ],
  increasingIntervals: [
    [0, 3],
    [7, 9],
  ],
  decreasingIntervals: [[3, 7]],
  constantIntervals: [],
};

const seedTwoVariant = {
  seed: 2,
  domain: [0, 8],
  changePoints: [2, 4],
  points: [
    { x: 0, y: 5 },
    { x: 2, y: 8 },
    { x: 4, y: 8 },
    { x: 8, y: 6 },
  ],
  increasingIntervals: [[0, 2]],
  decreasingIntervals: [[4, 8]],
  constantIntervals: [[2, 4]],
};

describe("topic11-interval-graph generator", () => {
  it("resolves through the existing registry with the exact objective", () => {
    const generator = getGenerator("topic11-interval-graph");

    expect(generator.key).toBe("topic11-interval-graph");
    expect(generator.nodeIds).toEqual([NODE_ID]);
  });

  it("returns the authored seed-0 geometry and a constant seed-2 variant", () => {
    expect(generateTopic11IntervalGraph(0)).toEqual(seedZeroVariant);
    expect(generateTopic11IntervalGraph(2)).toEqual(seedTwoVariant);
  });

  it("includes constant segments in fresh variants beyond the fixed pilot seed", () => {
    const fresh = Array.from({ length: 30 }, (_, index) => generateTopic11IntervalGraph(index + 3));
    expect(
      fresh.filter((variant) => variant.constantIntervals.length > 0).length,
    ).toBeGreaterThanOrEqual(5);
    expect(
      fresh.filter((variant) => variant.constantIntervals.length === 0).length,
    ).toBeGreaterThanOrEqual(5);
  });

  it("returns deterministic variants and changes geometry across seeds", () => {
    expect(generateTopic11IntervalGraph(17)).toEqual(generateTopic11IntervalGraph(17));
    expect(generateTopic11IntervalGraph(17)).not.toEqual(generateTopic11IntervalGraph(18));
  });

  it("returns valid GeneratorOutput with renderer geometry and custom grading rules", () => {
    const output = getGenerator("topic11-interval-graph").generate({
      nodeId: NODE_ID,
      seed: 0,
      difficulty: 0.5,
    });
    const parsed = generatorOutputSchema.safeParse(output);
    const data = output.data as { rendererProps?: Record<string, unknown> };

    expect(parsed.success).toBe(true);
    expect(data.rendererProps).toMatchObject({
      domain: [0, 9],
      changePoints: [3, 7],
      points: seedZeroVariant.points,
    });
    expect(output.prompt).not.toMatch(/placeholder|stub|See curriculum/i);
    expect(output.solutionSteps.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(output.solutionSteps)).not.toMatch(/placeholder|stub|See curriculum/i);
    expect(output.expectedAnswer).toEqual({
      increasingIntervals: [
        [0, 3],
        [7, 9],
      ],
      decreasingIntervals: [[3, 7]],
      constantIntervals: [],
    });
    expect(output.gradingMetadata.partGradingRules).toEqual({
      increasingIntervals: "custom",
      decreasingIntervals: "custom",
      constantIntervals: "custom",
    });
  });

  it("rejects negative and noninteger seeds", () => {
    expect(() => generateTopic11IntervalGraph(-1)).toThrow(RangeError);
    expect(() => generateTopic11IntervalGraph(1.5)).toThrow(RangeError);
  });
});
