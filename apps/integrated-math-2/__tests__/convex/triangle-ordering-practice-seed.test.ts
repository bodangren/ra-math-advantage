import { describe, expect, it } from "vitest";
import { seedTriangleOrderingPracticeHandler } from "@/convex/seed/seed_triangle_ordering_practice";
import { database } from "../helpers/database";

describe("triangle ordering seed", () => {
  it("creates six stable ineligible records and preserves unchanged review fields on rerun", async () => {
    const t = database();
    const ids = await seedTriangleOrderingPracticeHandler(t.ctx);
    expect(ids).toHaveLength(6);
    expect(t.tables.activities.map((row) => row.stableActivityId)).toHaveLength(6);
    expect(
      t.tables.activities.every((row) => row.srsEligible === false && row.approval === undefined),
    ).toBe(true);
    const first = t.tables.activities[0];
    await t.db.patch(first._id, {
      approval: { status: "approved", reviewedBy: "teacher" },
      srsEligible: true,
      updatedAt: 17,
    });
    first.gradingConfig = { partialCredit: false, autoGrade: true };
    expect(await seedTriangleOrderingPracticeHandler(t.ctx)).toEqual(ids);
    expect(first).toMatchObject({
      approval: { status: "approved", reviewedBy: "teacher" },
      srsEligible: true,
      updatedAt: 17,
    });
  });

  it("clears approval when reviewed content changes", async () => {
    const t = database();
    await seedTriangleOrderingPracticeHandler(t.ctx);
    const first = t.tables.activities[0];
    await t.db.patch(first._id, {
      approval: { status: "approved" },
      srsEligible: true,
      displayName: "Changed",
    });
    await seedTriangleOrderingPracticeHandler(t.ctx);
    expect(first.approval).toBeUndefined();
    expect(first.srsEligible).toBe(false);
    expect(first.displayName).not.toBe("Changed");
  });
});
