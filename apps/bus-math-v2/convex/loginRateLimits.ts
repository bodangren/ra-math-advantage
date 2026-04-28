import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx } from './_generated/server';

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_REQUESTS_PER_WINDOW = 5;
const LOGIN_STALE_ENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export async function checkAndIncrementLoginRateLimitHandler(
  ctx: MutationCtx,
  args: { ipHash: string }
) {
  const { ipHash } = args;
  const now = Date.now();

  let existing = await ctx.db
    .query('login_rate_limits')
    .withIndex('by_ip', (q) => q.eq('ipHash', ipHash))
    .unique();

  if (!existing) {
    try {
      const windowExpiresAt = now + LOGIN_RATE_LIMIT_WINDOW_MS;
      await ctx.db.insert('login_rate_limits', {
        ipHash,
        requestCount: 1,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        allowed: true,
        remaining: Math.max(0, LOGIN_MAX_REQUESTS_PER_WINDOW - 1),
        windowExpiresAt,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!message.includes('duplicate') && !message.includes('unique')) {
        throw e;
      }
      existing = await ctx.db
        .query('login_rate_limits')
        .withIndex('by_ip', (q) => q.eq('ipHash', ipHash))
        .unique();
      if (!existing) {
        throw new Error('Rate limit record disappeared after concurrent insert');
      }
    }
  }

  if (now - existing.windowStart >= LOGIN_RATE_LIMIT_WINDOW_MS) {
    const windowExpiresAt = now + LOGIN_RATE_LIMIT_WINDOW_MS;
    await ctx.db.patch(existing._id, {
      requestCount: 1,
      windowStart: now,
      updatedAt: now,
    });
    return {
      allowed: true,
      remaining: Math.max(0, LOGIN_MAX_REQUESTS_PER_WINDOW - 1),
      windowExpiresAt,
    };
  }

  if (existing.requestCount >= LOGIN_MAX_REQUESTS_PER_WINDOW) {
    console.error(JSON.stringify({
      event: 'login_rate_limit_exceeded',
      ipHash,
      requestCount: existing.requestCount,
      maxRequests: LOGIN_MAX_REQUESTS_PER_WINDOW,
      windowExpiresAt: existing.windowStart + LOGIN_RATE_LIMIT_WINDOW_MS,
    }));
    return {
      allowed: false,
      remaining: 0,
      windowExpiresAt: existing.windowStart + LOGIN_RATE_LIMIT_WINDOW_MS,
    };
  }

  await ctx.db.patch(existing._id, {
    requestCount: existing.requestCount + 1,
    updatedAt: now,
  });

  return {
    allowed: true,
    remaining: Math.max(0, LOGIN_MAX_REQUESTS_PER_WINDOW - existing.requestCount - 1),
    windowExpiresAt: existing.windowStart + LOGIN_RATE_LIMIT_WINDOW_MS,
  };
}

export const checkAndIncrementLoginRateLimit = internalMutation({
  args: { ipHash: v.string() },
  handler: checkAndIncrementLoginRateLimitHandler,
});

export async function cleanupStaleLoginRateLimitsHandler(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthenticated');
  if (!identity.email) throw new Error('No email in identity');

  const profile = await ctx.db
    .query('profiles')
    .withIndex('by_username', (q) => q.eq('username', identity.email))
    .unique();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: admin only');
  }

  const now = Date.now();
  const staleThreshold = now - LOGIN_STALE_ENTRY_THRESHOLD_MS;

  const staleEntries = await ctx.db
    .query('login_rate_limits')
    .filter((q) => q.lt(q.field('windowStart'), staleThreshold))
    .take(100);

  let deletedCount = 0;
  for (const entry of staleEntries) {
    await ctx.db.delete(entry._id);
    deletedCount++;
  }

  return { deletedCount };
}

export const cleanupStaleLoginRateLimits = internalMutation({
  args: {},
  handler: cleanupStaleLoginRateLimitsHandler,
});