import fs from "node:fs";
import path from "node:path";

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const NODE_ID = "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts";
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  "../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json",
);
const RENDERER_KEY = "polynomial-inequality-sign-chart";
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;
const BANNED_AUTHORITY_KEYS = new Set([
  "answer",
  "answerKey",
  "authority",
  "correctAnswer",
  "correctAnswers",
  "correctness",
  "expectedAnswer",
  "finalAnswer",
  "grading",
  "gradingMetadata",
  "isCorrect",
  "maxScore",
  "normalizedAnswer",
  "score",
  "solutionSteps",
  "steps",
]);

function loadActivities(): ProjectedActivity[] {
  const document = JSON.parse(fs.readFileSync(AP_PROJECTION_PATH, "utf8")) as {
    activities: ProjectedActivity[];
  };
  return document.activities.filter((activity) => activity.nodeId === NODE_ID);
}

function makeState(activity: ProjectedActivity) {
  if (activity.mode === "assessment") throw new Error("Assessment is not a student preview mode.");
  return {
    selectedNodeId: NODE_ID,
    seed: activity.mode === "worked_example" ? 0 : activity.mode === "guided_practice" ? 1 : 2,
    difficulty: 0.5,
    mode: activity.mode,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };
}

function renderPreview(
  activity: ProjectedActivity,
  onIntercept: (entry: { rawAnswer: unknown }) => void,
) {
  return render(
    <RendererPreview
      state={makeState(activity)}
      selectedNode={{
        id: NODE_ID,
        kind: "skill",
        title: "Solve polynomial inequalities using sign charts",
        domain: "math.precalc",
        reviewStatus: "draft",
        metadata: { course: "precalc", unit: "1", lesson: "5" },
      }}
      activity={activity}
      onIntercept={onIntercept}
    />,
  );
}

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectObjectKeys(item, keys));
  else if (value && typeof value === "object")
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectObjectKeys(nested, keys);
    });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectObjectKeys(value).filter((key) => BANNED_AUTHORITY_KEYS.has(key))).toEqual([]);
}

function expectPracticeEnvelope(
  payload: Record<string, unknown>,
  activityId: string,
  mode: "guided_practice" | "independent_practice",
  answers: { roots: number[]; intervalSigns: string[]; solution: string },
): void {
  expect(payload).toEqual({
    activityId,
    analytics: undefined,
    answers,
    artifact: undefined,
    attemptNumber: 1,
    contractVersion: "practice.v1",
    interactionHistory: undefined,
    mode,
    parts: [
      { partId: "roots", rawAnswer: answers.roots },
      { partId: "intervalSigns", rawAnswer: answers.intervalSigns },
      { partId: "solution", rawAnswer: answers.solution },
    ],
    status: "submitted",
    submittedAt: expect.any(String),
    studentFeedback: undefined,
    teacherSummary: undefined,
    timing: undefined,
  });
  expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
}

