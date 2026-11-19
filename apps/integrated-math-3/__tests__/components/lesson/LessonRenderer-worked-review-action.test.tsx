import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonRenderer, type LessonPhase } from "@/components/lesson/LessonRenderer";
import {
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const { createServerOwnedActivitySubmission } = vi.hoisted(() => ({
  createServerOwnedActivitySubmission: vi.fn(),
}));
vi.mock("@/lib/activities/submission", () => ({
  createServerOwnedActivitySubmission,
  submitActivity: vi.fn(),
  getSelectedWorkedAcknowledgement: vi.fn().mockResolvedValue(false),
}));
vi.mock("@/components/textbook/LessonPageLayout", () => ({
  LessonPageLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/components/lesson/LessonStepper", () => ({ LessonStepper: () => null }));
vi.mock("@/components/lesson/PhaseRenderer", () => ({
  PhaseRenderer: () => <p>Worked graph source</p>,
}));
vi.mock("@/components/student/LessonChatbot", () => ({ LessonChatbot: () => null }));
vi.mock("@/components/lesson/PhaseCompleteButton", () => ({
  PhaseCompleteButton: ({ disabled }: { disabled: boolean }) => (
    <button disabled={disabled}>Mark complete</button>
  ),
}));

const phases: LessonPhase[] = [
  {
    phaseId: "phase:4",
    phaseNumber: 4,
    phaseType: "worked_example",
    title: "Graph a quadratic",
    status: "current",
    completed: false,
    sections: [
      {
        id: "source:1",
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          activityId: "activities:worked",
          componentKey: "graphing-explorer",
          stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          learningEvidenceMode: "worked_example",
          srsEligible: false,
          activityProps: { equation: "f(x) = x^2", variant: "plot_from_equation" },
        },
      },
    ],
  },
];

describe("Worked review action", () => {
  it("waits for the student action and preserves the acknowledgement across a failed save", async () => {
    createServerOwnedActivitySubmission
      .mockResolvedValueOnce({ success: false, error: "Unavailable" })
      .mockResolvedValueOnce({ success: true });
    render(
      <LessonRenderer
        lessonId="lesson:1"
        lessonTitle="Quadratic functions"
        moduleLabel="Module 1"
        lessonNumber={1}
        phases={phases}
      />,
    );
    expect(createServerOwnedActivitySubmission).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Mark complete" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: "Mark complete" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Mark complete" })).toBeEnabled(),
    );
    expect(createServerOwnedActivitySubmission).toHaveBeenCalledTimes(2);
    expect(createServerOwnedActivitySubmission.mock.calls[1][0]).toEqual(
      createServerOwnedActivitySubmission.mock.calls[0][0],
    );
    expect(createServerOwnedActivitySubmission.mock.calls[0][0]).toMatchObject({
      mode: "worked_example",
      activityId: "activities:worked",
      answers: {},
      parts: [],
    });
  });
});
