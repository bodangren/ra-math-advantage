import { describe, expect, it, vi } from "vitest";

import type { MutationCtx } from "@/convex/_generated/server";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  createIm3ServerOwnedSubmissionHandler,
  submitIm3PublishedEvidenceHandler,
} from "@/convex/learningEvidence";
import {
  buildIm3DomainRangeGuidedSeed2Documents,
  buildIm3DomainRangeIndependentSeed2Documents,
  buildIm3MaximumReadingGuidedSeedDocuments,
  buildIm3MaximumReadingIndependentSeedDocuments,
  buildIm3MaximumReadingWorkedSeedDocument,
  buildIm3CompareMaximumWorkedSeedDocument,
  buildIm3CompareMaximumGuidedSeedDocuments,
  buildIm3CompareMaximumIndependentSeedDocuments,
  buildIm3SymmetryGuidedSeedDocuments,
  buildIm3SymmetryIndependentSeedDocuments,
  buildIm3SymmetryWorkedSeedDocument,
  buildIm3GraphGuidedSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  buildIm3ProfitModelIndependentSeedDocuments,
  buildIm3ProfitModelGuidedSeedDocuments,
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3ProfitMaximumIndependentSeedDocuments,
  buildIm3ProfitMaximumWorkedSeedDocument,
  buildIm3ProfitModelWorkedSeedDocument,
} from "@/convex/seed/seed_lesson_1_1";
import {
  buildIm3OneRealSolutionGuidedSeedDocument,
  buildIm3OneRealSolutionIndependentSeedDocument,
  buildIm3OneRealSolutionWorkedSeedDocument,
  buildIm3TwoRealSolutionsGuidedSeedDocument,
  buildIm3TwoRealSolutionsIndependentSeedDocument,
  buildIm3TwoRealSolutionsWorkedSeedDocument,
} from "@/convex/seed/seed_lesson_1_2";
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
  IM3_PILOT_VARIANT_KEY,
} from "@/lib/practice/learning-evidence-pilot";

const LEARNER_ID = "im3-production-factory-learner";
const SUBMISSION_ID = "im3-production-factory-submission";
const ACTIVITY_ID = "im3-production-factory-activity";
const NODE_ID = "math.im3.skill.1.1.graph-quadratic-functions";
const STABLE_ACTIVITY_ID = `${NODE_ID}.independent_practice`;
const GUIDED_SUBMISSION_ID = "im3-production-factory-guided-submission";
const GUIDED_ACTIVITY_ID = "im3-production-factory-guided-activity";
const GUIDED_STABLE_ACTIVITY_ID = IM3_GUIDED_PRACTICE_ACTIVITY_ID;
const GRAPH_GUIDED_SEED_2_SUBMISSION_ID = "im3-production-factory-graph-guided-seed-2-submission";
const GRAPH_GUIDED_SEED_2_ACTIVITY_ID = "im3-production-factory-graph-guided-seed-2-activity";
const GRAPH_GUIDED_SEED_2_SUBMITTED_AT = "2026-08-19T13:00:00.000Z";
const GRAPH_GUIDED_SEED_2_GRADED_AT = "2026-08-19T13:05:00.000Z";
const GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID =
  "im3-production-factory-graph-independent-seed-2-submission";
const GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID =
  "im3-production-factory-graph-independent-seed-2-activity";
const GRAPH_INDEPENDENT_SEED_2_SUBMITTED_AT = "2026-08-19T14:00:00.000Z";
const GRAPH_INDEPENDENT_SEED_2_GRADED_AT = "2026-08-19T14:05:00.000Z";
const EQUATION_WORKED_SUBMISSION_ID = "im3-production-factory-equation-worked-submission";
const EQUATION_WORKED_ACTIVITY_ID = "im3-production-factory-equation-worked-activity";
const EQUATION_WORKED_STABLE_ACTIVITY_ID = IM3_EQUATION_RATE_WORKED_ACTIVITY_ID;
const EQUATION_GUIDED_SUBMISSION_ID = "im3-production-factory-equation-guided-submission";
const EQUATION_GUIDED_ACTIVITY_ID = "im3-production-factory-equation-guided-activity";
const EQUATION_GUIDED_STABLE_ACTIVITY_ID = IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID;
const EQUATION_INDEPENDENT_SUBMISSION_ID = "im3-production-factory-equation-independent-submission";
const EQUATION_INDEPENDENT_ACTIVITY_ID = "im3-production-factory-equation-independent-activity";
const EQUATION_INDEPENDENT_STABLE_ACTIVITY_ID = IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID;
const DOMAIN_RANGE_WORKED_SUBMISSION_ID = "im3-production-factory-domain-range-worked-submission";
const DOMAIN_RANGE_WORKED_ACTIVITY_ID = "im3-production-factory-domain-range-worked-activity";
const DOMAIN_RANGE_WORKED_STABLE_ACTIVITY_ID = IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID;
const DOMAIN_RANGE_GUIDED_SUBMISSION_ID = "im3-production-factory-domain-range-guided-submission";
const DOMAIN_RANGE_GUIDED_ACTIVITY_ID = "im3-production-factory-domain-range-guided-activity";
const DOMAIN_RANGE_GUIDED_STABLE_ACTIVITY_ID = IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID;
const DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID =
  "im3-production-factory-domain-range-guided-seed-2-submission";
const DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID =
  "im3-production-factory-domain-range-guided-seed-2-activity";
const DOMAIN_RANGE_GUIDED_SEED_2_SUBMITTED_AT = "2026-08-19T12:30:00.000Z";
const DOMAIN_RANGE_GUIDED_SEED_2_GRADED_AT = "2026-08-19T12:35:00.000Z";
const DOMAIN_RANGE_INDEPENDENT_SUBMISSION_ID =
  "im3-production-factory-domain-range-independent-submission";
const DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID =
  "im3-production-factory-domain-range-independent-activity";
const DOMAIN_RANGE_INDEPENDENT_STABLE_ACTIVITY_ID = IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID;
const DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID =
  "im3-production-factory-domain-range-independent-seed-2-submission";
const DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID =
  "im3-production-factory-domain-range-independent-seed-2-activity";
const DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMITTED_AT = "2026-08-19T12:45:00.000Z";
const DOMAIN_RANGE_INDEPENDENT_SEED_2_GRADED_AT = "2026-08-19T12:50:00.000Z";
const PROFIT_MODEL_WORKED_SUBMISSION_ID = "im3-production-factory-profit-model-worked-submission";
const PROFIT_MODEL_WORKED_ACTIVITY_ID = "im3-production-factory-profit-model-worked-activity";
const PROFIT_MODEL_WORKED_STABLE_ACTIVITY_ID = IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID;
const PROFIT_MODEL_GUIDED_SUBMISSION_ID = "im3-production-factory-profit-model-guided-submission";
const PROFIT_MODEL_GUIDED_ACTIVITY_ID = "im3-production-factory-profit-model-guided-activity";
const PROFIT_MODEL_GUIDED_STABLE_ACTIVITY_ID = IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID;
const PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID =
  "im3-production-factory-profit-model-independent-submission";
const PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID =
  "im3-production-factory-profit-model-independent-activity";
const PROFIT_MODEL_INDEPENDENT_STABLE_ACTIVITY_ID = IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID;
const PROFIT_MAXIMUM_WORKED_SUBMISSION_ID =
  "im3-production-factory-profit-maximum-worked-submission";
const PROFIT_MAXIMUM_WORKED_ACTIVITY_ID = "im3-production-factory-profit-maximum-worked-activity";
const PROFIT_MAXIMUM_WORKED_STABLE_ACTIVITY_ID = IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID;
const PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID =
  "im3-production-factory-profit-maximum-guided-submission";
const PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID = "im3-production-factory-profit-maximum-guided-activity";
const PROFIT_MAXIMUM_GUIDED_STABLE_ACTIVITY_ID = IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID;
const PROFIT_MAXIMUM_GUIDED_SUBMITTED_AT = "2026-08-19T10:00:00.000Z";
const PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID =
  "im3-production-factory-profit-maximum-independent-submission";
const PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID =
  "im3-production-factory-profit-maximum-independent-activity";
const PROFIT_MAXIMUM_INDEPENDENT_STABLE_ACTIVITY_ID = IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID;
const PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT = "2026-08-19T10:30:00.000Z";
const PROFIT_MAXIMUM_INDEPENDENT_GRADED_AT = "2026-08-19T10:35:00.000Z";
const CLIENT_SUBMITTED_AT = "2026-08-19T11:00:00.000Z";
const SERVER_GRADED_AT = "2026-08-19T10:05:00.000Z";
const EQUATION_CLIENT_SUBMITTED_AT = "2026-08-19T11:30:00.000Z";
const EQUATION_WORKED_SUBMITTED_AT = "2026-08-19T12:00:00.000Z";
const DOMAIN_RANGE_WORKED_SUBMITTED_AT = "2026-08-19T12:30:00.000Z";
const MAXIMUM_READING_WORKED_SUBMISSION_ID =
  "im3-production-factory-maximum-reading-worked-submission";
const MAXIMUM_READING_WORKED_ACTIVITY_ID = "im3-production-factory-maximum-reading-worked-activity";
const MAXIMUM_READING_WORKED_SUBMITTED_AT = "2026-08-19T12:40:00.000Z";
const MAXIMUM_READING_GUIDED_SUBMISSION_ID =
  "im3-production-factory-maximum-reading-guided-submission";
const MAXIMUM_READING_GUIDED_ACTIVITY_ID = "im3-production-factory-maximum-reading-guided-activity";
const MAXIMUM_READING_GUIDED_SUBMITTED_AT = "2026-08-20T10:00:00.000Z";
const MAXIMUM_READING_GUIDED_GRADED_AT = "2026-08-20T10:05:00.000Z";
const MAXIMUM_READING_INDEPENDENT_SUBMISSION_ID =
  "im3-production-factory-maximum-reading-independent-submission";
const MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID =
  "im3-production-factory-maximum-reading-independent-activity";
const MAXIMUM_READING_INDEPENDENT_SUBMITTED_AT = "2026-08-20T11:00:00.000Z";
const MAXIMUM_READING_INDEPENDENT_GRADED_AT = "2026-08-20T11:05:00.000Z";
const SYMMETRY_GUIDED_SUBMISSION_ID = "im3-production-factory-symmetry-guided-submission";
const SYMMETRY_GUIDED_ACTIVITY_ID = "im3-production-factory-symmetry-guided-activity";
const SYMMETRY_GUIDED_SUBMITTED_AT = "2026-08-20T12:00:00.000Z";
const SYMMETRY_GUIDED_GRADED_AT = "2026-08-20T12:05:00.000Z";
const SYMMETRY_WORKED_SUBMISSION_ID = "im3-production-factory-symmetry-worked-submission";
const SYMMETRY_WORKED_ACTIVITY_ID = "im3-production-factory-symmetry-worked-activity";
const SYMMETRY_WORKED_SUBMITTED_AT = "2026-08-20T11:30:00.000Z";
const SYMMETRY_INDEPENDENT_SUBMISSION_ID = "im3-production-factory-symmetry-independent-submission";
const SYMMETRY_INDEPENDENT_ACTIVITY_ID = "im3-production-factory-symmetry-independent-activity";
const SYMMETRY_INDEPENDENT_SUBMITTED_AT = "2026-08-20T13:00:00.000Z";
const SYMMETRY_INDEPENDENT_GRADED_AT = "2026-08-20T13:05:00.000Z";
const COMPARE_MAXIMUM_WORKED_SUBMISSION_ID =
  "im3-production-factory-compare-maximum-worked-submission";
const COMPARE_MAXIMUM_WORKED_ACTIVITY_ID = "im3-production-factory-compare-maximum-worked-activity";
const COMPARE_MAXIMUM_WORKED_SUBMITTED_AT = "2026-08-20T14:30:00.000Z";
const COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID =
  "im3-production-factory-compare-maximum-guided-submission";
const COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID = "im3-production-factory-compare-maximum-guided-activity";
const COMPARE_MAXIMUM_GUIDED_SUBMITTED_AT = "2026-08-20T15:00:00.000Z";
const COMPARE_MAXIMUM_GUIDED_GRADED_AT = "2026-08-20T15:05:00.000Z";
const COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID =
  "im3-production-factory-compare-maximum-independent-submission";
const COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID =
  "im3-production-factory-compare-maximum-independent-activity";
const COMPARE_MAXIMUM_INDEPENDENT_SUBMITTED_AT = "2026-08-20T16:00:00.000Z";
const COMPARE_MAXIMUM_INDEPENDENT_GRADED_AT = "2026-08-20T16:05:00.000Z";
const ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID =
  "im3-production-factory-one-real-solution-worked-submission";
const ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID =
  "im3-production-factory-one-real-solution-worked-activity";
const ONE_REAL_SOLUTION_WORKED_SUBMITTED_AT = "2026-08-20T17:00:00.000Z";
const ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID =
  "im3-production-factory-one-real-solution-guided-submission";
const ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID =
  "im3-production-factory-one-real-solution-guided-activity";
const ONE_REAL_SOLUTION_GUIDED_SUBMITTED_AT = "2026-08-20T18:00:00.000Z";
const ONE_REAL_SOLUTION_GUIDED_GRADED_AT = "2026-08-20T18:05:00.000Z";
const ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID =
  "im3-production-factory-one-real-solution-independent-submission";
const ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID =
  "im3-production-factory-one-real-solution-independent-activity";
const ONE_REAL_SOLUTION_INDEPENDENT_SUBMITTED_AT = "2026-08-20T19:00:00.000Z";
const ONE_REAL_SOLUTION_INDEPENDENT_GRADED_AT = "2026-08-20T19:05:00.000Z";
const TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID =
  "im3-production-factory-two-real-solutions-worked-submission";
const TWO_REAL_SOLUTIONS_WORKED_PHYSICAL_ACTIVITY_ID =
  "activities:im3-production-factory-two-real-solutions-worked";
const TWO_REAL_SOLUTIONS_WORKED_SUBMITTED_AT = "2026-08-20T20:00:00.000Z";
const TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID =
  "im3-production-factory-two-real-solutions-guided-submission";
const TWO_REAL_SOLUTIONS_GUIDED_PHYSICAL_ACTIVITY_ID =
  "activities:im3-production-factory-two-real-solutions-guided";
const TWO_REAL_SOLUTIONS_GUIDED_SUBMITTED_AT = "2026-08-20T21:00:00.000Z";
const TWO_REAL_SOLUTIONS_GUIDED_GRADED_AT = "2026-08-20T21:05:00.000Z";
const TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID =
  "im3-production-factory-two-real-solutions-independent-submission";
const TWO_REAL_SOLUTIONS_INDEPENDENT_PHYSICAL_ACTIVITY_ID =
  "activities:im3-production-factory-two-real-solutions-independent";
const TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMITTED_AT = "2026-08-20T22:00:00.000Z";
const TWO_REAL_SOLUTIONS_INDEPENDENT_GRADED_AT = "2026-08-20T22:05:00.000Z";
const PILOT_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: NODE_ID,
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GUIDED_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: NODE_ID,
  seed: 1,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GRAPH_GUIDED_SEED_2_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: NODE_ID,
  seed: 2,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const GRAPH_INDEPENDENT_SEED_2_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: NODE_ID,
  seed: 3,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;
const INCORRECT_PILOT_TABLE = PILOT_POINTS.map((point, index) =>
  index === 0 ? { ...point, y: point.y + 1 } : point,
);

type Row = Record<string, unknown> & { _id: string };
type IndexRange = {
  eq(field: string, value: unknown): IndexRange;
};
type SubmitHandler = (
  ctx: MutationCtx,
  args: { learnerId: string; submissionId: string },
) => Promise<Record<string, unknown>>;

const approvedGraphPublication = {
  nodes: [{ id: NODE_ID, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: NODE_ID, reviewStatus: "approved" }],
};
const submitHandler: SubmitHandler = (ctx, args) =>
  submitIm3PublishedEvidenceHandler(ctx, args as never, approvedGraphPublication) as Promise<
    Record<string, unknown>
  >;

type EquationWorkedFixtureOverride = (fixture: {
  submission: Record<string, unknown>;
  activity: Record<string, unknown>;
}) => void;

