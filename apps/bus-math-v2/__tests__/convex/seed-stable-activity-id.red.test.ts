import { describe, expect, it, vi } from "vitest";

import type { MutationCtx } from "@/convex/_generated/server";
import { buildPublishedCurriculumSeedPlan } from "@/lib/curriculum/published-manifest";
import { BM2_PILOT_SOURCE_ACTIVITY_ID } from "@/lib/learning-evidence/bm2-pilot";

const ADMIN_EMAIL = "seed-stable-activity-id-admin@example.test";
const LEGACY_SOURCE_DOCUMENT_ID = "activities:bm2-legacy-source-row";
const STABLE_SOURCE_DOCUMENT_ID = "activities:bm2-stable-source-row";

type Row = Record<string, unknown> & { _id: string };
type SeedHandler = (ctx: MutationCtx, args: Record<string, never>) => Promise<unknown>;

async function loadSeedHandler(): Promise<SeedHandler> {
  const source = await vi.importActual<Record<string, unknown>>("@/convex/seed");
  const mutation = source.seedPublishedCurriculum as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== "function") {
    throw new Error("BM2 must export seedPublishedCurriculum with a Convex mutation handler.");
  }
  return mutation._handler as SeedHandler;
}

function pilotSourcePlan() {
  const lesson = buildPublishedCurriculumSeedPlan().lessons.find(
    (candidate) => candidate.slug === "unit-1-lesson-1",
  );
  const activity = lesson?.activities.find(
    (candidate) => candidate.key === "unit-1-lesson-1-activity-1",
  );
  if (!activity) {
    throw new Error("Missing the authored Unit 1 Lesson 1 pilot source activity.");
  }
  return activity;
}

function nonpilotSourcePlan() {
  const source = buildPublishedCurriculumSeedPlan()
    .lessons.flatMap((lesson) => lesson.activities)
    .find((activity) => activity.key !== pilotSourcePlan().key);
  if (!source) {
    throw new Error("Missing a nonpilot authored activity.");
  }
  return source;
}

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

describe("BM2 published activity stable identity seed migration", () => {
  it("inserts the authored source UUID as stableActivityId on a new physical activity row", async () => {
    const handler = await loadSeedHandler();
    const { ctx, tables } = createHarness();

    await handler(ctx, {});

    expect(tables.activities).toContainEqual(
      expect.objectContaining({
        stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
        componentKey: "notebook-organizer",
        displayName: "The Notebook Organizer",
      }),
    );
  });

  it("migrates a signature-matched legacy source row on reseed without replacing its physical ID", async () => {
    const handler = await loadSeedHandler();
    const source = pilotSourcePlan();
    const legacySource: Row = {
      _id: LEGACY_SOURCE_DOCUMENT_ID,
      componentKey: source.componentKey,
      displayName: source.displayName,
      description: source.description,
      props: { stale: true },
      gradingConfig: {},
      createdAt: 1,
      updatedAt: 1,
    };
    const { ctx, tables } = createHarness([legacySource]);

    await handler(ctx, {});

    expect(tables.activities).toContainEqual(
      expect.objectContaining({
        _id: LEGACY_SOURCE_DOCUMENT_ID,
        stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
        componentKey: source.componentKey,
        displayName: source.displayName,
      }),
    );
    expect(
      tables.activities.filter((row) => row.stableActivityId === BM2_PILOT_SOURCE_ACTIVITY_ID),
    ).toHaveLength(1);
  });

  it("patches a stale existing source row by stableActivityId before it considers a legacy signature", async () => {
    const handler = await loadSeedHandler();
    const source = pilotSourcePlan();
    const staleStableSource: Row = {
      _id: STABLE_SOURCE_DOCUMENT_ID,
      stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
      componentKey: "legacy-component-key",
      displayName: "Legacy source title",
      description: "Legacy source description",
      props: { stale: true },
      gradingConfig: {},
      createdAt: 1,
      updatedAt: 1,
    };
    const { ctx, tables } = createHarness([staleStableSource]);

    await handler(ctx, {});

    const matchingStableRows = tables.activities.filter(
      (row) => row.stableActivityId === BM2_PILOT_SOURCE_ACTIVITY_ID,
    );
    expect(matchingStableRows).toEqual([
      expect.objectContaining({
        _id: STABLE_SOURCE_DOCUMENT_ID,
        componentKey: source.componentKey,
        displayName: source.displayName,
        description: source.description,
        props: source.props,
        gradingConfig: source.gradingConfig,
      }),
    ]);
  });

  it("keeps one visible pilot row after repeated safe seed calls", async () => {
    const handler = await loadSeedHandler();
    const { ctx, tables } = createHarness();

    await handler(ctx, {});
    await handler(ctx, {});

    expect(
      tables.activities.filter((row) => row.stableActivityId === BM2_PILOT_SOURCE_ACTIVITY_ID),
    ).toHaveLength(1);
  });

  it("patches a signature-matched nonpilot row with its authored content", async () => {
    const handler = await loadSeedHandler();
    const source = nonpilotSourcePlan();
    const legacySource: Row = {
      _id: "activities:bm2-nonpilot-signature-row",
      componentKey: source.componentKey,
      displayName: source.displayName,
      description: source.description,
      props: { stale: true },
      gradingConfig: { stale: true },
      createdAt: 1,
      updatedAt: 1,
    };
    const { ctx, tables } = createHarness([legacySource]);

    await handler(ctx, {});

    expect(tables.activities).toContainEqual(
      expect.objectContaining({
        _id: legacySource._id,
        componentKey: source.componentKey,
        displayName: source.displayName,
        description: source.description,
        props: source.props,
        gradingConfig: source.gradingConfig,
      }),
    );
  });
});

