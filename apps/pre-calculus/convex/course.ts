import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  getApprovedTopic11WorkedSourceHandler,
  hasCurrentTopic11Source,
  isStoredTopic11Acknowledgement,
  isTopic11TeacherConfirmationForSubmission,
} from "./activities";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";

const topic11TeacherCandidateValidator = v.object({
  learnerId: v.id("profiles"),
  learnerName: v.string(),
  submissionId: v.id("activity_submissions"),
  acknowledgedAt: v.number(),
  lessonLabel: v.string(),
  classChoices: v.array(
    v.object({ classId: v.id("classes"), className: v.string() }),
  ),
});

type Topic11Publication = NonNullable<
  Parameters<typeof getApprovedTopic11WorkedSourceHandler>[1]
>;

const topic11Publication: Topic11Publication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};

function hasActiveCredential(
  profile: Record<string, unknown>,
  credential: Record<string, unknown> | null,
): boolean {
  return Boolean(credential?.isActive)
    && credential?.profileId === profile._id
    && credential?.username === profile.username
    && credential?.role === profile.role
    && credential?.organizationId === profile.organizationId;
}

/** Gets canonical Topic 1.1 acknowledgements that this teacher can confirm. */
export async function getTopic11TeacherCandidatesHandler(
  ctx: QueryCtx,
  args: { teacherId: Id<"profiles"> },
  publication: Topic11Publication = topic11Publication,
) {
  const teacher = await ctx.db.get("profiles", args.teacherId);
  const teacherCredential = teacher
    ? await ctx.db
        .query("auth_credentials")
        .withIndex("by_username", (query) =>
          query.eq("username", teacher.username),
        )
        .unique()
    : null;
  if (
    !teacher
    || teacher.role !== "teacher"
    || !hasActiveCredential(teacher, teacherCredential)
  ) {
    throw new Error("Forbidden");
  }

  const source = await getApprovedTopic11WorkedSourceHandler(ctx, publication);
  if (!source) return [];
  const [activity, lessons, classes] = await Promise.all([
    ctx.db.get("activities", source.activityId),
    ctx.db
      .query("lessons")
      .withIndex("by_unit_and_order", (query) =>
        query.eq("unitNumber", 1).eq("orderIndex", 1),
      )
      .collect(),
    ctx.db
      .query("classes")
      .withIndex("by_teacher", (query) =>
        query.eq("teacherId", args.teacherId),
      )
      .collect(),
  ]);
  if (!activity || lessons.length !== 1) return [];
  const lesson = lessons[0]!;
  const publishedVersions = (
    await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (query) => query.eq("lessonId", lesson._id))
      .collect()
  )
    .filter((version) => version.status === "published")
    .sort((left, right) => right.version - left.version);
  if (
    publishedVersions.length === 0
    || publishedVersions[1]?.version === publishedVersions[0]!.version
  ) {
    return [];
  }
  const lessonLabel = publishedVersions[0]!.title ?? lesson.title;
  const now = Date.now();
  if (!Number.isFinite(now)) return [];

  const classContexts = await Promise.all(
    classes
      .filter((classroom) => !classroom.archived)
      .map(async (classroom) => ({
        classroom,
        enrollments: await ctx.db
          .query("class_enrollments")
          .withIndex("by_class", (query) =>
            query.eq("classId", classroom._id),
          )
          .collect(),
        assignments: await ctx.db
          .query("class_lessons")
          .withIndex("by_class_and_lesson", (query) =>
            query.eq("classId", classroom._id).eq("lessonId", lesson._id),
          )
          .collect(),
      })),
  );
  const learnerIds = [
    ...new Set(
      classContexts.flatMap(({ enrollments }) =>
        enrollments
          .filter((enrollment) => enrollment.status === "active")
          .map((enrollment) => enrollment.studentId),
      ),
    ),
  ];
  const candidates = [];
  for (const learnerId of learnerIds) {
    const learner = await ctx.db.get("profiles", learnerId);
    const credential = learner
      ? await ctx.db
          .query("auth_credentials")
          .withIndex("by_username", (query) =>
            query.eq("username", learner.username),
          )
          .unique()
      : null;
    if (
      !learner
      || learner.role !== "student"
      || learner.organizationId !== teacher.organizationId
      || !hasActiveCredential(learner, credential)
    ) {
      continue;
    }
    const submissions = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity", (query) =>
        query.eq("userId", learnerId).eq("activityId", source.activityId),
      )
      .collect();
    for (const submission of submissions) {
      const acknowledgedAt = Number(submission.submittedAt);
      const reviewedAt = activity.approval?.reviewedAt;
      if (
        !isStoredTopic11Acknowledgement(
          submission,
          learnerId,
          source.activityId,
          now,
        )
        || !Number.isFinite(acknowledgedAt)
        || !Number.isFinite(activity.createdAt)
        || activity.createdAt > acknowledgedAt
        || !Number.isFinite(reviewedAt)
        || Number(reviewedAt) > acknowledgedAt
        || !(await hasCurrentTopic11Source(
          ctx,
          lesson._id,
          source.activityId,
          acknowledgedAt,
        ))
      ) {
        continue;
      }
      const confirmation = await ctx.db
        .query("learning_evidence")
        .withIndex("by_learner_and_idempotency_key", (query) =>
          query
            .eq("learnerId", learnerId)
            .eq(
              "idempotencyKey",
              `precalc:teacher-led:submission:${String(submission._id)}`,
            ),
        )
        .unique();
      if (
        confirmation
        && isTopic11TeacherConfirmationForSubmission(confirmation, submission)
      ) {
        continue;
      }
      const classChoices = classContexts.flatMap(
        ({ classroom, enrollments, assignments }) => {
          const enrollment = enrollments.filter(
            (row) => row.studentId === learnerId,
          );
          const enrolledAt = enrollment[0]?.enrolledAt;
          const assignedAt = assignments[0]?.assignedAt;
          return enrollment.length === 1
            && enrollment[0]!.status === "active"
            && Number.isFinite(enrolledAt)
            && Number(enrolledAt) <= acknowledgedAt
            && assignments.length === 1
            && Number.isFinite(assignedAt)
            && Number(assignedAt) <= acknowledgedAt
            ? [{ classId: classroom._id, className: classroom.name }]
            : [];
        },
      );
      if (classChoices.length > 0) {
        candidates.push({
          learnerId,
          learnerName: learner.displayName ?? learner.username,
          submissionId: submission._id,
          acknowledgedAt,
          lessonLabel,
          classChoices,
        });
      }
    }
  }
  return candidates;
}

