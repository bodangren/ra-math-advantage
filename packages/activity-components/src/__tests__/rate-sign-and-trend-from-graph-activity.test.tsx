import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { generateTopic14RateSignAndTrendOutput } from "@math-platform/math-content/knowledge-space";
import {
  rateSignAndTrendFromGraphSchema,
  type RateSignAndTrendFromGraphProps,
} from "@math-platform/math-content";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  RateSignAndTrendFromGraphActivity,
  type RateSignAndTrendFromGraphActivityProps,
} from "../index";

const GUIDED_STEPS = ["Read the interval.", "Compare the rate changes."] as const;
const GUIDED_HELP = "Use the graph direction and how it changes.";
const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "score",
  "maxScore",
  "normalizedAnswer",
  "authority",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
];

type PublicProps = Extract<
  RateSignAndTrendFromGraphProps,
  { presentationMode: "independent_practice" }
>;

function publicProps(seed: number): PublicProps {
  return rateSignAndTrendFromGraphSchema.parse(
    generateTopic14RateSignAndTrendOutput(seed).data.rendererProps,
  ) as PublicProps;
}

function guidedProps(): Extract<
  RateSignAndTrendFromGraphProps,
  { presentationMode: "guided_practice" }
> {
  return rateSignAndTrendFromGraphSchema.parse({
    ...publicProps(1),
    presentationMode: "guided_practice",
    guidedSteps: GUIDED_STEPS,
    fieldHelp: GUIDED_HELP,
  }) as Extract<RateSignAndTrendFromGraphProps, { presentationMode: "guided_practice" }>;
}

function workedProps(): Extract<
  RateSignAndTrendFromGraphProps,
  { presentationMode: "worked_example" }
> {
  const output = generateTopic14RateSignAndTrendOutput(0);
  return rateSignAndTrendFromGraphSchema.parse({
    ...publicProps(0),
    presentationMode: "worked_example",
    correctAnswers: output.expectedAnswer,
    steps: output.solutionSteps.map((step) => step.description),
    finalAnswer: "The rate is positive and decreasing.",
  }) as Extract<RateSignAndTrendFromGraphProps, { presentationMode: "worked_example" }>;
}

function renderActivity(
  props: RateSignAndTrendFromGraphProps,
  overrides: Partial<RateSignAndTrendFromGraphActivityProps> = {},
) {
  const activityProps = {
    ...props,
    activityId: "topic-1-4.example-3.guided_practice",
    mode: "guided" as const,
    ...overrides,
  } as RateSignAndTrendFromGraphActivityProps;
  return render(<RateSignAndTrendFromGraphActivity {...activityProps} />);
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

describe("RateSignAndTrendFromGraphActivity", () => {
  it("renders the live Worked graph, source data, answers, and steps without submission controls", () => {
    const output = generateTopic14RateSignAndTrendOutput(0);
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(workedProps(), {
      activityId: "topic-1-4.example-3.worked_example",
      mode: "teaching",
      onSubmit,
      onComplete,
    });

    expect(
      screen.getByRole("heading", { name: "Worked Example: Rate Sign and Trend" }),
    ).toBeTruthy();
    expect(screen.getByText(output.prompt)).toBeTruthy();
    expect(screen.getByText("Open interval: (3, 4)")).toBeTruthy();
    expect(screen.getByRole("img", { name: /Graph of h.*interval \(3, 4\)/ })).toBeTruthy();
    const table = screen.getByRole("table", { name: "Graph data for h" });
    for (const point of publicProps(0).points) {
      expect(table.textContent).toContain(String(point.x));
      expect(table.textContent).toContain(String(point.y));
    }
    expect(screen.getByText("positive")).toBeTruthy();
    expect(screen.getByText("decreasing")).toBeTruthy();
    for (const step of output.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText("The rate is positive and decreasing.")).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("submits the exact raw Guided envelope after both choices exist", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const props = guidedProps();
    renderActivity(props, { onSubmit, onComplete });

    expect(
      screen.getByRole("heading", { name: "Guided Practice: Rate Sign and Trend" }),
    ).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(GUIDED_HELP)).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Positive rate"));
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Decreasing rate trend"));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: "topic-1-4.example-3.guided_practice",
      mode: "guided_practice",
      answers: { rateSign: "positive", rateTrend: "decreasing" },
      parts: [
        { partId: "rateSign", rawAnswer: "positive" },
        { partId: "rateTrend", rawAnswer: "decreasing" },
      ],
    });
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("submits raw Independent choices without Guided or Worked content", () => {
    const onSubmit = vi.fn();
    const props = publicProps(2);
    renderActivity(props, {
      activityId: "topic-1-4.example-3.independent_practice",
      mode: "practice",
      onSubmit,
    });

    expect(
      screen.getByRole("heading", { name: "Independent Practice: Rate Sign and Trend" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.queryByText(GUIDED_HELP)).toBeNull();
    expect(screen.queryByText("The rate is positive and decreasing.")).toBeNull();
    fireEvent.click(screen.getByLabelText("Negative rate"));
    fireEvent.click(screen.getByLabelText("Increasing rate trend"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      activityId: "topic-1-4.example-3.independent_practice",
      mode: "independent_practice",
      answers: { rateSign: "negative", rateTrend: "increasing" },
      parts: [
        { partId: "rateSign", rawAnswer: "negative" },
        { partId: "rateTrend", rawAnswer: "increasing" },
      ],
    });
    expectNoAuthority(props);
    expectNoAuthority(payload);
  });

  it("uses unique control IDs and fails closed for a mode mismatch", () => {
    const instances = render(
      <>
        <RateSignAndTrendFromGraphActivity {...publicProps(1)} activityId="same" mode="practice" />
        <RateSignAndTrendFromGraphActivity {...publicProps(1)} activityId="same" mode="practice" />
      </>,
    );
    const ids = screen.getAllByRole("radio").map((input) => input.id);
    expect(new Set(ids).size).toBe(8);
    instances.unmount();

    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    renderActivity(publicProps(0), { mode: "teaching", onSubmit, onComplete });
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button")).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
