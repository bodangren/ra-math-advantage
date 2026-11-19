import { describe, expect, it } from "vitest";

import { generateTopic14PolynomialDegreeLeadingCoefficient } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic14PolynomialDegreeLeadingCoefficient,
  type Topic14PolynomialDegreeLeadingCoefficientAnswers,
} from "../../../lib/practice/topic14-polynomial-degree-leading-coefficient";

const PART_IDS = [
  "a_degree",
  "a_leading_coefficient",
  "b_degree",
  "b_leading_coefficient",
  "c_degree",
  "c_leading_coefficient",
] as const;
type PartId = (typeof PART_IDS)[number];

const SOURCE_ANSWERS = {
  a_degree: "4",
  a_leading_coefficient: "3",
  b_degree: "3",
  b_leading_coefficient: "-7",
  c_degree: "0",
  c_leading_coefficient: "4",
} as const;

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "leadingCoefficient",
  "solution",
  "solutionSteps",
  "degree",
] as const;

function makeAnswers(
  values: Partial<Record<PartId, unknown>>,
): Topic14PolynomialDegreeLeadingCoefficientAnswers {
  return values as Topic14PolynomialDegreeLeadingCoefficientAnswers;
}

function answersFromPublicTerms(seed: number): Record<PartId, string> {
  const variant = generateTopic14PolynomialDegreeLeadingCoefficient(seed);
  return Object.fromEntries(
    variant.items.flatMap((item) => {
      const leadingTerm = item.terms.reduce((leading, term) =>
        term.exponent > leading.exponent ? term : leading,
      );
      return [
        [`${item.id}_degree`, String(leadingTerm.exponent)],
        [`${item.id}_leading_coefficient`, String(leadingTerm.coefficient)],
      ];
    }),
  ) as Record<PartId, string>;
}

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectObjectKeys(nestedValue, keys);
    });
  }
  return keys;
}

function expectNoAuthority(value: unknown): void {
  const keys = collectObjectKeys(value);
  for (const key of AUTHORITY_KEYS) expect(keys).not.toContain(key);
}

function expectExactResultShape(
  result: ReturnType<typeof gradeTopic14PolynomialDegreeLeadingCoefficient>,
): void {
  expect(Object.keys(result).sort()).toEqual(["maxScore", "parts", "score"]);
  expect(result.parts).toHaveLength(6);
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

describe("topic14 polynomial degree and leading coefficient grader", () => {
  it("grades the exact seed-0 source answers with the exact full result shape", () => {
    const result = gradeTopic14PolynomialDegreeLeadingCoefficient(0, SOURCE_ANSWERS);
    expect(result).toEqual({
      score: 6,
      maxScore: 6,
      parts: PART_IDS.map((partId) => ({
        partId,
        rawAnswer: SOURCE_ANSWERS[partId],
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    });
    expectExactResultShape(result);

    const wrong = gradeTopic14PolynomialDegreeLeadingCoefficient(
      0,
      makeAnswers({
        ...SOURCE_ANSWERS,
        b_leading_coefficient: "7",
      }),
    );
    expect(wrong.score).toBe(5);
    expect(wrong.parts.find((part) => part.partId === "b_leading_coefficient")).toEqual({
      partId: "b_leading_coefficient",
      rawAnswer: "7",
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
    expectExactResultShape(wrong);
  });

  it("accepts ordinary decimal forms while preserving each raw string", () => {
    const answers = makeAnswers({
      a_degree: "4.0",
      a_leading_coefficient: "+3",
      b_degree: " 3 ",
      b_leading_coefficient: "-7.0",
      c_degree: "0.",
      c_leading_coefficient: " 4  ",
    });
    const result = gradeTopic14PolynomialDegreeLeadingCoefficient(0, answers);
    expect(result.score).toBe(6);
    expect(result.parts.map((part) => part.rawAnswer)).toEqual(Object.values(answers));
    expectExactResultShape(result);
  });

  it("awards independent partial credit for each of the six fields", () => {
    for (const partId of PART_IDS) {
      const answers = { ...SOURCE_ANSWERS, [partId]: "999" };
      const result = gradeTopic14PolynomialDegreeLeadingCoefficient(0, makeAnswers(answers));
      expect(result.score).toBe(5);
      expect(result.parts.find((part) => part.partId === partId)).toEqual({
        partId,
        rawAnswer: "999",
        isCorrect: false,
        score: 0,
        maxScore: 1,
      });
      expect(
        result.parts.filter((part) => part.partId !== partId).every((part) => part.isCorrect),
      ).toBe(true);
    }
  });

  it("uses independently derived answers from public terms for representative generated seeds", () => {
    for (const seed of [1, 2, 3, 17, 43]) {
      const answers = answersFromPublicTerms(seed);
      const result = gradeTopic14PolynomialDegreeLeadingCoefficient(seed, makeAnswers(answers));
      expect(result.score).toBe(6);
      for (const partId of PART_IDS) {
        const wrongAnswers = { ...answers, [partId]: "999" };
        const wrong = gradeTopic14PolynomialDegreeLeadingCoefficient(
          seed,
          makeAnswers(wrongAnswers),
        );
        expect(wrong.score).toBe(5);
        expect(wrong.parts.find((part) => part.partId === partId)?.rawAnswer).toBe("999");
      }
      expectExactResultShape(result);
    }
  });

  it("rejects malformed values without erasing the other five points", () => {
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
      4,
      [],
      {},
    ];
    for (const partId of PART_IDS) {
      for (const rawAnswer of malformed) {
        const result = gradeTopic14PolynomialDegreeLeadingCoefficient(
          0,
          makeAnswers({
            ...SOURCE_ANSWERS,
            [partId]: rawAnswer,
          }),
        );
        expect(result.score).toBe(5);
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
      const result = gradeTopic14PolynomialDegreeLeadingCoefficient(0, makeAnswers(answers));
      expect(result.score).toBe(5);
      expect(result.parts.find((part) => part.partId === partId)).toEqual({
        partId,
        rawAnswer: undefined,
        isCorrect: false,
        score: 0,
        maxScore: 1,
      });
    }

    const answers = makeAnswers(SOURCE_ANSWERS);
    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => gradeTopic14PolynomialDegreeLeadingCoefficient(seed, answers)).toThrow(
        RangeError,
      );
    }
  });
});
