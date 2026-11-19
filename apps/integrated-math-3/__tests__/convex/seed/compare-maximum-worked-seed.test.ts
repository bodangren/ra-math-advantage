import { describe, expect, it } from "vitest";

import { graphingExplorerSchema } from "@math-platform/math-content/schemas/graphing-explorer";
import {
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";
import { buildIm3CompareMaximumWorkedSeedDocument } from "@/convex/seed/seed_lesson_1_1";

const NOW = Date.parse("2026-08-20T08:00:00.000Z");

describe("buildIm3CompareMaximumWorkedSeedDocument", () => {
  it("returns the accepted deterministic Worked activity document", () => {
    const first = buildIm3CompareMaximumWorkedSeedDocument(NOW);
    const second = buildIm3CompareMaximumWorkedSeedDocument(NOW);

    expect(first).toEqual(second);
    graphingExplorerSchema.parse(first.props);
    expect(first).toEqual({
      componentKey: "graphing-explorer",
      displayName: "Compare maximum values of quadratic functions",
      description: "Worked Example 2: Compare the maximum values of two quadratic functions.",
      props: {
        equation: "y = -x^2 + 6x - 4",
        variant: "compare_functions",
        responseVariant: "compare_maximums",
        comparisonEquation: "y = -3x^2 + 6x - 1",
        comparisonQuestion:
          "The graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?",
        comparisonAnswer: "first",
        vertex: [1, 2],
        yIntercept: [0, -1],
        domain: [-2, 6],
        range: [-6, 8],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ["greater_maximum"],
        rubric: [
          {
            criteria: "Identify the function with the greater maximum.",
            partId: "greater_maximum",
            points: 1,
          },
        ],
      },
      stableActivityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });
});
