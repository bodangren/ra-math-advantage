// Types for standards source loading

export interface StandardDefinition {
  code: string;
  description: string;
  authority: string;
  category?: string;
  studentFriendlyDescription?: string;
  isActive?: boolean;
}

export interface LessonStandardMapping {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

export interface FamilyObjectiveMapping {
  familyId: string;
  module: string;
  lesson: string;
  objectiveIds: string[];
  skillIds?: string[];
}

export interface CEDTopicMapping {
  lessonSlug: string;
  cedTopic: string;
  standardCodes: string[];
}

/**
 * Convert a standard code to its knowledge-space node ID.
 * @param code - Standard code (e.g., "HSA-SSE.B.3")
 * @param authority - Standards authority, defaults to "ccss"
 * @returns Node ID string
 */
export function standardCodeToNodeId(code: string, authority: string = 'ccss'): string {
  const normalizedCode = code.toLowerCase().replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
  return `math.standard.${authority}.${normalizedCode}`;
}

/**
 * Parse a standard code into its node ID components.
 * @param code - Standard code to parse
 * @returns Object with id, authority, and normalizedCode
 */
export function parseStandardCodeToNodeId(code: string): { id: string; authority: string; normalizedCode: string } {
  const authority = 'ccss';
  const normalizedCode = code.toLowerCase().replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
  return {
    id: `math.standard.${authority}.${normalizedCode}`,
    authority,
    normalizedCode,
  };
}

/**
 * Build a lesson slug from course, module, and lesson identifiers.
 * @param course - Course identifier
 * @param module - Module number
 * @param lesson - Lesson number
 * @returns Lesson slug string
 */
export function buildLessonSlug(course: string, module: string, lesson: string): string {
  if (course === 'precalc') {
    return `${module}-${lesson}`;
  }
  return `module-${module}-lesson-${lesson}`;
}

/**
 * Derive a lesson slug from node metadata.
 * @param course - Course identifier
 * @param metadata - Node metadata containing module and lesson fields
 * @returns Lesson slug string
 */
export function parseLessonSlugFromMetadata(course: string, metadata: Record<string, unknown>): string {
  const module = String(metadata.module ?? '');
  const lesson = String(metadata.lesson ?? '');
  return buildLessonSlug(course, module, lesson);
}