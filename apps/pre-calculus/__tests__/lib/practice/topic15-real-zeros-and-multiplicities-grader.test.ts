import { describe, expect, it } from "vitest";

import { generateTopic15RealZerosAndMultiplicitiesOutput } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic15RealZerosAndMultiplicities,
  type Topic15RealZerosAndMultiplicitiesAnswers,
} from "../../../lib/practice/topic15-real-zeros-and-multiplicities";

const PART_IDS = ["a", "b"] as const;
type Pair = { zero: number; multiplicity: number };

const SOURCE_ANSWERS = {
  a: [
    { zero: -1, multiplicity: 1 },
    { zero: 0, multiplicity: 3 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -2, multiplicity: 1 },
    { zero: 2, multiplicity: 5 },
  ],
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

function makeAnswers(values: Record<string, unknown>): Topic15RealZerosAndMultiplicitiesAnswers {
  return values as unknown as Topic15RealZerosAndMultiplicitiesAnswers;
}

function liveAnswers(seed: number): Topic15RealZerosAndMultiplicitiesAnswers {
  return generateTopic15RealZerosAndMultiplicitiesOutput(seed)
    .expectedAnswer as unknown as Topic15RealZerosAndMultiplicitiesAnswers;
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
  result: ReturnType<typeof gradeTopic15RealZerosAndMultiplicities>,
): void {
  expect(Object.keys(result).sort()).toEqual(["maxScore", "parts", "score"]);
  expect(result.maxScore).toBe(2);
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
    expect(part.maxScore).toBe(1);
    expect(part.score === 0 || part.score === 1).toBe(true);
  }
  expectNoAuthority(result);
}

describe("topic15 real zeros and multiplicities grader", () => {
  it("grades the complete seed-0 source answers with exact shapes", () => {
    const result = gradeTopic15RealZerosAndMultiplicities(0, SOURCE_ANSWERS);

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

  it("uses live generator authority for every seed and ignores pair order", () => {
    for (let seed = 0; seed <= 200; seed += 1) {
      const answers = liveAnswers(seed);
      const reversed: Topic15RealZerosAndMultiplicitiesAnswers = {
        a: [...(answers.a as readonly Pair[])].reverse(),
        b: [...(answers.b as readonly Pair[])].reverse(),
      };
      const result = gradeTopic15RealZerosAndMultiplicities(seed, reversed);
      expect(result.score).toBe(2);
      expect(result.parts.every((part) => part.isCorrect)).toBe(true);
      expectExactResultShape(result);
    }
  });

  it("preserves independent part credit for a wrong zero or multiplicity", () => {
    const wrongZero = makeAnswers({
      a: [{ ...SOURCE_ANSWERS.a[0], zero: 2 }, ...SOURCE_ANSWERS.a.slice(1)],
      b: SOURCE_ANSWERS.b,
    });
    const wrongMultiplicity = makeAnswers({
      a: SOURCE_ANSWERS.a,
      b: [SOURCE_ANSWERS.b[0], { ...SOURCE_ANSWERS.b[1], multiplicity: 4 }],
    });

    expect(gradeTopic15RealZerosAndMultiplicities(0, wrongZero).score).toBe(1);
    expect(gradeTopic15RealZerosAndMultiplicities(0, wrongZero).parts[0]?.isCorrect).toBe(false);
    expect(gradeTopic15RealZerosAndMultiplicities(0, wrongMultiplicity).score).toBe(1);
    expect(gradeTopic15RealZerosAndMultiplicities(0, wrongMultiplicity).parts[1]?.isCorrect).toBe(
      false,
    );
  });

  it("keeps malformed parts wrong without throwing or changing raw answers", () => {
    const malformed: unknown[] = [
      null,
      undefined,
      "not an array",
      [],
      [{ zero: 0, multiplicity: 1 }],
      [
        { zero: 0, multiplicity: 1 },
        { zero: 1, multiplicity: 1 },
        { zero: 2, multiplicity: 1 },
        { zero: 3, multiplicity: 1 },
      ],
      [
        { zero: 0, multiplicity: 1 },
        { zero: 0, multiplicity: 2 },
      ],
      [
        { zero: 0, multiplicity: 1, extra: true },
        { zero: 1, multiplicity: 1 },
      ],
      [{ multiplicity: 1 }, { zero: 1, multiplicity: 1 }],
      [
        { zero: 0.5, multiplicity: 1 },
        { zero: 1, multiplicity: 1 },
      ],
      [
        { zero: Number.MAX_SAFE_INTEGER + 1, multiplicity: 1 },
        { zero: 1, multiplicity: 1 },
      ],
      [
        { zero: 0, multiplicity: 0 },
        { zero: 1, multiplicity: 1 },
      ],
      [
        { zero: 0, multiplicity: 6.5 },
        { zero: 1, multiplicity: 1 },
      ],
      [
        { zero: 0, multiplicity: "1" },
        { zero: 1, multiplicity: 1 },
      ],
    ];

    for (const partId of PART_IDS) {
      for (const rawAnswer of malformed) {
        const result = gradeTopic15RealZerosAndMultiplicities(
          0,
          makeAnswers({
            a: partId === "a" ? rawAnswer : SOURCE_ANSWERS.a,
            b: partId === "b" ? rawAnswer : SOURCE_ANSWERS.b,
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
        expect(result.parts.find((part) => part.partId !== partId)?.isCorrect).toBe(true);
        expectExactResultShape(result);
      }
    }

    const missing = gradeTopic15RealZerosAndMultiplicities(0, makeAnswers({ a: SOURCE_ANSWERS.a }));
    expect(missing.score).toBe(1);
    expect(missing.parts[1]?.rawAnswer).toBeUndefined();

    const extra = gradeTopic15RealZerosAndMultiplicities(
      0,
      makeAnswers({
        ...SOURCE_ANSWERS,
        extra: SOURCE_ANSWERS.a,
      }),
    );
    expect(extra.score).toBe(2);
    expectExactResultShape(extra);
  });

  it("is deterministic, preserves malformed raw values, and propagates invalid seeds", () => {
    const malformedAnswers = makeAnswers({
      a: [{ zero: "0", multiplicity: 1 }],
      b: SOURCE_ANSWERS.b,
    });
    const first = gradeTopic15RealZerosAndMultiplicities(17, malformedAnswers);
    expect(first).toEqual(gradeTopic15RealZerosAndMultiplicities(17, malformedAnswers));
    expect(first.parts[0]?.rawAnswer).toBe(malformedAnswers.a);

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic15RealZerosAndMultiplicities(seed, SOURCE_ANSWERS)).toThrow(
        RangeError,
      );
    }
  });
});
