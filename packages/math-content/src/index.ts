// Schemas
export {
  SCHEMA_REGISTRY,
  getPropsSchema,
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  graphingExplorerSchema,
  stepByStepSolverSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
} from './schemas';

export type {
  ActivityComponentKey,
  Activity,
  GradingConfig,
  ActivityComponentProps,
  ActivityRegistration,
  ComprehensionQuizProps,
  QuestionType,
  FillInTheBlankProps,
  GraphingExplorerSchemaProps,
  StepByStepSolverProps,
  ProblemType,
  RateOfChangeCalculatorProps,
  SourceType,
  DiscriminantAnalyzerProps,
} from './schemas';

// Algebraic logic
export { generateDistractors } from './algebraic';
export { normalizeExpression, checkEquivalence } from './algebraic';
export type { DistractorType, DistractorGenerator, DistractorResult } from './algebraic';

// Glossary
export {
  glossaryTermSchema,
  IM3_GLOSSARY,
  getGlossaryTermBySlug,
  getGlossaryTermsByCourse,
  getGlossaryTermsByTopic,
  getAllGlossaryCourses,
  getAllGlossaryTopics,
} from './glossary';
export type { GlossaryTerm, GlossaryFilter } from './glossary';

// Problem families
export { IM3_PROBLEM_FAMILIES, IM2_PROBLEM_FAMILIES, PRECALC_PROBLEM_FAMILIES } from './problem-families';
export type { ProblemFamilyInput } from './problem-families';

// Seeds
export {
  createActivitySeed,
  createSectionSeed,
  createPhaseSeed,
  textActivityPair,
} from './seeds';
export type { ActivitySeed, PhaseSeed, SectionSeed, LessonSeed, SeedData } from './seeds';
