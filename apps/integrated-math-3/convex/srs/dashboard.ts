import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { resolveDailyPracticeQueue } from "../queue/queue";

function getDayStart(timestamp: number): number {
  const d = new Date(timestamp);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export async function getPracticeStatsHandler(
  ctx: QueryCtx,
  args: { studentId: string; asOfDate?: string }
) {
  const now = args.asOfDate ? new Date(args.asOfDate).getTime() : Date.now();

  const queue = await resolveDailyPracticeQueue(ctx, {
    studentId: args.studentId,
    asOfDate: args.asOfDate,
  });
  const dueCount = queue.length;

  const sessions = await ctx.db
    .query("srs_sessions")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .order("desc")
    .collect();

  const completedSessions = sessions.filter(
    (s) => s.completedAt !== undefined
  );

  let streak = 0;
  let lastPracticedAt: string | null = null;

  if (completedSessions.length > 0) {
    lastPracticedAt = new Date(
      completedSessions[0].completedAt!
    ).toISOString();

    const uniqueDays = Array.from(
      new Set(completedSessions.map((s) => getDayStart(s.completedAt!)))
    ).sort((a, b) => b - a);

    const mostRecent = uniqueDays[0];
    const today = getDayStart(now);
    const yesterday = today - 24 * 60 * 60 * 1000;

    if (mostRecent === today || mostRecent === yesterday) {
      streak = 1;
      let checkDay = mostRecent;
      for (let i = 1; i < uniqueDays.length; i++) {
        const expected = checkDay - 24 * 60 * 60 * 1000;
        if (uniqueDays[i] === expected) {
          streak++;
          checkDay = uniqueDays[i];
        } else if (uniqueDays[i] < expected) {
          break;
        }
      }
    }
  }

  return {
    dueCount,
    streak,
    lastPracticedAt,
  };
}

export const getPracticeStats = internalQuery({
  args: {
    studentId: v.string(),
    asOfDate: v.optional(v.string()),
  },
  handler: getPracticeStatsHandler,
});
