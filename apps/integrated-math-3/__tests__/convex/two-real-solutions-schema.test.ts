import { describe, expect, it } from "vitest";
import { validate } from "convex-helpers/validators";

import schema from "@/convex/schema";
import { IM3_TWO_REAL_SOLUTIONS_NODE } from "@/lib/practice/learning-evidence-pilot";
import { getGenerator } from "@math-platform/math-content/knowledge-space";

describe("two-real-solutions activity schema", () => {
  it("accepts the complete generated activity document", () => {
    const output = getGenerator("two-real-solutions-graphing").generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const activityDocument = {
      componentKey: "graphing-explorer",
      displayName: "Find two numbers with a given sum and product by graphing",
      props: output.data.rendererProps,
      createdAt: 0,
      updatedAt: 0,
    };

    expect(validate(schema.tables.activities.validator, activityDocument)).toBe(true);
  });
});
