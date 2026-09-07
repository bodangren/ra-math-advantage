import { describe, expect, it } from "vitest";
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3PilotSeedDocuments,
  buildIm3WorkedPilotSeedDocument,
  seedLesson1,
  upsertIm3SelectedPilotSeed,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_VARIANT_KEY,
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

describe("selected IM3 quadratic seed documents", () => {
  it("keeps all three physical activities inactive pending activity review", () => {
    const worked = buildIm3WorkedPilotSeedDocument(10);
    const guided = buildIm3GuidedPilotSeedDocuments(
      "activities:guided" as never,
      10,
    );
    const independent = buildIm3PilotSeedDocuments(
      "activities:independent" as never,
      10,
    );
    expect([
      worked.stableActivityId,
      guided.activity.stableActivityId,
      independent.activity.stableActivityId,
    ]).toEqual([
      IM3_TEACHER_LED_ACTIVITY_ID,
      IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    ]);
    for (const activity of [worked, guided.activity, independent.activity]) {
      expect(activity.masteryNodeId).toBe(IM3_PILOT_NODE);
      expect(activity.componentKey).toBe("graphing-explorer");
      expect(activity.approval).toEqual({ status: "unreviewed" });
      expect(activity.srsEligible).toBe(false);
    }
  });

  it("uses complete public mode props and canonical snake-case rubric parts", () => {
    const worked = buildIm3WorkedPilotSeedDocument(10);
    const guided = buildIm3GuidedPilotSeedDocuments(
      "activities:guided" as never,
      10,
    );
    const independent = buildIm3PilotSeedDocuments(
      "activities:independent" as never,
      10,
    );
    expect(worked.learningEvidenceMode).toBe("worked_example");
    expect(worked.props).toMatchObject({
      variant: "plot_from_equation",
      equation: "f(x) = x^2",
    });
    expect(guided.activity.props).toMatchObject({
      responseVariant: "table_graph",
    });
    expect(independent.activity.props).toMatchObject({
      responseVariant: "table_graph",
    });
    expect(guided.activity.gradingConfig.partIds).toEqual([
      "table_values",
      "placed_points",
    ]);
    expect(independent.activity.gradingConfig.partIds).toEqual([
      "table_values",
      "placed_points",
    ]);
    expect(Object.keys(independent.activity.props)).not.toContain(
      "expectedAnswer",
    );
  });

  it("upserts one physical row per mode and links the exact Worked phase", async () => {
    const rows: Record<string, Array<Record<string, unknown>>> = {
      activities: [
        {
          _id: "activities:source",
          componentKey: "step-by-step-solver",
          props: {
  problemType: "graphing",
  equation: "f(x) = x^2",
  steps: [
    { expression: "x = -2", explanation: "Evaluate at x = -2" },
    { expression: "f(-2) = (-2)^2 = 4", explanation: "Calculate f(-2)" },
    { expression: "x = -1", explanation: "Evaluate at x = -1" },
    { expression: "f(-1) = (-1)^2 = 1", explanation: "Calculate f(-1)" },
    { expression: "x = 0", explanation: "Evaluate at x = 0" },
    { expression: "f(0) = 0^2 = 0", explanation: "Calculate f(0) — the vertex" },
    { expression: "x = 1", explanation: "Evaluate at x = 1" },
    { expression: "f(1) = 1^2 = 1", explanation: "Calculate f(1)" },
    { expression: "x = 2", explanation: "Evaluate at x = 2" },
    { expression: "f(2) = 2^2 = 4", explanation: "Calculate f(2)" },
  ],
},
        },
      ],
      practice_variants: [],
      practice_items: [],
      lessons: [{ _id: "lesson:1", slug: "module-1-lesson-1" }],
      lesson_versions: [
        {
          _id: "lesson-version:1",
          lessonId: "lesson:1",
          version: 1,
          status: "published",
        },
      ],
      phase_versions: [
        {
          _id: "phase:4",
          lessonVersionId: "lesson-version:1",
          phaseNumber: 4,
          phaseType: "worked_example",
        },
      ],
      phase_sections: [
        {
          _id: "section:source",
          phaseVersionId: "phase:4",
          sequenceOrder: 1,
          sectionType: "text",
          content: {
            markdown: "## Example 1: Graph $f(x) = x^2$ Using a Table\n\nLet's graph $f(x) = x^2$ by creating a table of values.",
          },
        },
        {
          _id: "section:worked",
          phaseVersionId: "phase:4",
          sequenceOrder: 2,
          sectionType: "activity",
          content: {
            componentKey: "step-by-step-solver",
            activityId: "activities:source",
            props: { equation: "f(x) = x^2" },
          },
        },
      ],
    };
    let nextId = 1;
    const db = {
      async get(id: string) {
        return (
          Object.values(rows)
            .flat()
            .find((row) => row._id === id) ?? null
        );
      },
      query(table: string) {
        return {
          withIndex(
            _name: string,
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
              rows[table].filter((row) =>
                [...conditions].every(([field, value]) => row[field] === value),
              );
            return {
              unique: async () => {
                const matches = selected();
                if (matches.length > 1)
                  throw new Error("Non-unique test query");
                return matches[0] ?? null;
              },
              first: async () => selected()[0] ?? null,
              take: async (count: number) => selected().slice(0, count),
              collect: async () => selected(),
            };
          },
        };
      },
      async insert(table: string, document: Record<string, unknown>) {
        const id = `${table}:${nextId++}`;
        rows[table].push({ _id: id, ...document });
        return id;
      },
      async patch(id: string, update: Record<string, unknown>) {
        for (const tableRows of Object.values(rows)) {
          const row = tableRows.find((candidate) => candidate._id === id);
          if (row) Object.assign(row, update);
        }
      },
    };

    const originalSourceContent = structuredClone(rows.phase_sections[0].content);
    rows.phase_sections[0].content = {
      markdown: "## Example 1: Graph $f(x) = x^2$ Using a Table\n\nInstead graph f(x) = x^2 + 9.",
    };
    const beforeWrongSource = structuredClone(rows);
    await expect(upsertIm3SelectedPilotSeed({ db } as never, "lesson-version:1" as never, 9))
      .rejects.toThrow("source sections must be unique");
    expect(rows).toEqual(beforeWrongSource);
    rows.phase_sections[0].content = originalSourceContent;

    const originalProps = structuredClone(rows.activities[0].props);
    rows.activities[0].props = { equation: "f(x) = x^2 + 9" };
    const beforeWrongActivity = structuredClone(rows);
    await expect(upsertIm3SelectedPilotSeed({ db } as never, "lesson-version:1" as never, 9))
      .rejects.toThrow("Worked activity source is invalid");
    expect(rows).toEqual(beforeWrongActivity);
    rows.activities[0].props = originalProps;

    const first = await upsertIm3SelectedPilotSeed(
      { db } as never,
      "lesson-version:1" as never,
      10,
    );
    const second = await upsertIm3SelectedPilotSeed(
      { db } as never,
      "lesson-version:1" as never,
      20,
    );

    expect(second).toEqual(first);
    expect(
      rows.activities.filter((row) => row.masteryNodeId === IM3_PILOT_NODE),
    ).toHaveLength(3);
    expect(rows.practice_variants).toHaveLength(2);
    expect(rows.practice_items).toHaveLength(2);
    expect(
      rows.activities
        .filter((row) => row.masteryNodeId === IM3_PILOT_NODE)
        .every((row) => row.approval && row.srsEligible === false),
    ).toBe(true);
    expect(rows.phase_sections[1].content).toEqual({
      componentKey: "graphing-explorer",
      activityId: first.workedActivityId,
    });

    const independent = rows.activities.find(
      (row) => row._id === first.independentActivityId,
    )!;
    independent.approval = { status: "approved", reviewedBy: "profiles:reviewer", reviewedAt: 24 };
    independent.srsEligible = true;
    independent.props = Object.fromEntries(
      Object.entries(independent.props as Record<string, unknown>).reverse(),
    );
    await expect(
      upsertIm3SelectedPilotSeed(
        { db } as never,
        "lesson-version:1" as never,
        25,
      ),
    ).resolves.toEqual(first);

    expect(independent.approval).toEqual({ status: "approved", reviewedBy: "profiles:reviewer", reviewedAt: 24 });
    expect(independent.srsEligible).toBe(true);

    const guided = rows.activities.find(
      (row) => row._id === first.guidedActivityId,
    )!;
    guided.srsEligible = true;
    guided.props = { variant: "plot_from_equation", equation: "y = changed" };
    await upsertIm3SelectedPilotSeed(
      { db } as never,
      "lesson-version:1" as never,
      26,
    );
    expect(guided).toMatchObject({
      approval: { status: "unreviewed" },
      srsEligible: false,
    });

    independent.approval = { status: "approved" };
    independent.props = {
      variant: "plot_from_equation",
      equation: "y = changed",
    };
    await expect(
      upsertIm3SelectedPilotSeed(
        { db } as never,
        "lesson-version:1" as never,
        30,
      ),
    ).rejects.toThrow("Approved selected IM3 activity content changed");

    independent.approval = { status: "unreviewed" };
    independent.props = buildIm3PilotSeedDocuments(
      first.independentActivityId as never,
      30,
    ).activity.props;
    rows.practice_items.push({
      _id: "practice_items:conflict",
      variantKey: IM3_PILOT_VARIANT_KEY,
      activityId: "activities:other",
      practiceItemId: "wrong",
    });
    await expect(
      upsertIm3SelectedPilotSeed(
        { db } as never,
        "lesson-version:1" as never,
        31,
      ),
    ).rejects.toThrow(
      /conflicting selected IM3 practice-item mapping|Non-unique test query/,
    );
  });

  it("runs the selected upsert from the existing lesson seed mutation", async () => {
    const rows: Record<string, Array<Record<string, unknown>>> = {};
    let nextId = 1;
    const tableRows = (table: string) => (rows[table] ??= []);
    const db = {
      async get(id: string) {
        return (
          Object.values(rows)
            .flat()
            .find((row) => row._id === id) ?? null
        );
      },
      query(table: string) {
        return {
          withIndex(
            _name: string,
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
              tableRows(table).filter((row) =>
                [...conditions].every(([field, value]) => row[field] === value),
              );
            return {
              unique: async () => {
                const matches = selected();
                if (matches.length > 1)
                  throw new Error("Non-unique test query");
                return matches[0] ?? null;
              },
              first: async () => selected()[0] ?? null,
              take: async (count: number) => selected().slice(0, count),
              collect: async () => selected(),
            };
          },
        };
      },
      async insert(table: string, document: Record<string, unknown>) {
        const id = `${table}:${nextId++}`;
        tableRows(table).push({ _id: id, ...document });
        return id;
      },
      async patch(id: string, update: Record<string, unknown>) {
        for (const candidates of Object.values(rows)) {
          const row = candidates.find((candidate) => candidate._id === id);
          if (row) Object.assign(row, update);
        }
      },
    };

    const handler = seedLesson1 as unknown as {
      _handler(ctx: unknown): Promise<unknown>;
    };
    await handler._handler({ db });
    await handler._handler({ db });

    const selectedActivities = tableRows("activities").filter(
      (row) => row.masteryNodeId === IM3_PILOT_NODE,
    );
    expect(selectedActivities).toHaveLength(3);
    expect(tableRows("practice_variants")).toHaveLength(2);
    expect(tableRows("practice_items")).toHaveLength(2);

    const version = tableRows("lesson_versions")[0];
    version.status = "draft";
    await expect(handler._handler({ db })).rejects.toThrow(
      "Lesson 1.1 has no published version",
    );
    version.status = "published";
    tableRows("lesson_versions").push({
      ...version,
      _id: "lesson_versions:duplicate",
    });
    await expect(handler._handler({ db })).rejects.toThrow(
      "Lesson 1.1 has duplicate latest published versions",
    );
  });

  it("rejects missing Phase 4 and missing sequence-2 activity sections", async () => {
    const makeContext = (
      hasPhase: boolean,
      sections: Array<Record<string, unknown>>,
    ) => {
      const activities: Array<Record<string, unknown>> = [];
      const tables: Record<string, Array<Record<string, unknown>>> = {
        activities,
        practice_variants: [],
        practice_items: [],
        lessons: [{ _id: "lesson:1", slug: "module-1-lesson-1" }],
        lesson_versions: [
          {
            _id: "lesson-version:1",
            lessonId: "lesson:1",
            version: 1,
            status: "published",
          },
        ],
        phase_versions: hasPhase
          ? [
              {
                _id: "phase:4",
                lessonVersionId: "lesson-version:1",
                phaseNumber: 4,
                phaseType: "worked_example",
              },
            ]
          : [],
        phase_sections: sections,
      };
      return {
        db: {
          async get(id: string) {
            return (
              Object.values(tables)
                .flat()
                .find((row) => row._id === id) ?? null
            );
          },
          query(table: string) {
            return {
              withIndex(
                _name: string,
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
                  tables[table].filter((row) =>
                    [...conditions].every(
                      ([field, value]) => row[field] === value,
                    ),
                  );
                return {
                  unique: async () => {
                    const matches = selected();
                    if (matches.length > 1)
                      throw new Error("Non-unique test query");
                    return matches[0] ?? null;
                  },
                  first: async () => selected()[0] ?? null,
                  take: async (count: number) => selected().slice(0, count),
                  collect: async () => selected(),
                };
              },
            };
          },
          async insert(table: string, document: Record<string, unknown>) {
            const id = `${table}:${tables[table].length + 1}`;
            tables[table].push({ _id: id, ...document });
            return id;
          },
          async patch() {},
        },
      };
    };
    await expect(
      upsertIm3SelectedPilotSeed(
        makeContext(false, []) as never,
        "lesson-version:1" as never,
        10,
      ),
    ).rejects.toThrow("Worked Phase 4 must be unique");
    await expect(
      upsertIm3SelectedPilotSeed(
        makeContext(true, []) as never,
        "lesson-version:1" as never,
        10,
      ),
    ).rejects.toThrow("source sections must be unique");
    await expect(
      upsertIm3SelectedPilotSeed(
        makeContext(true, [
          {
            _id: "source",
            phaseVersionId: "phase:4",
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 1: Graph $f(x) = x^2$ Using a Table\n\nLet's graph $f(x) = x^2$ by creating a table of values.",
            },
          },
          {
            _id: "activity",
            phaseVersionId: "phase:4",
            sequenceOrder: 2,
            sectionType: "activity",
            content: {
              componentKey: "graphing-explorer",
              activityId: "activities:wrong",
            },
          },
        ]) as never,
        "lesson-version:1" as never,
        10,
      ),
    ).rejects.toThrow("Worked activity source is invalid");
  });
});
