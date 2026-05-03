import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_4Result> => {
    const now = Date.now();
    const lessonSlug = "3-4-graphs-transformations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Graphs of Trigonometric Functions",
          slug: lessonSlug,
          description: "Students graph sine, cosine, and tangent functions and identify key features of each.",
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
          title: "Graphs of Trigonometric Functions",
          description: "Students graph sine, cosine, and tangent functions and identify key features of each.",
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
                title: "Explore Tangent Graph",
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
              markdown: "## Graphs of Trig Functions\n\n### $y = \\sin(x)$\n- Starts at origin, rises to max at $\\frac{\\pi}{2}$\n- Period: $2\\pi$\n- Odd function: $\\sin(-x) = -\\sin(x)$\n\n### $y = \\cos(x)$\n- Starts at maximum (1, 0)\n- Period: $2\\pi$\n- Even function: $\\cos(-x) = \\cos(x)$\n\n### $y = \\tan(x)$\n- Period: $\\pi$\n- Vertical asymptotes at $x = \\frac{\\pi}{2} + n\\pi$\n- Range: $(-\\infty, \\infty)$\n- Odd function, passes through origin\n\n### Key Differences\n\n| Feature | sin | cos | tan |\n|---------|-----|-----|-----|\n| Period | $2\\pi$ | $2\\pi$ | $\\pi$ |\n| Range | $[-1, 1]$ | $[-1, 1]$ | $(-\\infty, \\infty)$ |\n| Asymptotes | None | None | $\\frac{\\pi}{2} + n\\pi$ |",
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
              markdown: "## Example: Graphing $y = 2\\sin(x) - 1$\n\nIdentify all key features.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "y = 2sin(x) - 1",
                steps: [
                  { expression: "Amplitude = |2| = 2", explanation: "From coefficient" },
                  { expression: "Midline: y = -1", explanation: "Vertical shift" },
                  { expression: "Period = 2π (unchanged)", explanation: "No horizontal change" },
                  { expression: "Max = -1 + 2 = 1", explanation: "Maximum value" },
                  { expression: "Min = -1 - 2 = -3", explanation: "Minimum value" },
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
                    question: "The function $y = \\cos(x)$ is:",
                    options: ["Odd", "Even", "Neither", "Both"],
                    correctIndex: 1,
                  },
                  {
                    question: "The period of $y = \\tan(x)$ is:",
                    options: ["2π", "π", "π/2", "4π"],
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
                equation: "y = 3cos(x) + 2",
                title: "Graph a Cosine Function",
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
