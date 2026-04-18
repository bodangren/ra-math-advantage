import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-2-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Powers of Binomials",
          slug: lessonSlug,
          description: "Students expand powers of binomials using Pascal's Triangle and the Binomial Theorem.",
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
          title: "Powers of Binomials",
          description: "Students expand powers of binomials using Pascal's Triangle and the Binomial Theorem.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = x^2",
                title: "Explore Powers of Binomials",
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
              markdown: "## Key Terms\n\n- **Pascal's Triangle**: A triangle of numbers where each row gives the coefficients of an expanded binomial $(a + b)^n$\n- **Binomial Theorem**: $(a + b)^n = nC0 \\cdot a^n b^0 + nC1 \\cdot a^{n-1} b^1 + ... + nCn \\cdot a^0 b^n$\n\n### Key Concept: Pascal's Triangle Properties\n\n- Each row begins and ends with $1$\n- Each interior number is the sum of the two numbers above it\n- The $n$-th row has $n + 1$ terms",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Powers of Binomials",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Powers of Binomials\n\nYou can expand binomials by following patterns and rules.\n\n### Key Concept: Binomial Expansion\n\nIn the binomial expansion of $(a + b)^n$:\n\n- There are $n + 1$ terms\n- The exponents of $a$ decrease by $1$ each term\n- The exponents of $b$ increase by $1$ each term\n- The sum of exponents in each term is $n$\n- The coefficients are symmetric\n\nPascal's Triangle provides these coefficients, or you can use the Binomial Theorem directly.",
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
              markdown: "## Example 1: Use Pascal's Triangle\n\nUse Pascal's triangle to expand $(x + y)^7$.\n\nRow 7 of Pascal's triangle: $1 \\; 7 \\; 21 \\; 35 \\; 35 \\; 21 \\; 7 \\; 1$\n\nSo:\n\n$(x + y)^7 = x^7 + 7x^6y + 21x^5y^2 + 35x^4y^3 + 35x^3y^4 + 21x^2y^5 + 7xy^6 + y^7$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(x + y)^7",
                steps: [
                  { expression: "Row 7 of Pascal's triangle: 1, 7, 21, 35, 35, 21, 7, 1", explanation: "Get coefficients" },
                  { expression: "x^7", explanation: "First term: x^7 y^0" },
                  { expression: "7x^6y", explanation: "Second term: 7x^6 y^1" },
                  { expression: "21x^5y^2", explanation: "Third term: 21x^5 y^2" },
                  { expression: "35x^4y^3", explanation: "Fourth term" },
                  { expression: "35x^3y^4", explanation: "Fifth term" },
                  { expression: "21x^2y^5", explanation: "Sixth term" },
                  { expression: "7xy^6", explanation: "Seventh term" },
                  { expression: "y^7", explanation: "Last term: x^0 y^7" },
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
              markdown: "## Example 2: Use the Binomial Theorem\n\nA baseball team wins 6 games, winning 3 and losing 3. If equally likely to win or lose, find the probability of exactly 3 wins by expanding $(w + l)^6$.\n\n$(w + l)^6 = 6C0 w^6 + 6C1 w^5l + 6C2 w^4l^2 + 6C3 w^3l^3 + 6C4 w^2l^4 + 6C5 wl^5 + 6C6 l^6$\n\n$= w^6 + 6w^5l + 15w^4l^2 + 20w^3l^3 + 15w^2l^4 + 6wl^5 + l^6$\n\nThe term $20w^3l^3$ represents exactly 3 wins.\n\nTotal combinations: $1 + 6 + 15 + 20 + 15 + 6 + 1 = 64$\n\nProbability of 3 wins: $20/64 = 5/16 \\approx 31.25\\%$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(w + l)^6",
                steps: [
                  { expression: "6C0 = 1, 6C1 = 6, 6C2 = 15, 6C3 = 20", explanation: "Calculate binomial coefficients" },
                  { expression: "6C4 = 15, 6C5 = 6, 6C6 = 1", explanation: "Complete coefficients" },
                  { expression: "w^6 + 6w^5l + 15w^4l^2", explanation: "First three terms" },
                  { expression: "20w^3l^3 + 15w^2l^4 + 6wl^5 + l^6", explanation: "Remaining terms" },
                  { expression: "1 + 6 + 15 + 20 + 15 + 6 + 1 = 64", explanation: "Total combinations" },
                  { expression: "20/64 = 5/16", explanation: "Probability of 3 wins" },
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
              markdown: "## Example 3: Coefficients Other Than 1\n\nExpand: $(2c - 6d)^4$\n\nUse the Binomial Theorem:\n\n$= 4C0(2c)^4 + 4C1(2c)^3(-6d) + 4C2(2c)^2(-6d)^2 + 4C3(2c)(-6d)^3 + 4C4(-6d)^4$\n\n$= 1(16c^4) + 4(8c^3)(-6d) + 6(4c^2)(36d^2) + 4(2c)(-216d^3) + 1(1296d^4)$\n\n$= 16c^4 - 192c^3d + 864c^2d^2 - 1728cd^3 + 1296d^4$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "(2c - 6d)^4",
                steps: [
                  { expression: "4C0 = 1, 4C1 = 4, 4C2 = 6, 4C3 = 4, 4C4 = 1", explanation: "Binomial coefficients" },
                  { expression: "(2c)^4 = 16c^4", explanation: "First term" },
                  { expression: "4(2c)^3(-6d) = 4(8c^3)(-6d) = -192c^3d", explanation: "Second term" },
                  { expression: "6(2c)^2(-6d)^2 = 6(4c^2)(36d^2) = 864c^2d^2", explanation: "Third term" },
                  { expression: "4(2c)(-6d)^3 = 4(2c)(-216d^3) = -1728cd^3", explanation: "Fourth term" },
                  { expression: "(-6d)^4 = 1296d^4", explanation: "Fifth term" },
                  { expression: "16c^4 - 192c^3d + 864c^2d^2 - 1728cd^3 + 1296d^4", explanation: "Combine terms" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. Why do both $nC0$ and $nCn$ equal $1$ in the Binomial Theorem?\n2. How does Pascal's Triangle relate to the Binomial Theorem?\n3. When the binomial has coefficients other than $1$, why might the Binomial Theorem be easier than Pascal's Triangle?",
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
                    question: "In Pascal's Triangle, each interior number is the sum of:",
                    options: [
                      "The two numbers directly above it",
                      "All numbers in the previous row",
                      "The two numbers below it",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "The expansion of $(a + b)^n$ has how many terms?",
                    options: ["n", "n + 1", "2n"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned about expanding powers of binomials using Pascal's Triangle and the Binomial Theorem.\n\n- Which method do you prefer for expanding binomials: Pascal's Triangle or the Binomial Theorem? Why?\n- How can you verify that your expansion is correct?\n\n**Tip**: You can check your work by substituting simple values like $x = 1, y = 1$ to verify the sum of coefficients equals $2^n$.",
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