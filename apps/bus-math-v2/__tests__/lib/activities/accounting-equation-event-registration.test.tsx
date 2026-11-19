import { createElement, Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getActivityComponent } from "@/lib/activities/registry";
import { accountingEquationEventDrafts } from "@/lib/practice/drafts/accounting-equation-event";
import { selectActivitySchema } from "@/lib/schemas/activity-schemas";

function activityFixture(props: unknown) {
  return {
    id: "activity-row-id",
    componentKey: "accounting-equation-event",
    displayName: "Accounting equation event",
    description: null,
    props,
    gradingConfig: null,
    standardId: null,
    createdAt: new Date("2026-09-07T00:00:00.000Z"),
    updatedAt: new Date("2026-09-07T00:00:00.000Z"),
  };
}

describe("accounting equation event registration", () => {
  it.each(Object.entries(accountingEquationEventDrafts))(
    "validates and renders the real %s component",
    async (_name, props) => {
      expect(selectActivitySchema.safeParse(activityFixture(props)).success).toBe(true);
      const Component = getActivityComponent("accounting-equation-event");
      expect(Component).not.toBeNull();
      render(
        createElement(
          Suspense,
          { fallback: "Loading event" },
          createElement(Component!, { ...props, onSubmit: vi.fn() }),
        ),
      );
      expect(await screen.findByText(props.title)).toBeInTheDocument();
    },
  );

  it("rejects Independent answer data through the real activity validator", () => {
    const props = structuredClone(accountingEquationEventDrafts.independent);
    Object.assign(props.cases[0]!, {
      workedSolution: accountingEquationEventDrafts.worked.cases[0]!.workedSolution,
    });
    const result = selectActivitySchema.safeParse(activityFixture(props));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join(".").includes("props.cases.0")),
      ).toBe(true);
    }
  });
});
