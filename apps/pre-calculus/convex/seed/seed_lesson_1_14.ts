import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_14Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_14 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_14Result> => {
    const now = Date.now();
    const lessonSlug = "1-14-function-model-construction";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Function Model Construction and Application",
          slug: lessonSlug,
          description: "Students construct function models from data and use them to make predictions and answer questions.",
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
          title: "Function Model Construction and Application",
          description: "Students construct function models from data and use them to make predictions and answer questions.",
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
                data: { x: [0, 1, 2, 3, 4], y: [3, 6, 11, 18, 27] },
                title: "Explore Building a Model from Data",
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
              markdown: "## Constructing Function Models\n\n### Steps to Build a Model\n\n1. **Examine the data**: Look at first differences, second differences, or ratios\n2. **Choose the model type**: Linear, quadratic, polynomial, etc.\n3. **Use data points to determine parameters**: Set up equations and solve\n4. **Verify the model**: Check against other data points\n5. **Apply the model**: Make predictions and interpret results\n\n### Using Systems of Equations\n\nFor a quadratic model $f(x) = ax^2 + bx + c$, substitute three data points to create a system of three equations in three unknowns.\n\n### Making Predictions\n\n- **Interpolation**: Predicting within the data range (more reliable)\n- **Extrapolation**: Predicting beyond the data range (less reliable)",
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
              markdown: "## Example: Construct a Quadratic Model\n\nGiven points (0, 2), (1, 5), (2, 12), find a quadratic model and predict $f(4)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = ax^2 + bx + c",
                steps: [
                  { expression: "Point (0,2): c = 2", explanation: "f(0) = a(0) + b(0) + c = 2" },
                  { expression: "Point (1,5): a + b + 2 = 5 → a + b = 3", explanation: "Substitute (1,5)" },
                  { expression: "Point (2,12): 4a + 2b + 2 = 12 → 4a + 2b = 10", explanation: "Substitute (2,12)" },
                  { expression: "From a + b = 3: b = 3 - a", explanation: "Express b in terms of a" },
                  { expression: "4a + 2(3-a) = 10 → 2a = 4 → a = 2, b = 1", explanation: "Solve the system" },
                  { expression: "Model: f(x) = 2x^2 + x + 2", explanation: "Write the model" },
                  { expression: "f(4) = 2(16) + 4 + 2 = 38", explanation: "Predict f(4)" },
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
                    question: "Interpolation is generally more reliable than extrapolation because:",
                    options: ["It uses more data points", "It predicts within the observed range", "It uses a better model", "It is mathematically simpler"],
                    correctIndex: 1,
                  },
                  {
                    question: "To find a linear model from data, you need at least:",
                    options: ["1 point", "2 points", "3 points", "4 points"],
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
                equation: "f(x) = ax + b",
                steps: [
                  { expression: "Given: f(2) = 7 and f(5) = 16", explanation: "Two data points" },
                  { expression: "Slope: (16-7)/(5-2) = 9/3 = 3", explanation: "Find the slope" },
                  { expression: "7 = 3(2) + b → b = 1", explanation: "Find the y-intercept" },
                  { expression: "Model: f(x) = 3x + 1", explanation: "Write the model" },
                  { expression: "f(10) = 31", explanation: "Predict f(10)" },
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
