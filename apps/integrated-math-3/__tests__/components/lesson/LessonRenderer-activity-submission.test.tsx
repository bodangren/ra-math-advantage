import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { LessonRenderer, type LessonRendererProps } from "@/components/lesson/LessonRenderer";
import type { PhaseSection } from "@/components/lesson/PhaseRenderer";
import { buildIm3CompareMaximumWorkedSeedDocument } from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";
const mocks = vi.hoisted(() => ({
  submitActivity: vi.fn(),
  submitIm3PilotActivity: vi.fn(),
  createServerOwnedActivitySubmission: vi.fn((input) => mocks.submitActivity(input)),
  getSelectedWorkedAcknowledgement: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/activities/submission", () => ({
  submitActivity: mocks.submitActivity,
  submitIm3PilotActivity: mocks.submitIm3PilotActivity,
  createServerOwnedActivitySubmission: mocks.createServerOwnedActivitySubmission,
  getSelectedWorkedAcknowledgement: mocks.getSelectedWorkedAcknowledgement,
}));

const mockSubmitActivity = mocks.submitActivity;
const mockSubmitIm3PilotActivity = mocks.submitIm3PilotActivity;

// Mock heavy sub-components
vi.mock("@/components/textbook/LessonPageLayout", () => ({
  LessonPageLayout: ({
    children,
    lessonTitle,
    phases,
  }: {
    children: React.ReactNode;
    lessonTitle: string;
    phases: unknown[];
  }) => (
    <div data-testid="lesson-page-layout" data-phase-count={phases.length}>
      <h1>{lessonTitle}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@/components/lesson/LessonStepper", () => ({
  LessonStepper: ({
    phases,
    currentPhase,
    onPhaseClick,
  }: {
    phases: { phaseNumber: number; title: string }[];
    currentPhase: number;
    onPhaseClick?: (n: number, id: string) => void;
  }) => (
    <nav data-testid="lesson-stepper" data-current={currentPhase}>
      {phases.map((p) => (
        <button
          key={p.phaseNumber}
          onClick={() => onPhaseClick?.(p.phaseNumber, `p${p.phaseNumber}`)}
          data-testid={`stepper-phase-${p.phaseNumber}`}
        >
          {p.title}
        </button>
      ))}
    </nav>
  ),
}));

vi.mock("@/components/lesson/PhaseRenderer", () => ({
  PhaseRenderer: ({
    phaseType,
    sections,
    onActivitySubmit,
    onActivityComplete,
  }: {
    phaseType: string;
    sections: Array<{ id: string; content: { activityId?: string } }>;
    onActivitySubmit?: (activityId: string, payload: unknown) => void | Promise<void>;
    onActivityComplete?: (activityId: string) => void;
  }) => (
    <div
      data-testid="phase-renderer"
      data-phase-type={phaseType}
      data-section-count={sections.length}
      data-has-on-submit={onActivitySubmit ? "true" : "false"}
      data-has-on-complete={onActivityComplete ? "true" : "false"}
    >
      {sections.map((s) => (
        <button
          key={s.id}
          data-testid={`activity-submit-${s.content?.activityId}`}
          data-activity-id={s.content?.activityId}
          onClick={() => {
            const activityId = s.content?.activityId;
            if (activityId) {
              const payload = {
                contractVersion: "practice.v1",
                activityId,
                mode: "independent_practice",
                status: "submitted",
                attemptNumber: 1,
                submittedAt: "2026-01-01T00:00:00.000Z",
                answers: { q1: "A" },
                parts: [{ partId: "q1", rawAnswer: "A", isCorrect: true, score: 1, maxScore: 1 }],
                timing: {
                  startedAt: "2026-01-01T00:00:00.000Z",
                  submittedAt: "2026-01-01T00:01:00.000Z",
                  wallClockMs: 60000,
                  activeMs: 60000,
                  idleMs: 0,
                  pauseCount: 0,
                  focusLossCount: 0,
                  visibilityHiddenCount: 0,
                  confidence: "high",
                },
              };
              const result = onActivitySubmit?.(activityId, payload);
              void Promise.resolve(result)
                .then(() => onActivityComplete?.(activityId))
                .catch(() => undefined);
            }
          }}
        >
          Submit {s.content?.activityId}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/lesson/PhaseCompleteButton", () => {
  return {
    PhaseCompleteButton: ({
      lessonId,
      phaseNumber,
      disabled,
      initialStatus,
      onStatusChange,
    }: {
      lessonId: string;
      phaseNumber: number;
      disabled?: boolean;
      initialStatus?: "not_started" | "in_progress" | "completed";
      onStatusChange?: (status: "completed") => void;
    }) => {
      const [status, setStatus] = React.useState(initialStatus ?? "not_started");
      const isCompleted = status === "completed";
      return (
        <button
          data-testid="phase-complete-btn"
          data-lesson={lessonId}
          data-phase={phaseNumber}
          disabled={disabled || isCompleted}
          onClick={() => {
            setStatus("completed");
            onStatusChange?.("completed");
          }}
        >
          {isCompleted ? "Completed" : "Mark Complete"}
        </button>
      );
    },
  };
});

const textSection: PhaseSection = {
  id: "s1",
  sequenceOrder: 1,
  sectionType: "text",
  content: { markdown: "Content" },
};

const activitySection = (id: string, activityId: string): PhaseSection => ({
  id,
  sequenceOrder: 1,
  sectionType: "activity",
  content: { componentKey: "test-activity", activityId },
});

const equationWorkedActivitySection: PhaseSection = {
  id: "equation-worked-activity",
  sequenceOrder: 2,
  sectionType: "activity",
  content: {
    componentKey: "rate-of-change-calculator",
    activityId: "activities:equation-worked",
    stableActivityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_EQUATION_RATE_NODE,
    learningEvidenceMode: "worked_example",
    srsEligible: false,
  },
};

const domainRangeWorkedActivitySection: PhaseSection = {
  id: "domain-range-worked-activity",
  sequenceOrder: 2,
  sectionType: "activity",
  content: {
    componentKey: "graphing-explorer",
    activityId: "activities:domain-range-worked",
    stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_DOMAIN_RANGE_NODE,
    learningEvidenceMode: "worked_example",
    srsEligible: false,
  },
};

const profitModelWorkedActivitySection: PhaseSection = {
  id: "profit-model-worked-activity",
  sequenceOrder: 2,
  sectionType: "activity",
  content: {
    componentKey: "fill-in-the-blank",
    activityId: "activities:profit-model-worked",
    stableActivityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_PROFIT_MODEL_NODE,
    learningEvidenceMode: "worked_example",
    srsEligible: false,
  },
};

const profitMaximumWorkedActivitySection: PhaseSection = {
  id: "profit-maximum-worked-activity",
  sequenceOrder: 3,
  sectionType: "activity",
  content: {
    componentKey: "fill-in-the-blank",
    activityId: "activities:profit-maximum-worked",
    stableActivityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
    learningEvidenceMode: "worked_example",
    srsEligible: false,
  },
};

const graphWorkedActivitySection: PhaseSection = {
  id: "graph-worked-activity",
  sequenceOrder: 2,
  sectionType: "activity",
  content: {
    componentKey: "graphing-explorer",
    activityId: "activities:graph-worked",
    stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
    masteryNodeId: IM3_PILOT_NODE,
    learningEvidenceMode: "worked_example",
    srsEligible: false,
  },
};

const symmetryWorkedOutput = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_SYMMETRY_NODE,
  seed: 0,
  difficulty: 0.5,
});

const symmetryWorkedActivitySection: PhaseSection = {
  id: "symmetry-worked-activity",
  sequenceOrder: 2,
  sectionType: "activity",
  content: {
    componentKey: "graphing-explorer",
    activityId: "activities:symmetry-worked",
    stableActivityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_SYMMETRY_NODE,
    learningEvidenceMode: "worked_example",
    srsEligible: false,
    activityProps: symmetryWorkedOutput.data.rendererProps as Record<string, unknown>,
  },
};

const compareMaximumWorkedDocument = buildIm3CompareMaximumWorkedSeedDocument(
  Date.parse("2026-08-20T14:30:00.000Z"),
);

const compareMaximumWorkedActivitySection: PhaseSection = {
  id: "compare-maximum-worked-activity",
  sequenceOrder: 3,
  sectionType: "activity",
  content: {
    componentKey: compareMaximumWorkedDocument.componentKey,
    activityId: "activities:compare-maximum-worked",
    stableActivityId: compareMaximumWorkedDocument.stableActivityId,
    masteryNodeId: compareMaximumWorkedDocument.masteryNodeId,
    learningEvidenceMode: compareMaximumWorkedDocument.learningEvidenceMode,
    srsEligible: compareMaximumWorkedDocument.srsEligible,
    activityProps: compareMaximumWorkedDocument.props as Record<string, unknown>,
  },
};

const symmetryWorkedNonMatchCases = [
  [
    "wrong stableActivityId",
    {
      phaseType: "worked_example",
      section: {
        ...symmetryWorkedActivitySection,
        content: {
          ...symmetryWorkedActivitySection.content,
          stableActivityId: "other-symmetry-worked",
        },
      },
    },
  ],
  [
    "wrong masteryNodeId",
    {
      phaseType: "worked_example",
      section: {
        ...symmetryWorkedActivitySection,
        content: { ...symmetryWorkedActivitySection.content, masteryNodeId: "other-node" },
      },
    },
  ],
  [
    "wrong componentKey",
    {
      phaseType: "worked_example",
      section: {
        ...symmetryWorkedActivitySection,
        content: { ...symmetryWorkedActivitySection.content, componentKey: "other-component" },
      },
    },
  ],
  [
    "wrong learningEvidenceMode",
    {
      phaseType: "worked_example",
      section: {
        ...symmetryWorkedActivitySection,
        content: {
          ...symmetryWorkedActivitySection.content,
          learningEvidenceMode: "guided_practice",
        },
      },
    },
  ],
  [
    "srsEligible true",
    {
      phaseType: "worked_example",
      section: {
        ...symmetryWorkedActivitySection,
        content: { ...symmetryWorkedActivitySection.content, srsEligible: true },
      },
    },
  ],
  [
    "non-worked phase type",
    {
      phaseType: "learn",
      section: symmetryWorkedActivitySection,
    },
  ],
] as const;

const compareMaximumWorkedNonMatchCases = [
  [
    "wrong stableActivityId",
    {
      phaseType: "worked_example",
      section: {
        ...compareMaximumWorkedActivitySection,
        content: {
          ...compareMaximumWorkedActivitySection.content,
          stableActivityId: "other-compare-maximum-worked",
        },
      },
    },
  ],
  [
    "wrong masteryNodeId",
    {
      phaseType: "worked_example",
      section: {
        ...compareMaximumWorkedActivitySection,
        content: { ...compareMaximumWorkedActivitySection.content, masteryNodeId: "other-node" },
      },
    },
  ],
  [
    "wrong componentKey",
    {
      phaseType: "worked_example",
      section: {
        ...compareMaximumWorkedActivitySection,
        content: {
          ...compareMaximumWorkedActivitySection.content,
          componentKey: "other-component",
        },
      },
    },
  ],
  [
    "wrong learningEvidenceMode",
    {
      phaseType: "worked_example",
      section: {
        ...compareMaximumWorkedActivitySection,
        content: {
          ...compareMaximumWorkedActivitySection.content,
          learningEvidenceMode: "guided_practice",
        },
      },
    },
  ],
  [
    "srsEligible true",
    {
      phaseType: "worked_example",
      section: {
        ...compareMaximumWorkedActivitySection,
        content: { ...compareMaximumWorkedActivitySection.content, srsEligible: true },
      },
    },
  ],
  [
    "non-worked phase type",
    {
      phaseType: "learn",
      section: compareMaximumWorkedActivitySection,
    },
  ],
] as const;

const equationWorkedNonMatchCases = [
  [
    "wrong stableActivityId",
    {
      phaseType: "worked_example",
      section: {
        ...equationWorkedActivitySection,
        content: {
          ...equationWorkedActivitySection.content,
          stableActivityId: "other-worked-activity",
        },
      },
    },
  ],
  [
    "wrong masteryNodeId",
    {
      phaseType: "worked_example",
      section: {
        ...equationWorkedActivitySection,
        content: { ...equationWorkedActivitySection.content, masteryNodeId: "other-node" },
      },
    },
  ],
  [
    "wrong componentKey",
    {
      phaseType: "worked_example",
      section: {
        ...equationWorkedActivitySection,
        content: { ...equationWorkedActivitySection.content, componentKey: "other-component" },
      },
    },
  ],
  [
    "wrong learningEvidenceMode",
    {
      phaseType: "worked_example",
      section: {
        ...equationWorkedActivitySection,
        content: {
          ...equationWorkedActivitySection.content,
          learningEvidenceMode: "guided_practice",
        },
      },
    },
  ],
  [
    "srsEligible true",
    {
      phaseType: "worked_example",
      section: {
        ...equationWorkedActivitySection,
        content: { ...equationWorkedActivitySection.content, srsEligible: true },
      },
    },
  ],
  [
    "non-worked phase type",
    {
      phaseType: "learn",
      section: equationWorkedActivitySection,
    },
  ],
] as const;

const domainRangeWorkedNonMatchCases = [
  [
    "wrong stableActivityId",
    {
      ...domainRangeWorkedActivitySection,
      content: {
        ...domainRangeWorkedActivitySection.content,
        stableActivityId: "other-domain-range-worked",
      },
    },
  ],
  [
    "wrong masteryNodeId",
    {
      ...domainRangeWorkedActivitySection,
      content: { ...domainRangeWorkedActivitySection.content, masteryNodeId: "other-node" },
    },
  ],
  [
    "wrong componentKey",
    {
      ...domainRangeWorkedActivitySection,
      content: { ...domainRangeWorkedActivitySection.content, componentKey: "other-component" },
    },
  ],
  [
    "wrong learningEvidenceMode",
    {
      ...domainRangeWorkedActivitySection,
      content: {
        ...domainRangeWorkedActivitySection.content,
        learningEvidenceMode: "guided_practice",
      },
    },
  ],
  [
    "srsEligible true",
    {
      ...domainRangeWorkedActivitySection,
      content: { ...domainRangeWorkedActivitySection.content, srsEligible: true },
    },
  ],
] as const;

const profitModelWorkedNonMatchCases = [
  [
    "wrong stableActivityId",
    {
      phaseType: "worked_example",
      section: {
        ...profitModelWorkedActivitySection,
        content: {
          ...profitModelWorkedActivitySection.content,
          stableActivityId: "other-profit-worked",
        },
      },
    },
  ],
  [
    "wrong masteryNodeId",
    {
      phaseType: "worked_example",
      section: {
        ...profitModelWorkedActivitySection,
        content: { ...profitModelWorkedActivitySection.content, masteryNodeId: "other-node" },
      },
    },
  ],
  [
    "wrong componentKey",
    {
      phaseType: "worked_example",
      section: {
        ...profitModelWorkedActivitySection,
        content: { ...profitModelWorkedActivitySection.content, componentKey: "other-component" },
      },
    },
  ],
  [
    "wrong learningEvidenceMode",
    {
      phaseType: "worked_example",
      section: {
        ...profitModelWorkedActivitySection,
        content: {
          ...profitModelWorkedActivitySection.content,
          learningEvidenceMode: "guided_practice",
        },
      },
    },
  ],
  [
    "srsEligible true",
    {
      phaseType: "worked_example",
      section: {
        ...profitModelWorkedActivitySection,
        content: { ...profitModelWorkedActivitySection.content, srsEligible: true },
      },
    },
  ],
  [
    "non-worked phase type",
    {
      phaseType: "learn",
      section: profitModelWorkedActivitySection,
    },
  ],
] as const;

const graphWorkedNonMatchCases = [
  [
    "wrong stableActivityId",
    {
      ...graphWorkedActivitySection,
      content: {
        ...graphWorkedActivitySection.content,
        stableActivityId: "other-graph-worked-activity",
      },
    },
  ],
  [
    "wrong masteryNodeId",
    {
      ...graphWorkedActivitySection,
      content: { ...graphWorkedActivitySection.content, masteryNodeId: "other-node" },
    },
  ],
  [
    "wrong componentKey",
    {
      ...graphWorkedActivitySection,
      content: { ...graphWorkedActivitySection.content, componentKey: "other-component" },
    },
  ],
  [
    "wrong learningEvidenceMode",
    {
      ...graphWorkedActivitySection,
      content: { ...graphWorkedActivitySection.content, learningEvidenceMode: "guided_practice" },
    },
  ],
  [
    "srsEligible true",
    {
      ...graphWorkedActivitySection,
      content: { ...graphWorkedActivitySection.content, srsEligible: true },
    },
  ],
] as const;

const defaultProps: LessonRendererProps = {
  lessonId: "lesson-1",
  lessonTitle: "Introduction to Linear Functions",
  moduleLabel: "Module 1",
  lessonNumber: 1,
  phases: [
    {
      phaseId: "p1",
      phaseNumber: 1,
      phaseType: "explore",
      title: "Explore",
      sections: [textSection],
      status: "current",
      completed: false,
    },
    {
      phaseId: "p2",
      phaseNumber: 2,
      phaseType: "learn",
      title: "Learn",
      sections: [],
      status: "locked",
      completed: false,
    },
  ],
  mode: "practice",
};

describe("LessonRenderer - Activity Submission Flow", () => {
  beforeEach(() => {
    mockSubmitActivity.mockReset();
    mockSubmitIm3PilotActivity.mockReset();
    mockSubmitActivity.mockResolvedValue({ success: true, submissionId: "sub-123" });
  });

  describe("activity submission wiring", () => {
    it("passes onActivitySubmit callback to PhaseRenderer", () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId("phase-renderer")).toHaveAttribute("data-has-on-submit", "true");
    });

    it("does not let a child completion callback bypass stored submission success", () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId("phase-renderer")).toHaveAttribute("data-has-on-complete", "false");
    });

    it("calls submitActivity when activity submits", async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      await waitFor(() => {
        expect(mockSubmitActivity).toHaveBeenCalledOnce();
      });
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("forwards practice.v1 payload including timing to submitActivity", async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      await waitFor(() => {
        expect(mockSubmitActivity).toHaveBeenCalledOnce();
        const input = mockSubmitActivity.mock.calls[0][0];
        expect(input.activityId).toBe("act-1");
        expect(input.mode).toBe("independent_practice");
        expect(input.status).toBe("submitted");
        expect(input.attemptNumber).toBe(1);
        expect(input.submittedAt).toBe("2026-01-01T00:00:00.000Z");
        expect(input.answers).toEqual({ q1: "A" });
        expect(input.parts).toEqual([
          expect.objectContaining({ partId: "q1", rawAnswer: "A", isCorrect: true }),
        ]);
        expect(input.timing).toBeDefined();
        expect(input.timing?.confidence).toBe("high");
        expect(input.idempotencyKey).toEqual(expect.any(String));
        expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
      });
    });

    it("submits after explicit review the exact equation-rate Worked source before phase completion", async () => {
      let resolveSubmission: ((value: { success: true; submissionId: string }) => void) | undefined;
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSubmission = resolve;
        }),
      );

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "p8",
              phaseNumber: 8,
              phaseType: "worked_example",
              title: "Example 4",
              sections: [equationWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));

      const input = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(input).toEqual({
        activityId: "activities:equation-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: expect.any(String),
      });
      expect(new Date(input.submittedAt as string).toISOString()).toBe(input.submittedAt);
      expect(input.idempotencyKey).toEqual(expect.any(String));
      expect((input.idempotencyKey as string).trim()).not.toBe("");
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      resolveSubmission?.({ success: true, submissionId: "equation-worked-submission" });

      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(mockSubmitActivity).toHaveBeenCalledTimes(1);
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("submits after explicit review the exact compare-maximum Worked source before phase completion", async () => {
      let resolveSubmission: ((value: { success: true; submissionId: string }) => void) | undefined;
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSubmission = resolve;
        }),
      );

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "compare-maximum-worked",
              phaseNumber: 8,
              phaseType: "worked_example",
              title: "Example 2",
              sections: [compareMaximumWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));

      const input = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(input).toEqual({
        activityId: "activities:compare-maximum-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: "worked-example:activities:compare-maximum-worked",
      });
      expect(new Date(input.submittedAt as string).toISOString()).toBe(input.submittedAt);
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();

      resolveSubmission?.({ success: true, submissionId: "compare-maximum-worked-submission" });

      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(mockSubmitActivity).toHaveBeenCalledTimes(1);
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("submits after explicit review the exact symmetry Worked source before phase completion", async () => {
      let resolveSubmission: ((value: { success: true; submissionId: string }) => void) | undefined;
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSubmission = resolve;
        }),
      );

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "symmetry-worked",
              phaseNumber: 8,
              phaseType: "worked_example",
              title: "Example 2",
              sections: [symmetryWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));

      const input = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(input).toEqual({
        activityId: "activities:symmetry-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: "worked-example:activities:symmetry-worked",
      });
      expect(new Date(input.submittedAt as string).toISOString()).toBe(input.submittedAt);
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();

      resolveSubmission?.({ success: true, submissionId: "symmetry-worked-submission" });

      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(mockSubmitActivity).toHaveBeenCalledTimes(1);
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it.each(symmetryWorkedNonMatchCases)(
      "does not automatically submit the symmetry Worked source for %s",
      async (_label, testCase) => {
        render(
          <LessonRenderer
            {...defaultProps}
            phases={[
              {
                phaseId: "symmetry-worked-guard",
                phaseNumber: 8,
                phaseType: testCase.phaseType,
                title: "Example 2",
                sections: [testCase.section],
                status: "current",
                completed: false,
              },
            ]}
          />,
        );

        expect(mockSubmitActivity).not.toHaveBeenCalled();
        expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
        expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      },
    );

    it.each(compareMaximumWorkedNonMatchCases)(
      "does not automatically submit the compare-maximum Worked source for %s",
      async (_label, testCase) => {
        render(
          <LessonRenderer
            {...defaultProps}
            phases={[
              {
                phaseId: "compare-maximum-worked-guard",
                phaseNumber: 8,
                phaseType: testCase.phaseType,
                title: "Example 2",
                sections: [testCase.section],
                status: "current",
                completed: false,
              },
            ]}
          />,
        );

        expect(mockSubmitActivity).not.toHaveBeenCalled();
        expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
        expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      },
    );

    it("submits after explicit review the exact domain-range Worked source before phase completion", async () => {
      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "domain-range-worked",
              phaseNumber: 4,
              phaseType: "worked_example",
              title: "Example 1",
              sections: [domainRangeWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
      const input = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(input).toEqual({
        activityId: "activities:domain-range-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: expect.any(String),
      });
      expect(new Date(input.submittedAt as string).toISOString()).toBe(input.submittedAt);
      expect(input.idempotencyKey).toBe("worked-example:activities:domain-range-worked");
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("submits after explicit review the exact profit-model Worked source before phase completion", async () => {
      let resolveSubmission: ((value: { success: true; submissionId: string }) => void) | undefined;
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSubmission = resolve;
        }),
      );

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "profit-model-worked",
              phaseNumber: 6,
              phaseType: "worked_example",
              title: "Example 3",
              sections: [profitModelWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));

      const input = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(input).toEqual({
        activityId: "activities:profit-model-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: "worked-example:activities:profit-model-worked",
      });
      expect(new Date(input.submittedAt as string).toISOString()).toBe(input.submittedAt);
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      resolveSubmission?.({ success: true, submissionId: "profit-model-worked-submission" });
      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(mockSubmitActivity).toHaveBeenCalledTimes(1);
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("submits after separate review actions for profit-model and maximum-profit Worked sources before phase completion", async () => {
      let resolveFirst: ((value: { success: true; submissionId: string }) => void) | undefined;
      let resolveSecond: ((value: { success: true; submissionId: string }) => void) | undefined;
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
      );
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve;
        }),
      );

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "profit-model-and-maximum-worked",
              phaseNumber: 6,
              phaseType: "worked_example",
              title: "Example 3",
              sections: [profitModelWorkedActivitySection, profitMaximumWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
      expect(mockSubmitActivity.mock.calls[0]?.[0]).toEqual({
        activityId: "activities:profit-model-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: "worked-example:activities:profit-model-worked",
      });
      expect(
        new Date(mockSubmitActivity.mock.calls[0]?.[0].submittedAt as string).toISOString(),
      ).toBe(mockSubmitActivity.mock.calls[0]?.[0].submittedAt);
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      resolveFirst?.({ success: true, submissionId: "profit-model-worked-submission" });
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "I reviewed this worked example" }),
        ).toBeEnabled(),
      );
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(2));
      expect(mockSubmitActivity.mock.calls[1]?.[0]).toEqual({
        activityId: "activities:profit-maximum-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: "worked-example:activities:profit-maximum-worked",
      });
      expect(
        new Date(mockSubmitActivity.mock.calls[1]?.[0].submittedAt as string).toISOString(),
      ).toBe(mockSubmitActivity.mock.calls[1]?.[0].submittedAt);
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      resolveSecond?.({ success: true, submissionId: "profit-maximum-worked-submission" });
      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(mockSubmitActivity).toHaveBeenCalledTimes(2);
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("submits after separate review actions for both exact Worked sources before phase completion", async () => {
      let resolveFirst: ((value: { success: true; submissionId: string }) => void) | undefined;
      let resolveSecond: ((value: { success: true; submissionId: string }) => void) | undefined;
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
      );
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve;
        }),
      );

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "two-worked-sources",
              phaseNumber: 4,
              phaseType: "worked_example",
              title: "Example 1",
              sections: [graphWorkedActivitySection, domainRangeWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
      expect(mockSubmitActivity.mock.calls[0]?.[0]).toEqual({
        activityId: "activities:graph-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: "worked-example:activities:graph-worked",
      });
      expect(mockSubmitActivity.mock.calls[0]?.[0].idempotencyKey).not.toBe(
        "worked-example:activities:domain-range-worked",
      );

      resolveFirst?.({ success: true, submissionId: "graph-worked-submission" });
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "I reviewed this worked example" }),
        ).toBeEnabled(),
      );
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(2));
      expect(mockSubmitActivity.mock.calls[1]?.[0]).toEqual({
        activityId: "activities:domain-range-worked",
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {},
        parts: [],
        idempotencyKey: "worked-example:activities:domain-range-worked",
      });
      expect(mockSubmitActivity.mock.calls[0]?.[0].idempotencyKey).not.toBe(
        mockSubmitActivity.mock.calls[1]?.[0].idempotencyKey,
      );
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      resolveSecond?.({ success: true, submissionId: "domain-range-worked-submission" });
      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(mockSubmitActivity).toHaveBeenCalledTimes(2);
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("does not duplicate exact Worked submissions after both sources succeed and rerender", async () => {
      const phaseProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "two-worked-sources-rerender",
            phaseNumber: 4,
            phaseType: "worked_example" as const,
            title: "Example 1",
            sections: [graphWorkedActivitySection, domainRangeWorkedActivitySection],
            status: "current" as const,
            completed: false,
          },
        ],
      } satisfies LessonRendererProps;
      const view = render(<LessonRenderer {...phaseProps} />);
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "I reviewed this worked example" }),
        ).toBeEnabled(),
      );
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(2));
      view.rerender(<LessonRenderer {...phaseProps} />);
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(2));
      expect(mockSubmitActivity.mock.calls.map(([input]) => input.activityId)).toEqual([
        "activities:graph-worked",
        "activities:domain-range-worked",
      ]);
      expect(mockSubmitActivity.mock.calls[0]?.[0].idempotencyKey).not.toBe(
        mockSubmitActivity.mock.calls[1]?.[0].idempotencyKey,
      );
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("retries only the failed Worked source with the same payload and key", async () => {
      mockSubmitActivity.mockResolvedValueOnce({
        success: true,
        submissionId: "graph-worked-success",
      });
      mockSubmitActivity.mockResolvedValueOnce({ success: false, error: "Network error" });

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "two-worked-sources-retry",
              phaseNumber: 4,
              phaseType: "worked_example",
              title: "Example 1",
              sections: [graphWorkedActivitySection, domainRangeWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "I reviewed this worked example" }),
        ).toBeEnabled(),
      );
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(2));
      const successfulInput = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      const failedInput = mockSubmitActivity.mock.calls[1]?.[0] as Record<string, unknown>;
      expect(successfulInput.activityId).toBe("activities:graph-worked");
      expect(failedInput.activityId).toBe("activities:domain-range-worked");
      expect(screen.getByRole("alert")).toHaveTextContent("We could not save your progress.");
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      mockSubmitActivity.mockResolvedValueOnce({
        success: true,
        submissionId: "domain-range-retry",
      });
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(3));
      const retryInput = mockSubmitActivity.mock.calls[2]?.[0] as Record<string, unknown>;
      expect(retryInput).toEqual(failedInput);
      expect(
        mockSubmitActivity.mock.calls.filter(
          ([input]) => input.activityId === "activities:graph-worked",
        ),
      ).toHaveLength(1);
      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("shows failure feedback and retries the exact equation-rate Worked submission", async () => {
      mockSubmitActivity.mockResolvedValueOnce({ success: false, error: "Network error" });

      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "p8-retry",
              phaseNumber: 8,
              phaseType: "worked_example",
              title: "Example 4",
              sections: [equationWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
      const firstInput = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("We could not save your progress.");
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      mockSubmitActivity.mockResolvedValueOnce({
        success: true,
        submissionId: "equation-worked-retry",
      });
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(2));
      const secondInput = mockSubmitActivity.mock.calls[1]?.[0] as Record<string, unknown>;
      expect(secondInput).toEqual(firstInput);
      expect(secondInput.idempotencyKey).toEqual(firstInput.idempotencyKey);
      expect(secondInput.submittedAt).toEqual(firstInput.submittedAt);
      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    });

    it("does not auto-submit an exact Worked source in teaching mode", () => {
      render(
        <LessonRenderer
          {...defaultProps}
          mode="teaching"
          phases={[
            {
              phaseId: "equation-teaching",
              phaseNumber: 8,
              phaseType: "worked_example",
              title: "Example 4",
              sections: [equationWorkedActivitySection],
              status: "current",
              completed: false,
            },
          ]}
        />,
      );

      expect(mockSubmitActivity).not.toHaveBeenCalled();
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
      expect(screen.queryByTestId("phase-complete-btn")).not.toBeInTheDocument();
    });

    it("submits after explicit review an exact Worked source when phase is already completed", async () => {
      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "equation-completed",
              phaseNumber: 8,
              phaseType: "worked_example",
              title: "Example 4",
              sections: [equationWorkedActivitySection],
              status: "completed",
              completed: true,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
      const input = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(input.activityId).toBe("activities:equation-worked");
      expect(input.idempotencyKey).toBe("worked-example:activities:equation-worked");
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
      expect(screen.getByTestId("phase-complete-btn")).toHaveTextContent("Completed");
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
    });

    it("submits after explicit review the exact graph Worked source when phase is already completed", async () => {
      render(
        <LessonRenderer
          {...defaultProps}
          phases={[
            {
              phaseId: "graph-completed",
              phaseNumber: 4,
              phaseType: "worked_example",
              title: "Graph Example",
              sections: [graphWorkedActivitySection],
              status: "completed",
              completed: true,
            },
          ]}
        />,
      );
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "I reviewed this worked example" }));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
      const input = mockSubmitActivity.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(input.activityId).toBe("activities:graph-worked");
      expect(input.mode).toBe("worked_example");
      expect(input.idempotencyKey).toBe("worked-example:activities:graph-worked");
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
      expect(screen.getByTestId("phase-complete-btn")).toHaveTextContent("Completed");
      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
    });

    it.each(equationWorkedNonMatchCases)(
      "does not automatically submit the equation-rate Worked source for %s",
      async (_label, testCase) => {
        render(
          <LessonRenderer
            {...defaultProps}
            phases={[
              {
                phaseId: "equation-guard",
                phaseNumber: 8,
                phaseType: testCase.phaseType,
                title: "Example 4",
                sections: [testCase.section],
                status: "current",
                completed: false,
              },
            ]}
          />,
        );

        expect(mockSubmitActivity).not.toHaveBeenCalled();
        expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
        expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      },
    );

    it.each(domainRangeWorkedNonMatchCases)(
      "does not automatically submit the domain-range Worked source for %s",
      async (_label, section) => {
        render(
          <LessonRenderer
            {...defaultProps}
            phases={[
              {
                phaseId: "domain-range-guard",
                phaseNumber: 4,
                phaseType: "worked_example",
                title: "Example 1",
                sections: [section],
                status: "current",
                completed: false,
              },
            ]}
          />,
        );

        expect(mockSubmitActivity).not.toHaveBeenCalled();
        expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
        expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      },
    );

    it.each(profitModelWorkedNonMatchCases)(
      "does not automatically submit the profit-model Worked source for %s",
      async (_label, testCase) => {
        render(
          <LessonRenderer
            {...defaultProps}
            phases={[
              {
                phaseId: "profit-model-worked-guard",
                phaseNumber: 6,
                phaseType: testCase.phaseType,
                title: "Example 3",
                sections: [testCase.section],
                status: "current",
                completed: false,
              },
            ]}
          />,
        );

        expect(mockSubmitActivity).not.toHaveBeenCalled();
        expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
        expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      },
    );

    it.each(graphWorkedNonMatchCases)(
      "does not automatically submit the graph Worked source for %s",
      async (_label, section) => {
        render(
          <LessonRenderer
            {...defaultProps}
            phases={[
              {
                phaseId: "graph-guard",
                phaseNumber: 4,
                phaseType: "worked_example",
                title: "Graph Example",
                sections: [section],
                status: "completed",
                completed: true,
              },
            ]}
          />,
        );

        expect(mockSubmitActivity).not.toHaveBeenCalled();
        expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
        expect(screen.getByTestId("phase-complete-btn")).toHaveTextContent("Completed");
      },
    );
  });

  describe("phase completion gating", () => {
    it("changes the completion control when navigating from completed phase 1 to incomplete phase 8", () => {
      const twoPhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [textSection],
            status: "current",
            completed: true,
          },
          {
            phaseId: "p8",
            phaseNumber: 8,
            phaseType: "learn",
            title: "Example 4",
            sections: [],
            status: "available",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...twoPhaseProps} />);

      const phaseOneButton = screen.getByTestId("phase-complete-btn");
      expect(phaseOneButton).toHaveTextContent("Completed");
      expect(phaseOneButton).toBeDisabled();
      expect(phaseOneButton).toHaveAttribute("data-phase", "1");

      fireEvent.click(screen.getByTestId("stepper-phase-8"));

      const phaseEightButton = screen.getByTestId("phase-complete-btn");
      expect(phaseEightButton).toHaveTextContent("Mark Complete");
      expect(phaseEightButton).not.toBeDisabled();
      expect(phaseEightButton).toHaveAttribute("data-phase", "8");
    });

    it("PhaseCompleteButton is disabled before any activity is submitted", () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      const btn = screen.getByTestId("phase-complete-btn");
      expect(btn).toBeDisabled();
    });

    it("PhaseCompleteButton is enabled after single activity is completed", async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      await waitFor(() => {
        const btn = screen.getByTestId("phase-complete-btn");
        expect(btn).not.toBeDisabled();
      });
    });

    it("PhaseCompleteButton is disabled until all activities in multi-activity phase are complete", async () => {
      const multiActivityPhase: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1"), activitySection("act-s2", "act-2")],
            status: "current",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...multiActivityPhase} />);

      const btn = screen.getByTestId("phase-complete-btn");
      expect(btn).toBeDisabled();

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      await waitFor(() => {
        expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      });

      fireEvent.click(screen.getByTestId("activity-submit-act-2"));

      await waitFor(() => {
        expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled();
      });
    });

    it("enabling one phase does not affect other phases", async () => {
      const twoPhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
          {
            phaseId: "p2",
            phaseNumber: 2,
            phaseType: "learn",
            title: "Learn",
            sections: [activitySection("act-s2", "act-2")],
            status: "available",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...twoPhaseProps} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      await waitFor(() => {
        expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled();
      });

      fireEvent.click(screen.getByTestId("stepper-phase-2"));

      await waitFor(() => {
        expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();
      });
    });
  });

  describe("storage before completion", () => {
    it("keeps the phase locked until submission storage succeeds", async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
        ],
      };

      let resolveSubmission: ((value: { success: true; submissionId: string }) => void) | undefined;
      mockSubmitActivity.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSubmission = resolve;
        }),
      );

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      expect(screen.getByTestId("phase-complete-btn")).toBeDisabled();

      resolveSubmission?.({ success: true, submissionId: "stored-submission" });

      await waitFor(() => {
        const btn = screen.getByTestId("phase-complete-btn");
        expect(btn).not.toBeDisabled();
      });
    });

    it("keeps the phase locked when storage returns a failure result", async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
        ],
      };

      mockSubmitActivity.mockResolvedValueOnce({ success: false, error: "Network error" });

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      await waitFor(() => {
        expect(mockSubmitActivity).toHaveBeenCalledOnce();
        const btn = screen.getByTestId("phase-complete-btn");
        expect(btn).toBeDisabled();
      });
    });

    it("reuses the same create key after a failed storage attempt", async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
        ],
      };
      mockSubmitActivity
        .mockResolvedValueOnce({ success: false, error: "Network error" })
        .mockResolvedValueOnce({ success: true, submissionId: "stored-submission" });

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("activity-submit-act-1"));
      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(2));

      expect(mockSubmitActivity.mock.calls[0]?.[0].idempotencyKey).toBe(
        mockSubmitActivity.mock.calls[1]?.[0].idempotencyKey,
      );
      await waitFor(() => expect(screen.getByTestId("phase-complete-btn")).not.toBeDisabled());
    });
  });

  describe("phase completion and auto-advance", () => {
    it("auto-advances to next phase after phase completion", async () => {
      const twoPhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "current",
            completed: false,
          },
          {
            phaseId: "p2",
            phaseNumber: 2,
            phaseType: "learn",
            title: "Learn",
            sections: [activitySection("act-s2", "act-2")],
            status: "available",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...twoPhaseProps} />);

      fireEvent.click(screen.getByTestId("activity-submit-act-1"));

      await waitFor(() => {
        const btn = screen.getByTestId("phase-complete-btn");
        expect(btn).not.toBeDisabled();
      });

      fireEvent.click(screen.getByTestId("phase-complete-btn"));

      await waitFor(() => {
        const stepper = screen.getByTestId("lesson-stepper");
        expect(stepper).toHaveAttribute("data-current", "2");
      });
    });

    it("phase completion updates stepper phase status", async () => {
      const threePhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: "p1",
            phaseNumber: 1,
            phaseType: "explore",
            title: "Explore",
            sections: [activitySection("act-s1", "act-1")],
            status: "completed",
            completed: true,
          },
          {
            phaseId: "p2",
            phaseNumber: 2,
            phaseType: "learn",
            title: "Learn",
            sections: [activitySection("act-s2", "act-2")],
            status: "current",
            completed: false,
          },
          {
            phaseId: "p3",
            phaseNumber: 3,
            phaseType: "worked_example",
            title: "Example",
            sections: [],
            status: "locked",
            completed: false,
          },
        ],
      };

      render(<LessonRenderer {...threePhaseProps} />);

      expect(screen.getByTestId("lesson-stepper")).toHaveAttribute("data-current", "2");

      fireEvent.click(screen.getByTestId("activity-submit-act-2"));

      await waitFor(() => {
        const btn = screen.getByTestId("phase-complete-btn");
        expect(btn).not.toBeDisabled();
      });

      fireEvent.click(screen.getByTestId("phase-complete-btn"));

      await waitFor(() => {
        const stepper = screen.getByTestId("lesson-stepper");
        expect(stepper).toHaveAttribute("data-current", "3");
        const btn = screen.getByTestId("phase-complete-btn");
        expect(btn).not.toBeDisabled();
        expect(btn).toHaveTextContent(/mark complete/i);
      });
    });
  });
});
