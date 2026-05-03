import { internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  checkAndIncrement,
  getStatus,
  isDuplicateInsertError,
  CHATBOT_RATE_LIMIT,
  STALE_ENTRY_THRESHOLD_MS,
} from "@math-platform/rate-limiter";

export const getRateLimitStatus = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const rateLimit = await ctx.db
      .query("chatbot_rate_limits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return getStatus(rateLimit, CHATBOT_RATE_LIMIT);
  },
});

export const checkAndIncrementRateLimit = internalMutation({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const now = Date.now();

    let existing = await ctx.db
      .query("chatbot_rate_limits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    const check = checkAndIncrement(existing, CHATBOT_RATE_LIMIT, now);

    if (check.action === 'insert') {
      try {
        await ctx.db.insert("chatbot_rate_limits", {
          userId: args.userId,
          requestCount: 1,
          windowStart: now,
          createdAt: now,
          updatedAt: now,
        });
        return check.result;
      } catch (e) {
        if (!isDuplicateInsertError(e)) throw e;
        existing = await ctx.db
          .query("chatbot_rate_limits")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .unique();
        if (!existing) throw new Error("Rate limit record disappeared after concurrent insert");
        // Fall through to increment
        const retry = checkAndIncrement(existing, CHATBOT_RATE_LIMIT, now);
        if (retry.action === 'reset') {
          await ctx.db.patch(existing._id, { requestCount: 1, windowStart: now, updatedAt: now });
        } else if (retry.action === 'increment') {
          await ctx.db.patch(existing._id, { requestCount: existing.requestCount + 1, updatedAt: now });
        }
        return retry.result;
      }
    }

    if (check.action === 'reset') {
      await ctx.db.patch(existing!._id, { requestCount: 1, windowStart: now, updatedAt: now });
    } else if (check.action === 'increment') {
      await ctx.db.patch(existing!._id, { requestCount: existing!.requestCount + 1, updatedAt: now });
    }

    return check.result;
  },
});

export const cleanupStaleRateLimits = internalMutation({
  args: { adminProfileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.adminProfileId);
    if (!profile || profile.role !== "admin") {
      throw new ConvexError("Unauthorized: admin only");
    }

    const now = Date.now();
    const staleThreshold = now - STALE_ENTRY_THRESHOLD_MS;

    const staleEntries = await ctx.db
      .query("chatbot_rate_limits")
      .filter((q) => q.lt(q.field("windowStart"), staleThreshold))
      .take(100);

    let deletedCount = 0;
    for (const entry of staleEntries) {
      await ctx.db.delete(entry._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});

export async function cleanupStaleRateLimitsCronHandler(ctx: MutationCtx) {
  const now = Date.now();
  const staleThreshold = now - STALE_ENTRY_THRESHOLD_MS;

  const staleEntries = await ctx.db
    .query("chatbot_rate_limits")
    .filter((q) => q.lt(q.field("windowStart"), staleThreshold))
    .take(100);

  for (const entry of staleEntries) {
    await ctx.db.delete(entry._id);
  }

  return { deletedCount: staleEntries.length };
}

export const cleanupStaleRateLimitsCron = internalMutation({
  args: {},
  handler: cleanupStaleRateLimitsCronHandler,
});
