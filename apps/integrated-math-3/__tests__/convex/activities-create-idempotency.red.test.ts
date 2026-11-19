import { describe, expect, it } from "vitest";

import type { MutationCtx } from "@/convex/_generated/server";
import { createServerOwnedSubmissionHandler } from "@/convex/activities";
import { buildIm3PilotSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { IM3_PILOT_NODE } from "@/lib/practice/learning-evidence-pilot";

const LEARNER_ID = "profiles:im3-create-key-learner";
const ACTIVITY_ID = "activities:im3-create-key-pilot";

type Submission = Record<string, unknown> & { _id: string };
type ServerOwnedSubmissionHandler = (
  ctx: MutationCtx,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: {
      contractVersion: "practice.v1";
      activityId: string;
      mode: "independent_practice";
      status: "submitted";
      attemptNumber: number;
      submittedAt: string;
      answers: Record<string, unknown>;
      parts: Array<{ partId: string; rawAnswer: unknown }>;
    };
  },
) => Promise<{
  id: string;
  submissionId: string;
  score: number;
  maxScore: number;
}>;

const approvedPublication = {
  nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
};

const createHandler: ServerOwnedSubmissionHandler = async (ctx, args) => {
  const result = await createServerOwnedSubmissionHandler(ctx, args as never, approvedPublication);
  if (!("score" in result) || result.score === undefined || result.maxScore === undefined) {
    throw new Error("Expected a graded selected submission");
  }
  return { ...result, score: result.score, maxScore: result.maxScore };
};

const PILOT_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

function makeSubmission(
  tableValues = PILOT_POINTS,
  placedPoints = PILOT_POINTS,
  options: {
    answers?: Record<string, unknown>;
    parts?: Array<{ partId: string; rawAnswer: unknown }>;
  } = {},
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId: ACTIVITY_ID,
    mode: "independent_practice" as const,
    status: "submitted" as const,
    attemptNumber: 99,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: options.answers ?? {
      table_values: tableValues,
      placed_points: placedPoints,
    },
    parts: options.parts ?? [
      { partId: "table_values", rawAnswer: tableValues },
      { partId: "placed_points", rawAnswer: placedPoints },
    ],
  };
}

function createHarness() {
  const profile = {
    _id: LEARNER_ID,
    username: "learner",
    role: "student",
    organizationId: "org",
  };
  const credential = {
    _id: "auth_credentials:learner",
    profileId: LEARNER_ID,
    username: "learner",
    role: "student",
    organizationId: "org",
    isActive: true,
  };
  const activity = {
    _id: ACTIVITY_ID,
    ...buildIm3PilotSeedDocuments(ACTIVITY_ID as never, 0).activity,
    srsEligible: true,
    approval: { status: "approved" },
  };
  const submissions: Submission[] = [];
  const ctx = {
    db: {
      get: async (id: string) =>
        id === ACTIVITY_ID ? activity : id === LEARNER_ID ? profile : null,
      query: (tableName: string) => {
        if (tableName === "auth_credentials") {
          return {
            withIndex: (
              indexName: string,
              configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
            ) => {
              if (indexName !== "by_username") {
                throw new Error(`Unexpected credential index: ${indexName}`);
              }
              const conditions = new Map<string, unknown>();
              const index = {
                eq(field: string, value: unknown) {
                  conditions.set(field, value);
                  return index;
                },
              };
              configure(index);
              const matches = [...conditions].every(
                ([field, value]) => credential[field as keyof typeof credential] === value,
              );
              return { unique: async () => (matches ? credential : null) };
            },
          };
        }
        if (tableName !== "activity_submissions") {
          throw new Error(`Unexpected table: ${tableName}`);
        }
        return {
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
            const selected = () =>
              submissions.filter((submission) =>
                [...conditions].every(([field, value]) => submission[field] === value),
              );
            if (indexName === "by_user_activity_idempotency_key") {
              return { unique: async () => selected()[0] ?? null };
            }
            if (indexName === "by_user_activity_attempt_ordinal") {
              return {
                order: () => ({ first: async () => selected().at(-1) ?? null }),
              };
            }
            throw new Error(`Unexpected index: ${indexName}`);
          },
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        if (tableName !== "activity_submissions") {
          throw new Error(`Unexpected write table: ${tableName}`);
        }
        const id = `activity_submissions:${submissions.length + 1}`;
        submissions.push({ _id: id, ...document });
        return id;
      },
    },
    scheduler: { runAfter: async () => undefined },
  } as unknown as MutationCtx;

  return { ctx, submissions };
}

function createInput(idempotencyKey: string, submissionData = makeSubmission()) {
  return {
    userId: LEARNER_ID,
    activityId: ACTIVITY_ID,
    idempotencyKey,
    submissionData,
  };
}

