import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  checkAndIncrement,
  getStatus,
  isDuplicateInsertError,
  formatRetryAfter,
  API_RATE_LIMIT_CONFIG,
} from "@math-platform/rate-limiter";
import type { ApiEndpoint, RateLimitConfig } from "@math-platform/rate-limiter";

export const RATE_LIMIT_CONFIG = API_RATE_LIMIT_CONFIG;
export type { ApiEndpoint };

/**
 * Checks and increments the API rate limit for a user and endpoint combination,
 * resetting the window if expired. Logs violations when the limit is exceeded.
 *
 * @param ctx - Mutation context with database access.
 * @param args - Object containing the user ID and API endpoint.
 * @returns The rate limit result with allowed status, remaining count, and
 *   window expiration.
 */
export async function checkAndIncrementApiRateLimitHandler(
  ctx: MutationCtx,
  args: { userId: Id<"profiles">; endpoint: ApiEndpoint }
) {
  const config = API_RATE_LIMIT_CONFIG[args.endpoint] as RateLimitConfig | undefined;
  if (!config) {
    return { allowed: false, remaining: 0, windowExpiresAt: 0 };
  }

  const now = Date.now();

  let existing = await ctx.db
    .query("api_rate_limits")
    .withIndex("by_user_and_endpoint", (q) =>
      q.eq("userId", args.userId).eq("endpoint", args.endpoint)
    )
    .unique();

  const check = checkAndIncrement(existing, config, now);

  if (check.action === 'insert') {
    try {
      await ctx.db.insert("api_rate_limits", {
        userId: args.userId,
        endpoint: args.endpoint,
        requestCount: 1,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      });
      return check.result;
    } catch (e) {
      if (!isDuplicateInsertError(e)) throw e;
      existing = await ctx.db
        .query("api_rate_limits")
        .withIndex("by_user_and_endpoint", (q) =>
          q.eq("userId", args.userId).eq("endpoint", args.endpoint)
        )
        .unique();
      if (!existing) throw new Error("Rate limit record disappeared after concurrent insert");
      const retry = checkAndIncrement(existing, config, now);
      if (retry.action === 'reset') {
        await ctx.db.patch(existing._id, { requestCount: 1, windowStart: now, updatedAt: now });
      } else if (retry.action === 'increment') {
        await ctx.db.patch(existing._id, { requestCount: existing.requestCount + 1, updatedAt: now });
      } else if (retry.action === 'deny') {
        await logRateLimitViolation(args.userId, args.endpoint, existing.requestCount, retry.result.windowExpiresAt);
      }
      return retry.result;
    }
  }

  if (check.action === 'reset') {
    await ctx.db.patch(existing!._id, { requestCount: 1, windowStart: now, updatedAt: now });
  } else if (check.action === 'deny') {
    await logRateLimitViolation(args.userId, args.endpoint, existing!.requestCount, check.result.windowExpiresAt);
  } else if (check.action === 'increment') {
    await ctx.db.patch(existing!._id, { requestCount: existing!.requestCount + 1, updatedAt: now });
  }

  return check.result;
}

export const checkAndIncrementApiRateLimit = internalMutation({
  args: {
    userId: v.id("profiles"),
    endpoint: v.union(
      v.literal("phases/complete"),
      v.literal("assessment"),
      v.literal("activities/complete"),
      v.literal("teacher/error-summary"),
      v.literal("teacher/ai-error-summary"),
    ),
  },
  handler: async (ctx, args) => {
    return checkAndIncrementApiRateLimitHandler(ctx, {
      userId: args.userId,
      endpoint: args.endpoint,
    });
  },
});

export const getApiRateLimitStatus = internalQuery({
  args: {
    userId: v.id("profiles"),
    endpoint: v.union(
      v.literal("phases/complete"),
      v.literal("assessment"),
      v.literal("activities/complete"),
      v.literal("teacher/error-summary"),
      v.literal("teacher/ai-error-summary"),
    ),
  },
  handler: async (ctx, args) => {
    const config = API_RATE_LIMIT_CONFIG[args.endpoint] as RateLimitConfig | undefined;
    if (!config) {
      return { remaining: 0, windowExpiresAt: 0, isLimited: true };
    }

    const rateLimit = await ctx.db
      .query("api_rate_limits")
      .withIndex("by_user_and_endpoint", (q) =>
        q.eq("userId", args.userId).eq("endpoint", args.endpoint)
      )
      .unique();

    return getStatus(rateLimit, config);
  },
});

/**
 * Logs a rate limit violation event to stderr with structured JSON metadata
 * including the user, endpoint, request count, and retry-after timing.
 *
 * @param userId - The profile ID of the user who exceeded the limit.
 * @param endpoint - The API endpoint that was rate-limited.
 * @param requestCount - The number of requests made in the current window.
 * @param windowExpiresAt - Timestamp when the rate limit window expires.
 */
export async function logRateLimitViolation(
  userId: Id<"profiles">,
  endpoint: ApiEndpoint,
  requestCount: number,
  windowExpiresAt: number
): Promise<void> {
  const config = API_RATE_LIMIT_CONFIG[endpoint] as RateLimitConfig | undefined;
  const now = Date.now();
  console.error(
    JSON.stringify({
      type: "RATE_LIMIT_VIOLATION",
      timestamp: new Date(now).toISOString(),
      userId,
      endpoint,
      requestCount,
      limit: config?.maxRequests,
      windowMs: config?.windowMs,
      windowExpiresAt: new Date(windowExpiresAt).toISOString(),
      retryAfterSec: formatRetryAfter(windowExpiresAt),
    })
  );
}

/**
 * Formats a 429 Too Many Requests response with a JSON error body and
 * Retry-After header based on the window expiration time.
 *
 * @param windowExpiresAt - Timestamp when the rate limit window expires.
 * @returns A Response object with status 429 and retry-after header.
 */
export function formatRateLimitError(windowExpiresAt: number): Response {
  const retryAfter = formatRetryAfter(windowExpiresAt);
  return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  });
}
