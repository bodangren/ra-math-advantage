import { describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { seedAll } from "@/convex/seed";

describe("full curriculum seed", () => {
  it("calls each seed in its real module", async () => {
    const names: string[] = [];
    const runMutation = vi.fn(async (ref: any) => {
      names.push(getFunctionName(ref));
      return getFunctionName(ref) === "seed:seedUnits" ? { ok: true } : [];
    });
    await (seedAll as any)._handler({ runMutation }, {});
    expect(names).toContain("seed/seed_standards:seedStandards");
    expect(names).toContain("seed/seed_objective_policies:seedObjectivePolicies");
    for (const [unit, count] of [
      [1, 14],
      [2, 15],
      [3, 15],
      [4, 14],
    ]) {
      for (let topic = 1; topic <= count; topic++)
        expect(names).toContain(`seed/seed_lesson_${unit}_${topic}:seedLesson${unit}_${topic}`);
    }
  });
  it("fails when a required seed step fails", async () => {
    const runMutation = vi.fn(async (ref: any) => {
      if (getFunctionName(ref) !== "seed:seedUnits") throw new Error("seed failed");
      return { ok: true };
    });
    await expect((seedAll as any)._handler({ runMutation }, {})).rejects.toThrow("seed failed");
  });
});
