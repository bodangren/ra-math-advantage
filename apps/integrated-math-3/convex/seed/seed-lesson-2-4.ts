import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-2-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Dividing Polynomials",
          slug: lessonSlug,
          description: "Students divide polynomials using long division and synthetic division.",
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
          title: "Dividing Polynomials",
          description: "Students divide polynomials using long division and synthetic division.",
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
                equation: "y = x^2 - 4",
                title: "Explore Dividing Polynomials",
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
              markdown: "## Key Terms\n\n- **Synthetic Division**: A shortcut method for dividing a polynomial by a binomial of the form $x - a$\n\n### Key Concept: Division Algorithm\n\nIf $f(x)$ and $g(x)$ are polynomials with $g(x) \\neq 0$ and degree of $g(x)$ less than degree of $f(x)$, then there exist unique polynomials $q(x)$ and $r(x)$ such that:\n\n$$f(x) = q(x)g(x) + r(x)$$\n\nwhere the remainder is either $0$ or has degree less than the degree of $g(x)$.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Dividing Polynomials by Using Long Division",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Dividing Polynomials\n\nTo divide a polynomial by a monomial, find the quotient of each term and the monomial.\n\n### Key Concept: Division Algorithm\n\nThe Division Algorithm states that when dividing polynomials, you can express the dividend as the product of the divisor and quotient plus the remainder.\n\nFor polynomials $f(x)$ and $g(x)$:\n\n$$f(x) = q(x) \\cdot g(x) + r(x)$$\n\nwhere $r(x)$ has degree less than $g(x)$.",
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
              markdown: "## Example 1: Divide a Polynomial by a Monomial\n\nFind: $(24a^4b^3 + 18a^2b^2 - 30ab^3) / (6ab)$\n\nRewrite as a fraction and split the quotient:\n\n$= \\frac{24a^4b^3}{6ab} + \\frac{18a^2b^2}{6ab} - \\frac{30ab^3}{6ab}$\n\nSimplify each term:\n\n$= 4a^3b^2 + 3ab - 5b^2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(24a^4b^3 + 18a^2b^2 - 30ab^3) / (6ab)",
                steps: [
                  { expression: "(24a^4b^3 + 18a^2b^2 - 30ab^3) / (6ab)", explanation: "Write as fraction" },
                  { expression: "24a^4b^3 / 6ab = 4a^3b^2", explanation: "Divide first term" },
                  { expression: "18a^2b^2 / 6ab = 3ab", explanation: "Divide second term" },
                  { expression: "-30ab^3 / 6ab = -5b^2", explanation: "Divide third term" },
                  { expression: "4a^3b^2 + 3ab - 5b^2", explanation: "Simplify result" },
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
              markdown: "## Example 2: Divide a Polynomial by a Binomial\n\nFind: $(x^2 - 5x - 36) / (x + 4)$\n\nUsing long division:\n\n- Divide $x^2$ by $x$ to get $x$\n- Multiply $x(x + 4) = x^2 + 4x$\n- Subtract: $(x^2 - 5x) - (x^2 + 4x) = -9x$\n- Bring down $-36$\n- Divide $-9x$ by $x$ to get $-9$\n- Multiply $-9(x + 4) = -9x - 36$\n- Subtract: $(-9x - 36) - (-9x - 36) = 0$\n\nQuotient: $x - 9$, Remainder: $0$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(x^2 - 5x - 36) / (x + 4)",
                steps: [
                  { expression: "x^2 / x = x", explanation: "First term of quotient" },
                  { expression: "x(x + 4) = x^2 + 4x", explanation: "Multiply back" },
                  { expression: "(x^2 - 5x) - (x^2 + 4x) = -9x", explanation: "Subtract" },
                  { expression: "-9x / x = -9", explanation: "Next term of quotient" },
                  { expression: "-9(x + 4) = -9x - 36", explanation: "Multiply back" },
                  { expression: "(-9x - 36) - (-9x - 36) = 0", explanation: "Subtract, remainder is 0" },
                  { expression: "x - 9", explanation: "Quotient" },
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
              markdown: "## Example 3: Find a Quotient with a Remainder\n\nFind: $(3z^3 - 14z^2 - 7z + 3) / (z - 5)$\n\nUsing long division:\n\n- $3z^3 / z = 3z^2$\n- $3z^2(z - 5) = 3z^3 - 15z^2$\n- Subtract: $(-14z^2) - (-15z^2) = z^2$\n- Bring down $-7z$\n- $z^2 / z = z$\n- $z(z - 5) = z^2 - 5z$\n- Subtract: $(-7z) - (-5z) = -2z$\n- Bring down $+3$\n- $-2z / z = -2$\n- $-2(z - 5) = -2z + 10$\n- Subtract: $3 - 10 = -7$\n\nQuotient: $3z^2 + z - 2$, Remainder: $-7$\n\nSo: $(3z^3 - 14z^2 - 7z + 3) / (z - 5) = 3z^2 + z - 2 - \\frac{7}{z - 5}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(3z^3 - 14z^2 - 7z + 3) / (z - 5)",
                steps: [
                  { expression: "3z^3 / z = 3z^2", explanation: "First term of quotient" },
                  { expression: "3z^2(z - 5) = 3z^3 - 15z^2", explanation: "Multiply back" },
                  { expression: "-14z^2 - (-15z^2) = z^2", explanation: "Subtract" },
                  { expression: "z^2 / z = z", explanation: "Next term" },
                  { expression: "z(z - 5) = z^2 - 5z", explanation: "Multiply back" },
                  { expression: "-7z - (-5z) = -2z", explanation: "Subtract" },
                  { expression: "-2z / z = -2", explanation: "Next term" },
                  { expression: "-2(z - 5) = -2z + 10", explanation: "Multiply back" },
                  { expression: "3 - 10 = -7", explanation: "Remainder" },
                  { expression: "3z^2 + z - 2 - 7/(z-5)", explanation: "Final answer with remainder" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn: Dividing Polynomials by Using Synthetic Division",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Dividing Polynomials by Using Synthetic Division\n\nSynthetic division is a shortcut for dividing a polynomial by a binomial of the form $x - a$.\n\n### Key Steps\n\n1. Write the coefficients of the dividend in descending degree order.\n2. Include $0$ placeholders for missing terms.\n3. Use the zero of the divisor, $a$, in the synthetic division setup.\n4. The last entry is the remainder; the other entries give the quotient coefficients.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Use Synthetic Division\n\nFind: $(3x^3 - 2x^2 - 53x - 60) / (x + 3)$\n\nSince $x + 3 = x - (-3)$, use $a = -3$.\n\nCoefficients: $3, -2, -53, -60$\n\nSynthetic division:\n\n```\n-3 |  3   -2   -53   -60\n   |     -9    33    60\n----------------------\n     3  -11   -20     0\n```\n\nQuotient: $3x^2 - 11x - 20$, Remainder: $0$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(3x^3 - 2x^2 - 53x - 60) / (x + 3)",
                steps: [
                  { expression: "x + 3 = x - (-3), so a = -3", explanation: "Identify synthetic divisor" },
                  { expression: "Coefficients: 3, -2, -53, -60", explanation: "Write coefficients" },
                  { expression: "Bring down 3", explanation: "Start synthetic division" },
                  { expression: "3 × (-3) = -9", explanation: "Multiply" },
                  { expression: "-2 + (-9) = -11", explanation: "Add" },
                  { expression: "-11 × (-3) = 33", explanation: "Multiply" },
                  { expression: "-53 + 33 = -20", explanation: "Add" },
                  { expression: "-20 × (-3) = 60", explanation: "Multiply" },
                  { expression: "-60 + 60 = 0", explanation: "Add, remainder is 0" },
                  { expression: "3x^2 - 11x - 20", explanation: "Quotient from coefficients" },
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
              markdown: "## Example 5: Divisor with a Coefficient Other Than 1\n\nFind: $(4x^4 - 37x^2 + 4x + 9) / (2x - 1)$\n\nTo use synthetic division, the leading coefficient of the divisor must be $1$.\n\nDivide numerator and denominator by $2$:\n\n$\\frac{(4x^4 - 37x^2 + 4x + 9) / 2}{(2x - 1) / 2} = \\frac{2x^4 - \\frac{37}{2}x^2 + 2x + \\frac{9}{2}}{x - \\frac{1}{2}}$\n\nNow use synthetic division with $a = \\frac{1}{2}$.\n\nThe final answer is:\n\n$2x^3 + x^2 - 18x - 7 + \\frac{2}{2x - 1}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(4x^4 - 37x^2 + 4x + 9) / (2x - 1)",
                steps: [
                  { expression: "(2x - 1) / 2 = x - 1/2", explanation: "Normalize the divisor" },
                  { expression: "a = 1/2", explanation: "Identify the synthetic division value" },
                  { expression: "2x^4 + 0x^3 - (37/2)x^2 + 2x + 9/2", explanation: "Include the missing cubic placeholder" },
                  { expression: "2x^3 + x^2 - 18x - 7", explanation: "Use synthetic division to find the quotient" },
                  { expression: "remainder = 1", explanation: "Find the remainder for the normalized divisor" },
                  { expression: "1 / (x - 1/2) = 2 / (2x - 1)", explanation: "Rewrite the remainder with the original divisor" },
                  { expression: "2x^3 + x^2 - 18x - 7 + 2/(2x - 1)", explanation: "Write the final answer" },
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
              markdown: "## Discussion Questions\n\n1. Why is synthetic division only used with binomial divisors of the form $x - a$?\n2. How can you check your answer when dividing polynomials?\n3. What happens to the remainder in synthetic division?",
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
                    question: "If the remainder is 0 when dividing by $(x - a)$, what can you conclude?",
                    options: [
                      "$x - a$ is a factor",
                      "$x - a$ is not a factor",
                      "The division was incorrect",
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
        phaseNumber: 11,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned about dividing polynomials using long division and synthetic division.\n\n- When would you prefer to use synthetic division over long division?\n- How does the Remainder Theorem relate to synthetic division?\n\n**Tip**: Always check your answer by multiplying the quotient by the divisor and adding the remainder.",
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
