import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
} from "@math-platform/math-content/knowledge-space";
import {
  polynomialDegreeLeadingCoefficientSchema,
  type PolynomialDegreeLeadingCoefficientProps,
} from "@math-platform/math-content";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  PolynomialDegreeLeadingCoefficientActivity,
  type PolynomialDegreeLeadingCoefficientActivityProps,
} from "../index";

const SOURCE_FINAL_ANSWER =
  "a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.";
const GUIDED_STEPS = [
  "List the terms in each polynomial.",
  "Find the greatest exponent in each item.",
] as const;
const GUIDED_HELP = "Use the term with the greatest exponent to identify both values.";
const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "degree",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "leadingCoefficient",
  "score",
  "solution",
  "solutionSteps",
  "steps",
];

type WorkedProps = Extract<
  PolynomialDegreeLeadingCoefficientProps,
  { presentationMode: "worked_example" }
>;
type GuidedProps = Extract<
  PolynomialDegreeLeadingCoefficientProps,
  { presentationMode: "guided_practice" }
>;
type IndependentProps = Extract<
  PolynomialDegreeLeadingCoefficientProps,
  { presentationMode: "independent_practice" }
>;

function propsFor(seed: number, presentationMode: "worked_example"): WorkedProps;
function propsFor(seed: number, presentationMode: "guided_practice"): GuidedProps;
function propsFor(seed: number, presentationMode: "independent_practice"): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: PolynomialDegreeLeadingCoefficientProps["presentationMode"],
): PolynomialDegreeLeadingCoefficientProps {
  const variant = generateTopic14PolynomialDegreeLeadingCoefficient(seed);
  const base = {
    prompt: variant.prompt,
    items: variant.items,
    presentationMode,
  };
  if (presentationMode === "worked_example") {
    const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed);
    return polynomialDegreeLeadingCoefficientSchema.parse({
      ...base,
      correctAnswers: output.expectedAnswer,
      steps: output.solutionSteps.map((step) => step.description),
      finalAnswer: SOURCE_FINAL_ANSWER,
    }) as WorkedProps;
  }
  if (presentationMode === "guided_practice") {
    return polynomialDegreeLeadingCoefficientSchema.parse({
      ...base,
      guidedSteps: GUIDED_STEPS,
      fieldHelp: GUIDED_HELP,
    }) as GuidedProps;
  }
  return polynomialDegreeLeadingCoefficientSchema.parse(base) as IndependentProps;
}

function renderActivity(
  props: PolynomialDegreeLeadingCoefficientProps,
  overrides: Partial<PolynomialDegreeLeadingCoefficientActivityProps> = {},
) {
  const activityProps = {
    activityId: "topic-1-4.example-1.guided_practice",
    mode: "guided" as const,
    ...props,
    ...overrides,
  } as PolynomialDegreeLeadingCoefficientActivityProps;
  return render(<PolynomialDegreeLeadingCoefficientActivity {...activityProps} />);
}

function expectNoAuthority(value: unknown): void {
  const keys = new Set<string>();
  const collect = (current: unknown) => {
    if (Array.isArray(current)) {
      current.forEach(collect);
      return;
    }
    if (!current || typeof current !== "object") return;
    Object.entries(current).forEach(([key, child]) => {
      keys.add(key);
      collect(child);
    });
  };
  collect(value);
  for (const key of AUTHORITY_KEYS) expect(keys).not.toContain(key);
}

