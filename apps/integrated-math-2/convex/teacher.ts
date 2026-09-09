import { internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v, ConvexError } from "convex/values";
import { isPilotPublished, resolveTeacherExposureSource, trianglePublished } from "./activities";
import { teacherAccount, teacherClass } from "./classes";
export const getTeacherDashboardData = internalQuery({
  args: { teacherId: v.id("profiles") },
  returns: v.object({
    classes: v.array(
      v.object({ id: v.id("classes"), name: v.string(), joinCode: v.string() }),
    ),
  }),
  handler: async (ctx, args) => {
    await teacherAccount(ctx, args.teacherId);
    const rows = await ctx.db
      .query("classes")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .take(101);
    if (rows.length > 100) throw new ConvexError("classes_require_pagination");
    return {
      classes: rows
        .filter((row) => !row.archived)
        .map((row) => ({
          id: row._id,
          name: row.name,
          joinCode: row.joinCode ?? "",
        })),
    };
  },
});
export const getStudentEvidence = internalQuery({
  args: {
    teacherId: v.id("profiles"),
    classId: v.id("classes"),
    studentId: v.id("profiles"),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    name: v.string(),
    nextCursor: v.union(v.null(), v.string()),
    submissions: v.array(
      v.object({
        id: v.id("activity_submissions"),
        activity: v.string(),
        answer: v.string(),
        score: v.number(),
        maxScore: v.number(),
        feedback: v.string(),
        submittedAt: v.number(),
        canRecordExposure: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await teacherClass(ctx, args.teacherId, args.classId);
    const enrollment = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class_and_student", (q) =>
        q.eq("classId", args.classId).eq("studentId", args.studentId),
      )
      .unique();
    const student = await ctx.db.get(args.studentId);
    const teacher = await ctx.db.get(args.teacherId);
    if (
      !student ||
      enrollment?.status !== "active" ||
      student.organizationId !== teacher?.organizationId
    )
      throw new ConvexError("not_allowed");
    const page = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user", (q) => q.eq("userId", args.studentId))
      .order("desc")
      .paginate({ numItems: 20, cursor: args.cursor ?? null });
    const assigned = await ctx.db
      .query("class_lessons")
      .withIndex("by_class_and_lesson", (q) => q.eq("classId", args.classId))
      .take(200);
    const rows = page.page.filter((row) =>
      assigned.some((a) => a.lessonId === row.lessonId),
    );
    const submissions = await Promise.all(
      rows.map(async (row) => {
        const activity = await ctx.db.get(row.activityId);
        const source = await resolveTeacherExposureSource(ctx, args.studentId, row._id);
        return ({
        id: row._id,
        activity: activity?.displayName ?? "Practice",
        answer: (() => {
          if (typeof row.submissionData?.rawResponse === "string") return row.submissionData.rawResponse;
          if (typeof row.submissionData?.answers?.response === "string") return row.submissionData.answers.response;
          const parts = Array.isArray(row.submissionData?.parts) ? row.submissionData.parts : [];
          const currentPartId = row.submissionData?.artifact?.currentPartId;
          const currentPart = parts.find((part: { partId?: unknown; rawAnswer?: unknown }) => part?.partId === currentPartId);
          return typeof currentPart?.rawAnswer === "string" ? `${currentPart.partId}: ${currentPart.rawAnswer}` : "";
        })(),
        score: (() => {
          const parts = Array.isArray(row.submissionData?.parts) ? row.submissionData.parts : [];
          const complete = row.submissionData?.artifact?.finalPart === true && parts.every((part: { isCorrect?: unknown }) => part?.isCorrect === true);
          const current = parts.find((part: { partId?: unknown; score?: unknown; maxScore?: unknown }) => part?.partId === row.submissionData?.artifact?.currentPartId);
          return complete ? row.score ?? 0 : typeof current?.score === "number" ? current.score : row.score ?? 0;
        })(),
        maxScore: (() => {
          const parts = Array.isArray(row.submissionData?.parts) ? row.submissionData.parts : [];
          const complete = row.submissionData?.artifact?.finalPart === true && parts.every((part: { isCorrect?: unknown }) => part?.isCorrect === true);
          const current = parts.find((part: { partId?: unknown; score?: unknown; maxScore?: unknown }) => part?.partId === row.submissionData?.artifact?.currentPartId);
          return complete ? row.maxScore ?? 1 : typeof current?.maxScore === "number" ? current.maxScore : row.maxScore ?? 1;
        })(),
        feedback: row.feedback ?? "",
        submittedAt: row.submittedAt,
        canRecordExposure: source !== null
          && (source.nodeId === "math.im2.skill.1.1.perpendicular-bisector-equidistance"
            ? isPilotPublished()
            : trianglePublished(source.nodeId))
          && row.lessonId === source.lesson._id
          && row.submittedAt >= Math.max(
            enrollment.enrolledAt,
            assigned.find((assignment) => assignment.lessonId === source.lesson._id)?.assignedAt ?? Number.POSITIVE_INFINITY,
          )
          && activity?._id === source.activity._id,
      });}),
    );
    return {
      name: student.displayName ?? student.username,
      submissions,
      nextCursor: page.isDone ? null : page.continueCursor,
    };
  },
});

export const getGradebook = internalQuery({
  args: {
    teacherId: v.id("profiles"),
    classId: v.id("classes"),
    unitNumber: v.number(),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    className: v.string(),
    nextCursor: v.union(v.null(), v.string()),
    lessons: v.array(
      v.object({ id: v.id("lessons"), title: v.string(), total: v.number() }),
    ),
    students: v.array(
      v.object({
        id: v.id("profiles"),
        name: v.string(),
        completed: v.array(v.number()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const classroom = await teacherClass(ctx, args.teacherId, args.classId);
    if (
      !Number.isInteger(args.unitNumber) ||
      args.unitNumber < 1 ||
      args.unitNumber > 13
    )
      throw new ConvexError("invalid_unit");
    const assigned = await ctx.db
      .query("class_lessons")
      .withIndex("by_class_and_lesson", (q) => q.eq("classId", args.classId))
      .take(200);
    const rows = await ctx.db
      .query("lessons")
      .withIndex("by_unit_and_order", (q) =>
        q.eq("unitNumber", args.unitNumber),
      )
      .take(30);
    const lessons: Array<{ id: Id<"lessons">; title: string; total: number }> =
      [];
    const phaseIds: Array<Set<Id<"phase_versions">>> = [];
    for (const lesson of rows.filter((row) =>
      assigned.some((a) => a.lessonId === row._id),
    )) {
      const version = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson_status_version", (q) =>
          q.eq("lessonId", lesson._id).eq("status", "published"),
        )
        .order("desc")
        .first();
      if (!version) continue;
      const phases = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version", (q) =>
          q.eq("lessonVersionId", version._id),
        )
        .take(100);
      lessons.push({
        id: lesson._id,
        title: version.title ?? lesson.title,
        total: phases.length,
      });
      phaseIds.push(new Set(phases.map((p) => p._id)));
    }
    const page = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .paginate({ numItems: 20, cursor: args.cursor ?? null });
    const students = [];
    const teacher = await ctx.db.get(args.teacherId);
    for (const enrollment of page.page) {
      const student = await ctx.db.get(enrollment.studentId);
      if (
        enrollment.status !== "active" ||
        !student ||
        student.organizationId !== teacher?.organizationId
      )
        continue;
      const completed = [];
      for (let i = 0; i < lessons.length; i++) {
        let count = 0;
        for (const phaseId of phaseIds[i]) {
          const progress = await ctx.db
            .query("student_progress")
            .withIndex("by_user_and_phase", (q) =>
              q.eq("userId", student._id).eq("phaseId", phaseId),
            )
            .unique();
          if (progress?.status === "completed") count++;
        }
        completed.push(count);
      }
      students.push({
        id: student._id,
        name: student.displayName ?? student.username,
        completed,
      });
    }
    return {
      className: classroom.name,
      lessons,
      students,
      nextCursor: page.isDone ? null : page.continueCursor,
    };
  },
});
