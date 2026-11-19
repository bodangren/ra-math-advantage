import { describe, expect, it } from "vitest";

import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { getFunctionName, type FunctionReference } from "convex/server";
import type { MutationCtx } from "@/convex/_generated/server";
import { createServerOwnedSubmissionHandler, submitActivity } from "@/convex/activities";
import {
  buildIm3EquationRateGuidedSeedDocuments,
  buildIm3EquationRateIndependentSeedDocuments,
  buildIm3EquationRateWorkedSeedDocument,
  buildIm3DomainRangeGuidedSeedDocuments,
  buildIm3DomainRangeGuidedSeed2Documents,
  buildIm3DomainRangeIndependentSeedDocuments,
  buildIm3DomainRangeIndependentSeed2Documents,
  buildIm3DomainRangeWorkedSeedDocument,
  buildIm3GuidedPilotSeedDocuments,
  buildIm3GraphGuidedSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  buildIm3MaximumReadingGuidedSeedDocuments,
  buildIm3MaximumReadingIndependentSeedDocuments,
  buildIm3MaximumReadingWorkedSeedDocument,
  buildIm3CompareMaximumGuidedSeedDocuments,
  buildIm3CompareMaximumIndependentSeedDocuments,
  buildIm3CompareMaximumWorkedSeedDocument,
  buildIm3PilotSeedDocuments,
  buildIm3SymmetryGuidedSeedDocuments,
  buildIm3SymmetryIndependentSeedDocuments,
  buildIm3SymmetryWorkedSeedDocument,
  buildIm3ProfitModelGuidedSeedDocuments,
  buildIm3ProfitModelIndependentSeedDocuments,
  buildIm3ProfitModelWorkedSeedDocument,
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3ProfitMaximumIndependentSeedDocuments,
  buildIm3ProfitMaximumWorkedSeedDocument,
  IM3_TEACHER_LED_ACTIVITY_METADATA,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_PILOT_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";
import {
  buildIm3OneRealSolutionGuidedSeedDocument,
  buildIm3OneRealSolutionIndependentSeedDocument,
} from "@/convex/seed/seed_lesson_1_2";

const LEARNER_ID = "profiles:im3-public-create-boundary-learner";
const PILOT_ACTIVITY_ID = "activities:im3-public-create-boundary-pilot";
const GUIDED_ACTIVITY_ID = "activities:im3-public-create-boundary-guided";
const TEACHER_SOURCE_ACTIVITY_ID = "activities:im3-public-create-boundary-teacher-source";
const NON_PILOT_ACTIVITY_ID = "activities:im3-public-create-boundary-nonpilot";
const PROFIT_MODEL_ACTIVITY_ID = "activities:im3-public-create-boundary-profit-model";
const EQUATION_RATE_NODE = IM3_EQUATION_RATE_NODE;
const EQUATION_RATE_GUIDED_ACTIVITY_ID = `${EQUATION_RATE_NODE}.guided_practice`;
const EQUATION_RATE_INDEPENDENT_ACTIVITY_ID = `${EQUATION_RATE_NODE}.independent_practice`;
const EQUATION_RATE_GUIDED_PHYSICAL_ID = "activities:im3-public-create-boundary-equation-guided";
const EQUATION_RATE_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-equation-independent";
const EQUATION_RATE_WORKED_PHYSICAL_ID = "activities:im3-public-create-boundary-equation-worked";
const DOMAIN_RANGE_WORKED_PHYSICAL_ID = "activities:im3-public-create-boundary-domain-worked";
const DOMAIN_RANGE_GUIDED_PHYSICAL_ID = "activities:im3-public-create-boundary-domain-guided";
const DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID =
  "activities:im3-public-create-boundary-domain-guided-seed-2";
const DOMAIN_RANGE_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-domain-independent";
const DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID =
  "activities:im3-public-create-boundary-domain-independent-seed-2";
const PROFIT_MODEL_GUIDED_PHYSICAL_ID = "activities:im3-public-create-boundary-profit-model-guided";
const PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-profit-model-independent";
const PROFIT_MODEL_WORKED_PHYSICAL_ID = "activities:im3-public-create-boundary-profit-model-worked";
const PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID =
  "activities:im3-public-create-boundary-profit-maximum-guided";
const PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-profit-maximum-independent";
const PROFIT_MAXIMUM_WORKED_PHYSICAL_ID =
  "activities:im3-public-create-boundary-profit-maximum-worked";
const GRAPH_GUIDED_SEED_2_PHYSICAL_ID = "activities:im3-public-create-boundary-graph-guided-seed-2";
const GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID =
  "activities:im3-public-create-boundary-graph-independent-seed-2";
const MAXIMUM_READING_GUIDED_PHYSICAL_ID =
  "activities:im3-public-create-boundary-maximum-reading-guided";
const MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-maximum-reading-independent";
const MAXIMUM_READING_WORKED_PHYSICAL_ID =
  "activities:im3-public-create-boundary-maximum-reading-worked";
const SYMMETRY_WORKED_PHYSICAL_ID = "activities:im3-public-create-boundary-symmetry-worked";
const SYMMETRY_GUIDED_PHYSICAL_ID = "activities:im3-public-create-boundary-symmetry-guided";
const SYMMETRY_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-symmetry-independent";
const COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID =
  "activities:im3-public-create-boundary-compare-maximum-guided";
const COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-compare-maximum-independent";
const COMPARE_MAXIMUM_WORKED_PHYSICAL_ID =
  "activities:im3-public-create-boundary-compare-maximum-worked";
const ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID =
  "activities:im3-public-create-boundary-one-real-solution-guided";
const ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID =
  "activities:im3-public-create-boundary-one-real-solution-independent";

type Submission = Record<string, unknown> & { _id: string };
type SubmissionData = {
  contractVersion: "practice.v1";
  activityId: string;
  mode: "independent_practice" | "worked_example" | "guided_practice" | "assessment" | "teaching";
  status: "draft" | "submitted" | "graded" | "returned";
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, unknown>;
  parts: Array<{
    partId: string;
    rawAnswer: unknown;
    score?: number;
    maxScore?: number;
    isCorrect?: boolean;
  }>;
};

type PublicCreateHandler = (
  ctx: MutationCtx,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: SubmissionData;
  },
) => Promise<{ id: string; submissionId: string; score: number; maxScore: number }>;

type InternalSubmitHandler = (
  ctx: MutationCtx,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: SubmissionData;
  },
) => Promise<{ id: string; submissionId: string; score: number; maxScore: number }>;

type PublicPilotSubmission = Parameters<PublicCreateHandler>[1]["submissionData"];

const approvedGraphPublication = {
  nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
};
const publicCreateHandler: PublicCreateHandler = async (ctx, args) => {
  const result = await createServerOwnedSubmissionHandler(
    ctx,
    args as never,
    approvedGraphPublication,
  );
  if (!("score" in result) || result.score === undefined || result.maxScore === undefined) {
    throw new Error("Expected a graded selected submission");
  }
  return { ...result, score: result.score, maxScore: result.maxScore };
};
const internalSubmitHandler = (
  submitActivity as unknown as {
    _handler: InternalSubmitHandler;
  }
)._handler;

const pilotOutput = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 0,
  difficulty: 0.5,
});
const pilotPoints = pilotOutput.expectedAnswer.table_values as Array<{
  x: number;
  y: number;
}>;

const guidedOutput = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 1,
  difficulty: 0.5,
});
const guidedPoints = guidedOutput.expectedAnswer.table_values as Array<{
  x: number;
  y: number;
}>;
const graphGuidedSeed2Output = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 2,
  difficulty: 0.5,
});
const graphGuidedSeed2Points = graphGuidedSeed2Output.expectedAnswer.table_values as Array<{
  x: number;
  y: number;
}>;
const graphIndependentSeed2Output = getGenerator("quadratic-graph-analysis").generate({
  nodeId: IM3_PILOT_NODE,
  seed: 3,
  difficulty: 0.5,
});
const graphIndependentSeed2Points = graphIndependentSeed2Output.expectedAnswer
  .table_values as Array<{
  x: number;
  y: number;
}>;
const oneRealSolutionGuidedOutput = getGenerator("one-real-solution-graphing").generate({
  nodeId: IM3_ONE_REAL_SOLUTION_NODE,
  seed: 45,
  difficulty: 0.5,
});
const oneRealSolutionTableValues = oneRealSolutionGuidedOutput.data.tableValues as Array<{
  x: number;
  y: number;
}>;
const oneRealSolutionPlacedPoints = oneRealSolutionGuidedOutput.expectedAnswer
  .placed_points as Array<{
  x: number;
  y: number;
}>;
const oneRealSolutionAnswer = oneRealSolutionGuidedOutput.expectedAnswer.solution;
const oneRealSolutionIndependentOutput = getGenerator("one-real-solution-graphing").generate({
  nodeId: IM3_ONE_REAL_SOLUTION_NODE,
  seed: 0,
  difficulty: 0.5,
});
const oneRealSolutionIndependentTableValues = oneRealSolutionIndependentOutput.data
  .tableValues as Array<{
  x: number;
  y: number;
}>;
const oneRealSolutionIndependentPlacedPoints = oneRealSolutionIndependentOutput.expectedAnswer
  .placed_points as Array<{
  x: number;
  y: number;
}>;
const oneRealSolutionIndependentAnswer = oneRealSolutionIndependentOutput.expectedAnswer.solution;

const equationRateGuidedAnswers = { fA: 24, fB: 0, rate: -8 } as const;
const equationRateIndependentAnswers = { fA: -2, fB: -26, rate: -6 } as const;
const profitModelGuidedAnswers = {
  priceBase: "230",
  priceStep: "10",
  salesBase: "270",
  salesLoss: "10",
  coefficientA: "-100",
  coefficientB: "400",
  coefficientC: "62100",
} as const;
const profitModelIndependentDocuments = buildIm3ProfitModelIndependentSeedDocuments(
  PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const profitModelIndependentBlanks = profitModelIndependentDocuments.activity.props.blanks;
const profitModelIndependentAnswers = Object.fromEntries(
  profitModelIndependentBlanks.map((blank) => [blank.id, blank.correctAnswer]),
);
const profitMaximumGuidedDocuments = buildIm3ProfitMaximumGuidedSeedDocuments(
  PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID as never,
  0,
);
const profitMaximumGuidedBlanks = profitMaximumGuidedDocuments.activity.props.blanks;
const profitMaximumGuidedAnswers = Object.fromEntries(
  profitMaximumGuidedBlanks.map((blank) => [blank.id, blank.correctAnswer]),
);
const profitMaximumIndependentDocuments = buildIm3ProfitMaximumIndependentSeedDocuments(
  PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const profitMaximumIndependentBlanks = profitMaximumIndependentDocuments.activity.props.blanks;
const profitMaximumIndependentAnswers = Object.fromEntries(
  profitMaximumIndependentBlanks.map((blank) => [blank.id, blank.correctAnswer]),
);
const domainRangeGuidedSeed2Documents = buildIm3DomainRangeGuidedSeed2Documents(
  DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID as never,
  0,
);
const domainRangeIndependentSeed2Documents = buildIm3DomainRangeIndependentSeed2Documents(
  DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID as never,
  0,
);
const maximumReadingGuidedDocuments = buildIm3MaximumReadingGuidedSeedDocuments(
  MAXIMUM_READING_GUIDED_PHYSICAL_ID as never,
  0,
);
const maximumReadingIndependentDocuments = buildIm3MaximumReadingIndependentSeedDocuments(
  MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const maximumReadingWorkedDocument = buildIm3MaximumReadingWorkedSeedDocument(0);
const symmetryWorkedDocument = buildIm3SymmetryWorkedSeedDocument(0);
const symmetryGuidedDocuments = buildIm3SymmetryGuidedSeedDocuments(
  SYMMETRY_GUIDED_PHYSICAL_ID as never,
  0,
);
const symmetryIndependentDocuments = buildIm3SymmetryIndependentSeedDocuments(
  SYMMETRY_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const compareMaximumGuidedDocuments = buildIm3CompareMaximumGuidedSeedDocuments(
  COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID as never,
  0,
);
const compareMaximumIndependentDocuments = buildIm3CompareMaximumIndependentSeedDocuments(
  COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID as never,
  0,
);
const compareMaximumWorkedDocument = buildIm3CompareMaximumWorkedSeedDocument(0);

function makePilotSubmission() {
  return {
    contractVersion: "practice.v1" as const,
    activityId: PILOT_ACTIVITY_ID,
    mode: "independent_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { table_values: pilotPoints, placed_points: pilotPoints },
    parts: [
      { partId: "table_values", rawAnswer: pilotPoints },
      { partId: "placed_points", rawAnswer: pilotPoints },
    ],
  };
}

function makeGuidedSubmission() {
  return {
    contractVersion: "practice.v1" as const,
    activityId: GUIDED_ACTIVITY_ID,
    mode: "guided_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { table_values: guidedPoints, placed_points: guidedPoints },
    parts: [
      { partId: "table_values", rawAnswer: guidedPoints },
      { partId: "placed_points", rawAnswer: guidedPoints },
    ],
  };
}

function makeGraphGuidedSeed2Submission(
  activityId: string,
  tableValues = graphGuidedSeed2Points,
  placedPoints = graphGuidedSeed2Points,
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "guided_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { table_values: tableValues, placed_points: placedPoints },
    parts: [
      { partId: "table_values", rawAnswer: tableValues },
      { partId: "placed_points", rawAnswer: placedPoints },
    ],
  };
}

function makeGraphIndependentSeed2Submission(
  activityId: string,
  tableValues = graphIndependentSeed2Points,
  placedPoints = graphIndependentSeed2Points,
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "independent_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { table_values: tableValues, placed_points: placedPoints },
    parts: [
      { partId: "table_values", rawAnswer: tableValues },
      { partId: "placed_points", rawAnswer: placedPoints },
    ],
  };
}

function makeEquationRateSubmission(
  activityId: string,
  mode: "guided_practice" | "independent_practice",
  answers: { fA: number; fB: number; rate: number },
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers,
    parts: [
      { partId: "f_a", rawAnswer: answers.fA },
      { partId: "f_b", rawAnswer: answers.fB },
      { partId: "rate", rawAnswer: answers.rate },
    ],
  };
}

function makeEquationRateWorkedSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "worked_example" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: {},
    parts: [],
  };
}

function makeProfitModelWorkedSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "worked_example" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: {},
    parts: [],
  };
}

function makeProfitMaximumWorkedSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "worked_example" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: {},
    parts: [],
  };
}

function makeProfitMaximumGuidedSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "guided_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: Object.fromEntries(
      Object.entries(profitMaximumGuidedAnswers).map(([answerKey, answer]) => [
        answerKey,
        { answer, isCorrect: false, usedWordBank: true },
      ]),
    ),
    parts: Object.entries(profitMaximumGuidedAnswers).map(([partId, rawAnswer]) => ({
      partId,
      rawAnswer,
      isCorrect: false,
      score: 0,
      maxScore: 0,
    })),
  };
}

function makeProfitMaximumIndependentSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "independent_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: Object.fromEntries(
      Object.entries(profitMaximumIndependentAnswers).map(([answerKey, answer]) => [
        answerKey,
        { answer, isCorrect: false, usedWordBank: true },
      ]),
    ),
    parts: Object.entries(profitMaximumIndependentAnswers).map(([partId, rawAnswer]) => ({
      partId,
      rawAnswer,
      isCorrect: false,
      score: 0,
      maxScore: 0,
    })),
  };
}

function makeProfitModelGuidedSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "guided_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: Object.fromEntries(
      Object.entries(profitModelGuidedAnswers).map(([answerKey, answer]) => [
        answerKey,
        { answer, isCorrect: false, usedWordBank: true },
      ]),
    ),
    parts: Object.entries(profitModelGuidedAnswers).map(([partId, rawAnswer]) => ({
      partId,
      rawAnswer,
      isCorrect: false,
      score: 0,
      maxScore: 0,
    })),
  };
}

function makeProfitModelIndependentSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "independent_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: Object.fromEntries(
      Object.entries(profitModelIndependentAnswers).map(([answerKey, answer]) => [
        answerKey,
        { answer, isCorrect: false, usedWordBank: true },
      ]),
    ),
    parts: Object.entries(profitModelIndependentAnswers).map(([partId, rawAnswer]) => ({
      partId,
      rawAnswer,
      isCorrect: false,
      score: 0,
      maxScore: 0,
    })),
  };
}

function makeDomainRangeWorkedSubmission(activityId: string) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode: "worked_example" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: {},
    parts: [],
  };
}

type DomainRangeAnswers = {
  domain: "all_real_numbers";
  range: { relation: "gte" | "lte"; boundary: number };
};

function makeDomainRangeSubmission(
  activityId: string,
  mode: "guided_practice" | "independent_practice",
  answers: DomainRangeAnswers,
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers,
    parts: [
      { partId: "domain", rawAnswer: answers.domain },
      { partId: "range", rawAnswer: answers.range },
    ],
  };
}

function makeMaximumReadingSubmission(
  activityId: string,
  mode: "guided_practice" | "independent_practice",
  maximumValue: number,
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { maximum_value: maximumValue },
    parts: [{ partId: "maximum_value", rawAnswer: maximumValue }],
  };
}

const domainRangeGuidedAnswers = {
  domain: "all_real_numbers" as const,
  range: { relation: "gte" as const, boundary: -2.25 },
};

const domainRangeIndependentAnswers = {
  domain: "all_real_numbers" as const,
  range: { relation: "lte" as const, boundary: -1 },
};
const domainRangeGuidedSeed2Answers = {
  domain: "all_real_numbers" as const,
  range: { relation: "lte" as const, boundary: -0.75 },
};
const domainRangeIndependentSeed2Answers = {
  domain: "all_real_numbers" as const,
  range: { relation: "gte" as const, boundary: 1.75 },
};

function makeForgedNonPilotSubmission() {
  return {
    contractVersion: "practice.v1" as const,
    activityId: NON_PILOT_ACTIVITY_ID,
    mode: "independent_practice" as const,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { forged: "perfect" },
    parts: [
      {
        partId: "forged",
        rawAnswer: "perfect",
        isCorrect: true,
        score: 100,
        maxScore: 100,
      },
    ],
  };
}

function makeTeacherLedSourceSubmission(
  mode: "independent_practice" | "worked_example" = "worked_example",
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId: TEACHER_SOURCE_ACTIVITY_ID,
    mode,
    status: "submitted" as const,
    attemptNumber: 1,
    submittedAt: "2026-08-19T10:00:00.000Z",
    answers: { observation: "The parabola opens upward." },
    parts: [
      {
        partId: "observation",
        rawAnswer: "The parabola opens upward.",
      },
    ],
  };
}

const malformedPilotSubmissions: Array<[string, () => PublicPilotSubmission]> = [
  [
    "a missing answer key",
    () => {
      const submission = makePilotSubmission();
      const answers = { ...submission.answers };
      Reflect.deleteProperty(answers, "table_values");
      return { ...submission, answers };
    },
  ],
  [
    "an extra answer key",
    () => {
      const submission = makePilotSubmission();
      return {
        ...submission,
        answers: { ...submission.answers, extraAnswer: "not-an-im3-pilot-answer" },
      };
    },
  ],
  [
    "a camelCase answer key instead of snake_case",
    () => {
      const submission = makePilotSubmission();
      return {
        ...submission,
        answers: { tableValues: pilotPoints, placed_points: pilotPoints },
      };
    },
  ],
  [
    "a missing part",
    () => {
      const submission = makePilotSubmission();
      return { ...submission, parts: submission.parts.slice(0, -1) };
    },
  ],
  [
    "an extra part",
    () => {
      const submission = makePilotSubmission();
      return {
        ...submission,
        parts: [
          ...submission.parts,
          {
            partId: "extra_part",
            rawAnswer: "not-an-im3-pilot-answer",
          },
        ],
      };
    },
  ],
  [
    "a duplicate part",
    () => {
      const submission = makePilotSubmission();
      return {
        ...submission,
        parts: [...submission.parts, { ...submission.parts[0]! }],
      };
    },
  ],
  [
    "an old graph-feature part ID",
    () => {
      const submission = makePilotSubmission();
      return {
        ...submission,
        parts: [...submission.parts.slice(0, -1), { partId: "vertex_x", rawAnswer: 0 }],
      };
    },
  ],
  [
    "a mapped table raw value that does not match its answer value",
    () => {
      const submission = makePilotSubmission();
      return {
        ...submission,
        parts: submission.parts.map((part) =>
          part.partId === "table_values"
            ? {
                ...part,
                rawAnswer: pilotPoints.map((point, index) =>
                  index === 0 ? { ...point, y: point.y + 1 } : point,
                ),
              }
            : part,
        ),
      };
    },
  ],
];

