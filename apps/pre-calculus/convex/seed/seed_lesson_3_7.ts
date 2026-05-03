import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_7Result> => {
    const now = Date.now();
    const lessonSlug = "3-7-sinusoidal-modeling";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sinusoidal Modeling",
          slug: lessonSlug,
          description: "Students fit sinusoidal models to data sets and use them for prediction.",
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
          title: "Sinusoidal Modeling",
          description: "Students fit sinusoidal models to data sets and use them for prediction.",
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
                variant: "plot_from_table",
                data: { x: [0, 3, 6, 9, 12], y: [50, 75, 50, 25, 50] },
                title: "Explore Sinusoidal Data",
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
              markdown: "## Sinusoidal Modeling from Data\n\n### Approach\n\n1. **Identify max and min** from the data\n2. **Calculate**: Amplitude $A = \\frac{\\max - \\min}{2}$, Midline $D = \\frac{\\max + \\min}{2}$\n3. **Find the period** from consecutive peaks or troughs\n4. **Determine phase shift** from where the cycle starts\n5. **Write the equation** and verify against data\n\n### Tips\n\n- Use cosine when data starts at a max or min\n- Use sine when data starts at the midline\n- Convert time units as needed (hours → radians, etc.)",
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
              markdown: "## Example: Fit a Sinusoidal Model\n\n| Month | Temp (°F) |\n|-------|----------|\n| Jan (1) | 30 |\n| Apr (4) | 55 |\n| Jul (7) | 80 |\n| Oct (10) | 55 |\n| Jan (13) | 30 |",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "T(t) = A cos(B(t - C)) + D",
                steps: [
                  { expression: "Max = 80, Min = 30", explanation: "From data" },
                  { expression: "A = (80 - 30)/2 = 25, D = (80 + 30)/2 = 55", explanation: "Compute parameters" },
                  { expression: "Period = 12 months, B = 2π/12 = π/6", explanation: "Annual cycle" },
                  { expression: "Max at t = 7 (July), so C = 7", explanation: "Phase shift" },
                  { expression: "T(t) = 25cos(π/6(t - 7)) + 55", explanation: "Final model" },
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
                    question: "Given max = 100, min = 20, the amplitude is:",
                    options: ["80", "60", "40", "120"],
                    correctIndex: 2,
                  },
                  {
                    question: "To find the period from data, look for:",
                    options: ["Slope changes", "Consecutive maxima", "Y-intercept", "The derivative"],
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Fit sinusoidal model",
                steps: [
                  { expression: "Data: t=0→50, t=6→10, t=12→50, t=18→90", explanation: "Given data points" },
                  { expression: "Max = 90, Min = 10, A = 40, D = 50", explanation: "Amplitude and midline" },
                  { expression: "Period = 24, B = 2π/24 = π/12", explanation: "From cycle length" },
                  { expression: "Max at t = 18, C = 18", explanation: "Phase shift" },
                  { expression: "f(t) = 40cos(π/12(t - 18)) + 50", explanation: "Final equation" },
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
