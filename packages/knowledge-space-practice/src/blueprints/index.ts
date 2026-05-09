// Blueprints module — types, schemas, generators, evidence, and fixtures

export type {
  KnowledgeBlueprint,
  WorkedExampleSpec,
  WorkedStep,
  GuidedPracticeSpec,
  IndependentPracticeSpec,
  VariantParameter,
  GradingSpec,
  GradingRule,
  GeneratorInput,
  GeneratorOutput,
  GradingMetadata,
  GenericEvidencePart,
  GenericEvidenceResult,
  DeterministicGenerator,
  SchemaAdapter,
  ValidationResult,
  ValidationError,
} from './types';

export {
  variantParameterSchema,
  gradingRuleSchema,
  workedStepSchema,
  workedExampleSpecSchema,
  guidedPracticeSpecSchema,
  independentPracticeSpecSchema,
  gradingSpecSchema,
  knowledgeBlueprintSchema,
  generatorInputSchema,
  gradingMetadataSchema,
  generatorOutputSchema,
  genericEvidencePartSchema,
  genericEvidenceResultSchema,
  validateGeneratorOutput,
  validateBlueprintGeneratorReadiness,
  validateRendererCompatibility,
  validateModeSupport,
  validateGradingCompatibility,
} from './schemas';

export {
  genericEvidenceToSubmissionParts,
} from './evidence';
export type {
  EvidenceAdapter,
  PracticeSubmissionPart,
} from './evidence';

export {
  syntheticAlgebraicBlueprint,
  syntheticGraphingBlueprint,
  syntheticEnglishBlueprint,
  syntheticGeneratorOutput,
} from './fixtures';
