export type PhaseType =
  | "explore"
  | "vocabulary"
  | "learn"
  | "key_concept"
  | "worked_example"
  | "guided_practice"
  | "independent_practice"
  | "assessment"
  | "discourse"
  | "reflection";

export type SectionType = "text" | "callout" | "activity" | "video" | "image";

export type ProfileRole = "student" | "teacher" | "admin";

export type ClassEnrollmentStatus = "active" | "withdrawn" | "completed";

export type StudentProgressStatus = "not_started" | "in_progress" | "completed";

export interface SeedTextContent {
  markdown: string;
}

export interface SeedCalloutContent {
  type: "important" | "tip" | "warning";
  title?: string;
  body: string;
}

export interface SeedActivityContent {
  componentKey: string;
  props: Record<string, unknown>;
  gradingConfig?: {
    autoGrade: boolean;
    partialCredit: boolean;
  };
}

export interface SeedSection {
  sequenceOrder: number;
  sectionType: SectionType;
  content: SeedTextContent | SeedCalloutContent | SeedActivityContent | Record<string, unknown>;
}

export interface SeedPhase {
  phaseNumber: number;
  title?: string;
  phaseType: PhaseType;
  estimatedMinutes?: number;
  sections: SeedSection[];
}

export interface SeedActivity {
  componentKey: string;
  displayName: string;
  description?: string;
  props: Record<string, unknown>;
  gradingConfig?: {
    autoGrade: boolean;
    partialCredit: boolean;
  };
  standardCode?: string;
}

export interface SeedLesson {
  unitNumber: number;
  title: string;
  slug: string;
  description?: string;
  learningObjectives?: string[];
  orderIndex: number;
  phases: SeedPhase[];
}

export interface SeedOrganization {
  name: string;
  slug: string;
}

export interface SeedProfile {
  organizationSlug: string;
  username: string;
  role: ProfileRole;
  displayName?: string;
  avatarUrl?: string;
}

export interface SeedAuthCredentials {
  profileUsername: string;
  password: string;
  role: ProfileRole;
  organizationSlug: string;
}

export interface SeedClass {
  teacherUsername: string;
  name: string;
  description?: string;
  academicYear?: string;
}

export interface SeedClassEnrollment {
  className: string;
  studentUsername: string;
  status: ClassEnrollmentStatus;
}

export interface SeedCompetencyStandard {
  code: string;
  description: string;
  studentFriendlyDescription?: string;
  category?: string;
  isActive: boolean;
}

export interface SeedLessonStandard {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

export interface SeedStudentProgress {
  studentUsername: string;
  lessonSlug: string;
  phaseNumber: number;
  status: StudentProgressStatus;
  startedAt?: number;
  completedAt?: number;
  timeSpentSeconds?: number;
}

export interface SeedDemoEnvironment {
  organization: SeedOrganization;
  teacher: SeedProfile & { password: string };
  students: (SeedProfile & { password: string })[];
  className: string;
  studentProgress: SeedStudentProgress[];
}

export interface SeedData {
  lessons: SeedLesson[];
  standards: SeedCompetencyStandard[];
  lessonStandards: SeedLessonStandard[];
  demoEnvironment?: SeedDemoEnvironment;
}
