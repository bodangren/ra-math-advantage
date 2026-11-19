import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";
import { describe, expect, it } from "vitest";

import {
  generateTopic14RateSignAndTrend,
  generateTopic14RateSignAndTrendOutput,
  TOPIC14_RATE_SIGN_AND_TREND_NODE_ID,
} from "../topic14-rate-sign-and-trend";
import { getGenerator } from "../registry";

const SOURCE_POINTS = [
  { x: 3, y: 0 },
  { x: 3.25, y: 2.875 },
  { x: 3.5, y: 5.5 },
  { x: 3.75, y: 7.875 },
  { x: 4, y: 10 },
] as const;

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

function classifyFromPoints(points: readonly { x: number; y: number }[]) {
  const slopes = points
    .slice(1)
    .map((point, index) => (point.y - points[index]!.y) / (point.x - points[index]!.x));
  return {
    rateSign: slopes[0]! > 0 ? "positive" : "negative",
    rateTrend: slopes.every((slope, index) => index === 0 || slope > slopes[index - 1]!)
      ? "increasing"
      : "decreasing",
  };
}

describe("Topic 1.4 rate sign and trend generator", () => {
  it("reproduces the authored Example 3 behavior at seed 0", () => {
    const variant = generateTopic14RateSignAndTrend(0);
    const output = generateTopic14RateSignAndTrendOutput(0);

    expect(variant).toEqual({
      seed: 0,
      prompt: "Determine the rate sign and rate trend of h on the interval (3, 4).",
      functionName: "h",
      interval: [3, 4],
      points: SOURCE_POINTS,
    });
    expect(output.expectedAnswer).toEqual({ rateSign: "positive", rateTrend: "decreasing" });
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      "On (3, 4), h rises, so the rate of change is positive.",
      "The graph flattens as x increases, so the positive rate of change is decreasing.",
      "Therefore, the rate sign is positive and the rate trend is decreasing.",
    ]);
    expect(output.data).toEqual({
      seed: 0,
      rendererProps: {
        prompt: variant.prompt,
        functionName: "h",
        interval: [3, 4],
        points: SOURCE_POINTS,
        presentationMode: "independent_practice",
      },
    });
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
  });

  it("resolves through the registry with the exact source node", () => {
    const generator = getGenerator("topic14-rate-sign-and-trend");

    expect(generator.key).toBe("topic14-rate-sign-and-trend");
    expect(generator.nodeIds).toEqual([TOPIC14_RATE_SIGN_AND_TREND_NODE_ID]);
    expect(TOPIC14_RATE_SIGN_AND_TREND_NODE_ID).toBe(
      "math.precalc.skill.1.4.describe-rate-of-change-behavior-on-intervals",
    );
  });

  it("is deterministic and varies the generated graph behavior", () => {
    expect(generateTopic14RateSignAndTrend(17)).toEqual(generateTopic14RateSignAndTrend(17));
    const answers = new Set(
      Array.from({ length: 100 }, (_, index) =>
        JSON.stringify(generateTopic14RateSignAndTrendOutput(index + 1).expectedAnswer),
      ),
    );
    expect(answers.size).toBe(4);
  });

  it("generates finite readable samples with live rate sign and trend across 10,000 seeds", () => {
    const signatures = new Set<string>();

    for (let seed = 1; seed <= 10000; seed += 1) {
      const variant = generateTopic14RateSignAndTrend(seed);
      const output = generateTopic14RateSignAndTrendOutput(seed);
      const { interval, points } = variant;
      const derived = classifyFromPoints(points);

      expect(points).toHaveLength(5);
      expect(points[0]!.x).toBe(interval[0]);
      expect(points.at(-1)!.x).toBe(interval[1]);
      points.forEach((point, index) => {
        expect(point.x).toBe(interval[0] + index * 0.25);
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
        expect(Math.abs(point.x)).toBeLessThan(1000);
        expect(Math.abs(point.y)).toBeLessThan(10000);
      });
      const publicProps = output.data.rendererProps as Record<string, unknown>;
      expect(Object.keys(publicProps).sort()).toEqual([
        "functionName",
        "interval",
        "points",
        "presentationMode",
        "prompt",
      ]);
      expect(publicProps.presentationMode).toBe("independent_practice");
      for (const key of [
        "answer",
        "correctAnswer",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "rateSign",
        "rateTrend",
        "score",
        "solution",
        "solutionSteps",
      ]) {
        expect(serializedKeys(publicProps)).not.toContain(key);
      }
      expect(output.expectedAnswer).toEqual(derived);
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      signatures.add(JSON.stringify(variant));
    }

    expect(signatures.size).toBeGreaterThan(1000);
  });

  it("rejects invalid seeds", () => {
    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => generateTopic14RateSignAndTrend(seed)).toThrow(RangeError);
      expect(() => generateTopic14RateSignAndTrendOutput(seed)).toThrow(RangeError);
    }
  });
});
