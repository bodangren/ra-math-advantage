import { describe, expect, it } from "vitest";

import { generateTopic14PolynomialEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic14PolynomialEndBehavior,
  type Topic14PolynomialEndBehaviorAnswers,
} from "../../../lib/practice/topic14-polynomial-end-behavior";

const PART_IDS = ["leftEnd", "rightEnd"] as const;
type PartId = (typeof PART_IDS)[number];

const SOURCE_ANSWERS = {
  leftEnd: "negative_infinity",
  rightEnd: "negative_infinity",
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
  "correctness",
] as const;

function makeAnswers(
  values: Partial<Record<PartId, unknown>>,
): Topic14PolynomialEndBehaviorAnswers {
  return values as unknown as Topic14PolynomialEndBehaviorAnswers;
}

function independentAnswers(seed: number): Topic14PolynomialEndBehaviorAnswers {
  const output = generateTopic14PolynomialEndBehaviorOutput(seed);
  return output.expectedAnswer as unknown as Topic14PolynomialEndBehaviorAnswers;
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
  result: ReturnType<typeof gradeTopic14PolynomialEndBehavior>,
): void {
  expect(Object.keys(result).sort()).toEqual(["maxScore", "parts", "score"]);
  expect(result.parts).toHaveLength(2);
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

describe("topic14 polynomial end behavior grader", () => {
  it("grades the source answers with the exact two-part result shape", () => {
    const result = gradeTopic14PolynomialEndBehavior(0, SOURCE_ANSWERS);

    expect(result).toEqual({
      score: 2,
      maxScore: 2,
      parts: PART_IDS.map((partId) => ({
        partId,
        rawAnswer: SOURCE_ANSWERS[partId],
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    });
    expectExactResultShape(result);
  });

  it("uses live generator authority across all four sign and parity patterns", () => {
    const combinations = new Set<string>();

    for (let seed = 0; seed <= 200; seed += 1) {
      const answers = independentAnswers(seed);
      combinations.add(`${answers.leftEnd}/${answers.rightEnd}`);
      const result = gradeTopic14PolynomialEndBehavior(seed, answers);
      expect(result.score).toBe(2);
      expect(result.parts.every((part) => part.isCorrect)).toBe(true);
      expectExactResultShape(result);
    }

    expect(combinations).toEqual(
      new Set([
        "positive_infinity/positive_infinity",
        "positive_infinity/negative_infinity",
        "negative_infinity/positive_infinity",
        "negative_infinity/negative_infinity",
      ]),
    );
  });

  it("awards independent partial credit and preserves raw values", () => {
    const leftWrong = gradeTopic14PolynomialEndBehavior(
      0,
      makeAnswers({
        leftEnd: "positive_infinity",
        rightEnd: SOURCE_ANSWERS.rightEnd,
      }),
    );
    const rightWrong = gradeTopic14PolynomialEndBehavior(
      0,
      makeAnswers({
        leftEnd: SOURCE_ANSWERS.leftEnd,
        rightEnd: "positive_infinity",
      }),
    );

    expect(leftWrong.score).toBe(1);
    expect(rightWrong.score).toBe(1);
    expect(leftWrong.parts[0]).toMatchObject({
      rawAnswer: "positive_infinity",
      isCorrect: false,
      score: 0,
    });
    expect(rightWrong.parts[1]).toMatchObject({
      rawAnswer: "positive_infinity",
      isCorrect: false,
      score: 0,
    });

    const zero = gradeTopic14PolynomialEndBehavior(
      0,
      makeAnswers({
        leftEnd: "positive_infinity",
        rightEnd: "positive_infinity",
      }),
    );
    expect(zero.score).toBe(0);
    expect(zero.parts.map((part) => part.rawAnswer)).toEqual([
      "positive_infinity",
      "positive_infinity",
    ]);
    expectExactResultShape(zero);
  });

  it("keeps malformed, missing, and non-string answers wrong without erasing other credit", () => {
    const malformed: unknown[] = [
      "",
      " positive_infinity",
      "positive_infinity ",
      "Positive_infinity",
      "positive infinity",
      "positive",
      "1",
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
        const result = gradeTopic14PolynomialEndBehavior(
          0,
          makeAnswers({
            ...SOURCE_ANSWERS,
            [partId]: rawAnswer,
          }),
        );
        expect(result.score).toBe(1);
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

    const missing = gradeTopic14PolynomialEndBehavior(
      0,
      makeAnswers({ leftEnd: SOURCE_ANSWERS.leftEnd }),
    );
    expect(missing.score).toBe(1);
    expect(missing.parts[1]?.rawAnswer).toBeUndefined();

    const extra = gradeTopic14PolynomialEndBehavior(0, {
      ...SOURCE_ANSWERS,
      extra: "ignored",
    } as Topic14PolynomialEndBehaviorAnswers & { extra: string });
    expect(extra.score).toBe(2);
    expectExactResultShape(extra);
  });

  it("is deterministic and passes invalid seeds through unchanged", () => {
    expect(gradeTopic14PolynomialEndBehavior(17, independentAnswers(17))).toEqual(
      gradeTopic14PolynomialEndBehavior(17, independentAnswers(17)),
    );

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic14PolynomialEndBehavior(seed, SOURCE_ANSWERS)).toThrow(RangeError);
    }
  });
});
