import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_6Result> => {
    const now = Date.now();
    const lessonSlug = "module-7-lesson-6";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Solving Rational Equations and Inequalities",
          slug: lessonSlug,
          description:
            "Students solve rational equations and inequalities in one variable, and identify extraneous solutions.",
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
          title: "Solving Rational Equations and Inequalities",
          description:
            "Students solve rational equations and inequalities in one variable, and identify extraneous solutions.",
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
                "## Explore: Solving Rational Equations\n\nUse a real-world situation to complete the explore.\n\n**Inquiry Question:**\nHow can you solve rational equations by graphing?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = 1/x",
                title: "Solving Rational Equations",
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
                "## Key Terms\n\n- **Rational equation**: An equation that contains at least one rational expression.\n- **Rational inequality**: An inequality that contains at least one rational expression.\n- **Extraneous solution**: A solution that does not satisfy the original equation, often created when multiplying both sides by a variable expression.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Solving Rational Equations",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Solving Rational Equations\n\nA **rational equation** contains at least one rational expression.\n\nThese are usually solved by multiplying both sides by the least common denominator to eliminate fractions. This can create extraneous solutions, so answers must be checked against the original equation.\n\nCommon contexts include:\n\n- mixture problems\n- uniform motion problems\n- work problems",
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
                "## Example 1 — Solve a Rational Equation\n\nSolve:\n\n`7/12 + 9/(x - 4) = 55/48`\n\nThe LCD is `48(x - 4)`.\n\nMultiply through and simplify:\n\n`28x - 112 + 432 = 55x - 220`\n\n`28x + 320 = 55x - 220`\n\n`540 = 27x`\n\n`x = 20`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "7/12 + 9/(x - 4) = 55/48",
                steps: [
                  { expression: "7/12 + 9/(x - 4) = 55/48", explanation: "Identify the LCD as 48(x - 4)" },
                  { expression: "28x - 112 + 432 = 55x - 220", explanation: "Multiply both sides by the LCD and distribute" },
                  { expression: "28x + 320 = 55x - 220", explanation: "Combine like terms on the left side" },
                  { expression: "540 = 27x", explanation: "Subtract 28x and add 220 to both sides" },
                  { expression: "x = 20", explanation: "Divide both sides by 27" },
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
                "## Example 2 — Solve a Rational Equation with an Extraneous Solution\n\nSolve:\n\n`2m/(m - 4) - (m^2 + 7m + 4)/(3m^2 - 18m + 24) = 4m/(3m - 6)`\n\nUse the LCD `(m - 4)(3m - 6)`.\n\nAfter simplifying:\n\n`m^2 - 3m - 4 = 0`\n\n`(m - 4)(m + 1) = 0`\n\nPossible solutions:\n\n- `m = 4`\n- `m = -1`\n\nBut `m = 4` makes a denominator `0`, so it is extraneous.\n\nFinal answer: `m = -1`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "2m/(m - 4) - (m^2 + 7m + 4)/(3m^2 - 18m + 24) = 4m/(3m - 6)",
                steps: [
                  { expression: "LCD = (m - 4)(3m - 6)", explanation: "Factor denominators to find the LCD" },
                  { expression: "m^2 - 3m - 4 = 0", explanation: "Multiply through by the LCD and simplify" },
                  { expression: "(m - 4)(m + 1) = 0", explanation: "Factor the quadratic equation" },
                  { expression: "m = 4 or m = -1", explanation: "Apply the Zero Product Property" },
                  { expression: "m = -1", explanation: "Check denominators: m = 4 is extraneous" },
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
                "## Example 3 — Mixture Problem\n\nYou are adding a `50%` isopropyl alcohol liquid to `200` mL of a liquid that is `91%` isopropyl alcohol to create a `70%` solution. How much of the `50%` liquid should be added?\n\nLet `x` be the amount added.\n\nSet up the rational equation:\n\n`0.70 = (182 + 0.5x) / (200 + x)`\n\nMultiply by `100(200 + x)` and solve:\n\n`14,000 + 70x = 18,200 + 50x`\n\n`x = 210`\n\nSo `210` milliliters of the `50%` liquid should be added.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "0.70 = (182 + 0.5x) / (200 + x)",
                steps: [
                  { expression: "0.70 = (182 + 0.5x) / (200 + x)", explanation: "Set up the mixture equation" },
                  { expression: "14,000 + 70x = 18,200 + 50x", explanation: "Multiply both sides by 100(200 + x)" },
                  { expression: "20x = 4,200", explanation: "Subtract 50x and 14,000 from both sides" },
                  { expression: "x = 210", explanation: "Divide both sides by 20" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Distance Problem\n\nA bat flies `121.8` miles round trip in `5` hours, with an average still-air speed of `25` mph. Determine the wind speed.\n\nEach leg is `60.9` miles.\n\nLet `w` be the wind speed. Then:\n\n`60.9/(25 + w) + 60.9/(25 - w) = 5`\n\nSolve:\n\n`w^2 = 16`\n\n`w = 4` or `w = -4`\n\nThe viable solution is `w = 4`.\n\nSo the wind speed is `4` mph.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "60.9/(25 + w) + 60.9/(25 - w) = 5",
                steps: [
                  { expression: "60.9/(25 + w) + 60.9/(25 - w) = 5", explanation: "Set up the distance equation" },
                  { expression: "60.9(25 - w) + 60.9(25 + w) = 5(25 + w)(25 - w)", explanation: "Multiply by the LCD (25 + w)(25 - w)" },
                  { expression: "3,045 = 5(625 - w^2)", explanation: "Simplify and distribute" },
                  { expression: "w^2 = 16", explanation: "Solve for w squared" },
                  { expression: "w = 4", explanation: "Take the positive solution for wind speed" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Work Problem\n\nIf a `24`-row planter can plant a field in `10` hours and it takes `6` hours when a `16`-row planter is also used, how long would the `16`-row planter take by itself?\n\nLet `p` be the time for the `16`-row planter alone.\n\nSet up the equation:\n\n`1/10 + 1/p = 1/6`\n\nMultiply by `30p`:\n\n`3p + 30 = 5p`\n\n`30 = 2p`\n\n`p = 15`\n\nIt would take the `16`-row planter `15` hours alone.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "1/10 + 1/p = 1/6",
                steps: [
                  { expression: "1/10 + 1/p = 1/6", explanation: "Set up the work equation" },
                  { expression: "3p + 30 = 5p", explanation: "Multiply both sides by the LCD 30p" },
                  { expression: "30 = 2p", explanation: "Subtract 3p from both sides" },
                  { expression: "p = 15", explanation: "Divide both sides by 2" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Learn: Solving Rational Inequalities",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Solving Rational Inequalities\n\nA **rational inequality** contains at least one rational expression.\n\n### Key Concept: Solving Rational Inequalities\n\n1. State the excluded values\n2. Solve the related equation\n3. Use those values to divide the number line into intervals\n4. Test a value in each interval",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Solve a Rational Inequality\n\nSolve:\n\n`x/2 - 5/(x + 1) > (x - 4)/3`\n\n### Step 1: Find the excluded value\n\n`x = -1`\n\n### Step 2: Solve the related equation\n\nAfter clearing denominators and simplifying:\n\n`x^2 + 9x - 22 = 0`\n\n`(x - 2)(x + 11) = 0`\n\nCritical values:\n\n- `x = -11`\n- `x = -1` (excluded)\n- `x = 2`\n\n### Step 3: Test intervals\n\nThe inequality is true on:\n\n- `-11 < x < -1`\n- `x > 2`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x/2 - 5/(x + 1) > (x - 4)/3",
                steps: [
                  { expression: "x = -1 is excluded", explanation: "Find values that make the denominator zero" },
                  { expression: "x^2 + 9x - 22 = 0", explanation: "Solve the related equation by clearing denominators" },
                  { expression: "(x - 2)(x + 11) = 0", explanation: "Factor the quadratic" },
                  { expression: "x = -11, x = -1, x = 2 are critical values", explanation: "Identify all critical values including the excluded value" },
                  { expression: "-11 < x < -1 or x > 2", explanation: "Test intervals and write the solution" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Apply Example 7 — Write and Solve a Rational Inequality\n\nJamila spends `$378` on an embroidery machine and `$1.85` per hat. How many hats must she make so that the average cost per hat is less than or equal to `$5`?\n\nAverage cost inequality:\n\n`(1.85h + 378) / h <= 5`\n\nExcluded value:\n\n- `h = 0`\n\nSolutions to the inequality:\n\n- `h < 0`\n- `h >= 120`\n\nOnly the contextual solution is viable:\n\n`h >= 120`\n\nJamila must make at least `120` hats.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(1.85h + 378) / h <= 5",
                steps: [
                  { expression: "(1.85h + 378) / h <= 5", explanation: "Set up the average cost inequality" },
                  { expression: "h = 0 is excluded", explanation: "Identify the excluded value" },
                  { expression: "1.85h + 378 = 5h", explanation: "Solve the related equation" },
                  { expression: "h = 120", explanation: "Solve for h" },
                  { expression: "h >= 120", explanation: "Only positive values make sense in this context" },
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
                "## Discussion Questions\n\n1. Why must you check for extraneous solutions when solving rational equations?\n2. How is solving a rational inequality different from solving a rational equation?\n3. What role do excluded values play in both rational equations and inequalities?\n4. How can you identify an extraneous solution without substituting every result back into the original equation?",
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
                    question: "What is the first step in solving a rational equation?",
                    options: [
                      "Find the LCD",
                      "Cross multiply immediately",
                      "Divide by the variable",
                      "Add all numerators",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "Which value must be excluded when solving x/(x - 3) = 2?",
                    options: ["x = 0", "x = 2", "x = 3", "x = 6"],
                    correctIndex: 2,
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
                "## Reflection\n\nToday you learned about solving rational equations and inequalities. Consider the following:\n\n- How do you identify extraneous solutions in rational equations?\n- What strategies help you solve rational inequalities correctly?\n- How can you check if your answer makes sense in a real-world rational equation problem?\n- What questions do you still have about rational equations and inequalities?",
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
