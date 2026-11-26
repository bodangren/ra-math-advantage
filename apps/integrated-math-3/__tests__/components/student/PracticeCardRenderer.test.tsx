import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePracticeTiming } from "@/components/practice-timing";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PracticeCardRenderer } from "@/components/student/PracticeCardRenderer";
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3EquationRateGuidedSeedDocuments,
  buildIm3EquationRateIndependentSeedDocuments,
  buildIm3DomainRangeGuidedSeedDocuments,
  buildIm3DomainRangeGuidedSeed2Documents,
  buildIm3DomainRangeIndependentSeed2Documents,
  buildIm3ProfitModelGuidedSeedDocuments,
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3GraphGuidedSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  buildIm3PilotSeedDocuments,
  buildIm3MaximumReadingGuidedSeedDocuments,
} from "@/convex/seed/seed_lesson_1_1";
import { buildIm3TwoRealSolutionsGuidedSeedDocument } from "@/convex/seed/seed_lesson_1_2";
import type { ResolvedQueueItem } from "@/convex/queue/queue";
import {
  registerActivity,
  clearActivityRegistry,
} from "@math-platform/activity-components/registry";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
} from "@/lib/practice/learning-evidence-pilot";

const mockTiming = {
  startedAt: "2026-01-01T00:00:01.000Z",
  submittedAt: "2026-01-01T00:02:00.000Z",
  wallClockMs: 120000,
  activeMs: 90000,
  idleMs: 30000,
  pauseCount: 0,
  focusLossCount: 0,
  visibilityHiddenCount: 0,
  confidence: "high" as const,
};

vi.mock("@/components/practice-timing", () => ({
  usePracticeTiming: vi.fn(() => ({
    getTiming: vi.fn(() => mockTiming),
    recordInteraction: vi.fn(),
    isTracking: vi.fn(() => true),
  })),
}));

type TestActivityProps = {
  activityId: string;
  mode?: string;
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
  [key: string]: unknown;
};

const TestActivity = vi.fn(({ activityId, mode, onSubmit, onComplete }: TestActivityProps) => (
  <div data-testid="practice-card-activity" data-activity-id={activityId} data-mode={mode}>
    <button
      data-testid="submit-btn"
      onClick={() => {
        onSubmit?.({ answer: "test" });
        onComplete?.();
      }}
    >
      Submit
    </button>
  </div>
));

const createMockQueueItem = (overrides: Partial<ResolvedQueueItem> = {}): ResolvedQueueItem => ({
  card: {
    cardId: "card-1",
    studentId: "student-1",
    objectiveId: "obj-1",
    variantKey: "pf-1",
    stability: 1.0,
    difficulty: 0.3,
    state: "review" as const,
    dueDate: "2026-01-01T00:00:00.000Z",
    elapsedDays: 1,
    scheduledDays: 1,
    reps: 1,
    lapses: 0,
    lastReview: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  objectivePriority: "essential" as const,
  isOverdue: false,
  daysOverdue: 0,
  componentKey: "test-activity",
  props: {
    activityId: "activity-1",
  },
  ...overrides,
});

const GUIDED_PROPS = buildIm3GuidedPilotSeedDocuments("activities:guided" as never, 0).activity
  .props;
const GUIDED_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 1,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

const EQUATION_GUIDED_PROPS = buildIm3EquationRateGuidedSeedDocuments(
  "activities:equation-guided" as never,
  0,
).activity.props;
const EQUATION_INDEPENDENT_PROPS = buildIm3EquationRateIndependentSeedDocuments(
  "activities:equation-independent" as never,
  0,
).activity.props;
const DOMAIN_RANGE_GUIDED_PROPS = buildIm3DomainRangeGuidedSeedDocuments(
  "activities:domain-range-guided" as never,
  0,
).activity.props;
const DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID = "activities:domain-range-guided-seed-2-renderer";
const DOMAIN_RANGE_GUIDED_SEED_2_DOCUMENTS = buildIm3DomainRangeGuidedSeed2Documents(
  DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID as never,
  0,
);
const DOMAIN_RANGE_GUIDED_SEED_2_PROPS = DOMAIN_RANGE_GUIDED_SEED_2_DOCUMENTS.activity.props;
const DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID =
  "activities:domain-range-independent-seed-2-renderer";
const DOMAIN_RANGE_INDEPENDENT_SEED_2_DOCUMENTS = buildIm3DomainRangeIndependentSeed2Documents(
  DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID as never,
  0,
);
const DOMAIN_RANGE_INDEPENDENT_SEED_2_PROPS =
  DOMAIN_RANGE_INDEPENDENT_SEED_2_DOCUMENTS.activity.props;
const PROFIT_MODEL_GUIDED_PROPS = buildIm3ProfitModelGuidedSeedDocuments(
  "activities:profit-model-guided" as never,
  0,
).activity.props;
const PROFIT_MAXIMUM_GUIDED_PROPS = buildIm3ProfitMaximumGuidedSeedDocuments(
  "activities:profit-maximum-guided" as never,
  0,
).activity.props;
const GRAPH_GUIDED_SEED_2_PROPS = buildIm3GraphGuidedSeed2Documents(
  "activities:graph-guided-seed-2" as never,
  0,
).activity.props;
const GRAPH_GUIDED_SEED_2_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 2,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID = "activities:graph-independent-seed-2-renderer";
const GRAPH_INDEPENDENT_SEED_2_DOCUMENTS = buildIm3GraphIndependentSeed2Documents(
  GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID as never,
  0,
);
const GRAPH_INDEPENDENT_SEED_2_PROPS = GRAPH_INDEPENDENT_SEED_2_DOCUMENTS.activity.props;
const GRAPH_INDEPENDENT_SEED_2_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 3,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const MAXIMUM_READING_GUIDED_PHYSICAL_ID = "activities:maximum-reading-guided-renderer";
const MAXIMUM_READING_GUIDED_DOCUMENTS = buildIm3MaximumReadingGuidedSeedDocuments(
  MAXIMUM_READING_GUIDED_PHYSICAL_ID as never,
  0,
);
const MAXIMUM_READING_GUIDED_PROPS = MAXIMUM_READING_GUIDED_DOCUMENTS.activity.props;
const SYMMETRY_GUIDED_PHYSICAL_ID = "activities:symmetry-guided-renderer";
const SYMMETRY_GENERATED = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_SYMMETRY_NODE,
  seed: 0,
  difficulty: 0.5,
});
const SYMMETRY_GUIDED_PROPS = SYMMETRY_GENERATED.data.rendererProps as Record<string, unknown>;
const SYMMETRY_GUIDED_POINTS = SYMMETRY_GENERATED.expectedAnswer.placed_points as Array<{
  x: number;
  y: number;
}>;
const COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID = "activities:compare-maximum-guided-renderer";
const COMPARE_MAXIMUM_GUIDED_GENERATED = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_COMPARE_MAXIMUM_NODE,
  seed: 0,
  difficulty: 0.5,
});
const COMPARE_MAXIMUM_GUIDED_PROPS = COMPARE_MAXIMUM_GUIDED_GENERATED.data.rendererProps as Record<
  string,
  unknown
