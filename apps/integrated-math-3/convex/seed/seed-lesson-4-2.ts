import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-4-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Inverse Relations and Functions",
          slug: lessonSlug,
          description: "Students find inverses of relations, verify inverse functions using compositions, and apply the horizontal line test.",
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
          title: "Inverse Relations and Functions",
          description: "Students find inverses of relations, verify inverse functions using compositions, and apply the horizontal line test.",
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
              markdown: "## Explore: Inverse Functions\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nFor what values of $n$ will $f(x) = x^n$ have an inverse that is also a function?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = x^2",
                title: "Explore Inverse Functions",
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
              markdown: "## Key Terms\n\n- **Inverse relations**: Two relations are inverse relations if one relation contains $(a, b)$ whenever the other contains $(b, a)$\n- **Inverse functions**: Two functions $f$ and $g$ are inverse functions if and only if both compositions $[f \\circ g](x) = x$ and $[g \\circ f](x) = x$\n- **Horizontal line test**: If a horizontal line intersects the graph of a function more than once, the function does not have an inverse that is also a function",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Inverse Relations and Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Inverse Relations and Functions\n\nTwo relations are **inverse relations** if one relation contains $(a, b)$ whenever the other contains $(b, a)$.\n\nTwo functions $f$ and $g$ are **inverse functions** if and only if both compositions are the identity function.\n\n### Key Concept: Inverse Functions\n\nIf $f$ and $f^{-1}$ are inverses, then:\n\n- $f(a) = b$ if and only if $f^{-1}(b) = a$\n\n### Finding Inverses Algebraically\n\nTo find the inverse of a function:\n\n1. Rewrite the function as $y = f(x)$\n2. Exchange $x$ and $y$\n3. Solve for $y$\n4. Replace $y$ with $f^{-1}(x)$\n\nNot all functions have inverses that are also functions. If a function fails the **horizontal line test**, restrict the domain so that it becomes one-to-one.",
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
              markdown: "## Example 1 — Find an Inverse Relation\n\nThe vertices of triangle $ABC$ are:\n\n$$\\{(2, 4), (-3, 2), (4, 1)\\}$$\n\nFind the inverse relation.\n\n### Step 1: Graph the relation\n\nGraph the points and connect them.\n\n### Step 2: Find the inverse\n\nExchange the coordinates of each ordered pair:\n\n$$\\{(4, 2), (2, -3), (1, 4)\\}$$\n\n### Step 3: Graph the inverse\n\nGraph the reflected points.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "{(2, 4), (-3, 2), (4, 1)}",
                steps: [
                  { expression: "Original relation", explanation: "{(2, 4), (-3, 2), (4, 1)}" },
                  { expression: "Exchange coordinates", explanation: "Swap each (x, y) to (y, x)" },
                  { expression: "Inverse relation", explanation: "{(4, 2), (2, -3), (1, 4)}" },
                  { expression: "Graph is reflected across y = x", explanation: "Visual check: original and inverse are mirror images" },
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
              markdown: "## Example 2 — Inverse Functions\n\nFind the inverse of:\n\n$$f(x) = 3x + 2$$\n\nThen graph the function and its inverse.\n\n### Step 1: Rewrite the function\n\n$$y = 3x + 2$$\n\n### Step 2: Exchange $x$ and $y$\n\n$$x = 3y + 2$$\n\n### Step 3: Solve for $y$\n\n$$x - 2 = 3y$$\n\n$$y = \\frac{x - 2}{3}$$\n\n### Step 4: Replace $y$ with $f^{-1}(x)$\n\n$$f^{-1}(x) = \\frac{x - 2}{3}$$\n\nThe graph of the inverse is a reflection of the original graph across the line $y = x$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = 3x + 2",
                steps: [
                  { expression: "Rewrite as y = 3x + 2", explanation: "Replace f(x) with y" },
                  { expression: "Exchange x and y", explanation: "x = 3y + 2" },
                  { expression: "Solve for y", explanation: "x - 2 = 3y, so y = (x - 2)/3" },
                  { expression: "f^{-1}(x) = (x - 2)/3", explanation: "Replace y with f^{-1}(x)" },
                  { expression: "Verify: f(f^{-1}(x)) = 3((x-2)/3) + 2 = x", explanation: "Check [f o f^{-1}](x) = x" },
                  { expression: "Verify: f^{-1}(f(x)) = (3x+2-2)/3 = x", explanation: "Check [f^{-1} o f](x) = x" },
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
              markdown: "## Example 3 — Inverses with Restricted Domains\n\nExamine:\n\n$$f(x) = x^2 + 2x + 4$$\n\n### Part A: Find the inverse\n\n$$y = x^2 + 2x + 4$$\n\nExchange $x$ and $y$:\n\n$$x = y^2 + 2y + 4$$\n\nComplete the square:\n\n$$x - 4 = y^2 + 2y$$\n\n$$x - 3 = (y + 1)^2$$\n\n$$y = -1 \\pm \\sqrt{x - 3}$$\n\nSo:\n\n$$f^{-1}(x) = -1 \\pm \\sqrt{x - 3}$$\n\n### Part B: Restrict the domain if necessary\n\nBecause $f(x)$ fails the horizontal line test, $f^{-1}(x)$ is not a function unless the domain of $f$ is restricted.\n\n- If domain of $f$ is $[-1, \\infty)$, then $f^{-1}(x) = -1 + \\sqrt{x - 3}$\n- If domain of $f$ is $(-\\infty, -1]$, then $f^{-1}(x) = -1 - \\sqrt{x - 3}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "f(x) = x^2 + 2x + 4",
                steps: [
                  { expression: "Rewrite as y = x^2 + 2x + 4", explanation: "Replace f(x) with y" },
                  { expression: "Exchange x and y", explanation: "x = y^2 + 2y + 4" },
                  { expression: "Complete the square", explanation: "x - 4 = (y + 1)^2 - 1, so x - 3 = (y + 1)^2" },
                  { expression: "y + 1 = ±√(x - 3)", explanation: "Take square root of both sides" },
                  { expression: "y = -1 ± √(x - 3)", explanation: "Solve for y" },
                  { expression: "f^{-1}(x) = -1 ± √(x - 3)", explanation: "Replace y with f^{-1}(x)" },
                  { expression: "Restrict domain to x ≥ -1 or x ≤ -1", explanation: "To make inverse a function, restrict original domain" },
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
              markdown: "## Example 4 — Interpret Inverse Functions\n\nThe temperature conversion formula from Fahrenheit to Celsius is:\n\n$$T(x) = \\frac{5}{9}(x - 32)$$\n\nFind the inverse and describe its meaning.\n\n$$y = \\frac{5}{9}(x - 32)$$\n\nExchange $x$ and $y$:\n\n$$x = \\frac{5}{9}(y - 32)$$\n\nMultiply by $\\frac{9}{5}$:\n\n$$\\frac{9x}{5} = y - 32$$\n\n$$y = \\frac{9x}{5} + 32$$\n\nSo:\n\n$$T^{-1}(x) = \\frac{9x}{5} + 32$$\n\nThis inverse converts temperature from **Celsius to Fahrenheit**.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "T(x) = (5/9)(x - 32)",
                steps: [
                  { expression: "Rewrite as y = (5/9)(x - 32)", explanation: "Replace T(x) with y" },
                  { expression: "Exchange x and y", explanation: "x = (5/9)(y - 32)" },
                  { expression: "Multiply both sides by 9/5", explanation: "(9/5)x = y - 32" },
                  { expression: "Add 32 to both sides", explanation: "y = (9/5)x + 32" },
                  { expression: "T^{-1}(x) = (9x/5) + 32", explanation: "Replace y with T^{-1}(x)" },
                  { expression: "Converts Celsius to Fahrenheit", explanation: "If T(x) is Fahrenheit from Celsius, T^{-1}(x) is Celsius from Fahrenheit" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn: Verifying Inverses",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Verifying Inverse Functions\n\n### Key Concept: Verifying Inverse Functions\n\nTwo functions $f$ and $g$ are inverses if and only if:\n\n- $[f \\circ g](x) = x$\n- $[g \\circ f](x) = x$\n\n### Watch Out\n\nYou must check **both** compositions to verify inverse functions. If only one composition equals the identity function, the functions are not inverses of each other.",
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
              markdown: "## Example 5 — Use Compositions to Verify Inverses\n\nDetermine whether:\n\n- $h(x) = \\sqrt{x + 13}$\n- $k(x) = (x - 13)^2$\n\nare inverse functions.\n\nFind $[h \\circ k](x)$:\n\n$$[h \\circ k](x) = h[k(x)]$$\n\n$$= \\sqrt{(x - 13)^2 + 13}$$\n\n$$= \\sqrt{x^2 - 26x + 182}$$\n\nBecause this is not the identity function, $h(x)$ and $k(x)$ are **not** inverses.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "h(x) = sqrt(x + 13), k(x) = (x - 13)^2",
                steps: [
                  { expression: "[h o k](x) = h(k(x))", explanation: "Definition of composition" },
                  { expression: "= sqrt((x - 13)^2 + 13)", explanation: "Substitute k(x) into h" },
                  { expression: "= sqrt(x^2 - 26x + 182)", explanation: "Expand the squared binomial" },
                  { expression: "sqrt(x^2 - 26x + 182) ≠ x", explanation: "Not the identity function" },
                  { expression: "Therefore h(x) and k(x) are NOT inverses", explanation: "Only one composition was checked" },
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
              markdown: "## Example 6 — Verify Inverse Functions\n\nThe volume of a cylinder with height $5$ inches is:\n\n$$V = 5\\pi r^2$$\n\nDetermine whether:\n\n$$r = \\sqrt{\\frac{V}{5\\pi}}$$\n\nis the inverse of the original function.\n\nFind both compositions.\n\nStarting from:\n\n- $V = 5\\pi r^2$\n- $r = \\sqrt{\\frac{V}{5\\pi}}$\n\nSubstituting one into the other gives:\n\n- $[V \\circ r](V) = 5\\pi \\left(\\sqrt{\\frac{V}{5\\pi}}\\right)^2 = 5\\pi \\cdot \\frac{V}{5\\pi} = V$\n- $[r \\circ V](r) = \\sqrt{\\frac{5\\pi r^2}{5\\pi}} = \\sqrt{r^2} = r$\n\nSo the given $r$ formula is the inverse of $V = 5\\pi r^2$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "V = 5*pi*r^2, r = sqrt(V/(5*pi))",
                steps: [
                  { expression: "[V o r](V) = V(sqrt(V/(5*pi)))", explanation: "Compose V with r" },
                  { expression: "= 5*pi*(sqrt(V/(5*pi)))^2", explanation: "Apply V to r(V)" },
                  { expression: "= 5*pi*(V/(5*pi))", explanation: "Square root cancels with square" },
                  { expression: "= V", explanation: "Identity function confirmed" },
                  { expression: "[r o V](r) = sqrt((5*pi*r^2)/(5*pi))", explanation: "Compose r with V" },
                  { expression: "= sqrt(r^2)", explanation: "Simplify fraction" },
                  { expression: "= r", explanation: "Identity function confirmed" },
                  { expression: "Both compositions equal identity, so they ARE inverses", explanation: "Verified" },
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
              markdown: "## Discussion Questions\n\n1. How do you find the inverse of a function algebraically?\n2. What is the horizontal line test and why is it important?\n3. Why must you check both $[f \\circ g](x) = x$ and $[g \\circ f](x) = x$ when verifying inverse functions?\n4. How does restricting the domain of a function help create an inverse that is also a function?",
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
                    question: "To find the inverse of f(x) = 2x + 5, what is the first step?",
                    options: [
                      "Subtract 5 from both sides",
                      "Replace f(x) with y",
                      "Divide by 2",
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "If f(a) = b, then f^{-1}(b) equals:",
                    options: ["a", "b", "f(b)", "1/a"],
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
              markdown: "## Reflection\n\nToday you learned about inverse relations and functions. Consider the following:\n\n- How does finding inverses help you solve real-world problems like temperature conversion?\n- What strategies help you determine whether a function has an inverse that is also a function?\n- What questions do you still have about inverse functions and their compositions?\n\n**Tip**: Always verify your inverse by checking both $[f \\circ f^{-1}](x) = x$ and $[f^{-1} \\circ f](x) = x$.",
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