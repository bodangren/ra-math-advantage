import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson11_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson11_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson11_6Result> => {
    const now = Date.now();
    const lessonSlug = "11-6-solving-polynomial-equations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 11,
          title: "Solving Polynomial Equations",
          slug: lessonSlug,
          description: "Students solve polynomial equations by factoring and applying the zero product property.",
          orderIndex: 6,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 1,
          title: "Solving Polynomial Equations",
          description: "Students solve polynomial equations by factoring and applying the zero product property.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Explore: When Does a Product Equal Zero?\n\nIf a × b = 0, what must be true about a or b?\n\nUsing this idea, how would you solve (x − 3)(x + 5) = 0?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "If (x − 4)(x + 2) = 0, then:",
                    options: ["x = 4 or x = -2", "x = 4 and x = -2", "x = -4 or x = 2", "x = 0"],
                    correctIndex: 0,
                  },
                  {
                    question: "The zero product property states that if ab = 0, then:",
                    options: ["a = b = 0", "a = 0 or b = 0", "a + b = 0", "a = b"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving Polynomial Equations\n\n### Zero Product Property\nIf AB = 0, then A = 0 or B = 0.\n\n### Steps\n1. Set the equation equal to zero\n2. Factor completely\n3. Set each factor equal to zero\n4. Solve each equation\n\n### Example\nx² − 9 = 0\n(x + 3)(x − 3) = 0\nx + 3 = 0 → x = −3\nx − 3 = 0 → x = 3",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Worked Example",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example: Solve by Factoring\n\nSolve x² + 2x − 8 = 0.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial-solving",
                equation: "x² + 2x - 8 = 0",
                steps: [
                  { expression: "Find factors of -8 that add to 2", explanation: "ac = -8, b = 2" },
                  { expression: "4 × (-2) = -8 and 4 + (-2) = 2", explanation: "Factors are 4 and -2" },
                  { expression: "(x + 4)(x - 2) = 0", explanation: "Factor the trinomial" },
                  { expression: "x + 4 = 0 → x = -4", explanation: "Set first factor to zero" },
                  { expression: "x - 2 = 0 → x = 2", explanation: "Set second factor to zero" },
                  { expression: "Solutions: x = -4, x = 2", explanation: "Check by substituting" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Guided Practice",
        phaseType: "guided_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial-solving",
                equation: "2x² - 8x = 0",
                steps: [
                  { expression: "2x(x - 4) = 0", explanation: "Factor out GCF" },
                  { expression: "2x = 0 → x = 0", explanation: "Set first factor to zero" },
                  { expression: "x - 4 = 0 → x = 4", explanation: "Set second factor to zero" },
                  { expression: "Solutions: x = 0, x = 4", explanation: "Verify both solutions" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "Solve: x² − 5x + 6 = 0",
                    options: ["x = 2, x = 3", "x = -2, x = -3", "x = 1, x = 6", "x = -2, x = 3"],
                    correctIndex: 0,
                  },
                  {
                    question: "Solve: x² − 16 = 0",
                    options: ["x = 4, x = -4", "x = 8, x = -8", "x = 16", "x = 4"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
    ];

    let phasesCreated = 0;
    let activitiesCreated = 0;

    for (const phase of phaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      phasesCreated++;

      for (const section of phase.sections) {
        if (section.sectionType === "activity") {
          const activityContent = section.content as {
            componentKey: string;
            props: Record<string, unknown>;
          };

          const insertedActivityId = await ctx.db.insert("activities", {
            componentKey: activityContent.componentKey,
            displayName: `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: activityContent.props,
            gradingConfig: { autoGrade: true, partialCredit: true },
            createdAt: now,
            updatedAt: now,
          });

          activitiesCreated++;

          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: {
              ...activityContent,
              activityId: insertedActivityId,
            },
            createdAt: now,
          });
        } else {
          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: section.content,
            createdAt: now,
          });
        }
      }
    }

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
