import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Id } from "../../convex/_generated/dataModel";
import { checkAndIncrementApiRateLimitHandler, RATE_LIMIT_CONFIG, logRateLimitViolation } from "../../convex/apiRateLimits";

const mockInsert = vi.fn();
const mockPatch = vi.fn();
const mockUnique = vi.fn();
const mockQuery = vi.fn();
const mockWithIndex = vi.fn();
const mockConsoleError = vi.fn();

const mockGetUserIdentity = vi.fn().mockResolvedValue({ email: "test@example.com" });

vi.stubGlobal('console', {
  ...console,
  error: mockConsoleError,
});

function createMockCtx(profileId: Id<"profiles"> = "test-profile-id" as unknown as Id<"profiles">) {
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
    mockInsert.mockReset();
    mockPatch.mockReset();
    mockUnique.mockReset();
    mockQuery.mockReset();
    mockInsert.mockResolvedValue("new-entry-id");
    mockPatch.mockResolvedValue(undefined);
  });

  describe("checkAndIncrementApiRateLimitHandler", () => {
    it("allows first request for a user and endpoint", async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
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
        userId: "test-user-id" as unknown as Id<"profiles">,
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
      mockConsoleError.mockClear();

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
        endpoint: "phases/complete",
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(mockPatch).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const loggedObj = JSON.parse(mockConsoleError.mock.calls[0][0] as string);
      expect(loggedObj.type).toBe("RATE_LIMIT_VIOLATION");
      expect(loggedObj.endpoint).toBe("phases/complete");
      expect(loggedObj.userId).toBe("test-user-id");
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
        userId: "test-user-id" as unknown as Id<"profiles">,
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

    it("returns false allowed for unknown endpoint (deny-by-default)", async () => {
      const ctx = createMockCtx();

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
        endpoint: "unknown/endpoint" as any,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.windowExpiresAt).toBe(0);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("enforces different limits per endpoint", async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);

      const assessmentResult = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
        endpoint: "assessment",
      });
      expect(assessmentResult.remaining).toBe(RATE_LIMIT_CONFIG.assessment.maxRequests - 1);

      mockInsert.mockClear();
      mockUnique.mockResolvedValue(null);

      const aiErrorResult = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
        endpoint: "teacher/ai-error-summary",
      });
      expect(aiErrorResult.remaining).toBe(
        RATE_LIMIT_CONFIG["teacher/ai-error-summary"].maxRequests - 1
      );
    });
    it("handles concurrent requests gracefully - second request catches duplicate and patches", async () => {
      const now = Date.now();
      const ctx = createMockCtx();

      mockUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          _id: "existing-id",
          userId: "test-user-id",
          endpoint: "phases/complete",
          requestCount: 1,
          windowStart: now,
        });

      mockInsert.mockRejectedValueOnce(new Error("duplicate key value violates unique constraint"));

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
        endpoint: "phases/complete",
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIG["phases/complete"].maxRequests - 2);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockPatch).toHaveBeenCalledWith("existing-id", {
        requestCount: 2,
        updatedAt: expect.any(Number),
      });
    });

    it("handles concurrent requests where second insert fails and record is at limit", async () => {
      const now = Date.now();
      const ctx = createMockCtx();

      mockUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          _id: "existing-id",
          userId: "test-user-id",
          endpoint: "phases/complete",
          requestCount: 60,
          windowStart: now,
        });

      mockInsert.mockRejectedValueOnce(new Error("duplicate key value violates unique constraint"));
      mockConsoleError.mockClear();

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
        endpoint: "phases/complete",
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(mockPatch).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
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

  it("each endpoint has distinct configurable limits applied correctly", async () => {
    const ctx = createMockCtx();
    mockUnique.mockResolvedValue(null);
    mockConsoleError.mockClear();

    const endpoints: Array<{ endpoint: keyof typeof RATE_LIMIT_CONFIG; limit: number }> = [
      { endpoint: "phases/complete", limit: 60 },
      { endpoint: "assessment", limit: 60 },
      { endpoint: "activities/complete", limit: 60 },
      { endpoint: "teacher/error-summary", limit: 120 },
      { endpoint: "teacher/ai-error-summary", limit: 30 },
    ];

    for (const { endpoint, limit } of endpoints) {
      mockInsert.mockClear();
      mockUnique.mockResolvedValue(null);

      const result = await checkAndIncrementApiRateLimitHandler(ctx as never, {
        userId: "test-user-id" as unknown as Id<"profiles">,
        endpoint,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(limit - 1);
      expect(mockInsert).toHaveBeenCalledWith("api_rate_limits", expect.objectContaining({
        requestCount: 1,
        endpoint,
      }));
    }
  });
});

describe("logRateLimitViolation", () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  it("logs structured JSON with all violation details", async () => {
    const userId = "test-profile-id" as unknown as Id<"profiles">;
    const endpoint = "phases/complete";
    const requestCount = 60;
    const windowExpiresAt = Date.now() + 60000;

    await logRateLimitViolation(userId, endpoint, requestCount, windowExpiresAt);

    expect(mockConsoleError).toHaveBeenCalledTimes(1);
    const loggedObj = JSON.parse(mockConsoleError.mock.calls[0][0] as string);

    expect(loggedObj.type).toBe("RATE_LIMIT_VIOLATION");
    expect(loggedObj.timestamp).toBeDefined();
    expect(loggedObj.userId).toBe(userId);
    expect(loggedObj.endpoint).toBe(endpoint);
    expect(loggedObj.requestCount).toBe(requestCount);
    expect(loggedObj.limit).toBe(60);
    expect(loggedObj.windowMs).toBe(60000);
    expect(loggedObj.windowExpiresAt).toBeDefined();
    expect(loggedObj.retryAfterSec).toBeGreaterThan(0);
  });

  it("logs different limits for different endpoints", async () => {
    const endpoints: Array<{ endpoint: "teacher/ai-error-summary"; expectedLimit: number }> = [
      { endpoint: "teacher/ai-error-summary", expectedLimit: 30 },
    ];

    for (const { endpoint, expectedLimit } of endpoints) {
      mockConsoleError.mockClear();
      await logRateLimitViolation(
        "test-id" as unknown as Id<"profiles">,
        endpoint,
        expectedLimit,
        Date.now() + 60000
      );

      const loggedObj = JSON.parse(mockConsoleError.mock.calls[0][0] as string);
      expect(loggedObj.limit).toBe(expectedLimit);
    }
  });
});
