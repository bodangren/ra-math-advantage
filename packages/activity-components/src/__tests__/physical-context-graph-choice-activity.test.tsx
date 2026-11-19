import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhysicalContextGraphChoiceActivity } from "../components/graph-choice/PhysicalContextGraphChoiceActivity";
import type { PhysicalContextGraphChoiceProps } from "@math-platform/math-content";

type BaseProps = Omit<
  Extract<PhysicalContextGraphChoiceProps, { presentationMode: "independent_practice" }>,
  "presentationMode"
>;

const baseProps: BaseProps = {
  prompt: "Select the graph that models the filling vase.",
  contextDescription: "Water enters an empty vase at a constant rate.",
  xLabel: "Time",
  yLabel: "Water height",
  containerProfile: "narrow-wide-narrow",
  options: [
    {
      id: "A",
      label: "A",
      shape: "linear-increasing",
      accessibleDescription: "A straight line rises at a constant rate.",
    },
    {
      id: "B",
      label: "B",
      shape: "slope-increases-then-decreases",
      accessibleDescription: "The slope increases and then decreases.",
    },
    {
      id: "C",
      label: "C",
      shape: "rise-fall-rise",
      accessibleDescription: "The graph rises, falls, and rises again.",
    },
    {
      id: "D",
      label: "D",
      shape: "steep-gentle-steep",
      accessibleDescription: "The graph rises steeply, then gently, then steeply.",
    },
  ],
};

const workedProps: Extract<
  PhysicalContextGraphChoiceProps,
  { presentationMode: "worked_example" }
> = {
  ...baseProps,
  presentationMode: "worked_example",
  correctOptionId: "D",
  steps: [
    "Identify time as the independent variable.",
    "Choose the graph whose shape fits the changing vase width.",
  ],
  finalAnswer: "Graph D.",
};

const guidedProps: Extract<
  PhysicalContextGraphChoiceProps,
  { presentationMode: "guided_practice" }
> = {
  ...baseProps,
  presentationMode: "guided_practice",
  guidedSteps: ["Identify the two variables.", "Compare the graph shapes with the context."],
  fieldHelp: "Select the graph that fits the context.",
};

const independentProps: Extract<
  PhysicalContextGraphChoiceProps,
  { presentationMode: "independent_practice" }
> = {
  ...baseProps,
  presentationMode: "independent_practice",
};

