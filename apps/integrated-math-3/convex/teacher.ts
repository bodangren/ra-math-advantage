import { internalQuery, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { getAuthorizedTeacher } from "./auth";
import { assembleCourseOverviewRows, type CourseOverviewRow, type UnitColumn } from "../lib/teacher/course-overview";
import { assembleGradebookRows, type GradebookRow, type GradebookLesson } from "../lib/teacher/gradebook";
import {
  assembleCompetencyHeatmapRows,
  assembleStudentCompetencyDetail,
  type CompetencyHeatmapResponse,
  type StudentCompetencyDetail,
} from "../lib/teacher/competency-heatmap";
import {
  buildLatestPublishedLessonVersionMap,
  buildPublishedPhaseIdSet,
  buildPublishedProgressSnapshot,
  buildPublishedUnitProgressRows,
  resolveLatestPublishedLessonVersion,
  type ProgressRowLike,
} from "../lib/progress/published-curriculum";
import {
  getWeakObjectivesHandler,
  getStrugglingStudentsHandler,
  getMisconceptionSummaryHandler,
} from "./teacher/srs-queries";

interface TeacherProgressSnapshot {
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
  currentLesson: string | null;
  atGlanceStatus: 'on-track' | 'behind' | 'not-started';
}

type AtGlanceStatus = 'on-track' | 'behind' | 'not-started';

function computeAtGlanceStatus(progressPercentage: number): AtGlanceStatus {
  if (progressPercentage === 0) return 'not-started';
  if (progressPercentage >= 50) return 'on-track';
  return 'behind';
}

interface TeacherStudentDetailUnitRow {
  unitNumber: number;
  unitTitle: string;
  lessons: Array<{
    id: string;
    unitNumber: number;
    title: string;
    slug: string;
    description: string | null;
    totalPhases: number;
    completedPhases: number;
    progressPercentage: number;
  }>;
}

interface SpreadsheetSubmission {
  spreadsheetData?: unknown;
}

interface PracticeSubmissionEvidence {
  contractVersion?: string;
  activityId?: string;
  mode?: string;
  status?: string;
  attemptNumber?: number;
  submittedAt?: string;
  answers?: Record<string, unknown>;
  parts?: Array<Record<string, unknown>>;
  artifact?: Record<string, unknown>;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
}

interface SubmissionEvidence {
  kind: 'spreadsheet' | 'practice';
  activityId: string;
  activityTitle: string;
  componentKey: string;
  submittedAt: string;
  spreadsheetData?: unknown;
  submissionData?: PracticeSubmissionEvidence | Record<string, unknown>;
  attemptNumber?: number;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
}

const DEFAULT_PHASE_NAMES: Record<number, string> = {
  1: 'Hook',
  2: 'Introduction',
  3: 'Guided Practice',
  4: 'Independent Practice',
  5: 'Assessment',
  6: 'Closing',
};

function sortStudentsByName<
  T extends {
    username: string;
    displayName?: string | null;
  },
>(students: T[]): T[] {
  return [...students].sort((a, b) =>
    (a.displayName ?? a.username).localeCompare(b.displayName ?? b.username),
  );
}

async function listOrganizationStudents(
  ctx: QueryCtx,
  organizationId: Id<"organizations">,
) {
  const allProfiles = await ctx.db
    .query("profiles")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();

  return sortStudentsByName(
    allProfiles.filter((profile) => profile.role === "student"),
  );
}

async function getOrganizationName(
  ctx: QueryCtx,
  organizationId: Id<"organizations">,
) {
  const organization = await ctx.db.get(organizationId);
  return organization?.name ?? "Your organization";
}

async function listLatestPublishedLessonVersions(
  ctx: QueryCtx,
  lessonIds?: string[],
) {
  const lessonVersions = await ctx.db.query("lesson_versions").collect();
  return [
    ...buildLatestPublishedLessonVersionMap(lessonVersions, lessonIds).values(),
  ];
}

async function listActivePhaseIds(
  ctx: QueryCtx,
): Promise<Set<Id<"phase_versions">>> {
  const lessonIds = (await ctx.db.query("lessons").collect()).map((lesson) => lesson._id);
  const lessonVersions = await ctx.db.query("lesson_versions").collect();
  const phaseVersions = await ctx.db.query("phase_versions").collect();
  return buildPublishedPhaseIdSet({
    lessonIds,
    lessonVersions,
    phaseVersions,
  }) as Set<Id<"phase_versions">>;
}

async function buildStudentProgressSnapshot(
  progressRows: readonly ProgressRowLike[],
  activePhaseIds: ReadonlySet<string>,
  phaseVersionLessonMap?: Map<string, string>,
  lessonVersionLessonMap?: Map<string, string>,
  lessonTitleMap?: Map<string, string>,
): Promise<TeacherProgressSnapshot> {
  const snapshot = buildPublishedProgressSnapshot({
    activePhaseIds,
    progressRows,
  });

  let currentLesson: string | null = null;
  if (phaseVersionLessonMap && lessonVersionLessonMap && lessonTitleMap && progressRows.length > 0) {
    let mostRecentRow = progressRows[0];
    let mostRecentTime = progressRows[0].updatedAt ?? 0;

    for (const row of progressRows) {
      const rowTime = row.updatedAt ?? 0;
      if (rowTime > mostRecentTime) {
        mostRecentTime = rowTime;
        mostRecentRow = row;
      }
    }

    const lessonVersionId = phaseVersionLessonMap.get(mostRecentRow.phaseId);
    if (lessonVersionId) {
      const lessonId = lessonVersionLessonMap.get(lessonVersionId);
      if (lessonId) {
        currentLesson = lessonTitleMap.get(lessonId) ?? null;
      }
    }
  }

  return {
    ...snapshot,
    currentLesson,
    atGlanceStatus: computeAtGlanceStatus(snapshot.progressPercentage),
  };
}

async function listStudentDetailUnits(
  ctx: QueryCtx,
  studentId: Id<"profiles">,
): Promise<TeacherStudentDetailUnitRow[]> {
  const allLessons = await ctx.db.query("lessons").collect();

  if (allLessons.length === 0) {
    return [];
  }

  const lessonVersions = await ctx.db.query("lesson_versions").collect();
  const phaseVersions = await ctx.db.query("phase_versions").collect();
  const progressRows = await ctx.db
    .query("student_progress")
    .withIndex("by_user", (q) => q.eq("userId", studentId as never))
    .collect();

  return buildPublishedUnitProgressRows({
    lessons: allLessons,
    lessonVersions,
    phaseVersions,
    progressRows,
  }) as TeacherStudentDetailUnitRow[];
}

export const getTeacherDashboardData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const organizationName = await getOrganizationName(ctx, teacher.organizationId);
    const students = await listOrganizationStudents(ctx, teacher.organizationId);
    const studentIds = students.map((s) => s._id);
    const activePhaseIds = await listActivePhaseIds(ctx);

    const lessonVersions = await ctx.db.query("lesson_versions").collect();
    const phaseVersions = await ctx.db.query("phase_versions").collect();
    const lessons = await ctx.db.query("lessons").collect();

    const phaseVersionLessonMap = new Map<string, string>();
    const lessonVersionLessonMap = new Map<string, string>();
    const lessonTitleMap = new Map<string, string>();

    for (const pv of phaseVersions) {
      phaseVersionLessonMap.set(pv._id, pv.lessonVersionId);
    }

    const latestVersions = buildLatestPublishedLessonVersionMap(lessonVersions);
    for (const [lessonId] of latestVersions) {
      const lesson = lessons.find((l) => l._id === lessonId);
      if (lesson) {
        lessonTitleMap.set(lessonId, lesson.title);
      }
    }

    for (const [, lv] of latestVersions) {
      lessonVersionLessonMap.set(lv._id, lv.lessonId);
    }

    const snapshots = new Map<string, TeacherProgressSnapshot>();
    const progressRowsArrays = await Promise.all(
      studentIds.map((studentId) =>
        ctx.db
          .query("student_progress")
          .withIndex("by_user", (q) => q.eq("userId", studentId))
          .collect()
      )
    );
    for (let i = 0; i < studentIds.length; i++) {
      const studentId = studentIds[i];
      const progressRows = progressRowsArrays[i];
      const snapshot = await buildStudentProgressSnapshot(
        progressRows,
        activePhaseIds,
        phaseVersionLessonMap,
        lessonVersionLessonMap,
        lessonTitleMap,
      );
      snapshots.set(studentId, snapshot);
    }

    const studentsWithProgress = students.map((student) => {
      const snapshot = snapshots.get(student._id);
      return {
        id: student._id,
        username: student.username,
        displayName: student.displayName,
        completedPhases: snapshot?.completedPhases ?? 0,
        totalPhases: snapshot?.totalPhases ?? 0,
        progressPercentage: snapshot?.progressPercentage ?? 0,
        lastActive: snapshot?.lastActive ?? null,
        currentLesson: snapshot?.currentLesson ?? null,
        atGlanceStatus: snapshot?.atGlanceStatus ?? 'not-started',
      };
    });

    return {
      teacher: {
        username: teacher.username,
        organizationName,
        organizationId: teacher.organizationId,
      },
      students: studentsWithProgress,
    };
  },
});

export async function getTeacherCourseOverviewDataHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles"> },
): Promise<{ rows: CourseOverviewRow[]; units: UnitColumn[] } | null> {
  const teacher = await getAuthorizedTeacher(ctx, args.userId);
  if (!teacher) {
    return null;
  }

  const students = await listOrganizationStudents(ctx, teacher.organizationId);
  const rawLessons = (await ctx.db.query("lessons").collect())
    .sort((a, b) => a.unitNumber - b.unitNumber || a.orderIndex - b.orderIndex)
    .map((lesson) => ({
      id: lesson._id,
      unitNumber: lesson.unitNumber,
    }));

  if (rawLessons.length === 0) {
    return { rows: [], units: [] };
  }

  const rawLessonVersions = (await listLatestPublishedLessonVersions(
    ctx,
    rawLessons.map((lesson) => lesson.id),
  )).map((version) => ({
    id: version._id,
    lessonId: version.lessonId,
  }));

  const rawStudents = students.map((student) => ({
    id: student._id,
    username: student.username,
    displayName: student.displayName ?? null,
  }));

  if (rawLessonVersions.length === 0) {
    return assembleCourseOverviewRows(rawStudents, rawLessons, [], [], []);
  }

  const lessonVersionIds = new Set(rawLessonVersions.map((version) => version.id));
  const rawPrimaryStandards = (await ctx.db.query("lesson_standards").collect())
    .filter(
      (standard) =>
        standard.isPrimary && lessonVersionIds.has(standard.lessonVersionId),
    )
    .map((standard) => ({
      lessonVersionId: standard.lessonVersionId,
      standardId: standard.standardId,
      isPrimary: standard.isPrimary,
    }));

  if (rawPrimaryStandards.length === 0) {
    return assembleCourseOverviewRows(rawStudents, rawLessons, rawLessonVersions, [], []);
  }

  const standardIds = new Set(rawPrimaryStandards.map((standard) => standard.standardId));
  const competencyRows = (
    await Promise.all(
      students.map((student) =>
        ctx.db
          .query("student_competency")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .collect(),
      ),
    )
  )
    .flat()
    .filter((row) => standardIds.has(row.standardId))
    .map((row) => ({
      studentId: row.studentId,
      standardId: row.standardId,
      masteryLevel: row.masteryLevel,
    }));

  return assembleCourseOverviewRows(
    rawStudents,
    rawLessons,
    rawLessonVersions,
    rawPrimaryStandards,
    competencyRows,
  );
}

