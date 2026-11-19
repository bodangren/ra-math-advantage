import { afterEach, describe, expect, it, vi } from "vitest";

import { generateTopic16EquationEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";
import type { MutationCtx } from "@/convex/_generated/server";
import { gradeTopic16EquationEndBehavior } from "@/lib/practice/topic16-equation-end-behavior";
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
} from "@/convex/activities";
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const USER_ID = "profiles:topic16-equation-end-behavior-learner";
const GUIDED_ACTIVITY_DOCUMENT_ID = "activities:topic16-equation-end-behavior-guided";
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = "activities:topic16-equation-end-behavior-independent";
const CLIENT_SUBMITTED_AT = "2026-08-30T00:00:00.000Z";
const SERVER_NOW = Date.parse("2026-08-30T12:00:00.000Z");
const SERVER_SUBMITTED_AT = "2026-08-30T12:00:00.000Z";
const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID =
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;
const PART_IDS = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
] as const;
type PartId = (typeof PART_IDS)[number];
type Answers = Record<PartId, unknown>;
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };
type Mode = "guided_practice" | "independent_practice";
type Input = {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
};

function sourceAnswers(seed: number): Answers {
  return generateTopic16EquationEndBehaviorOutput(seed).expectedAnswer as Answers;
}

function makeEnvelope(
  activityId: string,
  mode: Mode,
  answers: Answers,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber: 17,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

function makeInput(
  activityId: string = GUIDED_ACTIVITY_ID,
  mode: Mode = "guided_practice",
  answers = sourceAnswers(mode === "guided_practice" ? 1 : 2),
  overrides: Partial<Input> = {},
): Input {
  return {
    userId: USER_ID,
    activityId,
    idempotencyKey: `topic16-equation-end-behavior:${mode}`,
    submissionData: makeEnvelope(activityId, mode, answers),
    ...overrides,
  };
}

function withEnvelope(input: Input, mutate: (data: SubmissionData) => void): Input {
  const submissionData = { ...input.submissionData };
  mutate(submissionData);
  return { ...input, submissionData };
}

function withAnswers(input: Input, answers: Answers): Input {
  return withEnvelope(input, (data) => {
    data.answers = answers;
    data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] }));
  });
}

function withParts(input: Input, mutate: (parts: Array<Record<string, unknown>>) => void): Input {
  return withEnvelope(input, (data) => {
    const parts = [...(data.parts as Array<Record<string, unknown>>)].map((part) => ({ ...part }));
    mutate(parts);
    data.parts = parts;
  });
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
    componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
    props: { presentationMode: mode },
    gradingConfig,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      activityRow(GUIDED_ACTIVITY_ID, GUIDED_ACTIVITY_DOCUMENT_ID, "guided_practice", {
        ...PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
      }),
      activityRow(
        INDEPENDENT_ACTIVITY_ID,
        INDEPENDENT_ACTIVITY_DOCUMENT_ID,
        "independent_practice",
        { ...PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG },
      ),
    ],
    activity_submissions: [],
    learning_evidence: [],
  };
  const indexCalls: Array<{
    tableName: string;
    indexName: string;
    conditions: ReadonlyMap<string, unknown>;
  }> = [];
  const inserts: Array<{ tableName: string; document: Row }> = [];
  const select = (tableName: string, conditions: ReadonlyMap<string, unknown>) =>
    (rows[tableName] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );

  const db = {
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
          if (orderDirection === "desc") {
            matches.sort(
              (left, right) => Number(right.attemptOrdinal) - Number(left.attemptOrdinal),
            );
          }
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
      const row = { _id: id, ...document };
      tableRows.push(row);
      inserts.push({ tableName, document: row });
      return id;
    },
  };

  return { ctx: { db } as unknown as MutationCtx, indexCalls, inserts, rows };
}

type Harness = ReturnType<typeof createHarness>;

async function loadHandler() {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic16EquationEndBehaviorSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error(
      "AP Precalculus must export the Topic 1.6 equation end behavior submission mutation.",
    );
  }
  return mutation._handler as (
    ctx: MutationCtx,
    args: Input,
  ) => Promise<{
    submissionId: string;
    score: number;
    maxScore: number;
    attemptOrdinal: number;
    feedback: string;
  }>;
}

