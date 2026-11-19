import { describe, expect, it } from "vitest";

import { generateTopic12PointwiseLeastRateChoice } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic12PointwiseLeastRateChoice,
  type Topic12PointwiseLeastRateChoiceAnswers,
} from "../../../lib/practice/topic12-pointwise-least-rate-choice";

describe("topic12 pointwise least-rate choice grader", () => {
  it("gives seed 0 credit only for option D", () => {
    const results = ["A", "B", "C", "D"].map((selectedOptionId) =>
      gradeTopic12PointwiseLeastRateChoice(0, { selectedOptionId }),
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

  it("grades each generated correct option for representative nonzero seeds", () => {
    for (const seed of [1, 2, 3, 17, 43]) {
      const variant = generateTopic12PointwiseLeastRateChoice(seed);
      const result = gradeTopic12PointwiseLeastRateChoice(seed, {
        selectedOptionId: variant.correctOptionId,
      });

      expect(result.score).toBe(1);
      expect(result.parts[0]).toMatchObject({
        rawAnswer: variant.correctOptionId,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      });
    }
  });

  it("does not assume the seed-0 answer for a seed with a different correct option", () => {
    const variant = generateTopic12PointwiseLeastRateChoice(17);
    expect(variant.correctOptionId).toBe("B");

    expect(gradeTopic12PointwiseLeastRateChoice(17, { selectedOptionId: "D" })).toEqual({
      score: 0,
      maxScore: 1,
      parts: [
        {
          partId: "selectedOptionId",
          rawAnswer: "D",
          isCorrect: false,
          score: 0,
          maxScore: 1,
        },
      ],
    });
  });

  it("keeps wrong, blank, lowercase, and unknown answers raw and incorrect", () => {
    for (const selectedOptionId of ["A", "", "d", "Z"]) {
      expect(gradeTopic12PointwiseLeastRateChoice(0, { selectedOptionId })).toEqual({
        score: 0,
        maxScore: 1,
        parts: [
          {
            partId: "selectedOptionId",
            rawAnswer: selectedOptionId,
            isCorrect: false,
            score: 0,
            maxScore: 1,
          },
        ],
      });
    }
  });

  it("passes invalid seeds to the shared generator", () => {
    const answers: Topic12PointwiseLeastRateChoiceAnswers = { selectedOptionId: "D" };

    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => gradeTopic12PointwiseLeastRateChoice(seed, answers)).toThrow(RangeError);
    }
  });
});
