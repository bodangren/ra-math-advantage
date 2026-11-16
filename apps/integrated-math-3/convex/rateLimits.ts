import { internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  checkAndIncrement,
  getStatus,
  isDuplicateInsertError,
  CHATBOT_RATE_LIMIT,
  LOGIN_RATE_LIMIT,
  STALE_ENTRY_THRESHOLD_MS,
} from "@math-platform/rate-limiter";

/**
 * Convex internalQuery wrapper: get rate limit status.
 * @returns {Promise<unknown>} The wrapper result.
 */
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

/**
 * Convex internalMutation wrapper: check and increment rate limit.
 * @returns {Promise<unknown>} The wrapper result.
 * @throws {Error} Thrown if the rate limit record disappears after concurrent insert or if the initial insert fails on a non-duplicate error.
 */
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

/**
 * Convex internalMutation wrapper: cleanup stale rate limits.
 * @returns {Promise<unknown>} The wrapper result.
 * @throws {ConvexError} Thrown when the operation fails.
 */
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

/**
 * Cleans up stale rate limit entries via a cron-triggered mutation.
 * @param {MutationCtx} ctx - The mutation context
 * @returns {Promise<{ deletedCount: number }>} Object with the count of deleted entries
 */
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

/**
 * Cleans up stale rate limit entries via a cron-triggered mutation.
 * @param {MutationCtx} ctx - The mutation context
 * @returns {Promise<{ deletedCount: number }>} Object with the count of deleted entries
 */
export const cleanupStaleRateLimitsCron = internalMutation({
  args: {},
  handler: cleanupStaleRateLimitsCronHandler,
});

/** Limits login attempts for one account name across server instances. */
export const checkLoginAttempt = internalMutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    if (!username || username.length > 255) throw new Error('Invalid username');
    const existing = await ctx.db.query('login_attempts')
      .withIndex('by_username', (q) => q.eq('username', username)).unique();
    const now = Date.now();
    const check = checkAndIncrement(existing, LOGIN_RATE_LIMIT, now);
    if (check.action === 'insert') {
      await ctx.db.insert('login_attempts', { username, requestCount: 1, windowStart: now });
    } else if (check.action === 'reset' && existing) {
      await ctx.db.patch(existing._id, { requestCount: 1, windowStart: now });
    } else if (check.action === 'increment' && existing) {
      await ctx.db.patch(existing._id, { requestCount: existing.requestCount + 1 });
    }
    return check.result;
  },
});

/** Removes expired login attempt windows in bounded batches. */
export const cleanupLoginAttempts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db.query('login_attempts')
      .withIndex('by_window', (q) => q.lt('windowStart', Date.now() - LOGIN_RATE_LIMIT.windowMs)).take(100);
    await Promise.all(expired.map((row) => ctx.db.delete(row._id)));
  },
});
