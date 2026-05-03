import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson11_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson11_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson11_5Result> => {
    const now = Date.now();
    const lessonSlug = "11-5-factoring-techniques";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 11,
          title: "Factoring Techniques",
          slug: lessonSlug,
          description: "Students factor polynomials using GCF, grouping, and trinomial factoring.",
          orderIndex: 5,
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
          title: "Factoring Techniques",
          description: "Students factor polynomials using GCF, grouping, and trinomial factoring.",
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
              markdown: "## Explore: Reverse Multiplication\n\nMultiplying gives: (x + 3)(x + 2) = x² + 5x + 6.\n\nFactoring is the reverse: x² + 5x + 6 = (x + 3)(x + 2).\n\nWhat two numbers multiply to 6 and add to 5?",
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
                    question: "The GCF of 6x² and 9x is:",
                    options: ["3x", "3", "6x", "18x²"],
                    correctIndex: 0,
                  },
                  {
                    question: "To factor x² + 7x + 12, find two numbers that multiply to 12 and add to:",
                    options: ["12", "7", "19", "5"],
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
              markdown: "## Factoring Techniques\n\n### 1. Factor Out GCF\n6x³ + 9x² = 3x²(2x + 3)\n\n### 2. Factor Trinomials (ax² + bx + c)\nFind two numbers that multiply to ac and add to b.\nx² + 5x + 6: factors of 6 that add to 5 → 2 and 3\n= (x + 2)(x + 3)\n\n### 3. Factor by Grouping\nFor 4 terms: group into pairs, factor each pair, factor out common binomial.\n\n### 4. Special Patterns\n- Difference of squares: a² − b² = (a + b)(a − b)\n- Perfect square trinomial: a² ± 2ab + b² = (a ± b)²",
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
              markdown: "## Example: Factor a Trinomial\n\nFactor x² − 2x − 15.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "x² - 2x - 15",
                steps: [
                  { expression: "ac = 1 × (-15) = -15", explanation: "Product of first and last coefficients" },
                  { expression: "Find factors of -15 that add to -2", explanation: "b = -2" },
                  { expression: "-5 × 3 = -15 and -5 + 3 = -2", explanation: "The pair is -5 and 3" },
                  { expression: "(x - 5)(x + 3)", explanation: "Write as product of binomials" },
                  { expression: "Check: x² + 3x - 5x - 15 = x² - 2x - 15 ✓", explanation: "Verify by expanding" },
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
                    question: "Factor: x² + 8x + 15",
                    options: ["(x + 3)(x + 5)", "(x + 1)(x + 15)", "(x - 3)(x - 5)", "(x + 4)(x + 4)"],
                    correctIndex: 0,
                  },
                  {
                    question: "Factor: 4x² - 9",
                    options: ["(2x + 3)(2x - 3)", "(4x + 1)(x - 9)", "(2x - 3)²", "(4x - 9)(x + 1)"],
                    correctIndex: 0,
                  },
                  {
                    question: "Factor out GCF: 12x³ + 8x²",
                    options: ["4x²(3x + 2)", "2x(6x² + 4x)", "4x(3x² + 2x)", "x²(12x + 8)"],
                    correctIndex: 0,
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
                    question: "Factor: x² + x − 20",
                    options: ["(x + 5)(x - 4)", "(x - 5)(x + 4)", "(x + 10)(x - 2)", "(x - 10)(x + 2)"],
                    correctIndex: 0,
                  },
                  {
                    question: "Factor: x² − 6x + 9",
                    options: ["(x - 3)²", "(x + 3)²", "(x - 3)(x + 3)", "(x - 9)(x + 1)"],
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
