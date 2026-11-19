import { describe, expect, it, vi } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import * as seedLesson12 from "@/convex/seed/seed_lesson_1_2";

type TestSection = {
  _id: string;
  sequenceOrder: number;
  sectionType: string;
  content: Record<string, unknown>;
};

type TestPhase = { _id: string };

type OptionalWorkedPhaseLink =
  | ((
      ctx: never,
      lessonVersionId: Id<"lesson_versions">,
      activityId: Id<"activities">,
    ) => Promise<void>)
  | undefined;

function makeContext(
  sections: TestSection[],
  phase: TestPhase | null = { _id: "phase_versions:5" },
) {
  const operations: string[] = [];
  const rows = new Map(sections.map((section) => [section._id, section]));
  const patch = vi.fn(async (id: string, value: Record<string, unknown>) => {
    operations.push(`patch:${id}`);
    const section = rows.get(id);
    if (section) Object.assign(section, value);
  });
  const insert = vi.fn(async () => "phase_sections:new");
  const remove = vi.fn(async () => undefined);
  const query = vi.fn((tableName: string) => {
    operations.push(`query:${tableName}`);
    if (tableName === "phase_versions") {
      return {
        withIndex: vi.fn(
          (
            index: string,
            callback: (query: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            operations.push(`index:${index}`);
            const queryBuilder = {
              eq: vi.fn(function (this: typeof queryBuilder, field: string, value: unknown) {
                operations.push(`eq:${field}:${String(value)}`);
                return this;
              }),
            };
            callback(queryBuilder);
            return {
              first: vi.fn(async () => {
                operations.push("first");
                return phase;
              }),
            };
          },
        ),
      };
    }
    if (tableName === "phase_sections") {
      return {
        withIndex: vi.fn(
          (
            index: string,
            callback: (query: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            operations.push(`index:${index}`);
            callback({
              eq: vi.fn((field: string, value: unknown) => {
                operations.push(`eq:${field}:${String(value)}`);
                return undefined;
              }),
            });
            return {
              collect: vi.fn(async () => {
                operations.push("collect");
                return sections;
              }),
            };
          },
        ),
      };
    }
    throw new Error(`Unexpected table ${tableName}`);
  });

  return {
    ctx: { db: { query, patch, insert, delete: remove } } as never,
    operations,
    patch,
    insert,
    delete: remove,
  };
}

describe("IM3 two-real-solutions Worked Phase 5 link", () => {
  it("patches the Example 2 sections twice and preserves the separate section", async () => {
    const linkWorkedPhase = (
      seedLesson12 as {
        linkIm3TwoRealSolutionsWorkedPhase?: OptionalWorkedPhaseLink;
      }
    ).linkIm3TwoRealSolutionsWorkedPhase;
    expect(typeof linkWorkedPhase).toBe("function");
    if (typeof linkWorkedPhase !== "function") return;

    const sections = [
      {
        _id: "phase_sections:text",
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "Old Example 2" },
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

    await linkWorkedPhase(
      ctx.ctx,
      "lesson_versions:2" as Id<"lesson_versions">,
      "activities:two-real-solutions-worked" as Id<"activities">,
    );
    await linkWorkedPhase(
      ctx.ctx,
      "lesson_versions:2" as Id<"lesson_versions">,
      "activities:two-real-solutions-worked" as Id<"activities">,
    );

    expect(ctx.operations).toEqual([
      "query:phase_versions",
      "index:by_lesson_version_and_phase",
      "eq:lessonVersionId:lesson_versions:2",
      "eq:phaseNumber:5",
      "first",
      "query:phase_sections",
      "index:by_phase_version",
      "eq:phaseVersionId:phase_versions:5",
      "collect",
      "patch:phase_sections:text",
      "patch:phase_sections:worked",
      "query:phase_versions",
      "index:by_lesson_version_and_phase",
      "eq:lessonVersionId:lesson_versions:2",
      "eq:phaseNumber:5",
      "first",
      "query:phase_sections",
      "index:by_phase_version",
      "eq:phaseVersionId:phase_versions:5",
      "collect",
      "patch:phase_sections:text",
      "patch:phase_sections:worked",
    ]);
    expect(ctx.patch).toHaveBeenCalledTimes(4);
    expect(ctx.insert).not.toHaveBeenCalled();
    expect(ctx.delete).not.toHaveBeenCalled();
    expect(sections[0]?.content).toEqual({
      markdown:
        "## Example 2: Two Real Solutions\n\nUse a quadratic equation to find two real numbers with a sum of 24 and a product of 143.",
    });
    expect(sections[1]?.content).toEqual({
      componentKey: "graphing-explorer",
      activityId: "activities:two-real-solutions-worked",
    });
    expect(sections[2]?.content).toEqual({
      componentKey: "graphing-explorer",
      activityId: "activities:other",
    });
  });

  it("throws a clear error when a required Phase 5 row is missing", async () => {
    const linkWorkedPhase = (
      seedLesson12 as {
        linkIm3TwoRealSolutionsWorkedPhase?: OptionalWorkedPhaseLink;
      }
    ).linkIm3TwoRealSolutionsWorkedPhase;
    expect(typeof linkWorkedPhase).toBe("function");
    if (typeof linkWorkedPhase !== "function") return;

    const cases: Array<{
      name: string;
      phase: TestPhase | null;
      sections: TestSection[];
      message: string;
    }> = [
      {
        name: "Phase 5",
        phase: null,
        sections: [],
        message: "Lesson 1.2 Phase 5 is missing",
      },
      {
        name: "text section",
        phase: { _id: "phase_versions:5" },
        sections: [
          {
            _id: "phase_sections:worked",
            sequenceOrder: 2,
            sectionType: "activity",
            content: {},
          },
        ],
        message: "Lesson 1.2 Phase 5 text section is missing",
      },
      {
        name: "activity section",
        phase: { _id: "phase_versions:5" },
        sections: [
          {
            _id: "phase_sections:text",
            sequenceOrder: 1,
            sectionType: "text",
            content: {},
          },
        ],
        message: "Lesson 1.2 Phase 5 activity section is missing",
      },
    ];

    for (const testCase of cases) {
      const ctx = makeContext(testCase.sections, testCase.phase);
      await expect(
        linkWorkedPhase(
          ctx.ctx,
          "lesson_versions:2" as Id<"lesson_versions">,
          "activities:two-real-solutions-worked" as Id<"activities">,
        ),
      ).rejects.toThrow(testCase.message);
      expect(ctx.patch).not.toHaveBeenCalled();
      expect(ctx.insert).not.toHaveBeenCalled();
      expect(ctx.delete).not.toHaveBeenCalled();
    }
  });
});
