import { describe, expect, it } from "vitest";
import { rateOfChangeCalculatorSchema } from "@math-platform/math-content";
import { getGenerator } from "../knowledge-space/generators/registry";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";

describe("average-rate-of-change generator ownership", () => {
  it("assigns the generator to the atomic equation-rate skill", () => {
    const generator = getGenerator("average-rate-of-change");

    expect(generator.key).toBe("average-rate-of-change");
    expect(generator.nodeIds).toEqual([
      "math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation",
    ]);
    expect(generator.nodeIds).not.toContain(
      "math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change",
    );
  });

  it("generates the exact integer quadratic cases for seeds 0, 1, and 2", () => {
    const generator = getGenerator("average-rate-of-change");
    const expected = [
      {
        seed: 0,
        equation: "f(x) = -2x^2 + x - 2",
        interval: [-1, 5],
        answer: { f_a: -5, f_b: -47, rate: -7 },
      },
      {
        seed: 1,
        equation: "f(x) = x^2 - 3x - 4",
        interval: [-4, -1],
        answer: { f_a: 24, f_b: 0, rate: -8 },
      },
      {
        seed: 2,
        equation: "f(x) = -2x^2 + 2x - 2",
        interval: [0, 4],
        answer: { f_a: -2, f_b: -26, rate: -6 },
      },
    ];

    for (const testCase of expected) {
      const output = generator.generate({
        nodeId: "math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation",
        seed: testCase.seed,
        difficulty: 0.5,
      });

      expect(output.prompt).toContain(testCase.equation);
      expect(output.data).toMatchObject({
        intervalStart: testCase.interval[0],
        intervalEnd: testCase.interval[1],
        rendererProps: {
          sourceType: "function",
          data: { expression: testCase.equation },
          interval: { start: testCase.interval[0], end: testCase.interval[1] },
        },
      });
      expect(
        rateOfChangeCalculatorSchema.safeParse(
          (output.data as { rendererProps: unknown }).rendererProps,
        ).success,
      ).toBe(true);
      expect(output.expectedAnswer).toEqual(testCase.answer);
    }
  });

  it("keeps every generated problem deterministic, integer-valued, clean, and schema-valid", () => {
    const generator = getGenerator("average-rate-of-change");
    const nodeId = "math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation";
    const aValues = [-2, -1, 1, 2];

    for (let seed = 0; seed < 1000; seed += 1) {
      const input = { nodeId, seed, difficulty: 0.5 };
      const output = generator.generate(input);
      const replay = generator.generate(input);
      const data = output.data as {
        a: number;
        b: number;
        c: number;
        intervalStart: number;
        intervalEnd: number;
        rendererProps: {
          sourceType: string;
          data: { expression: string };
          interval: { start: number; end: number };
        };
      };
      const expectedAnswer = output.expectedAnswer as { f_a: number; f_b: number; rate: number };
      const width = data.intervalEnd - data.intervalStart;
      const expectedStart = data.a * data.intervalStart ** 2 + data.b * data.intervalStart + data.c;
      const expectedEnd = data.a * data.intervalEnd ** 2 + data.b * data.intervalEnd + data.c;

      expect(JSON.stringify(output)).toBe(JSON.stringify(replay));
      expect(aValues).toContain(data.a);
      expect(data.rendererProps).toEqual({
        sourceType: "function",
        data: { expression: output.prompt.match(/f\(x\) = .*?(?= on the interval)/)?.[0] },
        interval: { start: data.intervalStart, end: data.intervalEnd },
      });
      expect(rateOfChangeCalculatorSchema.safeParse(data.rendererProps).success).toBe(true);
      for (const key of [
        "correctAnswer",
        "expectedAnswer",
        "solutionSteps",
        "gradingMetadata",
        "partAnswers",
        "isCorrect",
        "score",
        "maxScore",
      ]) {
        expect(JSON.stringify(data.rendererProps)).not.toContain(`"${key}"`);
      }
      expect(Number.isInteger(data.b)).toBe(true);
      expect(Number.isInteger(data.c)).toBe(true);
      expect(Number.isInteger(data.intervalStart)).toBe(true);
      expect(Number.isInteger(data.intervalEnd)).toBe(true);
      expect(Number.isInteger(expectedAnswer.f_a)).toBe(true);
      expect(Number.isInteger(expectedAnswer.f_b)).toBe(true);
      expect(Number.isInteger(expectedAnswer.rate)).toBe(true);
      expect(data.intervalStart).toBeLessThan(data.intervalEnd);
      expect(expectedAnswer).toEqual({
        f_a: expectedStart,
        f_b: expectedEnd,
        rate: (expectedEnd - expectedStart) / width,
      });
      expect(output.prompt).not.toMatch(/1x\^2|-1x\^2|\+\s*-|-\s*-/);
      for (const step of output.solutionSteps) {
        expect(step.expression ?? "").not.toMatch(/1x\^2|-1x\^2|\+\s*-|-\s*-/);
      }
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      expect(Object.keys(output.expectedAnswer)).toEqual(["f_a", "f_b", "rate"]);
      expect(Object.keys(output.gradingMetadata.partAnswers)).toEqual(["f_a", "f_b", "rate"]);
      expect(Object.keys(output.gradingMetadata.partMaxScores)).toEqual(["f_a", "f_b", "rate"]);
      expect(Object.keys(output.gradingMetadata.partGradingRules)).toEqual(["f_a", "f_b", "rate"]);
      expect(output.gradingMetadata.partMaxScores).toEqual({ f_a: 2, f_b: 2, rate: 3 });
      expect(output.gradingMetadata.partGradingRules).toEqual({
        f_a: "numeric_tolerance",
        f_b: "numeric_tolerance",
        rate: "numeric_tolerance",
      });
      expect(output.gradingMetadata.partTolerances).toEqual({ f_a: 0.01, f_b: 0.01, rate: 0.01 });
    }
  });
});
