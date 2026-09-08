import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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
