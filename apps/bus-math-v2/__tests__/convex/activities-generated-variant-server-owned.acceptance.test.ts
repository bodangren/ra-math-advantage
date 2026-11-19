import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/learning-evidence/bm2-pilot", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/learning-evidence/bm2-pilot")>()),
  isBm2PilotPublished: () => true,
  isBm2PilotSourcePublished: () => true,
}));

import {
  buildPracticeSubmissionEnvelope,
  type PracticeSubmissionEnvelope,
} from "@/lib/practice/contract";
import { accountingEquationFamily } from "@/lib/practice/engine/families/accounting-equation";
import {
  BM2_PILOT_PROBLEM_FAMILY_ID,
  BM2_PILOT_SOURCE_ACTIVITY_ID,
} from "@/lib/learning-evidence/bm2-pilot";

const LEARNER_ID = "profiles:bm2-generated-variant-student";
const SOURCE_ACTIVITY_DOCUMENT_ID = "activities:bm2-generated-variant-source-row";
const LONG_OPAQUE_KEY = `opaque-key-${"x".repeat(257)}`;

type Row = Record<string, unknown> & { _id: string };

type ServerOwnedSubmissionHandler = (
  ctx: unknown,
  args: {
    userId: string;
    activityId: string;
    submissionData: PracticeSubmissionEnvelope;
    idempotencyKey: string;
  },
) => Promise<{
  submissionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  attemptOrdinal: number;
}>;

async function loadHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createServerOwnedSubmission;
  if (
    (typeof mutation !== "object" && typeof mutation !== "function") ||
    mutation === null ||
    !("_handler" in mutation)
  ) {
    throw new Error(
      "BM2 must export internal createServerOwnedSubmission for generated accounting variants. " +
        `Available exports: ${Object.keys(importedModule).sort().join(", ") || "(none)"}.`,
    );
  }

  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error("BM2 createServerOwnedSubmission must expose a Convex mutation handler.");
  }
  return handler as ServerOwnedSubmissionHandler;
}

function makePilotSourceActivity(overrides: Partial<Row> = {}): Row {
  return {
    _id: SOURCE_ACTIVITY_DOCUMENT_ID,
    stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
    componentKey: "notebook-organizer",
    displayName: "The Notebook Organizer",
    description: "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'.",
    props: {},
    gradingConfig: {},
    ...overrides,
  };
}

function createHarness(options: { sourceActivities?: Row[] } = {}) {
  const rows: { activities: Row[]; activity_submissions: Row[] } = {
    activities: options.sourceActivities ?? [makePilotSourceActivity()],
    activity_submissions: [],
  };
  const indexCalls: Array<{
    tableName: string;
    indexName: string;
    conditions: Array<[string, unknown]>;
  }> = [];

  function selectedRows(
    tableName: keyof typeof rows,
    conditions: ReadonlyMap<string, unknown>,
  ): Row[] {
    return rows[tableName].filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );
  }

  const ctx = {
    db: {
      query: (tableName: string) => {
        if (tableName !== "activity_submissions" && tableName !== "activities") {
          throw new Error(`Unexpected table query: ${tableName}`);
        }
        const typedTableName = tableName as keyof typeof rows;

        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        let direction: "asc" | "desc" = "asc";
        const result = {
          unique: async () => {
            const matchingRows = selectedRows(typedTableName, conditions);
            if (typedTableName === "activities" && matchingRows.length > 1) {
              throw new Error("Expected one provisioned BM2 pilot source activity");
            }
            return matchingRows[0] ?? null;
          },
          first: async () => {
            const matchingRows = selectedRows(typedTableName, conditions);
            return direction === "desc" ? (matchingRows.at(-1) ?? null) : (matchingRows[0] ?? null);
          },
          order(nextDirection: "asc" | "desc") {
            direction = nextDirection;
            return result;
          },
        };

        return {
          withIndex: (indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            indexCalls.push({
              tableName,
              indexName,
              conditions: [...conditions],
            });
            return result;
          },
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        if (tableName !== "activity_submissions") {
          throw new Error(`Unexpected table insert: ${tableName}`);
        }
        if (document.activityId !== SOURCE_ACTIVITY_DOCUMENT_ID) {
          throw new Error("activity_submissions.activityId must be a real activities document ID");
        }
        const id = `${tableName}:${rows.activity_submissions.length + 1}`;
        rows.activity_submissions.push({ _id: id, ...document });
        return id;
      },
    },
  };

  return { ctx, rows, indexCalls };
}

