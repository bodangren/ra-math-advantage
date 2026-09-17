import { describe, expect, it, vi } from "vitest";

import { ensureIm3TeacherLedSourceActivity } from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const SOURCE_CONTENT = {
  displayName: "Graph a quadratic function by using a table",
  description: "Graph f(x) = x^2 + 2x - 3 by using a table. State the domain and range.",
  props: {
    variant: "plot_from_equation",
    equation: "f(x) = x^2 + 2x - 3",
  },
  gradingConfig: { autoGrade: false, partialCredit: false },
};

function makeContext(canonicalActivity: Record<string, unknown> | null) {
  const insertedActivities: Record<string, unknown>[] = [];
  const patchedActivities: Array<[string, Record<string, unknown>]> = [];
  const query = vi.fn((tableName: string) => {
    if (tableName === "phase_versions") {
      return {
        withIndex: vi.fn(() => ({
          first: vi.fn(async () => null),
        })),
      };
    }
    if (tableName === "activities") {
      return {
        withIndex: vi.fn(() => ({
          unique: vi.fn(async () => canonicalActivity),
        })),
      };
    }
    throw new Error(`Unexpected table ${tableName}`);
  });
  const insert = vi.fn(async (tableName: string, document: Record<string, unknown>) => {
    expect(tableName).toBe("activities");
    insertedActivities.push(document);
    return "activities:example-1";
  });
  const patch = vi.fn(async (id: string, document: Record<string, unknown>) => {
    patchedActivities.push([id, document]);
  });

  return {
    db: {
      query,
      get: vi.fn(async () => null),
      insert,
      patch,
    },
    insertedActivities,
    patchedActivities,
  };
}

describe("IM3 Example 1 graph Worked source activity", () => {
  it("persists the exact source content on insert and repair", async () => {
    const insertContext = makeContext(null);
    const insertedId = await ensureIm3TeacherLedSourceActivity(
      insertContext as never,
      "lesson_versions:1" as never,
      100,
    );

    expect(insertedId).toBe("activities:example-1");
    expect(insertContext.insertedActivities).toEqual([
      {
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        learningEvidenceMode: "worked_example",
        srsEligible: false,
        ...SOURCE_CONTENT,
        createdAt: 100,
        updatedAt: 100,
      },
    ]);
    expect(insertContext.patchedActivities).toEqual([]);

    const existingActivity = {
      _id: "activities:existing-example-1",
      stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      displayName: "Teacher-led: Explore quadratic graphs",
      description: "Teacher-led first exposure for the IM3 Mastery Advantage pilot.",
      props: {
        title: "Explore Quadratic Graphs",
        variant: "plot_from_equation",
        equation: "y = x^2",
      },
      gradingConfig: { autoGrade: false, partialCredit: false },
      createdAt: 50,
      updatedAt: 50,
    };
    const repairContext = makeContext(existingActivity);
    await ensureIm3TeacherLedSourceActivity(
      repairContext as never,
      "lesson_versions:1" as never,
      200,
    );

    expect(repairContext.insertedActivities).toEqual([]);
    expect(repairContext.patchedActivities).toEqual([
      [
        existingActivity._id,
        {
          stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          componentKey: "graphing-explorer",
          learningEvidenceMode: "worked_example",
          srsEligible: false,
          ...SOURCE_CONTENT,
          updatedAt: 200,
        },
      ],
    ]);
    expect(existingActivity.createdAt).toBe(50);
  });
});
