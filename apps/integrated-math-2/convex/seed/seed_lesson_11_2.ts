import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson11_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson11_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson11_2Result> => {
    const now = Date.now();
    const lessonSlug = "11-2-adding-subtracting-polynomials";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 11,
          title: "Adding and Subtracting Polynomials",
          slug: lessonSlug,
          description: "Students add and subtract polynomials by combining like terms.",
          orderIndex: 2,
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
          title: "Adding and Subtracting Polynomials",
          description: "Students add and subtract polynomials by combining like terms.",
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
              markdown: "## Explore: Combining Like Terms\n\nConsider: (3x² + 2x) + (5x² − 4x).\n\nWhich terms can you combine? Why can't you combine x² terms with x terms?",
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
                    question: "Like terms have:",
                    options: ["The same coefficient", "The same variable with the same exponent", "The same number of terms", "The same sign"],
                    correctIndex: 1,
                  },
                  {
                    question: "3x² and 5x² are like terms. Their sum is:",
                    options: ["8x⁴", "8x²", "15x²", "8x²⁰"],
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
              markdown: "## Adding and Subtracting Polynomials\n\n### Like Terms\nTerms with the same variable(s) raised to the same power(s).\n- 3x² and −5x²: like terms\n- 3x² and 3x³: NOT like terms\n\n### Adding Polynomials\nCombine like terms:\n(2x³ + 3x²) + (4x³ − x²) = 6x³ + 2x²\n\n### Subtracting Polynomials\nDistribute the negative, then combine:\n(2x³ + 3x²) − (4x³ − x²) = 2x³ + 3x² − 4x³ + x² = −2x³ + 4x²",
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
              markdown: "## Example: Subtract Polynomials\n\nSubtract: (4x³ − 2x² + 5) − (x³ + 3x² − 1).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial-operation",
                equation: "(4x³ - 2x² + 5) - (x³ + 3x² - 1)",
                steps: [
                  { expression: "4x³ - 2x² + 5 - x³ - 3x² + 1", explanation: "Distribute the negative sign" },
                  { expression: "(4x³ - x³) + (-2x² - 3x²) + (5 + 1)", explanation: "Group like terms" },
                  { expression: "3x³ - 5x² + 6", explanation: "Combine like terms" },
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "(2x² + 3x) + (5x² − 4x) =",
                    options: ["7x² - x", "7x² + 7x", "7x⁴ - x", "7x² - x²"],
                    correctIndex: 0,
                  },
                  {
                    question: "(6x³ + 2x) − (4x³ + x) =",
                    options: ["2x³ + x", "2x³ + 3x", "10x³ + 3x", "2x⁶ + x"],
                    correctIndex: 0,
                  },
                  {
                    question: "When subtracting (3x − 2), you rewrite it as:",
                    options: ["3x - 2", "-3x + 2", "-3x - 2", "3x + 2"],
                    correctIndex: 1,
                  },
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
                    question: "(x² + 4x + 3) + (2x² − x − 1) =",
                    options: ["3x² + 3x + 2", "3x² + 5x + 2", "3x⁴ + 3x² + 2", "3x² + 3x + 4"],
                    correctIndex: 0,
                  },
                  {
                    question: "(5x² − 3) − (2x² + 1) =",
                    options: ["3x² - 4", "3x² - 2", "7x² - 2", "3x² + 4"],
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