describe("PolynomialDegreeLeadingCoefficientActivity", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it("renders the exact source Worked expressions, values, steps, and final answer", () => {
    const output = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(propsFor(0, "worked_example"), {
      activityId: "topic-1-4.example-1.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Worked Example: Degree and Leading Coefficient" }),
    ).toBeTruthy();
    expect(screen.getByText("Find the leading coefficient and degree.")).toBeTruthy();
    expect(screen.getByLabelText("a polynomial").textContent).toBe("f(x) = 3x4 + 2x - 7");
    expect(screen.getByLabelText("b polynomial").textContent).toBe("y = 0.5x - 7x3 + 11");
    expect(screen.getByLabelText("c polynomial").textContent).toBe("g(x) = 4");
    expect(screen.getByLabelText("a polynomial").querySelector("sup")?.textContent).toBe("4");
    expect(screen.getByText("Degree: 4")).toBeTruthy();
    expect(screen.getByText("Leading coefficient: 3")).toBeTruthy();
    expect(screen.getByText("Degree: 3")).toBeTruthy();
    expect(screen.getByText("Leading coefficient: -7")).toBeTruthy();
    expect(screen.getByText("Degree: 0")).toBeTruthy();
    expect(screen.getByText("Leading coefficient: 4")).toBeTruthy();
    for (const step of output.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("submits all six raw Guided answers only after every field is nonblank", () => {
    const props = propsFor(1, "guided_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(props, { onSubmit, onComplete });

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Degree and Leading Coefficient" }),
    ).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(GUIDED_HELP)).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    const rawAnswers = {
      a_degree: " 5 ",
      a_leading_coefficient: "-2",
      b_degree: "2.0",
      b_leading_coefficient: " 3.5",
      c_degree: "0",
      c_leading_coefficient: "-1",
    };
    for (const [partId, rawAnswer] of Object.entries(rawAnswers)) {
      fireEvent.change(screen.getByRole("textbox", { name: partId.replace(/_/g, " ") }), {
        target: { value: rawAnswer },
      });
    }
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: "topic-1-4.example-1.guided_practice",
      mode: "guided_practice",
      answers: rawAnswers,
      parts: [
        { partId: "a_degree", rawAnswer: rawAnswers.a_degree },
        { partId: "a_leading_coefficient", rawAnswer: rawAnswers.a_leading_coefficient },
        { partId: "b_degree", rawAnswer: rawAnswers.b_degree },
        { partId: "b_leading_coefficient", rawAnswer: rawAnswers.b_leading_coefficient },
        { partId: "c_degree", rawAnswer: rawAnswers.c_degree },
        { partId: "c_leading_coefficient", rawAnswer: rawAnswers.c_leading_coefficient },
      ],
    });
    expect((payload.parts as unknown[]).length).toBe(6);
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("submits exact raw Independent fields without Guided or Worked content", () => {
    const props = propsFor(2, "independent_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    expectNoAuthority(props);
    renderActivity(props, {
      activityId: "topic-1-4.example-1.independent_practice",
      mode: "practice",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Degree and Leading Coefficient" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_HELP)).toBeNull();
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    const rawAnswers = {
      a_degree: "6",
      a_leading_coefficient: "1",
      b_degree: "3",
      b_leading_coefficient: "-4",
      c_degree: "0",
      c_leading_coefficient: "9",
    };
    for (const [partId, rawAnswer] of Object.entries(rawAnswers)) {
      fireEvent.change(screen.getByRole("textbox", { name: partId.replace(/_/g, " ") }), {
        target: { value: rawAnswer },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: "topic-1-4.example-1.independent_practice",
      mode: "independent_practice",
      answers: rawAnswers,
      parts: [
        { partId: "a_degree", rawAnswer: "6" },
        { partId: "a_leading_coefficient", rawAnswer: "1" },
        { partId: "b_degree", rawAnswer: "3" },
        { partId: "b_leading_coefficient", rawAnswer: "-4" },
        { partId: "c_degree", rawAnswer: "0" },
        { partId: "c_leading_coefficient", rawAnswer: "9" },
      ],
    });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    expectNoAuthority(payload);
  });

  it("keeps labels and input IDs unique across two instances", () => {
    render(
      <>
        <PolynomialDegreeLeadingCoefficientActivity
          {...propsFor(1, "independent_practice")}
          activityId="same-activity"
          mode="practice"
        />
        <PolynomialDegreeLeadingCoefficientActivity
          {...propsFor(1, "independent_practice")}
          activityId="same-activity"
          mode="practice"
        />
      </>,
    );

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    const ids = inputs.map((input) => input.id);
    expect(new Set(ids).size).toBe(12);
    expect(ids.every((id) => id.length > 0)).toBe(true);
    const labels = screen.getAllByText(/^[abc] (degree|leading coefficient)$/);
    expect(labels).toHaveLength(12);
    expect(new Set(labels.map((label) => label.getAttribute("for"))).size).toBe(12);
    expect(labels.every((label) => ids.includes(label.getAttribute("for") ?? ""))).toBe(true);
  });

  it("supports a custom title and required polynomial notation", () => {
    const notationProps = polynomialDegreeLeadingCoefficientSchema.parse({
      title: "Custom polynomial task",
      prompt: "Read the expressions.",
      items: [
        {
          id: "a",
          functionName: "y",
          terms: [
            { coefficient: 1, exponent: 1 },
            { coefficient: -1, exponent: 0 },
            { coefficient: 0.5, exponent: 2 },
          ],
        },
        {
          id: "b",
          functionName: "f",
          terms: [
            { coefficient: -1, exponent: 2 },
            { coefficient: 2, exponent: 0 },
          ],
        },
        {
          id: "c",
          functionName: "g",
          terms: [{ coefficient: 3, exponent: 0 }],
        },
      ],
      presentationMode: "independent_practice",
    }) as IndependentProps;
    renderActivity(notationProps, { mode: "practice" });

    expect(screen.getByRole("heading", { name: "Custom polynomial task" })).toBeTruthy();
    const expression = screen.getByLabelText("a polynomial");
    expect(expression.textContent).toBe("y = x - 1 + 0.5x2");
    expect(expression.querySelector("sup")?.textContent).toBe("2");
  });

  it("fails closed on a runtime and schema mode mismatch", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(propsFor(0, "independent_practice"), {
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(screen.getByRole("alert").textContent).toBe(
      "This activity is unavailable for this presentation mode.",
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByRole("button")).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
