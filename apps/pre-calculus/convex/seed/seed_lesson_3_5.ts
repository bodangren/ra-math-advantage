import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_5Result> => {
    const now = Date.now();
    const lessonSlug = "3-5-sinusoidal-transformations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sinusoidal Transformations",
          slug: lessonSlug,
          description: "Students apply amplitude, period, phase shift, and vertical shift transformations to sinusoidal functions.",
          orderIndex: 5,
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
          title: "Sinusoidal Transformations",
          description: "Students apply amplitude, period, phase shift, and vertical shift transformations to sinusoidal functions.",
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
                equation: "y = 3sin(2(x - pi/4)) + 1",
                title: "Explore Sinusoidal Transformations",
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
              markdown: "## Sinusoidal Transformations\n\n### General Form\n$$y = A\\sin(B(x - C)) + D$$\n\n### Parameters\n\n- **$A$**: Amplitude = $|A|$\n  - If $A < 0$: reflection over the midline\n- **$B$**: Determines period: $T = \\frac{2\\pi}{|B|}$\n- **$C$**: Phase shift (horizontal shift)\n  - $C > 0$: shift right\n  - $C < 0$: shift left\n- **$D$**: Vertical shift (midline)\n\n### Same for Cosine\n$$y = A\\cos(B(x - C)) + D$$\n\n### Reading from a Graph\n\n1. Find max and min → get amplitude and midline\n2. Measure one full cycle → get period → find $B$\n3. Locate starting point → get phase shift $C$",
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
              markdown: "## Example: Write the Equation\n\nA sinusoidal function has max 7, min 1, period $\\pi$, and a maximum at $x = 0$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "y = A cos(B(x - C)) + D",
                steps: [
                  { expression: "Amplitude A = (7-1)/2 = 3", explanation: "From max and min" },
                  { expression: "Midline D = (7+1)/2 = 4", explanation: "Average" },
                  { expression: "Period = π, so B = 2π/π = 2", explanation: "Find B" },
                  { expression: "Max at x = 0 → cosine with C = 0", explanation: "Phase shift" },
                  { expression: "y = 3cos(2x) + 4", explanation: "Write equation" },
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
                    question: "The period of $y = 4\\sin(3x)$ is:",
                    options: ["2π/3", "3π", "4π", "π/3"],
                    correctIndex: 0,
                  },
                  {
                    question: "In $y = 2\\cos(x - \\pi/3) + 5$, the phase shift is:",
                    options: ["π/3 left", "π/3 right", "5 right", "2 right"],
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
                equation: "y = -2cos(3(x + pi/6)) - 1",
                title: "Graph a Transformed Cosine",
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
