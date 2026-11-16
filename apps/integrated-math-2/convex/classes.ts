import { v, ConvexError } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { activeAccount } from "./auth";

export async function teacherAccount(
  ctx: Pick<QueryCtx, "db">,
  teacherId: Id<"profiles">,
) {
  const teacher = await activeAccount(ctx, teacherId);
  if (!teacher || teacher.role === "student")
    throw new ConvexError("not_allowed");
  return teacher;
}
export async function teacherClass(
  ctx: Pick<QueryCtx, "db">,
  teacherId: Id<"profiles">,
  classId: Id<"classes">,
) {
  await teacherAccount(ctx, teacherId);
  const classroom = await ctx.db.get(classId);
  if (!classroom || classroom.teacherId !== teacherId || classroom.archived)
    throw new ConvexError("not_allowed");
  return classroom;
}
export const createClass = internalMutation({
  args: { teacherId: v.id("profiles"), name: v.string(), joinCode: v.string() },
  returns: v.id("classes"),
  handler: async (ctx, args) => {
    await teacherAccount(ctx, args.teacherId);
    if (
      !args.name.trim() ||
      args.name.length > 100 ||
      args.joinCode.length < 12 ||
      args.joinCode.length > 80
    )
      throw new ConvexError("invalid_class");
    if (
      await ctx.db
        .query("classes")
        .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode))
        .unique()
    )
      throw new ConvexError("code_in_use");
    const now = Date.now();
    return ctx.db.insert("classes", {
      teacherId: args.teacherId,
      name: args.name.trim(),
      joinCode: args.joinCode,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});
export const assignLesson = internalMutation({
  args: {
    teacherId: v.id("profiles"),
    classId: v.id("classes"),
    lessonId: v.id("lessons"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await teacherClass(ctx, args.teacherId, args.classId);
    const published = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_status_version", (q) =>
        q.eq("lessonId", args.lessonId).eq("status", "published"),
      )
      .order("desc")
      .first();
    if (!published) throw new ConvexError("not_available");
    const existing = await ctx.db
      .query("class_lessons")
      .withIndex("by_class_and_lesson", (q) =>
        q.eq("classId", args.classId).eq("lessonId", args.lessonId),
      )
      .unique();
    if (!existing) {
      const now = Date.now();
      await ctx.db.insert("class_lessons", {
        classId: args.classId,
        lessonId: args.lessonId,
        assignedAt: now,
        createdAt: now,
      });
    }
    return null;
  },
});
export const getClass = internalQuery({
  args: {
    teacherId: v.id("profiles"),
    classId: v.id("classes"),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    id: v.id("classes"),
    name: v.string(),
    joinCode: v.string(),
    nextCursor: v.union(v.null(), v.string()),
    students: v.array(v.object({ id: v.id("profiles"), name: v.string() })),
    assignedLessonIds: v.array(v.id("lessons")),
  }),
  handler: async (ctx, args) => {
    const classroom = await teacherClass(ctx, args.teacherId, args.classId);
    const teacher = await teacherAccount(ctx, args.teacherId);
    const page = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .paginate({ numItems: 50, cursor: args.cursor ?? null });
    const enrollments = page.page;
    const users = await Promise.all(
      enrollments
        .filter((e) => e.status === "active")
        .map((e) => ctx.db.get(e.studentId)),
    );
    const assignments = await ctx.db
      .query("class_lessons")
      .withIndex("by_class_and_lesson", (q) => q.eq("classId", args.classId))
      .take(200);
    return {
      nextCursor: page.isDone ? null : page.continueCursor,
      id: classroom._id,
      name: classroom.name,
      joinCode: classroom.joinCode ?? "",
      students: users
        .filter(
          (u): u is NonNullable<typeof u> =>
            u !== null &&
            u.role === "student" &&
            u.organizationId === teacher.organizationId,
        )
        .map((u) => ({ id: u._id, name: u.displayName ?? u.username })),
      assignedLessonIds: assignments.map((a) => a.lessonId),
    };
  },
});

export const joinClass = internalMutation({
  args: { studentId: v.id("profiles"), classCode: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const student = await activeAccount(ctx, args.studentId);
    if (!student || student.role !== "student") throw new ConvexError("not_allowed");
    const classCode = args.classCode.trim();
    if (classCode.length < 12 || classCode.length > 80) throw new ConvexError("invalid_class");
    const classroom = await ctx.db.query("classes")
      .withIndex("by_join_code", (q) => q.eq("joinCode", classCode)).unique();
    const teacher = classroom && !classroom.archived
      ? await activeAccount(ctx, classroom.teacherId) : null;
    if (!classroom || !teacher || teacher.role === "student" || teacher.organizationId !== student.organizationId)
      throw new ConvexError("invalid_class");
    const existing = await ctx.db.query("class_enrollments")
      .withIndex("by_class_and_student", (q) => q.eq("classId", classroom._id).eq("studentId", student._id)).unique();
    if (existing) {
      if (existing.status !== "active") throw new ConvexError("enrollment_closed");
      return null;
    }
    const now = Date.now();
    await ctx.db.insert("class_enrollments", {
      classId: classroom._id, studentId: student._id, status: "active",
      enrolledAt: now, createdAt: now, updatedAt: now,
    });
    return null;
  },
});
