import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-4-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Graphing Radical Functions",
          slug: lessonSlug,
          description: "Students graph and analyze square root and cube root functions.",
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
          title: "Graphing Radical Functions",
          description: "Students graph and analyze square root and cube root functions.",
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
              markdown: "## Explore: Using Technology to Analyze Square Root Functions\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nHow does adding, subtracting, or multiplying a constant to a function affect the graph of the function?",
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
                title: "Explore Square Root Functions",
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
              markdown: "## Key Terms\n\n- **Radical function**: A function that contains radicals with variables in the radicand\n- **Square root function**: A function that contains the square root of a variable expression\n- **Cube root function**: A function that contains the cube root of a variable expression",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Graphing Square Root Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Graphing Square Root Functions\n\nA **radical function** contains radicals with variables in the radicand.\n\nA **square root function** contains the square root of a variable expression.\n\n### Key Concept: Parent Function of Square Root Functions\n\nParent function: $f(x) = \\sqrt{x}$\n\nKey features:\n- domain: $\\{x \\mid x \\geq 0\\}$\n- range: $\\{f(x) \\mid f(x) \\geq 0\\}$\n- intercepts: $x = 0$, $f(x) = 0$\n- end behavior: as $x \\to 0$, $f(x) \\to 0$; as $x \\to \\infty$, $f(x) \\to \\infty$\n- increasing for $x > 0$\n- positive for $x > 0$\n- no symmetry\n\nA square root function can be written $g(x) = a\\sqrt{x - h} + k$.\n\n- $|a|$ stretches or compresses the graph\n- if $a < 0$, the graph reflects across the x-axis\n- $h$ shifts left or right\n- $k$ shifts up or down",
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
              markdown: "## Example 1 — Identify Domain and Range Algebraically\n\nIdentify the domain and range of $f(x) = \\sqrt{2x - 6} + 1$.\n\nFor the domain, require the radicand to be nonnegative:\n\n$2x - 6 \\geq 0$\n\n$2x \\geq 6$\n\n$x \\geq 3$\n\nFind the lower limit of the range by evaluating $f(3) = \\sqrt{2(3) - 6} + 1 = 1$.\n\nSo the range is $\\{f(x) \\mid f(x) \\geq 1\\}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = sqrt(2x - 6) + 1",
                steps: [
                  { expression: "Set radicand >= 0", explanation: "2x - 6 >= 0" },
                  { expression: "Solve for x", explanation: "2x >= 6, so x >= 3" },
                  { expression: "Domain: {x | x >= 3}", explanation: "All x-values that keep the radicand nonnegative" },
                  { expression: "Find minimum output", explanation: "f(3) = sqrt(0) + 1 = 1" },
                  { expression: "Range: {f(x) | f(x) >= 1}", explanation: "Minimum value is 1; function increases from there" },
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
              markdown: "## Example 2 — Graph a Transformed Square Root Function\n\nGraph $g(x) = -3\\sqrt{x + 1} + 2$. Then identify the domain and range and describe how it is related to the parent graph.\n\n### Step 1: Determine the minimum domain value\n\n$x + 1 \\geq 0$\n\n$x \\geq -1$\n\n### Step 2: Make a table and graph\n\n| x | g(x) |\n|---|------|\n| -1 | 2 |\n| 0 | -1 |\n| 1 | about -2.2 |\n| 3 | -4 |\n\n### Step 3: Compare to the parent function\n\n- maximum point: $(-1, 2)$\n- $a = -3$, so reflect across the x-axis and stretch vertically by $3$\n- $h = -1$, so shift left $1$\n- $k = 2$, so shift up $2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = -3*sqrt(x + 1) + 2",
                steps: [
                  { expression: "x + 1 >= 0", explanation: "Radicand must be nonnegative" },
                  { expression: "x >= -1", explanation: "Solve for domain" },
                  { expression: "Maximum point: (-1, 2)", explanation: "Leftmost point on the graph" },
                  { expression: "a = -3: reflect and stretch", explanation: "Negative a reflects across x-axis; |3| stretches vertically" },
                  { expression: "h = -1: shift left 1", explanation: "Horizontal translation inside the radical" },
                  { expression: "k = 2: shift up 2", explanation: "Vertical translation outside the radical" },
                  { expression: "Range: {g(x) | g(x) <= 2}", explanation: "Because of reflection, outputs decrease from the maximum" },
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
              markdown: "## Example 3 — Analyze the Graph of a Square Root Function\n\nA centrifuge with radius $7.8$ cm has RPM setting $r = 104.23\\sqrt{g}$, where $g$ is the required g-force.\n\n### Part A: Write and graph the function\n\nUse $r = 104.23\\sqrt{g}$.\n\nSample table:\n\n| g | r |\n|---|---|\n| 0 | 0 |\n| 400 | 2085 |\n| 800 | 2948 |\n| 1200 | 3611 |\n| 1600 | 4169 |\n\n### Part B: Describe key features\n\n- domain: $\\{g \\mid g \\geq 0\\}$\n- range: $\\{r \\mid r \\geq 0\\}$\n- intercepts: $(0, 0)$\n- increasing as $g \\to \\infty$\n- positive for $g > 0$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "r = 104.23*sqrt(g)",
                steps: [
                  { expression: "Domain: g >= 0", explanation: "g-force cannot be negative in this context" },
                  { expression: "Range: r >= 0", explanation: "RPM is nonnegative" },
                  { expression: "When g = 0, r = 0", explanation: "Both intercepts are at the origin" },
                  { expression: "Function is increasing", explanation: "As g-force increases, RPM increases" },
                  { expression: "End behavior: r -> infinity as g -> infinity", explanation: "Square root grows without bound, albeit slowly" },
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
              markdown: "## Example 4 — Graph a Square Root Inequality\n\nGraph $y < \\sqrt{2x + 5}$.\n\n### Step 1: Graph the related function\n\nGraph the boundary $y = \\sqrt{2x + 5}$. Use a dashed line because the inequality is $<$.\n\n### Step 2: Shade\n\n- domain: $\\{x \\mid x > -2.5\\}$\n- shade below the boundary and within the domain\n- choose a test point within the shaded region to verify",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y < sqrt(2x + 5)",
                steps: [
                  { expression: "Boundary: y = sqrt(2x + 5)", explanation: "Graph the related equation" },
                  { expression: "Use dashed line", explanation: "Strict inequality (<) means boundary is not included" },
                  { expression: "Domain: x > -2.5", explanation: "2x + 5 > 0 gives x > -2.5" },
                  { expression: "Shade below boundary", explanation: "y is less than the square root value" },
                  { expression: "Test a point to verify", explanation: "e.g., (0,0): 0 < sqrt(5) is true" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn: Graphing Cube Root Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Graphing Cube Root Functions\n\nA **cube root function** contains the cube root of a variable expression.\n\n### Key Concept: Parent Function of Cube Root Functions\n\nParent function: $f(x) = \\sqrt[3]{x}$\n\nKey features:\n- domain: all real numbers\n- range: all real numbers\n- intercepts: $(0, 0)$\n- end behavior: as $x \\to -\\infty$, $f(x) \\to -\\infty$; as $x \\to \\infty$, $f(x) \\to \\infty$\n- increasing everywhere\n- positive for $x > 0$, negative for $x < 0$\n- symmetric about the origin\n\nA cube root function can be written $g(x) = a\\sqrt[3]{x - h} + k$.",
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
              markdown: "## Example 5 — Graph Cube Root Functions\n\nGraph each function and state the domain and range.\n\n### a. $g(x) = \\frac{1}{3}\\sqrt[3]{x}$\n\nThis is a vertical compression of the parent function.\n\nSample table:\n\n| x | g(x) |\n|---|------|\n| -2 | about -0.42 |\n| 0 | 0 |\n| 2 | about 0.42 |\n\n- domain: all real numbers\n- range: all real numbers\n\n### b. $p(x) = \\sqrt[3]{x + 5}$\n\nThis is the parent graph shifted $5$ units left.\n\n- domain: all real numbers\n- range: all real numbers\n\n### c. $q(x) = \\sqrt[3]{4 - x} + 1$\n\nRewrite as $q(x) = \\sqrt[3]{-(x - 4)} + 1$. The graph is reflected and translated right $4$ and up $1$.\n\n- domain: all real numbers\n- range: all real numbers",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = (1/3)*cuberoot(x)",
                steps: [
                  { expression: "a = 1/3", explanation: "Vertical compression by factor 1/3" },
                  { expression: "Domain: all real numbers", explanation: "Cube root is defined for all real inputs" },
                  { expression: "Range: all real numbers", explanation: "Cube root outputs all real values" },
                  { expression: "p(x) = cuberoot(x + 5): shift left 5", explanation: "h = -5 shifts graph 5 units left" },
                  { expression: "q(x) = cuberoot(4 - x) + 1", explanation: "Rewrite as cuberoot(-(x - 4)) + 1" },
                  { expression: "Reflection across y-axis, then shift right 4 and up 1", explanation: "Negative inside radical reflects; +1 shifts up" },
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
              markdown: "## Example 6 — Compare Radical Functions\n\nExamine $p(x) = -2\\sqrt[3]{x - 6}$ and $q(x)$ shown in a graph.\n\n### Part A: Graph $p(x)$\n\nUse a table to plot points.\n\n### Part B: Compare key features\n\n- $p(x)$:\n  - domain: all real numbers\n  - range: all real numbers\n  - x-intercept: $6$\n  - y-intercept: about $3.63$\n  - decreasing as $x \\to \\infty$\n  - positive for $x < 6$, negative for $x > 6$\n\n- $q(x)$ (square root):\n  - domain: $\\{x \\mid x \\geq 6\\}$\n  - range: $\\{q(x) \\mid q(x) \\leq 0\\}$\n  - x-intercept: $6$\n  - no y-intercept\n  - decreasing as $x \\to \\infty$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "p(x) = -2*cuberoot(x - 6)",
                steps: [
                  { expression: "p(x) is a cube root function", explanation: "Index is odd (3)" },
                  { expression: "Domain of p(x): all real numbers", explanation: "Cube roots accept any real input" },
                  { expression: "Range of p(x): all real numbers", explanation: "Cube roots produce any real output" },
                  { expression: "x-intercept: 6", explanation: "Set p(x) = 0 and solve" },
                  { expression: "Decreasing (a = -2 < 0)", explanation: "Negative coefficient reflects and decreases" },
                  { expression: "q(x) has domain x >= 6", explanation: "Square root requires nonnegative radicand" },
                  { expression: "q(x) has range q(x) <= 0", explanation: "Reflected square root decreases from 0" },
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
              markdown: "## Example 7 — Write a Radical Function\n\nWrite a radical function for the graph of $g(x)$.\n\n### Step 1: Identify the index\n\nBecause the domain and range are all real numbers, the index is odd. Use $g(x) = a\\sqrt[3]{x - h} + k$.\n\n### Step 2: Identify transformations\n\nThe graph is translated $3$ units left and $4$ units down, so $h = -3$ and $k = -4$.\n\nUse point $(-2, -2)$:\n\n$-2 = a\\sqrt[3]{-2 - (-3)} - 4$\n\n$-2 = a \\cdot 1 - 4$\n\n$a = 2$\n\n### Step 3: Write the function\n\n$g(x) = 2\\sqrt[3]{x + 3} - 4$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Write g(x) from graph",
                steps: [
                  { expression: "Index is odd (cube root)", explanation: "Domain and range are all real numbers" },
                  { expression: "Use form g(x) = a*cuberoot(x - h) + k", explanation: "General form of transformed cube root" },
                  { expression: "h = -3, k = -4", explanation: "Shifted 3 left and 4 down from transformations" },
                  { expression: "Use point (-2, -2)", explanation: "Substitute into the general form" },
                  { expression: "-2 = a*cuberoot(1) - 4", explanation: "Simplify the radicand" },
                  { expression: "a = 2", explanation: "Solve for the stretch factor" },
                  { expression: "g(x) = 2*cuberoot(x + 3) - 4", explanation: "Final function" },
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
              markdown: "## Discussion Questions\n\n1. How do you determine the domain and range of a square root function algebraically?\n2. How do the domain and range differ for radical functions with odd index versus even index?\n3. What transformations can you apply to the parent square root or cube root function, and how do they affect the graph?\n4. How can you tell whether a radical function has been reflected across the x-axis?",
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
                    question: "Which function has a domain of all real numbers?",
                    options: [
                      "f(x) = sqrt(x)",
                      "g(x) = cuberoot(x)",
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "For g(x) = a*sqrt(x - h) + k, what does h represent?",
                    options: [
                      "Vertical stretch",
                      "Horizontal shift",
                      "Vertical shift",
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
              markdown: "## Reflection\n\nToday you learned about graphing radical functions. Consider the following:\n\n- How does understanding transformations help you sketch radical functions quickly?\n- What strategies help you remember the domain restrictions for even-indexed versus odd-indexed radicals?\n- What questions do you still have about graphing square root or cube root functions?\n\n**Tip**: The domain of an even-indexed radical requires a nonnegative radicand, while odd-indexed radicals are defined for all real numbers.",
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