>;
const COMPARE_MAXIMUM_GUIDED_ANSWER = COMPARE_MAXIMUM_GUIDED_GENERATED.expectedAnswer
  .greater_maximum as "first" | "second";
const TWO_REAL_SOLUTIONS_GUIDED_PHYSICAL_ID = "activities:two-real-solutions-guided-renderer";
const TWO_REAL_SOLUTIONS_GUIDED_PROPS = buildIm3TwoRealSolutionsGuidedSeedDocument(0).props;

describe("PracticeCardRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearActivityRegistry();
    registerActivity("test-activity", TestActivity as unknown as React.ComponentType<unknown>);
    registerActivity("graphing-explorer", TestActivity as unknown as React.ComponentType<unknown>);
    registerActivity(
      "rate-of-change-calculator",
      TestActivity as unknown as React.ComponentType<unknown>,
    );
    registerActivity("fill-in-the-blank", TestActivity as unknown as React.ComponentType<unknown>);
    TestActivity.mockClear();
  });

  describe("renders correct activity from registry", () => {
    it("renders the activity component identified by componentKey", () => {
      const queueItem = createMockQueueItem({
        componentKey: "test-activity",
        props: { activityId: "activity-1" },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={5}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      const activityElement = screen.getByTestId("practice-card-activity");
      expect(activityElement).toBeInTheDocument();
      expect(activityElement).toHaveAttribute("data-activity-id", "activity-1");
    });

    it("forwards exact pilot props from the queue into the activity renderer", () => {
      const pilotStableActivityId = IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
      const pilotNodeId = IM3_PILOT_NODE;
      const seededPilotActivity = buildIm3PilotSeedDocuments(
        "pilot-activity-document-1" as never,
        0,
      ).activity;
      const queueItem = createMockQueueItem({
        componentKey: "test-activity",
        props: {
          ...seededPilotActivity.props,
          activityId: "pilot-activity-document-1",
          stableActivityId: pilotStableActivityId,
          masteryNodeId: pilotNodeId,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      expect(screen.getByTestId("practice-card-activity")).toBeInTheDocument();
      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps).toMatchObject({
        ...seededPilotActivity.props,
        activityId: "pilot-activity-document-1",
        stableActivityId: pilotStableActivityId,
        masteryNodeId: pilotNodeId,
        srsEligible: true,
      });
      expect(renderedProps).toMatchObject({
        equation: "y = -x^2 - 1",
        variant: "plot_from_equation",
        responseVariant: "table_graph",
        domain: [-5, 5],
        range: [-10, 10],
      });
      expect(renderedProps).not.toHaveProperty("answerSchema");
      expect(renderedProps).not.toHaveProperty("vertex_x");
      expect(renderedProps).not.toHaveProperty("vertex_y");
      expect(renderedProps).not.toHaveProperty("direction");
      expect(renderedProps).not.toHaveProperty("y_intercept");
    });

    it("mounts the exact Guided graph card in Guided mode and uses a Guided fallback envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...GUIDED_PROPS,
          activityId: "guided-activity-document",
          stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          srsEligible: false,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...GUIDED_PROPS,
        activityId: "guided-activity-document",
        stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        srsEligible: false,
      });

      renderedProps.onSubmit?.({
        tableValues: GUIDED_POINTS,
        placedPoints: GUIDED_POINTS,
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: "guided-activity-document",
          mode: "guided_practice",
          answers: { tableValues: GUIDED_POINTS, placedPoints: GUIDED_POINTS },
        }),
      );
    });

    it("mounts the exact two-real-solutions Guided card in Guided mode with seed-5 props", () => {
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...TWO_REAL_SOLUTIONS_GUIDED_PROPS,
          activityId: TWO_REAL_SOLUTIONS_GUIDED_PHYSICAL_ID,
          stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...TWO_REAL_SOLUTIONS_GUIDED_PROPS,
        activityId: TWO_REAL_SOLUTIONS_GUIDED_PHYSICAL_ID,
        stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
        srsEligible: true,
      });
    });

    it.each([
      [
        "a lookalike Guided identity",
        { stableActivityId: `${IM3_GUIDED_PRACTICE_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong-node Guided card", { masteryNodeId: `${IM3_PILOT_NODE}.lookalike` }],
    ])("keeps %s in practice mode with an Independent fallback envelope", (_label, identity) => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...GUIDED_PROPS,
          activityId: "lookalike-activity-document",
          stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          ...identity,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      renderedProps.onSubmit?.({
        tableValues: GUIDED_POINTS,
        placedPoints: GUIDED_POINTS,
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "independent_practice",
          answers: { tableValues: GUIDED_POINTS, placedPoints: GUIDED_POINTS },
        }),
      );
    });

    it("mounts the exact equation Guided card in Guided mode and preserves its complete envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "rate-of-change-calculator",
        props: {
          ...EQUATION_GUIDED_PROPS,
          activityId: "activities:equation-guided",
          stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_EQUATION_RATE_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...EQUATION_GUIDED_PROPS,
        activityId: "activities:equation-guided",
        stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_EQUATION_RATE_NODE,
        srsEligible: true,
      });

      renderedProps.onSubmit?.({
        contractVersion: "practice.v1",
        activityId: "activities:equation-guided",
        mode: "guided_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: { fA: "24", fB: "0", rate: "-8" },
        parts: [
          { partId: "f_a", rawAnswer: "24" },
          { partId: "f_b", rawAnswer: "0" },
          { partId: "rate", rawAnswer: "-8" },
        ],
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: "activities:equation-guided",
          mode: "guided_practice",
          answers: { fA: "24", fB: "0", rate: "-8" },
          parts: [
            { partId: "f_a", rawAnswer: "24" },
            { partId: "f_b", rawAnswer: "0" },
            { partId: "rate", rawAnswer: "-8" },
          ],
        }),
      );
    });

    it("mounts the exact equation Independent card in practice mode and preserves its complete envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "rate-of-change-calculator",
        props: {
          ...EQUATION_INDEPENDENT_PROPS,
          activityId: "activities:equation-independent",
          stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
          masteryNodeId: IM3_EQUATION_RATE_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      expect(renderedProps).toMatchObject({
        ...EQUATION_INDEPENDENT_PROPS,
        activityId: "activities:equation-independent",
        stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_EQUATION_RATE_NODE,
        srsEligible: true,
      });

      renderedProps.onSubmit?.({
        contractVersion: "practice.v1",
        activityId: "activities:equation-independent",
        mode: "independent_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: { fA: "-2", fB: "-26", rate: "-6" },
        parts: [
          { partId: "f_a", rawAnswer: "-2" },
          { partId: "f_b", rawAnswer: "-26" },
          { partId: "rate", rawAnswer: "-6" },
        ],
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: "activities:equation-independent",
          mode: "independent_practice",
          answers: { fA: "-2", fB: "-26", rate: "-6" },
          parts: [
            { partId: "f_a", rawAnswer: "-2" },
            { partId: "f_b", rawAnswer: "-26" },
            { partId: "rate", rawAnswer: "-6" },
          ],
        }),
      );
    });

    it.each([
      [
        "a lookalike Guided stable ID",
        { stableActivityId: `${IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong-node Guided card", { masteryNodeId: `${IM3_EQUATION_RATE_NODE}.lookalike` }],
      ["a wrong-component Guided card", { componentKey: "graphing-explorer" }],
    ])(
      "keeps the equation Guided %s in practice mode with an Independent fallback envelope",
      (_label, identity) => {
        const onSubmit = vi.fn();
        const queueItem = createMockQueueItem({
          componentKey: "rate-of-change-calculator",
          props: {
            ...EQUATION_GUIDED_PROPS,
            activityId: "activities:equation-guided-guard",
            stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
            masteryNodeId: IM3_EQUATION_RATE_NODE,
            srsEligible: true,
            ...("componentKey" in identity ? {} : identity),
          },
          ...("componentKey" in identity ? { componentKey: identity.componentKey } : {}),
        });

        render(
          <PracticeCardRenderer
            queueItem={queueItem}
            currentIndex={0}
            totalCount={1}
            onSubmit={onSubmit}
            onComplete={vi.fn()}
          />,
        );

        const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
        expect(renderedProps.mode).toBe("practice");
        renderedProps.onSubmit?.({ fA: "24", fB: "0", rate: "-8" });

        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mode: "independent_practice",
            answers: { fA: "24", fB: "0", rate: "-8" },
          }),
        );
      },
    );

    it("mounts the exact profit-model Guided card in Guided mode and wraps raw seven-answer input as guided practice", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "fill-in-the-blank",
        props: {
          ...PROFIT_MODEL_GUIDED_PROPS,
          activityId: "activities:profit-model-guided",
          stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_PROFIT_MODEL_NODE,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...PROFIT_MODEL_GUIDED_PROPS,
        activityId: "activities:profit-model-guided",
        stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
      });

      renderedProps.onSubmit?.({
        priceBase: "230",
        priceStep: "10",
        salesBase: "270",
        salesLoss: "10",
        coefficientA: "-100",
        coefficientB: "400",
        coefficientC: "62100",
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: "activities:profit-model-guided",
          mode: "guided_practice",
          answers: {
            priceBase: "230",
            priceStep: "10",
            salesBase: "270",
            salesLoss: "10",
            coefficientA: "-100",
            coefficientB: "400",
            coefficientC: "62100",
          },
        }),
      );
    });

    it.each([
      [
        "a lookalike Guided stable ID",
        { stableActivityId: `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong-node Guided card", { masteryNodeId: `${IM3_PROFIT_MODEL_NODE}.lookalike` }],
      ["a wrong-component Guided card", { componentKey: "graphing-explorer" }],
    ])(
      "keeps the profit-model %s in practice mode with an Independent fallback envelope",
      (_label, identity) => {
        const onSubmit = vi.fn();
        const queueItem = createMockQueueItem({
          componentKey: "fill-in-the-blank",
          props: {
            ...PROFIT_MODEL_GUIDED_PROPS,
            activityId: "activities:profit-model-guided-guard",
            stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
            masteryNodeId: IM3_PROFIT_MODEL_NODE,
            ...("componentKey" in identity ? {} : identity),
          },
          ...("componentKey" in identity ? { componentKey: identity.componentKey } : {}),
        });

        render(
          <PracticeCardRenderer
            queueItem={queueItem}
            currentIndex={0}
            totalCount={1}
            onSubmit={onSubmit}
            onComplete={vi.fn()}
          />,
        );

        const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
        expect(renderedProps.mode).toBe("practice");
        renderedProps.onSubmit?.({
          priceBase: "230",
          priceStep: "10",
          salesBase: "270",
          salesLoss: "10",
          coefficientA: "-100",
          coefficientB: "400",
          coefficientC: "62100",
        });

        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            activityId: "activities:profit-model-guided-guard",
            mode: "independent_practice",
            answers: {
              priceBase: "230",
              priceStep: "10",
              salesBase: "270",
              salesLoss: "10",
              coefficientA: "-100",
              coefficientB: "400",
              coefficientC: "62100",
            },
          }),
        );
      },
    );

    it("mounts the exact maximum-profit Guided card in Guided mode and emits its three raw answers", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "fill-in-the-blank",
        props: {
          ...PROFIT_MAXIMUM_GUIDED_PROPS,
          activityId: "activities:profit-maximum-guided",
          stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...PROFIT_MAXIMUM_GUIDED_PROPS,
        activityId: "activities:profit-maximum-guided",
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      });

      renderedProps.onSubmit?.({
        optimalIncreases: "2",
        optimalPrice: "250",
        maximumProfit: "62500",
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          contractVersion: "practice.v1",
          activityId: "activities:profit-maximum-guided",
          mode: "guided_practice",
          answers: {
            optimalIncreases: "2",
            optimalPrice: "250",
            maximumProfit: "62500",
          },
        }),
      );
    });

    it("mounts the exact graph Guided seed-2 card in Guided mode with generated props and envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...GRAPH_GUIDED_SEED_2_PROPS,
          activityId: "activities:graph-guided-seed-2",
          stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...GRAPH_GUIDED_SEED_2_PROPS,
        activityId: "activities:graph-guided-seed-2",
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        srsEligible: true,
        equation: "y = -x^2 + x - 1",
      });

      renderedProps.onSubmit?.({
        tableValues: GRAPH_GUIDED_SEED_2_POINTS,
        placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          contractVersion: "practice.v1",
          activityId: "activities:graph-guided-seed-2",
          mode: "guided_practice",
          answers: {
            tableValues: GRAPH_GUIDED_SEED_2_POINTS,
            placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
          },
        }),
      );
    });

    it.each([
      [
        "a lookalike stable ID",
        { stableActivityId: `${IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong node", { masteryNodeId: `${IM3_PILOT_NODE}.lookalike` }],
      ["a wrong component", { componentKey: "fill-in-the-blank" }],
      ["a false eligibility flag", { srsEligible: false }],
    ])("keeps graph Guided seed-2 %s on the practice path", (_label, identity) => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...GRAPH_GUIDED_SEED_2_PROPS,
          activityId: "activities:graph-guided-seed-2-guard",
          stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          srsEligible: true,
          ...("componentKey" in identity ? {} : identity),
        },
        ...("componentKey" in identity ? { componentKey: identity.componentKey } : {}),
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      renderedProps.onSubmit?.({
        tableValues: GRAPH_GUIDED_SEED_2_POINTS,
        placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: "activities:graph-guided-seed-2-guard",
          mode: "independent_practice",
        }),
      );
    });

    it("mounts the exact graph Independent seed-2 card in practice mode with generated props and complete envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...GRAPH_INDEPENDENT_SEED_2_PROPS,
          activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
          stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      expect(renderedProps).toMatchObject({
        ...GRAPH_INDEPENDENT_SEED_2_PROPS,
        activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
        stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        srsEligible: true,
        equation: "y = x^2 - x + 2",
        responseVariant: "table_graph",
        domain: [-5, 5],
        range: [-10, 10],
      });

      const envelope = {
        contractVersion: "practice.v1",
        activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
        mode: "independent_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: {
          tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
          placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
        },
        parts: [
          { partId: "table_values", rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS },
          { partId: "placed_points", rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS },
        ],
        artifact: {
          graphState: {
            equation: "y = x^2 - x + 2",
            tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
            placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
          },
        },
        interactionHistory: [],
        timing: mockTiming,
      };

      renderedProps.onSubmit?.(envelope);

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining(envelope));
    });

    it.each([
      [
        "a wrong stable ID",
        { stableActivityId: `${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong node", { masteryNodeId: `${IM3_PILOT_NODE}.lookalike` }],
      ["a wrong component", { componentKey: "fill-in-the-blank" }],
      ["a false eligibility flag", { srsEligible: false }],
    ])("keeps graph Independent seed-2 %s on the ordinary Independent path", (_label, identity) => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...GRAPH_INDEPENDENT_SEED_2_PROPS,
          activityId: "activities:graph-independent-seed-2-guard",
          stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
          masteryNodeId: IM3_PILOT_NODE,
          srsEligible: true,
          ...("componentKey" in identity ? {} : identity),
        },
        ...("componentKey" in identity ? { componentKey: identity.componentKey } : {}),
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      renderedProps.onSubmit?.({
        tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
        placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: "activities:graph-independent-seed-2-guard",
          mode: "independent_practice",
        }),
      );
    });

    it.each([
      [
        "a lookalike maximum-profit Guided stable ID",
        {
          stableActivityId: `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike`,
        },
      ],
      [
        "a wrong-node maximum-profit Guided card",
        {
          masteryNodeId: `${IM3_PROFIT_MAXIMUM_NODE}.lookalike`,
        },
      ],
      ["a wrong-component maximum-profit Guided card", { componentKey: "graphing-explorer" }],
    ])("keeps %s in practice mode with an Independent fallback envelope", (_label, identity) => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "fill-in-the-blank",
        props: {
          ...PROFIT_MAXIMUM_GUIDED_PROPS,
          activityId: "activities:profit-maximum-guided-guard",
          stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
          ...("componentKey" in identity ? {} : identity),
        },
        ...("componentKey" in identity ? { componentKey: identity.componentKey } : {}),
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      renderedProps.onSubmit?.({
        optimalIncreases: "2",
        optimalPrice: "250",
        maximumProfit: "62500",
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: "activities:profit-maximum-guided-guard",
          mode: "independent_practice",
          answers: {
            optimalIncreases: "2",
            optimalPrice: "250",
            maximumProfit: "62500",
          },
        }),
      );
    });

    it("mounts the exact domain-range Guided card in Guided mode and preserves its complete envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...DOMAIN_RANGE_GUIDED_PROPS,
          activityId: "activities:domain-range-guided",
          stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_DOMAIN_RANGE_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...DOMAIN_RANGE_GUIDED_PROPS,
        activityId: "activities:domain-range-guided",
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
      });

      const envelope = {
        contractVersion: "practice.v1" as const,
        activityId: "activities:domain-range-guided",
        mode: "guided_practice" as const,
        status: "submitted" as const,
        attemptNumber: 1,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: {
          domain: "all_real_numbers",
          range: { relation: "gte", boundary: -2.25 },
        },
        parts: [
          { partId: "domain", rawAnswer: "all_real_numbers" },
          { partId: "range", rawAnswer: { relation: "gte", boundary: -2.25 } },
        ],
        artifact: {
          graphState: {
            equation: "y = x^2 - x - 2",
            domain: [-5, 5],
            range: [-10, 10],
          },
        },
        timing: mockTiming,
      };
      renderedProps.onSubmit?.(envelope);

      expect(onSubmit).toHaveBeenCalledWith(envelope);
    });

    it("mounts the exact domain-range Independent seed-2 card in practice mode and preserves its complete envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...DOMAIN_RANGE_INDEPENDENT_SEED_2_PROPS,
          activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
          stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
          masteryNodeId: IM3_DOMAIN_RANGE_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      expect(renderedProps).toMatchObject({
        ...DOMAIN_RANGE_INDEPENDENT_SEED_2_PROPS,
        activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
        stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
        equation: "y = x^2 - x + 2",
        variant: "plot_from_equation",
        responseVariant: "domain_range",
        domain: [-5, 5],
        range: [-10, 10],
      });

      const envelope = {
        contractVersion: "practice.v1" as const,
        activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
        mode: "independent_practice" as const,
        status: "submitted" as const,
        attemptNumber: 1,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: {
          domain: "all_real_numbers",
          range: { relation: "gte", boundary: 1.75 },
        },
        parts: [
          { partId: "domain", rawAnswer: "all_real_numbers" },
          { partId: "range", rawAnswer: { relation: "gte", boundary: 1.75 } },
        ],
        artifact: {
          graphState: {
            equation: "y = x^2 - x + 2",
            domain: [-5, 5],
            range: [-10, 10],
          },
        },
        interactionHistory: [],
        timing: mockTiming,
      };
      renderedProps.onSubmit?.(envelope);

      expect(onSubmit).toHaveBeenCalledWith(envelope);
    });

    it("mounts the exact domain-range Guided seed-2 card in Guided mode with generated props and envelope", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...DOMAIN_RANGE_GUIDED_SEED_2_PROPS,
          activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
          stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
          masteryNodeId: IM3_DOMAIN_RANGE_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...DOMAIN_RANGE_GUIDED_SEED_2_PROPS,
        activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
        equation: "y = -x^2 + x - 1",
        variant: "plot_from_equation",
        responseVariant: "domain_range",
        domain: [-5, 5],
        range: [-10, 10],
      });

      const envelope = {
        contractVersion: "practice.v1" as const,
        activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
        mode: "guided_practice" as const,
        status: "submitted" as const,
        attemptNumber: 1,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: {
          domain: "all_real_numbers",
          range: { relation: "lte", boundary: -0.75 },
        },
        parts: [
          { partId: "domain", rawAnswer: "all_real_numbers" },
          { partId: "range", rawAnswer: { relation: "lte", boundary: -0.75 } },
        ],
        artifact: {
          graphState: {
            equation: "y = -x^2 + x - 1",
            domain: [-5, 5],
            range: [-10, 10],
          },
        },
        timing: mockTiming,
      };
      renderedProps.onSubmit?.(envelope);

      expect(onSubmit).toHaveBeenCalledWith(envelope);
    });

    it.each([
      [
        "a lookalike Guided stable ID",
        { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong-node Guided card", { masteryNodeId: `${IM3_DOMAIN_RANGE_NODE}.lookalike` }],
      ["a false-eligibility Guided card", { srsEligible: false }],
    ])("keeps the domain-range Guided seed-2 %s in practice mode", (_label, identity) => {
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...DOMAIN_RANGE_GUIDED_SEED_2_PROPS,
          activityId: "activities:domain-range-guided-seed-2-guard",
          stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
          masteryNodeId: IM3_DOMAIN_RANGE_NODE,
          srsEligible: true,
          ...identity,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
    });

    it.each([
      [
        "a lookalike Guided stable ID",
        { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong-node Guided card", { masteryNodeId: `${IM3_DOMAIN_RANGE_NODE}.lookalike` }],
    ])("keeps the domain-range %s in practice mode", (_label, identity) => {
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...DOMAIN_RANGE_GUIDED_PROPS,
          activityId: "activities:domain-range-guard",
          stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_DOMAIN_RANGE_NODE,
          srsEligible: true,
          ...identity,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
    });

    it("mounts the exact maximum-reading Guided card in Guided mode and uses its physical ID", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...MAXIMUM_READING_GUIDED_PROPS,
          activityId: MAXIMUM_READING_GUIDED_PHYSICAL_ID,
          stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_MAXIMUM_READING_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...MAXIMUM_READING_GUIDED_PROPS,
        activityId: MAXIMUM_READING_GUIDED_PHYSICAL_ID,
        stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: true,
      });

      renderedProps.onSubmit?.({ maximum_value: -1 });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: MAXIMUM_READING_GUIDED_PHYSICAL_ID,
          mode: "guided_practice",
          answers: { maximum_value: -1 },
        }),
      );
    });

    it.each([
      [
        "a lookalike stable ID",
        { stableActivityId: `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong node", { masteryNodeId: `${IM3_MAXIMUM_READING_NODE}.lookalike` }],
      ["a wrong component", { componentKey: "fill-in-the-blank" }],
      ["a false SRS eligibility flag", { srsEligible: false }],
    ])("keeps maximum-reading Guided %s in practice mode", (_label, identity) => {
      const onSubmit = vi.fn();
      const hasComponentKeyPatch = "componentKey" in identity;
      const queueItem = createMockQueueItem({
        componentKey: hasComponentKeyPatch ? identity.componentKey : "graphing-explorer",
        props: {
          ...MAXIMUM_READING_GUIDED_PROPS,
          activityId: `${MAXIMUM_READING_GUIDED_PHYSICAL_ID}-guard`,
          stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_MAXIMUM_READING_NODE,
          srsEligible: true,
          ...(hasComponentKeyPatch ? {} : identity),
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
      renderedProps.onSubmit?.({ maximum_value: -1 });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: `${MAXIMUM_READING_GUIDED_PHYSICAL_ID}-guard`,
          mode: "independent_practice",
          answers: { maximum_value: -1 },
        }),
      );
    });

    it("mounts the exact symmetry Guided card in Guided mode and preserves its complete envelope", () => {
      const onSubmit = vi.fn();
      const envelope = {
        contractVersion: "practice.v1" as const,
        activityId: "client-supplied-symmetry-guided-id",
        mode: "guided_practice" as const,
        status: "submitted" as const,
        attemptNumber: 2,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: { placed_points: SYMMETRY_GUIDED_POINTS },
        parts: [{ partId: "placed_points", rawAnswer: SYMMETRY_GUIDED_POINTS }],
        artifact: {
          graphState: {
            equation: SYMMETRY_GUIDED_PROPS.equation,
            vertex: SYMMETRY_GUIDED_PROPS.vertex,
            yIntercept: SYMMETRY_GUIDED_PROPS.yIntercept,
            placedPoints: SYMMETRY_GUIDED_POINTS,
            domain: SYMMETRY_GUIDED_PROPS.domain,
            range: SYMMETRY_GUIDED_PROPS.range,
          },
        },
        interactionHistory: [],
        analytics: { source: "symmetry-test" },
        studentFeedback: "Ready.",
        teacherSummary: "Symmetry graph submitted.",
        timing: mockTiming,
      };
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...SYMMETRY_GUIDED_PROPS,
          activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
          stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_SYMMETRY_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...SYMMETRY_GUIDED_PROPS,
        activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
        stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_SYMMETRY_NODE,
        srsEligible: true,
      });
      renderedProps.onSubmit?.(envelope);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        ...envelope,
        activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
      });
    });

    it.each([
      [
        "a lookalike activity ID",
        { stableActivityId: `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong node ID", { masteryNodeId: `${IM3_SYMMETRY_NODE}.lookalike` }],
      ["a wrong component", { componentKey: "fill-in-the-blank" }],
      ["a false SRS eligibility flag", { srsEligible: false }],
    ])("keeps exact symmetry Guided %s in practice mode", (_label, identity) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-08-20T10:00:00.000Z"));
      try {
        const onSubmit = vi.fn();
        const hasComponentKeyPatch = "componentKey" in identity;
        const physicalId = `${SYMMETRY_GUIDED_PHYSICAL_ID}-guard`;
        const queueItem = createMockQueueItem({
          componentKey: hasComponentKeyPatch ? identity.componentKey : "graphing-explorer",
          props: {
            ...SYMMETRY_GUIDED_PROPS,
            activityId: physicalId,
            stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
            masteryNodeId: IM3_SYMMETRY_NODE,
            srsEligible: true,
            ...(hasComponentKeyPatch ? {} : identity),
          },
        });

        render(
          <PracticeCardRenderer
            queueItem={queueItem}
            currentIndex={0}
            totalCount={1}
            onSubmit={onSubmit}
            onComplete={vi.fn()}
          />,
        );

        const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
        expect(renderedProps.mode).toBe("practice");
        renderedProps.onSubmit?.({ placed_points: SYMMETRY_GUIDED_POINTS });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(
          buildPracticeSubmissionEnvelope({
            activityId: physicalId,
            mode: "independent_practice",
            answers: { placed_points: SYMMETRY_GUIDED_POINTS },
            timing: mockTiming,
          }),
        );
      } finally {
        vi.useRealTimers();
      }
    });

    it("mounts the exact compare-maximum Guided card in Guided mode and preserves its complete envelope", () => {
      const onSubmit = vi.fn();
      const envelope = {
        contractVersion: "practice.v1" as const,
        activityId: "client-supplied-compare-maximum-guided-id",
        mode: "guided_practice" as const,
        status: "submitted" as const,
        attemptNumber: 2,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: { greater_maximum: COMPARE_MAXIMUM_GUIDED_ANSWER },
        parts: [
          {
            partId: "greater_maximum",
            rawAnswer: COMPARE_MAXIMUM_GUIDED_ANSWER,
          },
        ],
        artifact: {
          graphState: {
            equation: COMPARE_MAXIMUM_GUIDED_PROPS.equation,
            comparisonEquation: COMPARE_MAXIMUM_GUIDED_PROPS.comparisonEquation,
            vertex: COMPARE_MAXIMUM_GUIDED_PROPS.vertex,
            yIntercept: COMPARE_MAXIMUM_GUIDED_PROPS.yIntercept,
          },
        },
        interactionHistory: [],
        analytics: { source: "compare-maximum-test" },
        studentFeedback: "Ready.",
        teacherSummary: "Comparison submitted.",
        timing: mockTiming,
      };
      const queueItem = createMockQueueItem({
        componentKey: "graphing-explorer",
        props: {
          ...COMPARE_MAXIMUM_GUIDED_PROPS,
          activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
          stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
          srsEligible: true,
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("guided");
      expect(renderedProps).toMatchObject({
        ...COMPARE_MAXIMUM_GUIDED_PROPS,
        activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
        stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
        srsEligible: true,
      });
      renderedProps.onSubmit?.(envelope);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        ...envelope,
        activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
      });
    });

    it.each([
      [
        "a stable-ID lookalike",
        { stableActivityId: `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike` },
      ],
      ["a wrong node", { masteryNodeId: `${IM3_COMPARE_MAXIMUM_NODE}.lookalike` }],
      ["a wrong component", { componentKey: "fill-in-the-blank" }],
      ["a false eligibility flag", { srsEligible: false }],
    ])("keeps compare-maximum Guided %s in practice mode", (_label, identity) => {
      const hasComponentKeyPatch = "componentKey" in identity;
      const queueItem = createMockQueueItem({
        componentKey: hasComponentKeyPatch ? identity.componentKey : "graphing-explorer",
        props: {
          ...COMPARE_MAXIMUM_GUIDED_PROPS,
          activityId: `${COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID}-guard`,
          stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
          masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
          srsEligible: true,
          ...(hasComponentKeyPatch ? {} : identity),
        },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      const renderedProps = TestActivity.mock.calls.at(-1)?.[0] as TestActivityProps;
      expect(renderedProps.mode).toBe("practice");
    });

    it("shows placeholder for unregistered componentKey", () => {
      const queueItem = createMockQueueItem({
        componentKey: "nonexistent-activity",
        props: { activityId: "activity-3" },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      expect(screen.getByText("This activity is not available.")).toBeInTheDocument();
    });
  });

  describe("card progress indicator", () => {
    it("displays current card index and total count", () => {
      const queueItem = createMockQueueItem();

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={2}
          totalCount={10}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      const counter = screen.getByTestId("card-progress-counter");
      expect(counter).toHaveTextContent("3 / 10");
    });

    it("renders progress bar with correct aria attributes", () => {
      const queueItem = createMockQueueItem();

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={4}
          totalCount={8}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      const progressBar = screen.getByTestId("card-progress-bar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "5");
      expect(progressBar).toHaveAttribute("aria-valuemin", "1");
      expect(progressBar).toHaveAttribute("aria-valuemax", "8");
    });
  });

  describe("timing instrumentation", () => {
    it("starts timing accumulator on mount", () => {
      const queueItem = createMockQueueItem();

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={5}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      expect(usePracticeTiming).toHaveBeenCalled();
    });
  });

  describe("submission handling", () => {
    it("preserves a complete practice.v1 envelope while taking the activity ID from the queue", () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "test-activity",
        props: { activityId: "queue-owned-activity-id" },
      });
      const envelope = {
        contractVersion: "practice.v1",
        activityId: "client-supplied-activity-id",
        mode: "assessment",
        status: "graded",
        attemptNumber: 4,
        submittedAt: "2026-08-20T10:00:00.000Z",
        answers: { q1: "A", q2: "B" },
        parts: [
          { partId: "q1", rawAnswer: "A", normalizedAnswer: "A", isCorrect: true },
          { partId: "q2", rawAnswer: "B", normalizedAnswer: "B", isCorrect: false },
        ],
        artifact: { graph: "client-artifact" },
        interactionHistory: [{ type: "hint", at: "2026-08-20T09:59:00.000Z" }],
        analytics: { timeSpent: 120 },
        studentFeedback: "I am ready to submit.",
        teacherSummary: "The student explained the vertex.",
        timing: {
          startedAt: "2026-08-20T09:58:00.000Z",
          submittedAt: "2026-08-20T10:00:00.000Z",
          wallClockMs: 120000,
          activeMs: 110000,
          idleMs: 10000,
          pauseCount: 0,
          focusLossCount: 0,
          visibilityHiddenCount: 0,
          confidence: "high",
        },
      };

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const renderedActivity = TestActivity.mock.calls.at(-1)?.[0];
      if (!renderedActivity?.onSubmit) {
        throw new Error("The registered activity must receive an onSubmit callback.");
      }
      renderedActivity.onSubmit(envelope);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        ...envelope,
        activityId: "queue-owned-activity-id",
      });
    });

    it("calls onSubmit with timing data attached", async () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "test-activity",
        props: { activityId: "activity-1" },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />,
      );

      const submitButton = screen.getByTestId("submit-btn");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            contractVersion: "practice.v1",
            activityId: "activity-1",
            mode: "independent_practice",
            answers: { answer: "test" },
            timing: expect.objectContaining({
              wallClockMs: expect.any(Number),
              activeMs: expect.any(Number),
            }),
          }),
        );
      });
    });

    it("forwards onComplete to activity component", async () => {
      const onComplete = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: "test-activity",
        props: { activityId: "activity-1" },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={onComplete}
        />,
      );

      const submitButton = screen.getByTestId("submit-btn");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });
});
