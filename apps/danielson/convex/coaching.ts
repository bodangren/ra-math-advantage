import { paginationResultValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { authorizeTeacher } from "./reporting";
import { coachingFields } from "./coachingModel";
import { buildDanielsonGraph } from "../lib/proficiency/graph";

const denied = v.object({ kind: v.literal("denied"), reason: v.string() });
const writeResult = v.union(
  denied,
  v.object({ kind: v.literal("invalid") }),
  v.object({ kind: v.literal("conflict") }),
  v.object({ kind: v.literal("saved"), cycleId: v.id("coaching_cycles") }),
);
const skills = new Set(
  buildDanielsonGraph()
    .graph.nodes.filter((n) => n.kind === "skill")
    .map((n) => n.id),
);
const validText = (text: string) => text.trim().length > 0 && text.length <= 4000;
const validDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  Number.isFinite(Date.parse(date)) &&
  new Date(date).toISOString().slice(0, 10) === date;

async function evidence(
  ctx: Pick<QueryCtx, "db">,
  id: Id<"observation_records">,
  teacherProfileId: Id<"teacher_profiles">,
  organizationId: Id<"organizations">,
  skillId: string,
) {
  const row = await ctx.db.get(id);
  if (
    !row ||
    row.status !== "submitted" ||
    row.teacherProfileId !== teacherProfileId ||
    row.organizationId !== organizationId ||
    !Number.isFinite(Date.parse(row.observedAt)) ||
    Date.parse(row.observedAt) > Date.now() ||
    !row.items.some((item) => item.skillId === skillId)
  )
    return null;
  return row;
}

export const createCycle = internalMutation({
  args: {
    actorAccountId: v.id("accounts"),
    teacherProfileId: v.id("teacher_profiles"),
    skillId: v.string(),
    action: v.string(),
    support: v.string(),
    followUpDate: v.string(),
    baselineObservationId: v.id("observation_records"),
  },
  returns: writeResult,
  handler: async (ctx, args) => {
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      args.teacherProfileId,
      "observation_comment:write",
    );
    if (access.kind === "denied") return access;
    if (!access.teacher.isActive) return { kind: "denied" as const, reason: "target_inactive" };
    const baseline = await evidence(
      ctx,
      args.baselineObservationId,
      args.teacherProfileId,
      access.teacher.organizationId,
      args.skillId,
    );
    if (
      !skills.has(args.skillId) ||
      !validText(args.action) ||
      !validText(args.support) ||
      !validDate(args.followUpDate) ||
      !baseline ||
      Date.parse(args.followUpDate) < Date.parse(baseline.observedAt.slice(0, 10))
    )
      return { kind: "invalid" as const };
    const cycleId = await ctx.db.insert("coaching_cycles", {
      organizationId: access.teacher.organizationId,
      teacherProfileId: args.teacherProfileId,
      ownerAccountId: args.actorAccountId,
      skillId: args.skillId,
      action: args.action.trim(),
      support: args.support.trim(),
      followUpDate: args.followUpDate,
      baselineObservationId: args.baselineObservationId,
      followUpObservationId: null,
      reflection: "",
      conclusion: "",
      state: "active",
      revision: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { kind: "saved" as const, cycleId };
  },
});

export const updateCycle = internalMutation({
  args: {
    actorAccountId: v.id("accounts"),
    cycleId: v.id("coaching_cycles"),
    expectedRevision: v.number(),
    kind: v.union(v.literal("reflect"), v.literal("complete"), v.literal("revise")),
    reflection: v.optional(v.string()),
    conclusion: v.optional(v.string()),
    followUpObservationId: v.optional(v.id("observation_records")),
    action: v.optional(v.string()),
    support: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
  },
  returns: writeResult,
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.cycleId);
    if (!cycle) return { kind: "denied" as const, reason: "not_found" };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      cycle.teacherProfileId,
      args.kind === "reflect" ? "teacher_response:write" : "observation_comment:write",
    );
    if (access.kind === "denied") return access;
    if (!access.teacher.isActive || cycle.organizationId !== access.teacher.organizationId)
      return { kind: "denied" as const, reason: "target_inactive" };
    if (args.kind === "reflect" && access.teacher.accountId !== args.actorAccountId)
      return { kind: "denied" as const, reason: "not_subject" };
    if (cycle.revision !== args.expectedRevision || cycle.state !== "active")
      return { kind: "conflict" as const };
    const update = { revision: cycle.revision + 1, updatedAt: Date.now() };
    if (args.kind === "reflect") {
      if (!validText(args.reflection ?? "")) return { kind: "invalid" as const };
      await ctx.db.patch(cycle._id, { ...update, reflection: args.reflection!.trim() });
    } else if (args.kind === "revise") {
      if (
        !validText(args.action ?? "") ||
        !validText(args.support ?? "") ||
        !validDate(args.followUpDate ?? "")
      )
        return { kind: "invalid" as const };
      const baseline = await ctx.db.get(cycle.baselineObservationId);
      if (
        !baseline ||
        Date.parse(args.followUpDate!) < Date.parse(baseline.observedAt.slice(0, 10))
      )
        return { kind: "invalid" as const };
      await ctx.db.patch(cycle._id, {
        ...update,
        action: args.action!.trim(),
        support: args.support!.trim(),
        followUpDate: args.followUpDate!,
      });
    } else {
      if (!args.followUpObservationId || !validText(args.conclusion ?? ""))
        return { kind: "invalid" as const };
      const next = await evidence(
        ctx,
        args.followUpObservationId,
        cycle.teacherProfileId,
        cycle.organizationId,
        cycle.skillId,
      );
      const baseline = await ctx.db.get(cycle.baselineObservationId);
      if (
        !next ||
        !baseline ||
        next._id === baseline._id ||
        Date.parse(next.observedAt) <= cycle.createdAt ||
        Date.parse(next.observedAt) <= Date.parse(baseline.observedAt)
      )
        return { kind: "invalid" as const };
      await ctx.db.patch(cycle._id, {
        ...update,
        state: "complete",
        followUpObservationId: next._id,
        conclusion: args.conclusion!.trim(),
      });
    }
    return { kind: "saved" as const, cycleId: cycle._id };
  },
});

export const readCycles = internalQuery({
  args: {
    actorAccountId: v.id("accounts"),
    teacherProfileId: v.id("teacher_profiles"),
    cursor: v.union(v.string(), v.null()),
  },
  returns: v.union(
    denied,
    v.object({
      kind: v.literal("allowed"),
      isSelf: v.boolean(),
      teacherName: v.string(),
      page: paginationResultValidator(
        v.object({ ...coachingFields, _id: v.id("coaching_cycles"), _creationTime: v.number() }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.teacherProfileId);
    if (!teacher?.isActive) return { kind: "denied" as const, reason: "target_inactive" };
    const isSelf = teacher.accountId === args.actorAccountId;
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      teacher._id,
      isSelf ? "published_record:read" : "teacher_report:read",
    );
    if (access.kind === "denied") return access;
    const page = await ctx.db
      .query("coaching_cycles")
      .withIndex("by_organizationId_and_teacherProfileId", (q) =>
        q.eq("organizationId", teacher.organizationId).eq("teacherProfileId", teacher._id),
      )
      .order("desc")
      .paginate({ cursor: args.cursor, numItems: 20 });
    return { kind: "allowed" as const, isSelf, teacherName: access.account.displayName, page };
  },
});
