import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const RATE_LIMIT_CONFIG = {
  "phases/complete": { windowMs: 60000, maxRequests: 60 },
  assessment: { windowMs: 60000, maxRequests: 60 },
  "activities/complete": { windowMs: 60000, maxRequests: 60 },
  "teacher/error-summary": { windowMs: 60000, maxRequests: 120 },
  "teacher/ai-error-summary": { windowMs: 60000, maxRequests: 30 },
} as const;

export type ApiEndpoint = keyof typeof RATE_LIMIT_CONFIG;

export async function checkAndIncrementApiRateLimitHandler(
  ctx: MutationCtx,
  args: { userId: Id<"profiles">; endpoint: ApiEndpoint }
) {
  const config = RATE_LIMIT_CONFIG[args.endpoint];
  if (!config) {
    return { allowed: false, remaining: 0, windowExpiresAt: 0 };
  }

  const { windowMs, maxRequests } = config;
  const now = Date.now();

  let existing = await ctx.db
    .query("api_rate_limits")
    .withIndex("by_user_and_endpoint", (q) =>
      q.eq("userId", args.userId).eq("endpoint", args.endpoint)
    )
    .unique();

  if (!existing) {
    try {
      await ctx.db.insert("api_rate_limits", {
        userId: args.userId,
        endpoint: args.endpoint,
        requestCount: 1,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - 1),
        windowExpiresAt: now + windowMs,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!message.includes("duplicate") && !message.includes("unique")) {
        throw e;
      }
      existing = await ctx.db
        .query("api_rate_limits")
        .withIndex("by_user_and_endpoint", (q) =>
          q.eq("userId", args.userId).eq("endpoint", args.endpoint)
        )
        .unique();
      if (!existing) {
        throw new Error("Rate limit record disappeared after concurrent insert");
      }
    }
  }

  if (now - existing.windowStart >= windowMs) {
    await ctx.db.patch(existing._id, {
      requestCount: 1,
      windowStart: now,
      updatedAt: now,
    });
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      windowExpiresAt: now + windowMs,
    };
  }

  if (existing.requestCount >= maxRequests) {
    await logRateLimitViolation(
      args.userId,
      args.endpoint,
      existing.requestCount,
      existing.windowStart + windowMs
    );
    return {
      allowed: false,
      remaining: 0,
      windowExpiresAt: existing.windowStart + windowMs,
    };
  }

  await ctx.db.patch(existing._id, {
    requestCount: existing.requestCount + 1,
    updatedAt: now,
  });

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.requestCount - 1),
    windowExpiresAt: existing.windowStart + windowMs,
  };
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
    const config = RATE_LIMIT_CONFIG[args.endpoint];
    if (!config) {
      return { remaining: 0, windowExpiresAt: 0, isLimited: true };
    }

    const { windowMs, maxRequests } = config;
    const now = Date.now();

    const rateLimit = await ctx.db
      .query("api_rate_limits")
      .withIndex("by_user_and_endpoint", (q) =>
        q.eq("userId", args.userId).eq("endpoint", args.endpoint)
      )
      .unique();

    if (!rateLimit) {
      return {
        remaining: maxRequests,
        windowExpiresAt: now + windowMs,
        isLimited: false,
      };
    }

    if (now - rateLimit.windowStart >= windowMs) {
      return {
        remaining: maxRequests,
        windowExpiresAt: now + windowMs,
        isLimited: false,
      };
    }

    return {
      remaining: Math.max(0, maxRequests - rateLimit.requestCount),
      windowExpiresAt: rateLimit.windowStart + windowMs,
      isLimited: rateLimit.requestCount >= maxRequests,
    };
  },
});

export async function logRateLimitViolation(
  userId: Id<"profiles">,
  endpoint: ApiEndpoint,
  requestCount: number,
  windowExpiresAt: number
): Promise<void> {
  const config = RATE_LIMIT_CONFIG[endpoint];
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
      retryAfterSec: Math.max(1, Math.ceil((windowExpiresAt - now) / 1000)),
    })
  );
}

export function formatRateLimitError(
  windowExpiresAt: number
): Response {
  const retryAfter = Math.max(1, Math.ceil((windowExpiresAt - Date.now()) / 1000));
  return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  });
}
