import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_3Result> => {
    const now = Date.now();
    const lessonSlug = "1-3-rates-of-change-linear-quadratic";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rates of Change in Linear and Quadratic Functions",
          slug: lessonSlug,
          description: "Students compare constant rates of change in linear functions with varying rates of change in quadratic functions.",
          orderIndex: 3,
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
          title: "Rates of Change in Linear and Quadratic Functions",
          description: "Students compare constant rates of change in linear functions with varying rates of change in quadratic functions.",
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
                equations: ["y = 2x + 1", "y = x^2"],
                title: "Compare Linear and Quadratic Rates of Change",
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
              markdown: "## Rates of Change: Linear vs. Quadratic\n\n### Linear Functions\nFor $f(x) = mx + b$, the average rate of change is **always** $m$, regardless of the interval. This is a **constant rate of change**.\n\n### Quadratic Functions\nFor $f(x) = ax^2 + bx + c$, the rate of change **varies** depending on the interval. The rate of change on $[x_1, x_2]$ is:\n\n$$\\frac{f(x_2) - f(x_1)}{x_2 - x_1} = a(x_1 + x_2) + b$$\n\n### Key Distinction\n- **Linear**: Constant rate → graph is a straight line\n- **Quadratic**: Changing rate → graph is a curve\n- The average rate of change of a quadratic between symmetric points around the vertex equals zero",
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
              markdown: "## Example: Comparing Rates of Change\n\nFind the average rate of change of $f(x) = 3x + 2$ and $g(x) = x^2$ on $[0, 3]$ and $[3, 6]$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "rate_of_change",
                equation: "f(x) = 3x + 2",
                steps: [
                  { expression: "f on [0,3]: (f(3)-f(0))/(3-0) = (11-2)/3 = 3", explanation: "Linear rate of change on [0,3]" },
                  { expression: "f on [3,6]: (f(6)-f(3))/(6-3) = (20-11)/3 = 3", explanation: "Same rate — constant!" },
                  { expression: "g on [0,3]: (g(3)-g(0))/(3-0) = (9-0)/3 = 3", explanation: "Quadratic rate on [0,3]" },
                  { expression: "g on [3,6]: (g(6)-g(3))/(6-3) = (36-9)/3 = 9", explanation: "Different rate — changing!" },
                  { expression: "Linear: constant rate 3. Quadratic: rates 3 and 9.", explanation: "Linear has constant ROC; quadratic varies" },
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
                    question: "A linear function has the same average rate of change on:",
                    options: ["Only one interval", "Every interval", "Symmetric intervals only", "Intervals of equal length only"],
                    correctIndex: 1,
                  },
                  {
                    question: "The average rate of change of $f(x) = x^2$ from $x = -2$ to $x = 2$ is:",
                    options: ["0", "2", "4", "8"],
                    correctIndex: 0,
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
                variant: "compare_rates",
                equations: ["f(x) = 5x - 3", "g(x) = x^2 + x"],
                interval: [1, 4],
                title: "Compare Linear and Quadratic Rates",
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
