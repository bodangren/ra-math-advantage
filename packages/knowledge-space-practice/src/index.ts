// knowledge-space-practice — domain-neutral practice blueprints, generators, and projections

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
  EvidenceAdapter,
  PracticeSubmissionPart,
} from './blueprints';

export {
  misconceptionSeveritySchema,
  misconceptionLifecycleStatusSchema,
  studentMisconceptionStateSchema,
  getMisconceptionSeverity,
  runRealT6Loop,
} from './misconception-loop';

export type {
  MisconceptionSeverity,
  MisconceptionLifecycleStatus,
  StudentMisconceptionState,
  StudentMisconceptionLoopState,
  RunRealT6LoopInput,
  RunRealT6LoopOutput,
} from './misconception-loop';

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
  generatorRegistrySchema,
  genericEvidencePartSchema,
  genericEvidenceResultSchema,
  validateGeneratorOutput,
  validateBlueprintGeneratorReadiness,
  validateRendererCompatibility,
  validateModeSupport,
  validateGradingCompatibility,
  genericEvidenceToSubmissionParts,
  syntheticAlgebraicBlueprint,
  syntheticGraphingBlueprint,
  syntheticEnglishBlueprint,
  syntheticGeneratorOutput,
} from './blueprints';

// Projections — domain-neutral practice and visualization projections
export {
  // Runtime-value exports (mindful of dups with blueprints, e.g. syntheticEnglishBlueprint)
  projectActivityMap,
  projectSrsInputs,
  projectTeacherEvidence,
  projectStudentVisualization,
  projectParentVisualization,
  projectTeacherVisualization,
  syntheticMathKnowledgeSpace,
  syntheticEnglishGseKnowledgeSpace,
  syntheticBlueprint,
  syntheticLearnerState,
  visualNodeV1Schema,
  visualEdgeV1Schema,
  studentVisualizationV1Schema,
  parentVisualizationV1Schema,
  teacherVisualizationV1Schema,
} from './projections';

// Planner — domain-neutral planner injection
export { planRemediationInjection } from './planner/injection';
export type { PlannedActivity, PlanRemediationInjectionInput } from './planner/injection';

// Planner v3.2 — additive contract; legacy planner/types remains unchanged.
export {
  DEFAULT_PLANNER_V3_2_WEIGHTS,
  plannerTermsV3_2Schema,
  plannerWeightsV3_2Schema,
  plannerContributionsV3_2Schema,
  plannerRankingModeV3_2Schema,
  plannerPriorityScoreV3_2Schema,
  plannerDiversityGroupV3_2Schema,
  plannerRecommendationV3_2Schema,
  plannerRecommendationSetV3_2Schema,
  plannerGraphReleaseInputV3_2Schema,
  plannerGraphReleaseOutputV3_2Schema,
} from './planner/v3-2-contract';
export {
  scorePlannerCandidateV3_2,
  rankPlannerPriorityScoresV3_2,
  precomputePlannerGraphV3_2,
} from './planner/v3-2-planner';
export type { ScorePlannerCandidateInputV3_2 } from './planner/v3-2-planner';
export {
  learnerUtilityContextV3_2Schema,
  utilitySignalV3_2Schema,
  utilityProviderResultV3_2Schema,
  utilityResolutionV3_2Schema,
  domainUtilityRegistryV3_2Schema,
  prerequisiteSparseReleaseV3_2Schema,
  bindDomainUtilityProviderV3_2,
} from './planner/v3-2-domain-utility-contract';
export {
  reviewLoadStateV3_2Schema,
  reviewLoadConfigV3_2Schema,
  reviewLoadAssessmentV3_2Schema,
} from './planner/v3-2-review-load-contract';
export type {
  ReviewLoadStateV3_2,
  ReviewLoadConfigV3_2,
  ReviewLoadAssessmentV3_2,
} from './planner/v3-2-review-load-contract';
export type {
  LearnerUtilityContextV3_2,
  UtilitySignalV3_2,
  UtilityProviderResultV3_2,
  DomainUtilityProviderV3_2,
  UtilityResolutionV3_2,
  DomainUtilityRegistryV3_2,
  PrerequisiteSparseReleaseV3_2,
  DomainUtilityRegistrationManifestV3_2,
  BoundDomainUtilityProviderV3_2,
} from './planner/v3-2-domain-utility-contract';
export type {
  PlannerTermsV3_2,
  PlannerWeightsV3_2,
  PlannerPriorityScoreV3_2,
  PlannerDiversityGroupV3_2,
  PlannerRecommendationV3_2,
  PlannerRecommendationSetV3_2,
  PlannerGraphReleaseInputV3_2,
  PlannerGraphReleaseOutputV3_2,
} from './planner/v3-2-contract';

export type {
  ProjectedActivity,
  SrsProjectionEntry,
  TeacherEvidence,
  StandardCoverage,
  SkillCoverage,
  PrerequisiteGap,
  AttemptArtifact,
  EquivalentComponentSummary,
  VisualNodeV1,
  VisualEdgeV1,
  StudentVisualizationV1,
  StudentVisualizationOptions,
  ParentVisualizationV1,
  TeacherHeatmapCell,
  InterventionGroup,
  TeacherVisualizationV1,
} from './projections';
