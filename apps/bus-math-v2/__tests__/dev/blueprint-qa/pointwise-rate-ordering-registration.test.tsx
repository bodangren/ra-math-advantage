import fs from "node:fs";
import path from "node:path";

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

const NODE_ID = "math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs";
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  "../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json",
);
const BANNED_PROPS_KEYS =
  /correctAnswer|answerKey|hidden|authority|correctOptionId|orderedPointIds|expectedAnswer|isCorrect|score|maxScore|grading|solution|finalAnswer|slope|derivative/i;
const BANNED_PAYLOAD_KEYS =
  /correctAnswer|answerKey|hidden|authority|correctOptionId|expectedAnswer|isCorrect|score|maxScore|grading|solution|steps|finalAnswer|slope|derivative/i;

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
    title: "Compare pointwise rates of change from graphs",
    domain: "mathematics",
    reviewStatus: "draft",
    metadata: { course: "precalc", unit: "1", lesson: "2" },
  };
}

describe("Business Math QA pointwise-rate-ordering registration", () => {
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
    expect(getActivityComponent("pointwise-rate-ordering")).toBeTruthy();
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
    const workedGraph = await screen.findByRole("img", { name: /least to greatest/i });
    expect(workedGraph).toBeInTheDocument();
    expect(screen.getByTestId("pointwise-ordering-axes").getAttribute("d")).toBe(
      "M42 80H346M194 146V14",
    );
    expect(screen.getByText(worked.props.prompt as string)).toBeInTheDocument();
    expect(screen.getByText("Least to greatest: B, C, A")).toBeInTheDocument();
    expect(screen.getByText("The least-to-greatest order is B < C < A.")).toBeInTheDocument();
    for (const point of [
      { label: "A", x: -3, y: 0 },
      { label: "B", x: -1, y: 1 },
      { label: "C", x: 2.3, y: -2.1 },
    ]) {
      const label = screen.getByTestId(`pointwise-ordering-label-${point.label}`);
      expect(label).toHaveAttribute("data-point-x", String(point.x));
      expect(label).toHaveAttribute("data-point-y", String(point.y));
    }
    for (const step of [
      "Compare the local direction and steepness at A, B, and C.",
      "Point B has the least rate, point C is next, and point A has the greatest rate.",
      "Therefore, the least-to-greatest order is B < C < A.",
    ]) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    workedView.unmount();

    const guided = activities.find((activity) => activity.mode === "guided_practice")!;
    const guidedIntercept = vi.fn();
    const guidedView = render(
      <RendererPreview
        state={makeState("guided_practice", 1)}
        selectedNode={makeNode()}
        activity={guided}
        onIntercept={guidedIntercept}
      />,
    );
    expect(await screen.findByRole("img")).toBeInTheDocument();
    expect(
      screen.getByText("A steeper downward graph has a smaller rate of change."),
    ).toBeInTheDocument();
    expect(JSON.stringify(guided.props)).not.toMatch(BANNED_PROPS_KEYS);
    const guidedSelects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(guidedSelects).toHaveLength(3);
    const guidedSubmit = screen.getByRole("button", { name: "Submit answer" }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    fireEvent.change(guidedSelects[0]!, { target: { value: "B" } });
    expect(within(guidedSelects[1]!).getByRole("option", { name: "B" })).toBeDisabled();
    expect(guidedSubmit).toBeDisabled();
    fireEvent.change(guidedSelects[1]!, { target: { value: "A" } });
    fireEvent.change(guidedSelects[2]!, { target: { value: "C" } });
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    await waitFor(() => expect(guidedIntercept).toHaveBeenCalledTimes(1));
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(guidedPayload).toMatchObject({
      contractVersion: "practice.v1",
      activityId: guided.stableActivityId,
      mode: "guided_practice",
      status: "submitted",
      answers: { orderedPointIds: ["B", "A", "C"] },
    });
    expect(guidedPayload.parts).toEqual([
      { partId: "orderedPointIds", rawAnswer: ["B", "A", "C"] },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
    expect(JSON.stringify(guidedPayload)).not.toMatch(BANNED_PAYLOAD_KEYS);
    guidedView.unmount();

    const independent = activities.find((activity) => activity.mode === "independent_practice")!;
    const independentIntercept = vi.fn();
    const independentView = render(
      <RendererPreview
        state={makeState("independent_practice", 2)}
        selectedNode={makeNode()}
        activity={independent}
        onIntercept={independentIntercept}
      />,
    );
    expect(await screen.findByRole("img")).toBeInTheDocument();
    expect(screen.queryByText("A steeper downward graph has a smaller rate of change.")).toBeNull();
    expect(screen.queryByText(/least-to-greatest order is/i)).toBeNull();
    expect(JSON.stringify(independent.props)).not.toMatch(BANNED_PROPS_KEYS);
    const independentSelects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(independentSelects).toHaveLength(3);
    const independentSubmit = screen.getByRole("button", {
      name: "Submit answer",
    }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    fireEvent.change(independentSelects[0]!, { target: { value: "A" } });
    fireEvent.change(independentSelects[1]!, { target: { value: "B" } });
    fireEvent.change(independentSelects[2]!, { target: { value: "C" } });
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
      answers: { orderedPointIds: ["A", "B", "C"] },
    });
    expect(independentPayload.parts).toEqual([
      { partId: "orderedPointIds", rawAnswer: ["A", "B", "C"] },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    expect(JSON.stringify(independentPayload)).not.toMatch(BANNED_PAYLOAD_KEYS);
    independentView.unmount();
  });
});
