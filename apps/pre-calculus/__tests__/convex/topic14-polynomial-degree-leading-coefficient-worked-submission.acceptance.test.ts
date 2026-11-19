import { describe, expect, it, vi } from "vitest";

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import type { MutationCtx } from "@/convex/_generated/server";
import { generateTopic14PolynomialDegreeLeadingCoefficientOutput } from "@math-platform/math-content/knowledge-space";
import { PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-polynomial-worked-learner";
const ACTIVITY_DOCUMENT_ID = "activities:polynomial-degree-leading-coefficient-worked";
const CLIENT_SUBMITTED_AT = "2026-08-19T10:00:00.000Z";
const ANSWER_IDS = [
  "a_degree",
  "a_leading_coefficient",
  "b_degree",
  "b_leading_coefficient",
  "c_degree",
  "c_leading_coefficient",
] as const;
const SOURCE_ANSWERS = {
  a_degree: "4",
  a_leading_coefficient: "3",
  b_degree: "3",
  b_leading_coefficient: "-7",
  c_degree: "0",
  c_leading_coefficient: "4",
} as const;
const BANNED_AUTHORITY_KEYS = new Set([
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "gradingMetadata",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "masteryContractVersion",
  "score",
  "maxScore",
  "feedback",
  "gradedAt",
]);

type Row = Record<string, unknown> & { _id: string };
type SubmissionData = Record<string, unknown>;
type Handler = (
  ctx: MutationCtx,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: SubmissionData;
  },
) => Promise<{
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
}>;

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation =
    importedModule.createTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission as
      | {
          _handler?: unknown;
        }
      | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("AP Precalculus must export the Topic 1.4 Worked submission producer.");
  }
  return mutation._handler as Handler;
}

function makeEnvelope(
  answers: Record<string, unknown> = SOURCE_ANSWERS,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
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
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
    idempotencyKey: "polynomial-degree-leading-coefficient-worked-source-review",
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId:
          PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
        componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
        props: { presentationMode: "worked_example" },
        gradingConfig:
          PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
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

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectObjectKeys(item, keys));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectObjectKeys(nestedValue, keys);
    });
  }
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectObjectKeys(value).filter((key) => BANNED_AUTHORITY_KEYS.has(key))).toEqual([]);
}

describe("Topic 1.4 polynomial degree and leading coefficient Worked submission", () => {
  it("stores the exact seed-0 source review as an ungraded row", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    expect(generateTopic14PolynomialDegreeLeadingCoefficientOutput(0).expectedAnswer).toEqual({
      a_degree: 4,
      a_leading_coefficient: 3,
      b_degree: 3,
      b_leading_coefficient: -7,
      c_degree: 0,
      c_leading_coefficient: 4,
    });

    const result = await handler(harness.ctx, makeInput());
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;

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
    expect(stored).toMatchObject({
      _id: result.submissionId,
      userId: LEARNER_ID,
      activityId: ACTIVITY_DOCUMENT_ID,
      stableActivityId:
        PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      createIdempotencyKey: "polynomial-degree-leading-coefficient-worked-source-review",
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
    expect(storedData).toEqual({
      contractVersion: "practice.v1",
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: SOURCE_ANSWERS,
      parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: SOURCE_ANSWERS[partId] })),
    });
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expect(storedData.attemptNumber).toBe(1);
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
        answers: { ...(envelope.answers as Record<string, unknown>), expectedAnswer: "4" },
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
      "wrong part order",
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
          { partId: "a_leading_coefficient", rawAnswer: "wrong" },
          ...(envelope.parts as Array<Record<string, unknown>>).slice(2),
        ],
      }),
    ],
    [
      "invalid source answer",
      (envelope: SubmissionData) => ({
        ...envelope,
        answers: { ...SOURCE_ANSWERS, a_degree: "5" },
        parts: [
          { partId: "a_degree", rawAnswer: "5" },
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

  it.each([
    [
      "wrong activity ID",
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
          generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
          variantSeed: 1,
        };
      },
    ],
    [
      "non-integer seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...(harness.rows.activities[0]!.gradingConfig as Record<string, unknown>),
          variantSeed: 0.5,
        };
      },
    ],
    [
      "extra grading config",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
          extra: true,
        };
      },
    ],
  ] as const)("rejects %s provisioning", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(
      handler(
        harness.ctx,
        makeInput({
          idempotencyKey: `polynomial-provisioning-${_label.replaceAll(" ", "-")}`,
        }),
      ),
    ).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("replays exactly, rejects changed source and cross-activity reuse, and increments a new key", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput();
    const first = await handler(harness.ctx, input);
    expect(await handler(harness.ctx, input)).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...input,
        submissionData: makeEnvelope({ ...SOURCE_ANSWERS, a_degree: "5" }),
      }),
    ).rejects.toThrow("idempotency_conflict");
    await expect(
      handler(harness.ctx, {
        ...input,
        activityId: "math.precalc.other.worked_example",
        submissionData: { ...makeEnvelope(), activityId: "math.precalc.other.worked_example" },
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: "polynomial-degree-leading-coefficient-worked-second",
    });
    expect(second.attemptOrdinal).toBe(2);
    expect(harness.rows.activity_submissions).toHaveLength(2);
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
      "stored stable identity",
      (row: Row) => {
        row.stableActivityId = "math.precalc.other";
      },
    ],
    [
      "extra envelope field",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).extra = true;
      },
    ],
    [
      "envelope answer",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).answers as Record<string, unknown>
        ).a_degree = "5";
      },
    ],
    [
      "envelope part",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.rawAnswer = "5";
      },
    ],
    [
      "extra part field",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.score = 0;
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
    [
      "stored grade field",
      (row: Row) => {
        row.score = 0;
      },
    ],
  ] as const)("rejects %s during replay validation", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput({
      idempotencyKey: `polynomial-corrupt-${_label.replaceAll(" ", "-")}`,
    });
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
