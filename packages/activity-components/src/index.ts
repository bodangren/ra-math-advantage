// @math-platform/activity-components
// Shared activity components for cross-app reuse (IM3, IM2, PreCalc)

export type { ActivityComponentProps, ActivityRegistration } from './types/index';
export { registerActivity, getActivityComponent, getRegisteredActivityKeys, clearActivityRegistry } from './registry/index';
export {
  SCHEMA_REGISTRY,
  getPropsSchema,
  rateSignAndTrendFromGraphSchema,
  polynomialEndBehaviorSchema,
  realZerosAndMultiplicitiesSchema,
} from './schemas/index';

export type { PrimitiveMode, MathPrimitiveProps, CoordinatePlaneValue, CoordinatePlaneConfig, CoordinatePlaneProps } from './primitives/index';
export { CoordinatePlane } from './primitives/index';
export type {
  ActivityComponentKey,
  ComprehensionQuizProps,
  QuestionType,
  FillInTheBlankProps,
  GraphingExplorerSchemaProps,
  StepByStepSolverProps,
  RateOfChangeCalculatorProps,
  DiscriminantAnalyzerProps,
  GraphingSubmissionInput,
  ProblemType,
  AlgebraicSubmissionInput,
  SourceType,
  IntervalClassificationProps,
  PhysicalContextGraphChoiceProps,
  TableAverageRateChoiceProps,
  GraphAverageRateChoiceProps,
  PointwiseLeastRateChoiceProps,
  PointwiseRateOrderingProps,
  NegativeRateContextChoiceProps,
  ConcavityFromRateChangeProps,
  PolynomialDegreeLeadingCoefficientProps,
  PolynomialExtremaFromGraphProps,
  RateSignAndTrendFromGraphProps,
  PolynomialEndBehaviorProps,
  RealZerosAndMultiplicitiesProps,
} from './schemas/index';

// ComprehensionQuiz
export { ComprehensionQuiz } from './components/quiz/ComprehensionQuiz';
export type { ComprehensionQuizProps as ComprehensionQuizComponentProps } from './components/quiz/ComprehensionQuiz';

// FillInTheBlank
export { FillInTheBlank } from './components/blanks/FillInTheBlank';
export { FillInTheBlankActivity } from './components/blanks/FillInTheBlankActivity';
export type { FillInTheBlankActivityProps } from './components/blanks/FillInTheBlankActivity';

// DiscriminantAnalyzer
export { DiscriminantAnalyzer } from './components/discriminant/DiscriminantAnalyzer';
export { DiscriminantAnalyzerActivity } from './components/discriminant/DiscriminantAnalyzerActivity';
export type { DiscriminantAnalyzerActivityProps } from './components/discriminant/DiscriminantAnalyzerActivity';

// RateOfChangeCalculator
export { RateOfChangeCalculator } from './components/roc/RateOfChangeCalculator';
export { RateOfChangeCalculatorActivity } from './components/roc/RateOfChangeCalculatorActivity';
export type { RateOfChangeCalculatorActivityProps } from './components/roc/RateOfChangeCalculatorActivity';

// StepByStepper / StepByStepSolver
export { StepByStepper } from './components/algebraic/StepByStepper';
export { StepByStepSolverActivity } from './components/algebraic/StepByStepSolverActivity';
export type {
  StepByStepperProps,
  AlgebraicStep,
  StepAttempt,
  StepMode,
} from './components/algebraic/StepByStepper';
export { MathInputField } from './components/algebraic/MathInputField';
export type { StepByStepSolverActivityProps } from './components/algebraic/StepByStepSolverActivity';

// GraphingExplorer
export { GraphingExplorer } from './components/graphing/GraphingExplorer';
export { GraphingExplorerActivity } from './components/graphing/GraphingExplorerActivity';
export { GraphingCanvas } from './components/graphing/GraphingCanvas';
export { HintPanel } from './components/graphing/HintPanel';
export { InterceptIdentification } from './components/graphing/InterceptIdentification';
export { InteractiveTableOfValues } from './components/graphing/InteractiveTableOfValues';
export type { GraphingExplorerProps } from './components/graphing/GraphingExplorer';
export type { GraphingExplorerActivityProps } from './components/graphing/GraphingExplorerActivity';
export type { Point, FunctionPlot } from './components/graphing/GraphingCanvas';
export type { HintData } from './components/graphing/HintPanel';
export type { InterceptData } from './components/graphing/InterceptIdentification';

// Interval classification
export { IntervalClassificationActivity } from './components/intervals/IntervalClassificationActivity';
export type { IntervalClassificationActivityProps } from './components/intervals/IntervalClassificationActivity';

