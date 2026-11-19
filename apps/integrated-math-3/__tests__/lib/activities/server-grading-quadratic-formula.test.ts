import { describe, expect, it } from "vitest";
import { generateQuadraticFormula } from "@math-platform/math-content";
import {
  gradeServerOwnedSubmission,
  IM3_QF_DRAFT_MAPPINGS,
  IM3_QF_NODE,
} from "@/lib/activities/server-grading";

function envelope(mode: "guided_practice" | "independent_practice", seed: number) {
  const problem = generateQuadraticFormula({ seed });
  const [x1, x2 = ""] = problem.roots.map((root) => root.value);
  return {
    problem,
    submission: {
      contractVersion: "practice.v1" as const,
      activityId: `activities:${mode}`,
      mode,
      status: "submitted" as const,
      attemptNumber: 7,
      submittedAt: "2026-09-09T00:00:00.000Z",
      answers: { discriminant: problem.discriminant, x1, x2 },
      parts: [
        { partId: "discriminant", rawAnswer: problem.discriminant, hintsUsed: 1 },
        { partId: "x1", rawAnswer: x1 },
        { partId: "x2", rawAnswer: x2 },
      ],
    },
  };
}

describe("draft quadratic-formula server grading", () => {
  for (const mode of ["guided_practice", "independent_practice"] as const) {
    it(`grades the private ${mode} seed and returns no mastery contract`, () => {
      const mapping = IM3_QF_DRAFT_MAPPINGS[mode];
      const { problem, submission } = envelope(mode, mapping.seed);
      const result = gradeServerOwnedSubmission(
        {
          id: submission.activityId,
          stableActivityId: mapping.stableActivityId,
          masteryNodeId: IM3_QF_NODE,
          componentKey: "quadratic-formula",
          srsEligible: false,
          props: {
            prompt: "Solve.",
            equation: problem.quadratic,
            presentationMode: mapping.presentationMode,
          },
          privateGenerator: { generatorKey: "quadratic-formula", seed: mapping.seed },
        },
        submission as never,
      );
      expect(result.score).toBe(result.maxScore);
      expect(result.masteryContractVersion).toBeUndefined();
      expect(result.submissionData.attemptNumber).toBe(7);
      expect(result.submissionData.parts[0]).toMatchObject({
        partId: "discriminant",
        hintsUsed: 1,
        isCorrect: true,
      });
    });
  }

  it("rejects public equations that do not match the private seed", () => {
    const { submission } = envelope("guided_practice", 1);
    expect(() =>
      gradeServerOwnedSubmission(
        {
          id: submission.activityId,
          stableActivityId: IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId,
          masteryNodeId: IM3_QF_NODE,
          componentKey: "quadratic-formula",
          srsEligible: false,
          props: { prompt: "Solve.", equation: "x^2 = 0", presentationMode: "guided" },
          privateGenerator: { generatorKey: "quadratic-formula", seed: 1 },
        },
        submission as never,
      ),
    ).toThrow(/private seed/);
  });
});
