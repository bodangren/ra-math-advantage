import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { seedLesson1_1 } from "@/convex/seed/seed_lesson_1_1";
import { PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

type Row = Record<string, unknown> & { _id: string };

function createHarness() {
  const rows: Record<string, Row[]> = {
    lessons: [],
    lesson_versions: [],
    phase_versions: [],
    phase_sections: [],
    activities: [],
  };
  const db = {
    query: (table: string) => ({
      withIndex: (
        _name: string,
        configure: (query: {
          eq: (field: string, value: unknown) => unknown;
        }) => unknown,
      ) => {
        const filters = new Map<string, unknown>();
        const query = {
          eq(field: string, value: unknown) {
            filters.set(field, value);
            return query;
          },
        };
        configure(query);
        const matches = () =>
          (rows[table] ?? []).filter((row) =>
            [...filters].every(([key, value]) => row[key] === value),
          );
        return {
          collect: async () => matches(),
          first: async () => matches()[0] ?? null,
          unique: async () => {
            const found = matches();
            if (found.length > 1) throw new Error(`Duplicate ${table} rows`);
            return found[0] ?? null;
          },
        };
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const target = rows[table] ?? (rows[table] = []);
      const id = `${table}:${target.length + 1}`;
      target.push({ _id: id, ...document });
      return id;
    },
    patch: async (id: string, document: Record<string, unknown>) => {
      const row = Object.values(rows)
        .flat()
        .find((candidate) => candidate._id === id);
      if (!row) throw new Error(`Missing row ${id}`);
      Object.assign(row, document);
    },
  };
  return { db, rows };
}

async function runSeed(harness: ReturnType<typeof createHarness>) {
  const handler = Reflect.get(seedLesson1_1, "_handler") as (
    context: { db: typeof harness.db },
    args: Record<string, never>,
  ) => Promise<unknown>;
  await handler({ db: harness.db }, {});
}

function ordinaryMarkdown(harness: ReturnType<typeof createHarness>) {
  return harness.rows.phase_versions
    .sort((left, right) => Number(left.phaseNumber) - Number(right.phaseNumber))
    .map((phase) => {
      const section = harness.rows.phase_sections.find(
        (candidate) =>
          candidate.phaseVersionId === phase._id &&
          candidate.sequenceOrder === 1,
      );
      return (section?.content as { markdown?: string } | undefined)?.markdown;
    });
}

describe("Topic 1.1 ordinary seed source parity", () => {
  it("seeds seven truthful ordinary phase bodies and preserves the selected source link on replay", async () => {
    const harness = createHarness();
    await runSeed(harness);

    const bodies = ordinaryMarkdown(harness);
    expect(
      harness.rows.phase_versions.map((phase) => [
        phase.phaseNumber,
        phase.phaseType,
      ]),
    ).toEqual([
      [1, "explore"],
      [2, "vocabulary"],
      [3, "learn"],
      [4, "worked_example"],
      [5, "guided_practice"],
      [6, "independent_practice"],
      [7, "reflection"],
    ]);
    expect(bodies).toHaveLength(7);
    expect(bodies.every((body) => typeof body === "string")).toBe(true);
    expect(bodies[0]).toContain(
      "vertex occurs at $t=1.25$ seconds, where $h(t)=43.5$ feet",
    );
    expect(bodies[0]).toContain("do not show a constant interval");
    expect(bodies[0]).toContain("$0 \\le t \\le (5+\\sqrt{29})/4$");
    expect(bodies[1]).toContain("**Domain**: The domain is the set of input values.");
    expect(bodies[1]).not.toContain("Also called the domain");
    expect(bodies[1]).not.toContain("Also called the range");
    expect(bodies[2]).toContain("approximately ___.");
    expect(bodies[3]).toContain("**Authored worked example A:**");
    expect(bodies[3]).toContain("**Authored worked example B:**");
    expect(bodies[4]).toContain("Assume that the temperature changes linearly");
    expect(bodies[5]).toContain("Assume that $p$ changes linearly");
    expect(bodies[5]).toContain("**Topic 1.2 preview:**");
    expect(bodies[5]).not.toContain("average rate is 3");
    expect(bodies[5]).toContain("does not supply Topic 1.1 mastery evidence");
    expect(bodies[6]).toContain("Assume that $m$ changes linearly");

    const lesson = fs.readFileSync(
      path.resolve(
        path.dirname(
          import.meta.url.startsWith("file:")
            ? fileURLToPath(import.meta.url)
            : import.meta.url,
        ),
        "../../../curriculum/modules/unit-01-polynomial-rational/lesson-1-1/lesson.md",
      ),
      "utf8",
    );
    for (const body of bodies) expect(lesson).toContain(body!);

    const sourceActivity = harness.rows.activities.find(
      (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    );
    expect(sourceActivity).toBeDefined();
    const sourceLinksBefore = harness.rows.phase_sections.filter(
      (row) =>
        (row.content as { activityId?: unknown })?.activityId ===
        sourceActivity?._id,
    );
    expect(sourceLinksBefore).toHaveLength(1);
    expect(sourceLinksBefore[0]).toMatchObject({
      sequenceOrder: 2,
      sectionType: "activity",
    });

    const unrelated = {
      _id: "phase_sections:unrelated",
      phaseVersionId: harness.rows.phase_versions[0]!._id,
      sequenceOrder: 99,
      sectionType: "text",
      content: { markdown: "Unrelated teacher note." },
      createdAt: 123,
      updatedAt: 123,
    };
    harness.rows.phase_sections.push(unrelated);
    const snapshot = structuredClone(harness.rows.phase_sections);
    const selectedActivitySnapshot = harness.rows.activities.map(
      ({ updatedAt: _updatedAt, ...activity }) => activity,
    );
    await runSeed(harness);
    expect(harness.rows.phase_sections).toEqual(snapshot);
    expect(
      harness.rows.phase_sections.find(
        (section) => section._id === unrelated._id,
      ),
    ).toEqual(unrelated);
    expect(
      harness.rows.activities.map(
        ({ updatedAt: _updatedAt, ...activity }) => activity,
      ),
    ).toEqual(selectedActivitySnapshot);
  });
});