export const getTopic11TeacherCandidates = internalQuery({
  args: { teacherId: v.id("profiles") },
  returns: v.array(topic11TeacherCandidateValidator),
  handler: (ctx, args) => getTopic11TeacherCandidatesHandler(ctx, args),
});

const responseValidator = v.object({
  _id: v.id("lesson_responses"),
  response: v.string(),
  score: v.optional(v.number()),
  maxScore: v.optional(v.number()),
  feedback: v.optional(v.string()),
});
const sectionValidator = v.object({
  _id: v.id("phase_sections"),
  sectionType: v.string(),
  content: v.object({
    markdown: v.optional(v.string()),
    activityId: v.optional(v.string()),
    componentKey: v.optional(v.string()),
  }),
});
const phaseValidator = v.object({
  _id: v.id("phase_versions"),
  title: v.string(),
  sections: v.array(sectionValidator),
  responses: v.array(responseValidator),
});

function publicSectionContent(value: unknown): {
  markdown?: string;
  activityId?: string;
  componentKey?: string;
} {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return {};
  const content = value as Record<string, unknown>;
  return {
    ...(typeof content.markdown === "string"
      ? { markdown: content.markdown }
      : {}),
    ...(typeof content.activityId === "string"
      ? { activityId: content.activityId }
      : {}),
    ...(typeof content.componentKey === "string"
      ? { componentKey: content.componentKey }
      : {}),
  };
}

