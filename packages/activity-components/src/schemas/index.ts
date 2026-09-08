export {
  SCHEMA_REGISTRY,
  getPropsSchema,
  graphingExplorerSchema,
  stepByStepSolverSchema,
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
  quadraticFormulaActivitySchema,
} from '@math-platform/math-content/schemas';

export type {
  ActivityComponentKey,
  GraphingExplorerSchemaProps,
  GraphingSubmissionInput,
  StepByStepSolverProps,
  ProblemType,
  AlgebraicSubmissionInput,
  ComprehensionQuizProps,
  QuestionType,
  FillInTheBlankProps,
  RateOfChangeCalculatorProps,
  SourceType,
  DiscriminantAnalyzerProps,
  QuadraticFormulaActivityProps,
} from '@math-platform/math-content/schemas';

export {
  buildGraphingSubmission,
} from '@math-platform/math-content/schemas';

export {
  buildAlgebraicSubmission,
} from '@math-platform/math-content/schemas';

export { intervalClassificationSchema } from './interval-classification.schema';
export type { IntervalClassificationProps } from './interval-classification.schema';
