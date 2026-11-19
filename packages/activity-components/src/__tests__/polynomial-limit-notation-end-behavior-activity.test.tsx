import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  polynomialLimitNotationEndBehaviorSchema,
  type PolynomialLimitNotationEndBehaviorProps,
} from "@math-platform/math-content/schemas";
import {
  PolynomialLimitNotationEndBehaviorActivity,
  type PolynomialLimitNotationEndBehaviorActivityProps,
} from "../components/table/PolynomialLimitNotationEndBehaviorActivity";

const SOURCE_PROMPT = "Write limit statements for the end behavior of the following polynomials.";
const SOURCE_ITEMS = [
  { id: "a", functionName: "f", expression: "-3x^4" },
  { id: "b", functionName: "g", expression: "5x^3 + 2x^2 - 7" },
] as const;
const SOURCE_ANSWERS = {
  a_leftLimit: "negative_infinity",
  a_rightLimit: "negative_infinity",
  b_leftLimit: "negative_infinity",
  b_rightLimit: "positive_infinity",
} as const;
const SOURCE_PARTS = Object.entries(SOURCE_ANSWERS).map(([partId, rawAnswer]) => ({
  partId,
  rawAnswer,
}));
const SOURCE_STEPS = [
  "a) The leading term is -3x^4. The degree is even and the leading coefficient is negative, so lim(x to -infinity) f(x) = -infinity and lim(x to infinity) f(x) = -infinity.",
  "b) The leading term is 5x^3. The degree is odd and the leading coefficient is positive, so lim(x to -infinity) g(x) = -infinity and lim(x to infinity) g(x) = infinity.",
] as const;
const FINAL_ANSWER = "The four polynomial end-behavior limit statements are shown above.";
const WORKED_STATEMENTS = [
  "lim(x → −∞) f(x) = −∞",
  "lim(x → ∞) f(x) = −∞",
  "lim(x → −∞) g(x) = −∞",
  "lim(x → ∞) g(x) = ∞",
] as const;
const FORMAL_FRAMES = [
  "lim(x → −∞) f(x) =",
  "lim(x → ∞) f(x) =",
  "lim(x → −∞) g(x) =",
  "lim(x → ∞) g(x) =",
] as const;
const GUIDED_STEPS = [
  "Identify the leading term for each polynomial.",
  "Use degree parity and the leading coefficient.",
  "Write the left-end and right-end limit statements.",
] as const;
const FIELD_HELP = "Choose positive infinity or negative infinity for each formal limit statement.";

const WORKED_PROPS = polynomialLimitNotationEndBehaviorSchema.parse({
  prompt: SOURCE_PROMPT,
  items: SOURCE_ITEMS,
  presentationMode: "worked_example",
  correctAnswers: SOURCE_ANSWERS,
  steps: SOURCE_STEPS,
  finalAnswer: FINAL_ANSWER,
});
const GUIDED_PROPS = polynomialLimitNotationEndBehaviorSchema.parse({
  prompt: SOURCE_PROMPT,
  items: SOURCE_ITEMS,
  presentationMode: "guided_practice",
  guidedSteps: GUIDED_STEPS,
  fieldHelp: FIELD_HELP,
});
const INDEPENDENT_PROPS = polynomialLimitNotationEndBehaviorSchema.parse({
  prompt: SOURCE_PROMPT,
  items: [
    { id: "a", functionName: "f", expression: "6x^2" },
    { id: "b", functionName: "g", expression: "5x^6 - 5x^5 + 4" },
  ],
  presentationMode: "independent_practice",
});

const AUTHORITY_KEYS = [
  "answer",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "maxScore",
  "score",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
];

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

function renderActivity(
  props: PolynomialLimitNotationEndBehaviorProps,
  overrides: Partial<
    Pick<
      PolynomialLimitNotationEndBehaviorActivityProps,
      "activityId" | "mode" | "onSubmit" | "onComplete"
    >
  > = {},
) {
  return render(
    <PolynomialLimitNotationEndBehaviorActivity
      {...props}
      activityId="topic-1-6.example-4.independent_practice"
      mode="practice"
      {...overrides}
    />,
  );
}

function resultRadio(
  item: (typeof SOURCE_ITEMS)[number],
  side: "leftLimit" | "rightLimit",
  answer: "positive_infinity" | "negative_infinity",
) {
  const direction = side === "leftLimit" ? "left" : "right";
  const result = answer === "positive_infinity" ? "positive infinity" : "negative infinity";
  return screen.getByRole("radio", {
    name: new RegExp(`^${item.id} ${item.functionName} .*${direction}.*${result}$`, "i"),
  });
}

function chooseAnswers(answers: Record<string, string>): void {
  for (const [partId, answer] of Object.entries(answers)) {
    const [itemId, side] = partId.split("_") as [
      (typeof SOURCE_ITEMS)[number]["id"],
      "leftLimit" | "rightLimit",
    ];
    const item = SOURCE_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) throw new Error(`Missing item for ${partId}`);
    fireEvent.click(resultRadio(item, side, answer as "positive_infinity" | "negative_infinity"));
  }
}

