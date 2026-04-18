import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-6-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 6,
          title: "Properties of Logarithms",
          slug: lessonSlug,
          description: "Students solve logarithmic equations using properties of equality, and simplify expressions using properties of logarithms.",
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
          title: "Properties of Logarithms",
          description: "Students solve logarithmic equations using properties of equality, and simplify expressions using properties of logarithms.",
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
                "## Explore: Logarithmic Expressions and Equations\n\nUse the interactive tool to complete the explore.\n\n**Inquiry Question:**\nHow can you determine `logb(xy)` and `logb(x/y)` given `logb x` and `logb y`?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = log_b(x)",
                title: "Logarithmic Functions",
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
                "## Key Terms\n\n- **Logarithmic equation**: An equation that contains one or more logarithms",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Logarithmic Equations",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Logarithmic Equations\n\nA **logarithmic equation** contains one or more logarithms.\n\n### Key Concept: Property of Equality for Logarithmic Equations\n\nIf `b` is a positive number other than `1`, then:\n\n`logb x = logb y` if and only if `x = y`\n\nThis property also holds true for inequalities.",
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
                "## Example 1 — Solve a Logarithmic Equation by Using Definitions\n\nSolve:\n\n`log4 x = 5/2`\n\nRewrite in exponential form:\n\n`x = 4^(5/2)`\n\nBecause `4 = 2^2`,\n\n`x = (2^2)^(5/2)`\n\n`x = 2^5`\n\n`x = 32`\n\n### Check\n\nSolve: `log13(-5x) = log13(-2x^2 + 3)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log4 x = 5/2",
                steps: [
                  { expression: "log4 x = 5/2", explanation: "Start with the logarithmic equation" },
                  { expression: "x = 4^(5/2)", explanation: "Rewrite in exponential form" },
                  { expression: "4 = 2^2", explanation: "Express the base as a power of its square root" },
                  { expression: "x = (2^2)^(5/2) = 2^5", explanation: "Apply the power of a power rule" },
                  { expression: "x = 32", explanation: "Simplify to get the final answer" },
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
                "## Example 2 — Solve a Logarithmic Equation by Using Properties of Equality\n\nSolve: `log5(2x^2 - 6) = log5(4x)`\n\n### Step 1: Solve for `x`\n\nBecause the bases are the same:\n\n`2x^2 - 6 = 4x`\n\n`2x^2 - 4x - 6 = 0`\n\n`x^2 - 2x - 3 = 0`\n\n`(x - 3)(x + 1) = 0`\n\nSo `x = 3` or `x = -1`\n\n### Step 2: Check for extraneous solutions\n\nFor `x = 3`: `log5(12) = log5(12)` ✓\n\nFor `x = -1`: `log5(-4)` is undefined ✗\n\nFinal answer: `x = 3`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log5(2x^2 - 6) = log5(4x)",
                steps: [
                  { expression: "2x^2 - 6 = 4x", explanation: "Apply Property of Equality since bases match" },
                  { expression: "2x^2 - 4x - 6 = 0", explanation: "Move all terms to one side" },
                  { expression: "x^2 - 2x - 3 = 0", explanation: "Divide by 2" },
                  { expression: "(x - 3)(x + 1) = 0", explanation: "Factor the quadratic" },
                  { expression: "x = 3 or x = -1", explanation: "Apply zero product property" },
                  { expression: "x = 3 (valid), x = -1 (extraneous)", explanation: "Check each solution in original equation" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Properties of Logarithms",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Properties of Logarithms\n\nBecause logarithms are exponents, the properties of logarithms can be derived from the properties of exponents.\n\n### Key Concept: Product Property of Logarithms\n\nThe logarithm of a product is the sum of the logarithms of its factors.\n\n`logb(mn) = logb m + logb n`\n\n### Key Concept: Quotient Property of Logarithms\n\nThe logarithm of a quotient is the difference of the logarithms of the numerator and denominator.\n\n`logb(m/n) = logb m - logb n`\n\n### Key Concept: Power Property of Logarithms\n\nThe logarithm of a power is the product of the logarithm and the exponent.\n\n`logb(m^n) = n logb m`",
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
              markdown:
                "## Example 3 — Product Property of Logarithms\n\nUse `log3 5 ≈ 1.465` to approximate `log3 405`.\n\nFactor:\n\n`405 = 3^4 * 5`\n\nThen:\n\n`log3 405 = log3(3^4 * 5)`\n\n`= log3(3^4) + log3 5`\n\n`= 4 + log3 5`\n\n`≈ 4 + 1.465`\n\n`≈ 5.465`\n\n### Check\n\nUse `log8 5 ≈ 0.7740` to approximate `log8 320`.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log3 405",
                steps: [
                  { expression: "405 = 3^4 * 5", explanation: "Factor 405 into a power of 3 and 5" },
                  { expression: "log3 405 = log3(3^4 * 5)", explanation: "Apply the factorization" },
                  { expression: "= log3(3^4) + log3 5", explanation: "Apply the Product Property of Logarithms" },
                  { expression: "= 4 + log3 5", explanation: "Simplify log3(3^4) to 4" },
                  { expression: "≈ 4 + 1.465 = 5.465", explanation: "Substitute the given approximation" },
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
              markdown:
                "## Example 4 — Quotient Property of Logarithms\n\nUse `log3 5 ≈ 1.465` to approximate `log3(9/5)`.\n\nRewrite:\n\n`9/5 = 3^2 / 5`\n\nThen:\n\n`log3(9/5) = log3(3^2 / 5)`\n\n`= log3(3^2) - log3 5`\n\n`= 2 - log3 5`\n\n`≈ 2 - 1.465`\n\n`≈ 0.535`\n\n### Check\n\nUse `log6 5 ≈ 0.8982` to approximate `log6(5/1296)`.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log3(9/5)",
                steps: [
                  { expression: "9/5 = 3^2 / 5", explanation: "Express 9 as a power of 3" },
                  { expression: "log3(9/5) = log3(3^2 / 5)", explanation: "Apply the rewritten form" },
                  { expression: "= log3(3^2) - log3 5", explanation: "Apply the Quotient Property of Logarithms" },
                  { expression: "= 2 - log3 5", explanation: "Simplify log3(3^2) to 2" },
                  { expression: "≈ 2 - 1.465 = 0.535", explanation: "Substitute the given approximation" },
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
                "## Example 5 — Power Property of Logarithms\n\nUse `log2 6 ≈ 2.585` to approximate `log2 1296`.\n\nBecause:\n\n`1296 = 6^4`\n\nThen:\n\n`log2 1296 = log2(6^4)`\n\n`= 4 log2 6`\n\n`≈ 4(2.585)`\n\n`≈ 10.34`\n\n### Check\n\nUse `log2 3 ≈ 1.5850` to approximate `log2 243`.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log2 1296",
                steps: [
                  { expression: "1296 = 6^4", explanation: "Recognize that 1296 is a power of 6" },
                  { expression: "log2 1296 = log2(6^4)", explanation: "Rewrite using the factorization" },
                  { expression: "= 4 log2 6", explanation: "Apply the Power Property of Logarithms" },
                  { expression: "≈ 4(2.585) = 10.34", explanation: "Substitute the given approximation" },
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
                "## Apply Example 6 — Solve a Logarithmic Equation by Using Properties\n\nThe loudness of a sound `L` in decibels is defined by:\n\n`L = 10 log10 R`\n\nwhere `R` is the relative intensity of the sound.\n\nA choir director wants to determine how many choir members could sing while maintaining a safe level of sound, about `80` decibels. If one person has a relative intensity of `10^6` when singing, then how many people could sing with the same relative intensity to achieve a loudness of `80` decibels?\n\n### 1. What is the task?\n\nDescribe the task in your own words and identify the needed information.\n\n### 2. How will you approach the task?\n\nRepresent the total relative intensity `R` in terms of the number of singers `x`, then solve the equation.\n\n### 3. What is your solution?\n\nIf one singer has relative intensity `10^6`, then a choir with `x` members has:\n\n`R = x * 10^6`\n\nSubstitute into the loudness formula:\n\n`80 = 10 log10(x * 10^6)`\n\nDivide by `10`:\n\n`8 = log10(x * 10^6)`\n\nWrite in exponential form:\n\n`10^8 = x * 10^6`\n\nSo:\n\n`x = 10^2 = 100`\n\nA choir of `100` members would reach `80` decibels.\n\n### 4. How can you know that your solution is reasonable?\n\nCheck by substituting `x = 100`:\n\n`R = 100(10^6) = 10^8`\n\n`L = 10 log10(10^8) = 10(8) = 80` ✓",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "L = 10 log10(x * 10^6)",
                steps: [
                  { expression: "R = x * 10^6", explanation: "Total relative intensity with x singers" },
                  { expression: "80 = 10 log10(x * 10^6)", explanation: "Substitute into the loudness formula" },
                  { expression: "8 = log10(x * 10^6)", explanation: "Divide both sides by 10" },
                  { expression: "10^8 = x * 10^6", explanation: "Rewrite in exponential form" },
                  { expression: "x = 10^2 = 100", explanation: "Solve for x" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Why does the Property of Equality for Logarithmic Equations require `b > 0` and `b ≠ 1`?\n2. How is the Product Property of Logarithms related to the Product Property of Exponents?\n3. How can you determine if a solution to a logarithmic equation is extraneous?",
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
                    question: "If logb x = logb y, what must be true about x and y?",
                    options: ["x = y", "x = -y", "x = 1/y"],
                    correctIndex: 0,
                  },
                  {
                    question: "What property allows you to rewrite logb(m^n) as n logb(m)?",
                    options: ["Product Property", "Quotient Property", "Power Property"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about properties of logarithms. Consider the following:\n\n- How do the Product, Quotient, and Power Properties of Logarithms relate to their exponential counterparts?\n- Why is checking for extraneous solutions important when solving logarithmic equations?\n- What questions do you still have about properties of logarithms?",
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