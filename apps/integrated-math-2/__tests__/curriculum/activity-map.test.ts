// @vitest-environment node
import { it, expect } from "vitest";
import map from "../../curriculum/implementation/practice-v1/activity-map.json";
import questions from "../../curriculum/questions.json";
import { questionSchema } from "../../lib/practice/question";
it("maps only implemented checkpoints with valid question props", () => {
  expect(map.activities).toHaveLength(Object.keys(questions).length);
  const seen = new Set<string>();
  for (const activity of map.activities) {
    expect(activity.componentKey).toBe("im2-question");
    expect(activity.mode).toBe("assessment");
    expect(activity.srsEligible).toBe(false);
    expect(questionSchema.safeParse(activity.props).success).toBe(true);
    seen.add(activity.sourceReference);
  }
  expect(seen.size).toBe(96);
});
