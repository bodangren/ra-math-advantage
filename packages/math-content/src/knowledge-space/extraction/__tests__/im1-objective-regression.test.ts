import { describe, expect, it } from "vitest";
import { assembleDraftInventory } from "../assembler";
import { parseClassPeriodPlan, parseModuleOverview } from "../parser";

const moduleOnePlan = String.raw`
# Module 1 Class-Period Plan

## Period-by-Period Plan

| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |
|---|---|---|---|---|---|---|
| 1 | instruction | 1-1 | 1a. Translate verbal descriptions into correct numerical expressions using operation symbols and grouping. | 1-1, Examples 1-2 — Translate simple expressions; Translate grouped expressions | 1b | First objective. |
| 2 | instruction | 1-1 | 1b. Evaluate numerical expressions accurately using the order of operations. | 1-1, Examples 4-7 — Evaluate powers; Evaluate grouping; Evaluate fractions; Evaluate context | 1a | Second objective. |
`;

const moduleTwoPlan = String.raw`
# Module 2 Class-Period Plan

## Period-by-Period Plan

| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |
|---|---|---|---|---|---|---|
| 12 | instruction | 2-5 | 2i. Solve absolute value equations of the form |expression| = constant and recognize when no solution exists. | 2-5, Examples 1-3 — Solve equations; Identify no solution; Apply in context | 2j | Two-case method, no-solution recognition, and tolerance contexts. |
| 13 | instruction | 2-5 | 2j. Graph the solution set of an absolute value equation on a number line and write absolute value equations from graphs. | 2-5, Examples 3-4 — Apply in context; Write equations from graphs | 2i | Preserve both objectives. |
`;

const moduleOverview = parseModuleOverview(`
# Module 2: Equations

## Overview

Equation methods and applications.

### Lesson 1: Absolute Value Equations

Solve and graph absolute value equations.
`);

describe("IM1 class-period objective regression", () => {
  it("parses compact tables without splitting pipes inside inline code", () => {
    const compactPlan = [
      "# Module 2 Class-Period Plan",
      "",
      "## Period-by-Period Plan",
      "",
      "|Period|Day Type|Source Textbook Lesson|Primary Objective|Worked Examples|Embedded Objectives|Notes|",
      "|---|---|---|---|---|---|---|",
      "|12|instruction|2-5|`2i. Solve equations of the form |expression| = constant, and recognize when no solution exists.`|2-5, Example 1 — Solve an equation|2j|Keep the complete objective.|",
    ].join("\n");

    expect(parseClassPeriodPlan(compactPlan).lessons[0]?.objectives[0]).toEqual({
      code: "2i",
      description:
        "Solve equations of the form |expression| = constant, and recognize when no solution exists",
    });
  });

  it("preserves both described objectives from repeated lesson rows", () => {
    const lesson = parseClassPeriodPlan(moduleOnePlan).lessons[0];

    expect(lesson?.objectives).toEqual([
      {
        code: "1a",
        description:
          "Translate verbal descriptions into correct numerical expressions using operation symbols and grouping",
      },
      {
        code: "1b",
        description: "Evaluate numerical expressions accurately using the order of operations",
      },
    ]);
  });

  it("preserves absolute-value bars and the complete objective in graph nodes", () => {
    const classPeriodPlan = parseClassPeriodPlan(moduleTwoPlan);
    const lesson = classPeriodPlan.lessons[0];

    expect(lesson?.objectives).toContainEqual({
      code: "2i",
      description:
        "Solve absolute value equations of the form |expression| = constant and recognize when no solution exists",
    });

    const nodes = assembleDraftInventory({
      course: "im1",
      moduleOverview,
      classPeriodPlan,
      sourceFile: "module-2-class-period-plan.md",
    });

    expect(nodes.find((node) => node.kind === "skill" && node.title.startsWith("2i:"))?.title).toBe(
      "2i: Solve absolute value equations of the form |expression| = constant and recognize when no solution exists",
    );
  });
});