function expectNoWrites(harness: Harness, submissionCount = 0): void {
  expect(harness.rows.activity_submissions).toHaveLength(submissionCount);
  expect(harness.rows.learning_evidence).toHaveLength(0);
}

function flipOneAnswer(answers: Answers): Answers {
  return { ...answers, a_leftEnd: answers.a_leftEnd === "up" ? "down" : "up" };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Topic 1.6 equation end behavior first-write submissions", () => {
  it.each([
    [GUIDED_ACTIVITY_ID, "guided_practice", 1, GUIDED_ACTIVITY_DOCUMENT_ID],
    [INDEPENDENT_ACTIVITY_ID, "independent_practice", 2, INDEPENDENT_ACTIVITY_DOCUMENT_ID],
  ] as const)(
    "stores the exact graded %s submission",
    async (activityId, mode, seed, documentId) => {
      const handler = await loadHandler();
      const harness = createHarness();
      vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
      const answers = sourceAnswers(seed);
      const input = makeInput(activityId, mode, answers, { idempotencyKey: `${mode}:source` });
      const graded = gradeTopic16EquationEndBehavior(seed, answers);
      const feedback = `${graded.score}/${graded.maxScore} polynomial equation end-behavior responses matched the server rubric.`;

      const result = await handler(harness.ctx, input);
      const stored = harness.rows.activity_submissions[0]!;
      const storedData = stored.submissionData as SubmissionData;
      expect(result).toEqual({
        submissionId: stored._id,
        score: 12,
        maxScore: 12,
        attemptOrdinal: 1,
        feedback,
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
      expect(Object.keys(storedData.answers as Record<string, unknown>).sort()).toEqual(
        [...PART_IDS].sort(),
      );
      expect(
        (storedData.parts as Array<Record<string, unknown>>).map((part) => part.partId),
      ).toEqual(PART_IDS);
      expect(
        (storedData.parts as Array<Record<string, unknown>>).every(
          (part) =>
            Object.keys(part).sort().join("|") === "isCorrect|maxScore|partId|rawAnswer|score",
        ),
      ).toBe(true);
      expect(stored).toEqual({
        _id: stored._id,
        userId: USER_ID,
        activityId: documentId,
        stableActivityId: activityId,
        submissionData: {
          contractVersion: "practice.v1",
          activityId,
          mode,
          status: "graded",
          attemptNumber: 1,
          submittedAt: SERVER_SUBMITTED_AT,
          answers,
          parts: graded.parts,
        },
        masteryContractVersion: "learning-evidence.v1",
        createIdempotencyKey: `${mode}:source`,
        attemptOrdinal: 1,
        score: 12,
        maxScore: 12,
        feedback,
        submittedAt: SERVER_NOW,
        gradedAt: SERVER_NOW,
        createdAt: SERVER_NOW,
        updatedAt: SERVER_NOW,
      });
      expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
      expectNoWrites(harness, 1);
      expect(
        harness.indexCalls.map(({ tableName, indexName }) => `${tableName}:${indexName}`),
      ).toEqual([
        "activities:by_stable_activity_id",
        "activity_submissions:by_user_and_create_idempotency_key",
        "activity_submissions:by_user_and_activity_and_attempt_ordinal",
      ]);
    },
  );

  it("stores a well-formed wrong choice as 11/12 partial credit", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    const answers = flipOneAnswer(sourceAnswers(1));

    const result = await handler(
      harness.ctx,
      makeInput(GUIDED_ACTIVITY_ID, "guided_practice", answers),
    );
    const stored = harness.rows.activity_submissions[0]!;
    const parts = (stored.submissionData as SubmissionData).parts as Array<Record<string, unknown>>;
    expect(result.score).toBe(11);
    expect(result.maxScore).toBe(12);
    expect(result.feedback).toBe(
      "11/12 polynomial equation end-behavior responses matched the server rubric.",
    );
    expect(parts.find((part) => part.partId === "a_leftEnd")).toEqual({
      partId: "a_leftEnd",
      rawAnswer: answers.a_leftEnd,
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
    expectNoWrites(harness, 1);
  });

  const malformedRequests: Array<[string, (input: Input) => Input]> = [
    ["wrong outer activity", (input) => ({ ...input, activityId: "other-activity" })],
    [
      "wrong envelope activity",
      (input) =>
        withEnvelope(input, (data) => {
          data.activityId = "other-activity";
        }),
    ],
    [
      "wrong mode",
      (input) =>
        withEnvelope(input, (data) => {
          data.mode = "independent_practice";
        }),
    ],
    [
      "wrong status",
      (input) =>
        withEnvelope(input, (data) => {
          data.status = "graded";
        }),
    ],
    ["blank idempotency key", (input) => ({ ...input, idempotencyKey: "   " })],
    [
      "zero client attempt",
      (input) =>
        withEnvelope(input, (data) => {
          data.attemptNumber = 0;
        }),
    ],
    [
      "fractional client attempt",
      (input) =>
        withEnvelope(input, (data) => {
          data.attemptNumber = 1.5;
        }),
    ],
    [
      "unsafe client attempt",
      (input) =>
        withEnvelope(input, (data) => {
          data.attemptNumber = Number.MAX_SAFE_INTEGER + 1;
        }),
    ],
    [
      "nonfinite client attempt",
      (input) =>
        withEnvelope(input, (data) => {
          data.attemptNumber = Number.NaN;
        }),
    ],
    [
      "invalid client time",
      (input) =>
        withEnvelope(input, (data) => {
          data.submittedAt = "not-a-time";
        }),
    ],
    [
      "extra envelope field",
      (input) =>
        withEnvelope(input, (data) => {
          data.extra = true;
        }),
    ],
    [
      "missing envelope field",
      (input) =>
        withEnvelope(input, (data) => {
          delete (data as Record<string, unknown>).status;
        }),
    ],
    [
      "extra answer field",
      (input) =>
        withEnvelope(input, (data) => {
          data.answers = { ...sourceAnswers(1), extra: "up" };
        }),
    ],
    [
      "missing answer field",
      (input) =>
        withEnvelope(input, (data) => {
          const answers = sourceAnswers(1);
          delete (answers as Record<string, unknown>).a_leftEnd;
          data.answers = answers;
        }),
    ],
    [
      "non-string answer",
      (input) => {
        const answers = { ...sourceAnswers(1), a_leftEnd: 1 };
        return withAnswers(input, answers);
      },
    ],
    ["invalid answer", (input) => withAnswers(input, { ...sourceAnswers(1), a_leftEnd: "UP" })],
    ["blank answer", (input) => withAnswers(input, { ...sourceAnswers(1), a_leftEnd: " " })],
    [
      "wrong part count",
      (input) =>
        withParts(input, (parts) => {
          parts.pop();
        }),
    ],
    [
      "missing part field",
      (input) =>
        withParts(input, (parts) => {
          delete parts[0]!.rawAnswer;
        }),
    ],
    [
      "extra part field",
      (input) =>
        withParts(input, (parts) => {
          parts[0]!.extra = true;
        }),
    ],
    [
      "reordered parts",
      (input) =>
        withParts(input, (parts) => {
          [parts[0], parts[1]] = [parts[1]!, parts[0]!];
        }),
    ],
    [
      "duplicate part",
      (input) =>
        withParts(input, (parts) => {
          parts[1] = { ...parts[0]! };
        }),
    ],
    [
      "mismatched raw part",
      (input) =>
        withParts(input, (parts) => {
          parts[0]!.rawAnswer = "down" === sourceAnswers(1).a_leftEnd ? "up" : "down";
        }),
    ],
    [
      "non-string raw part",
      (input) =>
        withParts(input, (parts) => {
          parts[0]!.rawAnswer = 1;
        }),
    ],
    [
      "missing parts",
      (input) =>
        withEnvelope(input, (data) => {
          delete (data as Record<string, unknown>).parts;
        }),
    ],
  ];

  it.each(malformedRequests)("rejects %s before a write", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);

    await expect(handler(harness.ctx, mutate(makeInput()))).rejects.toThrow();
    expectNoWrites(harness);
  });

  const activityFailures: Array<[string, (harness: Harness) => void]> = [
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
      "wrong component",
      (harness) => {
        harness.rows.activities[0]!.componentKey = "other-component";
      },
    ],
    [
      "missing props",
      (harness) => {
        delete harness.rows.activities[0]!.props;
      },
    ],
    [
      "wrong presentation mode",
      (harness) => {
        harness.rows.activities[0]!.props = { presentationMode: "independent_practice" };
      },
    ],
    [
      "missing grading config",
      (harness) => {
        delete harness.rows.activities[0]!.gradingConfig;
      },
    ],
    [
      "wrong generator key",
      (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: "other-generator",
          variantSeed: 1,
        };
      },
    ],
    [
      "wrong seed",
      (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
          variantSeed: 0,
        };
      },
    ],
    [
      "fractional seed",
      (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
          variantSeed: 1.5,
        };
      },
    ],
    [
      "extra config field",
      (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
          extra: true,
        };
      },
    ],
  ];

  it.each(activityFailures)("rejects %s with zero writes", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    corrupt(harness);

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow();
    expectNoWrites(harness);
  });

  it.each([
    [GUIDED_ACTIVITY_ID, "guided_practice", 1],
    [INDEPENDENT_ACTIVITY_ID, "independent_practice", 2],
  ] as const)(
    "replays an exact %s submission with advisory client fields ignored",
    async (activityId, mode, seed) => {
      const handler = await loadHandler();
      const harness = createHarness();
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(SERVER_NOW)
        .mockReturnValue(SERVER_NOW + 60_000);
      const input = makeInput(activityId, mode, sourceAnswers(seed), {
        idempotencyKey: "exact-replay-key",
      });
      const firstResult = await handler(harness.ctx, input);
      const before = JSON.stringify(harness.rows.activity_submissions);
      const replayInput = withEnvelope(input, (data) => {
        data.attemptNumber = 999;
        data.submittedAt = "2026-08-31T00:00:00.000Z";
      });

      const replayResult = await handler(harness.ctx, replayInput);
      expect(replayResult).toEqual(firstResult);
      expect(JSON.stringify(harness.rows.activity_submissions)).toBe(before);
      expect(harness.inserts).toHaveLength(1);
      expect(
        harness.indexCalls.filter(
          ({ indexName }) => indexName === "by_user_and_activity_and_attempt_ordinal",
        ),
      ).toHaveLength(1);
      expect(harness.indexCalls[1]?.conditions).toEqual(
        new Map([
          ["userId", USER_ID],
          ["createIdempotencyKey", "exact-replay-key"],
        ]),
      );
      expectNoWrites(harness, 1);
    },
  );

  it.each([
    [GUIDED_ACTIVITY_ID, "guided_practice", 1],
    [INDEPENDENT_ACTIVITY_ID, "independent_practice", 2],
  ] as const)(
    "rejects changed canonical answers for %s with idempotency_conflict",
    async (activityId, mode, seed) => {
      const handler = await loadHandler();
      const harness = createHarness();
      vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
      const input = makeInput(activityId, mode, sourceAnswers(seed), {
        idempotencyKey: "changed-answer-key",
      });
      await handler(harness.ctx, input);
      const before = JSON.stringify(harness.rows.activity_submissions);

      await expect(
        handler(harness.ctx, withAnswers(input, flipOneAnswer(sourceAnswers(seed)))),
      ).rejects.toThrow("idempotency_conflict");
      expect(JSON.stringify(harness.rows.activity_submissions)).toBe(before);
      expect(harness.inserts).toHaveLength(1);
      expect(
        harness.indexCalls.filter(
          ({ indexName }) => indexName === "by_user_and_activity_and_attempt_ordinal",
        ),
      ).toHaveLength(1);
      expectNoWrites(harness, 1);
    },
  );

  it("rejects a valid other activity and mode with the same key", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    const input = makeInput(GUIDED_ACTIVITY_ID, "guided_practice", sourceAnswers(1), {
      idempotencyKey: "cross-mode-key",
    });
    await handler(harness.ctx, input);
    const before = JSON.stringify(harness.rows.activity_submissions);

    await expect(
      handler(
        harness.ctx,
        makeInput(INDEPENDENT_ACTIVITY_ID, "independent_practice", sourceAnswers(2), {
          idempotencyKey: "cross-mode-key",
        }),
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(JSON.stringify(harness.rows.activity_submissions)).toBe(before);
    expect(harness.inserts).toHaveLength(1);
    expect(
      harness.indexCalls.filter(
        ({ indexName }) => indexName === "by_user_and_activity_and_attempt_ordinal",
      ),
    ).toHaveLength(1);
    expectNoWrites(harness, 1);
  });

  const corruptStoredRowCases: Array<[string, (row: Row) => void]> = [
    [
      "physical activity ID",
      (row) => {
        row.activityId = "activities:other";
      },
    ],
    [
      "stable activity ID",
      (row) => {
        row.stableActivityId = "other-activity";
      },
    ],
    [
      "wrong mastery contract",
      (row) => {
        row.masteryContractVersion = "learning-evidence.v0";
      },
    ],
    [
      "wrong score",
      (row) => {
        row.score = 11;
      },
    ],
    [
      "wrong max score",
      (row) => {
        row.maxScore = 11;
      },
    ],
    [
      "wrong feedback",
      (row) => {
        row.feedback = "wrong feedback";
      },
    ],
    [
      "wrong graded time",
      (row) => {
        row.gradedAt = SERVER_NOW + 1_000;
      },
    ],
    [
      "wrong created time",
      (row) => {
        row.createdAt = SERVER_NOW + 1_000;
      },
    ],
    [
      "wrong updated time",
      (row) => {
        row.updatedAt = SERVER_NOW + 1_000;
      },
    ],
    [
      "missing attempt ordinal",
      (row) => {
        delete (row as Record<string, unknown>).attemptOrdinal;
      },
    ],
    [
      "zero attempt ordinal",
      (row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "fractional attempt ordinal",
      (row) => {
        row.attemptOrdinal = 1.5;
      },
    ],
    [
      "unsafe attempt ordinal",
      (row) => {
        row.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "mismatched attempt ordinal",
      (row) => {
        row.attemptOrdinal = 2;
      },
    ],
    [
      "wrong row submitted time type",
      (row) => {
        (row as Record<string, unknown>).submittedAt = "not-a-time";
      },
    ],
    [
      "wrong graded time type",
      (row) => {
        (row as Record<string, unknown>).gradedAt = "not-a-time";
      },
    ],
    [
      "nonfinite graded time",
      (row) => {
        row.gradedAt = Number.NaN;
      },
    ],
    [
      "wrong created time type",
      (row) => {
        (row as Record<string, unknown>).createdAt = "not-a-time";
      },
    ],
    [
      "nonfinite created time",
      (row) => {
        row.createdAt = Number.NaN;
      },
    ],
    [
      "wrong updated time type",
      (row) => {
        (row as Record<string, unknown>).updatedAt = "not-a-time";
      },
    ],
    [
      "nonfinite updated time",
      (row) => {
        row.updatedAt = Number.NaN;
      },
    ],
    [
      "missing score",
      (row) => {
        delete (row as Record<string, unknown>).score;
      },
    ],
    [
      "missing max score",
      (row) => {
        delete (row as Record<string, unknown>).maxScore;
      },
    ],
    [
      "missing feedback",
      (row) => {
        delete (row as Record<string, unknown>).feedback;
      },
    ],
    [
      "missing mastery contract",
      (row) => {
        delete (row as Record<string, unknown>).masteryContractVersion;
      },
    ],
    [
      "extra forbidden answer field",
      (row) => {
        row.answer = "up";
      },
    ],
    [
      "extra forbidden answerKey field",
      (row) => {
        row.answerKey = "up";
      },
    ],
    [
      "extra forbidden correctAnswer field",
      (row) => {
        row.correctAnswer = "up";
      },
    ],
    [
      "extra forbidden correctAnswers field",
      (row) => {
        row.correctAnswers = ["up"];
      },
    ],
    [
      "extra forbidden expectedAnswer field",
      (row) => {
        row.expectedAnswer = "up";
      },
    ],
    [
      "extra forbidden grading field",
      (row) => {
        row.grading = {};
      },
    ],
    [
      "extra forbidden gradingMetadata field",
      (row) => {
        row.gradingMetadata = {};
      },
    ],
    [
      "extra forbidden normalizedAnswer field",
      (row) => {
        row.normalizedAnswer = "up";
      },
    ],
    [
      "extra forbidden solution field",
      (row) => {
        row.solution = "up";
      },
    ],
    [
      "extra forbidden solutionSteps field",
      (row) => {
        row.solutionSteps = [];
      },
    ],
    [
      "extra forbidden steps field",
      (row) => {
        row.steps = [];
      },
    ],
    [
      "extra forbidden finalAnswer field",
      (row) => {
        row.finalAnswer = "up";
      },
    ],
    [
      "extra forbidden authority field",
      (row) => {
        row.authority = "up";
      },
    ],
    [
      "extra forbidden isCorrect field",
      (row) => {
        row.isCorrect = true;
      },
    ],
    [
      "extra forbidden correctness field",
      (row) => {
        row.correctness = true;
      },
    ],
    [
      "extra envelope field",
      (row) => {
        (row.submissionData as SubmissionData).extra = true;
      },
    ],
    [
      "missing envelope field",
      (row) => {
        delete (row.submissionData as Record<string, unknown>).status;
      },
    ],
    [
      "wrong envelope contract",
      (row) => {
        (row.submissionData as SubmissionData).contractVersion = "practice.v0";
      },
    ],
    [
      "wrong envelope activity",
      (row) => {
        (row.submissionData as SubmissionData).activityId = "other-activity";
      },
    ],
    [
      "wrong envelope mode",
      (row) => {
        (row.submissionData as SubmissionData).mode = "independent_practice";
      },
    ],
    [
      "wrong envelope status",
      (row) => {
        (row.submissionData as SubmissionData).status = "submitted";
      },
    ],
    [
      "missing stored attempt number",
      (row) => {
        delete (row.submissionData as Record<string, unknown>).attemptNumber;
      },
    ],
    [
      "zero stored attempt number",
      (row) => {
        (row.submissionData as SubmissionData).attemptNumber = 0;
      },
    ],
    [
      "fractional stored attempt number",
      (row) => {
        (row.submissionData as SubmissionData).attemptNumber = 1.5;
      },
    ],
    [
      "unsafe stored attempt number",
      (row) => {
        (row.submissionData as SubmissionData).attemptNumber = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      "mismatched stored attempt number",
      (row) => {
        (row.submissionData as SubmissionData).attemptNumber = 2;
      },
    ],
    [
      "invalid inner time",
      (row) => {
        (row.submissionData as SubmissionData).submittedAt = "not-a-time";
      },
    ],
    [
      "noncanonical inner time",
      (row) => {
        (row.submissionData as SubmissionData).submittedAt = "2026-08-30T12:00:00Z";
      },
    ],
    [
      "mismatched inner time",
      (row) => {
        (row.submissionData as SubmissionData).submittedAt = "2026-08-30T12:00:01.000Z";
      },
    ],
    [
      "invalid row submitted time",
      (row) => {
        row.submittedAt = Number.NaN;
      },
    ],
    [
      "mismatched row submitted time",
      (row) => {
        row.submittedAt = SERVER_NOW + 1_000;
      },
    ],
    [
      "extra stored answer",
      (row) => {
        const data = row.submissionData as SubmissionData;
        data.answers = { ...sourceAnswers(1), extra: "up" };
      },
    ],
    [
      "missing stored answer",
      (row) => {
        const data = row.submissionData as SubmissionData;
        const answers = { ...sourceAnswers(1) };
        delete (answers as Record<string, unknown>).a_leftEnd;
        data.answers = answers;
      },
    ],
    [
      "wrong stored answer",
      (row) => {
        const data = row.submissionData as SubmissionData;
        data.answers = {
          ...sourceAnswers(1),
          a_leftEnd: sourceAnswers(1).a_leftEnd === "up" ? "down" : "up",
        };
      },
    ],
    [
      "noncanonical stored answer",
      (row) => {
        const data = row.submissionData as SubmissionData;
        data.answers = { ...sourceAnswers(1), a_leftEnd: "UP" };
      },
    ],
    [
      "missing stored parts",
      (row) => {
        delete (row.submissionData as Record<string, unknown>).parts;
      },
    ],
    [
      "wrong stored part count",
      (row) => {
        const data = row.submissionData as SubmissionData;
        data.parts = (data.parts as Array<Record<string, unknown>>).slice(0, 11);
      },
    ],
    [
      "reordered stored parts",
      (row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as Array<Record<string, unknown>>;
        [parts[0], parts[1]] = [parts[1]!, parts[0]!];
      },
    ],
    [
      "wrong stored part ID",
      (row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as Array<Record<string, unknown>>;
        parts[0]!.partId = "wrong_part";
      },
    ],
    [
      "missing stored part field",
      (row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as Array<Record<string, unknown>>;
        delete parts[0]!.rawAnswer;
      },
    ],
    [
      "duplicate stored part",
      (row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as Array<Record<string, unknown>>;
        parts[1] = { ...parts[0]! };
      },
    ],
    [
      "extra stored part field",
      (row) => {
        const data = row.submissionData as SubmissionData;
        (data.parts as Array<Record<string, unknown>>)[0]!.extra = true;
      },
    ],
    [
      "mismatched stored raw answer",
      (row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as Array<Record<string, unknown>>;
        parts[0]!.rawAnswer = parts[0]!.rawAnswer === "up" ? "down" : "up";
      },
    ],
    [
      "noncanonical stored part raw answer",
      (row) => {
        const data = row.submissionData as SubmissionData;
        const parts = data.parts as Array<Record<string, unknown>>;
        parts[0]!.rawAnswer = "UP";
      },
    ],
    [
      "wrong stored part correctness",
      (row) => {
        const data = row.submissionData as SubmissionData;
        (data.parts as Array<Record<string, unknown>>)[0]!.isCorrect = false;
      },
    ],
    [
      "wrong stored part score",
      (row) => {
        const data = row.submissionData as SubmissionData;
        (data.parts as Array<Record<string, unknown>>)[0]!.score = 0;
      },
    ],
    [
      "wrong stored part max score",
      (row) => {
        const data = row.submissionData as SubmissionData;
        (data.parts as Array<Record<string, unknown>>)[0]!.maxScore = 2;
      },
    ],
  ];

  it.each(corruptStoredRowCases)(
    "rejects replay with %s stored corruption",
    async (_label, corrupt) => {
      const handler = await loadHandler();
      const harness = createHarness();
      vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
      const input = makeInput(GUIDED_ACTIVITY_ID, "guided_practice", sourceAnswers(1), {
        idempotencyKey: "corrupt-replay-key",
      });
      await handler(harness.ctx, input);
      corrupt(harness.rows.activity_submissions[0]!);
      const before = JSON.stringify(harness.rows.activity_submissions);

      await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
      expect(JSON.stringify(harness.rows.activity_submissions)).toBe(before);
      expect(harness.inserts).toHaveLength(1);
      expect(
        harness.indexCalls.filter(
          ({ indexName }) => indexName === "by_user_and_activity_and_attempt_ordinal",
        ),
      ).toHaveLength(1);
      expectNoWrites(harness, 1);
    },
  );

  it("keeps the same key user-scoped for another first write", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    const input = makeInput(GUIDED_ACTIVITY_ID, "guided_practice", sourceAnswers(1), {
      idempotencyKey: "user-scoped-key",
    });
    await handler(harness.ctx, input);
    const otherUserResult = await handler(harness.ctx, {
      ...input,
      userId: `${USER_ID}-other`,
    });
    expect(otherUserResult).toMatchObject({ score: 12, maxScore: 12, attemptOrdinal: 1 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(harness.rows.activity_submissions[1]?.userId).toBe(`${USER_ID}-other`);
    expect(harness.rows.activity_submissions[1]?.createIdempotencyKey).toBe("user-scoped-key");
    expect(harness.inserts).toHaveLength(2);
    expectNoWrites(harness, 2);
  });

  const priorOrdinalCases: Array<[string, number | undefined]> = [
    ["missing prior ordinal", undefined],
    ["zero prior ordinal", 0],
    ["negative prior ordinal", -1],
    ["fractional prior ordinal", 1.5],
    ["nonfinite prior ordinal", Number.NaN],
    ["unsafe prior ordinal", Number.MAX_SAFE_INTEGER + 1],
    ["maximum prior ordinal", Number.MAX_SAFE_INTEGER],
  ];

  it.each(priorOrdinalCases)("rejects a %s before adding a row", async (_label, attemptOrdinal) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, "now").mockReturnValue(SERVER_NOW);
    const prior: Row = {
      _id: "activity_submissions:prior",
      userId: USER_ID,
      activityId: GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: GUIDED_ACTIVITY_ID,
      createIdempotencyKey: "prior-key",
      attemptOrdinal: attemptOrdinal as unknown as number,
      submittedAt: SERVER_NOW,
      createdAt: SERVER_NOW,
      updatedAt: SERVER_NOW,
      submissionData: {},
    };
    if (attemptOrdinal === undefined) delete (prior as Record<string, unknown>).attemptOrdinal;
    harness.rows.activity_submissions.push(prior);

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow();
    expectNoWrites(harness, 1);
  });
});
