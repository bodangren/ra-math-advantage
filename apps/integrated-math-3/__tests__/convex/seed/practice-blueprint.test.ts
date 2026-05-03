import { describe, it, expect } from "vitest";
import { IM3_PROBLEM_FAMILIES } from "@math-platform/math-content/problem-families/im3";
import { problemFamilySchema } from "@math-platform/practice-core";
import { practiceItemSchema } from "@math-platform/practice-core";

const ALL_PROBLEM_FAMILIES = IM3_PROBLEM_FAMILIES.filter(
  (f) => (f.metadata as { module?: number }).module !== undefined
);

describe("Problem Family Seed Data Validation", () => {
  it("all problem family records pass problemFamilySchema", () => {
    for (const family of ALL_PROBLEM_FAMILIES) {
      const result = problemFamilySchema.safeParse(family);
      expect(result.success, `Failed for ${family.problemFamilyId}: ${result.error?.message}`).toBe(true);
    }
  });

  it("no duplicate problemFamilyId values within seed data", () => {
    const ids = ALL_PROBLEM_FAMILIES.map((f) => f.problemFamilyId);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it("all objectiveIds are non-empty strings", () => {
    for (const family of ALL_PROBLEM_FAMILIES) {
      expect(family.objectiveIds.length, `${family.problemFamilyId} has no objectiveIds`).toBeGreaterThan(0);
      for (const objId of family.objectiveIds) {
        expect(objId.trim().length, `${family.problemFamilyId} has empty objectiveId`).toBeGreaterThan(0);
      }
    }
  });

  it("difficulty is one of introductory, standard, challenging", () => {
    const validDifficulties = ["introductory", "standard", "challenging"];
    for (const family of ALL_PROBLEM_FAMILIES) {
      expect(validDifficulties.includes(family.difficulty), `Invalid difficulty for ${family.problemFamilyId}: ${family.difficulty}`).toBe(true);
    }
  });

  it("displayName and description are non-empty", () => {
    for (const family of ALL_PROBLEM_FAMILIES) {
      expect(family.displayName.trim().length, `${family.problemFamilyId} has empty displayName`).toBeGreaterThan(0);
      expect(family.description.trim().length, `${family.problemFamilyId} has empty description`).toBeGreaterThan(0);
    }
  });

  it("componentKey is a known activity type", () => {
    const knownComponentKeys = [
      "step-by-step-solver",
      "graphing-explorer",
      "comprehension-quiz",
      "fill-in-the-blank",
      "equation-builder",
      "matching-activity",
      "drag-and-drop",
      "multiple-choice",
    ];
    for (const family of ALL_PROBLEM_FAMILIES) {
      expect(knownComponentKeys.includes(family.componentKey), `Unknown componentKey for ${family.problemFamilyId}: ${family.componentKey}`).toBe(true);
    }
  });

  it("metadata contains module number", () => {
    for (const family of ALL_PROBLEM_FAMILIES) {
      expect(family.metadata.module, `${family.problemFamilyId} missing module in metadata`).toBeDefined();
      expect(typeof family.metadata.module).toBe("number");
    }
  });

  it("problemFamilyId follows naming convention component:specific-name", () => {
    for (const family of ALL_PROBLEM_FAMILIES) {
      expect(family.problemFamilyId).toMatch(/^[a-z-]+:.+$/);
    }
  });
});

describe("Practice Item Schema Validation", () => {
  const samplePracticeItem = {
    practiceItemId: "step-by-step-solver:quadratic:solve:1",
    activityId: "abc123",
    problemFamilyId: "step-by-step-solver:quadratic:solve",
    variantLabel: "Set A",
  };

  it("valid practice item passes schema", () => {
    const result = practiceItemSchema.safeParse(samplePracticeItem);
    expect(result.success).toBe(true);
  });

  it("rejects practice item with empty practiceItemId", () => {
    const result = practiceItemSchema.safeParse({
      ...samplePracticeItem,
      practiceItemId: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects practice item with empty activityId", () => {
    const result = practiceItemSchema.safeParse({
      ...samplePracticeItem,
      activityId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects practice item with empty problemFamilyId", () => {
    const result = practiceItemSchema.safeParse({
      ...samplePracticeItem,
      problemFamilyId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects practice item with empty variantLabel", () => {
    const result = practiceItemSchema.safeParse({
      ...samplePracticeItem,
      variantLabel: "",
    });
    expect(result.success).toBe(false);
  });
});