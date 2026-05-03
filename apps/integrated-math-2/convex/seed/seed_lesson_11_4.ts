import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson11_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson11_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson11_4Result> => {
    const now = Date.now();
    const lessonSlug = "11-4-special-products";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 11,
          title: "Special Products",
          slug: lessonSlug,
          description: "Students recognize and apply patterns for perfect square trinomials and difference of squares.",
          orderIndex: 4,
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
          title: "Special Products",
          description: "Students recognize and apply patterns for perfect square trinomials and difference of squares.",
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
              markdown: "## Explore: Patterns in Products\n\nMultiply these and look for patterns:\n- (x + 1)(x + 1) = ?\n- (x + 1)(x − 1) = ?\n- (x − 1)(x − 1) = ?\n\nWhat patterns do you see? Can you predict the results without multiplying?",
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
                    question: "(x + 3)² =",
                    options: ["x² + 9", "x² + 6x + 9", "x² + 3x + 9", "x² + 6x + 6"],
                    correctIndex: 1,
                  },
                  {
                    question: "(x + 5)(x − 5) =",
                    options: ["x² - 25", "x² + 25", "x² - 10x + 25", "x² + 10x - 25"],
                    correctIndex: 0,
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
              markdown: "## Special Products\n\n### Perfect Square Trinomials\n(a + b)² = a² + 2ab + b²\n(a − b)² = a² − 2ab + b²\n\n### Difference of Squares\n(a + b)(a − b) = a² − b²\n\n### How to Recognize\n- Perfect square trinomial: first and last terms are perfect squares, middle term is 2 × product of square roots\n- Difference of squares: two binomials with same terms but opposite signs",
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
              markdown: "## Example: Apply Special Products\n\nExpand (2x − 3)².",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "special-products",
                equation: "(2x - 3)²",
                steps: [
                  { expression: "(a - b)² = a² - 2ab + b²", explanation: "Identify pattern: a = 2x, b = 3" },
                  { expression: "a² = (2x)² = 4x²", explanation: "Square the first term" },
                  { expression: "2ab = 2(2x)(3) = 12x", explanation: "Double the product" },
                  { expression: "b² = 3² = 9", explanation: "Square the last term" },
                  { expression: "4x² - 12x + 9", explanation: "Combine with correct signs" },
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
                    question: "(x + 7)² =",
                    options: ["x² + 49", "x² + 14x + 49", "x² + 7x + 49", "x² + 14x + 14"],
                    correctIndex: 1,
                  },
                  {
                    question: "(3x + 4)(3x − 4) =",
                    options: ["9x² - 16", "9x² + 16", "9x² - 24x + 16", "6x² - 16"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which is NOT a perfect square trinomial?",
                    options: ["x² + 6x + 9", "x² + 4x + 4", "x² + 5x + 6", "x² - 10x + 25"],
                    correctIndex: 2,
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
                    question: "(5x − 2)² =",
                    options: ["25x² - 20x + 4", "25x² - 4", "25x² + 20x + 4", "25x² - 10x + 4"],
                    correctIndex: 0,
                  },
                  {
                    question: "(4x + 1)(4x − 1) =",
                    options: ["16x² - 1", "16x² + 1", "8x² - 1", "16x² - 8x + 1"],
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
