import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_6Result> => {
    const now = Date.now();
    const lessonSlug = "3-6-sinusoidal-applications";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sinusoidal Applications",
          slug: lessonSlug,
          description: "Students apply sinusoidal models to real-world periodic phenomena like tides, temperatures, and daylight hours.",
          orderIndex: 6,
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
          title: "Sinusoidal Applications",
          description: "Students apply sinusoidal models to real-world periodic phenomena like tides, temperatures, and daylight hours.",
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
                equation: "y = 4.5sin(pi/6 * (x - 4)) + 12.5",
                title: "Tide Modeling",
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
              markdown: "## Sinusoidal Applications\n\n### Steps to Model Real-World Data\n\n1. Identify the period (how long for one cycle)\n2. Find max and min values\n3. Calculate amplitude and midline\n4. Choose sine or cosine based on starting point\n5. Determine phase shift\n6. Write and verify the equation\n\n### Common Applications\n\n- **Tides**: 12.4-hour cycle (half lunar day)\n- **Temperature**: 24-hour cycle (daily) or 365-day cycle (yearly)\n- **Daylight hours**: 365-day cycle\n- **Ferris wheel**: Period based on rotation speed\n- **Sound waves**: Period based on frequency",
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
              markdown: "## Example: Ferris Wheel\n\nA Ferris wheel has a diameter of 30 meters, the center is 20 m above ground, and it takes 4 minutes for one revolution. A rider starts at the bottom. Write a height function.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "h(t) = A cos(B(t - C)) + D",
                steps: [
                  { expression: "Amplitude A = 15 (radius = 30/2)", explanation: "From diameter" },
                  { expression: "Midline D = 20 (center height)", explanation: "Center position" },
                  { expression: "Period = 4 min, B = 2π/4 = π/2", explanation: "From rotation time" },
                  { expression: "Starts at bottom (min), use -cosine, C = 0", explanation: "At t = 0, h = 5 (minimum)" },
                  { expression: "h(t) = -15cos(πt/2) + 20", explanation: "Complete equation" },
                  { expression: "Check: h(0) = -15 + 20 = 5 (bottom) ✓", explanation: "Verify" },
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
                    question: "If a Ferris wheel completes one revolution in 6 minutes, B equals:",
                    options: ["6", "π/3", "2π/6 = π/3", "3π"],
                    correctIndex: 2,
                  },
                  {
                    question: "If the rider starts at the bottom, which function is appropriate?",
                    options: ["Positive cosine", "Negative cosine", "Positive sine only", "Tangent"],
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
                equation: "Daylight hours model",
                steps: [
                  { expression: "Max daylight: 15 hrs (June), Min: 9 hrs (Dec)", explanation: "Given data" },
                  { expression: "A = (15 - 9)/2 = 3, D = (15 + 9)/2 = 12", explanation: "Amplitude and midline" },
                  { expression: "Period = 365 days, B = 2π/365", explanation: "Annual cycle" },
                  { expression: "D(t) = 3cos(2π(t - 172)/365) + 12", explanation: "Peak at day 172 (June 21)" },
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
