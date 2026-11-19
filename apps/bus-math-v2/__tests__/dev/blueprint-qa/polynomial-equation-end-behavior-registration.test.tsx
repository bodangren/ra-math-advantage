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
import { generateTopic16EquationEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";
import {
  RendererPreview,
  getStudentPreviewProblem,
} from "@/app/(dev)/blueprint-qa/components/RendererPreview";
import { ensureActivitiesRegistered } from "@/app/(dev)/blueprint-qa/components/register-activities";

const NODE_ID = "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations";
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  "../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json",
);
const RENDERER_KEY = "polynomial-equation-end-behavior";
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;
const PART_IDS = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
] as const;
const SOURCE_PROMPT =
  "Determine the end behavior for the following polynomials. Limit notation is not necessary.";
const SOURCE_ITEMS = [
  { id: "a", functionName: "f", expression: "4x^5" },
  { id: "b", functionName: "g", expression: "(1/2)x^4" },
  { id: "c", functionName: "y", expression: "-2(x + 3)^6" },
  { id: "d", functionName: "h", expression: "3 - x^5" },
  { id: "e", functionName: "k", expression: "8x^2 + 4 - x^5" },
  { id: "f", functionName: "m", expression: "2x(x - 1)(6 - x)" },
] as const;
const SOURCE_ANSWERS = {
  a_leftEnd: "down",
  a_rightEnd: "up",
  b_leftEnd: "up",
  b_rightEnd: "up",
  c_leftEnd: "down",
  c_rightEnd: "down",
  d_leftEnd: "up",
  d_rightEnd: "down",
  e_leftEnd: "up",
  e_rightEnd: "down",
  f_leftEnd: "up",
  f_rightEnd: "down",
} as const;
const SOURCE_STEPS = [
  "a) The leading term is 4x^5. The degree is odd and the leading coefficient is positive, so the left end is down and the right end is up.",
  "b) The leading term is (1/2)x^4. The degree is even and the leading coefficient is positive, so both ends are up.",
  "c) The leading term is -2x^6. The degree is even and the leading coefficient is negative, so both ends are down.",
  "d) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
  "e) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
  "f) The leading term is -2x^3. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
] as const;
const GUIDED_STEPS = [
  "Identify the leading term for each polynomial.",
  "Use degree parity and the leading coefficient.",
  "Record whether each left and right end goes up or down.",
] as const;
const FIELD_HELP = "Choose Up or Down for the left and right end of each polynomial.";
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
        title: "Determine polynomial end behavior from equations",
        domain: "math.precalc",
        reviewStatus: "draft",
        metadata: { course: "precalc", unit: "1", lesson: "6" },
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
  answers: Record<string, unknown>,
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
    parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    status: "submitted",
    submittedAt: expect.any(String),
    studentFeedback: undefined,
    teacherSummary: undefined,
    timing: undefined,
  });
  expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
}

function selectAllParts(answers: Record<string, unknown>, limit: number): void {
  for (const [index, partId] of PART_IDS.entries()) {
    if (index >= limit) break;
    const [itemId, side] = partId.split("_") as [string, "leftEnd" | "rightEnd"];
    const answer = answers[partId];
    const direction = answer === "up" ? "Up" : "Down";
    fireEvent.click(
      screen.getByRole("radio", {
        name: `${itemId} ${side === "leftEnd" ? "Left" : "Right"} end ${direction}`,
      }),
    );
  }
}

