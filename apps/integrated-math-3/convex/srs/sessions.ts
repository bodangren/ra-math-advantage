import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Maps a database SRS session to the public contract format.
 * @param {{ _id: Id<"srs_sessions">; studentId: Id<"profiles">; startedAt: number; completedAt?: number; plannedCards: number; completedCards: number; config: { newCardsPerDay: number; maxReviewsPerDay: number; prioritizeOverdue: boolean } }} session - The raw database session object
 * @returns {object} The session in contract format with ISO date strings
 */
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

/**
 * Creates a new SRS study session for a student.
 * @param {MutationCtx} ctx - The mutation context
 * @param {CreateSessionArgs} args - The session creation arguments
 * @returns {Promise<Id<"srs_sessions">>} The ID of the newly created session
 */
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

/**
 * Marks an SRS study session as complete.
 * @param {MutationCtx} ctx - The mutation context
 * @param {CompleteSessionArgs} args - The session ID and completed card count
 * @returns {Promise<Id<"srs_sessions">>} The ID of the completed session
 * @throws Error if the session is not found
 */
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

/**
 * Retrieves the active (incomplete) SRS session for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: string }} args - The student ID
 * @returns {Promise<object | null>} The active session in contract format, or null if none exists
 */
export async function getActiveSessionHandler(
  ctx: QueryCtx,
  args: { studentId: string }
) {
  const active = await ctx.db
    .query("srs_sessions")
    .withIndex("by_student_and_status", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    // Explicit filter avoids relying on undefined sort order in the index.
    // Sessions per student are bounded (~1/day), so filter cost is negligible.
    .filter((q) => q.eq(q.field("completedAt"), undefined))
    .first();

  if (!active) return null;
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

/**
 * Retrieves paginated session history for a student.
 * @param {QueryCtx} ctx - The query context
 * @param {GetSessionHistoryArgs} args - The student ID with optional limit and cursor
 * @returns {Promise<{ sessions: Array<object>; nextCursor: string | null }>} Paginated sessions in contract format
 */
export async function getSessionHistoryHandler(
  ctx: QueryCtx,
  args: GetSessionHistoryArgs
) {
  const limit = args.limit ?? 50;

  const paginated = await ctx.db
    .query("srs_sessions")
    .withIndex("by_student_and_status", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .order("desc")
    .filter((q) => q.neq(q.field("completedAt"), undefined))
    .paginate({ cursor: args.cursor ?? null, numItems: limit });

  return {
    sessions: paginated.page.map(mapDbSessionToContract),
    nextCursor: paginated.isDone ? null : paginated.continueCursor,
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