import { describe, expect, it } from "vitest";

import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG,
  createTopic15RealZerosAndMultiplicitiesSubmission,
} from "@/convex/activities";
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import { gradeTopic15RealZerosAndMultiplicities } from "@/lib/practice/topic15-real-zeros-and-multiplicities";

type Row = Record<string, unknown> & { _id: string };
type Mode = "guided_practice" | "independent_practice";
type Pair = { zero: number; multiplicity: number };
type Answers = { a: Pair[]; b: Pair[] };

const USER_ID = "profiles:learner";
const GUIDED_ACTIVITY_DOCUMENT_ID = "activities:real-zeros-guided";
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = "activities:real-zeros-independent";
const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID =
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID;

const SEED_1_ANSWERS: Answers = {
  a: [
    { zero: -5, multiplicity: 3 },
    { zero: 0, multiplicity: 1 },
    { zero: 5, multiplicity: 2 },
  ],
  b: [
    { zero: 0, multiplicity: 2 },
    { zero: 5, multiplicity: 1 },
  ],
};
const SEED_2_ANSWERS: Answers = {
  a: [
    { zero: -2, multiplicity: 2 },
    { zero: 0, multiplicity: 2 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -3, multiplicity: 2 },
    { zero: 3, multiplicity: 3 },
  ],
};

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "isCorrect",
  "maxScore",
  "normalizedAnswer",
  "score",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
  "correctness",
] as const;

function getHandler() {
  const handler = Reflect.get(createTopic15RealZerosAndMultiplicitiesSubmission, "_handler");
  if (typeof handler !== "function") {
    throw new Error("createTopic15RealZerosAndMultiplicitiesSubmission must expose its handler.");
  }
  return handler as (
    context: { db: Record<string, unknown> },
    args: Record<string, unknown>,
  ) => Promise<unknown>;
}

function makeEnvelope(
  activityId: string,
  mode: Mode,
  answers: Answers,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber: 17,
    submittedAt: "2026-08-30T00:00:00.000Z",
    answers,
    parts: [
      { partId: "a", rawAnswer: answers.a },
      { partId: "b", rawAnswer: answers.b },
    ],
    ...overrides,
  };
}

function activityRow(
  activityId: string,
  documentId: string,
  mode: Mode,
  gradingConfig: Record<string, unknown>,
): Row {
  return {
    _id: documentId,
    stableActivityId: activityId,
    componentKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
    props: { presentationMode: mode },
    gradingConfig,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      activityRow(GUIDED_ACTIVITY_ID, GUIDED_ACTIVITY_DOCUMENT_ID, "guided_practice", {
        ...PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
      }),
      activityRow(
        INDEPENDENT_ACTIVITY_ID,
        INDEPENDENT_ACTIVITY_DOCUMENT_ID,
        "independent_practice",
        { ...PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG },
      ),
    ],
    activity_submissions: [],
    learning_evidence: [],
  };
  const inserts: Array<{ table: string; document: Row }> = [];
  const indexCalls: string[] = [];

  const db = {
    query: (table: string) => ({
      withIndex: (
        indexName: string,
        configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
      ) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        configure(index);
        indexCalls.push(`${table}:${indexName}`);
        const select = () =>
          (rows[table] ?? []).filter((row) =>
            [...conditions].every(([field, value]) => row[field] === value),
          );
        return {
          first: async () => select()[0] ?? null,
          unique: async () => {
            const matches = select();
            if (matches.length > 1) throw new Error(`Duplicate ${table} rows`);
            return matches[0] ?? null;
          },
          order: (_direction: string) => ({
            first: async () =>
              select().sort(
                (left, right) =>
                  Number(right.attemptOrdinal ?? 0) - Number(left.attemptOrdinal ?? 0),
              )[0] ?? null,
          }),
        };
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const tableRows = rows[table] ?? (rows[table] = []);
      const row = { _id: `${table}:${tableRows.length + 1}`, ...document } as Row;
      tableRows.push(row);
      inserts.push({ table, document: row });
      return row._id;
    },
  };

  return { context: { db }, indexCalls, inserts, rows };
}

