import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_13Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_13 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_13Result> => {
    const now = Date.now();
    const lessonSlug = "1-13-function-model-selection";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Function Model Selection and Assumption Articulation",
          slug: lessonSlug,
          description: "Students select appropriate function types to model real-world data and articulate modeling assumptions.",
          orderIndex: 13,
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
          title: "Function Model Selection and Assumption Articulation",
          description: "Students select appropriate function types to model real-world data and articulate modeling assumptions.",
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
                    question: "A ball is thrown upward. Which function type best models its height over time?",
                    options: ["Linear", "Quadratic", "Exponential", "Rational"],
                    correctIndex: 1,
                  },
                  {
                    question: "A population doubles every year. Which model fits best?",
                    options: ["Linear", "Quadratic", "Exponential", "Polynomial"],
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
              markdown: "## Function Model Selection\n\n### Choosing the Right Model\n\n| Situation | Best Model | Why |\n|-----------|-----------|-----|\n| Constant rate of change | Linear | Constant slope |\n| Projectile motion, area | Quadratic | Degree 2 behavior |\n| Growth/decay by percentage | Exponential | Multiplicative change |\n| Population limits | Logistic/Sigmoid | Carrying capacity |\n| Rates approaching a limit | Rational | Asymptotic behavior |\n\n### Articulating Assumptions\n\nEvery model requires assumptions:\n- **Domain restrictions**: What values of the input are valid?\n- **Idealizations**: What real-world factors are ignored?\n- **Time horizon**: Over what range is the model reliable?\n- **Measurement units**: What units are used for input and output?",
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
              markdown: "## Example: Selecting a Model\n\nA company's revenue data shows:\n\n| Year | Revenue (\\$1000s) |\n|------|--------|\n| 2018 | 120 |\n| 2019 | 135 |\n| 2020 | 152 |\n| 2021 | 171 |\n| 2022 | 192 |\n\nWhat type of function best models this data?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Revenue(t)",
                steps: [
                  { expression: "Differences: 15, 17, 19, 21", explanation: "First differences are not constant" },
                  { expression: "Second differences: 2, 2, 2", explanation: "Second differences are constant" },
                  { expression: "Constant second differences → quadratic model", explanation: "Pattern matches degree 2" },
                  { expression: "Ratio: 135/120 ≈ 1.125, 152/135 ≈ 1.126", explanation: "Check if exponential (ratios ≈ constant)" },
                  { expression: "Ratios are close but second differences confirm quadratic", explanation: "Quadratic is the best fit" },
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
                    question: "If first differences of data are approximately constant, the best model is:",
                    options: ["Quadratic", "Linear", "Exponential", "Rational"],
                    correctIndex: 1,
                  },
                  {
                    question: "An important assumption when modeling with polynomials is:",
                    options: ["Data must be integers", "The pattern continues beyond the data", "The model works for all real numbers", "The function must be even"],
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
                    question: "A car depreciates by 15% each year. Best model:",
                    options: ["Linear: V(t) = V₀ - 0.15t", "Exponential: V(t) = V₀(0.85)^t", "Quadratic: V(t) = V₀ - 0.15t²", "Rational: V(t) = V₀/(1 + 0.15t)"],
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
