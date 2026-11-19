import { describe, expect, it } from "vitest";

import { getLessonProgress } from "@/convex/student";
import {
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const LESSON_ID = "lessons:equation-rate";
const LESSON_VERSION_ID = "lesson_versions:equation-rate";
const PHASE_ID = "phase_versions:equation-rate:1";
const VALID_ACTIVITY_ID = "activities:equation-worked";
const INVALID_ACTIVITY_ID = "activities:missing";
const ACTIVITY_PROPS = {
  sourceType: "function",
  data: { expression: "f(x) = -x^2 + 2x - 1" },
  interval: { start: -4, end: 4 },
};

type Row = Record<string, unknown> & { _id: string };

function createQueryContext() {
  const rows: Record<string, Row[]> = {
    lessons: [
      {
        _id: LESSON_ID,
        slug: "module-1-lesson-1",
        title: "Equation rate",
        unitNumber: 1,
        orderIndex: 1,
      },
    ],
    lesson_versions: [
      {
        _id: LESSON_VERSION_ID,
        lessonId: LESSON_ID,
        version: 1,
        status: "published",
      },
    ],
    phase_versions: [
      {
        _id: PHASE_ID,
        lessonVersionId: LESSON_VERSION_ID,
        phaseNumber: 1,
        phaseType: "worked_example",
      },
    ],
    student_progress: [],
    phase_sections: [
      {
        _id: "phase_sections:text",
        phaseVersionId: PHASE_ID,
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "Read this." },
      },
      {
        _id: "phase_sections:valid-activity",
        phaseVersionId: PHASE_ID,
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "rate-of-change-calculator",
          activityId: VALID_ACTIVITY_ID,
        },
      },
      {
        _id: "phase_sections:invalid-activity",
        phaseVersionId: PHASE_ID,
        sequenceOrder: 3,
        sectionType: "activity",
        content: {
          componentKey: "rate-of-change-calculator",
          activityId: INVALID_ACTIVITY_ID,
        },
      },
    ],
    activities: [
      {
        _id: VALID_ACTIVITY_ID,
        componentKey: "rate-of-change-calculator",
        props: ACTIVITY_PROPS,
        stableActivityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
        masteryNodeId: IM3_EQUATION_RATE_NODE,
        learningEvidenceMode: "worked_example",
        srsEligible: false,
      },
    ],
  };

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
      const selected = () =>
        (rows[tableName] ?? []).filter((row) =>
          [...conditions].every(([field, value]) => row[field] === value),
        );
      return {
        unique: async () => selected()[0] ?? null,
        collect: async () => selected(),
      };
    },
  });

  const db = {
    get: async (id: string) =>
      Object.values(rows)
        .flat()
        .find((row) => row._id === id) ?? null,
    normalizeId: (tableName: string, id: string) =>
      tableName === "activities" && rows.activities.some((row) => row._id === id) ? id : null,
    query,
  };

  return { db, rows };
}

type GetLessonProgressHandler = (
  ctx: unknown,
  args: { userId: string; lessonIdentifier: string },
) => Promise<{
  phases: Array<{ sections: Array<{ sectionType: string; content: unknown }> }>;
}>;

const getLessonProgressHandler = (
  getLessonProgress as unknown as { _handler: GetLessonProgressHandler }
)._handler;

describe("getLessonProgress activity props", () => {
  it("adds referenced activity props and preserves invalid and text sections", async () => {
    const { db } = createQueryContext();

    const result = await getLessonProgressHandler(
      { db },
      { userId: "profiles:learner", lessonIdentifier: LESSON_ID },
    );
    const sections = result.phases[0]?.sections ?? [];

    expect(sections[0]).toEqual({
      id: "phase_sections:text",
      sequenceOrder: 1,
      sectionType: "text",
      content: { markdown: "Read this." },
    });
    expect(sections[1]).toEqual({
      id: "phase_sections:valid-activity",
      sequenceOrder: 2,
      sectionType: "activity",
      content: {
        componentKey: "rate-of-change-calculator",
        activityId: VALID_ACTIVITY_ID,
        activityProps: ACTIVITY_PROPS,
        stableActivityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
        masteryNodeId: IM3_EQUATION_RATE_NODE,
        learningEvidenceMode: "worked_example",
        srsEligible: false,
      },
    });
    expect(sections[2]).toEqual({
      id: "phase_sections:invalid-activity",
      sequenceOrder: 3,
      sectionType: "activity",
      content: {
        componentKey: "rate-of-change-calculator",
        activityId: INVALID_ACTIVITY_ID,
      },
    });
  });
});
