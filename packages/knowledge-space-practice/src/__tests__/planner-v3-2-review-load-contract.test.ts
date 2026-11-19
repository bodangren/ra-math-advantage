import { describe, expect, it } from "vitest";

import {
  reviewLoadAssessmentV3_2Schema,
  reviewLoadConfigV3_2Schema,
} from "../planner/v3-2-review-load-contract";
import { reviewLoadAssessmentV3_2Schema as rootReviewLoadAssessmentSchema } from "../index";
import { reviewLoadAssessmentV3_2Schema as subpathReviewLoadAssessmentSchema } from "@math-platform/knowledge-space-practice/planner/v3-2-review-load-contract";
import { studentVisualizationV1Schema, teacherVisualizationV1Schema } from "../projections/schemas";
import {
  projectStudentVisualization,
  projectTeacherVisualization,
} from "../projections/visualization";
import { syntheticMathKnowledgeSpace } from "../projections/fixtures";

describe("planner.v3.2 review-load contract", () => {
  it("publishes identical root and dedicated-subpath schemas", () => {
    expect(rootReviewLoadAssessmentSchema).toBe(subpathReviewLoadAssessmentSchema);
  });
  it("defaults to the exact seven-day, 0.8-budget, 0.6-elevated policy", () => {
    expect(reviewLoadConfigV3_2Schema.parse({ maxReviewsPerDay: 20 })).toEqual({
      horizonDays: 7,
      maxReviewsPerDay: 20,
      loadBudgetFactor: 0.8,
      elevatedBudgetFraction: 0.6,
    });
  });

  it.each([
    [0, 0, "normal", "allowed"],
    [68, 68 / 7, "elevated", "allowed"],
    [112, 16, "elevated", "allowed"],
    [180, 180 / 7, "saturated", "zero"],
  ] as const)("validates %s due cards as %s/day", (due, projected, state, allowance) => {
    expect(
      reviewLoadAssessmentV3_2Schema.parse({
        schemaVersion: "planner.review-load.v3.2",
        asOf: "2026-07-10T00:00:00.000Z",
        dueWithinHorizon: due,
        horizonDays: 7,
        projectedDailyLoad: projected,
        maxReviewsPerDay: 20,
        loadBudgetFactor: 0.8,
        budgetPerDay: 16,
        elevatedBudgetFraction: 0.6,
        reviewLoadState: state,
        newSkillAllowance: allowance,
        guidance: state === "saturated" ? "review-day" : "continue",
      }).reviewLoadState,
    ).toBe(state);
  });

  it("rejects caller-overridden constants and inconsistent classifications", () => {
    expect(
      reviewLoadConfigV3_2Schema.safeParse({ maxReviewsPerDay: 20, horizonDays: 14 }).success,
    ).toBe(false);
    expect(
      reviewLoadAssessmentV3_2Schema.safeParse({
        schemaVersion: "planner.review-load.v3.2",
        asOf: "2026-07-10T00:00:00.000Z",
        dueWithinHorizon: 180,
        horizonDays: 7,
        projectedDailyLoad: 180 / 7,
        maxReviewsPerDay: 20,
        loadBudgetFactor: 0.8,
        budgetPerDay: 16,
        elevatedBudgetFraction: 0.6,
        reviewLoadState: "normal",
        newSkillAllowance: "allowed",
        guidance: "continue",
      }).success,
    ).toBe(false);
  });
});

describe("v3.2 additive role projection fields", () => {
  it("accepts student review-load state", () => {
    expect(
      studentVisualizationV1Schema.parse({
        schemaVersion: "v1",
        mastered: [],
        ready: [],
        nearlyReady: [],
        blocked: [],
        reviewDue: [],
        recommendedNext: [],
        edges: [],
        activeMisconceptionCount: 0,
        reviewLoadState: "saturated",
      }).reviewLoadState,
    ).toBe("saturated");
  });

  it("accepts teacher per-student review-load states", () => {
    expect(
      teacherVisualizationV1Schema.parse({
        schemaVersion: "v1",
        heatmap: [],
        bottleneckNodes: [],
        prerequisiteGaps: [],
        misconceptionClusters: [],
        interventionGroups: [],
        standardsCoverage: [],
        activeMisconceptionStudentCount: 0,
        reviewLoadStates: { s1: "elevated", s2: "normal" },
      }).reviewLoadStates,
    ).toEqual({ s1: "elevated", s2: "normal" });
  });

  it("projects computed load state into student and teacher payloads", () => {
    expect(
      projectStudentVisualization([], [], {}, { reviewLoadState: "elevated" }).reviewLoadState,
    ).toBe("elevated");
    expect(
      projectTeacherVisualization([], [], {}, { reviewLoadStates: { s1: "saturated" } })
        .reviewLoadStates,
    ).toEqual({ s1: "saturated" });
  });

  it("suppresses legacy new-skill projection when student load is saturated", () => {
    const { nodes, edges } = syntheticMathKnowledgeSpace;
    expect(
      projectStudentVisualization(nodes, edges, {}, { reviewLoadState: "saturated" })
        .recommendedNext,
    ).toEqual([]);
  });
});
