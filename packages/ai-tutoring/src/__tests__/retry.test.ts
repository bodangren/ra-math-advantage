import { describe, it, expect, vi } from "vitest";
import { withRetry, isRetryableStatus } from "../retry";

describe("isRetryableStatus", () => {
  it("returns true for 429 rate limit", () => {
    expect(isRetryableStatus(429)).toBe(true);
  });

  it("returns true for 5xx server errors", () => {
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(502)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(599)).toBe(true);
  });

  it("returns false for 2xx success", () => {
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(201)).toBe(false);
    expect(isRetryableStatus(204)).toBe(false);
  });

  it("returns false for 3xx redirects", () => {
    expect(isRetryableStatus(301)).toBe(false);
    expect(isRetryableStatus(302)).toBe(false);
    expect(isRetryableStatus(304)).toBe(false);
  });

  it("returns false for 4xx client errors (except 429)", () => {
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(401)).toBe(false);
    expect(isRetryableStatus(403)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(422)).toBe(false);
  });
});

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const result = await withRetry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on retryable error and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("API error (429): Rate limited"))
      .mockResolvedValueOnce("success");

    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws immediately on non-retryable error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Bad request (400)"));

    await expect(withRetry(fn)).rejects.toThrow("Bad request (400)");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("API error (503)"));

    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })).rejects.toThrow(
      "API error (503)",
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws when signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = vi.fn().mockRejectedValue(new Error("API error (500)"));

    await expect(withRetry(fn, { maxRetries: 2, signal: controller.signal })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('parses alternative error format "error: 429"', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("error: 429"))
      .mockResolvedValueOnce("success");

    const result = await withRetry(fn, { maxRetries: 1, baseDelayMs: 10 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry DOMException AbortError", async () => {
    const fn = vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError"));

    await expect(withRetry(fn)).rejects.toThrow("Aborted");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("succeeds after single retry", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("error: 500"))
      .mockResolvedValueOnce("eventual success");

    const result = await withRetry(fn, { maxRetries: 1, baseDelayMs: 5 });

    expect(result).toBe("eventual success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("respects maxRetries option", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("error: 500"));

    await expect(withRetry(fn, { maxRetries: 1, baseDelayMs: 5 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
