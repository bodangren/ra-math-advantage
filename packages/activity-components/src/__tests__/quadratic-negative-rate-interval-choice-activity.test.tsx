import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
} from "@math-platform/math-content/knowledge-space";
import {
  quadraticNegativeRateIntervalChoiceSchema,
  type QuadraticNegativeRateIntervalChoiceProps,
} from "@math-platform/math-content";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  QuadraticNegativeRateIntervalChoiceActivity,
  type QuadraticNegativeRateIntervalChoiceActivityProps,
} from "../index";

const GUIDED_STEPS = [
  "Find the vertex and determine where the rate changes sign.",
  "Select the interval where the rate is negative.",
] as const;
const FIELD_HELP = "Use the vertex to decide where the quadratic is decreasing.";
const FINAL_ANSWER = "Option D is correct because the rate is negative to the right of the vertex.";
const AUTHORITY_KEYS = [
  "correctOptionId",
  "expectedAnswer",
  "gradingMetadata",
  "solutionSteps",
  "finalAnswer",
  "score",
  "correctness",
  "vertexX",
];

type WorkedProps = Extract<
  QuadraticNegativeRateIntervalChoiceProps,
  { presentationMode: "worked_example" }
>;
type GuidedProps = Extract<
  QuadraticNegativeRateIntervalChoiceProps,
  { presentationMode: "guided_practice" }
>;
type IndependentProps = Extract<
  QuadraticNegativeRateIntervalChoiceProps,
  { presentationMode: "independent_practice" }
>;

function baseProps(seed: number) {
  const variant = generateTopic12QuadraticNegativeRateIntervalChoice(seed);
  return {
    prompt: variant.prompt,
    functionName: variant.functionName,
    constantTerm: variant.constantTerm,
    linearCoefficient: variant.linearCoefficient,
    quadraticCoefficient: variant.quadraticCoefficient,
    domain: [...variant.domain] as [number, number],
    options: [...variant.options],
  };
}

function propsFor(seed: number, presentationMode: "worked_example"): WorkedProps;
function propsFor(seed: number, presentationMode: "guided_practice"): GuidedProps;
function propsFor(seed: number, presentationMode: "independent_practice"): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: QuadraticNegativeRateIntervalChoiceProps["presentationMode"],
): QuadraticNegativeRateIntervalChoiceProps {
  const base = baseProps(seed);
  if (presentationMode === "worked_example") {
    const output = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed);
    return quadraticNegativeRateIntervalChoiceSchema.parse({
      ...base,
      presentationMode,
      correctOptionId: output.expectedAnswer.selectedOptionId,
      steps: output.solutionSteps.map((step) => step.description),
      finalAnswer: FINAL_ANSWER,
    });
  }
  if (presentationMode === "guided_practice") {
    return quadraticNegativeRateIntervalChoiceSchema.parse({
      ...base,
      presentationMode,
      guidedSteps: [...GUIDED_STEPS],
      fieldHelp: FIELD_HELP,
    });
  }
  return quadraticNegativeRateIntervalChoiceSchema.parse({ ...base, presentationMode });
}

function expectNoAuthority(value: unknown) {
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

function renderActivity(
  props: QuadraticNegativeRateIntervalChoiceProps,
  overrides: Partial<QuadraticNegativeRateIntervalChoiceActivityProps> = {},
) {
  const activityProps = {
    activityId: "precalc-topic-1-2-quadratic.guided_practice",
    mode: "guided" as const,
    ...props,
    ...overrides,
  } as QuadraticNegativeRateIntervalChoiceActivityProps;
  return render(<QuadraticNegativeRateIntervalChoiceActivity {...activityProps} />);
}

describe("QuadraticNegativeRateIntervalChoiceActivity", () => {
  it("renders the seed-0 source Worked activity with the exact interval statements", () => {
    const variant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
    const output = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);
    const props = propsFor(0, "worked_example");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, {
      activityId: "precalc-topic-1-2-quadratic.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Worked Example: Identify Negative-Rate Intervals" }),
    ).toBeTruthy();
    expect(screen.getByText(variant.prompt)).toBeTruthy();
    expect(screen.getByRole("group", { name: "Select the interval statement." })).toBeTruthy();
    expect(screen.getByText("k has a positive rate of change on -10 ≤ x ≤ 8.348.")).toBeTruthy();
    expect(screen.getByText("k has a positive rate of change on -0.663 ≤ x ≤ 5.605.")).toBeTruthy();
    expect(screen.getByText("k has a negative rate of change on -10 ≤ x ≤ 2.470.")).toBeTruthy();
    expect(screen.getByText("k has a negative rate of change on 2.470 ≤ x ≤ 10.")).toBeTruthy();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    expect(radios.filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1);
    expect(
      screen.getByRole("radio", { name: /D.*negative rate of change on 2\.470/ }),
    ).toHaveProperty("checked", true);
    for (const radio of radios) expect(radio).toHaveProperty("disabled", true);
    for (const step of output.solutionSteps)
      expect(screen.getByText(step.description)).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("renders Guided options and submits a schema-valid raw answer", () => {
    const props = propsFor(1, "guided_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, { onSubmit, onComplete });

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Identify Negative-Rate Intervals" }),
    ).toBeTruthy();
    for (const option of props.options) {
      expect(
        screen.getByText(
          `k has a ${option.rateSign} rate of change on ${formatInput(option.startInput)} ≤ x ≤ ${formatInput(option.endInput)}.`,
        ),
      ).toBeTruthy();
    }
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    const fieldset = screen.getByRole("group", { name: "Select the interval statement." });
    expect(fieldset.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.getElementById(fieldset.getAttribute("aria-describedby")!)?.textContent).toBe(
      FIELD_HELP,
    );
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: /^A / }));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: "precalc-topic-1-2-quadratic.guided_practice",
      mode: "guided_practice",
      answers: { selectedOptionId: "A" },
    });
    expect(payload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "A" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("renders Independent options without scaffold or answer leakage", () => {
    const props = propsFor(2, "independent_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, {
      activityId: "precalc-topic-1-2-quadratic.independent_practice",
      mode: "practice",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", {
        name: "Independent Practice: Identify Negative-Rate Intervals",
      }),
    ).toBeTruthy();
    for (const option of props.options) {
      expect(
        screen.getByText(
          `k has a ${option.rateSign} rate of change on ${formatInput(option.startInput)} ≤ x ≤ ${formatInput(option.endInput)}.`,
        ),
      ).toBeTruthy();
    }
    expect(screen.queryByText(GUIDED_STEPS[0])).toBeNull();
    expect(screen.queryByText(GUIDED_STEPS[1])).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expect(screen.queryByText(FINAL_ANSWER)).toBeNull();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: /^A / }));
    fireEvent.click(submit);

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.answers).toEqual({ selectedOptionId: "A" });
    expect(payload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "A" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("blocks mismatched runtime and presentation modes and supports a custom title", () => {
    const onSubmit = vi.fn();

    renderActivity(propsFor(1, "independent_practice"), {
      mode: "guided",
      onSubmit,
      title: "Choose a quadratic interval",
    });

    expect(screen.getByRole("heading", { name: "Choose a quadratic interval" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/unavailable/i);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

function formatInput(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}
