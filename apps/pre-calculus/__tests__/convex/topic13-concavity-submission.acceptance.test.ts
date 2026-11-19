import { describe, expect, it, vi } from "vitest";

import {
  PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_GRADING_CONFIG,
} from "@/convex/activities";
import { generateTopic13ConcavityFromRateChangeOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-concavity-submission-learner";
const CLIENT_SUBMITTED_AT = "2026-08-19T10:00:00.000Z";
const AUTHORITY_KEYS = [
  "expectedAnswer",
  "correctAnswer",
  "answerKey",
  "gradingMetadata",
  "solution",
  "solutionSteps",
  "correctClassification",
  "finalAnswer",
];
type Mode = "guided_practice" | "independent_practice";
type Row = Record<string, unknown> & { _id: string };
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
  const mutation = importedModule.createTopic13ConcavitySubmission as
    | { _handler?: unknown }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("AP Precalculus must export createTopic13ConcavitySubmission.");
  }
  return mutation._handler as Handler;
}

function activityIdForMode(mode: Mode): string {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID;
}

function gradingConfigForMode(mode: Mode) {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_GRADING_CONFIG
    : PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_GRADING_CONFIG;
}

function expectedClassification(seed: number): string {
  return (
    generateTopic13ConcavityFromRateChangeOutput(seed).expectedAnswer as { classification: string }
  ).classification;
}

function makeEnvelope(
  mode: Mode,
  classification: unknown,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId: activityIdForMode(mode),
    mode,
    status: "submitted",
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers: { classification },
    parts: [{ partId: "classification", rawAnswer: classification }],
    ...overrides,
  };
}

function createHarness(mode: Mode = "guided_practice", includeOtherMode = false) {
  const makeActivity = (activityMode: Mode): Row => ({
    _id: `activities:concavity-${activityMode}`,
    stableActivityId: activityIdForMode(activityMode),
    componentKey: PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
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

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectObjectKeys(nestedValue, keys);
    });
  }
  return keys;
}

function expectNoAuthority(value: unknown): void {
  const keys = collectObjectKeys(value);
  for (const key of AUTHORITY_KEYS) expect(keys).not.toContain(key);
}

