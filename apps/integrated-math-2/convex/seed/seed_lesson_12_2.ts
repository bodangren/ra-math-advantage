import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson12_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson12_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson12_2Result> => {
    const now = Date.now();
    const lessonSlug = "12-2-factoring-quadratics";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 12,
          title: "Factoring Quadratics",
          slug: lessonSlug,
          description: "Students factor quadratic expressions to find zeros and solve quadratic equations.",
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
          title: "Factoring Quadratics",
          description: "Students factor quadratic expressions to find zeros and solve quadratic equations.",
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
              markdown: "## Explore: Working Backwards\n\nYou know (x + 4)(x − 1) = x² + 3x − 4.\n\nGiven x² + 3x − 4, how can you find the two binomials? What numbers multiply to −4 and add to 3?",
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
                    question: "To factor x² + bx + c, find two numbers that multiply to c and add to:",
                    options: ["b", "c", "b + c", "b - c"],
                    correctIndex: 0,
                  },
                  {
                    question: "The zeros of x² - 5x + 6 = 0 are:",
                    options: ["2 and 3", "-2 and -3", "2 and -3", "-2 and 3"],
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
              markdown: "## Factoring Quadratics\n\n### Method 1: Simple Trinomials (a = 1)\nx² + bx + c = (x + m)(x + n) where m × n = c and m + n = b\n\n### Method 2: AC Method (a ≠ 1)\nMultiply a × c, find factors that add to b, then factor by grouping.\n\n### Method 3: Special Forms\n- Difference of squares: a² − b² = (a + b)(a − b)\n- Perfect square trinomial: a² ± 2ab + b² = (a ± b)²\n\n### Connection to Graphs\nThe zeros of the quadratic (where y = 0) are the x-intercepts of the parabola.",
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
              markdown: "## Example: Factor and Find Zeros\n\nFactor x² + 7x + 12 and find the zeros.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring-quadratic",
                equation: "x² + 7x + 12",
                steps: [
                  { expression: "Find factors of 12 that add to 7", explanation: "c = 12, b = 7" },
                  { expression: "3 × 4 = 12 and 3 + 4 = 7", explanation: "The pair is 3 and 4" },
                  { expression: "(x + 3)(x + 4)", explanation: "Write as binomial product" },
                  { expression: "x + 3 = 0 → x = -3", explanation: "First zero" },
                  { expression: "x + 4 = 0 → x = -4", explanation: "Second zero" },
                  { expression: "Zeros: x = -3, x = -4", explanation: "X-intercepts of the parabola" },
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
                    question: "Factor: x² - 9x + 20",
                    options: ["(x - 4)(x - 5)", "(x + 4)(x + 5)", "(x - 2)(x - 10)", "(x + 4)(x - 5)"],
                    correctIndex: 0,
                  },
                  {
                    question: "The zeros of x² - 3x - 10 = 0 are:",
                    options: ["x = 5, x = -2", "x = -5, x = 2", "x = 5, x = 2", "x = -5, x = -2"],
                    correctIndex: 0,
                  },
                  {
                    question: "Factor: 2x² + 6x + 4",
                    options: ["2(x + 1)(x + 2)", "2(x + 2)(x + 3)", "(2x + 2)(x + 2)", "2(x² + 3x + 2)"],
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
                    question: "Factor: x² + 2x - 24",
                    options: ["(x + 6)(x - 4)", "(x - 6)(x + 4)", "(x + 8)(x - 3)", "(x - 8)(x + 3)"],
                    correctIndex: 0,
                  },
                  {
                    question: "The x-intercepts of y = x² - x - 6 are:",
                    options: ["x = 3, x = -2", "x = -3, x = 2", "x = 3, x = 2", "x = -3, x = -2"],
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
