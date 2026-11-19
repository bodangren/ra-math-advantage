import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  practiceTimingSummarySchema,
  type PracticeTimingSummary,
} from "@math-platform/practice-core/contract";
import { usePracticeTiming } from "@/components/practice-timing";

describe("usePracticeTiming wall-clock timestamps", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the browser time origin for modern practice timing timestamps", () => {
    const epochMs = Date.parse("2026-09-05T10:00:00.000Z");
    const startElapsedMs = 1000;
    const submittedElapsedMs = 3500;
    const originalTimeOrigin = Object.getOwnPropertyDescriptor(performance, "timeOrigin");

    Object.defineProperty(performance, "timeOrigin", {
      configurable: true,
      value: epochMs,
    });
    let elapsedMs = startElapsedMs;
    vi.spyOn(performance, "now").mockImplementation(() => elapsedMs);

    try {
      const { result } = renderHook(() => usePracticeTiming());
      expect(result.current.isTracking()).toBe(true);

      elapsedMs = submittedElapsedMs;
      const timing: PracticeTimingSummary | null = result.current.getTiming();

      expect(timing).not.toBeNull();
      if (!timing) throw new Error("Expected practice timing after tracking started.");

      expect(timing.startedAt).toBe(new Date(epochMs + startElapsedMs).toISOString());
      expect(timing.submittedAt).toBe(new Date(epochMs + submittedElapsedMs).toISOString());
      expect(new Date(timing.startedAt).getUTCFullYear()).not.toBe(1970);
      expect(new Date(timing.submittedAt).getUTCFullYear()).not.toBe(1970);

      for (const duration of [timing.wallClockMs, timing.activeMs, timing.idleMs]) {
        expect(Number.isFinite(duration)).toBe(true);
        expect(duration).toBeGreaterThanOrEqual(0);
      }
      expect(practiceTimingSummarySchema.safeParse(timing).success).toBe(true);
    } finally {
      if (originalTimeOrigin) {
        Object.defineProperty(performance, "timeOrigin", originalTimeOrigin);
      } else {
        delete (performance as { timeOrigin?: number }).timeOrigin;
      }
    }
  });
});
