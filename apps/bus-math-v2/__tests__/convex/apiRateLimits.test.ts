import { describe, expect, it, vi, beforeEach } from 'vitest';
import { checkAndIncrementApiRateLimitHandler, RATE_LIMIT_CONFIG } from "../../convex/apiRateLimits";

const mockInsert = vi.fn();
const mockPatch = vi.fn();
const mockUnique = vi.fn();
const mockQuery = vi.fn();
const mockWithIndex = vi.fn();

const mockGetUserIdentity = vi.fn().mockResolvedValue({ email: "test@example.com" });

function createMockCtx(profileId: `p${string}` = "test-profile-id") {
  mockUnique.mockResolvedValue(null);
  mockWithIndex.mockReturnValue({ unique: mockUnique });

  mockQuery.mockImplementation((table: string) => {
    if (table === "profiles") {
      return {
        withIndex: vi.fn().mockImplementation(() => {
          return {
            unique: vi.fn().mockResolvedValue({
              _id: profileId,
              role: "student",
              email: "test@example.com",
            }),
          };
        }),
      };
    }
    return { withIndex: mockWithIndex };
  });

  return {
    auth: { getUserIdentity: mockGetUserIdentity },
    db: {
      query: mockQuery,
      insert: mockInsert.mockResolvedValue("new-entry-id"),
      patch: mockPatch.mockResolvedValue(undefined),
    },
  };
}

describe("apiRateLimits handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAndIncrementApiRateLimitHandler", () => {
    it("allows first request for a user and endpoint", async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as `p${string}`,
        endpoint: "phases/complete",
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIG["phases/complete"].maxRequests - 1);
      expect(mockInsert).toHaveBeenCalledWith("api_rate_limits", {
        userId: "test-user-id",
        endpoint: "phases/complete",
        requestCount: 1,
        windowStart: expect.any(Number),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it("allows subsequent requests within window", async () => {
      const now = Date.now();
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue({
        _id: "existing-id",
        userId: "test-user-id",
        endpoint: "phases/complete",
        requestCount: 5,
        windowStart: now,
      });

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as `p${string}`,
        endpoint: "phases/complete",
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIG["phases/complete"].maxRequests - 6);
      expect(mockPatch).toHaveBeenCalledWith("existing-id", {
        requestCount: 6,
        updatedAt: expect.any(Number),
      });
    });

    it("denies request when rate limit exceeded", async () => {
      const now = Date.now();
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue({
        _id: "existing-id",
        userId: "test-user-id",
        endpoint: "phases/complete",
        requestCount: RATE_LIMIT_CONFIG["phases/complete"].maxRequests,
        windowStart: now,
      });

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as `p${string}`,
        endpoint: "phases/complete",
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("resets window when expired", async () => {
      const now = Date.now();
      const expiredWindowStart = now - RATE_LIMIT_CONFIG["phases/complete"].windowMs - 1000;
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue({
        _id: "existing-id",
        userId: "test-user-id",
        endpoint: "phases/complete",
        requestCount: 50,
        windowStart: expiredWindowStart,
      });

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as `p${string}`,
        endpoint: "phases/complete",
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIG["phases/complete"].maxRequests - 1);
      expect(mockPatch).toHaveBeenCalledWith("existing-id", {
        requestCount: 1,
        windowStart: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it("returns true allowed for unknown endpoint", async () => {
      const ctx = createMockCtx();

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as `p${string}`,
        endpoint: "unknown/endpoint" as any,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("enforces different limits per endpoint", async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);

      const assessmentResult = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as `p${string}`,
        endpoint: "assessment",
      });
      expect(assessmentResult.remaining).toBe(RATE_LIMIT_CONFIG.assessment.maxRequests - 1);

      mockInsert.mockClear();
      mockUnique.mockResolvedValue(null);

      const aiErrorResult = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as `p${string}`,
        endpoint: "teacher/ai-error-summary",
      });
      expect(aiErrorResult.remaining).toBe(
        RATE_LIMIT_CONFIG["teacher/ai-error-summary"].maxRequests - 1
      );
    });
  });
});

describe("RATE_LIMIT_CONFIG", () => {
  it("has configuration for all 5 endpoints", () => {
    expect(RATE_LIMIT_CONFIG).toHaveProperty("phases/complete");
    expect(RATE_LIMIT_CONFIG).toHaveProperty("assessment");
    expect(RATE_LIMIT_CONFIG).toHaveProperty("activities/complete");
    expect(RATE_LIMIT_CONFIG).toHaveProperty("teacher/error-summary");
    expect(RATE_LIMIT_CONFIG).toHaveProperty("teacher/ai-error-summary");
  });

  it("uses 60 second windows", () => {
    for (const config of Object.values(RATE_LIMIT_CONFIG)) {
      expect(config.windowMs).toBe(60000);
    }
  });

  it("has appropriate limits per endpoint", () => {
    expect(RATE_LIMIT_CONFIG["phases/complete"].maxRequests).toBe(60);
    expect(RATE_LIMIT_CONFIG.assessment.maxRequests).toBe(60);
    expect(RATE_LIMIT_CONFIG["activities/complete"].maxRequests).toBe(60);
    expect(RATE_LIMIT_CONFIG["teacher/error-summary"].maxRequests).toBe(120);
    expect(RATE_LIMIT_CONFIG["teacher/ai-error-summary"].maxRequests).toBe(30);
  });
});
