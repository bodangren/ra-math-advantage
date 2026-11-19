import { describe, expect, it, vi } from "vitest";

import { BM2_PILOT_SOURCE_ACTIVITY_ID } from "@/lib/learning-evidence/bm2-pilot";

const LEARNER_ID = "profiles:bm2-daily-source-student";
const SOURCE_ACTIVITY_DOCUMENT_ID = "activities:bm2-daily-source-row";
const SERVER_NOW = 1_787_200_000_000;

type Row = Record<string, unknown> & { _id: string };

type SubmitAssessmentHandler = (
  ctx: unknown,
  args: {
    userId: string;
    activityId: string;
    submissionData: Record<string, unknown>;
    score?: number;
    maxScore?: number;
    feedback?: string;
  },
) => Promise<{ id: string }>;

async function loadSubmitAssessmentHandler(): Promise<SubmitAssessmentHandler> {
  const source = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = source.submitAssessment;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error("BM2 must export submitAssessment as the daily stored-submission boundary.");
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error("BM2 submitAssessment must expose a Convex mutation handler.");
  }
  return handler as SubmitAssessmentHandler;
}

function createHarness() {
  const rows: { activities: Row[]; activity_submissions: Row[] } = {
    activities: [
      {
        _id: SOURCE_ACTIVITY_DOCUMENT_ID,
        stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
        componentKey: "notebook-organizer",
        displayName: "The Notebook Organizer",
        description: "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'.",
        props: {},
        gradingConfig: {},
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    activity_submissions: [
      {
        _id: "activity_submissions:prior-daily-source",
        userId: LEARNER_ID,
        activityId: SOURCE_ACTIVITY_DOCUMENT_ID,
        stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
        attemptOrdinal: 1,
        submittedAt: SERVER_NOW - 1,
        createdAt: SERVER_NOW - 1,
        updatedAt: SERVER_NOW - 1,
      },
    ],
  };
  const indexCalls: Array<{
    tableName: string;
    indexName: string;
    conditions: Array<[string, unknown]>;
  }> = [];

  const ctx = {
    db: {
      get: async (id: string) =>
        Object.values(rows)
          .flat()
          .find((row) => row._id === id) ?? null,
      query: (tableName: keyof typeof rows) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        let direction: "asc" | "desc" = "asc";
        const result = {
          collect: async () =>
            rows[tableName].filter((row) =>
              [...conditions].every(([field, value]) => row[field] === value),
            ),
          first: async () => {
            const matching = rows[tableName]
              .filter((row) => [...conditions].every(([field, value]) => row[field] === value))
              .sort(
                (left, right) =>
                  Number(left.attemptOrdinal ?? 0) - Number(right.attemptOrdinal ?? 0),
              );
            return direction === "desc" ? (matching.at(-1) ?? null) : (matching[0] ?? null);
          },
          order(nextDirection: "asc" | "desc") {
            direction = nextDirection;
            return result;
          },
        };
        return {
          withIndex: (indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            indexCalls.push({
              tableName,
              indexName,
              conditions: [...conditions],
            });
            return result;
          },
        };
      },
      insert: async (tableName: keyof typeof rows, document: Record<string, unknown>) => {
        const id = `${tableName}:${rows[tableName].length + 1}`;
        rows[tableName].push({ _id: id, ...document });
        return id;
      },
    },
  };

  return { ctx, indexCalls, rows };
}

describe("BM2 daily source stored-submission authority", () => {
  it("persists source identity, time, ordinal, and the trusted route-grade inputs instead of browser fields", async () => {
    const handler = await loadSubmitAssessmentHandler();
    const { ctx, indexCalls, rows } = createHarness();
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);

    try {
      const result = await handler(ctx, {
        userId: LEARNER_ID,
        activityId: SOURCE_ACTIVITY_DOCUMENT_ID,
        submissionData: {
          contractVersion: "practice.v1",
          activityId: SOURCE_ACTIVITY_DOCUMENT_ID,
          mode: "guided_practice",
          status: "submitted",
          attemptNumber: 999,
          submittedAt: "1999-01-01T00:00:00.000Z",
          answers: { dailySource: "raw-student-answer" },
          parts: [
            {
              partId: "dailySource",
              rawAnswer: "raw-student-answer",
              isCorrect: true,
              score: 99,
              maxScore: 99,
            },
          ],
        },
        // submitAssessment is an internal storage boundary. Its aggregate
        // grade values come from the public route rubric, not from the browser
        // envelope. Nested browser part grades must still be removed below.
        score: 1,
        maxScore: 1,
        feedback: "Server grade only.",
      });

      const stored = rows.activity_submissions.find((row) => row._id === result.id);
      expect(stored).toEqual(
        expect.objectContaining({
          userId: LEARNER_ID,
          activityId: SOURCE_ACTIVITY_DOCUMENT_ID,
          stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
          attemptOrdinal: 2,
          score: 1,
          maxScore: 1,
          feedback: "Server grade only.",
          submittedAt: SERVER_NOW,
        }),
      );
      expect(stored?.submissionData).toEqual(
        expect.objectContaining({
          activityId: SOURCE_ACTIVITY_DOCUMENT_ID,
          mode: "guided_practice",
          status: "graded",
          attemptNumber: 2,
          submittedAt: new Date(SERVER_NOW).toISOString(),
        }),
      );
      const storedPart = (stored?.submissionData as { parts?: Array<Record<string, unknown>> })
        .parts?.[0];
      expect(storedPart).toMatchObject({
        partId: "dailySource",
        rawAnswer: "raw-student-answer",
      });
      expect(storedPart).not.toHaveProperty("isCorrect");
      expect(storedPart).not.toHaveProperty("score");
      expect(storedPart).not.toHaveProperty("maxScore");
      expect(indexCalls).toContainEqual({
        tableName: "activity_submissions",
        indexName: "by_user_and_activity_and_attempt_ordinal",
        conditions: [
          ["userId", LEARNER_ID],
          ["activityId", SOURCE_ACTIVITY_DOCUMENT_ID],
        ],
      });
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("assigns server time and attempt number to a non-pilot submission", async () => {
    const handler = await loadSubmitAssessmentHandler();
    const { ctx, indexCalls, rows } = createHarness();
    const nonPilotActivityId = "activities:bm2-non-pilot-row";
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    rows.activities.push({
      _id: nonPilotActivityId,
      componentKey: "comprehension-quiz",
      props: {},
    });

    try {
      const result = await handler(ctx, {
        userId: LEARNER_ID,
        activityId: nonPilotActivityId,
        submissionData: {
          contractVersion: "practice.v1",
          activityId: nonPilotActivityId,
          mode: "assessment",
          status: "submitted",
          attemptNumber: 7,
          submittedAt: "1999-01-01T00:00:00.000Z",
          answers: { q1: "raw-student-answer" },
          parts: [
            {
              partId: "q1",
              rawAnswer: "raw-student-answer",
              normalizedAnswer: "raw-student-answer",
            },
          ],
        },
        score: 1,
        maxScore: 1,
        feedback: "Server grade only.",
      });

      const stored = rows.activity_submissions.find((row) => row._id === result.id);
      expect(stored).toMatchObject({
        userId: LEARNER_ID,
        activityId: nonPilotActivityId,
        attemptOrdinal: 1,
        submissionData: {
          status: "graded",
          attemptNumber: 1,
          submittedAt: new Date(SERVER_NOW).toISOString(),
          answers: { q1: "raw-student-answer" },
        },
        score: 1,
        maxScore: 1,
        submittedAt: SERVER_NOW,
      });

      expect(
        indexCalls.some(
          (call) =>
            call.tableName === "activity_submissions" &&
            call.indexName === "by_user_and_activity_and_attempt_ordinal",
        ),
      ).toBe(false);
    } finally {
      nowSpy.mockRestore();
    }
  });
});

it("keeps partial work as a draft and requires every reflection prompt for submission", async () => {
  const handler = await loadSubmitAssessmentHandler();
  const { ctx, rows } = createHarness();
  const activity = rows.activities[0];
  delete activity.stableActivityId;
  activity.componentKey = "reflection-journal";
  activity.props = { prompts: [{ id: "first" }, { id: "second" }], maxAttempts: 1 };
  rows.activity_submissions = [];
  const submissionData = {
    contractVersion: "practice.v1",
    activityId: SOURCE_ACTIVITY_DOCUMENT_ID,
    mode: "independent_practice",
    status: "draft",
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    answers: { first: "One calculation" },
    parts: [],
  };
  const args = { userId: LEARNER_ID, activityId: SOURCE_ACTIVITY_DOCUMENT_ID, submissionData };
  await handler(ctx, args);
  expect(rows.activity_submissions[0].submissionData).toMatchObject({ status: "draft" });
  await expect(
    handler(ctx, { ...args, submissionData: { ...submissionData, status: "submitted" } }),
  ).rejects.toThrow("required_answers_missing");
  await handler(ctx, {
    ...args,
    submissionData: {
      ...submissionData,
      status: "submitted",
      answers: { first: "One calculation", second: "A second check" },
    },
  });
  expect(rows.activity_submissions).toHaveLength(2);
});
