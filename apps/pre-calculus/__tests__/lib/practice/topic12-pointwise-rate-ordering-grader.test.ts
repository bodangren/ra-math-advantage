import { describe, expect, it } from "vitest";

import { generateTopic12PointwiseRateOrderingOutput } from "@math-platform/math-content/knowledge-space";

import {
  gradeTopic12PointwiseRateOrdering,
  type Topic12PointwiseRateOrderingAnswers,
} from "../../../lib/practice/topic12-pointwise-rate-ordering";

describe("topic12 pointwise rate-ordering grader", () => {
  it("gives credit only to the exact seed-0 order across all A/B/C permutations", () => {
    const answers = [
      ["A", "B", "C"],
      ["A", "C", "B"],
      ["B", "A", "C"],
      ["B", "C", "A"],
      ["C", "A", "B"],
      ["C", "B", "A"],
    ];

    expect(
      answers.map(
        (orderedPointIds) => gradeTopic12PointwiseRateOrdering(0, { orderedPointIds }).score,
      ),
    ).toEqual([0, 0, 0, 1, 0, 0]);
    expect(gradeTopic12PointwiseRateOrdering(0, { orderedPointIds: ["B", "C", "A"] })).toEqual({
      score: 1,
      maxScore: 1,
      parts: [
        {
          partId: "orderedPointIds",
          rawAnswer: ["B", "C", "A"],
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
  });

  it("grades the generated order for representative nonzero seeds", () => {
    for (const seed of [1, 2, 3, 17, 43]) {
      const output = generateTopic12PointwiseRateOrderingOutput(seed);
      const expected = output.expectedAnswer as { orderedPointIds: string[] };
      const result = gradeTopic12PointwiseRateOrdering(seed, {
        orderedPointIds: expected.orderedPointIds,
      });

      expect(result.score).toBe(1);
      expect(result.parts[0]).toMatchObject({
        rawAnswer: expected.orderedPointIds,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      });
    }
  });

  it("does not assume the seed-0 order for a different seed", () => {
    const output = generateTopic12PointwiseRateOrderingOutput(43);
    const expected = output.expectedAnswer as { orderedPointIds: string[] };
    expect(expected.orderedPointIds).not.toEqual(["B", "C", "A"]);

    const result = gradeTopic12PointwiseRateOrdering(43, {
      orderedPointIds: ["B", "C", "A"],
    });
    expect(result.score).toBe(0);
    expect(result.parts[0]?.rawAnswer).toEqual(["B", "C", "A"]);
  });

  it("keeps malformed arrays raw and incorrect without partial credit", () => {
    const malformedAnswers: readonly string[][] = [
      [],
      ["B", "C"],
      ["B", "C", "A", "D"],
      ["B", "B", "A"],
      ["B", "c", "A"],
      ["B", "C", "D"],
      [""],
    ];

    for (const orderedPointIds of malformedAnswers) {
      expect(gradeTopic12PointwiseRateOrdering(0, { orderedPointIds })).toEqual({
        score: 0,
        maxScore: 1,
        parts: [
          {
            partId: "orderedPointIds",
            rawAnswer: orderedPointIds,
            isCorrect: false,
            score: 0,
            maxScore: 1,
          },
        ],
      });
    }
  });

  it("passes invalid seeds through to the shared generator", () => {
    const answers: Topic12PointwiseRateOrderingAnswers = { orderedPointIds: ["B", "C", "A"] };

    for (const seed of [-1, 1.5, NaN, Infinity, -Infinity]) {
      expect(() => gradeTopic12PointwiseRateOrdering(seed, answers)).toThrow(RangeError);
    }
  });
});
