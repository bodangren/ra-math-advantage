import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Solve Quadratic Equations by Factoring",
          slug: lessonSlug,
          description: "Students factor trinomials and apply the zero product property.",
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
          title: "Solve Quadratic Equations by Factoring",
          description: "Students factor trinomials and apply the zero product property.",
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
              markdown: "## Explore: The Zero Product Property\n\nConsider this: If $A \\cdot B = 0$, what can you conclude about $A$ and $B$?\n\nEither $A = 0$ or $B = 0$ (or both)!\n\nThis is the **Zero Product Property**. Today you'll use it to solve equations by factoring.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "x^2 - 5x + 6 = 0",
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
              markdown: "## Key Terms\n\n- **Zero Product Property**: If $AB = 0$, then $A = 0$ or $B = 0$\n- **Factored form**: A product of factors set equal to zero\n- **Trinomial**: A polynomial with three terms\n- **Zero (or root)**: A value that makes the expression equal to zero\n- **GCF**: Greatest Common Factor — the largest factor shared by all terms\n\n**Remember**: Always check for a GCF before trying other factoring methods!",
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
              markdown: "## The Zero Product Property\n\nIf $A \\cdot B = 0$, then either $A = 0$ or $B = 0$ (or both).\n\nThis property lets us solve equations once they're in factored form.\n\n### Solving Quadratics by Factoring\n\n1. **Move** all terms to one side (so the equation equals 0)\n2. **Factor** the expression\n3. **Set each factor** equal to 0\n4. **Solve** each equation\n5. **Check** your answers in the original equation",
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
              markdown: "## Example 1: Factor Using the Distributive Property\n\nSolve $(x + 2)(x + 3) = 0$\n\n**Step 1**: The equation is already factored!\n**Step 2**: Apply Zero Product Property\n$$x + 2 = 0 \\quad \\text{or} \\quad x + 3 = 0$$\n\n**Step 3**: Solve each equation\n$$x = -2 \\quad \\text{or} \\quad x = -3$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "(x+2)(x+3) = 0",
                steps: [
                  { expression: "(x+2)(x+3) = 0", explanation: "Already factored" },
                  { expression: "x + 2 = 0  or  x + 3 = 0", explanation: "Zero Product Property" },
                  { expression: "x = -2  or  x = -3", explanation: "Solve each equation" },
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
              markdown: "## Example 2: Factor and Solve a Trinomial\n\nSolve $x^2 + 5x + 6 = 0$\n\n**Step 1**: Factor the trinomial\n- Find two numbers that multiply to 6 and add to 5\n- $2 \\cdot 3 = 6$ and $2 + 3 = 5$\n- $(x + 2)(x + 3) = 0$\n\n**Step 2**: Apply Zero Product Property\n$$x + 2 = 0 \\quad \\text{or} \\quad x + 3 = 0$$\n\n**Step 3**: Solutions: $x = -2$ or $x = -3$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "x^2 + 5x + 6 = 0",
                steps: [
                  { expression: "x^2 + 5x + 6 = 0", explanation: "Original equation" },
                  { expression: "(x+2)(x+3) = 0", explanation: "Factor: 2*3=6, 2+3=5" },
                  { expression: "x + 2 = 0  or  x + 3 = 0", explanation: "Zero Product Property" },
                  { expression: "x = -2  or  x = -3", explanation: "Solutions" },
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
              markdown: "## Example 3: Solve an Equation by Factoring\n\nSolve $x^2 = 9$\n\n**Step 1**: Move all terms to one side\n$$x^2 - 9 = 0$$\n\n**Step 2**: Recognize as a difference of squares\n$$(x + 3)(x - 3) = 0$$\n\n**Step 3**: Apply Zero Product Property\n$$x + 3 = 0 \\quad \\text{or} \\quad x - 3 = 0$$\n\n**Step 4**: Solutions: $x = -3$ or $x = 3$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "x^2 = 9",
                steps: [
                  { expression: "x^2 - 9 = 0", explanation: "Move terms to one side" },
                  { expression: "(x+3)(x-3) = 0", explanation: "Difference of squares" },
                  { expression: "x + 3 = 0  or  x - 3 = 0", explanation: "Zero Product Property" },
                  { expression: "x = -3  or  x = 3", explanation: "Solutions" },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Factor a Trinomial Where a ≠ 1\n\nSolve $2x^2 + 5x - 3 = 0$\n\n**Step 1**: Find two numbers that multiply to $2(-3) = -6$ and add to $5$\n- $6 \\cdot (-1) = -6$ and $6 + (-1) = 5$\n\n**Step 2**: Use these to split the middle term\n$$2x^2 + 6x - x - 3 = 0$$\n\n**Step 3**: Factor by grouping\n$$2x(x + 3) - 1(x + 3) = 0$$\n$$(2x - 1)(x + 3) = 0$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "2x^2 + 5x - 3 = 0",
                steps: [
                  { expression: "2x^2 + 5x - 3 = 0", explanation: "Original equation" },
                  { expression: "2x^2 + 6x - x - 3 = 0", explanation: "Split middle term" },
                  { expression: "(2x-1)(x+3) = 0", explanation: "Factor by grouping" },
                  { expression: "2x - 1 = 0  or  x + 3 = 0", explanation: "Zero Product Property" },
                  { expression: "x = 1/2  or  x = -3", explanation: "Solutions" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Factoring $x^2 + bx + c$\n\nWhen factoring $x^2 + bx + c$ (where $a = 1$):\n\nFind two numbers that:\n- **Multiply** to give $c$\n- **Add** to give $b$\n\n**Example**: Factor $x^2 + 5x + 6$\n- Need two numbers that multiply to 6 AND add to 5\n- $2 \\cdot 3 = 6$ and $2 + 3 = 5$\n- Answer: $(x + 2)(x + 3)$",
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
              markdown: "## Example 5: Factor a Difference of Squares\n\nFactor $4x^2 - 9$\n\n**Recognize**: This is $a^2 - b^2$ where $a = 2x$ and $b = 3$\n\n**Apply**: $(a + b)(a - b) = a^2 - b^2$\n\n$$4x^2 - 9 = (2x + 3)(2x - 3)$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "4x^2 - 9 = 0",
                steps: [
                  { expression: "4x^2 - 9 = 0", explanation: "Original equation" },
                  { expression: "(2x+3)(2x-3) = 0", explanation: "Difference of squares" },
                  { expression: "2x + 3 = 0  or  2x - 3 = 0", explanation: "Zero Product Property" },
                  { expression: "x = -3/2  or  x = 3/2", explanation: "Solutions" },
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
              markdown: "## Example 6: Factor a Perfect Square Trinomial\n\nFactor $x^2 + 10x + 25$.\n\n**Recognize**: This is $a^2 + 2ab + b^2$ where $a = x$ and $b = 5$.\n\n**Apply**: $a^2 + 2ab + b^2 = (a + b)^2$\n\n$$x^2 + 10x + 25 = (x + 5)^2$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "x^2 + 10x + 25",
                steps: [
                  { expression: "x^2 + 10x + 25", explanation: "Original trinomial" },
                  { expression: "x^2 + 2(x)(5) + 5^2", explanation: "Recognize perfect square pattern" },
                  { expression: "(x + 5)^2", explanation: "Factor as a perfect square trinomial" },
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
              markdown: "## Example 7: Complex Solutions\n\nSolve $x^2 + 4 = 0$.\n\n**Step 1**: Move terms\n$$x^2 = -4$$\n\n**Step 2**: Take square root of both sides\n$$x = \\pm \\sqrt{-4} = \\pm 2i$$\n\n**Check**: $(2i)^2 = -4$ and $(-2i)^2 = -4$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "factoring",
                equation: "x^2 + 4 = 0",
                steps: [
                  { expression: "x^2 + 4 = 0", explanation: "Original equation" },
                  { expression: "x^2 = -4", explanation: "Isolate x^2" },
                  { expression: "x = +/- sqrt(-4)", explanation: "Take square root" },
                  { expression: "x = +/- 2i", explanation: "Complex solutions" },
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
              markdown: "## Discussion Questions\n\n1. Why does the Zero Product Property work?\n2. What's the first step when factoring any polynomial?\n3. How is factoring related to the distributive property (FOIL in reverse)?\n4. When might an equation have complex (imaginary) solutions?",
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
                    question: "If (x-3)(x+5) = 0, what are the solutions?",
                    options: ["x = 3 or x = -5", "x = -3 or x = 5", "x = 3 or x = 3", "x = -5 or x = -5"],
                    correctIndex: 0,
                  },
                  {
                    question: "What comes FIRST when factoring?",
                    options: ["Look for a GCF", "Split the middle term", "Use quadratic formula", "Graph it"],
                    correctIndex: 0,
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
              markdown: "## Reflection\n\nToday you learned to solve quadratic equations by factoring and using the Zero Product Property.\n\n- What patterns do you look for when factoring?\n- What common mistakes should you avoid?\n- How do you check if your factored form is correct?\n\n**Preview**: Next, you'll learn completing the square — another method for solving quadratics!",
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
