import { describe, expect, it, vi } from "vitest";

import { ensureIm3TeacherLedSourceActivity } from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

type TestRow = {
  _id: string;
  sequenceOrder: number;
  sectionType: string;
  content: Record<string, unknown>;
  [key: string]: unknown;
};

function makeContext(
  activities: Record<string, TestRow>,
  sections: TestRow[],
  canonicalActivity: TestRow | null,
) {
  const query = vi.fn((tableName: string) => {
    if (tableName === "phase_versions") {
      return {
        withIndex: vi.fn(() => ({
          first: vi.fn(async () => ({ _id: "phase_versions:4" })),
        })),
      };
    }
    if (tableName === "phase_sections") {
      return {
        withIndex: vi.fn(() => ({
          collect: vi.fn(async () => sections),
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
  const patch = vi.fn(async (..._args: [string, Record<string, unknown>]) => undefined);
  const insert = vi.fn(async (..._args: [string, Record<string, unknown>]) => "activities:new");

  return {
    db: {
      query,
      get: vi.fn(async (id: string) => activities[id] ?? null),
      patch,
      insert,
    },
    patch,
    insert,
  };
}

function makeActivity(id: string, fields: Record<string, unknown>): TestRow {
  return {
    _id: id,
    sequenceOrder: 0,
    sectionType: "activity",
    content: {},
    ...fields,
  };
}

describe("IM3 teacher-led source preservation", () => {
  it("keeps the exact teacher source when another Worked activity appears first", async () => {
    const teacherActivity = makeActivity("activities:teacher", {
      stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
    });
    const domainActivity = makeActivity("activities:domain-range-worked", {
      stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });
    const sections = [
      {
        _id: "phase_sections:domain-range",
        sequenceOrder: 1,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: domainActivity._id,
        },
      },
      {
        _id: "phase_sections:teacher",
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: teacherActivity._id,
        },
      },
    ] satisfies TestRow[];
    const ctx = makeContext(
      {
        [teacherActivity._id]: teacherActivity,
        [domainActivity._id]: domainActivity,
      },
      sections,
      teacherActivity,
    );

    const result = await ensureIm3TeacherLedSourceActivity(
      ctx as never,
      "lesson_versions:1" as never,
      200,
    );

    expect(result).toBe(teacherActivity._id);
    expect(ctx.patch).toHaveBeenCalledTimes(1);
    expect(ctx.patch).toHaveBeenCalledWith(
      teacherActivity._id,
      expect.objectContaining({
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        updatedAt: 200,
      }),
    );
    expect(ctx.patch.mock.calls.some(([id]) => id === domainActivity._id)).toBe(false);
    expect(ctx.patch.mock.calls.some(([id]) => id === "phase_sections:domain-range")).toBe(false);
    expect(sections.map((section) => section.content)).toEqual([
      { componentKey: "graphing-explorer", activityId: domainActivity._id },
      { componentKey: "graphing-explorer", activityId: teacherActivity._id },
    ]);
  });

  it("creates the teacher source when only the domain-range Worked source exists", async () => {
    const domainActivity = makeActivity("activities:domain-range-worked", {
      stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });
    const sections = [
      {
        _id: "phase_sections:domain-range",
        sequenceOrder: 1,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: domainActivity._id,
        },
      },
    ] satisfies TestRow[];
    const ctx = makeContext(
      { [domainActivity._id]: domainActivity },
      sections,
      null,
    );

    const result = await ensureIm3TeacherLedSourceActivity(
      ctx as never,
      "lesson_versions:1" as never,
      400,
    );

    expect(result).toBe("activities:new");
    expect(ctx.insert).toHaveBeenCalledTimes(2);
    expect(ctx.insert).toHaveBeenCalledWith(
      "activities",
      expect.objectContaining({
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        updatedAt: 400,
      }),
    );
    expect(ctx.insert).toHaveBeenCalledWith(
      "phase_sections",
      expect.objectContaining({
        phaseVersionId: "phase_versions:4",
        content: {
          componentKey: "graphing-explorer",
          activityId: "activities:new",
        },
      }),
    );
    expect(ctx.patch).not.toHaveBeenCalled();
    expect(sections[0]?.content).toEqual({
      componentKey: "graphing-explorer",
      activityId: domainActivity._id,
    });
  });

  it("adds a section for an existing teacher source beside the domain-range Worked source", async () => {
    const teacherActivity = makeActivity("activities:teacher", {
      stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
    });
    const domainActivity = makeActivity("activities:domain-range-worked", {
      stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });
    const sections = [
      {
        _id: "phase_sections:domain-range",
        sequenceOrder: 1,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: domainActivity._id,
        },
      },
    ] satisfies TestRow[];
    const ctx = makeContext(
      {
        [teacherActivity._id]: teacherActivity,
        [domainActivity._id]: domainActivity,
      },
      sections,
      teacherActivity,
    );

    const result = await ensureIm3TeacherLedSourceActivity(
      ctx as never,
      "lesson_versions:1" as never,
      500,
    );

    expect(result).toBe(teacherActivity._id);
    expect(ctx.insert).toHaveBeenCalledTimes(1);
    expect(ctx.insert).toHaveBeenCalledWith(
      "phase_sections",
      expect.objectContaining({
        phaseVersionId: "phase_versions:4",
        content: {
          componentKey: "graphing-explorer",
          activityId: teacherActivity._id,
        },
      }),
    );
    expect(ctx.insert.mock.calls.some(([table]) => table === "activities")).toBe(false);
    expect(ctx.patch).toHaveBeenCalledTimes(1);
    expect(ctx.patch).toHaveBeenCalledWith(
      teacherActivity._id,
      expect.objectContaining({
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        updatedAt: 500,
      }),
    );
    expect(ctx.patch.mock.calls.some(([id]) => id === domainActivity._id)).toBe(false);
    expect(sections[0]?.content).toEqual({
      componentKey: "graphing-explorer",
      activityId: domainActivity._id,
    });
  });

  it("converges a legacy graphing source with no stable ID", async () => {
    const legacyActivity = makeActivity("activities:legacy", {
      componentKey: "graphing-explorer",
    });
    const sections = [
      {
        _id: "phase_sections:legacy",
        sequenceOrder: 1,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: legacyActivity._id,
        },
      },
    ] satisfies TestRow[];
    const ctx = makeContext(
      { [legacyActivity._id]: legacyActivity },
      sections,
      null,
    );

    const result = await ensureIm3TeacherLedSourceActivity(
      ctx as never,
      "lesson_versions:1" as never,
      300,
    );

    expect(result).toBe(legacyActivity._id);
    expect(ctx.patch).toHaveBeenCalledTimes(1);
    expect(ctx.patch).toHaveBeenCalledWith(
      legacyActivity._id,
      expect.objectContaining({
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        updatedAt: 300,
      }),
    );
    expect(sections[0]?.content).toEqual({
      componentKey: "graphing-explorer",
      activityId: legacyActivity._id,
    });
  });
});
