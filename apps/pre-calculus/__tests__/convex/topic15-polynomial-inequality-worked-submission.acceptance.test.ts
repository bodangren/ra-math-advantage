import { afterEach, describe, expect, it, vi } from "vitest";

import { generateTopic15PolynomialInequalityOutput } from "@math-platform/math-content/knowledge-space";
import type { MutationCtx } from "@/convex/_generated/server";
import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import { PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const USER_ID = "profiles:topic15-polynomial-inequality-worked-learner";
const ACTIVITY_DOCUMENT_ID = "activities:topic15-polynomial-inequality-worked";
const CLIENT_SUBMITTED_AT = "2026-08-30T00:00:00.000Z";
const SERVER_NOW = Date.parse("2026-08-30T12:00:00.000Z");
const SERVER_SUBMITTED_AT = "2026-08-30T12:00:00.000Z";
const WORKED_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID;
const SOURCE_ANSWER = {
  roots: [-4, -1, 3],
  intervalSigns: ["-", "+", "-", "+"],
  solution: "(-4, -1) ∪ (3, ∞)",
} as const;

type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };
type Input = {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
};

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
    parts: [
      { partId: "roots", rawAnswer: answers.roots },
      { partId: "intervalSigns", rawAnswer: answers.intervalSigns },
      { partId: "solution", rawAnswer: answers.solution },
    ],
    ...overrides,
  };
}

