import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { generateTopic12GraphAverageRateChoice } from "@math-platform/math-content/knowledge-space";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import type { GraphAverageRateChoiceProps } from "@math-platform/math-content";
import { GraphAverageRateChoiceActivity } from "../components/graph-choice/GraphAverageRateChoiceActivity";

const ANSWER_AUTHORITY_KEYS =
  /correctAnswer|answerKey|hidden|authority|steps|normalizedAnswer|correctOptionId|expectedAnswer|isCorrect|score|maxScore|gradingMetadata|solution|finalAnswer/;

type WorkedProps = Extract<GraphAverageRateChoiceProps, { presentationMode: "worked_example" }>;
type GuidedProps = Extract<GraphAverageRateChoiceProps, { presentationMode: "guided_practice" }>;
type IndependentProps = Extract<
  GraphAverageRateChoiceProps,
  { presentationMode: "independent_practice" }
>;

function propsFor(seed: number, presentationMode: "worked_example"): WorkedProps;
function propsFor(seed: number, presentationMode: "guided_practice"): GuidedProps;
function propsFor(seed: number, presentationMode: "independent_practice"): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: GraphAverageRateChoiceProps["presentationMode"],
): GraphAverageRateChoiceProps {
  const variant = generateTopic12GraphAverageRateChoice(seed);
  const base = {
    prompt: variant.prompt,
    domain: [...variant.domain] as [number, number],
    range: [...variant.range] as [number, number],
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    graphPoints: [...variant.graphPoints],
    options: [...variant.options],
    presentationMode,
  };

  if (presentationMode === "worked_example") {
    return {
      ...base,
      correctOptionId: variant.correctOptionId,
      steps: [...variant.solutionSteps],
      finalAnswer: `Option ${variant.correctOptionId} has the greatest average rate of change.`,
    } as WorkedProps;
  }
  if (presentationMode === "guided_practice") {
    return {
      ...base,
      guidedSteps: [
        "Calculate the average rate for each interval.",
        "Select the interval with the greatest rate.",
      ],
      fieldHelp: "Use change in output divided by change in input.",
    } as GuidedProps;
  }
  return base as IndependentProps;
}

describe("GraphAverageRateChoiceActivity", () => {
  it("renders the source Worked graph, four choices, steps, and answer without submission", () => {
    const onSubmit = vi.fn();
    const props = propsFor(0, "worked_example");

    render(
      <GraphAverageRateChoiceActivity
        activityId="topic-1-2.example-3.worked_example"
        mode="teaching"
        onSubmit={onSubmit}
        {...props}
      />,
    );

    expect(screen.getByRole("img", { name: /graph of y = h\(x\)/i })).toBeTruthy();
    expect(
      screen.getByRole("img", { name: /h\(2\)=6.*h\(3\)=6.*h\(5\)=4.*h\(7\)=6.*h\(8\)=3/i }),
    ).toBeTruthy();
    const curve = screen.getByTestId("graph-curve");
    const curveSegments = curve.getAttribute("d")!.split(" C").slice(1);
    const xScale = (x: number) => 38 + (x / 9) * 308;
    const yScale = (y: number) => 14 + ((11 - y) / 11) * 132;
    props.graphPoints.slice(1).forEach((point, index) => {
      expect(curveSegments[index]?.endsWith(`${xScale(point.x)} ${yScale(point.y)}`)).toBe(true);
    });
    expect(screen.getByTestId("graph-x-ticks").textContent).toContain("2");
    expect(screen.getByTestId("graph-x-ticks").textContent).toContain("3");
    expect(screen.getByTestId("graph-x-ticks").textContent).toContain("5");
    expect(screen.getByTestId("graph-x-ticks").textContent).toContain("7");
    expect(screen.getByTestId("graph-x-ticks").textContent).toContain("8");
    const yTickLabels = Array.from(
      screen.getByTestId("graph-y-ticks").querySelectorAll("text"),
      (tick) => tick.textContent,
    );
    expect(yTickLabels).toEqual(["0", "2", "4", "6", "8", "10", "11"]);
    expect(yTickLabels).toHaveLength(7);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    const correct = screen.getByRole("radio", { name: /C.*5 to 7/ }) as HTMLInputElement;
    expect(correct.checked).toBe(true);
    expect(correct.disabled).toBe(true);
    for (const step of props.steps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(props.finalAnswer)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows Guided scaffolding and submits only the selected option", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const props = propsFor(1, "guided_practice");

    render(
      <GraphAverageRateChoiceActivity
        activityId="topic-1-2.example-3.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...props}
      />,
    );

    expect(screen.getByText(props.guidedSteps[0]!)).toBeTruthy();
    expect(screen.getByText(props.fieldHelp)).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: /A.*1 to 3/ }));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, any>;
    expect(payload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: "topic-1-2.example-3.guided_practice",
      mode: "guided_practice",
      answers: { selectedOptionId: "A" },
    });
    expect(payload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "A" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expect(JSON.stringify(payload)).not.toMatch(ANSWER_AUTHORITY_KEYS);
    expect(
      screen.getByRole("group", { name: "Interval choices" }).getAttribute("aria-describedby"),
    ).toBeTruthy();
  });

  it("renders Independent mode without Guided or Worked data and submits raw data only", () => {
    const onSubmit = vi.fn();
    const props = propsFor(2, "independent_practice");

    render(
      <GraphAverageRateChoiceActivity
        activityId="topic-1-2.example-3.independent_practice"
        mode="practice"
        onSubmit={onSubmit}
        {...props}
      />,
    );

    expect(screen.getByRole("img", { name: /graph of y = h\(x\)/i })).toBeTruthy();
    expect(screen.queryByText("Calculate the average rate for each interval.")).toBeNull();
    expect(screen.queryByText(/greatest average rate is/i)).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: /D.*7 to 9/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, any>;
    expect(payload.activityId).toBe("topic-1-2.example-3.independent_practice");
    expect(payload.mode).toBe("independent_practice");
    expect(payload.answers).toEqual({ selectedOptionId: "D" });
    expect(payload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "D" }]);
    expect(JSON.stringify(props)).not.toMatch(ANSWER_AUTHORITY_KEYS);
    expect(JSON.stringify(payload)).not.toMatch(ANSWER_AUTHORITY_KEYS);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
  });

  it("shows unavailable and prevents submission when runtime and props modes do not match", () => {
    const onSubmit = vi.fn();
    render(
      <GraphAverageRateChoiceActivity
        activityId="topic-1-2.example-3.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        {...propsFor(1, "worked_example")}
      />,
    );

    expect(screen.getByRole("alert").textContent).toMatch(/unavailable/i);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
