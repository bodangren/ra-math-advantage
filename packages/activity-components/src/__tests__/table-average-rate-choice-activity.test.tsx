import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TableAverageRateChoiceProps } from "@math-platform/math-content";
import { TableAverageRateChoiceActivity } from "../components/table/TableAverageRateChoiceActivity";

const baseProps: Omit<
  Extract<TableAverageRateChoiceProps, { presentationMode: "independent_practice" }>,
  "presentationMode"
> = {
  title: "Example 6: Find the greatest average rate",
  prompt: "Over which interval is the average rate of change in life expectancy greatest?",
  inputLabel: "Birth year",
  outputLabel: "Life expectancy (years)",
  rows: [
    { input: 1800, output: 41.24 },
    { input: 1850, output: 46.1 },
    { input: 1900, output: 53.63 },
    { input: 1950, output: 70.65 },
    { input: 2000, output: 81.83 },
  ],
  options: [
    { id: "A", label: "A", startInput: 1800, endInput: 1850 },
    { id: "B", label: "B", startInput: 1850, endInput: 1900 },
    { id: "C", label: "C", startInput: 1900, endInput: 1950 },
    { id: "D", label: "D", startInput: 1950, endInput: 2000 },
  ],
};

const workedProps: Extract<TableAverageRateChoiceProps, { presentationMode: "worked_example" }> = {
  ...baseProps,
  presentationMode: "worked_example",
  correctOptionId: "C",
  steps: [
    "Calculate the change in life expectancy for each interval.",
    "Divide each output change by its input change.",
    "Compare the four average rates.",
  ],
  finalAnswer: "Option C, from 1900 to 1950, has the greatest average rate of change.",
};

const guidedProps: Extract<TableAverageRateChoiceProps, { presentationMode: "guided_practice" }> = {
  ...baseProps,
  presentationMode: "guided_practice",
  guidedSteps: [
    "Choose one interval from the table.",
    "Compare its output change with its input change.",
  ],
  fieldHelp: "Select the interval with the greatest average rate of change.",
};

const independentProps: Extract<
  TableAverageRateChoiceProps,
  { presentationMode: "independent_practice" }
> = {
  ...baseProps,
  presentationMode: "independent_practice",
};

describe("TableAverageRateChoiceActivity", () => {
  it("renders the source Worked table, choices, answer, and steps without submission", () => {
    const onSubmit = vi.fn();
    render(
      <TableAverageRateChoiceActivity
        activityId="topic-1-2.example-6.worked_example"
        mode="teaching"
        onSubmit={onSubmit}
        {...workedProps}
      />,
    );

    expect(screen.getByRole("heading", { name: workedProps.title })).toBeTruthy();
    expect(screen.getByText(workedProps.prompt)).toBeTruthy();
    expect(screen.getByRole("table", { name: "Life expectancy table" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Birth year" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Life expectancy (years)" })).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(6);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(
      (screen.getByRole("radio", { name: /C.*1900 to 1950/ }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(
      (screen.getByRole("radio", { name: /C.*1900 to 1950/ }) as HTMLInputElement).disabled,
    ).toBe(true);
    for (const step of workedProps.steps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(workedProps.finalAnswer)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits only the selected answer in Guided mode", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    render(
      <TableAverageRateChoiceActivity
        activityId="topic-1-2.example-6.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...guidedProps}
      />,
    );

    expect(screen.getByText(guidedProps.guidedSteps[0]!)).toBeTruthy();
    expect(screen.getByText(guidedProps.fieldHelp)).toBeTruthy();
    expect(screen.getByRole("group", { name: "Table interval choices" })).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: /C.*1900 to 1950/ }));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, any>;
    expect(payload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: "topic-1-2.example-6.guided_practice",
      mode: "guided_practice",
      status: "submitted",
      answers: { selectedOptionId: "C" },
    });
    expect(payload.parts).toEqual([
      expect.objectContaining({ partId: "selectedOptionId", rawAnswer: "C" }),
    ]);
    expect(JSON.stringify(payload)).not.toMatch(
      /correctOptionId|correctAnswer|isCorrect|score|maxScore|expectedAnswer|gradingMetadata|solution|finalAnswer/,
    );
  });

  it("submits only the selected answer in Independent mode without Guided fields", () => {
    const onSubmit = vi.fn();
    render(
      <TableAverageRateChoiceActivity
        activityId="topic-1-2.example-6.independent_practice"
        mode="practice"
        onSubmit={onSubmit}
        {...independentProps}
      />,
    );

    expect(screen.queryByText(guidedProps.guidedSteps[0]!)).toBeNull();
    expect(screen.queryByText(guidedProps.fieldHelp)).toBeNull();
    expect(screen.queryByText(workedProps.finalAnswer)).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: /B.*1850 to 1900/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, any>;
    expect(payload.activityId).toBe("topic-1-2.example-6.independent_practice");
    expect(payload.mode).toBe("independent_practice");
    expect(payload.answers).toEqual({ selectedOptionId: "B" });
    expect(JSON.stringify(payload)).not.toMatch(
      /correctOptionId|correctAnswer|isCorrect|score|maxScore|expectedAnswer|gradingMetadata|solution|finalAnswer/,
    );
  });

  it("shows unavailable and prevents submission when modes do not match", () => {
    const onSubmit = vi.fn();
    render(
      <TableAverageRateChoiceActivity
        activityId="topic-1-2.example-6.guided_practice"
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
});