describe("Business Math QA polynomial-equation-end-behavior registration", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it("registers and previews all exact Topic 1.6 Example 3 modes", async () => {
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
    const workedOutput = generateTopic16EquationEndBehaviorOutput(0);
    const workedIntercept = vi.fn();
    const workedView = renderPreview(worked, workedIntercept);
    expect(
      await screen.findByRole(
        "heading",
        { name: "Worked Example: Polynomial Equation End Behavior" },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Student view unavailable")).toBeNull();
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    for (const item of SOURCE_ITEMS)
      expect(screen.getByText(item.expression, { exact: true })).toBeInTheDocument();
    for (const [partId, answer] of Object.entries(SOURCE_ANSWERS)) {
      const [itemId, side] = partId.split("_") as [string, "leftEnd" | "rightEnd"];
      expect(
        screen.getByText(
          `${itemId} ${side === "leftEnd" ? "Left" : "Right"} end: ${answer === "up" ? "Up" : "Down"}`,
        ),
      ).toBeInTheDocument();
    }
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    const workedAnswerLabel = screen.getByText("Answer:", { selector: "strong" });
    expect(workedAnswerLabel.parentElement).toHaveTextContent(
      "Answer: The six polynomial end behaviors are shown above.",
    );
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
    expect(workedOutput.expectedAnswer).toEqual(SOURCE_ANSWERS);
    expect(workedOutput.solutionSteps.map((step) => step.description)).toEqual(SOURCE_STEPS);
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedAnswers = generateTopic16EquationEndBehaviorOutput(1).expectedAnswer as Record<
      string,
      unknown
    >;
    const guidedItems = (
      generateTopic16EquationEndBehaviorOutput(1).data.rendererProps as {
        items: readonly { expression: string }[];
      }
    ).items;
    const guidedIntercept = vi.fn();
    const guidedView = renderPreview(guided, guidedIntercept);
    expect(
      await screen.findByRole("heading", {
        name: "Guided Practice: Polynomial Equation End Behavior",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Student view unavailable")).toBeNull();
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    for (const item of guidedItems)
      expect(screen.getByText(item.expression, { exact: true })).toBeInTheDocument();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(FIELD_HELP)).toBeInTheDocument();
    expectNoAuthority(guided.props);
    expect(screen.queryAllByRole("radio")).toHaveLength(24);
    expect(
      screen.queryAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
    for (const partId of PART_IDS) {
      const [itemId, side] = partId.split("_") as [string, "leftEnd" | "rightEnd"];
      const sideName = side === "leftEnd" ? "Left" : "Right";
      expect(
        screen.getByRole("radio", { name: `${itemId} ${sideName} end Up` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: `${itemId} ${sideName} end Down` }),
      ).toBeInTheDocument();
    }
    const guidedSubmit = screen.getByRole("button", { name: "Submit answer" });
    expect(guidedSubmit).toBeDisabled();
    selectAllParts(guidedAnswers, 11);
    expect(guidedSubmit).toBeDisabled();
    selectAllParts(guidedAnswers, 12);
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledOnce();
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(
      guidedPayload,
      guided.stableActivityId,
      "guided_practice",
      guidedAnswers,
    );
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentAnswers = generateTopic16EquationEndBehaviorOutput(2).expectedAnswer as Record<
      string,
      unknown
    >;
    const independentItems = (
      generateTopic16EquationEndBehaviorOutput(2).data.rendererProps as {
        items: readonly { expression: string }[];
      }
    ).items;
    const independentIntercept = vi.fn();
    const independentView = renderPreview(independent, independentIntercept);
    expect(
      await screen.findByRole("heading", {
        name: "Independent Practice: Polynomial Equation End Behavior",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Student view unavailable")).toBeNull();
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    for (const item of independentItems)
      expect(screen.getByText(item.expression, { exact: true })).toBeInTheDocument();
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expectNoAuthority(independent.props);
    expect(screen.queryAllByRole("radio")).toHaveLength(24);
    expect(
      screen.queryAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
    for (const partId of PART_IDS) {
      const [itemId, side] = partId.split("_") as [string, "leftEnd" | "rightEnd"];
      const sideName = side === "leftEnd" ? "Left" : "Right";
      expect(
        screen.getByRole("radio", { name: `${itemId} ${sideName} end Up` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: `${itemId} ${sideName} end Down` }),
      ).toBeInTheDocument();
    }
    const independentSubmit = screen.getByRole("button", { name: "Submit answer" });
    expect(independentSubmit).toBeDisabled();
    selectAllParts(independentAnswers, 11);
    expect(independentSubmit).toBeDisabled();
    selectAllParts(independentAnswers, 12);
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledOnce();
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<
      string,
      unknown
    >;
    expectPracticeEnvelope(
      independentPayload,
      independent.stableActivityId,
      "independent_practice",
      independentAnswers,
    );
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
