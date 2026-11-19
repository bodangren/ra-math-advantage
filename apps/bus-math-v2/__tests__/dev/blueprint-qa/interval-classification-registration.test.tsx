import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { IntervalClassificationActivity } from "@math-platform/activity-components";
import {
  clearActivityRegistry,
  getActivityComponent,
} from "@math-platform/activity-components/registry";
import type { ProjectedActivity } from "@math-platform/knowledge-space-practice";
import { getStudentPreviewProblem } from "@/app/(dev)/blueprint-qa/components/RendererPreview";
import { ensureActivitiesRegistered } from "@/app/(dev)/blueprint-qa/components/register-activities";

const baseProps = {
  prompt: "Classify the intervals shown by the graph.",
  domain: [0, 9] as [number, number],
  changePoints: [3, 7] as [number, number],
  points: [
    { x: 0, y: 1 },
    { x: 3, y: 7 },
    { x: 7, y: 2 },
    { x: 9, y: 6 },
  ],
};

const workedProps = {
  ...baseProps,
  presentationMode: "worked_example" as const,
  steps: [{ description: "Read the graph.", expression: "0 to 9" }],
  finalAnswer: "[0,3] and [7,9].",
};

const guidedProps = {
  ...baseProps,
  presentationMode: "guided_practice" as const,
  guidedSteps: ["Read each segment."],
  fieldHelp: {
    increasingIntervals: "Find every segment that rises.",
    decreasingIntervals: "Find every segment that falls.",
    constantIntervals: "Check whether any segment stays flat.",
  },
};

const independentProps = {
  ...baseProps,
  presentationMode: "independent_practice" as const,
};

function makeActivity(
  mode: ProjectedActivity["mode"],
  props: Record<string, unknown>,
): ProjectedActivity {
  return {
    stableActivityId: `math.bus-math-v2.qa.${mode}`,
    nodeId: "math.bus-math-v2.qa",
    sourceNodeIds: [],
    rendererKey: "interval-classification",
    mode,
    alignmentNodeIds: [],
    props,
    gradingConfig: {},
    srsEligible: false,
  };
}

describe("Business Math QA interval-classification registration", () => {
  beforeEach(() => {
    clearActivityRegistry();
  });

  it("registers the shared component and accepts all three strict projected modes", () => {
    const activities = [
      makeActivity("worked_example", workedProps),
      makeActivity("guided_practice", guidedProps),
      makeActivity("independent_practice", independentProps),
    ];

    ensureActivitiesRegistered();
    expect(getActivityComponent("interval-classification")).toBeTruthy();
    for (const activity of activities) {
      expect(getStudentPreviewProblem(activity)).toBeNull();
    }
  });

  it("keeps a presentation-mode mismatch unavailable in the shared component", () => {
    render(
      <IntervalClassificationActivity
        activityId="math.bus-math-v2.qa.guided_practice"
        mode="guided"
        {...workedProps}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("unavailable");
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByText(workedProps.finalAnswer)).not.toBeInTheDocument();
  });
});
