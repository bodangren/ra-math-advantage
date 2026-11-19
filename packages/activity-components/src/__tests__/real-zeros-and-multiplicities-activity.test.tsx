import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { generateTopic15RealZerosAndMultiplicitiesOutput } from "@math-platform/math-content/knowledge-space";
import {
  realZerosAndMultiplicitiesSchema,
  type RealZerosAndMultiplicitiesProps,
} from "@math-platform/math-content/schemas";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  RealZerosAndMultiplicitiesActivity,
  type RealZerosAndMultiplicitiesActivityProps,
} from "../components/table/RealZerosAndMultiplicitiesActivity";

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "isCorrect",
  "maxScore",
  "normalizedAnswer",
  "score",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
];

type IndependentProps = Extract<
  RealZerosAndMultiplicitiesProps,
  { presentationMode: "independent_practice" }
>;

function publicProps(seed: number): IndependentProps {
  return realZerosAndMultiplicitiesSchema.parse(
    generateTopic15RealZerosAndMultiplicitiesOutput(seed).data.rendererProps,
  ) as IndependentProps;
}

function workedProps(): Extract<
  RealZerosAndMultiplicitiesProps,
  { presentationMode: "worked_example" }
> {
  const output = generateTopic15RealZerosAndMultiplicitiesOutput(0);
  return realZerosAndMultiplicitiesSchema.parse({
    ...publicProps(0),
    presentationMode: "worked_example",
    correctAnswers: output.expectedAnswer,
    steps: output.solutionSteps.map((step) => step.description),
    finalAnswer: "The real zeros and their multiplicities are shown for both functions.",
  }) as Extract<RealZerosAndMultiplicitiesProps, { presentationMode: "worked_example" }>;
}

function guidedProps(): Extract<
  RealZerosAndMultiplicitiesProps,
  { presentationMode: "guided_practice" }
> {
  return realZerosAndMultiplicitiesSchema.parse({
    ...publicProps(1),
    presentationMode: "guided_practice",
    guidedSteps: [
      "Find each factor that can make the function equal zero.",
      "Count repeated factors to find each multiplicity.",
    ],
    fieldHelp: "Enter each zero and its multiplicity for both functions.",
  }) as Extract<RealZerosAndMultiplicitiesProps, { presentationMode: "guided_practice" }>;
}

