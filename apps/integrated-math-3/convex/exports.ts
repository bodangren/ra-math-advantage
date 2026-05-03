import { internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export interface StudentExportRow {
  studentId: string;
  studentName: string;
  lessonSlug: string;
  lessonTitle: string;
  phasesCompleted: number;
  totalPhases: number;
  activityScore: number | null;
  srsCardsNew: number;
  srsCardsLearning: number;
  srsCardsReview: number;
  lastActive: number | null;
}

export interface ClassExportRow {
  studentId: string;
  studentName: string;
  lessonsCompleted: number;
  totalLessons: number;
  overallProgress: number;
  averageScore: number | null;
}

export interface SubmissionExportRow {
  submissionId: string;
  studentId: string;
  studentName: string;
  activityId: string;
  componentKey: string;
  score: number | null;
  maxScore: number | null;
  submittedAt: number;
}

function filterByDateRange<T extends { createdAt?: number; updatedAt?: number; submittedAt?: number }>(
  rows: T[],
  startDate?: number,
  endDate?: number,
  dateField: "createdAt" | "updatedAt" | "submittedAt" = "updatedAt",
): T[] {
  return rows.filter((row) => {
    const ts = row[dateField];
    if (ts == null) return false;
    if (startDate != null && ts < startDate) return false;
    if (endDate != null && ts > endDate) return false;
    return true;
  });
}

export async function getStudentExportHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles">; startDate?: number; endDate?: number },
): Promise<{ studentName: string; rows: StudentExportRow[] } | null> {
  const student = await ctx.db.get(args.studentId);
  if (!student || student.role !== "student") return null;

  const studentName = student.displayName ?? student.username;

  const [progressRows, submissions, srsCards, lessons, lessonVersions, phaseVersions] =
    await Promise.all([
      ctx.db
        .query("student_progress")
        .withIndex("by_user", (q) => q.eq("userId", args.studentId))
        .collect(),
      ctx.db
        .query("activity_submissions")
        .withIndex("by_user", (q) => q.eq("userId", args.studentId))
        .collect(),
      ctx.db
        .query("srs_cards")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
        .collect(),
      ctx.db.query("lessons").collect(),
      ctx.db.query("lesson_versions").collect(),
      ctx.db.query("phase_versions").collect(),
    ]);

  const filteredProgress = filterByDateRange(progressRows, args.startDate, args.endDate, "updatedAt");
  const filteredSubmissions = filterByDateRange(submissions, args.startDate, args.endDate, "submittedAt");

  const srsSummary = { new: 0, learning: 0, review: 0, relearned: 0 };
  for (const card of srsCards) {
    if (card.state === "new") srsSummary.new++;
    else if (card.state === "learning") srsSummary.learning++;
    else if (card.state === "review") srsSummary.review++;
    else if (card.state === "relearning") srsSummary.relearned++;
  }

  const lessonMap = new Map(lessons.map((l) => [l._id, l]));
  const latestVersionByLesson = new Map<string, (typeof lessonVersions)[number]>();
  for (const lv of lessonVersions) {
    if (lv.status !== "published") continue;
    const existing = latestVersionByLesson.get(lv.lessonId);
    if (!existing || lv.version > existing.version) {
      latestVersionByLesson.set(lv.lessonId, lv);
    }
  }

  const phaseVersionByLessonVersion = new Map<string, Array<(typeof phaseVersions)[number]>>();
  for (const pv of phaseVersions) {
    let arr = phaseVersionByLessonVersion.get(pv.lessonVersionId);
    if (!arr) {
      arr = [];
      phaseVersionByLessonVersion.set(pv.lessonVersionId, arr);
    }
    arr.push(pv);
  }

  const progressByPhaseId = new Map<string, Array<(typeof filteredProgress)[number]>>();
  for (const pr of filteredProgress) {
    let arr = progressByPhaseId.get(pr.phaseId);
    if (!arr) {
      arr = [];
      progressByPhaseId.set(pr.phaseId, arr);
    }
    arr.push(pr);
  }

  const rows: StudentExportRow[] = [];

  for (const [lessonId, lesson] of lessonMap) {
    const version = latestVersionByLesson.get(lessonId);
    if (!version) continue;

    const phases = phaseVersionByLessonVersion.get(version._id) ?? [];
    const totalPhases = phases.length;
    if (totalPhases === 0) continue;

    let phasesCompleted = 0;
    let lastActive: number | null = null;

    for (const pv of phases) {
      const progressArr = progressByPhaseId.get(pv._id);
      if (!progressArr) continue;
      const latest = progressArr.reduce((best, curr) =>
        curr.updatedAt > best.updatedAt ? curr : best,
      );
      if (latest.status === "completed") phasesCompleted++;
      if (lastActive == null || latest.updatedAt > lastActive) {
        lastActive = latest.updatedAt;
      }
    }

    const lessonSubmissions = filteredSubmissions;
    let totalScore = 0;
    let scoreCount = 0;
    for (const sub of lessonSubmissions) {
      if (sub.score != null && sub.maxScore != null && sub.maxScore > 0) {
        totalScore += sub.score / sub.maxScore;
        scoreCount++;
      }
    }
    const activityScore = scoreCount > 0 ? totalScore / scoreCount : null;

    rows.push({
      studentId: args.studentId,
      studentName,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      phasesCompleted,
      totalPhases,
      activityScore,
      srsCardsNew: srsSummary.new,
      srsCardsLearning: srsSummary.learning,
      srsCardsReview: srsSummary.review,
      lastActive,
    });
  }

  rows.sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle));
  return { studentName, rows };
}

