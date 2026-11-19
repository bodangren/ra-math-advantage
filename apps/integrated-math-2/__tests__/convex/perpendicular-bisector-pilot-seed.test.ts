import { describe, expect, it } from "vitest";
import { seedPerpendicularBisectorPilotHandler } from "@/convex/seed/seed_perpendicular_bisector_pilot";

describe("IM2 perpendicular-bisector pilot seed", () => {
  it("preserves review for unchanged content and clears it for changed content", async () => {
    const rows: any[] = [];
    const db = {
      query: () => ({
        withIndex: (_: string, select: any) => {
          let stable = "";
          select({
            eq: (_field: string, value: string) => {
              stable = value;
            },
          });
          return {
            unique: async () => rows.find((row) => row.stableActivityId === stable) ?? null,
          };
        },
      }),
      insert: async (_table: string, value: any) => {
        const id = `activity-${rows.length + 1}`;
        rows.push({ _id: id, ...value });
        return id;
      },
      patch: async (id: string, value: any) =>
        Object.assign(
          rows.find((row) => row._id === id),
          value,
        ),
    };
    await seedPerpendicularBisectorPilotHandler({ db } as never);
    rows[0].approval = { status: "approved" };
    rows[0].srsEligible = true;
    await seedPerpendicularBisectorPilotHandler({ db } as never);
    expect(rows[0]).toMatchObject({
      approval: { status: "approved" },
      srsEligible: true,
      generatorSeed: 60,
    });
    rows[0].props = { prompt: "changed" };
    await seedPerpendicularBisectorPilotHandler({ db } as never);
    expect(rows[0].approval).toBeUndefined();
    expect(rows[0].srsEligible).toBe(false);
  });
});
