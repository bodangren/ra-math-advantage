import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_1Result> => {
    const now = Date.now();
    const lessonSlug = "1-1-change-in-tandem";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Change in Tandem",
          slug: lessonSlug,
          description: "Students explore how quantities change together and develop intuition for covariation.",
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
          title: "Change in Tandem",
          description: "Students explore how quantities change together and develop intuition for covariation.",
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
                equation: "y = 2x + 1",
                title: "Explore How Quantities Change Together",
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
              markdown: "## Change in Tandem\n\nWhen two quantities are related, a change in one often corresponds to a change in the other. This is called **covariation**.\n\n### Key Ideas\n\n- **Independent variable**: The input quantity (typically $x$)\n- **Dependent variable**: The output quantity that changes in response (typically $y$)\n- **Rate of change**: How much the dependent variable changes per unit change in the independent variable\n\n### Observing Change\n\nConsider the function $f(x) = 2x + 1$. As $x$ increases by 1, $f(x)$ increases by 2. The quantities change **in tandem** — a predictable relationship exists between the input and output changes.",
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
              markdown: "## Example: Analyzing Change in Tandem\n\nA candle is 12 inches tall and burns at a rate of 0.5 inches per hour. Let $h(t)$ represent the height after $t$ hours.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "h(t) = 12 - 0.5t",
                steps: [
                  { expression: "h(t) = 12 - 0.5t", explanation: "Write the function" },
                  { expression: "t = 0: h(0) = 12", explanation: "Initial height is 12 inches" },
                  { expression: "t = 4: h(4) = 12 - 2 = 10", explanation: "After 4 hours, height is 10 inches" },
                  { expression: "t = 8: h(8) = 12 - 4 = 8", explanation: "After 8 hours, height is 8 inches" },
                  { expression: "For every 2 hours, height decreases by 1 inch", explanation: "Quantities change in tandem at a constant rate" },
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
            sectionType: "text" as const,
            content: {
              markdown: "## Guided Practice\n\nFor each scenario, identify how the quantities change in tandem.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "If $f(x) = 3x - 2$, as $x$ increases by 1, how much does $f(x)$ increase?",
                    options: ["1", "2", "3", "5"],
                    correctIndex: 2,
                  },
                  {
                    question: "A car travels at 60 mph. Which quantity is independent?",
                    options: ["Distance traveled", "Time spent driving", "Speed", "Fuel consumed"],
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
                problemType: "graphing",
                equation: "g(x) = -2x + 10",
                steps: [
                  { expression: "g(0) = 10", explanation: "Find the initial value" },
                  { expression: "g(1) = 8", explanation: "After one unit increase in x" },
                  { expression: "g(2) = 6", explanation: "After two unit increases" },
                  { expression: "As x increases by 1, g(x) decreases by 2", explanation: "Describe the tandem change" },
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
