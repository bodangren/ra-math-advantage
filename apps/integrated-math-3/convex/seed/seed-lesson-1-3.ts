import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Complex Numbers",
          slug: lessonSlug,
          description: "Introduction to imaginary unit i and operations with complex numbers.",
          orderIndex: 3,
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
          title: "Complex Numbers",
          description: "Introduction to imaginary unit i and operations with complex numbers.",
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
              markdown: "## Explore: The Square Root of Negative Numbers\n\nYou've learned that $\\sqrt{4} = 2$ because $2^2 = 4$.\n\nBut what about $\\sqrt{-4}$? No real number squared gives $-4$.\n\nToday you'll discover a new kind of number that solves this problem!",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "simplify_imaginary",
                equation: "sqrt(-9)",
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
              markdown: "## Key Terms\n\n- **Imaginary unit**: $i$ where $i^2 = -1$\n- **Complex number**: A number of the form $a + bi$ where $a$ and $b$ are real\n- **Real part**: The $a$ in $a + bi$\n- **Imaginary part**: The $b$ in $a + bi$\n- **Pure imaginary**: A complex number where $a = 0$ (of the form $bi$)\n\n**Note**: Every real number is also a complex number (with $b = 0$).",
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
              markdown: "## The Imaginary Unit $i$\n\nBy definition: $i^2 = -1$\n\nThis means: $\\sqrt{-1} = i$\n\n### Simplifying Square Roots of Negative Numbers\n\n$$\\sqrt{-n} = i\\sqrt{n} \\text{ for } n > 0$$\n\n**Examples**:\n- $\\sqrt{-9} = \\sqrt{9} \\cdot \\sqrt{-1} = 3i$\n- $\\sqrt{-5} = \\sqrt{5}i$\n- $\\sqrt{-4} = 2i$",
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
              markdown: "## Example 1: Square Roots of Negative Numbers\n\nSimplify $\\sqrt{-16}$.\n\n**Step 1**: Separate the negative\n$$\\sqrt{-16} = \\sqrt{16 \\cdot (-1)}$$\n\n**Step 2**: Apply the property\n$$= \\sqrt{16} \\cdot \\sqrt{-1} = 4i$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "simplify_imaginary",
                equation: "sqrt(-16)",
                steps: [
                  { expression: "sqrt(-16)", explanation: "Original expression" },
                  { expression: "= sqrt(16 * -1)", explanation: "Separate negative" },
                  { expression: "= sqrt(16) * sqrt(-1)", explanation: "Product property" },
                  { expression: "= 4 * i", explanation: "Apply definition of i" },
                  { expression: "= 4i", explanation: "Final answer" },
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
              markdown: "## Example 2: Products with Imaginary Numbers\n\nSimplify $3i \\cdot 4i$.\n\n**Step 1**: Multiply coefficients\n$$3i \\cdot 4i = 12i^2$$\n\n**Step 2**: Replace $i^2$ with $-1$\n$$= 12(-1) = -12$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "complex_operations",
                equation: "3i * 4i",
                steps: [
                  { expression: "3i * 4i", explanation: "Original expression" },
                  { expression: "= 12i^2", explanation: "Multiply coefficients" },
                  { expression: "= 12(-1)", explanation: "Replace i^2 with -1" },
                  { expression: "= -12", explanation: "Final answer" },
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
              markdown: "## Example 3: Equation with Pure Imaginary Solutions\n\nSolve $x^2 = -25$.\n\n**Step 1**: Take square root of both sides\n$$x = \\pm \\sqrt{-25}$$\n\n**Step 2**: Simplify\n$$x = \\pm 5i$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "simplify_imaginary",
                equation: "x^2 = -25",
                steps: [
                  { expression: "x^2 = -25", explanation: "Original equation" },
                  { expression: "x = +/- sqrt(-25)", explanation: "Take square root" },
                  { expression: "x = +/- 5i", explanation: "Simplify using i" },
                  { expression: "Solutions: x = 5i, x = -5i", explanation: "Two pure imaginary solutions" },
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
              markdown: "## Operations with Complex Numbers\n\nGiven $z = a + bi$ and $w = c + di$:\n\n### Addition\n$$z + w = (a + c) + (b + d)i$$\n\n### Subtraction\n$$z - w = (a - c) + (b - d)i$$\n\n### Multiplication\n$$z \\cdot w = (ac - bd) + (ad + bc)i$$\n\n**Note**: We combine like terms, remembering that $i^2 = -1$.",
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
              markdown: "## Example 4: Equate Complex Numbers\n\nSolve for $x$ and $y$ if $x + 2i = 5 + yi$.\n\n**Step 1**: Equate the real parts: $x = 5$.\n\n**Step 2**: Equate the imaginary parts: $2 = y$.\n\nSo $x = 5$ and $y = 2$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "complex_operations",
                equation: "x + 2i = 5 + yi",
                steps: [
                  { expression: "x + 2i = 5 + yi", explanation: "Original equation" },
                  { expression: "x = 5", explanation: "Equate real parts" },
                  { expression: "2 = y", explanation: "Equate imaginary parts" },
                  { expression: "x = 5, y = 2", explanation: "State both values" },
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
              markdown: "## Example 5: Add or Subtract Complex Numbers\n\nSimplify $(3 + 2i) + (1 + 4i)$.\n\n**Step 1**: Group real and imaginary parts\n$$= (3 + 1) + (2 + 4)i$$\n\n**Step 2**: Combine like terms\n$$= 4 + 6i$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "complex_operations",
                equation: "(3+2i) + (1+4i)",
                steps: [
                  { expression: "(3+2i) + (1+4i)", explanation: "Original expression" },
                  { expression: "= (3+1) + (2+4)i", explanation: "Group real and imaginary" },
                  { expression: "= 4 + 6i", explanation: "Combine like terms" },
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
              markdown: "## Example 6: Multiply Complex Numbers\n\nSimplify $(2 + 3i)(1 - 4i)$.\n\n**Step 1**: Use FOIL\n$$= 2 \\cdot 1 + 2(-4i) + 3i \\cdot 1 + 3i(-4i)$$\n\n**Step 2**: Simplify each term\n$$= 2 - 8i + 3i - 12i^2$$\n\n**Step 3**: Combine (remember $i^2 = -1$)\n$$= 2 - 5i - 12(-1) = 2 - 5i + 12$$\n\n**Step 4**: Final answer\n$$= 14 - 5i$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "complex_operations",
                equation: "(2+3i)(1-4i)",
                steps: [
                  { expression: "(2+3i)(1-4i)", explanation: "Original expression" },
                  { expression: "= 2 - 8i + 3i - 12i^2", explanation: "FOIL expansion" },
                  { expression: "= 2 - 5i - 12(-1)", explanation: "Simplify i terms" },
                  { expression: "= 2 - 5i + 12", explanation: "Apply i^2 = -1" },
                  { expression: "= 14 - 5i", explanation: "Combine real terms" },
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
              markdown: "## Example 7: Divide Complex Numbers\n\nSimplify $\\frac{3 + 2i}{1 - i}$.\n\n**Step 1**: Multiply numerator and denominator by the conjugate of the denominator\n$$= \\frac{(3 + 2i)(1 + i)}{(1 - i)(1 + i)}$$\n\n**Step 2**: Simplify denominator\n$$(1 - i)(1 + i) = 1 - i^2 = 2$$\n\n**Step 3**: Expand numerator\n$$(3 + 2i)(1 + i) = 1 + 5i$$\n\n**Step 4**: Divide\n$$= \\frac{1}{2} + \\frac{5}{2}i$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "complex_operations",
                equation: "(3+2i)/(1-i)",
                steps: [
                  { expression: "(3+2i)/(1-i) * (1+i)/(1+i)", explanation: "Multiply by conjugate" },
                  { expression: "Denominator: (1-i)(1+i) = 2", explanation: "Simplify denominator" },
                  { expression: "Numerator: (3+2i)(1+i) = 1+5i", explanation: "Expand numerator" },
                  { expression: "= (1+5i)/2 = 0.5 + 2.5i", explanation: "Final answer" },
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
              markdown: "## Discussion Questions\n\n1. Why do we need the imaginary unit $i$?\n2. What is the conjugate of $a + bi$, and why is it useful?\n3. How is multiplying complex numbers similar to multiplying binomials?\n4. Why does $i^4 = 1$ but $i^2 = -1$?",
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
                    question: "What is i^2?",
                    options: ["1", "-1", "i", "-i"],
                    correctIndex: 1,
                  },
                  {
                    question: "What is the conjugate of 3 + 4i?",
                    options: ["3 - 4i", "-3 + 4i", "4 + 3i", "3i + 4"],
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
              markdown: "## Reflection\n\nToday you learned about complex numbers and the imaginary unit $i$.\n\n- What was the most challenging concept in this lesson?\n- How does the set of complex numbers extend what you already knew about real numbers?\n- What questions do you still have about complex numbers?\n\n**Preview**: Next lesson, you'll use complex numbers to solve quadratic equations that have no real solutions!",
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
