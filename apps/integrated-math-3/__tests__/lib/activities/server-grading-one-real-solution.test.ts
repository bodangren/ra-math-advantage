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
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

type Point = { x: number; y: number };

const generator = getGenerator("one-real-solution-graphing");
const guidedOutput = generator.generate({
  nodeId: IM3_ONE_REAL_SOLUTION_NODE,
  seed: 0,
  difficulty: 0.5,
});
const independentOutput = generator.generate({
  nodeId: IM3_ONE_REAL_SOLUTION_NODE,
  seed: 2,
  difficulty: 0.5,
});
const guidedData = guidedOutput.data as {
  tableValues: Point[];
  rendererProps: Record<string, unknown>;
};
const independentData = independentOutput.data as {
  scale: number;
  tableValues: Point[];
  rendererProps: Record<string, unknown>;
};
const guidedTableValues = guidedData.tableValues;
const guidedPlacedPoints = guidedOutput.expectedAnswer.placed_points as Point[];
const guidedSolution = guidedOutput.expectedAnswer.solution as number;
const independentTableValues = independentData.tableValues;
const independentPlacedPoints = independentOutput.expectedAnswer.placed_points as Point[];
const independentSolution = independentOutput.expectedAnswer.solution as number;

const guidedActivity: ServerOwnedActivity = {
  id: "server-owned-im3-one-real-solution-guided-activity-document",
  stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
  componentKey: "graphing-explorer",
  srsEligible: false,
  props: guidedData.rendererProps,
  gradingConfig: {
    partIds: ["table_values", "placed_points", "solution"],
    rubric: [
      { partId: "table_values", points: 1 },
      { partId: "placed_points", points: 1 },
      { partId: "solution", points: 1 },
    ],
  },
};

const independentActivity: ServerOwnedActivity = {
  id: "activities:server-owned-im3-one-real-solution-independent-activity-document",
  stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
  componentKey: "graphing-explorer",
  srsEligible: true,
  props: independentData.rendererProps,
  gradingConfig: {
    partIds: ["table_values", "placed_points", "solution"],
    rubric: [
      { partId: "table_values", points: 1 },
      { partId: "placed_points", points: 1 },
      { partId: "solution", points: 1 },
    ],
  },
};

function makeEnvelope(
  activity: ServerOwnedActivity,
  rawTableValues: Point[],
  rawPlacedPoints: Point[],
  rawSolution: number,
  answerTableValues: unknown = rawTableValues,
  answerPlacedPoints: unknown = rawPlacedPoints,
  answerSolution: unknown = rawSolution,
  modeOverride?: PracticeSubmissionEnvelope["mode"],
): PracticeSubmissionEnvelope {
  const mode =
    modeOverride ??
    (activity.stableActivityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : "independent_practice");
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: "practice.v1",
    activityId: "client-supplied-one-real-solution-activity-id",
    mode,
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-09-06T10:00:00.000Z",
    answers: {
      table_values: answerTableValues,
      placed_points: answerPlacedPoints,
      solution: answerSolution,
    },
    parts: [
      {
        partId: "table_values",
        rawAnswer: rawTableValues,
        hintsUsed: 1,
        answeredAt: "2026-09-06T09:59:00.000Z",
        activeMs: 4000,
      },
      { partId: "placed_points", rawAnswer: rawPlacedPoints },
      { partId: "solution", rawAnswer: rawSolution },
    ],
    artifact: {
      graphState: {
        originalEquation: activity.props.originalEquation,
        equation: activity.props.equation,
        tableValues: rawTableValues,
        placedPoints: rawPlacedPoints,
        domain: activity.props.domain,
        range: activity.props.range,
      },
    },
  });
}

function withActivity(
  overrides: Partial<ServerOwnedActivity> = {},
  propOverrides: Partial<ServerOwnedActivity["props"]> = {},
): ServerOwnedActivity {
  return {
    ...guidedActivity,
    ...overrides,
    props: {
      ...guidedActivity.props,
      ...propOverrides,
    },
  };
}

function withEnvelope(
  envelope: PracticeSubmissionEnvelope,
  changes: Record<string, unknown>,
): PracticeSubmissionEnvelope {
  return { ...envelope, ...changes } as PracticeSubmissionEnvelope;
}

const validGuidedEnvelope = makeEnvelope(
  guidedActivity,
  guidedTableValues,
  guidedPlacedPoints,
  guidedSolution,
);

