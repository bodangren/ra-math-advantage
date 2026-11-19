import { describe, expect, it } from "vitest";

import { generateTopic14PolynomialExtremaFromGraph } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic14PolynomialExtremaFromGraph,
  type Topic14PolynomialExtremaFromGraphAnswers,
} from "../../../lib/practice/topic14-polynomial-extrema-from-graph";

const PART_IDS = ["relative_minimum_x", "relative_maximum_x", "absolute_minimum_x"] as const;
type PartId = (typeof PART_IDS)[number];

const SOURCE_ANSWERS = {
  relative_minimum_x: "1",
  relative_maximum_x: "4",
  absolute_minimum_x: "1",
} as const;

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "normalizedAnswer",
  "solution",
  "solutionSteps",
  "authority",
] as const;

function makeAnswers(
  values: Partial<Record<PartId, unknown>>,
): Topic14PolynomialExtremaFromGraphAnswers {
  return values as Topic14PolynomialExtremaFromGraphAnswers;
}

function answersFromPublicPoints(seed: number): Record<PartId, string> {
  const variant = generateTopic14PolynomialExtremaFromGraph(seed);
  const minimums = variant.points.filter(
    (point, index) =>
      index > 0 &&
      index < variant.points.length - 1 &&
      point.y < variant.points[index - 1]!.y &&
      point.y < variant.points[index + 1]!.y,
  );
  const maximums = variant.points.filter(
    (point, index) =>
      index > 0 &&
      index < variant.points.length - 1 &&
      point.y > variant.points[index - 1]!.y &&
      point.y > variant.points[index + 1]!.y,
  );
  const absoluteMinimum = variant.points.reduce((lowest, point) =>
    point.y < lowest.y ? point : lowest,
  );
  expect(minimums).toHaveLength(1);
  expect(maximums).toHaveLength(1);
  return {
    relative_minimum_x: String(minimums[0]!.x),
    relative_maximum_x: String(maximums[0]!.x),
    absolute_minimum_x: String(absoluteMinimum.x),
  };
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
  result: ReturnType<typeof gradeTopic14PolynomialExtremaFromGraph>,
): void {
  expect(Object.keys(result).sort()).toEqual(["maxScore", "parts", "score"]);
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
  }
  expectNoAuthority(result);
}

describe("topic14 polynomial extrema from graph grader", () => {
  it("grades the exact seed-0 source answers and preserves the exact result shape", () => {
    const result = gradeTopic14PolynomialExtremaFromGraph(0, SOURCE_ANSWERS);
    expect(result).toEqual({
      score: 3,
      maxScore: 3,
      parts: PART_IDS.map((partId) => ({
        partId,
        rawAnswer: SOURCE_ANSWERS[partId],
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    });
    expectExactResultShape(result);

    const wrong = gradeTopic14PolynomialExtremaFromGraph(
      0,
      makeAnswers({
        ...SOURCE_ANSWERS,
        relative_maximum_x: "3",
      }),
    );
    expect(wrong.score).toBe(2);
    expect(wrong.parts[1]).toEqual({
      partId: "relative_maximum_x",
      rawAnswer: "3",
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
    expectExactResultShape(wrong);
  });

  it("accepts ordinary decimal forms while preserving raw strings", () => {
    const answers = makeAnswers({
      relative_minimum_x: "1.0",
      relative_maximum_x: "+4",
      absolute_minimum_x: " 1. ",
    });
    const result = gradeTopic14PolynomialExtremaFromGraph(0, answers);
    expect(result.score).toBe(3);
    expect(result.parts.map((part) => part.rawAnswer)).toEqual(Object.values(answers));
    expectExactResultShape(result);
  });

  it("uses independently derived public graph extrema for representative seeds", () => {
    for (const seed of [1, 2, 3, 17, 43, 9999]) {
      const answers = answersFromPublicPoints(seed);
      const result = gradeTopic14PolynomialExtremaFromGraph(seed, makeAnswers(answers));
      expect(result.score).toBe(3);
      expectExactResultShape(result);
      for (const partId of PART_IDS) {
        const wrong = gradeTopic14PolynomialExtremaFromGraph(
          seed,
          makeAnswers({
            ...answers,
            [partId]: "999",
          }),
        );
        expect(wrong.score).toBe(2);
        expect(wrong.parts.find((part) => part.partId === partId)?.rawAnswer).toBe("999");
      }
    }
  });

  it("awards one point independently for each answer field", () => {
    for (const partId of PART_IDS) {
      const result = gradeTopic14PolynomialExtremaFromGraph(
        0,
        makeAnswers({
          ...SOURCE_ANSWERS,
          [partId]: "999",
        }),
      );
      expect(result.score).toBe(2);
      expect(result.parts.find((part) => part.partId === partId)?.isCorrect).toBe(false);
      expect(
        result.parts.filter((part) => part.partId !== partId).every((part) => part.isCorrect),
      ).toBe(true);
    }
  });

  it("rejects malformed values without changing other points or raw values", () => {
    const malformed: unknown[] = [
      "",
      " ",
      "+",
      "-",
      ".",
      "+.",
      "-.",
      "1e3",
      "0x10",
      "NaN",
      "Infinity",
      "4x",
      "1 2",
      null,
      undefined,
      true,
      false,
      1,
      [],
      {},
    ];
    for (const partId of PART_IDS) {
      for (const rawAnswer of malformed) {
        const result = gradeTopic14PolynomialExtremaFromGraph(
          0,
          makeAnswers({
            ...SOURCE_ANSWERS,
            [partId]: rawAnswer,
          }),
        );
        expect(result.score).toBe(2);
        expect(result.parts.find((part) => part.partId === partId)).toEqual({
          partId,
          rawAnswer,
          isCorrect: false,
          score: 0,
          maxScore: 1,
        });
        expect(
          result.parts.filter((part) => part.partId !== partId).every((part) => part.isCorrect),
        ).toBe(true);
        expectExactResultShape(result);
      }
    }
  });

  it("fails closed for missing fields and invalid seeds", () => {
    for (const partId of PART_IDS) {
      const answers = { ...SOURCE_ANSWERS };
      delete answers[partId];
      const result = gradeTopic14PolynomialExtremaFromGraph(0, makeAnswers(answers));
      expect(result.score).toBe(2);
      expect(result.parts.find((part) => part.partId === partId)).toMatchObject({
        partId,
        rawAnswer: undefined,
        isCorrect: false,
        score: 0,
        maxScore: 1,
      });
    }

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic14PolynomialExtremaFromGraph(seed, SOURCE_ANSWERS)).toThrow(
        RangeError,
      );
    }
  });
});
