import { v, ConvexError } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { activeAccount } from "./auth";
import { questionSchema, gradeQuestion } from "../lib/practice/question";

async function accessibleLesson(
  ctx: Pick<QueryCtx, "db">,
  userId: Id<"profiles">,
  lessonId: Id<"lessons">,
) {
  const user = await activeAccount(ctx, userId);
  if (!user || user.role !== "student") throw new ConvexError("not_allowed");
  const enrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_student", (q) => q.eq("studentId", userId))
    .take(100);
  for (const enrollment of enrollments) {
    if (enrollment.status !== "active") continue;
    const classroom = await ctx.db.get(enrollment.classId);
    if (!classroom || classroom.archived) continue;
    const teacher = await ctx.db.get(classroom.teacherId);
    if (
      !teacher ||
      teacher.role === "student" ||
      teacher.organizationId !== user.organizationId
    )
      continue;
    const assignment = await ctx.db
      .query("class_lessons")
      .withIndex("by_class_and_lesson", (q) =>
        q.eq("classId", classroom._id).eq("lessonId", lessonId),
      )
      .unique();
    if (assignment) return;
  }
  throw new ConvexError("not_allowed");
}
async function phaseContext(
  ctx: Pick<QueryCtx, "db">,
  userId: Id<"profiles">,
  phaseId: Id<"phase_versions">,
) {
  const phase = await ctx.db.get(phaseId);
  const version = phase ? await ctx.db.get(phase.lessonVersionId) : null;
  if (!phase || !version || version.status !== "published")
    throw new ConvexError("not_available");
  await accessibleLesson(ctx, userId, version.lessonId);
  const phases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", version._id))
    .take(100);
  for (const earlier of phases.filter(
    (p) => p.phaseNumber < phase.phaseNumber,
  )) {
    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", userId).eq("phaseId", earlier._id),
      )
      .unique();
    if (progress?.status !== "completed")
      throw new ConvexError("complete_previous_phase");
  }
  const sections = await ctx.db
    .query("phase_sections")
    .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phaseId))
    .take(100);
  return { phase, version, sections };
}
const resultValidator = v.object({
  score: v.number(),
  maxScore: v.number(),
  feedback: v.string(),
});
export const submitAnswer = internalMutation({
  args: {
    userId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
    activityId: v.id("activities"),
    answer: v.string(),
    submissionKey: v.string(),
  },
  returns: resultValidator,
  handler: async (ctx, args) => {
    if (
      args.answer.length > 128 ||
      !args.submissionKey ||
      args.submissionKey.length > 80
    )
      throw new ConvexError("invalid_answer");
    const { sections, version, phase } = await phaseContext(
      ctx,
      args.userId,
      args.phaseId,
    );
    if (
      !sections.some(
        (section) =>
          section.sectionType === "activity" &&
          section.content?.activityId === args.activityId,
      )
    )
      throw new ConvexError("not_allowed");
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_key", (q) =>
        q.eq("userId", args.userId).eq("submissionKey", args.submissionKey),
      )
      .unique();
    if (existing) {
      if (
        existing.activityId !== args.activityId ||
        existing.phaseId !== args.phaseId ||
        existing.submissionData?.answers?.response !== args.answer
      )
        throw new ConvexError("replay_conflict");
      return {
        score: existing.score ?? 0,
        maxScore: existing.maxScore ?? 1,
        feedback: existing.feedback ?? "",
      };
    }
    const activity = await ctx.db.get(args.activityId);
    const parsed = questionSchema.safeParse(activity?.props);
    if (!parsed.success) throw new ConvexError("not_available");
    const result = gradeQuestion(parsed.data, args.answer);
    const now = Date.now();
    const prior = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity", (q) =>
        q.eq("userId", args.userId).eq("activityId", args.activityId),
      )
      .order("desc")
      .first();
    const attemptNumber =
      typeof prior?.submissionData?.attemptNumber === "number"
        ? prior.submissionData.attemptNumber + 1
        : 1;
    const submissionData = {
      contractVersion: "practice.v1",
      activityId: args.activityId,
      mode: ["worked_example", "guided_practice", "assessment"].includes(
        phase.phaseType,
      )
        ? phase.phaseType
        : "independent_practice",
      status: "submitted",
      attemptNumber,
      submittedAt: new Date(now).toISOString(),
      answers: { response: args.answer },
      parts: [
        {
          partId: "response",
          rawAnswer: args.answer,
          isCorrect: result.score === 1,
          score: result.score,
          maxScore: 1,
          feedback: result.feedback,
        },
      ],
    };
    await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: args.activityId,
      phaseId: args.phaseId,
      lessonId: version.lessonId,
      submissionKey: args.submissionKey,
      submissionData,
      ...result,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return result;
  },
});
export const completePhase = internalMutation({
  args: { userId: v.id("profiles"), phaseId: v.id("phase_versions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { version, sections } = await phaseContext(
      ctx,
      args.userId,
      args.phaseId,
    );
    for (const section of sections) {
      if (section.sectionType !== "activity") continue;
      const activityId = section.content?.activityId as
        | Id<"activities">
        | undefined;
      if (!activityId) throw new ConvexError("not_available");
      const submissions = await ctx.db
        .query("activity_submissions")
        .withIndex("by_user_and_activity", (q) =>
          q.eq("userId", args.userId).eq("activityId", activityId),
        )
        .order("desc")
        .take(100);
      if (
        !submissions.some(
          (submission) =>
            submission.phaseId === args.phaseId &&
            submission.maxScore === 1 &&
            submission.score === 1,
        )
      )
        throw new ConvexError("complete_practice");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", args.userId).eq("phaseId", args.phaseId),
      )
      .unique();
    if (existing?.status === "completed") return null;
    const data = {
      userId: args.userId,
      phaseId: args.phaseId,
      lessonId: version.lessonId,
      status: "completed" as const,
      completedAt: now,
      updatedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, data);
    else
      await ctx.db.insert("student_progress", {
        ...data,
        createdAt: now,
        startedAt: now,
      });
    return null;
  },
});