function makeRawEnvelope(
  definition: ReturnType<typeof accountingEquationFamily.generate>,
  rawAnswer: number,
  options: {
    attemptNumber?: number;
    forgedScore?: number;
  } = {},
): PracticeSubmissionEnvelope {
  const hiddenTermId = definition.equation.hiddenTermId;
  return buildPracticeSubmissionEnvelope({
    activityId: definition.activityId,
    mode: "independent_practice",
    status: "submitted",
    attemptNumber: options.attemptNumber ?? 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { [hiddenTermId]: rawAnswer },
    parts: [
      {
        partId: hiddenTermId,
        rawAnswer,
        isCorrect: false,
        score: options.forgedScore ?? 99,
        maxScore: 99,
        misconceptionTags: ["client-forged-grade"],
      },
    ],
  });
}

describe("BM2 generated accounting server-owned submission", () => {
  it("accepts a long opaque key and stores the canonical grade, mode, source FK, and ordinal", async () => {
    const handler = await loadHandler();
    const { ctx, rows, indexCalls } = createHarness();
    const definition = accountingEquationFamily.generate(7, { mode: "independent_practice" });
    const hiddenTermId = definition.equation.hiddenTermId;
    const correctAnswer = definition.equation[hiddenTermId];

    const submissionData = makeRawEnvelope(definition, correctAnswer, {
      attemptNumber: 99,
      forgedScore: 99,
    });
    expect(submissionData).toMatchObject({
      mode: "independent_practice",
      status: "submitted",
      attemptNumber: 99,
      parts: [
        expect.objectContaining({
          isCorrect: false,
          score: 99,
          maxScore: 99,
        }),
      ],
    });

    const result = await handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData,
      idempotencyKey: LONG_OPAQUE_KEY,
    });

    expect(result).toStrictEqual({
      submissionId: expect.any(String),
      score: 1,
      maxScore: 1,
      feedback: "Correct equation balance.",
      attemptOrdinal: 1,
    });
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).toEqual(
      expect.objectContaining({
        _id: result.submissionId,
        userId: LEARNER_ID,
        activityId: SOURCE_ACTIVITY_DOCUMENT_ID,
        stableActivityId: definition.activityId,
        idempotencyKey: LONG_OPAQUE_KEY,
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        submissionData: expect.objectContaining({
          activityId: BM2_PILOT_PROBLEM_FAMILY_ID,
          mode: "independent_practice",
          status: "graded",
          attemptNumber: 1,
          answers: { [hiddenTermId]: correctAnswer },
          parts: [
            {
              partId: hiddenTermId,
              rawAnswer: correctAnswer,
              normalizedAnswer: String(correctAnswer),
              isCorrect: true,
              score: 1,
              maxScore: 1,
              misconceptionTags: [],
            },
          ],
        }),
      }),
    );
    expect(indexCalls).toContainEqual({
      tableName: "activities",
      indexName: "by_stable_activity_id",
      conditions: [["stableActivityId", BM2_PILOT_SOURCE_ACTIVITY_ID]],
    });
    expect(indexCalls).toContainEqual({
      tableName: "activity_submissions",
      indexName: "by_user_and_activity_and_attempt_ordinal",
      conditions: [
        ["userId", LEARNER_ID],
        ["activityId", SOURCE_ACTIVITY_DOCUMENT_ID],
      ],
    });
  });

  it("assigns a new server ordinal and a zero score for a new wrong raw answer", async () => {
    const handler = await loadHandler();
    const { ctx, rows, indexCalls } = createHarness();
    const definition = accountingEquationFamily.generate(7, { mode: "independent_practice" });
    const hiddenTermId = definition.equation.hiddenTermId;
    const correctAnswer = definition.equation[hiddenTermId];

    await handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData: makeRawEnvelope(definition, correctAnswer),
      idempotencyKey: "bm2-generated-direct-first",
    });
    const wrong = await handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData: makeRawEnvelope(definition, correctAnswer + 1),
      idempotencyKey: "bm2-generated-direct-wrong",
    });

    expect(wrong).toMatchObject({ score: 0, maxScore: 1, attemptOrdinal: 2 });
    expect(rows.activity_submissions).toHaveLength(2);
    expect(rows.activity_submissions[1]).toEqual(
      expect.objectContaining({
        stableActivityId: definition.activityId,
        score: 0,
        maxScore: 1,
        attemptOrdinal: 2,
        submissionData: expect.objectContaining({
          parts: [
            expect.objectContaining({
              partId: hiddenTermId,
              rawAnswer: correctAnswer + 1,
              isCorrect: false,
              score: 0,
              maxScore: 1,
            }),
          ],
        }),
      }),
    );
    expect(indexCalls.map((call) => call.indexName)).toEqual(
      expect.arrayContaining([
        "by_user_and_idempotency_key",
        "by_stable_activity_id",
        "by_user_and_activity_and_attempt_ordinal",
      ]),
    );
  });

  it("replays the same canonical request and rejects a same-key raw-answer conflict", async () => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();
    const definition = accountingEquationFamily.generate(7, { mode: "independent_practice" });
    const hiddenTermId = definition.equation.hiddenTermId;
    const correctAnswer = definition.equation[hiddenTermId];
    const idempotencyKey = "bm2-generated-direct-replay";

    const first = await handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData: makeRawEnvelope(definition, correctAnswer, {
        attemptNumber: 99,
        forgedScore: 99,
      }),
      idempotencyKey,
    });
    const replay = await handler(ctx, {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      // These browser-only fields change, but the canonical raw request does not.
      submissionData: makeRawEnvelope(definition, correctAnswer, {
        attemptNumber: 1,
        forgedScore: 0,
      }),
      idempotencyKey,
    });

    expect(replay).toStrictEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);

    await expect(
      handler(ctx, {
        userId: LEARNER_ID,
        activityId: definition.activityId,
        submissionData: makeRawEnvelope(definition, correctAnswer + 1),
        idempotencyKey,
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    ["no submitted parts", () => []],
    [
      "two submitted parts",
      (hiddenTermId: string, correctAnswer: number) => [
        {
          partId: hiddenTermId,
          rawAnswer: correctAnswer,
        },
        {
          partId: hiddenTermId,
          rawAnswer: correctAnswer,
        },
      ],
    ],
    [
      "an unknown submitted part",
      (...[, correctAnswer]: [string, number]) => [
        {
          partId: "unknown-hidden-term",
          rawAnswer: correctAnswer,
        },
      ],
    ],
    [
      "a part raw answer that disagrees with answers",
      (hiddenTermId: string, correctAnswer: number) => [
        {
          partId: hiddenTermId,
          rawAnswer: correctAnswer + 1,
        },
      ],
    ],
  ] as const)("rejects %s before generated grading or persistence", async (_label, makeParts) => {
    const handler = await loadHandler();
    const { ctx, rows } = createHarness();
    const definition = accountingEquationFamily.generate(7, { mode: "independent_practice" });
    const hiddenTermId = definition.equation.hiddenTermId;
    const correctAnswer = definition.equation[hiddenTermId];
    const submissionData = makeRawEnvelope(definition, correctAnswer);

    await expect(
      handler(ctx, {
        userId: LEARNER_ID,
        activityId: definition.activityId,
        submissionData: {
          ...submissionData,
          parts: makeParts(hiddenTermId, correctAnswer),
        },
        idempotencyKey: `bm2-generated-parts-${_label.replaceAll(" ", "-")}`,
      }),
    ).rejects.toThrow(/part|generated|answer/i);

    expect(rows.activity_submissions).toEqual([]);
  });

  it.each([
    ["a missing source document", []],
    [
      "duplicate source documents",
      [
        makePilotSourceActivity(),
        makePilotSourceActivity({ _id: "activities:bm2-generated-variant-source-duplicate" }),
      ],
    ],
    ["wrong source metadata", [makePilotSourceActivity({ componentKey: "untrusted-component" })]],
  ] as const)(
    "fails closed before insert when the BM2 pilot source provisioning has %s",
    async (_label, sourceActivities) => {
      const handler = await loadHandler();
      const { ctx, rows, indexCalls } = createHarness({ sourceActivities: [...sourceActivities] });
      const definition = accountingEquationFamily.generate(7, { mode: "independent_practice" });
      const hiddenTermId = definition.equation.hiddenTermId;

      await expect(
        handler(ctx, {
          userId: LEARNER_ID,
          activityId: definition.activityId,
          submissionData: makeRawEnvelope(definition, definition.equation[hiddenTermId]),
          idempotencyKey: `bm2-generated-source-provisioning-${_label.replaceAll(" ", "-")}`,
        }),
      ).rejects.toThrow(/source activity|provision|activities document|stable/i);

      expect(indexCalls).toContainEqual({
        tableName: "activities",
        indexName: "by_stable_activity_id",
        conditions: [["stableActivityId", BM2_PILOT_SOURCE_ACTIVITY_ID]],
      });
      expect(rows.activity_submissions).toEqual([]);
    },
  );
});
