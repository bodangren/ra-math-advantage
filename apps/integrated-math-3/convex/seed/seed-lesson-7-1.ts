import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-7-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Multiplying and Dividing Rational Expressions",
          slug: lessonSlug,
          description:
            "Students simplify rational expressions and multiply and divide rational expressions.",
          orderIndex: 1,
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
          title: "Multiplying and Dividing Rational Expressions",
          description:
            "Students simplify rational expressions and multiply and divide rational expressions.",
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
                "## Explore: Simplifying Complex Fractions\n\nUse the interactive tool to explore simplifying complex fractions.\n\n**Inquiry Question:**\nCan you simplify complex fractions that contain polynomials in the numerator or denominator?",
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
                title: "Rational Functions",
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
                "## Key Terms\n\n- **Rational expression**: A ratio of two polynomial expressions.\n- **Complex fraction**: A rational expression whose numerator and/or denominator is also a rational expression.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Simplifying Rational Expressions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Simplifying Rational Expressions\n\nA **rational expression** is a ratio of two polynomial expressions.\n\nTo simplify a rational expression, factor the numerator and denominator and divide out common factors. The original denominator still determines excluded values.\n\n### Key Concept: Simplifying Rational Expressions\n\nTo simplify a rational expression:\n\n1. Factor the numerator and denominator completely\n2. Divide out any common factors\n3. The original denominator determines the excluded values",
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
                "## Example 1 — Simplify a Rational Expression\n\nSimplify\n\n`(x^2 - 2x - 24) / (2x^3 + 6x^2 - 8x)`\n\nand state when the original expression is undefined.\n\n### Part A: Simplify\n\nFactor:\n\n`2x^3 + 6x^2 - 8x = 2x(x^2 + 3x - 4) = 2x(x + 4)(x - 1)`\n\n`x^2 - 2x - 24 = (x + 4)(x - 6)`\n\nSo:\n\n`((x + 4)(x - 6)) / (2x(x + 4)(x - 1)) = (x - 6) / (2x(x - 1))`\n\n### Part B: State when the expression is undefined\n\nThe original denominator is `0` when:\n\n* `x = 0`\n* `x = -4`\n* `x = 1`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(x^2 - 2x - 24) / (2x^3 + 6x^2 - 8x)",
                steps: [
                  { expression: "(x^2 - 2x - 24) / (2x^3 + 6x^2 - 8x)", explanation: "Start with the rational expression" },
                  { expression: "x^2 - 2x - 24 = (x + 4)(x - 6)", explanation: "Factor the numerator" },
                  { expression: "2x^3 + 6x^2 - 8x = 2x(x + 4)(x - 1)", explanation: "Factor the denominator" },
                  { expression: "((x + 4)(x - 6)) / (2x(x + 4)(x - 1))", explanation: "Write with factored forms" },
                  { expression: "(x - 6) / (2x(x - 1))", explanation: "Divide out common factor (x + 4)" },
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
                "## Example 2 — Simplify by Using `-1`\n\nSimplify\n\n`((6x^2 - 5xy)(x + 2y)) / ((x + y)(5y - 6x))`\n\nFactor:\n\n`6x^2 - 5xy = x(6x - 5y)`\n\nSince:\n\n`6x - 5y = -(5y - 6x)`\n\nrewrite and simplify:\n\n`(x(6x - 5y)(x + 2y)) / ((x + y)(5y - 6x)) = (-x)(x + 2y) / (x + y)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "((6x^2 - 5xy)(x + 2y)) / ((x + y)(5y - 6x))",
                steps: [
                  { expression: "((6x^2 - 5xy)(x + 2y)) / ((x + y)(5y - 6x))", explanation: "Start with the rational expression" },
                  { expression: "6x^2 - 5xy = x(6x - 5y)", explanation: "Factor numerator" },
                  { expression: "6x - 5y = -(5y - 6x)", explanation: "Rewrite to match denominator factor" },
                  { expression: "(x(6x - 5y)(x + 2y)) / ((x + y)(5y - 6x))", explanation: "Substitute factored forms" },
                  { expression: "(-x)(x + 2y) / (x + y)", explanation: "Divide out common factor and simplify" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Multiplying and Dividing Rational Expressions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Multiplying and Dividing Rational Expressions\n\n### Key Concept: Multiplying Rational Expressions\n\nTo multiply rational expressions, multiply the numerators and the denominators.\n\n`(a/b) * (c/d) = ac / bd`\n\n### Key Concept: Dividing Rational Expressions\n\nTo divide rational expressions, multiply by the reciprocal of the divisor.\n\n`(a/b) / (c/d) = (a/b) * (d/c) = ad / bc`\n\nA **complex fraction** is a rational expression whose numerator and/or denominator is also a rational expression.",
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
                "## Example 3 — Multiply and Divide Rational Expressions\n\nSimplify each expression.\n\n### a. `(3x / 8y) * (12x^2y / 9xy^3)`\n\nFactor and divide out common factors to get:\n\n`x^2 / (2y^3)`\n\n### b. `(10d^5 / 6cd) / (30c^3d^2 / 4c)`\n\nRewrite as multiplication by the reciprocal and simplify:\n\n`2d^2 / (9c^3)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(3x / 8y) * (12x^2y / 9xy^3)",
                steps: [
                  { expression: "(3x / 8y) * (12x^2y / 9xy^3)", explanation: "Start with the product of rational expressions" },
                  { expression: "(3x * 12x^2y) / (8y * 9xy^3)", explanation: "Multiply numerators and denominators" },
                  { expression: "36x^3y / (72x y^3)", explanation: "Simplify the product" },
                  { expression: "x^2 / (2y^3)", explanation: "Divide out common factors (36/72 = 1/2, x^3/x = x^2, y/y^3 = 1/y^2)" },
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
                "## Example 4 — Multiply and Divide Polynomial Expressions\n\nA manufacturer compares the areas of two rectangular planters:\n\n`(x^2 + 15x + 50) / (x + 2)`\n\nand\n\n`(x^2 + 30x + 200) / (x + 2)`\n\nWrite and simplify the ratio of the first area to the second.\n\nSet up the ratio:\n\n`((x^2 + 15x + 50)/(x + 2)) / ((x^2 + 30x + 200)/(x + 2))`\n\nFactor:\n\n* `x^2 + 15x + 50 = (x + 5)(x + 10)`\n* `x^2 + 30x + 200 = (x + 10)(x + 20)`\n\nSimplify:\n\n`(x + 5) / (x + 20)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "((x^2 + 15x + 50)/(x + 2)) / ((x^2 + 30x + 200)/(x + 2))",
                steps: [
                  { expression: "((x^2 + 15x + 50)/(x + 2)) / ((x^2 + 30x + 200)/(x + 2))", explanation: "Set up the ratio of areas" },
                  { expression: "(x^2 + 15x + 50)/(x^2 + 30x + 200)", explanation: "Divide by multiplying by reciprocal" },
                  { expression: "(x + 5)(x + 10) / ((x + 10)(x + 20))", explanation: "Factor numerator and denominator" },
                  { expression: "(x + 5) / (x + 20)", explanation: "Divide out common factor (x + 10)" },
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
                "## Example 5 — Simplify Complex Fractions\n\nSimplify\n\n`(3x / (x - y)) / (6xy / (4x^2 - 4y^2))`\n\nRewrite as division, multiply by the reciprocal, factor, and simplify:\n\n`(3x / (x - y)) * ((4x^2 - 4y^2) / 6xy)`\n\n`= (3x / (x - y)) * (4(x + y)(x - y) / 6xy)`\n\n`= 2(x + y) / y`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(3x / (x - y)) / (6xy / (4x^2 - 4y^2))",
                steps: [
                  { expression: "(3x / (x - y)) / (6xy / (4x^2 - 4y^2))", explanation: "Start with the complex fraction" },
                  { expression: "(3x / (x - y)) * ((4x^2 - 4y^2) / 6xy)", explanation: "Multiply by the reciprocal of the divisor" },
                  { expression: "12x(x^2 - y^2) / (6xy(x - y))", explanation: "Multiply numerators and denominators" },
                  { expression: "12x(x + y)(x - y) / (6xy(x - y))", explanation: "Factor x^2 - y^2" },
                  { expression: "2(x + y) / y", explanation: "Simplify by dividing out common factors" },
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
                    question: "What is an excluded value for the expression `(x^2 - 4) / (x^2 - x - 6)`?",
                    options: ["x = 2", "x = -2 and x = 3", "x = 3"],
                    correctIndex: 2,
                  },
                  {
                    question: "To divide rational expressions, you should:",
                    options: ["Add the reciprocals", "Multiply by the reciprocal of the divisor", "Subtract the divisor"],
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
                "## Reflection\n\nToday you learned about multiplying and dividing rational expressions. Consider the following:\n\n- How do you simplify rational expressions?\n- What is the process for multiplying rational expressions?\n- How do you divide rational expressions?\n- What questions do you still have about rational expressions?",
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