import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_3Result> => {
    const now = Date.now();
    const lessonSlug = "8-3-function-notation";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Function Notation",
          slug: lessonSlug,
          description: "Students use function notation f(x) to evaluate and interpret functions.",
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
          title: "Function Notation",
          description: "Students use function notation f(x) to evaluate and interpret functions.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Explore: Reading Function Notation\n\nWhen we write f(x) = 2x + 3, we are saying:\n- f is the name of the function\n- x is the input variable\n- 2x + 3 is the rule\n\nWhat do you think f(4) means? How would you find its value?",
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
                    question: "If f(x) = x + 5, then f(3) means:",
                    options: ["3 times f", "Substitute 3 for x", "f times 3", "3 + f"],
                    correctIndex: 1,
                  },
                  {
                    question: "f(x) is read as:",
                    options: ["f times x", "f of x", "f minus x", "f divided by x"],
                    correctIndex: 1,
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
              markdown: "## Function Notation\n\n### The Basics\n- f(x) = y means the function f maps x to y\n- f(3) = 7 means when x = 3, y = 7\n- The point (3, 7) is on the graph of f\n\n### Evaluating Functions\nTo evaluate f(a), substitute a for every x in the expression.\n\n### Interpretation\n- f(0) = the y-intercept\n- f(x) = 0 means x is an x-intercept (zero of the function)",
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
              markdown: "## Example: Evaluate f(x)\n\nGiven f(x) = 3x² − 2x + 1, find f(2) and f(−1).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "function-evaluation",
                equation: "f(x) = 3x² - 2x + 1",
                steps: [
                  { expression: "f(2) = 3(2)² - 2(2) + 1", explanation: "Substitute x = 2" },
                  { expression: "f(2) = 3(4) - 4 + 1 = 12 - 4 + 1", explanation: "Compute each term" },
                  { expression: "f(2) = 9", explanation: "Simplify" },
                  { expression: "f(-1) = 3(-1)² - 2(-1) + 1 = 3 + 2 + 1 = 6", explanation: "Substitute x = -1" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "If g(x) = 2x - 7, then g(5) =",
                    options: ["3", "10", "17", "-3"],
                    correctIndex: 0,
                  },
                  {
                    question: "If h(x) = x², then h(-4) =",
                    options: ["-16", "16", "8", "-8"],
                    correctIndex: 1,
                  },
                  {
                    question: "If f(3) = 10 for f(x) = ax + 1, then a =",
                    options: ["3", "4", "2", "9"],
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "For f(x) = x² - 4x + 3, find f(0):",
                    options: ["0", "3", "-3", "7"],
                    correctIndex: 1,
                  },
                  {
                    question: "If f(a) = 0, then a is a:",
                    options: ["y-intercept", "x-intercept", "maximum", "minimum"],
                    correctIndex: 1,
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
