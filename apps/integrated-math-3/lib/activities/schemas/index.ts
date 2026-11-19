import { SCHEMA_REGISTRY as sharedSchemas } from "@math-platform/math-content/schemas";

/** Only these activity components are registered in the IM3 renderer. */
export const SCHEMA_REGISTRY = {
  "graphing-explorer": sharedSchemas["graphing-explorer"],
  "step-by-step-solver": sharedSchemas["step-by-step-solver"],
  "comprehension-quiz": sharedSchemas["comprehension-quiz"],
  "fill-in-the-blank": sharedSchemas["fill-in-the-blank"],
  "rate-of-change-calculator": sharedSchemas["rate-of-change-calculator"],
  "discriminant-analyzer": sharedSchemas["discriminant-analyzer"],
};

export function getPropsSchema(key: string) {
  return Object.hasOwn(SCHEMA_REGISTRY, key)
    ? SCHEMA_REGISTRY[key as keyof typeof SCHEMA_REGISTRY]
    : undefined;
}

export {
  graphingExplorerSchema,
  stepByStepSolverSchema,
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
  buildGraphingSubmission,
  buildAlgebraicSubmission,
} from "@math-platform/math-content/schemas";

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
} from "@math-platform/math-content/schemas";
