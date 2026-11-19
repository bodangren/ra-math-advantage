import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateTopic11IntervalGraph } from "@/lib/practice/topic11-interval-graph";
import { PRECALCULUS_PILOT_NODE_ID } from "@/lib/learning-evidence/precalc-pilot";

const sharedMock = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}));

vi.mock("@math-platform/activity-components", () => ({
  IntervalClassificationActivity: (props: Record<string, unknown>) => {
    sharedMock.props = props;
    return <div data-testid="shared-interval-classification" />;
  },
}));

import { PrecalculusMasteryAdvantagePilot } from "@/components/student/PrecalculusMasteryAdvantagePilot";

const seedZero = generateTopic11IntervalGraph(0);
const baseProps = {
  prompt: "Identify the intervals where the graph increases, decreases, and stays constant.",
  domain: seedZero.domain,
  changePoints: seedZero.changePoints,
  points: seedZero.points,
};

const guidedSteps = [
  "Mark the domain endpoints and the change points x=3 and x=7.",
  "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
  "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
];

const fieldHelp = {
  increasingIntervals: "Find every segment that rises.",
  decreasingIntervals: "Find every segment that falls.",
  constantIntervals: "Check whether any segment stays flat.",
};

describe("PrecalculusMasteryAdvantagePilot shared activity props", () => {
  beforeEach(() => {
    sharedMock.props = null;
  });

  it("passes only source-owned Guided presentation props to the shared activity", () => {
    render(<PrecalculusMasteryAdvantagePilot />);

    expect(sharedMock.props).toEqual({
      activityId: `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`,
      mode: "guided",
      ...baseProps,
      presentationMode: "guided_practice",
      guidedSteps,
      fieldHelp,
      onSubmit: expect.any(Function),
    });
    expect(sharedMock.props).not.toHaveProperty("steps");
    expect(sharedMock.props).not.toHaveProperty("finalAnswer");
    expect(sharedMock.props).not.toHaveProperty("workedExample");
  });

  it("derives Guided change-point help from a nonzero generated seed", () => {
    const seedOne = generateTopic11IntervalGraph(1);
    const [firstChange, secondChange] = seedOne.changePoints;

    render(<PrecalculusMasteryAdvantagePilot mode="guided_practice" seed={1} />);

    const steps = sharedMock.props?.guidedSteps as string[] | undefined;
    expect(steps?.[0]).toBe(
      `Mark the domain endpoints and the change points x=${firstChange} and x=${secondChange}.`,
    );
    if (firstChange !== 3 || secondChange !== 7) {
      expect(steps?.[0]).not.toContain("x=3 and x=7");
    }
  });

  it("passes only source-owned Independent presentation props to the shared activity", () => {
    render(<PrecalculusMasteryAdvantagePilot mode="independent_practice" seed={2} />);

    const props = sharedMock.props;
    expect(props).toMatchObject({
      activityId: `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`,
      mode: "practice",
      presentationMode: "independent_practice",
    });
    expect(props?.prompt).toBe(baseProps.prompt);
    expect(props?.domain).toEqual(generateTopic11IntervalGraph(2).domain);
    expect(props?.changePoints).toEqual(generateTopic11IntervalGraph(2).changePoints);
    expect(props?.points).toEqual(generateTopic11IntervalGraph(2).points);
    expect(props).not.toHaveProperty("steps");
    expect(props).not.toHaveProperty("finalAnswer");
    expect(props).not.toHaveProperty("workedExample");
    expect(props).not.toHaveProperty("guidedSteps");
    expect(props).not.toHaveProperty("fieldHelp");
    expect(props).toHaveProperty("onSubmit", expect.any(Function));
  });
});
