import { z } from 'zod';

import { resolveActivityComponentKey } from '../activities/component-keys';
import { activityPropsSchemas, gradingConfigSchema } from './activity-props';
import { submissionDataSchema } from './activity-submissions';
import { classMetadataSchema } from './classes';
import { contentBlockSchema, phaseMetadataSchema } from './phase-content';
import { lessonMetadataSchema } from './lessons';
import { liveResponseAnswerSchema } from './live-responses';
import { sessionSettingsSchema } from './live-sessions';
import { profileMetadataSchema } from './profiles';
import { resourceMetadataSchema } from './resources';
import { validationErrorSchema } from './content-revisions';
import { organizationSettingsSchema } from './organizations';

const jsonRecordSchema = z.record(z.string(), z.unknown());

/**
 * Adds activity props issues
 * @param ctx - ctx
 * @param componentKey - component key
 * @param props - Properties object
 */
function addActivityPropsIssues(
  ctx: z.RefinementCtx,
  componentKey: string,
  props: unknown,
) {
  const canonicalComponentKey = resolveActivityComponentKey(componentKey);

  if (!canonicalComponentKey || !(canonicalComponentKey in activityPropsSchemas)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['componentKey'],
      message: `Unknown activity component: ${componentKey}`,
    });
    return;
  }

  const result = activityPropsSchemas[canonicalComponentKey].safeParse(props);
  if (result.success) {
    return;
  }

  result.error.issues.forEach((issue) => {
    ctx.addIssue({
      ...issue,
      path: ['props', ...issue.path],
    });
  });
}

// ---------------------------------------------------------------------------
// Lesson
// ---------------------------------------------------------------------------