export const getTeacherCourseOverviewData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => getTeacherCourseOverviewDataHandler(ctx, args),
});

export async function getTeacherGradebookDataHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; unitNumber: number },
): Promise<{ rows: GradebookRow[]; lessons: GradebookLesson[] } | null> {
  const teacher = await getAuthorizedTeacher(ctx, args.userId);
  if (!teacher) {
    return null;
  }

  const rawLessons = (await ctx.db.query("lessons").collect())
    .filter((lesson) => lesson.unitNumber === args.unitNumber)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((lesson) => ({
      id: lesson._id,
      title: lesson.title,
      orderIndex: lesson.orderIndex,
      unitNumber: lesson.unitNumber,
    }));

  if (rawLessons.length === 0) {
    return { rows: [], lessons: [] };
  }

  const rawLessonVersions = (await listLatestPublishedLessonVersions(
    ctx,
    rawLessons.map((lesson) => lesson.id),
  )).map((version) => ({
    id: version._id,
    lessonId: version.lessonId,
  }));

  if (rawLessonVersions.length === 0) {
    return assembleGradebookRows([], rawLessons, [], [], [], [], []);
  }

  const lessonVersionIds = new Set(rawLessonVersions.map((version) => version.id));
  const rawPhaseVersions = (await ctx.db.query("phase_versions").collect())
    .filter((phase) => lessonVersionIds.has(phase.lessonVersionId))
    .map((phase) => ({
      id: phase._id,
      lessonVersionId: phase.lessonVersionId,
      phaseNumber: phase.phaseNumber,
    }));

  const rawPrimaryStandards = (await ctx.db.query("lesson_standards").collect())
    .filter(
      (standard) =>
        standard.isPrimary && lessonVersionIds.has(standard.lessonVersionId),
    )
    .map((standard) => ({
      lessonVersionId: standard.lessonVersionId,
      standardId: standard.standardId,
      isPrimary: standard.isPrimary,
    }));

  const students = await listOrganizationStudents(ctx, teacher.organizationId);
  const rawStudents = students.map((student) => ({
    id: student._id,
    username: student.username,
    displayName: student.displayName ?? null,
  }));

  if (students.length === 0) {
    return assembleGradebookRows([], rawLessons, rawLessonVersions, rawPhaseVersions, rawPrimaryStandards, [], []);
  }

  const phaseIds = new Set(rawPhaseVersions.map((phase) => phase.id));
  const standardIds = new Set(rawPrimaryStandards.map((standard) => standard.standardId));

  const progressRows = (
    await Promise.all(
      students.map((student) =>
        ctx.db
          .query("student_progress")
          .withIndex("by_user", (q) => q.eq("userId", student._id))
          .collect(),
      ),
    )
  )
    .flat()
    .filter((row) => phaseIds.has(row.phaseId))
    .map((row) => ({
      userId: row.userId,
      phaseId: row.phaseId,
      status: row.status,
    }));

  const competencyRows = (
    await Promise.all(
      students.map((student) =>
        ctx.db
          .query("student_competency")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .collect(),
      ),
    )
  )
    .flat()
    .filter((row) => standardIds.has(row.standardId))
    .map((row) => ({
      studentId: row.studentId,
      standardId: row.standardId,
      masteryLevel: row.masteryLevel,
    }));

  return assembleGradebookRows(
    rawStudents,
    rawLessons,
    rawLessonVersions,
    rawPhaseVersions,
    rawPrimaryStandards,
    progressRows,
    competencyRows,
  );
}

export const getTeacherGradebookData = internalQuery({
  args: {
    userId: v.id("profiles"),
    unitNumber: v.number(),
  },
  handler: async (ctx, args) => getTeacherGradebookDataHandler(ctx, args),
});

export async function getTeacherCompetencyHeatmapDataHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles"> },
): Promise<CompetencyHeatmapResponse | null> {
  const teacher = await getAuthorizedTeacher(ctx, args.userId);
  if (!teacher) {
    return null;
  }

  const standards = (await ctx.db.query("competency_standards").collect()).map(
    (standard) => ({
      id: standard._id,
      code: standard.code,
      description: standard.description,
      studentFriendlyDescription: standard.studentFriendlyDescription ?? null,
      category: standard.category ?? null,
      isActive: standard.isActive,
    }),
  );

  const students = await listOrganizationStudents(ctx, teacher.organizationId);
  const rawStudents = students.map((student) => ({
    id: student._id,
    username: student.username,
    displayName: student.displayName ?? null,
  }));

  if (students.length === 0) {
    return assembleCompetencyHeatmapRows([], standards, []);
  }

  const competencyRows = (
    await Promise.all(
      students.map((student) =>
        ctx.db
          .query("student_competency")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .collect(),
      ),
    )
  )
    .flat()
    .map((row) => ({
      studentId: row.studentId,
      standardId: row.standardId,
      masteryLevel: row.masteryLevel,
      evidenceActivityId: row.evidenceActivityId ?? null,
      lastUpdated: row.lastUpdated,
      updatedBy: row.updatedBy ?? null,
    }));

  return assembleCompetencyHeatmapRows(rawStudents, standards, competencyRows);
}

export const getTeacherCompetencyHeatmapData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => getTeacherCompetencyHeatmapDataHandler(ctx, args),
});

export async function getTeacherStudentCompetencyDetailHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; studentId: Id<"profiles"> },
): Promise<StudentCompetencyDetail | null> {
  const teacher = await getAuthorizedTeacher(ctx, args.userId);
  if (!teacher) {
    return null;
  }

  const student = await ctx.db.get(args.studentId);
  if (
    !student ||
    student.role !== "student" ||
    student.organizationId !== teacher.organizationId
  ) {
    return null;
  }

  const rawStudent = {
    id: student._id,
    username: student.username,
    displayName: student.displayName ?? null,
  };

  const standards = (await ctx.db.query("competency_standards").collect()).map(
    (standard) => ({
      id: standard._id,
      code: standard.code,
      description: standard.description,
      studentFriendlyDescription: standard.studentFriendlyDescription ?? null,
      category: standard.category ?? null,
      isActive: standard.isActive,
    }),
  );

  const competencyRows = (
    await ctx.db
      .query("student_competency")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect()
  ).map((row) => ({
    studentId: row.studentId,
    standardId: row.standardId,
    masteryLevel: row.masteryLevel,
    evidenceActivityId: row.evidenceActivityId ?? null,
    lastUpdated: row.lastUpdated,
    updatedBy: row.updatedBy ?? null,
  }));

  const rawLessonVersions = (await ctx.db.query("lesson_versions").collect()).map(
    (version) => ({
      id: version._id,
      lessonId: version.lessonId,
    }),
  );

  const rawLessons = (await ctx.db.query("lessons").collect()).map((lesson) => ({
    id: lesson._id,
    unitNumber: lesson.unitNumber,
    title: lesson.title,
  }));

  const rawLessonStandards = (await ctx.db.query("lesson_standards").collect()).map(
    (ls) => ({
      standardId: ls.standardId,
      lessonVersionId: ls.lessonVersionId,
      isPrimary: ls.isPrimary,
    }),
  );

  return assembleStudentCompetencyDetail(
    rawStudent,
    standards,
    competencyRows,
    rawLessonStandards,
    rawLessonVersions,
    rawLessons,
  );
}

export const getTeacherStudentCompetencyDetail = internalQuery({
  args: {
    userId: v.id("profiles"),
    studentId: v.id("profiles"),
  },
  handler: async (ctx, args) => getTeacherStudentCompetencyDetailHandler(ctx, args),
});

export const getTeacherStudentDetail = internalQuery({
  args: {
    userId: v.id("profiles"),
    studentId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return { status: "unauthorized" as const };
    }

    const student = await ctx.db.get(args.studentId);
    if (
      !student ||
      student.role !== "student" ||
      student.organizationId !== teacher.organizationId
    ) {
      return { status: "not_found" as const };
    }

    const organizationName = await getOrganizationName(ctx, teacher.organizationId);
    const activePhaseIds = await listActivePhaseIds(ctx);
    const progressRows = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", student._id))
      .collect();
    const snapshot = await buildStudentProgressSnapshot(progressRows, activePhaseIds);
    const units = await listStudentDetailUnits(ctx, student._id);

    return {
      status: "success" as const,
      organizationName,
      student: {
        id: student._id,
        username: student.username,
        displayName: student.displayName ?? null,
      },
      snapshot,
      units,
    };
  },
});

