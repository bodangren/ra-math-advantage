import { describe, it, expect } from "vitest";
import {
  triangleNodeIds,
  triangleModes,
  triangleItem,
  projectTriangleItem,
  gradeTrianglePart,
} from "@/lib/practice/triangle-ordering";
describe("triangle ordering", () => {
  it("maps six native problems", () => {
    expect(triangleModes(triangleNodeIds.angles).map((x) => x.seed)).toEqual([6, 8, 11]);
    expect(triangleModes(triangleNodeIds.sides).map((x) => x.seed)).toEqual([7, 9, 10]);
    expect(
      triangleItem(triangleNodeIds.sides, "independent_practice", 10, 1).parts?.[0].question.answer,
    ).toBe(66);
  });
  it("keeps authored and private projections distinct", () => {
    expect(projectTriangleItem(triangleNodeIds.angles, "worked_example", 6, 1, "a")).toMatchObject({
      authoredLabel: "Authored solution for native Problem 6",
      answer: "∠T, ∠R, ∠S",
      solutionSteps: expect.arrayContaining([
        "Match the opposite measures: RS → ∠T, TS → ∠R, TR → ∠S.",
      ]),
    });
    expect(projectTriangleItem(triangleNodeIds.sides, "worked_example", 7, 1, "b")).toMatchObject({
      authoredLabel: "Authored solution for native Problem 7",
      answer: "RS, ST, RT",
      solutionSteps: expect.arrayContaining([
        "Match the opposite measures: ∠T → RS, ∠R → ST, ∠S → RT.",
      ]),
    });
    expect(
      projectTriangleItem(triangleNodeIds.sides, "independent_practice", 10, 1, "a"),
    ).not.toHaveProperty("answer");
  });
  it("grades exact parts", () => {
    expect(
      gradeTrianglePart(triangleNodeIds.sides, "independent_practice", 10, 1, "missing_angle", "66")
        .score,
    ).toBe(1);
    expect(
      gradeTrianglePart(
        triangleNodeIds.sides,
        "independent_practice",
        10,
        1,
        "final_order",
        "choice-2",
      ).score,
    ).toBe(0);
  });
  it("rejects mismatched fixed identity", () =>
    expect(() => triangleItem(triangleNodeIds.angles, "guided_practice", 9, 1)).toThrow(
      "invalid_triangle_item",
    ));
});
