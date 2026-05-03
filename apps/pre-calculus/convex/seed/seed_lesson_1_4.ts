import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_4Result> => {
    const now = Date.now();
    const lessonSlug = "1-4-polynomial-functions-rates";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Polynomial Functions and Rates of Change",
          slug: lessonSlug,
          description: "Students analyze how the degree of a polynomial affects its rate of change and graph behavior.",
          orderIndex: 4,
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
          title: "Polynomial Functions and Rates of Change",
          description: "Students analyze how the degree of a polynomial affects its rate of change and graph behavior.",
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
                equation: "y = x^3 - 3x",
                title: "Explore Polynomial Rate of Change",
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
              markdown: "## Polynomial Functions and Rates of Change\n\nA **polynomial function** of degree $n$ has the form:\n$$f(x) = a_n x^n + a_{n-1}x^{n-1} + \\cdots + a_1 x + a_0$$\n\n### Rate of Change and Degree\n\n- Degree 1 (linear): Constant rate of change\n- Degree 2 (quadratic): Rate of change is linear — changes at a constant rate\n- Degree 3 (cubic): Rate of change is quadratic\n- Degree $n$: Rate of change is degree $n-1$\n\n### Turning Points\n\nA polynomial of degree $n$ can have at most $n - 1$ turning points. Each turning point is where the rate of change transitions from positive to negative or vice versa.",
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
              markdown: "## Example: Rate of Change of a Cubic\n\nFind the average rate of change of $f(x) = x^3 - 3x$ on $[-1, 1]$ and $[1, 3]$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "rate_of_change",
                equation: "f(x) = x^3 - 3x",
                steps: [
                  { expression: "f(-1) = -1 + 3 = 2", explanation: "Evaluate at x = -1" },
                  { expression: "f(1) = 1 - 3 = -2", explanation: "Evaluate at x = 1" },
                  { expression: "Rate on [-1,1] = (-2-2)/(1-(-1)) = -2", explanation: "Average rate on first interval" },
                  { expression: "f(3) = 27 - 9 = 18", explanation: "Evaluate at x = 3" },
                  { expression: "Rate on [1,3] = (18-(-2))/(3-1) = 10", explanation: "Average rate on second interval" },
                  { expression: "Rates differ: -2 vs 10 — polynomial rate varies", explanation: "Rate of change depends on interval" },
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
                    question: "A degree 4 polynomial can have at most how many turning points?",
                    options: ["2", "3", "4", "5"],
                    correctIndex: 1,
                  },
                  {
                    question: "The rate of change of a degree 3 polynomial is a polynomial of degree:",
                    options: ["1", "2", "3", "4"],
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
                equation: "f(x) = x^3 - 6x^2 + 9x",
                interval: [0, 3],
                title: "Polynomial Rate of Change Practice",
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
