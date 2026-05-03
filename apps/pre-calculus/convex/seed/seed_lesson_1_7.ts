import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_7Result> => {
    const now = Date.now();
    const lessonSlug = "1-7-rational-functions-end-behavior";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and End Behavior",
          slug: lessonSlug,
          description: "Students determine horizontal and oblique asymptotes of rational functions by comparing degrees of numerator and denominator.",
          orderIndex: 7,
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
          title: "Rational Functions and End Behavior",
          description: "Students determine horizontal and oblique asymptotes of rational functions by comparing degrees of numerator and denominator.",
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
                equation: "y = (2x + 1)/(x - 3)",
                title: "Explore Rational Function End Behavior",
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
              markdown: "## End Behavior of Rational Functions\n\nA rational function is $R(x) = \\frac{p(x)}{q(x)}$ where $p$ and $q$ are polynomials.\n\n### Horizontal Asymptote Rules\n\nLet $n = \\deg(p)$ and $m = \\deg(q)$:\n\n- **$n < m$**: Horizontal asymptote at $y = 0$\n- **$n = m$**: Horizontal asymptote at $y = \\frac{a_n}{b_m}$ (ratio of leading coefficients)\n- **$n > m$**: No horizontal asymptote (check for oblique/curvilinear asymptote)\n\n### Oblique Asymptote\n\nWhen $n = m + 1$, the function has an oblique (slant) asymptote found by polynomial long division.",
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
              markdown: "## Example: Finding Horizontal Asymptotes\n\nFind the horizontal asymptote of $f(x) = \\frac{3x^2 + 1}{x^2 - 4}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = (3x^2 + 1)/(x^2 - 4)",
                steps: [
                  { expression: "Numerator degree: 2", explanation: "Identify n = 2" },
                  { expression: "Denominator degree: 2", explanation: "Identify m = 2" },
                  { expression: "n = m, so horizontal asymptote at y = 3/1", explanation: "Ratio of leading coefficients" },
                  { expression: "Horizontal asymptote: y = 3", explanation: "The function approaches 3 as x → ±∞" },
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
                    question: "The horizontal asymptote of $f(x) = \\frac{5x}{x^2 + 1}$ is:",
                    options: ["y = 5", "y = 0", "y = 1", "No horizontal asymptote"],
                    correctIndex: 1,
                  },
                  {
                    question: "When the numerator degree exceeds the denominator degree by 1, the function has:",
                    options: ["A horizontal asymptote", "An oblique asymptote", "No asymptote", "A vertical asymptote only"],
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
                equation: "y = (x^2 + 1)/(x - 1)",
                title: "Find the Oblique Asymptote",
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
