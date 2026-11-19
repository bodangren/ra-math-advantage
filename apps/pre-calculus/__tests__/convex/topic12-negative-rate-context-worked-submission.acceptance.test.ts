import { describe, expect, it, vi } from "vitest";

import {
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
} from "@/convex/activities";
import type { MutationCtx } from "@/convex/_generated/server";
import { generateTopic12NegativeRateContextChoiceOutput } from "@math-platform/math-content/knowledge-space";
import { generateTopic12PointwiseLeastRateChoice } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-negative-rate-worked-learner";
const ACTIVITY_DOCUMENT_ID = "activities:negative-rate-context-worked";
const POINTWISE_ACTIVITY_DOCUMENT_ID = "activities:pointwise-least-rate-worked";
const CLIENT_SUBMITTED_AT = "2026-08-19T10:00:00.000Z";

type Row = Record<string, unknown> & { _id: string };
type Handler = (
  ctx: MutationCtx,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: Record<string, unknown>;
  },
) => Promise<{
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
}>;

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic12NegativeRateContextWorkedSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("AP Precalculus must export createTopic12NegativeRateContextWorkedSubmission.");
  }
  return mutation._handler as Handler;
}

async function loadPointwiseWorkedHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = importedModule.createTopic12PointwiseLeastRateWorkedSubmission as
    | {
        _handler?: unknown;
      }
    | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("AP Precalculus must export createTopic12PointwiseLeastRateWorkedSubmission.");
  }
  return mutation._handler as Handler;
}

function sourceAnswer() {
  return (
    generateTopic12NegativeRateContextChoiceOutput(0).expectedAnswer as {
      selectedOptionId: string;
    }
  ).selectedOptionId;
}

function makeEnvelope(
  selectedOptionId: unknown = sourceAnswer(),
  overrides: Record<string, unknown> = {},
) {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
    ...overrides,
  } satisfies Record<string, unknown>;
}

