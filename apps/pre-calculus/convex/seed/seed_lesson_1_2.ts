import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_2Result> => {
    const now = Date.now();
    const lessonSlug = "1-2-rates-of-change";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rates of Change",
          slug: lessonSlug,
          description: "Students calculate and interpret average and instantaneous rates of change from graphs, tables, and equations.",
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
          title: "Rates of Change",
          description: "Students calculate and interpret average and instantaneous rates of change from graphs, tables, and equations.",
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
              componentKey: "rate-of-change-calculator",
              props: {
                variant: "average_rate_of_change",
                equation: "f(x) = x^2",
                interval: [1, 3],
                title: "Explore Rates of Change",
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
              markdown: "## Rates of Change\n\nThe **average rate of change** of a function over an interval measures how much the output changes per unit change in the input.\n\n### Formula\n\n$$\\text{Average Rate of Change} = \\frac{f(b) - f(a)}{b - a}$$\n\n### Key Concepts\n\n- **Average rate of change** is the slope of the secant line between two points\n- A **positive** rate of change means the function is increasing\n- A **negative** rate of change means the function is decreasing\n- A rate of change of **zero** means the function is constant on that interval\n- The rate of change can vary across different intervals of the same function",
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
              markdown: "## Example: Average Rate of Change from an Equation\n\nFind the average rate of change of $f(x) = x^2 + 2x$ from $x = 1$ to $x = 4$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "rate_of_change",
                equation: "f(x) = x^2 + 2x",
                steps: [
                  { expression: "f(1) = 1 + 2 = 3", explanation: "Evaluate at x = 1" },
                  { expression: "f(4) = 16 + 8 = 24", explanation: "Evaluate at x = 4" },
                  { expression: "Rate = (24 - 3) / (4 - 1)", explanation: "Apply the formula" },
                  { expression: "= 21 / 3 = 7", explanation: "Calculate the result" },
                  { expression: "Average rate of change is 7", explanation: "Interpret: f increases by 7 per unit of x" },
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
              markdown: "## Guided Practice\n\nCalculate the average rate of change for each function.",
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
                    question: "The average rate of change of $f(x) = 3x + 5$ from $x = 2$ to $x = 7$ is:",
                    options: ["3", "5", "15", "26"],
                    correctIndex: 0,
                  },
                  {
                    question: "If a function has a negative average rate of change on an interval, the function is:",
                    options: ["Increasing", "Decreasing", "Constant", "Undefined"],
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
              componentKey: "rate-of-change-calculator",
              props: {
                variant: "average_rate_of_change",
                equation: "g(x) = -x^2 + 4x",
                interval: [0, 3],
                title: "Calculate Average Rate of Change",
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