export const insertLessonSchema = z.object({
  id: z.string().optional(),
  unitNumber: z.number().int(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  learningObjectives: z.array(z.string()).nullable().optional(),
  orderIndex: z.number().int(),
  metadata: lessonMetadataSchema.nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectLessonSchema = z.object({
  id: z.string(),
  unitNumber: z.number().int(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  learningObjectives: z.array(z.string()).nullable(),
  orderIndex: z.number().int(),
  metadata: lessonMetadataSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Lesson = z.infer<typeof selectLessonSchema>;
export type NewLesson = z.infer<typeof insertLessonSchema>;

// ---------------------------------------------------------------------------
// Phase
// ---------------------------------------------------------------------------

const phaseShapeSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  phaseNumber: z.number().int(),
  title: z.string(),
  contentBlocks: z.array(contentBlockSchema),
  estimatedMinutes: z.number().int().nullable().optional(),
  metadata: phaseMetadataSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPhaseSchema = phaseShapeSchema;
export const selectPhaseSchema = phaseShapeSchema;

export type Phase = z.infer<typeof selectPhaseSchema>;
export type NewPhase = z.infer<typeof insertPhaseSchema>;

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export const insertActivitySchema = z.object({
  id: z.string().optional(),
  componentKey: z.string(),
  displayName: z.string(),
  description: z.string().nullable().optional(),
  props: z.unknown(),
  gradingConfig: gradingConfigSchema.nullable().optional(),
  standardId: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).superRefine((activity, ctx) => {
  addActivityPropsIssues(ctx, activity.componentKey, activity.props);
});

export const selectActivitySchema = z.object({
  id: z.string(),
  componentKey: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  props: z.unknown(),
  gradingConfig: gradingConfigSchema.nullable(),
  standardId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).superRefine((activity, ctx) => {
  addActivityPropsIssues(ctx, activity.componentKey, activity.props);
});

export type Activity = z.infer<typeof selectActivitySchema>;
export type NewActivity = z.infer<typeof insertActivitySchema>;

// ---------------------------------------------------------------------------
// Resource
// ---------------------------------------------------------------------------

export const insertResourceSchema = z.object({
  id: z.string().optional(),
  lessonId: z.string().nullable().optional(),
  phaseId: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  resourceType: z.enum(['dataset', 'pdf', 'excel', 'link', 'video']),
  filePath: z.string().nullable().optional(),
  externalUrl: z.string().nullable().optional(),
  metadata: resourceMetadataSchema.nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectResourceSchema = z.object({
  id: z.string(),
  lessonId: z.string().nullable(),
  phaseId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  resourceType: z.enum(['dataset', 'pdf', 'excel', 'link', 'video']),
  filePath: z.string().nullable(),
  externalUrl: z.string().nullable(),
  metadata: resourceMetadataSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Resource = z.infer<typeof selectResourceSchema>;
export type NewResource = z.infer<typeof insertResourceSchema>;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const insertProfileSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string(),
  username: z.string(),
  role: z.enum(['student', 'teacher', 'admin']).default('student'),
  displayName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  metadata: profileMetadataSchema.nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectProfileSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  username: z.string(),
  role: z.enum(['student', 'teacher', 'admin']),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  metadata: profileMetadataSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Profile = z.infer<typeof selectProfileSchema>;
export type NewProfile = z.infer<typeof insertProfileSchema>;

// ---------------------------------------------------------------------------
// StudentProgress
// ---------------------------------------------------------------------------

export const insertStudentProgressSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  phaseId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
  startedAt: z.date().nullable().optional(),
  completedAt: z.date().nullable().optional(),
  timeSpentSeconds: z.number().int().nullable().optional(),
  idempotencyKey: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectStudentProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  phaseId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  timeSpentSeconds: z.number().int().nullable(),
  idempotencyKey: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StudentProgress = z.infer<typeof selectStudentProgressSchema>;
export type NewStudentProgress = z.infer<typeof insertStudentProgressSchema>;

// ---------------------------------------------------------------------------
// ActivitySubmission
// ---------------------------------------------------------------------------

export const insertActivitySubmissionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  activityId: z.string(),
  submissionData: submissionDataSchema,
  score: z.number().int().nullable().optional(),
  maxScore: z.number().int().nullable().optional(),
  feedback: z.string().nullable().optional(),
  submittedAt: z.date(),
  gradedAt: z.date().nullable().optional(),
  gradedBy: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectActivitySubmissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  activityId: z.string(),
  submissionData: submissionDataSchema,
  score: z.number().int().nullable(),
  maxScore: z.number().int().nullable(),
  feedback: z.string().nullable(),
  submittedAt: z.date(),
  gradedAt: z.date().nullable(),
  gradedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ActivitySubmission = z.infer<typeof selectActivitySubmissionSchema>;
export type NewActivitySubmission = z.infer<typeof insertActivitySubmissionSchema>;

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export const insertClassSchema = z.object({
  id: z.string().optional(),
  teacherId: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  academicYear: z.string().nullable().optional(),
  archived: z.boolean().default(false),
  metadata: classMetadataSchema.nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectClassSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  academicYear: z.string().nullable(),
  archived: z.boolean(),
  metadata: classMetadataSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Class = z.infer<typeof selectClassSchema>;
export type NewClass = z.infer<typeof insertClassSchema>;

// ---------------------------------------------------------------------------
// ClassEnrollment
// ---------------------------------------------------------------------------

export const insertClassEnrollmentSchema = z.object({
  id: z.string().optional(),
  classId: z.string(),
  studentId: z.string(),
  enrolledAt: z.date().optional(),
  status: z.enum(['active', 'withdrawn', 'completed']).default('active'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectClassEnrollmentSchema = z.object({
  id: z.string(),
  classId: z.string(),
  studentId: z.string(),
  enrolledAt: z.date(),
  status: z.enum(['active', 'withdrawn', 'completed']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ClassEnrollment = z.infer<typeof selectClassEnrollmentSchema>;
export type NewClassEnrollment = z.infer<typeof insertClassEnrollmentSchema>;

// ---------------------------------------------------------------------------
// LiveSession
// ---------------------------------------------------------------------------

export const insertLiveSessionSchema = z.object({
  id: z.string().optional(),
  activityId: z.string(),
  classId: z.string(),
  hostId: z.string(),
  status: z.enum(['waiting', 'active', 'completed']).default('waiting'),
  startedAt: z.date().nullable().optional(),
  endedAt: z.date().nullable().optional(),
  settings: sessionSettingsSchema.nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectLiveSessionSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  classId: z.string(),
  hostId: z.string(),
  status: z.enum(['waiting', 'active', 'completed']),
  startedAt: z.date().nullable(),
  endedAt: z.date().nullable(),
  settings: sessionSettingsSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LiveSession = z.infer<typeof selectLiveSessionSchema>;
export type NewLiveSession = z.infer<typeof insertLiveSessionSchema>;

// ---------------------------------------------------------------------------
// LiveResponse
// ---------------------------------------------------------------------------

export const insertLiveResponseSchema = z.object({
  id: z.string().optional(),
  sessionId: z.string(),
  userId: z.string(),
  questionId: z.string(),
  answer: liveResponseAnswerSchema,
  isCorrect: z.boolean(),
  responseTimeMs: z.number().int(),
  respondedAt: z.date().optional(),
  createdAt: z.date().optional(),
});

export const selectLiveResponseSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  questionId: z.string(),
  answer: liveResponseAnswerSchema,
  isCorrect: z.boolean(),
  responseTimeMs: z.number().int(),
  respondedAt: z.date(),
  createdAt: z.date(),
});

export type LiveResponse = z.infer<typeof selectLiveResponseSchema>;
export type NewLiveResponse = z.infer<typeof insertLiveResponseSchema>;

// ---------------------------------------------------------------------------
// SessionLeaderboardEntry
// ---------------------------------------------------------------------------

export const insertSessionLeaderboardEntrySchema = z.object({
  id: z.string().optional(),
  sessionId: z.string(),
  userId: z.string(),
  score: z.number().int().default(0),
  totalQuestions: z.number().int().default(0),
  avgResponseTimeMs: z.number().int().nullable().optional(),
  rank: z.number().int().nullable().optional(),
  updatedAt: z.date().optional(),
});

export const selectSessionLeaderboardEntrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  score: z.number().int(),
  totalQuestions: z.number().int(),
  avgResponseTimeMs: z.number().int().nullable(),
  rank: z.number().int().nullable(),
  updatedAt: z.date(),
});

export type SessionLeaderboardEntry = z.infer<typeof selectSessionLeaderboardEntrySchema>;
export type NewSessionLeaderboardEntry = z.infer<typeof insertSessionLeaderboardEntrySchema>;

// ---------------------------------------------------------------------------
// ContentRevision
// ---------------------------------------------------------------------------

export const insertContentRevisionSchema = z.object({
  id: z.string().optional(),
  entityType: z.enum(['lesson', 'phase', 'activity']),
  entityId: z.string(),
  proposedChanges: jsonRecordSchema,
  validationStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  validationErrors: validationErrorSchema.array().nullable().optional(),
  proposedBy: z.string(),
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.date().nullable().optional(),
  comment: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectContentRevisionSchema = z.object({
  id: z.string(),
  entityType: z.enum(['lesson', 'phase', 'activity']),
  entityId: z.string(),
  proposedChanges: jsonRecordSchema,
  validationStatus: z.enum(['pending', 'approved', 'rejected']),
  validationErrors: validationErrorSchema.array().nullable(),
  proposedBy: z.string(),
  reviewedBy: z.string().nullable(),
  reviewedAt: z.date().nullable(),
  comment: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContentRevision = z.infer<typeof selectContentRevisionSchema>;
export type NewContentRevision = z.infer<typeof insertContentRevisionSchema>;

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export const insertOrganizationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  settings: organizationSettingsSchema.nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectOrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  settings: organizationSettingsSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof selectOrganizationSchema>;
export type NewOrganization = z.infer<typeof insertOrganizationSchema>;
