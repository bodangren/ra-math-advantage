import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-3-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Solving Polynomial Equations Algebraically",
          slug: lessonSlug,
          description: "Students solve polynomial equations by factoring and by writing them in quadratic form.",
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
          title: "Solving Polynomial Equations Algebraically",
          description: "Students solve polynomial equations by factoring and by writing them in quadratic form.",
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
              markdown: "## Explore: Solving Polynomial Equations Algebraically\n\nUse algebraic techniques to complete the explore.\n\n**Inquiry Question:**\nHow can you solve polynomial equations using factoring and substitution?",
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
                title: "Explore Polynomial Factoring",
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
              markdown: "## Key Terms\n\n- **Prime polynomial**: A polynomial that cannot be written as a product of two polynomials with integral coefficients\n- **Quadratic form**: An expression that can be written as $au^2 + bu + c$ where $u$ is some expression in $x$\n- **Sum of cubes**: $a^3 + b^3 = (a + b)(a^2 - ab + b^2)$\n- **Difference of cubes**: $a^3 - b^3 = (a - b)(a^2 + ab + b^2)$\n- **Zero Product Property**: If $AB = 0$, then $A = 0$ or $B = 0$",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Solving Polynomial Equations by Factoring",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving Polynomial Equations by Factoring\n\nLike quadratics, some higher-degree polynomials can be factored.\n\nA **prime polynomial** is a polynomial that cannot be written as a product of two polynomials with integral coefficients. Like a prime real number, the only factors of a prime polynomial are 1 and itself.\n\n### Key Factoring Techniques\n\nAlways look for a **greatest common factor** first:\n\n- GCF\n- Difference of two squares\n- Sum of two cubes\n- Difference of two cubes\n- Perfect square trinomials\n- General trinomials\n- Grouping",
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
              markdown: "## Example 1 — Factor Sums and Differences of Cubes\n\nFactor each polynomial. If the polynomial cannot be factored, write prime.\n\n### a. $8x^3 + 125y^{12}$\n\nThe GCF is 1, and both terms are perfect cubes:\n\n- $8x^3 = (2x)^3$\n- $125y^{12} = (5y^4)^3$\n\nSo:\n\n$$8x^3 + 125y^{12} = (2x)^3 + (5y^4)^3 = (2x + 5y^4)(4x^2 - 10xy^4 + 25y^8)$$\n\n### b. $54x^5 - 128x^2y^3$\n\nFactor out the GCF:\n\n$$54x^5 - 128x^2y^3 = 2x^2(27x^3 - 64y^3)$$\n\nNow factor the difference of cubes:\n\n$$= 2x^2[(3x)^3 - (4y)^3] = 2x^2(3x - 4y)(9x^2 + 12xy + 16y^2)$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "8x^3 + 125y^12",
                steps: [
                  { expression: "Identify as sum of cubes", explanation: "8x³ = (2x)³ and 125y¹² = (5y⁴)³" },
                  { expression: "Apply sum of cubes formula", explanation: "a³ + b³ = (a + b)(a² - ab + b²)" },
                  { expression: "a = 2x, b = 5y⁴", explanation: "Substitute" },
                  { expression: "(2x + 5y⁴)((2x)² - (2x)(5y⁴) + (5y⁴)²)", explanation: "Apply formula" },
                  { expression: "(2x + 5y⁴)(4x² - 10xy⁴ + 25y⁸)", explanation: "Simplify" },
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
              markdown: "## Example 2 — Factor by Grouping\n\nFactor:\n\n$$14ax^2 - 16by + 20cy + 28bx^2 - 35cx^2 - 8ay$$\n\nGroup terms:\n\n$$(14ax^2 + 28bx^2 - 35cx^2) + (-8ay - 16by + 20cy)$$\n\nFactor each group:\n\n$$= 7x^2(2a + 4b - 5c) - 4y(2a + 4b - 5c)$$\n\nFactor the common binomial:\n\n$$= (7x^2 - 4y)(2a + 4b - 5c)$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "14ax^2 - 16by + 20cy + 28bx^2 - 35cx^2 - 8ay",
                steps: [
                  { expression: "Group terms by common factors", explanation: "(14ax² + 28bx² - 35cx²) + (-8ay - 16by + 20cy)" },
                  { expression: "Factor 7x² from first group", explanation: "7x²(2a + 4b - 5c)" },
                  { expression: "Factor -4y from second group", explanation: "-4y(2a + 4b - 5c)" },
                  { expression: "Factor common binomial (2a + 4b - 5c)", explanation: "Group the factored terms" },
                  { expression: "(7x² - 4y)(2a + 4b - 5c)", explanation: "Final factored form" },
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
              markdown: "## Example 3 — Combine Cubes and Squares\n\nFactor:\n\n$$64x^6 - y^6$$\n\nThis can be viewed as a difference of squares first:\n\n$$64x^6 - y^6 = (8x^3)^2 - (y^3)^2 = (8x^3 + y^3)(8x^3 - y^3)$$\n\nNow factor each expression as cubes:\n\n$$= [(2x)^3 + y^3][(2x)^3 - y^3]$$\n\n$$= (2x + y)(4x^2 - 2xy + y^2)(2x - y)(4x^2 + 2xy + y^2)$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "64x^6 - y^6",
                steps: [
                  { expression: "Recognize as difference of squares", explanation: "(8x³)² - (y³)²" },
                  { expression: "Apply difference of squares", explanation: "(8x³ + y³)(8x³ - y³)" },
                  { expression: "Factor 8x³ + y³ as sum of cubes", explanation: "(2x)³ + y³ = (2x + y)(4x² - 2xy + y²)" },
                  { expression: "Factor 8x³ - y³ as difference of cubes", explanation: "(2x)³ - y³ = (2x - y)(4x² + 2xy + y²)" },
                  { expression: "(2x + y)(4x² - 2xy + y²)(2x - y)(4x² + 2xy + y²)", explanation: "Final factored form" },
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
              markdown: "## Example 4 — Solve a Polynomial Equation by Factoring\n\nSolve:\n\n$$4x^3 + 12x^2 - 9x - 27 = 0$$\n\nGroup terms:\n\n$$(4x^3 + 12x^2) + (-9x - 27) = 0$$\n\nFactor each group:\n\n$$4x^2(x + 3) - 9(x + 3) = 0$$\n\nFactor common binomial:\n\n$$(4x^2 - 9)(x + 3) = 0$$\n\nFactor the difference of squares:\n\n$$(2x + 3)(2x - 3)(x + 3) = 0$$\n\nUse the Zero Product Property:\n\n- $2x + 3 = 0 \\Rightarrow x = -\\frac{3}{2}$\n- $2x - 3 = 0 \\Rightarrow x = \\frac{3}{2}$\n- $x + 3 = 0 \\Rightarrow x = -3$\n\n**Solutions:** $-3$, $-\\frac{3}{2}$, $\\frac{3}{2}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "4x^3 + 12x^2 - 9x - 27 = 0",
                steps: [
                  { expression: "Group terms", explanation: "(4x³ + 12x²) + (-9x - 27) = 0" },
                  { expression: "Factor each group", explanation: "4x²(x + 3) - 9(x + 3) = 0" },
                  { expression: "Factor common binomial (x + 3)", explanation: "(4x² - 9)(x + 3) = 0" },
                  { expression: "Factor difference of squares", explanation: "(2x + 3)(2x - 3)(x + 3) = 0" },
                  { expression: "Apply Zero Product Property", explanation: "Set each factor equal to 0" },
                  { expression: "x = -3/2, x = 3/2, x = -3", explanation: "Solutions" },
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
              markdown: "## Example 5 — Write and Solve a Polynomial Equation by Factoring\n\nThe small cube has side length $x$, and the larger cube has side length $4x$. The volume of the figure is $1701 \\text{ cm}^3$.\n\nWrite and solve an equation.\n\n$$(4x)^3 - x^3 = 1701$$\n\n$$64x^3 - x^3 = 1701$$\n\n$$63x^3 = 1701$$\n\n$$x^3 = 27$$\n\n$$x^3 - 27 = 0$$\n\nFactor the difference of cubes:\n\n$$(x - 3)(x^2 + 3x + 9) = 0$$\n\nSo:\n\n- $x = 3$\n- or the other two roots are complex\n\nSince 3 is the only real solution, the cube side lengths are:\n- small cube: $3 \\text{ cm}$\n- large cube: $12 \\text{ cm}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(4x)^3 - x^3 = 1701",
                steps: [
                  { expression: "Write volume equation", explanation: "(4x)³ - x³ = 1701" },
                  { expression: "Simplify", explanation: "64x³ - x³ = 1701" },
                  { expression: "Combine like terms", explanation: "63x³ = 1701" },
                  { expression: "Divide by 63", explanation: "x³ = 27" },
                  { expression: "Rewrite as difference of cubes", explanation: "x³ - 27 = 0" },
                  { expression: "Factor: (x - 3)(x² + 3x + 9) = 0", explanation: "Apply difference of cubes formula" },
                  { expression: "x = 3 (only real solution)", explanation: "Solve for x" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Learn: Solving Polynomial Equations in Quadratic Form",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving Polynomial Equations in Quadratic Form\n\nSome polynomials in $x$ can be rewritten in **quadratic form**.\n\n### Key Concept: Quadratic Form\n\nAn expression in quadratic form can be written as:\n\n$$au^2 + bu + c$$\n\nfor numbers $a$, $b$, and $c$, where $a \\neq 0$ and $u$ is some expression in $x$.\n\n### Examples of Quadratic Form\n\n- $2x^{10} + x^5 + 9 = (2x^5)^2 + (2x^5) + 9$ with $u = 2x^5$\n- $12x^6 - 20x^3 + 6 = 5(6x^3)^2 + 3(6x^3) - 28$ with $u = 6x^3$\n- $9x^6 - 4x^2 - 12$ cannot be written in quadratic form because $x^6 \\neq (x^2)^2$",
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
              markdown: "## Example 6 — Write Expressions in Quadratic Form\n\nWrite each expression in quadratic form, if possible.\n\n### a. $4x^{20} + 6x^{10} + 15$\n\nLet $u = 2x^{10}$.\n\nThen:\n\n$$4x^{20} + 6x^{10} + 15 = (2x^{10})^2 + 3(2x^{10}) + 15$$\n\n### b. $18x^4 + 180x^8 - 28$\n\nRewrite in standard form:\n\n$$180x^8 + 18x^4 - 28$$\n\nLet $u = 6x^4$.\n\nThen:\n\n$$= 5(6x^4)^2 + 3(6x^4) - 28$$\n\n### c. $9x^6 - 4x^2 - 12$\n\nThis cannot be written in quadratic form because $x^6 \\neq (x^2)^2$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "4x^20 + 6x^10 + 15",
                steps: [
                  { expression: "Identify the power relationship", explanation: "x²⁰ = (x¹⁰)²" },
                  { expression: "Let u = 2x^10", explanation: "Choose u to simplify coefficients" },
                  { expression: "Rewrite in terms of u", explanation: "(2x¹⁰)² + 3(2x¹⁰) + 15" },
                  { expression: "u² + 3u + 15", explanation: "Quadratic form" },
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
              markdown: "## Example 7 — Solve Equations in Quadratic Form\n\nSolve:\n\n$$8x^4 + 10x^2 - 12 = 0$$\n\nRewrite:\n\n$$2(2x^2)^2 + 5(2x^2) - 12 = 0$$\n\nLet $u = 2x^2$.\n\nThen:\n\n$$2u^2 + 5u - 12 = 0$$\n\nFactor:\n\n$$(2u - 3)(u + 4) = 0$$\n\nSo:\n\n- $u = \\frac{3}{2}$\n- $u = -4$\n\nReplace $u$:\n\n- $2x^2 = \\frac{3}{2} \\Rightarrow x^2 = \\frac{3}{4} \\Rightarrow x = \\pm\\frac{\\sqrt{3}}{2}$\n- $2x^2 = -4 \\Rightarrow x^2 = -2 \\Rightarrow x = \\pm i\\sqrt{2}$\n\n**Solutions:** $\\frac{\\sqrt{3}}{2}$, $-\\frac{\\sqrt{3}}{2}$, $i\\sqrt{2}$, $-i\\sqrt{2}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "8x^4 + 10x^2 - 12 = 0",
                steps: [
                  { expression: "Rewrite in quadratic form", explanation: "2(2x²)² + 5(2x²) - 12 = 0" },
                  { expression: "Let u = 2x²", explanation: "Substitute to simplify" },
                  { expression: "2u² + 5u - 12 = 0", explanation: "Quadratic equation in u" },
                  { expression: "Factor: (2u - 3)(u + 4) = 0", explanation: "Factor the quadratic" },
                  { expression: "u = 3/2 or u = -4", explanation: "Solve for u" },
                  { expression: "2x² = 3/2 → x² = 3/4 → x = ±√3/2", explanation: "Back-substitute for first solution" },
                  { expression: "2x² = -4 → x² = -2 → x = ±i√2", explanation: "Back-substitute for second solution" },
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
              markdown: "## Discussion Questions\n\n1. How do you decide which factoring technique to use first?\n2. What is the connection between the zeros of a polynomial and the factors?\n3. When might solving a polynomial equation in quadratic form be more useful than factoring completely?\n4. How can you check that your factored form is correct?",
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
                    question: "To factor 8x³ + 125y³, what formulas apply?",
                    options: [
                      "Sum of cubes formula",
                      "Difference of squares formula",
                      "Perfect square trinomial formula",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the first step when factoring any polynomial?",
                    options: [
                      "Look for a difference of squares",
                      "Look for a greatest common factor",
                      "Try grouping",
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
              markdown: "## Reflection\n\nToday you learned how to solve polynomial equations algebraically. Consider the following:\n\n- How does identifying the factoring technique first help you solve equations?\n- What strategies help you recognize when an expression is in quadratic form?\n- What questions do you still have about solving polynomial equations by factoring?\n\n**Tip**: Always look for a greatest common factor (GCF) before applying other techniques.",
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