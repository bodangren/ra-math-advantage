import { describe, expect, it } from "vitest";

import { generateTopic14RateSignAndTrendOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_GRADING_CONFIG,
} from "@/convex/activities";
import { createTopic14RateSignAndTrendSubmission } from "@/convex/activities";
import {
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };
type Mode = "guided_practice" | "independent_practice";
type PartId = "rateSign" | "rateTrend";
type Answers = Record<PartId, string>;

const USER_ID = "profiles:learner";
const GUIDED_ACTIVITY_DOCUMENT_ID = "activities:rate-sign-guided";
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = "activities:rate-sign-independent";
const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID;

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "normalizedAnswer",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
  "isCorrect",
  "correctness",
] as const;

function getHandler() {
  const handler = Reflect.get(createTopic14RateSignAndTrendSubmission, "_handler");
  if (typeof handler !== "function") {
    throw new Error("createTopic14RateSignAndTrendSubmission must expose its handler.");
  }
  return handler as (
    context: { db: Record<string, unknown> },
    args: Record<string, unknown>,
  ) => Promise<unknown>;
}

function expectedAnswers(seed: number): Answers {
  return generateTopic14RateSignAndTrendOutput(seed).expectedAnswer as Answers;
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
      { partId: "rateSign", rawAnswer: answers.rateSign },
      { partId: "rateTrend", rawAnswer: answers.rateTrend },
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
    componentKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
    props: { presentationMode: mode },
    gradingConfig,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      activityRow(GUIDED_ACTIVITY_ID, GUIDED_ACTIVITY_DOCUMENT_ID, "guided_practice", {
        ...PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_GRADING_CONFIG,
      }),
      activityRow(
        INDEPENDENT_ACTIVITY_ID,
        INDEPENDENT_ACTIVITY_DOCUMENT_ID,
        "independent_practice",
        { ...PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_GRADING_CONFIG },
      ),
    ],
    activity_submissions: [],
    learning_evidence: [],
  };
  const inserts: Array<{ table: string; document: Row }> = [];

  const db = {
    query: (table: string) => ({
      withIndex: (
        _indexName: string,
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
        const select = () =>
          (rows[table] ?? []).filter((row) =>
            [...conditions].every(([field, value]) => row[field] === value),
          );
        const queryResult = {
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
        return queryResult;
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const tableRows = rows[table] ?? (rows[table] = []);
      const row = { _id: `${table}:${tableRows.length + 1}`, ...document };
      tableRows.push(row);
      inserts.push({ table, document: row });
      return row._id;
    },
  };

  return { context: { db }, inserts, rows };
}

function argsFor(
  activityId: string,
  mode: Mode,
  answers: Answers,
  idempotencyKey = `rate-sign:${mode}`,
  envelopeOverrides: Record<string, unknown> = {},
) {
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

function storedAnswers(row: Row): Record<string, unknown> {
  return storedData(row).answers as Record<string, unknown>;
}

function storedParts(row: Row): Array<Record<string, unknown>> {
  return storedData(row).parts as Array<Record<string, unknown>>;
}

async function expectRejected(
  handler: ReturnType<typeof getHandler>,
  harness: ReturnType<typeof createHarness>,
  args: Record<string, unknown>,
): Promise<void> {
  await expect(handler(harness.context, args)).rejects.toThrow();
  expect(harness.rows.activity_submissions).toHaveLength(0);
  expect(harness.inserts.filter(({ table }) => table === "activity_submissions")).toHaveLength(0);
  expect(harness.rows.learning_evidence).toHaveLength(0);
}

describe("Topic 1.4 rate sign and trend submission", () => {
  it("stores exact Guided and Independent grades with server-owned normalization", async () => {
    const handler = getHandler();
    for (const [activityId, mode, seed, documentId] of [
      [GUIDED_ACTIVITY_ID, "guided_practice", 1, GUIDED_ACTIVITY_DOCUMENT_ID],
      [INDEPENDENT_ACTIVITY_ID, "independent_practice", 2, INDEPENDENT_ACTIVITY_DOCUMENT_ID],
    ] as const) {
      const harness = createHarness();
      const answers = expectedAnswers(seed);
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
        feedback: "2/2 rate sign and trend responses matched the server rubric.",
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
        feedback: "2/2 rate sign and trend responses matched the server rubric.",
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
      const data = row.submissionData as Record<string, unknown>;
      expect(Object.keys(data).sort()).toEqual([
        "activityId",
        "answers",
        "attemptNumber",
        "contractVersion",
        "mode",
        "parts",
        "status",
        "submittedAt",
      ]);
      expect(data).toMatchObject({
        contractVersion: "practice.v1",
        activityId,
        mode,
        status: "graded",
        attemptNumber: 1,
      });
      expect(Date.parse(data.submittedAt as string)).toBe(row.submittedAt);
      expect(data.answers).toEqual(answers);
      expect((data.parts as Array<Record<string, unknown>>).map((part) => part.partId)).toEqual([
        "rateSign",
        "rateTrend",
      ]);
      expect(
        (data.parts as Array<Record<string, unknown>>).every(
          (part) =>
            Object.keys(part).sort().join("|") === "isCorrect|maxScore|partId|rawAnswer|score",
        ),
      ).toBe(true);
      expect(harness.rows.learning_evidence).toHaveLength(0);
      for (const key of AUTHORITY_KEYS) expect(row).not.toHaveProperty(key);
    }
  });

  it("preserves malformed raw answers and awards partial and zero credit", async () => {
    const handler = getHandler();
    const cases = [
      { answers: { rateSign: "not-a-choice", rateTrend: expectedAnswers(1).rateTrend }, score: 1 },
      { answers: { rateSign: "not-a-choice", rateTrend: "also-not-a-choice" }, score: 0 },
    ] as const;
    for (const [index, testCase] of cases.entries()) {
      const harness = createHarness();
      const result = await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", testCase.answers, `partial:${index}`),
      );
      expect((result as { score: number }).score).toBe(testCase.score);
      const parts = (
        harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>
      ).parts as Array<Record<string, unknown>>;
      expect(parts[0]).toMatchObject({
        partId: "rateSign",
        rawAnswer: "not-a-choice",
        score: 0,
        isCorrect: false,
      });
      expect(parts.map((part) => part.partId)).toEqual(["rateSign", "rateTrend"]);
    }
  });

  it("rejects strict envelope, authority, and identity failures before persistence", async () => {
    const handler = getHandler();
    const valid = expectedAnswers(1);
    const malformedEnvelopes: Array<[string, Record<string, unknown>]> = [
      ["extra outer field", { authority: "blocked" }],
      ["missing outer field", { status: undefined }],
      ["extra answer field", { answers: { ...valid, extra: "blocked" } }],
      ["missing answer field", { answers: { rateSign: valid.rateSign } }],
      ["missing parts", { parts: undefined }],
      [
        "extra part",
        {
          parts: [
            { partId: "rateSign", rawAnswer: valid.rateSign },
            { partId: "rateTrend", rawAnswer: valid.rateTrend },
            { partId: "rateSign", rawAnswer: valid.rateSign },
          ],
        },
      ],
      [
        "reordered parts",
        {
          parts: [
            { partId: "rateTrend", rawAnswer: valid.rateTrend },
            { partId: "rateSign", rawAnswer: valid.rateSign },
          ],
        },
      ],
      [
        "duplicate part",
        {
          parts: [
            { partId: "rateSign", rawAnswer: valid.rateSign },
            { partId: "rateSign", rawAnswer: valid.rateSign },
          ],
        },
      ],
      [
        "mismatched part",
        {
          parts: [
            { partId: "rateSign", rawAnswer: "wrong" },
            { partId: "rateTrend", rawAnswer: valid.rateTrend },
          ],
        },
      ],
      [
        "extra part field",
        {
          parts: [
            { partId: "rateSign", rawAnswer: valid.rateSign, authority: "blocked" },
            { partId: "rateTrend", rawAnswer: valid.rateTrend },
          ],
        },
      ],
      ["wrong mode", { mode: "independent_practice" }],
      ["wrong status", { status: "graded" }],
      ["zero attempt", { attemptNumber: 0 }],
      ["fractional attempt", { attemptNumber: 1.5 }],
      ["invalid time", { submittedAt: "not-a-date" }],
    ];
    for (const [name, envelopeOverrides] of malformedEnvelopes) {
      const harness = createHarness();
      await expect(
        handler(
          harness.context,
          argsFor(
            GUIDED_ACTIVITY_ID,
            "guided_practice",
            valid,
            `malformed:${name}`,
            envelopeOverrides,
          ),
        ).then(() => {
          throw new Error(`Expected ${name} to fail`);
        }),
      ).rejects.toThrow();
      expect(harness.rows.activity_submissions).toHaveLength(0);
    }

    for (const authorityKey of AUTHORITY_KEYS) {
      const harness = createHarness();
      const envelope = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", valid);
      (envelope as Record<string, unknown>)[authorityKey] = "blocked";
      await expectRejected(handler, harness, {
        userId: USER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        idempotencyKey: `authority:${authorityKey}`,
        submissionData: envelope,
      });
    }

    const identityCases: Array<[string, string, Mode]> = [
      ["unknown activity", "math.precalc.skill.1.4.unknown.guided_practice", "guided_practice"],
      ["cross activity", GUIDED_ACTIVITY_ID, "independent_practice"],
    ];
    for (const [name, activityId, mode] of identityCases) {
      const harness = createHarness();
      await expectRejected(handler, harness, argsFor(activityId, mode, valid, `identity:${name}`));
    }
    await expectRejected(
      handler,
      createHarness(),
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", valid, "   "),
    );
  });

  it("rejects invalid provisioning, existing keys, and preserves server ordinal behavior", async () => {
    const handler = getHandler();
    const valid = expectedAnswers(1);
    const provisioningCases: Array<[string, (harness: ReturnType<typeof createHarness>) => void]> =
      [
        [
          "missing activity",
          (harness) => {
            harness.rows.activities = [];
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
          "non-record grading",
          (harness) => {
            harness.rows.activities[0]!.gradingConfig = null;
          },
        ],
        [
          "extra grading key",
          (harness) => {
            harness.rows.activities[0]!.gradingConfig = {
              generatorKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
              variantSeed: 1,
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
              generatorKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
              variantSeed: 2,
            };
          },
        ],
        [
          "non-integer seed",
          (harness) => {
            harness.rows.activities[0]!.gradingConfig = {
              generatorKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
              variantSeed: 1.5,
            };
          },
        ],
      ];
    for (const [name, mutate] of provisioningCases) {
      const harness = createHarness();
      mutate(harness);
      await expectRejected(
        handler,
        harness,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", valid, `provisioning:${name}`),
      );
    }

    const existingHarness = createHarness();
    existingHarness.rows.activity_submissions.push({
      _id: "activity_submissions:existing",
      userId: USER_ID,
      createIdempotencyKey: "existing-key",
    });
    await expect(
      handler(
        existingHarness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", valid, "existing-key"),
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(existingHarness.rows.activity_submissions).toHaveLength(1);

    const ordinalHarness = createHarness();
    ordinalHarness.rows.activity_submissions.push({
      _id: "activity_submissions:prior",
      userId: USER_ID,
      activityId: GUIDED_ACTIVITY_DOCUMENT_ID,
      attemptOrdinal: 4,
    });
    const next = await handler(
      ordinalHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", valid, "next-key"),
    );
    expect((next as { attemptOrdinal: number }).attemptOrdinal).toBe(5);
    expect(ordinalHarness.rows.activity_submissions).toHaveLength(2);
    expect(ordinalHarness.rows.learning_evidence).toHaveLength(0);
  });

  it("replays exact stored semantics and rejects changed requests or corruption", async () => {
    const handler = getHandler();
    const answers = expectedAnswers(1);
    const firstHarness = createHarness();
    const firstArgs = argsFor(GUIDED_ACTIVITY_ID, "guided_practice", answers, "replay-key");
    const first = await handler(firstHarness.context, firstArgs);
    const replay = await handler(
      firstHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", answers, "replay-key", {
        attemptNumber: 999,
        submittedAt: "2035-01-01T00:00:00.000Z",
      }),
    );
    expect(replay).toEqual(first);
    expect(firstHarness.rows.activity_submissions).toHaveLength(1);
    expect(firstHarness.rows.learning_evidence).toHaveLength(0);

    const changedAnswers = {
      ...answers,
      rateSign: answers.rateSign === "positive" ? "negative" : "positive",
    };
    await expect(
      handler(
        firstHarness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", changedAnswers, "replay-key"),
      ),
    ).rejects.toThrow("idempotency_conflict");
    await expect(
      handler(
        firstHarness.context,
        argsFor(INDEPENDENT_ACTIVITY_ID, "independent_practice", expectedAnswers(2), "replay-key"),
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(firstHarness.rows.activity_submissions).toHaveLength(1);

    const corruptionCases: Array<[string, (row: Row) => void]> = [
      [
        "stored activity document identity",
        (row) => {
          row.activityId = INDEPENDENT_ACTIVITY_DOCUMENT_ID;
        },
      ],
      [
        "stored stable activity identity",
        (row) => {
          row.stableActivityId = INDEPENDENT_ACTIVITY_ID;
        },
      ],
      [
        "extra envelope field",
        (row) => {
          storedData(row).extra = true;
        },
      ],
      [
        "missing envelope field",
        (row) => {
          delete storedData(row).status;
        },
      ],
      [
        "wrong envelope contract",
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
        "envelope attempt mismatch",
        (row) => {
          storedData(row).attemptNumber = 2;
        },
      ],
      [
        "envelope fractional attempt",
        (row) => {
          storedData(row).attemptNumber = 1.5;
        },
      ],
      [
        "noncanonical envelope time",
        (row) => {
          storedData(row).submittedAt = "2026-08-30";
        },
      ],
      [
        "invalid envelope time",
        (row) => {
          storedData(row).submittedAt = "not-a-date";
        },
      ],
      [
        "nonfinite stored submittedAt",
        (row) => {
          row.submittedAt = Number.NaN;
        },
      ],
      [
        "extra answer field",
        (row) => {
          storedAnswers(row).extra = "blocked";
        },
      ],
      [
        "missing answer field",
        (row) => {
          delete storedAnswers(row).rateTrend;
        },
      ],
      [
        "changed rateSign answer",
        (row) => {
          storedAnswers(row).rateSign = answers.rateSign === "positive" ? "negative" : "positive";
        },
      ],
      [
        "changed rateTrend answer",
        (row) => {
          storedAnswers(row).rateTrend =
            answers.rateTrend === "increasing" ? "decreasing" : "increasing";
        },
      ],
      [
        "missing parts",
        (row) => {
          delete storedData(row).parts;
        },
      ],
      [
        "extra part",
        (row) => {
          storedParts(row).push({ partId: "rateSign", rawAnswer: answers.rateSign });
        },
      ],
      [
        "reordered parts",
        (row) => {
          storedParts(row).reverse();
        },
      ],
      [
        "duplicate part",
        (row) => {
          storedParts(row)[1] = { ...storedParts(row)[0] };
        },
      ],
      [
        "changed raw part",
        (row) => {
          storedParts(row)[0]!.rawAnswer = "blocked";
        },
      ],
      [
        "extra part field",
        (row) => {
          storedParts(row)[0]!.authority = "blocked";
        },
      ],
      [
        "missing part field",
        (row) => {
          delete storedParts(row)[0]!.isCorrect;
        },
      ],
      [
        "changed part ID",
        (row) => {
          storedParts(row)[0]!.partId = "rateTrend";
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
          storedParts(row)[0]!.score = 1 - Number(storedParts(row)[0]!.score);
        },
      ],
      [
        "changed part maxScore",
        (row) => {
          storedParts(row)[0]!.maxScore = 3;
        },
      ],
      [
        "wrong mastery contract",
        (row) => {
          row.masteryContractVersion = "wrong";
        },
      ],
      [
        "wrong total score",
        (row) => {
          row.score = 1;
        },
      ],
      [
        "wrong total maxScore",
        (row) => {
          row.maxScore = 3;
        },
      ],
      [
        "wrong feedback",
        (row) => {
          row.feedback = "wrong";
        },
      ],
      [
        "zero ordinal",
        (row) => {
          row.attemptOrdinal = 0;
        },
      ],
      [
        "fractional ordinal",
        (row) => {
          row.attemptOrdinal = 1.5;
        },
      ],
      [
        "gradedAt mismatch",
        (row) => {
          row.gradedAt = Number(row.submittedAt) + 1;
        },
      ],
      [
        "nonfinite gradedAt",
        (row) => {
          row.gradedAt = Number.NaN;
        },
      ],
      [
        "createdAt mismatch",
        (row) => {
          row.createdAt = Number(row.submittedAt) + 1;
        },
      ],
      [
        "nonfinite createdAt",
        (row) => {
          row.createdAt = Number.NaN;
        },
      ],
      [
        "updatedAt mismatch",
        (row) => {
          row.updatedAt = Number(row.submittedAt) + 1;
        },
      ],
      [
        "nonfinite updatedAt",
        (row) => {
          row.updatedAt = Number.NaN;
        },
      ],
    ];
    corruptionCases.push(
      ...AUTHORITY_KEYS.map((field): [string, (row: Row) => void] => [
        `forbidden stored field ${field}`,
        (row) => {
          row[field] = "blocked";
        },
      ]),
    );

    for (const [name, mutate] of corruptionCases) {
      const harness = createHarness();
      await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", answers, `corruption:${name}`),
      );
      mutate(harness.rows.activity_submissions[0]!);
      await expect(
        handler(
          harness.context,
          argsFor(GUIDED_ACTIVITY_ID, "guided_practice", answers, `corruption:${name}`),
        ),
      ).rejects.toThrow("idempotency_conflict");
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.rows.learning_evidence).toHaveLength(0);
    }

    const ordinalHarness = createHarness();
    await handler(
      ordinalHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", answers, "first-key"),
    );
    const next = await handler(
      ordinalHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", answers, "second-key"),
    );
    expect((next as { attemptOrdinal: number }).attemptOrdinal).toBe(2);
    expect(ordinalHarness.rows.activity_submissions).toHaveLength(2);
    expect(ordinalHarness.rows.learning_evidence).toHaveLength(0);
  });
});
