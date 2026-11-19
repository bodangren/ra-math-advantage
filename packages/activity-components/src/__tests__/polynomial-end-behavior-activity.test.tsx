import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { generateTopic14PolynomialEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  polynomialEndBehaviorSchema,
  PolynomialEndBehaviorActivity,
  type PolynomialEndBehaviorActivityProps,
} from "../index";
import type { PolynomialEndBehaviorProps } from "@math-platform/math-content";

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "maxScore",
  "normalizedAnswer",
  "score",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
  "isCorrect",
];

type IndependentProps = Extract<
  PolynomialEndBehaviorProps,
  { presentationMode: "independent_practice" }
>;

function publicProps(seed: number): IndependentProps {
  return polynomialEndBehaviorSchema.parse(
    generateTopic14PolynomialEndBehaviorOutput(seed).data.rendererProps,
  ) as IndependentProps;
}

function guidedProps(): Extract<
  PolynomialEndBehaviorProps,
  { presentationMode: "guided_practice" }
> {
  return polynomialEndBehaviorSchema.parse({
    ...publicProps(1),
    presentationMode: "guided_practice",
    guidedSteps: ["Identify the leading term.", "Check the degree.", "Use the coefficient sign."],
    fieldHelp: "Use the degree and leading coefficient to choose each end.",
  }) as Extract<PolynomialEndBehaviorProps, { presentationMode: "guided_practice" }>;
}

function workedProps(): Extract<
  PolynomialEndBehaviorProps,
  { presentationMode: "worked_example" }
> {
  const output = generateTopic14PolynomialEndBehaviorOutput(0);
  return polynomialEndBehaviorSchema.parse({
    ...publicProps(0),
    presentationMode: "worked_example",
    correctAnswers: output.expectedAnswer,
    steps: output.solutionSteps.map((step) => step.description),
    finalAnswer: "Both ends of the graph fall toward negative infinity.",
  }) as Extract<PolynomialEndBehaviorProps, { presentationMode: "worked_example" }>;
}

function renderActivity(
  props: PolynomialEndBehaviorProps,
  overrides: Partial<PolynomialEndBehaviorActivityProps> = {},
) {
  const activityProps = {
    ...props,
    activityId: "topic-1-4.example-4.independent_practice",
    mode: "practice" as const,
    ...overrides,
  } as PolynomialEndBehaviorActivityProps;
  return render(<PolynomialEndBehaviorActivity {...activityProps} />);
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe("PolynomialEndBehaviorActivity", () => {
  it("renders the live Worked source with semantic notation and no submission controls", () => {
    const output = generateTopic14PolynomialEndBehaviorOutput(0);
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(workedProps(), {
      activityId: "topic-1-4.example-4.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Worked Example: Polynomial End Behavior" }),
    ).toBeTruthy();
    expect(screen.getByText(output.prompt)).toBeTruthy();
    expect(screen.getByLabelText("Leading term -3x^4")).toBeTruthy();
    expect(screen.getAllByText("Negative infinity")).toHaveLength(2);
    for (const step of output.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText("Both ends of the graph fall toward negative infinity.")).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("submits the exact raw Guided envelope after both answers exist", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const props = guidedProps();
    renderActivity(props, {
      activityId: "topic-1-4.example-4.guided_practice",
      mode: "guided",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Polynomial End Behavior" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByText(props.fieldHelp)).toBeTruthy();
    for (const radio of screen.getAllByRole("radio")) {
      const label = radio.closest("label");
      expect(label?.classList.contains("flex")).toBe(true);
      expect(label?.classList.contains("items-center")).toBe(true);
      expect(label?.classList.contains("gap-2")).toBe(true);
    }
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getAllByLabelText("Positive infinity", { selector: "input" })[0]!);
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getAllByLabelText("Negative infinity", { selector: "input" })[1]!);
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: "topic-1-4.example-4.guided_practice",
      mode: "guided_practice",
      answers: { leftEnd: "positive_infinity", rightEnd: "negative_infinity" },
      parts: [
        { partId: "leftEnd", rawAnswer: "positive_infinity" },
        { partId: "rightEnd", rawAnswer: "negative_infinity" },
      ],
    });
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("submits Independent choices without Guided or Worked content", () => {
    const onSubmit = vi.fn();
    const props = publicProps(2);
    renderActivity(props, {
      activityId: "topic-1-4.example-4.independent_practice",
      mode: "practice",
      onSubmit,
    });

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Polynomial End Behavior" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.queryByText(/Use the degree and leading coefficient/)).toBeNull();
    expect(screen.queryByText(/Both ends of the graph fall/)).toBeNull();
    fireEvent.click(screen.getAllByLabelText("Negative infinity", { selector: "input" })[0]!);
    fireEvent.click(screen.getAllByLabelText("Positive infinity", { selector: "input" })[1]!);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: "topic-1-4.example-4.independent_practice",
      mode: "independent_practice",
      answers: { leftEnd: "negative_infinity", rightEnd: "positive_infinity" },
      parts: [
        { partId: "leftEnd", rawAnswer: "negative_infinity" },
        { partId: "rightEnd", rawAnswer: "positive_infinity" },
      ],
    });
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("formats unit leading coefficients with live exponents and semantic superscripts", () => {
    for (const [seed, coefficientText] of [
      [7, "-"],
      [46, ""],
    ] as const) {
      const props = publicProps(seed);
      const { unmount } = renderActivity(props);
      const expression = screen.getByLabelText(
        `Leading term ${coefficientText}x^${props.leadingTerm.exponent}`,
      );
      expect(expression.querySelector("sup")?.textContent).toBe(String(props.leadingTerm.exponent));
      unmount();
    }
  });

  it("uses unique control IDs and names, accepts custom titles, and fails closed on mode mismatch", () => {
    const { unmount: unmountInstances } = render(
      <>
        <PolynomialEndBehaviorActivity {...publicProps(1)} activityId="same" mode="practice" />
        <PolynomialEndBehaviorActivity {...publicProps(1)} activityId="same" mode="practice" />
      </>,
    );
    const radios = screen.getAllByRole("radio");
    expect(new Set(radios.map((radio) => radio.id)).size).toBe(8);
    expect(new Set(radios.map((radio) => radio.getAttribute("name"))).size).toBe(4);
    unmountInstances();

    const { unmount } = renderActivity({ ...publicProps(0), title: "Custom end behavior" });
    expect(screen.getByRole("heading", { name: "Custom end behavior" })).toBeTruthy();
    unmount();

    renderActivity(publicProps(0), { mode: "teaching" });
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not write browser console errors", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderActivity(guidedProps(), { mode: "guided" });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