describe("PhysicalContextGraphChoiceActivity", () => {
  it("renders four accessible graph choices with A-D labels", () => {
    const { container } = render(
      <PhysicalContextGraphChoiceActivity
        activityId="example.worked_example"
        mode="teaching"
        {...workedProps}
      />,
    );

    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getAllByRole("img")).toHaveLength(5);
    expect(
      screen.getByRole("img", {
        name: "A vase with a narrow base, a wide rounded middle, and a narrow neck.",
      }),
    ).toBeTruthy();
    const contextImage = container.querySelector("[data-container-profile]")!;
    const firstChoiceImage = container.querySelector("fieldset svg")!;
    expect(
      contextImage.compareDocumentPosition(firstChoiceImage) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const polylinePoints = Array.from(container.querySelectorAll("polyline")).map((polyline) =>
      polyline.getAttribute("points"),
    );
    expect(polylinePoints).toEqual([
      "12,76 148,24",
      "12,76 52,68 96,30 148,22",
      "12,72 52,28 94,72 148,34",
      "12,82 42,30 118,26 148,10",
    ]);
    expect(new Set(polylinePoints).size).toBe(4);
    for (const option of baseProps.options) {
      expect(screen.getByRole("img", { name: option.accessibleDescription })).toBeTruthy();
      expect(screen.getByText(option.id)).toBeTruthy();
    }
  });

  it("shows the completed Worked example with D selected and no submit path", () => {
    render(
      <PhysicalContextGraphChoiceActivity
        activityId="example.worked_example"
        mode="teaching"
        {...workedProps}
      />,
    );

    expect((screen.getByRole("radio", { name: /D/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("radio", { name: /D/ }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText(workedProps.steps[0])).toBeTruthy();
    expect(screen.getByText(workedProps.steps[1])).toBeTruthy();
    expect(screen.getByText(workedProps.finalAnswer)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
  });

  it("renders each option label from the schema data", () => {
    const labeledProps: Extract<
      PhysicalContextGraphChoiceProps,
      { presentationMode: "independent_practice" }
    > = {
      ...independentProps,
      options: independentProps.options.map((option, index) => ({
        ...option,
        label: `Choice ${index + 1}`,
      })),
    };
    render(
      <PhysicalContextGraphChoiceActivity
        activityId="example.independent_practice"
        mode="practice"
        {...labeledProps}
      />,
    );

    expect(screen.getByText("Choice 2")).toBeTruthy();
  });

  it("renders each container profile with its exact outline path and accessible name", () => {
    const expectedPaths = {
      "constant-width": {
        path: "M25 25H95V155H25Z",
        description: "A straight-sided container with constant width.",
      },
      "wide-narrow-wide": {
        path: "M15 20H105L78 80V120L105 160H15L42 120V80Z",
        description:
          "A vessel that is wide at the bottom, narrow in the middle, and wide at the top.",
      },
      "narrow-wide-narrow": {
        path: "M47 18Q60 12 73 18L72 42Q72 52 88 62Q108 76 104 104Q100 132 84 150H36Q20 132 16 104Q12 76 32 62Q48 52 48 42Z",
        description: "A vase with a narrow base, a wide rounded middle, and a narrow neck.",
      },
    } as const;

    for (const profile of Object.keys(expectedPaths) as Array<keyof typeof expectedPaths>) {
      const { container, unmount } = render(
        <PhysicalContextGraphChoiceActivity
          activityId={`example.${profile}`}
          mode="practice"
          {...independentProps}
          containerProfile={profile}
        />,
      );
      const contextImage = screen.getByRole("img", { name: expectedPaths[profile].description });
      expect(contextImage.getAttribute("data-container-profile")).toBe(profile);
      expect(contextImage.querySelector("path")?.getAttribute("d")).toBe(
        expectedPaths[profile].path,
      );
      expect(container.querySelectorAll("[data-container-profile]")).toHaveLength(1);
      unmount();
    }
  });

  it.each([
    ["guided", guidedProps, "guided_practice"],
    ["practice", independentProps, "independent_practice"],
  ] as const)(
    "submits a grade-free %s practice.v1 envelope without solution leakage",
    async (mode, props, expectedMode) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <PhysicalContextGraphChoiceActivity
          activityId={`example.${expectedMode}`}
          mode={mode}
          onSubmit={onSubmit}
          {...props}
        />,
      );

      expect(
        screen.getByRole("img", { name: /narrow base, a wide rounded middle, and a narrow neck/ }),
      ).toBeTruthy();
      expect(screen.queryByText("Graph D.")).toBeNull();
      expect(screen.queryByText(/Identify time as/)).toBeNull();
      if (mode === "guided") {
        expect(screen.getByText(guidedProps.guidedSteps[0]!)).toBeTruthy();
        expect(screen.getByText(guidedProps.fieldHelp)).toBeTruthy();
        expect(
          screen.getByRole("group", { name: "Graph choices" }).getAttribute("aria-describedby"),
        ).toBeTruthy();
      } else {
        expect(screen.queryByText(guidedProps.guidedSteps[0]!)).toBeNull();
        expect(screen.queryByText(guidedProps.fieldHelp)).toBeNull();
      }

      const submit = screen.getByRole("button", { name: /submit/i });
      expect((submit as HTMLButtonElement).disabled).toBe(true);
      await user.click(screen.getByRole("radio", { name: /C/ }));
      expect((submit as HTMLButtonElement).disabled).toBe(false);
      await user.click(submit);

      expect(onSubmit).toHaveBeenCalledOnce();
      const payload = onSubmit.mock.calls[0]?.[0] as Record<string, any>;
      expect(payload).toMatchObject({
        contractVersion: "practice.v1",
        activityId: `example.${expectedMode}`,
        mode: expectedMode,
        status: "submitted",
        answers: { selectedOptionId: "C" },
      });
      expect(payload.parts).toEqual([
        expect.objectContaining({ partId: "selectedOptionId", rawAnswer: "C" }),
      ]);
      expect(JSON.stringify(payload)).not.toMatch(/correctOptionId|finalAnswer|steps|solution/);
    },
  );

  it("shows unavailable and cannot submit when runtime and presentation modes differ", () => {
    const onSubmit = vi.fn();
    render(
      <PhysicalContextGraphChoiceActivity
        activityId="example.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        {...workedProps}
      />,
    );

    expect(screen.getByRole("alert").textContent).toMatch(/unavailable/i);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("supports native radio keyboard semantics", () => {
    render(
      <PhysicalContextGraphChoiceActivity
        activityId="example.independent_practice"
        mode="practice"
        {...independentProps}
      />,
    );

    const first = screen.getByRole("radio", { name: /A/ });
    const second = screen.getByRole("radio", { name: /B/ });
    expect(first.getAttribute("type")).toBe("radio");
    expect(first.getAttribute("name")).toBe("example.independent_practice-graph-choice");
    first.focus();
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    second.focus();
    expect(document.activeElement).toBe(second);
  });
});
