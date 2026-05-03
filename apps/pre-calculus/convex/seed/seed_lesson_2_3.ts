import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_3Result> => {
    const now = Date.now();
    const lessonSlug = "2-3-exponential-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential Functions",
          slug: lessonSlug,
          description: "Students analyze exponential functions f(x) = a·bˣ including growth, decay, domain, range, and asymptotes.",
          orderIndex: 3,
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
          title: "Exponential Functions",
          description: "Students analyze exponential functions f(x) = a·bˣ including growth, decay, domain, range, and asymptotes.",
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
                equation: "y = 2^x",
                title: "Explore Exponential Functions",
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
              markdown: "## Exponential Functions\n\nAn exponential function has the form $f(x) = a \\cdot b^x$ where $a \\neq 0$, $b > 0$, and $b \\neq 1$.\n\n### Key Properties\n\n- **Domain**: All real numbers $(-\\infty, \\infty)$\n- **Range**: $(0, \\infty)$ if $a > 0$ (or $(-\\infty, 0)$ if $a < 0$)\n- **Horizontal asymptote**: $y = 0$\n- **Y-intercept**: $(0, a)$\n\n### Growth vs. Decay\n\n- $b > 1$: **Exponential growth** (increasing)\n- $0 < b < 1$: **Exponential decay** (decreasing)\n- The base $b$ is the **growth/decay factor**\n- The rate as a percentage: $(b - 1) \\times 100\\%$",
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
              markdown: "## Example: Analyzing an Exponential Function\n\nAnalyze $f(x) = 500 \\cdot (0.8)^x$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = 500 · (0.8)^x",
                steps: [
                  { expression: "a = 500, b = 0.8", explanation: "Identify parameters" },
                  { expression: "0 < b < 1 → exponential decay", explanation: "This is decay" },
                  { expression: "Y-intercept: f(0) = 500", explanation: "At x = 0" },
                  { expression: "Decay rate: (0.8 - 1) × 100% = -20%", explanation: "20% decrease per unit" },
                  { expression: "Domain: all reals; Range: (0, ∞)", explanation: "Domain and range" },
                  { expression: "Horizontal asymptote: y = 0", explanation: "As x → ∞" },
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
                    question: "The function $f(x) = 3 \\cdot 1.05^x$ represents:",
                    options: ["5% decay", "5% growth", "3% growth", "Linear growth"],
                    correctIndex: 1,
                  },
                  {
                    question: "The horizontal asymptote of $f(x) = 2^x$ is:",
                    options: ["x = 0", "y = 0", "y = 1", "y = 2"],
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
                equation: "y = 300 * 0.5^x",
                title: "Graph Exponential Decay",
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