describe("PolynomialLimitNotationEndBehaviorActivity", () => {
  it("renders the Worked source with four formal results and no submission controls", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(WORKED_PROPS, {
      activityId: "topic-1-6.example-4.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(screen.getByRole("heading", { name: /worked example/i })).toBeTruthy();
    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    for (const item of SOURCE_ITEMS) {
      expect(screen.getByText(`${item.id}) ${item.functionName}`)).toBeTruthy();
      expect(screen.getByText(item.expression)).toBeTruthy();
    }
    for (const statement of WORKED_STATEMENTS) expect(screen.getByText(statement)).toBeTruthy();
    expect(screen.getAllByText("Negative infinity")).toHaveLength(3);
    expect(screen.getByText("Positive infinity")).toBeTruthy();
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("renders Guided controls, steps, help, gating, and the exact four-part envelope", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const activityId = "topic-1-6.example-4.guided_practice";
    renderActivity(GUIDED_PROPS, { activityId, mode: "guided", onSubmit, onComplete });

    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    for (const item of SOURCE_ITEMS) expect(screen.getByText(item.expression)).toBeTruthy();
    for (const frame of FORMAL_FRAMES) expect(screen.getByText(frame)).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expect(screen.queryByText(FINAL_ANSWER)).toBeNull();
    expect(screen.getAllByRole("radio")).toHaveLength(8);
    for (const item of SOURCE_ITEMS) {
      for (const side of ["leftLimit", "rightLimit"] as const) {
        for (const answer of ["positive_infinity", "negative_infinity"] as const) {
          expect(resultRadio(item, side, answer)).toBeTruthy();
        }
      }
    }
    const submit = screen.getByRole("button", { name: /submit/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    const entries = Object.entries(SOURCE_ANSWERS);
    chooseAnswers(Object.fromEntries(entries.slice(0, 3)));
    expect(submit.disabled).toBe(true);
    chooseAnswers(Object.fromEntries(entries.slice(3)));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toEqual({
      contractVersion: "practice.v1",
      activityId,
      mode: "guided_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: SOURCE_ANSWERS,
      parts: SOURCE_PARTS,
    });
    expectNoAuthority(GUIDED_PROPS);
    expectNoAuthority(payload);
  });

  it("renders Independent controls without Guided or Worked content", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const activityId = "topic-1-6.example-4.independent_practice";
    renderActivity(INDEPENDENT_PROPS, { activityId, mode: "practice", onSubmit, onComplete });

    expect(screen.getAllByRole("radio")).toHaveLength(8);
    expect(screen.getByText("6x^2")).toBeTruthy();
    expect(screen.getByText("5x^6 - 5x^5 + 4")).toBeTruthy();
    for (const frame of FORMAL_FRAMES) expect(screen.getByText(frame)).toBeTruthy();
    expect(screen.queryByText(GUIDED_STEPS[0])).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expect(screen.queryByText(SOURCE_STEPS[0])).toBeNull();
    expect(screen.queryByText(FINAL_ANSWER)).toBeNull();
    chooseAnswers(SOURCE_ANSWERS);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      activityId,
      mode: "independent_practice",
      answers: SOURCE_ANSWERS,
      parts: SOURCE_PARTS,
    });
    expectNoAuthority(INDEPENDENT_PROPS);
    expectNoAuthority(payload);
  });

  it("uses unique input IDs and names across instances and accepts a custom title", () => {
    const { unmount } = render(
      <>
        <PolynomialLimitNotationEndBehaviorActivity
          {...INDEPENDENT_PROPS}
          activityId="same"
          mode="practice"
        />
        <PolynomialLimitNotationEndBehaviorActivity
          {...INDEPENDENT_PROPS}
          activityId="same"
          mode="practice"
        />
      </>,
    );
    const radios = screen.getAllByRole("radio");
    expect(new Set(radios.map((radio) => radio.getAttribute("id"))).size).toBe(16);
    expect(new Set(radios.map((radio) => radio.getAttribute("name"))).size).toBe(8);
    unmount();

    renderActivity({ ...INDEPENDENT_PROPS, title: "Custom limit review" });
    expect(screen.getByRole("heading", { name: "Custom limit review" })).toBeTruthy();
  });

  it("fails closed for every presentation and runtime mode mismatch", () => {
    const cases = [
      { props: WORKED_PROPS, mode: "guided" as const },
      { props: WORKED_PROPS, mode: "practice" as const },
      { props: GUIDED_PROPS, mode: "teaching" as const },
      { props: GUIDED_PROPS, mode: "practice" as const },
      { props: INDEPENDENT_PROPS, mode: "teaching" as const },
      { props: INDEPENDENT_PROPS, mode: "guided" as const },
    ];
    for (const { props, mode } of cases) {
      const { unmount } = renderActivity(props, { mode });
      expect(screen.getByRole("alert").textContent).toBe(
        "This activity is unavailable for this presentation mode.",
      );
      expect(screen.queryAllByRole("radio")).toHaveLength(0);
      expect(screen.queryByRole("button")).toBeNull();
      unmount();
    }
  });

  it("does not write browser console errors", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderActivity(GUIDED_PROPS, { mode: "guided" });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