describe("Business Math QA polynomial-inequality-sign-chart registration", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it("registers and previews all exact Topic 1.5 Example 3 modes", async () => {
    const activities = loadActivities();
    expect(activities).toHaveLength(3);
    expect(activities.map((activity) => activity.mode)).toEqual(MODES);
    expect(activities.map((activity) => activity.stableActivityId)).toEqual(
      MODES.map((mode) => `${NODE_ID}.${mode}`),
    );
    expect(activities.map((activity) => activity.rendererKey)).toEqual([
      RENDERER_KEY,
      RENDERER_KEY,
      RENDERER_KEY,
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent(RENDERER_KEY)).toBeTruthy();
    for (const activity of activities) {
      expect(getStudentPreviewProblem(activity)).toBeNull();
    }

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = renderPreview(worked, workedIntercept);
    expect(
      await screen.findByRole("heading", {
        name: "Worked Example: Polynomial Inequality Sign Chart",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Student view unavailable")).toBeNull();
    expect(screen.getByText("Solve (x - 3)(x + 1)(x + 4) > 0.")).toBeInTheDocument();
    expect(screen.getByText("(x - 3)(x + 1)(x + 4) > 0", { exact: true })).toBeInTheDocument();
    expect(
      screen.getByText(
        "The critical points are x = -4 (odd multiplicity 1), x = -1 (odd multiplicity 1), x = 3 (odd multiplicity 1).",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Test points -5, -2, 0, 4 give signs -, +, -, + from left to right."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The inequality is strict, so the roots are not included."),
    ).toBeInTheDocument();
    expect(screen.getByText("Therefore, the solution is (-4, -1) ∪ (3, ∞).")).toBeInTheDocument();
    const workedAnswerLabel = screen.getByText("Answer:", { selector: "strong" });
    expect(workedAnswerLabel.parentElement).toHaveTextContent(
      "Answer: The solution is (-4, -1) ∪ (3, ∞).",
    );
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = renderPreview(guided, guidedIntercept);
    expect(
      await screen.findByRole("heading", {
        name: "Guided Practice: Polynomial Inequality Sign Chart",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Student view unavailable")).toBeNull();
    expect(screen.getByText("Solve (x+2)^2(x-5) <= 0.")).toBeInTheDocument();
    for (const text of [
      "Find and sort the distinct real roots.",
      "Test one value in each interval and record the sign.",
      "Use the inequality operator to write the interval union.",
      "Enter the sorted distinct real roots.",
      "Enter one sign for each interval from left to right.",
      "Write the solution as an interval union.",
    ])
      expect(screen.getByText(text)).toBeInTheDocument();
    expectNoAuthority(
      Object.fromEntries(
        Object.entries(guided.props as Record<string, unknown>).filter(
          ([key]) => key !== "fieldHelp",
        ),
      ),
    );
    const roots = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    const signs = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const solution = screen.getByRole("textbox", {
      name: "Solution interval union",
    }) as HTMLInputElement;
    const submit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(roots).toHaveLength(2);
    expect(signs).toHaveLength(3);
    expect(solution).toBeInTheDocument();
    expect(submit).toBeDisabled();
    fireEvent.change(roots[0], { target: { value: "5" } });
    fireEvent.change(roots[1], { target: { value: "-2" } });
    expect(screen.getByLabelText("Sign for (-∞, -2)")).toBeInTheDocument();
    expect(screen.getByLabelText("Sign for (-2, 5)")).toBeInTheDocument();
    expect(screen.getByLabelText("Sign for (5, ∞)")).toBeInTheDocument();
    fireEvent.change(signs[0], { target: { value: "-" } });
    fireEvent.change(signs[1], { target: { value: "-" } });
    fireEvent.change(signs[2], { target: { value: "+" } });
    expect(submit).toBeDisabled();
    fireEvent.change(solution, { target: { value: "  (-∞, 5]  " } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(guidedIntercept).toHaveBeenCalledOnce();
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(guidedPayload, guided.stableActivityId, "guided_practice", {
      roots: [5, -2],
      intervalSigns: ["-", "-", "+"],
      solution: "  (-∞, 5]  ",
    });
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = renderPreview(independent, independentIntercept);
    expect(
      await screen.findByRole("heading", {
        name: "Independent Practice: Polynomial Inequality Sign Chart",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Student view unavailable")).toBeNull();
    expect(screen.getByText("Solve (x+3)(x-1)(x-2) < 0.")).toBeInTheDocument();
    expect(screen.queryByText("Find and sort the distinct real roots.")).toBeNull();
    expect(screen.queryByText("Enter the sorted distinct real roots.")).toBeNull();
    expectNoAuthority(
      Object.fromEntries(Object.entries(independent.props as Record<string, unknown>)),
    );
    const independentRoots = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    const independentSigns = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const independentSolution = screen.getByRole("textbox", { name: "Solution interval union" });
    expect(independentRoots).toHaveLength(3);
    expect(independentSigns).toHaveLength(4);
    expect(independentSolution).toBeInTheDocument();
    fireEvent.change(independentRoots[0], { target: { value: "-3" } });
    fireEvent.change(independentRoots[1], { target: { value: "1" } });
    fireEvent.change(independentRoots[2], { target: { value: "2" } });
    for (const [index, value] of ["-", "+", "-", "+"].entries()) {
      fireEvent.change(independentSigns[index], { target: { value } });
    }
    fireEvent.change(independentSolution, { target: { value: "(-∞, -3) ∪ (1, 2)" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(independentIntercept).toHaveBeenCalledOnce();
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<
      string,
      unknown
    >;
    expectPracticeEnvelope(
      independentPayload,
      independent.stableActivityId,
      "independent_practice",
      {
        roots: [-3, 1, 2],
        intervalSigns: ["-", "+", "-", "+"],
        solution: "(-∞, -3) ∪ (1, 2)",
      },
    );
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
