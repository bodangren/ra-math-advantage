import { describe, expect, it, vi } from "vitest";

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG,
} from "@/convex/activities";
import { generateTopic14PolynomialDegreeLeadingCoefficientOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-polynomial-submission-learner";
const ANSWER_IDS = [
  "a_degree",
  "a_leading_coefficient",
  "b_degree",
  "b_leading_coefficient",
  "c_degree",
  "c_leading_coefficient",
] as const;
type AnswerId = (typeof ANSWER_IDS)[number];
type Mode = "guided_practice" | "independent_practice";
type Answers = Record<AnswerId, unknown>;
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };
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

const BANNED_AUTHORITY_KEYS = new Set([
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "gradingMetadata",
  "solution",
  "solutionSteps",
  "steps",
]);

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic14PolynomialDegreeLeadingCoefficientSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("AP Precalculus must export the Topic 1.4 submission mutation.");
  }
  return mutation._handler as Handler;
}

function activityIdForMode(mode: Mode): string {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID;
}

function gradingConfigForMode(mode: Mode) {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG
    : PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG;
}

function answerStrings(seed: number): Record<AnswerId, string> {
  const answer = generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed)
    .expectedAnswer as Record<string, number>;
  return Object.fromEntries(ANSWER_IDS.map((id) => [id, String(answer[id])])) as Record<
    AnswerId,
    string
  >;
}

