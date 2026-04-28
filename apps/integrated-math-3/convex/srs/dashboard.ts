import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { resolveDailyPracticeQueue } from "../queue/queue";

export function getDayStart(timestamp: number): number {
  const d = new Date(timestamp);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function calculateStreak(
  completedSessionTimestamps: number[],
  now: number
): number {
  if (completedSessionTimestamps.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(completedSessionTimestamps.map((ts) => getDayStart(ts)))
  ).sort((a, b) => b - a);

  const mostRecent = uniqueDays[0];
  const today = getDayStart(now);
  const yesterday = today - 24 * 60 * 60 * 1000;

  if (mostRecent !== today && mostRecent !== yesterday) return 0;

  let streak = 1;
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
  return streak;
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

  let lastPracticedAt: string | null = null;
  let streak = 0;

  if (completedSessions.length > 0) {
    lastPracticedAt = new Date(
      completedSessions[0].completedAt!
    ).toISOString();

    const completedTimestamps = completedSessions.map((s) => s.completedAt!);
    streak = calculateStreak(completedTimestamps, now);
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