export const getTeacherLessonMonitoringData = internalQuery({
  args: {
    userId: v.id("profiles"),
    unitNumber: v.number(),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return { status: "unauthorized" as const };
    }

    const unitLessons = (await ctx.db.query("lessons").collect())
      .filter((lesson) => lesson.unitNumber === args.unitNumber)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    if (unitLessons.length === 0) {
      return { status: "not_found" as const };
    }

    const selectedLesson = unitLessons.find((lesson) => lesson._id === args.lessonId);
    if (!selectedLesson) {
      return { status: "not_found" as const };
    }

    const latestPublishedByLessonId = buildLatestPublishedLessonVersionMap(
      await ctx.db.query("lesson_versions").collect(),
      unitLessons.map((lesson) => lesson._id),
    );
    const selectedVersion = latestPublishedByLessonId.get(selectedLesson._id);

    const phases =
      selectedVersion == null
        ? []
        : await ctx.db
            .query("phase_versions")
            .withIndex("by_lesson_version", (q) =>
              q.eq("lessonVersionId", selectedVersion._id),
            )
            .collect();

    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    const phasesWithSections = await Promise.all(
      phases.map(async (phase) => {
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
          .collect();

        sections.sort((a, b) => a.sequenceOrder - b.sequenceOrder);

        return {
          id: phase._id,
          phaseNumber: phase.phaseNumber,
          title: phase.title ?? null,
          estimatedMinutes: phase.estimatedMinutes ?? null,
          sections: sections.map((section) => ({
            id: section._id,
            sectionType: section.sectionType,
            content: section.content,
          })),
        };
      }),
    );

    return {
      status: "success" as const,
      unitNumber: args.unitNumber,
      lesson: {
        id: selectedLesson._id,
        unitNumber: selectedLesson.unitNumber,
        title: selectedVersion?.title ?? selectedLesson.title,
        slug: selectedLesson.slug,
        description: selectedVersion?.description ?? selectedLesson.description ?? null,
        learningObjectives: selectedLesson.learningObjectives ?? null,
        orderIndex: selectedLesson.orderIndex,
        metadata: selectedLesson.metadata ?? null,
        createdAt: selectedLesson.createdAt,
        updatedAt: selectedLesson.updatedAt,
      },
      phases: phasesWithSections,
      unitLessons: unitLessons.map((lesson) => ({
        id: lesson._id,
        title: latestPublishedByLessonId.get(lesson._id)?.title ?? lesson.title,
        orderIndex: lesson.orderIndex,
      })),
    };
  },
});

