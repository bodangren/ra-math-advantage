import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_6Result> => {
    const now = Date.now();
    const lessonSlug = "2-6-model-validation";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Model Validation",
          slug: lessonSlug,
          description: "Students evaluate the goodness of fit of exponential models and understand model limitations.",
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
          title: "Model Validation",
          description: "Students evaluate the goodness of fit of exponential models and understand model limitations.",
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
                    question: "A model predicts a population of 10,000 but the actual value is 9,800. The residual is:",
                    options: ["200", "-200", "0.02", "9800"],
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
              markdown: "## Model Validation\n\n### Checking Model Fit\n\n1. **Residuals**: The difference between predicted and actual values\n   - $\\text{residual} = \\text{actual} - \\text{predicted}$\n2. **Residual plot**: Plot residuals vs. input; good models show random scatter\n3. **R² value**: Closer to 1 means better fit\n\n### Model Limitations\n\n- Models are simplifications of reality\n- Domain restrictions may apply\n- Extrapolation beyond data range is unreliable\n- Models may break down in extreme cases\n\n### Signs of a Good Model\n\n- Small residuals (no systematic pattern)\n- Residual plot shows random scatter\n- Makes sense in context (domain, range, behavior)",
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
              markdown: "## Example: Validating an Exponential Model\n\nGiven model $M(t) = 200 \\cdot (1.5)^t$ and data at $t = 3$: actual = 680, check the fit.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "M(t) = 200 · (1.5)^t",
                steps: [
                  { expression: "M(3) = 200 · (1.5)^3 = 200 · 3.375 = 675", explanation: "Predicted value" },
                  { expression: "Residual = 680 - 675 = 5", explanation: "Actual minus predicted" },
                  { expression: "Percent error = |5/680| × 100% ≈ 0.74%", explanation: "Very small error" },
                  { expression: "Model fits well at t = 3", explanation: "Small residual indicates good fit" },
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
                    question: "A residual plot showing a curved pattern suggests:",
                    options: ["Good model fit", "Wrong model type", "Perfect fit", "Data error"],
                    correctIndex: 1,
                  },
                  {
                    question: "Extrapolation means predicting:",
                    options: ["Within the data range", "Beyond the data range", "At the mean", "The residuals"],
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "An exponential model predicts 500 but actual is 520. Another predicts 200 but actual is 180. Which has a larger relative error?",
                    options: ["First model", "Second model", "Same relative error", "Cannot determine"],
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
