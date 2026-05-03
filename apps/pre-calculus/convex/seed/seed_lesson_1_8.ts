import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_8Result> => {
    const now = Date.now();
    const lessonSlug = "1-8-rational-functions-zeros";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and Zeros",
          slug: lessonSlug,
          description: "Students find zeros of rational functions by setting the numerator equal to zero and excluding undefined points.",
          orderIndex: 8,
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
          title: "Rational Functions and Zeros",
          description: "Students find zeros of rational functions by setting the numerator equal to zero and excluding undefined points.",
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
                equation: "y = (x^2 - 4)/(x - 1)",
                title: "Explore Zeros of Rational Functions",
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
              markdown: "## Zeros of Rational Functions\n\nFor $R(x) = \\frac{p(x)}{q(x)}$, the zeros occur where $p(x) = 0$ **and** $q(x) \\neq 0$.\n\n### Procedure\n\n1. Set the numerator equal to zero: $p(x) = 0$\n2. Solve for $x$\n3. Check that each solution does not make the denominator zero\n4. If a zero of $p$ is also a zero of $q$, it creates a **hole** instead of an x-intercept\n\n### Key Idea\n\nA rational function $R(x) = \\frac{(x-a)(x-b)}{(x-a)(x-c)}$ has:\n- A **hole** at $x = a$ (common factor)\n- A **zero** at $x = b$ (only in numerator)\n- A **vertical asymptote** at $x = c$ (only in denominator)",
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
              markdown: "## Example: Finding Zeros of a Rational Function\n\nFind the zeros of $f(x) = \\frac{x^2 - 9}{x + 3}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = (x^2 - 9)/(x + 3)",
                steps: [
                  { expression: "Factor: f(x) = (x-3)(x+3)/(x+3)", explanation: "Factor numerator and denominator" },
                  { expression: "x + 3 = 0 → x = -3 creates a hole", explanation: "Common factor, not a zero" },
                  { expression: "After simplifying: f(x) = x - 3 for x ≠ -3", explanation: "Simplified form" },
                  { expression: "x - 3 = 0 → x = 3", explanation: "Set simplified numerator to 0" },
                  { expression: "Zero at x = 3; hole at x = -3", explanation: "Identify features" },
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
                    question: "The zeros of $R(x) = \\frac{(x-2)(x+1)}{x-2}$ are:",
                    options: ["x = 2 only", "x = -1 only", "x = 2 and x = -1", "No zeros"],
                    correctIndex: 1,
                  },
                  {
                    question: "If a factor appears in both the numerator and denominator, it creates:",
                    options: ["A zero", "A vertical asymptote", "A hole", "A horizontal asymptote"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "g(x) = (x^2 - x - 6)/(x^2 - 9)",
                steps: [
                  { expression: "Numerator: x^2 - x - 6 = (x-3)(x+2)", explanation: "Factor numerator" },
                  { expression: "Denominator: x^2 - 9 = (x-3)(x+3)", explanation: "Factor denominator" },
                  { expression: "Common factor (x-3) creates hole at x = 3", explanation: "Identify the hole" },
                  { expression: "Numerator zero: x = -2 (not in denominator)", explanation: "Zero at x = -2" },
                  { expression: "Zero at x = -2; hole at x = 3", explanation: "Final answer" },
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
