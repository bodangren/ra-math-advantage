import { describe, expect, it } from "vitest";
import type { PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";

import type { MutationCtx } from "@/convex/_generated/server";
import { createServerOwnedSubmission, createServerOwnedSubmissionHandler } from "@/convex/activities";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from "@/lib/practice/learning-evidence-pilot";

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
      mode: "guided_practice" | "independent_practice";
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

const createHandler: ServerOwnedSubmissionHandler = (ctx, args) =>
  createServerOwnedSubmissionHandler(ctx, args as never, approvedPublication);

const PILOT_POINTS = [
  { x: -2, y: -5 },
  { x: -1, y: -2 },
  { x: 0, y: -1 },
  { x: 1, y: -2 },
  { x: 2, y: -5 },
];

function makeSubmission(
  tableValues = PILOT_POINTS,
  placedPoints = PILOT_POINTS,
  options: {
    answers?: Record<string, unknown>;
    parts?: PracticeSubmissionEnvelope["parts"];
    mode?: "guided_practice" | "independent_practice";
  } = {},
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId: ACTIVITY_ID,
    mode: options.mode ?? "independent_practice",
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
    _id: "credential",
    profileId: LEARNER_ID,
    username: "learner",
    role: "student",
    organizationId: "org",
    isActive: true,
  };
  const activity = {
    _id: ACTIVITY_ID,
    stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    masteryNodeId: IM3_PILOT_NODE,
    componentKey: "graphing-explorer",
    srsEligible: true,
    approval: { status: "approved" },
    props: {
      variant: "plot_from_equation",
      responseVariant: "table_graph",
      equation: "y = -x^2 - 1",
    },
    gradingConfig: {
      partIds: ["table_values", "placed_points"],
      rubric: [
        { partId: "table_values", points: 1 },
        { partId: "placed_points", points: 1 },
      ],
    },
  };
  const submissions: Submission[] = [];
  const ctx = {
    db: {
      get: async (id: string) =>
        id === ACTIVITY_ID ? activity : id === LEARNER_ID ? profile : null,
      query: (tableName: string) => {
        if (tableName === "auth_credentials")
          return {
            withIndex: (
              name: string,
              configure: (q: {
                eq: (field: string, value: unknown) => unknown;
              }) => unknown,
            ) => {
              expect(name).toBe("by_username");
              const conditions = new Map<string, unknown>();
              const q = {
                eq: (field: string, value: unknown) => {
                  conditions.set(field, value);
                  return q;
                },
              };
              configure(q);
              return {
                unique: async () =>
                  [...conditions].every(
                    ([field, value]) =>
                      (credential as Record<string, unknown>)[field] === value,
                  )
                    ? credential
                    : null,
              };
            },
          };
        if (tableName !== "activity_submissions")
          throw new Error(`Unexpected table: ${tableName}`);
        return {
          withIndex: (
            indexName: string,
            configure: (query: {
              eq(field: string, value: unknown): unknown;
            }) => unknown,
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
                [...conditions].every(
                  ([field, value]) => submission[field] === value,
                ),
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

  return { ctx, submissions, activity, profile, credential };
}

function createInput(
  idempotencyKey: string,
  submissionData = makeSubmission(),
) {
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
      createServerOwnedSubmissionHandler(
        ctx as never,
        createInput("draft-catalog") as never,
      ),
    ).rejects.toThrow("approved server-owned create mapping");
    expect(submissions).toEqual([]);
  });

  it.each(["", "   "])(
    "rejects an empty or whitespace-only create idempotency key (%j)",
    async (idempotencyKey) => {
      const { ctx, submissions } = createHarness();

      await expect(
        createHandler(ctx, createInput(idempotencyKey)),
      ).rejects.toThrow(/idempotency/i);
      expect(submissions).toEqual([]);
    },
  );

  it("creates a separate server attempt for the same canonical payload under a different key", async () => {
    const { ctx, submissions } = createHarness();
    const payload = makeSubmission();

    const first = await createHandler(
      ctx,
      createInput("im3-create-key-one", payload),
    );
    const second = await createHandler(
      ctx,
      createInput("im3-create-key-two", payload),
    );

    expect(second.submissionId).not.toBe(first.submissionId);
    expect(submissions).toHaveLength(2);
    expect(submissions.map((submission) => submission.attemptOrdinal)).toEqual([
      1, 2,
    ]);
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

  it("rejects a replay when the stored attempt ordinal is missing", async () => {
    const { ctx, submissions } = createHarness();
    const input = createInput("im3-incomplete-replay-key");

    await createHandler(ctx, input);
    delete submissions[0].attemptOrdinal;

    await expect(createHandler(ctx, input)).rejects.toThrow(
      /Stored IM3 .*submission is incomplete/,
    );
    expect(submissions).toHaveLength(1);
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
    ).rejects.toThrow(/Invalid selected IM3|canonical answer|canonical part|part rawAnswer must match/);
    expect(submissions).toEqual([]);
  });
  it.each([
    ["wrong node", { masteryNodeId: "math.im3.skill.other" }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["unapproved activity", { approval: { status: "unreviewed" } }],
  ])("rejects %s before storage", async (_name, change) => {
    const { ctx, submissions, activity } = createHarness();
    Object.assign(activity, change);
    await expect(
      createHandler(ctx, createInput("strict-identity")),
    ).rejects.toThrow(/approved server-owned create mapping/);
    expect(submissions).toEqual([]);
  });
  it("treats changed assistance telemetry as an idempotency conflict", async () => {
    const { ctx } = createHarness();
    const first = makeSubmission();
    first.parts[0] = { ...first.parts[0], hintsUsed: 1 };
    await createHandler(ctx, createInput("assistance-key", first));
    const changed = makeSubmission();
    changed.parts[0] = { ...changed.parts[0], hintsUsed: 2 };
    await expect(
      createHandler(ctx, createInput("assistance-key", changed)),
    ).rejects.toThrow("idempotency_conflict");
  });
});

describe("selected writer identity and replay boundaries", () => {
  it.each([
    ["disabled credential", { isActive: false }],
    ["credential role", { role: "teacher" }],
    ["credential username", { username: "another" }],
    ["credential organization", { organizationId: "another" }],
    ["credential profile", { profileId: "profiles:another" }],
  ])("rejects %s without storage", async (_name, change) => {
    const t = createHarness();
    Object.assign(t.credential, change);
    await expect(createHandler(t.ctx, createInput("identity"))).rejects.toThrow(
      "Inactive student identity",
    );
    expect(t.submissions).toEqual([]);
  });
  it("rejects a nonstudent profile", async () => {
    const t = createHarness();
    t.profile.role = "teacher";
    await expect(
      createHandler(t.ctx, createInput("profile-role")),
    ).rejects.toThrow("Inactive student identity");
    expect(t.submissions).toEqual([]);
  });
  it("rejects a missing profile", async () => {
    const t = createHarness();
    await expect(
      createHandler(t.ctx, {
        ...createInput("missing-profile"),
        userId: "profiles:missing",
      }),
    ).rejects.toThrow("Inactive student identity");
    expect(t.submissions).toEqual([]);
  });
  it("rejects a key over 80 characters", async () => {
    const t = createHarness();
    await expect(
      createHandler(t.ctx, createInput("a".repeat(81))),
    ).rejects.toThrow("Invalid idempotency key");
    expect(t.submissions).toEqual([]);
  });
  it("rejects a different contract version", async () => {
    const t = createHarness();
    const input = createInput("contract");
    Object.assign(input.submissionData, { contractVersion: "practice.v2" });
    await expect(createHandler(t.ctx, input)).rejects.toThrow(
      "Invalid practice contract",
    );
    expect(t.submissions).toEqual([]);
  });
  it("stores a correct Guided submission for the matching Guided activity", async () => {
    const t = createHarness();
    Object.assign(t.activity, {
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
    });
    const result = await createHandler(
      t.ctx,
      createInput(
        "guided",
        makeSubmission(PILOT_POINTS, PILOT_POINTS, { mode: "guided_practice" }),
      ),
    );
    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(t.submissions).toHaveLength(1);
  });
  it("rejects Independent mode for the Guided activity", async () => {
    const t = createHarness();
    Object.assign(t.activity, {
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
    });
    await expect(
      createHandler(t.ctx, createInput("guided-cross")),
    ).rejects.toThrow("approved server-owned create mapping");
    expect(t.submissions).toEqual([]);
  });
  it("rejects Guided mode for the Independent activity", async () => {
    const t = createHarness();
    const input = createInput("cross-mode");
    Object.assign(input.submissionData, { mode: "guided_practice" });
    await expect(createHandler(t.ctx, input)).rejects.toThrow(
      "approved server-owned create mapping",
    );
    expect(t.submissions).toEqual([]);
  });
  it("replays equivalent part order as one physical submission", async () => {
    const t = createHarness();
    const first = createInput("part-order");
    const saved = await createHandler(t.ctx, first);
    const retry = createInput("part-order");
    retry.submissionData.parts.reverse();
    expect(await createHandler(t.ctx, retry)).toEqual(saved);
    expect(t.submissions).toHaveLength(1);
  });
  it.each(["hintsUsed", "revealStepsSeen", "changedCount"])(
    "rejects changed %s on replay",
    async (field) => {
      const t = createHarness();
      await createHandler(t.ctx, createInput("assistance"));
      const retry = createInput("assistance");
      Object.assign(retry.submissionData.parts[0], { [field]: 1 });
      await expect(createHandler(t.ctx, retry)).rejects.toThrow(
        "idempotency_conflict",
      );
      expect(t.submissions).toHaveLength(1);
    },
  );
});


it("runs the registered writer boundary and rejects the real draft catalog", async () => {
  const t = createHarness();
  const registered = createServerOwnedSubmission as unknown as {
    _handler: (ctx: MutationCtx, args: unknown) => Promise<unknown>;
  };
  await expect(registered._handler(t.ctx, createInput("registered-draft"))).rejects.toThrow("approved server-owned create mapping");
  expect(t.submissions).toEqual([]);
});
