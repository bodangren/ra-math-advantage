import fs from "node:fs";
import path from "node:path";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  clearActivityRegistry,
  getActivityComponent,
} from "@math-platform/activity-components/registry";
import type { ProjectedActivity } from "@math-platform/knowledge-space-practice";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";
import {
  RendererPreview,
  getStudentPreviewProblem,
} from "@/app/(dev)/blueprint-qa/components/RendererPreview";
import { ensureActivitiesRegistered } from "@/app/(dev)/blueprint-qa/components/register-activities";

const NODE_ID = "math.precalc.skill.1.2.model-negative-rate-contexts";
const SOURCE_PROMPT =
  "The graph of the function y = f(x) in the xy-plane always has a negative rate of change. Which of the following definitions for the variables x and y would best model the function f?";
const SOURCE_OPTIONS = [
  {
    id: "A",
    label: "A",
    xDefinition: "the age, in years, of a young child",
    yDefinition: "the height, in inches, of the young child",
  },
  {
    id: "B",
    label: "B",
    xDefinition: "the total number of points scored in a basketball game",
    yDefinition: "the time remaining, in seconds, in the game",
  },
  {
    id: "C",
    label: "C",
    xDefinition: "the time, in seconds, since a ball was thrown straight up in the air",
    yDefinition: "the height, in feet, of the ball",
  },
  {
    id: "D",
    label: "D",
    xDefinition: "the radius, in meters, of a circle",
    yDefinition: "the area, in square inches, of the circle",
  },
] as const;
const SOURCE_STEPS = [
  "For an always-negative rate, x increases while y decreases.",
  "Option B models this: as points scored increase, time remaining in the game decreases.",
  "Options A and D increase, and option C does not always decrease. Therefore, option B is correct.",
] as const;
const SOURCE_FINAL_ANSWER = "Option B is correct because x increases while y decreases.";
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  "../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json",
);
const BANNED_PROP_KEYS = new Set([
  "correctAnswer",
  "answerKey",
  "hidden",
  "authority",
  "correctOptionId",
  "expectedAnswer",
  "isCorrect",
  "score",
  "maxScore",
  "gradingMetadata",
  "solutionSteps",
  "finalAnswer",
  "relationship",
  "correctness",
  "solution",
]);
const BANNED_PAYLOAD_KEYS = new Set([...BANNED_PROP_KEYS, "steps"]);

function loadActivities(): ProjectedActivity[] {
  const document = JSON.parse(fs.readFileSync(AP_PROJECTION_PATH, "utf8")) as {
    activities: ProjectedActivity[];
  };
  return document.activities.filter((activity) => activity.nodeId === NODE_ID);
}

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectObjectKeys(nestedValue, keys);
    });
  }
  return keys;
}

function makeState(mode: Exclude<ProjectedActivity["mode"], "assessment">, seed: number) {
  return {
    selectedNodeId: NODE_ID,
    seed,
    difficulty: 0.5,
    mode,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };
}

function makeNode() {
  return {
    id: NODE_ID,
    kind: "skill",
    title: "Model negative rate contexts",
    domain: "mathematics",
    reviewStatus: "draft",
    metadata: { course: "precalc", unit: "1", lesson: "2" },
  };
}

function expectNoBannedKeys(value: unknown, bannedKeys: Set<string>) {
  expect(collectObjectKeys(value).filter((key) => bannedKeys.has(key))).toEqual([]);
}

