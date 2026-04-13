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
          title: "Completing the Square",
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
          title: "Completing the Square",
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
        phaseNumber: 5,
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
        phaseNumber: 6,
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
        phaseNumber: 7,
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
        phaseNumber: 10,
        title: "Assessment",
        phaseType: "assessment" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "fill-in-the-blank",
              props: {
                blanks: [
                  { id: "1", label: "Complete x^2 + 8x + ___ to make a perfect square", correctAnswer: "16" },
                  { id: "2", label: "Solve (x+3)^2 = 49", correctAnswer: "x = 4 or x = -10" },
                  { id: "3", label: "Vertex form of x^2 + 6x + 5", correctAnswer: "(x+3)^2 - 4" },
                ],
              },
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-square",
                equation: "x^2 + 6x + 5 = 0",
                steps: [],
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
        phaseNumber: 12,
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