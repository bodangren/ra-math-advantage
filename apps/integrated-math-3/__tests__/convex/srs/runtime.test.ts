import { describe, expect, it, vi } from "vitest";
import type { Id } from "@/convex/_generated/dataModel";
import {
  getRuntimeModeHandler,
  recordRuntimeComparisonHandler,
  selectReviewLoadStateForRuntime,
  setRuntimeModeHandler,
} from "@/convex/srs/runtime";

function makeContext(
  control: {
    _id: Id<"srs_runtime_controls">;
    scope: "im3";
    mode: "compare" | "v3_2" | "rollback_v2";
    migrationVersion: "kst-srs.v3.2";
    approvedAt?: number;
    updatedAt: number;
  } | null = null,
) {
  const first = vi.fn().mockResolvedValue(control);
  const withIndex = vi.fn().mockReturnValue({ first });
  const insert = vi.fn().mockResolvedValue("comparison-1" as Id<"srs_runtime_comparisons">);
  const patch = vi.fn().mockResolvedValue(undefined);
  return {
    db: {
      query: vi.fn().mockReturnValue({ withIndex }),
      insert,
      patch,
    },
    insert,
    patch,
  };
}

describe("v3.2 runtime controls", () => {
  it("defaults to the canonical v3.2 runtime until an internal control is written", async () => {
    const ctx = makeContext();

    await expect(getRuntimeModeHandler(ctx as never)).resolves.toEqual({
      mode: "v3_2",
      approvedAt: null,
    });
  });

  it("keeps v3.2 review-load messaging on v3.2 and compare modes, but restores the v2 baseline on rollback", () => {
    expect(selectReviewLoadStateForRuntime("v3_2", "saturated")).toBe("saturated");
    expect(selectReviewLoadStateForRuntime("compare", "elevated")).toBe("elevated");
    expect(selectReviewLoadStateForRuntime("rollback_v2", "saturated")).toBe("normal");
  });

  it("writes runtime mode only through the internal control handler", async () => {
    const ctx = makeContext();

    await setRuntimeModeHandler(ctx as never, {
      mode: "v3_2",
      approvedAt: 1_700_000_000_000,
      now: 1_700_000_000_100,
    });

    expect(ctx.insert).toHaveBeenCalledWith(
      "srs_runtime_controls",
      expect.objectContaining({
        scope: "im3",
        mode: "v3_2",
        migrationVersion: "kst-srs.v3.2",
        approvedAt: 1_700_000_000_000,
      }),
    );
  });
});

describe("v3.2 comparison telemetry", () => {
  it("does not persist equal observable outputs", async () => {
    const ctx = makeContext();

    const result = await recordRuntimeComparisonHandler(ctx as never, {
      subject: "daily_queue",
      v2: { cardIds: ["card-1"] },
      v3_2: { cardIds: ["card-1"] },
      now: 1_700_000_000_000,
    });

    expect(result).toEqual({ recorded: false, classification: null });
    expect(ctx.insert).not.toHaveBeenCalled();
  });

  it("persists only fingerprints and classification for a divergence", async () => {
    const ctx = makeContext();

    const result = await recordRuntimeComparisonHandler(ctx as never, {
      subject: "daily_queue",
      v2: { cardIds: ["review-1", "new-1"] },
      v3_2: {
        cardIds: ["review-1"],
        reason: "review-load-saturated",
        learnerAnswer: "must-not-persist",
      },
      now: 1_700_000_000_000,
    });

    expect(result).toEqual({ recorded: true, classification: "intended_contract_change" });
    const [, event] = ctx.insert.mock.calls[0];
    expect(event).toMatchObject({
      subject: "daily_queue",
      classification: "intended_contract_change",
      migrationVersion: "kst-srs.v3.2",
    });
    expect(event).not.toHaveProperty("v2");
    expect(event).not.toHaveProperty("v3_2");
    expect(JSON.stringify(event)).not.toContain("must-not-persist");
  });
});
