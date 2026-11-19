import { describe, expect, it, vi } from "vitest";

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG,
} from "@/convex/activities";
import { generateTopic14PolynomialExtremaFromGraphOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-polynomial-extrema-submission-learner";
const ANSWER_IDS = ["relative_minimum_x", "relative_maximum_x", "absolute_minimum_x"] as const;
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
  "authority",
]);

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic14PolynomialExtremaFromGraphSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("AP Precalculus must export the Topic 1.4 extrema submission mutation.");
  }
  return mutation._handler as Handler;
}

function activityIdForMode(mode: Mode): string {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID;
}

function gradingConfigForMode(mode: Mode) {
  return mode === "guided_practice"
    ? PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG
    : PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG;
}

function answerStrings(seed: number): Record<AnswerId, string> {
  const answer = generateTopic14PolynomialExtremaFromGraphOutput(seed).expectedAnswer as Record<
    string,
    number
  >;
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

function createHarness(mode: Mode = "guided_practice", includeBothModes = false) {
  const makeActivity = (activityMode: Mode): Row => ({
    _id: `activities:polynomial-extrema-${activityMode}`,
    stableActivityId: activityIdForMode(activityMode),
    componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
    props: { presentationMode: activityMode },
    gradingConfig: gradingConfigForMode(activityMode),
    createdAt: 1,
    updatedAt: 1,
  });
  const rows: Record<string, Row[]> = {
    activities: includeBothModes
      ? [makeActivity("guided_practice"), makeActivity("independent_practice")]
      : [makeActivity(mode)],
    activity_submissions: [],
    learning_evidence: [],
  };

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
            const matches = (rows[tableName] ?? []).filter((row) =>
              [...conditions].every(([field, value]) => row[field] === value),
            );
            if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
            return matches[0] ?? null;
          },
          first: async () => {
            const matches = (rows[tableName] ?? []).filter((row) =>
              [...conditions].every(([field, value]) => row[field] === value),
            );
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
  else if (value && typeof value === "object")
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectObjectKeys(nested, keys);
    });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectObjectKeys(value).filter((key) => BANNED_AUTHORITY_KEYS.has(key))).toEqual([]);
}

async function expectRejected(
  handler: Handler,
  harness: ReturnType<typeof createHarness>,
  input: Parameters<Handler>[1],
  message?: string,
): Promise<void> {
  if (message) await expect(handler(harness.ctx, input)).rejects.toThrow(message);
  else await expect(handler(harness.ctx, input)).rejects.toThrow();
  expect(harness.rows.activity_submissions).toHaveLength(0);
  expect(harness.rows.learning_evidence).toHaveLength(0);
}

