import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-3-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Solving Polynomial Equations by Graphing",
          slug: lessonSlug,
          description: "Students solve polynomial equations by graphing related functions and systems.",
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
          title: "Solving Polynomial Equations by Graphing",
          description: "Students solve polynomial equations by graphing related functions and systems.",
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
              markdown: "## Explore: Solutions of Polynomial Equations\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nHow can you solve a polynomial equation by using the graph of a related polynomial function?",
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
                title: "Solutions of Polynomial Equations",
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
              markdown: "## Key Terms\n\n- **Polynomial equation**: An equation that can be written in the form $P(x) = 0$, where $P(x)$ is a polynomial\n- **Related function**: The function $f(x)$ formed by replacing $0$ with $f(x)$ in a polynomial equation\n- **Real zero**: A real number $x$ for which $f(x) = 0$\n- **Root**: A solution of a polynomial equation\n- **x-intercept**: The point where the graph crosses the x-axis; occurs at real zeros\n- **System of equations**: Two or more equations with the same variables",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Solving Polynomial Equations by Graphing",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving Polynomial Equations by Graphing\n\nA **related function** is found by rewriting the equation with $0$ on one side and then replacing $0$ with $f(x)$.\n\n- The values of $x$ for which $f(x) = 0$ are the **real zeros** of the function\n- These are also the **x-intercepts** of the graph\n\n**Example relationship:**\n\n- $x^3 + 2x^2 - 4x = x + 6$\n- Related function: $f(x) = x^3 + 2x^2 - 5x - 6$\n- $-3$, $-1$, and $2$ are solutions, roots, zeros, and x-intercepts",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "text" as const,
            content: {
              markdown: "## Talk About It\n\nExplain how you could use the table feature to more accurately estimate the zeros of the related function. What are the limitations of the table feature?",
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
              markdown: "## Example 1 — Solve a Polynomial Equation by Graphing\n\nUse a graphing calculator to solve:\n\n$$x^4 + 3x^2 - 5 = -4x^3$$\n\n1. Find a related function: rewrite with $0$ on the right\n2. Graph the related function\n3. Use the **zero** feature to find the real zeros",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x^4 + 3x^2 - 5 = -4x^3",
                steps: [
                  { expression: "x^4 + 3x^2 - 5 = -4x^3", explanation: "Start with the original equation" },
                  { expression: "x^4 + 4x^3 + 3x^2 - 5 = 0", explanation: "Add 4x^3 to both sides" },
                  { expression: "f(x) = x^4 + 4x^3 + 3x^2 - 5", explanation: "Write the related function" },
                  { expression: "Graph f(x)", explanation: "Enter the function in the graphing calculator" },
                  { expression: "Use CALC → zero", explanation: "Find the real zeros of the function" },
                  { expression: "x ≈ -3.22", explanation: "First real zero" },
                  { expression: "x ≈ 0.84", explanation: "Second real zero" },
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
              markdown: "## Example 2 — Solve a Polynomial Equation by Using a System\n\nFor an exhibit with five Emperor penguins, a pool must have a minimum volume of $217 \\text{ ft}^3$ per bird. The pool dimensions are:\n\n- length: $2x + 3$\n- width: $5x - 2$\n- depth: $2x$\n\nWhat should the pool dimensions be to meet the minimum requirements?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(2x + 3)(5x - 2)(2x) = 1085",
                steps: [
                  { expression: "V = 217 × 5 = 1085 ft³", explanation: "Minimum required volume for 5 penguins" },
                  { expression: "(2x + 3)(5x - 2)(2x) = 1085", explanation: "Volume formula for rectangular prism" },
                  { expression: "(10x² + 11x - 6)(2x) = 1085", explanation: "Multiply first two binomials" },
                  { expression: "20x³ + 22x² - 12x = 1085", explanation: "Distribute 2x" },
                  { expression: "y = 20x³ + 22x² - 12x", explanation: "Set left side equal to y" },
                  { expression: "y = 1085", explanation: "Set right side equal to y" },
                  { expression: "Graph both equations", explanation: "Use the intersect feature" },
                  { expression: "x = 3.5", explanation: "Real solution from intersection" },
                  { expression: "length = 10 ft, width = 15.5 ft, depth = 7 ft", explanation: "Substitute x = 3.5" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. How can you use the structure of the related function to determine the number of real solutions of the equation?\n2. What is the connection between the zeros of a related function and the solutions of a polynomial equation?\n3. When might solving a polynomial equation with a system of equations be more useful than finding zeros?",
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
                    question: "The real zeros of a related function correspond to:",
                    options: [
                      "The solutions of the polynomial equation",
                      "The y-intercept of the graph",
                      "The maximum value of the function",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "To solve a polynomial equation by graphing, you first:",
                    options: [
                      "Write the equation with 0 on one side",
                      "Find the y-intercept",
                      "Factor the polynomial completely",
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
        phaseNumber: 7,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned how to solve polynomial equations by graphing. Consider the following:\n\n- How does rewriting an equation with $0$ on one side help you find a related function?\n- What strategies help you estimate zeros accurately with graphing technology?\n- What questions do you still have about solving polynomial equations by graphing?\n\n**Tip**: The graph of the related function is a powerful tool for visualizing and verifying the solutions of polynomial equations.",
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
