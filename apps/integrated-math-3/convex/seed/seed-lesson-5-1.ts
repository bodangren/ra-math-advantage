import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-5-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Graphing Exponential Functions",
          slug: lessonSlug,
          description: "Students graph exponential growth and decay functions.",
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
          title: "Graphing Exponential Functions",
          description: "Students graph exponential growth and decay functions.",
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
                "## Explore: Using Technology to Analyze Graphs of Exponential Functions\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nHow does performing an operation on an exponential function affect its graph?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = b^x",
                title: "Exponential Functions",
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
                "## Key Terms\n\n- **Exponential function**: A function of the form $f(x) = b^x$ where $b$ is a constant and $x$ is the exponent\n- **Exponential growth**: Growth modeled by $f(x) = b^x$ where $b > 1$\n- **Asymptote**: A line that a graph approaches\n- **Growth factor**: The base $b$ in an exponential growth function\n- **Exponential decay**: Decay modeled by $f(x) = b^x$ where $0 < b < 1$\n- **Decay factor**: The quantity $1 - r$ in an exponential decay model",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Graphing Exponential Growth Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Exponential Growth Functions\n\nIn an exponential function, the independent variable is an exponent.\n\nAn exponential function has the form:\n\n$$f(x) = b^x$$\n\nwhere the base $b$ is a constant and $x$ is the exponent.\n\nFor an **exponential growth** function, $b > 1$.\n\nExponential growth occurs when an initial amount increases by the same percent over a given period of time.\n\nGraphs of exponential functions have **asymptotes**, which are lines the graph approaches.",
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
                "## Example 1 — Graph Exponential Growth Functions\n\nGraph $f(x) = 2^x$. Find the domain, range, y-intercept, asymptote, and end behavior.\n\nTable of values:\n\n| $x$ | $f(x)$ |\n| --- | ------ |\n| $-3$ | $0.125$ |\n| $-2$ | $0.25$ |\n| $-1$ | $0.5$ |\n| $0$ | $1$ |\n| $1$ | $2$ |\n| $2$ | $4$ |\n| $3$ | $8$ |\n\nKey features:\n\n- domain: all real numbers\n- range: all positive real numbers\n- y-intercept: $(0, 1)$\n- asymptote: $y = 0$\n- end behavior: as $x \\to -\\infty$, $f(x) \\to 0$; as $x \\to \\infty$, $f(x) \\to \\infty$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = 2^x",
                steps: [
                  { expression: "f(0) = 2^0 = 1", explanation: "Find the y-intercept by evaluating at x = 0" },
                  { expression: "domain: all real numbers", explanation: "An exponential function is defined for all real x" },
                  { expression: "range: (0, \\infty)", explanation: "2^x is always positive" },
                  { expression: "asymptote: y = 0", explanation: "As x approaches negative infinity, f(x) approaches 0" },
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
                "## Example 2 — Graph Transformations of Exponential Growth Functions\n\nGraph $g(x) = -(\\frac{1}{2}) \\cdot 3^{x + 4} + 1$ as a transformation of the parent graph $f(x) = 3^x$.\n\n- $a = -\\frac{1}{2}$: reflect across the x-axis and compress vertically\n- $h = -4$: translate $4$ units left\n- $k = 1$: translate $1$ unit up",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = -(1/2) * 3^(x+4) + 1",
                steps: [
                  { expression: "Parent: f(x) = 3^x", explanation: "Identify the parent function" },
                  { expression: "a = -1/2: reflect and compress", explanation: "Negative a reflects across x-axis; |a| < 1 compresses vertically" },
                  { expression: "h = -4: shift 4 units left", explanation: "x + 4 indicates a horizontal shift left by 4" },
                  { expression: "k = 1: shift 1 unit up", explanation: "+1 at the end shifts the graph up by 1" },
                  { expression: "Asymptote: y = 1", explanation: "The horizontal asymptote shifts up with k" },
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
                "## Example 3 — Analyze Graphs of Exponential Functions\n\nIdentify $k$ and write a function for $j(x) = f(x) + k$ as it relates to $f(x) = 3.5^x$.\n\nThe graph is translated $2$ units down, so:\n\n- $k = -2$\n- $j(x) = 3.5^x - 2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "j(x) = f(x) + k, f(x) = 3.5^x",
                steps: [
                  { expression: "j(x) = f(x) + k", explanation: "Start with the transformation form" },
                  { expression: "Translation is 2 units down", explanation: "A downward shift means k is negative" },
                  { expression: "k = -2", explanation: "Substitute the direction and magnitude of the shift" },
                  { expression: "j(x) = 3.5^x - 2", explanation: "Write the final function" },
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
                "## Example 4 — Use Exponential Growth Functions\n\nMr. Lopez invests \\$50 million at $5\\%$ annual interest.\n\nUse $A(t) = a(1 + r)^t$.\n\nSo $A(t) = 50(1.05)^t$.\n\nUsing technology, after $20$ years there will be about \\$132,664,885.26.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "A(t) = 50(1.05)^t",
                steps: [
                  { expression: "A(t) = 50(1.05)^t", explanation: "Substitute a = 50 and r = 0.05 into the growth formula" },
                  { expression: "A(20) = 50(1.05)^{20}", explanation: "Evaluate after 20 years" },
                  { expression: "A(20) \\approx 132.66488526", explanation: "Calculate using technology" },
                  { expression: "\\$132,664,885.26", explanation: "Convert from millions to dollars" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn: Graphing Exponential Decay Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Exponential Decay Functions\n\n**Exponential decay** occurs when an initial amount decreases by the same percent over a given period of time.\n\nFor a function of the form $f(x) = b^x$, decay occurs when $0 < b < 1$.\n\nExponential decay can be modeled by:\n\n$$A(t) = a(1 - r)^t$$\n\nThe **decay factor** is $1 - r$.",
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
                "## Example 5 — Interpret Exponential Functions\n\nDetermine whether each function represents growth or decay.\n\n- $f(x) = 5^x$ $\\to$ growth because $5 > 1$\n- $g(x) = (\\frac{2}{7})^x$ $\\to$ decay because $0 < \\frac{2}{7} < 1$\n- $h(x) = (\\frac{4}{3})^x$ $\\to$ growth because $\\frac{4}{3} > 1$\n- $j(x) = 1.05^x$ $\\to$ growth because $1.05 > 1$\n- $k(x) = 0.85^x$ $\\to$ decay because $0 < 0.85 < 1$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Classify f(x)=5^x, g(x)=(2/7)^x, h(x)=(4/3)^x, j(x)=1.05^x, k(x)=0.85^x",
                steps: [
                  { expression: "f(x) = 5^x \\to growth", explanation: "Base 5 > 1" },
                  { expression: "g(x) = (2/7)^x \\to decay", explanation: "Base 2/7 is between 0 and 1" },
                  { expression: "h(x) = (4/3)^x \\to growth", explanation: "Base 4/3 > 1" },
                  { expression: "j(x) = 1.05^x \\to growth", explanation: "Base 1.05 > 1" },
                  { expression: "k(x) = 0.85^x \\to decay", explanation: "Base 0.85 is between 0 and 1" },
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
                "## Example 6 — Graph Exponential Decay Functions\n\nGraph $f(x) = (\\frac{1}{2})^x$.\n\nKey features:\n\n- domain: all real numbers\n- range: all positive real numbers\n- y-intercept: $(0, 1)$\n- asymptote: $y = 0$\n- end behavior: as $x \\to -\\infty$, $f(x) \\to \\infty$; as $x \\to \\infty$, $f(x) \\to 0$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = (1/2)^x",
                steps: [
                  { expression: "f(0) = (1/2)^0 = 1", explanation: "Find the y-intercept" },
                  { expression: "domain: all real numbers", explanation: "Defined for all real x" },
                  { expression: "range: (0, \\infty)", explanation: "(1/2)^x is always positive" },
                  { expression: "asymptote: y = 0", explanation: "As x approaches infinity, f(x) approaches 0" },
                  { expression: "as x \\to -\\infty, f(x) \\to \\infty", explanation: "For negative x, (1/2)^x = 2^{-x} grows without bound" },
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
                "## Example 7 — Graph Transformations of Exponential Decay Functions\n\nGraph $g(x) = -2(\\frac{1}{4})^{x - 4} + 3$ as a transformation of $f(x) = (\\frac{1}{4})^x$.\n\n- $a = -2$: reflect across the x-axis and stretch vertically\n- $h = 4$: translate $4$ units right\n- $k = 3$: translate $3$ units up",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = -2(1/4)^(x-4) + 3",
                steps: [
                  { expression: "Parent: f(x) = (1/4)^x", explanation: "Identify the parent function" },
                  { expression: "a = -2: reflect and stretch", explanation: "Negative a reflects across x-axis; |a| > 1 stretches vertically" },
                  { expression: "h = 4: shift 4 units right", explanation: "x - 4 indicates a horizontal shift right by 4" },
                  { expression: "k = 3: shift 3 units up", explanation: "+3 shifts the graph up by 3" },
                  { expression: "Asymptote: y = 3", explanation: "The horizontal asymptote shifts up with k" },
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
                "## Example 8 — Compare Exponential Functions\n\nConsider $f(x) = \\begin{cases} (\\frac{1}{2})^x & \\text{for } x < -1 \\\\ 2x + 4 & \\text{for } x \\ge -1 \\end{cases}$ and $g(x)$ from the graph.\n\n**Part A:** Graph $f(x)$ — graph the exponential part and the linear part.\n\n**Part B:** Compare key features\n\n- $f(x)$ has a relative minimum of $2$\n- $g(x)$ has no relative minimum\n- $g(x)$ appears to have asymptote $y = 2$\n\n**y-intercepts:** $f(x): 4$, $g(x): 3$\n\n**End behavior:**\n- $f(x)$: as $x \\to -\\infty$, $f(x) \\to \\infty$; as $x \\to \\infty$, $f(x) \\to \\infty$\n- $g(x)$: as $x \\to -\\infty$, $g(x) \\to 2$; as $x \\to \\infty$, $g(x) \\to \\infty$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = piecewise: (1/2)^x for x < -1; 2x + 4 for x >= -1",
                steps: [
                  { expression: "For x < -1: f(x) = (1/2)^x", explanation: "Exponential decay part" },
                  { expression: "For x >= -1: f(x) = 2x + 4", explanation: "Linear part with slope 2" },
                  { expression: "f(-1) = 2(-1) + 4 = 2", explanation: "Evaluate boundary point using linear piece" },
                  { expression: "f(0) = 2(0) + 4 = 4", explanation: "y-intercept of the linear piece" },
                  { expression: "Relative minimum at (-1, 2)", explanation: "The exponential part approaches infinity as x -> -infinity, and the linear part increases from x = -1" },
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
                "## Discussion Questions\n\n1. How can you tell from the equation whether an exponential function represents growth or decay?\n2. How do transformations of exponential functions compare to transformations of other functions you have studied?\n3. Why is the range of an exponential function always positive real numbers?",
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
                    question: "Which function represents exponential decay?",
                    options: ["f(x) = 3^x", "f(x) = (5/4)^x", "f(x) = (2/3)^x"],
                    correctIndex: 2,
                  },
                  {
                    question: "What is the horizontal asymptote of f(x) = 2^x?",
                    options: ["y = 0", "y = 1", "y = 2"],
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
                "## Reflection\n\nToday you learned about graphing exponential functions. Consider the following:\n\n- How do you determine whether an exponential function shows growth or decay?\n- What strategies help you graph transformations of exponential functions?\n- What questions do you still have about exponential functions and their graphs?",
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
