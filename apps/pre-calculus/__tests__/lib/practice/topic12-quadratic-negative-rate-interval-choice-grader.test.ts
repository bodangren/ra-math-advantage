import { describe, expect, it } from "vitest";

import { generateTopic12QuadraticNegativeRateIntervalChoiceOutput } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic12QuadraticNegativeRateIntervalChoice,
  type Topic12QuadraticNegativeRateIntervalChoiceAnswers,
} from "../../../lib/practice/topic12-quadratic-negative-rate-interval-choice";

describe("topic12 quadratic negative-rate interval choice grader", () => {
  it("gives seed 0 credit only for option D with the exact result shape", () => {
    const results = ["A", "B", "C", "D"].map((selectedOptionId) =>
      gradeTopic12QuadraticNegativeRateIntervalChoice(0, { selectedOptionId }),
    );

    expect(results.map((result) => result.score)).toEqual([0, 0, 0, 1]);
    expect(results[3]).toEqual({
      score: 1,
      maxScore: 1,
      parts: [
        {
          partId: "selectedOptionId",
          rawAnswer: "D",
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
  });

  it("grades the server-generated answer for representative nonzero seeds", () => {
    const seeds = [1, 2, 3, 17, 43];
    const correctLabels = seeds.map((seed) => {
      const expected = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).expectedAnswer
        .selectedOptionId as string;
      const result = gradeTopic12QuadraticNegativeRateIntervalChoice(seed, {
        selectedOptionId: expected,
      });

      expect(result.score).toBe(1);
      expect(result.parts[0]).toEqual({
        partId: "selectedOptionId",
        rawAnswer: expected,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      });
      return expected;
    });

    expect(new Set(correctLabels).size).toBeGreaterThan(1);
  });

  it("rejects a different valid label for a generated nonzero answer", () => {
    const seed = 17;
    const expected = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).expectedAnswer
      .selectedOptionId as string;
    const wrong = ["A", "B", "C", "D"].find((label) => label !== expected)!;

    expect(
      gradeTopic12QuadraticNegativeRateIntervalChoice(seed, { selectedOptionId: wrong }),
    ).toEqual({
      score: 0,
      maxScore: 1,
      parts: [
        {
          partId: "selectedOptionId",
          rawAnswer: wrong,
          isCorrect: false,
          score: 0,
          maxScore: 1,
        },
      ],
    });
  });

  it("keeps malformed answers raw and incorrect without adding authority", () => {
    for (const rawAnswer of ["", "d", " D ", "Z", null, 42, ["D"]]) {
      const result = gradeTopic12QuadraticNegativeRateIntervalChoice(0, {
        selectedOptionId: rawAnswer as string,
      });

      expect(result).toEqual({
        score: 0,
        maxScore: 1,
        parts: [
          {
            partId: "selectedOptionId",
            rawAnswer,
            isCorrect: false,
            score: 0,
            maxScore: 1,
          },
        ],
      });
    }
  });

  it("passes invalid seeds to the shared generator", () => {
    const answers: Topic12QuadraticNegativeRateIntervalChoiceAnswers = { selectedOptionId: "D" };

    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => gradeTopic12QuadraticNegativeRateIntervalChoice(seed, answers)).toThrow(
        RangeError,
      );
    }
  });
});
