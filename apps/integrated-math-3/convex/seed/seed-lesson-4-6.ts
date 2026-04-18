import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_6Result> => {
    const now = Date.now();
    const lessonSlug = "module-4-lesson-6";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Solving Radical Equations",
          slug: lessonSlug,
          description:
            "Students solve radical equations in one variable, identify extraneous solutions, and solve radical equations by graphing systems of equations.",
          orderIndex: 6,
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
          title: "Solving Radical Equations",
          description:
            "Students solve radical equations in one variable, identify extraneous solutions, and solve radical equations by graphing systems of equations.",
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
                "## Explore: Solutions of Radical Equations\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nWhen will a radical equation have a solution? When will it have no solution?",
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
                title: "Explore Radical Equations",
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
                "## Key Terms\n\n- **Radical equation**: An equation that has a variable in a radicand",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Solving Radical Equations Algebraically",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Solving Radical Equations Algebraically\n\nA **radical equation** has a variable in a radicand.\n\nWhen solving a radical equation, the result may be an **extraneous solution**.\n\n### Key Concept: Solving Radical Equations\n\n1. Isolate the radical on one side.\n2. Raise each side to a power equal to the index of the radical.\n3. Solve the resulting polynomial equation.\n4. Check all results.",
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
                "## Example 1 — Solve a Square Root Equation\n\nSolve: $\sqrt{3x - 5} + 2 = 6$\n\nIsolate the radical:\n\n$\sqrt{3x - 5} = 4$\n\nSquare both sides:\n\n$3x - 5 = 16$\n\n$3x = 21$\n\n$x = 7$\n\nCheck the result in the original equation.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "sqrt(3x - 5) + 2 = 6",
                steps: [
                  { expression: "Isolate the radical", explanation: "sqrt(3x - 5) = 4" },
                  { expression: "Square both sides", explanation: "3x - 5 = 16" },
                  { expression: "Solve for x", explanation: "3x = 21, so x = 7" },
                  { expression: "Check the result", explanation: "sqrt(3(7) - 5) + 2 = sqrt(16) + 2 = 6" },
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
                "## Example 2 — Solve a Cube Root Equation\n\nSolve: $4(2x + 6)^{\\frac{1}{3}} - 9 = 3$\n\nIsolate the cube root:\n\n$4(2x + 6)^{\\frac{1}{3}} = 12$\n\n$(2x + 6)^{\\frac{1}{3}} = 3$\n\nCube both sides:\n\n$2x + 6 = 27$\n\n$2x = 21$\n\n$x = \\frac{21}{2}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "4*cuberoot(2x + 6) - 9 = 3",
                steps: [
                  { expression: "Isolate the cube root", explanation: "4*cuberoot(2x + 6) = 12" },
                  { expression: "Divide by 4", explanation: "cuberoot(2x + 6) = 3" },
                  { expression: "Cube both sides", explanation: "2x + 6 = 27" },
                  { expression: "Solve for x", explanation: "2x = 21, so x = 21/2" },
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
                "## Example 3 — Identify Extraneous Solutions\n\nSolve: $\sqrt{x + 21} = 3 - \sqrt{x}$\n\nSquare both sides:\n\n$x + 21 = 9 - 6\sqrt{x} + x$\n\n$12 = -6\sqrt{x}$\n\n$-2 = \sqrt{x}$\n\nSquare both sides:\n\n$x = 4$\n\nCheck:\n\n$\sqrt{4 + 21} = 5$\n\n$3 - \sqrt{4} = 1$\n\nThese are not equal, so $x = 4$ is an **extraneous solution**.\n\nTherefore, there is **no real solution**.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "sqrt(x + 21) = 3 - sqrt(x)",
                steps: [
                  { expression: "Square both sides", explanation: "x + 21 = 9 - 6*sqrt(x) + x" },
                  { expression: "Simplify", explanation: "12 = -6*sqrt(x), so -2 = sqrt(x)" },
                  { expression: "Square again", explanation: "x = 4" },
                  { expression: "Check in original", explanation: "sqrt(25) = 5, but 3 - sqrt(4) = 1" },
                  { expression: "No real solution", explanation: "x = 4 is extraneous" },
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
                "## Example 4 — Solve a Radical Equation\n\nSolve: $\\frac{2}{3}(11x + 14)^{\\frac{1}{6}} + 8 = 10$\n\nIsolate the radical:\n\n$\\frac{2}{3}(11x + 14)^{\\frac{1}{6}} = 2$\n\n$(11x + 14)^{\\frac{1}{6}} = 3$\n\nRaise both sides to the sixth power:\n\n$11x + 14 = 729$\n\n$11x = 715$\n\n$x = 65$\n\nThis value makes the equation true.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(2/3)*(11x + 14)^(1/6) + 8 = 10",
                steps: [
                  { expression: "Isolate the radical", explanation: "(2/3)*(11x + 14)^(1/6) = 2" },
                  { expression: "Multiply by 3/2", explanation: "(11x + 14)^(1/6) = 3" },
                  { expression: "Raise to sixth power", explanation: "11x + 14 = 729" },
                  { expression: "Solve for x", explanation: "11x = 715, so x = 65" },
                  { expression: "Check the result", explanation: "(2/3)*(729)^(1/6) + 8 = (2/3)*3 + 8 = 10" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn: Solving Radical Equations by Graphing",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Solving Radical Equations by Graphing\n\nTo solve a radical equation using a graph:\n\n- rewrite the equation with $0$ on one side and graph the related function\n- or write a system by setting each side equal to $y$\n\nThe zeros or intersections give the solution.\n\nExample:\n\nEquation: $\sqrt{2x + 5} + 1 = 4$\n\nRelated function: $f(x) = \sqrt{2x + 5} - 3$\n\nSystem:\n\n- $y = \sqrt{2x + 5} + 1$\n- $y = 4$",
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
                "## Example 5 — Solve a Radical Equation by Graphing\n\nUse a graphing calculator to solve: $2\\sqrt[3]{3x - 4} + 10 = 9$\n\n### Step 1: Find a related function\n\nMove everything to one side:\n\n$2\\sqrt[3]{3x - 4} + 1 = 0$\n\nSo the related function is:\n\n$f(x) = 2\\sqrt[3]{3x - 4} + 1$\n\n### Step 2: Graph the function\n\nGraph in the calculator.\n\n### Step 3: Use a table\n\nThe table shows the function changes sign between $x = 1$ and $x = 2$.\n\n### Step 4: Find the zero\n\nUse the `zero` feature.\n\nThe zero is about $x \\approx 1.29$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "2*cuberoot(3x - 4) + 10 = 9",
                steps: [
                  { expression: "Move all terms to one side", explanation: "2*cuberoot(3x - 4) + 1 = 0" },
                  { expression: "Related function: f(x) = 2*cuberoot(3x - 4) + 1", explanation: "Set equal to y" },
                  { expression: "Graph and find sign change", explanation: "Function changes sign between x = 1 and x = 2" },
                  { expression: "Use zero feature", explanation: "The zero is about x ≈ 1.29" },
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
                "## Example 6 — Solve a Radical Equation by Using a System\n\nUse a graphing calculator to solve: $\sqrt{x + 6} - 5 = -\sqrt{2x} + 1$\n\n### Step 1: Write a system\n\n- $y = \sqrt{x + 6} - 5$\n- $y = -\sqrt{2x} + 1$\n\n### Step 2: Graph the system\n\nEnter both in the `Y=` list.\n\n### Step 3: Find the intersection\n\nUse the `intersect` feature.\n\nThe x-coordinate of the intersection is about $x \\approx 4.02$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "sqrt(x + 6) - 5 = -sqrt(2x) + 1",
                steps: [
                  { expression: "Write as system", explanation: "y = sqrt(x + 6) - 5 and y = -sqrt(2x) + 1" },
                  { expression: "Graph both equations", explanation: "Enter in Y= list" },
                  { expression: "Find intersection", explanation: "Use intersect feature on calculator" },
                  { expression: "x ≈ 4.02", explanation: "x-coordinate of intersection is the solution" },
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
                "## Example 7 — Confirm Solutions by Using Technology\n\nThe relationship for a planet orbiting the Sun is:\n\n$T = \\sqrt{a^3}$\n\nwhere $T$ is measured in years and $a$ is measured in astronomical units.\n\nIf Mars takes $1.88$ years to orbit the Sun, find its mean distance from the Sun.\n\n$1.88 = \\sqrt{a^3}$\n\nSquare both sides:\n\n$3.5344 = a^3$\n\nTake the cube root:\n\n$a \\approx 1.5233$\n\nSo the mean distance from Mars to the Sun is about **1.5233 AU**.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "1.88 = sqrt(a^3)",
                steps: [
                  { expression: "Start with T = sqrt(a^3)", explanation: "Given formula for orbital period" },
                  { expression: "Substitute T = 1.88", explanation: "1.88 = sqrt(a^3)" },
                  { expression: "Square both sides", explanation: "3.5344 = a^3" },
                  { expression: "Take cube root", explanation: "a ≈ 1.5233" },
                  { expression: "Answer: 1.5233 AU", explanation: "Mean distance from Mars to the Sun" },
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
              markdown:
                "## Discussion Questions\n\n1. Why is it important to check all results when solving a radical equation?\n2. How can you tell if a solution is extraneous without checking it in the original equation?\n3. What are two ways to solve a radical equation by graphing?\n4. When might solving a radical equation algebraically be preferable to solving by graphing?",
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
                    question: "What is the first step in solving a radical equation algebraically?",
                    options: [
                      "Square both sides immediately",
                      "Isolate the radical on one side",
                      "Check for extraneous solutions",
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "If you solve sqrt(x) = -3 and get x = 9, what can you conclude?",
                    options: [
                      "x = 9 is the correct solution",
                      "x = 9 is an extraneous solution",
                      "The equation has no solution",
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
              markdown:
                "## Reflection\n\nToday you learned about solving radical equations. Consider the following:\n\n- Why must you check all results when solving radical equations?\n- How does graphing help you verify or find solutions to radical equations?\n- What questions do you still have about solving radical equations algebraically or by graphing?\n\n**Tip**: Always isolate the radical before raising both sides to a power, and always check your answers in the original equation to catch extraneous solutions.",
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
