import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-4-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Operations with Radical Expressions",
          slug: lessonSlug,
          description:
            "Students simplify radical expressions, add, subtract, multiply, and divide radicals, and rationalize denominators.",
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
          title: "Operations with Radical Expressions",
          description:
            "Students simplify radical expressions, add, subtract, multiply, and divide radicals, and rationalize denominators.",
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
                "## Explore: Simplifying Radical Expressions\n\nUse what you know about radicals to complete the explore.\n\n**Inquiry Question:**\nHow do the properties of radicals help you simplify expressions involving roots?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = sqrt(x)",
                title: "Explore Radical Operations",
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
                "## Key Terms\n\n- **Like radical expressions**: Radicals that have the same index and radicand\n- **Conjugates**: Two binomial expressions that differ only in the sign between the terms (e.g., $a\\sqrt{b} + c$ and $a\\sqrt{b} - c$)",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Properties of Radicals",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Properties of Radicals\n\nThe properties used to simplify square roots extend to nth roots.\n\n### Key Concept: Product Property of Radicals\n\nFor real numbers $a$, $b$ and integer $n > 1$:\n\n$$\\sqrt[n]{ab} = \\sqrt[n]{a} \\cdot \\sqrt[n]{b}$$\n\nwhen the roots are defined.\n\n**Examples:**\n- $\\sqrt{12} \\cdot \\sqrt{3} = \\sqrt{36} = 6$\n- $\\sqrt[3]{4} \\cdot \\sqrt[3]{16} = \\sqrt[3]{64} = 4$\n\n### Key Concept: Quotient Property of Radicals\n\nFor real numbers $a$ and $b \\neq 0$:\n\n$$\\sqrt[n]{\\frac{a}{b}} = \\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}}$$\n\nwhen all roots are defined.\n\n**Examples:**\n- $\\sqrt{\\frac{x^4}{25}} = \\frac{x^2}{5}$\n- $\\sqrt[3]{\\frac{27}{8}} = \\frac{3}{2}$\n\n### Key Concept: Simplest Form of Radical Expressions\n\nA radical expression is in simplest form when:\n- the index is as small as possible\n- the radicand contains no nth-power factors other than $1$\n- the radicand contains no fractions\n- no radicals appear in the denominator",
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
                "## Example 1 — Simplify Expressions with the Product Property\n\n### a. $\\sqrt[3]{-27a^6b^{14}}$\n\nFactor into cubes:\n\n$= \\sqrt[3]{(-3)^3 \\cdot (a^2)^3 \\cdot (b^4)^3 \\cdot b^2}$\n\n$= -3a^2b^4 \\sqrt[3]{b^2}$\n\n### b. $\\sqrt{75x^{12}y^7}$\n\nFactor into squares:\n\n$= \\sqrt{5^2 \\cdot 3 \\cdot (x^6)^2 \\cdot (y^3)^2 \\cdot y}$\n\n$= 5x^6y^3\\sqrt{3y}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "sqrt(75x^12y^7)",
                steps: [
                  { expression: "Factor into squares", explanation: "75 = 5^2 * 3, x^12 = (x^6)^2, y^7 = (y^3)^2 * y" },
                  { expression: "sqrt(5^2 * 3 * (x^6)^2 * (y^3)^2 * y)", explanation: "Break down each factor" },
                  { expression: "5 * x^6 * y^3 * sqrt(3y)", explanation: "Take square root of perfect powers" },
                  { expression: "5x^6y^3*sqrt(3y)", explanation: "Simplest form" },
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
                "## Example 2 — Simplify Expressions with the Quotient Property\n\n### a. $\\sqrt[3]{\\frac{24a^6}{125}}$\n\n$= \\frac{\\sqrt[3]{24a^6}}{\\sqrt[3]{125}}$\n\n$= \\frac{\\sqrt[3]{2^3 \\cdot 3 \\cdot (a^2)^3}}{\\sqrt[3]{5^3}}$\n\n$= \\frac{2a^2\\sqrt[3]{3}}{5}$\n\n### b. $\\sqrt[4]{\\frac{80y^{14}}{256z^4}}$\n\n$= \\frac{\\sqrt[4]{80y^{14}}}{\\sqrt[4]{256z^4}}$\n\nFactor into fourth powers and simplify:\n\n$= \\frac{|y^3|\\sqrt[4]{5y^2}}{2z}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "cuberoot((24a^6)/125)",
                steps: [
                  { expression: "cuberoot(24a^6) / cuberoot(125)", explanation: "Apply quotient property" },
                  { expression: "cuberoot(2^3 * 3 * (a^2)^3) / cuberoot(5^3)", explanation: "Factor into cubes" },
                  { expression: "2a^2*cuberoot(3) / 5", explanation: "Simplify cube roots" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Adding and Subtracting Radical Expressions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Adding and Subtracting Radical Expressions\n\nRadicals can be added or subtracted like monomials, but only if they are **like radical expressions**.\n\nTwo radicals are like radicals if:\n- they have the same index\n- they have the same radicand\n\nEven if expressions do not initially look alike, simplify them first.\n\n**Example:**\n- $\\sqrt{18} = 3\\sqrt{2}$\n- $\\sqrt{32} = 4\\sqrt{2}$\n\nThen they can be combined.\n\nRadicals with the same index can also be multiplied using the Product Property of Radicals.\n\nFor expressions with more than one term, use the Distributive Property or FOIL.",
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
                "## Example 3 — Add and Subtract Radicals\n\nSimplify: $6\\sqrt{45x} + \\sqrt{12} - 3\\sqrt{20x}$\n\nFactor:\n\n$= 6\\sqrt{3^2 \\cdot 5x} + \\sqrt{2^2 \\cdot 3} - 3\\sqrt{2^2 \\cdot 5x}$\n\nSimplify radicals:\n\n$= 6(3\\sqrt{5x}) + 2\\sqrt{3} - 3(2\\sqrt{5x})$\n\n$= 18\\sqrt{5x} + 2\\sqrt{3} - 6\\sqrt{5x}$\n\n$= 12\\sqrt{5x} + 2\\sqrt{3}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "6*sqrt(45x) + sqrt(12) - 3*sqrt(20x)",
                steps: [
                  { expression: "Factor radicands into squares", explanation: "45x = 3^2 * 5x, 12 = 2^2 * 3, 20x = 2^2 * 5x" },
                  { expression: "6(3sqrt(5x)) + 2sqrt(3) - 3(2sqrt(5x))", explanation: "Take square roots of perfect squares" },
                  { expression: "18sqrt(5x) + 2sqrt(3) - 6sqrt(5x)", explanation: "Multiply coefficients" },
                  { expression: "12sqrt(5x) + 2sqrt(3)", explanation: "Combine like terms" },
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
                "## Example 4 — Multiply Radicals\n\nSimplify: $4\\sqrt[5]{-10x^2y^6} \\cdot 3\\sqrt[5]{16x^4y^4}$\n\nMultiply coefficients and radicands:\n\n$= 12\\sqrt[5]{(-10x^2y^6)(16x^4y^4)}$\n\nFactor and simplify:\n\n$= 12\\sqrt[5]{-1 \\cdot 2^5 \\cdot 5 \\cdot x^5 \\cdot x \\cdot y^{10}}$\n\n$= 12(-1)xy^2\\sqrt[5]{5x}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "4*fifthroot(-10x^2y^6) * 3*fifthroot(16x^4y^4)",
                steps: [
                  { expression: "12*fifthroot((-10x^2y^6)(16x^4y^4))", explanation: "Multiply coefficients and radicands" },
                  { expression: "12*fifthroot(-1 * 2^5 * 5 * x^5 * x * y^10)", explanation: "Factor into powers of 5" },
                  { expression: "12(-1)xy^2*fifthroot(5x)", explanation: "Take fifth roots of perfect fifth powers" },
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
                "## Example 5 — Use the Distributive Property to Multiply Radicals\n\n**SPORTS:** A sports pennant has the dimensions shown. Find the area, in square inches.\n\n- base: $3\\sqrt{8} + 4$\n- height: $7\\sqrt{8} + 6\\sqrt{3}$\n\nUse $Area = \\frac{1}{2} \\cdot base \\cdot height$:\n\n$Area = \\frac{1}{2}(3\\sqrt{8} + 4)(7\\sqrt{8} + 6\\sqrt{3})$\n\nApply the Distributive Property:\n\n$= \\frac{1}{2}[3\\sqrt{8} \\cdot 7\\sqrt{8} + 3\\sqrt{8} \\cdot 6\\sqrt{3} + 4 \\cdot 7\\sqrt{8} + 4 \\cdot 6\\sqrt{3}]$\n\n$= \\frac{1}{2}[21\\sqrt{8^2} + 18\\sqrt{24} + 28\\sqrt{8} + 24\\sqrt{3}]$\n\nSimplify each radical:\n\n$= \\frac{1}{2}[168 + 36\\sqrt{6} + 56\\sqrt{2} + 24\\sqrt{3}]$\n\n$= 84 + 18\\sqrt{6} + 28\\sqrt{2} + 12\\sqrt{3}$\n\nSo the area of the pennant is:\n\n$84 + 18\\sqrt{6} + 28\\sqrt{2} + 12\\sqrt{3}$ square inches.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "1/2*(3*sqrt(8)+4)*(7*sqrt(8)+6*sqrt(3))",
                steps: [
                  { expression: "1/2 * [(3sqrt(8)+4)(7sqrt(8)+6sqrt(3))]", explanation: "Set up area formula" },
                  { expression: "1/2 * [21sqrt(64) + 18sqrt(24) + 28sqrt(8) + 24sqrt(3)]", explanation: "Apply distributive property" },
                  { expression: "1/2 * [168 + 36sqrt(6) + 56sqrt(2) + 24sqrt(3)]", explanation: "Simplify radicals: sqrt(64)=8, sqrt(24)=sqrt(4*6)=2sqrt(6)" },
                  { expression: "84 + 18sqrt(6) + 28sqrt(2) + 12sqrt(3)", explanation: "Multiply by 1/2" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Learn: Rationalizing the Denominator",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Rationalizing the Denominator\n\nIf a radical expression contains a radical in the denominator, you can rationalize the denominator by multiplying the numerator and denominator by a quantity that produces an exact root in the denominator.\n\n### Watch Out\n\nDo not stop until the result is in simplest form. Check that no radicals remain in the denominator and that individual radicals cannot be simplified further.",
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Rationalize the Denominator\n\nSimplify: $\\frac{\\sqrt[3]{250a^6}}{\\sqrt[3]{7a}}$\n\nUse the Quotient Property of Radicals:\n\n$= \\sqrt[3]{\\frac{250a^6}{7a}}$\n\nFactor into cubes:\n\n$= \\sqrt[3]{\\frac{5^3 \\cdot 2 \\cdot (a^2)^3}{7a}}$\n\n$= \\frac{5a^2\\sqrt[3]{2}}{\\sqrt[3]{7a}}$\n\nMultiply numerator and denominator by $\\sqrt[3]{7^2a^2}$ to rationalize the denominator:\n\n$= \\frac{5a^2\\sqrt[3]{2}}{\\sqrt[3]{7a}} \\cdot \\frac{\\sqrt[3]{7^2a^2}}{\\sqrt[3]{7^2a^2}}$\n\n$= \\frac{5a^2\\sqrt[3]{98a^2}}{\\sqrt[3]{7^3a^3}}$\n\n$= \\frac{5a^2\\sqrt[3]{98a^2}}{7a}$\n\n$= \\frac{5a\\sqrt[3]{98a^2}}{7}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "cuberoot(250a^6) / cuberoot(7a)",
                steps: [
                  { expression: "cuberoot(250a^6) / cuberoot(7a)", explanation: "Start with original expression" },
                  { expression: "5a^2*cuberoot(2) / cuberoot(7a)", explanation: "Factor 250 = 5^3 * 2, a^6 = (a^2)^3" },
                  { expression: "Multiply by cuberoot(7^2*a^2)/cuberoot(7^2*a^2)", explanation: "Rationalize denominator" },
                  { expression: "5a^2*cuberoot(98a^2) / (7a)", explanation: "Simplify denominator: cuberoot(7^3*a^3) = 7a" },
                  { expression: "5a*cuberoot(98a^2) / 7", explanation: "Cancel a" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Use Conjugates to Rationalize the Denominator\n\nSimplify: $\\frac{4x}{2\\sqrt{7} - 5}$\n\nMultiply numerator and denominator by the conjugate $2\\sqrt{7} + 5$:\n\n$= \\frac{4x}{2\\sqrt{7} - 5} \\cdot \\frac{2\\sqrt{7} + 5}{2\\sqrt{7} + 5}$\n\nMultiply:\n\n$= \\frac{4x(2\\sqrt{7}) + 4x(5)}{(2\\sqrt{7})^2 + 5(2\\sqrt{7}) - 5(2\\sqrt{7}) - 5^2}$\n\n$= \\frac{8x\\sqrt{7} + 20x}{28 - 25}$\n\n$= \\frac{8x\\sqrt{7} + 20x}{3}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "4x / (2*sqrt(7) - 5)",
                steps: [
                  { expression: "(4x / (2sqrt(7) - 5)) * ((2sqrt(7) + 5) / (2sqrt(7) + 5))", explanation: "Multiply by conjugate" },
                  { expression: "(8x*sqrt(7) + 20x) / ((2sqrt(7))^2 - 5^2)", explanation: "FOIL denominator: (a-b)(a+b)=a^2-b^2" },
                  { expression: "(8x*sqrt(7) + 20x) / (28 - 25)", explanation: "Calculate squares: (2sqrt(7))^2=4*7=28, 5^2=25" },
                  { expression: "(8x*sqrt(7) + 20x) / 3", explanation: "Simplify denominator" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 13,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Why must radical expressions be in simplest form before you can combine them by adding or subtracting?\n2. How do you determine when two radical expressions are like radicals?\n3. Why do you multiply by the conjugate when rationalizing a denominator that contains a binomial with a radical?\n4. What is the difference between the Product Property and the Quotient Property of Radicals?",
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
                    question: "Which pair of expressions are like radicals?",
                    options: [
                      "sqrt(12) and sqrt(18)",
                      "2*sqrt(5) and 3*sqrt(7)",
                      "sqrt(8) and 2*sqrt(2)",
                    ],
                    correctIndex: 2,
                  },
                  {
                    question: "To rationalize 1/(sqrt(3) - 1), by what would you multiply?",
                    options: [
                      "sqrt(3) + 1",
                      "sqrt(3) - 1",
                      "1 - sqrt(3)",
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
        phaseNumber: 14,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about operations with radical expressions. Consider the following:\n\n- What strategies help you determine whether two radicals can be combined?\n- How does rationalizing the denominator help you work with radical expressions?\n- What questions do you still have about simplifying, adding, or rationalizing radical expressions?\n\n**Tip**: Always simplify radicals before determining if they are like radicals. For example, $\\sqrt{50} = 5\\sqrt{2}$, so it can be combined with other $\\sqrt{2}$ terms.",
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