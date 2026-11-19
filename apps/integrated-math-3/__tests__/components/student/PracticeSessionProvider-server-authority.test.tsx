import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { toConvexActivityId } from "@math-platform/practice-core";
import type { PracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { ResolvedQueueItem } from "@/convex/queue/queue";
import { buildIm3ProfitMaximumGuidedSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3ProfitMaximumIndependentSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3ProfitModelIndependentSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3GraphGuidedSeed2Documents } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3GraphIndependentSeed2Documents } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3DomainRangeGuidedSeed2Documents } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3DomainRangeIndependentSeed2Documents } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3MaximumReadingGuidedSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3MaximumReadingIndependentSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import { buildIm3OneRealSolutionGuidedSeedDocument } from "@/convex/seed/seed_lesson_1_2";
import { buildIm3OneRealSolutionIndependentSeedDocument } from "@/convex/seed/seed_lesson_1_2";
import { PracticeSessionProvider } from "@/components/student/PracticeSessionProvider";
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_PILOT_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
} from "@/lib/practice/learning-evidence-pilot";

const mocks = vi.hoisted(() => ({
  submitActivity: vi.fn(),
  submitIm3PilotActivity: vi.fn(),
}));

vi.mock("@/components/student/PracticeCardRenderer", () => ({
  PracticeCardRenderer: ({
    queueItem,
    currentIndex,
    onSubmit,
  }: {
    queueItem: ResolvedQueueItem;
    currentIndex: number;
    onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
  }) => (
    <div data-testid="server-authority-card" data-current-index={currentIndex}>
      <button
        data-testid="server-authority-submit"
        onClick={() => {
          const stableActivityId = queueItem.props.stableActivityId;
          const isEquationGuided = stableActivityId === IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID;
          const isEquationIndependent =
            stableActivityId === IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID;
          if (isEquationGuided || isEquationIndependent) {
            const answers = isEquationGuided
              ? { fA: 24, fB: 0, rate: -8 }
              : { fA: -2, fB: -26, rate: -6 };
            const mode = isEquationGuided ? "guided_practice" : "independent_practice";
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode,
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [
                { partId: "f_a", rawAnswer: answers.fA },
                { partId: "f_b", rawAnswer: answers.fB },
                { partId: "rate", rawAnswer: answers.rate },
              ],
            });
            return;
          }
          const isDomainRangeGuided = stableActivityId === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID;
          const isDomainRangeGuidedSeed2 =
            stableActivityId === IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID;
          const isDomainRangeIndependent =
            stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID;
          const isDomainRangeIndependentSeed2 =
            stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID;
          if (
            isDomainRangeGuided ||
            isDomainRangeGuidedSeed2 ||
            isDomainRangeIndependent ||
            isDomainRangeIndependentSeed2
          ) {
            const answers = isDomainRangeGuided
              ? {
                  domain: "all_real_numbers",
                  range: { relation: "gte", boundary: -2.25 },
                }
              : isDomainRangeGuidedSeed2
                ? {
                    domain: "all_real_numbers",
                    range: { relation: "lte", boundary: -0.75 },
                  }
                : isDomainRangeIndependentSeed2
                  ? {
                      domain: "all_real_numbers",
                      range: { relation: "gte", boundary: 1.75 },
                    }
                  : {
                      domain: "all_real_numbers",
                      range: { relation: "lte", boundary: -1 },
                    };
            const mode =
              isDomainRangeGuided || isDomainRangeGuidedSeed2
                ? "guided_practice"
                : "independent_practice";
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode,
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [
                { partId: "domain", rawAnswer: answers.domain },
                { partId: "range", rawAnswer: answers.range },
              ],
            });
            return;
          }
          const isMaximumReadingGuided =
            stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID;
          const isMaximumReadingIndependent =
            stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID;
          if (isMaximumReadingGuided || isMaximumReadingIndependent) {
            const answers = { maximum_value: isMaximumReadingGuided ? -1 : 2 };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: isMaximumReadingGuided ? "guided_practice" : "independent_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [{ partId: "maximum_value", rawAnswer: answers.maximum_value }],
            });
            return;
          }
          const isSymmetryGuided = stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID;
          const isSymmetryIndependent = stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID;
          if (isSymmetryGuided || isSymmetryIndependent) {
            const symmetryProps = isSymmetryGuided
              ? SYMMETRY_GUIDED_PROPS
              : SYMMETRY_INDEPENDENT_PROPS;
            const symmetryPoints = isSymmetryGuided
              ? SYMMETRY_GUIDED_POINTS
              : SYMMETRY_INDEPENDENT_POINTS;
            const answers = { placed_points: symmetryPoints };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: isSymmetryGuided ? "guided_practice" : "independent_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [{ partId: "placed_points", rawAnswer: symmetryPoints }],
              artifact: {
                graphState: {
                  equation: symmetryProps.equation,
                  vertex: symmetryProps.vertex,
                  yIntercept: symmetryProps.yIntercept,
                  placedPoints: symmetryPoints,
                  domain: symmetryProps.domain,
                  range: symmetryProps.range,
                },
              },
            });
            return;
          }
          const isCompareMaximumGuided =
            stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID;
          const isCompareMaximumIndependent =
            stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID;
          if (isCompareMaximumGuided || isCompareMaximumIndependent) {
            const answers = {
              greater_maximum: isCompareMaximumGuided
                ? COMPARE_MAXIMUM_GUIDED_ANSWER
                : COMPARE_MAXIMUM_INDEPENDENT_ANSWER,
            };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: isCompareMaximumGuided ? "guided_practice" : "independent_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [{ partId: "greater_maximum", rawAnswer: answers.greater_maximum }],
            });
            return;
          }
          if (stableActivityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID) {
            const answers = {
              table_values: ONE_REAL_SOLUTION_GUIDED_TABLE_VALUES,
              placed_points: ONE_REAL_SOLUTION_GUIDED_PLACED_POINTS,
              solution: ONE_REAL_SOLUTION_GUIDED_SOLUTION,
            };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "guided_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [
                { partId: "table_values", rawAnswer: answers.table_values },
                { partId: "placed_points", rawAnswer: answers.placed_points },
                { partId: "solution", rawAnswer: answers.solution },
              ],
            });
            return;
          }
          if (stableActivityId === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID) {
            const answers = {
              table_values: ONE_REAL_SOLUTION_INDEPENDENT_TABLE_VALUES,
              placed_points: ONE_REAL_SOLUTION_INDEPENDENT_PLACED_POINTS,
              solution: ONE_REAL_SOLUTION_INDEPENDENT_SOLUTION,
            };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "independent_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [
                { partId: "table_values", rawAnswer: answers.table_values },
                { partId: "placed_points", rawAnswer: answers.placed_points },
                { partId: "solution", rawAnswer: answers.solution },
              ],
            });
            return;
          }
          if (stableActivityId === IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID) {
            const answers = Object.fromEntries(
              profitModelIndependentBlanks.map((blank) => [
                blank.id,
                { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
              ]),
            );
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "independent_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: profitModelIndependentBlanks.map((blank) => ({
                partId: blank.id,
                rawAnswer: blank.correctAnswer,
                isCorrect: false,
                score: 0,
                maxScore: 0,
              })),
            });
            return;
          }
          if (stableActivityId === IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID) {
            const answers = {
              priceBase: { answer: "230", isCorrect: false, usedWordBank: true },
              priceStep: { answer: "10", isCorrect: false, usedWordBank: true },
              salesBase: { answer: "270", isCorrect: false, usedWordBank: true },
              salesLoss: { answer: "10", isCorrect: false, usedWordBank: true },
              coefficientA: { answer: "-100", isCorrect: false, usedWordBank: true },
              coefficientB: { answer: "400", isCorrect: false, usedWordBank: true },
              coefficientC: { answer: "62100", isCorrect: false, usedWordBank: true },
            };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "guided_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: Object.entries(answers).map(([partId, answer]) => ({
                partId,
                rawAnswer: answer.answer,
                isCorrect: false,
                score: 0,
                maxScore: 0,
              })),
            });
            return;
          }
          if (stableActivityId === IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID) {
            const answers = Object.fromEntries(
              maximumGuidedBlanks.map((blank) => [
                blank.id,
                { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
              ]),
            );
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "guided_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: maximumGuidedBlanks.map((blank) => ({
                partId: blank.id,
                rawAnswer: blank.correctAnswer,
                isCorrect: false,
                score: 0,
                maxScore: 0,
              })),
            });
            return;
          }
          if (stableActivityId === IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID) {
            const answers = Object.fromEntries(
              maximumIndependentBlanks.map((blank) => [
                blank.id,
                { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
              ]),
            );
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "independent_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: maximumIndependentBlanks.map((blank) => ({
                partId: blank.id,
                rawAnswer: blank.correctAnswer,
                isCorrect: false,
                score: 0,
                maxScore: 0,
              })),
            });
            return;
          }
          if (stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID) {
            const answers = {
              tableValues: GRAPH_GUIDED_SEED_2_POINTS,
              placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
            };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "guided_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [
                { partId: "table_values", rawAnswer: GRAPH_GUIDED_SEED_2_POINTS },
                { partId: "placed_points", rawAnswer: GRAPH_GUIDED_SEED_2_POINTS },
              ],
            });
            return;
          }
          if (stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID) {
            const answers = {
              tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
              placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
            };
            onSubmit({
              contractVersion: "practice.v1",
              activityId: toConvexActivityId(String(queueItem.props.activityId)),
              mode: "independent_practice",
              status: "submitted",
              attemptNumber: 1,
              submittedAt: new Date().toISOString(),
              answers,
              parts: [
                { partId: "table_values", rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS },
                { partId: "placed_points", rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS },
              ],
            });
            return;
          }
          const isGuidedPilot = stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID;
          const points = isGuidedPilot ? GUIDED_PILOT_POINTS : PILOT_POINTS;
          onSubmit({
            contractVersion: "practice.v1",
            activityId: toConvexActivityId(String(queueItem.props.activityId)),
            mode: isGuidedPilot ? "guided_practice" : "independent_practice",
            status: "submitted",
            attemptNumber: 1,
            submittedAt: new Date().toISOString(),
            answers: { tableValues: points, placedPoints: points },
            parts: [
              {
                partId: "table_values",
                rawAnswer: points,
                isCorrect: true,
                score: 99,
                maxScore: 99,
              },
              {
                partId: "placed_points",
                rawAnswer: points,
                isCorrect: false,
                score: 0,
                maxScore: 0,
              },
            ],
          });
        }}
      >
        Submit
      </button>
    </div>
  ),
}));

