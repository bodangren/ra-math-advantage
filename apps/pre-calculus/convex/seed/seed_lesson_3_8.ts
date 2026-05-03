import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_8Result> => {
    const now = Date.now();
    const lessonSlug = "3-8-tangent-function";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Tangent Function",
          slug: lessonSlug,
          description: "Students graph and analyze the tangent function, its asymptotes, period, and transformations.",
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
          title: "Tangent Function",
          description: "Students graph and analyze the tangent function, its asymptotes, period, and transformations.",
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
                equation: "y = tan(x)",
                title: "Explore Tangent Function",
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
              markdown: "## The Tangent Function\n\n### Definition\n$$\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}$$\n\n### Properties of $y = \\tan(x)$\n\n- **Domain**: All reals except $x = \\frac{\\pi}{2} + n\\pi$\n- **Range**: $(-\\infty, \\infty)$\n- **Period**: $\\pi$\n- **Vertical asymptotes**: $x = \\frac{\\pi}{2} + n\\pi$\n- **X-intercepts**: $x = n\\pi$\n- **Odd function**: $\\tan(-x) = -\\tan(x)$\n\n### Transformed Tangent\n$$y = A\\tan(B(x - C)) + D$$\n- Period: $\\frac{\\pi}{|B|}$\n- Vertical asymptotes shifted by $C$\n- No amplitude (unbounded range)",
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
              markdown: "## Example: Graphing Transformed Tangent\n\nGraph $f(x) = 2\\tan\\left(\\frac{x}{2}\\right)$ and find the period and asymptotes.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "f(x) = 2tan(x/2)",
                steps: [
                  { expression: "B = 1/2, Period = π/(1/2) = 2π", explanation: "Find period" },
                  { expression: "Asymptotes where x/2 = π/2 + nπ", explanation: "Set argument to π/2 + nπ" },
                  { expression: "x = π + 2nπ", explanation: "Solve for x" },
                  { expression: "X-intercepts where x/2 = nπ → x = 2nπ", explanation: "Find zeros" },
                  { expression: "Stretch factor A = 2 (steeper curve)", explanation: "Vertical stretch" },
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
                    question: "The period of $y = \\tan(3x)$ is:",
                    options: ["3π", "π/3", "2π/3", "π"],
                    correctIndex: 1,
                  },
                  {
                    question: "Vertical asymptotes of $y = \\tan(x)$ occur at:",
                    options: ["x = nπ", "x = π/2 + nπ", "x = 2nπ", "x = π + nπ"],
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
                equation: "y = tan(x - pi/4)",
                title: "Graph Phase-Shifted Tangent",
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
