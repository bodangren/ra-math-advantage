import { describe, expect, it } from "vitest";
import { generateTopic11IntervalGraphOutput } from "@math-platform/math-content/knowledge-space";
import { gradeTopic11IntervalGraph } from "@/lib/practice/topic11-interval-graph";

const correct = {
  increasingIntervals: "[0,3] U [7,9]",
  decreasingIntervals: "[3,7]",
  constantIntervals: "none",
};

describe("Topic 1.1 interval graph grader", () => {
  it("grades all three source-aligned interval classifications", () => {
    expect(gradeTopic11IntervalGraph(0, correct)).toMatchObject({
      score: 3,
      maxScore: 3,
    });
  });

  it("accepts equivalent union order and both stated endpoint delimiters", () => {
    expect(
      gradeTopic11IntervalGraph(0, {
        ...correct,
        increasingIntervals: "[7,9]∪[0,3]",
      }).score,
    ).toBe(3);
    expect(
      gradeTopic11IntervalGraph(0, {
        ...correct,
        increasingIntervals: "(0,3)U(7,9)",
      }).score,
    ).toBe(3);
  });

  it("rejects scalar, missing, overlapping, and wrong constant answers", () => {
    expect(
      gradeTopic11IntervalGraph(0, { ...correct, increasingIntervals: "3" })
        .parts[0]?.isCorrect,
    ).toBe(false);
    expect(
      gradeTopic11IntervalGraph(0, { ...correct, increasingIntervals: "[0,3]" })
        .parts[0]?.isCorrect,
    ).toBe(false);
    expect(
      gradeTopic11IntervalGraph(0, {
        ...correct,
        increasingIntervals: "[0,4]U[3,9]",
      }).parts[0]?.isCorrect,
    ).toBe(false);
    expect(
      gradeTopic11IntervalGraph(2, {
        increasingIntervals: "[0,2]",
        decreasingIntervals: "[4,8]",
        constantIntervals: "none",
      }),
    ).toMatchObject({ score: 2, maxScore: 3 });
  });

  it.each([0, 2])(
    "formats the seed-%i final answer so the real grader accepts it",
    (seed) => {
      const output = generateTopic11IntervalGraphOutput(seed);
      const expression = output.solutionSteps.at(-1)?.expression ?? "";
      const match =
        /^Increasing: (.*); decreasing: (.*); constant: (.*)\.$/.exec(
          expression,
        );
      expect(match).not.toBeNull();
      expect(
        gradeTopic11IntervalGraph(seed, {
          increasingIntervals: match![1]!,
          decreasingIntervals: match![2]!,
          constantIntervals: match![3]!,
        }),
      ).toMatchObject({ score: 3, maxScore: 3 });
    },
  );
});
