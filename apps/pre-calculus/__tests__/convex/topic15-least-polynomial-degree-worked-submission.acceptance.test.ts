import { afterEach, describe, expect, it, vi } from "vitest";

import { generateTopic15LeastPolynomialDegreeOutput } from "@math-platform/math-content/knowledge-space";
import type { MutationCtx } from "@/convex/_generated/server";
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import { PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const USER_ID = "profiles:topic15-least-degree-worked-learner";
const ACTIVITY_DOCUMENT_ID = "activities:topic15-least-degree-worked";
const CLIENT_SUBMITTED_AT = "2026-08-30T00:00:00.000Z";
const SERVER_NOW = Date.parse("2026-08-30T12:00:00.000Z");
const SOURCE_ANSWER = { leastDegree: 5 };
const WORKED_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID;
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };

function makeEnvelope(
  answers: Record<string, unknown> = SOURCE_ANSWER,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId: WORKED_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: [{ partId: "leastDegree", rawAnswer: answers.leastDegree }],
    ...overrides,
  };
}

function makeInput(
  overrides: Partial<{
    activityId: string;
    idempotencyKey: string;
    submissionData: SubmissionData;
  }> = {},
) {
  return {
    userId: USER_ID,
    activityId: WORKED_ID,
    idempotencyKey: "topic15-least-degree-worked-source-review",
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: WORKED_ID,
        componentKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
        props: { presentationMode: "worked_example" },
        gradingConfig: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
      },
    ],
    activity_submissions: [],
    learning_evidence: [],
  };
  const indexCalls: Array<{
    tableName: string;
    indexName: string;
    conditions: ReadonlyMap<string, unknown>;
  }> = [];

  const select = (tableName: string, conditions: ReadonlyMap<string, unknown>) =>
    (rows[tableName] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );

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
          unique: async () => {
            const matches = select(tableName, conditions);
            if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
            return matches[0] ?? null;
          },
          first: async () => {
            const matches = select(tableName, conditions);
            if (orderDirection === "desc") matches.reverse();
            return matches[0] ?? null;
          },
          order: (direction: "asc" | "desc") => {
            orderDirection = direction;
            return result;
          },
        };
        return {
          withIndex: (indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            indexCalls.push({ tableName, indexName, conditions: new Map(conditions) });
            return result;
          },
          ...result,
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const tableRows = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${tableRows.length + 1}`;
        tableRows.push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;

  return { ctx, indexCalls, rows };
}

async function loadHandler() {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic15LeastPolynomialDegreeWorkedSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error(
      "AP Precalculus must export the Topic 1.5 least polynomial degree Worked producer.",
    );
  }
  return mutation._handler as (
    ctx: MutationCtx,
    args: ReturnType<typeof makeInput>,
  ) => Promise<{
    submissionId: string;
    attemptOrdinal: number;
    submittedAt: string;
  }>;
}

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectKeys(nestedValue, keys);
    });
  }
  return keys;
}

const FORBIDDEN_KEYS = new Set([
  "masteryContractVersion",
  "score",
  "maxScore",
  "feedback",
  "gradedAt",
  "correctness",
  "isCorrect",
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "normalizedAnswer",
  "solution",
  "solutions",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
]);

function expectNoAuthority(value: unknown): void {
  expect(collectKeys(value).filter((key) => FORBIDDEN_KEYS.has(key))).toEqual([]);
}

function expectNoSubmissionOrEvidence(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.activity_submissions).toHaveLength(0);
  expect(harness.rows.learning_evidence).toHaveLength(0);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Topic 1.5 least polynomial degree Worked submission", () => {
  it("stores the exact seed-0 source review as an ungraded first write", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    expect(generateTopic15LeastPolynomialDegreeOutput(0).expectedAnswer).toEqual({
      leastDegree: 5,
    });

    const result = await handler(harness.ctx, makeInput());
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as SubmissionData;
    expect(result).toEqual({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: "2026-08-30T12:00:00.000Z",
    });
    expect(Object.keys(stored).sort()).toEqual([
      "_id",
      "activityId",
      "attemptOrdinal",
      "createIdempotencyKey",
      "createdAt",
      "stableActivityId",
      "submissionData",
      "submittedAt",
      "updatedAt",
      "userId",
    ]);
    expect(stored.userId).toBe(USER_ID);
    expect(stored.activityId).toBe(ACTIVITY_DOCUMENT_ID);
    expect(stored.stableActivityId).toBe(WORKED_ID);
    expect(stored.createIdempotencyKey).toBe("topic15-least-degree-worked-source-review");
    expect(storedData).toEqual({
      contractVersion: "practice.v1",
      activityId: WORKED_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-08-30T12:00:00.000Z",
      answers: SOURCE_ANSWER,
      parts: [{ partId: "leastDegree", rawAnswer: 5 }],
    });
    expect(stored.submittedAt).toBe(SERVER_NOW);
    expect(stored.createdAt).toBe(SERVER_NOW);
    expect(stored.updatedAt).toBe(SERVER_NOW);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expect(harness.rows.learning_evidence).toHaveLength(0);
    expectNoAuthority(stored);
    expectNoAuthority(result);
    expect(
      harness.indexCalls.map(({ tableName, indexName }) => `${tableName}:${indexName}`),
    ).toEqual([
      "activities:by_stable_activity_id",
      "activity_submissions:by_user_and_create_idempotency_key",
      "activity_submissions:by_user_and_activity_and_attempt_ordinal",
    ]);
  });

  it("uses the latest ordinal for a different create key", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    harness.rows.activity_submissions.push({
      _id: "activity_submissions:prior",
      userId: USER_ID,
      activityId: ACTIVITY_DOCUMENT_ID,
      createIdempotencyKey: "prior-key",
      attemptOrdinal: 4,
      submittedAt: SERVER_NOW - 1_000,
      createdAt: SERVER_NOW - 1_000,
      updatedAt: SERVER_NOW - 1_000,
    });
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);

    const result = await handler(harness.ctx, makeInput({ idempotencyKey: "new-key" }));
    expect(result.attemptOrdinal).toBe(5);
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([0, 4.5, Number.NaN, Number.MAX_SAFE_INTEGER])(
    "rejects unsafe stored latest ordinal %s without inserting",
    async (latestOrdinal) => {
      const handler = await loadHandler();
      const harness = createHarness();
      harness.rows.activity_submissions.push({
        _id: "activity_submissions:prior",
        userId: USER_ID,
        activityId: ACTIVITY_DOCUMENT_ID,
        createIdempotencyKey: "prior-key",
        attemptOrdinal: latestOrdinal,
        submittedAt: SERVER_NOW - 1_000,
        createdAt: SERVER_NOW - 1_000,
        updatedAt: SERVER_NOW - 1_000,
      });

      await expect(
        handler(harness.ctx, makeInput({ idempotencyKey: "new-key" })),
      ).rejects.toThrow();
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.rows.learning_evidence).toHaveLength(0);
    },
  );

  it("replays the exact source row and rejects a changed answer", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    const first = await handler(harness.ctx, makeInput());

    const exactReplay = await handler(harness.ctx, makeInput());
    expect(exactReplay).toEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const advisoryReplay = await handler(
      harness.ctx,
      makeInput({
        submissionData: makeEnvelope(SOURCE_ANSWER, {
          attemptNumber: 42,
          submittedAt: "2026-08-31T00:00:00.000Z",
        }),
      }),
    );
    expect(advisoryReplay).toEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(
        harness.ctx,
        makeInput({
          submissionData: makeEnvelope({ leastDegree: 4 }),
        }),
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    [
      "physical activityId wrong",
      (row: Row) => {
        row.activityId = "activities:other";
      },
    ],
    [
      "stableActivityId wrong",
      (row: Row) => {
        row.stableActivityId = "other-worked-activity";
      },
    ],
    [
      "submissionData null",
      (row: Row) => {
        row.submissionData = null;
      },
    ],
    [
      "extra envelope key",
      (row: Row) => {
        row.submissionData = { ...(row.submissionData as SubmissionData), extra: true };
      },
    ],
    [
      "wrong contractVersion",
      (row: Row) => {
        (row.submissionData as SubmissionData).contractVersion = "other.v1";
      },
    ],
    [
      "wrong envelope activityId",
      (row: Row) => {
        (row.submissionData as SubmissionData).activityId = "other-worked-activity";
      },
    ],
    [
      "wrong mode",
      (row: Row) => {
        (row.submissionData as SubmissionData).mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      (row: Row) => {
        (row.submissionData as SubmissionData).status = "graded";
      },
    ],
    [
      "envelope attempt 0",
      (row: Row) => {
        (row.submissionData as SubmissionData).attemptNumber = 0;
      },
    ],
    [
      "envelope attempt mismatches row",
      (row: Row) => {
        (row.submissionData as SubmissionData).attemptNumber = 2;
      },
    ],
    [
      "row attempt 0",
      (row: Row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "row attempt 1.5",
      (row: Row) => {
        row.attemptOrdinal = 1.5;
      },
    ],
    [
      "row attempt overflow",
      (row: Row) => {
        row.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "noncanonical envelope time",
      (row: Row) => {
        (row.submissionData as SubmissionData).submittedAt = "2026-08-30T12:00:00Z";
      },
    ],
    [
      "envelope time mismatches row",
      (row: Row) => {
        (row.submissionData as SubmissionData).submittedAt = new Date(
          SERVER_NOW + 1_000,
        ).toISOString();
      },
    ],
    [
      "row submittedAt NaN",
      (row: Row) => {
        row.submittedAt = Number.NaN;
      },
    ],
    [
      "createdAt mismatches submittedAt",
      (row: Row) => {
        row.createdAt = SERVER_NOW - 1_000;
      },
    ],
    [
      "updatedAt mismatches submittedAt",
      (row: Row) => {
        row.updatedAt = SERVER_NOW - 1_000;
      },
    ],
    [
      "answers missing leastDegree",
      (row: Row) => {
        (row.submissionData as SubmissionData).answers = {};
      },
    ],
    [
      "stored answer 4",
      (row: Row) => {
        ((row.submissionData as SubmissionData).answers as Record<string, unknown>).leastDegree = 4;
      },
    ],
    [
      "parts empty",
      (row: Row) => {
        (row.submissionData as SubmissionData).parts = [];
      },
    ],
    [
      "part has an extra key",
      (row: Row) => {
        (row.submissionData as SubmissionData).parts = [
          { partId: "leastDegree", rawAnswer: 5, extra: true },
        ];
      },
    ],
    [
      "raw part answer 4",
      (row: Row) => {
        (row.submissionData as SubmissionData).parts = [{ partId: "leastDegree", rawAnswer: 4 }];
      },
    ],
    [
      "forbidden top-level score",
      (row: Row) => {
        row.score = 1;
      },
    ],
    [
      "forbidden top-level solutions",
      (row: Row) => {
        row.solutions = [];
      },
    ],
  ] as const)("rejects %s stored corruption without replay effects", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    await handler(harness.ctx, makeInput());
    corrupt(harness.rows.activity_submissions[0]!);

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    [
      "incorrect source answer",
      (input: ReturnType<typeof makeInput>) => ({
        ...input,
        submissionData: makeEnvelope({ leastDegree: 4 }),
      }),
    ],
    [
      "mismatched raw part",
      (input: ReturnType<typeof makeInput>) => ({
        ...input,
        submissionData: makeEnvelope(SOURCE_ANSWER, {
          parts: [{ partId: "leastDegree", rawAnswer: 4 }],
        }),
      }),
    ],
    [
      "wrong activity identity",
      (input: ReturnType<typeof makeInput>) => ({ ...input, activityId: "other-worked-activity" }),
    ],
    [
      "wrong mode",
      (input: ReturnType<typeof makeInput>) => ({
        ...input,
        submissionData: makeEnvelope(SOURCE_ANSWER, { mode: "guided_practice" }),
      }),
    ],
    [
      "wrong status",
      (input: ReturnType<typeof makeInput>) => ({
        ...input,
        submissionData: makeEnvelope(SOURCE_ANSWER, { status: "graded" }),
      }),
    ],
    [
      "unsafe client attempt",
      (input: ReturnType<typeof makeInput>) => ({
        ...input,
        submissionData: makeEnvelope(SOURCE_ANSWER, { attemptNumber: Number.MAX_SAFE_INTEGER + 1 }),
      }),
    ],
    [
      "nonpositive client attempt",
      (input: ReturnType<typeof makeInput>) => ({
        ...input,
        submissionData: makeEnvelope(SOURCE_ANSWER, { attemptNumber: 0 }),
      }),
    ],
    [
      "invalid client time",
      (input: ReturnType<typeof makeInput>) => ({
        ...input,
        submissionData: makeEnvelope(SOURCE_ANSWER, { submittedAt: "not-a-time" }),
      }),
    ],
    ["blank key", (input: ReturnType<typeof makeInput>) => ({ ...input, idempotencyKey: "   " })],
  ] as const)("rejects %s without writes", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, mutate(makeInput()))).rejects.toThrow();
    expectNoSubmissionOrEvidence(harness);
  });

  it.each([
    [
      "missing activity",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities = [];
      },
    ],
    [
      "wrong stable activity",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.stableActivityId = "other-worked-activity";
      },
    ],
    [
      "wrong component",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.componentKey = "other-component";
      },
    ],
    [
      "wrong presentation mode",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
      },
    ],
    [
      "extra grading config",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
          extra: true,
        };
      },
    ],
    [
      "wrong generator",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: "other-generator",
          variantSeed: 0,
        };
      },
    ],
    [
      "wrong seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
          variantSeed: 1,
        };
      },
    ],
  ] as const)("rejects %s provisioning without writes", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(handler(harness.ctx, makeInput())).rejects.toThrow();
    expectNoSubmissionOrEvidence(harness);
  });
});