export const getStudentExport = internalQuery({
  args: {
    studentId: v.id("profiles"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => getStudentExportHandler(ctx, args),
});

export async function getClassExportHandler(
  ctx: QueryCtx,
  args: { classId: Id<"classes">; startDate?: number; endDate?: number },
): Promise<ClassExportRow[] | null> {
  const classDoc = await ctx.db.get(args.classId);
  if (!classDoc) return null;

  const enrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class", (q) => q.eq("classId", args.classId))
    .collect();

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const studentIds = activeEnrollments.map((e) => e.studentId);

  if (studentIds.length === 0) return [];

  const [profiles, progressArrays, submissionArrays, lessonVersions, phaseVersions] =
    await Promise.all([
      Promise.all(studentIds.map((id) => ctx.db.get(id))),
      Promise.all(
        studentIds.map((id) =>
          ctx.db
            .query("student_progress")
            .withIndex("by_user", (q) => q.eq("userId", id))
            .collect(),
        ),
      ),
      Promise.all(
        studentIds.map((id) =>
          ctx.db
            .query("activity_submissions")
            .withIndex("by_user", (q) => q.eq("userId", id))
            .collect(),
        ),
      ),
      ctx.db.query("lesson_versions").collect(),
      ctx.db.query("phase_versions").collect(),
    ]);

  const publishedVersions = new Map<string, (typeof lessonVersions)[number]>();
  for (const lv of lessonVersions) {
    if (lv.status !== "published") continue;
    const existing = publishedVersions.get(lv.lessonId);
    if (!existing || lv.version > existing.version) {
      publishedVersions.set(lv.lessonId, lv);
    }
  }

  const phaseByVersion = new Map<string, Array<(typeof phaseVersions)[number]>>();
  for (const pv of phaseVersions) {
    let arr = phaseByVersion.get(pv.lessonVersionId);
    if (!arr) {
      arr = [];
      phaseByVersion.set(pv.lessonVersionId, arr);
    }
    arr.push(pv);
  }

  let totalPhases = 0;
  for (const [, version] of publishedVersions) {
    const phases = phaseByVersion.get(version._id) ?? [];
    totalPhases += phases.length;
  }

  const phaseIdToLessonId = new Map<string, string>();
  for (const [lessonId, version] of publishedVersions) {
    for (const pv of phaseByVersion.get(version._id) ?? []) {
      phaseIdToLessonId.set(pv._id, lessonId);
    }
  }

  const totalLessons = publishedVersions.size;

  const rows: ClassExportRow[] = [];

  for (let i = 0; i < studentIds.length; i++) {
    const profile = profiles[i];
    if (!profile || profile.role !== "student") continue;

    const progress = progressArrays[i];
    const filteredProgress = filterByDateRange(progress, args.startDate, args.endDate, "updatedAt");

    const completedPhases = filteredProgress.filter((p) => p.status === "completed").length;

    const completedLessonIds = new Set<string>();
    const lessonPhaseCounts = new Map<string, { completed: number; total: number }>();
    for (const pr of filteredProgress) {
      const lessonId = phaseIdToLessonId.get(pr.phaseId);
      if (!lessonId) continue;
      const entry = lessonPhaseCounts.get(lessonId) ?? { completed: 0, total: 0 };
      if (pr.status === "completed") entry.completed++;
      lessonPhaseCounts.set(lessonId, entry);
    }
    for (const [lessonId, version] of publishedVersions) {
      const phases = phaseByVersion.get(version._id) ?? [];
      const entry = lessonPhaseCounts.get(lessonId);
      if (entry && entry.completed >= phases.length && phases.length > 0) {
        completedLessonIds.add(lessonId);
      }
    }

    const submissions = filterByDateRange(submissionArrays[i], args.startDate, args.endDate, "submittedAt");
    let totalScore = 0;
    let scoreCount = 0;
    for (const sub of submissions) {
      if (sub.score != null && sub.maxScore != null && sub.maxScore > 0) {
        totalScore += sub.score / sub.maxScore;
        scoreCount++;
      }
    }

    rows.push({
      studentId: profile._id,
      studentName: profile.displayName ?? profile.username,
      lessonsCompleted: completedLessonIds.size,
      totalLessons,
      overallProgress: totalPhases > 0 ? completedPhases / totalPhases : 0,
      averageScore: scoreCount > 0 ? totalScore / scoreCount : null,
    });
  }

  rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
  return rows;
}

export const getClassExport = internalQuery({
  args: {
    classId: v.id("classes"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => getClassExportHandler(ctx, args),
});

export async function getSubmissionExportHandler(
  ctx: QueryCtx,
  args: {
    classId: Id<"classes">;
    startDate?: number;
    endDate: number;
    limit?: number;
  },
): Promise<{ rows: SubmissionExportRow[]; hasMore: boolean }> {
  const enrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class", (q) => q.eq("classId", args.classId))
    .collect();

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const studentIds = activeEnrollments.map((e) => e.studentId);

  if (studentIds.length === 0) return { rows: [], hasMore: false };

  const [profiles, submissionArrays, activityIds] = await Promise.all([
    Promise.all(studentIds.map((id) => ctx.db.get(id))),
    Promise.all(
      studentIds.map((id) =>
        ctx.db
          .query("activity_submissions")
          .withIndex("by_user", (q) => q.eq("userId", id))
          .collect(),
      ),
    ),
    (async () => {
      const allSubs = await Promise.all(
        studentIds.map((id) =>
          ctx.db
            .query("activity_submissions")
            .withIndex("by_user", (q) => q.eq("userId", id))
            .collect(),
        ),
      );
      const ids = new Set<string>();
      for (const subs of allSubs) {
        for (const s of subs) ids.add(s.activityId);
      }
      return Array.from(ids);
    })(),
  ]);

  const activityDocs = await Promise.all(
    activityIds.map((id) => ctx.db.get(id as Id<"activities">)),
  );
  const activityMap = new Map<string, { componentKey: string }>();
  for (const doc of activityDocs) {
    if (doc) activityMap.set(doc._id, { componentKey: doc.componentKey });
  }

  const profileMap = new Map<string, { displayName: string }>();
  for (const p of profiles) {
    if (p) profileMap.set(p._id, { displayName: p.displayName ?? p.username });
  }

  const allRows: SubmissionExportRow[] = [];
  const limit = args.limit ?? 200;

  for (let i = 0; i < studentIds.length; i++) {
    const studentId = studentIds[i];
    const profile = profileMap.get(studentId);
    const submissions = filterByDateRange(
      submissionArrays[i],
      args.startDate,
      args.endDate,
      "submittedAt",
    );

    for (const sub of submissions) {
      const activity = activityMap.get(sub.activityId);
      allRows.push({
        submissionId: sub._id,
        studentId: sub.userId,
        studentName: profile?.displayName ?? "",
        activityId: sub.activityId,
        componentKey: activity?.componentKey ?? "",
        score: sub.score ?? null,
        maxScore: sub.maxScore ?? null,
        submittedAt: sub.submittedAt,
      });

      if (allRows.length >= limit + 1) break;
    }
    if (allRows.length >= limit + 1) break;
  }

  const hasMore = allRows.length > limit;
  return { rows: allRows.slice(0, limit), hasMore };
}

export const getSubmissionExport = internalQuery({
  args: {
    classId: v.id("classes"),
    startDate: v.optional(v.number()),
    endDate: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => getSubmissionExportHandler(ctx, args),
});