function makeCtx({
  guided = false,
  graphGuidedSeed2 = false,
  graphIndependentSeed2 = false,
  equationWorked = false,
  equationGuided = false,
  equationIndependent = false,
  domainRangeWorked = false,
  domainRangeGuided = false,
  domainRangeIndependent = false,
  maximumReadingWorked = false,
  profitModelWorked = false,
  profitModelGuided = false,
  profitModelIndependent = false,
  profitMaximumWorked = false,
  profitMaximumGuided = false,
  profitMaximumIndependent = false,
  equationWorkedOverride,
  domainRangeWorkedOverride,
  profitModelWorkedOverride,
  profitMaximumWorkedOverride,
}: {
  guided?: boolean;
  graphGuidedSeed2?: boolean;
  graphIndependentSeed2?: boolean;
  equationWorked?: boolean;
  equationGuided?: boolean;
  equationIndependent?: boolean;
  domainRangeWorked?: boolean;
  domainRangeGuided?: boolean;
  domainRangeIndependent?: boolean;
  maximumReadingWorked?: boolean;
  profitModelWorked?: boolean;
  profitModelGuided?: boolean;
  profitModelIndependent?: boolean;
  profitMaximumWorked?: boolean;
  profitMaximumGuided?: boolean;
  profitMaximumIndependent?: boolean;
  equationWorkedOverride?: EquationWorkedFixtureOverride;
  domainRangeWorkedOverride?: EquationWorkedFixtureOverride;
  profitModelWorkedOverride?: EquationWorkedFixtureOverride;
  profitMaximumWorkedOverride?: EquationWorkedFixtureOverride;
} = {}) {
  const profitModelIndependentBlanks = profitModelIndependent
    ? buildIm3ProfitModelIndependentSeedDocuments(
        PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID as never,
        Date.parse(CLIENT_SUBMITTED_AT),
      ).activity.props.blanks
    : [];
  const profitMaximumGuidedBlanks = profitMaximumGuided
    ? buildIm3ProfitMaximumGuidedSeedDocuments(
        PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID as never,
        Date.parse(PROFIT_MAXIMUM_GUIDED_SUBMITTED_AT),
      ).activity.props.blanks
    : [];
  const graphGuidedSeed2Documents = graphGuidedSeed2
    ? buildIm3GraphGuidedSeed2Documents(
        GRAPH_GUIDED_SEED_2_ACTIVITY_ID as never,
        Date.parse(GRAPH_GUIDED_SEED_2_SUBMITTED_AT),
      )
    : undefined;
  const graphIndependentSeed2Documents = graphIndependentSeed2
    ? buildIm3GraphIndependentSeed2Documents(
        GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID as never,
        Date.parse(GRAPH_INDEPENDENT_SEED_2_SUBMITTED_AT),
      )
    : undefined;
  const profitMaximumIndependentBlanks = profitMaximumIndependent
    ? buildIm3ProfitMaximumIndependentSeedDocuments(
        PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID as never,
        Date.parse(PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT),
      ).activity.props.blanks
    : [];
  const teacherExposure =
    equationGuided || equationIndependent
      ? {
          _id: "equation-worked-exposure-evidence",
          learnerId: LEARNER_ID,
          contractVersion: "learning-evidence.v1" as const,
          nodeId: IM3_EQUATION_RATE_NODE,
          activityId: EQUATION_WORKED_STABLE_ACTIVITY_ID,
          attemptOrdinal: 1,
          origin: "teacher_led" as const,
          mode: "worked_example" as const,
          occurredAt: Date.parse("2026-08-19T09:00:00.000Z"),
          idempotencyKey: "equation-worked-exposure-before-production-factory",
          createdAt: Date.parse("2026-08-19T09:00:00.000Z"),
        }
      : domainRangeGuided || domainRangeIndependent
        ? {
            _id: "domain-range-worked-exposure-evidence",
            learnerId: LEARNER_ID,
            contractVersion: "learning-evidence.v1" as const,
            nodeId: IM3_DOMAIN_RANGE_NODE,
            activityId: DOMAIN_RANGE_WORKED_STABLE_ACTIVITY_ID,
            attemptOrdinal: 1,
            origin: "teacher_led" as const,
            mode: "worked_example" as const,
            occurredAt: Date.parse("2026-08-19T09:00:00.000Z"),
            idempotencyKey: "domain-range-worked-exposure-before-production-factory",
            createdAt: Date.parse("2026-08-19T09:00:00.000Z"),
          }
        : profitModelGuided || profitModelIndependent
          ? {
              _id: "profit-model-worked-exposure-evidence",
              learnerId: LEARNER_ID,
              contractVersion: "learning-evidence.v1" as const,
              nodeId: IM3_PROFIT_MODEL_NODE,
              activityId: PROFIT_MODEL_WORKED_STABLE_ACTIVITY_ID,
              attemptOrdinal: 1,
              origin: "teacher_led" as const,
              mode: "worked_example" as const,
              occurredAt: Date.parse("2026-08-19T09:00:00.000Z"),
              idempotencyKey: "profit-model-worked-exposure-before-production-factory",
              createdAt: Date.parse("2026-08-19T09:00:00.000Z"),
            }
          : profitMaximumGuided || profitMaximumIndependent
            ? {
                _id: "profit-maximum-worked-exposure-evidence",
                learnerId: LEARNER_ID,
                contractVersion: "learning-evidence.v1" as const,
                nodeId: IM3_PROFIT_MAXIMUM_NODE,
                activityId: PROFIT_MAXIMUM_WORKED_STABLE_ACTIVITY_ID,
                attemptOrdinal: 1,
                origin: "teacher_led" as const,
                mode: "worked_example" as const,
                occurredAt: Date.parse("2026-08-19T09:00:00.000Z"),
                idempotencyKey: "profit-maximum-worked-exposure-before-production-factory",
                createdAt: Date.parse("2026-08-19T09:00:00.000Z"),
              }
            : {
                _id: "teacher-exposure-evidence",
                learnerId: LEARNER_ID,
                contractVersion: "learning-evidence.v1" as const,
                nodeId: NODE_ID,
                activityId: `${NODE_ID}.worked_example`,
                attemptOrdinal: 1,
                origin: "teacher_led" as const,
                mode: "worked_example" as const,
                occurredAt: Date.parse("2026-08-19T09:00:00.000Z"),
                idempotencyKey: "teacher-exposure-before-production-factory",
                createdAt: Date.parse("2026-08-19T09:00:00.000Z"),
              };
  const submission = {
    _id: equationWorked
      ? EQUATION_WORKED_SUBMISSION_ID
      : equationGuided
        ? EQUATION_GUIDED_SUBMISSION_ID
        : equationIndependent
          ? EQUATION_INDEPENDENT_SUBMISSION_ID
          : graphGuidedSeed2
            ? GRAPH_GUIDED_SEED_2_SUBMISSION_ID
            : graphIndependentSeed2
              ? GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID
              : domainRangeWorked
                ? DOMAIN_RANGE_WORKED_SUBMISSION_ID
                : maximumReadingWorked
                  ? MAXIMUM_READING_WORKED_SUBMISSION_ID
                  : domainRangeGuided
                    ? DOMAIN_RANGE_GUIDED_SUBMISSION_ID
                    : domainRangeIndependent
                      ? DOMAIN_RANGE_INDEPENDENT_SUBMISSION_ID
                      : profitModelWorked
                        ? PROFIT_MODEL_WORKED_SUBMISSION_ID
                        : profitMaximumWorked
                          ? PROFIT_MAXIMUM_WORKED_SUBMISSION_ID
                          : profitMaximumGuided
                            ? PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID
                            : profitMaximumIndependent
                              ? PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID
                              : profitModelGuided
                                ? PROFIT_MODEL_GUIDED_SUBMISSION_ID
                                : profitModelIndependent
                                  ? PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID
                                  : guided
                                    ? GUIDED_SUBMISSION_ID
                                    : SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: equationWorked
      ? EQUATION_WORKED_ACTIVITY_ID
      : equationGuided
        ? EQUATION_GUIDED_ACTIVITY_ID
        : equationIndependent
          ? EQUATION_INDEPENDENT_ACTIVITY_ID
          : graphGuidedSeed2
            ? GRAPH_GUIDED_SEED_2_ACTIVITY_ID
            : graphIndependentSeed2
              ? GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
              : domainRangeWorked
                ? DOMAIN_RANGE_WORKED_ACTIVITY_ID
                : maximumReadingWorked
                  ? MAXIMUM_READING_WORKED_ACTIVITY_ID
                  : domainRangeGuided
                    ? DOMAIN_RANGE_GUIDED_ACTIVITY_ID
                    : domainRangeIndependent
                      ? DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
                      : profitModelWorked
                        ? PROFIT_MODEL_WORKED_ACTIVITY_ID
                        : profitMaximumWorked
                          ? PROFIT_MAXIMUM_WORKED_ACTIVITY_ID
                          : profitMaximumGuided
                            ? PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
                            : profitMaximumIndependent
                              ? PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
                              : profitModelGuided
                                ? PROFIT_MODEL_GUIDED_ACTIVITY_ID
                                : profitModelIndependent
                                  ? PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
                                  : guided
                                    ? GUIDED_ACTIVITY_ID
                                    : ACTIVITY_ID,
    masteryContractVersion: "learning-evidence.v1" as const,
    attemptOrdinal: equationWorked
      ? 1
      : equationGuided
        ? 2
        : equationIndependent
          ? 3
          : graphGuidedSeed2
            ? 2
            : graphIndependentSeed2
              ? 3
              : domainRangeWorked
                ? 1
                : maximumReadingWorked
                  ? 1
                  : domainRangeGuided
                    ? 2
                    : domainRangeIndependent
                      ? 3
                      : profitModelWorked
                        ? 1
                        : profitMaximumWorked
                          ? 1
                          : profitMaximumGuided
                            ? 2
                            : profitMaximumIndependent
                              ? 3
                              : profitModelIndependent
                                ? 3
                                : 2,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId: equationWorked
        ? EQUATION_WORKED_ACTIVITY_ID
        : equationGuided
          ? EQUATION_GUIDED_ACTIVITY_ID
          : equationIndependent
            ? EQUATION_INDEPENDENT_ACTIVITY_ID
            : graphGuidedSeed2
              ? GRAPH_GUIDED_SEED_2_ACTIVITY_ID
              : graphIndependentSeed2
                ? GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
                : domainRangeWorked
                  ? DOMAIN_RANGE_WORKED_ACTIVITY_ID
                  : maximumReadingWorked
                    ? MAXIMUM_READING_WORKED_ACTIVITY_ID
                    : domainRangeGuided
                      ? DOMAIN_RANGE_GUIDED_ACTIVITY_ID
                      : domainRangeIndependent
                        ? DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
                        : profitModelWorked
                          ? PROFIT_MODEL_WORKED_ACTIVITY_ID
                          : profitMaximumWorked
                            ? PROFIT_MAXIMUM_WORKED_ACTIVITY_ID
                            : profitMaximumGuided
                              ? PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
                              : profitMaximumIndependent
                                ? PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
                                : profitModelGuided
                                  ? PROFIT_MODEL_GUIDED_ACTIVITY_ID
                                  : profitModelIndependent
                                    ? PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
                                    : "client-supplied-activity-id",
      attemptNumber: equationWorked
        ? 1
        : equationGuided
          ? 2
          : equationIndependent
            ? 3
            : graphGuidedSeed2
              ? 2
              : graphIndependentSeed2
                ? 3
                : domainRangeWorked
                  ? 1
                  : maximumReadingWorked
                    ? 1
                    : domainRangeGuided
                      ? 2
                      : domainRangeIndependent
                        ? 3
                        : profitModelWorked
                          ? 1
                          : profitMaximumWorked
                            ? 1
                            : profitMaximumGuided
                              ? 2
                              : profitMaximumIndependent
                                ? 3
                                : profitModelGuided
                                  ? 2
                                  : profitModelIndependent
                                    ? 3
                                    : 99,
      mode: equationWorked
        ? ("worked_example" as const)
        : equationGuided
          ? ("guided_practice" as const)
          : equationIndependent
            ? ("independent_practice" as const)
            : graphGuidedSeed2
              ? ("guided_practice" as const)
              : graphIndependentSeed2
                ? ("independent_practice" as const)
                : domainRangeWorked
                  ? ("worked_example" as const)
                  : maximumReadingWorked
                    ? ("worked_example" as const)
                    : domainRangeGuided
                      ? ("guided_practice" as const)
                      : domainRangeIndependent
                        ? ("independent_practice" as const)
                        : profitModelWorked
                          ? ("worked_example" as const)
                          : profitMaximumWorked
                            ? ("worked_example" as const)
                            : profitMaximumGuided
                              ? ("guided_practice" as const)
                              : profitMaximumIndependent
                                ? ("independent_practice" as const)
                                : profitModelGuided
                                  ? ("guided_practice" as const)
                                  : profitModelIndependent
                                    ? ("independent_practice" as const)
                                    : guided
                                      ? ("guided_practice" as const)
                                      : ("independent_practice" as const),
      status:
        equationWorked ||
        domainRangeWorked ||
        maximumReadingWorked ||
        profitModelWorked ||
        profitMaximumWorked
          ? ("submitted" as const)
          : ("graded" as const),
      ...(equationWorked ||
      domainRangeWorked ||
      maximumReadingWorked ||
      profitModelWorked ||
      profitMaximumWorked
        ? {
            submittedAt: equationWorked
              ? EQUATION_CLIENT_SUBMITTED_AT
              : domainRangeWorked
                ? DOMAIN_RANGE_WORKED_SUBMITTED_AT
                : maximumReadingWorked
                  ? MAXIMUM_READING_WORKED_SUBMITTED_AT
                  : CLIENT_SUBMITTED_AT,
            answers: {},
            parts: [],
          }
        : equationGuided
          ? {
              submittedAt: EQUATION_CLIENT_SUBMITTED_AT,
              answers: { fA: 24, fB: 0, rate: -8 },
              parts: [
                { partId: "f_a", rawAnswer: 24, isCorrect: true, score: 2, maxScore: 2 },
                { partId: "f_b", rawAnswer: 0, isCorrect: true, score: 2, maxScore: 2 },
                { partId: "rate", rawAnswer: -8, isCorrect: true, score: 3, maxScore: 3 },
              ],
            }
          : equationIndependent
            ? {
                submittedAt: EQUATION_CLIENT_SUBMITTED_AT,
                answers: { fA: -2, fB: -26, rate: -6 },
                parts: [
                  { partId: "f_a", rawAnswer: -2, isCorrect: true, score: 2, maxScore: 2 },
                  { partId: "f_b", rawAnswer: -26, isCorrect: true, score: 2, maxScore: 2 },
                  { partId: "rate", rawAnswer: -6, isCorrect: true, score: 3, maxScore: 3 },
                ],
              }
            : graphGuidedSeed2
              ? {
                  submittedAt: GRAPH_GUIDED_SEED_2_SUBMITTED_AT,
                  answers: {
                    tableValues: GRAPH_GUIDED_SEED_2_POINTS,
                    placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
                  },
                  parts: [
                    {
                      partId: "table_values",
                      rawAnswer: GRAPH_GUIDED_SEED_2_POINTS,
                      isCorrect: true,
                      score: 1,
                      maxScore: 1,
                    },
                    {
                      partId: "placed_points",
                      rawAnswer: GRAPH_GUIDED_SEED_2_POINTS,
                      isCorrect: true,
                      score: 1,
                      maxScore: 1,
                    },
                  ],
                }
              : graphIndependentSeed2
                ? {
                    submittedAt: GRAPH_INDEPENDENT_SEED_2_SUBMITTED_AT,
                    answers: {
                      tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
                      placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
                    },
                    parts: [
                      {
                        partId: "table_values",
                        rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS,
                        isCorrect: true,
                        score: 1,
                        maxScore: 1,
                      },
                      {
                        partId: "placed_points",
                        rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS,
                        isCorrect: true,
                        score: 1,
                        maxScore: 1,
                      },
                    ],
                  }
                : profitMaximumGuided
                  ? {
                      submittedAt: PROFIT_MAXIMUM_GUIDED_SUBMITTED_AT,
                      answers: Object.fromEntries(
                        profitMaximumGuidedBlanks.map((blank) => [
                          blank.id,
                          {
                            answer: blank.correctAnswer,
                            isCorrect: false,
                            usedWordBank: true,
                          },
                        ]),
                      ),
                      parts: profitMaximumGuidedBlanks.map((blank) => ({
                        partId: blank.id,
                        rawAnswer: blank.correctAnswer,
                        isCorrect: true,
                        score: 1,
                        maxScore: 1,
                      })),
                    }
                  : profitMaximumIndependent
                    ? {
                        submittedAt: PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT,
                        answers: Object.fromEntries(
                          profitMaximumIndependentBlanks.map((blank) => [
                            blank.id,
                            {
                              answer: blank.correctAnswer,
                              isCorrect: false,
                              usedWordBank: true,
                            },
                          ]),
                        ),
                        parts: profitMaximumIndependentBlanks.map((blank) => ({
                          partId: blank.id,
                          rawAnswer: blank.correctAnswer,
                          isCorrect: true,
                          score: 1,
                          maxScore: 1,
                        })),
                      }
                    : profitModelGuided
                      ? {
                          submittedAt: CLIENT_SUBMITTED_AT,
                          answers: {
                            priceBase: "230",
                            priceStep: "10",
                            salesBase: "270",
                            salesLoss: "10",
                            coefficientA: "-100",
                            coefficientB: "400",
                            coefficientC: "62100",
                          },
                          parts: [
                            {
                              partId: "priceBase",
                              rawAnswer: "230",
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            },
                            {
                              partId: "priceStep",
                              rawAnswer: "10",
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            },
                            {
                              partId: "salesBase",
                              rawAnswer: "270",
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            },
                            {
                              partId: "salesLoss",
                              rawAnswer: "10",
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            },
                            {
                              partId: "coefficientA",
                              rawAnswer: "-100",
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            },
                            {
                              partId: "coefficientB",
                              rawAnswer: "400",
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            },
                            {
                              partId: "coefficientC",
                              rawAnswer: "62100",
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            },
                          ],
                        }
                      : profitModelIndependent
                        ? {
                            submittedAt: CLIENT_SUBMITTED_AT,
                            answers: Object.fromEntries(
                              profitModelIndependentBlanks.map((blank) => [
                                blank.id,
                                blank.correctAnswer,
                              ]),
                            ),
                            parts: profitModelIndependentBlanks.map((blank) => ({
                              partId: blank.id,
                              rawAnswer: blank.correctAnswer,
                              isCorrect: true,
                              score: 1,
                              maxScore: 1,
                            })),
                          }
                        : domainRangeGuided
                          ? {
                              submittedAt: EQUATION_CLIENT_SUBMITTED_AT,
                              answers: {
                                domain: "all_real_numbers",
                                range: { relation: "gte", boundary: -2.25 },
                              },
                              parts: [
                                {
                                  partId: "domain",
                                  rawAnswer: "all_real_numbers",
                                  isCorrect: true,
                                  score: 1,
                                  maxScore: 1,
                                },
                                {
                                  partId: "range",
                                  rawAnswer: { relation: "gte", boundary: -2.25 },
                                  isCorrect: true,
                                  score: 1,
                                  maxScore: 1,
                                },
                              ],
                            }
                          : domainRangeIndependent
                            ? {
                                submittedAt: EQUATION_CLIENT_SUBMITTED_AT,
                                answers: {
                                  domain: "all_real_numbers",
                                  range: { relation: "lte", boundary: -1 },
                                },
                                parts: [
                                  {
                                    partId: "domain",
                                    rawAnswer: "all_real_numbers",
                                    isCorrect: true,
                                    score: 1,
                                    maxScore: 1,
                                  },
                                  {
                                    partId: "range",
                                    rawAnswer: { relation: "lte", boundary: -1 },
                                    isCorrect: true,
                                    score: 1,
                                    maxScore: 1,
                                  },
                                ],
                              }
                            : {
                                submittedAt: CLIENT_SUBMITTED_AT,
                                answers: guided
                                  ? { tableValues: GUIDED_POINTS, placedPoints: GUIDED_POINTS }
                                  : { tableValues: INCORRECT_PILOT_TABLE, placedPoints: [] },
                                parts: guided
                                  ? [
                                      {
                                        partId: "table_values",
                                        rawAnswer: GUIDED_POINTS,
                                        isCorrect: true,
                                        score: 1,
                                        maxScore: 1,
                                      },
                                      {
                                        partId: "placed_points",
                                        rawAnswer: GUIDED_POINTS,
                                        isCorrect: true,
                                        score: 1,
                                        maxScore: 1,
                                      },
                                    ]
                                  : [
                                      {
                                        partId: "table_values",
                                        rawAnswer: INCORRECT_PILOT_TABLE,
                                        isCorrect: false,
                                        score: 0,
                                        maxScore: 1,
                                      },
                                      {
                                        partId: "placed_points",
                                        rawAnswer: [],
                                        isCorrect: false,
                                        score: 0,
                                        maxScore: 1,
                                      },
                                    ],
                              }),
    },
    ...(equationWorked ||
    domainRangeWorked ||
    maximumReadingWorked ||
    profitModelWorked ||
    profitMaximumWorked
      ? {
          submittedAt: Date.parse(
            equationWorked
              ? EQUATION_WORKED_SUBMITTED_AT
              : domainRangeWorked
                ? DOMAIN_RANGE_WORKED_SUBMITTED_AT
                : maximumReadingWorked
                  ? MAXIMUM_READING_WORKED_SUBMITTED_AT
                  : CLIENT_SUBMITTED_AT,
          ),
        }
      : equationGuided
        ? {
            score: 7,
            maxScore: 7,
            submittedAt: Date.parse(EQUATION_CLIENT_SUBMITTED_AT),
            gradedAt: Date.parse(SERVER_GRADED_AT),
          }
        : equationIndependent
          ? {
              score: 7,
              maxScore: 7,
              submittedAt: Date.parse(EQUATION_CLIENT_SUBMITTED_AT),
              gradedAt: Date.parse(SERVER_GRADED_AT),
            }
          : domainRangeGuided || domainRangeIndependent
            ? {
                score: 2,
                maxScore: 2,
                submittedAt: Date.parse(EQUATION_CLIENT_SUBMITTED_AT),
                gradedAt: Date.parse(SERVER_GRADED_AT),
              }
            : graphGuidedSeed2
              ? {
                  score: 2,
                  maxScore: 2,
                  submittedAt: Date.parse(GRAPH_GUIDED_SEED_2_SUBMITTED_AT),
                  gradedAt: Date.parse(GRAPH_GUIDED_SEED_2_GRADED_AT),
                }
              : graphIndependentSeed2
                ? {
                    score: 2,
                    maxScore: 2,
                    submittedAt: Date.parse(GRAPH_INDEPENDENT_SEED_2_SUBMITTED_AT),
                    gradedAt: Date.parse(GRAPH_INDEPENDENT_SEED_2_GRADED_AT),
                  }
                : profitMaximumGuided
                  ? {
                      score: 3,
                      maxScore: 3,
                      submittedAt: Date.parse(PROFIT_MAXIMUM_GUIDED_SUBMITTED_AT),
                      gradedAt: Date.parse(SERVER_GRADED_AT),
                    }
                  : profitMaximumIndependent
                    ? {
                        score: 3,
                        maxScore: 3,
                        submittedAt: Date.parse(PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT),
                        gradedAt: Date.parse(PROFIT_MAXIMUM_INDEPENDENT_GRADED_AT),
                      }
                    : profitModelGuided
                      ? {
                          score: 7,
                          maxScore: 7,
                          submittedAt: Date.parse(CLIENT_SUBMITTED_AT),
                          gradedAt: Date.parse(SERVER_GRADED_AT),
                        }
                      : profitModelIndependent
                        ? {
                            score: 7,
                            maxScore: 7,
                            submittedAt: Date.parse(CLIENT_SUBMITTED_AT),
                            gradedAt: Date.parse(SERVER_GRADED_AT),
                          }
                        : profitMaximumWorked
                          ? {
                              submittedAt: Date.parse(CLIENT_SUBMITTED_AT),
                            }
                          : {
                              score: guided ? 2 : 0,
                              maxScore: 2,
                              submittedAt: Date.parse(CLIENT_SUBMITTED_AT),
                              gradedAt: Date.parse(SERVER_GRADED_AT),
                            }),
  };
  const activity = {
    ...(graphGuidedSeed2Documents
      ? {
          _id: GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
          ...graphGuidedSeed2Documents.activity,
        }
      : {}),
    ...(graphIndependentSeed2Documents
      ? {
          _id: GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
          ...graphIndependentSeed2Documents.activity,
        }
      : {}),
    ...(maximumReadingWorked
      ? {
          _id: MAXIMUM_READING_WORKED_ACTIVITY_ID,
          ...buildIm3MaximumReadingWorkedSeedDocument(
            Date.parse(MAXIMUM_READING_WORKED_SUBMITTED_AT),
          ),
        }
      : {}),
    ...(profitModelWorked
      ? {
          _id: PROFIT_MODEL_WORKED_ACTIVITY_ID,
          ...buildIm3ProfitModelWorkedSeedDocument(Date.parse(CLIENT_SUBMITTED_AT)),
        }
      : {}),
    ...(profitMaximumWorked
      ? {
          _id: PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
          ...buildIm3ProfitMaximumWorkedSeedDocument(Date.parse(CLIENT_SUBMITTED_AT)),
        }
      : {}),
    ...(profitMaximumGuided
      ? {
          _id: PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
          ...buildIm3ProfitMaximumGuidedSeedDocuments(
            PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID as never,
            Date.parse(PROFIT_MAXIMUM_GUIDED_SUBMITTED_AT),
          ).activity,
          srsEligible: true,
        }
      : {}),
    ...(profitMaximumIndependent
      ? {
          _id: PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
          ...buildIm3ProfitMaximumIndependentSeedDocuments(
            PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID as never,
            Date.parse(PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT),
          ).activity,
          srsEligible: true,
        }
      : {}),
    ...(profitModelGuided
      ? {
          _id: PROFIT_MODEL_GUIDED_ACTIVITY_ID,
          ...buildIm3ProfitModelGuidedSeedDocuments(
            PROFIT_MODEL_GUIDED_ACTIVITY_ID as never,
            Date.parse(CLIENT_SUBMITTED_AT),
          ).activity,
          srsEligible: true,
        }
      : {}),
    ...(profitModelIndependent
      ? {
          _id: PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
          ...buildIm3ProfitModelIndependentSeedDocuments(
            PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID as never,
            Date.parse(CLIENT_SUBMITTED_AT),
          ).activity,
          srsEligible: true,
        }
      : {}),
    _id: equationWorked
      ? EQUATION_WORKED_ACTIVITY_ID
      : equationGuided
        ? EQUATION_GUIDED_ACTIVITY_ID
        : equationIndependent
          ? EQUATION_INDEPENDENT_ACTIVITY_ID
          : graphGuidedSeed2
            ? GRAPH_GUIDED_SEED_2_ACTIVITY_ID
            : graphIndependentSeed2
              ? GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
              : domainRangeWorked
                ? DOMAIN_RANGE_WORKED_ACTIVITY_ID
                : maximumReadingWorked
                  ? MAXIMUM_READING_WORKED_ACTIVITY_ID
                  : domainRangeGuided
                    ? DOMAIN_RANGE_GUIDED_ACTIVITY_ID
                    : domainRangeIndependent
                      ? DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
                      : profitModelWorked
                        ? PROFIT_MODEL_WORKED_ACTIVITY_ID
                        : profitMaximumWorked
                          ? PROFIT_MAXIMUM_WORKED_ACTIVITY_ID
                          : profitMaximumGuided
                            ? PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
                            : profitMaximumIndependent
                              ? PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
                              : profitModelGuided
                                ? PROFIT_MODEL_GUIDED_ACTIVITY_ID
                                : profitModelIndependent
                                  ? PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
                                  : guided
                                    ? GUIDED_ACTIVITY_ID
                                    : ACTIVITY_ID,
    stableActivityId: equationWorked
      ? EQUATION_WORKED_STABLE_ACTIVITY_ID
      : equationGuided
        ? EQUATION_GUIDED_STABLE_ACTIVITY_ID
        : equationIndependent
          ? EQUATION_INDEPENDENT_STABLE_ACTIVITY_ID
          : graphGuidedSeed2
            ? IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID
            : graphIndependentSeed2
              ? IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
              : domainRangeWorked
                ? DOMAIN_RANGE_WORKED_STABLE_ACTIVITY_ID
                : maximumReadingWorked
                  ? IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID
                  : domainRangeGuided
                    ? DOMAIN_RANGE_GUIDED_STABLE_ACTIVITY_ID
                    : domainRangeIndependent
                      ? DOMAIN_RANGE_INDEPENDENT_STABLE_ACTIVITY_ID
                      : profitModelWorked
                        ? PROFIT_MODEL_WORKED_STABLE_ACTIVITY_ID
                        : profitMaximumWorked
                          ? PROFIT_MAXIMUM_WORKED_STABLE_ACTIVITY_ID
                          : profitMaximumGuided
                            ? PROFIT_MAXIMUM_GUIDED_STABLE_ACTIVITY_ID
                            : profitMaximumIndependent
                              ? PROFIT_MAXIMUM_INDEPENDENT_STABLE_ACTIVITY_ID
                              : profitModelGuided
                                ? PROFIT_MODEL_GUIDED_STABLE_ACTIVITY_ID
                                : profitModelIndependent
                                  ? PROFIT_MODEL_INDEPENDENT_STABLE_ACTIVITY_ID
                                  : guided
                                    ? GUIDED_STABLE_ACTIVITY_ID
                                    : STABLE_ACTIVITY_ID,
    masteryNodeId:
      equationWorked || equationGuided || equationIndependent
        ? IM3_EQUATION_RATE_NODE
        : domainRangeWorked || domainRangeGuided || domainRangeIndependent
          ? IM3_DOMAIN_RANGE_NODE
          : maximumReadingWorked
            ? IM3_MAXIMUM_READING_NODE
            : profitModelWorked || profitModelGuided || profitModelIndependent
              ? IM3_PROFIT_MODEL_NODE
              : profitMaximumWorked || profitMaximumGuided || profitMaximumIndependent
                ? IM3_PROFIT_MAXIMUM_NODE
                : NODE_ID,
    componentKey:
      equationWorked || equationGuided || equationIndependent
        ? "rate-of-change-calculator"
        : profitModelWorked ||
            profitModelGuided ||
            profitModelIndependent ||
            profitMaximumWorked ||
            profitMaximumGuided ||
            profitMaximumIndependent
          ? "fill-in-the-blank"
          : "graphing-explorer",
    srsEligible:
      equationWorked ||
      domainRangeWorked ||
      maximumReadingWorked ||
      profitModelWorked ||
      profitMaximumWorked
        ? false
        : true,
    ...(equationWorked ||
    domainRangeWorked ||
    maximumReadingWorked ||
    profitModelWorked ||
    profitMaximumWorked
      ? { learningEvidenceMode: "worked_example" as const }
      : {}),
  };
  if (equationWorked && equationWorkedOverride) {
    equationWorkedOverride({
      submission: submission as unknown as Record<string, unknown>,
      activity: activity as unknown as Record<string, unknown>,
    });
  }
  if (domainRangeWorked && domainRangeWorkedOverride) {
    domainRangeWorkedOverride({
      submission: submission as unknown as Record<string, unknown>,
      activity: activity as unknown as Record<string, unknown>,
    });
  }
  if (profitModelWorked && profitModelWorkedOverride) {
    profitModelWorkedOverride({
      submission: submission as unknown as Record<string, unknown>,
      activity: activity as unknown as Record<string, unknown>,
    });
  }
  if (profitMaximumWorked && profitMaximumWorkedOverride) {
    profitMaximumWorkedOverride({
      submission: submission as unknown as Record<string, unknown>,
      activity: activity as unknown as Record<string, unknown>,
    });
  }
  const inserts: Array<{ tableName: string; document: Record<string, unknown> }> = [];
  const rows: Record<string, Row[]> = {
    learning_evidence:
      equationWorked ||
      domainRangeWorked ||
      maximumReadingWorked ||
      profitModelWorked ||
      profitMaximumWorked
        ? []
        : [teacherExposure],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };

  const findByConditions = (tableName: string, conditions: ReadonlyMap<string, unknown>) =>
    (rows[tableName] ?? []).find((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    ) ?? null;

  const query = vi.fn((tableName: string) => {
    if (tableName === "learning_evidence_receipts") {
      return {
        withIndex: vi.fn((indexName: string, configure: (range: IndexRange) => unknown) => {
          if (indexName !== "by_learner_and_submission_id") {
            throw new Error(`Unexpected receipt index: ${indexName}`);
          }
          const conditions = new Map<string, unknown>();
          const range: IndexRange = {
            eq(field, value) {
              conditions.set(field, value);
              return range;
            },
          };
          configure(range);
          return {
            unique: vi.fn(async () => findByConditions("learning_evidence_receipts", conditions)),
          };
        }),
      };
    }
    if (tableName === "learning_evidence") {
      return {
        withIndex: vi.fn((indexName: string, configure: (range: IndexRange) => unknown) => {
          if (indexName === "by_learner_and_idempotency_key") {
            const conditions = new Map<string, unknown>();
            const range: IndexRange = {
              eq(field, value) {
                conditions.set(field, value);
                return range;
              },
            };
            configure(range);
            return {
              unique: vi.fn(async () => findByConditions("learning_evidence", conditions)),
            };
          }
          if (indexName === "by_learner_and_node") {
            return {
              collect: vi.fn(async () => [teacherExposure]),
              take: vi.fn(async () => [teacherExposure]),
            };
          }
          if (indexName === "by_learner_node_origin_occurred_at") {
            return {
              order: vi.fn(() => ({
                first: vi.fn(async () =>
                  equationWorked ||
                  domainRangeWorked ||
                  maximumReadingWorked ||
                  profitModelWorked ||
                  profitMaximumWorked
                    ? null
                    : teacherExposure,
                ),
              })),
            };
          }
          if (indexName === "by_learner_node_activity_origin_attempt") {
            return {
              order: vi.fn(() => ({
                first: vi.fn(async () => null),
              })),
            };
          }
          throw new Error(`Unexpected learning evidence index: ${indexName}`);
        }),
      };
    }
    if (tableName === "srs_cards") {
      return {
        withIndex: vi.fn((_indexName: string, configure: (range: IndexRange) => unknown) => {
          const range: IndexRange = {
            eq() {
              return range;
            },
          };
          configure(range);
          return { first: vi.fn(async () => null) };
        }),
      };
    }
    throw new Error(`Unexpected production factory query: ${tableName}`);
  });

  const get = vi.fn(async (...args: unknown[]) => {
    const id = args.length > 1 ? args[1] : args[0];
    if (id === submission._id) return submission;
    if (id === activity._id) return activity;
    return null;
  });
  const insert = vi.fn(async (tableName: string, document: Record<string, unknown>) => {
    inserts.push({ tableName, document });
    const id = `${tableName}-${inserts.length}`;
    (rows[tableName] ??= []).push({ _id: id, ...document });
    return id;
  });

  return {
    ctx: {
      db: { query, get, insert, replace: vi.fn(async () => undefined) },
      auth: { getUserIdentity: vi.fn(async () => null) },
      runQuery: vi.fn(async () => null),
    } as unknown as MutationCtx,
    inserts,
    rows,
    submission,
    activity,
  };
}

