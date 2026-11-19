import fs from "node:fs";
import path from "node:path";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  clearActivityRegistry,
  getActivityComponent,
} from "@math-platform/activity-components/registry";
import type { ProjectedActivity } from "@math-platform/knowledge-space-practice";
import {
  RendererPreview,
  getStudentPreviewProblem,
} from "@/app/(dev)/blueprint-qa/components/RendererPreview";
import { ensureActivitiesRegistered } from "@/app/(dev)/blueprint-qa/components/register-activities";

const NODE_ID = "math.precalc.skill.1.2.compare-rates-of-change-across-intervals";
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  "../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json",
);

function loadActivities(): ProjectedActivity[] {
  const document = JSON.parse(fs.readFileSync(AP_PROJECTION_PATH, "utf8")) as {
    activities: ProjectedActivity[];
  };
  return document.activities.filter((activity) => activity.nodeId === NODE_ID);
}

function makeState(mode: Exclude<ProjectedActivity["mode"], "assessment">) {
  return {
    selectedNodeId: NODE_ID,
    seed: 0,
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
    title: "Compare rates of change across multiple intervals",
    domain: "mathematics",
    reviewStatus: "draft",
    metadata: { course: "precalc", unit: "1", lesson: "2" },
  };
}

describe("Business Math QA table-average-rate-choice registration", () => {
  it("registers and previews the current AP Topic 1.2 Worked, Guided, and Independent rows", async () => {
    const activities = loadActivities();
    expect(activities.map((activity) => activity.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent("table-average-rate-choice")).toBeTruthy();

    for (const activity of activities) {
      expect(getStudentPreviewProblem(activity)).toBeNull();
    }

    const worked = activities[0]!;
    const workedView = render(
      <RendererPreview
        state={makeState("worked_example")}
        selectedNode={makeNode()}
        activity={worked}
        onIntercept={vi.fn()}
      />,
    );
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(
      screen.getByText(String((worked.props as { prompt: string }).prompt)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(String((worked.props as { finalAnswer: string }).finalAnswer)),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(
      screen.getAllByRole("radio").every((radio) => (radio as HTMLInputElement).disabled),
    ).toBe(true);
    workedView.unmount();

    for (const mode of ["guided_practice", "independent_practice"] as const) {
      const activity = activities.find((candidate) => candidate.mode === mode)!;
      const onIntercept = vi.fn();
      const view = render(
        <RendererPreview
          state={makeState(mode)}
          selectedNode={makeNode()}
          activity={activity}
          onIntercept={onIntercept}
        />,
      );
      expect(await screen.findAllByRole("radio")).toHaveLength(4);
      expect(JSON.stringify(activity.props)).not.toMatch(
        /correctOptionId|finalAnswer|solution|answer|grading/i,
      );

      fireEvent.click(screen.getAllByRole("radio")[0]!);
      fireEvent.click(screen.getByRole("button", { name: /submit/i }));
      await waitFor(() => expect(onIntercept).toHaveBeenCalledTimes(1));
      const payload = onIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
      expect(payload).toMatchObject({
        contractVersion: "practice.v1",
        activityId: activity.stableActivityId,
        mode,
        status: "submitted",
        answers: { selectedOptionId: expect.any(String) },
      });
      expect(payload).not.toHaveProperty("score");
      expect(payload).not.toHaveProperty("maxScore");
      expect(payload).not.toHaveProperty("isCorrect");
      expect(payload).not.toHaveProperty("expectedAnswer");
      expect(JSON.stringify(payload)).not.toMatch(/correctAnswer|gradingMetadata/i);
      view.unmount();
    }
  });
});
