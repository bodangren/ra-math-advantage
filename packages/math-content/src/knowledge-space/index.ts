// Math domain knowledge-space adapter
//
// This is the single seam where all math-specific semantics live.
// Reusable packages stay domain-neutral; math rollouts consume this adapter.

export {
  MATH_COURSES,
  MATH_DOMAIN_PREFIX,
  ID_PATTERNS,
  buildSkillId,
  buildWorkedExampleId,
  buildLessonId,
  buildModuleId,
  buildCourseId,
  buildStandardId,
  validateMathId,
} from "./ids";

export type { MathCourse, IdValidationResult } from "./ids";

export {
  mathSkillMetadataSchema,
  mathWorkedExampleMetadataSchema,
  mathLessonMetadataSchema,
  mathModuleMetadataSchema,
  mathCourseMetadataSchema,
  mathStandardMetadataSchema,
  mathGeneratorMetadataSchema,
  mathRendererMetadataSchema,
  mathEdgeMetadataSchema,
  validateMathNodeMetadata,
  validateMathEdgeMetadata,
} from "./metadata";

export { getGenerator, GENERATOR_KEYS } from "./generators/registry";
export type { MathGenerator } from "./generators/registry";
export {
  generateIM1VerbalToNumericalOutput,
  gradeIM1VerbalToNumerical,
  projectIM1VerbalToNumerical,
} from "./generators/im1-verbal-to-numerical-adapter";
export type {
  IM1TranslationGrade,
  IM1TranslationMode,
  IM1TranslationProjection,
} from "./generators/im1-verbal-to-numerical-adapter";
export {
  generateTopic11IntervalGraph,
  generateTopic11IntervalGraphOutput,
  TOPIC11_INTERVAL_GRAPH_NODE_ID,
} from "./generators/topic11-interval-graph";
export type {
  Interval,
  Topic11IntervalGraphPoint,
  Topic11IntervalGraphVariant,
} from "./generators/topic11-interval-graph";
export {
  generateTopic11PhysicalContextGraphChoice,
  generateTopic11PhysicalContextGraphChoiceOutput,
  TOPIC11_PHYSICAL_CONTEXT_GRAPH_CHOICE_NODE_ID,
} from "./generators/topic11-physical-context-graph-choice";
export type {
  Topic11PhysicalContextGraphChoiceShape,
  Topic11PhysicalContextContainerProfile,
  Topic11PhysicalContextGraphChoiceOption,
  Topic11PhysicalContextGraphChoiceVariant,
} from "./generators/topic11-physical-context-graph-choice";
export {
  generateTopic12TableAverageRateChoice,
  generateTopic12TableAverageRateChoiceOutput,
  TOPIC12_TABLE_AVERAGE_RATE_CHOICE_NODE_ID,
} from "./generators/topic12-table-average-rate-choice";
export type {
  Topic12TableAverageRateRow,
  Topic12TableAverageRateChoiceOption,
  Topic12TableAverageRateChoiceVariant,
} from "./generators/topic12-table-average-rate-choice";
export {
  generateTopic12GraphAverageRateChoice,
  generateTopic12GraphAverageRateChoiceOutput,
  TOPIC12_GRAPH_AVERAGE_RATE_CHOICE_NODE_ID,
} from "./generators/topic12-graph-average-rate-choice";
export type {
  Topic12GraphAverageRateChoicePoint,
  Topic12GraphAverageRateChoiceOption,
  Topic12GraphAverageRateChoiceVariant,
} from "./generators/topic12-graph-average-rate-choice";
export {
  generateTopic12PointwiseLeastRateChoice,
  generateTopic12PointwiseLeastRateChoiceOutput,
  TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID,
} from "./generators/topic12-pointwise-least-rate-choice";
export type {
  Topic12PointwiseLeastRateChoicePoint,
  Topic12PointwiseLeastRateChoiceLabeledPoint,
  Topic12PointwiseLeastRateChoiceOption,
  Topic12PointwiseLeastRateChoiceVariant,
} from "./generators/topic12-pointwise-least-rate-choice";
export {
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
  TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
} from "./generators/topic12-pointwise-rate-ordering";
export type {
  Topic12PointwiseRateOrderingPoint,
  Topic12PointwiseRateOrderingLabeledPoint,
  Topic12PointwiseRateOrderingVariant,
} from "./generators/topic12-pointwise-rate-ordering";
export {
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
  TOPIC12_NEGATIVE_RATE_CONTEXT_CHOICE_NODE_ID,
} from "./generators/topic12-negative-rate-context-choice";
export type {
  Topic12NegativeRateContextChoiceOption,
  Topic12NegativeRateContextChoiceVariant,
} from "./generators/topic12-negative-rate-context-choice";
export {
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
  TOPIC12_QUADRATIC_NEGATIVE_RATE_INTERVAL_CHOICE_NODE_ID,
} from "./generators/topic12-quadratic-negative-rate-interval-choice";
export type {
  Topic12QuadraticNegativeRateIntervalRateSign,
  Topic12QuadraticNegativeRateIntervalChoiceOption,
  Topic12QuadraticNegativeRateIntervalChoiceVariant,
} from "./generators/topic12-quadratic-negative-rate-interval-choice";
export {
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
  TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
} from "./generators/topic13-rate-pattern-classification";
export type {
  Topic13RatePatternClassification,
  Topic13RatePatternClassificationCaseId,
  Topic13RatePatternClassificationTableCase,
  Topic13RatePatternClassificationVariant,
} from "./generators/topic13-rate-pattern-classification";
export {
  generateTopic13ConcavityFromRateChange,
  generateTopic13ConcavityFromRateChangeOutput,
  TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID,
} from "./generators/topic13-concavity-from-rate-change";
export type {
  Topic13ConcavityClassification,
  Topic13ConcavityTableCase,
  Topic13ConcavityVariant,
} from "./generators/topic13-concavity-from-rate-change";
export {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
  TOPIC14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
} from "./generators/topic14-polynomial-degree-leading-coefficient";
export type {
  Topic14PolynomialItemId,
  Topic14PolynomialTerm,
  Topic14PolynomialItem,
  Topic14PolynomialDegreeLeadingCoefficientVariant,
} from "./generators/topic14-polynomial-degree-leading-coefficient";
export {
  generateTopic14PolynomialExtremaFromGraph,
  generateTopic14PolynomialExtremaFromGraphOutput,
  TOPIC14_POLYNOMIAL_EXTREMA_FROM_GRAPH_NODE_ID,
} from "./generators/topic14-polynomial-extrema-from-graph";
export type {
  Topic14PolynomialExtremaPoint,
  Topic14PolynomialExtremaCoefficients,
  Topic14PolynomialExtremaDomain,
  Topic14PolynomialExtremaFromGraphVariant,
} from "./generators/topic14-polynomial-extrema-from-graph";
export {
  generateTopic14RateSignAndTrend,
  generateTopic14RateSignAndTrendOutput,
  TOPIC14_RATE_SIGN_AND_TREND_NODE_ID,
} from "./generators/topic14-rate-sign-and-trend";
export type {
  Topic14RateSign,
  Topic14RateTrend,
  Topic14RateSignAndTrendPoint,
  Topic14RateSignAndTrendInterval,
  Topic14RateSignAndTrendVariant,
} from "./generators/topic14-rate-sign-and-trend";
export {
  generateTopic14PolynomialEndBehavior,
  generateTopic14PolynomialEndBehaviorOutput,
  TOPIC14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
} from "./generators/topic14-polynomial-end-behavior";
export type {
  Topic14PolynomialEndBehaviorAnswer,
  Topic14PolynomialEndBehaviorEnd,
  Topic14PolynomialEndBehaviorLeadingTerm,
  Topic14PolynomialEndBehaviorVariant,
} from "./generators/topic14-polynomial-end-behavior";
export {
  generateTopic15RealZerosAndMultiplicities,
  generateTopic15RealZerosAndMultiplicitiesOutput,
  TOPIC15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
} from "./generators/topic15-real-zeros-and-multiplicities";
export type {
  Topic15RealZerosAndMultiplicitiesAnswers,
  Topic15RealZerosAndMultiplicitiesItem,
  Topic15RealZerosAndMultiplicitiesItemId,
  Topic15RealZerosAndMultiplicitiesPair,
  Topic15RealZerosAndMultiplicitiesVariant,
} from "./generators/topic15-real-zeros-and-multiplicities";
export {
  generateTopic15LeastPolynomialDegree,
  generateTopic15LeastPolynomialDegreeOutput,
  TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
} from "./generators/topic15-least-polynomial-degree";
export type { Topic15LeastPolynomialDegreeVariant } from "./generators/topic15-least-polynomial-degree";
export {
  generateTopic15PolynomialInequality,
  generateTopic15PolynomialInequalityOutput,
  TOPIC15_POLYNOMIAL_INEQUALITY_SIGN_CHART_NODE_ID,
} from "./generators/topic15-polynomial-inequality-sign-chart";
export type {
  Topic15PolynomialInequalityAnswers,
  Topic15PolynomialInequalityOperator,
  Topic15PolynomialInequalitySign,
  Topic15PolynomialInequalityVariant,
} from "./generators/topic15-polynomial-inequality-sign-chart";
export {
  generateTopic16EquationEndBehavior,
  generateTopic16EquationEndBehaviorOutput,
  TOPIC16_EQUATION_END_BEHAVIOR_NODE_ID,
} from "./generators/topic16-equation-end-behavior";
export type {
  Topic16EquationEndBehaviorAnswers,
  Topic16EquationEndBehaviorEnd,
  Topic16EquationEndBehaviorFunctionName,
  Topic16EquationEndBehaviorItem,
  Topic16EquationEndBehaviorItemId,
  Topic16EquationEndBehaviorPartId,
  Topic16EquationEndBehaviorVariant,
} from "./generators/topic16-equation-end-behavior";
export {
  generateTopic16LimitNotationEndBehavior,
  generateTopic16LimitNotationEndBehaviorOutput,
  TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID,
} from "./generators/topic16-limit-notation-end-behavior";
export type {
  Topic16LimitNotationEnd,
  Topic16LimitNotationAnswers,
  Topic16LimitNotationFunctionName,
  Topic16LimitNotationItem,
  Topic16LimitNotationItemId,
  Topic16LimitNotationPartId,
  Topic16LimitNotationVariant,
} from "./generators/topic16-limit-notation-end-behavior";

export { getRenderer, RENDERER_KEYS } from "./renderers/registry";
export type { MathRendererDescriptor } from "./renderers/registry";

export { evidenceToPracticeV1 } from "./practice-v1-adapter";
export type { GenericEvidence, GenericEvidencePart } from "./practice-v1-adapter";

export { mathDomainAdapter } from "./adapter";
export type { MathDomainAdapter } from "./adapter";

export { alignSkillsToStandards } from "./alignment";
export type {
  AlignmentInput,
  AlignmentResult,
  ReviewQueueItem,
  AlignmentException,
  MissingStandard,
} from "./alignment";
export type {
  StandardDefinition,
  LessonStandardMapping,
  FamilyObjectiveMapping,
  CEDTopicMapping,
} from "./alignment";
export {
  standardCodeToNodeId,
  parseStandardCodeToNodeId,
  buildLessonSlug,
  parseLessonSlugFromMetadata,
} from "./alignment";
