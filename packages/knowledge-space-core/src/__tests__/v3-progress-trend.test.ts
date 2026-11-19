import { describe, expect, it } from "vitest";

import { computeProgressTrend, DEFAULT_PROGRESS_TREND_WINDOW_DAYS } from "../progress-trend";
import type { MasterySnapshot } from "../progress-trend";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = 30 * DAY_MS;

function snapshot(daysBeforeNow: number, masteredCount: number): MasterySnapshot {
  return {
    timestamp: NOW - daysBeforeNow * DAY_MS,
    masteredNodeIds: Array.from({ length: masteredCount }, (_, index) => `skill-${index}`),
  };
}

describe("computeProgressTrend v3.2 symmetric thresholds", () => {
  it("uses a 14-day default comparison window", () => {
    expect(DEFAULT_PROGRESS_TREND_WINDOW_DAYS).toBe(14);
    expect(computeProgressTrend([snapshot(14, 1), snapshot(0, 4)], { now: NOW })).toBe("improving");
  });

  it("classifies +3 as improving and +2 as stable with the default threshold", () => {
    expect(computeProgressTrend([snapshot(10, 1), snapshot(0, 4)], { now: NOW })).toBe("improving");
    expect(computeProgressTrend([snapshot(10, 1), snapshot(0, 3)], { now: NOW })).toBe("stable");
  });

  it("classifies -3 as declining and -2 as stable with the default threshold", () => {
    expect(computeProgressTrend([snapshot(10, 4), snapshot(0, 1)], { now: NOW })).toBe("declining");
    expect(computeProgressTrend([snapshot(10, 3), snapshot(0, 1)], { now: NOW })).toBe("stable");
  });

  it("returns unknown with fewer than two snapshots inside the window", () => {
    expect(computeProgressTrend([snapshot(15, 1), snapshot(0, 5)], { now: NOW })).toBe("unknown");
    expect(computeProgressTrend([], { now: NOW })).toBe("unknown");
  });

  it("supports a validated custom symmetric threshold and node filter", () => {
    const includedNodeIds = new Set(["skill-0", "skill-1"]);
    const history: MasterySnapshot[] = [
      { timestamp: NOW - DAY_MS, masteredNodeIds: ["skill-0", "outside-0"] },
      {
        timestamp: NOW,
        masteredNodeIds: ["skill-0", "skill-1", "outside-0", "outside-1"],
      },
    ];

    expect(
      computeProgressTrend(history, {
        now: NOW,
        trendThreshold: 2,
        includedNodeIds,
      }),
    ).toBe("stable");
  });

  it("does not mutate unordered input and compares it chronologically", () => {
    const history = [snapshot(0, 4), snapshot(10, 1)];
    const original = structuredClone(history);

    expect(computeProgressTrend(history, { now: NOW })).toBe("improving");
    expect(history).toEqual(original);
  });

  it("rejects non-positive thresholds and windows", () => {
    expect(() =>
      computeProgressTrend([snapshot(1, 1), snapshot(0, 4)], {
        now: NOW,
        trendThreshold: 0,
      }),
    ).toThrow(RangeError);
    expect(() =>
      computeProgressTrend([snapshot(1, 1), snapshot(0, 4)], {
        now: NOW,
        windowDays: 0,
      }),
    ).toThrow(RangeError);
  });
});