function makeInput(overrides: Partial<Input> = {}): Input {
  return {
    userId: USER_ID,
    activityId: WORKED_ID,
    idempotencyKey: "topic15-polynomial-inequality-worked-source-review",
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function withEnvelope(input: Input, mutate: (data: Record<string, unknown>) => void): Input {
  const submissionData = { ...input.submissionData };
  mutate(submissionData);
  return { ...input, submissionData };
}

function withParts(input: Input, mutate: (parts: StoredPart[]) => void): Input {
  return withEnvelope(input, (data) => {
    const parts = [...(data.parts as StoredPart[])];
    mutate(parts);
    data.parts = parts;
  });
}

type StoredPart = Record<string, unknown>;

function makePriorRow(attemptOrdinal: number, createIdempotencyKey = "prior-key"): Row {
  return {
    _id: `activity_submissions:prior-${String(attemptOrdinal)}`,
    userId: USER_ID,
    activityId: ACTIVITY_DOCUMENT_ID,
    stableActivityId: WORKED_ID,
    createIdempotencyKey,
    submissionData: makeEnvelope(),
    attemptOrdinal,
    submittedAt: SERVER_NOW,
    createdAt: SERVER_NOW,
    updatedAt: SERVER_NOW,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: WORKED_ID,
        componentKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
        props: { presentationMode: "worked_example" },
        gradingConfig: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
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

type Harness = ReturnType<typeof createHarness>;

async function loadHandler() {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic15PolynomialInequalityWorkedSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error(
      "AP Precalculus must export the Topic 1.5 polynomial inequality Worked producer.",
    );
  }
  return mutation._handler as (
    ctx: MutationCtx,
    args: Input,
  ) => Promise<{
    submissionId: string;
    attemptOrdinal: number;
    submittedAt: string;
  }>;
}

function expectNoWrites(harness: Harness, submissionCount: number): void {
  expect(harness.rows.activity_submissions).toHaveLength(submissionCount);
  expect(harness.rows.learning_evidence).toHaveLength(0);
}

async function seedFirstWrite(
  handler: Awaited<ReturnType<typeof loadHandler>>,
  harness: Harness,
  input: Input = makeInput(),
) {
  return handler(harness.ctx, input);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Topic 1.5 polynomial-inequality Worked submission", () => {
  it("stores the exact seed-0 source review as an ungraded first write", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    expect(generateTopic15PolynomialInequalityOutput(0).expectedAnswer).toEqual(SOURCE_ANSWER);

    const result = await handler(harness.ctx, makeInput());
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as SubmissionData;
    expect(result).toEqual({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: SERVER_SUBMITTED_AT,
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
    expect(Object.keys(storedData.answers as Record<string, unknown>).sort()).toEqual([
      "intervalSigns",
      "roots",
      "solution",
    ]);
    expect((storedData.parts as StoredPart[]).map((part) => Object.keys(part).sort())).toEqual([
      ["partId", "rawAnswer"],
      ["partId", "rawAnswer"],
      ["partId", "rawAnswer"],
    ]);
    expect(stored.userId).toBe(USER_ID);
    expect(stored.activityId).toBe(ACTIVITY_DOCUMENT_ID);
    expect(stored.stableActivityId).toBe(WORKED_ID);
    expect(stored.createIdempotencyKey).toBe("topic15-polynomial-inequality-worked-source-review");
    expect(storedData).toEqual({
      contractVersion: "practice.v1",
      activityId: WORKED_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: SERVER_SUBMITTED_AT,
      answers: SOURCE_ANSWER,
      parts: [
        { partId: "roots", rawAnswer: SOURCE_ANSWER.roots },
        { partId: "intervalSigns", rawAnswer: SOURCE_ANSWER.intervalSigns },
        { partId: "solution", rawAnswer: SOURCE_ANSWER.solution },
      ],
    });
    expect(stored.submittedAt).toBe(SERVER_NOW);
    expect(stored.createdAt).toBe(SERVER_NOW);
    expect(stored.updatedAt).toBe(SERVER_NOW);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expectNoWrites(harness, 1);
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
    harness.rows.activity_submissions.push(makePriorRow(4));
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);

    const result = await handler(harness.ctx, makeInput({ idempotencyKey: "new-key" }));
    expect(result).toEqual({
      submissionId: "activity_submissions:2",
      attemptOrdinal: 5,
      submittedAt: SERVER_SUBMITTED_AT,
    });
    expectNoWrites(harness, 2);
  });

  it("replays the exact stored source row without a second latest lookup", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);

    const first = await seedFirstWrite(handler, harness);
    expect(first).toEqual({
      submissionId: "activity_submissions:1",
      attemptOrdinal: 1,
      submittedAt: SERVER_SUBMITTED_AT,
    });

    const replay = await handler(
      harness.ctx,
      makeInput({
        submissionData: makeEnvelope(SOURCE_ANSWER, {
          attemptNumber: 42,
          submittedAt: "2026-08-31T00:00:00.000Z",
        }),
      }),
    );
    expect(replay).toEqual(first);
    expectNoWrites(harness, 1);
    expect(
      harness.indexCalls.filter(
        ({ indexName }) => indexName === "by_user_and_activity_and_attempt_ordinal",
      ),
    ).toHaveLength(1);
  });

  it.each([
    ["wrong roots", { ...SOURCE_ANSWER, roots: [-4, -1, 4] }],
    ["wrong interval signs", { ...SOURCE_ANSWER, intervalSigns: ["-", "-", "-", "+"] }],
    ["wrong solution", { ...SOURCE_ANSWER, solution: "(-4, -1) U (3, infinity)" }],
  ] as const)(
    "rejects a changed same-key %s request with idempotency_conflict",
    async (_label, answers) => {
      const handler = await loadHandler();
      const harness = createHarness();
      vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
      await seedFirstWrite(handler, harness);
      const before = JSON.stringify(harness.rows.activity_submissions);

      await expect(
        handler(
          harness.ctx,
          makeInput({
            submissionData: makeEnvelope(answers),
          }),
        ),
      ).rejects.toThrow("idempotency_conflict");
      expect(JSON.stringify(harness.rows.activity_submissions)).toBe(before);
      expectNoWrites(harness, 1);
    },
  );

  it("allows another user to use the same create key for a separate first write", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    await seedFirstWrite(handler, harness);

    const result = await handler(
      harness.ctx,
      makeInput({
        userId: USER_ID + "-other",
      }),
    );
    expect(result).toEqual({
      submissionId: "activity_submissions:2",
      attemptOrdinal: 1,
      submittedAt: SERVER_SUBMITTED_AT,
    });
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(harness.rows.activity_submissions[1]?.userId).toBe(USER_ID + "-other");
    expect(harness.rows.activity_submissions[1]?.createIdempotencyKey).toBe(
      makeInput().idempotencyKey,
    );
    expectNoWrites(harness, 2);
  });

  const corruptStoredRowCases = [
    [
      "physical activityId",
      (row: Row) => {
        row.activityId = "activities:other";
      },
    ],
    [
      "stable activityId",
      (row: Row) => {
        row.stableActivityId = "other-worked-activity";
      },
    ],
    [
      "extra envelope field",
      (row: Row) => {
        (row.submissionData as SubmissionData).extra = true;
      },
    ],
    [
      "missing envelope field",
      (row: Row) => {
        delete (row.submissionData as SubmissionData).status;
      },
    ],
    [
      "wrong envelope contract",
      (row: Row) => {
        (row.submissionData as SubmissionData).contractVersion = "practice.v0";
      },
    ],
    [
      "wrong envelope activity",
      (row: Row) => {
        (row.submissionData as SubmissionData).activityId = "other-worked-activity";
      },
    ],
    [
      "wrong envelope mode",
      (row: Row) => {
        (row.submissionData as SubmissionData).mode = "guided_practice";
      },
    ],
    [
      "wrong envelope status",
      (row: Row) => {
        (row.submissionData as SubmissionData).status = "graded";
      },
    ],
    [
      "unsafe stored ordinal",
      (row: Row) => {
        row.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "zero stored ordinal",
      (row: Row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "fractional stored ordinal",
      (row: Row) => {
        row.attemptOrdinal = 1.5;
      },
    ],
    [
      "mismatched envelope attempt",
      (row: Row) => {
        (row.submissionData as SubmissionData).attemptNumber = 2;
      },
    ],
    [
      "unsafe envelope attempt",
      (row: Row) => {
        (row.submissionData as SubmissionData).attemptNumber = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "invalid inner time",
      (row: Row) => {
        (row.submissionData as SubmissionData).submittedAt = "not-a-time";
      },
    ],
    [
      "noncanonical inner time",
      (row: Row) => {
        (row.submissionData as SubmissionData).submittedAt = "2026-08-30T12:00:00Z";
      },
    ],
    [
      "mismatched inner time",
      (row: Row) => {
        (row.submissionData as SubmissionData).submittedAt = "2026-08-30T12:00:01.000Z";
      },
    ],
    [
      "invalid outer time",
      (row: Row) => {
        row.submittedAt = Number.NaN;
      },
    ],
    [
      "mismatched outer time",
      (row: Row) => {
        row.submittedAt = SERVER_NOW + 1_000;
      },
    ],
    [
      "extra source answer",
      (row: Row) => {
        const data = row.submissionData as SubmissionData;
        data.answers = { ...SOURCE_ANSWER, extra: true };
      },
    ],
    [
      "missing source answer",
      (row: Row) => {
        const data = row.submissionData as SubmissionData;
        data.answers = { roots: SOURCE_ANSWER.roots, intervalSigns: SOURCE_ANSWER.intervalSigns };
      },
    ],
    [
      "wrong source answer",
      (row: Row) => {
        const data = row.submissionData as SubmissionData;
        data.answers = { ...SOURCE_ANSWER, roots: [-4, -1, 4] };
        (data.parts as StoredPart[])[0]!.rawAnswer = [-4, -1, 4];
      },
    ],
    [
      "reordered raw parts",
      (row: Row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as StoredPart[];
        data.parts = [parts[2], parts[1], parts[0]];
      },
    ],
    [
      "extra raw part",
      (row: Row) => {
        const data = row.submissionData as SubmissionData;
        data.parts = [
          ...(data.parts as StoredPart[]),
          {
            partId: "solution",
            rawAnswer: SOURCE_ANSWER.solution,
          },
        ];
      },
    ],
    [
      "mismatched raw part",
      (row: Row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as StoredPart[];
        parts[0]!.rawAnswer = [-4, -1, 4];
      },
    ],
    [
      "missing raw parts",
      (row: Row) => {
        delete (row.submissionData as SubmissionData).parts;
      },
    ],
    [
      "added score",
      (row: Row) => {
        row.score = 3;
      },
    ],
    [
      "added mastery contract",
      (row: Row) => {
        row.masteryContractVersion = "learning-evidence.v1";
      },
    ],
    [
      "added answerKey",
      (row: Row) => {
        const data = row.submissionData as SubmissionData;
        data.answers = { ...SOURCE_ANSWER, answerKey: SOURCE_ANSWER.solution };
      },
    ],
    [
      "invalid createdAt",
      (row: Row) => {
        row.createdAt = Number.NaN;
      },
    ],
    [
      "mismatched createdAt",
      (row: Row) => {
        row.createdAt = SERVER_NOW + 1_000;
      },
    ],
    [
      "invalid updatedAt",
      (row: Row) => {
        row.updatedAt = Number.NaN;
      },
    ],
    [
      "mismatched updatedAt",
      (row: Row) => {
        row.updatedAt = SERVER_NOW + 1_000;
      },
    ],
  ] as const;

  it.each(corruptStoredRowCases)(
    "rejects a replay with %s stored corruption",
    async (_label, corrupt) => {
      const handler = await loadHandler();
      const harness = createHarness();
      vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
      await seedFirstWrite(handler, harness);
      corrupt(harness.rows.activity_submissions[0]!);

      await expect(handler(harness.ctx, makeInput())).rejects.toThrow("idempotency_conflict");
      expectNoWrites(harness, 1);
    },
  );

  const rejectionCases = [
    [
      "wrong outer activity",
      (_harness: Harness) => makeInput({ activityId: "other-worked-activity" }),
    ],
    [
      "wrong envelope activity",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.activityId = "other-worked-activity";
        }),
    ],
    [
      "wrong mode",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.mode = "guided_practice";
        }),
    ],
    [
      "wrong status",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.status = "graded";
        }),
    ],
    ["blank key", (_harness: Harness) => makeInput({ idempotencyKey: "   " })],
    [
      "invalid client attempt",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.attemptNumber = 0;
        }),
    ],
    [
      "fractional client attempt",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.attemptNumber = 1.5;
        }),
    ],
    [
      "unsafe client attempt",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.attemptNumber = Number.MAX_SAFE_INTEGER + 1;
        }),
    ],
    [
      "invalid client time",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.submittedAt = "not-a-time";
        }),
    ],
    [
      "extra envelope field",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.extra = true;
        }),
    ],
    [
      "missing envelope field",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          delete data.status;
        }),
    ],
    [
      "extra answer field",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.answers = { ...SOURCE_ANSWER, extra: true };
        }),
    ],
    [
      "missing answer field",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          data.answers = { roots: SOURCE_ANSWER.roots, intervalSigns: SOURCE_ANSWER.intervalSigns };
        }),
    ],
    [
      "wrong root value",
      (_harness: Harness) =>
        makeInput({
          submissionData: makeEnvelope({ ...SOURCE_ANSWER, roots: [-4, -1, 4] }),
        }),
    ],
    [
      "wrong root count",
      (_harness: Harness) =>
        makeInput({
          submissionData: makeEnvelope({ ...SOURCE_ANSWER, roots: [-4, -1] }),
        }),
    ],
    [
      "wrong root order",
      (_harness: Harness) =>
        makeInput({
          submissionData: makeEnvelope({ ...SOURCE_ANSWER, roots: [3, -1, -4] }),
        }),
    ],
    [
      "fractional root",
      (_harness: Harness) =>
        makeInput({
          submissionData: makeEnvelope({ ...SOURCE_ANSWER, roots: [-4, -1, 3.5] }),
        }),
    ],
    [
      "wrong sign value",
      (_harness: Harness) =>
        makeInput({
          submissionData: makeEnvelope({ ...SOURCE_ANSWER, intervalSigns: ["-", "-", "-", "+"] }),
        }),
    ],
    [
      "wrong sign count",
      (_harness: Harness) =>
        makeInput({
          submissionData: makeEnvelope({ ...SOURCE_ANSWER, intervalSigns: ["-", "+", "-"] }),
        }),
    ],
    [
      "non-exact solution",
      (_harness: Harness) =>
        makeInput({
          submissionData: makeEnvelope({ ...SOURCE_ANSWER, solution: "(-4, -1) U (3, infinity)" }),
        }),
    ],
    [
      "missing raw parts",
      (_harness: Harness) =>
        withEnvelope(makeInput(), (data) => {
          delete data.parts;
        }),
    ],
    [
      "reordered raw parts",
      (_harness: Harness) =>
        withParts(makeInput(), (parts) => {
          [parts[0], parts[1], parts[2]] = [parts[2]!, parts[1]!, parts[0]!];
        }),
    ],
    [
      "mismatched raw part",
      (_harness: Harness) =>
        withParts(makeInput(), (parts) => {
          parts[0]!.rawAnswer = [-4, -1, 4];
        }),
    ],
    [
      "extra raw part field",
      (_harness: Harness) =>
        withParts(makeInput(), (parts) => {
          parts[0]!.extra = true;
        }),
    ],
    [
      "extra raw part item",
      (_harness: Harness) =>
        withParts(makeInput(), (parts) => {
          parts.push({ partId: "solution", rawAnswer: SOURCE_ANSWER.solution });
        }),
    ],
    [
      "missing activity",
      (harness: Harness) => {
        harness.rows.activities = [];
        return makeInput();
      },
    ],
    [
      "wrong stable activity ID",
      (harness: Harness) => {
        harness.rows.activities[0]!.stableActivityId = "other-worked-activity";
        return makeInput();
      },
    ],
    [
      "wrong component",
      (harness: Harness) => {
        harness.rows.activities[0]!.componentKey = "other-component";
        return makeInput();
      },
    ],
    [
      "non-record props",
      (harness: Harness) => {
        harness.rows.activities[0]!.props = null;
        return makeInput();
      },
    ],
    [
      "wrong presentation mode",
      (harness: Harness) => {
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
        return makeInput();
      },
    ],
    [
      "non-record grading config",
      (harness: Harness) => {
        harness.rows.activities[0]!.gradingConfig = null;
        return makeInput();
      },
    ],
    [
      "extra grading config key",
      (harness: Harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
          extra: true,
        };
        return makeInput();
      },
    ],
    [
      "wrong generator",
      (harness: Harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: "other-generator",
          variantSeed: 0,
        };
        return makeInput();
      },
    ],
    [
      "wrong seed",
      (harness: Harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
          variantSeed: 1,
        };
        return makeInput();
      },
    ],
    [
      "fractional seed",
      (harness: Harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
          variantSeed: 0.5,
        };
        return makeInput();
      },
    ],
    [
      "duplicate activity",
      (harness: Harness) => {
        harness.rows.activities.push({
          ...harness.rows.activities[0]!,
          _id: "activities:duplicate",
        });
        return makeInput();
      },
    ],
    [
      "corrupt prior ordinal zero",
      (harness: Harness) => {
        harness.rows.activity_submissions.push(makePriorRow(0));
        return makeInput({ idempotencyKey: "new-key" });
      },
    ],
    [
      "corrupt prior ordinal fractional",
      (harness: Harness) => {
        harness.rows.activity_submissions.push(makePriorRow(1.5));
        return makeInput({ idempotencyKey: "new-key" });
      },
    ],
    [
      "corrupt prior ordinal unsafe maximum",
      (harness: Harness) => {
        harness.rows.activity_submissions.push(makePriorRow(Number.MAX_SAFE_INTEGER));
        return makeInput({ idempotencyKey: "new-key" });
      },
    ],
  ] as const;

  it.each(rejectionCases)(
    "rejects %s without inserting or writing evidence",
    async (_label, buildInput) => {
      const handler = await loadHandler();
      const harness = createHarness();
      const input = buildInput(harness);
      const submissionCount = harness.rows.activity_submissions.length;

      await expect(handler(harness.ctx, input)).rejects.toThrow();
      expectNoWrites(harness, submissionCount);
    },
  );
});
