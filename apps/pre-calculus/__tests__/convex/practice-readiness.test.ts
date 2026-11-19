import { expect, it } from "vitest";
import { getPracticeReadiness } from "@/convex/learningEvidence";
const target = "math.precalc.skill.1.2.compare-rates-of-change-across-intervals";
const prerequisite = "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change";
const now = Date.parse("2026-09-07T00:00:00Z");
function context(introduced: boolean, mastered: boolean) {
  return {
    db: {
      query: (table: string) => ({
        withIndex: () => {
          const result = {
            order: () => result,
            take: async () =>
              table === "learning_evidence"
                ? introduced
                  ? [{ origin: "teacher_led" }]
                  : []
                : mastered
                  ? ["guided_practice", "independent_practice"].map((mode) => ({
                      problemFamilyId: `${prerequisite}.${mode}`,
                      stability: 30,
                      elapsedDays: 0,
                      lastReview: new Date(now).toISOString(),
                      difficulty: 5,
                      reps: 20,
                      lapses: 0,
                    }))
                  : [],
          };
          return result;
        },
      }),
    },
  } as any;
}
it("requires teacher introduction", async () =>
  expect(await getPracticeReadiness(context(false, true), "learner" as any, target, now)).toBe(
    "awaiting_teacher_exposure",
  ));
it("blocks a reviewed prerequisite until it is proficient", async () =>
  expect(await getPracticeReadiness(context(true, false), "learner" as any, target, now)).toBe(
    "blocked",
  ));
it("is ready after introduction and prerequisite mastery", async () =>
  expect(await getPracticeReadiness(context(true, true), "learner" as any, target, now)).toBe(
    "ready",
  ));
