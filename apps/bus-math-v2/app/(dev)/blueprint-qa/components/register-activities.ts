'use client';

import { lazy } from 'react';
import { registerActivity } from '@math-platform/activity-components/registry';

// Lazy-loaded activity components from the shared package
const FillInTheBlankActivity = lazy(() =>
  import('@math-platform/activity-components/blanks').then((m) => ({ default: m.FillInTheBlankActivity })),
);
const GraphingExplorerActivity = lazy(() =>
  import('@math-platform/activity-components/graphing').then((m) => ({ default: m.GraphingExplorerActivity })),
);
const StepByStepSolverActivity = lazy(() =>
  import('@math-platform/activity-components/algebraic').then((m) => ({ default: m.StepByStepSolverActivity })),
);
const ComprehensionQuizActivity = lazy(() =>
  import('@math-platform/activity-components/quiz').then((m) => ({ default: m.ComprehensionQuiz })),
);
const RateOfChangeCalculatorActivity = lazy(() =>
  import('@math-platform/activity-components/roc').then((m) => ({ default: m.RateOfChangeCalculatorActivity })),
);
const DiscriminantAnalyzerActivity = lazy(() =>
  import('@math-platform/activity-components/discriminant').then((m) => ({ default: m.DiscriminantAnalyzerActivity })),
);
const IntervalClassificationActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.IntervalClassificationActivity })),
);
const PhysicalContextGraphChoiceActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PhysicalContextGraphChoiceActivity })),
);
const TableAverageRateChoiceActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.TableAverageRateChoiceActivity })),
);
const GraphAverageRateChoiceActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.GraphAverageRateChoiceActivity })),
);
const PointwiseLeastRateChoiceActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PointwiseLeastRateChoiceActivity })),
);
const PointwiseRateOrderingActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PointwiseRateOrderingActivity })),
);
const NegativeRateContextChoiceActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.NegativeRateContextChoiceActivity })),
);
const QuadraticNegativeRateIntervalChoiceActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.QuadraticNegativeRateIntervalChoiceActivity })),
);
const RatePatternClassificationActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.RatePatternClassificationActivity })),
);
const ConcavityFromRateChangeActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.ConcavityFromRateChangeActivity })),
);
const PolynomialDegreeLeadingCoefficientActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PolynomialDegreeLeadingCoefficientActivity })),
);
const PolynomialExtremaFromGraphActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PolynomialExtremaFromGraphActivity })),
);
const RateSignAndTrendFromGraphActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.RateSignAndTrendFromGraphActivity })),
);
const PolynomialEndBehaviorActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PolynomialEndBehaviorActivity })),
);
const RealZerosAndMultiplicitiesActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.RealZerosAndMultiplicitiesActivity })),
);
const LeastPolynomialDegreeActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.LeastPolynomialDegreeActivity })),
);
const PolynomialInequalitySignChartActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PolynomialInequalitySignChartActivity })),
);
const PolynomialEquationEndBehaviorActivity = lazy(() =>
  import('@math-platform/activity-components').then((m) => ({ default: m.PolynomialEquationEndBehaviorActivity })),
);

let registered = false;

/**
 * Registers all blueprint activities with the runtime (idempotent).
 */
export function ensureActivitiesRegistered(): void {
  if (registered) return;
  registered = true;

  registerActivity('fill-in-the-blank', FillInTheBlankActivity);
  registerActivity('graphing-explorer', GraphingExplorerActivity);
  registerActivity('step-by-step-solver', StepByStepSolverActivity);
  registerActivity('comprehension-quiz', ComprehensionQuizActivity);
  registerActivity('rate-of-change-calculator', RateOfChangeCalculatorActivity);
  registerActivity('discriminant-analyzer', DiscriminantAnalyzerActivity);
  registerActivity('interval-classification', IntervalClassificationActivity);
  registerActivity('physical-context-graph-choice', PhysicalContextGraphChoiceActivity);
  registerActivity('table-average-rate-choice', TableAverageRateChoiceActivity);
  registerActivity('graph-average-rate-choice', GraphAverageRateChoiceActivity);
  registerActivity('pointwise-least-rate-choice', PointwiseLeastRateChoiceActivity);
  registerActivity('pointwise-rate-ordering', PointwiseRateOrderingActivity);
  registerActivity('negative-rate-context-choice', NegativeRateContextChoiceActivity);
  registerActivity('quadratic-negative-rate-interval-choice', QuadraticNegativeRateIntervalChoiceActivity);
  registerActivity('rate-pattern-classification', RatePatternClassificationActivity);
  registerActivity('concavity-from-rate-change', ConcavityFromRateChangeActivity);
  registerActivity('polynomial-degree-leading-coefficient', PolynomialDegreeLeadingCoefficientActivity);
  registerActivity('polynomial-extrema-from-graph', PolynomialExtremaFromGraphActivity);
  registerActivity('rate-sign-and-trend-from-graph', RateSignAndTrendFromGraphActivity);
  registerActivity('polynomial-end-behavior', PolynomialEndBehaviorActivity);
  registerActivity('real-zeros-and-multiplicities', RealZerosAndMultiplicitiesActivity);
  registerActivity('least-polynomial-degree', LeastPolynomialDegreeActivity);
  registerActivity('polynomial-inequality-sign-chart', PolynomialInequalitySignChartActivity);
  registerActivity('polynomial-equation-end-behavior', PolynomialEquationEndBehaviorActivity);
}
