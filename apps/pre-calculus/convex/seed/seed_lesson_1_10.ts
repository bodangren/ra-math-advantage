import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_10Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_10 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_10Result> => {
    const now = Date.now();
    const lessonSlug = "1-10-rational-functions-holes";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and Holes",
          slug: lessonSlug,
          description: "Students distinguish between holes and vertical asymptotes in rational functions by identifying common factors.",
          orderIndex: 10,
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
          title: "Rational Functions and Holes",
          description: "Students distinguish between holes and vertical asymptotes in rational functions by identifying common factors.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "y = (x^2 - 1)/(x - 1)",
                title: "Explore Holes in Rational Functions",
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
              markdown: "## Holes in Rational Functions\n\nA **hole** (removable discontinuity) occurs when a factor appears in both the numerator and denominator.\n\n### Hole vs. Vertical Asymptote\n\n| Feature | Hole | Vertical Asymptote |\n|---------|------|--------------------|\n| Cause | Common factor in num/den | Factor only in denominator |\n| Behavior | Function undefined at one point | Function approaches ±∞ |\n| After simplification | Disappears (point missing) | Still present |\n\n### Finding the Hole\n\nFor $R(x) = \\frac{(x-a) \\cdot p(x)}{(x-a) \\cdot q(x)}$:\n1. The hole is at $x = a$\n2. The $y$-coordinate of the hole is found by evaluating the simplified function at $x = a$",
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
              markdown: "## Example: Finding Holes\n\nFind the hole in $f(x) = \\frac{x^2 + 5x + 6}{x^2 - 4}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = (x^2 + 5x + 6)/(x^2 - 4)",
                steps: [
                  { expression: "Numerator: (x + 2)(x + 3)", explanation: "Factor numerator" },
                  { expression: "Denominator: (x + 2)(x - 2)", explanation: "Factor denominator" },
                  { expression: "Common factor: (x + 2)", explanation: "Identify cancellation" },
                  { expression: "Hole at x = -2", explanation: "Common factor gives hole" },
                  { expression: "Simplified: (x + 3)/(x - 2)", explanation: "Cancel common factor" },
                  { expression: "y = (-2 + 3)/(-2 - 2) = 1/(-4) = -1/4", explanation: "Find y-coordinate of hole" },
                  { expression: "Hole at (-2, -1/4)", explanation: "Final answer" },
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "A hole occurs when a factor appears in:",
                    options: ["Only the numerator", "Only the denominator", "Both numerator and denominator", "Neither"],
                    correctIndex: 2,
                  },
                  {
                    question: "To find the y-coordinate of a hole at x = a, you should:",
                    options: ["Evaluate the original function", "Evaluate the simplified function", "Set x = 0", "Find the limit"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "g(x) = (x^3 - x)/(x^2 - 1)",
                steps: [
                  { expression: "Numerator: x(x^2 - 1) = x(x-1)(x+1)", explanation: "Factor numerator" },
                  { expression: "Denominator: (x - 1)(x + 1)", explanation: "Factor denominator" },
                  { expression: "Common factors: (x-1)(x+1)", explanation: "Two common factors" },
                  { expression: "Holes at x = 1 and x = -1", explanation: "Two holes" },
                  { expression: "At x = 1: y = 1/(empty) ... g simplified = x", explanation: "Simplified: g(x) = x" },
                  { expression: "Hole at (1, 1) and (-1, -1)", explanation: "Both hole coordinates" },
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