function renderActivity(
  props: RealZerosAndMultiplicitiesProps,
  overrides: Partial<RealZerosAndMultiplicitiesActivityProps> = {},
) {
  const activityProps = {
    ...props,
    activityId: "topic-1-5.example-1",
    mode: "practice" as const,
    ...overrides,
  } as RealZerosAndMultiplicitiesActivityProps;
  return render(<RealZerosAndMultiplicitiesActivity {...activityProps} />);
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

describe("RealZerosAndMultiplicitiesActivity", () => {
  it("renders the live Worked source with pairs, steps, and no controls", () => {
    const output = generateTopic15RealZerosAndMultiplicitiesOutput(0);
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(workedProps(), {
      activityId: "topic-1-5.example-1.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Worked Example: Real Zeros and Multiplicities" }),
    ).toBeTruthy();
    expect(screen.getByText(output.prompt)).toBeTruthy();
    const rendererProps = output.data.rendererProps as { items: Array<{ expression: string }> };
    for (const item of rendererProps.items) {
      expect(
        screen.getByLabelText(new RegExp(item.expression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
      ).toBeTruthy();
    }
    for (const pair of [
      ...(
        output.expectedAnswer as {
          a: Array<{ zero: number; multiplicity: number }>;
          b: Array<{ zero: number; multiplicity: number }>;
        }
      ).a,
      ...(
        output.expectedAnswer as {
          a: Array<{ zero: number; multiplicity: number }>;
          b: Array<{ zero: number; multiplicity: number }>;
        }
      ).b,
    ]) {
      expect(screen.getByText(`x = ${pair.zero} (multiplicity ${pair.multiplicity})`)).toBeTruthy();
    }
    for (const step of output.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(
      screen.getByText("The real zeros and their multiplicities are shown for both functions."),
    ).toBeTruthy();
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("collects Guided pairs, supports a third row, and submits the exact envelope", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const props = guidedProps();
    renderActivity(props, { mode: "guided", onSubmit, onComplete });

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Real Zeros and Multiplicities" }),
    ).toBeTruthy();
    expect(screen.getByText(props.guidedSteps[0])).toBeTruthy();
    expect(screen.getByText(props.guidedSteps[1])).toBeTruthy();
    expect(screen.getByText(props.fieldHelp)).toBeTruthy();
    const initialInputs = screen.getAllByRole("spinbutton");
    expect(initialInputs).toHaveLength(8);
    for (const input of initialInputs) {
      expect(input.className).toBe(
        "min-w-0 w-full rounded-md border border-border bg-background px-2 py-1 text-foreground",
      );
      expect(input.parentElement?.className).toBe("flex min-w-0 flex-col gap-1");
    }
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(submit.className).toBe(
      "rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50",
    );

    const addRow = screen.getByRole("button", { name: "Add third row for f" });
    expect(addRow.className).toBe(
      "mt-2 rounded-md border border-border bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80",
    );
    fireEvent.click(addRow);
    const removeRow = screen.getByRole("button", { name: "Remove third row for f" });
    expect(removeRow.className).toBe(
      "mt-2 rounded-md border border-border bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/80",
    );
    expect(screen.getAllByRole("spinbutton")).toHaveLength(10);
    const values = [
      ["Zero for f pair 1", "-4"],
      ["Multiplicity for f pair 1", "1"],
      ["Zero for f pair 2", "0"],
      ["Multiplicity for f pair 2", "2"],
      ["Zero for f pair 3", "3"],
      ["Multiplicity for f pair 3", "1"],
      ["Zero for g pair 1", "-2"],
      ["Multiplicity for g pair 1", "1"],
      ["Zero for g pair 2", "2"],
      ["Multiplicity for g pair 2", "2"],
    ] as const;
    for (const [label, value] of values)
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toEqual({
      contractVersion: "practice.v1",
      activityId: "topic-1-5.example-1",
      mode: "guided_practice",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: {
        a: [
          { zero: -4, multiplicity: 1 },
          { zero: 0, multiplicity: 2 },
          { zero: 3, multiplicity: 1 },
        ],
        b: [
          { zero: -2, multiplicity: 1 },
          { zero: 2, multiplicity: 2 },
        ],
      },
      parts: [
        {
          partId: "a",
          rawAnswer: [
            { zero: -4, multiplicity: 1 },
            { zero: 0, multiplicity: 2 },
            { zero: 3, multiplicity: 1 },
          ],
        },
        {
          partId: "b",
          rawAnswer: [
            { zero: -2, multiplicity: 1 },
            { zero: 2, multiplicity: 2 },
          ],
        },
      ],
    });
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("collects Independent pairs, removes only a third row, and omits guidance", () => {
    const onSubmit = vi.fn();
    const props = publicProps(2);
    renderActivity(props, { onSubmit });

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Real Zeros and Multiplicities" }),
    ).toBeTruthy();
    expect(screen.queryByText(/Find each factor/)).toBeNull();
    expect(screen.queryByText(/Enter each zero/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add third row for g" }));
    expect(screen.getAllByRole("spinbutton")).toHaveLength(10);
    fireEvent.click(screen.getByRole("button", { name: "Remove third row for g" }));
    expect(screen.getAllByRole("spinbutton")).toHaveLength(8);

    const values = [
      ["Zero for f pair 1", "-3"],
      ["Multiplicity for f pair 1", "1"],
      ["Zero for f pair 2", "1"],
      ["Multiplicity for f pair 2", "2"],
      ["Zero for g pair 1", "-1"],
      ["Multiplicity for g pair 1", "1"],
      ["Zero for g pair 2", "4"],
      ["Multiplicity for g pair 2", "3"],
    ] as const;
    for (const [label, value] of values)
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      activityId: "topic-1-5.example-1",
      mode: "independent_practice",
      answers: {
        a: [
          { zero: -3, multiplicity: 1 },
          { zero: 1, multiplicity: 2 },
        ],
        b: [
          { zero: -1, multiplicity: 1 },
          { zero: 4, multiplicity: 3 },
        ],
      },
      parts: [
        {
          partId: "a",
          rawAnswer: [
            { zero: -3, multiplicity: 1 },
            { zero: 1, multiplicity: 2 },
          ],
        },
        {
          partId: "b",
          rawAnswer: [
            { zero: -1, multiplicity: 1 },
            { zero: 4, multiplicity: 3 },
          ],
        },
      ],
    });
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("uses unique control IDs, accepts a custom title, fails closed on mode mismatch, and has no console errors", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = render(
      <>
        <RealZerosAndMultiplicitiesActivity {...publicProps(1)} activityId="same" mode="practice" />
        <RealZerosAndMultiplicitiesActivity {...publicProps(1)} activityId="same" mode="practice" />
      </>,
    );
    const inputs = Array.from(document.querySelectorAll("input"));
    expect(new Set(inputs.map((input) => input.id)).size).toBe(inputs.length);
    expect(inputs.every((input) => document.querySelector(`label[for="${input.id}"]`))).toBe(true);
    unmount();

    const custom = renderActivity({ ...publicProps(0), title: "Custom zeros review" });
    expect(screen.getByRole("heading", { name: "Custom zeros review" })).toBeTruthy();
    screen.getByRole("button", { name: "Submit answer" });
    custom.unmount();

    renderActivity(publicProps(0), { mode: "teaching" });
    expect(screen.getByRole("alert").textContent).toBe(
      "This activity is unavailable for this presentation mode.",
    );
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
