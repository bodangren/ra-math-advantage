import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-3-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Roots and Zeros",
          slug: lessonSlug,
          description: "Students use the Fundamental Theorem of Algebra to determine the number and type of roots of polynomial equations, find zeros, and use zeros to graph polynomial functions.",
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
          title: "Roots and Zeros",
          description: "Students use the Fundamental Theorem of Algebra to determine the number and type of roots of polynomial equations, find zeros, and use zeros to graph polynomial functions.",
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
              markdown: "## Explore: Roots of Quadratic Polynomials\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nIs the Fundamental Theorem of Algebra true for quadratic polynomials?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = x^2 - 4",
                title: "Roots of Quadratic Polynomials",
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
              markdown: "## Key Terms\n\n- **Multiplicity**: The number of times a number is a zero of a polynomial; repeated roots are roots of multiplicity m, where m is greater than 1",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Fundamental Theorem of Algebra",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Zeros, Factors, Roots, and Intercepts\n\nThe zero of a function $f(x)$ is any value $c$ such that $f(c) = 0$.\n\nLet $P(x)$ be a polynomial function. Then the following are equivalent:\n\n- $c$ is a zero of $P(x)$\n- $c$ is a root or solution of $P(x) = 0$\n- $x - c$ is a factor of the polynomial\n- if $c$ is real, then $(c, 0)$ is an x-intercept of the graph\n\n**Example:** For $P(x) = x^2 + 3x - 18$:\n- zeros: $-6$ and $3$\n- roots of $P(x) = 0$: $-6$ and $3$\n- factors: $(x + 6)$ and $(x - 3)$\n- x-intercepts: $(-6, 0)$ and $(3, 0)$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "text" as const,
            content: {
              markdown: "## Fundamental Theorem of Algebra\n\nEvery polynomial equation with degree greater than zero has at least one root in the set of complex numbers.\n\n### Corollary\n\nA polynomial equation of degree $n$ has exactly $n$ roots in the set of complex numbers, including repeated roots.\n\nRepeated roots are roots of **multiplicity** $m$, where $m$ is greater than $1$.\n\n**Example:** $f(x) = x^3 = x \\cdot x \\cdot x$ has a zero at $x = 0$ with multiplicity $3$.\n\n### Think About It\n\nWhat is the multiplicity of the zero at $x = 1$ for $p(x) = (x - 1)^5$? Explain your reasoning.",
            },
          },
          {
            sequenceOrder: 3,
            sectionType: "text" as const,
            content: {
              markdown: "## Descartes' Rule of Signs\n\nFor a polynomial $P(x)$ with real coefficients and nonzero constant term:\n\n- the number of positive real zeros equals the number of sign changes in $P(x)$, or less than that by an even number\n- the number of negative real zeros equals the number of sign changes in $P(-x)$, or less than that by an even number",
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
              markdown: "## Example 1 — Determine the Number and Type of Roots\n\nSolve:\n\n$$x^4 + 49x^2 = 0$$\n\nFactor:\n\n$$x^2(x^2 + 49) = 0$$\n\nSo:\n\n- $x^2 = 0$ → $x = 0$\n- $x^2 + 49 = 0$ → $x^2 = -49$ → $x = \\pm 7i$\n\nThe polynomial has degree $4$, so it has four roots in the complex numbers.\n\nBecause $x^2$ is a factor:\n\n- $x = 0$ is a repeated real root with multiplicity $2$\n- $7i$ and $-7i$ are imaginary roots",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x^4 + 49x^2 = 0",
                steps: [
                  { expression: "x^4 + 49x^2 = 0", explanation: "Start with the original equation" },
                  { expression: "x^2(x^2 + 49) = 0", explanation: "Factor out the greatest common factor" },
                  { expression: "x^2 = 0 → x = 0", explanation: "First factor gives a repeated root" },
                  { expression: "x^2 + 49 = 0 → x^2 = -49", explanation: "Second factor gives imaginary roots" },
                  { expression: "x = ±7i", explanation: "Imaginary roots from negative square" },
                  { expression: "Degree 4 → 4 roots total", explanation: "Fundamental Theorem of Algebra" },
                  { expression: "x = 0 (multiplicity 2), ±7i", explanation: "Two real repeated and two imaginary roots" },
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
              markdown: "## Example 2 — Find the Number of Positive and Negative Zeros\n\nState the possible number of positive real zeros, negative real zeros, and imaginary zeros of:\n\n$$f(x) = x^5 - 2x^4 - x^3 + 6x^2 - 5x + 10$$\n\nBecause the degree is $5$, there are $5$ zeros total.\n\n### Part A: Positive real zeros\n\nThere are $4$ sign changes in $f(x)$, so there are $4$, $2$, or $0$ positive real zeros.\n\n### Part B: Negative real zeros\n\nCompute $f(-x)$ and count sign changes. There is $1$ sign change, so there is $1$ negative real zero.\n\n### Part C: Imaginary zeros\n\nPossible combinations:\n\n| Positive Real Zeros | Negative Real Zeros | Imaginary Zeros |\n| ------------------- | ------------------- | --------------- |\n| 4                   | 1                   | 0               |\n| 2                   | 1                   | 2               |\n| 0                   | 1                   | 4               |",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = x^5 - 2x^4 - x^3 + 6x^2 - 5x + 10",
                steps: [
                  { expression: "Degree 5 → 5 zeros total", explanation: "Fundamental Theorem of Algebra" },
                  { expression: "Count sign changes in f(x)", explanation: "+ to - to - to + to - to + = 4 changes" },
                  { expression: "4, 2, or 0 positive real zeros", explanation: "By Descartes' Rule of Signs" },
                  { expression: "f(-x) = -x^5 - 2x^4 + x^3 + 6x^2 + 5x + 10", explanation: "Substitute -x for x" },
                  { expression: "1 sign change in f(-x)", explanation: "- to + = 1 change" },
                  { expression: "Exactly 1 negative real zero", explanation: "By Descartes' Rule of Signs" },
                  { expression: "Possible: (4,1,0), (2,1,2), (0,1,4)", explanation: "Positive, negative, imaginary combinations" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Finding Zeros of Polynomial Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Complex Conjugates Theorem\n\nIf $a + bi$ is a zero of a polynomial with real coefficients, then $a - bi$ is also a zero.\n\n**Example:** If $1 + 2i$ is a zero of $f(x)$, then $1 - 2i$ is also a zero.\n\nWhen you know all of the zeros of a polynomial function and need the equation:\n\n- write the corresponding factors\n- multiply them together",
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
              markdown: "## Example 3 — Use Synthetic Substitution to Find Zeros\n\nFind all of the zeros of:\n\n$$f(x) = x^3 + x^2 - 7x - 15$$\n\nand use them to sketch a rough graph.\n\n### Part A: Find all zeros\n\n**Step 1:** Since the degree is $3$, the function has $3$ zeros.\n\n**Step 2:** Using sign changes: $f(x)$ has $1$ positive real zero; $f(-x)$ has $2$ or $0$ negative real zeros.\n\n**Step 3:** Testing possible values shows that $x = 3$ is a zero. Synthetic substitution gives the depressed polynomial $x^2 + 4x + 5$.\n\nUse the Quadratic Formula. The zeros are:\n\n- $3$\n- $-2 - i$\n- $-2 + i$\n\n### Part B: Sketch a rough graph\n\nThe graph crosses the x-axis at $(3, 0)$, has odd degree and positive leading coefficient, so as $x \\to -\\infty$, $f(x) \\to -\\infty$ and as $x \\to \\infty$, $f(x) \\to \\infty$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = x^3 + x^2 - 7x - 15",
                steps: [
                  { expression: "Degree 3 → 3 zeros total", explanation: "Fundamental Theorem of Algebra" },
                  { expression: "f(x) has 1 sign change → 1 positive real zero", explanation: "Descartes' Rule of Signs" },
                  { expression: "f(-x) has 2 sign changes → 2 or 0 negative real zeros", explanation: "Descartes' Rule of Signs" },
                  { expression: "Test x = 3: f(3) = 27 + 9 - 21 - 15 = 0", explanation: "3 is a zero" },
                  { expression: "Synthetic division gives depressed polynomial x^2 + 4x + 5", explanation: "Quotient from dividing by (x - 3)" },
                  { expression: "Use Quadratic Formula on x^2 + 4x + 5", explanation: "a = 1, b = 4, c = 5" },
                  { expression: "x = (-4 ± √(16 - 20))/2 = (-4 ± √(-4))/2", explanation: "Discriminant is negative" },
                  { expression: "x = -2 ± i", explanation: "Complex conjugate roots" },
                  { expression: "Zeros: 3, -2 + i, -2 - i", explanation: "All three zeros found" },
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
              markdown: "## Example 4 — Use a Graph to Write a Polynomial Function\n\nWrite a polynomial function that could be represented by a graph crossing the x-axis at $x = -4$, $x = -2$, and $x = 1$.\n\nThe factors are:\n\n- $x + 4$\n- $x + 2$\n- $x - 1$\n\nMultiply:\n\n$$y = (x + 4)(x + 2)(x - 1)$$\n\n$$= (x^2 + 6x + 8)(x - 1)$$\n\n$$= x^3 + 5x^2 + 2x - 8$$\n\nSo one possible polynomial is $y = x^3 + 5x^2 + 2x - 8$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = (x + 4)(x + 2)(x - 1)",
                steps: [
                  { expression: "Zeros at -4, -2, 1", explanation: "Identify x-intercepts from the graph" },
                  { expression: "Factors: (x + 4)(x + 2)(x - 1)", explanation: "Write factors from zeros" },
                  { expression: "Multiply (x + 4)(x + 2) = x^2 + 6x + 8", explanation: "Multiply first two factors" },
                  { expression: "(x^2 + 6x + 8)(x - 1)", explanation: "Multiply result by third factor" },
                  { expression: "x^3 - x^2 + 6x^2 - 6x + 8x - 8", explanation: "Distribute each term" },
                  { expression: "x^3 + 5x^2 + 2x - 8", explanation: "Combine like terms" },
                  { expression: "y = x^3 + 5x^2 + 2x - 8", explanation: "Final polynomial function" },
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
              markdown: "## Apply Example 5 — Use Zeros to Graph a Polynomial Function\n\nA book publisher knows that if they charge $5 or $40, their profit will be $0. Graph a polynomial function that could represent the company's profit in thousands of dollars as a function of price.\n\nLet $x$ represent the price and $y$ represent the profit.\n\nBecause $5$ and $40$ are zeros, use them to write factors and then an equation.\n\nOne function with those zeros is $y = x^2 - 45x + 200$, but that graph does not make sense in context because it shows unreasonable profit behavior for book prices.\n\nA more reasonable model is:\n\n$$y = -x^2 + 45x - 200$$\n\nMultiplying by $-1$ makes the parabola open downward, so the profit is negative when charging less than $5$, which makes more sense in context.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = -x^2 + 45x - 200",
                steps: [
                  { expression: "Zeros at x = 5 and x = 40", explanation: "Profit is $0 at these prices" },
                  { expression: "Factors: (x - 5)(x - 40)", explanation: "Write factors from zeros" },
                  { expression: "y = (x - 5)(x - 40) = x^2 - 45x + 200", explanation: "One possible polynomial" },
                  { expression: "Parabola opens upward → unreasonable for prices \u003c 5", explanation: "Context check" },
                  { expression: "Multiply by -1: y = -x^2 + 45x - 200", explanation: "Flip to open downward" },
                  { expression: "Profit negative when x \u003c 5", explanation: "Makes sense in context" },
                  { expression: "y = -x^2 + 45x - 200", explanation: "Final reasonable model" },
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
              markdown: "## Discussion Questions\n\n1. How does the Fundamental Theorem of Algebra help you determine the number of roots of a polynomial equation?\n2. What is the connection between the zeros of a polynomial and its factors?\n3. How can Descartes' Rule of Signs help you predict the nature of roots without solving?\n4. Why do complex roots of polynomials with real coefficients always come in conjugate pairs?\n\n## Talk About It\n\nIf a polynomial has degree $n$ and no real zeros, then how many imaginary zeros does it have? Explain.",
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
                    question: "A polynomial of degree 4 has exactly how many roots in the complex numbers?",
                    options: [
                      "4",
                      "At most 4",
                      "At least 2",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "If 2 + 3i is a zero of a polynomial with real coefficients, what else must be a zero?",
                    options: [
                      "2 - 3i",
                      "-2 + 3i",
                      "-2 - 3i",
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
              markdown: "## Reflection\n\nToday you learned about roots and zeros of polynomial functions. Consider the following:\n\n- How does the Fundamental Theorem of Algebra help you know how many roots to look for?\n- What is the relationship between zeros, factors, roots, and x-intercepts?\n- How can you use zeros to write or graph a polynomial function?\n- What questions do you still have about roots and zeros?\n\n**Tip:** Remember that complex roots come in conjugate pairs for polynomials with real coefficients.",
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
