import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-2-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Operations with Polynomials",
          slug: lessonSlug,
          description: "Students add, subtract, and multiply polynomials.",
          orderIndex: 3,
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
          title: "Operations with Polynomials",
          description: "Students add, subtract, and multiply polynomials.",
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
                equation: "y = (x+2)(x-1)(x+3)",
                title: "Explore Multiplying Polynomials",
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
              markdown: "## Key Terms\n\n- **Binomial**: The sum of two monomials\n- **Trinomial**: The sum of three monomials\n- **Closed**: A set is closed under an operation if performing that operation on any two elements of the set produces another element of the same set\n- **FOIL method**: A technique for multiplying two binomials — First, Outer, Inner, Last\n\n### Key Concept: FOIL Method\n\nFind the sum of the products of:\n\n- **F**irst terms\n- **O**uter terms\n- **I**nner terms\n- **L**ast terms\n\nExample: $(2x + 4)(x - 3)$\n\n$= (2x)(x) + (2x)(-3) + (4)(x) + (4)(-3)$\n\n$= 2x^2 - 6x + 4x - 12$\n\n$= 2x^2 - 2x - 12$",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Adding and Subtracting Polynomials",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Adding and Subtracting Polynomials\n\nA polynomial is a monomial or the sum of two or more monomials.\n\n- The degree of a polynomial is the greatest degree of any term\n- Polynomials can be added or subtracted by performing the indicated operations and combining like terms\n\n### Key Concept: Closure\n\nA set is **closed** under an operation if performing that operation on any two elements of the set produces another element of the same set.\n\nBecause adding or subtracting polynomials results in a polynomial, the set of polynomials is **closed under addition and subtraction**.\n\n### Study Tip\n\nConstant terms have degree $0$, and variable terms with no exponent shown have degree $1$.",
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
              markdown: "## Example 1: Identify Polynomials\n\nDetermine whether each expression is a polynomial. If it is a polynomial, state its degree.\n\n1. $x^6 + \\sqrt[3]{x} - 4$ — not a polynomial because $\\sqrt[3]{x}$ is not a monomial\n2. $5a^4b + 3a^2b^7 - 9$ — polynomial; degree of first term: $4 + 1 = 5$; degree of second term: $2 + 7 = 9$; degree of constant: $0$; polynomial degree: $9$\n3. $\\frac{2}{3}x^{-5} - 6x^{-3} - x$ — not a polynomial because $x^{-5}$ and $x^{-3}$ are not monomials",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x^6 + \\sqrt[3]{x} - 4",
                steps: [
                  { expression: "x^6 + \\sqrt[3]{x} - 4", explanation: "Identify the expression" },
                  { expression: "\\sqrt[3]{x} = x^{1/3}", explanation: "Convert root to exponent form" },
                  { expression: "x^{1/3} is not a monomial", explanation: "Monomials require integer exponents" },
                  { expression: "Not a polynomial", explanation: "Contains non-integer exponent" },
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
              markdown: "## Example 2: Add Polynomials\n\nFind: $(6x^3 + 7x^2 - 2x + 5) + (x^3 - 4x^2 - 8x + 1)$\n\n### Method 1: Add horizontally\n\n$(6x^3 + x^3) + (7x^2 - 4x^2) + (-2x - 8x) + (5 + 1)$\n\n$= 7x^3 + 3x^2 - 10x + 6$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(6x^3 + 7x^2 - 2x + 5) + (x^3 - 4x^2 - 8x + 1)",
                steps: [
                  { expression: "(6x^3 + 7x^2 - 2x + 5) + (x^3 - 4x^2 - 8x + 1)", explanation: "Identify the expression" },
                  { expression: "6x^3 + x^3 = 7x^3", explanation: "Combine x^3 terms" },
                  { expression: "7x^2 - 4x^2 = 3x^2", explanation: "Combine x^2 terms" },
                  { expression: "-2x - 8x = -10x", explanation: "Combine x terms" },
                  { expression: "5 + 1 = 6", explanation: "Combine constants" },
                  { expression: "7x^3 + 3x^2 - 10x + 6", explanation: "Write in standard form" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3: Subtract Polynomials\n\nFind: $(2x^5 + 11x^4 + 7x - 8) - (5x^4 + 9x^3 - 3x + 4)$\n\n### Method 1: Subtract horizontally\n\n$2x^5 + 11x^4 + 7x - 8 - 5x^4 - 9x^3 + 3x - 4$\n\n$= 2x^5 + 6x^4 - 9x^3 + 10x - 12$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(2x^5 + 11x^4 + 7x - 8) - (5x^4 + 9x^3 - 3x + 4)",
                steps: [
                  { expression: "2x^5 + 11x^4 + 7x - 8 - 5x^4 - 9x^3 + 3x - 4", explanation: "Distribute the negative sign" },
                  { expression: "2x^5", explanation: "Only term with no match" },
                  { expression: "11x^4 - 5x^4 = 6x^4", explanation: "Combine x^4 terms" },
                  { expression: "-9x^3", explanation: "Only x^3 term (no matching term to combine)" },
                  { expression: "7x + 3x = 10x", explanation: "Combine x terms" },
                  { expression: "-8 - 4 = -12", explanation: "Combine constants" },
                  { expression: "2x^5 + 6x^4 - 9x^3 + 10x - 12", explanation: "Write in standard form" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn: Multiplying Polynomials",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Multiplying Polynomials\n\nPolynomials can be multiplied by using the Distributive Property to multiply each term in one polynomial by each term in the other.\n\n- The product of polynomials is also a polynomial\n- So the set of polynomials is closed under multiplication\n\n### Key Concept: FOIL Method\n\nTo multiply two binomials, use the FOIL method:\n\n**F**irst — multiply the first terms\n\n**O**uter — multiply the outer terms\n\n**I**nner — multiply the inner terms\n\n**L**ast — multiply the last terms\n\nThen combine like terms.",
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
              markdown: "## Example 4: Simplify by Using the Distributive Property\n\nFind: $2x(4x^3 + 5x^2 - x - 7)$\n\nDistribute $2x$ to each term:\n\n$= 2x(4x^3) + 2x(5x^2) + 2x(-x) + 2x(-7)$\n\n$= 8x^4 + 10x^3 - 2x^2 - 14x$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "2x(4x^3 + 5x^2 - x - 7)",
                steps: [
                  { expression: "2x(4x^3 + 5x^2 - x - 7)", explanation: "Identify the expression" },
                  { expression: "2x \\cdot 4x^3 = 8x^4", explanation: "Multiply first term" },
                  { expression: "2x \\cdot 5x^2 = 10x^3", explanation: "Multiply second term" },
                  { expression: "2x \\cdot (-x) = -2x^2", explanation: "Multiply third term" },
                  { expression: "2x \\cdot (-7) = -14x", explanation: "Multiply fourth term" },
                  { expression: "8x^4 + 10x^3 - 2x^2 - 14x", explanation: "Write in standard form" },
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
              markdown: "## Example 5: Multiply Binomials Using FOIL\n\nFind: $(3a + 5)(a - 7)$\n\n**F**: $(3a)(a) = 3a^2$\n\n**O**: $(3a)(-7) = -21a$\n\n**I**: $(5)(a) = 5a$\n\n**L**: $(5)(-7) = -35$\n\n$(3a + 5)(a - 7) = 3a^2 - 21a + 5a - 35 = 3a^2 - 16a - 35$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(3a + 5)(a - 7)",
                steps: [
                  { expression: "(3a + 5)(a - 7)", explanation: "Identify the expression" },
                  { expression: "F: (3a)(a) = 3a^2", explanation: "First terms" },
                  { expression: "O: (3a)(-7) = -21a", explanation: "Outer terms" },
                  { expression: "I: (5)(a) = 5a", explanation: "Inner terms" },
                  { expression: "L: (5)(-7) = -35", explanation: "Last terms" },
                  { expression: "3a^2 - 21a + 5a - 35", explanation: "Sum of FOIL products" },
                  { expression: "3a^2 - 16a - 35", explanation: "Combine like terms" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6: Multiply Polynomials in Context\n\nA rectangular sign has length $(3x + 4)$ feet and width $(2x - 5)$ feet.\n\nWrite a polynomial expression for the area of the sign.\n\n$A = \\text{length} \\times \\text{width}$\n\n$A = (3x + 4)(2x - 5)$\n\nUsing FOIL:\n\n$A = 6x^2 - 15x + 8x - 20$\n\n$A = 6x^2 - 7x - 20$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(3x + 4)(2x - 5)",
                steps: [
                  { expression: "A = (3x + 4)(2x - 5)", explanation: "Formula for area" },
                  { expression: "F: (3x)(2x) = 6x^2", explanation: "First terms" },
                  { expression: "O: (3x)(-5) = -15x", explanation: "Outer terms" },
                  { expression: "I: (4)(2x) = 8x", explanation: "Inner terms" },
                  { expression: "L: (4)(-5) = -20", explanation: "Last terms" },
                  { expression: "6x^2 - 15x + 8x - 20", explanation: "Sum of FOIL products" },
                  { expression: "6x^2 - 7x - 20", explanation: "Combine like terms" },
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
              markdown: "## Apply Example 7: Write and Simplify a Polynomial Expression\n\nA three-tier cake has rectangular prisms with dimensions expressed in terms of $x$.\n\nWrite and simplify a polynomial expression for the total volume.\n\n### Volume of each tier\n\n- Tier 1: $8x^3 - 2x^2 - 3x$\n- Tier 2: $4x^3 - x^2 - 1.5x$\n- Tier 3: $2x^3 - 0.5x^2 - 0.75x$\n\n### Total volume\n\n$14x^3 - 3.5x^2 - 5.25x$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(8x^3 - 2x^2 - 3x) + (4x^3 - x^2 - 1.5x) + (2x^3 - 0.5x^2 - 0.75x)",
                steps: [
                  { expression: "8x^3 + 4x^3 + 2x^3 = 14x^3", explanation: "Combine cubic terms" },
                  { expression: "-2x^2 - x^2 - 0.5x^2 = -3.5x^2", explanation: "Combine quadratic terms" },
                  { expression: "-3x - 1.5x - 0.75x = -5.25x", explanation: "Combine linear terms" },
                  { expression: "14x^3 - 3.5x^2 - 5.25x", explanation: "Write the total volume expression" },
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
              markdown: "## Discussion Questions\n\n1. Why are exponents added when you multiply monomials?\n2. Will the terms in a sum always have the same variables and exponents as the original expressions? Explain.\n3. Why is it helpful to insert placeholders such as $0x^3$ and $0x^5$ terms when subtracting polynomials?\n4. How does the FOIL method relate to the Distributive Property?",
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
                    question: "When multiplying $x^2 \\cdot x^3$, the result is:",
                    options: [
                      "$x^5$",
                      "$x^6$",
                      "$2x^5$",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "The FOIL method is used to multiply:",
                    options: [
                      "Any two polynomials",
                      "Two binomials",
                      "A monomial and a polynomial",
                    ],
                    correctIndex: 1,
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
              markdown: "## Reflection\n\nToday you learned about operations with polynomials — adding, subtracting, and multiplying. Consider the following:\n\n- How does the closure property relate to polynomial operations?\n- What strategies help you avoid errors when multiplying polynomials?\n- What questions do you still have about polynomial operations?\n\n**Tip**: Always combine like terms after performing polynomial operations. Like terms have the same variable raised to the same power.",
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
