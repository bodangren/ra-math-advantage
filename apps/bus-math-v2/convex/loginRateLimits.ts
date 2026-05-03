import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx } from './_generated/server';
import {
  checkAndIncrement,
  isDuplicateInsertError,
  LOGIN_RATE_LIMIT,
  STALE_ENTRY_THRESHOLD_MS,
} from '@math-platform/rate-limiter';

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

  const check = checkAndIncrement(existing, LOGIN_RATE_LIMIT, now);

  if (check.action === 'insert') {
    try {
      await ctx.db.insert('login_rate_limits', {
        ipHash,
        requestCount: 1,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      });
      return check.result;
    } catch (e) {
      if (!isDuplicateInsertError(e)) throw e;
      existing = await ctx.db
        .query('login_rate_limits')
        .withIndex('by_ip', (q) => q.eq('ipHash', ipHash))
        .unique();
      if (!existing) throw new Error('Rate limit record disappeared after concurrent insert');
      const retry = checkAndIncrement(existing, LOGIN_RATE_LIMIT, now);
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
  } else if (check.action === 'deny') {
    console.error(JSON.stringify({
      event: 'login_rate_limit_exceeded',
      ipHash,
      requestCount: existing!.requestCount,
      maxRequests: LOGIN_RATE_LIMIT.maxRequests,
      windowExpiresAt: check.result.windowExpiresAt,
    }));
  } else if (check.action === 'increment') {
    await ctx.db.patch(existing!._id, { requestCount: existing!.requestCount + 1, updatedAt: now });
  }

  return check.result;
}

export const checkAndIncrementLoginRateLimit = internalMutation({
  args: { ipHash: v.string() },
  handler: checkAndIncrementLoginRateLimitHandler,
});

export async function cleanupStaleLoginRateLimitsHandler(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthenticated');
  if (!identity.email) throw new Error('No email in identity');
  const email = identity.email;

  const profile = await ctx.db
    .query('profiles')
    .withIndex('by_username', (q) => q.eq('username', email))
    .unique();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: admin only');
  }

  const now = Date.now();
  const staleThreshold = now - STALE_ENTRY_THRESHOLD_MS;

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
