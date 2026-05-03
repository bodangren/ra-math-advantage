import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_4Result> => {
    const now = Date.now();
    const lessonSlug = "8-4-linear-nonlinear-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Linear and Nonlinear Functions",
          slug: lessonSlug,
          description: "Students distinguish between linear and nonlinear functions from equations, tables, and graphs.",
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
          title: "Linear and Nonlinear Functions",
          description: "Students distinguish between linear and nonlinear functions from equations, tables, and graphs.",
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
              markdown: "## Explore: Straight or Curved?\n\nCompare these two functions:\n- f(x) = 2x + 1\n- g(x) = x²\n\nMake a table of values for each. What patterns do you notice in the differences between consecutive y-values?",
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
                    question: "A linear function has a graph that is a:",
                    options: ["Circle", "Straight line", "Parabola", "Curve"],
                    correctIndex: 1,
                  },
                  {
                    question: "In a linear function table, the differences between y-values are:",
                    options: ["Increasing", "Constant", "Decreasing", "Random"],
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
              markdown: "## Linear vs Nonlinear Functions\n\n### Linear Functions\n- Form: f(x) = mx + b\n- Graph: straight line\n- Constant rate of change (slope)\n- First differences in table are constant\n\n### Nonlinear Functions\n- Quadratic: f(x) = ax² + bx + c (parabola)\n- Exponential: f(x) = a·bˣ (curve)\n- Absolute value: f(x) = |x| (V-shape)\n- First differences in table are not constant",
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
              markdown: "## Example: Linear or Nonlinear?\n\nDetermine if f(x) = 5x − 3 is linear or nonlinear.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "classification",
                equation: "f(x) = 5x - 3",
                steps: [
                  { expression: "f(x) = 5x + (-3)", explanation: "Rewrite in standard form" },
                  { expression: "This matches f(x) = mx + b", explanation: "m = 5, b = -3" },
                  { expression: "The exponent of x is 1", explanation: "x has power 1" },
                  { expression: "LINEAR function", explanation: "Form matches mx + b" },
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
                    question: "Which function is linear?",
                    options: ["f(x) = x² + 1", "f(x) = 3x - 7", "f(x) = 2ˣ", "f(x) = |x| + x"],
                    correctIndex: 1,
                  },
                  {
                    question: "A table shows y-values: 2, 5, 8, 11. The function is:",
                    options: ["Nonlinear", "Linear", "Cannot determine", "Exponential"],
                    correctIndex: 1,
                  },
                  {
                    question: "Which equation is nonlinear?",
                    options: ["y = -x + 4", "y = 7x", "y = x³ - 2", "y = x/2"],
                    correctIndex: 2,
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
                    question: "y-values: 1, 4, 9, 16, 25. The function is:",
                    options: ["Linear", "Quadratic", "Exponential", "Absolute value"],
                    correctIndex: 1,
                  },
                  {
                    question: "The function f(x) = 0.5x + 10 is linear because:",
                    options: ["It has a slope", "It is in the form mx + b", "Both A and B", "Neither A nor B"],
                    correctIndex: 2,
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