describe("Topic 1.4 polynomial extrema submission", () => {
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
      idempotencyKey: `extrema-${mode}-correct`,
      submissionData: makeEnvelope(mode, answers),
    });
    const stored = harness.rows.activity_submissions[0]!;
    expect(result).toEqual({
      submissionId: stored._id,
      score: 3,
      maxScore: 3,
      attemptOrdinal: 1,
      feedback: "3/3 extrema responses matched the server rubric.",
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
      activityId: `activities:polynomial-extrema-${mode}`,
      stableActivityId: harness.activityId,
      createIdempotencyKey: `extrema-${mode}-correct`,
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      feedback: "3/3 extrema responses matched the server rubric.",
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
    expectNoAuthority(stored.submissionData);
  });

  it("preserves malformed numeric strings and gives partial credit", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answers = answerStrings(1);
    const malformedAnswers = { ...answers, relative_maximum_x: "not-a-number" };
    const result = await handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: "extrema-partial",
      submissionData: makeEnvelope("guided_practice", malformedAnswers),
    });
    expect(result).toMatchObject({ score: 2, maxScore: 3 });
    const parts = (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>)
      .parts;
    expect((parts as Array<Record<string, unknown>>)[1]).toEqual({
      partId: "relative_maximum_x",
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
      (answers: Answers) => ({
        answers: {
          relative_minimum_x: answers.relative_minimum_x,
          relative_maximum_x: answers.relative_maximum_x,
        },
      }),
    ],
    ["extra answer", (answers: Answers) => ({ answers: { ...answers, score: "3" } })],
    [
      "wrong part",
      (answers: Answers) => ({
        parts: [
          { partId: "wrong", rawAnswer: answers.relative_minimum_x },
          ...ANSWER_IDS.slice(1).map((partId) => ({ partId, rawAnswer: answers[partId] })),
        ],
      }),
    ],
    [
      "reordered parts",
      (answers: Answers) => ({
        parts: [...ANSWER_IDS].reverse().map((partId) => ({ partId, rawAnswer: answers[partId] })),
      }),
    ],
    [
      "duplicate part",
      (answers: Answers) => ({
        parts: [
          { partId: "relative_minimum_x", rawAnswer: answers.relative_minimum_x },
          { partId: "relative_minimum_x", rawAnswer: answers.relative_minimum_x },
          { partId: "absolute_minimum_x", rawAnswer: answers.absolute_minimum_x },
        ],
      }),
    ],
    [
      "mismatched part",
      (answers: Answers) => ({
        parts: [
          { partId: "relative_minimum_x", rawAnswer: "wrong" },
          ...ANSWER_IDS.slice(1).map((partId) => ({ partId, rawAnswer: answers[partId] })),
        ],
      }),
    ],
    [
      "extra part field",
      (answers: Answers) => ({
        parts: ANSWER_IDS.map((partId, index) =>
          index === 0
            ? { partId, rawAnswer: answers[partId], score: 1 }
            : { partId, rawAnswer: answers[partId] },
        ),
      }),
    ],
    ["extra outer field", () => ({ extra: true })],
  ] as const)("rejects %s before persistence", async (_label, override) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answers = answerStrings(1);
    await expectRejected(handler, harness, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `extrema-raw-${_label.replaceAll(" ", "-")}`,
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
      PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
      (_answers: Answers) => makeEnvelope("independent_practice", answerStrings(2)),
    ],
    [
      "blank key",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers),
    ],
    [
      "zero attempt",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers, { attemptNumber: 0 }),
    ],
    [
      "fractional attempt",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers, { attemptNumber: 1.5 }),
    ],
    [
      "invalid timestamp",
      PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
      (answers: Answers) => makeEnvelope("guided_practice", answers, { submittedAt: "not-a-date" }),
    ],
  ] as const)("rejects %s before persistence", async (_label, activityId, makeSubmission) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expectRejected(handler, harness, {
      userId: LEARNER_ID,
      activityId,
      idempotencyKey:
        _label === "blank key" ? " " : `extrema-invalid-${_label.replaceAll(" ", "-")}`,
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
          generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
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
      idempotencyKey: `extrema-provisioning-${_label.replaceAll(" ", "-")}`,
      submissionData: makeEnvelope("guided_practice", answerStrings(1)),
    });
  });

  it("replays exact semantic submissions, rejects changed or cross-mode requests, and increments new attempts", async () => {
    const handler = await loadHandler();
    const harness = createHarness("guided_practice", true);
    const firstInput = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: "extrema-first",
      submissionData: makeEnvelope("guided_practice", answerStrings(1)),
    };
    const first = await handler(harness.ctx, firstInput);
    const replay = await handler(harness.ctx, {
      ...firstInput,
      submissionData: makeEnvelope("guided_practice", answerStrings(1), {
        attemptNumber: 777,
        submittedAt: "2026-08-20T11:00:00.000Z",
      }),
    });
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        ...firstInput,
        submissionData: makeEnvelope("guided_practice", {
          ...answerStrings(1),
          relative_minimum_x: "0",
        }),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
        idempotencyKey: "extrema-first",
        submissionData: makeEnvelope("independent_practice", answerStrings(2)),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...firstInput,
      idempotencyKey: "extrema-second",
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
    ...[
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
    ].map(
      (field) =>
        [
          `stored forbidden field ${field}`,
          (row: Row) => {
            row[field] = true;
          },
        ] as const,
    ),
    [
      "extra envelope field",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).extra = true;
      },
    ],
    [
      "missing envelope field",
      (row: Row) => {
        delete (row.submissionData as Record<string, unknown>).status;
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
      "stored part id/order",
      (row: Row) => {
        const parts = (row.submissionData as Record<string, unknown>).parts as Array<
          Record<string, unknown>
        >;
        parts[0]!.partId = "absolute_minimum_x";
      },
    ],
    [
      "stored part correctness",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.isCorrect = false;
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
      "stored part max score",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.maxScore = 2;
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
      "stored part order",
      (row: Row) => {
        const data = row.submissionData as Record<string, unknown>;
        data.parts = [...(data.parts as Array<Record<string, unknown>>)].reverse();
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
        row.score = 2;
      },
    ],
    [
      "stored max score",
      (row: Row) => {
        row.maxScore = 2;
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
      "stored submitted time invalid",
      (row: Row) => {
        row.submittedAt = Number.NaN;
      },
    ],
    [
      "stored submitted time mismatch",
      (row: Row) => {
        row.submittedAt = 1;
      },
    ],
    [
      "stored graded time invalid",
      (row: Row) => {
        row.gradedAt = Number.NaN;
      },
    ],
    [
      "stored graded time mismatch",
      (row: Row) => {
        row.gradedAt = 1;
      },
    ],
    [
      "stored created time invalid",
      (row: Row) => {
        row.createdAt = Number.NaN;
      },
    ],
    [
      "stored created time mismatch",
      (row: Row) => {
        row.createdAt = 1;
      },
    ],
    [
      "stored updated time invalid",
      (row: Row) => {
        row.updatedAt = Number.NaN;
      },
    ],
    [
      "stored updated time mismatch",
      (row: Row) => {
        row.updatedAt = 1;
      },
    ],
  ] as const)("rejects %s during semantic replay validation", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `extrema-corrupt-${_label.replaceAll(" ", "-")}`,
      submissionData: makeEnvelope("guided_practice", answerStrings(1)),
    };
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
