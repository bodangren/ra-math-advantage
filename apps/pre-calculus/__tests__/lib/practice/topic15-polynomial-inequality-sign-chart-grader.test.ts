import { describe, expect, it } from "vitest";

import { generateTopic15PolynomialInequalityOutput } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic15PolynomialInequalitySignChart,
  type Topic15PolynomialInequalitySignChartAnswers,
} from "../../../lib/practice/topic15-polynomial-inequality-sign-chart";

const SOURCE_ANSWER = {
  roots: [-4, -1, 3],
  intervalSigns: ["-", "+", "-", "+"],
  solution: "(-4, -1) ∪ (3, ∞)",
} as const;
const PART_IDS = ["roots", "intervalSigns", "solution"] as const;
const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "normalizedAnswer",
  "solutionSteps",
  "authority",
  "correctness",
  "nodeId",
  "mastery",
] as const;

type Sign = "+" | "-";
type Operator = "<" | "<=" | ">" | ">=";
type GeneratedOutput = ReturnType<typeof generateTopic15PolynomialInequalityOutput>;

function makeAnswers(values: Record<string, unknown>): Topic15PolynomialInequalitySignChartAnswers {
  return values as unknown as Topic15PolynomialInequalitySignChartAnswers;
}

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectObjectKeys(item, keys));
  else if (value && typeof value === "object")
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectObjectKeys(nested, keys);
    });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  const keys = collectObjectKeys(value);
  for (const key of AUTHORITY_KEYS) expect(keys).not.toContain(key);
}

function expectExactResultShape(
  result: ReturnType<typeof gradeTopic15PolynomialInequalitySignChart>,
): void {
  expect(Object.keys(result).sort()).toEqual(["maxScore", "parts", "score"]);
  expect(result.score).toBeGreaterThanOrEqual(0);
  expect(result.score).toBeLessThanOrEqual(3);
  expect(result.maxScore).toBe(3);
  expect(result.parts).toHaveLength(3);
  expect(result.parts.map((part) => part.partId)).toEqual(PART_IDS);
  for (const part of result.parts) {
    expect(Object.keys(part).sort()).toEqual([
      "isCorrect",
      "maxScore",
      "partId",
      "rawAnswer",
      "score",
    ]);
    expect(part.maxScore).toBe(1);
    expect(part.score === 0 || part.score === 1).toBe(true);
  }
  expectNoAuthority(result);
}

function endpointWithAlternateSpelling(value: string): string {
  if (value === "-∞") return "-infinity";
  if (value === "∞") return "infinity";
  return `${value}.0`;
}

function equivalentSolution(solution: string): string {
  const components = solution.split(" ∪ ").map((component) => {
    const opening = component[0];
    const closing = component.at(-1);
    const body = component.slice(1, -1);
    const comma = body.indexOf(",");
    const left = body.slice(0, comma).trim();
    const right = body.slice(comma + 1).trim();
    return `${opening}${endpointWithAlternateSpelling(left)},${endpointWithAlternateSpelling(right)}${closing}`;
  });
  return components.reverse().join(" U ");
}

function rendererVariant(output: GeneratedOutput): {
  readonly operator: Operator;
} {
  return output.data.rendererProps as { operator: Operator };
}

function liveAnswers(output: GeneratedOutput): Topic15PolynomialInequalitySignChartAnswers {
  return output.expectedAnswer as unknown as Topic15PolynomialInequalitySignChartAnswers;
}

