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

export { knowledgeSpaceSchema } from './schemas';

export {
  validateKnowledgeSpace,
  getDanglingEdges,
  getDuplicateNodeIds,
  getDuplicateEdges,
  getNodesMissingRequiredAlignments,
  getIndependentPracticeNodesMissingGenerators,
  validateNodeMetadataWithAdapter,
} from './validation';

export { syntheticMathFixture, syntheticEnglishGseFixture } from './fixtures';
