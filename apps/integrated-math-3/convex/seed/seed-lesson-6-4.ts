import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-6-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 6,
          title: "Natural Logarithms",
          slug: lessonSlug,
          description:
            "Students simplify expressions with natural logarithms and solve exponential equations by using natural logarithms.",
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
          title: "Natural Logarithms",
          description:
            "Students simplify expressions with natural logarithms and solve exponential equations by using natural logarithms.",
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
                "## Explore: Using a Scatter Plot to Analyze Data\n\nUse the video to complete the explore.\n\n**Inquiry Question:**\nHow can you use a scatter plot to determine the type of function that best models a set of data?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = ln(x)",
                title: "Natural Logarithms",
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
                "## Key Terms\n\n- **Natural base exponential function**: An exponential function with base `e`, written as `y = e^x`.\n- **Natural logarithm**: The inverse of a natural base exponential function, written as `ln x`.\n\nThe same properties that apply to logarithms with base `b` also apply to natural logarithms.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Simplifying Expressions with Natural Logarithms",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Natural Logarithms\n\nAn exponential function with base `e`, written as `y = e^x`, is called a **natural base exponential function**.\n\nThe inverse of a natural base exponential function is a **natural logarithm**, written:\n\n`ln x`\n\nThe same properties that apply to logarithms with base `b` also apply to natural logarithms.\n\n### Think About It\n\nWhy do the same properties that apply to logarithms with base `b` also apply to natural logarithms?",
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
              markdown:
                "## Example 1 — Write Equivalent Logarithmic Equations\n\nWrite each exponential equation in logarithmic form.\n\n### a. `e^x = 14`\n\n`ln 14 = x`\n\n### b. `e^7 = x`\n\n`ln x = 7`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "e^x = 14",
                steps: [
                  { expression: "e^x = 14", explanation: "Start with the exponential equation" },
                  { expression: "ln 14 = x", explanation: "Take the natural logarithm of both sides" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Write Equivalent Exponential Equations\n\nWrite each logarithmic equation in exponential form.\n\n### a. `ln 9 = x`\n\n`9 = e^x`\n\n### b. `ln x ≈ 1.7347`\n\n`x ≈ e^1.7347`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "ln 9 = x",
                steps: [
                  { expression: "ln 9 = x", explanation: "Start with the natural logarithm equation" },
                  { expression: "9 = e^x", explanation: "Rewrite in exponential form using base e" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Simplify Logarithmic Expressions\n\nWrite\n\n`(1/3) ln 8 - ln 3 + ln 9`\n\nas a single logarithm.\n\nUse the Power Property:\n\n`= ln(8^(1/3)) - ln 3 + ln 9`\n\n`= ln 2 - ln 3 + ln 9`\n\nUse the Quotient Property:\n\n`= ln(2/3) + ln 9`\n\nUse the Product Property:\n\n`= ln 6`\n\nSo:\n\n`(1/3) ln 8 - ln 3 + ln 9 = ln 6`\n\n### Check\n\nWrite `ln 7 - (1/3) ln 27 + ln 6` as a single logarithm.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(1/3) ln 8 - ln 3 + ln 9",
                steps: [
                  { expression: "(1/3) ln 8 - ln 3 + ln 9", explanation: "Start with the expression" },
                  { expression: "= ln(8^(1/3)) - ln 3 + ln 9", explanation: "Apply the Power Property: (1/3) ln 8 = ln(8^(1/3)) = ln 2" },
                  { expression: "= ln 2 - ln 3 + ln 9", explanation: "Simplify ln(8^(1/3)) to ln 2" },
                  { expression: "= ln(2/3) + ln 9", explanation: "Apply the Quotient Property: ln 2 - ln 3 = ln(2/3)" },
                  { expression: "= ln 6", explanation: "Apply the Product Property: ln(2/3) + ln 9 = ln(2/3 · 9) = ln 6" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn: Solving Exponential Equations by Using Natural Logarithms",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Solving Exponential Equations by Using Natural Logarithms\n\nBecause an exponential function with base `e` is the inverse of the natural logarithm function:\n\n* `e^(ln x) = x`\n* `ln(e^x) = x`\n\nThis allows exponential equations with base `e` to be solved using natural logarithms.\n\n### Think About It\n\nElliott says that `ln(e^(3x))` equals `3x`. Is he correct? Explain.",
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
              markdown:
                "## Example 4 — Solve Exponential Equations with Base `e`\n\nSolve:\n\n`-2e^(x + 3) + 8 = -14`\n\nRound to the nearest ten-thousandth.\n\nSubtract `8`:\n\n`-2e^(x + 3) = -22`\n\nDivide by `-2`:\n\n`e^(x + 3) = 11`\n\nTake natural logarithms:\n\n`ln(e^(x + 3)) = ln 11`\n\n`x + 3 = ln 11`\n\n`x + 3 ≈ 2.3979`\n\n`x ≈ -0.6021`\n\n### Check\n\nSolve `6e^(0.25x + 3) = 26`. Round to the nearest ten-thousandth.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "-2e^{x+3} + 8 = -14",
                steps: [
                  { expression: "-2e^(x+3) + 8 = -14", explanation: "Start with the equation" },
                  { expression: "-2e^(x+3) = -22", explanation: "Subtract 8 from both sides" },
                  { expression: "e^(x+3) = 11", explanation: "Divide both sides by -2" },
                  { expression: "ln(e^(x+3)) = ln 11", explanation: "Take the natural logarithm of both sides" },
                  { expression: "x + 3 = ln 11", explanation: "Simplify ln(e^(x+3)) = x+3" },
                  { expression: "x + 3 ≈ 2.3979", explanation: "Evaluate ln 11 using a calculator" },
                  { expression: "x ≈ -0.6021", explanation: "Subtract 3 from both sides" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Solve Natural Logarithmic Equations\n\nSolve:\n\n`(1/6) ln(5x) = 2`\n\nRound to the nearest ten-thousandth.\n\nMultiply both sides by `6`:\n\n`ln(5x) = 12`\n\nRewrite exponentially:\n\n`e^(ln(5x)) = e^12`\n\n`5x = e^12`\n\n`x = e^12 / 5`\n\n`x ≈ 32,550.9583`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(1/6) ln(5x) = 2",
                steps: [
                  { expression: "(1/6) ln(5x) = 2", explanation: "Start with the equation" },
                  { expression: "ln(5x) = 12", explanation: "Multiply both sides by 6" },
                  { expression: "e^(ln(5x)) = e^12", explanation: "Rewrite in exponential form" },
                  { expression: "5x = e^12", explanation: "Simplify e^(ln(5x)) = 5x" },
                  { expression: "x = e^12 / 5", explanation: "Divide both sides by 5" },
                  { expression: "x ≈ 32550.9583", explanation: "Evaluate using a calculator" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Apply Functions with Base `e`\n\nNewton's Law of Cooling is modeled by:\n\n`T(t) = Ta + (T0 - Ta)e^(-0.032t)`\n\nwhere:\n\n* `T0` is the initial temperature\n* `Ta` is the ambient temperature\n* `t` is time in minutes\n\n### Part A: Evaluate the function\n\nFind the temperature of soup that is initially `200°F` in a room that is `72°F` after `30` minutes.\n\nSubstitute:\n\n`T(t) = 72 + (200 - 72)e^(-0.032(30))`\n\n`≈ 121`\n\nAfter `30` minutes, the soup will be about `121°F`.\n\n### Part B: Evaluate the function for `t`\n\nIf the soup must be at least `180°F` when served, and it starts at `200°F` in a `72°F` room, how long can the server wait?\n\nSet up the inequality:\n\n`180 <= 72 + (200 - 72)e^(-0.032t)`\n\n`108 <= 128e^(-0.032t)`\n\n`0.84375 <= e^(-0.032t)`\n\nTake natural logarithms:\n\n`ln 0.84375 <= -0.032t`\n\nDivide by `-0.032` and reverse the inequality:\n\n`t <= ln(0.84375) / (-0.032)`\n\n`t <= 5.3`\n\nThe server should serve the soup within `5.3` minutes.\n\n### Part C: Evaluate the function for `T0`\n\nIf the room is increased to `75°F` and the servers need at least `7` minutes while the soup stays `180°F` or warmer, what initial soup temperature is needed?\n\nSet up the inequality:\n\n`180 <= 75 + (T0 - 75)e^(-0.032(7))`\n\n`105 <= (T0 - 75)e^(-0.224)`\n\n`T0 >= 206.4`\n\nThe soup must start at least `206.4°F`.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "T(t) = 72 + 128e^(-0.032t)",
                steps: [
                  { expression: "T(t) = 72 + (200-72)e^(-0.032t)", explanation: "Newton's Law of Cooling with T0=200, Ta=72" },
                  { expression: "T(30) = 72 + 128e^(-0.032(30))", explanation: "Substitute t=30 minutes" },
                  { expression: "= 72 + 128e^(-0.96)", explanation: "Multiply -0.032 by 30" },
                  { expression: "≈ 72 + 128(0.382)", explanation: "Evaluate e^(-0.96)" },
                  { expression: "≈ 72 + 48.9 ≈ 121°F", explanation: "Calculate final temperature" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Examine Logarithmic Data\n\nThe table shows the percentage of people in the U.S. who play games on mobile phones in the years since `2010`.\n\n| Years Since 2010 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |\n| -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |\n| Population (%) | 25.9 | 33.9 | 40.9 | 46.3 | 51.3 | 55.7 | 58.9 | 61.6 | 63.1 | 63.7 |\n\n### Step 1: Enter the data\n\nEnter years into `L1` and percentages into `L2`.\n\n### Step 2: Make a scatter plot\n\nThe scatter plot suggests a curved trend that approximates a natural logarithmic function.\n\n### Step 3: Determine the function of best fit\n\nPerform a natural logarithmic regression.\n\nThe regression equation is:\n\n`y = 23.3237 + 17.7473 ln x`\n\nThe coefficient of determination is:\n\n`r ≈ 0.9934`\n\nThis is a very strong fit.\n\n### Step 4: Evaluate using the regression function\n\nUse the table to predict the percentage for `x = 15`, which corresponds to the year `2025`.\n\nPrediction:\n\nAbout `71.4%` of people in America will play games on a phone in `2025`.\n\n### Step 5: Analyze the graph\n\nKey features of the regression model:\n\n* domain: `{x | x > 0}`\n* range: `{y | y > 0}` in context\n* x-intercept: `0.2687`\n* y-intercept: none\n* increasing: `{x | x > 0}`\n* positive: `{x | x > 0.2687}`\n* negative: `{x | 0 < x < 0.2687}`\n* end behavior: as `x -> infinity`, `y -> infinity`\n\n### Watch Out\n\nThe function has all real numbers as its range, but in context only values from `0` to `100` make sense because `y` represents a percent.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = 23.3237 + 17.7473 ln x",
                steps: [
                  { expression: "y = 23.3237 + 17.7473 ln(15)", explanation: "Substitute x = 15 for year 2025" },
                  { expression: "= 23.3237 + 17.7473(2.708)", explanation: "Evaluate ln(15)" },
                  { expression: "≈ 23.3237 + 48.076", explanation: "Multiply" },
                  { expression: "≈ 71.4%", explanation: "Predict percentage for year 2025" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Why are natural logarithms useful for solving exponential equations with base `e`?\n2. How does the natural logarithm function differ from other logarithmic functions?\n3. In what real-world contexts might you use natural logarithms?\n\n### Think About It\n\nWill the soup ever become colder than the ambient temperature of the restaurant? Explain.",
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
                    question: "What is the value of ln(e^3)?",
                    options: ["3", "e^3", "1"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which equation is equivalent to ln(x) = 5?",
                    options: ["x = e^5", "x = ln(5)", "e = x^5"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 13,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about natural logarithms. Consider the following:\n\n- How do natural logarithms relate to the natural base exponential function?\n- What strategies help when solving exponential equations with base `e`?\n- What questions do you still have about natural logarithms?",
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