it("preserves phase IDs and completed progress when the same curriculum is seeded again", async () => {
  const handler = await loadSeedHandler();
  const { ctx, tables } = createHarness();
  await handler(ctx, {});
  const phaseIds = tables.phase_versions.map((phase) => phase._id);
  tables.student_progress = [{ _id: "progress:1", phaseId: phaseIds[0], status: "completed" }];
  await handler(ctx, {});
  expect(tables.phase_versions.map((phase) => phase._id)).toEqual(phaseIds);
  expect(
    tables.phase_versions.some((phase) => phase._id === tables.student_progress[0].phaseId),
  ).toBe(true);
});

it("rejects edits to an existing published version", async () => {
  const handler = await loadSeedHandler();
  const { ctx, tables } = createHarness();
  await handler(ctx, {});
  const section = tables.phase_sections[0];
  section.content = { markdown: "Existing published content must remain available." };
  await expect(handler(ctx, {})).rejects.toThrow("new lesson version");
  expect(section.content).toEqual({
    markdown: "Existing published content must remain available.",
  });
});

it("keeps earlier phases and progress when publishing the reviewed version", async () => {
  const handler = await loadSeedHandler();
  const { ctx, tables } = createHarness();
  await handler(ctx, {});
  const lesson = tables.lessons.find((row) => row.slug === "unit-2-lesson-1")!;
  const version = tables.lesson_versions.find((row) => row.lessonId === lesson._id)!;
  expect(version.version).toBe(2);
  version.version = 1;
  const phases = tables.phase_versions.filter((row) => row.lessonVersionId === version._id);
  tables.student_progress = [
    { _id: "progress:history", phaseId: phases[0]._id, status: "completed" },
  ];
  await handler(ctx, {});
  expect(tables.lesson_versions.filter((row) => row.lessonId === lesson._id)).toHaveLength(2);
  expect(tables.phase_versions.filter((row) => row.lessonVersionId === version._id)).toEqual(
    phases,
  );
  expect(tables.student_progress[0].phaseId).toBe(phases[0]._id);
});
