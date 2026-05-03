import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_5Result> => {
    const now = Date.now();
    const lessonSlug = "2-5-exponential-modeling";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential Modeling",
          slug: lessonSlug,
          description: "Students build exponential models from real-world data involving growth and decay.",
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
          title: "Exponential Modeling",
          description: "Students build exponential models from real-world data involving growth and decay.",
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
                data: { x: [0, 1, 2, 3, 4], y: [500, 600, 720, 864, 1036.8] },
                title: "Explore Exponential Data Patterns",
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
              markdown: "## Exponential Modeling\n\n### Building the Model\n\nGiven data that shows exponential behavior, use $f(t) = a \\cdot b^t$ where:\n- $a$ = initial value (value at $t = 0$)\n- $b$ = growth/decay factor\n\n### Finding $b$\n\n- From two points: $b = \\frac{f(t_2)}{f(t_1)}$ (ratios are constant)\n- From percentage: $b = 1 + r$ (growth) or $b = 1 - r$ (decay)\n\n### Common Applications\n\n- Population growth: $P(t) = P_0 \\cdot (1 + r)^t$\n- Radioactive decay: $A(t) = A_0 \\cdot (1/2)^{t/h}$ (half-life $h$)\n- Compound interest: $A = P(1 + r/n)^{nt}$",
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
              markdown: "## Example: Population Growth\n\nA town of 10,000 grows at 3% per year. Write a model and find the population after 10 years.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "P(t) = 10000 · (1.03)^t",
                steps: [
                  { expression: "P₀ = 10000, r = 0.03", explanation: "Identify initial value and rate" },
                  { expression: "P(t) = 10000 · (1.03)^t", explanation: "Write the model" },
                  { expression: "P(10) = 10000 · (1.03)^10", explanation: "Substitute t = 10" },
                  { expression: "= 10000 · 1.3439 ≈ 13439", explanation: "Calculate" },
                  { expression: "Population ≈ 13,439 after 10 years", explanation: "Interpret" },
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
                    question: "A car worth \\$25,000 depreciates 12% per year. After 3 years it's worth approximately:",
                    options: ["\\$16,000", "\\$19,210", "\\$16,704", "\\$22,000"],
                    correctIndex: 2,
                  },
                  {
                    question: "The half-life of a substance means the decay factor is:",
                    options: ["0.25", "0.5", "0.75", "1.5"],
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
                equation: "A = 500 · 2^(t/6)",
                steps: [
                  { expression: "Initial amount: A(0) = 500", explanation: "Initial value" },
                  { expression: "Half-life: 6 units (doubles every 6)", explanation: "Growth doubles in 6 periods" },
                  { expression: "A(18) = 500 · 2^3 = 500 · 8 = 4000", explanation: "After 18 time units" },
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
