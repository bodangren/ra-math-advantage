import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_1Result> => {
    const now = Date.now();
    const lessonSlug = "3-1-periodic-phenomena";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Periodic Phenomena",
          slug: lessonSlug,
          description: "Students identify periodic phenomena in real life and define period, amplitude, and midline.",
          orderIndex: 1,
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
          title: "Periodic Phenomena",
          description: "Students identify periodic phenomena in real life and define period, amplitude, and midline.",
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
                equation: "y = sin(x)",
                title: "Explore Periodic Patterns",
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
              markdown: "## Periodic Phenomena\n\n### What Makes Something Periodic?\n\nA phenomenon is **periodic** if it repeats at regular intervals.\n\n### Key Vocabulary\n\n- **Period**: The horizontal distance for one complete cycle\n- **Amplitude**: Half the distance between the maximum and minimum values\n$$A = \\frac{\\text{max} - \\text{min}}{2}$$\n- **Midline**: The horizontal line halfway between max and min\n$$y = \\frac{\\text{max} + \\text{min}}{2}$$\n- **Frequency**: Number of cycles per unit time ($f = 1/T$)\n\n### Real-World Examples\n\n- Tides, seasons, day/night cycle\n- Heartbeats, breathing\n- Sound waves, light waves\n- Rotating wheels, pendulums",
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
              markdown: "## Example: Identifying Periodic Features\n\nThe temperature in a city varies between 30°F and 80°F over a 12-month cycle. Find the amplitude, midline, and period.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Temperature model",
                steps: [
                  { expression: "Max = 80, Min = 30", explanation: "Given values" },
                  { expression: "Amplitude = (80 - 30)/2 = 25", explanation: "Half the range" },
                  { expression: "Midline = (80 + 30)/2 = 55", explanation: "Average of max and min" },
                  { expression: "Period = 12 months", explanation: "One full cycle" },
                  { expression: "Model: T(m) = 25·sin(2πm/12) + 55 or similar", explanation: "General form" },
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
                    question: "If a pendulum swings between 5 cm and 15 cm, the amplitude is:",
                    options: ["5 cm", "10 cm", "15 cm", "20 cm"],
                    correctIndex: 0,
                  },
                  {
                    question: "The midline of a function with max 100 and min 20 is:",
                    options: ["40", "60", "80", "120"],
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "A Ferris wheel has a diameter of 40 meters and the center is 25 m above ground. The amplitude and midline are:",
                    options: ["A = 20, midline = 25", "A = 40, midline = 25", "A = 20, midline = 45", "A = 25, midline = 20"],
                    correctIndex: 0,
                  },
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