describe("IM3 server-owned create idempotency authority", () => {
  it("rejects an approved database activity while the canonical graph records are draft", async () => {
    const { ctx, submissions } = createHarness();

    await expect(
      createServerOwnedSubmissionHandler(ctx as never, createInput("draft-catalog") as never),
    ).rejects.toThrow("approved server-owned create mapping");
    expect(submissions).toEqual([]);
  });

  it.each(["", "   "])(
    "rejects an empty or whitespace-only create idempotency key (%j)",
    async (idempotencyKey) => {
      const { ctx, submissions } = createHarness();

      await expect(createHandler(ctx, createInput(idempotencyKey))).rejects.toThrow(/idempotency/i);
      expect(submissions).toEqual([]);
    },
  );

  it("creates a separate server attempt for the same canonical payload under a different key", async () => {
    const { ctx, submissions } = createHarness();
    const payload = makeSubmission();

    const first = await createHandler(ctx, createInput("im3-create-key-one", payload));
    const second = await createHandler(ctx, createInput("im3-create-key-two", payload));

    expect(second.submissionId).not.toBe(first.submissionId);
    expect(submissions).toHaveLength(2);
    expect(submissions.map((submission) => submission.attemptOrdinal)).toEqual([1, 2]);
  });

  it("replays the original opaque ID only for the same learner, activity, key, and canonical payload", async () => {
    const { ctx, submissions } = createHarness();
    const input = createInput("im3-create-replay-key");

    const first = await createHandler(ctx, input);
    const replay = await createHandler(ctx, input);

    expect(replay).toEqual(first);
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: "im3-create-replay-key",
      attemptOrdinal: 1,
      score: 2,
      maxScore: 2,
      masteryContractVersion: "learning-evidence.v1",
      submissionData: {
        contractVersion: "practice.v1",
        activityId: ACTIVITY_ID,
        mode: "independent_practice",
        status: "graded",
        attemptNumber: 1,
        answers: {
          table_values: PILOT_POINTS,
          placed_points: PILOT_POINTS,
        },
        parts: [
          {
            partId: "table_values",
            rawAnswer: PILOT_POINTS,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "placed_points",
            rawAnswer: PILOT_POINTS,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
      },
    });
  });

  it("rejects a different canonical payload that reuses the same learner, activity, and key", async () => {
    const { ctx, submissions } = createHarness();
    await createHandler(ctx, createInput("im3-create-conflict-key"));

    await expect(
      createHandler(
        ctx,
        createInput(
          "im3-create-conflict-key",
          makeSubmission(
            PILOT_POINTS.map((point, index) =>
              index === 0 ? { ...point, y: point.y + 1 } : point,
            ),
          ),
        ),
      ),
    ).rejects.toThrow(/^idempotency_conflict$/);
    expect(submissions).toHaveLength(1);
  });

  it.each([
    [
      "wrong answer keys",
      makeSubmission(PILOT_POINTS, PILOT_POINTS, {
        answers: { table_values: PILOT_POINTS, placedPoints: PILOT_POINTS },
      }),
    ],
    [
      "duplicate part IDs",
      makeSubmission(PILOT_POINTS, PILOT_POINTS, {
        parts: [
          { partId: "table_values", rawAnswer: PILOT_POINTS },
          { partId: "table_values", rawAnswer: PILOT_POINTS },
          { partId: "placed_points", rawAnswer: PILOT_POINTS },
        ],
      }),
    ],
    [
      "missing part ID",
      makeSubmission(PILOT_POINTS, PILOT_POINTS, {
        parts: [{ partId: "table_values", rawAnswer: PILOT_POINTS }],
      }),
    ],
    [
      "extra part ID",
      makeSubmission(PILOT_POINTS, PILOT_POINTS, {
        parts: [
          { partId: "table_values", rawAnswer: PILOT_POINTS },
          { partId: "placed_points", rawAnswer: PILOT_POINTS },
          { partId: "unexpected", rawAnswer: PILOT_POINTS },
        ],
      }),
    ],
    [
      "a raw answer mismatch",
      makeSubmission(PILOT_POINTS, PILOT_POINTS, {
        parts: [
          { partId: "table_values", rawAnswer: [] },
          { partId: "placed_points", rawAnswer: PILOT_POINTS },
        ],
      }),
    ],
  ])("rejects %s before storage", async (_label, submissionData) => {
    const { ctx, submissions } = createHarness();

    await expect(
      createHandler(ctx, createInput("im3-invalid-shape-key", submissionData)),
    ).rejects.toThrow(/IM3 mastery submission/);
    expect(submissions).toEqual([]);
  });
});
