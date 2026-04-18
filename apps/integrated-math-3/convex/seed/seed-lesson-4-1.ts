import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-4-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Operations on Functions",
          slug: lessonSlug,
          description: "Students find sums, differences, products, quotients, and compositions of functions.",
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
          title: "Operations on Functions",
          description: "Students find sums, differences, products, quotients, and compositions of functions.",
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
              markdown: "## Explore: Adding Functions\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nDo you think that the graph of $f(x) + g(x)$ will be more or less steep than the graphs of $f(x)$ and $g(x)$?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = f(x) + g(x)",
                title: "Adding Functions",
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
              markdown: "## Key Terms\n\n- **Composition of functions**: The operation that replaces the input of one function with the output of another function",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Operations on Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Operations on Functions\n\nLet $f(x) = 3x$ and $g(x) = 2x - 4$.\n\n- **Addition**: $(f + g)(x) = f(x) + g(x) = 3x + (2x - 4) = 5x - 4$\n- **Subtraction**: $(f - g)(x) = f(x) - g(x) = 3x - (2x - 4) = x + 4$\n- **Multiplication**: $(f \\cdot g)(x) = f(x) \\cdot g(x) = 3x(2x - 4) = 6x^2 - 12x$\n- **Division**: $(f / g)(x) = f(x) / g(x)$, where $g(x) \\neq 0$\n\nTo graph the sum or difference of functions, graph each function separately and add or subtract corresponding functional values.",
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
              markdown: "## Example 1 — Add and Subtract Functions\n\nGiven $f(x) = -x^2 + 3x + 1$ and $g(x) = 2x^2 - 5$, find $(f + g)(x)$ and $(f - g)(x)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = -x^2 + 3x + 1, g(x) = 2x^2 - 5",
                steps: [
                  { expression: "(f + g)(x) = f(x) + g(x)", explanation: "Start with the definition of addition of functions" },
                  { expression: "= (-x^2 + 3x + 1) + (2x^2 - 5)", explanation: "Substitute the given functions" },
                  { expression: "= x^2 + 3x - 4", explanation: "Combine like terms" },
                  { expression: "(f - g)(x) = f(x) - g(x)", explanation: "Start with the definition of subtraction of functions" },
                  { expression: "= (-x^2 + 3x + 1) - (2x^2 - 5)", explanation: "Substitute the given functions" },
                  { expression: "= -x^2 + 3x + 1 - 2x^2 + 5", explanation: "Distribute the negative sign" },
                  { expression: "= -3x^2 + 3x + 6", explanation: "Combine like terms" },
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
              markdown: "## Example 2 — Multiply and Divide Functions\n\nGiven $f(x) = 4x^2 - 2x + 3$ and $g(x) = -x + 5$, find $(f \\cdot g)(x)$ and $(f / g)(x)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = 4x^2 - 2x + 3, g(x) = -x + 5",
                steps: [
                  { expression: "(f \\cdot g)(x) = (4x^2 - 2x + 3)(-x + 5)", explanation: "Start with the definition of multiplication of functions" },
                  { expression: "= -4x^3 + 20x^2 + 2x^2 - 10x - 3x + 15", explanation: "Use the distributive property" },
                  { expression: "= -4x^3 + 22x^2 - 13x + 15", explanation: "Combine like terms" },
                  { expression: "(f / g)(x) = (4x^2 - 2x + 3) / (-x + 5)", explanation: "Start with the definition of division of functions" },
                  { expression: "x \\neq 5", explanation: "State the restriction where the denominator equals zero" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Compositions of Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Composition of Functions\n\nSuppose $f$ and $g$ are functions such that the range of $g$ is a subset of the domain of $f$.\n\nThen $[f \\circ g](x) = f[g(x)]$.\n\nThe order of composition matters: $(f \\circ g)(x)$ is not always equal to $(g \\circ f)(x)$.",
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
              markdown: "## Example 3 — Evaluate a Composition from Formulas\n\nLet $f(x) = 2x - 3$ and $g(x) = x^2 + 4$. Find $(f \\circ g)(x)$ and $(g \\circ f)(x)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = 2x - 3, g(x) = x^2 + 4",
                steps: [
                  { expression: "(f \\circ g)(x) = f(g(x))", explanation: "Start with the definition of composition" },
                  { expression: "= 2(x^2 + 4) - 3", explanation: "Substitute g(x) into f" },
                  { expression: "= 2x^2 + 8 - 3", explanation: "Distribute the 2" },
                  { expression: "= 2x^2 + 5", explanation: "Simplify" },
                  { expression: "(g \\circ f)(x) = g(f(x))", explanation: "Start with the reverse composition" },
                  { expression: "= (2x - 3)^2 + 4", explanation: "Substitute f(x) into g" },
                  { expression: "= 4x^2 - 12x + 9 + 4", explanation: "Expand the squared binomial" },
                  { expression: "= 4x^2 - 12x + 13", explanation: "Simplify" },
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
              markdown: "## Example 4 — Compose Functions by Using Ordered Pairs\n\nGiven $f = \\{(1, 12), (10, 11), (0, 13), (9, 7)\\}$ and $g = \\{(4, 1), (5, 0), (13, 9), (12, 10)\\}$, find $[f \\circ g](x)$ and $[g \\circ f](x)$. State the domain and range for each.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f = {(1, 12), (10, 11), (0, 13), (9, 7)}, g = {(4, 1), (5, 0), (13, 9), (12, 10)}",
                steps: [
                  { expression: "f \\circ g = {(4, 12), (5, 13), (13, 7), (12, 11)}", explanation: "Find f(g(x)) for each x in the domain of g where g(x) is in the domain of f" },
                  { expression: "domain of f \\circ g: {4, 5, 12, 13}", explanation: "List all x-values that produce valid outputs" },
                  { expression: "range of f \\circ g: {7, 11, 12, 13}", explanation: "List all output values" },
                  { expression: "g \\circ f = {(1, 10), (0, 9)}", explanation: "Find g(f(x)) for each x in the domain of f where f(x) is in the domain of g" },
                  { expression: "domain of g \\circ f: {0, 1}", explanation: "Only inputs 0 and 1 produce valid outputs" },
                  { expression: "range of g \\circ f: {9, 10}", explanation: "List all output values" },
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
              markdown: "## Example 5 — Compose Functions\n\nGiven $f(x) = 2x - 5$ and $g(x) = 3x$, find $[f \\circ g](x)$ and $[g \\circ f](x)$. State the domain and range for each.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = 2x - 5, g(x) = 3x",
                steps: [
                  { expression: "[f \\circ g](x) = f(g(x)) = f(3x)", explanation: "Substitute g(x) into f" },
                  { expression: "= 2(3x) - 5", explanation: "Replace x with 3x in f(x)" },
                  { expression: "= 6x - 5", explanation: "Simplify" },
                  { expression: "[g \\circ f](x) = g(f(x)) = g(2x - 5)", explanation: "Substitute f(x) into g" },
                  { expression: "= 3(2x - 5)", explanation: "Replace x with 2x - 5 in g(x)" },
                  { expression: "= 6x - 15", explanation: "Simplify" },
                  { expression: "Domain and range of both: all real numbers", explanation: "Both are linear functions with nonzero slopes" },
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
              markdown: "## Apply Example 6 — Use Composition of Functions\n\nA movie theater charges $\\$8.50$ for each of the $x$ tickets sold. The studios take $75\\%$ of the ticket revenue. Let $t(x) = 8.50x$ represent ticket revenue and $k(x) = 0.25x$ represent the amount the theater keeps. Find $[k \\circ t](x)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "t(x) = 8.50x, k(x) = 0.25x",
                steps: [
                  { expression: "[k \\circ t](x) = k(t(x))", explanation: "Start with the definition of composition" },
                  { expression: "= k(8.50x)", explanation: "Substitute ticket revenue into the keep function" },
                  { expression: "= 0.25(8.50x)", explanation: "Apply the theater keep rate to total revenue" },
                  { expression: "= 2.125x", explanation: "Simplify" },
                ],
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
              markdown: "## Discussion Questions\n\n1. How do the operations on functions relate to operations on real numbers?\n2. Why is the order of composition important? Can you give an example where switching the order gives a different result?\n3. How can you determine the domain of a quotient of functions?",
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
                    question: "Which operation on functions requires checking for values that make the denominator zero?",
                    options: [
                      "Division",
                      "Addition",
                      "Multiplication",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "For functions f(x) and g(x), [f o g](x) is equal to:",
                    options: [
                      "f(g(x))",
                      "g(f(x))",
                      "f(x) * g(x)",
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
        phaseNumber: 12,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned how to perform operations on functions and find compositions of functions. Consider the following:\n\n- How are adding, subtracting, multiplying, and dividing functions similar to and different from performing the same operations on numbers?\n- What strategies help you find the domain of a quotient or composition of functions?\n- What questions do you still have about operations on or compositions of functions?",
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
