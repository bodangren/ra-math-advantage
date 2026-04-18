import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-5-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Modeling Data",
          slug: lessonSlug,
          description: "Students choose the best function type to model sets of data.",
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
          title: "Modeling Data",
          description: "Students choose the best function type to model sets of data.",
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
              markdown:
                "## Explore: Modeling Exponential Decay\n\nUse a concrete model to complete the explore.\n\n**Inquiry Question:**\nHow can experimental data be used to predict outcomes?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = a * b^x",
                title: "Exponential Modeling",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Regression function**: A function chosen to fit a set of data, typically found using a graphing calculator\n- **Coefficient of determination**: The value $r^2$ that measures how well the data are modeled by the regression function; a value close to $1$ indicates a strong fit",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Choosing the Best Model",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Choosing the Best Model\n\nLinear, quadratic, and exponential functions grow differently.\n\n- linear functions have linear graphs\n- quadratic and exponential functions are nonlinear\n- exponential functions grow faster than quadratic functions\n\nA graphing calculator can find a **regression function**, which is a function chosen to fit a set of data.\n\nCalculators may also compute $r^2$, the **coefficient of determination**, which measures how well the data are modeled by the regression function.\n\n- An $r^2$ value close to $1$ indicates a strong fit",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Think About It\n\nDescribe the reliability of using a regression function to make predictions for domain values much greater or much less than the values in the data set.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Examine Scatter Plots\n\nUse a graphing calculator to make a scatter plot of the given data and determine whether it is best modeled by a linear, quadratic, or exponential function.\n\nAfter plotting the data, the scatter plot appears to have:\n\n- an asymptote at $y = -3$\n- rapid increase as $x \\to \\infty$\n\nSo the data are likely best modeled by an **exponential function**.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Examine scatter plot to determine model type",
                steps: [
                  { expression: "Plot data on graphing calculator", explanation: "Create scatter plot" },
                  { expression: "Observe asymptote at y = -3", explanation: "Identify horizontal asymptote" },
                  { expression: "Observe rapid increase as x increases", explanation: "Note end behavior" },
                  { expression: "Compare function types: linear, quadratic, exponential", explanation: "Consider growth patterns" },
                  { expression: "Exponential function best fits the data", explanation: "Based on asymptote and growth pattern" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Model Data by Using Technology\n\nA coffee company grew to more than $17{,}000$ shops over $40$ years.\n\n\nUse the data table to determine a best-fit model, then make predictions.\n### Steps 1 and 2: Enter the data and make a scatter plot\n\nPlot years since opening against number of shops.\n### Step 3: Determine the function of best fit\n\nCompare quadratic and exponential regressions using $r^2$.\n\nThe exponential regression has the stronger fit:\n- $r^2 \\approx 0.964$\n\nRegression equation, rounded to the nearest thousandth:\n\n$$y \\approx (0.655)1.317^x$$\n### Step 4: Evaluate the regression function\n\nPredictions from the model:\n\n- after $10$ years: about $10$ shops\n- after $42$ years: about $70{,}116$ shops",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y ≈ 0.655 * 1.317^x",
                steps: [
                  { expression: "Enter data points into calculator", explanation: "Years since opening vs. number of shops" },
                  { expression: "Compare regression models", explanation: "Test linear, quadratic, and exponential" },
                  { expression: "Exponential: r^2 ≈ 0.964", explanation: "Strongest fit among models tested" },
                  { expression: "Regression equation: y ≈ 0.655(1.317)^x", explanation: "Best-fit exponential model" },
                  { expression: "After 10 years: y ≈ 0.655(1.317)^10 ≈ 10 shops", explanation: "Evaluate model at x = 10" },
                  { expression: "After 42 years: y ≈ 0.655(1.317)^42 ≈ 70,116 shops", explanation: "Evaluate model at x = 42" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Based on the scatter plot, is it reasonable that the data could be modeled by another function type? Justify your argument.\n2. What approximations were made when determining the number of shops at a given year?\n3. Why is it important to consider the context of the data when choosing a regression model?",
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
                    question: "What does an r^2 value close to 1 indicate about a regression model?",
                    options: ["A strong fit", "A weak fit", "A linear relationship only"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which type of function grows the fastest for large values of x?",
                    options: ["Linear", "Quadratic", "Exponential"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about modeling data with exponential functions. Consider the following:\n- How do you determine which type of function best models a data set?\n- What does the coefficient of determination tell you about a regression model?\n- What are the limitations of using regression models for prediction?\n\n**Tip**: Always consider the context of your data and the behavior of different function types when selecting a model.",
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