export async function getSubmissionDetailHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; studentId: Id<"profiles">; lessonId: Id<"lessons">; studentName: string },
): Promise<{
  studentName: string;
  lessonTitle: string;
  phases: Array<{
    phaseNumber: number;
    phaseId: string;
    title: string;
    status: string;
    completedAt: number | null;
    spreadsheetData: unknown | null;
    evidence: SubmissionEvidence[];
  }>;
  studentErrorSummary: unknown;
} | null> {
  const teacher = await getAuthorizedTeacher(ctx, args.userId);
  if (!teacher) {
    return null;
  }

  const student = await ctx.db.get(args.studentId);
  if (
    !student ||
    student.role !== "student" ||
    student.organizationId !== teacher.organizationId
  ) {
    return null;
  }

  const lesson = await ctx.db.get(args.lessonId);
  if (!lesson) return null;

  const lessonVersions = await ctx.db
    .query("lesson_versions")
    .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
    .filter((q) => q.eq(q.field("status"), "published"))
    .collect();

  if (lessonVersions.length === 0) return null;

  const lessonVersion = resolveLatestPublishedLessonVersion(lessonVersions);
  if (!lessonVersion) return null;

  const rawPhases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", lessonVersion._id))
    .collect();

  if (rawPhases.length === 0) return null;

  const phaseIds = rawPhases.map((p) => p._id);

  const progressRows = await ctx.db
    .query("student_progress")
    .withIndex("by_user", (q) => q.eq("userId", args.studentId))
    .filter((q) => q.or(...phaseIds.map((id) => q.eq(q.field("phaseId"), id))))
    .collect();

  const completionRows = await ctx.db
    .query("activity_completions")
    .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
    .filter((q) => q.eq(q.field("lessonId"), args.lessonId))
    .collect();

  const spreadsheetByPhaseNumber = new Map<number, unknown>();
  const evidenceByPhaseNumber = new Map<number, SubmissionEvidence[]>();

  if (completionRows.length > 0) {
    const activityIds = completionRows.map((c) => c.activityId);
    const phaseByActivityId = new Map<string, number>();
    for (const c of completionRows) {
      phaseByActivityId.set(c.activityId, c.phaseNumber);
    }

    const [spreadsheetRows, practiceRows, activityRows] = await Promise.all([
      ctx.db
        .query("student_spreadsheet_responses")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
        .filter((q) => q.or(...activityIds.map((id) => q.eq(q.field("activityId"), id))))
        .collect(),

      ctx.db
        .query("activity_submissions")
        .withIndex("by_user", (q) => q.eq("userId", args.studentId))
        .filter((q) => q.or(...activityIds.map((id) => q.eq(q.field("activityId"), id))))
        .collect(),

      Promise.all(
        activityIds.map(async (activityId) => [activityId, await ctx.db.get(activityId)] as const),
      ),
    ]);

    const activityById = new Map<
      string,
      {
        displayName: string;
        componentKey: string;
      }
    >();
    for (const [activityId, activity] of activityRows) {
      if (!activity) continue;
      activityById.set(String(activityId), {
        displayName: activity.displayName,
        componentKey: activity.componentKey,
      });
    }

    for (const row of spreadsheetRows) {
      const phaseNum = phaseByActivityId.get(row.activityId);
      const spreadsheetRow = row as SpreadsheetSubmission;
      if (phaseNum !== undefined && spreadsheetRow.spreadsheetData) {
        spreadsheetByPhaseNumber.set(phaseNum, spreadsheetRow.spreadsheetData);

        const activity = activityById.get(row.activityId);
        const evidence: SubmissionEvidence = {
          kind: 'spreadsheet',
          activityId: row.activityId,
          activityTitle: activity?.displayName ?? 'Spreadsheet activity',
          componentKey: activity?.componentKey ?? 'spreadsheet',
          submittedAt: new Date(row.updatedAt).toISOString(),
          spreadsheetData: spreadsheetRow.spreadsheetData,
        };

        const existingEvidence = evidenceByPhaseNumber.get(phaseNum) ?? [];
        existingEvidence.push(evidence);
        evidenceByPhaseNumber.set(phaseNum, existingEvidence);
      }
    }

    const latestPracticeByActivity = new Map<string, (typeof practiceRows)[number]>();
    for (const row of practiceRows) {
      const current = latestPracticeByActivity.get(row.activityId);
      if (!current) {
        latestPracticeByActivity.set(row.activityId, row);
        continue;
      }

      if (
        row.submittedAt > current.submittedAt ||
        (row.submittedAt === current.submittedAt && row.updatedAt >= current.updatedAt)
      ) {
        latestPracticeByActivity.set(row.activityId, row);
      }
    }

    for (const [activityId, row] of latestPracticeByActivity.entries()) {
      const phaseNum = phaseByActivityId.get(activityId);
      if (phaseNum === undefined) {
        continue;
      }

      const activity = activityById.get(activityId);
      const submissionData = row.submissionData as PracticeSubmissionEvidence | Record<string, unknown>;
      const evidence: SubmissionEvidence = {
        kind: 'practice',
        activityId,
        activityTitle: activity?.displayName ?? 'Practice submission',
        componentKey: activity?.componentKey ?? 'practice',
        submittedAt: new Date(row.submittedAt).toISOString(),
        attemptNumber:
          typeof submissionData.attemptNumber === 'number' ? submissionData.attemptNumber : 1,
        score: row.score ?? null,
        maxScore: row.maxScore ?? null,
        feedback: row.feedback ?? null,
        submissionData,
      };

      const existingEvidence = evidenceByPhaseNumber.get(phaseNum) ?? [];
      existingEvidence.push(evidence);
      evidenceByPhaseNumber.set(phaseNum, existingEvidence);
    }
  }

  const progressByPhaseId = new Map<string, (typeof progressRows)[number]>();
  for (const row of progressRows) {
    progressByPhaseId.set(row.phaseId, row);
  }

  const phases = [...rawPhases]
    .sort((a, b) => a.phaseNumber - b.phaseNumber)
    .map((phase) => {
      const progress = progressByPhaseId.get(phase._id);
      const status = progress?.status ?? "not_started";
      const title =
        phase.title?.trim() ||
        DEFAULT_PHASE_NAMES[phase.phaseNumber] ||
        `Phase ${phase.phaseNumber}`;

      return {
        phaseNumber: phase.phaseNumber,
        phaseId: phase._id,
        title,
        status,
        completedAt: progress?.completedAt ?? null,
        spreadsheetData: spreadsheetByPhaseNumber.get(phase.phaseNumber) ?? null,
        evidence: evidenceByPhaseNumber.get(phase.phaseNumber) ?? [],
      };
    });

  const practiceEnvelopes = [];
  for (const evidenceList of evidenceByPhaseNumber.values()) {
    for (const evidence of evidenceList) {
      if (evidence.kind === 'practice' && evidence.submissionData) {
        const data = evidence.submissionData as Record<string, unknown>;
        if (data.contractVersion === 'practice.v1') {
          practiceEnvelopes.push(data);
        }
      }
    }
  }

  let studentErrorSummary = null;
  if (practiceEnvelopes.length > 0) {
    const { buildDeterministicSummary } = await import(
      "../lib/practice/error-analysis"
    );

    const studentIdMap = new Map<string, string>();
    for (const env of practiceEnvelopes) {
      studentIdMap.set(
        env.activityId as string,
        args.studentId,
      );
    }

    studentErrorSummary = buildDeterministicSummary(
      args.lessonId,
      practiceEnvelopes as never,
      studentIdMap,
    );
  }

  return {
    studentName: args.studentName,
    lessonTitle: lesson.title,
    phases,
    studentErrorSummary,
  };
}

export const getSubmissionDetail = internalQuery({
  args: {
    userId: v.id("profiles"),
    studentId: v.id("profiles"),
    lessonId: v.id("lessons"),
    studentName: v.string(),
  },
  handler: async (ctx, args) => getSubmissionDetailHandler(ctx, args),
});

export const getProfileWithOrg = internalQuery({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
      username: profile.username,
      displayName: profile.displayName,
    };
  },
});

