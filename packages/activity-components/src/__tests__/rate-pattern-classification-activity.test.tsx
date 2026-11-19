import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
} from "@math-platform/math-content/knowledge-space";
import {
  ratePatternClassificationSchema,
  type RatePatternClassificationProps,
} from "@math-platform/math-content";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  RatePatternClassificationActivity,
  type RatePatternClassificationActivityProps,
} from "../index";

const SOURCE_PROMPT = "Could each function be linear, quadratic, or neither?";
const SOURCE_CASES = [
  { id: "a", functionName: "f", xValues: [1, 2, 3, 4], yValues: [0, 1, 4, 9] },
  { id: "b", functionName: "g", xValues: [1, 2, 5, 10], yValues: [0, 1, 4, 9] },
  { id: "c", functionName: "p", xValues: [1, 1.1, 1.2, 1.3], yValues: [1, 7, 11, 13] },
] as const;
const WORKED_STEPS = [
  "Equal input widths of 1 and constant second differences of 2 show that f could be quadratic (concave up).",
  "The input widths are 1, 3, and 5. The output changes are also 1, 3, and 5. Each average rate is 1, so g could be linear: g(x) = x - 1.",
  "Equal input widths of 0.1 and differences 6, 4, 2 with constant second differences of -2 show that p could be quadratic (concave down).",
];
const FINAL_ANSWER = "a) quadratic; b) linear; c) quadratic.";
const GUIDED_STEPS = [
  "Check equal input widths before comparing differences.",
  "Find the first differences for each case.",
  "Compare first and second differences.",
  "Classify each function from its difference pattern.",
];
const GUIDED_HELP = "Use equal input widths before comparing differences.";
const AUTHORITY_KEYS = [
  "correctClassifications",
  "correctAnswer",
  "expectedAnswer",
  "steps",
  "solutionSteps",
  "finalAnswer",
  "gradingMetadata",
  "score",
  "correctness",
  "differences",
  "secondDifferences",
  "classification",
  "correctClassification",
  "answerKey",
  "authority",
  "solution",
];

type WorkedProps = Extract<RatePatternClassificationProps, { presentationMode: "worked_example" }>;
type GuidedProps = Extract<RatePatternClassificationProps, { presentationMode: "guided_practice" }>;
type IndependentProps = Extract<
  RatePatternClassificationProps,
  { presentationMode: "independent_practice" }
>;

function propsFor(seed: number, presentationMode: "worked_example"): WorkedProps;
function propsFor(seed: number, presentationMode: "guided_practice"): GuidedProps;
function propsFor(seed: number, presentationMode: "independent_practice"): IndependentProps;
function propsFor(
  seed: number,
  presentationMode: RatePatternClassificationProps["presentationMode"],
): RatePatternClassificationProps {
  const variant = generateTopic13RatePatternClassification(seed);
  const base = { prompt: variant.prompt, cases: [...variant.cases], presentationMode };

  if (presentationMode === "worked_example") {
    const output = generateTopic13RatePatternClassificationOutput(seed);
    return ratePatternClassificationSchema.parse({
      ...base,
      correctClassifications: output.expectedAnswer,
      steps: output.solutionSteps.map((step) => step.description),
      finalAnswer: FINAL_ANSWER,
    }) as WorkedProps;
  }
  if (presentationMode === "guided_practice") {
    return ratePatternClassificationSchema.parse({
      ...base,
      guidedSteps: GUIDED_STEPS,
      fieldHelp: GUIDED_HELP,
    }) as GuidedProps;
  }
  return ratePatternClassificationSchema.parse(base) as IndependentProps;
}

function renderActivity(
  props: RatePatternClassificationProps,
  overrides: Partial<RatePatternClassificationActivityProps> = {},
) {
  const activityProps = {
    activityId: "topic-1-3.example-1.guided_practice",
    mode: "guided" as const,
    ...props,
    ...overrides,
  } as RatePatternClassificationActivityProps;
  return render(<RatePatternClassificationActivity {...activityProps} />);
}

