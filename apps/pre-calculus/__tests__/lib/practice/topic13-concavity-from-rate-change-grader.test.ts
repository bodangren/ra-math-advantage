import { describe, expect, it } from "vitest";

import { generateTopic13ConcavityFromRateChangeOutput } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic13ConcavityFromRateChange,
  type Topic13ConcavityFromRateChangeAnswers,
} from "../../../lib/practice/topic13-concavity-from-rate-change";

const CLASSIFICATIONS = ["concave_up", "concave_down", "neither"] as const;
const AUTHORITY_KEYS = [
  "expectedAnswer",
  "correctAnswer",
  "answerKey",
  "gradingMetadata",
  "solution",
  "solutionSteps",
  "correctness",
];

function expectedClassification(seed: number): string {
  return (
    generateTopic13ConcavityFromRateChangeOutput(seed).expectedAnswer as { classification: string }
  ).classification;
}

function makeAnswers(classification: unknown): Topic13ConcavityFromRateChangeAnswers {
  return { classification } as Topic13ConcavityFromRateChangeAnswers;
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

describe("topic13 concavity-from-rate-change grader", () => {
  it("grades the exact seed-0 answer and returns the one-part result shape", () => {
    expect(expectedClassification(0)).toBe("concave_up");

    const correct = gradeTopic13ConcavityFromRateChange(0, makeAnswers("concave_up"));
    expect(correct).toEqual({
      score: 1,
      maxScore: 1,
      parts: [
        {
          partId: "classification",
          rawAnswer: "concave_up",
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expectNoAuthority(correct);

    const wrong = gradeTopic13ConcavityFromRateChange(0, makeAnswers("concave_down"));
    expect(wrong).toEqual({
      score: 0,
      maxScore: 1,
      parts: [
        {
          partId: "classification",
          rawAnswer: "concave_down",
          isCorrect: false,
          score: 0,
          maxScore: 1,
        },
      ],
    });
    expectNoAuthority(wrong);
  });

  it("grades only the live generator classification for all three classes", () => {
    for (const seed of [1, 2, 3]) {
      const expected = expectedClassification(seed);
      expect(CLASSIFICATIONS).toContain(expected);

      for (const classification of CLASSIFICATIONS) {
        const result = gradeTopic13ConcavityFromRateChange(seed, makeAnswers(classification));
        const isCorrect = classification === expected;
        expect(result).toEqual({
          score: isCorrect ? 1 : 0,
          maxScore: 1,
          parts: [
            {
              partId: "classification",
              rawAnswer: classification,
              isCorrect,
              score: isCorrect ? 1 : 0,
              maxScore: 1,
            },
          ],
        });
        expectNoAuthority(result);
      }
    }
    expect(expectedClassification(1)).toBe("concave_up");
    expect(expectedClassification(2)).toBe("concave_down");
    expect(expectedClassification(3)).toBe("neither");
  });

  it("keeps malformed raw values and does not erase valid grading authority", () => {
    for (const malformed of [null, 42, ["concave_up"]]) {
      const result = gradeTopic13ConcavityFromRateChange(0, makeAnswers(malformed));
      expect(result).toEqual({
        score: 0,
        maxScore: 1,
        parts: [
          {
            partId: "classification",
            rawAnswer: malformed,
            isCorrect: false,
            score: 0,
            maxScore: 1,
          },
        ],
      });
      expectNoAuthority(result);
    }
  });

  it("passes invalid seeds through to the shared generator", () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => gradeTopic13ConcavityFromRateChange(seed, makeAnswers("concave_up"))).toThrow(
        RangeError,
      );
    }
  });
});