type MaximumReadingPracticeMode = "guided_practice" | "independent_practice";

function makeMaximumReadingPracticeCtx({
  mode,
  override,
}: {
  mode: MaximumReadingPracticeMode;
  override?: EquationWorkedFixtureOverride;
}) {
  const isGuided = mode === "guided_practice";
  const activityId = isGuided
    ? MAXIMUM_READING_GUIDED_ACTIVITY_ID
    : MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID;
  const submissionId = isGuided
    ? MAXIMUM_READING_GUIDED_SUBMISSION_ID
    : MAXIMUM_READING_INDEPENDENT_SUBMISSION_ID;
  const clientSubmittedAt = isGuided
    ? MAXIMUM_READING_GUIDED_SUBMITTED_AT
    : MAXIMUM_READING_INDEPENDENT_SUBMITTED_AT;
  const gradedAt = isGuided
    ? MAXIMUM_READING_GUIDED_GRADED_AT
    : MAXIMUM_READING_INDEPENDENT_GRADED_AT;
  const documents = isGuided
    ? buildIm3MaximumReadingGuidedSeedDocuments(activityId as never, Date.parse(clientSubmittedAt))
    : buildIm3MaximumReadingIndependentSeedDocuments(
        activityId as never,
        Date.parse(clientSubmittedAt),
      );
  const maximumValue = isGuided ? -1 : 0;
  const score = isGuided ? 1 : 0;
  const activity = {
    _id: activityId,
    ...documents.activity,
    srsEligible: true,
  };
  const teacherExposure = {
    _id: "maximum-reading-worked-exposure-evidence",
    learnerId: LEARNER_ID,
    contractVersion: "learning-evidence.v1" as const,
    nodeId: IM3_MAXIMUM_READING_NODE,
    activityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: "teacher_led" as const,
    mode: "worked_example" as const,
    occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
    idempotencyKey: "maximum-reading-worked-exposure-before-practice",
    createdAt: Date.parse("2026-08-20T09:00:00.000Z"),
  };
  const submission = {
    _id: submissionId,
    userId: LEARNER_ID,
    activityId,
    masteryContractVersion: "learning-evidence.v1" as const,
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId,
      attemptNumber: 2,
      mode,
      status: "graded" as const,
      submittedAt: clientSubmittedAt,
      answers: { maximum_value: maximumValue },
      parts: [
        {
          partId: "maximum_value",
          rawAnswer: maximumValue,
          isCorrect: score === 1,
          score,
          maxScore: 1,
        },
      ],
    },
    score,
    maxScore: 1,
    submittedAt: Date.parse(clientSubmittedAt) + 60_000,
    gradedAt: Date.parse(gradedAt),
  };
  override?.({
    submission: submission as unknown as Record<string, unknown>,
    activity: activity as unknown as Record<string, unknown>,
  });

  const inserts: Array<{ tableName: string; document: Record<string, unknown> }> = [];
  const rows: Record<string, Row[]> = {
    learning_evidence: [teacherExposure],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };
  const findByConditions = (tableName: string, conditions: ReadonlyMap<string, unknown>) =>
    (rows[tableName] ?? []).find((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    ) ?? null;
  const query = vi.fn((tableName: string) => {
    if (tableName === "learning_evidence_receipts") {
      return {
        withIndex: vi.fn((indexName: string, configure: (range: IndexRange) => unknown) => {
          if (indexName !== "by_learner_and_submission_id") {
            throw new Error(`Unexpected receipt index: ${indexName}`);
          }
          const conditions = new Map<string, unknown>();
          const range: IndexRange = {
            eq(field, value) {
              conditions.set(field, value);
              return range;
            },
          };
          configure(range);
          return {
            unique: vi.fn(async () => findByConditions("learning_evidence_receipts", conditions)),
          };
        }),
      };
    }
    if (tableName === "learning_evidence") {
      return {
        withIndex: vi.fn((indexName: string, configure: (range: IndexRange) => unknown) => {
          if (indexName === "by_learner_and_idempotency_key") {
            const conditions = new Map<string, unknown>();
            const range: IndexRange = {
              eq(field, value) {
                conditions.set(field, value);
                return range;
              },
            };
            configure(range);
            return {
              unique: vi.fn(async () => findByConditions("learning_evidence", conditions)),
            };
          }
          if (indexName === "by_learner_node_origin_occurred_at") {
            return {
              order: vi.fn(() => ({
                first: vi.fn(async () => teacherExposure),
              })),
            };
          }
          if (indexName === "by_learner_node_activity_origin_attempt") {
            return {
              order: vi.fn(() => ({
                first: vi.fn(async () => null),
              })),
            };
          }
          throw new Error(`Unexpected learning evidence index: ${indexName}`);
        }),
      };
    }
    if (tableName === "srs_cards") {
      return {
        withIndex: vi.fn((indexName: string, configure: (range: IndexRange) => unknown) => {
          if (
            ![
              "by_student_and_variant",
              "by_legacy_problem_family",
              "by_historic_problem_family",
            ].includes(indexName)
          ) {
            throw new Error(`Unexpected SRS card index: ${indexName}`);
          }
          const conditions = new Map<string, unknown>();
          const range: IndexRange = {
            eq(field, value) {
              conditions.set(field, value);
              return range;
            },
          };
          configure(range);
          return {
            first: vi.fn(async () => findByConditions("srs_cards", conditions)),
          };
        }),
      };
    }
    throw new Error(`Unexpected maximum-reading practice query: ${tableName}`);
  });
  const get = vi.fn(async (...args: unknown[]) => {
    const id = args.length > 1 ? args[1] : args[0];
    if (id === submission._id) return submission;
    if (id === activity._id) return activity;
    return null;
  });
  const insert = vi.fn(async (tableName: string, document: Record<string, unknown>) => {
    inserts.push({ tableName, document });
    const id = `${tableName}-${inserts.length}`;
    (rows[tableName] ??= []).push({ _id: id, ...document });
    return id;
  });
  const replace = vi.fn(async () => undefined);

  return {
    ctx: {
      db: { query, get, insert, replace },
      auth: { getUserIdentity: vi.fn(async () => null) },
      runQuery: vi.fn(async () => null),
    } as unknown as MutationCtx,
    inserts,
    rows,
    submission,
    activity,
    replace,
    teacherExposure,
  };
}

