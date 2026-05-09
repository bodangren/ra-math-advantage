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

export function standardCodeToNodeId(code: string, authority: string = 'ccss'): string {
  const normalizedCode = code.toLowerCase().replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
  return `math.standard.${authority}.${normalizedCode}`;
}

export function parseStandardCodeToNodeId(code: string): { id: string; authority: string; normalizedCode: string } {
  const authority = 'ccss';
  const normalizedCode = code.toLowerCase().replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
  return {
    id: `math.standard.${authority}.${normalizedCode}`,
    authority,
    normalizedCode,
  };
}

export function buildLessonSlug(course: string, module: string, lesson: string): string {
  if (course === 'precalc') {
    return `${module}-${lesson}`;
  }
  return `module-${module}-lesson-${lesson}`;
}

export function parseLessonSlugFromMetadata(course: string, metadata: Record<string, unknown>): string {
  const module = String(metadata.module ?? '');
  const lesson = String(metadata.lesson ?? '');
  return buildLessonSlug(course, module, lesson);
}