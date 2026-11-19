import { describe, expect, it } from "vitest";

import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import { getGenerator } from "@math-platform/math-content/knowledge-space";

import {
  gradeServerOwnedSubmission,
  type ServerOwnedActivity,
} from "@/lib/activities/server-grading";
import {
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
} from "@/lib/practice/learning-evidence-pilot";

type Point = { x: number; y: number };

describe("IM3 two-real-solutions server grading", () => {
  it("grades exact Guided raw parts with order-independent points and solutions", () => {
    const output = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const data = output.data as { rendererProps: Record<string, unknown> };
    const expectedAnswer = output.expectedAnswer as {
      table_values: Point[];
      placed_points: Point[];
      solutions: number[];
    };
    const activity: ServerOwnedActivity = {
      id: "activities:server-owned-im3-two-real-solutions-guided-activity-document",
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      componentKey: "graphing-explorer",
      srsEligible: false,
      props: data.rendererProps,
      gradingConfig: {
        partIds: ["table_values", "placed_points", "solutions"],
        rubric: [
          { partId: "table_values", points: 1 },
          { partId: "placed_points", points: 1 },
          { partId: "solutions", points: 1 },
        ],
      },
    };
    const envelope = practiceSubmissionEnvelopeSchema.parse({
      contractVersion: "practice.v1",
      activityId: "client-supplied-two-real-solutions-activity-id",
      mode: "guided_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-09-07T10:00:00.000Z",
      answers: expectedAnswer,
      parts: [
        { partId: "table_values", rawAnswer: expectedAnswer.table_values },
        { partId: "placed_points", rawAnswer: [...expectedAnswer.placed_points].reverse() },
        { partId: "solutions", rawAnswer: [...expectedAnswer.solutions].reverse() },
      ],
    });

    const result = gradeServerOwnedSubmission(activity, envelope);

    expect(result.submissionData.activityId).toBe(activity.id);
    expect(result.submissionData.status).toBe("graded");
    expect(result.score).toBe(3);
    expect(result.maxScore).toBe(3);
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.parts).toEqual([
      {
        partId: "table_values",
        rawAnswer: expectedAnswer.table_values,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      },
      {
        partId: "placed_points",
        rawAnswer: [...expectedAnswer.placed_points].reverse(),
        isCorrect: true,
        score: 1,
        maxScore: 1,
      },
      {
        partId: "solutions",
        rawAnswer: [...expectedAnswer.solutions].reverse(),
        isCorrect: true,
        score: 1,
        maxScore: 1,
      },
    ]);
  });

  it("grades Independent partial credit with exact table order and solution matching", () => {
    const output = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 2,
      difficulty: 0.5,
    });
    const data = output.data as { rendererProps: Record<string, unknown> };
    const expectedAnswer = output.expectedAnswer as {
      table_values: Point[];
      placed_points: Point[];
      solutions: number[];
    };
    const shiftedPlacedPoints = [...expectedAnswer.placed_points]
      .reverse()
      .map((point) => ({ x: point.x + 0.25, y: point.y - 0.25 }));
    const partialTableValues = [
      expectedAnswer.table_values[1],
      expectedAnswer.table_values[0],
      ...expectedAnswer.table_values.slice(2),
    ];
    const partialSolutions = [expectedAnswer.solutions[0], expectedAnswer.solutions[1] + 0.01];
    const activity: ServerOwnedActivity = {
      id: "activities:server-owned-im3-two-real-solutions-independent-activity-document",
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
      props: data.rendererProps,
      gradingConfig: {
        partIds: ["table_values", "placed_points", "solutions"],
        rubric: [
          { partId: "table_values", points: 1 },
          { partId: "placed_points", points: 1 },
          { partId: "solutions", points: 1 },
        ],
      },
    };
    const envelope = practiceSubmissionEnvelopeSchema.parse({
      contractVersion: "practice.v1",
      activityId: "client-supplied-two-real-solutions-independent-activity-id",
      mode: "independent_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-09-07T10:05:00.000Z",
      answers: {
        table_values: partialTableValues,
        placed_points: shiftedPlacedPoints,
        solutions: partialSolutions,
      },
      parts: [
        { partId: "table_values", rawAnswer: partialTableValues },
        { partId: "placed_points", rawAnswer: shiftedPlacedPoints },
        { partId: "solutions", rawAnswer: partialSolutions },
      ],
    });

    const result = gradeServerOwnedSubmission(activity, envelope);

    expect(result.submissionData.status).toBe("graded");
    expect(result.score).toBe(1);
    expect(result.maxScore).toBe(3);
    expect(result.masteryContractVersion).toBe("learning-evidence.v1");
    expect(result.submissionData.parts.map((part) => part.score)).toEqual([0, 1, 0]);
  });

  it("fails closed for malformed two-real raw and answer shapes", () => {
    const output = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const data = output.data as { rendererProps: Record<string, unknown> };
    const expectedAnswer = output.expectedAnswer as {
      table_values: Point[];
      placed_points: Point[];
      solutions: number[];
    };
    const activity: ServerOwnedActivity = {
      id: "activities:server-owned-im3-two-real-solutions-guided-activity-document",
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      componentKey: "graphing-explorer",
      srsEligible: false,
      props: data.rendererProps,
      gradingConfig: {
        partIds: ["table_values", "placed_points", "solutions"],
        rubric: [
          { partId: "table_values", points: 1 },
          { partId: "placed_points", points: 1 },
          { partId: "solutions", points: 1 },
        ],
      },
    };
    const validEnvelope = practiceSubmissionEnvelopeSchema.parse({
      contractVersion: "practice.v1",
      activityId: "client-supplied-two-real-solutions-activity-id",
      mode: "guided_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-09-07T10:10:00.000Z",
      answers: expectedAnswer,
      parts: [
        { partId: "table_values", rawAnswer: expectedAnswer.table_values },
        { partId: "placed_points", rawAnswer: expectedAnswer.placed_points },
        { partId: "solutions", rawAnswer: expectedAnswer.solutions },
      ],
    });
    const malformedCases: Array<{ label: string; partId: string; value: unknown }> = [
      {
        label: "table_values with four rows",
        partId: "table_values",
        value: expectedAnswer.table_values.slice(0, 4),
      },
      {
        label: "placed_points with a non-finite coordinate",
        partId: "placed_points",
        value: expectedAnswer.placed_points.map((point, index) =>
          index === 0 ? { ...point, x: Number.NaN } : point,
        ),
      },
      {
        label: "solutions with one number",
        partId: "solutions",
        value: expectedAnswer.solutions.slice(0, 1),
      },
      {
        label: "solutions with an infinite number",
        partId: "solutions",
        value: [expectedAnswer.solutions[0], Number.POSITIVE_INFINITY],
      },
    ];

    for (const malformedCase of malformedCases) {
      const malformedEnvelope = {
        ...validEnvelope,
        answers: {
          ...validEnvelope.answers,
          [malformedCase.partId]: malformedCase.value,
        },
        parts: validEnvelope.parts.map((part) =>
          part.partId === malformedCase.partId ? { ...part, rawAnswer: malformedCase.value } : part,
        ),
      } as typeof validEnvelope;
      const result = gradeServerOwnedSubmission(activity, malformedEnvelope);

      expect(result.submissionData.activityId, malformedCase.label).toBe(activity.id);
      expect(result.submissionData.status).toBe("submitted");
      expect(result.score).toBeUndefined();
      expect(result.maxScore).toBeUndefined();
      expect(result.masteryContractVersion).toBeUndefined();
      for (const part of result.submissionData.parts) {
        expect(part).not.toHaveProperty("isCorrect");
        expect(part).not.toHaveProperty("score");
        expect(part).not.toHaveProperty("maxScore");
      }
    }
  });

  it("fails closed for a downward two-real quadratic candidate", () => {
    const output = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const data = output.data as { rendererProps: Record<string, unknown> };
    const expectedAnswer = output.expectedAnswer as {
      table_values: Point[];
      placed_points: Point[];
      solutions: number[];
    };
    const activity: ServerOwnedActivity = {
      id: "activities:server-owned-im3-two-real-solutions-guided-activity-document",
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      componentKey: "graphing-explorer",
      srsEligible: false,
      props: {
        ...data.rendererProps,
        equation: "f(x) = -x^2 + 24x - 143",
      },
      gradingConfig: {
        partIds: ["table_values", "placed_points", "solutions"],
        rubric: [
          { partId: "table_values", points: 1 },
          { partId: "placed_points", points: 1 },
          { partId: "solutions", points: 1 },
        ],
      },
    };
    const envelope = practiceSubmissionEnvelopeSchema.parse({
      contractVersion: "practice.v1",
      activityId: "client-supplied-two-real-solutions-activity-id",
      mode: "guided_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-09-07T10:15:00.000Z",
      answers: expectedAnswer,
      parts: [
        { partId: "table_values", rawAnswer: expectedAnswer.table_values },
        { partId: "placed_points", rawAnswer: expectedAnswer.placed_points },
        { partId: "solutions", rawAnswer: expectedAnswer.solutions },
      ],
    });

    const result = gradeServerOwnedSubmission(activity, envelope);

    expect(result.submissionData.activityId).toBe(activity.id);
    expect(result.submissionData.status).toBe("submitted");
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    for (const part of result.submissionData.parts) {
      expect(part).not.toHaveProperty("isCorrect");
      expect(part).not.toHaveProperty("score");
      expect(part).not.toHaveProperty("maxScore");
    }
  });

  it("fails closed for two-real identity and mode mismatches", () => {
    const output = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const data = output.data as { rendererProps: Record<string, unknown> };
    const expectedAnswer = output.expectedAnswer as {
      table_values: Point[];
      placed_points: Point[];
      solutions: number[];
    };
    const activity: ServerOwnedActivity = {
      id: "activities:server-owned-im3-two-real-solutions-guided-activity-document",
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      componentKey: "graphing-explorer",
      srsEligible: false,
      props: data.rendererProps,
      gradingConfig: {
        partIds: ["table_values", "placed_points", "solutions"],
        rubric: [
          { partId: "table_values", points: 1 },
          { partId: "placed_points", points: 1 },
          { partId: "solutions", points: 1 },
        ],
      },
    };
    const validEnvelope = practiceSubmissionEnvelopeSchema.parse({
      contractVersion: "practice.v1",
      activityId: "client-supplied-two-real-solutions-activity-id",
      mode: "guided_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-09-07T10:20:00.000Z",
      answers: expectedAnswer,
      parts: [
        { partId: "table_values", rawAnswer: expectedAnswer.table_values },
        { partId: "placed_points", rawAnswer: expectedAnswer.placed_points },
        { partId: "solutions", rawAnswer: expectedAnswer.solutions },
      ],
    });
    const buildCase = (
      activityOverrides: Partial<ServerOwnedActivity>,
      envelopeOverrides: Partial<typeof validEnvelope> = {},
    ) => ({
      activity: { ...activity, ...activityOverrides } as ServerOwnedActivity,
      envelope: { ...validEnvelope, ...envelopeOverrides } as typeof validEnvelope,
    });
    const cases: Array<[string, ReturnType<typeof buildCase>]> = [
      ["wrong stable activity ID", buildCase({ stableActivityId: "two-real-lookalike" })],
      ["missing mastery node ID", buildCase({ masteryNodeId: undefined })],
      ["wrong mastery node ID", buildCase({ masteryNodeId: "math.im3.other-node" })],
      ["wrong component", buildCase({ componentKey: "fill-in-the-blank" })],
      [
        "wrong response variant",
        buildCase({
          props: { ...data.rendererProps, responseVariant: "plot_from_equation" },
        }),
      ],
      ["Guided ID with independent mode", buildCase({}, { mode: "independent_practice" })],
      [
        "Independent ID with guided mode",
        buildCase({
          stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
          srsEligible: true,
        }),
      ],
      ["non-submitted status", buildCase({}, { status: "draft" })],
    ];

    for (const [label, testCase] of cases) {
      const result = gradeServerOwnedSubmission(testCase.activity, testCase.envelope);

      expect(result.submissionData.activityId, label).toBe(activity.id);
      expect(result.submissionData.status).not.toBe("graded");
      expect(result.submissionData.status).toBe("submitted");
      expect(result.score).toBeUndefined();
      expect(result.maxScore).toBeUndefined();
      expect(result.masteryContractVersion).toBeUndefined();
      for (const part of result.submissionData.parts) {
        expect(part).not.toHaveProperty("isCorrect");
        expect(part).not.toHaveProperty("score");
        expect(part).not.toHaveProperty("maxScore");
      }
    }
  });

  it("fails closed for non-canonical two-real parts and rubric", () => {
    const output = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const data = output.data as { rendererProps: Record<string, unknown> };
    const expectedAnswer = output.expectedAnswer as {
      table_values: Point[];
      placed_points: Point[];
      solutions: number[];
    };
    const activity: ServerOwnedActivity = {
      id: "activities:server-owned-im3-two-real-solutions-guided-activity-document",
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      componentKey: "graphing-explorer",
      srsEligible: false,
      props: data.rendererProps,
      gradingConfig: {
        partIds: ["table_values", "placed_points", "solutions"],
        rubric: [
          { partId: "table_values", points: 1 },
          { partId: "placed_points", points: 1 },
          { partId: "solutions", points: 1 },
        ],
      },
    };
    const validEnvelope = practiceSubmissionEnvelopeSchema.parse({
      contractVersion: "practice.v1",
      activityId: "client-supplied-two-real-solutions-activity-id",
      mode: "guided_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-09-07T10:25:00.000Z",
      answers: expectedAnswer,
      parts: [
        { partId: "table_values", rawAnswer: expectedAnswer.table_values },
        { partId: "placed_points", rawAnswer: expectedAnswer.placed_points },
        { partId: "solutions", rawAnswer: expectedAnswer.solutions },
      ],
    });
    const buildCase = (
      activityOverrides: Partial<ServerOwnedActivity>,
      envelopeOverrides: Partial<typeof validEnvelope> = {},
    ) => ({
      activity: { ...activity, ...activityOverrides } as ServerOwnedActivity,
      envelope: { ...validEnvelope, ...envelopeOverrides } as typeof validEnvelope,
    });
    const cases: Array<[string, ReturnType<typeof buildCase>]> = [
      ["missing submission part", buildCase({}, { parts: validEnvelope.parts.slice(0, 2) })],
      [
        "duplicate submission part ID",
        buildCase(
          {},
          {
            parts: [validEnvelope.parts[0], validEnvelope.parts[1], validEnvelope.parts[1]],
          },
        ),
      ],
      [
        "extra submission part",
        buildCase(
          {},
          {
            parts: [
              ...validEnvelope.parts,
              { partId: "extra", rawAnswer: expectedAnswer.table_values },
            ],
          },
        ),
      ],
      [
        "wrong submission part order",
        buildCase(
          {},
          {
            parts: [validEnvelope.parts[1], validEnvelope.parts[0], validEnvelope.parts[2]],
          },
        ),
      ],
      [
        "missing answer key",
        buildCase(
          {},
          {
            answers: Object.fromEntries(
              Object.entries(validEnvelope.answers).filter(([key]) => key !== "solutions"),
            ) as typeof validEnvelope.answers,
          },
        ),
      ],
      [
        "extra answer key",
        buildCase(
          {},
          {
            answers: { ...validEnvelope.answers, extra: expectedAnswer.table_values },
          },
        ),
      ],
      [
        "wrong gradingConfig part ID",
        buildCase({
          gradingConfig: {
            ...activity.gradingConfig,
            partIds: ["table_values", "placed_points", "wrong"],
          },
        }),
      ],
      [
        "wrong rubric part ID",
        buildCase({
          gradingConfig: {
            ...activity.gradingConfig,
            rubric: [
              { partId: "table_values", points: 1 },
              { partId: "placed_points", points: 1 },
              { partId: "wrong", points: 1 },
            ],
          },
        }),
      ],
      [
        "rubric points equal 2",
        buildCase({
          gradingConfig: {
            ...activity.gradingConfig,
            rubric: [
              { partId: "table_values", points: 2 },
              { partId: "placed_points", points: 1 },
              { partId: "solutions", points: 1 },
            ],
          },
        }),
      ],
    ];

    for (const [label, testCase] of cases) {
      const result = gradeServerOwnedSubmission(testCase.activity, testCase.envelope);

      expect(result.submissionData.activityId, label).toBe(activity.id);
      expect(result.submissionData.status).toBe("submitted");
      expect(result.score).toBeUndefined();
      expect(result.maxScore).toBeUndefined();
      expect(result.masteryContractVersion).toBeUndefined();
      for (const part of result.submissionData.parts) {
        expect(part).not.toHaveProperty("isCorrect");
        expect(part).not.toHaveProperty("score");
        expect(part).not.toHaveProperty("maxScore");
      }
    }
  });
});
