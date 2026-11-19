import { expect, it, vi } from "vitest";
import { completePracticeTest } from "@/convex/study";
import { checkLoginAttempt } from "@/convex/rateLimits";
import module1 from "@/lib/practice-tests/modules/module-1";

function database() {
  const rows: Array<{ _id: string; table: string } & Record<string, unknown>> = [];
  const db = {
    query(table: string) {
      const filters: Array<[string, unknown]> = [];
      return {
        withIndex(
          _name: string,
          build: (query: { eq: (field: string, value: unknown) => unknown }) => unknown,
        ) {
          const query = {
            eq(field: string, value: unknown) {
              filters.push([field, value]);
              return query;
            },
          };
          build(query);
          return {
            unique: async () =>
              rows.find(
                (row) =>
                  row.table === table && filters.every(([field, value]) => row[field] === value),
              ) ?? null,
          };
        },
      };
    },
    insert: async (table: string, data: Record<string, unknown>) => {
      const _id = `row-${rows.length}`;
      rows.push({ _id, table, ...data });
      return _id;
    },
    patch: async (id: string, data: Record<string, unknown>) => {
      Object.assign(
        rows.find((row) => row._id === id)!,
        data,
      );
    },
  };
  return { db, rows };
}

type Handler = { _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown> };
it("grades the answers and creates one result and one session across retries", async () => {
  const ctx = database();
  const complete = (completePracticeTest as unknown as Handler)._handler;
  const question = module1.questions[0];
  const args = {
    userId: "student-1",
    attemptId: "attempt-1",
    moduleNumber: 1,
    answers: [{ questionId: question.id, answer: question.correctAnswer }],
    durationSeconds: 60,
  };
  const first = await complete(ctx, args);
  expect(first).toMatchObject({ score: 1, questionCount: 1 });
  expect(await complete(ctx, args)).toEqual(first);
  expect(ctx.rows.filter((row) => row.table === "practice_test_results")).toHaveLength(1);
  expect(ctx.rows.filter((row) => row.table === "study_sessions")).toHaveLength(1);
  await complete(ctx, { ...args, userId: "student-2" });
  expect(ctx.rows.filter((row) => row.table === "practice_test_results")).toHaveLength(2);
});

it("limits login attempts across calls and resets an expired window", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-01T00:00:00Z"));
  try {
    const ctx = database();
    const check = (checkLoginAttempt as unknown as Handler)._handler;
    for (let attempt = 0; attempt < 5; attempt++)
      expect(await check(ctx, { username: "alice" })).toMatchObject({ allowed: true });
    expect(await check(ctx, { username: "alice" })).toMatchObject({ allowed: false });
    expect(await check(ctx, { username: "bob" })).toMatchObject({ allowed: true });
    vi.setSystemTime(new Date("2026-09-01T00:16:00Z"));
    expect(await check(ctx, { username: "alice" })).toMatchObject({ allowed: true });
  } finally {
    vi.useRealTimers();
  }
});