function makeEnvelope(
  mode: Mode,
  answers: Answers,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId: activityIdForMode(mode),
    mode,
    status: "submitted",
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers,
    parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

function createHarness(mode: Mode = "guided_practice", includeOtherMode = false) {
  const makeActivity = (activityMode: Mode): Row => ({
    _id: `activities:polynomial-${activityMode}`,
    stableActivityId: activityIdForMode(activityMode),
    componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
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
          unique: async () => {
            const matches = selectedRows(tableName, conditions);
            if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
            return matches[0] ?? null;
          },
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
        const tableRows = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${tableRows.length + 1}`;
        tableRows.push({ _id: id, ...document });
        return id;
      },
    },
  };

  return { ctx, rows, activityId: activityIdForMode(mode) };
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

async function expectRejected(
  handler: Handler,
  harness: ReturnType<typeof createHarness>,
  input: Parameters<Handler>[1],
): Promise<void> {
  await expect(handler(harness.ctx, input)).rejects.toThrow();
  expect(harness.rows.activity_submissions).toHaveLength(0);
}

describe("Topic 1.4 polynomial degree and leading coefficient submission", () => {
  it.each([
    ["guided_practice", 1],
    ["independent_practice", 2],
  ] as const)("stores a server-graded %s submission", async (mode, seed) => {
    const handler = await loadHandler();
    const harness = createHarness(mode);
    const answers = answerStrings(seed);
    const result = await handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `polynomial-${mode}-correct`,
      submissionData: makeEnvelope(mode, answers),
    });
    const stored = harness.rows.activity_submissions[0]!;
    expect(result).toEqual({
      submissionId: stored._id,
      score: 6,
      maxScore: 6,
      attemptOrdinal: 1,
      feedback: "6/6 degree and leading coefficient responses matched the server rubric.",
    });
    expect(Object.keys(result).sort()).toEqual([
      "attemptOrdinal",
      "feedback",
      "maxScore",
      "score",
      "submissionId",
    ]);
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
      activityId: `activities:polynomial-${mode}`,
      stableActivityId: harness.activityId,
      createIdempotencyKey: `polynomial-${mode}-correct`,
      attemptOrdinal: 1,
      score: 6,
      maxScore: 6,
      feedback: "6/6 degree and leading coefficient responses matched the server rubric.",
      masteryContractVersion: "learning-evidence.v1",
      submittedAt: expect.any(Number),
      gradedAt: expect.any(Number),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
    expect(stored.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: harness.activityId,
      mode,
      status: "graded",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers,
      parts: ANSWER_IDS.map((partId) => ({
        partId,
        rawAnswer: answers[partId],
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    });
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.attemptNumber).toBe(1);
    expect(storedData.submittedAt).not.toBe("2026-08-19T10:00:00.000Z");
    expect(stored.submittedAt).toBe(stored.gradedAt);
    expect(stored.submittedAt).toBe(stored.createdAt);
    expect(stored.submittedAt).toBe(stored.updatedAt);
    expect(harness.rows.learning_evidence).toHaveLength(0);
    expectNoAuthority(result);
    expectNoAuthority(stored);
  });

  it("preserves malformed numeric strings and gives partial credit", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answers = answerStrings(1);
    const malformedAnswers = { ...answers, b_leading_coefficient: "not-a-number" };
    const result = await handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: "polynomial-partial",
      submissionData: makeEnvelope("guided_practice", malformedAnswers),
    });
    expect(result).toMatchObject({ score: 5, maxScore: 6 });
    const parts = (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>)
      .parts;
    expect((parts as Array<Record<string, unknown>>)[3]).toEqual({
      partId: "b_leading_coefficient",
      rawAnswer: "not-a-number",
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    [
      "missing answer",
      (answers: Answers) => {
        const { c_degree: _missing, ...remainingAnswers } = answers;
        return { answers: remainingAnswers };
      },
    ],
    ["extra answer", (answers: Answers) => ({ answers: { ...answers, score: "6" } })],
    ["missing part", (_answers: Answers) => ({ parts: [] })],
    [
      "extra part",
      (answers: Answers) => ({
        parts: [
          ...ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
          { partId: "extra", rawAnswer: "1" },
        ],
      }),
    ],
    [
      "parts out of order",
      (answers: Answers) => ({
        parts: [
          { partId: "b_degree", rawAnswer: answers.b_degree },
          ...ANSWER_IDS.filter((partId) => partId !== "b_degree").map((partId) => ({
            partId,
            rawAnswer: answers[partId],
          })),
        ],
      }),
    ],
    [
      "duplicate part",
      (answers: Answers) => ({
        parts: [
          { partId: "a_degree", rawAnswer: answers.a_degree },
          { partId: "a_degree", rawAnswer: answers.a_degree },
          ...ANSWER_IDS.slice(2).map((partId) => ({ partId, rawAnswer: answers[partId] })),
        ],
      }),
    ],
    [
      "mismatched part",
      (answers: Answers) => ({
        parts: [
          { partId: "a_degree", rawAnswer: "wrong" },
          ...ANSWER_IDS.slice(1).map((partId) => ({ partId, rawAnswer: answers[partId] })),
        ],
      }),
    ],
    [
      "extra part field",
      (answers: Answers) => ({
        parts: [
          { partId: "a_degree", rawAnswer: answers.a_degree, score: 1 },
          ...ANSWER_IDS.slice(1).map((partId) => ({ partId, rawAnswer: answers[partId] })),
        ],
      }),
    ],
    ["extra outer field", (_answers: Answers) => ({ score: 6 })],
  ] as const)("rejects %s before persistence", async (_label, override) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answers = answerStrings(1);
    await expectRejected(handler, harness, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `polynomial-raw-${_label.replaceAll(" ", "-")}`,
      submissionData: makeEnvelope("guided_practice", answers, override(answers)),
    });
  });

  it.each([
    [
      "unknown activity",
      "math.precalc.skill.1.4.unknown.guided_practice",
      (answers: Answers) => makeEnvelope("guided_practice", answers),
    ],
    [
      "mode mismatch",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
      (_answers: Answers) => makeEnvelope("independent_practice", answerStrings(2)),
    ],
    [
      "blank key",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers),
    ],
    [
      "zero attempt",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers, { attemptNumber: 0 }),
    ],
    [
      "fractional attempt",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers, { attemptNumber: 1.5 }),
    ],
    [
      "invalid timestamp",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers, { submittedAt: "not-a-date" }),
    ],
  ] as const)("rejects %s before persistence", async (_label, activityId, makeSubmission) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expectRejected(handler, harness, {
      userId: LEARNER_ID,
      activityId,
      idempotencyKey:
        _label === "blank key" ? " " : `polynomial-invalid-${_label.replaceAll(" ", "-")}`,
      submissionData: makeSubmission(answerStrings(1)),
    });
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
          generatorKey: "topic14-other",
          variantSeed: 1,
        };
      },
    ],
    [
      "wrong seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
          variantSeed: 2,
        };
      },
    ],
    [
      "non-integer seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...(harness.rows.activities[0]!.gradingConfig as Record<string, unknown>),
          variantSeed: 1.5,
        };
      },
    ],
    [
      "extra grading key",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...(harness.rows.activities[0]!.gradingConfig as Record<string, unknown>),
          extra: true,
        };
      },
    ],
  ] as const)("rejects %s before persistence", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expectRejected(handler, harness, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `polynomial-provisioning-${_label.replaceAll(" ", "-")}`,
      submissionData: makeEnvelope("guided_practice", answerStrings(1)),
    });
  });

  it("replays exact submissions, rejects changed requests, and increments new attempts", async () => {
    const handler = await loadHandler();
    const harness = createHarness("guided_practice", true);
    const firstInput = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: "polynomial-first",
      submissionData: makeEnvelope("guided_practice", answerStrings(1)),
    };
    const first = await handler(harness.ctx, firstInput);
    expect(await handler(harness.ctx, firstInput)).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...firstInput,
        submissionData: makeEnvelope("guided_practice", {
          ...answerStrings(1),
          a_degree: "0",
        }),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId:
          PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
        idempotencyKey: "polynomial-first",
        submissionData: makeEnvelope("independent_practice", answerStrings(2)),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...firstInput,
      idempotencyKey: "polynomial-second",
    });
    expect(first.attemptOrdinal).toBe(1);
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
      "envelope contract version",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).contractVersion = "other";
      },
    ],
    [
      "envelope activity ID",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).activityId = "other";
      },
    ],
    [
      "envelope mode",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).mode = "independent_practice";
      },
    ],
    [
      "envelope status",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).status = "submitted";
      },
    ],
    [
      "envelope attempt number",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).attemptNumber = 2;
      },
    ],
    [
      "envelope submitted time",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).submittedAt = "2026-08-19T10:00:01.000Z";
      },
    ],
    ...ANSWER_IDS.map(
      (answerId) =>
        [
          `stored answer ${answerId}`,
          (row: Row) => {
            ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>)[
              answerId
            ] = "forged";
          },
        ] as const,
    ),
    ...ANSWER_IDS.map(
      (partId, index) =>
        [
          `stored part ${partId} raw answer`,
          (row: Row) => {
            (
              (row.submissionData as Record<string, unknown>).parts as Array<
                Record<string, unknown>
              >
            )[index]!.rawAnswer = "forged";
          },
        ] as const,
    ),
    [
      "stored part grade",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.score = 0;
      },
    ],
    [
      "stored part extra field",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.extra = true;
      },
    ],
    [
      "stored mastery contract",
      (row: Row) => {
        row.masteryContractVersion = "other";
      },
    ],
    [
      "stored score",
      (row: Row) => {
        row.score = 5;
      },
    ],
    [
      "stored max score",
      (row: Row) => {
        row.maxScore = 5;
      },
    ],
    [
      "stored feedback",
      (row: Row) => {
        row.feedback = "other";
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
      "stored graded time",
      (row: Row) => {
        row.gradedAt = 1;
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
  ] as const)("rejects %s during replay validation", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `polynomial-corrupt-${_label.replaceAll(" ", "-")}`,
      submissionData: makeEnvelope("guided_practice", answerStrings(1)),
    };
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
