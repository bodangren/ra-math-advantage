import { describe, expect, it } from "vitest";

import {
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from "@math-platform/practice-core/contract";
import { getGenerator } from "@math-platform/math-content/knowledge-space";

import {
  gradeServerOwnedSubmission,
  type ServerOwnedActivity,
} from "@/lib/activities/server-grading";
import {
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
} from "@/lib/practice/learning-evidence-pilot";

type Point = { x: number; y: number };

const symmetryGenerator = getGenerator("quadratic-graph-analysis");
const guidedOutput = symmetryGenerator.generate({
  nodeId: IM3_SYMMETRY_NODE,
  seed: 0,
  difficulty: 0.5,
});
const independentOutput = symmetryGenerator.generate({
  nodeId: IM3_SYMMETRY_NODE,
  seed: 8,
  difficulty: 0.5,
});

const guidedActivity: ServerOwnedActivity = {
  id: "server-owned-im3-symmetry-guided-activity-document",
  stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  masteryNodeId: IM3_SYMMETRY_NODE,
  componentKey: "graphing-explorer",
  srsEligible: false,
  props: guidedOutput.data.rendererProps as Record<string, unknown>,
  gradingConfig: {
    partIds: ["placed_points"],
    rubric: [{ partId: "placed_points", points: 1 }],
  },
};

const independentActivity: ServerOwnedActivity = {
  id: "activities:server-owned-im3-symmetry-independent-activity-document",
  stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  masteryNodeId: IM3_SYMMETRY_NODE,
  componentKey: "graphing-explorer",
  srsEligible: true,
  props: independentOutput.data.rendererProps as Record<string, unknown>,
  gradingConfig: {
    partIds: ["placed_points"],
    rubric: [{ partId: "placed_points", points: 1 }],
  },
};

const guidedPoints = guidedOutput.expectedAnswer.placed_points as Point[];
const independentPoints = independentOutput.expectedAnswer.placed_points as Point[];

function makeEnvelope(
  activity: ServerOwnedActivity,
  rawPoints: unknown = activity === guidedActivity ? guidedPoints : independentPoints,
  answerPoints: unknown = rawPoints,
): PracticeSubmissionEnvelope {
  const mode =
    activity.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : "independent_practice";
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: "practice.v1",
    activityId: "client-supplied-symmetry-activity-id",
    mode,
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-09-03T10:00:00.000Z",
    answers: { placed_points: answerPoints },
    parts: [
      {
        partId: "placed_points",
        rawAnswer: rawPoints,
        hintsUsed: 1,
        revealStepsSeen: 2,
        changedCount: 3,
        firstInteractionAt: "2026-09-03T09:59:00.000Z",
        answeredAt: "2026-09-03T10:00:00.000Z",
        wallClockMs: 5000,
        activeMs: 4000,
      },
    ],
    artifact: {
      graphState: {
        equation: activity.props.equation,
        vertex: activity.props.vertex,
        yIntercept: activity.props.yIntercept,
        placedPoints: rawPoints,
        domain: activity.props.domain,
        range: activity.props.range,
      },
    },
  });
}

function withActivity(
  activity: ServerOwnedActivity,
  changes: Partial<ServerOwnedActivity> & { props?: Record<string, unknown> },
): ServerOwnedActivity {
  return {
    ...activity,
    ...changes,
    props: changes.props ? { ...activity.props, ...changes.props } : activity.props,
  };
}

function withEnvelope(
  envelope: PracticeSubmissionEnvelope,
  changes: Record<string, unknown>,
): PracticeSubmissionEnvelope {
  return { ...envelope, ...changes } as PracticeSubmissionEnvelope;
}

