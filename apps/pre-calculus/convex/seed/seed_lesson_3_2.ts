import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_2Result> => {
    const now = Date.now();
    const lessonSlug = "3-2-basic-trig-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Basic Trigonometric Functions",
          slug: lessonSlug,
          description: "Students define sine and cosine using right triangle ratios and understand their connection to periodic phenomena.",
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
          title: "Basic Trigonometric Functions",
          description: "Students define sine and cosine using right triangle ratios and understand their connection to periodic phenomena.",
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
                variant: "compare_functions",
                equations: ["y = sin(x)", "y = cos(x)"],
                title: "Explore Sine and Cosine",
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
              markdown: "## Basic Trigonometric Functions\n\n### Right Triangle Definitions\n\nFor an angle $\\theta$ in a right triangle:\n\n$$\\sin(\\theta) = \\frac{\\text{opposite}}{\\text{hypotenuse}}, \\quad \\cos(\\theta) = \\frac{\\text{adjacent}}{\\text{hypotenuse}}, \\quad \\tan(\\theta) = \\frac{\\text{opposite}}{\\text{adjacent}}$$\n\n### Key Properties\n\n| Property | $\\sin(x)$ | $\\cos(x)$ |\n|----------|-----------|----------|\n| Period | $2\\pi$ | $2\\pi$ |\n| Amplitude | 1 | 1 |\n| Midline | $y = 0$ | $y = 0$ |\n| Max | 1 | 1 |\n| Min | -1 | -1 |\n\n### Phase Shift\n\n$\\cos(x) = \\sin(x + \\frac{\\pi}{2})$ — cosine is sine shifted left by $\\frac{\\pi}{2}$",
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
              markdown: "## Example: Evaluating Trig Functions\n\nEvaluate without a calculator: $\\sin(\\frac{\\pi}{6})$, $\\cos(\\frac{\\pi}{3})$, $\\tan(\\frac{\\pi}{4})$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Trig evaluations",
                steps: [
                  { expression: "sin(π/6) = 1/2", explanation: "From 30-60-90 triangle" },
                  { expression: "cos(π/3) = 1/2", explanation: "From 30-60-90 triangle" },
                  { expression: "tan(π/4) = 1", explanation: "From 45-45-90 triangle" },
                  { expression: "sin(π/3) = √3/2, cos(π/6) = √3/2", explanation: "Common values" },
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
                    question: "$\\sin(\\frac{\\pi}{2}) =$",
                    options: ["0", "1", "-1", "1/2"],
                    correctIndex: 1,
                  },
                  {
                    question: "The period of $f(x) = \\sin(x)$ is:",
                    options: ["π", "2π", "π/2", "4π"],
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
                equation: "y = 2sin(x) + 1",
                title: "Graph a Modified Sine Function",
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
