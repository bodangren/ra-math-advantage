/**
 * Lesson seed types — shared across all apps for Convex seed data creation.
 */

export interface ActivitySeed {
  componentKey: string;
  displayName: string;
  description?: string;
  props: Record<string, unknown>;
}

export interface SectionSeed {
  sectionType: string;
  content?: string;
  activity?: ActivitySeed;
}

export interface PhaseSeed {
  phaseNumber: number;
  phaseType: string;
  sections: SectionSeed[];
}

export interface LessonSeed {
  slug: string;
  title: string;
  description?: string;
  objectives: string[];
  phases: PhaseSeed[];
}

export interface SeedData {
  course: string;
  lessons: LessonSeed[];
}
