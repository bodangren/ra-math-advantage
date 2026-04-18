import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-6-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 6,
          title: "Logarithms and Logarithmic Functions",
          slug: lessonSlug,
          description: "Students write logarithmic and exponential forms, and graph logarithmic functions.",
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
          title: "Logarithms and Logarithmic Functions",
          description: "Students write logarithmic and exponential forms, and graph logarithmic functions.",
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
                "## Explore: Transforming Logarithmic Functions\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nHow does performing an operation on a logarithmic function affect its graph?\n\n### Watch Out\n\nThe `LOG` button on a graphing calculator allows you to enter logarithmic functions of base `10` only.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = log_b(x)",
                title: "Logarithmic Functions",
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
                "## Key Terms\n\n- **Logarithm**: In $x = b^y$, $y$ is called the logarithm, base $b$, of $x$, written $y = \\log_b x$\n- **Logarithmic function**: A function of the form $f(x) = \\log_b x$, where $b > 0$ and $b \\neq 1$",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Logarithmic Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Logarithmic Functions\n\nRecall the exponential function $f(x) = 2^x$. You can graph its inverse by interchanging the $x$- and $y$-values.\n\nThe inverse of $y = b^x$ is $x = b^y$. In $x = b^y$, $y$ is called the **logarithm, base $b$, of $x$**. This is written as:\n\n$$y = \\log_b x$$\n\nand is read as \"log base $b$ of $x$.\"\n\n### Key Concept: Logarithms with Base $b$\n\nLet $b$ and $x$ be positive numbers, with $b \\neq 1$.\n\n$$\\log_b x = y \\quad \\text{if and only if} \\quad b^y = x$$\n\nIn the expression $\\log_b x$, $x$ is called the **argument**.",
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
                "## Example 1 — Logarithmic to Exponential Form\n\nWrite each equation in exponential form.\n\n### a. $\\log_4 64 = 3$\n\n$64 = 4^3$\n\n### b. $\\log_3 (\\frac{1}{243}) = -5$\n\n$\\frac{1}{243} = 3^{-5}$\n\n### c. $\\log_9 3 = \\frac{1}{2}$\n\n$3 = 9^{1/2}$\n\n### Check\n\nWrite $\\log_{125} 5 = \\frac{1}{3}$ in exponential form.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "\\log_4 64 = 3",
                steps: [
                  { expression: "\\log_4 64 = 3", explanation: "Start with the logarithmic equation" },
                  { expression: "4^3 = 64", explanation: "Rewrite in exponential form: base^log = argument" },
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
                "## Example 2 — Exponential to Logarithmic Form\n\nWrite each equation in logarithmic form.\n\n### a. $7^6 = 117{,}649$\n\n$\\log_7 117{,}649 = 6$\n\n### b. $8^{-3} = \\frac{1}{512}$\n\n$\\log_8 (\\frac{1}{512}) = -3$\n\n### c. $8^{2/3} = 4$\n\n$\\log_8 4 = \\frac{2}{3}$\n\n### Check\n\nWrite $2^9 = 512$ in logarithmic form.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "7^6 = 117649",
                steps: [
                  { expression: "7^6 = 117649", explanation: "Start with the exponential equation" },
                  { expression: "\\log_7 117649 = 6", explanation: "Rewrite in logarithmic form: log_base(result) = exponent" },
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
              markdown:
                "## Example 3 — Evaluate Logarithmic Expressions\n\nEvaluate $\\log_{216} 6$.\n\nLet $\\log_{216} 6 = y$. Then $6 = 216^y$.\n\nBecause $216 = 6^3$:\n\n$$6 = (6^3)^y \\implies 6^1 = 6^{3y} \\implies 1 = 3y \\implies y = \\frac{1}{3}$$\n\nTherefore $\\log_{216} 6 = \\frac{1}{3}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "\\log_{216} 6",
                steps: [
                  { expression: "\\log_{216} 6 = y", explanation: "Let the logarithm equal y" },
                  { expression: "6 = 216^y", explanation: "Rewrite in exponential form" },
                  { expression: "216 = 6^3", explanation: "Express the base as a power of the result" },
                  { expression: "6 = (6^3)^y = 6^{3y}", explanation: "Substitute and simplify using power of a power" },
                  { expression: "1 = 3y", explanation: "Set the exponents equal" },
                  { expression: "y = \\frac{1}{3}", explanation: "Solve for y" },
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
              markdown:
                "## Example 4 — Find Inverses of Exponential Functions\n\nThe air pressure outside of an aircraft can be determined by:\n\n$$P = B(10^{-9h/100})$$\n\nwhere $B$ is the air pressure at sea level and $h$ is the altitude in miles. If $B = 14.7$ psi, write an equation to find the height when the air pressure is known.\n\nSubstitute and divide:\n\n$$\\frac{P}{14.7} = 10^{-9h/100}$$\n\nWrite in logarithmic form and solve for $h$:\n\n$$\\log_{10}\\left(\\frac{P}{14.7}\\right) = -\\frac{9h}{100} \\implies h = -\\frac{100}{9} \\log_{10}\\left(\\frac{P}{14.7}\\right)$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "P = 14.7(10^{-9h/100})",
                steps: [
                  { expression: "P = 14.7(10^{-9h/100})", explanation: "Start with the given equation with B = 14.7" },
                  { expression: "\\frac{P}{14.7} = 10^{-9h/100}", explanation: "Divide both sides by 14.7" },
                  { expression: "\\log_{10}(P/14.7) = -9h/100", explanation: "Rewrite in logarithmic form" },
                  { expression: "h = -\\frac{100}{9} \\log_{10}(P/14.7)", explanation: "Solve for h by multiplying both sides by -100/9" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn: Graphing Logarithmic Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Logarithmic Functions\n\nA function of the form $f(x) = \\log_b x$, where $b > 0$ and $b \\neq 1$, is a **logarithmic function**.\n\n### Key Concept: Parent Function\n\nFor $f(x) = \\log_b x$:\n\n- type of graph: continuous, one-to-one\n- domain: $(0, \\infty)$\n- range: $(-\\infty, \\infty)$\n- asymptote: the $y$-axis ($x = 0$)\n- $x$-intercept: $(1, 0)$\n- $y$-intercept: none\n\nFor $b > 1$:\n- as $x \\to 0^+$, $f(x) \\to -\\infty$\n- as $x \\to \\infty$, $f(x) \\to \\infty$\n\nFor $0 < b < 1$:\n- as $x \\to 0^+$, $f(x) \\to \\infty$\n- as $x \\to \\infty$, $f(x) \\to -\\infty$\n\n### Key Concept: Transformations\n\nFor $g(x) = a \\log_b (x - h) + k$:\n\n- $h$: horizontal translation\n- $k$: vertical translation\n- $a$: reflection and vertical stretch or compression",
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
                "## Example 5 — Graph Logarithmic Functions\n\nGraph each function. Then find the intercepts, domain, range, and end behavior.\n\n### a. $f(x) = \\log_6 x$\n\nUse the points $(\\frac{1}{6}, -1)$, $(1, 0)$, $(6, 1)$.\n\nKey features:\n- $x$-intercept: $1$\n- $y$-intercept: none\n- domain: all positive real numbers\n- range: all real numbers\n- as $x \\to 0^+$, $f(x) \\to -\\infty$; as $x \\to \\infty$, $f(x) \\to \\infty$\n\n### b. $g(x) = \\log_{1/4} x$\n\nUse the points $(4, -1)$, $(1, 0)$, $(\\frac{1}{4}, 1)$.\n\nKey features:\n- $x$-intercept: $1$\n- $y$-intercept: none\n- domain: all positive real numbers\n- range: all real numbers\n- as $x \\to 0^+$, $g(x) \\to \\infty$; as $x \\to \\infty$, $g(x) \\to -\\infty$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = \\log_6 x",
                steps: [
                  { expression: "f(1) = \\log_6 1 = 0", explanation: "Find the x-intercept" },
                  { expression: "domain: (0, \\infty)", explanation: "Logarithms are defined only for positive arguments" },
                  { expression: "range: (-\\infty, \\infty)", explanation: "The logarithm can take any real value" },
                  { expression: "asymptote: x = 0", explanation: "The y-axis is a vertical asymptote" },
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
              markdown:
                "## Example 6 — Graph Transformations of Logarithmic Functions\n\nGraph $g(x) = 2 \\log_{10}(x + 3) - 1$ as a transformation of $f(x) = \\log_{10} x$.\n\nTransformations:\n- $a = 2$: vertical stretch\n- $h = -3$: translate $3$ units left\n- $k = -1$: translate $1$ unit down\n\nUsing parent points for $\\log_{10} x$: $(\\frac{1}{10}, -1)$, $(1, 0)$, $(10, 1)$.\n\nAfter vertical stretch: $(\\frac{1}{10}, -2)$, $(1, 0)$, $(10, 2)$.\n\nAfter translating left $3$ and down $1$: $(-\\frac{29}{10}, -3)$, $(-2, -1)$, $(7, 1)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = 2 \\log_{10}(x + 3) - 1",
                steps: [
                  { expression: "Parent: f(x) = \\log_{10} x", explanation: "Identify the parent function" },
                  { expression: "a = 2: vertical stretch", explanation: "Multiply y-values by 2" },
                  { expression: "h = -3: shift 3 units left", explanation: "x + 3 indicates a horizontal shift left by 3" },
                  { expression: "k = -1: shift 1 unit down", explanation: "Subtract 1 shifts the graph down by 1" },
                  { expression: "Asymptote: x = -3", explanation: "The vertical asymptote shifts left with h" },
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
              markdown:
                "## Example 7 — Compare Logarithmic Functions\n\nConsider $g(x) = \\log_{10}(x - 2)$ and $j(x)$ shown in the graph.\n\n### Part A: Graph $g(x)$\n\n$g(x)$ is a transformation of $f(x) = \\log_{10} x$. Because $h = 2$, the parent graph is translated $2$ units right.\n\n### Part B: Compare end behavior\n\nFor $g(x)$:\n- as $x \\to 2^+$, $g(x) \\to -\\infty$\n- as $x \\to \\infty$, $g(x) \\to \\infty$\n\nFor $j(x)$:\n- as $x \\to 0^+$, $j(x) \\to \\infty$\n- as $x \\to \\infty$, $j(x) \\to -\\infty$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = \\log_{10}(x - 2)",
                steps: [
                  { expression: "g(x) = \\log_{10}(x - 2)", explanation: "Start with the transformed function" },
                  { expression: "h = 2: shift 2 units right", explanation: "x - 2 indicates a horizontal shift right by 2" },
                  { expression: "Domain: (2, \\infty)", explanation: "The argument must be positive, so x > 2" },
                  { expression: "Asymptote: x = 2", explanation: "The vertical asymptote shifts right with h" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Worked Example 8",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 8 — Write Logarithmic Functions From Graphs\n\nIdentify the value of $k$, and write a function for the graph as it relates to $f(x) = \\log_4 x$.\n\nThe graph is translated $5$ units up, so:\n- $k = 5$\n- $g(x) = \\log_4 x + 5$\n\n### Check\n\nWrite a function for each graph as it relates to $f(x) = \\log_3 x$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = \\log_4 x + 5",
                steps: [
                  { expression: "Parent: f(x) = \\log_4 x", explanation: "Identify the parent function" },
                  { expression: "Translation is 5 units up", explanation: "A upward shift means k is positive" },
                  { expression: "k = 5", explanation: "Substitute the magnitude of the shift" },
                  { expression: "g(x) = \\log_4 x + 5", explanation: "Write the final transformed function" },
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
                "## Discussion Questions\n\n1. How can you rewrite a logarithmic equation in exponential form?\n2. What are the domain and range of a logarithmic function, and why?\n3. How do transformations of logarithmic functions compare to transformations of other functions?",
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
                    question: "Which equation is the exponential form of $\\log_2 8 = 3$?",
                    options: ["$2^3 = 8$", "$8^2 = 3$", "$3^2 = 8$"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the domain of $f(x) = \\log_b x$?",
                    options: ["All real numbers", "All positive real numbers", "All non-negative real numbers"],
                    correctIndex: 1,
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
                "## Reflection\n\nToday you learned about logarithms and logarithmic functions. Consider the following:\n\n- How do you convert between logarithmic and exponential form?\n- What strategies help you graph logarithmic functions and their transformations?\n- What questions do you still have about logarithms?",
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