describe("Business Math QA negative-rate-context-choice registration", () => {
  it("registers and previews the three exact AP Topic 1.2 modes", async () => {
    const activities = loadActivities();
    expect(activities).toHaveLength(3);
    expect(activities.map((activity) => activity.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent("negative-rate-context-choice")).toBeTruthy();
    for (const activity of activities) {
      expect(getStudentPreviewProblem(activity)).toBeNull();
    }

    const worked = activities[0]!;
    const workedView = render(
      <RendererPreview
        state={makeState("worked_example", 0)}
        selectedNode={makeNode()}
        activity={worked}
        onIntercept={vi.fn()}
      />,
    );
    expect(
      await screen.findByRole("heading", { name: "Worked Example: Model a Negative Rate Context" }),
    ).toBeInTheDocument();
    expect(worked.props.prompt).toBe(SOURCE_PROMPT);
    expect(worked.props.options).toEqual(SOURCE_OPTIONS);
    expect(worked.props.steps).toEqual(SOURCE_STEPS);
    expect(worked.props.finalAnswer).toBe(SOURCE_FINAL_ANSWER);
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    for (const option of SOURCE_OPTIONS) {
      expect(screen.getByText(new RegExp(`^${option.label}\\s*$`))).toBeInTheDocument();
      expect(screen.getByText(option.xDefinition, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(option.yDefinition, { exact: false })).toBeInTheDocument();
    }
    const workedRadios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(workedRadios).toHaveLength(4);
    expect(workedRadios.every((radio) => radio.disabled)).toBe(true);
    expect(workedRadios.map((radio) => radio.checked)).toEqual([false, true, false, false]);
    for (const step of SOURCE_STEPS) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = render(
      <RendererPreview
        state={makeState("guided_practice", 1)}
        selectedNode={makeNode()}
        activity={guided}
        onIntercept={guidedIntercept}
      />,
    );
    expect(
      await screen.findByRole("heading", {
        name: "Guided Practice: Model a Negative Rate Context",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Determine how y changes as x increases in each option."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select the option in which y always decreases as x increases."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A negative rate of change means y decreases as x increases."),
    ).toBeInTheDocument();
    for (const option of guided.props.options as Array<{
      label: string;
      xDefinition: string;
      yDefinition: string;
    }>) {
      expect(screen.getByText(new RegExp(`^${option.label}\\s*$`))).toBeInTheDocument();
      expect(screen.getByText(option.xDefinition, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(option.yDefinition, { exact: false })).toBeInTheDocument();
    }
    expectNoBannedKeys(guided.props, BANNED_PROP_KEYS);
    const guidedRadios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(guidedRadios).toHaveLength(4);
    expect(guidedRadios.every((radio) => !radio.disabled)).toBe(true);
    const guidedSubmit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    fireEvent.click(guidedRadios[0]!);
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    await waitFor(() => expect(guidedIntercept).toHaveBeenCalledTimes(1));
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(guidedPayload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: guided.stableActivityId,
      mode: "guided_practice",
      status: "submitted",
      answers: { selectedOptionId: "A" },
    });
    expect(guidedPayload.answers).toEqual({ selectedOptionId: "A" });
    expect(guidedPayload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "A" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
    expectNoBannedKeys(guidedPayload, BANNED_PAYLOAD_KEYS);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = render(
      <RendererPreview
        state={makeState("independent_practice", 2)}
        selectedNode={makeNode()}
        activity={independent}
        onIntercept={independentIntercept}
      />,
    );
    expect(
      await screen.findByRole("heading", {
        name: "Independent Practice: Model a Negative Rate Context",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Determine how y changes as x increases in each option.")).toBeNull();
    expect(
      screen.queryByText("Select the option in which y always decreases as x increases."),
    ).toBeNull();
    expect(
      screen.queryByText("A negative rate of change means y decreases as x increases."),
    ).toBeNull();
    for (const step of SOURCE_STEPS) {
      expect(screen.queryByText(step)).toBeNull();
    }
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    for (const option of independent.props.options as Array<{
      label: string;
      xDefinition: string;
      yDefinition: string;
    }>) {
      expect(screen.getByText(new RegExp(`^${option.label}\\s*$`))).toBeInTheDocument();
      expect(screen.getByText(option.xDefinition, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(option.yDefinition, { exact: false })).toBeInTheDocument();
    }
    expectNoBannedKeys(independent.props, BANNED_PROP_KEYS);
    const independentRadios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(independentRadios).toHaveLength(4);
    expect(independentRadios.every((radio) => !radio.disabled)).toBe(true);
    const independentSubmit = screen.getByRole("button", {
      name: "Submit answer",
    }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    fireEvent.click(independentRadios[0]!);
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    await waitFor(() => expect(independentIntercept).toHaveBeenCalledTimes(1));
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<
      string,
      unknown
    >;
    expect(independentPayload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: independent.stableActivityId,
      mode: "independent_practice",
      status: "submitted",
      answers: { selectedOptionId: "A" },
    });
    expect(independentPayload.answers).toEqual({ selectedOptionId: "A" });
    expect(independentPayload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "A" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    expectNoBannedKeys(independentPayload, BANNED_PAYLOAD_KEYS);
    independentView.unmount();
  });
});