describe("IM3 one-real-solution server grading", () => {
  it("grades exact Guided raw parts and ignores conflicting answer values", () => {
    const result = gradeServerOwnedSubmission(
      guidedActivity,
      makeEnvelope(
        guidedActivity,
        guidedTableValues,
        guidedPlacedPoints,
        guidedSolution,
        guidedTableValues.map(() => ({ x: 99, y: 99 })),
        guidedPlacedPoints.map(() => ({ x: 99, y: 99 })),
        99,
      ),
    );

    expect(result).toMatchObject({
      score: 3,
      maxScore: 3,
      submissionData: {
        activityId: guidedActivity.id,
        status: "graded",
        parts: [
          {
            partId: "table_values",
            rawAnswer: guidedTableValues,
            isCorrect: true,
            score: 1,
            maxScore: 1,
            hintsUsed: 1,
            answeredAt: "2026-09-06T09:59:00.000Z",
            activeMs: 4000,
          },
          {
            partId: "placed_points",
            rawAnswer: guidedPlacedPoints,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "solution",
            rawAnswer: guidedSolution,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
      },
    });
    expect(result.submissionData.parts).toHaveLength(3);
    expect(result.submissionData.activityId).not.toBe(
      "client-supplied-one-real-solution-activity-id",
    );
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it("grades scale-3 Independent input with partial credit", () => {
    expect(independentData.scale).toBe(3);
    const wrongTableValues = independentTableValues.map((point, index) =>
      index === 0 ? { ...point, y: point.y + 1 } : point,
    );
    const result = gradeServerOwnedSubmission(
      independentActivity,
      makeEnvelope(
        independentActivity,
        wrongTableValues,
        [...independentPlacedPoints].reverse(),
        independentSolution + 0.02,
      ),
    );

    expect(result).toMatchObject({
      score: 1,
      maxScore: 3,
      masteryContractVersion: "learning-evidence.v1",
      submissionData: {
        activityId: independentActivity.id,
        status: "graded",
        parts: [
          { partId: "table_values", score: 0, maxScore: 1, isCorrect: false },
          { partId: "placed_points", score: 1, maxScore: 1, isCorrect: true },
          { partId: "solution", score: 0, maxScore: 1, isCorrect: false },
        ],
      },
    });
    expect(result.submissionData.parts).toHaveLength(3);
  });

  it("uses inclusive tolerances and keeps exact table rows authoritative", () => {
    const tolerancePlacedPoints = guidedPlacedPoints.map((point) => ({
      x: point.x + 0.25,
      y: point.y - 0.25,
    }));
    const withinTolerance = gradeServerOwnedSubmission(
      guidedActivity,
      makeEnvelope(guidedActivity, guidedTableValues, tolerancePlacedPoints, guidedSolution + 0.01),
    );

    expect(withinTolerance).toMatchObject({
      score: 3,
      maxScore: 3,
      submissionData: {
        status: "graded",
        parts: [
          { partId: "table_values", isCorrect: true, score: 1 },
          { partId: "placed_points", isCorrect: true, score: 1 },
          { partId: "solution", isCorrect: true, score: 1 },
        ],
      },
    });

    const outsideTolerancePlacedPoints = tolerancePlacedPoints.map((point, index) =>
      index === 0 ? { ...point, x: point.x + 0.0001 } : point,
    );
    const outsideTolerance = gradeServerOwnedSubmission(
      guidedActivity,
      makeEnvelope(
        guidedActivity,
        guidedTableValues,
        outsideTolerancePlacedPoints,
        guidedSolution + 0.0101,
      ),
    );

    expect(outsideTolerance).toMatchObject({
      score: 1,
      maxScore: 3,
      submissionData: {
        status: "graded",
        parts: [
          { partId: "table_values", isCorrect: true, score: 1 },
          { partId: "placed_points", isCorrect: false, score: 0 },
          { partId: "solution", isCorrect: false, score: 0 },
        ],
      },
    });
  });

  it("requires the student-compatible equation format for grading authority", () => {
    const bareEquationActivity: ServerOwnedActivity = {
      ...guidedActivity,
      props: {
        ...guidedActivity.props,
        equation: "x^2 + 2x + 1",
      },
    };
    const result = gradeServerOwnedSubmission(
      bareEquationActivity,
      makeEnvelope(bareEquationActivity, guidedTableValues, guidedPlacedPoints, guidedSolution),
    );

    expect(result.submissionData).toMatchObject({
      activityId: bareEquationActivity.id,
      status: "submitted",
    });
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    [
      "wrong stable ID",
      withActivity({ stableActivityId: "im3-one-real-solution-guided-lookalike" }),
    ],
    [
      "wrong mastery node",
      withActivity({ masteryNodeId: "math.im3.skill.1.1.one-real-solution-lookalike" }),
    ],
    ["wrong component key", withActivity({ componentKey: "step-by-step-solver" })],
    ["wrong variant", withActivity({}, { variant: "plot_from_equation_wrong" })],
    ["wrong response variant", withActivity({}, { responseVariant: "one_real_solution_wrong" })],
    ["whitespace-only originalEquation", withActivity({}, { originalEquation: "   " })],
    ["malformed equation", withActivity({}, { equation: "not a quadratic" })],
    ["downward repeated-root equation", withActivity({}, { equation: "y = -x^2 + 2x - 1" })],
    ["non-integer repeated root", withActivity({}, { equation: "y = x^2 + x + 0.25" })],
    [
      "wrong grading part order",
      withActivity({
        gradingConfig: {
          partIds: ["placed_points", "table_values", "solution"],
          rubric: [
            { partId: "table_values", points: 1 },
            { partId: "placed_points", points: 1 },
            { partId: "solution", points: 1 },
          ],
        },
      }),
    ],
    [
      "wrong rubric points",
      withActivity({
        gradingConfig: {
          partIds: ["table_values", "placed_points", "solution"],
          rubric: [
            { partId: "table_values", points: 2 },
            { partId: "placed_points", points: 1 },
            { partId: "solution", points: 1 },
          ],
        },
      }),
    ],
    [
      "Worked stable ID",
      withActivity({ stableActivityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID }),
    ],
  ])("keeps invalid one-real-solution candidates ungraded: %s", (_label, activity) => {
    const result = gradeServerOwnedSubmission(
      activity,
      makeEnvelope(
        activity,
        guidedTableValues,
        guidedPlacedPoints,
        guidedSolution,
        guidedTableValues,
        guidedPlacedPoints,
        guidedSolution,
        "guided_practice",
      ),
    );

    expect(result.submissionData.status).toBe("submitted");
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it("keeps unrelated graphing-explorer activities on the ordinary ungraded path", () => {
    const unrelatedActivity = withActivity({
      stableActivityId: "math.im3.unrelated.graphing-explorer",
      masteryNodeId: "math.im3.unrelated-node",
    });
    const result = gradeServerOwnedSubmission(
      unrelatedActivity,
      makeEnvelope(
        unrelatedActivity,
        guidedTableValues,
        guidedPlacedPoints,
        guidedSolution,
        guidedTableValues,
        guidedPlacedPoints,
        guidedSolution,
        "guided_practice",
      ),
    );

    expect(result.submissionData.status).toBe("submitted");
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    ["wrong mode", { mode: "independent_practice" }],
    ["wrong status", { status: "graded" }],
    ["attempt number 0", { attemptNumber: 0 }],
    ["invalid submittedAt string", { submittedAt: "not-a-date" }],
    [
      "missing solution answer key",
      {
        answers: {
          table_values: guidedTableValues,
          placed_points: guidedPlacedPoints,
        },
      },
    ],
    [
      "extra answer key",
      {
        answers: {
          ...validGuidedEnvelope.answers,
          extra: true,
        },
      },
    ],
    [
      "wrong answer key insertion order",
      {
        answers: {
          placed_points: guidedPlacedPoints,
          table_values: guidedTableValues,
          solution: guidedSolution,
        },
      },
    ],
    [
      "answer table_values with four points",
      {
        answers: {
          ...validGuidedEnvelope.answers,
          table_values: guidedTableValues.slice(0, 4),
        },
      },
    ],
    [
      "answer placed_points with an extra field",
      {
        answers: {
          ...validGuidedEnvelope.answers,
          placed_points: guidedPlacedPoints.map((point, index) =>
            index === 0 ? { ...point, label: "forged" } : point,
          ),
        },
      },
    ],
    [
      "non-finite answer solution",
      {
        answers: {
          ...validGuidedEnvelope.answers,
          solution: Number.POSITIVE_INFINITY,
        },
      },
    ],
  ])("keeps invalid envelope authority cases ungraded: %s", (_label, changes) => {
    const result = gradeServerOwnedSubmission(
      guidedActivity,
      withEnvelope(validGuidedEnvelope, changes),
    );

    expect(result.submissionData.status).toBe("submitted");
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it("replaces forged client grading fields with server results", () => {
    const result = gradeServerOwnedSubmission(
      guidedActivity,
      withEnvelope(validGuidedEnvelope, {
        parts: validGuidedEnvelope.parts.map((part) => ({
          ...part,
          isCorrect: false,
          score: 0,
          maxScore: 99,
        })),
      }),
    );

    expect(result.score).toBe(3);
    expect(result.maxScore).toBe(3);
    expect(
      result.submissionData.parts.map((part) => ({
        partId: part.partId,
        isCorrect: part.isCorrect,
        score: part.score,
        maxScore: part.maxScore,
      })),
    ).toEqual([
      { partId: "table_values", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "placed_points", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "solution", isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  it.each([
    [
      "missing solution part",
      {
        parts: validGuidedEnvelope.parts.slice(0, 2),
      },
    ],
    [
      "one extra part",
      {
        parts: [...validGuidedEnvelope.parts, validGuidedEnvelope.parts[0]],
      },
    ],
    [
      "parts in the wrong order",
      {
        parts: [
          validGuidedEnvelope.parts[1],
          validGuidedEnvelope.parts[0],
          validGuidedEnvelope.parts[2],
        ],
      },
    ],
    [
      "one duplicate part",
      {
        parts: [
          validGuidedEnvelope.parts[0],
          validGuidedEnvelope.parts[0],
          validGuidedEnvelope.parts[2],
        ],
      },
    ],
    [
      "raw table_values with four points",
      {
        parts: [
          { ...validGuidedEnvelope.parts[0], rawAnswer: guidedTableValues.slice(0, 4) },
          validGuidedEnvelope.parts[1],
          validGuidedEnvelope.parts[2],
        ],
      },
    ],
    [
      "raw placed_points with four points",
      {
        parts: [
          validGuidedEnvelope.parts[0],
          { ...validGuidedEnvelope.parts[1], rawAnswer: guidedPlacedPoints.slice(0, 4) },
          validGuidedEnvelope.parts[2],
        ],
      },
    ],
    [
      "raw table point with an extra label field",
      {
        parts: [
          {
            ...validGuidedEnvelope.parts[0],
            rawAnswer: guidedTableValues.map((point, index) =>
              index === 0 ? { ...point, label: "forged" } : point,
            ),
          },
          validGuidedEnvelope.parts[1],
          validGuidedEnvelope.parts[2],
        ],
      },
    ],
    [
      "raw placed point with a non-finite coordinate",
      {
        parts: [
          validGuidedEnvelope.parts[0],
          {
            ...validGuidedEnvelope.parts[1],
            rawAnswer: guidedPlacedPoints.map((point, index) =>
              index === 0 ? { ...point, x: Number.POSITIVE_INFINITY } : point,
            ),
          },
          validGuidedEnvelope.parts[2],
        ],
      },
    ],
    [
      "non-finite raw solution",
      {
        parts: [
          validGuidedEnvelope.parts[0],
          validGuidedEnvelope.parts[1],
          { ...validGuidedEnvelope.parts[2], rawAnswer: Number.POSITIVE_INFINITY },
        ],
      },
    ],
  ])("keeps malformed raw-part cases ungraded: %s", (_label, changes) => {
    const result = gradeServerOwnedSubmission(
      guidedActivity,
      withEnvelope(validGuidedEnvelope, changes),
    );

    expect(result.submissionData.status).toBe("submitted");
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it("requires exact table row order while allowing placed-point order independence", () => {
    const result = gradeServerOwnedSubmission(
      guidedActivity,
      withEnvelope(validGuidedEnvelope, {
        parts: [
          { ...validGuidedEnvelope.parts[0], rawAnswer: [...guidedTableValues].reverse() },
          validGuidedEnvelope.parts[1],
          validGuidedEnvelope.parts[2],
        ],
      }),
    );

    expect(result).toMatchObject({
      score: 2,
      maxScore: 3,
      submissionData: {
        status: "graded",
        parts: [
          { partId: "table_values", isCorrect: false, score: 0, maxScore: 1 },
          { partId: "placed_points", isCorrect: true, score: 1, maxScore: 1 },
          { partId: "solution", isCorrect: true, score: 1, maxScore: 1 },
        ],
      },
    });
  });
});
