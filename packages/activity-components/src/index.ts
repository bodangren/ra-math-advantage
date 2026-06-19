// @math-platform/activity-components
// Shared activity components for cross-app reuse (IM3, IM2, PreCalc)

export type { ActivityComponentProps, ActivityRegistration } from './types/index';
export { registerActivity, getActivityComponent, getRegisteredActivityKeys, clearActivityRegistry } from './registry/index';
export { SCHEMA_REGISTRY, getPropsSchema } from './schemas/index';
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

// ActivityRenderer
export { ActivityRenderer } from './renderer/ActivityRenderer';
export type {
  ActivityRendererProps,
  UseActivityTimingReturn,
} from './renderer/ActivityRenderer';
