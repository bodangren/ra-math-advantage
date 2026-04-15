import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Solving Quadratic Equations by Completing the Square",
          slug: lessonSlug,
          description: "Solve quadratic equations by using the Square Root Property and completing the square.",
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
          title: "Solving Quadratic Equations by Completing the Square",
          description: "Solve quadratic equations by using the Square Root Property and completing the square.",
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
              markdown: "## Explore: The Square Root Property\n\nConsider this: If $x^2 = 25$, what are the possible values of $x$?\n\nRemember that both $5^2 = 25$ and $(-5)^2 = 25$, so $x = \\pm 5$.\n\nThis is the **Square Root Property**. Today you'll use it to solve equations that can be written as a perfect square equals a constant.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "x^2 - 4x - 5 = 0",
                steps: [],
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
              markdown: "## Key Terms\n\n- **Square Root Property**: If $x^2 = n$, then $x = \\pm\\sqrt{n}$\n- **Completing the square**: Adding $(\\frac{b}{2})^2$ to $x^2 + bx$ to form a perfect square trinomial\n- **Vertex form**: $y = a(x - h)^2 + k$ — reveals the vertex $(h, k)$ of a parabola\n- **Perfect square trinomial**: A trinomial that factors as $(x + p)^2$\n\n**Remember**: When completing the square, the coefficient of $x^2$ must be 1 first!",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## The Square Root Property\n\nFor any number $n \\geq 0$, if $x^2 = n$, then:\n\n$$x = \\pm\\sqrt{n}$$\n\nThis property lets you solve equations once one side is a perfect square.\n\n### Solving with the Square Root Property\n\n1. **Isolate** the squared term\n2. **Take** the square root of both sides\n3. **Remember** to include both $\\pm$ solutions\n4. **Simplify** radicals when possible",
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
              markdown: "## Example 1: Rational Roots\n\nSolve $(x - 2)^2 = 25$\n\n**Step 1**: Apply the Square Root Property\n$$x - 2 = \\pm 5$$\n\n**Step 2**: Solve each equation\n$$x = 2 + 5 = 7 \\quad \\text{or} \\quad x = 2 - 5 = -3$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "(x-2)^2 = 25",
                steps: [
                  { expression: "(x-2)^2 = 25", explanation: "Original equation" },
                  { expression: "x - 2 = ±5", explanation: "Square Root Property" },
                  { expression: "x = 7 or x = -3", explanation: "Solve each equation" },
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
              markdown: "## Example 2: Irrational Roots\n\nSolve $(x + 12)^2 = 192$\n\n**Step 1**: Apply the Square Root Property\n$$x + 12 = \\pm\\sqrt{192}$$\n\n**Step 2**: Simplify the radical\n$$\\sqrt{192} = \\sqrt{64 \\cdot 3} = 8\\sqrt{3}$$\n\n**Step 3**: Solutions\n$$x = -12 + 8\\sqrt{3} \\approx 1.86 \\quad \\text{or} \\quad x = -12 - 8\\sqrt{3} \\approx -25.86$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "(x+12)^2 = 192",
                steps: [
                  { expression: "(x+12)^2 = 192", explanation: "Original equation" },
                  { expression: "x + 12 = ±√192", explanation: "Square Root Property" },
                  { expression: "x + 12 = ±8√3", explanation: "Simplify radical" },
                  { expression: "x = -12 ± 8√3", explanation: "Solutions" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3: Complex Solutions\n\nSolve $(x - 23)^2 = -36$\n\n**Step 1**: Apply the Square Root Property\n$$x - 23 = \\pm\\sqrt{-36}$$\n\n**Step 2**: Simplify the imaginary radical\n$$\\sqrt{-36} = 6i$$\n\n**Step 3**: Solutions\n$$x = 23 + 6i \\quad \\text{or} \\quad x = 23 - 6i$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "(x-23)^2 = -36",
                steps: [
                  { expression: "(x-23)^2 = -36", explanation: "Original equation" },
                  { expression: "x - 23 = ±√(-36)", explanation: "Square Root Property" },
                  { expression: "x - 23 = ±6i", explanation: "Simplify imaginary" },
                  { expression: "x = 23 ± 6i", explanation: "Complex solutions" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Completing the Square\n\nFor an expression of the form $x^2 + bx$:\n\n1. Find one half of $b$: $\\frac{b}{2}$\n2. Square that value: $(\\frac{b}{2})^2$\n3. Add the result to $x^2 + bx$\n\nSymbolically:\n\n$$x^2 + bx + (\\frac{b}{2})^2 = (x + \\frac{b}{2})^2$$\n\n### Example\n\nFor $x^2 + 6x$, half of 6 is 3, and $3^2 = 9$.\n\n$$x^2 + 6x + 9 = (x + 3)^2$$",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Complete the Square\n\nFind the value of $c$ that makes $x^2 - 7x + c$ a perfect square.\n\n**Step 1**: Half of $-7$ is $-3.5$\n\n**Step 2**: Square it:\n$$(-3.5)^2 = 12.25$$\n\n**Step 3**: Result:\n$$x^2 - 7x + 12.25 = (x - 3.5)^2$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "x^2 - 7x + c = (x-3.5)^2",
                steps: [
                  { expression: "b = -7", explanation: "Coefficient of x" },
                  { expression: "b/2 = -3.5", explanation: "Half of b" },
                  { expression: "(b/2)^2 = 12.25", explanation: "Square it" },
                  { expression: "c = 12.25", explanation: "Complete the square" },
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
              markdown: "## Example 5: Solve by Completing the Square\n\nSolve $x^2 + 8x + 5 = 0$\n\n**Step 1**: Move the constant.\n$$x^2 + 8x = -5$$\n\n**Step 2**: Complete the square. Half of 8 is 4, and $4^2 = 16$.\n$$x^2 + 8x + 16 = -5 + 16$$\n\n**Step 3**: Write the left side as a square.\n$$(x + 4)^2 = 11$$\n\n**Step 4**: Apply the Square Root Property.\n$$x = -4 \\pm \\sqrt{11}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "x^2 + 8x + 5 = 0",
                steps: [
                  { expression: "x^2 + 8x = -5", explanation: "Move the constant" },
                  { expression: "x^2 + 8x + 16 = 11", explanation: "Add (8/2)^2 to both sides" },
                  { expression: "(x + 4)^2 = 11", explanation: "Write as a perfect square" },
                  { expression: "x = -4 ± √11", explanation: "Use the Square Root Property" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6: Complete the Square with a Leading Coefficient\n\nRewrite $2x^2 + 12x + 7$ by completing the square.\n\n**Step 1**: Factor 2 from the quadratic and linear terms.\n$$2(x^2 + 6x) + 7$$\n\n**Step 2**: Complete the square inside the parentheses. Half of 6 is 3, and $3^2 = 9$.\n$$2(x^2 + 6x + 9 - 9) + 7$$\n\n**Step 3**: Simplify.\n$$2(x + 3)^2 - 18 + 7 = 2(x + 3)^2 - 11$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "2x^2 + 12x + 7",
                steps: [
                  { expression: "2(x^2 + 6x) + 7", explanation: "Factor out the leading coefficient" },
                  { expression: "2(x^2 + 6x + 9 - 9) + 7", explanation: "Complete the square inside" },
                  { expression: "2(x + 3)^2 - 11", explanation: "Simplify" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 7: Solve When $a$ Is Not 1\n\nSolve $2x^2 - 8x - 3 = 0$.\n\n**Step 1**: Move the constant and divide by 2.\n$$2x^2 - 8x = 3$$\n$$x^2 - 4x = \\frac{3}{2}$$\n\n**Step 2**: Complete the square. Half of $-4$ is $-2$, and $(-2)^2 = 4$.\n$$x^2 - 4x + 4 = \\frac{3}{2} + 4$$\n\n**Step 3**: Solve.\n$$(x - 2)^2 = \\frac{11}{2}$$\n$$x = 2 \\pm \\sqrt{\\frac{11}{2}} = 2 \\pm \\frac{\\sqrt{22}}{2}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "2x^2 - 8x - 3 = 0",
                steps: [
                  { expression: "x^2 - 4x = 3/2", explanation: "Move the constant and divide by 2" },
                  { expression: "x^2 - 4x + 4 = 11/2", explanation: "Complete the square" },
                  { expression: "(x - 2)^2 = 11/2", explanation: "Write as a square" },
                  { expression: "x = 2 ± √22/2", explanation: "Solve" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 8: Solve Equations with Imaginary Solutions\n\nSolve $x^2 + 6x + 13 = 0$ by completing the square.\n\n**Step 1**: Move the constant.\n$$x^2 + 6x = -13$$\n\n**Step 2**: Complete the square. Half of 6 is 3, and $3^2 = 9$.\n$$x^2 + 6x + 9 = -4$$\n\n**Step 3**: Use the Square Root Property.\n$$(x + 3)^2 = -4$$\n$$x + 3 = \\pm 2i$$\n\n**Solution**: $x = -3 \\pm 2i$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "x^2 + 6x + 13 = 0",
                steps: [
                  { expression: "x^2 + 6x = -13", explanation: "Move the constant" },
                  { expression: "x^2 + 6x + 9 = -4", explanation: "Complete the square" },
                  { expression: "(x + 3)^2 = -4", explanation: "Write as a square" },
                  { expression: "x = -3 ± 2i", explanation: "Use imaginary roots" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 13,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Vertex Form of a Quadratic Function\n\nWhen a quadratic is written in standard form $y = ax^2 + bx + c$, you can complete the square to reveal key features.\n\n### Key Concept: Vertex Form\n\n$$y = a(x - h)^2 + k$$\n\n- **Vertex**: $(h, k)$\n- **Axis of symmetry**: $x = h$\n- If $a > 0$, the vertex is a **minimum**\n- If $a < 0$, the vertex is a **maximum**\n\n### Writing in Vertex Form\n\n1. Factor out $a$ from the $x^2$ and $x$ terms\n2. Complete the square inside the parentheses\n3. Simplify by distributing $a$ and combining constants",
            },
          },
        ],
      },
      {
        phaseNumber: 14,
        title: "Worked Example 9",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 9: Write Functions in Vertex Form\n\nWrite $y = x^2 + 10x + 21$ in vertex form.\n\n**Step 1**: Group the quadratic and linear terms.\n$$y = (x^2 + 10x) + 21$$\n\n**Step 2**: Complete the square. Half of 10 is 5, and $5^2 = 25$.\n$$y = (x^2 + 10x + 25) + 21 - 25$$\n\n**Step 3**: Simplify.\n$$y = (x + 5)^2 - 4$$\n\nThe vertex is $(-5, -4)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "vertex-form",
                equation: "y = x^2 + 10x + 21",
                steps: [
                  { expression: "y = (x^2 + 10x) + 21", explanation: "Group x-terms" },
                  { expression: "y = (x^2 + 10x + 25) + 21 - 25", explanation: "Complete the square" },
                  { expression: "y = (x + 5)^2 - 4", explanation: "Write vertex form" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 15,
        title: "Worked Example 10",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 10: Determine the Vertex and Axis of Symmetry\n\nFind the vertex and axis of symmetry for $y = 2(x - 3)^2 - 7$.\n\nThis function is already in vertex form:\n$$y = a(x - h)^2 + k$$\n\nSo $h = 3$ and $k = -7$.\n\n**Vertex**: $(3, -7)$\n\n**Axis of symmetry**: $x = 3$\n\nBecause $a = 2 > 0$, the parabola opens upward and has a minimum at the vertex.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                functions: ["2(x-3)^2 - 7"],
                features: ["vertex", "axis of symmetry", "minimum"],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 16,
        title: "Worked Example 11",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 11: Model with a Quadratic Function\n\nA fountain stream reaches a maximum height of 12 feet after traveling 4 feet horizontally. The water hits the ground 8 feet from the nozzle. Write a quadratic model in vertex form.\n\n**Step 1**: Use the vertex $(4, 12)$.\n$$y = a(x - 4)^2 + 12$$\n\n**Step 2**: Use the point where the water lands, $(8, 0)$.\n$$0 = a(8 - 4)^2 + 12$$\n$$0 = 16a + 12$$\n$$a = -\\frac{3}{4}$$\n\n**Model**:\n$$y = -\\frac{3}{4}(x - 4)^2 + 12$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                functions: ["-0.75(x-4)^2 + 12"],
                features: ["vertex", "zeros", "model"],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 17,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. Why does completing the square reveal the vertex of a parabola?\n2. Why must the coefficient of $x^2$ be 1 before you complete the square?\n3. What's the relationship between the Square Root Property and completing the square?\n4. When might you get complex (imaginary) solutions?",
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
                    question: "What value completes x^2 + 10x + ___ to make a perfect square?",
                    options: ["5", "20", "25", "100"],
                    correctIndex: 2,
                  },
                  {
                    question: "If (x - 3)^2 = 16, what are the solutions?",
                    options: ["x = 7 only", "x = -1 only", "x = 7 or x = -1", "x = 3 or x = -3"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 18,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned to solve quadratic equations by completing the square.\n\n- What patterns do you look for when completing the square?\n- How does vertex form help you graph quadratic functions?\n- What common mistakes should you avoid?\n\n**Preview**: Next, you'll learn the Quadratic Formula — a powerful tool that works for any quadratic equation!",
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
