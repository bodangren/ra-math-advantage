import { describe, expect, it } from "vitest";

import {
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

describe("two-real-solutions runtime identities", () => {
  it("exports the exact two-real-solutions identities", () => {
    expect(IM3_TWO_REAL_SOLUTIONS_NODE).toBe(
      "math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing",
    );
    expect(IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID).toBe(
      `${IM3_TWO_REAL_SOLUTIONS_NODE}.worked_example`,
    );
    expect(IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID).toBe(
      `${IM3_TWO_REAL_SOLUTIONS_NODE}.guided_practice`,
    );
    expect(IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID).toBe(
      `${IM3_TWO_REAL_SOLUTIONS_NODE}.independent_practice`,
    );
  });
});
