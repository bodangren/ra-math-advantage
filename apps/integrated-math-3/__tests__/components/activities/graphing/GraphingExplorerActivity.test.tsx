import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { sharedActivitySpy } = vi.hoisted(() => ({ sharedActivitySpy: vi.fn() }));

vi.mock("@math-platform/activity-components/graphing", () => ({
  GraphingExplorerActivity: (props: { responseVariant?: string }) => {
    sharedActivitySpy(props);
    return (
      <div data-testid="shared-graphing-activity" data-response-variant={props.responseVariant} />
    );
  },
}));

import { GraphingExplorerActivity } from "@/components/activities/graphing/GraphingExplorerActivity";

const PILOT_ACTIVITY_ID = "math.im3.skill.1.1.graph-quadratic-functions.independent_practice";

describe("GraphingExplorerActivity IM3 compatibility binding", () => {
  it("selects the shared table-and-graph response for the exact pilot identity", () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:im3-pilot"
        stableActivityId={PILOT_ACTIVITY_ID}
        mode="practice"
      />,
    );

    expect(screen.getByTestId("shared-graphing-activity").dataset.responseVariant).toBe(
      "table_graph",
    );
  });

  it("does not select the pilot response for a lookalike identity", () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:lookalike"
        stableActivityId="math.im3.skill.1.1.lookalike.independent_practice"
        mode="practice"
      />,
    );

    expect(screen.getByTestId("shared-graphing-activity").dataset.responseVariant).toBeUndefined();
  });

  it("preserves an explicitly supplied response variant for the exact pilot identity", () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:im3-pilot"
        stableActivityId={PILOT_ACTIVITY_ID}
        mode="practice"
        responseVariant="quadratic_features"
      />,
    );

    expect(screen.getByTestId("shared-graphing-activity").dataset.responseVariant).toBe(
      "quadratic_features",
    );
  });

  it("passes graph schema props through the IM3 wrapper", () => {
    const graphProps = {
      activityId: "activities:graph-schema",
      mode: "guided" as const,
      equation: "y = x^2 + 2x - 3",
      variant: "graph_system" as const,
      domain: [-5, 5] as [number, number],
      range: [-10, 10] as [number, number],
      points: [
        [-1, -4],
        [0, -3],
      ] as [number, number][],
      comparisonEquation: "y = x + 1",
      comparisonQuestion: "Which function opens upward?",
      comparisonAnswer: "first" as const,
      linearEquation: "y = 2x + 1",
    };

    render(<GraphingExplorerActivity {...graphProps} />);

    expect(sharedActivitySpy).toHaveBeenLastCalledWith(expect.objectContaining(graphProps));
  });

  it("forwards atomic one-real-solution props to the shared activity", () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:one-real-solution"
        mode="guided"
        equation="f(x) = x^2 + 4x + 4"
        responseVariant="one_real_solution"
        originalEquation="10 - x^2 = 4x + 14"
      />,
    );

    expect(sharedActivitySpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        activityId: "activities:one-real-solution",
        mode: "guided",
        equation: "f(x) = x^2 + 4x + 4",
        responseVariant: "one_real_solution",
        originalEquation: "10 - x^2 = 4x + 14",
      }),
    );
  });

  it("forwards exact two-real-solutions props to the shared activity", () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:two-real-solutions"
        mode="teaching"
        responseVariant="two_real_solutions"
        equation="f(x) = x^2 - 24x + 143"
        originalEquation="x(24 - x) = 143"
        variant="plot_from_equation"
        points={[
          [10, 3],
          [11, 0],
          [12, -1],
          [13, 0],
          [14, 3],
        ]}
        domain={[8, 16]}
        range={[-2, 8]}
        sum={24}
        product={143}
      />,
    );

    expect(sharedActivitySpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        activityId: "activities:two-real-solutions",
        mode: "teaching",
        responseVariant: "two_real_solutions",
        equation: "f(x) = x^2 - 24x + 143",
        originalEquation: "x(24 - x) = 143",
        variant: "plot_from_equation",
        points: [
          [10, 3],
          [11, 0],
          [12, -1],
          [13, 0],
          [14, 3],
        ],
        domain: [8, 16],
        range: [-2, 8],
        sum: 24,
        product: 143,
      }),
    );
  });

  it("forwards exact Example 3 estimated-root-interval props to the shared activity", () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:estimate-roots-wrapper"
        mode="guided"
        equation="f(x) = -x^2 + 3x + 7"
        originalEquation="-x^2 + 3x + 7 = 0"
        variant="plot_from_equation"
        responseVariant="estimated_root_intervals"
        points={[
          [-2, -3],
          [-1, 3],
          [0, 7],
          [1, 9],
          [2, 9],
          [3, 7],
          [4, 3],
          [5, -3],
        ]}
      />,
    );

    expect(sharedActivitySpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        activityId: "activities:estimate-roots-wrapper",
        mode: "guided",
        equation: "f(x) = -x^2 + 3x + 7",
        originalEquation: "-x^2 + 3x + 7 = 0",
        variant: "plot_from_equation",
        responseVariant: "estimated_root_intervals",
        points: [
          [-2, -3],
          [-1, 3],
          [0, 7],
          [1, 9],
          [2, 9],
          [3, 7],
          [4, 3],
          [5, -3],
        ],
      }),
    );
  });
});