describe("topic15 polynomial inequality sign-chart grader", () => {
  it("grades the literal source answer with three ordered parts", () => {
    const output = generateTopic15PolynomialInequalityOutput(0);
    expect(liveAnswers(output)).toEqual(SOURCE_ANSWER);

    const result = gradeTopic15PolynomialInequalitySignChart(0, SOURCE_ANSWER);

    expect(result).toEqual({
      score: 3,
      maxScore: 3,
      parts: [
        { partId: "roots", rawAnswer: SOURCE_ANSWER.roots, isCorrect: true, score: 1, maxScore: 1 },
        {
          partId: "intervalSigns",
          rawAnswer: SOURCE_ANSWER.intervalSigns,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "solution",
          rawAnswer: SOURCE_ANSWER.solution,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expectExactResultShape(result);
  });

  it("normalizes root order and equivalent interval notation while preserving raw answers", () => {
    for (let seed = 0; seed <= 200; seed += 1) {
      const output = generateTopic15PolynomialInequalityOutput(seed);
      const expected = liveAnswers(output);
      const answers = {
        roots: [...expected.roots].reverse(),
        intervalSigns: [...expected.intervalSigns],
        solution: equivalentSolution(expected.solution),
      };
      const result = gradeTopic15PolynomialInequalitySignChart(seed, answers);

      expect(result.score).toBe(3);
      expect(result.parts.every((part) => part.isCorrect)).toBe(true);
      expect(result.parts[0]?.rawAnswer).toBe(answers.roots);
      expect(result.parts[1]?.rawAnswer).toBe(answers.intervalSigns);
      expect(result.parts[2]?.rawAnswer).toBe(answers.solution);
      expectExactResultShape(result);
    }
  });

  it("requires and accepts isolated roots in inclusive solutions", () => {
    const sampledSeed = Array.from({ length: 198 }, (_, index) => index + 3).find((seed) => {
      const output = generateTopic15PolynomialInequalityOutput(seed);
      const variant = rendererVariant(output);
      return variant.operator === ">=" && liveAnswers(output).solution.includes("] ∪ [");
    });

    expect(sampledSeed).toBeDefined();
    const output = generateTopic15PolynomialInequalityOutput(sampledSeed as number);
    const result = gradeTopic15PolynomialInequalitySignChart(
      sampledSeed as number,
      liveAnswers(output),
    );

    expect(liveAnswers(output).solution).toMatch(/^\[-?\d+, -?\d+\] ∪ /);
    expect(result.score).toBe(3);
    expect(result.parts[2]?.isCorrect).toBe(true);
    expectExactResultShape(result);
  });

  it("awards one point per part and keeps each wrong raw answer", () => {
    const correct = gradeTopic15PolynomialInequalitySignChart(0, SOURCE_ANSWER);
    const wrongRoots = makeAnswers({
      roots: [99, -1, 3],
      intervalSigns: SOURCE_ANSWER.intervalSigns,
      solution: SOURCE_ANSWER.solution,
    });
    const wrongSigns = makeAnswers({
      roots: SOURCE_ANSWER.roots,
      intervalSigns: ["+", "+", "-", "+"],
      solution: SOURCE_ANSWER.solution,
    });
    const wrongSolution = makeAnswers({
      roots: SOURCE_ANSWER.roots,
      intervalSigns: SOURCE_ANSWER.intervalSigns,
      solution: "(-∞, ∞)",
    });

    for (const [answers, wrongPartId, wrongRawAnswer] of [
      [wrongRoots, "roots", wrongRoots.roots],
      [wrongSigns, "intervalSigns", wrongSigns.intervalSigns],
      [wrongSolution, "solution", wrongSolution.solution],
    ] as const) {
      const result = gradeTopic15PolynomialInequalitySignChart(0, answers);
      expect(result.score).toBe(2);
      expect(result.parts.find((part) => part.partId === wrongPartId)?.isCorrect).toBe(false);
      expect(result.parts.find((part) => part.partId === wrongPartId)?.rawAnswer).toBe(
        wrongRawAnswer,
      );
      expect(
        result.parts.filter((part) => part.partId !== wrongPartId).every((part) => part.isCorrect),
      ).toBe(true);
      expectExactResultShape(result);
    }

    expect(correct.score).toBe(3);
  });

  it("rejects malformed part values without throwing or changing raw answers", () => {
    const malformed: Array<{ partId: string; rawAnswer: unknown }> = [
      { partId: "roots", rawAnswer: null },
      { partId: "roots", rawAnswer: ["-4", -1, 3] },
      { partId: "roots", rawAnswer: [-4, Number.NaN, 3] },
      { partId: "intervalSigns", rawAnswer: null },
      { partId: "intervalSigns", rawAnswer: ["-", "bad", "-", "+"] },
      { partId: "solution", rawAnswer: null },
      { partId: "solution", rawAnswer: 42 },
      { partId: "solution", rawAnswer: "" },
      { partId: "solution", rawAnswer: "not an interval" },
    ];

    for (const { partId, rawAnswer } of malformed) {
      const answers = makeAnswers({
        roots: partId === "roots" ? rawAnswer : SOURCE_ANSWER.roots,
        intervalSigns: partId === "intervalSigns" ? rawAnswer : SOURCE_ANSWER.intervalSigns,
        solution: partId === "solution" ? rawAnswer : SOURCE_ANSWER.solution,
      });
      const result = gradeTopic15PolynomialInequalitySignChart(0, answers);

      expect(result.score).toBe(2);
      expect(result.parts.find((part) => part.partId === partId)?.rawAnswer).toBe(rawAnswer);
      expect(result.parts.find((part) => part.partId === partId)?.isCorrect).toBe(false);
      expectExactResultShape(result);
    }
  });

  it("rejects invalid interval grammar and required-set changes", () => {
    const invalidSolutions = [
      "(-∞, 5)",
      "(5, -2)",
      "[-∞, 5]",
      "(-∞, 5] ∪ (4, 6)",
      "(-∞, 5] because",
      "(-∞, 5] &&",
    ];

    for (const solution of invalidSolutions) {
      const result = gradeTopic15PolynomialInequalitySignChart(1, {
        roots: [-2, 5],
        intervalSigns: ["-", "-", "+"],
        solution,
      });
      expect(result.score).toBe(2);
      expect(result.parts[2]?.isCorrect).toBe(false);
      expect(result.parts[2]?.rawAnswer).toBe(solution);
      expectExactResultShape(result);
    }

    const sampledSeed = Array.from({ length: 198 }, (_, index) => index + 3).find((seed) => {
      const output = generateTopic15PolynomialInequalityOutput(seed);
      return (
        rendererVariant(output).operator === ">=" && liveAnswers(output).solution.includes("] ∪ [")
      );
    });
    expect(sampledSeed).toBeDefined();
    const expected = liveAnswers(generateTopic15PolynomialInequalityOutput(sampledSeed as number));
    const missingSingleton = expected.solution.replace(/^\[[^,]+, [^\]]+\] ∪ /, "");
    const missingResult = gradeTopic15PolynomialInequalitySignChart(sampledSeed as number, {
      roots: expected.roots,
      intervalSigns: expected.intervalSigns,
      solution: missingSingleton,
    });
    expect(missingResult.score).toBe(2);
    expect(missingResult.parts[2]?.isCorrect).toBe(false);
    expect(missingResult.parts[2]?.rawAnswer).toBe(missingSingleton);
    expectExactResultShape(missingResult);
  });

  it("is deterministic, preserves bounded output keys, and propagates invalid seeds", () => {
    const answers = {
      roots: [...SOURCE_ANSWER.roots].reverse(),
      intervalSigns: [...SOURCE_ANSWER.intervalSigns] as Sign[],
      solution: equivalentSolution(SOURCE_ANSWER.solution),
    };
    const first = gradeTopic15PolynomialInequalitySignChart(17, answers);
    expect(first).toEqual(gradeTopic15PolynomialInequalitySignChart(17, answers));
    expectExactResultShape(first);

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic15PolynomialInequalitySignChart(seed, SOURCE_ANSWER)).toThrow(
        RangeError,
      );
    }
  });
});
