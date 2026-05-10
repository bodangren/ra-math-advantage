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
