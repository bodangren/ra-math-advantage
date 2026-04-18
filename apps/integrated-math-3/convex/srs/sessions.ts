import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

function mapDbSessionToContract(session: {
  _id: Id<"srs_sessions">;
  studentId: Id<"profiles">;
  startedAt: number;
  completedAt?: number;
  plannedCards: number;
  completedCards: number;
  config: {
    newCardsPerDay: number;
    maxReviewsPerDay: number;
    prioritizeOverdue: boolean;
  };
}) {
  return {
    sessionId: session._id,
    studentId: session.studentId,
    startedAt: new Date(session.startedAt).toISOString(),
    completedAt: session.completedAt
      ? new Date(session.completedAt).toISOString()
      : null,
    plannedCards: session.plannedCards,
    completedCards: session.completedCards,
    config: session.config,
  };
}

export const sessionConfigValidator = v.object({
  newCardsPerDay: v.number(),
  maxReviewsPerDay: v.number(),
  prioritizeOverdue: v.boolean(),
});

export const createSessionArgsValidator = v.object({
  studentId: v.string(),
  plannedCards: v.number(),
  config: sessionConfigValidator,
});

export type CreateSessionArgs = {
  studentId: string;
  plannedCards: number;
  config: {
    newCardsPerDay: number;
    maxReviewsPerDay: number;
    prioritizeOverdue: boolean;
  };
};

export type CompleteSessionArgs = {
  sessionId: string;
  completedCards: number;
};

export async function createSessionHandler(
  ctx: MutationCtx,
  args: CreateSessionArgs
): Promise<Id<"srs_sessions">> {
  const id = await ctx.db.insert("srs_sessions", {
    studentId: args.studentId as Id<"profiles">,
    startedAt: Date.now(),
    completedAt: undefined,
    plannedCards: args.plannedCards,
    completedCards: 0,
    config: args.config,
  });
  return id;
}

export const createSession = internalMutation({
  args: createSessionArgsValidator,
  handler: createSessionHandler,
});

export async function completeSessionHandler(
  ctx: MutationCtx,
  args: CompleteSessionArgs
): Promise<Id<"srs_sessions">> {
  const session = await ctx.db.get(args.sessionId as Id<"srs_sessions">);
  if (!session) {
    throw new Error(`Session not found: ${args.sessionId}`);
  }
  await ctx.db.patch(session._id, {
    completedAt: Date.now(),
    completedCards: args.completedCards,
  });
  return session._id;
}

export const completeSession = internalMutation({
  args: {
    sessionId: v.string(),
    completedCards: v.number(),
  },
  handler: completeSessionHandler,
});

export async function getActiveSessionHandler(
  ctx: QueryCtx,
  args: { studentId: string }
) {
  const active = await ctx.db
    .query("srs_sessions")
    .withIndex("by_student_and_status", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .first();

  if (!active || active.completedAt !== undefined) return null;
  return mapDbSessionToContract(active);
}

export const getActiveSession = internalQuery({
  args: { studentId: v.string() },
  handler: getActiveSessionHandler,
});

export type GetSessionHistoryArgs = {
  studentId: string;
  limit?: number;
  cursor?: string;
};

export async function getSessionHistoryHandler(
  ctx: QueryCtx,
  args: GetSessionHistoryArgs
) {
  const limit = args.limit ?? 50;
  const startCursor = args.cursor ? parseInt(args.cursor, 10) : 0;

  const sessions = await ctx.db
    .query("srs_sessions")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .order("desc")
    .collect();

  const completed = sessions.filter((s) => s.completedAt !== undefined);
  const page = completed.slice(startCursor, startCursor + limit);
  const nextCursor =
    startCursor + limit < completed.length
      ? String(startCursor + limit)
      : null;

  return {
    sessions: page.map(mapDbSessionToContract),
    nextCursor,
  };
}

export const getSessionHistory = internalQuery({
  args: {
    studentId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: getSessionHistoryHandler,
});