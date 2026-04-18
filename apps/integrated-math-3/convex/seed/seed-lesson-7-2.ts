import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-7-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Adding and Subtracting Rational Expressions",
          slug: lessonSlug,
          description:
            "Students simplify rational expressions by adding and subtracting, and simplify complex fractions.",
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
          title: "Adding and Subtracting Rational Expressions",
          description:
            "Students simplify rational expressions by adding and subtracting, and simplify complex fractions.",
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
                "## Explore: Closure of Rational Expressions\n\nUse the interactive tool to complete the explore.\n\n**Inquiry Question:**\nIf you multiply, divide, add, or subtract two rational expressions, is the result also a rational expression?",
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
                title: "Rational Expressions",
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
                "## Key Terms\n\n- **Rational expression**: A ratio of two polynomial expressions.\n- **Least common denominator**: The least common multiple of the denominators of two or more fractions.\n- **Like denominators**: Denominators that are the same.\n- **Unlike denominators**: Denominators that are different.\n- **Complex fraction**: A rational expression whose numerator and/or denominator is also a rational expression.\n- **Simplified form**: A rational expression with no common factors other than 1 in the numerator and denominator.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Adding and Subtracting Rational Expressions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Adding and Subtracting Rational Expressions\n\nTo add or subtract rational expressions with unlike denominators, first find the least common denominator, rewrite each expression using the LCD, and then combine the numerators.\n\n### Key Concept: Adding Rational Expressions\n\n`a/b + c/d = (ad + bc) / bd`\n\n### Key Concept: Subtracting Rational Expressions\n\n`a/b - c/d = (ad - bc) / bd`",
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
                "## Example 1 — Add and Subtract Rational Expressions with Monomial Denominators\n\nSimplify each expression.\n\n### a. `(7a / 4b) + (4c^2 / 10)`\n\nThe LCD is `20b`.\n\nRewrite:\n\n`35a / 20b + 8bc^2 / 20b`\n\nCombine:\n\n`(35a + 8bc^2) / 20b`\n\n### b. `(2x / 9y) - (7y / 6z)`\n\nThe LCD is `18yz`.\n\nRewrite:\n\n`4xz / 18yz - 21y^2 / 18yz`\n\nCombine:\n\n`(4xz - 21y^2) / 18yz`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(7a / 4b) + (4c^2 / 10)",
                steps: [
                  { expression: "(7a / 4b) + (4c^2 / 10)", explanation: "Start with the sum of rational expressions" },
                  { expression: "LCD = 20b", explanation: "Find the least common denominator" },
                  { expression: "35a / 20b + 8bc^2 / 20b", explanation: "Rewrite each fraction with the LCD" },
                  { expression: "(35a + 8bc^2) / 20b", explanation: "Combine the numerators over the common denominator" },
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
                "## Example 2 — Add and Subtract Rational Expressions with Polynomial Denominators\n\nSimplify\n\n`(2x + 1) / (x^2 + 2x - 15) - 7 / (5x - 15)`\n\nFactor the denominators:\n\n* `x^2 + 2x - 15 = (x - 3)(x + 5)`\n* `5x - 15 = 5(x - 3)`\n\nThe LCD is:\n\n`5(x - 3)(x + 5)`\n\nRewrite and combine:\n\n`(5(2x + 1) - 7(x + 5)) / (5(x - 3)(x + 5))`\n\n`= (10x + 5 - 7x - 35) / (5(x - 3)(x + 5))`\n\n`= (3x - 30) / (5(x - 3)(x + 5))`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(2x + 1) / (x^2 + 2x - 15) - 7 / (5x - 15)",
                steps: [
                  { expression: "(2x + 1) / (x^2 + 2x - 15) - 7 / (5x - 15)", explanation: "Start with the difference of rational expressions" },
                  { expression: "x^2 + 2x - 15 = (x - 3)(x + 5)", explanation: "Factor the first denominator" },
                  { expression: "5x - 15 = 5(x - 3)", explanation: "Factor the second denominator" },
                  { expression: "LCD = 5(x - 3)(x + 5)", explanation: "Find the least common denominator" },
                  { expression: "(5(2x + 1) - 7(x + 5)) / (5(x - 3)(x + 5))", explanation: "Rewrite each fraction with the LCD and combine numerators" },
                  { expression: "(3x - 30) / (5(x - 3)(x + 5))", explanation: "Simplify the numerator" },
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
                "## Example 3 — Use Addition and Subtraction of Rational Expressions\n\nThe rate at which some oil wells pump oil can be modeled by:\n\n`20/x + 200x/(3x^2 + 20)`\n\nSimplify the expression.\n\nUse the LCD `x(3x^2 + 20)`:\n\n`20(3x^2 + 20) / (x(3x^2 + 20)) + 200x(x) / (x(3x^2 + 20))`\n\nCombine:\n\n`(60x^2 + 400 + 200x^2) / (3x^3 + 20x)`\n\n`= (260x^2 + 400) / (3x^3 + 20x)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "20/x + 200x/(3x^2 + 20)",
                steps: [
                  { expression: "20/x + 200x/(3x^2 + 20)", explanation: "Start with the sum of rates" },
                  { expression: "LCD = x(3x^2 + 20)", explanation: "Find the least common denominator" },
                  { expression: "20(3x^2 + 20) / (x(3x^2 + 20)) + 200x^2 / (x(3x^2 + 20))", explanation: "Rewrite each fraction with the LCD" },
                  { expression: "(60x^2 + 400 + 200x^2) / (3x^3 + 20x)", explanation: "Combine the numerators" },
                  { expression: "(260x^2 + 400) / (3x^3 + 20x)", explanation: "Simplify the numerator" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn: Simplifying Complex Fractions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Simplifying Complex Fractions\n\nComplex fractions can be simplified in two main ways:\n\n* Simplify the numerator and denominator separately, then divide.\n* Multiply numerator and denominator by a common LCD to clear all smaller denominators.",
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
                "## Example 4 — Simplify Complex Fractions by Using Different LCDs\n\nSimplify\n\n`((x/y) + 1) / ((y/x) - (1/y))`\n\n### Step 1: Determine the LCDs\n\n* LCD of the numerator: `y`\n* LCD of the denominator: `xy`\n\n### Step 2: Simplify\n\n`((x + y)/y) / ((y^2 - x)/(xy))`\n\nRewrite as division:\n\n`((x + y)/y) * (xy/(y^2 - x))`\n\nSimplify:\n\n`x(x + y) / (y^2 - x)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "((x/y) + 1) / ((y/x) - (1/y))",
                steps: [
                  { expression: "((x/y) + 1) / ((y/x) - (1/y))", explanation: "Start with the complex fraction" },
                  { expression: "LCD of numerator = y, LCD of denominator = xy", explanation: "Determine the LCDs for numerator and denominator" },
                  { expression: "((x + y)/y) / ((y^2 - x)/(xy))", explanation: "Simplify numerator and denominator separately" },
                  { expression: "((x + y)/y) * (xy/(y^2 - x))", explanation: "Rewrite as multiplication by the reciprocal" },
                  { expression: "x(x + y) / (y^2 - x)", explanation: "Multiply and simplify" },
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
                "## Example 5 — Simplify Complex Fractions by Using the Same LCD\n\nSimplify\n\n`((x/y) + (2/x)) / ((x/2) - (y/x))`\n\nThe denominators involved are `2`, `x`, and `y`, so the LCD is `2xy`.\n\nMultiply numerator and denominator by `2xy`:\n\n* numerator becomes `2x^2 + 4y`\n* denominator becomes `x^2y - 2y^2`\n\nSo the simplified expression is:\n\n`(2x^2 + 4y) / (x^2y - 2y^2)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "((x/y) + (2/x)) / ((x/2) - (y/x))",
                steps: [
                  { expression: "((x/y) + (2/x)) / ((x/2) - (y/x))", explanation: "Start with the complex fraction" },
                  { expression: "LCD = 2xy", explanation: "Find the LCD of all denominators" },
                  { expression: "Multiply numerator and denominator by 2xy", explanation: "Clear the smaller denominators" },
                  { expression: "(2x^2 + 4y) / (x^2y - 2y^2)", explanation: "Simplify the resulting expression" },
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
              markdown:
                "## Discussion Questions\n\n1. How do you determine excluded values for a rational expression?\n2. Why must you factor before simplifying?\n3. How is multiplying rational expressions different from adding them?\n4. What is the role of the reciprocal when dividing rational expressions?",
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
                    question: "What is the first step when adding rational expressions with unlike denominators?",
                    options: ["Add the numerators directly", "Find the least common denominator", "Simplify the result"],
                    correctIndex: 1,
                  },
                  {
                    question: "To simplify a complex fraction, you can multiply the numerator and denominator by:",
                    options: ["The greatest common factor", "The least common denominator", "The sum of the denominators"],
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
              markdown:
                "## Reflection\n\nToday you learned about adding and subtracting rational expressions. Consider the following:\n\n- How do you add rational expressions with unlike denominators?\n- How do you subtract rational expressions with unlike denominators?\n- What are two ways to simplify complex fractions?\n- What questions do you still have about rational expressions?",
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