vi.mock("@/lib/activities/submission", () => ({
  submitActivity: mocks.submitActivity,
  submitIm3PilotActivity: mocks.submitIm3PilotActivity,
}));

const mockSubmitActivity = mocks.submitActivity;
const mockSubmitIm3PilotActivity = mocks.submitIm3PilotActivity;
const PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID = "activities:profit-maximum-guided";
const maximumGuidedDocuments = buildIm3ProfitMaximumGuidedSeedDocuments(
  PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID as never,
  0,
);
const maximumGuidedBlanks = maximumGuidedDocuments.activity.props.blanks;
const PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID = "activities:profit-maximum-independent";
const maximumIndependentDocuments = buildIm3ProfitMaximumIndependentSeedDocuments(
  PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const maximumIndependentBlanks = maximumIndependentDocuments.activity.props.blanks;
const ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID = "activities:one-real-solution-guided-provider";
const ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID =
  "activities:one-real-solution-independent-provider";
const oneRealSolutionGuidedDocument = buildIm3OneRealSolutionGuidedSeedDocument(0);
const oneRealSolutionIndependentDocument = buildIm3OneRealSolutionIndependentSeedDocument(0);
const oneRealSolutionGuidedGenerated = getGenerator("one-real-solution-graphing").generate({
  nodeId: IM3_ONE_REAL_SOLUTION_NODE,
  seed: 45,
  difficulty: 0.5,
});
const ONE_REAL_SOLUTION_GUIDED_TABLE_VALUES = oneRealSolutionGuidedGenerated.data
  .tableValues as Array<{
  x: number;
  y: number;
}>;
const ONE_REAL_SOLUTION_GUIDED_PLACED_POINTS = oneRealSolutionGuidedGenerated.expectedAnswer
  .placed_points as Array<{
  x: number;
  y: number;
}>;
const ONE_REAL_SOLUTION_GUIDED_SOLUTION = oneRealSolutionGuidedGenerated.expectedAnswer.solution;
const oneRealSolutionIndependentGenerated = getGenerator("one-real-solution-graphing").generate({
  nodeId: IM3_ONE_REAL_SOLUTION_NODE,
  seed: 0,
  difficulty: 0.5,
});
const ONE_REAL_SOLUTION_INDEPENDENT_TABLE_VALUES = oneRealSolutionIndependentGenerated.data
  .tableValues as Array<{
  x: number;
  y: number;
}>;
const ONE_REAL_SOLUTION_INDEPENDENT_PLACED_POINTS = oneRealSolutionIndependentGenerated
  .expectedAnswer.placed_points as Array<{
  x: number;
  y: number;
}>;
const ONE_REAL_SOLUTION_INDEPENDENT_SOLUTION =
  oneRealSolutionIndependentGenerated.expectedAnswer.solution;
const PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID = "activities:profit-model-independent";
const profitModelIndependentDocuments = buildIm3ProfitModelIndependentSeedDocuments(
  PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const profitModelIndependentBlanks = profitModelIndependentDocuments.activity.props.blanks;
const PILOT_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GUIDED_PILOT_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 1,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GRAPH_GUIDED_SEED_2_PHYSICAL_ID = "activities:graph-guided-seed-2";
const graphGuidedSeed2Documents = buildIm3GraphGuidedSeed2Documents(
  GRAPH_GUIDED_SEED_2_PHYSICAL_ID as never,
  0,
);
const GRAPH_GUIDED_SEED_2_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 2,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID = "activities:graph-independent-seed-2";
const graphIndependentSeed2Documents = buildIm3GraphIndependentSeed2Documents(
  GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID as never,
  0,
);
const GRAPH_INDEPENDENT_SEED_2_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 3,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID = "activities:domain-range-guided-seed-2";
const domainRangeGuidedSeed2Documents = buildIm3DomainRangeGuidedSeed2Documents(
  DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID as never,
  0,
);
const DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID = "activities:domain-range-independent-seed-2";
const domainRangeIndependentSeed2Documents = buildIm3DomainRangeIndependentSeed2Documents(
  DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID as never,
  0,
);
const MAXIMUM_READING_GUIDED_PHYSICAL_ID = "activities:maximum-reading-guided";
const maximumReadingGuidedDocuments = buildIm3MaximumReadingGuidedSeedDocuments(
  MAXIMUM_READING_GUIDED_PHYSICAL_ID as never,
  0,
);
const MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID = "activities:maximum-reading-independent";
const maximumReadingIndependentDocuments = buildIm3MaximumReadingIndependentSeedDocuments(
  MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const SYMMETRY_GUIDED_PHYSICAL_ID = "activities:symmetry-guided-provider";
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
const SYMMETRY_INDEPENDENT_PHYSICAL_ID = "activities:symmetry-independent-provider";
const SYMMETRY_INDEPENDENT_GENERATED = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_SYMMETRY_NODE,
  seed: 1,
  difficulty: 0.5,
});
const SYMMETRY_INDEPENDENT_PROPS = SYMMETRY_INDEPENDENT_GENERATED.data.rendererProps as Record<
  string,
  unknown
>;
const SYMMETRY_INDEPENDENT_POINTS = SYMMETRY_INDEPENDENT_GENERATED.expectedAnswer
  .placed_points as Array<{ x: number; y: number }>;
const COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID = "activities:compare-maximum-guided-provider";
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
const COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID = "activities:compare-maximum-independent-provider";
const COMPARE_MAXIMUM_INDEPENDENT_GENERATED = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_COMPARE_MAXIMUM_NODE,
  seed: 1,
  difficulty: 0.5,
});
const COMPARE_MAXIMUM_INDEPENDENT_PROPS = COMPARE_MAXIMUM_INDEPENDENT_GENERATED.data
  .rendererProps as Record<string, unknown>;
