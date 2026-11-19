import { describe, expect, it, vi } from "vitest";

import {
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG,
} from "@/convex/activities";
import { generateTopic12QuadraticNegativeRateIntervalChoiceOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-quadratic-negative-rate-submission-learner";

type Row = Record<string, unknown> & { _id: string };
type Mode = "guided_practice" | "independent_practice";
type SubmissionData = Record<string, unknown>;
type Handler = (
  ctx: unknown,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: SubmissionData;
  },
) => Promise<{
  submissionId: string;
  score: number;
  maxScore: number;
  attemptOrdinal: number;
  feedback: string;
}>;

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic12QuadraticNegativeRateIntervalSubmission as
    | { _handler?: unknown }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error(
      "AP Precalculus must export createTopic12QuadraticNegativeRateIntervalSubmission.",
    );
  }
  return mutation._handler as Handler;
}

function activityIdForMode(mode: Mode) {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID;
}

function gradingConfigForMode(mode: Mode) {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG
    : PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG;
}

function expectedAnswer(seed: number) {
  return (
    generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).expectedAnswer as {
      selectedOptionId: string;
    }
  ).selectedOptionId;
}

function createHarness(mode: Mode = "guided_practice", includeOtherMode = false) {
  const makeActivity = (activityMode: Mode): Row => ({
    _id: `activities:quadratic-${activityMode}`,
    stableActivityId: activityIdForMode(activityMode),
    componentKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
    props: { presentationMode: activityMode },
    gradingConfig: gradingConfigForMode(activityMode),
    createdAt: 1,
    updatedAt: 1,
  });
  const rows: Record<string, Row[]> = {
    activities: [makeActivity(mode)],
    activity_submissions: [],
    learning_evidence: [],
  };
  if (includeOtherMode) {
    rows.activities.push(
      makeActivity(mode === "guided_practice" ? "independent_practice" : "guided_practice"),
    );
  }

  function selectedRows(tableName: string, conditions: ReadonlyMap<string, unknown>) {
    return (rows[tableName] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );
  }

  const ctx = {
    db: {
      query: (tableName: string) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        let orderDirection: "asc" | "desc" = "asc";
        const result = {
          unique: async () => selectedRows(tableName, conditions)[0] ?? null,
          first: async () => {
            const matches = selectedRows(tableName, conditions);
            if (orderDirection === "desc") matches.reverse();
            return matches[0] ?? null;
          },
          order: (direction: "asc" | "desc") => {
            orderDirection = direction;
            return result;
          },
        };
        return {
          withIndex: (_indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            return result;
          },
          ...result,
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  };

  return {
    ctx,
    rows,
    activityId: activityIdForMode(mode),
    gradingConfig: gradingConfigForMode(mode),
  };
}

function makeEnvelope(
  mode: Mode,
  selectedOptionId: unknown,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId: activityIdForMode(mode),
    mode,
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
    ...overrides,
  };
}

describe("Topic 1.2 quadratic negative-rate interval server submission", () => {
  it.each([
    ["guided_practice", 1],
    ["independent_practice", 2],
  ] as const)("grades the generated %s answer and stores server-owned data", async (mode, seed) => {
    const handler = await loadHandler();
    const harness = createHarness(mode);
    const answer = expectedAnswer(seed);
    const result = await handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `quadratic-${mode}-correct`,
      submissionData: makeEnvelope(mode, answer),
    });
    const stored = harness.rows.activity_submissions[0]!;
    expect(result).toStrictEqual({
      submissionId: stored._id,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: "1/1 quadratic negative-rate interval selections matched the server rubric.",
    });
    expect(stored).toMatchObject({
      userId: LEARNER_ID,
      activityId: `activities:quadratic-${mode}`,
      stableActivityId: harness.activityId,
      createIdempotencyKey: `quadratic-${mode}-correct`,
      attemptOrdinal: 1,
      score: 1,
      maxScore: 1,
      feedback: "1/1 quadratic negative-rate interval selections matched the server rubric.",
      masteryContractVersion: "learning-evidence.v1",
      submittedAt: expect.any(Number),
      gradedAt: expect.any(Number),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      submissionData: {
        contractVersion: "practice.v1",
        activityId: harness.activityId,
        mode,
        status: "graded",
        attemptNumber: 1,
        answers: { selectedOptionId: answer },
        parts: [
          { partId: "selectedOptionId", rawAnswer: answer, isCorrect: true, score: 1, maxScore: 1 },
        ],
      },
    });
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(Object.keys(storedData).sort()).toEqual([
      "activityId",
      "answers",
      "attemptNumber",
      "contractVersion",
      "mode",
      "parts",
      "status",
      "submittedAt",
    ]);
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.attemptNumber).toBe(1);
    expect(storedData.submittedAt).not.toBe("2026-08-19T10:00:00.000Z");
    expect(stored.submittedAt).toBe(stored.gradedAt);
    expect(stored.submittedAt).toBe(stored.createdAt);
    expect(stored.submittedAt).toBe(stored.updatedAt);
    expect(harness.rows.learning_evidence).toHaveLength(0);

    const wrongHarness = createHarness(mode);
    const wrongAnswer = answer === "A" ? "B" : "A";
    const wrongResult = await handler(wrongHarness.ctx, {
      userId: LEARNER_ID,
      activityId: wrongHarness.activityId,
      idempotencyKey: `quadratic-${mode}-wrong`,
      submissionData: makeEnvelope(mode, wrongAnswer),
    });
    expect(wrongResult).toMatchObject({ score: 0, maxScore: 1 });
    expect(wrongHarness.rows.activity_submissions).toHaveLength(1);
    expect(
      (wrongHarness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>)
        .answers,
    ).toEqual({ selectedOptionId: wrongAnswer });
  });

  it.each([
    ["missing selected option", makeEnvelope("guided_practice", "A", { answers: {} })],
    ["blank selected option", makeEnvelope("guided_practice", "   ")],
    ["unknown selected option", makeEnvelope("guided_practice", "E")],
    ["mismatched activity", makeEnvelope("guided_practice", "A", { activityId: "wrong" })],
    ["mismatched mode", makeEnvelope("guided_practice", "A", { mode: "independent_practice" })],
    [
      "mismatched raw part",
      makeEnvelope("guided_practice", "A", {
        parts: [{ partId: "selectedOptionId", rawAnswer: "B" }],
      }),
    ],
    [
      "extra answer field",
      makeEnvelope("guided_practice", "A", { answers: { selectedOptionId: "A", score: 1 } }),
    ],
    [
      "extra part field",
      makeEnvelope("guided_practice", "A", {
        parts: [{ partId: "selectedOptionId", rawAnswer: "A", isCorrect: true }],
      }),
    ],
    ["extra outer field", makeEnvelope("guided_practice", "A", { score: 1 })],
    ["invalid attempt", makeEnvelope("guided_practice", "A", { attemptNumber: 0 })],
    ["fractional attempt", makeEnvelope("guided_practice", "A", { attemptNumber: 1.5 })],
    ["invalid timestamp", makeEnvelope("guided_practice", "A", { submittedAt: "not-a-date" })],
  ] as const)("rejects %s before persistence", async (_label, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: harness.activityId,
        idempotencyKey: `quadratic-raw-${_label.replaceAll(" ", "-")}`,
        submissionData,
      }),
    ).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("rejects a blank idempotency key before persistence", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: harness.activityId,
        idempotencyKey: "   ",
        submissionData: makeEnvelope("guided_practice", "A"),
      }),
    ).rejects.toThrow(/idempotency/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "missing activity",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities = [];
      },
    ],
    [
      "wrong stable ID",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.stableActivityId = "wrong";
      },
    ],
    [
      "wrong component",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.componentKey = "graph-average-rate-choice";
      },
    ],
    [
      "non-record props",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.props = null;
      },
    ],
    [
      "wrong presentation mode",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.props = { presentationMode: "worked_example" };
      },
    ],
    [
      "non-record grading config",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = null;
      },
    ],
    [
      "wrong generator",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: "topic12-graph-average-rate-choice",
          variantSeed: 1,
        };
      },
    ],
    [
      "wrong stored seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
          variantSeed: 0,
        };
      },
    ],
    [
      "fractional stored seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
          variantSeed: 1.5,
        };
      },
    ],
    [
      "extra grading config key",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = { ...harness.gradingConfig, extra: true };
      },
    ],
  ] as const)("rejects %s before persistence", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: harness.activityId,
        idempotencyKey: `quadratic-provisioning-${_label.replaceAll(" ", "-")}`,
        submissionData: makeEnvelope("guided_practice", expectedAnswer(1)),
      }),
    ).rejects.toThrow(/invalid|provisioned|configuration|activity/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("rejects unknown activity IDs and cross-mode key reuse", async () => {
    const handler = await loadHandler();
    const harness = createHarness("guided_practice", true);
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: "math.precalc.skill.1.2.unknown.guided_practice",
        idempotencyKey: "quadratic-unknown",
        submissionData: makeEnvelope("guided_practice", "A"),
      }),
    ).rejects.toThrow(/invalid|activity/i);
    await handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: "quadratic-cross-mode",
      submissionData: makeEnvelope("guided_practice", expectedAnswer(1)),
    });
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: activityIdForMode("independent_practice"),
        idempotencyKey: "quadratic-cross-mode",
        submissionData: makeEnvelope("independent_practice", expectedAnswer(2)),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it("replays exactly, increments the server ordinal, and rejects changed answers", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answer = expectedAnswer(1);
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: "quadratic-replay",
      submissionData: makeEnvelope("guided_practice", answer),
    };
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeEnvelope("guided_practice", answer === "A" ? "B" : "A"),
      }),
    ).rejects.toThrow("idempotency_conflict");
    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "quadratic-second-attempt",
    });
    expect(second).toMatchObject({ attemptOrdinal: 2, score: 1 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
  });

  it.each([
    [
      "stored activity identity",
      (row: Row) => {
        row.activityId = "activities:wrong";
      },
    ],
    [
      "stored stable identity",
      (row: Row) => {
        row.stableActivityId = "wrong";
      },
    ],
    [
      "stored envelope identity",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).activityId = "wrong";
      },
    ],
    [
      "stored answer",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).answers as Record<string, unknown>
        ).selectedOptionId = "A";
      },
    ],
    [
      "stored part",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.rawAnswer = "A";
      },
    ],
    [
      "stored score",
      (row: Row) => {
        row.score = 0;
      },
    ],
    [
      "stored max score",
      (row: Row) => {
        row.maxScore = 0;
      },
    ],
    [
      "stored feedback",
      (row: Row) => {
        row.feedback = "forged feedback";
      },
    ],
    [
      "stored ordinal",
      (row: Row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "stored submission time",
      (row: Row) => {
        row.submittedAt = 0;
      },
    ],
    [
      "stored envelope time",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).submittedAt = "not-a-date";
      },
    ],
    [
      "stored graded time",
      (row: Row) => {
        row.gradedAt = 0;
      },
    ],
  ] as const)("fails closed on %s replay corruption", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answer = expectedAnswer(1);
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `quadratic-corrupt-${_label.replaceAll(" ", "-")}`,
      submissionData: makeEnvelope("guided_practice", answer),
    };
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
