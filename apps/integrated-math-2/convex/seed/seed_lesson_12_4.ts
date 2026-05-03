import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson12_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson12_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson12_4Result> => {
    const now = Date.now();
    const lessonSlug = "12-4-quadratic-formula";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 12,
          title: "Quadratic Formula",
          slug: lessonSlug,
          description: "Students use the quadratic formula and discriminant to solve and analyze quadratic equations.",
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
          title: "Quadratic Formula",
          description: "Students use the quadratic formula and discriminant to solve and analyze quadratic equations.",
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
              markdown: "## Explore: A Universal Solver\n\nWhen x² + bx + c = 0 doesn't factor nicely, what can we do?\n\nThe quadratic formula works for ANY quadratic equation. Can you guess what happens when b² − 4ac is negative?",
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
                    question: "The quadratic formula is:",
                    options: ["x = (-b ± √(b²-4ac))/(2a)", "x = (b ± √(b²-4ac))/(2a)", "x = (-b ± √(b²+4ac))/(2a)", "x = (-b ± √(b²-4ac))/a"],
                    correctIndex: 0,
                  },
                  {
                    question: "The expression b² − 4ac is called the:",
                    options: ["Determinant", "Discriminant", "Derivative", "Denominator"],
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
              markdown: "## The Quadratic Formula\n\n### Formula\nFor ax² + bx + c = 0:\nx = (−b ± √(b² − 4ac)) / (2a)\n\n### The Discriminant (b² − 4ac)\n- **Positive** (> 0): Two distinct real solutions\n- **Zero** (= 0): One repeated real solution\n- **Negative** (< 0): No real solutions (two complex solutions)\n\n### When to Use\n- When factoring is difficult or impossible\n- Always works for any quadratic equation",
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
              markdown: "## Example: Use the Quadratic Formula\n\nSolve 2x² + 3x − 5 = 0.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "quadratic-formula",
                equation: "2x² + 3x - 5 = 0",
                steps: [
                  { expression: "a = 2, b = 3, c = -5", explanation: "Identify coefficients" },
                  { expression: "b² - 4ac = 9 - 4(2)(-5) = 9 + 40 = 49", explanation: "Calculate discriminant" },
                  { expression: "x = (-3 ± √49) / (2 × 2)", explanation: "Substitute into formula" },
                  { expression: "x = (-3 ± 7) / 4", explanation: "Simplify √49 = 7" },
                  { expression: "x = (-3 + 7)/4 = 1 or x = (-3 - 7)/4 = -5/2", explanation: "Two solutions" },
                  { expression: "Solutions: x = 1, x = -5/2", explanation: "Verify by substituting" },
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
                problemType: "discriminant-analysis",
                equation: "x² - 4x + 4 = 0",
                steps: [
                  { expression: "a = 1, b = -4, c = 4", explanation: "Identify coefficients" },
                  { expression: "Discriminant = 16 - 16 = 0", explanation: "b² - 4ac = (-4)² - 4(1)(4)" },
                  { expression: "One repeated real solution", explanation: "Discriminant = 0" },
                  { expression: "x = 4/2 = 2", explanation: "Solve using formula" },
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
                    question: "If the discriminant is negative, the equation has:",
                    options: ["Two real solutions", "One real solution", "No real solutions", "Infinitely many solutions"],
                    correctIndex: 2,
                  },
                  {
                    question: "For x² + 2x + 5 = 0, the discriminant is:",
                    options: ["-16", "16", "24", "-24"],
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