const COMPARE_MAXIMUM_INDEPENDENT_ANSWER = COMPARE_MAXIMUM_INDEPENDENT_GENERATED.expectedAnswer
  .greater_maximum as "first" | "second";
const session = {
  sessionId: "session-1",
  studentId: "profiles:student",
  startedAt: "2026-08-19T10:00:00.000Z",
  completedAt: null,
  plannedCards: 1,
  completedCards: 0,
  config: { newCardsPerDay: 1, maxReviewsPerDay: 1, prioritizeOverdue: true },
};
const queue = [
  {
    card: {},
    objectivePriority: "essential",
    isOverdue: false,
    daysOverdue: 0,
    componentKey: "graphing-explorer",
    props: {
      activityId: "activities:pilot",
      stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const guidedQueue = [
  {
    card: {},
    objectivePriority: "essential",
    isOverdue: false,
    daysOverdue: 0,
    componentKey: "graphing-explorer",
    props: {
      activityId: "activities:guided-pilot",
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const graphGuidedSeed2Queue = [
  {
    ...guidedQueue[0],
    props: {
      ...graphGuidedSeed2Documents.activity.props,
      activityId: GRAPH_GUIDED_SEED_2_PHYSICAL_ID,
      stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const graphIndependentSeed2Queue = [
  {
    ...guidedQueue[0],
    props: {
      ...graphIndependentSeed2Documents.activity.props,
      activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
      stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const equationGuidedQueue = [
  {
    card: {},
    objectivePriority: "essential",
    isOverdue: false,
    daysOverdue: 0,
    componentKey: "rate-of-change-calculator",
    props: {
      activityId: "activities:equation-guided",
      stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const equationIndependentQueue = [
  {
    ...equationGuidedQueue[0],
    props: {
      ...equationGuidedQueue[0].props,
      activityId: "activities:equation-independent",
      stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
    },
  },
] as unknown as ResolvedQueueItem[];
const domainRangeGuidedQueue = [
  {
    card: {},
    objectivePriority: "essential",
    isOverdue: false,
    daysOverdue: 0,
    componentKey: "graphing-explorer",
    props: {
      activityId: "activities:domain-range-guided",
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const domainRangeGuidedSeed2Queue = [
  {
    ...domainRangeGuidedQueue[0],
    props: {
      ...domainRangeGuidedSeed2Documents.activity.props,
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const domainRangeIndependentSeed2Queue = [
  {
    ...domainRangeGuidedQueue[0],
    props: {
      ...domainRangeIndependentSeed2Documents.activity.props,
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const domainRangeIndependentQueue = [
  {
    ...domainRangeGuidedQueue[0],
    props: {
      ...domainRangeGuidedQueue[0].props,
      activityId: "activities:domain-range-independent",
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
    },
  },
] as unknown as ResolvedQueueItem[];
const maximumReadingGuidedQueue = [
  {
    ...domainRangeGuidedQueue[0],
    props: {
      ...maximumReadingGuidedDocuments.activity.props,
      activityId: MAXIMUM_READING_GUIDED_PHYSICAL_ID,
      stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const maximumReadingIndependentQueue = [
  {
    ...domainRangeGuidedQueue[0],
    props: {
      ...maximumReadingIndependentDocuments.activity.props,
      activityId: MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const oneRealSolutionGuidedQueue = [
  {
    ...maximumReadingGuidedQueue[0],
    props: {
      ...oneRealSolutionGuidedDocument.props,
      activityId: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
      stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const oneRealSolutionIndependentQueue = [
  {
    ...oneRealSolutionGuidedQueue[0],
    props: {
      ...oneRealSolutionIndependentDocument.props,
      activityId: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const symmetryGuidedQueue = [
  {
    ...maximumReadingGuidedQueue[0],
    props: {
      ...SYMMETRY_GUIDED_PROPS,
      activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
      stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const symmetryIndependentQueue = [
  {
    ...symmetryGuidedQueue[0],
    props: {
      ...SYMMETRY_INDEPENDENT_PROPS,
      activityId: SYMMETRY_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const compareMaximumGuidedQueue = [
  {
    ...symmetryGuidedQueue[0],
    props: {
      ...COMPARE_MAXIMUM_GUIDED_PROPS,
      activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
      stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const compareMaximumIndependentQueue = [
  {
    ...compareMaximumGuidedQueue[0],
    props: {
      ...COMPARE_MAXIMUM_INDEPENDENT_PROPS,
      activityId: COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const profitModelGuidedQueue = [
  {
    card: {},
    objectivePriority: "essential",
    isOverdue: false,
    daysOverdue: 0,
    componentKey: "fill-in-the-blank",
    props: {
      activityId: "activities:profit-model-guided",
      stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const profitModelIndependentQueue = [
  {
    ...profitModelGuidedQueue[0],
    props: {
      ...profitModelIndependentDocuments.activity.props,
      activityId: PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const profitMaximumGuidedQueue = [
  {
    ...profitModelGuidedQueue[0],
    props: {
      ...maximumGuidedDocuments.activity.props,
      activityId: PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID,
      stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];
const profitMaximumIndependentQueue = [
  {
    ...profitMaximumGuidedQueue[0],
    props: {
      ...maximumIndependentDocuments.activity.props,
      activityId: PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      srsEligible: true,
    },
  },
] as unknown as ResolvedQueueItem[];

const equationRateQueues = [
  ["Guided", equationGuidedQueue, "guided_practice", { fA: 24, fB: 0, rate: -8 }],
  ["Independent", equationIndependentQueue, "independent_practice", { fA: -2, fB: -26, rate: -6 }],
] as const;
const domainRangeQueues = [
  [
    "Guided",
    domainRangeGuidedQueue,
    "guided_practice",
    {
      domain: "all_real_numbers",
      range: { relation: "gte", boundary: -2.25 },
    },
  ],
  [
    "Guided seed-2",
    domainRangeGuidedSeed2Queue,
    "guided_practice",
    {
      domain: "all_real_numbers",
      range: { relation: "lte", boundary: -0.75 },
    },
  ],
  [
    "Independent",
    domainRangeIndependentQueue,
    "independent_practice",
    {
      domain: "all_real_numbers",
      range: { relation: "lte", boundary: -1 },
    },
  ],
  [
    "Independent seed-2",
    domainRangeIndependentSeed2Queue,
    "independent_practice",
    {
      domain: "all_real_numbers",
      range: { relation: "gte", boundary: 1.75 },
    },
  ],
] as const;
const domainRangeGuidedSeed2GuardFixtures = [
  [
    "stable-ID lookalike",
    { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID}.lookalike` },
  ],
  ["wrong node", { masteryNodeId: `${IM3_DOMAIN_RANGE_NODE}.lookalike` }],
  ["wrong component", { componentKey: "fill-in-the-blank" }],
  ["srsEligible false", { srsEligible: false }],
] as const;
const profitModelGuidedGuardFixtures = [
  ["stable-ID lookalike", { stableActivityId: `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}.lookalike` }],
  ["wrong node", { masteryNodeId: `${IM3_PROFIT_MODEL_NODE}.lookalike` }],
  ["wrong component", { componentKey: "graphing-explorer" }],
  ["srsEligible false", { srsEligible: false }],
] as const;
const equationGuidedGuardFixtures = [
  [
    "stable-ID lookalike",
    { stableActivityId: `${IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID}.lookalike` },
  ],
  ["wrong node", { masteryNodeId: `${IM3_EQUATION_RATE_NODE}.lookalike` }],
  ["wrong component", { componentKey: "graphing-explorer" }],
  ["srsEligible false", { srsEligible: false }],
] as const;

describe("PracticeSessionProvider server authority", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockSubmitActivity.mockReset();
    mockSubmitIm3PilotActivity.mockReset();
    global.fetch = vi
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses server score/maxScore even when the client marks the part correct", async () => {
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "submission-1",
      score: 0,
      maxScore: 2,
    });
    render(
      <PracticeSessionProvider session={session} queue={queue} studentId="profiles:student" />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() =>
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent(
        "Not quite. Keep practicing!",
      ),
    );
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
  });

  it("dispatches an enabled Guided pilot through the server-owned path and uses its server score", async () => {
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "guided-submission-1",
      score: 2,
      maxScore: 2,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={guidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        mode: "guided_practice",
        answers: { tableValues: GUIDED_PILOT_POINTS, placedPoints: GUIDED_PILOT_POINTS },
        parts: [
          expect.objectContaining({ partId: "table_values", rawAnswer: GUIDED_PILOT_POINTS }),
          expect.objectContaining({ partId: "placed_points", rawAnswer: GUIDED_PILOT_POINTS }),
        ],
      }),
    );
  });

  it("dispatches the exact eligible graph Guided seed-2 card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({
      success: true,
      submissionId: "graph-guided-seed-2-generic-submission-1",
      score: 2,
      maxScore: 2,
    });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "graph-guided-seed-2-submission-1",
      score: 2,
      maxScore: 2,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={graphGuidedSeed2Queue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(GRAPH_GUIDED_SEED_2_PHYSICAL_ID),
        mode: "guided_practice",
        answers: {
          tableValues: GRAPH_GUIDED_SEED_2_POINTS,
          placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
        },
        parts: [
          expect.objectContaining({
            partId: "table_values",
            rawAnswer: GRAPH_GUIDED_SEED_2_POINTS,
          }),
          expect.objectContaining({
            partId: "placed_points",
            rawAnswer: GRAPH_GUIDED_SEED_2_POINTS,
          }),
        ],
      }),
    );
  });

  const graphGuidedSeed2GuardFixtures = [
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_PILOT_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const;

  it.each(graphGuidedSeed2GuardFixtures)(
    "keeps graph Guided seed-2 %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...graphGuidedSeed2Queue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : graphGuidedSeed2Queue[0]?.componentKey,
          props: {
            ...graphGuidedSeed2Queue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 2, maxScore: 2 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("retries the exact graph Guided seed-2 envelope with the same activity and idempotency identity", async () => {
    mockSubmitIm3PilotActivity
      .mockResolvedValueOnce({
        success: false,
        error: "Submission progression failed",
        score: 0,
        maxScore: 2,
      })
      .mockResolvedValueOnce({
        success: true,
        submissionId: "graph-guided-seed-2-retry-success",
        score: 2,
        maxScore: 2,
      });
    render(
      <PracticeSessionProvider
        session={session}
        queue={graphGuidedSeed2Queue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/retry|try again/i);
    const firstInput = mockSubmitIm3PilotActivity.mock.calls[0]?.[0];

    fireEvent.click(screen.getByRole("button", { name: /retry submission/i }));
    await waitFor(() => expect(mockSubmitIm3PilotActivity).toHaveBeenCalledTimes(2));

    const retryInput = mockSubmitIm3PilotActivity.mock.calls[1]?.[0];
    expect(retryInput).toStrictEqual(firstInput);
  });

  it("dispatches the exact eligible graph Independent seed-2 card through the server-owned path", async () => {
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "graph-independent-seed-2-submission-1",
      score: 2,
      maxScore: 2,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={graphIndependentSeed2Queue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID),
        mode: "independent_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {
          tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
          placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
        },
        parts: [
          { partId: "table_values", rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS },
          { partId: "placed_points", rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS },
        ],
        idempotencyKey: expect.any(String),
      }),
    );
  });

  const graphIndependentSeed2GuardFixtures = [
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_PILOT_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const;

  it.each(graphIndependentSeed2GuardFixtures)(
    "keeps graph Independent seed-2 %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...graphIndependentSeed2Queue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : graphIndependentSeed2Queue[0]?.componentKey,
          props: {
            ...graphIndependentSeed2Queue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 2, maxScore: 2 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("retries the graph Independent seed-2 submission with the opaque retry fields and idempotency key", async () => {
    mockSubmitIm3PilotActivity
      .mockResolvedValueOnce({
        success: false,
        error: "Submission progression failed",
        submissionId: "graph-independent-seed-2-retry-submission",
        score: 0,
        maxScore: 2,
      })
      .mockResolvedValueOnce({
        success: true,
        submissionId: "graph-independent-seed-2-retry-submission",
        score: 2,
        maxScore: 2,
      });
    render(
      <PracticeSessionProvider
        session={session}
        queue={graphIndependentSeed2Queue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/retry|try again/i);
    const firstInput = mockSubmitIm3PilotActivity.mock.calls[0]?.[0];

    fireEvent.click(screen.getByRole("button", { name: /retry submission/i }));
    await waitFor(() => expect(mockSubmitIm3PilotActivity).toHaveBeenCalledTimes(2));

    const retryInput = mockSubmitIm3PilotActivity.mock.calls[1]?.[0];
    expect(retryInput).toStrictEqual({
      submissionId: "graph-independent-seed-2-retry-submission",
      knownScore: 0,
      knownMaxScore: 2,
      idempotencyKey: firstInput?.idempotencyKey,
    });
  });

  it("retries the graph Independent seed-2 transport failure with the full envelope and same idempotency key", async () => {
    mockSubmitIm3PilotActivity
      .mockResolvedValueOnce({
        success: false,
        error: "Submission request failed",
      })
      .mockResolvedValueOnce({
        success: true,
        submissionId: "graph-independent-seed-2-transport-retry-submission",
        score: 2,
        maxScore: 2,
      });
    render(
      <PracticeSessionProvider
        session={session}
        queue={graphIndependentSeed2Queue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/retry|try again/i);
    const firstInput = mockSubmitIm3PilotActivity.mock.calls[0]?.[0];

    fireEvent.click(screen.getByRole("button", { name: /retry submission/i }));
    await waitFor(() => expect(mockSubmitIm3PilotActivity).toHaveBeenCalledTimes(2));

    const retryInput = mockSubmitIm3PilotActivity.mock.calls[1]?.[0];
    expect(retryInput).toStrictEqual(firstInput);
    expect(retryInput?.idempotencyKey).toBe(firstInput?.idempotencyKey);
  });

  it.each(equationRateQueues)(
    "dispatches exact enabled equation-rate %s through the server-owned path",
    async (_label, equationQueue, mode, answers) => {
      mockSubmitIm3PilotActivity.mockResolvedValue({
        success: true,
        submissionId: "equation-submission-1",
        score: 7,
        maxScore: 7,
      });
      render(
        <PracticeSessionProvider
          session={session}
          queue={equationQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
      });
      expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          activityId: toConvexActivityId(String(equationQueue[0]?.props.activityId)),
          mode,
          answers,
          parts: [
            expect.objectContaining({ partId: "f_a", rawAnswer: answers.fA }),
            expect.objectContaining({ partId: "f_b", rawAnswer: answers.fB }),
            expect.objectContaining({ partId: "rate", rawAnswer: answers.rate }),
          ],
        }),
      );
    },
  );

  it.each(domainRangeQueues)(
    "dispatches exact enabled domain-range %s through the server-owned path",
    async (_label, domainRangeQueue, mode, answers) => {
      mockSubmitActivity.mockResolvedValue({
        success: true,
        submissionId: "generic-domain-range-submission-1",
        score: 2,
        maxScore: 2,
      });
      mockSubmitIm3PilotActivity.mockResolvedValue({
        success: true,
        submissionId: "domain-range-submission-1",
        score: 2,
        maxScore: 2,
      });
      render(
        <PracticeSessionProvider
          session={session}
          queue={domainRangeQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
      });
      expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          activityId: toConvexActivityId(String(domainRangeQueue[0]?.props.activityId)),
          mode,
          answers,
          parts: [
            expect.objectContaining({ partId: "domain", rawAnswer: answers.domain }),
            expect.objectContaining({ partId: "range", rawAnswer: answers.range }),
          ],
        }),
      );
    },
  );

  it.each(domainRangeGuidedSeed2GuardFixtures)(
    "keeps domain-range Guided seed-2 %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...domainRangeGuidedSeed2Queue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : domainRangeGuidedSeed2Queue[0]?.componentKey,
          props: {
            ...domainRangeGuidedSeed2Queue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 2, maxScore: 2 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible profit-model Guided card through the server-owned path", async () => {
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "profit-model-guided-submission-1",
      score: 7,
      maxScore: 7,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={profitModelGuidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(String(profitModelGuidedQueue[0]?.props.activityId)),
        mode: "guided_practice",
        answers: {
          priceBase: { answer: "230", isCorrect: false, usedWordBank: true },
          priceStep: { answer: "10", isCorrect: false, usedWordBank: true },
          salesBase: { answer: "270", isCorrect: false, usedWordBank: true },
          salesLoss: { answer: "10", isCorrect: false, usedWordBank: true },
          coefficientA: { answer: "-100", isCorrect: false, usedWordBank: true },
          coefficientB: { answer: "400", isCorrect: false, usedWordBank: true },
          coefficientC: { answer: "62100", isCorrect: false, usedWordBank: true },
        },
        parts: [
          expect.objectContaining({
            partId: "priceBase",
            rawAnswer: "230",
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
          expect.objectContaining({
            partId: "priceStep",
            rawAnswer: "10",
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
          expect.objectContaining({
            partId: "salesBase",
            rawAnswer: "270",
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
          expect.objectContaining({
            partId: "salesLoss",
            rawAnswer: "10",
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
          expect.objectContaining({
            partId: "coefficientA",
            rawAnswer: "-100",
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
          expect.objectContaining({
            partId: "coefficientB",
            rawAnswer: "400",
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
          expect.objectContaining({
            partId: "coefficientC",
            rawAnswer: "62100",
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
        ],
      }),
    );
  });

  it("dispatches the exact eligible maximum-profit Guided card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({
      success: true,
      submissionId: "profit-maximum-guided-generic-submission-1",
      score: 3,
      maxScore: 3,
    });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "profit-maximum-guided-submission-1",
      score: 3,
      maxScore: 3,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={profitMaximumGuidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    const answers = Object.fromEntries(
      maximumGuidedBlanks.map((blank) => [
        blank.id,
        { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
      ]),
    );
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID),
        mode: "guided_practice",
        answers,
        parts: maximumGuidedBlanks.map((blank) => ({
          partId: blank.id,
          rawAnswer: blank.correctAnswer,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        })),
      }),
    );
  });

  const profitMaximumGuidedGuardFixtures = [
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_PROFIT_MAXIMUM_NODE}.lookalike` }],
    ["wrong component", { componentKey: "graphing-explorer" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const;

  it.each(profitMaximumGuidedGuardFixtures)(
    "keeps maximum-profit Guided %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...profitMaximumGuidedQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : profitMaximumGuidedQueue[0]?.componentKey,
          props: {
            ...profitMaximumGuidedQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 3, maxScore: 3 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible maximum-profit Independent card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({
      success: true,
      submissionId: "profit-maximum-independent-generic-submission-1",
      score: 3,
      maxScore: 3,
    });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "profit-maximum-independent-submission-1",
      score: 3,
      maxScore: 3,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={profitMaximumIndependentQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    const answers = Object.fromEntries(
      maximumIndependentBlanks.map((blank) => [
        blank.id,
        { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
      ]),
    );
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID),
        mode: "independent_practice",
        answers,
        parts: maximumIndependentBlanks.map((blank) => ({
          partId: blank.id,
          rawAnswer: blank.correctAnswer,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        })),
      }),
    );
  });

  const profitMaximumIndependentGuardFixtures = [
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_PROFIT_MAXIMUM_NODE}.lookalike` }],
    ["wrong component", { componentKey: "graphing-explorer" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const;

  it.each(profitMaximumIndependentGuardFixtures)(
    "keeps maximum-profit Independent %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...profitMaximumIndependentQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : profitMaximumIndependentQueue[0]?.componentKey,
          props: {
            ...profitMaximumIndependentQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 3, maxScore: 3 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible profit-model Independent seed-2 card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({
      success: true,
      submissionId: "profit-model-independent-generic-submission-1",
      score: 7,
      maxScore: 7,
    });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "profit-model-independent-submission-1",
      score: 7,
      maxScore: 7,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={profitModelIndependentQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    const answers = Object.fromEntries(
      profitModelIndependentBlanks.map((blank) => [
        blank.id,
        { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
      ]),
    );
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID),
        mode: "independent_practice",
        answers,
        parts: profitModelIndependentBlanks.map((blank) =>
          expect.objectContaining({
            partId: blank.id,
            rawAnswer: blank.correctAnswer,
            isCorrect: false,
            score: 0,
            maxScore: 0,
          }),
        ),
      }),
    );
  });

  it.each(profitModelGuidedGuardFixtures)(
    "keeps profit-model Guided %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...profitModelGuidedQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : profitModelGuidedQueue[0]?.componentKey,
          props: {
            ...profitModelGuidedQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 7, maxScore: 7 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  const profitModelIndependentGuardFixtures = [
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_PROFIT_MODEL_NODE}.lookalike` }],
    ["wrong component", { componentKey: "graphing-explorer" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const;

  it.each(profitModelIndependentGuardFixtures)(
    "keeps profit-model Independent %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...profitModelIndependentQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : profitModelIndependentQueue[0]?.componentKey,
          props: {
            ...profitModelIndependentQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 7, maxScore: 7 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it.each(equationGuidedGuardFixtures)(
    "keeps equation Guided %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...equationGuidedQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : equationGuidedQueue[0]?.componentKey,
          props: {
            ...equationGuidedQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 7, maxScore: 7 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_DOMAIN_RANGE_NODE}.lookalike` }],
    ["wrong component", { componentKey: "rate-of-change-calculator" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps domain-range Guided %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...domainRangeGuidedQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : domainRangeGuidedQueue[0]?.componentKey,
          props: {
            ...domainRangeGuidedQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 2, maxScore: 2 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible maximum-reading Guided card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({ success: true, score: 1, maxScore: 1 });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "maximum-reading-guided-submission-1",
      score: 1,
      maxScore: 1,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={maximumReadingGuidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(MAXIMUM_READING_GUIDED_PHYSICAL_ID),
        mode: "guided_practice",
        answers: { maximum_value: -1 },
        parts: [{ partId: "maximum_value", rawAnswer: -1 }],
      }),
    );
  });

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_MAXIMUM_READING_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps maximum-reading Guided %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...maximumReadingGuidedQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : maximumReadingGuidedQueue[0]?.componentKey,
          props: {
            ...maximumReadingGuidedQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 1, maxScore: 1 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible symmetry Guided card through the server-owned path", async () => {
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "symmetry-guided-submission-1",
      score: 1,
      maxScore: 1,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={symmetryGuidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(SYMMETRY_GUIDED_PHYSICAL_ID),
        mode: "guided_practice",
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
      }),
    );
  });

  it.each([
    ["stable-ID lookalike", { stableActivityId: `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}.lookalike` }],
    ["wrong node", { masteryNodeId: `${IM3_SYMMETRY_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)("keeps symmetry Guided %s on the generic submit path", async (_label, override) => {
    const guardQueue = [
      {
        ...symmetryGuidedQueue[0],
        componentKey:
          "componentKey" in override ? override.componentKey : symmetryGuidedQueue[0]?.componentKey,
        props: {
          ...symmetryGuidedQueue[0]?.props,
          ...override,
        },
      },
    ] as unknown as ResolvedQueueItem[];
    mockSubmitActivity.mockResolvedValue({ success: true, score: 1, maxScore: 1 });
    render(
      <PracticeSessionProvider session={session} queue={guardQueue} studentId="profiles:student" />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
    expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
  });

  it("dispatches the exact eligible compare-maximum Guided card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 1 });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "compare-maximum-guided-submission-1",
      score: 1,
      maxScore: 1,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={compareMaximumGuidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    const feedback = await screen.findByTestId("submission-feedback");
    expect(feedback).toHaveTextContent("Correct!");
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID),
        mode: "guided_practice",
        answers: { greater_maximum: COMPARE_MAXIMUM_GUIDED_ANSWER },
        parts: [{ partId: "greater_maximum", rawAnswer: COMPARE_MAXIMUM_GUIDED_ANSWER }],
      }),
    );
  });

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_COMPARE_MAXIMUM_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps compare-maximum Guided %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...compareMaximumGuidedQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : compareMaximumGuidedQueue[0]?.componentKey,
          props: {
            ...compareMaximumGuidedQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 1, maxScore: 1 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible compare-maximum Independent card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 1 });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "compare-maximum-independent-submission-1",
      score: 1,
      maxScore: 1,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={compareMaximumIndependentQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    const feedback = await screen.findByTestId("submission-feedback");
    expect(feedback).toHaveTextContent("Correct!");
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID),
        mode: "independent_practice",
        answers: { greater_maximum: COMPARE_MAXIMUM_INDEPENDENT_ANSWER },
        parts: [{ partId: "greater_maximum", rawAnswer: COMPARE_MAXIMUM_INDEPENDENT_ANSWER }],
      }),
    );
  });

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_COMPARE_MAXIMUM_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps compare-maximum Independent %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...compareMaximumIndependentQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : compareMaximumIndependentQueue[0]?.componentKey,
          props: {
            ...compareMaximumIndependentQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 1 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible symmetry Independent card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 1 });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "symmetry-independent-submission-1",
      score: 1,
      maxScore: 1,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={symmetryIndependentQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(SYMMETRY_INDEPENDENT_PHYSICAL_ID),
        mode: "independent_practice",
        answers: { placed_points: SYMMETRY_INDEPENDENT_POINTS },
        parts: [{ partId: "placed_points", rawAnswer: SYMMETRY_INDEPENDENT_POINTS }],
        artifact: {
          graphState: {
            equation: SYMMETRY_INDEPENDENT_PROPS.equation,
            vertex: SYMMETRY_INDEPENDENT_PROPS.vertex,
            yIntercept: SYMMETRY_INDEPENDENT_PROPS.yIntercept,
            placedPoints: SYMMETRY_INDEPENDENT_POINTS,
            domain: SYMMETRY_INDEPENDENT_PROPS.domain,
            range: SYMMETRY_INDEPENDENT_PROPS.range,
          },
        },
      }),
    );
  });

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_SYMMETRY_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps symmetry Independent %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...symmetryIndependentQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : symmetryIndependentQueue[0]?.componentKey,
          props: {
            ...symmetryIndependentQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 1, maxScore: 1 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("dispatches the exact eligible maximum-reading Independent card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({ success: true, score: 1, maxScore: 1 });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "maximum-reading-independent-submission-1",
      score: 1,
      maxScore: 1,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={maximumReadingIndependentQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID),
        mode: "independent_practice",
        answers: { maximum_value: 2 },
        parts: [{ partId: "maximum_value", rawAnswer: 2 }],
      }),
    );
  });

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_MAXIMUM_READING_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps maximum-reading Independent %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...maximumReadingIndependentQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : maximumReadingIndependentQueue[0]?.componentKey,
          props: {
            ...maximumReadingIndependentQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 1, maxScore: 1 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it("keeps a Guided lookalike on the generic submit path", async () => {
    const lookalikeGuidedQueue = [
      {
        ...guidedQueue[0],
        props: {
          ...guidedQueue[0].props,
          stableActivityId: `${IM3_GUIDED_PRACTICE_ACTIVITY_ID}.lookalike`,
        },
      },
    ] as unknown as ResolvedQueueItem[];
    mockSubmitActivity.mockResolvedValue({ success: true, score: 2, maxScore: 2 });
    render(
      <PracticeSessionProvider
        session={session}
        queue={lookalikeGuidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
    expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
  });

  it("does not advance after a failed server submission", async () => {
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: false,
      error: "Submission progression failed",
    });
    render(
      <PracticeSessionProvider session={session} queue={queue} studentId="profiles:student" />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("server-authority-card")).toHaveAttribute("data-current-index", "0");
    expect(screen.queryByTestId("submission-feedback")).not.toBeInTheDocument();
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
  });

  it("shows retry feedback and reuses the opaque submission after progression fails", async () => {
    mockSubmitIm3PilotActivity
      .mockResolvedValueOnce({
        success: false,
        error: "Submission progression failed",
        submissionId: "submission-retry-opaque-id",
        score: 0,
        maxScore: 2,
      })
      .mockResolvedValueOnce({
        success: true,
        submissionId: "submission-retry-opaque-id",
        score: 0,
        maxScore: 2,
      });
    render(
      <PracticeSessionProvider session={session} queue={queue} studentId="profiles:student" />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent(/retry|try again/i);
    expect(screen.getByTestId("server-authority-card")).toHaveAttribute("data-current-index", "0");

    fireEvent.click(screen.getByRole("button", { name: /retry submission/i }));

    await waitFor(() => expect(mockSubmitIm3PilotActivity).toHaveBeenCalledTimes(2));
    const retryInput = mockSubmitIm3PilotActivity.mock.calls[1]?.[0];
    expect(retryInput).toStrictEqual({
      submissionId: "submission-retry-opaque-id",
      knownScore: 0,
      knownMaxScore: 2,
      idempotencyKey: expect.any(String),
    });
    expect(Object.keys(retryInput ?? {}).sort()).toStrictEqual([
      "idempotencyKey",
      "knownMaxScore",
      "knownScore",
      "submissionId",
    ]);
    expect(retryInput).not.toHaveProperty("activityId");
    expect(retryInput).not.toHaveProperty("answers");
    expect(retryInput).not.toHaveProperty("parts");
    expect(retryInput).not.toHaveProperty("tableValues");
    expect(retryInput).not.toHaveProperty("placedPoints");
    expect(mockSubmitActivity).not.toHaveBeenCalled();
  });

  it("dispatches the exact eligible one-real-solution Guided card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 3 });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "one-real-solution-guided-submission-1",
      score: 3,
      maxScore: 3,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={oneRealSolutionGuidedQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID),
        mode: "guided_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {
          table_values: ONE_REAL_SOLUTION_GUIDED_TABLE_VALUES,
          placed_points: ONE_REAL_SOLUTION_GUIDED_PLACED_POINTS,
          solution: ONE_REAL_SOLUTION_GUIDED_SOLUTION,
        },
        parts: [
          { partId: "table_values", rawAnswer: ONE_REAL_SOLUTION_GUIDED_TABLE_VALUES },
          { partId: "placed_points", rawAnswer: ONE_REAL_SOLUTION_GUIDED_PLACED_POINTS },
          { partId: "solution", rawAnswer: ONE_REAL_SOLUTION_GUIDED_SOLUTION },
        ],
        idempotencyKey: expect.any(String),
      }),
    );
  });

  it("dispatches the exact eligible one-real-solution Independent card through the server-owned path", async () => {
    mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 3 });
    mockSubmitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: "one-real-solution-independent-submission-1",
      score: 3,
      maxScore: 3,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={oneRealSolutionIndependentQueue}
        studentId="profiles:student"
      />,
    );

    fireEvent.click(screen.getByTestId("server-authority-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submission-feedback")).toHaveTextContent("Correct!");
    });
    expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activityId: toConvexActivityId(ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID),
        mode: "independent_practice",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: {
          table_values: ONE_REAL_SOLUTION_INDEPENDENT_TABLE_VALUES,
          placed_points: ONE_REAL_SOLUTION_INDEPENDENT_PLACED_POINTS,
          solution: ONE_REAL_SOLUTION_INDEPENDENT_SOLUTION,
        },
        parts: [
          { partId: "table_values", rawAnswer: ONE_REAL_SOLUTION_INDEPENDENT_TABLE_VALUES },
          { partId: "placed_points", rawAnswer: ONE_REAL_SOLUTION_INDEPENDENT_PLACED_POINTS },
          { partId: "solution", rawAnswer: ONE_REAL_SOLUTION_INDEPENDENT_SOLUTION },
        ],
        idempotencyKey: expect.any(String),
      }),
    );
  });

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_ONE_REAL_SOLUTION_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps one-real-solution Independent %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...oneRealSolutionIndependentQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : oneRealSolutionIndependentQueue[0]?.componentKey,
          props: {
            ...oneRealSolutionIndependentQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 3 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID}.lookalike` },
    ],
    ["wrong node", { masteryNodeId: `${IM3_ONE_REAL_SOLUTION_NODE}.lookalike` }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["srsEligible false", { srsEligible: false }],
  ] as const)(
    "keeps one-real-solution Guided %s on the generic submit path",
    async (_label, override) => {
      const guardQueue = [
        {
          ...oneRealSolutionGuidedQueue[0],
          componentKey:
            "componentKey" in override
              ? override.componentKey
              : oneRealSolutionGuidedQueue[0]?.componentKey,
          props: {
            ...oneRealSolutionGuidedQueue[0]?.props,
            ...override,
          },
        },
      ] as unknown as ResolvedQueueItem[];
      mockSubmitActivity.mockResolvedValue({ success: true, score: 0, maxScore: 3 });
      render(
        <PracticeSessionProvider
          session={session}
          queue={guardQueue}
          studentId="profiles:student"
        />,
      );

      fireEvent.click(screen.getByTestId("server-authority-submit"));

      await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledOnce());
      expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();
    },
  );
});
