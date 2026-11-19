import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateTopic11IntervalGraph } from "@/lib/practice/topic11-interval-graph";
import { PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";
import type { IntervalClassificationProps } from "@math-platform/math-content/schemas";

const sharedMock = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}));

vi.mock("@math-platform/activity-components", () => ({
  IntervalClassificationActivity: (props: Record<string, unknown>) => {
    sharedMock.props = props;
    return <div data-testid="shared-interval-classification" />;
  },
}));

import { PrecalculusTopic11DailyCurriculumPilot } from "@/components/student/PrecalculusTopic11DailyCurriculumPilot";

const seedZero = generateTopic11IntervalGraph(0);
const projectedProps: IntervalClassificationProps = {
  title: "Worked Example: Find Increasing Intervals",
  prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing.",
  domain: [...seedZero.domain] as [number, number],
  changePoints: [...seedZero.changePoints] as [number, number],
  points: seedZero.points.map(({ x, y }) => ({ x, y })),
  presentationMode: "worked_example",
  steps: [
    {
      description: "Read the graph from left to right.",
      expression: "x = 0 to x = 9",
    },
    {
      description: "The graph rises from x=0 to x=3.",
      expression: "0 < x < 3",
    },
    {
      description: "The graph falls from x=3 to x=7.",
      expression: "3 < x < 7",
    },
    {
      description: "The graph rises from x=7 to x=9.",
      expression: "7 < x < 9",
    },
    {
      description: "Therefore, f is increasing on [0,3] and [7,9].",
      expression: "f is increasing on [0,3] and [7,9].",
    },
  ],
  finalAnswer: "[0,3] and [7,9].",
};

describe("AP Precalculus daily Worked shared activity props", () => {
  beforeEach(() => {
    sharedMock.props = null;
  });

  it("passes the exact generated Worked props without submission callbacks", () => {
    render(
      <PrecalculusTopic11DailyCurriculumPilot
        stableActivityId={PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID}
        activityProps={projectedProps}
      />,
    );

    expect(sharedMock.props).toEqual({
      activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      mode: "teaching",
      title: "Worked Example: Find Increasing Intervals",
      prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing.",
      domain: seedZero.domain,
      changePoints: seedZero.changePoints,
      points: seedZero.points,
      presentationMode: "worked_example",
      steps: [
        { description: "Read the graph from left to right.", expression: "x = 0 to x = 9" },
        { description: "The graph rises from x=0 to x=3.", expression: "0 < x < 3" },
        { description: "The graph falls from x=3 to x=7.", expression: "3 < x < 7" },
        { description: "The graph rises from x=7 to x=9.", expression: "7 < x < 9" },
        {
          description: "Therefore, f is increasing on [0,3] and [7,9].",
          expression: "f is increasing on [0,3] and [7,9].",
        },
      ],
      finalAnswer: "[0,3] and [7,9].",
    });
    expect(sharedMock.props).not.toHaveProperty("onSubmit");
    expect(sharedMock.props).not.toHaveProperty("onComplete");
  });
});