function makeSymmetryGuidedProductionCtx() {
  const context = makeMaximumReadingPracticeCtx({ mode: "guided_practice" });
  const clientSubmittedAt = SYMMETRY_GUIDED_SUBMITTED_AT;
  const activityId = SYMMETRY_GUIDED_ACTIVITY_ID;
  const documents = buildIm3SymmetryGuidedSeedDocuments(
    activityId as never,
    Date.parse(clientSubmittedAt),
  );
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_SYMMETRY_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const placedPoints = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;

  Object.assign(context.activity, {
    ...documents.activity,
    _id: activityId,
  });
  Object.assign(context.submission, {
    _id: SYMMETRY_GUIDED_SUBMISSION_ID,
    activityId,
    masteryContractVersion: "learning-evidence.v1" as const,
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId,
      attemptNumber: 2,
      mode: "guided_practice" as const,
      status: "graded" as const,
      submittedAt: clientSubmittedAt,
      answers: { placed_points: placedPoints },
      parts: [
        {
          partId: "placed_points",
          rawAnswer: placedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse(clientSubmittedAt) + 60_000,
    gradedAt: Date.parse(SYMMETRY_GUIDED_GRADED_AT),
  });
  Object.assign(context.teacherExposure, {
    _id: "symmetry-worked-exposure-evidence",
    nodeId: IM3_SYMMETRY_NODE,
    activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
    occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
    idempotencyKey: "symmetry-worked-exposure-before-production-factory",
  });

  return { ...context, placedPoints };
}

function makeCompareMaximumGuidedProductionCtx() {
  const context = makeSymmetryGuidedProductionCtx();
  const clientSubmittedAt = COMPARE_MAXIMUM_GUIDED_SUBMITTED_AT;
  const activityId = COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID;
  const documents = buildIm3CompareMaximumGuidedSeedDocuments(
    activityId as never,
    Date.parse(clientSubmittedAt),
  );
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_COMPARE_MAXIMUM_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const answer = generated.expectedAnswer.greater_maximum as "first" | "second";

  Object.assign(context.activity, {
    ...documents.activity,
    _id: activityId,
  });
  Object.assign(context.submission, {
    _id: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
    activityId,
    masteryContractVersion: "learning-evidence.v1" as const,
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId,
      attemptNumber: 2,
      mode: "guided_practice" as const,
      status: "graded" as const,
      submittedAt: clientSubmittedAt,
      answers: { greater_maximum: answer },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: answer,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse(clientSubmittedAt) + 60_000,
    gradedAt: Date.parse(COMPARE_MAXIMUM_GUIDED_GRADED_AT),
  });
  Object.assign(context.teacherExposure, {
    _id: "compare-maximum-worked-exposure-evidence",
    nodeId: IM3_COMPARE_MAXIMUM_NODE,
    activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
    occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
    idempotencyKey: "compare-maximum-worked-exposure-before-production-factory",
  });

  return { ...context, answer };
}

function makeCompareMaximumIndependentProductionCtx() {
  const context = makeCompareMaximumGuidedProductionCtx();
  const clientSubmittedAt = COMPARE_MAXIMUM_INDEPENDENT_SUBMITTED_AT;
  const activityId = COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID;
  const documents = buildIm3CompareMaximumIndependentSeedDocuments(
    activityId as never,
    Date.parse(clientSubmittedAt),
  );
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_COMPARE_MAXIMUM_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const answer = generated.expectedAnswer.greater_maximum as "first" | "second";

  Object.assign(context.activity, {
    ...documents.activity,
    _id: activityId,
  });
  Object.assign(context.submission, {
    _id: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    activityId,
    masteryContractVersion: "learning-evidence.v1" as const,
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId,
      attemptNumber: 3,
      mode: "independent_practice" as const,
      status: "graded" as const,
      submittedAt: clientSubmittedAt,
      answers: { greater_maximum: answer },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: answer,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse(clientSubmittedAt) + 60_000,
    gradedAt: Date.parse(COMPARE_MAXIMUM_INDEPENDENT_GRADED_AT),
  });

  return { ...context, answer };
}

function makeSymmetryWorkedProductionCtx() {
  const context = makeCtx({ maximumReadingWorked: true });
  const submittedAt = SYMMETRY_WORKED_SUBMITTED_AT;
  const document = buildIm3SymmetryWorkedSeedDocument(Date.parse(submittedAt));

  Object.assign(context.activity, {
    _id: SYMMETRY_WORKED_ACTIVITY_ID,
    ...document,
  });
  Object.assign(context.submission, {
    _id: SYMMETRY_WORKED_SUBMISSION_ID,
    activityId: SYMMETRY_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    masteryContractVersion: "learning-evidence.v1" as const,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId: SYMMETRY_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example" as const,
      status: "submitted" as const,
      submittedAt,
      answers: {},
      parts: [],
    },
    submittedAt: Date.parse(submittedAt),
  });

  return context;
}

function makeCompareMaximumWorkedProductionCtx() {
  const context = makeCtx({ maximumReadingWorked: true });
  const submittedAt = COMPARE_MAXIMUM_WORKED_SUBMITTED_AT;
  const document = buildIm3CompareMaximumWorkedSeedDocument(Date.parse(submittedAt));

  Object.assign(context.activity, {
    _id: COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
    ...document,
  });
  Object.assign(context.submission, {
    _id: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
    activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    masteryContractVersion: "learning-evidence.v1" as const,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example" as const,
      status: "submitted" as const,
      submittedAt,
      answers: {},
      parts: [],
    },
    submittedAt: Date.parse(submittedAt),
  });

  return context;
}

function makeOneRealSolutionWorkedProductionCtx() {
  const context = makeCtx({ maximumReadingWorked: true });
  const submittedAt = ONE_REAL_SOLUTION_WORKED_SUBMITTED_AT;
  const document = buildIm3OneRealSolutionWorkedSeedDocument(Date.parse(submittedAt));

  Object.assign(context.activity, {
    _id: ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
    ...document,
  });
  Object.assign(context.submission, {
    _id: ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID,
    activityId: ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    masteryContractVersion: "learning-evidence.v1" as const,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId: ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example" as const,
      status: "submitted" as const,
      submittedAt,
      answers: {},
      parts: [],
    },
    submittedAt: Date.parse(submittedAt),
  });

  return context;
}

function makeOneRealSolutionGuidedProductionCtx() {
  const context = makeSymmetryGuidedProductionCtx();
  const clientSubmittedAt = ONE_REAL_SOLUTION_GUIDED_SUBMITTED_AT;
  const activityId = ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID;
  const document = buildIm3OneRealSolutionGuidedSeedDocument(Date.parse(clientSubmittedAt));
  const generated = getGenerator("one-real-solution-graphing").generate({
    nodeId: IM3_ONE_REAL_SOLUTION_NODE,
    seed: 45,
    difficulty: 0.5,
  });
  const tableValues = generated.expectedAnswer.table_values as Array<{ x: number; y: number }>;
  const placedPoints = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
  const solution = generated.expectedAnswer.solution as number;

  Object.assign(context.activity, {
    _id: activityId,
    ...document,
  });
  Object.assign(context.submission, {
    _id: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
    activityId,
    masteryContractVersion: "learning-evidence.v1" as const,
    attemptOrdinal: 2,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId,
      attemptNumber: 2,
      mode: "guided_practice" as const,
      status: "graded" as const,
      submittedAt: clientSubmittedAt,
      answers: {
        table_values: tableValues,
        placed_points: placedPoints,
        solution,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: tableValues,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: placedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "solution",
          rawAnswer: solution,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
      artifact: {
        graphState: {
          originalEquation: document.props.originalEquation,
          equation: document.props.equation,
          tableValues,
          placedPoints,
          domain: document.props.domain,
          range: document.props.range,
        },
      },
    },
    score: 3,
    maxScore: 3,
    submittedAt: Date.parse(clientSubmittedAt) + 60_000,
    gradedAt: Date.parse(ONE_REAL_SOLUTION_GUIDED_GRADED_AT),
  });
  Object.assign(context.teacherExposure, {
    _id: "one-real-solution-worked-exposure-evidence",
    nodeId: IM3_ONE_REAL_SOLUTION_NODE,
    activityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
    occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
    idempotencyKey: "one-real-solution-worked-exposure-before-production-factory",
  });

  return { ...context, tableValues, placedPoints, solution };
}

function makeOneRealSolutionIndependentProductionCtx() {
  const context = makeOneRealSolutionGuidedProductionCtx();
  const clientSubmittedAt = ONE_REAL_SOLUTION_INDEPENDENT_SUBMITTED_AT;
  const activityId = ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID;
  const document = buildIm3OneRealSolutionIndependentSeedDocument(Date.parse(clientSubmittedAt));
  const generated = getGenerator("one-real-solution-graphing").generate({
    nodeId: IM3_ONE_REAL_SOLUTION_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const tableValues = generated.expectedAnswer.table_values as Array<{ x: number; y: number }>;
  const placedPoints = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
  const solution = generated.expectedAnswer.solution as number;

  Object.assign(context.activity, {
    _id: activityId,
    ...document,
  });
  Object.assign(context.submission, {
    _id: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
    activityId,
    masteryContractVersion: "learning-evidence.v1" as const,
    attemptOrdinal: 3,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId,
      attemptNumber: 3,
      mode: "independent_practice" as const,
      status: "graded" as const,
      submittedAt: clientSubmittedAt,
      answers: {
        table_values: tableValues,
        placed_points: placedPoints,
        solution,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: tableValues,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: placedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "solution",
          rawAnswer: solution,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
      artifact: {
        graphState: {
          originalEquation: document.props.originalEquation,
          equation: document.props.equation,
          tableValues,
          placedPoints,
          domain: document.props.domain,
          range: document.props.range,
        },
      },
    },
    score: 3,
    maxScore: 3,
    submittedAt: Date.parse(clientSubmittedAt) + 60_000,
    gradedAt: Date.parse(ONE_REAL_SOLUTION_INDEPENDENT_GRADED_AT),
  });

  return { ...context, tableValues, placedPoints, solution, document };
}

function makeSymmetryIndependentProductionCtx() {
  const context = makeSymmetryGuidedProductionCtx();
  const submittedAt = SYMMETRY_INDEPENDENT_SUBMITTED_AT;
  const activityId = SYMMETRY_INDEPENDENT_ACTIVITY_ID;
  const documents = buildIm3SymmetryIndependentSeedDocuments(
    activityId as never,
    Date.parse(submittedAt),
  );
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_SYMMETRY_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const placedPoints = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;

  Object.assign(context.activity, {
    _id: activityId,
    ...documents.activity,
  });
  Object.assign(context.submission, {
    _id: SYMMETRY_INDEPENDENT_SUBMISSION_ID,
    activityId,
    attemptOrdinal: 3,
    masteryContractVersion: "learning-evidence.v1" as const,
    submissionData: {
      contractVersion: "practice.v1" as const,
      activityId,
      attemptNumber: 3,
      mode: "independent_practice" as const,
      status: "graded" as const,
      submittedAt,
      answers: { placed_points: placedPoints },
      parts: [
        {
          partId: "placed_points",
          rawAnswer: placedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.parse(submittedAt) + 60_000,
    gradedAt: Date.parse(SYMMETRY_INDEPENDENT_GRADED_AT),
  });

  return { ...context, placedPoints };
}

const EQUATION_WORKED_CORRUPTIONS: Array<{
  name: string;
  override: EquationWorkedFixtureOverride;
}> = [
  {
    name: "foreign owner",
    override: ({ submission }) => {
      submission.userId = "other-learner";
    },
  },
  {
    name: "wrong stable ID",
    override: ({ activity }) => {
      activity.stableActivityId = `${IM3_EQUATION_RATE_NODE}.guided_practice`;
    },
  },
  {
    name: "wrong node",
    override: ({ activity }) => {
      activity.masteryNodeId = NODE_ID;
    },
  },
  {
    name: "wrong component",
    override: ({ activity }) => {
      activity.componentKey = "graphing-explorer";
    },
  },
  {
    name: "missing learningEvidenceMode",
    override: ({ activity }) => {
      delete activity.learningEvidenceMode;
    },
  },
  {
    name: "wrong learningEvidenceMode",
    override: ({ activity }) => {
      activity.learningEvidenceMode = "guided_practice";
    },
  },
  {
    name: "srsEligible true",
    override: ({ activity }) => {
      activity.srsEligible = true;
    },
  },
  {
    name: "wrong physical envelope activityId",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).activityId = "other-activity";
    },
  },
  {
    name: "attempt number does not match server ordinal",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).attemptNumber = 2;
    },
  },
  {
    name: "missing client submittedAt",
    override: ({ submission }) => {
      delete (submission.submissionData as Record<string, unknown>).submittedAt;
    },
  },
  {
    name: "invalid client submittedAt",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).submittedAt = "not-an-iso-timestamp";
    },
  },
  {
    name: "unexpected envelope field",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).unexpected = true;
    },
  },
  {
    name: "wrong practice contract",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).contractVersion = "practice.v0";
    },
  },
  {
    name: "wrong mode",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).mode = "guided_practice";
    },
  },
  {
    name: "wrong status",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).status = "graded";
    },
  },
  {
    name: "non-empty answers",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).answers = { fA: "-25" };
    },
  },
  {
    name: "non-empty parts",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).parts = [
        { partId: "f_a", rawAnswer: "-25" },
      ];
    },
  },
  {
    name: "zero ordinal",
    override: ({ submission }) => {
      submission.attemptOrdinal = 0;
    },
  },
  {
    name: "fractional ordinal",
    override: ({ submission }) => {
      submission.attemptOrdinal = 1.5;
    },
  },
  {
    name: "invalid server submittedAt",
    override: ({ submission }) => {
      submission.submittedAt = "not-a-date";
    },
  },
  {
    name: "score present",
    override: ({ submission }) => {
      submission.score = 0;
    },
  },
  {
    name: "maxScore present",
    override: ({ submission }) => {
      submission.maxScore = 0;
    },
  },
  {
    name: "gradedAt present",
    override: ({ submission }) => {
      submission.gradedAt = Date.parse(SERVER_GRADED_AT);
    },
  },
  {
    name: "missing mastery contract",
    override: ({ submission }) => {
      delete submission.masteryContractVersion;
    },
  },
  {
    name: "wrong mastery contract",
    override: ({ submission }) => {
      submission.masteryContractVersion = "learning-evidence.v0";
    },
  },
];

const oneRealSolutionWorkedCorruptions = EQUATION_WORKED_CORRUPTIONS.map(({ name, override }) => ({
  name,
  override: ({ submission, activity }: Parameters<EquationWorkedFixtureOverride>[0]) => {
    override({ submission, activity });
    if (name === "wrong component") activity.componentKey = "rate-of-change-calculator";
  },
}));