export const getLessonErrorSummary = internalQuery({
  args: {
    userId: v.id("profiles"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;

    const completions = await ctx.db
      .query("activity_completions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    if (completions.length === 0) return null;

    const studentIds = [...new Set(completions.map((c) => c.studentId))];

    const orgStudentIds: string[] = [];
    await Promise.all(
      studentIds.map(async (sid) => {
        const profile = await ctx.db.get(sid as Id<"profiles">);
        if (profile && profile.organizationId === teacher.organizationId) {
          orgStudentIds.push(sid);
        }
      }),
    );

    if (orgStudentIds.length === 0) return null;

    const orgCompletions = completions.filter((c) =>
      orgStudentIds.includes(c.studentId),
    );
    const activityIds = [...new Set(orgCompletions.map((c) => c.activityId))];

    const submissionRows = await ctx.db
      .query("activity_submissions")
      .withIndex("by_activity", (q) =>
        q.eq("activityId", activityIds[0] as Id<"activities">),
      )
      .collect();

    const allSubmissions = await Promise.all(
      activityIds.slice(1).map((activityId) =>
        ctx.db
          .query("activity_submissions")
          .withIndex("by_activity", (q) => q.eq("activityId", activityId))
          .collect(),
      ),
    );

    const flatSubmissions = [...submissionRows, ...allSubmissions.flat()];

    const studentSubmissions = flatSubmissions.filter((row) =>
      orgStudentIds.includes(row.userId),
    );

    if (studentSubmissions.length === 0) return null;

    const latestByStudentAndActivity = new Map<
      string,
      (typeof studentSubmissions)[number]
    >();
    for (const row of studentSubmissions) {
      const key = `${row.userId}:${row.activityId}`;
      const current = latestByStudentAndActivity.get(key);
      if (
        !current ||
        row.submittedAt > current.submittedAt ||
        (row.submittedAt === current.submittedAt &&
          row.updatedAt >= current.updatedAt)
      ) {
        latestByStudentAndActivity.set(key, row);
      }
    }

    const envelopes = [];
    const studentIdMap = new Map<string, string>();

    for (const [key, row] of latestByStudentAndActivity.entries()) {
      const data = row.submissionData as Record<string, unknown>;
      if (data.contractVersion === "practice.v1") {
        envelopes.push(data);
        const [, studentId] = key.split(":");
        studentIdMap.set(data.activityId as string, studentId as string);
      }
    }

    if (envelopes.length === 0) return null;

    const { buildDeterministicSummary } = await import(
      "../lib/practice/error-analysis"
    );

    return buildDeterministicSummary(
      args.lessonId,
      envelopes as never,
      studentIdMap,
    );
  },
});

export const getTeacherLessonPreview = internalQuery({
  args: { lessonIdentifier: v.string(), userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    let lesson = null;
    try {
      lesson = await ctx.db.get(args.lessonIdentifier as Id<"lessons">);
    } catch {}

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.lessonIdentifier))
        .unique();
    }

    if (!lesson) return null;

    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) {
      return {
        lessonTitle: lesson.title,
        unitNumber: lesson.unitNumber,
        lessonNumber: lesson.orderIndex,
        phases: [],
      };
    }

    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();

    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    const sectionsByPhaseId = new Map<string, { id: string; sequenceOrder: number; sectionType: string; content: unknown }[]>();
    for (const phase of phases) {
      const sections = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
        .collect();
      sectionsByPhaseId.set(phase._id, sections
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map(s => ({ id: s._id, sequenceOrder: s.sequenceOrder, sectionType: s.sectionType, content: s.content }))
      );
    }

    return {
      lessonTitle: lesson.title,
      unitNumber: lesson.unitNumber,
      lessonNumber: lesson.orderIndex,
      phases: phases.map(p => ({
        phaseId: p._id,
        phaseNumber: p.phaseNumber,
        phaseType: p.phaseType,
        title: p.title ?? DEFAULT_PHASE_LABELS[p.phaseType] ?? 'Phase',
        sections: sectionsByPhaseId.get(p._id) ?? [],
        status: 'available' as const,
        completed: false,
      })),
    };
  },
});

const DEFAULT_PHASE_LABELS: Record<string, string> = {
  explore: 'Explore',
  vocabulary: 'Vocabulary',
  learn: 'Learn',
  key_concept: 'Key Concept',
  worked_example: 'Example',
  guided_practice: 'Guided Practice',
  independent_practice: 'Practice',
  assessment: 'Assessment',
  discourse: 'Think About It',
  reflection: 'Reflection',
};

export const getStandardsCoverage = internalQuery({
  args: { unitNumber: v.optional(v.number()), userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const allStandards = await ctx.db.query("competency_standards").collect();
    const activeStandards = allStandards.filter(s => s.isActive);

    const allLessons = await ctx.db.query("lessons").collect();
    const moduleLessons = args.unitNumber != null
      ? allLessons.filter(l => l.unitNumber === args.unitNumber)
      : allLessons;
    moduleLessons.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    const lessonVersions = await ctx.db.query("lesson_versions").collect();
    const latestVersionMap = buildLatestPublishedLessonVersionMap(lessonVersions);

    const lessonStandards = await ctx.db.query("lesson_standards").collect();

    const standardsCoverage = activeStandards.map(standard => {
      const lessonsCoveringStandard: Array<{
        lessonId: string;
        lessonTitle: string;
        lessonSlug: string;
        lessonOrderIndex: number;
        isPrimary: boolean;
      }> = [];

      for (const lesson of moduleLessons) {
        const latestVersion = latestVersionMap.get(lesson._id);
        if (!latestVersion) continue;

        const lessonStandardEntries = lessonStandards.filter(
          ls => ls.lessonVersionId === latestVersion._id && ls.standardId === standard._id
        );

        for (const ls of lessonStandardEntries) {
          lessonsCoveringStandard.push({
            lessonId: lesson._id,
            lessonTitle: lesson.title,
            lessonSlug: lesson.slug,
            lessonOrderIndex: lesson.orderIndex,
            isPrimary: ls.isPrimary,
          });
        }
      }

      return {
        standardId: standard._id,
        standardCode: standard.code,
        standardDescription: standard.description,
        studentFriendlyDescription: standard.studentFriendlyDescription,
        category: standard.category,
        lessons: lessonsCoveringStandard,
      };
    });

    return {
      standards: standardsCoverage,
      lessons: moduleLessons.map(l => ({
        id: l._id,
        title: l.title,
        slug: l.slug,
        unitNumber: l.unitNumber,
        orderIndex: l.orderIndex,
        learningObjectives: l.learningObjectives ?? [],
      })),
    };
  },
});