function argsFor(
  activityId: string,
  mode: Mode,
  answers: Answers,
  idempotencyKey = `real-zeros:${mode}`,
  envelopeOverrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    userId: USER_ID,
    activityId,
    idempotencyKey,
    submissionData: makeEnvelope(activityId, mode, answers, envelopeOverrides),
  };
}

function storedData(row: Row): Record<string, unknown> {
  return row.submissionData as Record<string, unknown>;
}

function storedAnswers(row: Row): Record<string, unknown> & {
  a: Array<Record<string, unknown>>;
  b: Array<Record<string, unknown>>;
} {
  return storedData(row).answers as Record<string, unknown> & {
    a: Array<Record<string, unknown>>;
    b: Array<Record<string, unknown>>;
  };
}

function storedParts(row: Row): Array<Record<string, unknown>> {
  return storedData(row).parts as Array<Record<string, unknown>>;
}

function expectNoEvidence(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.inserts.filter(({ table }) => table === "learning_evidence")).toHaveLength(0);
}

async function expectRejected(
  handler: ReturnType<typeof getHandler>,
  harness: ReturnType<typeof createHarness>,
  args: Record<string, unknown>,
): Promise<void> {
  await expect(handler(harness.context, args)).rejects.toThrow();
  expect(harness.rows.activity_submissions).toHaveLength(0);
  expect(harness.inserts.filter(({ table }) => table === "activity_submissions")).toHaveLength(0);
  expectNoEvidence(harness);
}