// Physical-context graph choice
export { PhysicalContextGraphChoiceActivity } from './components/graph-choice/PhysicalContextGraphChoiceActivity';
export type { PhysicalContextGraphChoiceActivityProps } from './components/graph-choice/PhysicalContextGraphChoiceActivity';
export { GraphAverageRateChoiceActivity } from './components/graph-choice/GraphAverageRateChoiceActivity';
export type { GraphAverageRateChoiceActivityProps } from './components/graph-choice/GraphAverageRateChoiceActivity';
export { PointwiseLeastRateChoiceActivity } from './components/graph-choice/PointwiseLeastRateChoiceActivity';
export type { PointwiseLeastRateChoiceActivityProps } from './components/graph-choice/PointwiseLeastRateChoiceActivity';
export { PointwiseRateOrderingActivity } from './components/graph-choice/PointwiseRateOrderingActivity';
export type { PointwiseRateOrderingActivityProps } from './components/graph-choice/PointwiseRateOrderingActivity';
export { NegativeRateContextChoiceActivity } from './components/graph-choice/NegativeRateContextChoiceActivity';
export type { NegativeRateContextChoiceActivityProps } from './components/graph-choice/NegativeRateContextChoiceActivity';
export { QuadraticNegativeRateIntervalChoiceActivity } from './components/intervals/QuadraticNegativeRateIntervalChoiceActivity';
export type { QuadraticNegativeRateIntervalChoiceActivityProps } from './components/intervals/QuadraticNegativeRateIntervalChoiceActivity';
export { RatePatternClassificationActivity } from './components/table/RatePatternClassificationActivity';
export type { RatePatternClassificationActivityProps } from './components/table/RatePatternClassificationActivity';
export { ConcavityFromRateChangeActivity } from './components/table/ConcavityFromRateChangeActivity';
export type { ConcavityFromRateChangeActivityProps } from './components/table/ConcavityFromRateChangeActivity';
export { PolynomialDegreeLeadingCoefficientActivity } from './components/table/PolynomialDegreeLeadingCoefficientActivity';
export type { PolynomialDegreeLeadingCoefficientActivityProps } from './components/table/PolynomialDegreeLeadingCoefficientActivity';
export { PolynomialExtremaFromGraphActivity } from './components/graph-choice/PolynomialExtremaFromGraphActivity';
export type { PolynomialExtremaFromGraphActivityProps } from './components/graph-choice/PolynomialExtremaFromGraphActivity';
export { RateSignAndTrendFromGraphActivity } from './components/graph-choice/RateSignAndTrendFromGraphActivity';
export type { RateSignAndTrendFromGraphActivityProps } from './components/graph-choice/RateSignAndTrendFromGraphActivity';
export { PolynomialEndBehaviorActivity } from './components/graph-choice/PolynomialEndBehaviorActivity';
export type { PolynomialEndBehaviorActivityProps } from './components/graph-choice/PolynomialEndBehaviorActivity';
export { RealZerosAndMultiplicitiesActivity } from './components/table/RealZerosAndMultiplicitiesActivity';
export type { RealZerosAndMultiplicitiesActivityProps } from './components/table/RealZerosAndMultiplicitiesActivity';
export { LeastPolynomialDegreeActivity } from './components/table/LeastPolynomialDegreeActivity';
export type { LeastPolynomialDegreeActivityProps } from './components/table/LeastPolynomialDegreeActivity';
export { PolynomialInequalitySignChartActivity } from './components/table/PolynomialInequalitySignChartActivity';
export type { PolynomialInequalitySignChartActivityProps } from './components/table/PolynomialInequalitySignChartActivity';
export { PolynomialEquationEndBehaviorActivity } from './components/table/PolynomialEquationEndBehaviorActivity';
export type { PolynomialEquationEndBehaviorActivityProps } from './components/table/PolynomialEquationEndBehaviorActivity';
export { PolynomialLimitNotationEndBehaviorActivity } from './components/table/PolynomialLimitNotationEndBehaviorActivity';
export type { PolynomialLimitNotationEndBehaviorActivityProps } from './components/table/PolynomialLimitNotationEndBehaviorActivity';

// Table average-rate choice
export { TableAverageRateChoiceActivity } from './components/table/TableAverageRateChoiceActivity';
export type { TableAverageRateChoiceActivityProps } from './components/table/TableAverageRateChoiceActivity';

// ActivityRenderer
export { ActivityRenderer } from './renderer/ActivityRenderer';
export type {
  ActivityRendererProps,
  UseActivityTimingReturn,
} from './renderer/ActivityRenderer';
