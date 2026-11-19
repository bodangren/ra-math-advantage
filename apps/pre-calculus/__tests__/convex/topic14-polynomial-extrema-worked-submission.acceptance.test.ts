import { describe, expect, it, vi } from "vitest";

import type { MutationCtx } from "@/convex/_generated/server";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import { generateTopic14PolynomialExtremaFromGraphOutput } from "@math-platform/math-content/knowledge-space";
import { PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-polynomial-extrema-worked-learner";
const ACTIVITY_DOCUMENT_ID = "activities:polynomial-extrema-worked";
const CLIENT_SUBMITTED_AT = "2026-08-19T10:00:00.000Z";
const ANSWER_IDS = ["relative_minimum_x", "relative_maximum_x", "absolute_minimum_x"] as const;
type AnswerId = (typeof ANSWER_IDS)[number];
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };

function sourceAnswers(): Record<AnswerId, string> {
  const expected = generateTopic14PolynomialExtremaFromGraphOutput(0).expectedAnswer as Record<
    AnswerId,
    number
  >;
  return {
    relative_minimum_x: String(expected.relative_minimum_x),
    relative_maximum_x: String(expected.relative_maximum_x),
    absolute_minimum_x: String(expected.absolute_minimum_x),
  };
}

function makeEnvelope(
  answers: Record<string, unknown> = sourceAnswers(),
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
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
    userId: LEARNER_ID,
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
    idempotencyKey: "polynomial-extrema-worked-source-review",
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
        componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
        props: { presentationMode: "worked_example" },
        gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    activity_submissions: [],
    learning_evidence: [],
  };

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
          withIndex: (_indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
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

  return { ctx, rows };
}

async function loadHandler() {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic14PolynomialExtremaWorkedSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("AP Precalculus must export the Topic 1.4 extrema Worked producer.");
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
  "expectedAnswer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "solution",
  "solutionSteps",
  "gradingMetadata",
  "finalAnswer",
]);

function expectNoAuthority(value: unknown): void {
  expect(collectKeys(value).filter((key) => FORBIDDEN_KEYS.has(key))).toEqual([]);
}