describe("Topic 1.5 real zeros and multiplicities submission", () => {
  it("stores exact Guided and Independent grades with server normalization", async () => {
    const handler = getHandler();
    for (const [activityId, mode, seed, documentId, answers] of [
      [GUIDED_ACTIVITY_ID, "guided_practice", 1, GUIDED_ACTIVITY_DOCUMENT_ID, SEED_1_ANSWERS],
      [
        INDEPENDENT_ACTIVITY_ID,
        "independent_practice",
        2,
        INDEPENDENT_ACTIVITY_DOCUMENT_ID,
        SEED_2_ANSWERS,
      ],
    ] as const) {
      const harness = createHarness();
      const result = await handler(
        harness.context,
        argsFor(activityId, mode, answers, `${mode}:source`, {
          attemptNumber: 99,
          submittedAt: "2020-01-01T00:00:00.000Z",
        }),
      );
      expect(result).toEqual({
        submissionId: "activity_submissions:1",
        score: 2,
        maxScore: 2,
        attemptOrdinal: 1,
        feedback: "2/2 real-zero and multiplicity responses matched the server rubric.",
      });
      const row = harness.rows.activity_submissions[0]!;
      expect(row).toMatchObject({
        userId: USER_ID,
        activityId: documentId,
        stableActivityId: activityId,
        masteryContractVersion: "learning-evidence.v1",
        createIdempotencyKey: `${mode}:source`,
        attemptOrdinal: 1,
        score: 2,
        maxScore: 2,
        feedback: "2/2 real-zero and multiplicity responses matched the server rubric.",
      });
      expect(Object.keys(row).sort()).toEqual(
        [
          "_id",
          "activityId",
          "attemptOrdinal",
          "createdAt",
          "createIdempotencyKey",
          "feedback",
          "gradedAt",
          "masteryContractVersion",
          "maxScore",
          "score",
          "stableActivityId",
          "submittedAt",
          "submissionData",
          "updatedAt",
          "userId",
        ].sort(),
      );
      expect(row.submittedAt).toBe(row.createdAt);
      expect(row.submittedAt).toBe(row.updatedAt);
      expect(row.submittedAt).toBe(row.gradedAt);
      expect(Number.isFinite(row.submittedAt)).toBe(true);

      const data = storedData(row);
      expect(Object.keys(data).sort()).toEqual(
        [
          "activityId",
          "answers",
          "attemptNumber",
          "contractVersion",
          "mode",
          "parts",
          "status",
          "submittedAt",
        ].sort(),
      );
      expect(data).toMatchObject({
        contractVersion: "practice.v1",
        activityId,
        mode,
        status: "graded",
        attemptNumber: 1,
      });
      expect(Date.parse(data.submittedAt as string)).toBe(row.submittedAt);
      expect(data.answers).toEqual(answers);
      expect(data.parts).toEqual(gradeTopic15RealZerosAndMultiplicities(seed, answers).parts);
      expect((data.parts as Array<Record<string, unknown>>).map((part) => part.partId)).toEqual([
        "a",
        "b",
      ]);
      expect(
        (data.parts as Array<Record<string, unknown>>).every(
          (part) =>
            Object.keys(part).sort().join("|") === "isCorrect|maxScore|partId|rawAnswer|score",
        ),
      ).toBe(true);
      expectNoEvidence(harness);
      for (const key of AUTHORITY_KEYS) {
        if (key !== "score" && key !== "maxScore") expect(row).not.toHaveProperty(key);
      }
    }
  });

  it("preserves raw numeric arrays and awards independent partial and zero credit", async () => {
    const handler = getHandler();
    const partialAnswers: Answers = {
      a: [{ zero: -4, multiplicity: 3 }, ...SEED_1_ANSWERS.a.slice(1)],
      b: SEED_1_ANSWERS.b.map((pair) => ({ ...pair })),
    };
    const zeroAnswers: Answers = {
      a: partialAnswers.a.map((pair) => ({ ...pair })),
      b: [
        { zero: 1, multiplicity: 2 },
        { zero: 6, multiplicity: 1 },
      ],
    };
    for (const [key, answers, score] of [
      ["partial", partialAnswers, 1],
      ["zero", zeroAnswers, 0],
    ] as const) {
      const harness = createHarness();
      const result = await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", answers, `raw:${key}`),
      );
      expect((result as { score: number }).score).toBe(score);
      expect(storedData(harness.rows.activity_submissions[0]!).answers).toEqual(answers);
      expectNoEvidence(harness);
    }
  });

  it("replays exact Guided and Independent grades with advisory client hints", async () => {
    const handler = getHandler();
    for (const [activityId, mode, answers] of [
      [GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS],
      [INDEPENDENT_ACTIVITY_ID, "independent_practice", SEED_2_ANSWERS],
    ] as const) {
      const harness = createHarness();
      const key = `replay:${mode}`;
      const first = await handler(harness.context, argsFor(activityId, mode, answers, key));
      const replay = await handler(
        harness.context,
        argsFor(activityId, mode, answers, key, {
          attemptNumber: 999,
          submittedAt: "2035-01-01T00:00:00.000Z",
        }),
      );
      expect(replay).toEqual(first);
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expectNoEvidence(harness);
    }

    const changedHarness = createHarness();
    await handler(
      changedHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, "changed-request"),
    );
    const changedA: Answers = {
      a: [{ zero: -4, multiplicity: 3 }, ...SEED_1_ANSWERS.a.slice(1)],
      b: SEED_1_ANSWERS.b,
    };
    const changedB: Answers = {
      a: SEED_1_ANSWERS.a,
      b: [{ zero: 1, multiplicity: 2 }, SEED_1_ANSWERS.b[1]!],
    };
    await expect(
      handler(
        changedHarness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", changedA, "changed-request"),
      ),
    ).rejects.toThrow("idempotency_conflict");
    await expect(
      handler(
        changedHarness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", changedB, "changed-request"),
      ),
    ).rejects.toThrow("idempotency_conflict");
    await expect(
      handler(
        changedHarness.context,
        argsFor(INDEPENDENT_ACTIVITY_ID, "independent_practice", SEED_2_ANSWERS, "changed-request"),
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(changedHarness.rows.activity_submissions).toHaveLength(1);
    expectNoEvidence(changedHarness);
  });

  it("rejects observable stored-row corruption without duplicate effects", async () => {
    const handler = getHandler();
    const storedForbiddenKeys = AUTHORITY_KEYS.filter(
      (key) => key !== "score" && key !== "maxScore",
    );
    const corruptionCases: Array<[string, (row: Row) => void]> = [
      [
        "activity document",
        (row) => {
          row.activityId = INDEPENDENT_ACTIVITY_DOCUMENT_ID;
        },
      ],
      [
        "stable activity",
        (row) => {
          row.stableActivityId = INDEPENDENT_ACTIVITY_ID;
        },
      ],
      [
        "non-record envelope",
        (row) => {
          row.submissionData = null;
        },
      ],
      [
        "missing envelope field",
        (row) => {
          delete storedData(row).status;
        },
      ],
      [
        "extra envelope field",
        (row) => {
          storedData(row).extra = true;
        },
      ],
      [
        "wrong contract",
        (row) => {
          storedData(row).contractVersion = "wrong";
        },
      ],
      [
        "wrong envelope activity",
        (row) => {
          storedData(row).activityId = INDEPENDENT_ACTIVITY_ID;
        },
      ],
      [
        "wrong envelope mode",
        (row) => {
          storedData(row).mode = "independent_practice";
        },
      ],
      [
        "wrong envelope status",
        (row) => {
          storedData(row).status = "submitted";
        },
      ],
      [
        "envelope attempt type",
        (row) => {
          storedData(row).attemptNumber = "1";
        },
      ],
      [
        "envelope zero attempt",
        (row) => {
          storedData(row).attemptNumber = 0;
        },
      ],
      [
        "envelope fractional attempt",
        (row) => {
          storedData(row).attemptNumber = 1.5;
        },
      ],
      [
        "envelope attempt mismatch",
        (row) => {
          storedData(row).attemptNumber = 2;
        },
      ],
      [
        "row attempt type",
        (row) => {
          row.attemptOrdinal = "1";
        },
      ],
      [
        "row zero attempt",
        (row) => {
          row.attemptOrdinal = 0;
        },
      ],
      [
        "row fractional attempt",
        (row) => {
          row.attemptOrdinal = 1.5;
        },
      ],
      [
        "envelope submittedAt type",
        (row) => {
          storedData(row).submittedAt = 1;
        },
      ],
      [
        "envelope invalid submittedAt",
        (row) => {
          storedData(row).submittedAt = "not-a-date";
        },
      ],
      [
        "envelope noncanonical submittedAt",
        (row) => {
          storedData(row).submittedAt = "2026-08-30T00:00:00Z";
        },
      ],
      [
        "envelope submittedAt mismatch",
        (row) => {
          storedData(row).submittedAt = new Date(Number(row.submittedAt) + 1).toISOString();
        },
      ],
      [
        "row submittedAt type",
        (row) => {
          row.submittedAt = "now";
        },
      ],
      [
        "row nonfinite submittedAt",
        (row) => {
          row.submittedAt = Number.NaN;
        },
      ],
      [
        "row submittedAt mismatch",
        (row) => {
          row.submittedAt = Number(row.submittedAt) + 1;
        },
      ],
      [
        "non-record answers",
        (row) => {
          storedData(row).answers = null;
        },
      ],
      [
        "missing answer",
        (row) => {
          Reflect.deleteProperty(storedAnswers(row), "b");
        },
      ],
      [
        "extra answer",
        (row) => {
          storedAnswers(row).extra = SEED_1_ANSWERS.a;
        },
      ],
      [
        "changed answer",
        (row) => {
          storedAnswers(row).a[0].zero = -4;
        },
      ],
      [
        "non-array answer",
        (row) => {
          (storedAnswers(row) as Record<string, unknown>).a = {};
        },
      ],
      [
        "reordered answer pairs",
        (row) => {
          storedAnswers(row).a = [...storedAnswers(row).a].reverse();
        },
      ],
      [
        "non-record pair",
        (row) => {
          (storedAnswers(row).a as unknown[])[0] = null;
        },
      ],
      [
        "missing pair field",
        (row) => {
          Reflect.deleteProperty(storedAnswers(row).a[0], "zero");
        },
      ],
      [
        "extra pair field",
        (row) => {
          storedAnswers(row).a[0].extra = true;
        },
      ],
      [
        "non-finite pair",
        (row) => {
          storedAnswers(row).a[0].zero = Number.NaN;
        },
      ],
      [
        "non-array parts",
        (row) => {
          storedData(row).parts = null;
        },
      ],
      [
        "missing part",
        (row) => {
          storedParts(row).pop();
        },
      ],
      [
        "extra part",
        (row) => {
          storedParts(row).push({ partId: "a", rawAnswer: SEED_1_ANSWERS.a });
        },
      ],
      [
        "reordered parts",
        (row) => {
          storedData(row).parts = [...storedParts(row)].reverse();
        },
      ],
      [
        "duplicate part",
        (row) => {
          storedParts(row)[1] = { ...storedParts(row)[0]! };
        },
      ],
      [
        "unknown part ID",
        (row) => {
          storedParts(row)[0]!.partId = "unknown";
        },
      ],
      [
        "missing part field",
        (row) => {
          delete storedParts(row)[0]!.rawAnswer;
        },
      ],
      [
        "extra part field",
        (row) => {
          storedParts(row)[0]!.extra = true;
        },
      ],
      [
        "changed raw pair",
        (row) => {
          storedParts(row)[0]!.rawAnswer = [{ zero: -4, multiplicity: 3 }];
        },
      ],
      [
        "changed part correctness",
        (row) => {
          storedParts(row)[0]!.isCorrect = !storedParts(row)[0]!.isCorrect;
        },
      ],
      [
        "changed part score",
        (row) => {
          storedParts(row)[0]!.score = 0;
        },
      ],
      [
        "changed part maxScore",
        (row) => {
          storedParts(row)[0]!.maxScore = 2;
        },
      ],
      [
        "mastery contract",
        (row) => {
          row.masteryContractVersion = "wrong";
        },
      ],
      [
        "score",
        (row) => {
          row.score = 1;
        },
      ],
      [
        "maxScore",
        (row) => {
          row.maxScore = 1;
        },
      ],
      [
        "feedback",
        (row) => {
          row.feedback = "wrong";
        },
      ],
      [
        "gradedAt type",
        (row) => {
          row.gradedAt = "now";
        },
      ],
      [
        "gradedAt nonfinite",
        (row) => {
          row.gradedAt = Number.NaN;
        },
      ],
      [
        "gradedAt mismatch",
        (row) => {
          row.gradedAt = Number(row.submittedAt) + 1;
        },
      ],
      [
        "createdAt type",
        (row) => {
          row.createdAt = "now";
        },
      ],
      [
        "createdAt nonfinite",
        (row) => {
          row.createdAt = Number.NaN;
        },
      ],
      [
        "createdAt mismatch",
        (row) => {
          row.createdAt = Number(row.submittedAt) + 1;
        },
      ],
      [
        "updatedAt type",
        (row) => {
          row.updatedAt = "now";
        },
      ],
      [
        "updatedAt nonfinite",
        (row) => {
          row.updatedAt = Number.NaN;
        },
      ],
      [
        "updatedAt mismatch",
        (row) => {
          row.updatedAt = Number(row.submittedAt) + 1;
        },
      ],
    ];

    for (const [name, mutate] of corruptionCases) {
      const harness = createHarness();
      const key = `corruption:${name}`;
      await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, key),
      );
      mutate(harness.rows.activity_submissions[0]!);
      await expect(
        handler(
          harness.context,
          argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, key),
        ),
      ).rejects.toThrow("idempotency_conflict");
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expectNoEvidence(harness);
    }

    for (const authorityKey of storedForbiddenKeys) {
      const harness = createHarness();
      const key = `forbidden:${authorityKey}`;
      await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, key),
      );
      harness.rows.activity_submissions[0]![authorityKey] = "blocked";
      await expect(
        handler(
          harness.context,
          argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, key),
        ),
      ).rejects.toThrow("idempotency_conflict");
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expectNoEvidence(harness);
    }
  });

  it("rejects strict envelope, answer, part, identity, key, time, and authority failures", async () => {
    const handler = getHandler();
    const valid = SEED_1_ANSWERS;
    const malformedEnvelopes: Array<[string, Record<string, unknown>]> = [
      ["extra outer field", { extra: true }],
      ["missing outer field", { status: undefined }],
      ["wrong contract", { contractVersion: "wrong" }],
      ["wrong status", { status: "graded" }],
      ["wrong mode", { mode: "independent_practice" }],
      ["wrong activity", { activityId: INDEPENDENT_ACTIVITY_ID }],
      ["extra answer field", { answers: { ...valid, extra: valid.a } }],
      ["missing answer field", { answers: { a: valid.a } }],
      ["non-record answers", { answers: null }],
      ["non-array answer", { answers: { a: {}, b: valid.b } }],
      ["missing parts", { parts: undefined }],
      [
        "extra part",
        {
          parts: [
            { partId: "a", rawAnswer: valid.a },
            { partId: "b", rawAnswer: valid.b },
            { partId: "a", rawAnswer: valid.a },
          ],
        },
      ],
      [
        "reordered parts",
        {
          parts: [
            { partId: "b", rawAnswer: valid.b },
            { partId: "a", rawAnswer: valid.a },
          ],
        },
      ],
      [
        "duplicate part",
        {
          parts: [
            { partId: "a", rawAnswer: valid.a },
            { partId: "a", rawAnswer: valid.a },
          ],
        },
      ],
      [
        "mismatched part",
        {
          parts: [
            { partId: "a", rawAnswer: valid.b },
            { partId: "b", rawAnswer: valid.b },
          ],
        },
      ],
      [
        "extra part field",
        {
          parts: [
            { partId: "a", rawAnswer: valid.a, authority: true },
            { partId: "b", rawAnswer: valid.b },
          ],
        },
      ],
      ["one pair", { answers: { a: [valid.a[0]], b: valid.b } }],
      ["four pairs", { answers: { a: [...valid.a, { zero: 8, multiplicity: 1 }], b: valid.b } }],
      ["non-record pair", { answers: { a: [null, ...valid.a.slice(1)], b: valid.b } }],
      ["missing pair field", { answers: { a: [{ zero: -5 }, ...valid.a.slice(1)], b: valid.b } }],
      [
        "extra pair field",
        { answers: { a: [{ ...valid.a[0], answer: 1 }, ...valid.a.slice(1)], b: valid.b } },
      ],
      [
        "non-number pair",
        { answers: { a: [{ zero: "x", multiplicity: 3 }, ...valid.a.slice(1)], b: valid.b } },
      ],
      [
        "non-finite pair",
        {
          answers: { a: [{ zero: Number.NaN, multiplicity: 3 }, ...valid.a.slice(1)], b: valid.b },
        },
      ],
      ["zero attempt", { attemptNumber: 0 }],
      ["fractional attempt", { attemptNumber: 1.5 }],
      ["non-finite attempt", { attemptNumber: Number.NaN }],
      ["invalid time", { submittedAt: "not-a-date" }],
    ];
    for (const [name, envelopeOverrides] of malformedEnvelopes) {
      await expectRejected(
        handler,
        createHarness(),
        argsFor(
          GUIDED_ACTIVITY_ID,
          "guided_practice",
          valid,
          `malformed:${name}`,
          envelopeOverrides,
        ),
      );
    }

    for (const authorityKey of AUTHORITY_KEYS) {
      const envelope = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", valid);
      envelope[authorityKey] = "blocked";
      await expectRejected(handler, createHarness(), {
        userId: USER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        idempotencyKey: `authority:${authorityKey}`,
        submissionData: envelope,
      });
    }

    await expectRejected(
      handler,
      createHarness(),
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", valid, "   "),
    );
    await expectRejected(
      handler,
      createHarness(),
      argsFor(
        "math.precalc.skill.1.5.unknown.guided_practice",
        "guided_practice",
        valid,
        "unknown-activity",
      ),
    );
    await expectRejected(
      handler,
      createHarness(),
      argsFor(GUIDED_ACTIVITY_ID, "independent_practice", valid, "cross-mode"),
    );
  });

  it("rejects missing, duplicate, and malformed activity provisioning before persistence", async () => {
    const handler = getHandler();
    const cases: Array<[string, (harness: ReturnType<typeof createHarness>) => void]> = [
      [
        "missing activity",
        (harness) => {
          harness.rows.activities = [];
        },
      ],
      [
        "duplicate activity",
        (harness) => {
          harness.rows.activities.push({ ...harness.rows.activities[0]! });
        },
      ],
      [
        "wrong stable ID",
        (harness) => {
          harness.rows.activities[0]!.stableActivityId = "wrong";
        },
      ],
      [
        "wrong component",
        (harness) => {
          harness.rows.activities[0]!.componentKey = "wrong";
        },
      ],
      [
        "wrong mode props",
        (harness) => {
          harness.rows.activities[0]!.props = { presentationMode: "independent_practice" };
        },
      ],
      [
        "non-record props",
        (harness) => {
          harness.rows.activities[0]!.props = null;
        },
      ],
      [
        "non-record config",
        (harness) => {
          harness.rows.activities[0]!.gradingConfig = null;
        },
      ],
      [
        "extra config key",
        (harness) => {
          harness.rows.activities[0]!.gradingConfig = {
            ...PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
            extra: true,
          };
        },
      ],
      [
        "wrong generator",
        (harness) => {
          harness.rows.activities[0]!.gradingConfig = { generatorKey: "wrong", variantSeed: 1 };
        },
      ],
      [
        "wrong seed",
        (harness) => {
          harness.rows.activities[0]!.gradingConfig = {
            generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
            variantSeed: 2,
          };
        },
      ],
      [
        "non-integer seed",
        (harness) => {
          harness.rows.activities[0]!.gradingConfig = {
            generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
            variantSeed: 1.5,
          };
        },
      ],
    ];
    for (const [name, mutate] of cases) {
      const harness = createHarness();
      mutate(harness);
      await expectRejected(
        handler,
        harness,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, `provisioning:${name}`),
      );
    }
  });

  it("rejects an existing idempotency key and increments a new key ordinal", async () => {
    const handler = getHandler();
    const harness = createHarness();
    const first = await handler(
      harness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, "same-key"),
    );
    const replay = await handler(
      harness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, "same-key", {
        attemptNumber: 99,
        submittedAt: "2035-01-01T00:00:00.000Z",
      }),
    );
    expect(replay).toEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    const second = await handler(
      harness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", SEED_1_ANSWERS, "new-key"),
    );
    expect(first).toMatchObject({ attemptOrdinal: 1 });
    expect(second).toMatchObject({ submissionId: "activity_submissions:2", attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expectNoEvidence(harness);
    expect(harness.indexCalls).toContain("activity_submissions:by_user_and_create_idempotency_key");
    expect(harness.indexCalls).toContain(
      "activity_submissions:by_user_and_activity_and_attempt_ordinal",
    );
  });
});
