import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-3-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Proving Polynomial Identities",
          slug: lessonSlug,
          description: "Students prove polynomial identities and use them to describe numerical relationships.",
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
          title: "Proving Polynomial Identities",
          description: "Students prove polynomial identities and use them to describe numerical relationships.",
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
              markdown: "## Explore: Polynomial Identities\n\nUse graphing technology to complete the explore.\n\n**Inquiry Question:**\nHow can you prove that two polynomial expressions form a polynomial identity?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = x^3 - 4x",
                title: "Polynomial Identities",
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
              markdown: "## Key Terms\n\n- **Identity**: An equation that is satisfied by any numbers that replace the variables\n- **Polynomial identity**: A polynomial equation that is true for any values substituted for the variables",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Proving Polynomial Identities",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Proving Polynomial Identities\n\nAn **identity** is an equation that is satisfied by any numbers that replace the variables.\n\nA **polynomial identity** is a polynomial equation that is true for any values substituted for the variables.\n\nUnlike solving an equation, do not begin by assuming that an identity is true and then perform the same operation to both sides. Instead, verify it algebraically.\n\n### Key Concept: Verifying Identities by Transforming One Side\n\n- Simplify one side of the equation until the two sides are the same\n- It is often easier to transform the more complicated side\n- Factor or multiply expressions as needed\n- Combine like terms",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "text" as const,
            content: {
              markdown: "## Talk About It\n\nIf you multiplied each side of the equation by a variable z, would the result still be a polynomial identity? Explain.",
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
              markdown: "## Example 1 — Transform One Side\n\nProve that:\n\n$$x^3 - y^3 = (x - y)(x^2 + xy + y^2)$$\n\nStart with the right side:\n\n$$(x - y)(x^2 + xy + y^2)$$\n\nDistribute:\n\n$$= x(x^2) + x(xy) + x(y^2) - y(x^2) - y(xy) - y(y^2)$$\n\nSimplify:\n\n$$= x^3 + x^2y + xy^2 - x^2y - xy^2 - y^3$$\n\nCombine like terms:\n\n$$= x^3 - y^3$$\n\nSo the right side simplifies to the left side, which proves the identity.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x^3 - y^3 = (x - y)(x^2 + xy + y^2)",
                steps: [
                  { expression: "Start with RHS: (x - y)(x² + xy + y²)", explanation: "Begin with the more complicated side" },
                  { expression: "x(x²) + x(xy) + x(y²) - y(x²) - y(xy) - y(y²)", explanation: "Distribute each term" },
                  { expression: "x³ + x²y + xy² - x²y - xy² - y³", explanation: "Simplify each product" },
                  { expression: "x³ - y³", explanation: "Combine like terms to match LHS" },
                  { expression: "RHS = LHS", explanation: "Identity is proven" },
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
              markdown: "## Example 2 — Use Polynomial Identities\n\nPedro claims that for positive integers x and y, where x > y, you can form the sides of a right triangle using:\n\n- one leg: $x^2 - y^2$\n- other leg: $2xy$\n- hypotenuse: $x^2 + y^2$\n\nTo check this, test the Pythagorean relationship:\n\n$$(x^2 - y^2)^2 + (2xy)^2 = (x^2 + y^2)^2$$\n\nExpand the left side:\n\n$$(x^2 - y^2)^2 + (2xy)^2 = x^4 - 2x^2y^2 + y^4 + 4x^2y^2 = x^4 + 2x^2y^2 + y^4$$\n\nRight side:\n\n$$(x^2 + y^2)^2 = x^4 + 2x^2y^2 + y^4$$\n\nBoth sides are equal, so the identity is true. Therefore, Pedro is correct.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(x^2 - y^2)^2 + (2xy)^2 = (x^2 + y^2)^2",
                steps: [
                  { expression: "Expand (x² - y²)²", explanation: "x⁴ - 2x²y² + y⁴" },
                  { expression: "Expand (2xy)²", explanation: "4x²y²" },
                  { expression: "LHS = x⁴ - 2x²y² + y⁴ + 4x²y²", explanation: "Add the expanded terms" },
                  { expression: "LHS = x⁴ + 2x²y² + y⁴", explanation: "Combine like terms" },
                  { expression: "Expand RHS: (x² + y²)²", explanation: "x⁴ + 2x²y² + y⁴" },
                  { expression: "LHS = RHS", explanation: "Both sides are equal; identity is true" },
                  { expression: "Pedro is correct", explanation: "The expressions form a right triangle" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. How is proving an identity different from solving an equation?\n2. Why is it often easier to transform the more complicated side of an identity?\n3. How can polynomial identities be used to describe numerical relationships?",
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
                    question: "What is the best approach to proving a polynomial identity?",
                    options: [
                      "Assume it is true and solve for variables",
                      "Transform one side until it matches the other",
                      "Graph both sides and compare",
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "Which of the following is a polynomial identity?",
                    options: [
                      "x² - y² = (x - y)(x + y)",
                      "x + 2 = 5",
                      "x² = 4",
                    ],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned how to prove polynomial identities and use them to describe numerical relationships. Consider the following:\n\n- How does transforming one side help prove an identity?\n- What strategies help you decide which side to transform?\n- What questions do you still have about proving polynomial identities?\n\n**Tip**: Polynomial identities are powerful tools for simplifying expressions and proving relationships in algebra and geometry.",
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
