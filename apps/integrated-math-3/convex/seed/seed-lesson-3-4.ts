import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-3-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "The Remainder and Factor Theorems",
          slug: lessonSlug,
          description: "Students evaluate functions using synthetic substitution and use the Factor Theorem to determine factors of polynomials.",
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
          title: "The Remainder and Factor Theorems",
          description: "Students evaluate functions using synthetic substitution and use the Factor Theorem to determine factors of polynomials.",
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
              markdown: "## Explore: Remainders\n\nUse the interactive tool to complete the explore.\n\n**Inquiry Question:**\nHow are the divisor and quotient of a polynomial related to its factors when the remainder is zero?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = x^3 - 4x",
                title: "Remainders and Factors",
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
              markdown: "## Key Terms\n\n- **Synthetic substitution**: A method for evaluating a polynomial function by substituting a value and using a streamlined division process\n- **Depressed polynomial**: The quotient obtained when dividing a polynomial by a binomial; it has degree one less than the original polynomial",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: The Remainder Theorem",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## The Remainder Theorem\n\nFrom the Division Algorithm:\n\n$$f(x) / g(x) = q(x) + r(x)/g(x)$$\n\nand\n\n$$f(x) = q(x)g(x) + r(x)$$\n\nSuppose the dividend is $p(x)$ and the divisor is $x - a$. Then:\n\n$$p(x) / (x - a) = q(x) + r/(x - a)$$\n\nand\n\n$$p(x) = q(x)(x - a) + r$$\n\nEvaluate at $x = a$:\n\n$$p(a) = q(a)(a - a) + r$$\n\n$$p(a) = q(a)(0) + r$$\n\n$$p(a) = r$$\n\nSo the remainder is the value of the polynomial at $a$.\n\n### Key Concept: Remainder Theorem\n\nFor a polynomial $p(x)$ and a number $a$, the remainder upon division by $x - a$ is $p(a)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "text" as const,
            content: {
              markdown: "## Example\n\nEvaluate $p(x) = x^2 - 4x + 7$ when $x = 5$.\n\n- Direct substitution gives $p(5) = 25 - 20 + 7 = 12$\n- Synthetic substitution also gives remainder $12$\n\nApplying the Remainder Theorem to evaluate a function is called **synthetic substitution**.\n\n**Study Tip:** Use $0$ as a placeholder for any missing terms.",
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
              markdown: "## Example 1 — Synthetic Substitution\n\nUse synthetic substitution to find $f(-3)$ if:\n\n$$f(x) = -2x^4 + 3x^2 - 15x + 9$$\n\nUse $-3$ with coefficients:\n\n$$-2, 0, 3, -15, 9$$\n\nSynthetic substitution gives remainder:\n\n$$-81$$\n\nTherefore:\n\n$$f(-3) = -81$$\n\nCheck with direct substitution:\n\n$$f(-3) = -2(-3)^4 + 3(-3)^2 - 15(-3) + 9$$\n\n$$= -162 + 27 + 45 + 9$$\n\n$$= -81$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(-3) = -81 where f(x) = -2x^4 + 3x^2 - 15x + 9",
                steps: [
                  { expression: "f(x) = -2x⁴ + 3x² - 15x + 9", explanation: "Identify coefficients: -2, 0, 3, -15, 9" },
                  { expression: "Use synthetic division with -3", explanation: "Bring down -2, multiply by -3, add, repeat" },
                  { expression: "-2 × (-3) = 6", explanation: "Multiply first coefficient by -3" },
                  { expression: "0 + 6 = 6", explanation: "Add to get next coefficient" },
                  { expression: "6 × (-3) = -18", explanation: "Continue synthetic division" },
                  { expression: "3 + (-18) = -15", explanation: "Continue adding" },
                  { expression: "-15 × (-3) = 45", explanation: "Continue multiplying" },
                  { expression: "-15 + 45 = 30", explanation: "Continue adding" },
                  { expression: "30 × (-3) = -90", explanation: "Continue multiplying" },
                  { expression: "9 + (-90) = -81", explanation: "Final remainder is f(-3)" },
                  { expression: "f(-3) = -81", explanation: "Remainder theorem verified" },
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
              markdown: "## Example 2 — Apply the Remainder Theorem\n\nEgg production in the United States can be modeled by:\n\n$$f(x) = 0.007x^3 - 0.149x^2 + 1.534x + 84.755$$\n\nwhere $x$ is the number of years since $2000$.\n\nPredict egg production in $2025$.\n\nSince $2025 - 2000 = 25$, evaluate $f(25)$ using synthetic substitution.\n\nThe result is:\n\n$$f(25) = 139.355$$\n\nSo in $2025$, approximately **139.355 billion eggs** will be produced.\n\n## Think About It\n\nHow could you use the function and synthetic substitution to estimate the number of eggs produced in 1990? What assumption would you have to make?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(25) = 139.355 where f(x) = 0.007x³ - 0.149x² + 1.534x + 84.755",
                steps: [
                  { expression: "f(x) = 0.007x³ - 0.149x² + 1.534x + 84.755", explanation: "Identify coefficients for synthetic substitution with x = 25" },
                  { expression: "Use synthetic division with 25", explanation: "Coefficients: 0.007, -0.149, 1.534, 84.755" },
                  { expression: "0.007 × 25 = 0.175", explanation: "Start synthetic substitution" },
                  { expression: "-0.149 + 0.175 = 0.026", explanation: "Add to get next coefficient" },
                  { expression: "0.026 × 25 = 0.65", explanation: "Continue" },
                  { expression: "1.534 + 0.65 = 2.184", explanation: "Continue adding" },
                  { expression: "2.184 × 25 = 54.6", explanation: "Continue multiplying" },
                  { expression: "84.755 + 54.6 = 139.355", explanation: "Final remainder is f(25)" },
                  { expression: "f(25) = 139.355 billion eggs", explanation: "Prediction for year 2025" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: The Factor Theorem",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## The Factor Theorem\n\nWhen a binomial evenly divides a polynomial, the binomial is a factor of the polynomial.\n\nThe quotient from this division is called a **depressed polynomial**. It has degree one less than the original polynomial.\n\n### Key Concept: Factor Theorem\n\nThe binomial $x - a$ is a factor of the polynomial $p(x)$ **if and only if** $p(a) = 0$.\n\n### Example\n\nIf dividing $x^3 - x^2 - 30x + 72$ by $x + 6$ gives remainder $0$, then $x + 6$ is a factor.\n\nNotice that $x + 6 = x - (-6)$, so we check if $p(-6) = 0$.",
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
              markdown: "## Example 3 — Use the Factor Theorem\n\nShow that $x + 8$ is a factor of:\n\n$$2x^3 + 15x^2 - 11x - 24$$\n\nThen find the remaining factors.\n\nUse synthetic substitution with $-8$:\n\nThe remainder is $0$, so by the Factor Theorem, $x + 8$ is a factor.\n\nThe depressed polynomial is:\n\n$$2x^2 - x - 3$$\n\nFactor it:\n\n$$2x^2 - x - 3 = (2x - 3)(x + 1)$$\n\nSo the full factorization is:\n\n$$2x^3 + 15x^2 - 11x - 24 = (x + 8)(2x - 3)(x + 1)$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "2x^3 + 15x^2 - 11x - 24 = (x + 8)(2x - 3)(x + 1)",
                steps: [
                  { expression: "Check if x + 8 is a factor", explanation: "Use x - (-8), so evaluate p(-8)" },
                  { expression: "Synthetic division with -8", explanation: "Coefficients: 2, 15, -11, -24" },
                  { expression: "2 × (-8) = -16", explanation: "Start synthetic substitution" },
                  { expression: "15 + (-16) = -1", explanation: "Add to get next coefficient" },
                  { expression: "-1 × (-8) = 8", explanation: "Continue" },
                  { expression: "-11 + 8 = -3", explanation: "Continue adding" },
                  { expression: "-3 × (-8) = 24", explanation: "Continue multiplying" },
                  { expression: "-24 + 24 = 0", explanation: "Remainder is 0, so x + 8 is a factor" },
                  { expression: "Depressed polynomial: 2x² - x - 3", explanation: "Quotient from division" },
                  { expression: "Factor: 2x² - x - 3 = (2x - 3)(x + 1)", explanation: "Factor the quadratic" },
                  { expression: "(x + 8)(2x - 3)(x + 1)", explanation: "Complete factorization" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. How is the Remainder Theorem useful in evaluating polynomials?\n2. What is the connection between the Remainder Theorem and the Factor Theorem?\n3. Why is it helpful to know if a binomial is a factor of a polynomial?\n\n## Talk About It\n\nSuppose you were asked to determine whether $3x + 4$ is a factor of $3x^3 - 2x^2 - 8x$. Describe the steps necessary to find a solution.",
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
                    question: "If p(3) = 0 when dividing by x - 3, what does this tell us?",
                    options: [
                      "3 is a root of the polynomial",
                      "The polynomial has degree 3",
                      "x - 3 is not a factor",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the depressed polynomial?",
                    options: [
                      "The polynomial with reduced degree after factoring",
                      "A polynomial with only positive coefficients",
                      "The difference between two polynomials",
                    ],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned about the Remainder and Factor Theorems. Consider the following:\n\n- How does synthetic substitution simplify evaluating polynomials?\n- What is the relationship between the Remainder Theorem and the Factor Theorem?\n- How can knowing a binomial is a factor help you find other factors?\n\n**Tip:** The Factor Theorem is especially useful when combined with the Rational Root Theorem to find all factors of a polynomial.",
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