const oneRealSolutionGuidedCorruptions: Array<{
  name: string;
  override: EquationWorkedFixtureOverride;
}> = [
  {
    name: "foreign owner",
    override: ({ submission }) => {
      submission.userId = "other-learner";
    },
  },
  {
    name: "wrong stable activity ID",
    override: ({ activity }) => {
      activity.stableActivityId = IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID;
    },
  },
  {
    name: "wrong node ID",
    override: ({ activity }) => {
      activity.masteryNodeId = NODE_ID;
    },
  },
  {
    name: "wrong component key",
    override: ({ activity }) => {
      activity.componentKey = "fill-in-the-blank";
    },
  },
  {
    name: "srsEligible false",
    override: ({ activity }) => {
      activity.srsEligible = false;
    },
  },
  {
    name: "physical envelope activityId mismatch",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).activityId = "other-activity";
    },
  },
  {
    name: "unexpected envelope field",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).unexpected = true;
    },
  },
  {
    name: "missing artifact",
    override: ({ submission }) => {
      delete (submission.submissionData as Record<string, unknown>).artifact;
    },
  },
  {
    name: "unexpected interactionHistory field",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).interactionHistory = [];
    },
  },
  {
    name: "wrong practice contract",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).contractVersion = "practice.v0";
    },
  },
  {
    name: "wrong mode",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).mode = "independent_practice";
    },
  },
  {
    name: "wrong status",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).status = "submitted";
    },
  },
  {
    name: "zero server attempt ordinal",
    override: ({ submission }) => {
      submission.attemptOrdinal = 0;
    },
  },
  {
    name: "fractional server attempt ordinal",
    override: ({ submission }) => {
      submission.attemptOrdinal = 1.5;
    },
  },
  {
    name: "envelope attemptNumber does not match server ordinal",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).attemptNumber = 3;
    },
  },
  {
    name: "invalid client submittedAt",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).submittedAt = "not-an-iso-timestamp";
    },
  },
  {
    name: "invalid top-level server submittedAt",
    override: ({ submission }) => {
      submission.submittedAt = "not-a-date";
    },
  },
  {
    name: "invalid top-level gradedAt",
    override: ({ submission }) => {
      submission.gradedAt = "not-a-date";
    },
  },
  {
    name: "missing mastery contract",
    override: ({ submission }) => {
      delete submission.masteryContractVersion;
    },
  },
  {
    name: "wrong mastery contract",
    override: ({ submission }) => {
      submission.masteryContractVersion = "learning-evidence.v0";
    },
  },
  {
    name: "top maxScore is not 3",
    override: ({ submission }) => {
      submission.maxScore = 2;
    },
  },
  {
    name: "top score is below 0",
    override: ({ submission }) => {
      submission.score = -1;
    },
  },
  {
    name: "top score is above 3",
    override: ({ submission }) => {
      submission.score = 4;
    },
  },
  {
    name: "top score is fractional",
    override: ({ submission }) => {
      submission.score = 1.5;
    },
  },
  {
    name: "top score does not equal the sum of part scores",
    override: ({ submission }) => {
      submission.score = 2;
    },
  },
  {
    name: "missing solution answer key",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      delete (data.answers as Record<string, unknown>).solution;
    },
  },
  {
    name: "extra answer key",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      (data.answers as Record<string, unknown>).extra = 1;
    },
  },
  {
    name: "table_values has four points",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const answers = data.answers as Record<string, unknown>;
      const tableValues = (answers.table_values as Array<{ x: number; y: number }>).slice(0, 4);
      answers.table_values = tableValues;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[0]!.rawAnswer = tableValues;
      const artifact = data.artifact as Record<string, unknown>;
      const graphState = artifact.graphState as Record<string, unknown>;
      graphState.tableValues = tableValues;
    },
  },
  {
    name: "placed_points has four points",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const answers = data.answers as Record<string, unknown>;
      const placedPoints = (answers.placed_points as Array<{ x: number; y: number }>).slice(0, 4);
      answers.placed_points = placedPoints;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[1]!.rawAnswer = placedPoints;
      const artifact = data.artifact as Record<string, unknown>;
      const graphState = artifact.graphState as Record<string, unknown>;
      graphState.placedPoints = placedPoints;
    },
  },
  {
    name: "solution is not a finite number",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      (data.answers as Record<string, unknown>).solution = Number.NaN;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[2]!.rawAnswer = Number.NaN;
    },
  },
  {
    name: "missing graded part",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>).splice(2, 1);
    },
  },
  {
    name: "extra graded part",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>).push({
        partId: "extra",
        rawAnswer: 0,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      });
    },
  },
  {
    name: "wrong graded-part order",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      data.parts = [parts[1]!, parts[0]!, parts[2]!];
    },
  },
  {
    name: "duplicate graded part ID",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[1]!.partId = "table_values";
    },
  },
  {
    name: "part rawAnswer does not match its answer",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[2]!.rawAnswer = 999;
    },
  },
  {
    name: "part isCorrect is inconsistent with its score",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[2]!.isCorrect = false;
    },
  },
  {
    name: "part score is 2 instead of 0 or 1",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[2]!.score = 2;
    },
  },
  {
    name: "part maxScore is 2 instead of 1",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[2]!.maxScore = 2;
    },
  },
  {
    name: "unexpected part field",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      parts[2]!.unexpected = true;
    },
  },
  {
    name: "missing part isCorrect",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const parts = data.parts as Array<Record<string, unknown>>;
      delete parts[2]!.isCorrect;
    },
  },
  {
    name: "artifact is not a plain object",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      data.artifact = [];
    },
  },
  {
    name: "unexpected artifact key",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      (data.artifact as Record<string, unknown>).unexpected = true;
    },
  },
  {
    name: "missing graphState",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      delete (data.artifact as Record<string, unknown>).graphState;
    },
  },
  {
    name: "unexpected graphState key",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).unexpected = true;
    },
  },
  {
    name: "graphState originalEquation mismatch",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).originalEquation = "y = x";
    },
  },
  {
    name: "graphState equation mismatch",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).equation = "y = x";
    },
  },
  {
    name: "graphState tableValues mismatch",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).tableValues = [];
    },
  },
  {
    name: "graphState placedPoints mismatch",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).placedPoints = [];
    },
  },
  {
    name: "graphState domain mismatch",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).domain = [0, 1];
    },
  },
  {
    name: "graphState range mismatch",
    override: ({ submission }) => {
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).range = [0, 1];
    },
  },
  {
    name: "missing trusted activity props",
    override: ({ activity }) => {
      delete activity.props;
    },
  },
  {
    name: "wrong trusted variant",
    override: ({ activity }) => {
      (activity.props as Record<string, unknown>).variant = "compare_functions";
    },
  },
  {
    name: "wrong trusted responseVariant",
    override: ({ activity }) => {
      (activity.props as Record<string, unknown>).responseVariant = "symmetry_graph";
    },
  },
  {
    name: "whitespace-only trusted originalEquation",
    override: ({ submission, activity }) => {
      const whitespaceEquation = "   ";
      (activity.props as Record<string, unknown>).originalEquation = whitespaceEquation;
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).originalEquation = whitespaceEquation;
    },
  },
  {
    name: "whitespace-only trusted equation",
    override: ({ submission, activity }) => {
      const whitespaceEquation = "   ";
      (activity.props as Record<string, unknown>).equation = whitespaceEquation;
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).equation = whitespaceEquation;
    },
  },
  {
    name: "trusted domain has the wrong length",
    override: ({ submission, activity }) => {
      const invalidDomain = [0];
      (activity.props as Record<string, unknown>).domain = invalidDomain;
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).domain = invalidDomain;
    },
  },
  {
    name: "trusted range contains a non-finite number",
    override: ({ submission, activity }) => {
      const invalidRange = [Number.NaN, 1];
      (activity.props as Record<string, unknown>).range = invalidRange;
      const data = submission.submissionData as Record<string, unknown>;
      const artifact = data.artifact as Record<string, unknown>;
      (artifact.graphState as Record<string, unknown>).range = invalidRange;
    },
  },
];

const oneRealSolutionIndependentCorruptions: Array<{
  name: string;
  override: EquationWorkedFixtureOverride;
}> = [
  {
    name: "wrong stable activity ID",
    override: ({ activity }) => {
      activity.stableActivityId = IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID;
    },
  },
  {
    name: "wrong envelope mode",
    override: ({ submission }) => {
      (submission.submissionData as Record<string, unknown>).mode = "guided_practice";
    },
  },
  {
    name: "srsEligible false",
    override: ({ activity }) => {
      activity.srsEligible = false;
    },
  },
];

