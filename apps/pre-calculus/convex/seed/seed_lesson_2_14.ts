import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_14Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_14 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_14Result> => {
    const now = Date.now();
    const lessonSlug = "2-14-logarithmic-modeling";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Modeling",
          slug: lessonSlug,
          description: "Students use logarithmic models to solve real-world problems involving pH, decibels, Richter scale, and other logarithmic scales.",
          orderIndex: 14,
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
          title: "Logarithmic Modeling",
          description: "Students use logarithmic models to solve real-world problems involving pH, decibels, Richter scale, and other logarithmic scales.",
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "An earthquake of magnitude 6 releases how many times more energy than magnitude 4?",
                    options: ["2 times", "10 times", "100 times", "1000 times"],
                    correctIndex: 2,
                  },
                ],
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
              markdown: "## Logarithmic Modeling\n\n### Common Logarithmic Scales\n\n| Scale | Formula | Measures |\n|-------|---------|----------|\n| pH | $\\text{pH} = -\\log[H^+]$ | Acidity |\n| Decibels | $dB = 10\\log(I/I_0)$ | Sound intensity |\n| Richter | $M = \\log(A/A_0)$ | Earthquake magnitude |\n\n### Why Logarithmic?\n\n- Data spans many orders of magnitude\n- Data shows diminishing returns\n- Rate of change decreases over time\n\n### Building a Log Model\n\nIf data shows the form $y = a + b\\ln(x)$, use two data points to find $a$ and $b$.",
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
              markdown: "## Example: Richter Scale\n\nAn earthquake has magnitude 7.2. How many times more intense is it than a magnitude 5.2 earthquake?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "M = log(A/A₀)",
                steps: [
                  { expression: "M₁ = log(A₁/A₀) = 7.2", explanation: "First earthquake" },
                  { expression: "M₂ = log(A₂/A₀) = 5.2", explanation: "Second earthquake" },
                  { expression: "M₁ - M₂ = log(A₁/A₀) - log(A₂/A₀) = log(A₁/A₂)", explanation: "Quotient rule" },
                  { expression: "7.2 - 5.2 = 2 = log(A₁/A₂)", explanation: "Difference in magnitude" },
                  { expression: "A₁/A₂ = 10² = 100", explanation: "Convert to exponential" },
                  { expression: "The 7.2 earthquake is 100 times more intense", explanation: "Interpret" },
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
                    question: "A solution with $[H^+] = 10^{-4}$ has pH:",
                    options: ["2", "4", "10", "0.4"],
                    correctIndex: 1,
                  },
                  {
                    question: "Doubling sound intensity adds approximately how many decibels?",
                    options: ["1 dB", "3 dB", "6 dB", "10 dB"],
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
                equation: "pH = -log[H⁺]",
                steps: [
                  { expression: "Find [H⁺] for pH = 3.5", explanation: "Given pH" },
                  { expression: "3.5 = -log[H⁺]", explanation: "Set up equation" },
                  { expression: "-3.5 = log[H⁺]", explanation: "Multiply by -1" },
                  { expression: "[H⁺] = 10^(-3.5) ≈ 3.16 × 10⁻⁴", explanation: "Convert to exponential" },
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
