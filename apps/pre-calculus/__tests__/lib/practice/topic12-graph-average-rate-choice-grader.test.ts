import { describe, expect, it } from "vitest";

import { generateTopic12GraphAverageRateChoice } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic12GraphAverageRateChoice,
  type Topic12GraphAverageRateChoiceAnswers,
} from "../../../lib/practice/topic12-graph-average-rate-choice";

describe("topic12 graph average-rate choice grader", () => {
  it("gives seed 0 credit only for option C", () => {
    const results = ["A", "B", "C", "D"].map((selectedOptionId) =>
      gradeTopic12GraphAverageRateChoice(0, { selectedOptionId }),
    );

    expect(results.map((result) => result.score)).toEqual([0, 0, 1, 0]);
    expect(results[2]).toEqual({
      score: 1,
      maxScore: 1,
      parts: [
        {
          partId: "selectedOptionId",
          rawAnswer: "C",
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
  });

  it("grades the generated correct option for nonzero seeds", () => {
    for (const seed of [1, 2, 3, 17, 43]) {
      const variant = generateTopic12GraphAverageRateChoice(seed);
      const result = gradeTopic12GraphAverageRateChoice(seed, {
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

  it("does not assume the seed-0 answer for a different seed", () => {
    const variant = generateTopic12GraphAverageRateChoice(43);
    expect(variant.correctOptionId).toBe("D");

    expect(gradeTopic12GraphAverageRateChoice(43, { selectedOptionId: "C" })).toEqual({
      score: 0,
      maxScore: 1,
      parts: [
        {
          partId: "selectedOptionId",
          rawAnswer: "C",
          isCorrect: false,
          score: 0,
          maxScore: 1,
        },
      ],
    });
  });

  it("keeps wrong, blank, lowercase, and unknown answers raw and incorrect", () => {
    for (const selectedOptionId of ["A", "", "c", "Z"]) {
      expect(gradeTopic12GraphAverageRateChoice(0, { selectedOptionId })).toEqual({
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
    const answers: Topic12GraphAverageRateChoiceAnswers = { selectedOptionId: "C" };

    for (const seed of [-1, 1.5, NaN, Infinity, -Infinity]) {
      expect(() => gradeTopic12GraphAverageRateChoice(seed, answers)).toThrow(RangeError);
    }
  });
});
