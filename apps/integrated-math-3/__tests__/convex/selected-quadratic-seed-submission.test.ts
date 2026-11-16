import { describe, expect, it } from "vitest";
import { seedLesson1 } from "@/convex/seed/seed_lesson_1_1";
import { createServerOwnedSubmissionHandler } from "@/convex/activities";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from "@/lib/practice/learning-evidence-pilot";

const INDEPENDENT_POINTS = [
  { x: -2, y: -5 },
  { x: -1, y: -2 },
  { x: 0, y: -1 },
  { x: 1, y: -2 },
  { x: 2, y: -5 },
];
const GUIDED_POINTS = [
  { x: -2, y: 4 },
  { x: -1, y: 0 },
  { x: 0, y: -2 },
  { x: 1, y: -2 },
  { x: 2, y: 0 },
];
const publication = {
  nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
};

function memoryContext() {
  const rows: Record<string, Array<Record<string, any>>> = {};
  let nextId = 1;
  const table = (name: string) => (rows[name] ??= []);
  const db = {
    async get(id: string) {
      return (
        Object.values(rows)
          .flat()
          .find((row) => row._id === id) ?? null
      );
    },
    query(name: string) {
      return {
        withIndex(
          _index: string,
          configure: (query: {
            eq(field: string, value: unknown): unknown;
          }) => unknown,
        ) {
          const conditions = new Map<string, unknown>();
          const query = {
            eq(field: string, value: unknown) {
              conditions.set(field, value);
              return query;
            },
          };
          configure(query);
          const selected = () =>
            table(name).filter((row) =>
              [...conditions].every(([field, value]) => row[field] === value),
            );
          return {
            unique: async () => {
              const matches = selected();
              if (matches.length > 1) throw new Error("Non-unique test query");
              return matches[0] ?? null;
            },
            first: async () => selected()[0] ?? null,
            collect: async () => selected(),
            take: async (count: number) => selected().slice(0, count),
            order: () => ({ first: async () => selected().at(-1) ?? null }),
          };
        },
      };
    },
    async insert(name: string, document: Record<string, unknown>) {
      const id = `${name}:${nextId++}`;
      table(name).push({ _id: id, ...document });
      return id;
    },
    async patch(id: string, update: Record<string, unknown>) {
      const row = Object.values(rows)
        .flat()
        .find((candidate) => candidate._id === id);
      if (row) Object.assign(row, update);
    },
  };
  return {
    ctx: { db, scheduler: { runAfter: async () => undefined } },
    rows,
    table,
  };
}

function submission(
  activityId: string,
  mode: "guided_practice" | "independent_practice",
  points: typeof INDEPENDENT_POINTS,
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-09-07T00:00:00.000Z",
    answers: { table_values: points, placed_points: points },
    parts: [
      { partId: "table_values", rawAnswer: points },
      { partId: "placed_points", rawAnswer: points },
    ],
  };
}

describe("selected IM3 seed to server submission", () => {
  it("uses seeded physical rows and keeps draft and evidence boundaries closed", async () => {
    const { ctx, rows, table } = memoryContext();
    const seedHandler = seedLesson1 as unknown as {
      _handler(ctx: unknown): Promise<unknown>;
    };
    await seedHandler._handler(ctx);
    const learnerId = "profiles:learner";
    table("profiles").push({
      _id: learnerId,
      username: "learner",
      role: "student",
      organizationId: "org",
    });
    table("auth_credentials").push({
      _id: "credential:1",
      profileId: learnerId,
      username: "learner",
      role: "student",
      organizationId: "org",
      isActive: true,
    });
    const independent = table("activities").find(
      (row) => row.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    )!;
    const guided = table("activities").find(
      (row) => row.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID,
    )!;

    await expect(
      createServerOwnedSubmissionHandler(
        ctx as never,
        {
          userId: learnerId,
          activityId: independent._id,
          idempotencyKey: "draft",
          submissionData: submission(
            independent._id,
            "independent_practice",
            INDEPENDENT_POINTS,
          ),
        } as never,
        publication,
      ),
    ).rejects.toThrow("approved server-owned create mapping");
    expect(table("activity_submissions")).toHaveLength(0);

    for (const activity of [guided, independent]) {
      activity.approval = { status: "approved" };
      activity.srsEligible = true;
    }
    const independentInput = {
      userId: learnerId,
      activityId: independent._id,
      idempotencyKey: "independent",
      submissionData: submission(
        independent._id,
        "independent_practice",
        INDEPENDENT_POINTS,
      ),
    };
    const first = await createServerOwnedSubmissionHandler(
      ctx as never,
      independentInput as never,
      publication,
    );
    const replay = await createServerOwnedSubmissionHandler(
      ctx as never,
      independentInput as never,
      publication,
    );
    expect(replay).toEqual(first);
    expect(first).toMatchObject({ score: 2, maxScore: 2 });

    const guidedResult = await createServerOwnedSubmissionHandler(
      ctx as never,
      {
        userId: learnerId,
        activityId: guided._id,
        idempotencyKey: "guided",
        submissionData: submission(
          guided._id,
          "guided_practice",
          GUIDED_POINTS,
        ),
      } as never,
      publication,
    );
    expect(guidedResult).toMatchObject({ score: 2, maxScore: 2 });
    await expect(
      createServerOwnedSubmissionHandler(
        ctx as never,
        {
          ...independentInput,
          submissionData: submission(
            independent._id,
            "independent_practice",
            GUIDED_POINTS,
          ),
        } as never,
        publication,
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(table("activity_submissions")).toHaveLength(2);
    expect(rows.learning_evidence ?? []).toHaveLength(0);
    expect(rows.student_srs_state ?? []).toHaveLength(0);
  });
});