async function requireStudent(ctx: QueryCtx | MutationCtx, id: Id<"profiles">) {
  const profile = await ctx.db.get("profiles", id);
  const credential = profile
    ? await ctx.db
        .query("auth_credentials")
        .withIndex("by_username", (q) => q.eq("username", profile.username))
        .unique()
    : null;
  if (
    !profile ||
    profile.role !== "student" ||
    !credential?.isActive ||
    credential.profileId !== profile._id ||
    credential.username !== profile.username ||
    credential.role !== profile.role ||
    credential.organizationId !== profile.organizationId
  )
    throw new Error("Forbidden");
}
async function publishedVersion(
  ctx: QueryCtx | MutationCtx,
  lessonId: Id<"lessons">,
) {
  const versions = await ctx.db
    .query("lesson_versions")
    .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId))
    .order("desc")
    .collect();
  return versions.find((version) => version.status === "published") ?? null;
}
export const getLessons = internalQuery({
  args: { learnerId: v.id("profiles") },
  returns: v.array(
    v.object({ id: v.id("lessons"), topic: v.string(), title: v.string() }),
  ),
  handler: async (ctx, { learnerId }) => {
    await requireStudent(ctx, learnerId);
    const lessons = (
      await Promise.all(
        [1, 2, 3, 4].map((unit) =>
          ctx.db
            .query("lessons")
            .withIndex("by_unit_and_order", (q) => q.eq("unitNumber", unit))
            .collect(),
        ),
      )
    ).flat();
    const result = [];
    for (const lesson of lessons) {
      const version = await publishedVersion(ctx, lesson._id);
      if (version)
        result.push({
          id: lesson._id,
          topic: `${lesson.unitNumber}.${lesson.orderIndex}`,
          title: version.title ?? lesson.title,
        });
    }
    return result;
  },
});
export const getLesson = internalQuery({
  args: { learnerId: v.id("profiles"), unit: v.number(), topic: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      title: v.string(),
      topic: v.string(),
      phases: v.array(phaseValidator),
    }),
  ),
  handler: async (ctx, { learnerId, unit, topic }) => {
    await requireStudent(ctx, learnerId);
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_unit_and_order", (q) =>
        q.eq("unitNumber", unit).eq("orderIndex", topic),
      )
      .unique();
    if (!lesson) return null;
    const version = await publishedVersion(ctx, lesson._id);
    if (!version) return null;
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", version._id),
      )
      .collect();
    return {
      title: version.title ?? lesson.title,
      topic: `${unit}.${topic}`,
      phases: await Promise.all(
        phases.map(async (phase) => ({
          _id: phase._id,
          title: phase.title ?? "Lesson phase",
          sections: (
            await ctx.db
              .query("phase_sections")
              .withIndex("by_phase_version_and_sequence", (q) =>
                q.eq("phaseVersionId", phase._id),
              )
              .collect()
          ).map((section) => ({
            _id: section._id,
            sectionType: section.sectionType,
            content: publicSectionContent(section.content),
          })),
          responses: (
            await ctx.db
              .query("lesson_responses")
              .withIndex("by_learner_and_phase", (q) =>
                q.eq("learnerId", learnerId).eq("phaseId", phase._id),
              )
              .order("desc")
              .take(10)
          ).map((row) => ({
            _id: row._id,
            response: row.response,
            score: row.score,
            maxScore: row.maxScore,
            feedback: row.feedback,
          })),
        })),
      ),
    };
  },
});
export const saveResponse = internalMutation({
  args: {
    learnerId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
    response: v.string(),
  },
  returns: v.id("lesson_responses"),
  handler: async (ctx, { learnerId, phaseId, response }) => {
    await requireStudent(ctx, learnerId);
    if (!response.trim() || response.length > 10000)
      throw new Error("Write 1 to 10000 characters");
    const phase = await ctx.db.get("phase_versions", phaseId);
    if (!phase) throw new Error("Phase not found");
    const version = await ctx.db.get("lesson_versions", phase.lessonVersionId);
    if (version?.status !== "published")
      throw new Error("Lesson is not published");
    const now = Date.now();
    return ctx.db.insert("lesson_responses", {
      learnerId,
      phaseId,
      response: response.trim(),
      createdAt: now,
    });
  },
});
