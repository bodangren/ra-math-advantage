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
} from './ids';

export type { MathCourse, IdValidationResult } from './ids';

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
} from './metadata';

export { getGenerator, GENERATOR_KEYS } from './generators/registry';
export type { MathGenerator } from './generators/registry';

export { getRenderer, RENDERER_KEYS } from './renderers/registry';
export type { MathRendererDescriptor } from './renderers/registry';

export { evidenceToPracticeV1 } from './practice-v1-adapter';
export type { GenericEvidence, GenericEvidencePart } from './practice-v1-adapter';

export { mathDomainAdapter } from './adapter';
export type { MathDomainAdapter } from './adapter';

export { alignSkillsToStandards } from './alignment';
export type { AlignmentInput, AlignmentResult, ReviewQueueItem, AlignmentException, MissingStandard } from './alignment';
export type { StandardDefinition, LessonStandardMapping, FamilyObjectiveMapping, CEDTopicMapping } from './alignment';
export { standardCodeToNodeId, parseStandardCodeToNodeId, buildLessonSlug, parseLessonSlugFromMetadata } from './alignment';
