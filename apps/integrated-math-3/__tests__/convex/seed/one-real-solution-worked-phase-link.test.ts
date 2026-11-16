import { describe, expect, it, vi } from "vitest";

import { linkIm3OneRealSolutionWorkedPhase } from "@/convex/seed/seed_lesson_1_2";

type TestSection = {
  _id: string;
  sequenceOrder: number;
  sectionType: string;
  content: Record<string, unknown>;
};

type TestPhase = { _id: string };

function makeContext(
  sections: TestSection[],
  phase: TestPhase | null = { _id: "phase_versions:4" },
) {
  const rows = new Map(sections.map((section) => [section._id, section]));
  const patch = vi.fn(async (id: string, value: Record<string, unknown>) => {
    const section = rows.get(id);
    if (section) Object.assign(section, value);
  });
  const insert = vi.fn(async () => "phase_sections:new");
  const remove = vi.fn(async () => undefined);
  const query = vi.fn((tableName: string) => {
    if (tableName === "phase_versions") {
      return {
        withIndex: vi.fn((_index: string, callback: (query: {
          eq: (field: string, value: unknown) => unknown;
        }) => unknown) => {
          const queryBuilder = {
            eq: vi.fn(function (this: typeof queryBuilder) {
              return this;
            }),
          };
          callback(queryBuilder);
          return {
            first: vi.fn(async () => phase),
          };
        }),
      };
    }
    if (tableName === "phase_sections") {
      return {
        withIndex: vi.fn((_index: string, callback: (query: {
          eq: (field: string, value: unknown) => unknown;
        }) => unknown) => {
          callback({ eq: vi.fn(() => undefined) });
          return {
            collect: vi.fn(async () => sections),
          };
        }),
      };
    }
    throw new Error(`Unexpected table ${tableName}`);
  });

  return {
    db: { query, patch, insert, delete: remove },
    patch,
    insert,
    delete: remove,
  };
}

describe("IM3 one-real-solution Worked Phase 4 link", () => {
  it("patches the Example 1 sections and preserves the separate section", async () => {
    const sections = [
      {
        _id: "phase_sections:text",
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "Old Example 1" },
      },
      {
        _id: "phase_sections:worked",
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "step-by-step-solver",
          activityId: "activities:legacy",
          props: { problemType: "graphing" },
        },
      },
      {
        _id: "phase_sections:other",
        sequenceOrder: 3,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: "activities:other",
        },
      },
    ] satisfies TestSection[];
    const ctx = makeContext(sections);

    await linkIm3OneRealSolutionWorkedPhase(
      ctx as never,
      "lesson_versions:2" as never,
      "activities:one-real-solution-worked" as never,
    );
    await linkIm3OneRealSolutionWorkedPhase(
      ctx as never,
      "lesson_versions:2" as never,
      "activities:one-real-solution-worked" as never,
    );

    expect(ctx.insert).not.toHaveBeenCalled();
    expect(ctx.delete).not.toHaveBeenCalled();
    expect(ctx.patch).toHaveBeenCalledTimes(4);
    expect(sections[0]?.content).toEqual({
      markdown: "## Example 1: One Real Solution\n\nSolve $10 - x^2 = 4x + 14$ by graphing.",
    });
    expect(sections[1]?.content).toEqual({
      componentKey: "graphing-explorer",
      activityId: "activities:one-real-solution-worked",
    });
    expect(sections[2]?.content).toEqual({
      componentKey: "graphing-explorer",
      activityId: "activities:other",
    });
  });

  it("throws a clear error when a required Phase 4 row is missing", async () => {
    const cases: Array<{
      name: string;
      phase: TestPhase | null;
      sections: TestSection[];
      message: string;
    }> = [
      {
        name: "Phase 4",
        phase: null,
        sections: [],
        message: "Lesson 1.2 Phase 4 is missing",
      },
      {
        name: "text section",
        phase: { _id: "phase_versions:4" },
        sections: [{
          _id: "phase_sections:worked",
          sequenceOrder: 2,
          sectionType: "activity",
          content: {},
        }],
        message: "Lesson 1.2 Phase 4 text section is missing",
      },
      {
        name: "activity section",
        phase: { _id: "phase_versions:4" },
        sections: [{
          _id: "phase_sections:text",
          sequenceOrder: 1,
          sectionType: "text",
          content: {},
        }],
        message: "Lesson 1.2 Phase 4 activity section is missing",
      },
    ];

    for (const testCase of cases) {
      const ctx = makeContext(testCase.sections, testCase.phase);
      await expect(linkIm3OneRealSolutionWorkedPhase(
        ctx as never,
        "lesson_versions:2" as never,
        "activities:one-real-solution-worked" as never,
      )).rejects.toThrow(testCase.message);
      expect(ctx.patch).not.toHaveBeenCalled();
      expect(ctx.insert).not.toHaveBeenCalled();
      expect(ctx.delete).not.toHaveBeenCalled();
    }
  });
});
