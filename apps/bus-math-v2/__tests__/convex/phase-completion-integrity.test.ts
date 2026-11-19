import { describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "@/convex/_generated/server";
type Row = Record<string, unknown> & { _id: string };
const ADMIN_EMAIL = "test";
function createHarness(initialActivities: Row[] = []) {
  const tables: Record<string, Row[]> = {
    profiles: [
      {
        _id: "profiles:bm2-seed-admin",
        username: ADMIN_EMAIL,
        role: "admin",
        organizationId: "organizations:bm2-seed",
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    activities: [...initialActivities],
    lessons: [],
    lesson_versions: [],
    competency_standards: [],
    lesson_standards: [],
    phase_versions: [],
    phase_sections: [],
  };
  const nextIds = new Map<string, number>();

  function select(tableName: string, conditions: ReadonlyMap<string, unknown>): Row[] {
    return (tables[tableName] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );
  }

  const ctx = {
    auth: {
      getUserIdentity: async () => ({ email: ADMIN_EMAIL }),
    },
    db: {
      get: async (id: string) =>
        Object.values(tables)
          .flat()
          .find((row) => row._id === id) ?? null,
      query: (tableName: string) => {
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
            const rows = select(tableName, conditions);
            if (rows.length > 1) throw new Error(`Expected one ${tableName} row`);
            return rows[0] ?? null;
          },
          first: async () => {
            const rows = select(tableName, conditions);
            return direction === "desc" ? (rows.at(-1) ?? null) : (rows[0] ?? null);
          },
          collect: async () => select(tableName, conditions),
          take: async (limit: number) => select(tableName, conditions).slice(0, limit),
          order(nextDirection: "asc" | "desc") {
            direction = nextDirection;
            return result;
          },
        };
        return {
          ...result,
          withIndex: (_indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            return result;
          },
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const nextId = (nextIds.get(tableName) ?? 0) + 1;
        nextIds.set(tableName, nextId);
        const id = `${tableName}:${nextId}`;
        (tables[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
      patch: async (id: string, document: Record<string, unknown>) => {
        const row = Object.values(tables)
          .flat()
          .find((candidate) => candidate._id === id);
        if (!row) throw new Error(`Unknown patch target: ${id}`);
        Object.assign(row, document);
      },
      delete: async (id: string) => {
        for (const rows of Object.values(tables)) {
          const index = rows.findIndex((row) => row._id === id);
          if (index >= 0) {
            rows.splice(index, 1);
            return;
          }
        }
      },
    },
  } as unknown as MutationCtx;

  return { ctx, tables };
}

async function setup() {
  const { ctx, tables } = createHarness();
  tables.profiles.push({ _id: "student:1", role: "student" });
  tables.lesson_versions.push({
    _id: "version:1",
    status: "published",
    lessonId: "lesson:1",
    version: 1,
  });
  tables.phase_versions.push({ _id: "phase:1", lessonVersionId: "version:1", phaseNumber: 1 });
  tables.phase_sections.push({
    _id: "section:1",
    phaseVersionId: "phase:1",
    sectionType: "activity",
    content: { activityId: "activity:1", required: true },
  });
  tables.activities.push({
    _id: "activity:1",
    gradingConfig: { autoGrade: true, passingScore: 80 },
  });
  tables.activity_submissions = [];
  tables.student_progress = [];
  const source = await vi.importActual<Record<string, unknown>>("@/convex/api");
  const handler = (
    source.completePhaseMutation as {
      _handler: (ctx: MutationCtx, args: Record<string, unknown>) => Promise<unknown>;
    }
  )._handler;
  const args = {
    userId: "student:1",
    phaseId: "phase:1",
    timeSpent: 10,
    idempotencyKey: "key:1",
    linkedStandardId: "UNRELATED",
  };
  return { ctx, tables, run: () => handler(ctx, args), handler, args };
}
describe("phase completion evidence and retry integrity", () => {
  it("rejects completion without saved required work", async () => {
    const h = await setup();
    await expect(h.run()).rejects.toThrow("required_activity_incomplete");
    expect(h.tables.student_progress).toHaveLength(0);
  });
  it("rejects a saved score below the published threshold", async () => {
    const h = await setup();
    h.tables.activity_submissions.push({
      _id: "answer:1",
      userId: "student:1",
      activityId: "activity:1",
      score: 3,
      maxScore: 5,
      submissionData: { status: "submitted" },
    });
    await expect(h.run()).rejects.toThrow("required_activity_incomplete");
  });
  it("accepts passing work once without granting a client-selected competency", async () => {
    const h = await setup();
    h.tables.activity_submissions.push({
      _id: "answer:1",
      userId: "student:1",
      activityId: "activity:1",
      score: 4,
      maxScore: 5,
      submissionData: { status: "submitted" },
    });
    h.tables.competency_standards.push({ _id: "standard:1", code: "UNRELATED" });
    await h.run();
    const first = structuredClone(h.tables.student_progress);
    await h.run();
    expect(h.tables.student_progress).toEqual(first);
    expect(h.tables.student_competency ?? []).toHaveLength(0);
  });
  it("rejects a retry key used for a different phase", async () => {
    const h = await setup();
    h.tables.student_progress.push({
      _id: "progress:other",
      userId: "student:1",
      phaseId: "other",
      idempotencyKey: "key:1",
      status: "completed",
    });
    await expect(h.run()).rejects.toThrow("idempotency_conflict");
  });
});
