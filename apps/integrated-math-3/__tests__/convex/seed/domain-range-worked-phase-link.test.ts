import { describe, expect, it, vi } from "vitest";

import {
  buildIm3DomainRangeWorkedSeedDocument,
  linkIm3DomainRangeWorkedPhase,
} from "@/convex/seed/seed_lesson_1_1";

type TestSection = {
  _id: string;
  phaseVersionId?: string;
  sequenceOrder: number;
  sectionType: string;
  content: Record<string, unknown>;
};

type TestPhase = { _id: string; phaseType: string };

function makeContext(
  sections: TestSection[],
  phase: TestPhase | null = { _id: "phase_versions:4", phaseType: "worked_example" },
) {
  const rows = new Map(sections.map((section) => [section._id, section]));
  const patch = vi.fn(async (id: string, value: Record<string, unknown>) => {
    const section = rows.get(id);
    if (section) Object.assign(section, value);
  });
  const insert = vi.fn(async () => "phase_sections:new");
  const activity = buildIm3DomainRangeWorkedSeedDocument(0);
  const query = vi.fn((tableName: string) => {
    if (tableName === "phase_versions") {
      return {
        withIndex: vi.fn(() => ({
          first: vi.fn(async () => phase),
          take: vi.fn(async (limit: number) => (phase ? [phase].slice(0, limit) : [])),
        })),
      };
    }
    if (tableName === "phase_sections") {
      return {
        withIndex: vi.fn(() => ({
          collect: vi.fn(async () => sections),
          take: vi.fn(async (limit: number) => sections.slice(0, limit)),
        })),
      };
    }
    throw new Error(`Unexpected table ${tableName}`);
  });

  return {
    db: { query, patch, insert, get: vi.fn(async () => activity) },
    patch,
    insert,
  };
}

describe("IM3 domain-range Worked Phase 4 link", () => {
  it("keeps the existing Worked link and preserves the separate teacher source", async () => {
    const domainRangeActivityId = "activities:domain-range-worked";
    const sections = [
      {
        _id: "phase_sections:text",
        phaseVersionId: "phase_versions:4",
        sequenceOrder: 4,
        sectionType: "text",
        content: {
          markdown:
            "## State the Domain and Range\n\nGraph $f(x) = x^2 + 2x - 3$. State the domain and range.",
        },
      },
      {
        _id: "phase_sections:worked",
        phaseVersionId: "phase_versions:4",
        sequenceOrder: 5,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: domainRangeActivityId,
        },
      },
      {
        _id: "phase_sections:teacher",
        phaseVersionId: "phase_versions:4",
        sequenceOrder: 6,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: "activities:teacher",
        },
      },
    ] satisfies TestSection[];
    const ctx = makeContext(sections, { _id: "phase_versions:4", phaseType: "worked_example" });

    await linkIm3DomainRangeWorkedPhase(
      ctx as never,
      "lesson_versions:1" as never,
      domainRangeActivityId as never,
    );
    await linkIm3DomainRangeWorkedPhase(
      ctx as never,
      "lesson_versions:1" as never,
      domainRangeActivityId as never,
    );

    expect(ctx.insert).not.toHaveBeenCalled();
    expect(ctx.patch).not.toHaveBeenCalled();
    expect(ctx.insert).not.toHaveBeenCalled();
    expect(sections[2]?.content.activityId).toBe("activities:teacher");
  });

  it("rejects a missing or duplicate Worked Phase 4", async () => {
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
        message: "Lesson 1.1 Worked Phase 4 must be unique",
      },
    ];

    for (const testCase of cases) {
      const ctx = makeContext(testCase.sections, testCase.phase);
      await expect(
        linkIm3DomainRangeWorkedPhase(
          ctx as never,
          "lesson_versions:1" as never,
          "activities:domain-range-worked" as never,
        ),
      ).rejects.toThrow(testCase.message);
      expect(ctx.patch).not.toHaveBeenCalled();
      expect(ctx.insert).not.toHaveBeenCalled();
    }
  });
});
