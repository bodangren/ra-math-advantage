import { describe, expect, it } from "vitest";
import type { PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import {
  gradeServerOwnedSubmission,
  type ServerOwnedActivity,
} from "@/lib/activities/server-grading";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from "@/lib/practice/learning-evidence-pilot";

const POINTS = [
  { x: -2, y: -5 },
  { x: -1, y: -2 },
  { x: 0, y: -1 },
  { x: 1, y: -2 },
  { x: 2, y: -5 },
];
const NONZERO_B_POINTS = [
  { x: -2, y: 4 },
  { x: -1, y: 0 },
  { x: 0, y: -2 },
  { x: 1, y: -2 },
  { x: 2, y: 0 },
];
const ACTIVITY: ServerOwnedActivity = {
  id: "activities:selected-quadratic",
  stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  masteryNodeId: IM3_PILOT_NODE,
  componentKey: "graphing-explorer",
  srsEligible: true,
  props: {
    variant: "plot_from_equation",
    responseVariant: "table_graph",
    equation: "y = -x^2 - 1",
  },
  gradingConfig: {
    partIds: ["table_values", "placed_points"],
    rubric: [
      { partId: "table_values", points: 1 },
      { partId: "placed_points", points: 1 },
    ],
  },
};
function envelope(
  table: unknown = POINTS,
  plotted: unknown = POINTS,
  mode: PracticeSubmissionEnvelope["mode"] = "independent_practice",
): PracticeSubmissionEnvelope {
  return {
    contractVersion: "practice.v1",
    activityId: "client-selected-id" as never,
    mode,
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-09-07T00:00:00.000Z",
    answers: { table_values: table, placed_points: plotted },
    parts: [
      {
        partId: "table_values",
        rawAnswer: table,
        isCorrect: false,
        score: 99,
        maxScore: 99,
        hintsUsed: 2,
        changedCount: 3,
        firstInteractionAt: "2026-09-07T00:00:01.000Z",
        answeredAt: "2026-09-07T00:00:05.000Z",
        wallClockMs: 4000,
        activeMs: 3000,
      },
      {
        partId: "placed_points",
        rawAnswer: plotted,
        isCorrect: false,
        score: 99,
        maxScore: 99,
        revealStepsSeen: 1,
      },
    ],
  } as PracticeSubmissionEnvelope;
}

describe("selected IM3 quadratic server grader", () => {
  it("grades literal table and graph points, preserves assistance, and selects the stored activity", () => {
    const result = gradeServerOwnedSubmission(ACTIVITY, envelope());
    expect(result).toMatchObject({
      score: 2,
      maxScore: 2,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(result.submissionData).toMatchObject({
      activityId: ACTIVITY.id,
      status: "graded",
    });
    expect(result.submissionData.parts).toMatchObject([
      {
        partId: "table_values",
        isCorrect: true,
        score: 1,
        maxScore: 1,
        hintsUsed: 2,
        changedCount: 3,
        firstInteractionAt: "2026-09-07T00:00:01.000Z",
        answeredAt: "2026-09-07T00:00:05.000Z",
        wallClockMs: 4000,
        activeMs: 3000,
      },
      {
        partId: "placed_points",
        isCorrect: true,
        score: 1,
        maxScore: 1,
        revealStepsSeen: 1,
      },
    ]);
  });

  it("grades a Guided activity with the canonical Guided mode", () => {
    const activity = {
      ...ACTIVITY,
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      srsEligible: false,
    };
    const result = gradeServerOwnedSubmission(
      activity,
      envelope(POINTS, POINTS, "guided_practice"),
    );
    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(result).not.toHaveProperty("masteryContractVersion");
  });

  it("grades the literal nonzero-b quadratic y=x^2-x-2", () => {
    const activity = {
      ...ACTIVITY,
      props: { ...ACTIVITY.props, equation: "y = x^2 - x - 2" },
    };
    expect(
      gradeServerOwnedSubmission(
        activity,
        envelope(NONZERO_B_POINTS, NONZERO_B_POINTS),
      ),
    ).toMatchObject({ score: 2, maxScore: 2 });
  });

  it("accepts the exact plot tolerance boundary", () => {
    const boundary = POINTS.map((point) => ({
      x: point.x + 0.25,
      y: point.y - 0.25,
    }));
    expect(
      gradeServerOwnedSubmission(ACTIVITY, envelope(POINTS, boundary)),
    ).toMatchObject({ score: 2, maxScore: 2 });
  });

  it("rejects a plot point outside the tolerance boundary", () => {
    const outside = POINTS.map((point, index) =>
      index === 0 ? { x: point.x + 0.2501, y: point.y } : point,
    );
    expect(
      gradeServerOwnedSubmission(ACTIVITY, envelope(POINTS, outside)),
    ).toMatchObject({ score: 1, maxScore: 2 });
  });

  it("grades a wrong graph without trusting client grading fields", () => {
    const wrong = POINTS.map((point, index) =>
      index === 0 ? { ...point, y: 0 } : point,
    );
    expect(
      gradeServerOwnedSubmission(ACTIVITY, envelope(POINTS, wrong)),
    ).toMatchObject({ score: 1, maxScore: 2 });
  });

  it.each([
    ["missing point", POINTS.slice(1)],
    ["duplicate point", [POINTS[0], POINTS[0], ...POINTS.slice(2)]],
  ])("rejects a %s as incorrect", (_name, points) => {
    expect(
      gradeServerOwnedSubmission(ACTIVITY, envelope(points, points)),
    ).toMatchObject({ score: 0, maxScore: 2 });
  });

  it.each([
    [
      "wrong node",
      { ...ACTIVITY, masteryNodeId: "math.im3.skill.other" },
      envelope(),
    ],
    [
      "wrong activity",
      {
        ...ACTIVITY,
        stableActivityId: "math.im3.skill.other.independent_practice",
      },
      envelope(),
    ],
    [
      "wrong component",
      { ...ACTIVITY, componentKey: "fill-in-the-blank" },
      envelope(),
    ],
    [
      "Independent activity with Guided mode",
      ACTIVITY,
      envelope(POINTS, POINTS, "guided_practice"),
    ],
    [
      "Guided activity with Independent mode",
      { ...ACTIVITY, stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID },
      envelope(),
    ],
  ])(
    "does not apply the selected pilot grade with the %s",
    (_name, activity, submission) => {
      const result = gradeServerOwnedSubmission(activity, submission);
      expect(result).not.toHaveProperty("score");
      expect(result).not.toHaveProperty("maxScore");
      expect(result).not.toHaveProperty("masteryContractVersion");
      expect(result.submissionData.status).toBe("submitted");
      for (const part of result.submissionData.parts) {
        expect(part).not.toHaveProperty("isCorrect");
        expect(part).not.toHaveProperty("score");
        expect(part).not.toHaveProperty("maxScore");
      }
    },
  );

  it.each([
    [
      "missing equation",
      { variant: "plot_from_equation", responseVariant: "table_graph" },
    ],
    [
      "non-string equation",
      {
        variant: "plot_from_equation",
        responseVariant: "table_graph",
        equation: 3,
      },
    ],
    [
      "malformed equation",
      {
        variant: "plot_from_equation",
        responseVariant: "table_graph",
        equation: "not a quadratic",
      },
    ],
    [
      "linear equation",
      {
        variant: "plot_from_equation",
        responseVariant: "table_graph",
        equation: "y = 2x + 1",
      },
    ],
    [
      "wrong variant",
      {
        variant: "analyze_graph",
        responseVariant: "table_graph",
        equation: "y = -x^2 - 1",
      },
    ],
    [
      "wrong response variant",
      {
        variant: "plot_from_equation",
        responseVariant: "multiple_choice",
        equation: "y = -x^2 - 1",
      },
    ],
  ])("rejects canonical grading data with a %s", (_name, props) => {
    expect(() =>
      gradeServerOwnedSubmission({ ...ACTIVITY, props }, envelope()),
    ).toThrow("IM3 pilot activity is missing canonical server grading data");
  });

  it.each([
    ["missing config", undefined],
    ["missing part IDs", { rubric: ACTIVITY.gradingConfig?.rubric }],
    [
      "reordered part IDs",
      { ...ACTIVITY.gradingConfig, partIds: ["placed_points", "table_values"] },
    ],
    [
      "extra part ID",
      {
        ...ACTIVITY.gradingConfig,
        partIds: ["table_values", "placed_points", "extra"],
      },
    ],
    ["missing rubric", { partIds: ["table_values", "placed_points"] }],
    [
      "reordered rubric",
      {
        ...ACTIVITY.gradingConfig,
        rubric: [
          { partId: "placed_points", points: 1 },
          { partId: "table_values", points: 1 },
        ],
      },
    ],
    [
      "missing rubric part ID",
      {
        ...ACTIVITY.gradingConfig,
        rubric: [{ points: 1 }, { partId: "placed_points", points: 1 }],
      },
    ],
    [
      "wrong rubric points",
      {
        ...ACTIVITY.gradingConfig,
        rubric: [
          { partId: "table_values", points: 2 },
          { partId: "placed_points", points: 1 },
        ],
      },
    ],
    [
      "non-finite rubric points",
      {
        ...ACTIVITY.gradingConfig,
        rubric: [
          { partId: "table_values", points: Number.NaN },
          { partId: "placed_points", points: 1 },
        ],
      },
    ],
  ])("rejects a rubric with %s", (_name, gradingConfig) => {
    expect(() =>
      gradeServerOwnedSubmission({ ...ACTIVITY, gradingConfig }, envelope()),
    ).toThrow("IM3 pilot activity is missing canonical server grading data");
  });
});