describe("Topic 1.3 concavity server submission", () => {
  it.each([
    ["guided_practice", 1],
    ["independent_practice", 2],
  ] as const)(
    "grades correct and wrong %s answers with canonical server data",
    async (mode, seed) => {
      const handler = await loadHandler();
      const harness = createHarness(mode);
      const expected = expectedClassification(seed);
      const correct = await handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: harness.activityId,
        idempotencyKey: `concavity-${mode}-correct`,
        submissionData: makeEnvelope(mode, expected),
      });
      const stored = harness.rows.activity_submissions[0]!;
      expect(correct).toEqual({
        submissionId: stored._id,
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: "1/1 concavity classifications matched the server rubric.",
      });
      expect(Object.keys(stored).sort()).toEqual([
        "_id",
        "activityId",
        "attemptOrdinal",
        "createIdempotencyKey",
        "createdAt",
        "feedback",
        "gradedAt",
        "masteryContractVersion",
        "maxScore",
        "score",
        "stableActivityId",
        "submissionData",
        "submittedAt",
        "updatedAt",
        "userId",
      ]);
      expect(stored).toMatchObject({
        userId: LEARNER_ID,
        activityId: `activities:concavity-${mode}`,
        stableActivityId: harness.activityId,
        createIdempotencyKey: `concavity-${mode}-correct`,
        attemptOrdinal: 1,
        score: 1,
        maxScore: 1,
        feedback: "1/1 concavity classifications matched the server rubric.",
        masteryContractVersion: "learning-evidence.v1",
      });
      const storedData = stored.submissionData as Record<string, unknown>;
      expect(storedData).toEqual({
        contractVersion: "practice.v1",
        activityId: harness.activityId,
        mode,
        status: "graded",
        attemptNumber: 1,
        submittedAt: new Date(stored.submittedAt as number).toISOString(),
        answers: { classification: expected },
        parts: [
          {
            partId: "classification",
            rawAnswer: expected,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
      });
      expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
      expect(stored.submittedAt).toBe(stored.gradedAt);
      expect(stored.submittedAt).toBe(stored.createdAt);
      expect(stored.submittedAt).toBe(stored.updatedAt);
      expectNoAuthority(stored);
      expectNoAuthority(correct);
      expect(harness.rows.learning_evidence).toHaveLength(0);

      const wrongHarness = createHarness(mode);
      const wrong = ["concave_up", "concave_down", "neither"].find((value) => value !== expected)!;
      const wrongResult = await handler(wrongHarness.ctx, {
        userId: LEARNER_ID,
        activityId: wrongHarness.activityId,
        idempotencyKey: `concavity-${mode}-wrong`,
        submissionData: makeEnvelope(mode, wrong),
      });
      expect(wrongResult).toEqual({
        submissionId: wrongHarness.rows.activity_submissions[0]!._id,
        score: 0,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: "0/1 concavity classifications matched the server rubric.",
      });
      expect(wrongHarness.rows.activity_submissions).toHaveLength(1);
      expect(wrongHarness.rows.learning_evidence).toHaveLength(0);
    },
  );

  it.each([
    [
      "missing answer field",
      makeEnvelope("guided_practice", expectedClassification(1), { answers: {} }),
    ],
    [
      "extra answer field",
      makeEnvelope("guided_practice", expectedClassification(1), {
        answers: { classification: "concave_up", score: 1 },
      }),
    ],
    ["invalid classification", makeEnvelope("guided_practice", "Concave_up")],
    ["blank classification", makeEnvelope("guided_practice", " ")],
    [
      "mismatched raw part",
      makeEnvelope("guided_practice", "concave_up", {
        parts: [{ partId: "classification", rawAnswer: "neither" }],
      }),
    ],
    [
      "wrong part ID",
      makeEnvelope("guided_practice", "concave_up", {
        parts: [{ partId: "answer", rawAnswer: "concave_up" }],
      }),
    ],
    [
      "extra part field",
      makeEnvelope("guided_practice", "concave_up", {
        parts: [{ partId: "classification", rawAnswer: "concave_up", score: 1 }],
      }),
    ],
    ["extra outer field", makeEnvelope("guided_practice", "concave_up", { score: 1 })],
  ] as const)("rejects %s before persistence", async (_label, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: harness.activityId,
        idempotencyKey: `concavity-raw-${_label.replaceAll(" ", "-")}`,
        submissionData,
      }),
    ).rejects.toThrow(/invalid|classification|part|answer/i);
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
        harness.rows.activities[0]!.componentKey = "rate-pattern-classification";
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
        harness.rows.activities[0]!.props = { presentationMode: "independent_practice" };
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
          generatorKey: "topic13-other",
          variantSeed: 1,
        };
      },
    ],
    [
      "wrong seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = { ...harness.gradingConfig, variantSeed: 2 };
      },
    ],
    [
      "non-integer seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = { ...harness.gradingConfig, variantSeed: 1.5 };
      },
    ],
    [
      "extra grading key",
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
        idempotencyKey: `concavity-provisioning-${_label.replaceAll(" ", "-")}`,
        submissionData: makeEnvelope("guided_practice", expectedClassification(1)),
      }),
    ).rejects.toThrow(/invalid|provisioned|configuration|activity/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "unknown activity ID",
      "math.precalc.skill.1.3.unknown.guided_practice",
      makeEnvelope("guided_practice", expectedClassification(1)),
    ],
    [
      "mode mismatch",
      PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      makeEnvelope("independent_practice", expectedClassification(2)),
    ],
    [
      "blank idempotency key",
      PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      makeEnvelope("guided_practice", expectedClassification(1)),
    ],
    [
      "zero attempt",
      PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      makeEnvelope("guided_practice", expectedClassification(1), { attemptNumber: 0 }),
    ],
    [
      "fractional attempt",
      PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      makeEnvelope("guided_practice", expectedClassification(1), { attemptNumber: 1.5 }),
    ],
    [
      "invalid timestamp",
      PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      makeEnvelope("guided_practice", expectedClassification(1), { submittedAt: "not-a-date" }),
    ],
  ] as const)("rejects %s", async (_label, activityId, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const idempotencyKey =
      _label === "blank idempotency key" ? " " : `concavity-invalid-${_label.replaceAll(" ", "-")}`;
    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId,
        idempotencyKey,
        submissionData,
      }),
    ).rejects.toThrow(/invalid|activity|timestamp|attempt|key/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("replays exactly, increments the ordinal, and rejects changed or cross-mode keys", async () => {
    const handler = await loadHandler();
    const harness = createHarness("guided_practice", true);
    const expected = expectedClassification(1);
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      idempotencyKey: "concavity-replay",
      submissionData: makeEnvelope("guided_practice", expected),
    };
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const changed = expected === "concave_up" ? "concave_down" : "concave_up";
    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeEnvelope("guided_practice", changed),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "concavity-second",
    });
    expect(second).toMatchObject({ attemptOrdinal: 2, score: 1 });
    expect(harness.rows.activity_submissions).toHaveLength(2);

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
        idempotencyKey: input.idempotencyKey,
        submissionData: makeEnvelope("independent_practice", expectedClassification(2)),
      }),
    ).rejects.toThrow("idempotency_conflict");
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
      "stored contract version",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).contractVersion = "other";
      },
    ],
    [
      "stored envelope activity",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).activityId = "wrong";
      },
    ],
    [
      "stored envelope mode",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).mode = "independent_practice";
      },
    ],
    [
      "stored status",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).status = "submitted";
      },
    ],
    [
      "stored answer",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).answers as Record<string, unknown>
        ).classification = "neither";
      },
    ],
    [
      "stored part",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.rawAnswer = "neither";
      },
    ],
    [
      "stored part score",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.score = 0;
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
        row.feedback = "forged";
      },
    ],
    [
      "stored ordinal",
      (row: Row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "stored attempt",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).attemptNumber = 0;
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
    [
      "stored created time",
      (row: Row) => {
        row.createdAt = 0;
      },
    ],
    [
      "stored updated time",
      (row: Row) => {
        row.updatedAt = 0;
      },
    ],
  ] as const)("fails closed on %s replay corruption", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `concavity-corrupt-${_label.replaceAll(" ", "-")}`,
      submissionData: makeEnvelope("guided_practice", expectedClassification(1)),
    };
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