function makePointwiseEnvelope() {
  const selectedOptionId = generateTopic12PointwiseLeastRateChoice(0).correctOptionId;
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers: { selectedOptionId },
    parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      {
        _id: ACTIVITY_DOCUMENT_ID,
        stableActivityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
        componentKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
        props: { presentationMode: "worked_example" },
        gradingConfig: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG,
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
          unique: async () => select(tableName, conditions)[0] ?? null,
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
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;

  return { ctx, rows };
}

function makeInput(
  overrides: Partial<{
    activityId: string;
    idempotencyKey: string;
    submissionData: Record<string, unknown>;
  }> = {},
) {
  return {
    userId: LEARNER_ID,
    activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
    idempotencyKey: "negative-rate-worked-source-review",
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

describe("Topic 1.2 negative-rate context Worked submission", () => {
  it("stores the generated seed-0 B review as an ungraded server-owned submission", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const selectedOptionId = sourceAnswer();
    expect(selectedOptionId).toBe("B");

    const result = await handler(
      harness.ctx,
      makeInput({
        submissionData: makeEnvelope(selectedOptionId),
      }),
    );
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;

    expect(result).toMatchObject({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(stored).toMatchObject({
      _id: result.submissionId,
      userId: LEARNER_ID,
      activityId: ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
      createIdempotencyKey: "negative-rate-worked-source-review",
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      submissionData: {
        contractVersion: "practice.v1",
        activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: { selectedOptionId: "B" },
        parts: [{ partId: "selectedOptionId", rawAnswer: "B" }],
      },
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
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    [
      "an extra outer field",
      (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, score: 1 }),
    ],
    [
      "an extra answer field",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { ...(envelope.answers as Record<string, unknown>), correctAnswer: "B" },
      }),
    ],
    [
      "an extra part field",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        parts: [{ ...(envelope.parts[0] as Record<string, unknown>), isCorrect: true }],
      }),
    ],
    [
      "a mismatched raw part",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        parts: [{ partId: "selectedOptionId", rawAnswer: "A" }],
      }),
    ],
    [
      "an invalid option",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        answers: { selectedOptionId: "Z" },
        parts: [{ partId: "selectedOptionId", rawAnswer: "Z" }],
      }),
    ],
    [
      "an invalid attempt number",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        attemptNumber: 0,
      }),
    ],
    [
      "an invalid submitted timestamp",
      (envelope: ReturnType<typeof makeEnvelope>) => ({
        ...envelope,
        submittedAt: "not-a-date",
      }),
    ],
  ] as const)("rejects %s before persistence", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();

    await expect(
      handler(harness.ctx, makeInput({ submissionData: mutate(makeEnvelope()) })),
    ).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    [
      "a missing activity",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities = [];
      },
    ],
    [
      "a wrong component",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.componentKey = "graph-average-rate-choice";
      },
    ],
    [
      "a wrong presentation mode",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.props = { presentationMode: "guided_practice" };
      },
    ],
    [
      "a wrong generator key",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
          variantSeed: 0,
        };
      },
    ],
    [
      "an extra grading config key",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
          variantSeed: 0,
          extra: true,
        };
      },
    ],
    [
      "a wrong seed",
      (harness: ReturnType<typeof createHarness>) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
          variantSeed: 1,
        };
      },
    ],
  ] as const)("rejects %s before persistence", async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it("rejects a wrong activity ID, mode, or blank idempotency key", async () => {
    const handler = await loadHandler();
    const invalidInputs = [
      makeInput({
        activityId: "math.precalc.other.worked_example",
        submissionData: { ...makeEnvelope(), activityId: "math.precalc.other.worked_example" },
      }),
      makeInput({
        submissionData: { ...makeEnvelope(), mode: "guided_practice" },
      }),
      makeInput({ idempotencyKey: "  " }),
    ];

    for (const input of invalidInputs) {
      const harness = createHarness();
      await expect(handler(harness.ctx, input)).rejects.toThrow();
      expect(harness.rows.activity_submissions).toHaveLength(0);
    }
  });

  it("replays exactly, creates the next ordinal for a new key, and rejects changed answers", async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput();
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);

    expect(replay).toEqual(first);
    await expect(
      handler(
        harness.ctx,
        makeInput({
          submissionData: makeEnvelope("A"),
        }),
      ),
    ).rejects.toThrow("idempotency_conflict");
    const second = await handler(
      harness.ctx,
      makeInput({
        idempotencyKey: "negative-rate-worked-second-review",
      }),
    );

    expect(second).toMatchObject({ attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
  });

  it("rejects cross-activity reuse of the same key", async () => {
    const negativeHandler = await loadHandler();
    const pointwiseHandler = await loadPointwiseWorkedHandler();
    const harness = createHarness();
    harness.rows.activities.push({
      _id: POINTWISE_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      props: { presentationMode: "worked_example" },
      gradingConfig: {
        generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
        variantSeed: 0,
      },
      createdAt: 1,
      updatedAt: 1,
    });
    const idempotencyKey = "negative-rate-worked-cross-activity";

    await negativeHandler(harness.ctx, makeInput({ idempotencyKey }));
    await expect(
      pointwiseHandler(harness.ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
        idempotencyKey,
        submissionData: makePointwiseEnvelope(),
      }),
    ).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    [
      "a wrong activity document",
      (row: Row) => {
        row.activityId = "activities:wrong";
      },
    ],
    [
      "a wrong stable activity ID",
      (row: Row) => {
        row.stableActivityId = "math.precalc.other.worked_example";
      },
    ],
    [
      "an extra envelope field",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).extra = true;
      },
    ],
    [
      "a changed envelope identity",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).activityId =
          "math.precalc.other.worked_example";
      },
    ],
    [
      "a changed stored mode",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).mode = "guided_practice";
      },
    ],
    [
      "a changed stored status",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).status = "graded";
      },
    ],
    [
      "a changed stored attempt number",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).attemptNumber = 2;
      },
    ],
    [
      "a changed stored timestamp",
      (row: Row) => {
        (row.submissionData as Record<string, unknown>).submittedAt = "2026-08-19T10:01:00.000Z";
      },
    ],
    [
      "a changed stored answer",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).answers as Record<string, unknown>
        ).selectedOptionId = "A";
      },
    ],
    [
      "a changed stored raw part",
      (row: Row) => {
        (
          (row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>
        )[0]!.rawAnswer = "A";
      },
    ],
    [
      "a timestamp mismatch",
      (row: Row) => {
        row.submittedAt = 1;
      },
    ],
    [
      "an ordinal mismatch",
      (row: Row) => {
        row.attemptOrdinal = 0;
      },
    ],
    [
      "a stored mastery field",
      (row: Row) => {
        row.masteryContractVersion = "learning-evidence.v1";
      },
    ],
    [
      "a stored score field",
      (row: Row) => {
        row.score = 1;
      },
    ],
    [
      "a stored max score field",
      (row: Row) => {
        row.maxScore = 1;
      },
    ],
    [
      "a stored feedback field",
      (row: Row) => {
        row.feedback = "forged feedback";
      },
    ],
    [
      "a stored graded time",
      (row: Row) => {
        row.gradedAt = 1;
      },
    ],
  ] as const)("rejects replay with %s", async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput({ idempotencyKey: `negative-corrupt-${_label.replaceAll(" ", "-")}` });
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);

    await expect(handler(harness.ctx, input)).rejects.toThrow("idempotency_conflict");
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
