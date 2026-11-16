import { describe, expect, it, vi } from "vitest";

import {
  buildIm3OneRealSolutionGuidedSeedDocument,
  buildIm3OneRealSolutionGuidedPracticeSeedDocuments,
  buildIm3OneRealSolutionIndependentSeedDocument,
  buildIm3OneRealSolutionIndependentPracticeSeedDocuments,
  buildIm3OneRealSolutionWorkedSeedDocument,
  buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments,
  buildIm3TwoRealSolutionsGuidedSeedDocument,
  buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments,
  buildIm3TwoRealSolutionsIndependentSeedDocument,
  buildIm3TwoRealSolutionsWorkedSeedDocument,
  seedLesson2,
} from "@/convex/seed/seed_lesson_1_2";
import type { Id } from "@/convex/_generated/dataModel";
import {
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

type Row = Record<string, unknown> & { _id: string };
type SeedHandler = (ctx: unknown) => Promise<{
  lessonId: string;
  lessonVersionId: string;
  phasesCreated: number;
  activitiesCreated: number;
}>;

const seedLesson2Handler = (seedLesson2 as unknown as { _handler: SeedHandler })._handler;

function matches(row: Row, conditions: ReadonlyMap<string, unknown>): boolean {
  return [...conditions].every(([field, value]) => row[field] === value);
}

function createUpgradeState() {
  const lessonId = "lessons:module-1-lesson-2";
  const lessonVersionId = "lesson_versions:module-1-lesson-2";
  const phaseFourId = "phase_versions:module-1-lesson-2:4";
  const phaseFiveId = "phase_versions:module-1-lesson-2:5";
  const rows: Record<string, Row[]> = {
    lessons: [{
      _id: lessonId,
      slug: "module-1-lesson-2",
      title: "Protected Lesson 1.2 title",
    }],
    lesson_versions: [{
      _id: lessonVersionId,
      lessonId,
      title: "Protected Lesson 1.2 version title",
    }],
    phase_versions: Array.from({ length: 10 }, (_, index) => ({
      _id: `phase_versions:module-1-lesson-2:${index + 1}`,
      lessonVersionId,
      phaseNumber: index + 1,
    })),
    phase_sections: [{
      _id: "phase_sections:lesson-2-example-1-text",
      phaseVersionId: phaseFourId,
      sequenceOrder: 1,
      sectionType: "text",
      content: { markdown: "## Example 1: Legacy quadratic lesson" },
    }, {
      _id: "phase_sections:lesson-2-example-1-activity",
      phaseVersionId: phaseFourId,
      sequenceOrder: 2,
      sectionType: "activity",
      content: {
        componentKey: "step-by-step-solver",
        activityId: "activities:legacy-one-real-solution",
      },
    }, {
      _id: "phase_sections:lesson-2-example-1-other",
      phaseVersionId: phaseFourId,
      sequenceOrder: 3,
      sectionType: "activity",
      content: {
        componentKey: "graphing-explorer",
        activityId: "activities:unrelated-phase-4-activity",
      },
    }, {
      _id: "phase_sections:lesson-2-example-2-text",
      phaseVersionId: phaseFiveId,
      sequenceOrder: 1,
      sectionType: "text",
      content: { markdown: "## Example 2: Legacy quadratic lesson" },
    }, {
      _id: "phase_sections:lesson-2-example-2-activity",
      phaseVersionId: phaseFiveId,
      sequenceOrder: 2,
      sectionType: "activity",
      content: {
        componentKey: "step-by-step-solver",
        activityId: "activities:legacy-two-real-solutions",
      },
    }, {
      _id: "phase_sections:lesson-2-example-2-other",
      phaseVersionId: phaseFiveId,
      sequenceOrder: 3,
      sectionType: "activity",
      content: {
        componentKey: "graphing-explorer",
        activityId: "activities:unrelated-phase-5-activity",
      },
    }],
    activities: [],
    practice_variants: [],
    practice_items: [],
  };
  const patchCalls: Array<[string, Record<string, unknown>]> = [];
  const insertCalls: Array<[string, Record<string, unknown>]> = [];

  const query = (tableName: string) => ({
    withIndex: (
      _indexName: string,
      configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
    ) => {
      const conditions = new Map<string, unknown>();
      const index = {
        eq(field: string, value: unknown) {
          conditions.set(field, value);
          return index;
        },
      };
      configure(index);
      const selected = () => (rows[tableName] ?? []).filter((row) => matches(row, conditions));
      return {
        unique: async () => selected()[0] ?? null,
        first: async () => selected()[0] ?? null,
        collect: async () => selected(),
        take: async (limit: number) => selected().slice(0, limit),
      };
    },
  });

  const insert = async (tableName: string, document: Record<string, unknown>) => {
    const id = `${tableName}:inserted-${insertCalls.length + 1}`;
    const row = { _id: id, ...document };
    (rows[tableName] ??= []).push(row);
    insertCalls.push([tableName, document]);
    return id;
  };
  const patch = async (id: string, document: Record<string, unknown>) => {
    patchCalls.push([id, document]);
    for (const tableRows of Object.values(rows)) {
      const row = tableRows.find((candidate) => candidate._id === id);
      if (row) Object.assign(row, document);
    }
  };

  return {
    ctx: { db: { query, insert, patch } },
    insertCalls,
    patchCalls,
    rows,
    lessonId,
    lessonVersionId,
    phaseFourId,
    phaseFiveId,
  };
}

describe("IM3 one-real-solution Lesson 1.2 seed upgrade", () => {
  it("converges activities and the Worked Phase 4 link across two handler runs", async () => {
    const state = createUpgradeState();
    const nowSpy = vi.spyOn(Date, "now")
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(200);

    try {
      const first = await seedLesson2Handler(state.ctx);
      const firstInsertCount = state.insertCalls.length;
      const firstTwoRealPhysicalIds = {
        activities: state.rows.activities
          .filter((row) => ([
            IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
            IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
            IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
          ] as readonly string[]).includes(String(row.stableActivityId)))
          .map((row) => row._id),
        variants: state.rows.practice_variants
          .filter((row) => ([
            IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
            IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
          ] as readonly string[]).includes(String(row.variantKey)))
          .map((row) => row._id),
        items: state.rows.practice_items
          .filter((row) => ([
            `${IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID}:seed-5`,
            `${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}:seed-2`,
          ] as readonly string[]).includes(String(row.practiceItemId)))
          .map((row) => row._id),
      };
      const second = await seedLesson2Handler(state.ctx);

      expect(first).toEqual({
        lessonId: state.lessonId,
        lessonVersionId: state.lessonVersionId,
        phasesCreated: 0,
        activitiesCreated: 0,
      });
      expect(second).toEqual({
        lessonId: state.lessonId,
        lessonVersionId: state.lessonVersionId,
        phasesCreated: 0,
        activitiesCreated: 0,
      });
      expect(state.rows.lessons[0]?.title).toBe("Protected Lesson 1.2 title");
      expect(state.rows.lesson_versions[0]?.title).toBe("Protected Lesson 1.2 version title");
      expect(state.patchCalls.map(([id]) => id)).not.toContain(state.lessonId);
      expect(state.patchCalls.map(([id]) => id)).not.toContain(state.lessonVersionId);

      expect(state.insertCalls).toHaveLength(14);
      expect(state.insertCalls).toHaveLength(firstInsertCount);
      expect(state.insertCalls.filter(([tableName]) => tableName === "activities")).toHaveLength(6);
      expect(state.insertCalls.filter(([tableName]) => tableName === "practice_variants")).toHaveLength(4);
      expect(state.insertCalls.filter(([tableName]) => tableName === "practice_items")).toHaveLength(4);
      expect(state.insertCalls.slice(7).map(([tableName, document]) => [
        tableName,
        document.stableActivityId ?? document.practiceItemId ?? document.variantKey,
      ])).toEqual([
        ["activities", IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID],
        ["activities", IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID],
        ["practice_variants", IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID],
        ["practice_items", `${IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID}:seed-5`],
        ["activities", IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID],
        ["practice_variants", IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID],
        ["practice_items", `${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}:seed-2`],
      ]);

      const expectedActivities = [
        [IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID, buildIm3OneRealSolutionWorkedSeedDocument(200)],
        [IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID, buildIm3OneRealSolutionGuidedSeedDocument(200)],
        [IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID, buildIm3OneRealSolutionIndependentSeedDocument(200)],
      ] as const;
      for (const [stableActivityId, expectedActivity] of expectedActivities) {
        const activities = state.rows.activities.filter((activity) => (
          activity.stableActivityId === stableActivityId
        ));
        expect(activities).toHaveLength(1);
        expect(activities[0]).toEqual({
          ...expectedActivity,
          createdAt: 100,
          _id: activities[0]?._id,
        });
        expect(activities[0]?.masteryNodeId).toBe(IM3_ONE_REAL_SOLUTION_NODE);
      }

      const phaseFourSections = state.rows.phase_sections.filter((section) => (
        section.phaseVersionId === state.phaseFourId
      ));
      expect(phaseFourSections.find((section) => section.sequenceOrder === 1)?.content).toEqual({
        markdown: "## Example 1: One Real Solution\n\nSolve $10 - x^2 = 4x + 14$ by graphing.",
      });
      const workedActivity = state.rows.activities.find((activity) => (
        activity.stableActivityId === IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID
      ));
      expect(phaseFourSections.find((section) => section.sequenceOrder === 2)?.content).toEqual({
        componentKey: "graphing-explorer",
        activityId: workedActivity?._id,
      });
      expect(phaseFourSections.find((section) => section.sequenceOrder === 3)?.content).toEqual({
        componentKey: "graphing-explorer",
        activityId: "activities:unrelated-phase-4-activity",
      });
      const guidedActivity = state.rows.activities.find((activity) => (
        activity.stableActivityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
      ));
      expect(guidedActivity).toBeDefined();
      const guidedDocuments = buildIm3OneRealSolutionGuidedPracticeSeedDocuments(
        guidedActivity!._id as Id<"activities">,
        200,
      );
      const guidedVariants = state.rows.practice_variants.filter((variant) => (
        variant.variantKey === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
      ));
      const guidedItems = state.rows.practice_items.filter((item) => (
        item.practiceItemId === guidedDocuments.item.practiceItemId
      ));
      expect(guidedVariants).toHaveLength(1);
      expect(guidedItems).toHaveLength(1);
      expect(guidedVariants[0]).toEqual({
        ...guidedDocuments.variant,
        _id: guidedVariants[0]!._id,
      });
      expect(guidedItems[0]).toEqual({
        ...guidedDocuments.item,
        _id: guidedItems[0]!._id,
      });
      expect(state.patchCalls.map(([id]) => id)).toContain(guidedVariants[0]!._id);
      expect(state.patchCalls.map(([id]) => id)).toContain(guidedItems[0]!._id);

      const independentActivity = state.rows.activities.find((activity) => (
        activity.stableActivityId === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID
      ));
      expect(independentActivity).toBeDefined();
      const independentDocuments = buildIm3OneRealSolutionIndependentPracticeSeedDocuments(
        independentActivity!._id as Id<"activities">,
        200,
      );
      const independentVariants = state.rows.practice_variants.filter((variant) => (
        variant.variantKey === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID
      ));
      const independentItems = state.rows.practice_items.filter((item) => (
        item.practiceItemId === independentDocuments.item.practiceItemId
      ));
      expect(independentVariants).toHaveLength(1);
      expect(independentItems).toHaveLength(1);
      expect(independentVariants[0]).toEqual({
        ...independentDocuments.variant,
        _id: independentVariants[0]!._id,
      });
      expect(independentItems[0]).toEqual({
        ...independentDocuments.item,
        _id: independentItems[0]!._id,
      });
      expect(state.patchCalls.map(([id]) => id)).toContain(independentVariants[0]!._id);
      expect(state.patchCalls.map(([id]) => id)).toContain(independentItems[0]!._id);

      const expectedTwoRealActivities = [
        [IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID, buildIm3TwoRealSolutionsWorkedSeedDocument(200)],
        [IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID, buildIm3TwoRealSolutionsGuidedSeedDocument(200)],
        [IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID, buildIm3TwoRealSolutionsIndependentSeedDocument(200)],
      ] as const;
      for (const [stableActivityId, expectedActivity] of expectedTwoRealActivities) {
        const activities = state.rows.activities.filter((activity) => (
          activity.stableActivityId === stableActivityId
        ));
        expect(activities).toHaveLength(1);
        expect(activities[0]).toEqual({
          ...expectedActivity,
          createdAt: 100,
          _id: activities[0]?._id,
        });
        expect(activities[0]?.updatedAt).toBe(200);
        expect(activities[0]?.masteryNodeId).toBe(IM3_TWO_REAL_SOLUTIONS_NODE);
      }

      expect(state.rows.activities
        .filter((row) => ([
          IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
          IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
          IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        ] as readonly string[]).includes(String(row.stableActivityId)))
        .map((row) => row._id)).toEqual(firstTwoRealPhysicalIds.activities);
      expect(state.rows.practice_variants
        .filter((row) => ([
          IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
          IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        ] as readonly string[]).includes(String(row.variantKey)))
        .map((row) => row._id)).toEqual(firstTwoRealPhysicalIds.variants);
      expect(state.rows.practice_items
        .filter((row) => ([
          `${IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID}:seed-5`,
          `${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}:seed-2`,
        ] as readonly string[]).includes(String(row.practiceItemId)))
        .map((row) => row._id)).toEqual(firstTwoRealPhysicalIds.items);

      const twoRealGuidedActivity = state.rows.activities.find((activity) => (
        activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
      ));
      expect(twoRealGuidedActivity).toBeDefined();
      const twoRealGuidedDocuments = buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments(
        twoRealGuidedActivity!._id as Id<"activities">,
        200,
      );
      const twoRealGuidedVariants = state.rows.practice_variants.filter((variant) => (
        variant.variantKey === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
      ));
      const twoRealGuidedItems = state.rows.practice_items.filter((item) => (
        item.practiceItemId === twoRealGuidedDocuments.item.practiceItemId
      ));
      expect(twoRealGuidedVariants).toHaveLength(1);
      expect(twoRealGuidedItems).toHaveLength(1);
      expect(twoRealGuidedVariants[0]).toEqual({
        ...twoRealGuidedDocuments.variant,
        _id: twoRealGuidedVariants[0]!._id,
      });
      expect(twoRealGuidedItems[0]).toEqual({
        ...twoRealGuidedDocuments.item,
        _id: twoRealGuidedItems[0]!._id,
      });

      const twoRealIndependentActivity = state.rows.activities.find((activity) => (
        activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID
      ));
      expect(twoRealIndependentActivity).toBeDefined();
      const twoRealIndependentDocuments = buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments(
        twoRealIndependentActivity!._id as Id<"activities">,
        200,
      );
      const twoRealIndependentVariants = state.rows.practice_variants.filter((variant) => (
        variant.variantKey === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID
      ));
      const twoRealIndependentItems = state.rows.practice_items.filter((item) => (
        item.practiceItemId === twoRealIndependentDocuments.item.practiceItemId
      ));
      expect(twoRealIndependentVariants).toHaveLength(1);
      expect(twoRealIndependentItems).toHaveLength(1);
      expect(twoRealIndependentVariants[0]).toEqual({
        ...twoRealIndependentDocuments.variant,
        _id: twoRealIndependentVariants[0]!._id,
      });
      expect(twoRealIndependentItems[0]).toEqual({
        ...twoRealIndependentDocuments.item,
        _id: twoRealIndependentItems[0]!._id,
      });

      const phaseFiveSections = state.rows.phase_sections.filter((section) => (
        section.phaseVersionId === state.phaseFiveId
      ));
      expect(phaseFiveSections.find((section) => section.sequenceOrder === 1)?.content).toEqual({
        markdown: "## Example 2: Two Real Solutions\n\nUse a quadratic equation to find two real numbers with a sum of 24 and a product of 143.",
      });
      const twoRealWorkedActivity = state.rows.activities.find((activity) => (
        activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID
      ));
      expect(phaseFiveSections.find((section) => section.sequenceOrder === 2)?.content).toEqual({
        componentKey: "graphing-explorer",
        activityId: twoRealWorkedActivity?._id,
      });
      expect(phaseFiveSections.find((section) => section.sequenceOrder === 3)?.content).toEqual({
        componentKey: "graphing-explorer",
        activityId: "activities:unrelated-phase-5-activity",
      });
    } finally {
      nowSpy.mockRestore();
    }
  });
});
