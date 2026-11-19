import { describe, expect, it, vi } from "vitest";

import {
  buildIm3DomainRangeWorkedSeedDocument,
  linkIm3DomainRangeWorkedPhase,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

type Row = Record<string, unknown> & { _id: string };

function makeHarness(
  options: {
    activity?: Partial<Row> | null;
    phases?: Row[];
    sections?: Row[];
  } = {},
) {
  const activityId = "activities:domain-range";
  const reviewedActivity = buildIm3DomainRangeWorkedSeedDocument(10);
  const tables: Record<string, Row[]> = {
    phase_versions: options.phases ?? [
      {
        _id: "phase_versions:4",
        lessonVersionId: "lesson_versions:1",
        phaseNumber: 4,
        phaseType: "worked_example",
      },
    ],
    phase_sections: options.sections ?? [
      {
        _id: "section:1",
        phaseVersionId: "phase_versions:4",
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "selected" },
      },
      {
        _id: "section:2",
        phaseVersionId: "phase_versions:4",
        sequenceOrder: 2,
        sectionType: "activity",
        content: { activityId: "activities:selected" },
      },
      {
        _id: "section:3",
        phaseVersionId: "phase_versions:4",
        sequenceOrder: 3,
        sectionType: "activity",
        content: { activityId: "activities:legacy" },
      },
    ],
    activities:
      options.activity === null
        ? []
        : [
            {
              _id: activityId,
              stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
              masteryNodeId: IM3_DOMAIN_RANGE_NODE,
              componentKey: "graphing-explorer",
              learningEvidenceMode: reviewedActivity.learningEvidenceMode,
              srsEligible: reviewedActivity.srsEligible,
              props: reviewedActivity.props,
              gradingConfig: reviewedActivity.gradingConfig,
              createdAt: 10,
              ...options.activity,
            },
          ],
  };
  let nextId = 10;
  const insert = vi.fn(async (table: string, value: Record<string, unknown>) => {
    const id = `${table}:${nextId++}`;
    tables[table].push({ _id: id, ...value });
    return id;
  });
  const patch = vi.fn();
  const db = {
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
            tables[table].filter((row) =>
              [...conditions].every(([field, value]) => row[field] === value),
            );
          return {
            take: async (count: number) => selected().slice(0, count),
            collect: async () => selected(),
          };
        },
      };
    },
    insert,
    patch,
  };
  return { activityId, db, insert, patch, tables };
}

describe("IM3 domain-range Worked section ownership", () => {
  it("adds and replays sections 4 and 5 without changing sections 1 through 3", async () => {
    const harness = makeHarness();
    const original = structuredClone(harness.tables.phase_sections);

    await linkIm3DomainRangeWorkedPhase(
      { db: harness.db } as never,
      "lesson_versions:1" as never,
      harness.activityId as never,
    );

    expect(harness.tables.phase_sections.slice(0, 3)).toEqual(original);
    expect(harness.tables.phase_sections.slice(3)).toEqual([
      expect.objectContaining({ sequenceOrder: 4, sectionType: "text" }),
      expect.objectContaining({
        sequenceOrder: 5,
        sectionType: "activity",
        content: { componentKey: "graphing-explorer", activityId: harness.activityId },
      }),
    ]);
    harness.insert.mockClear();

    await linkIm3DomainRangeWorkedPhase(
      { db: harness.db } as never,
      "lesson_versions:1" as never,
      harness.activityId as never,
    );

    expect(harness.insert).not.toHaveBeenCalled();
    expect(harness.patch).not.toHaveBeenCalled();
  });

  it.each([
    ["wrong activity", { activity: { masteryNodeId: "math.im3.skill.wrong" } }],
    ["wrong activity mode", { activity: { learningEvidenceMode: "guided_practice" } }],
    ["wrong activity props", { activity: { props: { equation: "f(x) = x^2 + 9" } } }],
    ["wrong activity SRS policy", { activity: { srsEligible: true } }],
    ["wrong activity grading configuration", { activity: { gradingConfig: { autoGrade: false } } }],
    [
      "occupied section 4",
      {
        sections: [
          {
            _id: "section:4",
            phaseVersionId: "phase_versions:4",
            sequenceOrder: 4,
            sectionType: "text",
            content: { markdown: "wrong" },
          },
        ],
      },
    ],
    [
      "occupied section 5",
      {
        sections: [
          {
            _id: "section:5",
            phaseVersionId: "phase_versions:4",
            sequenceOrder: 5,
            sectionType: "activity",
            content: { activityId: "activities:wrong" },
          },
        ],
      },
    ],
    [
      "duplicate section 4",
      {
        sections: [
          {
            _id: "section:4a",
            phaseVersionId: "phase_versions:4",
            sequenceOrder: 4,
            sectionType: "text",
            content: {},
          },
          {
            _id: "section:4b",
            phaseVersionId: "phase_versions:4",
            sequenceOrder: 4,
            sectionType: "text",
            content: {},
          },
        ],
      },
    ],
    [
      "duplicate section 5",
      {
        sections: [
          {
            _id: "section:5a",
            phaseVersionId: "phase_versions:4",
            sequenceOrder: 5,
            sectionType: "activity",
            content: {},
          },
          {
            _id: "section:5b",
            phaseVersionId: "phase_versions:4",
            sequenceOrder: 5,
            sectionType: "activity",
            content: {},
          },
        ],
      },
    ],
  ])("rejects %s before it writes", async (_name, options) => {
    const harness = makeHarness(options as Parameters<typeof makeHarness>[0]);
    const before = structuredClone(harness.tables);

    await expect(
      linkIm3DomainRangeWorkedPhase(
        { db: harness.db } as never,
        "lesson_versions:1" as never,
        harness.activityId as never,
      ),
    ).rejects.toThrow();

    expect(harness.tables).toEqual(before);
    expect(harness.insert).not.toHaveBeenCalled();
    expect(harness.patch).not.toHaveBeenCalled();
  });
});
