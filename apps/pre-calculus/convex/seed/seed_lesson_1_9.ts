import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_9Result> => {
    const now = Date.now();
    const lessonSlug = "1-9-rational-functions-vertical-asymptotes";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and Vertical Asymptotes",
          slug: lessonSlug,
          description: "Students identify vertical asymptotes and analyze the behavior of rational functions near them.",
          orderIndex: 9,
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
          title: "Rational Functions and Vertical Asymptotes",
          description: "Students identify vertical asymptotes and analyze the behavior of rational functions near them.",
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
                equation: "y = 1/(x - 2)",
                title: "Explore Vertical Asymptotes",
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
              markdown: "## Vertical Asymptotes of Rational Functions\n\nA **vertical asymptote** occurs at $x = a$ if the denominator is zero at $x = a$ and the numerator is nonzero.\n\n### How to Find Vertical Asymptotes\n\n1. Factor numerator and denominator completely\n2. Cancel common factors (these create holes, not asymptotes)\n3. Set the remaining denominator equal to zero\n4. Solve — each solution is a vertical asymptote\n\n### Behavior Near Vertical Asymptotes\n\nAs $x$ approaches a vertical asymptote from either side, $|f(x)| \\to \\infty$. The sign of $f(x)$ on each side depends on the signs of the numerator and denominator.",
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
              markdown: "## Example: Finding Vertical Asymptotes\n\nFind the vertical asymptotes of $f(x) = \\frac{x + 1}{x^2 - 5x + 6}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = (x+1)/(x^2 - 5x + 6)",
                steps: [
                  { expression: "Factor denominator: x^2 - 5x + 6 = (x-2)(x-3)", explanation: "Factor" },
                  { expression: "Numerator x + 1 has no common factors with denominator", explanation: "No cancellation" },
                  { expression: "(x - 2)(x - 3) = 0 → x = 2 or x = 3", explanation: "Set denominator to zero" },
                  { expression: "Vertical asymptotes at x = 2 and x = 3", explanation: "Both are vertical asymptotes" },
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
                    question: "Vertical asymptotes of $f(x) = \\frac{1}{x^2 - 4}$:",
                    options: ["x = 2 only", "x = -2 only", "x = ±2", "x = 0"],
                    correctIndex: 2,
                  },
                  {
                    question: "Near a vertical asymptote, the function value:",
                    options: ["Approaches 0", "Approaches infinity", "Is undefined", "Is constant"],
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
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "y = (x^2 + 1)/(x^2 - x - 6)",
                title: "Identify Vertical Asymptotes",
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
