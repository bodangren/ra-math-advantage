import { z } from "zod";
import { graphingExplorerSchema } from "./graphing-explorer.schema";
import { stepByStepSolverSchema } from "./step-by-step-solver.schema";
import { comprehensionQuizSchema } from "./comprehension-quiz.schema";
import { fillInTheBlankSchema } from "./fill-in-the-blank.schema";
import { rateOfChangeCalculatorSchema } from "./rate-of-change-calculator.schema";
import { discriminantAnalyzerSchema } from "./discriminant-analyzer.schema";
import { intervalClassificationSchema } from "./interval-classification.schema";
import { physicalContextGraphChoiceSchema } from "./physical-context-graph-choice.schema";
import { tableAverageRateChoiceSchema } from "./table-average-rate-choice.schema";
import { graphAverageRateChoiceSchema } from "./graph-average-rate-choice.schema";
import { pointwiseLeastRateChoiceSchema } from "./pointwise-least-rate-choice.schema";
import { pointwiseRateOrderingSchema } from "./pointwise-rate-ordering.schema";
import { negativeRateContextChoiceSchema } from "./negative-rate-context-choice.schema";
import { quadraticNegativeRateIntervalChoiceSchema } from "./quadratic-negative-rate-interval-choice.schema";
import { ratePatternClassificationSchema } from "./rate-pattern-classification.schema";
import { concavityFromRateChangeSchema } from "./concavity-from-rate-change.schema";
import { polynomialDegreeLeadingCoefficientSchema } from "./polynomial-degree-leading-coefficient.schema";
import { polynomialExtremaFromGraphSchema } from "./polynomial-extrema-from-graph.schema";
import { rateSignAndTrendFromGraphSchema } from "./rate-sign-and-trend-from-graph.schema";
import { polynomialEndBehaviorSchema } from "./polynomial-end-behavior.schema";
import { polynomialLimitNotationEndBehaviorSchema } from "./polynomial-limit-notation-end-behavior.schema";
import { realZerosAndMultiplicitiesSchema } from "./real-zeros-and-multiplicities.schema";
import { leastPolynomialDegreeSchema } from "./least-polynomial-degree.schema";
import { polynomialInequalitySignChartSchema } from "./polynomial-inequality-sign-chart.schema";
import { polynomialEquationEndBehaviorSchema } from "./polynomial-equation-end-behavior.schema";

export type ActivityComponentKey =
  | "graphing-explorer"
  | "step-by-step-solver"
  | "comprehension-quiz"
  | "fill-in-the-blank"
  | "rate-of-change-calculator"
  | "discriminant-analyzer"
  | "interval-classification"
  | "physical-context-graph-choice"
  | "table-average-rate-choice"
  | "graph-average-rate-choice"
  | "pointwise-least-rate-choice"
  | "pointwise-rate-ordering"
  | "negative-rate-context-choice"
  | "quadratic-negative-rate-interval-choice"
  | "rate-pattern-classification"
  | "concavity-from-rate-change"
  | "polynomial-degree-leading-coefficient"
  | "polynomial-extrema-from-graph"
  | "rate-sign-and-trend-from-graph"
  | "polynomial-end-behavior"
  | "polynomial-limit-notation-end-behavior"
  | "real-zeros-and-multiplicities"
  | "least-polynomial-degree"
  | "polynomial-inequality-sign-chart"
  | "polynomial-equation-end-behavior";

export const SCHEMA_REGISTRY: Record<ActivityComponentKey, z.ZodSchema> = {
  "graphing-explorer": graphingExplorerSchema,
  "step-by-step-solver": stepByStepSolverSchema,
  "comprehension-quiz": comprehensionQuizSchema,
  "fill-in-the-blank": fillInTheBlankSchema,
  "rate-of-change-calculator": rateOfChangeCalculatorSchema,
  "discriminant-analyzer": discriminantAnalyzerSchema,
  "interval-classification": intervalClassificationSchema,
  "physical-context-graph-choice": physicalContextGraphChoiceSchema,
  "table-average-rate-choice": tableAverageRateChoiceSchema,
  "graph-average-rate-choice": graphAverageRateChoiceSchema,
  "pointwise-least-rate-choice": pointwiseLeastRateChoiceSchema,
  "pointwise-rate-ordering": pointwiseRateOrderingSchema,
  "negative-rate-context-choice": negativeRateContextChoiceSchema,
  "quadratic-negative-rate-interval-choice": quadraticNegativeRateIntervalChoiceSchema,
  "rate-pattern-classification": ratePatternClassificationSchema,
  "concavity-from-rate-change": concavityFromRateChangeSchema,
  "polynomial-degree-leading-coefficient": polynomialDegreeLeadingCoefficientSchema,
  "polynomial-extrema-from-graph": polynomialExtremaFromGraphSchema,
  "rate-sign-and-trend-from-graph": rateSignAndTrendFromGraphSchema,
  "polynomial-end-behavior": polynomialEndBehaviorSchema,
  "polynomial-limit-notation-end-behavior": polynomialLimitNotationEndBehaviorSchema,
  "real-zeros-and-multiplicities": realZerosAndMultiplicitiesSchema,
  "least-polynomial-degree": leastPolynomialDegreeSchema,
  "polynomial-inequality-sign-chart": polynomialInequalitySignChartSchema,
  "polynomial-equation-end-behavior": polynomialEquationEndBehaviorSchema,
};

/**
 * Look up a Zod props schema by activity component key.
 * @param {string} key - Activity component key string
 * @returns {z.ZodSchema | undefined} - Matching Zod schema or undefined if not found
 */
export function getPropsSchema(key: string): z.ZodSchema | undefined {
  return SCHEMA_REGISTRY[key as ActivityComponentKey];
}

export * from "./types";
export * from "./graphing-explorer.schema";
export * from "./step-by-step-solver.schema";
export * from "./comprehension-quiz.schema";
export * from "./fill-in-the-blank.schema";
export * from "./rate-of-change-calculator.schema";
export * from "./discriminant-analyzer.schema";
export * from "./interval-classification.schema";
export * from "./physical-context-graph-choice.schema";
export * from "./table-average-rate-choice.schema";
export * from "./graph-average-rate-choice.schema";
export * from "./pointwise-least-rate-choice.schema";
export * from "./pointwise-rate-ordering.schema";
export * from "./negative-rate-context-choice.schema";
export * from "./quadratic-negative-rate-interval-choice.schema";
export * from "./rate-pattern-classification.schema";
export * from "./concavity-from-rate-change.schema";
export * from "./polynomial-degree-leading-coefficient.schema";
export * from "./polynomial-extrema-from-graph.schema";
export * from "./rate-sign-and-trend-from-graph.schema";
export * from "./polynomial-end-behavior.schema";
export * from "./polynomial-limit-notation-end-behavior.schema";
export * from "./real-zeros-and-multiplicities.schema";
export * from "./least-polynomial-degree.schema";
export * from "./polynomial-inequality-sign-chart.schema";
export * from "./polynomial-equation-end-behavior.schema";
