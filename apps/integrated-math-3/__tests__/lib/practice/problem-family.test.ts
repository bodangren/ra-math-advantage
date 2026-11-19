import { describe, it, expect } from "vitest";
import {
  practiceVariantSchema,
  difficultySchema,
  type PracticeVariantInput,
} from "@math-platform/practice-core/problem-family";

function makeValidInput(): PracticeVariantInput {
  return {
    variantKey: "graphing-explorer:quadratic-transformations",
    componentKey: "graphing-explorer",
    displayName: "Quadratic Transformations",
    description: "Explore how a, h, and k transform the graph of a quadratic.",
    objectiveIds: ["std-1", "std-2"],
    difficulty: "standard",
    metadata: { domain: "algebra" },
  };
}

describe("difficultySchema", () => {
  it("accepts introductory", () => {
    expect(difficultySchema.parse("introductory")).toBe("introductory");
  });

  it("accepts standard", () => {
    expect(difficultySchema.parse("standard")).toBe("standard");
  });

  it("accepts challenging", () => {
    expect(difficultySchema.parse("challenging")).toBe("challenging");
  });

  it("rejects invalid difficulty", () => {
    expect(() => difficultySchema.parse("easy")).toThrow();
  });
});

describe("practiceVariantSchema", () => {
  it("passes with valid data", () => {
    const input = makeValidInput();
    const result = practiceVariantSchema.parse(input);
    expect(result.variantKey).toBe(input.variantKey);
    expect(result.difficulty).toBe("standard");
  });

  it("rejects empty variantKey", () => {
    const input = { ...makeValidInput(), variantKey: "  " };
    expect(() => practiceVariantSchema.parse(input)).toThrow();
  });

  it("rejects empty componentKey", () => {
    const input = { ...makeValidInput(), componentKey: "" };
    expect(() => practiceVariantSchema.parse(input)).toThrow();
  });

  it("rejects empty displayName", () => {
    const input = { ...makeValidInput(), displayName: "   " };
    expect(() => practiceVariantSchema.parse(input)).toThrow();
  });

  it("rejects empty description", () => {
    const input = { ...makeValidInput(), description: "" };
    expect(() => practiceVariantSchema.parse(input)).toThrow();
  });

  it("accepts empty objectiveIds array", () => {
    const input = { ...makeValidInput(), objectiveIds: [] };
    const result = practiceVariantSchema.parse(input);
    expect(result.objectiveIds).toEqual([]);
  });

  it("rejects objectiveIds with empty strings", () => {
    const input = { ...makeValidInput(), objectiveIds: ["std-1", ""] };
    expect(() => practiceVariantSchema.parse(input)).toThrow();
  });

  it("rejects invalid difficulty", () => {
    const input = { ...makeValidInput(), difficulty: "hard" };
    expect(() => practiceVariantSchema.parse(input)).toThrow();
  });

  it("accepts empty metadata object", () => {
    const input = { ...makeValidInput(), metadata: {} };
    const result = practiceVariantSchema.parse(input);
    expect(result.metadata).toEqual({});
  });

  it("rejects missing required fields", () => {
    const input = { variantKey: "pf-1" };
    expect(() => practiceVariantSchema.parse(input)).toThrow();
  });
});