export const getTeacherSrsDashboardData = internalQuery({
  args: {
    userId: v.id("profiles"),
    classId: v.optional(v.id("classes")),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
      .collect();

    const activeClasses = classes.filter((c) => !c.archived);
    const currentClassId = args.classId ?? activeClasses[0]?._id;

    if (!currentClassId) {
      return {
        classes: activeClasses.map((c) => ({ id: c._id, name: c.name })),
        currentClassId: null,
        classHealth: null,
        overdueLoad: null,
        streaks: [],
        weakObjectives: [],
        strugglingStudents: [],
        misconceptions: [],
      };
    }

    const currentClass = await ctx.db.get(currentClassId);
    if (!currentClass || currentClass.teacherId !== teacher._id) {
      return null;
    }

    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class", (q) => q.eq("classId", currentClassId))
      .collect();

    const activeStudents = enrollments.filter((e) => e.status === "active");
    const studentIds = activeStudents.map((e) => e.studentId);
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    const yesterdayMs = todayStartMs - 24 * 60 * 60 * 1000;

    const [cardsArrays, sessionsArrays, profilesResults] = await Promise.all([
      Promise.all(
        studentIds.map((studentId) =>
          ctx.db
            .query("srs_cards")
            .withIndex("by_student", (q) => q.eq("studentId", studentId))
            .collect()
        )
      ),
      Promise.all(
        studentIds.map((studentId) =>
          ctx.db
            .query("srs_sessions")
            .withIndex("by_student", (q) => q.eq("studentId", studentId))
            .collect()
        )
      ),
      Promise.all(studentIds.map((studentId) => ctx.db.get("profiles", studentId))),
    ]);

    const profilesMap = new Map(
      profilesResults
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map((p) => [p._id, p])
    );

    let totalActiveStudents = 0;
    let practicedToday = 0;
    let totalRetention = 0;
    let cardCount = 0;

    const perStudentOverdue: Array<{ studentId: string; overdueCount: number }> = [];
    let totalOverdue = 0;

    const studentStreaks: Array<{ studentId: string; displayName: string; streak: number }> = [];
    const nowIso = new Date(now).toISOString();

    for (let i = 0; i < activeStudents.length; i++) {
      const enrollment = activeStudents[i];
      const cards = cardsArrays[i];
      const sessions = sessionsArrays[i];
      const profile = profilesMap.get(enrollment.studentId);

      if (cards.length > 0) {
        totalActiveStudents++;
        for (const card of cards) {
          totalRetention += card.stability;
          cardCount++;
        }
      }

      const overdueCards = cards.filter((c) => c.dueDate < nowIso);
      const overdueCount = overdueCards.length;
      totalOverdue += overdueCount;
      perStudentOverdue.push({ studentId: enrollment.studentId, overdueCount });

      if (!profile) continue;

      const completedSessions = sessions.filter((s) => s.completedAt !== undefined);
      if (completedSessions.length === 0) continue;

      const practicedTodaySession = completedSessions.some(
        (s) => s.completedAt && s.completedAt >= todayStartMs
      );
      if (practicedTodaySession) {
        practicedToday++;
      }

      const uniqueDays = Array.from(
        new Set(
          completedSessions.map((s) => {
            const d = new Date(s.completedAt!);
            return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          })
        )
      ).sort((a, b) => b - a);

      const mostRecent = uniqueDays[0];
      let streak = 0;

      if (mostRecent === todayStartMs || mostRecent === yesterdayMs) {
        streak = 1;
        let checkDay = mostRecent;
        for (let j = 1; j < uniqueDays.length; j++) {
          const expected = checkDay - 24 * 60 * 60 * 1000;
          if (uniqueDays[j] === expected) {
            streak++;
            checkDay = uniqueDays[j];
          } else if (uniqueDays[j] < expected) {
            break;
          }
        }
      }

      if (streak > 0) {
        studentStreaks.push({
          studentId: enrollment.studentId,
          displayName: profile.displayName ?? profile.username,
          streak,
        });
      }
    }

    studentStreaks.sort((a, b) => b.streak - a.streak);

    const avgRetention = cardCount > 0 ? totalRetention / cardCount : 0;

    const [weakObjectives, strugglingStudents, misconceptions] = await Promise.all([
      getWeakObjectivesHandler(ctx, { classId: currentClassId as unknown as string }).catch(() => []),
      getStrugglingStudentsHandler(ctx, { classId: currentClassId as unknown as string }).catch(() => []),
      getMisconceptionSummaryHandler(ctx, { classId: currentClassId as unknown as string }).catch(() => []),
    ]);

    return {
      classes: activeClasses.map((c) => ({ id: c._id, name: c.name })),
      currentClassId,
      classHealth: {
        totalActiveStudents,
        practicedToday,
        avgRetention,
        totalCards: cardCount,
      },
      overdueLoad: {
        totalOverdue,
        perStudent: perStudentOverdue,
      },
      streaks: studentStreaks.slice(0, 5),
      weakObjectives,
      strugglingStudents,
      misconceptions,
    };
  },
});
