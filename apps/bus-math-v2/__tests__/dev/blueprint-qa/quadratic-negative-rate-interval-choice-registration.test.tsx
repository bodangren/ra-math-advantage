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

const NODE_ID = "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics";
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  "../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json",
);
const SOURCE_PROMPT =
  "The function k is defined by k(x) = 3.16 + 4.2x - 0.85x^2 for -10 <= x <= 10. Which statement about k is correct?";
const SOURCE_STATEMENTS = [
  "k has a positive rate of change on -10 ≤ x ≤ 8.348.",
  "k has a positive rate of change on -0.663 ≤ x ≤ 5.605.",
  "k has a negative rate of change on -10 ≤ x ≤ 2.470.",
  "k has a negative rate of change on 2.470 ≤ x ≤ 10.",
] as const;
const SOURCE_STEPS = [
  "The quadratic opens downward.",
  "The vertex is at x = 2.470.",
  "The rate is negative to the right of the vertex, so option D is correct.",
] as const;
const SOURCE_FINAL_ANSWER =
  "Option D is correct because the rate is negative to the right of the vertex.";
const GUIDED_STEPS = [
  "Identify that the negative quadratic coefficient makes the parabola open downward.",
  "Find the vertex with x = -b/(2a).",
  "Use the right side of the vertex as the negative-rate interval.",
  "Select the one true statement.",
] as const;
const GUIDED_FIELD_HELP =
  "A downward-opening quadratic has a negative rate of change to the right of its vertex.";
const BANNED_KEYS = new Set([
  "correctAnswer",
  "answerKey",
  "hidden",
  "authority",
  "correctOptionId",
  "expectedAnswer",
  "gradingMetadata",
  "solutionSteps",
  "finalAnswer",
  "isCorrect",
  "score",
  "maxScore",
  "correctness",
  "relationship",
  "solution",
  "vertexX",
]);

function loadActivities(): ProjectedActivity[] {
  const document = JSON.parse(fs.readFileSync(AP_PROJECTION_PATH, "utf8")) as {
    activities: ProjectedActivity[];
  };
  return document.activities.filter((activity) => activity.nodeId === NODE_ID);
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
    title: "Determine negative-rate intervals for quadratics",
    domain: "mathematics",
    reviewStatus: "draft",
    metadata: { course: "precalc", unit: "1", lesson: "2" },
  };
}

function formatInput(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
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

function expectNoBannedKeys(value: unknown) {
  expect(collectObjectKeys(value).filter((key) => BANNED_KEYS.has(key))).toEqual([]);
}

describe("Business Math QA quadratic-negative-rate-interval-choice registration", () => {
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
    expect(getActivityComponent("quadratic-negative-rate-interval-choice")).toBeTruthy();
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
      await screen.findByRole("heading", {
        name: "Worked Example: Identify Negative-Rate Intervals",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    for (const statement of SOURCE_STATEMENTS) {
      expect(screen.getByText(statement)).toBeInTheDocument();
    }
    const workedRadios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(workedRadios).toHaveLength(4);
    expect(workedRadios.map((radio) => radio.checked)).toEqual([false, false, false, true]);
    expect(workedRadios.every((radio) => radio.disabled)).toBe(true);
    for (const step of SOURCE_STEPS) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
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
        name: "Guided Practice: Identify Negative-Rate Intervals",
      }),
    ).toBeInTheDocument();
    for (const step of GUIDED_STEPS) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    expect(screen.getByText(GUIDED_FIELD_HELP)).toBeInTheDocument();
    for (const option of guided.props.options as Array<{
      id: string;
      rateSign: string;
      startInput: number;
      endInput: number;
    }>) {
      expect(
        screen.getByText(
          `k has a ${option.rateSign} rate of change on ${formatInput(option.startInput)} ≤ x ≤ ${formatInput(option.endInput)}.`,
        ),
      ).toBeInTheDocument();
    }
    expectNoBannedKeys(guided.props);
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
    });
    expect(guidedPayload.answers).toEqual({ selectedOptionId: "A" });
    expect(guidedPayload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "A" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
    expectNoBannedKeys(guidedPayload);
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
        name: "Independent Practice: Identify Negative-Rate Intervals",
      }),
    ).toBeInTheDocument();
    for (const step of GUIDED_STEPS) {
      expect(screen.queryByText(step)).toBeNull();
    }
    expect(screen.queryByText(GUIDED_FIELD_HELP)).toBeNull();
    for (const step of SOURCE_STEPS) {
      expect(screen.queryByText(step)).toBeNull();
    }
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    for (const option of independent.props.options as Array<{
      id: string;
      rateSign: string;
      startInput: number;
      endInput: number;
    }>) {
      expect(
        screen.getByText(
          `k has a ${option.rateSign} rate of change on ${formatInput(option.startInput)} ≤ x ≤ ${formatInput(option.endInput)}.`,
        ),
      ).toBeInTheDocument();
    }
    expectNoBannedKeys(independent.props);
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
    });
    expect(independentPayload.answers).toEqual({ selectedOptionId: "A" });
    expect(independentPayload.parts).toEqual([{ partId: "selectedOptionId", rawAnswer: "A" }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    expectNoBannedKeys(independentPayload);
    independentView.unmount();
  });
});