const sectionValidator = v.union(
  v.object({ kind: v.literal("text"), markdown: v.string() }),
  v.object({
    kind: v.literal("question"),
    id: v.id("activities"),
    prompt: v.string(),
    answerType: v.union(v.literal("numeric"), v.literal("choice")),
    choices: v.array(v.object({ id: v.string(), text: v.string() })),
    hint: v.string(),
  }),
);
export const getLesson = internalQuery({
  args: { userId: v.id("profiles"), slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("lessons"),
      title: v.string(),
      slug: v.string(),
      phases: v.array(
        v.object({
          id: v.id("phase_versions"),
          title: v.string(),
          number: v.number(),
          completed: v.boolean(),
          unlocked: v.boolean(),
          sections: v.array(sectionValidator),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!lesson) return null;
    await accessibleLesson(ctx, args.userId, lesson._id);
    const version = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_status_version", (q) =>
        q.eq("lessonId", lesson._id).eq("status", "published"),
      )
      .order("desc")
      .first();
    if (!version) return null;
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", version._id),
      )
      .take(100);
    let unlocked = true;
    const result = [];
    for (const phase of phases) {
      const progress = await ctx.db
        .query("student_progress")
        .withIndex("by_user_and_phase", (q) =>
          q.eq("userId", args.userId).eq("phaseId", phase._id),
        )
        .unique();
      const completed = progress?.status === "completed";
      const sections = unlocked
        ? await ctx.db
            .query("phase_sections")
            .withIndex("by_phase_version_and_sequence", (q) =>
              q.eq("phaseVersionId", phase._id),
            )
            .take(100)
        : [];
      const content = [];
      for (const section of sections) {
        if (
          section.sectionType === "text" &&
          typeof section.content?.markdown === "string"
        )
          content.push({
            kind: "text" as const,
            markdown: section.content.markdown,
          });
        else if (section.sectionType === "activity") {
          const activityId = section.content?.activityId as
            | Id<"activities">
            | undefined;
          const activity = activityId ? await ctx.db.get(activityId) : null;
          const parsed = questionSchema.safeParse(activity?.props);
          if (!activity || !parsed.success)
            throw new ConvexError("not_available");
          if (activity && parsed.success)
            content.push({
              kind: "question" as const,
              id: activity._id,
              prompt: parsed.data.prompt,
              answerType: parsed.data.kind,
              choices: parsed.data.kind === "choice" ? parsed.data.choices : [],
              hint: parsed.data.hint ?? "",
            });
        }
      }
      result.push({
        id: phase._id,
        title: phase.title ?? `Phase ${phase.phaseNumber}`,
        number: phase.phaseNumber,
        completed,
        unlocked,
        sections: content,
      });
      unlocked = unlocked && completed;
    }
    return {
      id: lesson._id,
      title: version.title ?? lesson.title,
      slug: lesson.slug,
      phases: result,
    };
  },
});
