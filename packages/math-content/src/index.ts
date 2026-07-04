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
  getGlossaryTermsByModule,
  getAllGlossaryCourses,
  getAllGlossaryModules,
  getAllGlossaryTopics,
} from './glossary';
export type { GlossaryTerm, GlossaryFilter } from './glossary';

// Problem families
export { IM3_PROBLEM_FAMILIES, IM2_PROBLEM_FAMILIES, IM1_PROBLEM_FAMILIES, PRECALC_PROBLEM_FAMILIES } from './problem-families';
export type { ProblemFamilyInput } from './problem-families';

// Seeds
export {
  createActivitySeed,
  createSectionSeed,
  createPhaseSeed,
  textActivityPair,
} from './seeds';
export type { ActivitySeed, PhaseSeed, SectionSeed, LessonSeed, SeedData } from './seeds';

// Knowledge-space adapter
export { mathDomainAdapter } from './knowledge-space';
export type { MathDomainAdapter } from './knowledge-space';

// Advanced math generators
export { generatePolynomialOperation } from './polynomial-operations';
export { generatePolynomialDivision } from './polynomial-division';
export { generateRationalProblem } from './rational-analyzer';
export { generateExpLogProblem } from './exp-log-solver';
export { addPoly, subtractPoly, multiplyPoly } from './utils/polynomial';

// Core algebra generators (T17)
export { generateLinearEquation } from './linear-equation-solver';
export type { LinearEquationProblem } from './linear-equation-solver';
export { generateSystemOfEquations } from './system-of-equations-solver';
export type { SystemOfEquationsProblem } from './system-of-equations-solver';
export { generateQuadraticFactoring } from './quadratic-factoring';
export type { QuadraticFactoringProblem } from './quadratic-factoring';
export { generateQuadraticFormula } from './quadratic-formula';
export type { QuadraticFormulaProblem, QuadraticFormulaRoot } from './quadratic-formula';

// Core algebra utilities (T17)
export { mulberry32 } from './utils/prng';
export { Fraction, gcd } from './utils/fraction';
export { formatLinearTerm, formatQuadratic } from './utils/expression-builder';
