import { mutation, query } from "./_generated/server";
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
    return { allowed: true, remaining: Infinity, windowExpiresAt: 0 };
  }

  const { windowMs, maxRequests } = config;
  const now = Date.now();

  const existing = await ctx.db
    .query("api_rate_limits")
    .withIndex("by_user_and_endpoint", (q) =>
      q.eq("userId", args.userId).eq("endpoint", args.endpoint)
    )
    .unique();

  if (!existing) {
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
      remaining: maxRequests - 1,
      windowExpiresAt: now + windowMs,
    };
  }

  if (now - existing.windowStart >= windowMs) {
    await ctx.db.patch(existing._id, {
      requestCount: 1,
      windowStart: now,
      updatedAt: now,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      windowExpiresAt: now + windowMs,
    };
  }

  if (existing.requestCount >= maxRequests) {
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
    remaining: maxRequests - existing.requestCount - 1,
    windowExpiresAt: existing.windowStart + windowMs,
  };
}

export const checkAndIncrementApiRateLimit = mutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    return checkAndIncrementApiRateLimitHandler(ctx, {
      userId: profile._id,
      endpoint: args.endpoint as ApiEndpoint,
    });
  },
});

export const getApiRateLimitStatus = query({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const config = RATE_LIMIT_CONFIG[args.endpoint as ApiEndpoint];
    if (!config) {
      return { remaining: Infinity, windowExpiresAt: 0, isLimited: false };
    }

    const { windowMs, maxRequests } = config;
    const now = Date.now();

    const rateLimit = await ctx.db
      .query("api_rate_limits")
      .withIndex("by_user_and_endpoint", (q) =>
        q.eq("userId", profile._id).eq("endpoint", args.endpoint)
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
