import { describe, expect, it, vi } from "vitest";

describe("spreadsheet attempt transaction", () => {
  it("writes the attempt and assessment together and replays the last allowed attempt", async () => {
    const source =
      await vi.importActual<
        Record<string, { _handler: (ctx: unknown, args: unknown) => Promise<unknown> }>
      >("@/convex/activities");
    type Row = Record<string, unknown> & { _id: string };
    const tables: Record<string, Row[]> = {
      activities: [{ _id: "activity", props: {}, componentKey: "spreadsheet-evaluator" }],
      student_spreadsheet_responses: [],
      spreadsheet_submission_attempts: [],
      activity_submissions: [],
    };
    const ctx = {
      db: {
        get: async (id: string) =>
          Object.values(tables)
            .flat()
            .find((row) => row._id === id) ?? null,
        query: (table: string) => ({
          withIndex: (_name: string, configure: (q: unknown) => void) => {
            const conditions: Array<[string, unknown]> = [];
            const q = {
              eq: (key: string, value: unknown) => {
                conditions.push([key, value]);
                return q;
              },
            };
            configure(q);
            const rows = () =>
              (tables[table] ?? []).filter((row) =>
                conditions.every(([key, value]) => row[key] === value),
              );
            return { unique: async () => rows()[0] ?? null, collect: async () => rows() };
          },
        }),
        insert: async (table: string, data: Record<string, unknown>) => {
          const row = { _id: `${table}:${(tables[table] ?? []).length}`, ...data };
          (tables[table] ??= []).push(row);
          return row._id;
        },
        patch: async (id: string, data: Record<string, unknown>) => {
          Object.assign(
            Object.values(tables)
              .flat()
              .find((row) => row._id === id)!,
            data,
          );
        },
      },
    };
    const args = {
      userId: "student",
      activityId: "activity",
      idempotencyKey: "attempt-1",
      spreadsheetData: [[{ value: "=10+20" }]],
      isCompleted: true,
      validationResult: {
        isComplete: true,
        totalCells: 1,
        correctCells: 1,
        feedback: [],
        timestamp: new Date().toISOString(),
      },
      submissionData: {
        contractVersion: "practice.v1",
        activityId: "activity",
        mode: "assessment",
        status: "submitted",
        attemptNumber: 999,
        submittedAt: new Date().toISOString(),
        answers: { A1: "=10+20" },
        parts: [],
      },
    };
    const handler = source.submitSpreadsheet._handler;
    for (let attempt = 1; attempt <= 3; attempt++) {
      await handler(ctx, { ...args, idempotencyKey: `attempt-${attempt}` });
    }
    const before = JSON.stringify(tables);
    expect(await handler(ctx, { ...args, idempotencyKey: "attempt-3" })).toMatchObject({
      success: true,
      attemptNumber: 3,
    });
    expect(JSON.stringify(tables)).toBe(before);
    expect(tables.spreadsheet_submission_attempts).toHaveLength(3);
    expect(tables.activity_submissions).toHaveLength(3);
    expect(tables.activity_submissions[0].submissionData).toMatchObject({ attemptNumber: 1 });
    await expect(handler(ctx, { ...args, idempotencyKey: "attempt-4" })).rejects.toThrow(
      "Maximum attempts",
    );
    await expect(
      handler(ctx, { ...args, idempotencyKey: "attempt-3", spreadsheetData: [[{ value: 30 }]] }),
    ).rejects.toThrow("idempotency_conflict");
    expect(JSON.stringify(tables)).toBe(before);
  });
});