function createHarness(options: { schedulerError?: Error } = {}) {
  const pilot = {
    _id: PILOT_ACTIVITY_ID,
    ...buildIm3PilotSeedDocuments(PILOT_ACTIVITY_ID as never, 0).activity,
    srsEligible: true,
    approval: { status: "approved" as const },
  };
  const guided = {
    _id: GUIDED_ACTIVITY_ID,
    ...buildIm3GuidedPilotSeedDocuments(GUIDED_ACTIVITY_ID as never, 0).activity,
    srsEligible: true,
    approval: { status: "approved" as const },
  };
  const equationRateGuided = {
    _id: EQUATION_RATE_GUIDED_PHYSICAL_ID,
    ...buildIm3EquationRateGuidedSeedDocuments(EQUATION_RATE_GUIDED_PHYSICAL_ID as never, 0)
      .activity,
    srsEligible: true,
  };
  const equationRateIndependent = {
    _id: EQUATION_RATE_INDEPENDENT_PHYSICAL_ID,
    ...buildIm3EquationRateIndependentSeedDocuments(
      EQUATION_RATE_INDEPENDENT_PHYSICAL_ID as never,
      0,
    ).activity,
    srsEligible: true,
  };
  const equationRateWorked = {
    _id: EQUATION_RATE_WORKED_PHYSICAL_ID,
    ...buildIm3EquationRateWorkedSeedDocument(0),
  };
  const domainRangeWorked = {
    _id: DOMAIN_RANGE_WORKED_PHYSICAL_ID,
    ...buildIm3DomainRangeWorkedSeedDocument(0),
  };
  const domainRangeGuided = {
    _id: DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
    ...buildIm3DomainRangeGuidedSeedDocuments(DOMAIN_RANGE_GUIDED_PHYSICAL_ID as never, 0).activity,
  };
  const domainRangeGuidedSeed2 = {
    _id: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
    ...domainRangeGuidedSeed2Documents.activity,
  };
  const domainRangeIndependent = {
    _id: DOMAIN_RANGE_INDEPENDENT_PHYSICAL_ID,
    ...buildIm3DomainRangeIndependentSeedDocuments(DOMAIN_RANGE_INDEPENDENT_PHYSICAL_ID as never, 0)
      .activity,
  };
  const domainRangeIndependentSeed2 = {
    _id: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
    ...domainRangeIndependentSeed2Documents.activity,
  };
  const maximumReadingGuided = {
    _id: MAXIMUM_READING_GUIDED_PHYSICAL_ID,
    ...maximumReadingGuidedDocuments.activity,
    srsEligible: true,
  };
  const maximumReadingIndependent = {
    _id: MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID,
    ...maximumReadingIndependentDocuments.activity,
    srsEligible: true,
  };
  const maximumReadingWorked = {
    _id: MAXIMUM_READING_WORKED_PHYSICAL_ID,
    ...maximumReadingWorkedDocument,
  };
  const symmetryWorked = {
    _id: SYMMETRY_WORKED_PHYSICAL_ID,
    ...symmetryWorkedDocument,
  };
  const symmetryGuided = {
    _id: SYMMETRY_GUIDED_PHYSICAL_ID,
    ...symmetryGuidedDocuments.activity,
  };
  const symmetryIndependent = {
    _id: SYMMETRY_INDEPENDENT_PHYSICAL_ID,
    ...symmetryIndependentDocuments.activity,
  };
  const compareMaximumGuided = {
    _id: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
    ...compareMaximumGuidedDocuments.activity,
    stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
    masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
  };
  const compareMaximumIndependent = {
    _id: COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
    ...compareMaximumIndependentDocuments.activity,
    stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
  };
  const compareMaximumWorked = {
    _id: COMPARE_MAXIMUM_WORKED_PHYSICAL_ID,
    ...compareMaximumWorkedDocument,
    stableActivityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
  };
  const profitModelWorked = {
    _id: PROFIT_MODEL_WORKED_PHYSICAL_ID,
    ...buildIm3ProfitModelWorkedSeedDocument(0),
  };
  const profitMaximumWorked = {
    _id: PROFIT_MAXIMUM_WORKED_PHYSICAL_ID,
    ...buildIm3ProfitMaximumWorkedSeedDocument(0),
  };
  const profitMaximumGuided = {
    _id: PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID,
    ...profitMaximumGuidedDocuments.activity,
    srsEligible: true,
  };
  const profitMaximumIndependent = {
    _id: PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
    ...profitMaximumIndependentDocuments.activity,
    srsEligible: true,
  };
  const graphGuidedSeed2 = {
    _id: GRAPH_GUIDED_SEED_2_PHYSICAL_ID,
    ...buildIm3GraphGuidedSeed2Documents(GRAPH_GUIDED_SEED_2_PHYSICAL_ID as never, 0).activity,
    srsEligible: true,
  };
  const graphIndependentSeed2 = {
    _id: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
    ...buildIm3GraphIndependentSeed2Documents(GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID as never, 0)
      .activity,
    srsEligible: true,
  };
  const oneRealSolutionGuided = {
    _id: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
    ...buildIm3OneRealSolutionGuidedSeedDocument(0),
  };
  const oneRealSolutionIndependent = {
    _id: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
    ...buildIm3OneRealSolutionIndependentSeedDocument(0),
  };
  const nonPilot = {
    _id: NON_PILOT_ACTIVITY_ID,
    stableActivityId: "math.im3.nonpilot.activity",
    masteryNodeId: "math.im3.nonpilot.activity",
    componentKey: "nonpilot-component",
    srsEligible: false,
    standardId: "standards:im3-nonpilot",
    props: {},
    gradingConfig: {},
  };
  const teacherSource = {
    _id: TEACHER_SOURCE_ACTIVITY_ID,
    ...IM3_TEACHER_LED_ACTIVITY_METADATA,
    displayName: "Teacher-led: Explore quadratic graphs",
    description: "Teacher-led first exposure for the IM3 Mastery Advantage pilot.",
    props: {
      title: "Explore Quadratic Graphs",
      variant: "plot_from_equation",
      equation: "y = x^2",
    },
    gradingConfig: { autoGrade: false, partialCredit: false },
  };
  const profitModel = {
    _id: PROFIT_MODEL_ACTIVITY_ID,
    ...buildIm3ProfitModelIndependentSeedDocuments(PROFIT_MODEL_ACTIVITY_ID as never, 123).activity,
  };
  const profitModelGuided = {
    _id: PROFIT_MODEL_GUIDED_PHYSICAL_ID,
    ...buildIm3ProfitModelGuidedSeedDocuments(PROFIT_MODEL_GUIDED_PHYSICAL_ID as never, 0).activity,
    srsEligible: true,
  };
  const profitModelIndependent = {
    _id: PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
    ...profitModelIndependentDocuments.activity,
    srsEligible: true,
  };
  const rows: Record<string, Submission[]> = {
    activity_submissions: [],
    student_competency: [],
    auth_credentials: [
      {
        _id: "auth_credentials:learner",
        profileId: LEARNER_ID,
        username: "boundary-student",
        role: "student",
        organizationId: "test-school",
        isActive: true,
      },
    ],
  };
  const scheduled: unknown[] = [];
  const queryCalls: string[] = [];

  function select(tableName: string, conditions: ReadonlyMap<string, unknown>) {
    return (rows[tableName] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );
  }

  const ctx = {
    db: {
      get: async (id: string) => {
        if (id === LEARNER_ID)
          return {
            _id: LEARNER_ID,
            username: "boundary-student",
            role: "student",
            organizationId: "test-school",
          };
        if (id === PILOT_ACTIVITY_ID) return pilot;
        if (id === GUIDED_ACTIVITY_ID) return guided;
        if (id === EQUATION_RATE_GUIDED_PHYSICAL_ID) return equationRateGuided;
        if (id === EQUATION_RATE_INDEPENDENT_PHYSICAL_ID) return equationRateIndependent;
        if (id === EQUATION_RATE_WORKED_PHYSICAL_ID) return equationRateWorked;
        if (id === DOMAIN_RANGE_WORKED_PHYSICAL_ID) return domainRangeWorked;
        if (id === DOMAIN_RANGE_GUIDED_PHYSICAL_ID) return domainRangeGuided;
        if (id === DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID) return domainRangeGuidedSeed2;
        if (id === DOMAIN_RANGE_INDEPENDENT_PHYSICAL_ID) return domainRangeIndependent;
        if (id === DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID) return domainRangeIndependentSeed2;
        if (id === MAXIMUM_READING_GUIDED_PHYSICAL_ID) return maximumReadingGuided;
        if (id === MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID) return maximumReadingIndependent;
        if (id === MAXIMUM_READING_WORKED_PHYSICAL_ID) return maximumReadingWorked;
        if (id === SYMMETRY_WORKED_PHYSICAL_ID) return symmetryWorked;
        if (id === SYMMETRY_GUIDED_PHYSICAL_ID) return symmetryGuided;
        if (id === SYMMETRY_INDEPENDENT_PHYSICAL_ID) return symmetryIndependent;
        if (id === COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID) return compareMaximumGuided;
        if (id === COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID) return compareMaximumIndependent;
        if (id === COMPARE_MAXIMUM_WORKED_PHYSICAL_ID) return compareMaximumWorked;
        if (id === PROFIT_MODEL_WORKED_PHYSICAL_ID) return profitModelWorked;
        if (id === PROFIT_MAXIMUM_WORKED_PHYSICAL_ID) return profitMaximumWorked;
        if (id === PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID) return profitMaximumGuided;
        if (id === PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID) return profitMaximumIndependent;
        if (id === GRAPH_GUIDED_SEED_2_PHYSICAL_ID) return graphGuidedSeed2;
        if (id === GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID) return graphIndependentSeed2;
        if (id === ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID) return oneRealSolutionGuided;
        if (id === ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID) return oneRealSolutionIndependent;
        if (id === TEACHER_SOURCE_ACTIVITY_ID) return teacherSource;
        if (id === NON_PILOT_ACTIVITY_ID) return nonPilot;
        if (id === PROFIT_MODEL_ACTIVITY_ID) return profitModel;
        if (id === PROFIT_MODEL_GUIDED_PHYSICAL_ID) return profitModelGuided;
        if (id === PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID) return profitModelIndependent;
        return null;
      },
      query: (tableName: string) => {
        queryCalls.push(tableName);
        return {
          withIndex: (
            _indexName: string,
            configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
          ) => {
            const conditions = new Map<string, unknown>();
            const index = {
              eq(field: string, value: unknown) {
                conditions.set(field, value);
                return index;
              },
            };
            configure(index);
            const result = {
              unique: async () => select(tableName, conditions)[0] ?? null,
              first: async () => select(tableName, conditions).at(-1) ?? null,
              order: () => result,
            };
            return result;
          },
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
      patch: async (id: string, document: Record<string, unknown>) => {
        const row = Object.values(rows)
          .flat()
          .find((candidate) => candidate._id === id);
        if (!row) throw new Error(`Unknown patch target: ${id}`);
        Object.assign(row, document);
      },
    },
    scheduler: {
      runAfter: async (...args: unknown[]) => {
        if (options.schedulerError) throw options.schedulerError;
        scheduled.push(args);
      },
    },
  } as unknown as MutationCtx;

  return {
    ctx,
    pilot,
    guided,
    equationRateGuided,
    equationRateIndependent,
    equationRateWorked,
    domainRangeWorked,
    domainRangeGuided,
    domainRangeGuidedSeed2,
    domainRangeIndependent,
    domainRangeIndependentSeed2,
    maximumReadingGuided,
    maximumReadingIndependent,
    maximumReadingWorked,
    symmetryWorked,
    symmetryGuided,
    symmetryIndependent,
    compareMaximumGuided,
    compareMaximumIndependent,
    compareMaximumWorked,
    profitModelWorked,
    profitMaximumWorked,
    profitMaximumGuided,
    profitMaximumIndependent,
    graphGuidedSeed2,
    graphIndependentSeed2,
    oneRealSolutionGuided,
    oneRealSolutionIndependent,
    teacherSource,
    profitModelGuided,
    profitModelIndependent,
    rows,
    scheduled,
    queryCalls,
  };
}

describe("IM3 public server-owned create boundary", () => {
  it("allows only the exact approved mastery pilot and grades it on the server", async () => {
    const { ctx, pilot, rows, scheduled } = createHarness();

    expect(pilot.stableActivityId).toBe(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID);

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      idempotencyKey: "im3-approved-pilot-create",
      submissionData: makePilotSubmission(),
    });

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedPilotSubmission = rows.activity_submissions[0]?.submissionData as SubmissionData;
    expect(storedPilotSubmission.parts).toEqual([
      { partId: "table_values", rawAnswer: pilotPoints, isCorrect: true, score: 1, maxScore: 1 },
      { partId: "placed_points", rawAnswer: pilotPoints, isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expect(
      storedPilotSubmission.parts.every(
        (part) => part.isCorrect === true && part.score === 1 && part.maxScore === 1,
      ),
    ).toBe(true);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("allows the exact enabled Guided pilot and stores its server-owned 2/2 grade", async () => {
    const { ctx, guided, rows, scheduled } = createHarness();

    expect(guided.stableActivityId).toBe(IM3_GUIDED_PRACTICE_ACTIVITY_ID);
    expect(guided.srsEligible).toBe(true);

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: GUIDED_ACTIVITY_ID,
      idempotencyKey: "im3-approved-guided-create",
      submissionData: makeGuidedSubmission(),
    });

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedGuidedSubmission = rows.activity_submissions[0]?.submissionData as SubmissionData;
    expect(storedGuidedSubmission).toMatchObject({
      activityId: GUIDED_ACTIVITY_ID,
      mode: "guided_practice",
      status: "graded",
      parts: [
        { partId: "table_values", rawAnswer: guidedPoints, isCorrect: true, score: 1, maxScore: 1 },
        {
          partId: "placed_points",
          rawAnswer: guidedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("allows the exact eligible graph Guided seed-2 activity and stores its server-owned 2/2 grade", async () => {
    const { ctx, graphGuidedSeed2, rows, scheduled } = createHarness();
    const submissionData = makeGraphGuidedSeed2Submission(GRAPH_GUIDED_SEED_2_PHYSICAL_ID);

    expect(graphGuidedSeed2).toMatchObject({
      stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
      props: graphGuidedSeed2Output.data.rendererProps,
      srsEligible: true,
    });

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: GRAPH_GUIDED_SEED_2_PHYSICAL_ID,
      idempotencyKey: "im3-approved-graph-guided-seed-2-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: GRAPH_GUIDED_SEED_2_PHYSICAL_ID,
      score: 2,
      maxScore: 2,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedRow?.submissionData as SubmissionData).toMatchObject({
      activityId: GRAPH_GUIDED_SEED_2_PHYSICAL_ID,
      mode: "guided_practice",
      status: "graded",
      answers: submissionData.answers,
      parts: [
        {
          partId: "table_values",
          rawAnswer: graphGuidedSeed2Points,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: graphGuidedSeed2Points,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("allows the exact eligible graph Independent seed-2 activity and stores its server-owned 2/2 grade", async () => {
    const { ctx, graphIndependentSeed2, rows, scheduled } = createHarness();
    const submissionData = makeGraphIndependentSeed2Submission(
      GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
    );

    expect(graphIndependentSeed2).toMatchObject({
      stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
      props: graphIndependentSeed2Output.data.rendererProps,
      srsEligible: true,
    });
    expect(graphIndependentSeed2.props.equation).toBe("y = x^2 - x + 2");

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
      idempotencyKey: "im3-approved-graph-independent-seed-2-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
      score: 2,
      maxScore: 2,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedRow?.submissionData as SubmissionData).toMatchObject({
      activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
      mode: "independent_practice",
      status: "graded",
      answers: submissionData.answers,
      parts: [
        {
          partId: "table_values",
          rawAnswer: graphIndependentSeed2Points,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: graphIndependentSeed2Points,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  type GraphIndependentSeed2ActivityMutator = (activity: Record<string, unknown>) => void;
  type GraphIndependentSeed2SubmissionMutator = (submission: SubmissionData) => void;
  const graphIndependentSeed2Guards: ReadonlyArray<
    readonly [string, GraphIndependentSeed2ActivityMutator, GraphIndependentSeed2SubmissionMutator]
  > = [
    [
      "stable-ID lookalike",
      (activity) => {
        activity.stableActivityId = `${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_PILOT_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "fill-in-the-blank";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "wrong mode",
      () => {},
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      () => {},
      (submission) => {
        submission.status = "draft";
      },
    ],
  ];

  it.each(graphIndependentSeed2Guards)(
    "rejects graph Independent seed-2 with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, graphIndependentSeed2, rows, scheduled } = createHarness();
      const submissionData = makeGraphIndependentSeed2Submission(
        GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
      ) as SubmissionData;
      corruptActivity(graphIndependentSeed2 as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: GRAPH_INDEPENDENT_SEED_2_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-graph-independent-seed-2-${_label.replaceAll(" ", "-")}`,
          submissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type GraphGuidedSeed2ActivityMutator = (activity: Record<string, unknown>) => void;
  type GraphGuidedSeed2SubmissionMutator = (submission: SubmissionData) => void;
  const graphGuidedSeed2Guards: ReadonlyArray<
    readonly [string, GraphGuidedSeed2ActivityMutator, GraphGuidedSeed2SubmissionMutator]
  > = [
    [
      "stable-ID lookalike",
      (activity) => {
        activity.stableActivityId = `${IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_PILOT_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "fill-in-the-blank";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "wrong mode",
      () => {},
      (submission) => {
        submission.mode = "independent_practice";
      },
    ],
    [
      "wrong status",
      () => {},
      (submission) => {
        submission.status = "draft";
      },
    ],
  ];

  it.each(graphGuidedSeed2Guards)(
    "rejects graph Guided seed-2 with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, graphGuidedSeed2, rows, scheduled } = createHarness();
      const submissionData = makeGraphGuidedSeed2Submission(
        GRAPH_GUIDED_SEED_2_PHYSICAL_ID,
      ) as SubmissionData;
      corruptActivity(graphGuidedSeed2 as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: GRAPH_GUIDED_SEED_2_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-graph-guided-seed-2-${_label.replaceAll(" ", "-")}`,
          submissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it.each([
    [
      "Guided seed 1",
      EQUATION_RATE_GUIDED_PHYSICAL_ID,
      "guided_practice" as const,
      equationRateGuidedAnswers,
      buildIm3EquationRateGuidedSeedDocuments(EQUATION_RATE_GUIDED_PHYSICAL_ID as never, 0),
    ],
    [
      "Independent seed 2",
      EQUATION_RATE_INDEPENDENT_PHYSICAL_ID,
      "independent_practice" as const,
      equationRateIndependentAnswers,
      buildIm3EquationRateIndependentSeedDocuments(
        EQUATION_RATE_INDEPENDENT_PHYSICAL_ID as never,
        0,
      ),
    ],
  ] as const)(
    "allows the exact equation-rate %s and stores its server-owned 7/7 grade",
    async (_label, activityId, mode, answers, expectedDocuments) => {
      const { ctx, equationRateGuided, equationRateIndependent, rows, scheduled } = createHarness();
      const submissionData = makeEquationRateSubmission(activityId, mode, answers);
      const activity =
        activityId === EQUATION_RATE_GUIDED_PHYSICAL_ID
          ? equationRateGuided
          : equationRateIndependent;

      expect(activity).toMatchObject({
        stableActivityId: expectedDocuments.activity.stableActivityId,
        masteryNodeId: EQUATION_RATE_NODE,
        componentKey: "rate-of-change-calculator",
        props: expectedDocuments.activity.props,
        gradingConfig: expectedDocuments.activity.gradingConfig,
        srsEligible: true,
      });
      expect(activity.stableActivityId).toBe(
        activityId === EQUATION_RATE_GUIDED_PHYSICAL_ID
          ? EQUATION_RATE_GUIDED_ACTIVITY_ID
          : EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      );

      const result = await publicCreateHandler(ctx, {
        userId: LEARNER_ID,
        activityId,
        idempotencyKey: `im3-approved-equation-rate-${mode}`,
        submissionData,
      });

      expect(result).toMatchObject({ score: 7, maxScore: 7 });
      expect(rows.activity_submissions).toHaveLength(1);
      const storedRow = rows.activity_submissions[0];
      expect(storedRow).toMatchObject({
        activityId,
        score: 7,
        maxScore: 7,
        masteryContractVersion: "learning-evidence.v1",
      });
      expect(storedRow?.submissionData).toMatchObject({
        activityId,
        mode,
        status: "graded",
        answers,
        parts: [
          { partId: "f_a", rawAnswer: answers.fA, isCorrect: true, score: 2, maxScore: 2 },
          { partId: "f_b", rawAnswer: answers.fB, isCorrect: true, score: 2, maxScore: 2 },
          { partId: "rate", rawAnswer: answers.rate, isCorrect: true, score: 3, maxScore: 3 },
        ],
      });
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("allows the exact eligible profit-model Guided activity and stores its server-owned 7/7 grade", async () => {
    const { ctx, profitModelGuided, rows, scheduled } = createHarness();
    const submissionData = makeProfitModelGuidedSubmission(PROFIT_MODEL_GUIDED_PHYSICAL_ID);

    expect(profitModelGuided).toMatchObject({
      stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      componentKey: "fill-in-the-blank",
      srsEligible: true,
    });

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: PROFIT_MODEL_GUIDED_PHYSICAL_ID,
      idempotencyKey: "im3-approved-profit-model-guided-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: PROFIT_MODEL_GUIDED_PHYSICAL_ID,
      score: 7,
      maxScore: 7,
      masteryContractVersion: "learning-evidence.v1",
    });
    const storedSubmission = storedRow?.submissionData as SubmissionData;
    expect(storedSubmission).toMatchObject({
      activityId: PROFIT_MODEL_GUIDED_PHYSICAL_ID,
      mode: "guided_practice",
      status: "graded",
      answers: submissionData.answers,
    });
    expect(storedSubmission.parts).toEqual([
      { partId: "priceBase", rawAnswer: "230", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "priceStep", rawAnswer: "10", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "salesBase", rawAnswer: "270", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "salesLoss", rawAnswer: "10", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "coefficientA", rawAnswer: "-100", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "coefficientB", rawAnswer: "400", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "coefficientC", rawAnswer: "62100", isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("allows the exact eligible profit-model Independent seed-2 activity and stores its server-owned 7/7 grade", async () => {
    const { ctx, profitModelIndependent, rows, scheduled } = createHarness();
    const submissionData = makeProfitModelIndependentSubmission(
      PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
    );

    expect(profitModelIndependent).toMatchObject({
      stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      componentKey: "fill-in-the-blank",
      props: profitModelIndependentDocuments.activity.props,
      gradingConfig: profitModelIndependentDocuments.activity.gradingConfig,
      srsEligible: true,
    });

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
      idempotencyKey: "im3-approved-profit-model-independent-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
      score: 7,
      maxScore: 7,
      masteryContractVersion: "learning-evidence.v1",
    });
    const storedSubmission = storedRow?.submissionData as SubmissionData;
    expect(storedSubmission).toMatchObject({
      activityId: PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
      mode: "independent_practice",
      status: "graded",
      answers: submissionData.answers,
    });
    expect(storedSubmission.parts).toEqual(
      Object.entries(profitModelIndependentAnswers).map(([partId, rawAnswer]) => ({
        partId,
        rawAnswer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    );
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  type ProfitModelActivityMutator = (activity: Record<string, unknown>) => void;
  type ProfitModelSubmissionMutator = (submission: SubmissionData) => void;
  const profitModelGuidedGuards: ReadonlyArray<
    readonly [string, ProfitModelActivityMutator, ProfitModelSubmissionMutator]
  > = [
    [
      "lookalike stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_PROFIT_MODEL_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "graphing-explorer";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "wrong mode",
      () => {},
      (submission) => {
        submission.mode = "independent_practice";
      },
    ],
    [
      "missing answer key",
      () => {},
      (submission) => {
        Reflect.deleteProperty(submission.answers, "coefficientC");
      },
    ],
    [
      "duplicate part",
      () => {},
      (submission) => {
        submission.parts.push({ ...submission.parts[0]! });
      },
    ],
    [
      "wrapper-answer/raw-part mismatch",
      () => {},
      (submission) => {
        submission.parts[0]!.rawAnswer = "__wrong-answer__";
      },
    ],
  ];

  it.each(profitModelGuidedGuards)(
    "rejects the exact profit-model Guided activity with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, profitModelGuided, rows, scheduled } = createHarness();
      const submissionData = makeProfitModelGuidedSubmission(
        PROFIT_MODEL_GUIDED_PHYSICAL_ID,
      ) as SubmissionData;
      corruptActivity(profitModelGuided as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MODEL_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-profit-model-guided-${_label.replaceAll(" ", "-")}`,
          submissionData: submissionData as PublicPilotSubmission,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  const profitModelIndependentGuards: ReadonlyArray<
    readonly [string, ProfitModelActivityMutator, ProfitModelSubmissionMutator]
  > = [
    [
      "lookalike stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_PROFIT_MODEL_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "graphing-explorer";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "wrong mode",
      () => {},
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "missing answer key",
      () => {},
      (submission) => {
        Reflect.deleteProperty(submission.answers, "coefficientC");
      },
    ],
    [
      "duplicate part",
      () => {},
      (submission) => {
        submission.parts.push({ ...submission.parts[0]! });
      },
    ],
    [
      "wrapper-answer/raw-part mismatch",
      () => {},
      (submission) => {
        submission.parts[0]!.rawAnswer = "__wrong-answer__";
      },
    ],
  ];

  it.each(profitModelIndependentGuards)(
    "rejects the exact profit-model Independent activity with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, profitModelIndependent, rows, scheduled } = createHarness();
      const submissionData = makeProfitModelIndependentSubmission(
        PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
      ) as SubmissionData;
      corruptActivity(profitModelIndependent as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MODEL_INDEPENDENT_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-profit-model-independent-${_label.replaceAll(" ", "-")}`,
          submissionData: submissionData as PublicPilotSubmission,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("allows the exact eligible domain-range Guided seed-2 activity and stores its server-owned 2/2 grade", async () => {
    const { ctx, domainRangeGuidedSeed2, rows, scheduled } = createHarness();
    const submissionData = makeDomainRangeSubmission(
      DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
      "guided_practice",
      domainRangeGuidedSeed2Answers,
    );

    expect(domainRangeGuidedSeed2).toMatchObject({
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
    });
    expect(domainRangeGuidedSeed2.props).toEqual(domainRangeGuidedSeed2Documents.activity.props);
    expect(domainRangeGuidedSeed2.gradingConfig).toEqual(
      domainRangeGuidedSeed2Documents.activity.gradingConfig,
    );
    expect(domainRangeGuidedSeed2.props).toMatchObject({
      equation: "y = -x^2 + x - 1",
      variant: "plot_from_equation",
      responseVariant: "domain_range",
      domain: [-5, 5],
      range: [-10, 10],
    });

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
      idempotencyKey: "im3-approved-domain-range-guided-seed-2-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
      attemptOrdinal: 1,
      score: 2,
      maxScore: 2,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedRow?.submissionData).toMatchObject({
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
      mode: "guided_practice",
      status: "graded",
      attemptNumber: 1,
      answers: domainRangeGuidedSeed2Answers,
      parts: [
        {
          partId: "domain",
          rawAnswer: domainRangeGuidedSeed2Answers.domain,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "range",
          rawAnswer: domainRangeGuidedSeed2Answers.range,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("allows the exact eligible domain-range Independent seed-2 activity and stores its server-owned 2/2 grade", async () => {
    const { ctx, domainRangeIndependentSeed2, rows, scheduled } = createHarness();
    const submissionData = makeDomainRangeSubmission(
      DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
      "independent_practice",
      domainRangeIndependentSeed2Answers,
    );

    expect(domainRangeIndependentSeed2).toMatchObject({
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
    });
    expect(domainRangeIndependentSeed2.props).toEqual(
      domainRangeIndependentSeed2Documents.activity.props,
    );
    expect(domainRangeIndependentSeed2.gradingConfig).toEqual(
      domainRangeIndependentSeed2Documents.activity.gradingConfig,
    );
    expect(domainRangeIndependentSeed2.props).toMatchObject({
      equation: "y = x^2 - x + 2",
      variant: "plot_from_equation",
      responseVariant: "domain_range",
      domain: [-5, 5],
      range: [-10, 10],
    });

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
      idempotencyKey: "im3-approved-domain-range-independent-seed-2-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
      attemptOrdinal: 1,
      score: 2,
      maxScore: 2,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedRow?.submissionData).toMatchObject({
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
      mode: "independent_practice",
      status: "graded",
      attemptNumber: 1,
      answers: domainRangeIndependentSeed2Answers,
      parts: [
        {
          partId: "domain",
          rawAnswer: domainRangeIndependentSeed2Answers.domain,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "range",
          rawAnswer: domainRangeIndependentSeed2Answers.range,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it.each([
    [
      "Guided seed 0",
      MAXIMUM_READING_GUIDED_PHYSICAL_ID,
      "guided_practice" as const,
      -1,
      maximumReadingGuidedDocuments,
      IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
    ],
    [
      "Independent seed 34",
      MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID,
      "independent_practice" as const,
      2,
      maximumReadingIndependentDocuments,
      IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
    ],
  ] as const)(
    "allows exact maximum-reading %s activity and stores its server-owned grade",
    async (_label, activityId, mode, maximumValue, expectedDocuments, expectedStableActivityId) => {
      const { ctx, maximumReadingGuided, maximumReadingIndependent, rows, scheduled } =
        createHarness();
      const activity =
        mode === "guided_practice" ? maximumReadingGuided : maximumReadingIndependent;
      const submissionData = makeMaximumReadingSubmission(
        activityId,
        mode,
        maximumValue,
      ) as SubmissionData;
      Object.assign(submissionData as unknown as Record<string, unknown>, {
        isCorrect: false,
        score: 0,
        maxScore: 99,
      });
      submissionData.parts = [
        {
          partId: "maximum_value",
          rawAnswer: maximumValue,
          isCorrect: false,
          score: 0,
          maxScore: 99,
        },
      ];

      expect(activity).toMatchObject({
        stableActivityId: expectedStableActivityId,
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        componentKey: "graphing-explorer",
        props: expectedDocuments.activity.props,
        gradingConfig: expectedDocuments.activity.gradingConfig,
        srsEligible: true,
      });
      expect(activity.props).toMatchObject({
        variant: "plot_from_equation",
        responseVariant: "maximum_value",
        domain: [-5, 5],
        range: [-10, 10],
      });

      const input = {
        userId: LEARNER_ID,
        activityId,
        idempotencyKey: `im3-approved-maximum-reading-${mode}`,
        submissionData,
      };
      const result = await publicCreateHandler(ctx, input);

      expect(result).toMatchObject({ score: 1, maxScore: 1 });
      expect(rows.activity_submissions).toHaveLength(1);
      const storedRow = rows.activity_submissions[0];
      expect(storedRow).toMatchObject({
        activityId,
        attemptOrdinal: 1,
        score: 1,
        maxScore: 1,
        masteryContractVersion: "learning-evidence.v1",
      });
      expect(storedRow?.submissionData).toMatchObject({
        activityId,
        mode,
        status: "graded",
        attemptNumber: 1,
        answers: { maximum_value: maximumValue },
        parts: [
          {
            partId: "maximum_value",
            rawAnswer: maximumValue,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
      });
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);

      const replay = await publicCreateHandler(ctx, input);
      expect(replay).toEqual(result);
      expect(rows.activity_submissions).toHaveLength(1);
      expect(scheduled).toEqual([]);
    },
  );

  type MaximumReadingActivityMutator = (activity: Record<string, unknown>) => void;
  type MaximumReadingSubmissionMutator = (submission: SubmissionData) => void;
  const maximumReadingBoundaryGuards: ReadonlyArray<
    readonly [string, MaximumReadingActivityMutator, MaximumReadingSubmissionMutator]
  > = [
    [
      "lookalike stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_MAXIMUM_READING_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "fill-in-the-blank";
      },
      () => {},
    ],
    [
      "false SRS eligibility",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "wrong mode",
      () => {},
      (submission) => {
        submission.mode = "independent_practice";
      },
    ],
    [
      "draft status",
      () => {},
      (submission) => {
        submission.status = "draft";
      },
    ],
    [
      "missing answer key",
      () => {},
      (submission) => {
        submission.answers = {};
      },
    ],
    [
      "extra answer key",
      () => {},
      (submission) => {
        submission.answers = { maximum_value: -1, extra: 1 };
      },
    ],
    [
      "missing part",
      () => {},
      (submission) => {
        submission.parts = [];
      },
    ],
    [
      "extra part",
      () => {},
      (submission) => {
        submission.parts.push({ partId: "extra", rawAnswer: 1 });
      },
    ],
    [
      "duplicate part",
      () => {},
      (submission) => {
        submission.parts.push({ partId: "maximum_value", rawAnswer: -1 });
      },
    ],
    [
      "wrong part ID",
      () => {},
      (submission) => {
        submission.parts[0] = { partId: "other", rawAnswer: -1 };
      },
    ],
    [
      "answer/raw-part mismatch",
      () => {},
      (submission) => {
        submission.parts[0] = { partId: "maximum_value", rawAnswer: 0 };
      },
    ],
  ];

  it.each(maximumReadingBoundaryGuards)(
    "rejects maximum-reading %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, maximumReadingGuided, rows, scheduled } = createHarness();
      const submissionData = makeMaximumReadingSubmission(
        MAXIMUM_READING_GUIDED_PHYSICAL_ID,
        "guided_practice",
        -1,
      ) as SubmissionData;
      corruptActivity(maximumReadingGuided as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: MAXIMUM_READING_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-maximum-reading-${_label.replaceAll(" ", "-")}`,
          submissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type DomainRangeGuidedSeed2ActivityMutator = (activity: Record<string, unknown>) => void;
  type DomainRangeGuidedSeed2SubmissionMutator = (submission: SubmissionData) => void;
  const domainRangeGuidedSeed2Guards: ReadonlyArray<
    readonly [
      string,
      DomainRangeGuidedSeed2ActivityMutator,
      DomainRangeGuidedSeed2SubmissionMutator,
    ]
  > = [
    [
      "stable-ID lookalike",
      (activity) => {
        activity.stableActivityId = `${IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_DOMAIN_RANGE_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "fill-in-the-blank";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "Independent mode",
      () => {},
      (submission) => {
        submission.mode = "independent_practice";
      },
    ],
    [
      "non-submitted status",
      () => {},
      (submission) => {
        submission.status = "draft";
      },
    ],
  ];

  it.each(domainRangeGuidedSeed2Guards)(
    "rejects domain-range Guided seed-2 with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, domainRangeGuidedSeed2, rows, scheduled } = createHarness();
      const submissionData = makeDomainRangeSubmission(
        DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
        "guided_practice",
        domainRangeGuidedSeed2Answers,
      ) as SubmissionData;
      corruptActivity(domainRangeGuidedSeed2 as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: DOMAIN_RANGE_GUIDED_SEED_2_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-domain-range-guided-seed-2-${_label.replaceAll(" ", "-")}`,
          submissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  const domainRangeIndependentSeed2Guards = [
    [
      "stable-ID lookalike",
      (activity: Record<string, unknown>) => {
        activity.stableActivityId = `${IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity: Record<string, unknown>) => {
        activity.masteryNodeId = `${IM3_DOMAIN_RANGE_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity: Record<string, unknown>) => {
        activity.componentKey = "fill-in-the-blank";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity: Record<string, unknown>) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "Guided mode",
      () => {},
      (submission: SubmissionData) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "draft status",
      () => {},
      (submission: SubmissionData) => {
        submission.status = "draft";
      },
    ],
  ] as const;

  it.each(domainRangeIndependentSeed2Guards)(
    "rejects domain-range Independent seed-2 with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, domainRangeIndependentSeed2, rows, scheduled } = createHarness();
      const submissionData = makeDomainRangeSubmission(
        DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
        "independent_practice",
        domainRangeIndependentSeed2Answers,
      ) as SubmissionData;
      corruptActivity(domainRangeIndependentSeed2 as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-domain-range-independent-seed-2-${_label.replaceAll(" ", "-")}`,
          submissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it.each([
    [
      "Guided seed 1",
      DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
      "guided_practice" as const,
      domainRangeGuidedAnswers,
      buildIm3DomainRangeGuidedSeedDocuments(DOMAIN_RANGE_GUIDED_PHYSICAL_ID as never, 0),
    ],
    [
      "Independent seed 0",
      DOMAIN_RANGE_INDEPENDENT_PHYSICAL_ID,
      "independent_practice" as const,
      domainRangeIndependentAnswers,
      buildIm3DomainRangeIndependentSeedDocuments(DOMAIN_RANGE_INDEPENDENT_PHYSICAL_ID as never, 0),
    ],
  ] as const)(
    "allows the exact domain-range %s and stores its server-owned 2/2 grade",
    async (_label, activityId, mode, answers, expectedDocuments) => {
      const { ctx, domainRangeGuided, domainRangeIndependent, rows, scheduled } = createHarness();
      const submissionData = makeDomainRangeSubmission(activityId, mode, answers);
      const activity =
        activityId === DOMAIN_RANGE_GUIDED_PHYSICAL_ID ? domainRangeGuided : domainRangeIndependent;

      expect(activity).toMatchObject({
        stableActivityId: expectedDocuments.activity.stableActivityId,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        componentKey: "graphing-explorer",
        props: expectedDocuments.activity.props,
        gradingConfig: expectedDocuments.activity.gradingConfig,
        srsEligible: true,
      });
      expect(activity.stableActivityId).toBe(
        activityId === DOMAIN_RANGE_GUIDED_PHYSICAL_ID
          ? IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID
          : IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      );

      const result = await publicCreateHandler(ctx, {
        userId: LEARNER_ID,
        activityId,
        idempotencyKey: `im3-approved-domain-range-${mode}`,
        submissionData,
      });

      expect(result).toMatchObject({ score: 2, maxScore: 2 });
      expect(rows.activity_submissions).toHaveLength(1);
      const storedRow = rows.activity_submissions[0];
      expect(storedRow).toMatchObject({
        activityId,
        attemptOrdinal: 1,
        score: 2,
        maxScore: 2,
        masteryContractVersion: "learning-evidence.v1",
      });
      expect(storedRow?.submissionData).toMatchObject({
        activityId,
        mode,
        status: "graded",
        attemptNumber: 1,
        answers,
        parts: [
          { partId: "domain", rawAnswer: answers.domain, isCorrect: true, score: 1, maxScore: 1 },
          { partId: "range", rawAnswer: answers.range, isCorrect: true, score: 1, maxScore: 1 },
        ],
      });
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it.each([
    [
      "wrong mode",
      () => ({
        ...makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        ),
        mode: "independent_practice" as const,
      }),
    ],
    [
      "wrong status",
      () => ({
        ...makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        ),
        status: "graded" as const,
      }),
    ],
    [
      "missing answer",
      () => {
        const submission = makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        );
        const answers = { ...submission.answers };
        Reflect.deleteProperty(answers, "domain");
        return { ...submission, answers };
      },
    ],
    [
      "extra answer",
      () => ({
        ...makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        ),
        answers: { ...domainRangeGuidedAnswers, extra: "unexpected" },
      }),
    ],
    [
      "missing part",
      () => ({
        ...makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        ),
        parts: [{ partId: "domain", rawAnswer: domainRangeGuidedAnswers.domain }],
      }),
    ],
    [
      "extra part",
      () => ({
        ...makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        ),
        parts: [
          { partId: "domain", rawAnswer: domainRangeGuidedAnswers.domain },
          { partId: "range", rawAnswer: domainRangeGuidedAnswers.range },
          { partId: "extra", rawAnswer: "unexpected" },
        ],
      }),
    ],
    [
      "duplicate part",
      () => ({
        ...makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        ),
        parts: [
          { partId: "domain", rawAnswer: domainRangeGuidedAnswers.domain },
          { partId: "range", rawAnswer: domainRangeGuidedAnswers.range },
          { partId: "domain", rawAnswer: domainRangeGuidedAnswers.domain },
        ],
      }),
    ],
    [
      "raw answer mismatch",
      () => ({
        ...makeDomainRangeSubmission(
          DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          domainRangeGuidedAnswers,
        ),
        parts: [
          { partId: "domain", rawAnswer: domainRangeGuidedAnswers.domain },
          { partId: "range", rawAnswer: { relation: "gte" as const, boundary: -2 } },
        ],
      }),
    ],
  ] as const)(
    "rejects domain-range %s before public persistence",
    async (_label, makeSubmissionData) => {
      const { ctx, rows, scheduled } = createHarness();

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-malformed-domain-range-${_label.replaceAll(" ", "-")}`,
          submissionData: makeSubmissionData(),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type DomainRangeActivityMutator = (activity: Record<string, unknown>) => void;
  const domainRangeIdentityCorruptions: ReadonlyArray<
    readonly [string, DomainRangeActivityMutator]
  > = [
    [
      "wrong stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_DOMAIN_RANGE_NODE}.guided_practice.lookalike`;
      },
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = IM3_PILOT_NODE;
      },
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "rate-of-change-calculator";
      },
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
    ],
  ];

  it.each(domainRangeIdentityCorruptions)(
    "rejects a domain-range activity with %s before public persistence",
    async (_label, corrupt) => {
      const { ctx, domainRangeGuided, rows, scheduled } = createHarness();
      corrupt(domainRangeGuided as unknown as Record<string, unknown>);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-corrupt-domain-range-${_label.replaceAll(" ", "-")}`,
          submissionData: makeDomainRangeSubmission(
            DOMAIN_RANGE_GUIDED_PHYSICAL_ID,
            "guided_practice",
            domainRangeGuidedAnswers,
          ),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it.each([
    [
      "missing answer key",
      () => {
        const submission = makeEquationRateSubmission(
          EQUATION_RATE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          equationRateGuidedAnswers,
        );
        const answers = { ...submission.answers };
        Reflect.deleteProperty(answers, "rate");
        return { ...submission, answers };
      },
    ],
    [
      "missing part",
      () => {
        const submission = makeEquationRateSubmission(
          EQUATION_RATE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          equationRateGuidedAnswers,
        );
        return { ...submission, parts: submission.parts.slice(0, -1) };
      },
    ],
  ] as const)(
    "rejects malformed equation-rate input with %s before public persistence",
    async (_label, makeSubmissionData) => {
      const { ctx, rows, scheduled } = createHarness();

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: EQUATION_RATE_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-malformed-equation-rate-${_label.replaceAll(" ", "-")}`,
          submissionData: makeSubmissionData(),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("rejects an equation-rate Guided lookalike before public persistence", async () => {
    const { ctx, equationRateGuided, rows, scheduled } = createHarness();
    equationRateGuided.stableActivityId = `${EQUATION_RATE_GUIDED_ACTIVITY_ID}.lookalike` as never;

    await expect(
      publicCreateHandler(ctx, {
        userId: LEARNER_ID,
        activityId: EQUATION_RATE_GUIDED_PHYSICAL_ID,
        idempotencyKey: "im3-lookalike-equation-rate-guided-create",
        submissionData: makeEquationRateSubmission(
          EQUATION_RATE_GUIDED_PHYSICAL_ID,
          "guided_practice",
          equationRateGuidedAnswers,
        ),
      }),
    ).rejects.toThrow();

    expect(rows.activity_submissions).toEqual([]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it.each(malformedPilotSubmissions)(
    "rejects %s before public persistence",
    async (_label, makeSubmissionData) => {
      const { ctx, queryCalls, rows, scheduled } = createHarness();

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PILOT_ACTIVITY_ID,
          idempotencyKey: `im3-malformed-public-pilot-${_label.replaceAll(" ", "-")}`,
          submissionData: makeSubmissionData(),
        }),
      ).rejects.toThrow();

      expect(queryCalls.filter((table) => table !== "auth_credentials")).toEqual([]);
      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it.each([
    ["wrong mode", () => ({ ...makeGuidedSubmission(), mode: "independent_practice" as const })],
    ["non-submitted status", () => ({ ...makeGuidedSubmission(), status: "graded" as const })],
  ] as const)(
    "rejects the exact Guided pilot with %s before public persistence",
    async (_label, makeSubmissionData) => {
      const { ctx, rows, scheduled } = createHarness();

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: GUIDED_ACTIVITY_ID,
          idempotencyKey: `im3-invalid-guided-${_label.replaceAll(" ", "-")}`,
          submissionData: makeSubmissionData(),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it.each([
    [
      "missing answer key",
      () => {
        const submission = makeGuidedSubmission();
        return { ...submission, answers: { tableValues: guidedPoints } };
      },
    ],
    [
      "missing part",
      () => {
        const submission = makeGuidedSubmission();
        return { ...submission, parts: submission.parts.slice(0, 1) };
      },
    ],
  ] as const)(
    "rejects malformed Guided two-part input with %s before public persistence",
    async (_label, makeSubmissionData) => {
      const { ctx, rows, scheduled } = createHarness();

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: GUIDED_ACTIVITY_ID,
          idempotencyKey: `im3-malformed-guided-${_label.replaceAll(" ", "-")}`,
          submissionData: makeSubmissionData(),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("rejects a lookalike Guided identity before public persistence", async () => {
    const { ctx, guided, rows, scheduled } = createHarness();
    guided.stableActivityId = `${IM3_GUIDED_PRACTICE_ACTIVITY_ID}.lookalike` as never;

    await expect(
      publicCreateHandler(ctx, {
        userId: LEARNER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        idempotencyKey: "im3-lookalike-guided-create",
        submissionData: makeGuidedSubmission(),
      }),
    ).rejects.toThrow();

    expect(rows.activity_submissions).toEqual([]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("rejects the exact teacher-led source document before it can persist a public submission or schedule effects", async () => {
    const { ctx, pilot, teacherSource, rows, scheduled } = createHarness();

    expect(teacherSource.stableActivityId).toBe(IM3_TEACHER_LED_ACTIVITY_ID);
    expect(teacherSource.masteryNodeId).toBe(pilot.masteryNodeId);

    await expect(
      publicCreateHandler(ctx, {
        userId: LEARNER_ID,
        activityId: TEACHER_SOURCE_ACTIVITY_ID,
        idempotencyKey: "im3-teacher-source-public-create",
        // An attacker can label a teacher-led source attempt as independent work.
        // The physical source document must still fail the public allowlist.
        submissionData: makeTeacherLedSourceSubmission("independent_practice"),
      }),
    ).rejects.toThrow(/Invalid selected IM3 Worked acknowledgement/i);

    expect(rows.activity_submissions).toEqual([]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("rejects every non-pilot document before it can persist forged score data or schedule effects", async () => {
    const { ctx, rows, scheduled } = createHarness();

    await expect(
      publicCreateHandler(ctx, {
        userId: LEARNER_ID,
        activityId: NON_PILOT_ACTIVITY_ID,
        idempotencyKey: "im3-forged-nonpilot-create",
        submissionData: makeForgedNonPilotSubmission(),
      }),
    ).rejects.toThrow(/approved IM3 mastery pilot|non-pilot|server-owned create/i);

    expect(rows.activity_submissions).toEqual([]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("ignores browser-owned non-pilot scores and applies no ungraded mastery effects", async () => {
    const { ctx, rows, scheduled } = createHarness();

    const result = await internalSubmitHandler(ctx, {
      userId: LEARNER_ID,
      activityId: NON_PILOT_ACTIVITY_ID,
      idempotencyKey: "im3-ungraded-nonpilot-submit",
      submissionData: makeForgedNonPilotSubmission(),
    });

    expect(result).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).not.toHaveProperty("score");
    expect(rows.activity_submissions[0]).not.toHaveProperty("maxScore");
    expect(rows.activity_submissions[0]?.submissionData).toMatchObject({
      status: "submitted",
      parts: [{ partId: "forged", rawAnswer: "perfect" }],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("stores the daily teacher source and schedules opaque learning evidence", async () => {
    const { ctx, rows, scheduled } = createHarness();

    const result = await internalSubmitHandler(ctx, {
      userId: LEARNER_ID,
      activityId: TEACHER_SOURCE_ACTIVITY_ID,
      idempotencyKey: "im3-teacher-source-submit",
      submissionData: makeTeacherLedSourceSubmission(),
    });

    expect(result).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).toMatchObject({
      activityId: TEACHER_SOURCE_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1",
      submissionData: expect.objectContaining({
        mode: "worked_example",
      }),
    });
    expect(scheduled).toHaveLength(1);
    const scheduledCall = scheduled[0] as unknown[] | undefined;
    expect(scheduledCall?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: rows.activity_submissions[0]?._id,
    });
  });

  it("stores the exact equation-rate Worked source and schedules opaque learning evidence", async () => {
    const { ctx, equationRateWorked, rows, scheduled } = createHarness();
    const submissionData = makeEquationRateWorkedSubmission(EQUATION_RATE_WORKED_PHYSICAL_ID);

    expect(equationRateWorked).toMatchObject({
      stableActivityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      componentKey: "rate-of-change-calculator",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });

    const args = {
      userId: LEARNER_ID,
      activityId: EQUATION_RATE_WORKED_PHYSICAL_ID,
      idempotencyKey: "im3-equation-rate-worked-producer",
      submissionData,
    };
    const first = await internalSubmitHandler(ctx, args);

    expect(first).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: EQUATION_RATE_WORKED_PHYSICAL_ID,
      attemptOrdinal: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission).not.toHaveProperty("score");
    expect(storedSubmission).not.toHaveProperty("maxScore");
    expect(storedSubmission).not.toHaveProperty("gradedAt");
    expect(storedSubmission?.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: EQUATION_RATE_WORKED_PHYSICAL_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: "2026-08-19T10:00:00.000Z",
      answers: {},
      parts: [],
    });
    expect(scheduled).toHaveLength(1);
    expect((scheduled[0] as unknown[] | undefined)?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: storedSubmission?._id,
    });

    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("stores the exact domain-range Worked source and schedules opaque learning evidence", async () => {
    const { ctx, domainRangeWorked, rows, scheduled } = createHarness();
    const submissionData = makeDomainRangeWorkedSubmission(DOMAIN_RANGE_WORKED_PHYSICAL_ID);

    expect(domainRangeWorked).toMatchObject({
      stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });

    const args = {
      userId: LEARNER_ID,
      activityId: DOMAIN_RANGE_WORKED_PHYSICAL_ID,
      idempotencyKey: "im3-domain-range-worked-producer",
      submissionData,
    };
    const first = await internalSubmitHandler(ctx, args);

    expect(first).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: DOMAIN_RANGE_WORKED_PHYSICAL_ID,
      attemptOrdinal: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission).not.toHaveProperty("score");
    expect(storedSubmission).not.toHaveProperty("maxScore");
    expect(storedSubmission).not.toHaveProperty("gradedAt");
    expect(storedSubmission?.submissionData).toEqual(submissionData);
    expect(scheduled).toHaveLength(1);
    expect((scheduled[0] as unknown[] | undefined)?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: storedSubmission?._id,
    });

    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("stores the exact maximum-reading Worked source and schedules opaque learning evidence", async () => {
    const { ctx, maximumReadingWorked, rows, scheduled } = createHarness();
    const submissionData = makeDomainRangeWorkedSubmission(MAXIMUM_READING_WORKED_PHYSICAL_ID);

    expect(maximumReadingWorked).toMatchObject({
      stableActivityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });

    const args = {
      userId: LEARNER_ID,
      activityId: MAXIMUM_READING_WORKED_PHYSICAL_ID,
      idempotencyKey: "im3-maximum-reading-worked-producer",
      submissionData,
    };
    const first = await internalSubmitHandler(ctx, args);

    expect(first).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: MAXIMUM_READING_WORKED_PHYSICAL_ID,
      attemptOrdinal: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission).not.toHaveProperty("score");
    expect(storedSubmission).not.toHaveProperty("maxScore");
    expect(storedSubmission).not.toHaveProperty("gradedAt");
    expect(storedSubmission?.submissionData).toEqual(submissionData);
    expect(scheduled).toHaveLength(1);
    const scheduledCall = scheduled[0] as unknown[] | undefined;
    expect(getFunctionName(scheduledCall?.[1] as FunctionReference<any, any>)).toBe(
      "learningEvidence:submit",
    );
    expect(scheduledCall?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: storedSubmission?._id,
    });

    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("stores the exact symmetry Worked source and schedules opaque learning evidence", async () => {
    const { ctx, rows, scheduled, symmetryWorked } = createHarness();
    const submissionData = makeDomainRangeWorkedSubmission(SYMMETRY_WORKED_PHYSICAL_ID);

    expect(symmetryWorked).toMatchObject({
      stableActivityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });

    const args = {
      userId: LEARNER_ID,
      activityId: SYMMETRY_WORKED_PHYSICAL_ID,
      idempotencyKey: "im3-symmetry-worked-producer",
      submissionData,
    };
    const first = await internalSubmitHandler(ctx, args);

    expect(first).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: SYMMETRY_WORKED_PHYSICAL_ID,
      attemptOrdinal: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission).not.toHaveProperty("score");
    expect(storedSubmission).not.toHaveProperty("maxScore");
    expect(storedSubmission).not.toHaveProperty("gradedAt");
    expect(storedSubmission?.submissionData).toEqual(submissionData);
    expect(scheduled).toHaveLength(1);
    const scheduledCall = scheduled[0] as unknown[] | undefined;
    expect(getFunctionName(scheduledCall?.[1] as FunctionReference<any, any>)).toBe(
      "learningEvidence:submit",
    );
    expect(scheduledCall?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: storedSubmission?._id,
    });

    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("stores the exact compare-maximum Worked source and schedules opaque learning evidence", async () => {
    const { ctx, rows, scheduled, compareMaximumWorked } = createHarness();
    const submissionData = makeDomainRangeWorkedSubmission(COMPARE_MAXIMUM_WORKED_PHYSICAL_ID);

    expect(compareMaximumWorked).toMatchObject({
      stableActivityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      props: compareMaximumWorkedDocument.props,
      gradingConfig: compareMaximumWorkedDocument.gradingConfig,
    });

    const args = {
      userId: LEARNER_ID,
      activityId: COMPARE_MAXIMUM_WORKED_PHYSICAL_ID,
      idempotencyKey: "im3-compare-maximum-worked-producer",
      submissionData,
    };
    const first = await internalSubmitHandler(ctx, args);

    expect(first).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: COMPARE_MAXIMUM_WORKED_PHYSICAL_ID,
      attemptOrdinal: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission).not.toHaveProperty("score");
    expect(storedSubmission).not.toHaveProperty("maxScore");
    expect(storedSubmission).not.toHaveProperty("gradedAt");
    expect(storedSubmission?.submissionData).toEqual(submissionData);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toHaveLength(1);
    const scheduledCall = scheduled[0] as unknown[] | undefined;
    expect(getFunctionName(scheduledCall?.[1] as FunctionReference<any, any>)).toBe(
      "learningEvidence:submit",
    );
    expect(scheduledCall?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: storedSubmission?._id,
    });

    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  type SymmetryWorkedActivityMutator = (activity: Record<string, unknown>) => void;
  const symmetryWorkedIdentityCorruptions: ReadonlyArray<
    readonly [string, SymmetryWorkedActivityMutator]
  > = [
    [
      "wrong stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_SYMMETRY_WORKED_ACTIVITY_ID}.lookalike`;
      },
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_SYMMETRY_NODE}.lookalike`;
      },
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "fill-in-the-blank";
      },
    ],
    [
      "wrong learningEvidenceMode",
      (activity) => {
        activity.learningEvidenceMode = "guided_practice";
      },
    ],
    [
      "true SRS eligibility",
      (activity) => {
        activity.srsEligible = true;
      },
    ],
  ];

  it.each(symmetryWorkedIdentityCorruptions)(
    "rejects a symmetry Worked source with %s stored identity corruption",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled, queryCalls, symmetryWorked } = createHarness();
      corrupt(symmetryWorked as unknown as Record<string, unknown>);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: SYMMETRY_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-symmetry-worked-corrupt-${_label}`,
          submissionData: makeDomainRangeWorkedSubmission(SYMMETRY_WORKED_PHYSICAL_ID),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  type SymmetryWorkedEnvelopeMutator = (submission: Record<string, unknown>) => void;
  const symmetryWorkedEnvelopeCorruptions: ReadonlyArray<
    readonly [string, SymmetryWorkedEnvelopeMutator]
  > = [
    [
      "wrong contractVersion",
      (submission) => {
        submission.contractVersion = "practice.v0";
      },
    ],
    [
      "wrong mode",
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      (submission) => {
        submission.status = "graded";
      },
    ],
    [
      "non-empty answers",
      (submission) => {
        submission.answers = { observation: "visible" };
      },
    ],
    [
      "non-empty parts",
      (submission) => {
        submission.parts = [{ partId: "placed_points", rawAnswer: [] }];
      },
    ],
    [
      "attemptNumber zero",
      (submission) => {
        submission.attemptNumber = 0;
      },
    ],
    [
      "invalid submittedAt",
      (submission) => {
        submission.submittedAt = "not-an-iso-timestamp";
      },
    ],
    [
      "unexpected top-level field",
      (submission) => {
        submission.unexpected = true;
      },
    ],
    [
      "mismatched physical activity ID",
      (submission) => {
        submission.activityId = `${SYMMETRY_WORKED_PHYSICAL_ID}-other`;
      },
    ],
  ];

  it.each(symmetryWorkedEnvelopeCorruptions)(
    "rejects a symmetry Worked source with %s envelope corruption",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled, queryCalls } = createHarness();
      const submissionData = makeDomainRangeWorkedSubmission(
        SYMMETRY_WORKED_PHYSICAL_ID,
      ) as unknown as Record<string, unknown>;
      corrupt(submissionData);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: SYMMETRY_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-symmetry-worked-envelope-${_label}`,
          submissionData: submissionData as unknown as SubmissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  type MaximumReadingWorkedActivityMutator = (activity: Record<string, unknown>) => void;
  const maximumReadingWorkedIdentityCorruptions: ReadonlyArray<
    readonly [string, MaximumReadingWorkedActivityMutator]
  > = [
    [
      "wrong stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID}.lookalike`;
      },
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_MAXIMUM_READING_NODE}.lookalike`;
      },
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "fill-in-the-blank";
      },
    ],
    [
      "wrong learningEvidenceMode",
      (activity) => {
        activity.learningEvidenceMode = "guided_practice";
      },
    ],
    [
      "true SRS eligibility",
      (activity) => {
        activity.srsEligible = true;
      },
    ],
  ];

  it.each(maximumReadingWorkedIdentityCorruptions)(
    "rejects a maximum-reading Worked source with %s stored identity corruption",
    async (_label, corrupt) => {
      const { ctx, maximumReadingWorked, rows, scheduled, queryCalls } = createHarness();
      corrupt(maximumReadingWorked as unknown as Record<string, unknown>);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: MAXIMUM_READING_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-maximum-reading-worked-corrupt-${_label}`,
          submissionData: makeDomainRangeWorkedSubmission(MAXIMUM_READING_WORKED_PHYSICAL_ID),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  type MaximumReadingWorkedEnvelopeMutator = (submission: Record<string, unknown>) => void;
  const maximumReadingWorkedEnvelopeCorruptions: ReadonlyArray<
    readonly [string, MaximumReadingWorkedEnvelopeMutator]
  > = [
    [
      "wrong contractVersion",
      (submission) => {
        submission.contractVersion = "practice.v0";
      },
    ],
    [
      "wrong mode",
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      (submission) => {
        submission.status = "graded";
      },
    ],
    [
      "non-empty answers",
      (submission) => {
        submission.answers = { maximum_value: 5 };
      },
    ],
    [
      "non-empty parts",
      (submission) => {
        submission.parts = [{ partId: "maximum_value", rawAnswer: 5 }];
      },
    ],
    [
      "attemptNumber zero",
      (submission) => {
        submission.attemptNumber = 0;
      },
    ],
    [
      "invalid submittedAt string",
      (submission) => {
        submission.submittedAt = "not-an-iso-timestamp";
      },
    ],
    [
      "unexpected top-level envelope field",
      (submission) => {
        submission.unexpected = true;
      },
    ],
    [
      "mismatched physical activity ID",
      (submission) => {
        submission.activityId = `${MAXIMUM_READING_WORKED_PHYSICAL_ID}-other`;
      },
    ],
  ];

  it.each(maximumReadingWorkedEnvelopeCorruptions)(
    "rejects a maximum-reading Worked source with %s envelope corruption",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled, queryCalls } = createHarness();
      const submissionData = makeDomainRangeWorkedSubmission(
        MAXIMUM_READING_WORKED_PHYSICAL_ID,
      ) as unknown as Record<string, unknown>;
      corrupt(submissionData);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: MAXIMUM_READING_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-maximum-reading-worked-envelope-${_label}`,
          submissionData: submissionData as unknown as SubmissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  type DomainRangeWorkedActivityMutator = (activity: Record<string, unknown>) => void;
  const domainRangeWorkedIdentityCorruptions: ReadonlyArray<
    readonly [string, DomainRangeWorkedActivityMutator]
  > = [
    [
      "wrong stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_DOMAIN_RANGE_NODE}.worked_example.lookalike`;
      },
    ],
    [
      "wrong masteryNodeId",
      (activity) => {
        activity.masteryNodeId = IM3_PILOT_NODE;
      },
    ],
    [
      "wrong componentKey",
      (activity) => {
        activity.componentKey = "rate-of-change-calculator";
      },
    ],
    [
      "wrong learningEvidenceMode",
      (activity) => {
        activity.learningEvidenceMode = "guided_practice";
      },
    ],
    [
      "srsEligible true",
      (activity) => {
        activity.srsEligible = true;
      },
    ],
  ];

  it.each(domainRangeWorkedIdentityCorruptions)(
    "rejects a domain-range Worked source with %s stored identity corruption",
    async (_label, corrupt) => {
      const { ctx, domainRangeWorked, rows, scheduled } = createHarness();
      corrupt(domainRangeWorked as unknown as Record<string, unknown>);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: DOMAIN_RANGE_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-domain-range-worked-corrupt-${_label}`,
          submissionData: makeDomainRangeWorkedSubmission(DOMAIN_RANGE_WORKED_PHYSICAL_ID),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type DomainRangeWorkedEnvelopeMutator = (submission: Record<string, unknown>) => void;
  const domainRangeWorkedEnvelopeCorruptions: ReadonlyArray<
    readonly [string, DomainRangeWorkedEnvelopeMutator]
  > = [
    [
      "wrong contractVersion",
      (submission) => {
        submission.contractVersion = "practice.v0";
      },
    ],
    [
      "wrong mode",
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      (submission) => {
        submission.status = "graded";
      },
    ],
    [
      "non-empty answers",
      (submission) => {
        submission.answers = { observation: "visible" };
      },
    ],
    [
      "non-empty parts",
      (submission) => {
        submission.parts = [{ partId: "domain", rawAnswer: "all_real_numbers" }];
      },
    ],
    [
      "attemptNumber zero",
      (submission) => {
        submission.attemptNumber = 0;
      },
    ],
    [
      "invalid submittedAt string",
      (submission) => {
        submission.submittedAt = "not-an-iso-timestamp";
      },
    ],
    [
      "unexpected top-level envelope field",
      (submission) => {
        submission.unexpected = true;
      },
    ],
  ];

  it.each(domainRangeWorkedEnvelopeCorruptions)(
    "rejects a domain-range Worked source with %s envelope corruption",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled } = createHarness();
      const submissionData = makeDomainRangeWorkedSubmission(
        DOMAIN_RANGE_WORKED_PHYSICAL_ID,
      ) as unknown as Record<string, unknown>;
      corrupt(submissionData);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: DOMAIN_RANGE_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-domain-range-worked-envelope-${_label}`,
          submissionData: submissionData as unknown as SubmissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("stores the exact profit-model Worked source and schedules opaque learning evidence", async () => {
    const { ctx, profitModelWorked, rows, scheduled } = createHarness();
    const submissionData = makeProfitModelWorkedSubmission(PROFIT_MODEL_WORKED_PHYSICAL_ID);

    expect(profitModelWorked).toMatchObject({
      stableActivityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      componentKey: "fill-in-the-blank",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });

    const args = {
      userId: LEARNER_ID,
      activityId: PROFIT_MODEL_WORKED_PHYSICAL_ID,
      idempotencyKey: "im3-profit-model-worked-producer",
      submissionData,
    };
    const first = await internalSubmitHandler(ctx, args);

    expect(first).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: PROFIT_MODEL_WORKED_PHYSICAL_ID,
      attemptOrdinal: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission).not.toHaveProperty("score");
    expect(storedSubmission).not.toHaveProperty("maxScore");
    expect(storedSubmission).not.toHaveProperty("gradedAt");
    expect(storedSubmission?.submissionData).toEqual(submissionData);
    expect(scheduled).toHaveLength(1);
    expect((scheduled[0] as unknown[] | undefined)?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: storedSubmission?._id,
    });

    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("stores the exact maximum-profit Worked source and schedules opaque learning evidence", async () => {
    const { ctx, profitMaximumWorked, rows, scheduled } = createHarness();
    const submissionData = makeProfitMaximumWorkedSubmission(PROFIT_MAXIMUM_WORKED_PHYSICAL_ID);

    expect(profitMaximumWorked).toMatchObject({
      stableActivityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      componentKey: "fill-in-the-blank",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });

    const args = {
      userId: LEARNER_ID,
      activityId: PROFIT_MAXIMUM_WORKED_PHYSICAL_ID,
      idempotencyKey: "im3-profit-maximum-worked-producer",
      submissionData,
    };
    const first = await internalSubmitHandler(ctx, args);

    expect(first).toMatchObject({ score: 0, maxScore: 0 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: PROFIT_MAXIMUM_WORKED_PHYSICAL_ID,
      attemptOrdinal: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission).not.toHaveProperty("score");
    expect(storedSubmission).not.toHaveProperty("maxScore");
    expect(storedSubmission).not.toHaveProperty("gradedAt");
    expect(storedSubmission?.submissionData).toEqual(submissionData);
    expect(scheduled).toHaveLength(1);
    expect((scheduled[0] as unknown[] | undefined)?.[2]).toEqual({
      learnerId: LEARNER_ID,
      submissionId: storedSubmission?._id,
    });

    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("allows the exact eligible maximum-profit Guided activity and stores its server-owned 3/3 grade", async () => {
    const { ctx, profitMaximumGuided, rows, scheduled } = createHarness();
    const submissionData = makeProfitMaximumGuidedSubmission(PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID);

    expect(profitMaximumGuided).toMatchObject({
      stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      componentKey: "fill-in-the-blank",
      props: profitMaximumGuidedDocuments.activity.props,
      gradingConfig: profitMaximumGuidedDocuments.activity.gradingConfig,
      srsEligible: true,
    });

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID,
      idempotencyKey: "im3-approved-profit-maximum-guided-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 3, maxScore: 3 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID,
      score: 3,
      maxScore: 3,
      masteryContractVersion: "learning-evidence.v1",
    });
    const storedSubmission = storedRow?.submissionData as SubmissionData;
    expect(storedSubmission).toMatchObject({
      activityId: PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID,
      mode: "guided_practice",
      status: "graded",
      answers: submissionData.answers,
    });
    expect(storedSubmission.parts).toEqual([
      { partId: "optimalIncreases", rawAnswer: "2", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "optimalPrice", rawAnswer: "250", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "maximumProfit", rawAnswer: "62500", isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  type ProfitMaximumGuidedActivityMutator = (activity: Record<string, unknown>) => void;
  type ProfitMaximumGuidedSubmissionMutator = (submission: SubmissionData) => void;
  const profitMaximumGuidedGuards: ReadonlyArray<
    readonly [string, ProfitMaximumGuidedActivityMutator, ProfitMaximumGuidedSubmissionMutator]
  > = [
    [
      "lookalike stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_PROFIT_MAXIMUM_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "graphing-explorer";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "wrong mode",
      () => {},
      (submission) => {
        submission.mode = "independent_practice";
      },
    ],
    [
      "missing answer key",
      () => {},
      (submission) => {
        Reflect.deleteProperty(submission.answers, "maximumProfit");
      },
    ],
    [
      "duplicate part",
      () => {},
      (submission) => {
        submission.parts.push({ ...submission.parts[0]! });
      },
    ],
    [
      "wrapper-answer/raw-part mismatch",
      () => {},
      (submission) => {
        const answer = submission.answers.optimalIncreases as Record<string, unknown>;
        answer.answer = "__wrong-answer__";
      },
    ],
  ];

  it.each(profitMaximumGuidedGuards)(
    "rejects the exact maximum-profit Guided activity with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, profitMaximumGuided, rows, scheduled, queryCalls } = createHarness();
      const submissionData = makeProfitMaximumGuidedSubmission(
        PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID,
      ) as SubmissionData;
      corruptActivity(profitMaximumGuided as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MAXIMUM_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-profit-maximum-guided-${_label.replaceAll(" ", "-")}`,
          submissionData: submissionData as PublicPilotSubmission,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  it("allows the exact eligible maximum-profit Independent activity and stores its server-owned 3/3 grade", async () => {
    const { ctx, profitMaximumIndependent, rows, scheduled } = createHarness();
    const submissionData = makeProfitMaximumIndependentSubmission(
      PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
    );

    expect(profitMaximumIndependent).toMatchObject({
      stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      componentKey: "fill-in-the-blank",
      props: profitMaximumIndependentDocuments.activity.props,
      gradingConfig: profitMaximumIndependentDocuments.activity.gradingConfig,
      srsEligible: true,
    });

    const result = await publicCreateHandler(ctx, {
      userId: LEARNER_ID,
      activityId: PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      idempotencyKey: "im3-approved-profit-maximum-independent-create",
      submissionData,
    });

    expect(result).toMatchObject({ score: 3, maxScore: 3 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      activityId: PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      score: 3,
      maxScore: 3,
      masteryContractVersion: "learning-evidence.v1",
    });
    const storedSubmission = storedRow?.submissionData as SubmissionData;
    expect(storedSubmission).toMatchObject({
      activityId: PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      mode: "independent_practice",
      status: "graded",
      answers: submissionData.answers,
    });
    expect(storedSubmission.parts).toEqual([
      { partId: "optimalIncreases", rawAnswer: "6", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "optimalPrice", rawAnswer: "150", isCorrect: true, score: 1, maxScore: 1 },
      { partId: "maximumProfit", rawAnswer: "135000", isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  type ProfitMaximumIndependentActivityMutator = (activity: Record<string, unknown>) => void;
  type ProfitMaximumIndependentSubmissionMutator = (submission: SubmissionData) => void;
  const profitMaximumIndependentGuards: ReadonlyArray<
    readonly [
      string,
      ProfitMaximumIndependentActivityMutator,
      ProfitMaximumIndependentSubmissionMutator,
    ]
  > = [
    [
      "lookalike stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong node",
      (activity) => {
        activity.masteryNodeId = `${IM3_PROFIT_MAXIMUM_NODE}.lookalike`;
      },
      () => {},
    ],
    [
      "wrong component",
      (activity) => {
        activity.componentKey = "graphing-explorer";
      },
      () => {},
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
      () => {},
    ],
    [
      "wrong mode",
      () => {},
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "missing answer key",
      () => {},
      (submission) => {
        Reflect.deleteProperty(submission.answers, "maximumProfit");
      },
    ],
    [
      "duplicate part",
      () => {},
      (submission) => {
        submission.parts.push({ ...submission.parts[0]! });
      },
    ],
    [
      "wrapper-answer/raw-part mismatch",
      () => {},
      (submission) => {
        const answer = submission.answers.optimalIncreases as Record<string, unknown>;
        answer.answer = "__wrong-answer__";
      },
    ],
  ];

  it.each(profitMaximumIndependentGuards)(
    "rejects the exact maximum-profit Independent activity with %s before public persistence",
    async (_label, corruptActivity, corruptSubmission) => {
      const { ctx, profitMaximumIndependent, rows, scheduled, queryCalls } = createHarness();
      const submissionData = makeProfitMaximumIndependentSubmission(
        PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      ) as SubmissionData;
      corruptActivity(profitMaximumIndependent as unknown as Record<string, unknown>);
      corruptSubmission(submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-profit-maximum-independent-${_label.replaceAll(" ", "-")}`,
          submissionData: submissionData as PublicPilotSubmission,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  type ProfitMaximumWorkedActivityMutator = (activity: Record<string, unknown>) => void;
  const profitMaximumWorkedIdentityCorruptions: ReadonlyArray<
    readonly [string, ProfitMaximumWorkedActivityMutator]
  > = [
    [
      "wrong stable ID",
      (activity) => {
        activity.stableActivityId = IM3_PROFIT_MAXIMUM_NODE + ".worked_example.lookalike";
      },
    ],
    [
      "wrong masteryNodeId",
      (activity) => {
        activity.masteryNodeId = IM3_PILOT_NODE;
      },
    ],
    [
      "wrong componentKey",
      (activity) => {
        activity.componentKey = "graphing-explorer";
      },
    ],
    [
      "wrong learningEvidenceMode",
      (activity) => {
        activity.learningEvidenceMode = "guided_practice";
      },
    ],
    [
      "srsEligible true",
      (activity) => {
        activity.srsEligible = true;
      },
    ],
  ];

  it.each(profitMaximumWorkedIdentityCorruptions)(
    "rejects a maximum-profit Worked source with %s stored identity corruption",
    async (_label, corrupt) => {
      const { ctx, profitMaximumWorked, rows, scheduled, queryCalls } = createHarness();
      corrupt(profitMaximumWorked as unknown as Record<string, unknown>);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MAXIMUM_WORKED_PHYSICAL_ID,
          idempotencyKey: "im3-profit-maximum-worked-corrupt-" + _label,
          submissionData: makeProfitMaximumWorkedSubmission(PROFIT_MAXIMUM_WORKED_PHYSICAL_ID),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  type ProfitMaximumWorkedEnvelopeMutator = (submission: Record<string, unknown>) => void;
  const profitMaximumWorkedEnvelopeCorruptions: ReadonlyArray<
    readonly [string, ProfitMaximumWorkedEnvelopeMutator]
  > = [
    [
      "wrong contractVersion",
      (submission) => {
        submission.contractVersion = "practice.v0";
      },
    ],
    [
      "wrong mode",
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      (submission) => {
        submission.status = "graded";
      },
    ],
    [
      "non-empty answers",
      (submission) => {
        submission.answers = { observation: "visible" };
      },
    ],
    [
      "non-empty parts",
      (submission) => {
        submission.parts = [{ partId: "optimalIncreases", rawAnswer: "5" }];
      },
    ],
    [
      "attemptNumber zero",
      (submission) => {
        submission.attemptNumber = 0;
      },
    ],
    [
      "invalid submittedAt string",
      (submission) => {
        submission.submittedAt = "not-an-iso-timestamp";
      },
    ],
    [
      "unexpected top-level envelope field",
      (submission) => {
        submission.unexpected = true;
      },
    ],
    [
      "mismatched physical activity ID",
      (submission) => {
        submission.activityId = PROFIT_MAXIMUM_WORKED_PHYSICAL_ID + "-other";
      },
    ],
  ];

  it.each(profitMaximumWorkedEnvelopeCorruptions)(
    "rejects a maximum-profit Worked source with %s envelope corruption",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled, queryCalls } = createHarness();
      const submissionData = makeProfitMaximumWorkedSubmission(
        PROFIT_MAXIMUM_WORKED_PHYSICAL_ID,
      ) as unknown as Record<string, unknown>;
      corrupt(submissionData);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MAXIMUM_WORKED_PHYSICAL_ID,
          idempotencyKey: "im3-profit-maximum-worked-envelope-" + _label,
          submissionData: submissionData as unknown as SubmissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
      expect(queryCalls).toEqual([]);
    },
  );

  type ProfitModelWorkedActivityMutator = (activity: Record<string, unknown>) => void;
  const profitModelWorkedIdentityCorruptions: ReadonlyArray<
    readonly [string, ProfitModelWorkedActivityMutator]
  > = [
    [
      "wrong stable ID",
      (activity) => {
        activity.stableActivityId = `${IM3_PROFIT_MODEL_NODE}.worked_example.lookalike`;
      },
    ],
    [
      "wrong masteryNodeId",
      (activity) => {
        activity.masteryNodeId = IM3_PILOT_NODE;
      },
    ],
    [
      "wrong componentKey",
      (activity) => {
        activity.componentKey = "graphing-explorer";
      },
    ],
    [
      "wrong learningEvidenceMode",
      (activity) => {
        activity.learningEvidenceMode = "guided_practice";
      },
    ],
    [
      "srsEligible true",
      (activity) => {
        activity.srsEligible = true;
      },
    ],
  ];

  it.each(profitModelWorkedIdentityCorruptions)(
    "rejects a profit-model Worked source with %s stored identity corruption",
    async (_label, corrupt) => {
      const { ctx, profitModelWorked, rows, scheduled } = createHarness();
      corrupt(profitModelWorked as unknown as Record<string, unknown>);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MODEL_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-profit-model-worked-corrupt-${_label}`,
          submissionData: makeProfitModelWorkedSubmission(PROFIT_MODEL_WORKED_PHYSICAL_ID),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type ProfitModelWorkedEnvelopeMutator = (submission: Record<string, unknown>) => void;
  const profitModelWorkedEnvelopeCorruptions: ReadonlyArray<
    readonly [string, ProfitModelWorkedEnvelopeMutator]
  > = [
    [
      "wrong contractVersion",
      (submission) => {
        submission.contractVersion = "practice.v0";
      },
    ],
    [
      "wrong mode",
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      (submission) => {
        submission.status = "graded";
      },
    ],
    [
      "non-empty answers",
      (submission) => {
        submission.answers = { observation: "visible" };
      },
    ],
    [
      "non-empty parts",
      (submission) => {
        submission.parts = [{ partId: "priceBase", rawAnswer: "270" }];
      },
    ],
    [
      "attemptNumber zero",
      (submission) => {
        submission.attemptNumber = 0;
      },
    ],
    [
      "invalid submittedAt string",
      (submission) => {
        submission.submittedAt = "not-an-iso-timestamp";
      },
    ],
    [
      "unexpected top-level envelope field",
      (submission) => {
        submission.unexpected = true;
      },
    ],
    [
      "mismatched physical activity ID",
      (submission) => {
        submission.activityId = `${PROFIT_MODEL_WORKED_PHYSICAL_ID}-other`;
      },
    ],
  ];

  it.each(profitModelWorkedEnvelopeCorruptions)(
    "rejects a profit-model Worked source with %s envelope corruption",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled } = createHarness();
      const submissionData = makeProfitModelWorkedSubmission(
        PROFIT_MODEL_WORKED_PHYSICAL_ID,
      ) as unknown as Record<string, unknown>;
      corrupt(submissionData);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: PROFIT_MODEL_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-profit-model-worked-envelope-${_label}`,
          submissionData: submissionData as unknown as SubmissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type EquationRateWorkedActivityMutator = (activity: Record<string, unknown>) => void;
  const equationRateWorkedIdentityCorruptions: ReadonlyArray<
    readonly [string, EquationRateWorkedActivityMutator]
  > = [
    [
      "wrong stableActivityId",
      (activity) => {
        activity.stableActivityId = `${EQUATION_RATE_NODE}.guided_practice`;
      },
    ],
    [
      "wrong masteryNodeId",
      (activity) => {
        activity.masteryNodeId = IM3_PILOT_NODE;
      },
    ],
    [
      "wrong componentKey",
      (activity) => {
        activity.componentKey = "graphing-explorer";
      },
    ],
    [
      "wrong learningEvidenceMode",
      (activity) => {
        activity.learningEvidenceMode = "guided_practice";
      },
    ],
    [
      "srsEligible true",
      (activity) => {
        activity.srsEligible = true;
      },
    ],
  ];

  it.each(equationRateWorkedIdentityCorruptions)(
    "rejects an equation-rate Worked source with %s stored identity corruption",
    async (_label, corrupt) => {
      const { ctx, equationRateWorked, rows, scheduled } = createHarness();
      corrupt(equationRateWorked as unknown as Record<string, unknown>);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: EQUATION_RATE_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-equation-rate-worked-corrupt-${_label}`,
          submissionData: makeEquationRateWorkedSubmission(EQUATION_RATE_WORKED_PHYSICAL_ID),
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type EquationRateWorkedEnvelopeMutator = (submission: Record<string, unknown>) => void;
  const equationRateWorkedEnvelopeCorruptions: ReadonlyArray<
    readonly [string, EquationRateWorkedEnvelopeMutator]
  > = [
    [
      "wrong contractVersion",
      (submission) => {
        submission.contractVersion = "practice.v0";
      },
    ],
    [
      "wrong mode",
      (submission) => {
        submission.mode = "guided_practice";
      },
    ],
    [
      "wrong status",
      (submission) => {
        submission.status = "graded";
      },
    ],
    [
      "non-empty answers",
      (submission) => {
        submission.answers = { fA: -25 };
      },
    ],
    [
      "non-empty parts",
      (submission) => {
        submission.parts = [{ partId: "f_a", rawAnswer: -25 }];
      },
    ],
    [
      "attemptNumber zero",
      (submission) => {
        submission.attemptNumber = 0;
      },
    ],
    [
      "invalid submittedAt string",
      (submission) => {
        submission.submittedAt = "not-an-iso-timestamp";
      },
    ],
    [
      "unexpected top-level envelope field",
      (submission) => {
        submission.unexpected = true;
      },
    ],
  ];

  it.each(equationRateWorkedEnvelopeCorruptions)(
    "rejects an equation-rate Worked source with %s envelope corruption",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled } = createHarness();
      const submissionData = makeEquationRateWorkedSubmission(
        EQUATION_RATE_WORKED_PHYSICAL_ID,
      ) as unknown as Record<string, unknown>;
      corrupt(submissionData);

      await expect(
        internalSubmitHandler(ctx, {
          userId: LEARNER_ID,
          activityId: EQUATION_RATE_WORKED_PHYSICAL_ID,
          idempotencyKey: `im3-equation-rate-worked-envelope-${_label}`,
          submissionData: submissionData as unknown as SubmissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("rejects the exact mastery pilot from the generic submit path before writes or effects", async () => {
    const { ctx, rows, scheduled } = createHarness();

    await expect(
      internalSubmitHandler(ctx, {
        userId: LEARNER_ID,
        activityId: PILOT_ACTIVITY_ID,
        idempotencyKey: "im3-rejected-generic-pilot",
        submissionData: makePilotSubmission(),
      }),
    ).rejects.toThrow();

    expect(rows.activity_submissions).toEqual([]);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("authorizes the activity before it can replay an existing teacher-source submission with the same public key", async () => {
    const { ctx, rows, scheduled } = createHarness();
    const idempotencyKey = "im3-existing-teacher-source-public-key";
    const submissionData = makeTeacherLedSourceSubmission("independent_practice");

    await internalSubmitHandler(ctx, {
      userId: LEARNER_ID,
      activityId: TEACHER_SOURCE_ACTIVITY_ID,
      idempotencyKey,
      submissionData,
    });
    const existingRows = [...rows.activity_submissions];
    const existingCompetencies = [...rows.student_competency];
    const existingSchedules = [...scheduled];

    await expect(
      publicCreateHandler(ctx, {
        userId: LEARNER_ID,
        activityId: TEACHER_SOURCE_ACTIVITY_ID,
        idempotencyKey,
        submissionData,
      }),
    ).rejects.toThrow(/Invalid selected IM3 Worked acknowledgement/i);

    expect(rows.activity_submissions).toEqual(existingRows);
    expect(rows.student_competency).toEqual(existingCompetencies);
    expect(scheduled).toEqual(existingSchedules);
  });

  it("replays the same daily source request without another row or evidence schedule", async () => {
    const { ctx, rows, scheduled } = createHarness();
    const args = {
      userId: LEARNER_ID,
      activityId: TEACHER_SOURCE_ACTIVITY_ID,
      idempotencyKey: "im3-teacher-source-replay",
      submissionData: makeTeacherLedSourceSubmission(),
    };

    const first = await internalSubmitHandler(ctx, args);
    const replay = await internalSubmitHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("rejects one daily source key reused for different raw answers", async () => {
    const { ctx, rows, scheduled } = createHarness();
    const idempotencyKey = "im3-teacher-source-conflict";

    await internalSubmitHandler(ctx, {
      userId: LEARNER_ID,
      activityId: TEACHER_SOURCE_ACTIVITY_ID,
      idempotencyKey,
      submissionData: makeTeacherLedSourceSubmission(),
    });
    const conflicting = makeTeacherLedSourceSubmission();
    conflicting.answers = { observation: "The parabola opens downward." };
    conflicting.parts = [
      {
        partId: "observation",
        rawAnswer: "The parabola opens downward.",
      },
    ];

    await expect(
      internalSubmitHandler(ctx, {
        userId: LEARNER_ID,
        activityId: TEACHER_SOURCE_ACTIVITY_ID,
        idempotencyKey,
        submissionData: conflicting,
      }),
    ).rejects.toThrow(/^idempotency_conflict$/);

    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it("fails the daily source mutation when evidence scheduling fails", async () => {
    const { ctx } = createHarness({ schedulerError: new Error("scheduler unavailable") });

    await expect(
      internalSubmitHandler(ctx, {
        userId: LEARNER_ID,
        activityId: TEACHER_SOURCE_ACTIVITY_ID,
        idempotencyKey: "im3-teacher-source-scheduler-failure",
        submissionData: makeTeacherLedSourceSubmission(),
      }),
    ).rejects.toThrow("scheduler unavailable");
  });

  it("grades and schedules the generated profit model once at the generic submission boundary", async () => {
    const { ctx, rows, scheduled } = createHarness();
    const documents = buildIm3ProfitModelIndependentSeedDocuments(
      PROFIT_MODEL_ACTIVITY_ID as never,
      123,
    );
    const blanks = documents.activity.props.blanks;
    const answers = Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer]));
    const submissionData = buildPracticeSubmissionEnvelope({
      activityId: PROFIT_MODEL_ACTIVITY_ID,
      mode: "independent_practice",
      answers,
    });
    const input = {
      userId: LEARNER_ID,
      activityId: PROFIT_MODEL_ACTIVITY_ID,
      idempotencyKey: "im3-profit-model-srs-boundary",
      submissionData,
    };

    expect(documents.activity.srsEligible).toBe(true);
    const first = await internalSubmitHandler(ctx, input);

    expect(first).toMatchObject({ score: blanks.length, maxScore: blanks.length });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: PROFIT_MODEL_ACTIVITY_ID,
      score: blanks.length,
      maxScore: blanks.length,
      submissionData: {
        activityId: PROFIT_MODEL_ACTIVITY_ID,
        mode: "independent_practice",
        status: "graded",
        parts: blanks.map((blank) => ({
          partId: blank.id,
          rawAnswer: blank.correctAnswer,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        })),
      },
    });

    expect(scheduled).toHaveLength(1);
    const scheduledCall = scheduled[0] as [
      number,
      unknown,
      {
        studentId: string;
        activityId: string;
        submission: Record<string, unknown>;
      },
    ];
    expect(scheduledCall[0]).toBe(0);
    expect(getFunctionName(scheduledCall[1] as FunctionReference<any, any>)).toBe(
      "srs/submissionSrs:processSubmissionSrs",
    );
    expect(scheduledCall[2]).toEqual({
      studentId: LEARNER_ID,
      activityId: PROFIT_MODEL_ACTIVITY_ID,
      submission: storedSubmission?.submissionData,
    });

    const replay = await internalSubmitHandler(ctx, input);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
  });

  it.each([
    [
      "Guided seed 0",
      SYMMETRY_GUIDED_PHYSICAL_ID,
      "guided_practice" as const,
      symmetryGuidedDocuments,
      IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
    ],
    [
      "Independent seed 1",
      SYMMETRY_INDEPENDENT_PHYSICAL_ID,
      "independent_practice" as const,
      symmetryIndependentDocuments,
      IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
    ],
  ] as const)(
    "allows the exact symmetry %s and stores its server-owned grade",
    async (_label, activityId, mode, expectedDocuments, stableActivityId) => {
      const { ctx, rows, scheduled, symmetryGuided, symmetryIndependent } = createHarness();
      const activity = mode === "guided_practice" ? symmetryGuided : symmetryIndependent;
      const generated = getGenerator("quadratic-graph-analysis").generate({
        nodeId: IM3_SYMMETRY_NODE,
        seed: mode === "guided_practice" ? 0 : 1,
        difficulty: 0.5,
      });
      const points = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
      const props = expectedDocuments.activity.props;
      const submissionData = buildPracticeSubmissionEnvelope({
        activityId,
        mode,
        submittedAt: "2026-08-19T10:00:00.000Z",
        answers: { placed_points: points },
        parts: [
          {
            partId: "placed_points",
            rawAnswer: points,
            isCorrect: false,
            score: 0,
            maxScore: 0,
          },
        ],
        artifact: {
          graphState: {
            equation: props.equation,
            vertex: props.vertex,
            yIntercept: props.yIntercept,
            placedPoints: points,
            domain: props.domain,
            range: props.range,
          },
        },
      });
      const args = {
        userId: LEARNER_ID,
        activityId,
        idempotencyKey: `im3-approved-symmetry-${mode}`,
        submissionData,
      };

      expect(activity).toMatchObject({
        _id: activityId,
        stableActivityId,
        masteryNodeId: IM3_SYMMETRY_NODE,
        componentKey: "graphing-explorer",
        props,
        gradingConfig: expectedDocuments.activity.gradingConfig,
        srsEligible: true,
      });
      expect(activity.stableActivityId).toBe(stableActivityId);

      const first = await publicCreateHandler(ctx, args);

      expect(first).toMatchObject({ score: 1, maxScore: 1 });
      expect(rows.activity_submissions).toHaveLength(1);
      const storedSubmission = rows.activity_submissions[0];
      expect(storedSubmission).toMatchObject({
        userId: LEARNER_ID,
        activityId,
        score: 1,
        maxScore: 1,
        masteryContractVersion: "learning-evidence.v1",
      });
      expect(storedSubmission?.submissionData).toMatchObject({
        activityId,
        mode,
        status: "graded",
        answers: { placed_points: points },
        parts: [
          {
            partId: "placed_points",
            rawAnswer: points,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
      });
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);

      const replay = await publicCreateHandler(ctx, args);

      expect(replay).toEqual(first);
      expect(rows.activity_submissions).toHaveLength(1);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  type SymmetryGuidedBoundaryMutator = (
    activity: Record<string, unknown>,
    submission: SubmissionData,
  ) => void;
  const symmetryGuidedBoundaryGuards: ReadonlyArray<
    readonly [string, SymmetryGuidedBoundaryMutator]
  > = [
    [
      "stable activity ID lookalike",
      (activity) => {
        activity.stableActivityId = `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}.lookalike`;
      },
    ],
    [
      "mastery node lookalike",
      (activity) => {
        activity.masteryNodeId = `${IM3_SYMMETRY_NODE}.lookalike`;
      },
    ],
    [
      "wrong component key",
      (activity) => {
        activity.componentKey = "fill-in-the-blank";
      },
    ],
    [
      "srsEligible false",
      (activity) => {
        activity.srsEligible = false;
      },
    ],
    [
      "independent mode for Guided identity",
      (_activity, submission) => {
        submission.mode = "independent_practice";
      },
    ],
    [
      "draft status",
      (_activity, submission) => {
        submission.status = "draft";
      },
    ],
  ];

  it.each(symmetryGuidedBoundaryGuards)(
    "rejects the exact symmetry Guided create with %s before writes",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled, symmetryGuided } = createHarness();
      const generated = getGenerator("quadratic-graph-analysis").generate({
        nodeId: IM3_SYMMETRY_NODE,
        seed: 0,
        difficulty: 0.5,
      });
      const points = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
      const props = symmetryGuidedDocuments.activity.props;
      const submissionData = buildPracticeSubmissionEnvelope({
        activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
        mode: "guided_practice",
        submittedAt: "2026-08-19T10:00:00.000Z",
        answers: { placed_points: points },
        parts: [
          {
            partId: "placed_points",
            rawAnswer: points,
            isCorrect: false,
            score: 0,
            maxScore: 0,
          },
        ],
        artifact: {
          graphState: {
            equation: props.equation,
            vertex: props.vertex,
            yIntercept: props.yIntercept,
            placedPoints: points,
            domain: props.domain,
            range: props.range,
          },
        },
      });
      corrupt(symmetryGuided as unknown as Record<string, unknown>, submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-symmetry-guided-${_label.replaceAll(" ", "-")}`,
          submissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("allows the exact compare-maximum Guided seed 0 and stores its server-owned grade", async () => {
    const { ctx, rows, scheduled, compareMaximumGuided } = createHarness();
    const generated = getGenerator("quadratic-graph-analysis").generate({
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const canonicalChoice = generated.expectedAnswer.greater_maximum;
    expect(canonicalChoice).toBe("second");
    const submissionData = buildPracticeSubmissionEnvelope({
      activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
      mode: "guided_practice",
      submittedAt: "2026-08-19T10:00:00.000Z",
      answers: { greater_maximum: canonicalChoice },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: canonicalChoice,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
      ],
    });
    const args = {
      userId: LEARNER_ID,
      activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
      idempotencyKey: "im3-approved-compare-maximum-guided-create",
      submissionData,
    };

    expect(compareMaximumGuided).toMatchObject({
      _id: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
      stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: "graphing-explorer",
      props: compareMaximumGuidedDocuments.activity.props,
      gradingConfig: compareMaximumGuidedDocuments.activity.gradingConfig,
      srsEligible: true,
    });

    const first = await publicCreateHandler(ctx, args);

    expect(first).toMatchObject({ score: 1, maxScore: 1 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
      score: 1,
      maxScore: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission?.submissionData).toMatchObject({
      activityId: COMPARE_MAXIMUM_GUIDED_PHYSICAL_ID,
      mode: "guided_practice",
      status: "graded",
      answers: { greater_maximum: canonicalChoice },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: canonicalChoice,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(Object.keys((storedSubmission?.submissionData as SubmissionData).answers)).toEqual([
      "greater_maximum",
    ]);
    expect((storedSubmission?.submissionData as SubmissionData).parts).toHaveLength(1);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);

    const replay = await publicCreateHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("allows the exact compare-maximum Independent seed 1 and stores its server-owned grade", async () => {
    const { ctx, rows, scheduled, compareMaximumIndependent } = createHarness();
    const generated = getGenerator("quadratic-graph-analysis").generate({
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      seed: 1,
      difficulty: 0.5,
    });
    const canonicalChoice = generated.expectedAnswer.greater_maximum;
    const submissionData = buildPracticeSubmissionEnvelope({
      activityId: COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      mode: "independent_practice",
      submittedAt: "2026-08-19T10:00:00.000Z",
      answers: { greater_maximum: canonicalChoice },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: canonicalChoice,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
      ],
    });
    const args = {
      userId: LEARNER_ID,
      activityId: COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      idempotencyKey: "im3-approved-compare-maximum-independent-create",
      submissionData,
    };

    expect(compareMaximumIndependent).toMatchObject({
      _id: COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: "graphing-explorer",
      props: compareMaximumIndependentDocuments.activity.props,
      gradingConfig: compareMaximumIndependentDocuments.activity.gradingConfig,
      srsEligible: true,
    });

    const first = await publicCreateHandler(ctx, args);

    expect(first).toMatchObject({ score: 1, maxScore: 1 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      userId: LEARNER_ID,
      activityId: COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      score: 1,
      maxScore: 1,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedSubmission?.submissionData).toMatchObject({
      activityId: COMPARE_MAXIMUM_INDEPENDENT_PHYSICAL_ID,
      mode: "independent_practice",
      status: "graded",
      answers: { greater_maximum: canonicalChoice },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: canonicalChoice,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(Object.keys((storedSubmission?.submissionData as SubmissionData).answers)).toEqual([
      "greater_maximum",
    ]);
    expect((storedSubmission?.submissionData as SubmissionData).parts).toHaveLength(1);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);

    const replay = await publicCreateHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  const symmetryGuidedEnvelopeGuards: ReadonlyArray<
    readonly [string, SymmetryGuidedBoundaryMutator]
  > = [
    [
      "missing placed_points answer key",
      (_activity, submission) => {
        const answers = { ...submission.answers };
        Reflect.deleteProperty(answers, "placed_points");
        submission.answers = answers;
      },
    ],
    [
      "extra answer key",
      (_activity, submission) => {
        submission.answers = { ...submission.answers, extra: "unexpected" };
      },
    ],
    [
      "missing placed_points part",
      (_activity, submission) => {
        submission.parts = [];
      },
    ],
    [
      "extra part",
      (_activity, submission) => {
        submission.parts = [...submission.parts, { partId: "extra", rawAnswer: "unexpected" }];
      },
    ],
    [
      "duplicate placed_points part",
      (_activity, submission) => {
        submission.parts = [...submission.parts, { ...submission.parts[0]! }];
      },
    ],
    [
      "wrong part ID",
      (_activity, submission) => {
        submission.parts = [{ ...submission.parts[0]!, partId: "wrong_part" }];
      },
    ],
    [
      "placed_points answer and raw part mismatch",
      (_activity, submission) => {
        const points = submission.answers.placed_points as Array<{ x: number; y: number }>;
        submission.parts = [
          {
            ...submission.parts[0]!,
            rawAnswer: points.map((point, index) =>
              index === 0 ? { ...point, y: point.y + 1 } : point,
            ),
          },
        ];
      },
    ],
  ];

  it.each(symmetryGuidedEnvelopeGuards)(
    "rejects the exact symmetry Guided envelope with %s before writes",
    async (_label, corrupt) => {
      const { ctx, rows, scheduled, symmetryGuided } = createHarness();
      const generated = getGenerator("quadratic-graph-analysis").generate({
        nodeId: IM3_SYMMETRY_NODE,
        seed: 0,
        difficulty: 0.5,
      });
      const points = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
      const props = symmetryGuidedDocuments.activity.props;
      const submissionData = buildPracticeSubmissionEnvelope({
        activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
        mode: "guided_practice",
        submittedAt: "2026-08-19T10:00:00.000Z",
        answers: { placed_points: points },
        parts: [
          {
            partId: "placed_points",
            rawAnswer: points,
            isCorrect: false,
            score: 0,
            maxScore: 0,
          },
        ],
        artifact: {
          graphState: {
            equation: props.equation,
            vertex: props.vertex,
            yIntercept: props.yIntercept,
            placedPoints: points,
            domain: props.domain,
            range: props.range,
          },
        },
      });
      corrupt(symmetryGuided as unknown as Record<string, unknown>, submissionData);

      await expect(
        publicCreateHandler(ctx, {
          userId: LEARNER_ID,
          activityId: SYMMETRY_GUIDED_PHYSICAL_ID,
          idempotencyKey: `im3-invalid-symmetry-guided-envelope-${_label.replaceAll(" ", "-")}`,
          submissionData,
        }),
      ).rejects.toThrow();

      expect(rows.activity_submissions).toEqual([]);
      expect(rows.student_competency).toEqual([]);
      expect(scheduled).toEqual([]);
    },
  );

  it("allows the exact one-real-solution Guided seed 45 and stores its server-owned 3/3 grade", async () => {
    const { ctx, rows, scheduled, oneRealSolutionGuided } = createHarness();
    const expectedActivity = buildIm3OneRealSolutionGuidedSeedDocument(0);
    expect(oneRealSolutionGuided).toEqual({
      _id: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
      ...expectedActivity,
    });
    expect(oneRealSolutionGuided).toMatchObject({
      _id: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
      stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      componentKey: "graphing-explorer",
      props: oneRealSolutionGuidedOutput.data.rendererProps,
      gradingConfig: expectedActivity.gradingConfig,
      srsEligible: true,
    });

    const submissionData = buildPracticeSubmissionEnvelope({
      activityId: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
      mode: "guided_practice",
      submittedAt: "2026-08-19T10:00:00.000Z",
      answers: {
        table_values: oneRealSolutionTableValues,
        placed_points: oneRealSolutionPlacedPoints,
        solution: oneRealSolutionAnswer,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: oneRealSolutionTableValues,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
        {
          partId: "placed_points",
          rawAnswer: oneRealSolutionPlacedPoints,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
        {
          partId: "solution",
          rawAnswer: oneRealSolutionAnswer,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
      ],
    });
    expect(submissionData.answers).toEqual({
      table_values: oneRealSolutionTableValues,
      placed_points: oneRealSolutionPlacedPoints,
      solution: oneRealSolutionAnswer,
    });
    expect(submissionData.parts).toEqual([
      {
        partId: "table_values",
        rawAnswer: oneRealSolutionTableValues,
        isCorrect: false,
        score: 0,
        maxScore: 0,
      },
      {
        partId: "placed_points",
        rawAnswer: oneRealSolutionPlacedPoints,
        isCorrect: false,
        score: 0,
        maxScore: 0,
      },
      {
        partId: "solution",
        rawAnswer: oneRealSolutionAnswer,
        isCorrect: false,
        score: 0,
        maxScore: 0,
      },
    ]);
    const args = {
      userId: LEARNER_ID,
      activityId: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
      idempotencyKey: "im3-approved-one-real-solution-guided-create",
      submissionData,
    };

    const first = await publicCreateHandler(ctx, args);

    expect(first).toMatchObject({ score: 3, maxScore: 3 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      userId: LEARNER_ID,
      activityId: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
      score: 3,
      maxScore: 3,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedRow?.submissionData).toMatchObject({
      activityId: ONE_REAL_SOLUTION_GUIDED_PHYSICAL_ID,
      mode: "guided_practice",
      status: "graded",
      answers: {
        table_values: oneRealSolutionTableValues,
        placed_points: oneRealSolutionPlacedPoints,
        solution: oneRealSolutionAnswer,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: oneRealSolutionTableValues,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: oneRealSolutionPlacedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "solution",
          rawAnswer: oneRealSolutionAnswer,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);

    const replay = await publicCreateHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });

  it("allows the exact one-real-solution Independent seed 0 and stores its server-owned 3/3 grade", async () => {
    const { ctx, rows, scheduled, oneRealSolutionIndependent } = createHarness();
    const expectedActivity = buildIm3OneRealSolutionIndependentSeedDocument(0);
    expect(oneRealSolutionIndependent).toEqual({
      _id: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
      ...expectedActivity,
    });
    expect(oneRealSolutionIndependent).toMatchObject({
      _id: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
      stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      componentKey: "graphing-explorer",
      props: oneRealSolutionIndependentOutput.data.rendererProps,
      gradingConfig: expectedActivity.gradingConfig,
      srsEligible: true,
    });

    const submissionData = buildPracticeSubmissionEnvelope({
      activityId: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
      mode: "independent_practice",
      submittedAt: "2026-08-19T10:00:00.000Z",
      answers: {
        table_values: oneRealSolutionIndependentTableValues,
        placed_points: oneRealSolutionIndependentPlacedPoints,
        solution: oneRealSolutionIndependentAnswer,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: oneRealSolutionIndependentTableValues,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
        {
          partId: "placed_points",
          rawAnswer: oneRealSolutionIndependentPlacedPoints,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
        {
          partId: "solution",
          rawAnswer: oneRealSolutionIndependentAnswer,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        },
      ],
    });
    expect(submissionData.answers).toEqual({
      table_values: oneRealSolutionIndependentTableValues,
      placed_points: oneRealSolutionIndependentPlacedPoints,
      solution: oneRealSolutionIndependentAnswer,
    });
    expect(submissionData.parts).toEqual([
      {
        partId: "table_values",
        rawAnswer: oneRealSolutionIndependentTableValues,
        isCorrect: false,
        score: 0,
        maxScore: 0,
      },
      {
        partId: "placed_points",
        rawAnswer: oneRealSolutionIndependentPlacedPoints,
        isCorrect: false,
        score: 0,
        maxScore: 0,
      },
      {
        partId: "solution",
        rawAnswer: oneRealSolutionIndependentAnswer,
        isCorrect: false,
        score: 0,
        maxScore: 0,
      },
    ]);
    const args = {
      userId: LEARNER_ID,
      activityId: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
      idempotencyKey: "im3-approved-one-real-solution-independent-create",
      submissionData,
    };

    const first = await publicCreateHandler(ctx, args);

    expect(first).toMatchObject({ score: 3, maxScore: 3 });
    expect(rows.activity_submissions).toHaveLength(1);
    const storedRow = rows.activity_submissions[0];
    expect(storedRow).toMatchObject({
      userId: LEARNER_ID,
      activityId: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
      score: 3,
      maxScore: 3,
      masteryContractVersion: "learning-evidence.v1",
    });
    expect(storedRow?.submissionData).toMatchObject({
      activityId: ONE_REAL_SOLUTION_INDEPENDENT_PHYSICAL_ID,
      mode: "independent_practice",
      status: "graded",
      answers: {
        table_values: oneRealSolutionIndependentTableValues,
        placed_points: oneRealSolutionIndependentPlacedPoints,
        solution: oneRealSolutionIndependentAnswer,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: oneRealSolutionIndependentTableValues,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: oneRealSolutionIndependentPlacedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "solution",
          rawAnswer: oneRealSolutionIndependentAnswer,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);

    const replay = await publicCreateHandler(ctx, args);

    expect(replay).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.student_competency).toEqual([]);
    expect(scheduled).toEqual([]);
  });
});
