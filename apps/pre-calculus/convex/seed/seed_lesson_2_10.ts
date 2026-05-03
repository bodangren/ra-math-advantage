import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_10Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_10 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_10Result> => {
    const now = Date.now();
    const lessonSlug = "2-10-logarithmic-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Functions",
          slug: lessonSlug,
          description: "Students graph logarithmic functions, identify domain, range, asymptotes, and understand the relationship to exponential functions.",
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
          title: "Logarithmic Functions",
          description: "Students graph logarithmic functions, identify domain, range, asymptotes, and understand the relationship to exponential functions.",
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
                equation: "y = log(x)",
                title: "Explore Logarithmic Functions",
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
              markdown: "## Logarithmic Functions\n\n### Properties of $f(x) = \\log_b(x)$\n\n- **Domain**: $(0, \\infty)$\n- **Range**: $(-\\infty, \\infty)$\n- **Vertical asymptote**: $x = 0$\n- **X-intercept**: $(1, 0)$\n- **Passes through**: $(b, 1)$\n\n### Relationship to Exponential\n\n$y = \\log_b(x)$ and $y = b^x$ are **inverse functions**:\n- $\\log_b(b^x) = x$\n- $b^{\\log_b(x)} = x$ for $x > 0$\n\n### Transformed Logarithmic Functions\n\n$f(x) = a \\cdot \\log_b(x - h) + k$\n- Vertical asymptote: $x = h$\n- Domain: $(h, \\infty)$\n- Point $(h+1, k)$ is on the graph",
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
              markdown: "## Example: Graphing a Logarithmic Function\n\nGraph $f(x) = \\log_2(x - 3)$ and identify key features.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "f(x) = log₂(x - 3)",
                steps: [
                  { expression: "Vertical asymptote: x = 3", explanation: "From (x - 3) = 0" },
                  { expression: "Domain: (3, ∞)", explanation: "x - 3 > 0" },
                  { expression: "X-intercept: x - 3 = 1 → x = 4, point (4, 0)", explanation: "Set f(x) = 0" },
                  { expression: "Point (5, 1): f(5) = log₂(2) = 1", explanation: "Find another point" },
                  { expression: "Point (7, 2): f(7) = log₂(4) = 2", explanation: "Third point" },
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
                    question: "The domain of $f(x) = \\ln(x + 5)$ is:",
                    options: ["x > 5", "x > -5", "x > 0", "All real numbers"],
                    correctIndex: 1,
                  },
                  {
                    question: "The vertical asymptote of $f(x) = \\log_3(x - 2)$ is:",
                    options: ["x = 0", "x = 2", "x = 3", "x = -2"],
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
                equation: "y = 2 * log(x - 1) + 1",
                title: "Graph Transformed Log Function",
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