function formatValue(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function assertTables(
  cases: readonly {
    id: string;
    functionName: string;
    xValues: readonly number[];
    yValues: readonly number[];
  }[],
): void {
  const tables = screen.getAllByRole("table");
  expect(tables).toHaveLength(3);
  for (const tableCase of cases) {
    const table = screen.getByRole("table", {
      name: `Case ${tableCase.id}: ${tableCase.functionName}`,
    });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toBe(`x${tableCase.xValues.map(formatValue).join("")}`);
    expect(rows[1]?.textContent).toBe(
      `${tableCase.functionName}(x)${tableCase.yValues.map(formatValue).join("")}`,
    );
  }
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

describe("RatePatternClassificationActivity", () => {
  it("renders the exact seed-0 source tables and Worked answers", () => {
    const variant = generateTopic13RatePatternClassification(0);
    const output = generateTopic13RatePatternClassificationOutput(0);
    const props = propsFor(0, "worked_example");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, {
      activityId: "topic-1-3.example-1.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Worked Example: Classify Rate Patterns" }),
    ).toBeTruthy();
    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    expect(variant.cases).toEqual(SOURCE_CASES);
    assertTables(SOURCE_CASES);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(12);
    expect(radios.filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(3);
    expect(
      within(screen.getByRole("group", { name: "Classify case a" })).getByRole("radio", {
        name: "Quadratic",
      }),
    ).toHaveProperty("checked", true);
    expect(
      within(screen.getByRole("group", { name: "Classify case b" })).getByRole("radio", {
        name: "Linear",
      }),
    ).toHaveProperty("checked", true);
    expect(
      within(screen.getByRole("group", { name: "Classify case c" })).getByRole("radio", {
        name: "Quadratic",
      }),
    ).toHaveProperty("checked", true);
    for (const radio of radios) expect(radio).toHaveProperty("disabled", true);
    expect(output.solutionSteps.map((step) => step.description)).toEqual(WORKED_STEPS);
    for (const step of WORKED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("renders Guided tables and submits intentionally mixed raw classifications", () => {
    const variant = generateTopic13RatePatternClassification(1);
    const props = propsFor(1, "guided_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, { onSubmit, onComplete });

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Classify Rate Patterns" }),
    ).toBeTruthy();
    assertTables(variant.cases);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(GUIDED_HELP)).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    const choices = { a: "Linear", b: "Quadratic", c: "Neither" } as const;
    fireEvent.click(
      within(screen.getByRole("group", { name: "Classify case a" })).getByRole("radio", {
        name: choices.a,
      }),
    );
    expect(submit.disabled).toBe(true);
    for (const id of ["b", "c"] as const) {
      fireEvent.click(
        within(screen.getByRole("group", { name: `Classify case ${id}` })).getByRole("radio", {
          name: choices[id],
        }),
      );
    }
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: "topic-1-3.example-1.guided_practice",
      mode: "guided_practice",
    });
    expect(payload.answers).toEqual({ a: "linear", b: "quadratic", c: "neither" });
    expect(payload.parts).toEqual([
      { partId: "a", rawAnswer: "linear" },
      { partId: "b", rawAnswer: "quadratic" },
      { partId: "c", rawAnswer: "neither" },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("renders Independent seed-2 tables without teaching or answer leakage", () => {
    const variant = generateTopic13RatePatternClassification(2);
    const props = propsFor(2, "independent_practice");
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    renderActivity(props, {
      activityId: "topic-1-3.example-1.independent_practice",
      mode: "practice",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Classify Rate Patterns" }),
    ).toBeTruthy();
    assertTables(variant.cases);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_HELP)).toBeNull();
    for (const step of WORKED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FINAL_ANSWER)).toBeNull();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    const answers = { a: "cannot_determine", b: "linear", c: "quadratic" } as const;
    for (const [id, value] of Object.entries(answers)) {
      fireEvent.click(
        within(screen.getByRole("group", { name: `Classify case ${id}` })).getByRole("radio", {
          name:
            value === "cannot_determine"
              ? "Cannot determine"
              : value[0]!.toUpperCase() + value.slice(1),
        }),
      );
    }
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.answers).toEqual(answers);
    expect(payload.parts).toEqual([
      { partId: "a", rawAnswer: "cannot_determine" },
      { partId: "b", rawAnswer: "linear" },
      { partId: "c", rawAnswer: "quadratic" },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("uses unique radio names across cases and component instances", () => {
    const props = propsFor(1, "guided_practice");

    render(
      <>
        <RatePatternClassificationActivity activityId="same-activity" mode="guided" {...props} />
        <RatePatternClassificationActivity activityId="same-activity" mode="guided" {...props} />
      </>,
    );

    const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("name"));
    expect(names).toHaveLength(24);
    expect(new Set(names).size).toBe(6);
    for (const name of new Set(names)) {
      expect(names.filter((currentName) => currentName === name)).toHaveLength(4);
    }
  });

  it("respects a custom title in a valid presentation", () => {
    renderActivity(propsFor(1, "guided_practice"), { title: "Rate pattern review" });

    expect(screen.getByRole("heading", { name: "Rate pattern review" })).toBeTruthy();
  });

  it("blocks a mismatched runtime mode without controls or callbacks", () => {
    const onSubmit = vi.fn();
    renderActivity(propsFor(1, "independent_practice"), {
      mode: "guided",
      onSubmit,
      title: "Rate pattern review",
    });

    expect(screen.getByRole("alert").textContent).toMatch(/unavailable/i);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryAllByRole("table")).toHaveLength(0);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
