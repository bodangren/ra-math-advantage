import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  generateTopic13ConcavityFromRateChange,
  generateTopic13ConcavityFromRateChangeOutput,
} from "@math-platform/math-content/knowledge-space";
import {
  concavityFromRateChangeSchema,
  type ConcavityFromRateChangeProps,
} from "@math-platform/math-content";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  ConcavityFromRateChangeActivity,
  type ConcavityFromRateChangeActivityProps,
} from "../index";

const SOURCE_PROMPT = "Determine concavity.";
const SOURCE_STEPS = [
  "The first differences are -3, -2, and -1.",
  "The first differences increase from -3 to -2 to -1.",
  "Therefore, k is concave up.",
] as const;
const SOURCE_FINAL_ANSWER = "The first differences increase, so k is concave up.";
const GUIDED_STEPS = [
  "Check the input widths.",
  "Find the first differences.",
  "Compare the first differences.",
] as const;
const GUIDED_HELP = "An increase in first differences means the table is concave up.";
const AUTHORITY_KEYS = [
  "correctClassification",
  "correctAnswer",
  "expectedAnswer",
  "gradingMetadata",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "score",
  "correctness",
  "differences",
  "secondDifferences",
  "answerKey",
  "authority",
  "hidden",
  "solution",
];

type WorkedProps = Extract<ConcavityFromRateChangeProps, { presentationMode: "worked_example" }>;
type GuidedProps = Extract<ConcavityFromRateChangeProps, { presentationMode: "guided_practice" }>;
type IndependentProps = Extract<
  ConcavityFromRateChangeProps,
  { presentationMode: "independent_practice" }
>;

function propsFor(seed: number, presentationMode: "worked_example"): WorkedProps;
function propsFor(seed: number, presentationMode: "guided_practice"): GuidedProps;
function propsFor(seed: number, presentationMode: "independent_practice"): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: ConcavityFromRateChangeProps["presentationMode"],
): ConcavityFromRateChangeProps {
  const variant = generateTopic13ConcavityFromRateChange(seed);
  const base = {
    prompt: variant.prompt,
    functionName: variant.functionName,
    xValues: [...variant.xValues],
    yValues: [...variant.yValues],
    presentationMode,
  };

  if (presentationMode === "worked_example") {
    const output = generateTopic13ConcavityFromRateChangeOutput(seed);
    return concavityFromRateChangeSchema.parse({
      ...base,
      correctClassification: output.expectedAnswer.classification,
      steps: output.solutionSteps.map((step) => step.description),
      finalAnswer: SOURCE_FINAL_ANSWER,
    }) as WorkedProps;
  }
  if (presentationMode === "guided_practice") {
    return concavityFromRateChangeSchema.parse({
      ...base,
      guidedSteps: GUIDED_STEPS,
      fieldHelp: GUIDED_HELP,
    }) as GuidedProps;
  }
  return concavityFromRateChangeSchema.parse(base) as IndependentProps;
}

function renderActivity(
  props: ConcavityFromRateChangeProps,
  overrides: Partial<ConcavityFromRateChangeActivityProps> = {},
) {
  const activityProps = {
    activityId: "topic-1-3.example-2.guided_practice",
    mode: "guided" as const,
    ...props,
    ...overrides,
  } as ConcavityFromRateChangeActivityProps;
  return render(<ConcavityFromRateChangeActivity {...activityProps} />);
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

describe("ConcavityFromRateChangeActivity", () => {
  it("renders the exact seed-0 Worked table and answer", () => {
    const variant = generateTopic13ConcavityFromRateChange(0);
    const output = generateTopic13ConcavityFromRateChangeOutput(0);
    const props = propsFor(0, "worked_example");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, {
      activityId: "topic-1-3.example-2.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Worked Example: Determine Concavity" }),
    ).toBeTruthy();
    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    expect(variant.xValues).toEqual([1, 1.1, 1.2, 1.3]);
    expect(variant.yValues).toEqual([4, 1, -1, -2]);
    const table = screen.getByRole("table", { name: "k(x) values" });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getAllByRole("row")[0]?.textContent).toBe("x11.11.21.3");
    expect(within(table).getAllByRole("row")[1]?.textContent).toBe("k(x)41-1-2");

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios.filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1);
    expect(screen.getByRole("radio", { name: "Concave up" })).toHaveProperty("checked", true);
    expect(screen.getByRole("radio", { name: "Concave down" })).toHaveProperty("checked", false);
    expect(screen.getByRole("radio", { name: "Neither" })).toHaveProperty("checked", false);
    for (const radio of radios) expect(radio).toHaveProperty("disabled", true);
    expect(output.solutionSteps.map((step) => step.description)).toEqual(SOURCE_STEPS);
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("submits a raw Guided classification envelope", () => {
    const variant = generateTopic13ConcavityFromRateChange(1);
    const props = propsFor(1, "guided_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, { onSubmit, onComplete });

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Determine Concavity" }),
    ).toBeTruthy();
    expect(screen.getByRole("table", { name: "k(x) values" })).toBeTruthy();
    for (const value of variant.xValues) expect(screen.getByText(String(value))).toBeTruthy();
    for (const value of variant.yValues) expect(screen.getByText(String(value))).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(GUIDED_HELP)).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "Concave down" }));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: "topic-1-3.example-2.guided_practice",
      mode: "guided_practice",
    });
    expect(payload.answers).toEqual({ classification: "concave_down" });
    expect(payload.parts).toEqual([{ partId: "classification", rawAnswer: "concave_down" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("submits Independent raw data without teaching or answer leakage", () => {
    const variant = generateTopic13ConcavityFromRateChange(2);
    const props = propsFor(2, "independent_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, {
      activityId: "topic-1-3.example-2.independent_practice",
      mode: "practice",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Determine Concavity" }),
    ).toBeTruthy();
    const table = screen.getByRole("table", { name: "k(x) values" });
    for (const value of [...variant.xValues, ...variant.yValues])
      expect(within(table).getByText(String(value))).toBeTruthy();
    for (const step of SOURCE_STEPS) expect(screen.queryByText(step)).toBeNull();
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_HELP)).toBeNull();
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();

    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Neither" }));
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.answers).toEqual({ classification: "neither" });
    expect(payload.parts).toEqual([{ partId: "classification", rawAnswer: "neither" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("uses unique radio names across two instances and supports a custom title", () => {
    const props = propsFor(1, "guided_practice");

    render(
      <>
        <ConcavityFromRateChangeActivity
          activityId="same-activity"
          mode="guided"
          {...props}
          title="Concavity review"
        />
        <ConcavityFromRateChangeActivity activityId="same-activity" mode="guided" {...props} />
      </>,
    );

    expect(screen.getByRole("heading", { name: "Concavity review" })).toBeTruthy();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(6);
    const names = radios.map((radio) => radio.getAttribute("name"));
    expect(new Set(names)).toHaveLength(2);
    for (const name of new Set(names)) {
      expect(names.filter((currentName) => currentName === name)).toHaveLength(3);
    }
  });

  it("blocks a mismatched runtime mode without controls or callbacks", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(propsFor(1, "independent_practice"), {
      mode: "guided",
      onSubmit,
      onComplete,
      title: "Unavailable concavity review",
    });

    expect(screen.getByRole("alert").textContent).toMatch(/unavailable/i);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button")).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
