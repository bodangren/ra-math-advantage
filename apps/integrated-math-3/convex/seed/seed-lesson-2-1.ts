import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-2-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Polynomial Functions",
          slug: lessonSlug,
          description: "Students graph and analyze power functions and polynomial functions.",
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
          title: "Polynomial Functions",
          description: "Students graph and analyze power functions and polynomial functions.",
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
                equation: "y = x^3",
                title: "Explore Power Functions",
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
              markdown: "## Key Terms\n\n- **Power function**: A function of the form $f(x) = ax^n$, where $a$ and $n$ are nonzero real numbers\n- **Leading coefficient**: The coefficient $a$ of the term with highest degree\n- **Degree**: The exponent $n$ in the term with highest power\n- **Monomial function**: A power function with positive integer $n$\n- **Polynomial in one variable**: An expression of the form $a_nx^n + a_{n-1}x^{n-1} + \\ldots + a_1x + a_0$\n- **Standard form**: When terms are written from greatest degree to least degree\n- **Polynomial function**: A continuous function described by a polynomial equation in one variable\n- **Quartic function**: A fourth-degree polynomial\n- **Quintic function**: A fifth-degree polynomial",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Graphing Power Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Understanding Power Functions\n\nA **power function** is any function of the form $f(x) = ax^n$, where $a$ and $n$ are nonzero real numbers.\n\n- $a$ is the **leading coefficient**\n- $n$ is the **degree**\n- A power function with positive integer $n$ is called a **monomial function**\n\n### End Behavior of Monomial Functions\n\nThe behavior of $f(x) = ax^n$ as $x$ approaches $\\pm \\infty$ depends on whether $n$ is even or odd, and whether $a$ is positive or negative.\n\n| Degree | Leading Coefficient | as $x \\to -\\infty$ | as $x \\to +\\infty$ |\n|--------|---------------------|---------------------|----------------------|\n| Even   | Positive ($a > 0$) | $f(x) \\to +\\infty$ | $f(x) \\to +\\infty$ |\n| Odd    | Positive ($a > 0$) | $f(x) \\to -\\infty$ | $f(x) \\to +\\infty$ |\n| Even   | Negative ($a < 0$) | $f(x) \\to -\\infty$ | $f(x) \\to -\\infty$ |\n| Odd    | Negative ($a < 0$) | $f(x) \\to +\\infty$ | $f(x) \\to -\\infty$ |",
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
              markdown: "## Example 1: End Behavior of a Monomial Function\n\nDescribe the end behavior of $f(x) = -2x^3$ using the leading coefficient and degree, and state the domain and range.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = -2x^3",
                steps: [
                  { expression: "f(x) = -2x^3", explanation: "Identify the function" },
                  { expression: "Leading coefficient = -2 (negative)", explanation: "The coefficient a = -2" },
                  { expression: "Degree = 3 (odd)", explanation: "The exponent n = 3" },
                  { expression: "Odd degree + negative coefficient", explanation: "Determine end behavior pattern" },
                  { expression: "as x → -∞, f(x) → +∞", explanation: "Left end behavior" },
                  { expression: "as x → +∞, f(x) → -∞", explanation: "Right end behavior" },
                  { expression: "Domain: all real numbers", explanation: "Polynomial has no restrictions" },
                  { expression: "Range: all real numbers", explanation: "Cubic function covers all y-values" },
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
              markdown: "## Example 2: Graph a Power Function by Using a Table\n\nPressure in a garden hose can be modeled by $P(F) = \\frac{3}{2}F^2$ where $F$ is the flow rate in gallons per minute.\n\nGraph the function and state the domain and range.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "P(F) = (3/2)F^2",
                steps: [
                  { expression: "P(F) = (3/2)F^2", explanation: "Identify the function" },
                  { expression: "a = 3/2 (positive), n = 2 (even)", explanation: "Determine coefficients" },
                  { expression: "Even degree, positive coefficient", explanation: "Both ends go up" },
                  { expression: "Domain: all real numbers", explanation: "No restrictions on F" },
                  { expression: "Range: y ≥ 0", explanation: "Output is always nonnegative" },
                  { expression: "Table: F = -2, -1, 0, 1, 2", explanation: "Choose x-values" },
                  { expression: "P(-2) = 6, P(-1) = 1.5, P(0) = 0, P(1) = 1.5, P(2) = 6", explanation: "Calculate values" },
                  { expression: "Graph is a parabola opening upward", explanation: "Visualize the result" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Graphing Polynomial Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Understanding Polynomial Functions\n\nA **polynomial in one variable** has the form:\n\n$$a_nx^n + a_{n-1}x^{n-1} + \\ldots + a_2x^2 + a_1x + a_0$$\n\nwhere:\n- $a_n \\neq 0$\n- The coefficients are real numbers\n- $n$ is a nonnegative integer\n\nWhen written from greatest degree to least degree, the polynomial is in **standard form**.\n\n- The **degree** is $n$\n- The **leading coefficient** is $a_n$\n\n### Key Features\n\n- A fourth-degree polynomial is called a **quartic function**\n- A fifth-degree polynomial is called a **quintic function**\n- The degree tells the **maximum number of times** the graph can intersect the x-axis\n- A polynomial function is **continuous** — its graph has no gaps or holes",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3: Degrees and Leading Coefficients\n\nState the degree and leading coefficient of each expression. If it is not a polynomial in one variable, explain why.\n\n1. $2x^4 - 3x^3 - 4x^2 - 5x + 6$\n2. $7x^3 - 2$\n3. $4x^2 - 2xy + 8y^2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "2x^4 - 3x^3 - 4x^2 - 5x + 6",
                steps: [
                  { expression: "2x^4 - 3x^3 - 4x^2 - 5x + 6", explanation: "Identify the polynomial" },
                  { expression: "Degree: 4", explanation: "Highest exponent is 4" },
                  { expression: "Leading coefficient: 2", explanation: "Coefficient of x^4" },
                  { expression: "This IS a polynomial in one variable", explanation: "Only x appears" },
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
              markdown: "## Example 4: Evaluate and Graph a Polynomial Function\n\nThe density of the Sun can be modeled by:\n\n$$f(x) = 519x^4 - 1630x^3 + 1844x^2 - 889x + 155$$\n\nwhere $x$ is the percent of the distance from the core to the surface, written as a decimal.\n\n**Part A**: Find the density at a radius 60% of the way to the surface.\n\n**Part B**: Graph the function.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = 519x^4 - 1630x^3 + 1844x^2 - 889x + 155",
                steps: [
                  { expression: "x = 0.6 (60%)", explanation: "Convert percent to decimal" },
                  { expression: "f(0.6) = 519(0.6)^4 - 1630(0.6)^3 + 1844(0.6)^2 - 889(0.6) + 155", explanation: "Substitute into function" },
                  { expression: "f(0.6) = 67.2624 - 352.08 + 663.84 - 533.4 + 155", explanation: "Calculate each term" },
                  { expression: "f(0.6) = 0.6224", explanation: "Simplify" },
                  { expression: "Density ≈ 0.6224 g/cm³", explanation: "Interpret the result" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5: Zeros of a Polynomial Function\n\nUse the graph to state the number of real zeros of the function.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = x^3 + 2x^2 - 3x",
                steps: [
                  { expression: "Real zeros occur where f(x) = 0", explanation: "Definition of zeros" },
                  { expression: "Factor: f(x) = x(x^2 + 2x - 3)", explanation: "Factor out x" },
                  { expression: "f(x) = x(x + 3)(x - 1)", explanation: "Factor quadratic" },
                  { expression: "x = 0, x = -3, x = 1", explanation: "Set each factor to zero" },
                  { expression: "There are 3 real zeros", explanation: "Count the solutions" },
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
              markdown: "## Example 6: Compare Polynomial Functions\n\nExamine $f(x) = x^3 + 2x^2 - 3x$ and $g(x)$ shown in the graph.\n\n**Part A**: Graph $f(x)$ using a table of values.\n\n**Part B**: Analyze the extrema.\n\n**Part C**: Compare key features (zeros, intercepts, end behavior).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "compare",
                equations: ["f(x) = x^3 + 2x^2 - 3x", "g(x)"],
                title: "Compare Polynomial Functions",
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
              markdown: "## Discussion Questions\n\n1. How does the degree of a polynomial affect its end behavior?\n2. Why does a polynomial function have no gaps or holes in its graph?\n3. How is the number of real zeros related to the degree of a polynomial?\n4. What information does the leading coefficient give you about a polynomial function?",
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
                    question: "The degree of a polynomial tells you:",
                    options: [
                      "The number of times the graph intersects the x-axis at maximum",
                      "The exact number of x-intercepts",
                      "The y-intercept value",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "A polynomial function is always:",
                    options: ["Linear", "Continuous", "Parabolic", "Increasing"],
                    correctIndex: 1,
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
              markdown: "## Reflection\n\nToday you learned about polynomial functions and their graphs. Consider the following:\n\n- How does the end behavior of a polynomial depend on its degree and leading coefficient?\n- What strategies help you graph polynomial functions accurately?\n- What questions do you still have about polynomial functions?\n\n**Tip**: Understanding the relationship between algebraic form and graphical features helps you analyze any polynomial function.",
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