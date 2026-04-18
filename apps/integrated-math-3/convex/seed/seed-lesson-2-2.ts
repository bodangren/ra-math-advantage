import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-2-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Analyzing Graphs of Polynomial Functions",
          slug: lessonSlug,
          description: "Students analyze graphs of polynomial functions, approximate zeros, and find extrema.",
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
          title: "Analyzing Graphs of Polynomial Functions",
          description: "Students analyze graphs of polynomial functions, approximate zeros, and find extrema.",
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
                variant: "explore",
                equation: "y = x^4 - 2x^3 - x^2 + 1",
                title: "Explore Polynomial Zeros",
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
              markdown: "## Key Terms\n\n- **Polynomial function**: A function described by a polynomial equation in one variable\n- **Zero**: A value of $x$ where $f(x) = 0$\n- **Location Principle**: If $f(a)$ and $f(b)$ have opposite signs, there is at least one zero between $a$ and $b$\n- **Extrema**: Relative maxima and minima of a function\n- **Relative maximum**: A point where the function is higher than all nearby points\n- **Relative minimum**: A point where the function is lower than all nearby points\n- **Coefficient of determination**: The $r^2$ value indicating how well a model fits data",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: The Location Principle",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## The Location Principle\n\nIf the value of a polynomial function $f(x)$ changes signs from one value of $x$ to the next, then there is a zero between those two x-values. This is called the **Location Principle**.\n\n### Key Concept: Location Principle\n\nSuppose $y = f(x)$ is a polynomial function, and $a$ and $b$ are real numbers such that:\n\n- $f(a) < 0$\n- $f(b) > 0$\n\nThen the function has at least one real zero between $a$ and $b$.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 1: Locate Zeros of a Function\n\nDetermine the consecutive integer values of $x$ between which each real zero of\n\n$$f(x) = x^4 - 2x^3 - x^2 + 1$$\n\nis located. Then draw the graph.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = x^4 - 2x^3 - x^2 + 1",
                steps: [
                  { expression: "Make a table of values", explanation: "Choose x-values to test" },
                  { expression: "x = -2: f(-2) = 29", explanation: "Calculate f(-2)" },
                  { expression: "x = -1: f(-1) = 3", explanation: "Calculate f(-1)" },
                  { expression: "x = 0: f(0) = 1", explanation: "Calculate f(0)" },
                  { expression: "x = 1: f(1) = -1", explanation: "Calculate f(1)" },
                  { expression: "x = 2: f(2) = -3", explanation: "Calculate f(2)" },
                  { expression: "x = 3: f(3) = 19", explanation: "Calculate f(3)" },
                  { expression: "Sign changes: 0 to 1 (zero between), 2 to 3 (zero between)", explanation: "Apply Location Principle" },
                  { expression: "Zeros are between x = 0 and x = 1, and between x = 2 and x = 3", explanation: "State the intervals" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Learn: Extrema of Polynomials",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Extrema of Polynomials\n\nExtrema occur at relative maxima or relative minima of a function.\n\n- A **relative minimum** and a **relative maximum** are both extrema\n- A polynomial of degree $n$ has at most $n - 1$ extrema\n\n### Study Tip\n\nRelative maxima and relative minima are sometimes called **turning points**.\n\n### Key Facts\n\n- A quartic function (degree 4) can have at most 3 turning points\n- A cubic function (degree 3) can have at most 2 turning points\n- Extrema can be estimated from a graph or table of values",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 2: Identify Extrema\n\nUse a table to graph\n\n$$f(x) = x^3 + x^2 - 5x - 2$$\n\nand estimate the x-coordinates at which the relative maxima and relative minima occur.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = x^3 + x^2 - 5x - 2",
                steps: [
                  { expression: "Make a table of values", explanation: "Choose x-values to test" },
                  { expression: "x = -4: f(-4) = -30", explanation: "Calculate f(-4)" },
                  { expression: "x = -3: f(-3) = -5", explanation: "Calculate f(-3)" },
                  { expression: "x = -2: f(-2) = 4", explanation: "Calculate f(-2)" },
                  { expression: "x = -1: f(-1) = 3", explanation: "Calculate f(-1)" },
                  { expression: "x = 0: f(0) = -2", explanation: "Calculate f(0)" },
                  { expression: "x = 1: f(1) = -5", explanation: "Calculate f(1)" },
                  { expression: "x = 2: f(2) = 0", explanation: "Calculate f(2)" },
                  { expression: "x = 3: f(3) = 19", explanation: "Calculate f(3)" },
                  { expression: "Relative maximum near x = -2", explanation: "f(-2) is greater than surrounding values" },
                  { expression: "Relative minimum near x = 1", explanation: "f(1) is less than surrounding values" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3: Analyze a Polynomial Function\n\nThe total number of certified pilots in the United States is approximated by:\n\n$$f(x) = 0.0000903x^4 - 0.0166x^3 + 0.762x^2 + 6.317x + 7.708$$\n\nwhere $x$ is the number of years after 1930 and $f(x)$ is the number of pilots in thousands.\n\nGraph the function and describe its key features over the relevant domain.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = 0.0000903x^4 - 0.0166x^3 + 0.762x^2 + 6.317x + 7.708",
                steps: [
                  { expression: "Domain: all real numbers (mathematical)", explanation: "Polynomial has no restrictions" },
                  { expression: "Relevant domain: x >= 0", explanation: "Years after 1930" },
                  { expression: "Relevant range: f(x) >= 7.708", explanation: "Minimum value at x = 0" },
                  { expression: "Relative maximum between 1980 and 1990", explanation: "Peak pilot population" },
                  { expression: "Relative minimum between 2010 and 2020", explanation: "Low point in relevant domain" },
                  { expression: "as x -> infinity, f(x) -> infinity", explanation: "End behavior (positive leading coefficient, even degree)" },
                  { expression: "y-intercept: (0, 7.708)", explanation: "Initial value in 1930" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Use a Polynomial Function and Technology to Model\n\nThe table shows U.S. backpack sales, in millions of dollars. Make a scatter plot and a curve of best fit to show the trend over time. Then determine the backpack sales in 2015.\n\n| Years since 2000 | 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 |\n|------------------|---|---|---|---|---|---|---|---|\n| Sales ($ millions) | 1139.9 | 1106.6 | 1158.2 | 1337.4 | 1644.8 | 1756.1 | 1777.4 | 1872.3 |",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y ≈ 0.2x^4 - 3.9x^3 + 26.4x^2 - 43.6x + 1139.9",
                steps: [
                  { expression: "Let x = years since 2000", explanation: "Define variable" },
                  { expression: "Enter data into graphing calculator", explanation: "Set up lists" },
                  { expression: "Compare regressions: linear, quadratic, cubic, quartic", explanation: "Test different models" },
                  { expression: "Quartic regression gives best fit (highest r^2)", explanation: "Select model type" },
                  { expression: "y ≈ 0.2x^4 - 3.9x^3 + 26.4x^2 - 43.6x + 1139.9", explanation: "Regression equation" },
                  { expression: "For 2015, x = 15", explanation: "Convert year to x-value" },
                  { expression: "y ≈ 3523 million = $3.523 billion", explanation: "Evaluate model" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5: Find Average Rate of Change\n\nThe table shows the expected g-force on the Ares-V rocket during a 200-second launch.\n\n| Time (seconds) | 0 | 100 | 200 |\n|----------------|---|-----|-----|\n| G-force | 1.34 | 1.77 | 2.2 |\n\n**Part A**: Find the average rate of change from 0 to 200 seconds.\n\n**Part B**: Interpret the result.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(t)",
                steps: [
                  { expression: "Average rate of change = (f(200) - f(0)) / (200 - 0)", explanation: "Formula for average rate of change" },
                  { expression: "= (2.2 - 1.34) / 200", explanation: "Substitute values" },
                  { expression: "= 0.86 / 200", explanation: "Calculate numerator" },
                  { expression: "= 0.0043 Gs per second", explanation: "Simplify" },
                  { expression: "From 0 to 200 seconds, acceleration increased by 0.0043 Gs per second on average", explanation: "Interpret the result" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. How does the Location Principle help you find intervals where zeros occur?\n2. Why does a polynomial of degree $n$ have at most $n - 1$ turning points?\n3. What information can you determine about a polynomial from its end behavior?\n4. How is the coefficient of determination $r^2$ used to evaluate a regression model?",
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
                    question: "If f(a) < 0 and f(b) > 0 for a polynomial function, what can you conclude?",
                    options: [
                      "There is at least one zero between a and b",
                      "There are no zeros between a and b",
                      "a is a zero of the function",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "A polynomial of degree 4 can have at most how many turning points?",
                    options: ["2", "3", "4", "5"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned about analyzing graphs of polynomial functions. Consider the following:\n\n- How does the Location Principle help you narrow down where zeros are located?\n- What strategies help you identify extrema from a table of values?\n- What questions do you still have about polynomial functions and their graphs?\n\n**Tip**: When analyzing polynomial functions, always start by examining the degree and leading coefficient to understand the end behavior.",
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
