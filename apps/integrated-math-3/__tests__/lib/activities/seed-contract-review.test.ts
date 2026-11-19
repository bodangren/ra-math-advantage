import { expect, it } from "vitest";
import { getPropsSchema } from "@math-platform/activity-components/schemas";
import { normalizeSeedProps } from "@/lib/activities/seed-props";
it("converts stored quiz questions without changing the keyed option", () => {
  const props = normalizeSeedProps("comprehension-quiz", {
    questions: [{ question: "What is 2 + 2?", options: ["3", "4"], correctIndex: 1 }],
  });
  expect(getPropsSchema("comprehension-quiz")!.safeParse(props).success).toBe(true);
  expect(props.questions).toEqual([
    {
      id: "q1",
      type: "multiple_choice",
      prompt: "What is 2 + 2?",
      options: ["3", "4"],
      correctAnswer: "4",
    },
  ]);
});
it("retains solver steps and gives them stable IDs", () => {
  const props = normalizeSeedProps("step-by-step-solver", {
    problemType: "polynomial-division",
    equation: "x^2/x",
    steps: [{ expression: "x", explanation: "Divide powers." }],
  });
  expect(getPropsSchema("step-by-step-solver")!.safeParse(props).success).toBe(true);
  expect(props.steps).toEqual([
    { id: "step_0", description: "Divide powers.", expression: "x", explanation: "Divide powers." },
  ]);
});
it("removes obsolete graph-only display fields", () => {
  expect(
    normalizeSeedProps("graphing-explorer", {
      variant: "explore",
      equation: "y=1/x",
      title: "Explore",
    }),
  ).toEqual({ equation: "y=1/x" });
});
