import { internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { activeAccount } from "./auth";
export const getDashboardData = internalQuery({
  args: { userId: v.id("profiles") },
  returns: v.array(
    v.object({
      id: v.id("lessons"),
      title: v.string(),
      slug: v.string(),
      unitNumber: v.number(),
      orderIndex: v.number(),
      completed: v.number(),
      total: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const user = await activeAccount(ctx, args.userId);
    if (!user || user.role !== "student") throw new ConvexError("not_allowed");
    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_student_status", (q) => q.eq("studentId", args.userId).eq("status", "active"))
      .take(100);
    const ids = new Set<Id<"lessons">>();
    for (const enrollment of enrollments) {
      if (enrollment.status !== "active") continue;
      const classroom = await ctx.db.get(enrollment.classId);
      const teacher = classroom ? await activeAccount(ctx, classroom.teacherId) : null;
      if (
        !classroom ||
        classroom.archived ||
        !teacher ||
        teacher.role === "student" ||
        teacher.organizationId !== user.organizationId
      )
        continue;
      const assigned = await ctx.db
        .query("class_lessons")
        .withIndex("by_class_and_lesson", (q) => q.eq("classId", classroom._id))
        .take(200);
      for (const row of assigned) ids.add(row.lessonId);
    }
    const result = [];
    for (const lessonId of ids) {
      const lesson = await ctx.db.get(lessonId);
      if (!lesson) continue;
      const version = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson_status_version", (q) =>
          q.eq("lessonId", lessonId).eq("status", "published"),
        )
        .order("desc")
        .first();
      if (!version) continue;
      const phases = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", version._id))
        .take(100);
      let completed = 0;
      for (const phase of phases) {
        const progress = await ctx.db
          .query("student_progress")
          .withIndex("by_user_and_phase", (q) =>
            q.eq("userId", args.userId).eq("phaseId", phase._id),
          )
          .unique();
        if (progress?.status === "completed") completed++;
      }
      result.push({
        id: lessonId,
        title: version.title ?? lesson.title,
        slug: lesson.slug,
        unitNumber: lesson.unitNumber,
        orderIndex: lesson.orderIndex,
        completed,
        total: phases.length,
      });
    }
    return result.sort((a, b) => a.unitNumber - b.unitNumber || a.orderIndex - b.orderIndex);
  },
});