describe("createIm3ServerOwnedSubmissionHandler production metadata", () => {
  it("persists one exact equation-rate Worked source and replays without mastery effects", async () => {
    const { ctx, inserts, rows } = makeCtx({ equationWorked: true });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: EQUATION_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: EQUATION_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_EQUATION_RATE_NODE,
        activityId: EQUATION_WORKED_STABLE_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(EQUATION_WORKED_SUBMITTED_AT),
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toEqual([
      expect.objectContaining({
        submissionId: EQUATION_WORKED_SUBMISSION_ID,
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        decision: expect.objectContaining({
          reason: "teacher_led",
          masteryBearing: false,
        }),
      }),
    ]);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: EQUATION_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact domain-range Worked source and replays without mastery effects", async () => {
    const { ctx, inserts, rows } = makeCtx({ domainRangeWorked: true });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: DOMAIN_RANGE_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_DOMAIN_RANGE_NODE,
        activityId: DOMAIN_RANGE_WORKED_STABLE_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(DOMAIN_RANGE_WORKED_SUBMITTED_AT),
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toEqual([
      expect.objectContaining({
        submissionId: DOMAIN_RANGE_WORKED_SUBMISSION_ID,
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        decision: expect.objectContaining({
          reason: "teacher_led",
          masteryBearing: false,
        }),
      }),
    ]);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact profit-model Worked source and replays without mastery effects", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({ profitModelWorked: true });

    expect(activity).toMatchObject({
      stableActivityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      componentKey: "fill-in-the-blank",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: PROFIT_MODEL_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example",
      status: "submitted",
      submittedAt: CLIENT_SUBMITTED_AT,
      answers: {},
      parts: [],
    });
    const storedSubmission = submission as unknown as Record<string, unknown>;
    expect(storedSubmission.score).toBeUndefined();
    expect(storedSubmission.maxScore).toBeUndefined();
    expect(storedSubmission.gradedAt).toBeUndefined();

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: PROFIT_MODEL_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_PROFIT_MODEL_NODE,
        activityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(CLIENT_SUBMITTED_AT),
        idempotencyKey: `im3:teacher-led:submission:${PROFIT_MODEL_WORKED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it.each(EQUATION_WORKED_CORRUPTIONS)(
    "rejects a profit-model Worked source with $name corruption before effects",
    async ({ override }) => {
      const { ctx, rows } = makeCtx({
        profitModelWorked: true,
        profitModelWorkedOverride: override,
      });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: PROFIT_MODEL_WORKED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toHaveLength(0);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
    },
  );

  it("persists one exact maximum-profit Worked source and replays without mastery effects", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({ profitMaximumWorked: true });

    expect(activity).toMatchObject({
      stableActivityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      componentKey: "fill-in-the-blank",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example",
      status: "submitted",
      submittedAt: CLIENT_SUBMITTED_AT,
      answers: {},
      parts: [],
    });
    const storedSubmission = submission as unknown as Record<string, unknown>;
    expect(storedSubmission.score).toBeUndefined();
    expect(storedSubmission.maxScore).toBeUndefined();
    expect(storedSubmission.gradedAt).toBeUndefined();

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: PROFIT_MAXIMUM_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_PROFIT_MAXIMUM_NODE,
        activityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(CLIENT_SUBMITTED_AT),
        idempotencyKey: `im3:teacher-led:submission:${PROFIT_MAXIMUM_WORKED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it.each(EQUATION_WORKED_CORRUPTIONS)(
    "rejects a maximum-profit Worked source with $name corruption before effects",
    async ({ override }) => {
      const { ctx, rows } = makeCtx({
        profitMaximumWorked: true,
        profitMaximumWorkedOverride: override,
      });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: PROFIT_MAXIMUM_WORKED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toHaveLength(0);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
    },
  );

  const domainRangeWorkedCorruptions = EQUATION_WORKED_CORRUPTIONS.map(({ name, override }) => ({
    name,
    override: ({ submission, activity }: Parameters<EquationWorkedFixtureOverride>[0]) => {
      override({ submission, activity });
      if (name === "wrong component") activity.componentKey = "rate-of-change-calculator";
    },
  }));

  const maximumReadingWorkedCorruptions = EQUATION_WORKED_CORRUPTIONS.map(({ name, override }) => ({
    name,
    override: ({ submission, activity }: Parameters<EquationWorkedFixtureOverride>[0]) => {
      override({ submission, activity });
      if (name === "wrong component") activity.componentKey = "rate-of-change-calculator";
    },
  }));

  it.each(domainRangeWorkedCorruptions)(
    "rejects a domain-range Worked source with $name corruption before effects",
    async ({ override }) => {
      const { ctx, rows } = makeCtx({
        domainRangeWorked: true,
        domainRangeWorkedOverride: override,
      });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: DOMAIN_RANGE_WORKED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toHaveLength(0);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
    },
  );

  it("persists one exact maximum-reading Worked source and replays without mastery effects", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({ maximumReadingWorked: true });

    expect(activity).toEqual({
      _id: MAXIMUM_READING_WORKED_ACTIVITY_ID,
      ...buildIm3MaximumReadingWorkedSeedDocument(Date.parse(MAXIMUM_READING_WORKED_SUBMITTED_AT)),
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: MAXIMUM_READING_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example",
      status: "submitted",
      submittedAt: MAXIMUM_READING_WORKED_SUBMITTED_AT,
      answers: {},
      parts: [],
    });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: MAXIMUM_READING_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: MAXIMUM_READING_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_MAXIMUM_READING_NODE,
        activityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(MAXIMUM_READING_WORKED_SUBMITTED_AT),
        idempotencyKey: `im3:teacher-led:submission:${MAXIMUM_READING_WORKED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toEqual([
      expect.objectContaining({
        submissionId: MAXIMUM_READING_WORKED_SUBMISSION_ID,
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        decision: expect.objectContaining({
          reason: "teacher_led",
          masteryBearing: false,
        }),
      }),
    ]);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: MAXIMUM_READING_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it.each(maximumReadingWorkedCorruptions)(
    "rejects a maximum-reading Worked source with $name corruption before effects",
    async ({ override }) => {
      const { ctx, rows, submission, activity } = makeCtx({
        maximumReadingWorked: true,
      });
      override({
        submission: submission as unknown as Record<string, unknown>,
        activity: activity as unknown as Record<string, unknown>,
      });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: MAXIMUM_READING_WORKED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toHaveLength(0);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
    },
  );

  it.each([
    {
      label: "Guided seed 0",
      mode: "guided_practice" as const,
      stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      expectedMaximum: -1,
      expectedScore: 1,
      submissionId: MAXIMUM_READING_GUIDED_SUBMISSION_ID,
      gradedAt: MAXIMUM_READING_GUIDED_GRADED_AT,
    },
    {
      label: "Independent seed 34",
      mode: "independent_practice" as const,
      stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      expectedMaximum: 0,
      expectedScore: 0,
      submissionId: MAXIMUM_READING_INDEPENDENT_SUBMISSION_ID,
      gradedAt: MAXIMUM_READING_INDEPENDENT_GRADED_AT,
    },
  ])(
    "persists exact maximum-reading $label evidence and replays without new effects",
    async ({ mode, stableActivityId, expectedMaximum, expectedScore, submissionId, gradedAt }) => {
      const { ctx, inserts, rows, submission, activity, replace, teacherExposure } =
        makeMaximumReadingPracticeCtx({ mode });
      const masteryBridge = vi.fn(async () => undefined);
      const handler = createIm3ServerOwnedSubmissionHandler({
        ctx,
        learnerId: LEARNER_ID,
        masteryBridge,
      });

      expect(activity).toMatchObject({
        stableActivityId,
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        componentKey: "graphing-explorer",
        srsEligible: true,
      });
      expect(submission.submissionData).toMatchObject({
        contractVersion: "practice.v1",
        activityId: submission.activityId,
        attemptNumber: 2,
        mode,
        status: "graded",
        answers: { maximum_value: expectedMaximum },
        parts: [
          {
            partId: "maximum_value",
            rawAnswer: expectedMaximum,
            isCorrect: expectedScore === 1,
            score: expectedScore,
            maxScore: 1,
          },
        ],
      });
      expect(submission.masteryContractVersion).toBe("learning-evidence.v1");

      const first = await handler.process({ submissionId });

      expect(first).toMatchObject({
        persisted: true,
        masteryApplied: true,
        kstApplied: true,
        delivery: "new",
        decision: {
          reason: "eligible",
          masteryBearing: true,
        },
      });
      expect(masteryBridge).toHaveBeenCalledTimes(1);
      expect(masteryBridge).toHaveBeenCalledWith({
        learnerId: LEARNER_ID,
        evidence: expect.objectContaining({
          contractVersion: "learning-evidence.v1",
          nodeId: IM3_MAXIMUM_READING_NODE,
          activityId: stableActivityId,
          attemptOrdinal: 2,
          origin: "mastery_advantage",
          mode,
          occurredAt: gradedAt,
          gradedEvidence: {
            isCorrect: expectedScore === 1,
            score: expectedScore,
            maxScore: 1,
          },
          idempotencyKey: `im3:mastery-advantage:submission:${submissionId}`,
        }),
      });
      expect(rows.learning_evidence).toEqual([
        teacherExposure,
        expect.objectContaining({
          submissionId,
          contractVersion: "learning-evidence.v1",
          nodeId: IM3_MAXIMUM_READING_NODE,
          activityId: stableActivityId,
          attemptOrdinal: 2,
          origin: "mastery_advantage",
          mode,
          occurredAt: Date.parse(gradedAt),
          gradedEvidence: {
            isCorrect: expectedScore === 1,
            score: expectedScore,
            maxScore: 1,
          },
          idempotencyKey: `im3:mastery-advantage:submission:${submissionId}`,
        }),
      ]);
      expect(rows.learning_evidence_receipts).toHaveLength(1);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts.map((entry) => entry.tableName)).toEqual([
        "learning_evidence",
        "learning_evidence_receipts",
      ]);
      expect(replace).not.toHaveBeenCalled();
      const writesAfterFirst = [...inserts];

      const replay = await handler.process({ submissionId });

      expect(replay).toMatchObject({
        persisted: true,
        masteryApplied: true,
        kstApplied: true,
        delivery: "replay",
        decision: {
          reason: "eligible",
          masteryBearing: true,
        },
      });
      expect(masteryBridge).toHaveBeenCalledTimes(1);
      expect(rows.learning_evidence).toHaveLength(2);
      expect(rows.learning_evidence_receipts).toHaveLength(1);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts).toStrictEqual(writesAfterFirst);
      expect(replace).not.toHaveBeenCalled();
    },
  );

  it.each([
    {
      label: "Guided seed 0",
      mode: "guided_practice" as const,
      submissionId: MAXIMUM_READING_GUIDED_SUBMISSION_ID,
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      expectedScore: 1,
    },
    {
      label: "Independent seed 34",
      mode: "independent_practice" as const,
      submissionId: MAXIMUM_READING_INDEPENDENT_SUBMISSION_ID,
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      expectedScore: 0,
    },
  ])(
    "resolves exact maximum-reading $label SRS identity",
    async ({ mode, submissionId, variantKey, expectedScore }) => {
      const { ctx, inserts, rows, teacherExposure, replace } = makeMaximumReadingPracticeCtx({
        mode,
      });

      const first = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId,
      });

      expect(first).toMatchObject({
        persisted: true,
        masteryApplied: true,
        kstApplied: true,
        delivery: "new",
      });
      expect(rows.learning_evidence).toEqual([
        teacherExposure,
        expect.objectContaining({
          submissionId,
          nodeId: IM3_MAXIMUM_READING_NODE,
          activityId: variantKey,
          origin: "mastery_advantage",
          mode,
          gradedEvidence: {
            isCorrect: expectedScore === 1,
            score: expectedScore,
            maxScore: 1,
          },
        }),
      ]);
      expect(rows.learning_evidence_receipts).toHaveLength(1);
      expect(rows.srs_cards).toHaveLength(1);
      const card = rows.srs_cards[0];
      if (!card) throw new Error("expected a maximum-reading SRS card");
      expect(card).toMatchObject({
        studentId: LEARNER_ID,
        objectiveId: IM3_MAXIMUM_READING_NODE,
        variantKey,
      });
      expect(rows.srs_review_log).toEqual([
        expect.objectContaining({
          cardId: card._id,
          studentId: LEARNER_ID,
          submissionId,
        }),
      ]);
      expect(inserts.map((entry) => entry.tableName)).toEqual([
        "srs_cards",
        "srs_review_log",
        "learning_evidence",
        "learning_evidence_receipts",
      ]);
      const writesAfterFirst = [...inserts];

      const replay = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId,
      });

      expect(replay).toMatchObject({
        persisted: true,
        masteryApplied: true,
        kstApplied: true,
        delivery: "replay",
      });
      expect(rows.learning_evidence).toHaveLength(2);
      expect(rows.learning_evidence_receipts).toHaveLength(1);
      expect(rows.srs_cards).toHaveLength(1);
      expect(rows.srs_review_log).toHaveLength(1);
      expect(inserts).toStrictEqual(writesAfterFirst);
      expect(replace).not.toHaveBeenCalled();
    },
  );

  const maximumReadingPracticeCorruptions: Array<{
    name: string;
    override: EquationWorkedFixtureOverride;
  }> = [
    {
      name: "foreign owner",
      override: ({ submission }) => {
        submission.userId = "other-learner";
      },
    },
    {
      name: "wrong stable ID",
      override: ({ activity }) => {
        activity.stableActivityId = `${IM3_MAXIMUM_READING_NODE}.lookalike`;
      },
    },
    {
      name: "wrong node",
      override: ({ activity }) => {
        activity.masteryNodeId = `${IM3_MAXIMUM_READING_NODE}.lookalike`;
      },
    },
    {
      name: "wrong component",
      override: ({ activity }) => {
        activity.componentKey = "step-by-step-solver";
      },
    },
    {
      name: "srsEligible false",
      override: ({ activity }) => {
        activity.srsEligible = false;
      },
    },
    {
      name: "physical activity ID mismatch",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).activityId = "other-activity";
      },
    },
    {
      name: "wrong practice contract",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).contractVersion = "practice.v0";
      },
    },
    {
      name: "wrong mode for stable ID",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).mode = "independent_practice";
      },
    },
    {
      name: "status not graded",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).status = "submitted";
      },
    },
    {
      name: "zero attempt ordinal",
      override: ({ submission }) => {
        submission.attemptOrdinal = 0;
      },
    },
    {
      name: "fractional attempt ordinal",
      override: ({ submission }) => {
        submission.attemptOrdinal = 1.5;
      },
    },
    {
      name: "mismatched attempt ordinal",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).attemptNumber = 3;
      },
    },
    {
      name: "invalid client submittedAt",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).submittedAt = "invalid";
      },
    },
    {
      name: "unexpected practice envelope field",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).unexpected = true;
      },
    },
    {
      name: "invalid top-level submittedAt",
      override: ({ submission }) => {
        submission.submittedAt = Number.NaN;
      },
    },
    {
      name: "invalid top-level gradedAt",
      override: ({ submission }) => {
        submission.gradedAt = Number.NaN;
      },
    },
    {
      name: "missing mastery contract",
      override: ({ submission }) => {
        delete submission.masteryContractVersion;
      },
    },
    {
      name: "wrong mastery contract",
      override: ({ submission }) => {
        submission.masteryContractVersion = "learning-evidence.v0";
      },
    },
    {
      name: "maxScore other than 1",
      override: ({ submission }) => {
        submission.maxScore = 2;
      },
    },
    {
      name: "score below 0",
      override: ({ submission }) => {
        submission.score = -1;
      },
    },
    {
      name: "score above 1",
      override: ({ submission }) => {
        submission.score = 2;
      },
    },
    {
      name: "consistent fractional server grade",
      override: ({ submission }) => {
        submission.score = 0.5;
        const part = (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        )[0]!;
        part.isCorrect = false;
        part.score = 0.5;
        part.maxScore = 1;
      },
    },
    {
      name: "missing maximum_value answer",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).answers = {};
      },
    },
    {
      name: "extra maximum_value answer",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).answers as Record<string, unknown>
        ).other = 1;
      },
    },
    {
      name: "non-finite maximum_value answer",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).answers as Record<string, unknown>
        ).maximum_value = Number.NaN;
      },
    },
    {
      name: "missing maximum_value part",
      override: ({ submission }) => {
        (submission.submissionData as Record<string, unknown>).parts = [];
      },
    },
    {
      name: "extra maximum_value part",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        ).push({
          partId: "other",
          rawAnswer: 1,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        });
      },
    },
    {
      name: "duplicate maximum_value part",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        ).push({
          partId: "maximum_value",
          rawAnswer: -1,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        });
      },
    },
    {
      name: "wrong maximum_value part ID",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        )[0]!.partId = "other";
      },
    },
    {
      name: "answer/rawAnswer mismatch",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).answers as Record<string, unknown>
        ).maximum_value = 0;
        (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        )[0]!.rawAnswer = -1;
      },
    },
    {
      name: "part isCorrect inconsistent",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        )[0]!.isCorrect = false;
      },
    },
    {
      name: "part score inconsistent",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        )[0]!.score = 0;
      },
    },
    {
      name: "part maxScore inconsistent",
      override: ({ submission }) => {
        (
          (submission.submissionData as Record<string, unknown>).parts as Array<
            Record<string, unknown>
          >
        )[0]!.maxScore = 2;
      },
    },
  ];

  it.each(maximumReadingPracticeCorruptions)(
    "rejects maximum-reading practice with $name before effects",
    async ({ override }) => {
      const { ctx, rows, replace, teacherExposure } = makeMaximumReadingPracticeCtx({
        mode: "guided_practice",
        override,
      });
      const masteryBridge = vi.fn(async () => undefined);
      const handler = createIm3ServerOwnedSubmissionHandler({
        ctx,
        learnerId: LEARNER_ID,
        masteryBridge,
      });

      const result = await handler.process({
        submissionId: MAXIMUM_READING_GUIDED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(masteryBridge).not.toHaveBeenCalled();
      expect(rows.learning_evidence).toEqual([teacherExposure]);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(replace).not.toHaveBeenCalled();
    },
  );

  it.each(EQUATION_WORKED_CORRUPTIONS)(
    "rejects an equation-rate Worked source with $name corruption",
    async ({ override }) => {
      const { ctx, rows } = makeCtx({ equationWorked: true, equationWorkedOverride: override });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: EQUATION_WORKED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toHaveLength(0);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
    },
  );

  it("passes the exact stored pilot metadata, ordinal, and server grade into mastery evidence", async () => {
    const { ctx, inserts } = makeCtx();
    const masteryBridge = vi.fn(async () => undefined);
    const handler = createIm3ServerOwnedSubmissionHandler({
      ctx,
      learnerId: LEARNER_ID,
      masteryBridge,
    });

    const result = await handler.process({ submissionId: SUBMISSION_ID });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      evidence: expect.objectContaining({
        nodeId: NODE_ID,
        activityId: STABLE_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: SERVER_GRADED_AT,
        gradedEvidence: { isCorrect: false, score: 0, maxScore: 2 },
      }),
    });
    expect(JSON.stringify(masteryBridge.mock.calls)).not.toContain(CLIENT_SUBMITTED_AT);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(inserts.find((entry) => entry.tableName === "learning_evidence_receipts")).toEqual(
      expect.objectContaining({
        document: expect.objectContaining({
          persisted: true,
          masteryApplied: true,
          kstApplied: true,
        }),
      }),
    );
  });

  it("persists one pilot SRS card and review for a new delivery and none on replay", async () => {
    const { ctx, inserts, rows } = makeCtx();

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the IM3 pilot SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: NODE_ID,
      variantKey: IM3_PILOT_VARIANT_KEY,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one Guided SRS card and review for a new delivery and none on replay", async () => {
    const { ctx, inserts, rows } = makeCtx({ guided: true });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: GUIDED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        nodeId: NODE_ID,
        activityId: GUIDED_STABLE_ACTIVITY_ID,
        origin: "mastery_advantage",
        mode: "guided_practice",
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the IM3 Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: NODE_ID,
      variantKey: IM3_GUIDED_VARIANT_KEY,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: GUIDED_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one equation Guided SRS card and review for a new delivery and none on replay", async () => {
    const { ctx, inserts, rows } = makeCtx({ equationGuided: true });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: EQUATION_GUIDED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        nodeId: IM3_EQUATION_RATE_NODE,
        activityId: EQUATION_GUIDED_STABLE_ACTIVITY_ID,
        origin: "mastery_advantage",
        mode: "guided_practice",
        gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the equation Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_EQUATION_RATE_NODE,
      variantKey: EQUATION_GUIDED_STABLE_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: EQUATION_GUIDED_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: EQUATION_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one equation Independent SRS card and review for a new delivery and none on replay", async () => {
    const { ctx, inserts, rows } = makeCtx({ equationIndependent: true });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        nodeId: IM3_EQUATION_RATE_NODE,
        activityId: EQUATION_INDEPENDENT_STABLE_ACTIVITY_ID,
        origin: "mastery_advantage",
        mode: "independent_practice",
        gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the equation Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_EQUATION_RATE_NODE,
      variantKey: EQUATION_INDEPENDENT_STABLE_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: EQUATION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it.each([
    {
      label: "Guided",
      options: { domainRangeGuided: true },
      submissionId: DOMAIN_RANGE_GUIDED_SUBMISSION_ID,
      stableActivityId: DOMAIN_RANGE_GUIDED_STABLE_ACTIVITY_ID,
      mode: "guided_practice",
    },
    {
      label: "Independent",
      options: { domainRangeIndependent: true },
      submissionId: DOMAIN_RANGE_INDEPENDENT_SUBMISSION_ID,
      stableActivityId: DOMAIN_RANGE_INDEPENDENT_STABLE_ACTIVITY_ID,
      mode: "independent_practice",
    },
  ])(
    "persists one exact domain-range $label SRS card and review and none on replay",
    async ({ options, submissionId, stableActivityId, mode }) => {
      const { ctx, inserts, rows } = makeCtx(options);

      const first = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId,
      });

      expect(first).toMatchObject({
        persisted: true,
        masteryApplied: true,
        kstApplied: true,
        delivery: "new",
      });
      expect(rows.learning_evidence).toEqual([
        expect.anything(),
        expect.objectContaining({
          nodeId: IM3_DOMAIN_RANGE_NODE,
          activityId: stableActivityId,
          origin: "mastery_advantage",
          mode,
          gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
        }),
      ]);
      expect(rows.learning_evidence_receipts).toHaveLength(1);
      expect(rows.srs_cards).toHaveLength(1);
      expect(rows.srs_review_log).toHaveLength(1);
      const card = rows.srs_cards[0];
      if (!card) throw new Error("expected the domain-range SRS card");
      expect(card).toMatchObject({
        studentId: LEARNER_ID,
        objectiveId: IM3_DOMAIN_RANGE_NODE,
        variantKey: stableActivityId,
      });
      expect(rows.srs_review_log).toEqual([
        expect.objectContaining({
          studentId: LEARNER_ID,
          cardId: card._id,
          submissionId,
        }),
      ]);
      const writesAfterFirst = [...inserts];

      const replay = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId,
      });

      expect(replay).toMatchObject({
        persisted: true,
        masteryApplied: true,
        kstApplied: true,
        delivery: "replay",
      });
      expect(rows.learning_evidence).toHaveLength(2);
      expect(rows.learning_evidence_receipts).toHaveLength(1);
      expect(rows.srs_cards).toHaveLength(1);
      expect(rows.srs_review_log).toHaveLength(1);
      expect(inserts).toStrictEqual(writesAfterFirst);
    },
  );

  it("persists one exact domain-range Guided seed-2 SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({ domainRangeGuided: true });
    const generated = buildIm3DomainRangeGuidedSeed2Documents(
      DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID as never,
      Date.parse(DOMAIN_RANGE_GUIDED_SEED_2_SUBMITTED_AT),
    );
    Object.assign(activity, {
      ...generated.activity,
      _id: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
    });
    Object.assign(submission, {
      _id: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      attemptOrdinal: 2,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
        attemptNumber: 2,
        mode: "guided_practice",
        submittedAt: DOMAIN_RANGE_GUIDED_SEED_2_SUBMITTED_AT,
        status: "graded",
        answers: {
          domain: "all_real_numbers",
          range: { relation: "lte", boundary: -0.75 },
        },
        parts: [
          {
            partId: "domain",
            rawAnswer: "all_real_numbers",
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "range",
            rawAnswer: { relation: "lte", boundary: -0.75 },
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
      },
      score: 2,
      maxScore: 2,
      submittedAt: Date.parse(DOMAIN_RANGE_GUIDED_SEED_2_SUBMITTED_AT),
      gradedAt: Date.parse(DOMAIN_RANGE_GUIDED_SEED_2_GRADED_AT),
    });

    expect(activity).toMatchObject({
      _id: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
      props: generated.activity.props,
      gradingConfig: generated.activity.gradingConfig,
    });
    expect(generated.activity.props).toMatchObject({
      equation: "y = -x^2 + x - 1",
      variant: "plot_from_equation",
      responseVariant: "domain_range",
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(submission).toMatchObject({
      _id: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      attemptOrdinal: 2,
      score: 2,
      maxScore: 2,
      submittedAt: Date.parse(DOMAIN_RANGE_GUIDED_SEED_2_SUBMITTED_AT),
      gradedAt: Date.parse(DOMAIN_RANGE_GUIDED_SEED_2_GRADED_AT),
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      attemptNumber: 2,
      mode: "guided_practice",
      submittedAt: DOMAIN_RANGE_GUIDED_SEED_2_SUBMITTED_AT,
      status: "graded",
      answers: {
        domain: "all_real_numbers",
        range: { relation: "lte", boundary: -0.75 },
      },
      parts: [
        { partId: "domain", rawAnswer: "all_real_numbers", isCorrect: true, score: 1, maxScore: 1 },
        {
          partId: "range",
          rawAnswer: { relation: "lte", boundary: -0.75 },
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        nodeId: IM3_DOMAIN_RANGE_NODE,
        activityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
        origin: "mastery_advantage",
        mode: "guided_practice",
        attemptOrdinal: 2,
        occurredAt: Date.parse(DOMAIN_RANGE_GUIDED_SEED_2_GRADED_AT),
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the domain-range Guided seed-2 SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_DOMAIN_RANGE_NODE,
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
    });
    expect(card.variantKey).not.toBe(IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID);
    expect(card.variantKey).not.toBe(IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID);
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact domain-range Independent seed-2 SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({ domainRangeIndependent: true });
    const generated = buildIm3DomainRangeIndependentSeed2Documents(
      DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID as never,
      Date.parse(DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMITTED_AT),
    );
    Object.assign(activity, {
      ...generated.activity,
      _id: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
    });
    Object.assign(submission, {
      _id: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      attemptOrdinal: 2,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
        attemptNumber: 2,
        mode: "independent_practice",
        submittedAt: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMITTED_AT,
        status: "graded",
        answers: {
          domain: "all_real_numbers",
          range: { relation: "gte", boundary: 1.75 },
        },
        parts: [
          {
            partId: "domain",
            rawAnswer: "all_real_numbers",
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "range",
            rawAnswer: { relation: "gte", boundary: 1.75 },
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
      },
      score: 2,
      maxScore: 2,
      submittedAt: Date.parse(DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMITTED_AT),
      gradedAt: Date.parse(DOMAIN_RANGE_INDEPENDENT_SEED_2_GRADED_AT),
    });

    expect(activity).toMatchObject({
      _id: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
      props: generated.activity.props,
      gradingConfig: generated.activity.gradingConfig,
    });
    expect(activity.props).toMatchObject({
      equation: "y = x^2 - x + 2",
      variant: "plot_from_equation",
      responseVariant: "domain_range",
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(submission).toMatchObject({
      _id: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      attemptOrdinal: 2,
      score: 2,
      maxScore: 2,
      submittedAt: Date.parse(DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMITTED_AT),
      gradedAt: Date.parse(DOMAIN_RANGE_INDEPENDENT_SEED_2_GRADED_AT),
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      attemptNumber: 2,
      mode: "independent_practice",
      submittedAt: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMITTED_AT,
      status: "graded",
      answers: {
        domain: "all_real_numbers",
        range: { relation: "gte", boundary: 1.75 },
      },
      parts: [
        { partId: "domain", rawAnswer: "all_real_numbers", isCorrect: true, score: 1, maxScore: 1 },
        {
          partId: "range",
          rawAnswer: { relation: "gte", boundary: 1.75 },
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_DOMAIN_RANGE_NODE,
        activityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(DOMAIN_RANGE_INDEPENDENT_SEED_2_GRADED_AT),
        idempotencyKey: `im3:mastery-advantage:submission:${DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID}`,
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the domain-range Independent seed-2 SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_DOMAIN_RANGE_NODE,
      variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: DOMAIN_RANGE_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact profit-model Guided SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows } = makeCtx({ profitModelGuided: true });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        nodeId: IM3_PROFIT_MODEL_NODE,
        activityId: PROFIT_MODEL_GUIDED_STABLE_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "guided_practice",
        occurredAt: Date.parse(SERVER_GRADED_AT),
        gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the profit-model Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_PROFIT_MODEL_NODE,
      variantKey: PROFIT_MODEL_GUIDED_STABLE_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact graph Guided seed-2 SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({ graphGuidedSeed2: true });
    const generated = buildIm3GraphGuidedSeed2Documents(
      GRAPH_GUIDED_SEED_2_ACTIVITY_ID as never,
      Date.parse(GRAPH_GUIDED_SEED_2_SUBMITTED_AT),
    );

    expect(activity).toMatchObject({
      _id: GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      componentKey: "graphing-explorer",
      srsEligible: true,
      props: generated.activity.props,
      gradingConfig: generated.activity.gradingConfig,
    });
    expect(submission).toMatchObject({
      activityId: GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 2,
      score: 2,
      maxScore: 2,
      submittedAt: Date.parse(GRAPH_GUIDED_SEED_2_SUBMITTED_AT),
      gradedAt: Date.parse(GRAPH_GUIDED_SEED_2_GRADED_AT),
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      attemptNumber: 2,
      mode: "guided_practice",
      status: "graded",
      submittedAt: GRAPH_GUIDED_SEED_2_SUBMITTED_AT,
      answers: {
        tableValues: GRAPH_GUIDED_SEED_2_POINTS,
        placedPoints: GRAPH_GUIDED_SEED_2_POINTS,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: GRAPH_GUIDED_SEED_2_POINTS,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: GRAPH_GUIDED_SEED_2_POINTS,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: NODE_ID,
        activityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "guided_practice",
        occurredAt: Date.parse(GRAPH_GUIDED_SEED_2_GRADED_AT),
        idempotencyKey: `im3:mastery-advantage:submission:${GRAPH_GUIDED_SEED_2_SUBMISSION_ID}`,
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the graph Guided seed-2 SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: NODE_ID,
      variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
    });
    expect(card.variantKey).not.toBe(IM3_GUIDED_VARIANT_KEY);
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: GRAPH_GUIDED_SEED_2_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact graph Independent seed-2 SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({ graphIndependentSeed2: true });
    const generated = buildIm3GraphIndependentSeed2Documents(
      GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID as never,
      Date.parse(GRAPH_INDEPENDENT_SEED_2_SUBMITTED_AT),
    );

    expect(activity).toMatchObject({
      _id: GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      componentKey: "graphing-explorer",
      srsEligible: true,
      props: generated.activity.props,
      gradingConfig: generated.activity.gradingConfig,
    });
    expect(activity).toMatchObject({
      props: { equation: "y = x^2 - x + 2" },
    });
    expect(submission).toMatchObject({
      activityId: GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 3,
      score: 2,
      maxScore: 2,
      submittedAt: Date.parse(GRAPH_INDEPENDENT_SEED_2_SUBMITTED_AT),
      gradedAt: Date.parse(GRAPH_INDEPENDENT_SEED_2_GRADED_AT),
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      attemptNumber: 3,
      mode: "independent_practice",
      status: "graded",
      submittedAt: GRAPH_INDEPENDENT_SEED_2_SUBMITTED_AT,
      answers: {
        tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
        placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
      },
      parts: [
        {
          partId: "table_values",
          rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        {
          partId: "placed_points",
          rawAnswer: GRAPH_INDEPENDENT_SEED_2_POINTS,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: NODE_ID,
        activityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(GRAPH_INDEPENDENT_SEED_2_GRADED_AT),
        idempotencyKey: `im3:mastery-advantage:submission:${GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID}`,
        gradedEvidence: { isCorrect: true, score: 2, maxScore: 2 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the graph Independent seed-2 SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: NODE_ID,
      variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
    });
    expect(card.variantKey).not.toBe(IM3_PILOT_VARIANT_KEY);
    expect(card.variantKey).not.toBe(IM3_GUIDED_VARIANT_KEY);
    expect(card.variantKey).not.toBe(IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY);
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: GRAPH_INDEPENDENT_SEED_2_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact maximum-profit Guided SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission } = makeCtx({ profitMaximumGuided: true });
    const generated = buildIm3ProfitMaximumGuidedSeedDocuments(
      PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID as never,
      Date.parse(PROFIT_MAXIMUM_GUIDED_SUBMITTED_AT),
    );
    const blanks = generated.activity.props.blanks;

    expect(submission.submissionData).toMatchObject({
      contractVersion: "practice.v1",
      activityId: PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      attemptNumber: 2,
      mode: "guided_practice",
      answers: Object.fromEntries(
        blanks.map((blank) => [
          blank.id,
          {
            answer: blank.correctAnswer,
            isCorrect: false,
            usedWordBank: true,
          },
        ]),
      ),
      parts: blanks.map((blank) => ({
        partId: blank.id,
        rawAnswer: blank.correctAnswer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_PROFIT_MAXIMUM_NODE,
        activityId: PROFIT_MAXIMUM_GUIDED_STABLE_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "guided_practice",
        occurredAt: Date.parse(SERVER_GRADED_AT),
        idempotencyKey: `im3:mastery-advantage:submission:${PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID}`,
        gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the maximum-profit Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_PROFIT_MAXIMUM_NODE,
      variantKey: PROFIT_MAXIMUM_GUIDED_STABLE_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact maximum-profit Independent SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCtx({
      profitMaximumIndependent: true,
    });
    const generated = buildIm3ProfitMaximumIndependentSeedDocuments(
      PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID as never,
      Date.parse(PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT),
    );
    const blanks = generated.activity.props.blanks;

    expect(activity).toMatchObject({
      _id: PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      stableActivityId: PROFIT_MAXIMUM_INDEPENDENT_STABLE_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      componentKey: "fill-in-the-blank",
      srsEligible: true,
    });
    expect(submission).toMatchObject({
      activityId: PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 3,
      score: 3,
      maxScore: 3,
      submittedAt: Date.parse(PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT),
      gradedAt: Date.parse(PROFIT_MAXIMUM_INDEPENDENT_GRADED_AT),
    });
    expect(submission.submissionData).toMatchObject({
      contractVersion: "practice.v1",
      activityId: PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      attemptNumber: 3,
      mode: "independent_practice",
      submittedAt: PROFIT_MAXIMUM_INDEPENDENT_SUBMITTED_AT,
      status: "graded",
      answers: Object.fromEntries(
        blanks.map((blank) => [
          blank.id,
          {
            answer: blank.correctAnswer,
            isCorrect: false,
            usedWordBank: true,
          },
        ]),
      ),
      parts: blanks.map((blank) => ({
        partId: blank.id,
        rawAnswer: blank.correctAnswer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      })),
    });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_PROFIT_MAXIMUM_NODE,
        activityId: PROFIT_MAXIMUM_INDEPENDENT_STABLE_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(PROFIT_MAXIMUM_INDEPENDENT_GRADED_AT),
        idempotencyKey: `im3:mastery-advantage:submission:${PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID}`,
        gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the maximum-profit Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_PROFIT_MAXIMUM_NODE,
      variantKey: PROFIT_MAXIMUM_INDEPENDENT_STABLE_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact profit-model Independent SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, activity } = makeCtx({ profitModelIndependent: true });

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
    });

    expect(activity).toMatchObject({
      _id: PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      componentKey: "fill-in-the-blank",
      srsEligible: true,
    });
    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
    });
    expect(rows.learning_evidence).toEqual([
      expect.anything(),
      expect.objectContaining({
        nodeId: IM3_PROFIT_MODEL_NODE,
        activityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(SERVER_GRADED_AT),
        gradedEvidence: { isCorrect: true, score: 7, maxScore: 7 },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the profit-model Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_PROFIT_MODEL_NODE,
      variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: PROFIT_MODEL_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact compare-maximum Guided SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity, replace, teacherExposure, answer } =
      makeCompareMaximumGuidedProductionCtx();
    const guidedDocuments = buildIm3CompareMaximumGuidedSeedDocuments(
      COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID as never,
      Date.parse(COMPARE_MAXIMUM_GUIDED_SUBMITTED_AT),
    ).activity;

    expect(activity).toEqual({
      _id: COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      ...guidedDocuments,
    });
    expect(activity).toMatchObject({
      _id: COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      attemptNumber: 2,
      mode: "guided_practice",
      status: "graded",
      submittedAt: COMPARE_MAXIMUM_GUIDED_SUBMITTED_AT,
      answers: { greater_maximum: answer },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: answer,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(submission.masteryContractVersion).toBe("learning-evidence.v1");
    expect(submission.attemptOrdinal).toBe(2);
    expect(submission.submittedAt).toBe(Date.parse(COMPARE_MAXIMUM_GUIDED_SUBMITTED_AT) + 60_000);
    expect(submission.gradedAt).toBe(Date.parse(COMPARE_MAXIMUM_GUIDED_GRADED_AT));
    expect(teacherExposure).toMatchObject({
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      origin: "teacher_led",
      mode: "worked_example",
    });
    expect(rows.learning_evidence).toEqual([teacherExposure]);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    let first: Record<string, unknown> | undefined;
    let firstError: unknown;
    try {
      first = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
      });
    } catch (error) {
      firstError = error;
    }
    if (firstError !== undefined) {
      expect(rows.learning_evidence).toEqual([teacherExposure]);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts).toHaveLength(0);
      throw firstError;
    }

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_COMPARE_MAXIMUM_NODE,
        activityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "guided_practice",
        occurredAt: Date.parse(COMPARE_MAXIMUM_GUIDED_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the compare-maximum Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_COMPARE_MAXIMUM_NODE,
      variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it("persists one exact compare-maximum Independent SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity, replace, teacherExposure, answer } =
      makeCompareMaximumIndependentProductionCtx();
    const independentDocuments = buildIm3CompareMaximumIndependentSeedDocuments(
      COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID as never,
      Date.parse(COMPARE_MAXIMUM_INDEPENDENT_SUBMITTED_AT),
    ).activity;

    expect(activity).toEqual({
      _id: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      ...independentDocuments,
    });
    expect(activity).toMatchObject({
      _id: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      attemptNumber: 3,
      mode: "independent_practice",
      status: "graded",
      submittedAt: COMPARE_MAXIMUM_INDEPENDENT_SUBMITTED_AT,
      answers: { greater_maximum: answer },
      parts: [
        {
          partId: "greater_maximum",
          rawAnswer: answer,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(submission.masteryContractVersion).toBe("learning-evidence.v1");
    expect(submission.attemptOrdinal).toBe(3);
    expect(submission.submittedAt).toBe(
      Date.parse(COMPARE_MAXIMUM_INDEPENDENT_SUBMITTED_AT) + 60_000,
    );
    expect(submission.gradedAt).toBe(Date.parse(COMPARE_MAXIMUM_INDEPENDENT_GRADED_AT));
    expect(teacherExposure).toMatchObject({
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      origin: "teacher_led",
      mode: "worked_example",
    });
    expect(rows.learning_evidence).toEqual([teacherExposure]);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    let first: Record<string, unknown> | undefined;
    let firstError: unknown;
    try {
      first = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
      });
    } catch (error) {
      firstError = error;
    }
    if (firstError !== undefined) {
      expect(rows.learning_evidence).toEqual([teacherExposure]);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts).toHaveLength(0);
      throw firstError;
    }

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_COMPARE_MAXIMUM_NODE,
        activityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(COMPARE_MAXIMUM_INDEPENDENT_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the compare-maximum Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_COMPARE_MAXIMUM_NODE,
      variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it("persists one exact symmetry Guided SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity, replace, teacherExposure, placedPoints } =
      makeSymmetryGuidedProductionCtx();

    expect(activity).toMatchObject({
      _id: SYMMETRY_GUIDED_ACTIVITY_ID,
      stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      componentKey: "graphing-explorer",
      srsEligible: true,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: SYMMETRY_GUIDED_ACTIVITY_ID,
      attemptNumber: 2,
      mode: "guided_practice",
      status: "graded",
      submittedAt: SYMMETRY_GUIDED_SUBMITTED_AT,
      answers: { placed_points: placedPoints },
      parts: [
        {
          partId: "placed_points",
          rawAnswer: placedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(submission.masteryContractVersion).toBe("learning-evidence.v1");
    expect(submission.submittedAt).toBe(Date.parse(SYMMETRY_GUIDED_SUBMITTED_AT) + 60_000);
    expect(submission.gradedAt).toBe(Date.parse(SYMMETRY_GUIDED_GRADED_AT));
    expect(teacherExposure).toMatchObject({
      nodeId: IM3_SYMMETRY_NODE,
      activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
      origin: "teacher_led",
      mode: "worked_example",
    });
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    let first: Record<string, unknown> | undefined;
    let firstError: unknown;
    try {
      first = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: SYMMETRY_GUIDED_SUBMISSION_ID,
      });
    } catch (error) {
      firstError = error;
    }
    if (firstError !== undefined) {
      expect(rows.learning_evidence).toHaveLength(1);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts).toHaveLength(0);
      throw firstError;
    }

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: SYMMETRY_GUIDED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_SYMMETRY_NODE,
        activityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "guided_practice",
        occurredAt: Date.parse(SYMMETRY_GUIDED_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the symmetry Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_SYMMETRY_NODE,
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: SYMMETRY_GUIDED_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SYMMETRY_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it("persists one exact compare-maximum Worked source and replays without mastery or SRS effects", async () => {
    const { ctx, inserts, rows, submission, activity } = makeCompareMaximumWorkedProductionCtx();
    const workedDocument = buildIm3CompareMaximumWorkedSeedDocument(
      Date.parse(COMPARE_MAXIMUM_WORKED_SUBMITTED_AT),
    );

    expect(activity).toEqual({
      _id: COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      ...workedDocument,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example",
      status: "submitted",
      submittedAt: COMPARE_MAXIMUM_WORKED_SUBMITTED_AT,
      answers: {},
      parts: [],
    });
    expect(submission.submissionData.answers).toEqual({});
    expect(submission.submissionData.parts).toEqual([]);
    expect("score" in submission).toBe(false);
    expect("maxScore" in submission).toBe(false);
    expect("gradedAt" in submission).toBe(false);
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_COMPARE_MAXIMUM_NODE,
        activityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(COMPARE_MAXIMUM_WORKED_SUBMITTED_AT),
        idempotencyKey: `im3:teacher-led:submission:${COMPARE_MAXIMUM_WORKED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toEqual([
      expect.objectContaining({
        submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        decision: expect.objectContaining({
          reason: "teacher_led",
          masteryBearing: false,
        }),
      }),
    ]);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: COMPARE_MAXIMUM_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact one-real-solution Worked source and replays without mastery or SRS effects", async () => {
    const { ctx, inserts, rows, submission, activity } = makeOneRealSolutionWorkedProductionCtx();
    const workedDocument = buildIm3OneRealSolutionWorkedSeedDocument(
      Date.parse(ONE_REAL_SOLUTION_WORKED_SUBMITTED_AT),
    );

    expect(activity).toEqual({
      _id: ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
      ...workedDocument,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example",
      status: "submitted",
      submittedAt: ONE_REAL_SOLUTION_WORKED_SUBMITTED_AT,
      answers: {},
      parts: [],
    });
    expect(submission.attemptOrdinal).toBe(1);
    expect(submission.masteryContractVersion).toBe("learning-evidence.v1");
    expect(submission.submittedAt).toBe(Date.parse(ONE_REAL_SOLUTION_WORKED_SUBMITTED_AT));
    expect("score" in submission).toBe(false);
    expect("maxScore" in submission).toBe(false);
    expect("gradedAt" in submission).toBe(false);
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_ONE_REAL_SOLUTION_NODE,
        activityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(ONE_REAL_SOLUTION_WORKED_SUBMITTED_AT),
        idempotencyKey: `im3:teacher-led:submission:${ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toEqual([
      expect.objectContaining({
        submissionId: ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID,
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        decision: expect.objectContaining({
          reason: "teacher_led",
          masteryBearing: false,
        }),
      }),
    ]);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact two-real-solutions Worked source and replays without mastery or SRS effects", async () => {
    const context = makeOneRealSolutionWorkedProductionCtx();
    const { ctx, inserts, rows, submission, activity } = context;
    const submittedAt = TWO_REAL_SOLUTIONS_WORKED_SUBMITTED_AT;
    const workedDocument = buildIm3TwoRealSolutionsWorkedSeedDocument(Date.parse(submittedAt));

    Object.assign(activity, {
      _id: TWO_REAL_SOLUTIONS_WORKED_PHYSICAL_ACTIVITY_ID,
      ...workedDocument,
    });
    Object.assign(submission, {
      _id: TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID,
      userId: LEARNER_ID,
      activityId: TWO_REAL_SOLUTIONS_WORKED_PHYSICAL_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1" as const,
      attemptOrdinal: 1,
      submissionData: {
        contractVersion: "practice.v1" as const,
        activityId: TWO_REAL_SOLUTIONS_WORKED_PHYSICAL_ACTIVITY_ID,
        attemptNumber: 1,
        mode: "worked_example" as const,
        status: "submitted" as const,
        submittedAt,
        answers: {},
        parts: [],
      },
      submittedAt: Date.parse(submittedAt),
    });

    expect(activity).toEqual({
      _id: TWO_REAL_SOLUTIONS_WORKED_PHYSICAL_ACTIVITY_ID,
      ...workedDocument,
    });
    expect(submission).toEqual({
      _id: TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID,
      userId: LEARNER_ID,
      activityId: TWO_REAL_SOLUTIONS_WORKED_PHYSICAL_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 1,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: TWO_REAL_SOLUTIONS_WORKED_PHYSICAL_ACTIVITY_ID,
        attemptNumber: 1,
        mode: "worked_example",
        status: "submitted",
        submittedAt,
        answers: {},
        parts: [],
      },
      submittedAt: Date.parse(submittedAt),
    });
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
        activityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(submittedAt),
        idempotencyKey: `im3:teacher-led:submission:${TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toEqual([
      expect.objectContaining({
        submissionId: TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID,
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        decision: expect.objectContaining({
          reason: "teacher_led",
          masteryBearing: false,
        }),
      }),
    ]);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: TWO_REAL_SOLUTIONS_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact one-real-solution Guided SRS card and review and none on replay", async () => {
    const {
      ctx,
      inserts,
      rows,
      submission,
      activity,
      replace,
      teacherExposure,
      tableValues,
      placedPoints,
      solution,
    } = makeOneRealSolutionGuidedProductionCtx();
    const guidedDocument = buildIm3OneRealSolutionGuidedSeedDocument(
      Date.parse(ONE_REAL_SOLUTION_GUIDED_SUBMITTED_AT),
    );

    expect(activity).toEqual({
      _id: ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      ...guidedDocument,
    });
    expect(submission).toEqual({
      _id: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
      userId: LEARNER_ID,
      activityId: ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 2,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        attemptNumber: 2,
        mode: "guided_practice",
        status: "graded",
        submittedAt: ONE_REAL_SOLUTION_GUIDED_SUBMITTED_AT,
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solution,
        },
        parts: [
          {
            partId: "table_values",
            rawAnswer: tableValues,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "placed_points",
            rawAnswer: placedPoints,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "solution",
            rawAnswer: solution,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
        artifact: {
          graphState: {
            originalEquation: guidedDocument.props.originalEquation,
            equation: guidedDocument.props.equation,
            tableValues,
            placedPoints,
            domain: guidedDocument.props.domain,
            range: guidedDocument.props.range,
          },
        },
      },
      score: 3,
      maxScore: 3,
      submittedAt: Date.parse(ONE_REAL_SOLUTION_GUIDED_SUBMITTED_AT) + 60_000,
      gradedAt: Date.parse(ONE_REAL_SOLUTION_GUIDED_GRADED_AT),
    });
    expect(rows.learning_evidence).toEqual([teacherExposure]);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_ONE_REAL_SOLUTION_NODE,
        activityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "guided_practice",
        occurredAt: Date.parse(ONE_REAL_SOLUTION_GUIDED_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 3,
          maxScore: 3,
        },
        idempotencyKey: `im3:mastery-advantage:submission:${ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the one-real-solution Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
      variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it("persists one exact two-real-solutions Guided SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity, replace, teacherExposure } =
      makeOneRealSolutionGuidedProductionCtx();
    const clientSubmittedAt = TWO_REAL_SOLUTIONS_GUIDED_SUBMITTED_AT;
    const physicalActivityId = TWO_REAL_SOLUTIONS_GUIDED_PHYSICAL_ACTIVITY_ID;
    const guidedDocument = buildIm3TwoRealSolutionsGuidedSeedDocument(
      Date.parse(clientSubmittedAt),
    );
    const generated = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 5,
      difficulty: 0.5,
    });
    const tableValues = generated.expectedAnswer.table_values as Array<{ x: number; y: number }>;
    const placedPoints = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
    const solutions = generated.expectedAnswer.solutions as number[];

    Object.assign(activity, {
      _id: physicalActivityId,
      ...guidedDocument,
    });
    Object.assign(submission, {
      _id: TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID,
      activityId: physicalActivityId,
      masteryContractVersion: "learning-evidence.v1" as const,
      attemptOrdinal: 2,
      submissionData: {
        contractVersion: "practice.v1" as const,
        activityId: physicalActivityId,
        attemptNumber: 2,
        mode: "guided_practice" as const,
        status: "graded" as const,
        submittedAt: clientSubmittedAt,
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solutions,
        },
        parts: [
          {
            partId: "table_values",
            rawAnswer: tableValues,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "placed_points",
            rawAnswer: placedPoints,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "solutions",
            rawAnswer: solutions,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
        artifact: {
          graphState: {
            originalEquation: guidedDocument.props.originalEquation,
            equation: guidedDocument.props.equation,
            tableValues,
            placedPoints,
            domain: guidedDocument.props.domain,
            range: guidedDocument.props.range,
          },
        },
      },
      score: 3,
      maxScore: 3,
      submittedAt: Date.parse(clientSubmittedAt) + 60_000,
      gradedAt: Date.parse(TWO_REAL_SOLUTIONS_GUIDED_GRADED_AT),
    });
    Object.assign(teacherExposure, {
      _id: "two-real-solutions-worked-exposure-evidence",
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      activityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
      occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
      idempotencyKey: "two-real-solutions-worked-exposure-before-production-factory",
    });

    expect(activity).toEqual({
      _id: physicalActivityId,
      ...guidedDocument,
    });
    expect(submission).toEqual({
      _id: TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID,
      userId: LEARNER_ID,
      activityId: physicalActivityId,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 2,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: physicalActivityId,
        attemptNumber: 2,
        mode: "guided_practice",
        status: "graded",
        submittedAt: clientSubmittedAt,
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solutions,
        },
        parts: [
          {
            partId: "table_values",
            rawAnswer: tableValues,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "placed_points",
            rawAnswer: placedPoints,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "solutions",
            rawAnswer: solutions,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
        artifact: {
          graphState: {
            originalEquation: guidedDocument.props.originalEquation,
            equation: guidedDocument.props.equation,
            tableValues,
            placedPoints,
            domain: guidedDocument.props.domain,
            range: guidedDocument.props.range,
          },
        },
      },
      score: 3,
      maxScore: 3,
      submittedAt: Date.parse(clientSubmittedAt) + 60_000,
      gradedAt: Date.parse(TWO_REAL_SOLUTIONS_GUIDED_GRADED_AT),
    });
    expect(teacherExposure).toEqual({
      _id: "two-real-solutions-worked-exposure-evidence",
      learnerId: LEARNER_ID,
      contractVersion: "learning-evidence.v1",
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      activityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: "teacher_led",
      mode: "worked_example",
      occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
      idempotencyKey: "two-real-solutions-worked-exposure-before-production-factory",
      createdAt: Date.parse("2026-08-20T09:00:00.000Z"),
    });
    expect(rows.learning_evidence).toEqual([teacherExposure]);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
        activityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: "mastery_advantage",
        mode: "guided_practice",
        occurredAt: Date.parse(TWO_REAL_SOLUTIONS_GUIDED_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 3,
          maxScore: 3,
        },
        idempotencyKey: `im3:mastery-advantage:submission:${TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the two-real-solutions Guided SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_TWO_REAL_SOLUTIONS_NODE,
      variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: TWO_REAL_SOLUTIONS_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it("persists one exact two-real-solutions Independent SRS card and review and none on replay", async () => {
    const { ctx, inserts, rows, submission, activity, replace, teacherExposure } =
      makeOneRealSolutionIndependentProductionCtx();
    const clientSubmittedAt = TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMITTED_AT;
    const physicalActivityId = TWO_REAL_SOLUTIONS_INDEPENDENT_PHYSICAL_ACTIVITY_ID;
    const document = buildIm3TwoRealSolutionsIndependentSeedDocument(Date.parse(clientSubmittedAt));
    const generated = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 2,
      difficulty: 0.5,
    });
    const tableValues = generated.expectedAnswer.table_values as Array<{ x: number; y: number }>;
    const placedPoints = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
    const solutions = generated.expectedAnswer.solutions as number[];

    Object.assign(activity, {
      _id: physicalActivityId,
      ...document,
    });
    Object.assign(submission, {
      _id: TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID,
      activityId: physicalActivityId,
      masteryContractVersion: "learning-evidence.v1" as const,
      attemptOrdinal: 3,
      submissionData: {
        contractVersion: "practice.v1" as const,
        activityId: physicalActivityId,
        attemptNumber: 3,
        mode: "independent_practice" as const,
        status: "graded" as const,
        submittedAt: clientSubmittedAt,
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solutions,
        },
        parts: [
          {
            partId: "table_values",
            rawAnswer: tableValues,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "placed_points",
            rawAnswer: placedPoints,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "solutions",
            rawAnswer: solutions,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
        artifact: {
          graphState: {
            originalEquation: document.props.originalEquation,
            equation: document.props.equation,
            tableValues,
            placedPoints,
            domain: document.props.domain,
            range: document.props.range,
          },
        },
      },
      score: 3,
      maxScore: 3,
      submittedAt: Date.parse(clientSubmittedAt) + 60_000,
      gradedAt: Date.parse(TWO_REAL_SOLUTIONS_INDEPENDENT_GRADED_AT),
    });
    Object.assign(teacherExposure, {
      _id: "two-real-solutions-worked-exposure-evidence",
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      activityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
      occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
      idempotencyKey: "two-real-solutions-worked-exposure-before-production-factory",
    });

    expect(activity).toEqual({
      _id: physicalActivityId,
      ...document,
    });
    expect(submission).toEqual({
      _id: TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID,
      userId: LEARNER_ID,
      activityId: physicalActivityId,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 3,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: physicalActivityId,
        attemptNumber: 3,
        mode: "independent_practice",
        status: "graded",
        submittedAt: clientSubmittedAt,
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solutions,
        },
        parts: [
          {
            partId: "table_values",
            rawAnswer: tableValues,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "placed_points",
            rawAnswer: placedPoints,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "solutions",
            rawAnswer: solutions,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
        artifact: {
          graphState: {
            originalEquation: document.props.originalEquation,
            equation: document.props.equation,
            tableValues,
            placedPoints,
            domain: document.props.domain,
            range: document.props.range,
          },
        },
      },
      score: 3,
      maxScore: 3,
      submittedAt: Date.parse(clientSubmittedAt) + 60_000,
      gradedAt: Date.parse(TWO_REAL_SOLUTIONS_INDEPENDENT_GRADED_AT),
    });
    expect(teacherExposure).toEqual({
      _id: "two-real-solutions-worked-exposure-evidence",
      learnerId: LEARNER_ID,
      contractVersion: "learning-evidence.v1",
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      activityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: "teacher_led",
      mode: "worked_example",
      occurredAt: Date.parse("2026-08-20T09:00:00.000Z"),
      idempotencyKey: "two-real-solutions-worked-exposure-before-production-factory",
      createdAt: Date.parse("2026-08-20T09:00:00.000Z"),
    });
    expect(rows.learning_evidence).toEqual([teacherExposure]);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
        activityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(TWO_REAL_SOLUTIONS_INDEPENDENT_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 3,
          maxScore: 3,
        },
        idempotencyKey: `im3:mastery-advantage:submission:${TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the two-real-solutions Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_TWO_REAL_SOLUTIONS_NODE,
      variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: TWO_REAL_SOLUTIONS_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it("persists one valid partial one-real-solution Guided attempt as evidence and SRS", async () => {
    const {
      ctx,
      inserts,
      rows,
      submission,
      replace,
      teacherExposure,
      tableValues,
      placedPoints,
      solution,
    } = makeOneRealSolutionGuidedProductionCtx();
    const incorrectTableValues = tableValues.map((point, index) =>
      index === 0 ? { ...point, y: point.y + 1 } : point,
    );
    const data = submission.submissionData as Record<string, unknown>;
    const answers = data.answers as Record<string, unknown>;
    answers.table_values = incorrectTableValues;
    const parts = data.parts as Array<Record<string, unknown>>;
    parts[0]!.rawAnswer = incorrectTableValues;
    parts[0]!.isCorrect = false;
    parts[0]!.score = 0;
    parts[0]!.maxScore = 1;
    const artifact = data.artifact as Record<string, unknown>;
    const graphState = artifact.graphState as Record<string, unknown>;
    graphState.tableValues = incorrectTableValues;
    submission.score = 2;
    submission.maxScore = 3;

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_ONE_REAL_SOLUTION_NODE,
        activityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        mode: "guided_practice",
        gradedEvidence: {
          isCorrect: false,
          score: 2,
          maxScore: 3,
        },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
      variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
    });
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the partial one-real-solution Guided SRS card");
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
    expect(answers).toMatchObject({
      placed_points: placedPoints,
      solution,
    });
  });

  it("persists one exact one-real-solution Independent SRS card and review and none on replay", async () => {
    const {
      ctx,
      inserts,
      rows,
      submission,
      activity,
      replace,
      teacherExposure,
      tableValues,
      placedPoints,
      solution,
      document,
    } = makeOneRealSolutionIndependentProductionCtx();

    expect(activity).toEqual({
      _id: ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      ...document,
    });
    expect(submission).toEqual({
      _id: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
      userId: LEARNER_ID,
      activityId: ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      masteryContractVersion: "learning-evidence.v1",
      attemptOrdinal: 3,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        attemptNumber: 3,
        mode: "independent_practice",
        status: "graded",
        submittedAt: ONE_REAL_SOLUTION_INDEPENDENT_SUBMITTED_AT,
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solution,
        },
        parts: [
          {
            partId: "table_values",
            rawAnswer: tableValues,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "placed_points",
            rawAnswer: placedPoints,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
          {
            partId: "solution",
            rawAnswer: solution,
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        ],
        artifact: {
          graphState: {
            originalEquation: document.props.originalEquation,
            equation: document.props.equation,
            tableValues,
            placedPoints,
            domain: document.props.domain,
            range: document.props.range,
          },
        },
      },
      score: 3,
      maxScore: 3,
      submittedAt: Date.parse(ONE_REAL_SOLUTION_INDEPENDENT_SUBMITTED_AT) + 60_000,
      gradedAt: Date.parse(ONE_REAL_SOLUTION_INDEPENDENT_GRADED_AT),
    });
    expect(rows.learning_evidence).toEqual([teacherExposure]);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_ONE_REAL_SOLUTION_NODE,
        activityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(ONE_REAL_SOLUTION_INDEPENDENT_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 3,
          maxScore: 3,
        },
        idempotencyKey: `im3:mastery-advantage:submission:${ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the one-real-solution Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
      variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it("persists one valid partial one-real-solution Independent attempt as evidence and SRS", async () => {
    const { ctx, inserts, rows, submission, replace, teacherExposure, placedPoints } =
      makeOneRealSolutionIndependentProductionCtx();
    const incorrectPlacedPoints = placedPoints.map((point, index) =>
      index === 0 ? { ...point, y: point.y + 1 } : point,
    );
    const data = submission.submissionData as Record<string, unknown>;
    const answers = data.answers as Record<string, unknown>;
    answers.placed_points = incorrectPlacedPoints;
    const parts = data.parts as Array<Record<string, unknown>>;
    parts[1]!.rawAnswer = incorrectPlacedPoints;
    parts[1]!.isCorrect = false;
    parts[1]!.score = 0;
    parts[1]!.maxScore = 1;
    const artifact = data.artifact as Record<string, unknown>;
    const graphState = artifact.graphState as Record<string, unknown>;
    graphState.placedPoints = incorrectPlacedPoints;
    submission.score = 2;
    submission.maxScore = 3;

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_ONE_REAL_SOLUTION_NODE,
        activityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        mode: "independent_practice",
        gradedEvidence: {
          isCorrect: false,
          score: 2,
          maxScore: 3,
        },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the partial one-real-solution Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
      variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });

  it.each(oneRealSolutionGuidedCorruptions)(
    "rejects a one-real-solution Guided source with $name corruption before effects",
    async ({ override }) => {
      const { ctx, inserts, rows, submission, activity, replace, teacherExposure } =
        makeOneRealSolutionGuidedProductionCtx();

      override({
        submission: submission as unknown as Record<string, unknown>,
        activity: activity as unknown as Record<string, unknown>,
      });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: ONE_REAL_SOLUTION_GUIDED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toEqual([teacherExposure]);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts).toHaveLength(0);
      expect(replace).not.toHaveBeenCalled();
    },
  );

  it.each(oneRealSolutionIndependentCorruptions)(
    "rejects a one-real-solution Independent source with $name corruption before effects",
    async ({ override }) => {
      const { ctx, inserts, rows, submission, activity, replace, teacherExposure } =
        makeOneRealSolutionIndependentProductionCtx();

      override({
        submission: submission as unknown as Record<string, unknown>,
        activity: activity as unknown as Record<string, unknown>,
      });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: ONE_REAL_SOLUTION_INDEPENDENT_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toEqual([teacherExposure]);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts).toHaveLength(0);
      expect(replace).not.toHaveBeenCalled();
    },
  );

  it.each(oneRealSolutionWorkedCorruptions)(
    "rejects a one-real-solution Worked source with $name corruption before effects",
    async ({ override }) => {
      const { ctx, rows, submission, activity } = makeOneRealSolutionWorkedProductionCtx();

      override({
        submission: submission as unknown as Record<string, unknown>,
        activity: activity as unknown as Record<string, unknown>,
      });

      const result = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: ONE_REAL_SOLUTION_WORKED_SUBMISSION_ID,
      });

      expect(result).toEqual({ accepted: false, reason: "submission_not_found" });
      expect(rows.learning_evidence).toHaveLength(0);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
    },
  );

  it("persists one exact symmetry Worked source and replays without mastery effects", async () => {
    const { ctx, inserts, rows, submission, activity } = makeSymmetryWorkedProductionCtx();
    const workedDocument = buildIm3SymmetryWorkedSeedDocument(
      Date.parse(SYMMETRY_WORKED_SUBMITTED_AT),
    );

    expect(activity).toEqual({
      _id: SYMMETRY_WORKED_ACTIVITY_ID,
      ...workedDocument,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: SYMMETRY_WORKED_ACTIVITY_ID,
      attemptNumber: 1,
      mode: "worked_example",
      status: "submitted",
      submittedAt: SYMMETRY_WORKED_SUBMITTED_AT,
      answers: {},
      parts: [],
    });
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(rows.learning_evidence).toEqual([
      expect.objectContaining({
        submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_SYMMETRY_NODE,
        activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: "teacher_led",
        mode: "worked_example",
        occurredAt: Date.parse(SYMMETRY_WORKED_SUBMITTED_AT),
        idempotencyKey: `im3:teacher-led:submission:${SYMMETRY_WORKED_SUBMISSION_ID}`,
      }),
    ]);
    expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toEqual([
      expect.objectContaining({
        submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        decision: expect.objectContaining({
          reason: "teacher_led",
          masteryBearing: false,
        }),
      }),
    ]);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SYMMETRY_WORKED_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "replay",
      decision: {
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(inserts).toStrictEqual(writesAfterFirst);
  });

  it("persists one exact symmetry Independent SRS card and review and replays without new effects", async () => {
    const { ctx, inserts, rows, submission, activity, replace, teacherExposure, placedPoints } =
      makeSymmetryIndependentProductionCtx();
    const independentDocument = buildIm3SymmetryIndependentSeedDocuments(
      SYMMETRY_INDEPENDENT_ACTIVITY_ID as never,
      Date.parse(SYMMETRY_INDEPENDENT_SUBMITTED_AT),
    ).activity;

    expect(activity).toEqual({
      _id: SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      ...independentDocument,
    });
    expect(submission.submissionData).toEqual({
      contractVersion: "practice.v1",
      activityId: SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      attemptNumber: 3,
      mode: "independent_practice",
      status: "graded",
      submittedAt: SYMMETRY_INDEPENDENT_SUBMITTED_AT,
      answers: { placed_points: placedPoints },
      parts: [
        {
          partId: "placed_points",
          rawAnswer: placedPoints,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      ],
    });
    expect(activity.srsEligible).toBe(true);
    expect(activity.stableActivityId).toBe(IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID);
    expect(activity.masteryNodeId).toBe(IM3_SYMMETRY_NODE);
    expect(activity.componentKey).toBe("graphing-explorer");
    expect(submission.masteryContractVersion).toBe("learning-evidence.v1");
    expect(submission.submittedAt).toBe(Date.parse(SYMMETRY_INDEPENDENT_SUBMITTED_AT) + 60_000);
    expect(submission.gradedAt).toBe(Date.parse(SYMMETRY_INDEPENDENT_GRADED_AT));
    expect(rows.learning_evidence).toEqual([teacherExposure]);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    let first: Record<string, unknown> | undefined;
    let firstError: unknown;
    try {
      first = await submitHandler(ctx, {
        learnerId: LEARNER_ID,
        submissionId: SYMMETRY_INDEPENDENT_SUBMISSION_ID,
      });
    } catch (error) {
      firstError = error;
    }
    if (firstError !== undefined) {
      expect(rows.learning_evidence).toHaveLength(1);
      expect(rows.learning_evidence_receipts).toHaveLength(0);
      expect(rows.srs_cards).toHaveLength(0);
      expect(rows.srs_review_log).toHaveLength(0);
      expect(inserts).toHaveLength(0);
      throw firstError;
    }

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "new",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toEqual([
      teacherExposure,
      expect.objectContaining({
        submissionId: SYMMETRY_INDEPENDENT_SUBMISSION_ID,
        contractVersion: "learning-evidence.v1",
        nodeId: IM3_SYMMETRY_NODE,
        activityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        attemptOrdinal: 3,
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: Date.parse(SYMMETRY_INDEPENDENT_GRADED_AT),
        gradedEvidence: {
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
      }),
    ]);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    const card = rows.srs_cards[0];
    if (!card) throw new Error("expected the symmetry Independent SRS card");
    expect(card).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: IM3_SYMMETRY_NODE,
      variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toEqual([
      expect.objectContaining({
        studentId: LEARNER_ID,
        cardId: card._id,
        submissionId: SYMMETRY_INDEPENDENT_SUBMISSION_ID,
      }),
    ]);
    expect(inserts.map((entry) => entry.tableName)).toEqual([
      "srs_cards",
      "srs_review_log",
      "learning_evidence",
      "learning_evidence_receipts",
    ]);
    expect(replace).not.toHaveBeenCalled();
    const writesAfterFirst = [...inserts];

    const replay = await submitHandler(ctx, {
      learnerId: LEARNER_ID,
      submissionId: SYMMETRY_INDEPENDENT_SUBMISSION_ID,
    });

    expect(replay).toMatchObject({
      persisted: true,
      masteryApplied: true,
      kstApplied: true,
      delivery: "replay",
      decision: {
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(inserts).toStrictEqual(writesAfterFirst);
    expect(replace).not.toHaveBeenCalled();
  });
});
