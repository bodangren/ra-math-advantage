export const DATABASE_TABLE_NAMES = [
  'organizations',
  'lessons',
  'lesson_versions',
  'phase_versions',
  'phase_sections',
  'profiles',
  'activities',
  'student_progress',
] as const;

export type DatabaseTableName = (typeof DATABASE_TABLE_NAMES)[number];

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewOrganizationRow = Partial<OrganizationRow>;

export type LessonRow = {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  learningObjectives: string[] | null;
  orderIndex: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewLessonRow = Partial<LessonRow>;

export type LessonVersionRow = {
  id: string;
  lessonId: string;
  version: number;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
export type NewLessonVersionRow = Partial<LessonVersionRow>;

export type PhaseVersionRow = {
  id: string;
  lessonVersionId: string;
  phaseNumber: number;
  title: string | null;
  contentBlocks: unknown[] | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewPhaseVersionRow = Partial<PhaseVersionRow>;

export type PhaseSectionRow = {
  id: string;
  phaseVersionId: string;
  sequenceOrder: number;
  sectionType: string;
  content: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewPhaseSectionRow = Partial<PhaseSectionRow>;

export type ProfileRow = {
  id: string;
  organizationId: string;
  username: string;
  role: string;
  displayName: string | null;
  avatarUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewProfileRow = Partial<ProfileRow>;

export type ActivityRow = {
  id: string;
  componentKey: string;
  displayName: string;
  description: string | null;
  props: unknown;
  gradingConfig: Record<string, unknown> | null;
  standardId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewActivityRow = Partial<ActivityRow>;

export type StudentProgressRow = {
  id: string;
  userId: string;
  phaseId: string;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpentSeconds: number | null;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewStudentProgressRow = Partial<StudentProgressRow>;

export interface DatabaseTables {
  organizations: { row: OrganizationRow; insert: NewOrganizationRow };
  lessons: { row: LessonRow; insert: NewLessonRow };
  lesson_versions: { row: LessonVersionRow; insert: NewLessonVersionRow };
  phase_versions: { row: PhaseVersionRow; insert: NewPhaseVersionRow };
  phase_sections: { row: PhaseSectionRow; insert: NewPhaseSectionRow };
  profiles: { row: ProfileRow; insert: NewProfileRow };
  activities: { row: ActivityRow; insert: NewActivityRow };
  student_progress: { row: StudentProgressRow; insert: NewStudentProgressRow };
}

export type TableRow<T extends DatabaseTableName> = DatabaseTables[T]['row'];
export type TableInsert<T extends DatabaseTableName> = DatabaseTables[T]['insert'];
