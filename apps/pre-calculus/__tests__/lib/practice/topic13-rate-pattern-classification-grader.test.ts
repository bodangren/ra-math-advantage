import { describe, expect, it } from "vitest";

import { generateTopic13RatePatternClassificationOutput } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic13RatePatternClassification,
  type Topic13RatePatternClassificationAnswers,
} from "../../../lib/practice/topic13-rate-pattern-classification";

const CLASSIFICATIONS = ["linear", "quadratic", "neither", "cannot_determine"] as const;
const CASE_IDS = ["a", "b", "c"] as const;
const AUTHORITY_KEYS = [
  "expectedAnswer",
  "correctAnswer",
  "answerKey",
  "gradingMetadata",
  "solution",
  "solutionSteps",
  "correctness",
  "correctClassifications",
];

type CaseId = (typeof CASE_IDS)[number];

function expectedAnswers(seed: number): Record<CaseId, string> {
  return generateTopic13RatePatternClassificationOutput(seed).expectedAnswer as Record<
    CaseId,
    string
  >;
}

function makeAnswers(values: Record<CaseId, unknown>): Topic13RatePatternClassificationAnswers {
  return values as Topic13RatePatternClassificationAnswers;
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

describe("topic13 rate-pattern classification grader", () => {
  it("grades the exact seed-0 classifications with partial credit and the full result shape", () => {
    const expected = expectedAnswers(0);
    expect(expected).toEqual({ a: "quadratic", b: "linear", c: "quadratic" });

    const allCorrect = gradeTopic13RatePatternClassification(0, makeAnswers(expected));
    expect(allCorrect).toEqual({
      score: 3,
      maxScore: 3,
      parts: [
        { partId: "a", rawAnswer: "quadratic", isCorrect: true, score: 1, maxScore: 1 },
        { partId: "b", rawAnswer: "linear", isCorrect: true, score: 1, maxScore: 1 },
        { partId: "c", rawAnswer: "quadratic", isCorrect: true, score: 1, maxScore: 1 },
      ],
    });
    expectNoAuthority(allCorrect);

    const mixed = gradeTopic13RatePatternClassification(
      0,
      makeAnswers({
        a: "quadratic",
        b: "neither",
        c: "quadratic",
      }),
    );
    expect(mixed.score).toBe(2);
    expect(mixed.parts).toEqual([
      { partId: "a", rawAnswer: "quadratic", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "b", rawAnswer: "neither", isCorrect: false, score: 0, maxScore: 1 },
      { partId: "c", rawAnswer: "quadratic", isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expectNoAuthority(mixed);
  });

  it("grades only the expected seed-0 combination across all 4^3 valid combinations", () => {
    const expected = expectedAnswers(0);
    for (const a of CLASSIFICATIONS) {
      for (const b of CLASSIFICATIONS) {
        for (const c of CLASSIFICATIONS) {
          const answers = { a, b, c };
          const result = gradeTopic13RatePatternClassification(0, answers);
          const expectedParts = CASE_IDS.map((partId) => ({
            partId,
            rawAnswer: answers[partId],
            isCorrect: answers[partId] === expected[partId],
            score: answers[partId] === expected[partId] ? 1 : 0,
            maxScore: 1,
          }));
          expect(result.parts).toEqual(expectedParts);
          expect(result.score).toBe(expectedParts.reduce((total, part) => total + part.score, 0));
          expect(result.maxScore).toBe(3);
        }
      }
    }
  });

  it("uses live generated answers for representative nonzero seeds", () => {
    for (const seed of [1, 2, 3, 17, 43]) {
      const expected = expectedAnswers(seed);
      expect(gradeTopic13RatePatternClassification(seed, makeAnswers(expected)).score).toBe(3);

      for (const caseId of CASE_IDS) {
        const wrong = CLASSIFICATIONS.find(
          (classification) => classification !== expected[caseId],
        )!;
        const result = gradeTopic13RatePatternClassification(
          seed,
          makeAnswers({
            ...expected,
            [caseId]: wrong,
          }),
        );
        expect(result.score).toBe(2);
        expect(result.parts.filter((part) => !part.isCorrect).map((part) => part.partId)).toEqual([
          caseId,
        ]);
        expect(result.parts.find((part) => part.partId === caseId)?.rawAnswer).toBe(wrong);
      }
    }
  });

  it("keeps malformed field values raw and preserves credit for other correct fields", () => {
    const expected = expectedAnswers(0);
    for (const caseId of CASE_IDS) {
      for (const malformed of [null, 42, ["quadratic"]]) {
        const result = gradeTopic13RatePatternClassification(
          0,
          makeAnswers({
            ...expected,
            [caseId]: malformed,
          }),
        );
        expect(result.score).toBe(2);
        expect(result.parts.find((part) => part.partId === caseId)).toEqual({
          partId: caseId,
          rawAnswer: malformed,
          isCorrect: false,
          score: 0,
          maxScore: 1,
        });
        expect(
          result.parts.filter((part) => part.partId !== caseId).every((part) => part.isCorrect),
        ).toBe(true);
      }
    }
  });

  it("passes invalid seeds through to the shared generator", () => {
    const answers = makeAnswers({ a: "quadratic", b: "linear", c: "quadratic" });
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => gradeTopic13RatePatternClassification(seed, answers)).toThrow(RangeError);
    }
  });
});