describe("IM3 symmetry server grading", () => {
  it("grades exact Guided and Independent symmetry points from the server equation", () => {
    for (const [activity, points, mode] of [
      [guidedActivity, guidedPoints, "guided_practice"],
      [independentActivity, independentPoints, "independent_practice"],
    ] as const) {
      const result = gradeServerOwnedSubmission(activity, makeEnvelope(activity, points));

      expect(result).toMatchObject({
        score: 1,
        maxScore: 1,
        submissionData: {
          mode,
          status: "graded",
          parts: [
            {
              partId: "placed_points",
              rawAnswer: points,
              isCorrect: true,
              score: 1,
              maxScore: 1,
              hintsUsed: 1,
              revealStepsSeen: 2,
              changedCount: 3,
            },
          ],
          artifact: {
            graphState: {
              equation: activity.props.equation,
              vertex: activity.props.vertex,
              yIntercept: activity.props.yIntercept,
              placedPoints: points,
              domain: activity.props.domain,
              range: activity.props.range,
            },
          },
        },
      });
      expect(result.submissionData.activityId).toBe(activity.id);
      expect(result.submissionData.activityId).not.toBe("client-supplied-symmetry-activity-id");
      expect(result.masteryContractVersion).toBe(
        activity.srsEligible ? "learning-evidence.v1" : undefined,
      );
    }
  });

  it("accepts a valid optional timing contract field", () => {
    const timing = {
      startedAt: "2026-09-03T09:59:00.000Z",
      submittedAt: "2026-09-03T10:00:00.000Z",
      wallClockMs: 5000,
      activeMs: 4000,
      idleMs: 1000,
      pauseCount: 0,
      focusLossCount: 0,
      visibilityHiddenCount: 0,
      confidence: "high" as const,
    };
    const envelope = practiceSubmissionEnvelopeSchema.parse({
      ...makeEnvelope(guidedActivity),
      timing,
    });
    const result = gradeServerOwnedSubmission(guidedActivity, envelope);

    expect(result.score).toBe(1);
    expect(result.submissionData.timing).toEqual(timing);
  });

  it("matches points without depending on their order", () => {
    const result = gradeServerOwnedSubmission(
      guidedActivity,
      makeEnvelope(guidedActivity, [guidedPoints[2], guidedPoints[0], guidedPoints[1]]),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 1 });
    expect(result.submissionData.parts[0]).toMatchObject({ isCorrect: true, score: 1 });
  });

  it("accepts the inclusive coordinate tolerance and gives no credit outside it", () => {
    const atBoundary = guidedPoints.map((point) => ({ x: point.x + 0.25, y: point.y - 0.25 }));
    const outsideBoundary = guidedPoints.map((point, index) =>
      index === 0 ? { x: point.x + 0.26, y: point.y } : point,
    );

    expect(
      gradeServerOwnedSubmission(guidedActivity, makeEnvelope(guidedActivity, atBoundary)),
    ).toMatchObject({ score: 1, maxScore: 1 });
    expect(
      gradeServerOwnedSubmission(guidedActivity, makeEnvelope(guidedActivity, outsideBoundary)),
    ).toMatchObject({ score: 0, maxScore: 1 });
  });

  it("uses the raw part for grading and preserves student telemetry", () => {
    const result = gradeServerOwnedSubmission(
      guidedActivity,
      makeEnvelope(
        guidedActivity,
        guidedPoints,
        guidedPoints.map(() => ({ x: 99, y: 99 })),
      ),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 1 });
    expect(result.submissionData.parts[0]).toMatchObject({
      rawAnswer: guidedPoints,
      hintsUsed: 1,
      revealStepsSeen: 2,
      changedCount: 3,
      firstInteractionAt: "2026-09-03T09:59:00.000Z",
      answeredAt: "2026-09-03T10:00:00.000Z",
      wallClockMs: 5000,
      activeMs: 4000,
    });
  });

  it("grades duplicate finite points as an incorrect one-point attempt", () => {
    const duplicatePoints = [independentPoints[0], independentPoints[0], independentPoints[1]];
    const result = gradeServerOwnedSubmission(
      independentActivity,
      makeEnvelope(independentActivity, duplicatePoints),
    );

    expect(result).toMatchObject({ score: 0, maxScore: 1 });
    expect(result.submissionData.status).toBe("graded");
  });

  it.each([
    [
      "wrong stable ID",
      withActivity(guidedActivity, {
        stableActivityId: `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}.lookalike`,
      }),
    ],
    [
      "wrong node",
      withActivity(guidedActivity, { masteryNodeId: `${IM3_SYMMETRY_NODE}.lookalike` }),
    ],
    ["wrong component", withActivity(guidedActivity, { componentKey: "step-by-step-solver" })],
    ["wrong variant", withActivity(guidedActivity, { props: { variant: "compare_functions" } })],
    [
      "wrong response variant",
      withActivity(guidedActivity, { props: { responseVariant: "table_graph" } }),
    ],
    [
      "malformed equation",
      withActivity(guidedActivity, { props: { equation: "not a quadratic" } }),
    ],
    ["wrong vertex", withActivity(guidedActivity, { props: { vertex: [9, 9] } })],
    ["wrong y-intercept", withActivity(guidedActivity, { props: { yIntercept: [0, 99] } })],
    ["nonzero y-intercept x", withActivity(guidedActivity, { props: { yIntercept: [1, -1] } })],
    [
      "wrong rubric part",
      withActivity(guidedActivity, {
        gradingConfig: { partIds: ["other"], rubric: [{ partId: "other", points: 1 }] },
      }),
    ],
    [
      "wrong rubric points",
      withActivity(guidedActivity, {
        gradingConfig: {
          partIds: ["placed_points"],
          rubric: [{ partId: "placed_points", points: 2 }],
        },
      }),
    ],
  ])("keeps %s as an ordinary ungraded submitted record", (_label, activity) => {
    const result = gradeServerOwnedSubmission(activity, makeEnvelope(guidedActivity));

    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.status).toBe("submitted");
  });

  it.each([
    ["wrong mode", withEnvelope(makeEnvelope(guidedActivity), { mode: "independent_practice" })],
    ["wrong status", withEnvelope(makeEnvelope(guidedActivity), { status: "graded" })],
    [
      "non-array point answer",
      withEnvelope(makeEnvelope(guidedActivity), { answers: { placed_points: "not-an-array" } }),
    ],
    [
      "wrong answer point count",
      withEnvelope(makeEnvelope(guidedActivity), {
        answers: { placed_points: guidedPoints.slice(0, 2) },
      }),
    ],
    ["missing part", withEnvelope(makeEnvelope(guidedActivity), { parts: [] })],
    [
      "extra part",
      withEnvelope(makeEnvelope(guidedActivity), {
        parts: [...makeEnvelope(guidedActivity).parts, { partId: "extra", rawAnswer: [] }],
      }),
    ],
    [
      "duplicate part",
      withEnvelope(makeEnvelope(guidedActivity), {
        parts: [makeEnvelope(guidedActivity).parts[0], makeEnvelope(guidedActivity).parts[0]],
      }),
    ],
    [
      "wrong point count",
      withEnvelope(makeEnvelope(guidedActivity), {
        parts: [{ partId: "placed_points", rawAnswer: guidedPoints.slice(0, 2) }],
      }),
    ],
    [
      "nonfinite coordinate",
      withEnvelope(makeEnvelope(guidedActivity), {
        parts: [
          {
            partId: "placed_points",
            rawAnswer: [{ x: Number.NaN, y: 0 }, ...guidedPoints.slice(1)],
          },
        ],
      }),
    ],
    [
      "extra point field",
      withEnvelope(makeEnvelope(guidedActivity), {
        parts: [
          {
            partId: "placed_points",
            rawAnswer: guidedPoints.map((point) => ({ ...point, label: "forbidden" })),
          },
        ],
      }),
    ],
  ])("keeps %s as an ordinary ungraded submitted record", (_label, envelope) => {
    const result = gradeServerOwnedSubmission(guidedActivity, envelope);

    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.status).toBe("submitted");
  });

  it("does not change unrelated graphing-explorer grading behavior", () => {
    const activity: ServerOwnedActivity = {
      id: "server-owned-unrelated-graph-activity",
      stableActivityId: "unrelated.graph.activity",
      masteryNodeId: "unrelated.graph.node",
      componentKey: "graphing-explorer",
      srsEligible: true,
      props: {
        equation: "y = x^2 + 1",
        variant: "plot_from_equation",
        responseVariant: "table_graph",
      },
      gradingConfig: {
        partIds: ["placed_points"],
        rubric: [{ partId: "placed_points", points: 1 }],
      },
    };
    const result = gradeServerOwnedSubmission(activity, makeEnvelope(guidedActivity));

    expect(result.submissionData.status).toBe("submitted");
    expect(result.score).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
  });
});