describe("Topic 1.4 polynomial extrema Worked submission", () => {
  it("stores the exact seed-0 source review as an ungraded row", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    expect(sourceAnswers()).toEqual({
      relative_minimum_x: "1",
      relative_maximum_x: "4",
      absolute_minimum_x: "1",
    });

    const result = await handler(harness.ctx, makeInput());
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;
    const expectedSourceAnswers = sourceAnswers();
    expect(result).toEqual({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(Object.keys(result).sort()).toEqual(["attemptOrdinal", "submissionId", "submittedAt"]);
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
    expect(storedData).toEqual({
      contractVersion: "practice.v1",
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: expectedSourceAnswers,
      parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: expectedSourceAnswers[partId] })),
    });
    expect(storedData.answers).toStrictEqual(expectedSourceAnswers);
    expect(storedData.parts).toStrictEqual(
      ANSWER_IDS.map((partId) => ({ partId, rawAnswer: expectedSourceAnswers[partId] })),
    );
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expect(stored.attemptNumber).toBeUndefined();
    expect(stored.submittedAt).toBe(stored.createdAt);
    expect(stored.submittedAt).toBe(stored.updatedAt);
    expect(harness.rows.learning_evidence).toHaveLength(0);
    expectNoAuthority(stored);
  });

  it.each([
    ["extra outer field", (envelope: SubmissionData) => ({ ...envelope, score: 1 })],
    [
      "extra answer field",
      (envelope: SubmissionData) => ({
        ...envelope,
        answers: { ...(envelope.answers as Record<string, unknown>), expectedAnswer: "1" },
      }),
    ],
    [
      "extra part field",
      (envelope: SubmissionData) => ({
        ...envelope,
        parts: [
          { ...(envelope.parts as Array<Record<string, unknown>>)[0], isCorrect: true },
          ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
        ],
      }),
    ],
    [
      "missing part",
      (envelope: SubmissionData) => ({
        ...envelope,
        parts: (envelope.parts as Array<Record<string, unknown>>).slice(0, 2),
      }),
    ],
    [
      "duplicate part",
      (envelope: SubmissionData) => ({
        ...envelope,
        parts: [
          ...(envelope.parts as Array<Record<string, unknown>>).slice(0, 1),
          (envelope.parts as Array<Record<string, unknown>>)[0],
          (envelope.parts as Array<Record<string, unknown>>)[2],
        ],
      }),
    ],
    [
      "reordered parts",
      (envelope: SubmissionData) => ({
        ...envelope,
        parts: [...(envelope.parts as Array<Record<string, unknown>>)].reverse(),
      }),
    ],
    [
      "mismatched raw part",
      (envelope: SubmissionData) => ({
        ...envelope,
        parts: [
          ...(envelope.parts as Array<Record<string, unknown>>).slice(0, 1),
          { partId: "relative_maximum_x", rawAnswer: "wrong" },
          ...(envelope.parts as Array<Record<string, unknown>>).slice(2),
        ],
      }),
    ],
    [
      "wrong activity",
      (envelope: SubmissionData) => ({
        ...envelope,
        activityId: "math.precalc.other.worked_example",
      }),
    ],
    ["wrong mode", (envelope: SubmissionData) => ({ ...envelope, mode: "guided_practice" })],
    ["wrong status", (envelope: SubmissionData) => ({ ...envelope, status: "graded" })],
    [
      "invalid source answer",
      (envelope: SubmissionData) => ({
        ...envelope,
        answers: { ...sourceAnswers(), relative_minimum_x: "2" },
        parts: [
          { partId: "relative_minimum_x", rawAnswer: "2" },
          ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
        ],
      }),
    ],
    ["zero attempt", (envelope: SubmissionData) => ({ ...envelope, attemptNumber: 0 })],
    ["fractional attempt", (envelope: SubmissionData) => ({ ...envelope, attemptNumber: 1.5 })],
    [
      "invalid submitted time",
      (envelope: SubmissionData) => ({ ...envelope, submittedAt: "not-a-time" }),
    ],
  ] as const)("rejects %s before persistence", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(
      handler(harness.ctx, makeInput({ submissionData: mutate(makeEnvelope()) })),
    ).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it("rejects a blank idempotency key before persistence", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, makeInput({ idempotencyKey: "   " }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "wrong stable activity",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.stableActivityId = "math.precalc.other.worked_example";
      },
    ],
    [
      "wrong component",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.componentKey = "concavity-from-rate-change";
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
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
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
          generatorKey: "topic14-other",
          variantSeed: 0,
        };
      },
    ],
    [
      "wrong seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
          variantSeed: 1,
        };
      },
    ],
    [
      "non-integer seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
          variantSeed: 0.5,
        };
      },
    ],
    [
      "extra grading config",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
          extra: true,
        };
      },
    ],
  ] as const)("rejects %s provisioning before persistence", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(
      handler(
        harness.ctx,
        makeInput({
          idempotencyKey: `polynomial-extrema-provisioning-${_label.replaceAll(" ", "-")}`,
        }),
      ),
    ).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("replays exact semantics and increments ordinal for a new key", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput();
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, {
      ...input,
      submissionData: makeEnvelope(sourceAnswers(), {
        attemptNumber: 42,
        submittedAt: "2026-08-20T11:00:00.000Z",
      }),
    });
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeEnvelope({ ...sourceAnswers(), relative_minimum_x: "2" }),
      }),
    ).rejects.toThrow("idempotency_conflict");

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "polynomial-extrema-worked-source-review-second",
      submissionData: makeEnvelope({ ...sourceAnswers() }, { attemptNumber: 1 }),
    });
    expect(second.attemptOrdinal).toBe(2);
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(first.attemptOrdinal).toBe(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    [
      "stored activity document identity",
      (row: Row) => {
        row.activityId = "activities:other";
      },
    ],
    [
      "stored stable activity identity",
      (row: Row) => {
        row.stableActivityId = "math.precalc.other";
      },
    ],
    [
      "extra envelope field",
      (row: Row) => {
        (row.submissionData as SubmissionData).extra = true;
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
        (row.submissionData as SubmissionData).activityId = "math.precalc.other";
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
      "zero envelope attempt",
      (row: Row) => {
        (row.submissionData as SubmissionData).attemptNumber = 0;
      },
    ],
    [
      "mismatched envelope attempt",
      (row: Row) => {
        (row.submissionData as SubmissionData).attemptNumber = 2;
      },
    ],
    [
      "invalid envelope submitted time",
      (row: Row) => {
        (row.submissionData as SubmissionData).submittedAt = "not-a-time";
      },
    ],
    [
      "mismatched envelope submitted time",
      (row: Row) => {
        (row.submissionData as SubmissionData).submittedAt = "2026-08-19T10:01:00.000Z";
      },
    ],
    [
      "missing answer",
      (row: Row) => {
        delete ((row.submissionData as SubmissionData).answers as Record<string, unknown>)
          .relative_minimum_x;
      },
    ],
    [
      "extra answer",
      (row: Row) => {
        ((row.submissionData as SubmissionData).answers as Record<string, unknown>).extra = "1";
      },
    ],
    [
      "changed answer",
      (row: Row) => {
        (
          (row.submissionData as SubmissionData).answers as Record<string, unknown>
        ).relative_minimum_x = "2";
      },
    ],
    [
      "extra part field",
      (row: Row) => {
        ((row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>)[0]!.extra =
          true;
      },
    ],
    [
      "missing part",
      (row: Row) => {
        (row.submissionData as SubmissionData).parts = (
          (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>
        ).slice(0, 2);
      },
    ],
    [
      "duplicate part",
      (row: Row) => {
        const parts = (row.submissionData as SubmissionData).parts as Array<
          Record<string, unknown>
        >;
        (row.submissionData as SubmissionData).parts = [parts[0], parts[0], parts[2]];
      },
    ],
    [
      "reordered parts",
      (row: Row) => {
        (row.submissionData as SubmissionData).parts = [
          ...((row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>),
        ].reverse();
      },
    ],
    [
      "mismatched raw part",
      (row: Row) => {
        (
          (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>
        )[0]!.rawAnswer = "2";
      },
    ],
    [
      "stored attempt ordinal",
      (row: Row) => {
        row.attemptOrdinal = 2;
      },
    ],
    [
      "stored submitted time",
      (row: Row) => {
        row.submittedAt = 1;
      },
    ],
    [
      "stored created time",
      (row: Row) => {
        row.createdAt = 1;
      },
    ],
    [
      "stored updated time",
      (row: Row) => {
        row.updatedAt = 1;
      },
    ],
    ...[
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
    ].map(
      (field) =>
        [
          `forbidden stored field ${field}`,
          (row: Row) => {
            row[field] = true;
          },
        ] as const,
    ),
  ] as const)("rejects %s during semantic replay validation", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput({
      idempotencyKey: `polynomial-extrema-corrupt-${_label.replaceAll(" ", "-")}`,
    });
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeEnvelope(sourceAnswers(), {
          attemptNumber: 42,
          submittedAt: "2026-08-20T11:00:00.000Z",
        }),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
