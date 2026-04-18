import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-6";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Using the Quadratic Formula and the Discriminant",
          slug: lessonSlug,
          description: "Use the Quadratic Formula to solve equations and the discriminant to determine the number and type of solutions.",
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
          title: "Using the Quadratic Formula and the Discriminant",
          description: "Use the Quadratic Formula to solve equations and the discriminant to determine the number and type of solutions.",
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
              markdown: "## Explore: The Discriminant\n\n**Inquiry Question**: How can you predict the number and type of solutions of a quadratic equation without solving it?\n\nConsider these three equations:\n- $x^2 + 5x + 6 = 0$\n- $x^2 - 4x - 1 = 0$\n- $x^2 + 2x + 5 = 0$\n\nCan you determine how many solutions each has just by looking?",
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
              markdown: "## Key Terms\n\n- **Quadratic Formula**: The solutions to $ax^2 + bx + c = 0$ are given by:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n- **Discriminant**: The expression $b^2 - 4ac$ under the square root\n- **Standard form**: $ax^2 + bx + c = 0$ where $a \\neq 0$\n\n**Remember**: The discriminant tells you how many real roots you'll get before you solve!",
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
              markdown: "## The Quadratic Formula\n\nFor a quadratic equation in standard form:\n\n$$ax^2 + bx + c = 0, \\quad a \\neq 0$$\n\nThe solutions are given by:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n### When to Use the Quadratic Formula\n\n- When factoring is difficult or impossible\n- When the coefficients are large\n- When you need exact (not approximate) solutions",
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
              markdown: "## Example 1: Use the Quadratic Formula\n\nSolve $x^2 + 5x + 6 = 0$\n\n**Step 1**: Identify coefficients: $a = 1$, $b = 5$, $c = 6$\n\n**Step 2**: Substitute into the formula:\n$$x = \\frac{-5 \\pm \\sqrt{5^2 - 4(1)(6)}}{2(1)}$$\n\n**Step 3**: Simplify:\n$$x = \\frac{-5 \\pm \\sqrt{25 - 24}}{2} = \\frac{-5 \\pm 1}{2}$$\n\n**Solutions**: $x = -2$ or $x = -3$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "quadratic-formula",
                equation: "x^2 + 5x + 6 = 0",
                steps: [
                  { expression: "a=1, b=5, c=6", explanation: "Identify coefficients" },
                  { expression: "x = (-5 ± √(25-24))/2", explanation: "Substitute into formula" },
                  { expression: "x = (-5 ± 1)/2", explanation: "Simplify" },
                  { expression: "x = -2 or x = -3", explanation: "Solutions" },
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
              markdown: "## Example 2: Non-Factorable Equation\n\nSolve $x^2 - 4x - 1 = 0$\n\n**Step 1**: Identify coefficients: $a = 1$, $b = -4$, $c = -1$\n\n**Step 2**: Substitute:\n$$x = \\frac{4 \\pm \\sqrt{(-4)^2 - 4(1)(-1)}}{2}$$\n\n**Step 3**: Simplify:\n$$x = \\frac{4 \\pm \\sqrt{16 + 4}}{2} = \\frac{4 \\pm \\sqrt{20}}{2}$$\n\n**Step 4**: Simplify radical:\n$$x = \\frac{4 \\pm 2\\sqrt{5}}{2} = 2 \\pm \\sqrt{5}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "quadratic-formula",
                equation: "x^2 - 4x - 1 = 0",
                steps: [
                  { expression: "a=1, b=-4, c=-1", explanation: "Identify coefficients" },
                  { expression: "x = (4 ± √(16+4))/2", explanation: "Substitute into formula" },
                  { expression: "x = (4 ± √20)/2", explanation: "Simplify radicand" },
                  { expression: "x = 2 ± √5", explanation: "Solutions" },
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
              markdown: "## Example 3: Imaginary Solutions\n\nSolve $x^2 + 2x + 5 = 0$\n\n**Step 1**: Identify coefficients: $a = 1$, $b = 2$, $c = 5$\n\n**Step 2**: Substitute:\n$$x = \\frac{-2 \\pm \\sqrt{2^2 - 4(1)(5)}}{2}$$\n\n**Step 3**: Simplify:\n$$x = \\frac{-2 \\pm \\sqrt{4 - 20}}{2} = \\frac{-2 \\pm \\sqrt{-16}}{2}$$\n\n**Step 4**: Simplify imaginary:\n$$x = \\frac{-2 \\pm 4i}{2} = -1 \\pm 2i$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "quadratic-formula",
                equation: "x^2 + 2x + 5 = 0",
                steps: [
                  { expression: "a=1, b=2, c=5", explanation: "Identify coefficients" },
                  { expression: "x = (-2 ± √(4-20))/2", explanation: "Substitute into formula" },
                  { expression: "x = (-2 ± √(-16))/2", explanation: "Negative discriminant" },
                  { expression: "x = -1 ± 2i", explanation: "Complex solutions" },
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
              markdown: "## The Discriminant\n\nThe expression under the square root is called the **discriminant**:\n\n$$D = b^2 - 4ac$$\n\n### Key Concept: Interpreting the Discriminant\n\n| Value of D | Number and Type of Solutions |\n|------------|------------------------------|\n| $D > 0$ | Two distinct real solutions |\n| $D = 0$ | One repeated real solution |\n| $D < 0$ | Two complex solutions |\n\n**Tip**: Use the discriminant to check your work — if you expect real roots but get $D < 0$, check your arithmetic!",
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
              markdown: "## Example 4: Use the Discriminant\n\nDetermine the number and type of solutions for $2x^2 - 3x + 5 = 0$\n\n**Calculate the discriminant**:\n$$D = (-3)^2 - 4(2)(5) = 9 - 40 = -31$$\n\n**Since $D < 0$**, there are **two complex solutions** (no real roots).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "discriminant-analyzer",
              props: {
                equation: "2x^2 - 3x + 5 = 0",
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
              markdown: "## Example 5: Perfect Square Trinomial\n\nDetermine the number and type of solutions for $x^2 - 6x + 9 = 0$\n\n**Calculate the discriminant**:\n$$D = (-6)^2 - 4(1)(9) = 36 - 36 = 0$$\n\n**Since $D = 0$**, there is **exactly one real solution** (a repeated root).\n\nNote: This trinomial is $(x - 3)^2$, so the solution is $x = 3$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "discriminant-analyzer",
              props: {
                equation: "x^2 - 6x + 9 = 0",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. Why is the discriminant useful before solving?\n2. When is the quadratic formula more efficient than factoring?\n3. How does the discriminant connect to completing the square?\n4. Can you have exactly one imaginary solution? Why or why not?",
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
                    question: "What does the discriminant tell you?",
                    options: ["The sum of the roots", "The number and type of solutions", "The product of the roots", "The axis of symmetry"],
                    correctIndex: 1,
                  },
                  {
                    question: "If D = 0, how many real solutions are there?",
                    options: ["0", "1", "2", "Cannot determine"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned the Quadratic Formula and how to use the discriminant.\n\n- When would you use the quadratic formula instead of factoring?\n- How does the discriminant help you predict solution types?\n- What patterns in the discriminant correspond to special cases?\n\n**Preview**: Next, you'll learn to solve quadratic inequalities — equations with $>$, $<$, $\\geq$, or $\\leq$ signs!",
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
