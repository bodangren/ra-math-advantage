// knowledge-space-core — domain-neutral knowledge space contracts

export type {
  NodeKind,
  EdgeType,
  ConfidenceLevel,
  ReviewStatus,
  ExceptionType,
  SourceRef,
  Exception,
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
  KnowledgeSpace,
  DomainAdapter,
  ValidationError,
  ValidationResult,
} from './types';

export type { PrerequisiteCycle, CycleDetectionOptions } from './validation';

export { knowledgeSpaceSchema, CORE_ID_PATTERN } from './schemas';

export {
  knowledgeStateSchema,
  displayLevelSchema,
} from './level-projection';
export type {
  KnowledgeState,
  DisplayLevel,
  LevelProjectionFn,
} from './level-projection';

export {
  masterySnapshotSchema,
  progressTrendHistorySchema,
} from './progress-trend';
export type {
  MasterySnapshot,
  ProgressTrendHistory,
} from './progress-trend';

export {
  validateKnowledgeSpace,
  getDanglingEdges,
  getDuplicateNodeIds,
  getDuplicateEdges,
  getNodesMissingRequiredAlignments,
  getIndependentPracticeNodesMissingGenerators,
  getInvalidEdgePairings,
  validateNodeMetadataWithAdapter,
  getPrerequisiteCycles,
} from './validation';

export { syntheticMathFixture, syntheticEnglishGseFixture } from './fixtures';

export { suggestEdges } from './edge-suggestions';
export type { EdgeSuggestionInput } from './edge-suggestions';

export {
  placementResultSchema,
  placementResultsSchema,
  isPlacementResult,
  PROBE_RESULTS,
  probeResultSchema,
} from './placement';
export type {
  PlacementResult,
  ProbeResult,
  ProbeAdapter,
} from './placement';

export { runPlacementTraversal } from './placement-engine';
export type { PlacementEngineResult } from './placement-engine';

export {
  findCrossCourseEquivalences,
  validateCrossCourseEdges,
  computeEquivalenceComponents,
} from './cross-course-equivalence';
export type {
  CrossCourseCourse,
  CrossCourseInput,
  CrossCourseValidationResult,
  EquivalenceComponent,
} from './cross-course-equivalence';
