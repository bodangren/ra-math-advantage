import { describe, expect, it } from "vitest";

import {
  buildIm3OneRealSolutionGuidedPracticeSeedDocuments,
  buildIm3OneRealSolutionIndependentPracticeSeedDocuments,
} from "@/convex/seed/seed_lesson_1_2";
import {
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
} from "@/lib/practice/learning-evidence-pilot";

describe("IM3 one-real-solution practice mapping documents", () => {
  it("builds the exact Guided variant and item documents", () => {
    const activityId = "activities:one-real-solution-guided";
    const now = 246810;
    const documents = buildIm3OneRealSolutionGuidedPracticeSeedDocuments(
      activityId as never,
      now,
    );

    expect(documents).toEqual({
      variant: {
        variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: now,
        componentKey: "graphing-explorer",
        displayName: "Guided practice: Solve a quadratic equation with one real solution by graphing",
        description: "Guided practice for solving a quadratic equation with one real solution by graphing.",
        objectiveIds: [IM3_ONE_REAL_SOLUTION_NODE],
        difficulty: "standard",
        metadata: { stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID },
      },
      item: {
        practiceItemId: `${IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID}:seed-45`,
        activityId,
        variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: now,
        variantLabel: "Seed 45",
      },
    });
    expect(JSON.stringify(documents)).not.toMatch(
      /expectedAnswer|partAnswers|table_values|placed_points|score|maxScore|isCorrect|correctness/,
    );
  });

  it("builds the exact Independent variant and item documents", () => {
    const activityId = "activities:one-real-solution-independent";
    const now = 135790;
    const documents = buildIm3OneRealSolutionIndependentPracticeSeedDocuments(
      activityId as never,
      now,
    );

    expect(documents).toEqual({
      variant: {
        variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: now,
        componentKey: "graphing-explorer",
        displayName: "Independent practice: Solve a quadratic equation with one real solution by graphing",
        description: "Independent practice for solving a quadratic equation with one real solution by graphing.",
        objectiveIds: [IM3_ONE_REAL_SOLUTION_NODE],
        difficulty: "standard",
        metadata: { stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID },
      },
      item: {
        practiceItemId: `${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}:seed-0`,
        activityId,
        variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: now,
        variantLabel: "Seed 0",
      },
    });
    expect(JSON.stringify(documents)).not.toMatch(
      /expectedAnswer|partAnswers|table_values|placed_points|score|maxScore|isCorrect|correctness/,
    );
  });
});
