import { describe, expect, it } from "vitest";

import {
  createServerOwnedSubmission,
  createServerOwnedSubmissionHandler,
} from "@/convex/activities";
import { seedLesson1 } from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

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
          configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
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
  return { ctx: { db, scheduler: { runAfter: async () => undefined } }, rows, table };
}

function acknowledgement(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "worked_example" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-09-07T00:00:00.000Z",
    answers: {},
    parts: [],
  };
}

describe("selected IM3 Worked acknowledgement writer", () => {
  it("uses the registered mutation and persists an ungraded replay-safe acknowledgement", async () => {
    const { ctx, rows, table } = memoryContext();
    await (seedLesson1 as unknown as { _handler(ctx: unknown): Promise<unknown> })._handler(ctx);
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
    const worked = table("activities").find(
      (row) => row.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID,
    )!;
    const handler = createServerOwnedSubmission as unknown as {
      _handler(ctx: unknown, args: unknown): Promise<unknown>;
    };
    const input = {
      userId: learnerId,
      activityId: worked._id,
      submissionData: acknowledgement(worked._id),
      idempotencyKey: "worked-1",
    };

    await expect(handler._handler(ctx, input)).rejects.toThrow(
      "approved server-owned create mapping",
    );
    worked.approval = { status: "approved" };
    const first = await createServerOwnedSubmissionHandler(
      ctx as never,
      input as never,
      publication,
    );
    const replay = await createServerOwnedSubmissionHandler(
      ctx as never,
      input as never,
      publication,
    );

    expect(first).toMatchObject({ acknowledged: true });
    expect(replay).toEqual(first);
    expect(table("activity_submissions")).toHaveLength(1);
    for (const field of ["score", "maxScore", "gradedAt"]) {
      expect(table("activity_submissions")[0]).not.toHaveProperty(field);
    }
    expect(rows.learning_evidence ?? []).toHaveLength(0);
    expect(rows.student_srs_state ?? []).toHaveLength(0);
    const stored = table("activity_submissions")[0];
    stored.score = 1;
    await expect(
      createServerOwnedSubmissionHandler(ctx as never, input as never, publication),
    ).rejects.toThrow("Stored IM3 Worked acknowledgement is graded");
    delete stored.score;

    await expect(
      createServerOwnedSubmissionHandler(
        ctx as never,
        {
          ...input,
          submissionData: { ...input.submissionData, submittedAt: "2026-09-07T00:01:00.000Z" },
        } as never,
        publication,
      ),
    ).rejects.toThrow("idempotency_conflict");
    expect(table("activity_submissions")).toHaveLength(1);
  });

  it("rejects invalid identity, activity metadata, source props, and acknowledgement content before writes", async () => {
    const { ctx, table } = memoryContext();
    await (seedLesson1 as unknown as { _handler(ctx: unknown): Promise<unknown> })._handler(ctx);
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
    const worked = table("activities").find(
      (row) => row.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID,
    )!;
    worked.approval = { status: "approved" };
    const valid = {
      userId: learnerId,
      activityId: worked._id,
      submissionData: acknowledgement(worked._id),
      idempotencyKey: "worked-1",
    };
    const cases = [
      () => {
        table("auth_credentials")[0].isActive = false;
      },
      () => {
        worked.masteryNodeId = "math.im3.skill.wrong";
      },
      () => {
        worked.props = { variant: "plot_from_equation", equation: "f(x) = x^2 + 9" };
      },
      () => {
        worked.gradingConfig = { autoGrade: false, partialCredit: false, passingScore: 0 };
      },
      () => {
        valid.submissionData = { ...acknowledgement(worked._id), answers: { forged: 1 } } as never;
      },
      () => {
        valid.submissionData = { ...acknowledgement(worked._id), artifact: {} } as never;
      },
    ];
    for (const change of cases) {
      const originalCredential = structuredClone(table("auth_credentials")[0]);
      const originalActivity = structuredClone(worked);
      valid.submissionData = acknowledgement(worked._id);
      change();
      await expect(
        createServerOwnedSubmissionHandler(ctx as never, valid as never, publication),
      ).rejects.toThrow();
      expect(table("activity_submissions")).toHaveLength(0);
      Object.assign(table("auth_credentials")[0], originalCredential);
      Object.assign(worked, originalActivity);
    }
  });
});
