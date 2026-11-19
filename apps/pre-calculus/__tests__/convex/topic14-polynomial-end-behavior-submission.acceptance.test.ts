import { describe, expect, it } from "vitest";

import { generateTopic14PolynomialEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
  createTopic14PolynomialEndBehaviorSubmission,
} from "@/convex/activities";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };
type Mode = "guided_practice" | "independent_practice";
type PartId = "leftEnd" | "rightEnd";
type Answers = Record<PartId, string>;

const USER_ID = "profiles:learner";
const GUIDED_ACTIVITY_DOCUMENT_ID = "activities:end-behavior-guided";
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = "activities:end-behavior-independent";
const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID =
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;

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
  const handler = Reflect.get(createTopic14PolynomialEndBehaviorSubmission, "_handler");
  if (typeof handler !== "function") {
    throw new Error("createTopic14PolynomialEndBehaviorSubmission must expose its handler.");
  }
  return handler as (
    context: { db: Record<string, unknown> },
    args: Record<string, unknown>,
  ) => Promise<unknown>;
}

function expectedAnswers(seed: number): Answers {
  return generateTopic14PolynomialEndBehaviorOutput(seed).expectedAnswer as Answers;
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
      { partId: "leftEnd", rawAnswer: answers.leftEnd },
      { partId: "rightEnd", rawAnswer: answers.rightEnd },
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
    componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
    props: { presentationMode: mode },
    gradingConfig,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      activityRow(GUIDED_ACTIVITY_ID, GUIDED_ACTIVITY_DOCUMENT_ID, "guided_practice", {
        ...PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
      }),
      activityRow(
        INDEPENDENT_ACTIVITY_ID,
        INDEPENDENT_ACTIVITY_DOCUMENT_ID,
        "independent_practice",
        { ...PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG },
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
  idempotencyKey = `end-behavior:${mode}`,
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

describe("Topic 1.4 polynomial end behavior submission", () => {
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
        feedback: "2/2 polynomial end-behavior responses matched the server rubric.",
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
        feedback: "2/2 polynomial end-behavior responses matched the server rubric.",
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
      expect(storedParts(row).map((part) => part.partId)).toEqual(["leftEnd", "rightEnd"]);
      expect(
        storedParts(row).every(
          (part) =>
            Object.keys(part).sort().join("|") === "isCorrect|maxScore|partId|rawAnswer|score",
        ),
      ).toBe(true);
      expect(harness.rows.learning_evidence).toHaveLength(0);
      for (const key of AUTHORITY_KEYS) expect(row).not.toHaveProperty(key);
    }
  });

  it("preserves malformed raw answers and awards independent partial and zero credit", async () => {
    const handler = getHandler();
    const source = expectedAnswers(1);
    const cases = [
      { answers: { leftEnd: "not-a-choice", rightEnd: source.rightEnd }, score: 1 },
      { answers: { leftEnd: "not-a-choice", rightEnd: "also-not-a-choice" }, score: 0 },
    ] as const;
    for (const [index, testCase] of cases.entries()) {
      const harness = createHarness();
      const result = await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", testCase.answers, `raw:${index}`),
      );
      expect((result as { score: number }).score).toBe(testCase.score);
      expect(storedAnswers(harness.rows.activity_submissions[0]!).leftEnd).toBe("not-a-choice");
      expect(storedParts(harness.rows.activity_submissions[0]!)[0]).toMatchObject({
        partId: "leftEnd",
        rawAnswer: "not-a-choice",
        score: 0,
        isCorrect: false,
      });
      expect(harness.rows.learning_evidence).toHaveLength(0);
    }
  });

  it("rejects strict envelope, answer, part, identity, key, time, and attempt failures", async () => {
    const handler = getHandler();
    const valid = expectedAnswers(1);
    const malformedEnvelopes: Array<[string, Record<string, unknown>]> = [
      ["extra outer field", { authority: "blocked" }],
      ["missing outer field", { status: undefined }],
      ["wrong contract", { contractVersion: "wrong" }],
      ["extra answer field", { answers: { ...valid, extra: "blocked" } }],
      ["missing answer field", { answers: { leftEnd: valid.leftEnd } }],
      ["non-string answer", { answers: { ...valid, leftEnd: 1 } }],
      ["missing parts", { parts: undefined }],
      [
        "extra part",
        {
          parts: [
            { partId: "leftEnd", rawAnswer: valid.leftEnd },
            { partId: "rightEnd", rawAnswer: valid.rightEnd },
            { partId: "leftEnd", rawAnswer: valid.leftEnd },
          ],
        },
      ],
      [
        "reordered parts",
        {
          parts: [
            { partId: "rightEnd", rawAnswer: valid.rightEnd },
            { partId: "leftEnd", rawAnswer: valid.leftEnd },
          ],
        },
      ],
      [
        "duplicate part",
        {
          parts: [
            { partId: "leftEnd", rawAnswer: valid.leftEnd },
            { partId: "leftEnd", rawAnswer: valid.leftEnd },
          ],
        },
      ],
      [
        "mismatched part",
        {
          parts: [
            { partId: "leftEnd", rawAnswer: "wrong" },
            { partId: "rightEnd", rawAnswer: valid.rightEnd },
          ],
        },
      ],
      [
        "extra part field",
        {
          parts: [
            { partId: "leftEnd", rawAnswer: valid.leftEnd, authority: "blocked" },
            { partId: "rightEnd", rawAnswer: valid.rightEnd },
          ],
        },
      ],
      ["wrong mode", { mode: "independent_practice" }],
      ["wrong status", { status: "graded" }],
      ["zero attempt", { attemptNumber: 0 }],
      ["fractional attempt", { attemptNumber: 1.5 }],
      ["nonfinite attempt", { attemptNumber: Number.NaN }],
      ["invalid time", { submittedAt: "not-a-date" }],
    ];
    for (const [name, envelopeOverrides] of malformedEnvelopes) {
      const harness = createHarness();
      await expectRejected(
        handler,
        harness,
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
      const harness = createHarness();
      const envelope = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", valid);
      envelope[authorityKey] = "blocked";
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

  it("replays exact stored grades and rejects changed requests or stored corruption", async () => {
    const handler = getHandler();
    const replayCases = [
      [GUIDED_ACTIVITY_ID, "guided_practice", 1, GUIDED_ACTIVITY_DOCUMENT_ID],
      [INDEPENDENT_ACTIVITY_ID, "independent_practice", 2, INDEPENDENT_ACTIVITY_DOCUMENT_ID],
    ] as const;
    for (const [activityId, mode, seed, documentId] of replayCases) {
      const harness = createHarness();
      const answers = expectedAnswers(seed);
      const first = await handler(
        harness.context,
        argsFor(activityId, mode, answers, `replay:${mode}`),
      );
      const replay = await handler(
        harness.context,
        argsFor(activityId, mode, answers, `replay:${mode}`, {
          attemptNumber: 99,
          submittedAt: "2035-01-01T00:00:00.000Z",
        }),
      );
      expect(replay).toEqual(first);
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.rows.activity_submissions[0]).toMatchObject({
        activityId: documentId,
        stableActivityId: activityId,
      });
      expect(harness.rows.learning_evidence).toHaveLength(0);
    }

    const changedHarness = createHarness();
    const source = expectedAnswers(1);
    await handler(
      changedHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", source, "changed-answer"),
    );
    for (const changedAnswers of [
      { leftEnd: "changed", rightEnd: source.rightEnd },
      { leftEnd: source.leftEnd, rightEnd: "changed" },
    ] as const) {
      await expect(
        handler(
          changedHarness.context,
          argsFor(GUIDED_ACTIVITY_ID, "guided_practice", changedAnswers, "changed-answer"),
        ),
      ).rejects.toThrow("idempotency_conflict");
    }
    await expect(
      handler(
        changedHarness.context,
        argsFor(
          INDEPENDENT_ACTIVITY_ID,
          "independent_practice",
          expectedAnswers(2),
          "changed-answer",
        ),
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(changedHarness.rows.activity_submissions).toHaveLength(1);
    expect(changedHarness.rows.learning_evidence).toHaveLength(0);

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
        "attempt type",
        (row) => {
          storedData(row).attemptNumber = "1";
        },
      ],
      [
        "zero attempt",
        (row) => {
          storedData(row).attemptNumber = 0;
        },
      ],
      [
        "fractional attempt",
        (row) => {
          storedData(row).attemptNumber = 1.5;
        },
      ],
      [
        "attempt mismatch",
        (row) => {
          row.attemptOrdinal = 2;
        },
      ],
      [
        "top-level attempt ordinal type",
        (row) => {
          row.attemptOrdinal = "1";
        },
      ],
      [
        "top-level zero attempt ordinal",
        (row) => {
          row.attemptOrdinal = 0;
        },
      ],
      [
        "top-level fractional attempt ordinal",
        (row) => {
          row.attemptOrdinal = 1.5;
        },
      ],
      [
        "submittedAt type",
        (row) => {
          storedData(row).submittedAt = 1;
        },
      ],
      [
        "invalid submittedAt",
        (row) => {
          storedData(row).submittedAt = "not-a-date";
        },
      ],
      [
        "non-canonical submittedAt",
        (row) => {
          storedData(row).submittedAt = "2026-08-30T00:00:00Z";
        },
      ],
      [
        "top-level submittedAt type",
        (row) => {
          row.submittedAt = "now";
        },
      ],
      [
        "top-level nonfinite submittedAt",
        (row) => {
          row.submittedAt = Number.NaN;
        },
      ],
      [
        "top-level submittedAt mismatch",
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
        "extra answer field",
        (row) => {
          storedAnswers(row).extra = "blocked";
        },
      ],
      [
        "missing answer field",
        (row) => {
          delete storedAnswers(row).rightEnd;
        },
      ],
      [
        "non-string answer",
        (row) => {
          storedAnswers(row).leftEnd = 1;
        },
      ],
      [
        "changed answer",
        (row) => {
          storedAnswers(row).leftEnd = "changed";
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
          storedParts(row).push({ partId: "leftEnd", rawAnswer: source.leftEnd });
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
        "extra part field",
        (row) => {
          storedParts(row)[0]!.extra = true;
        },
      ],
      [
        "missing part field",
        (row) => {
          delete storedParts(row)[0]!.rawAnswer;
        },
      ],
      [
        "changed raw part",
        (row) => {
          storedParts(row)[0]!.rawAnswer = "changed";
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
        "changed part max score",
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
        "max score",
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
        "updatedAt mismatch",
        (row) => {
          row.updatedAt = Number(row.submittedAt) + 1;
        },
      ],
    ];
    for (const [name, mutate] of corruptionCases) {
      const harness = createHarness();
      await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", source, `corruption:${name}`),
      );
      mutate(harness.rows.activity_submissions[0]!);
      await expect(
        handler(
          harness.context,
          argsFor(GUIDED_ACTIVITY_ID, "guided_practice", source, `corruption:${name}`),
        ),
      ).rejects.toThrow("idempotency_conflict");
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.rows.learning_evidence).toHaveLength(0);
    }

    for (const authorityKey of AUTHORITY_KEYS) {
      const harness = createHarness();
      await handler(
        harness.context,
        argsFor(GUIDED_ACTIVITY_ID, "guided_practice", source, `forbidden:${authorityKey}`),
      );
      harness.rows.activity_submissions[0]![authorityKey] = "blocked";
      await expect(
        handler(
          harness.context,
          argsFor(GUIDED_ACTIVITY_ID, "guided_practice", source, `forbidden:${authorityKey}`),
        ),
      ).rejects.toThrow("idempotency_conflict");
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.rows.learning_evidence).toHaveLength(0);
    }

    const nextHarness = createHarness();
    const first = await handler(
      nextHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", source, "first-key"),
    );
    const next = await handler(
      nextHarness.context,
      argsFor(GUIDED_ACTIVITY_ID, "guided_practice", source, "second-key"),
    );
    expect((first as { attemptOrdinal: number }).attemptOrdinal).toBe(1);
    expect((next as { attemptOrdinal: number }).attemptOrdinal).toBe(2);
    expect(nextHarness.rows.activity_submissions).toHaveLength(2);
    expect(nextHarness.rows.learning_evidence).toHaveLength(0);
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
          "non-record grading",
          (harness) => {
            harness.rows.activities[0]!.gradingConfig = null;
          },
        ],
        [
          "extra grading key",
          (harness) => {
            harness.rows.activities[0]!.gradingConfig = {
              ...PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
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
              generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
              variantSeed: 2,
            };
          },
        ],
        [
          "non-integer seed",
          (harness) => {
            harness.rows.activities[0]!.gradingConfig = {
              generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
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
});
