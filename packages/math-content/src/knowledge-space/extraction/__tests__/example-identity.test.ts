import { describe, expect, it } from "vitest";
import { assembleDraftInventory } from "../assembler";
import type { ClassPeriodPlanExtract } from "../parser";

const classPeriodPlan: ClassPeriodPlanExtract = {
  moduleNumber: 2,
  examples: [],
  lessons: [
    {
      lessonRef: "2-3",
      moduleNumber: 2,
      lessonNumber: 3,
      objectives: [],
      examples: [
        {
          lessonRef: "2-3",
          exampleNumbers: [1, 2],
          title: "Solve equations",
          rawText: "Examples 1–2",
        },
        {
          lessonRef: "2-3",
          exampleNumbers: [2, 3],
          title: "Use distribution",
          rawText: "Examples 2–3",
        },
      ],
    },
    {
      lessonRef: "2-4",
      moduleNumber: 2,
      lessonNumber: 4,
      objectives: [],
      examples: [
        {
          lessonRef: "2-4",
          exampleNumbers: [1],
          title: "Variables on both sides",
          rawText: "Example 1",
        },
      ],
    },
  ],
};

function examples() {
  return assembleDraftInventory({
    course: "im1",
    moduleOverview: {
      moduleNumber: 2,
      title: "Equations",
      description: "",
      lessons: [],
      skills: [],
    },
    classPeriodPlan,
    sourceFile: "curriculum/module-2-class-period-plan.md",
  }).filter((node) => node.kind === "worked_example");
}

describe("worked example source identity", () => {
  it("uses one source identity when adjacent objectives share a lesson example", () => {
    const rows = examples().filter(
      (node) => node.metadata.lesson === "3" && node.metadata.exampleNumber === 2,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("math.im1.example.2.3.002");
    expect(rows[0]?.sourceRefs).toEqual([
      "curriculum/module-2-class-period-plan.md (2-3, Example 2)",
    ]);
  });

  it("keeps later occurrence IDs and distinguishes the same number in another lesson", () => {
    expect(
      examples().map((node) => [node.id, node.metadata.lesson, node.metadata.exampleNumber]),
    ).toEqual([
      ["math.im1.example.2.3.001", "3", 1],
      ["math.im1.example.2.3.002", "3", 2],
      ["math.im1.example.2.3.004", "3", 3],
      ["math.im1.example.2.4.005", "4", 1],
    ]);
  });
});
