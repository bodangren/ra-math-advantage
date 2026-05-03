import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson11_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson11_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson11_1Result> => {
    const now = Date.now();
    const lessonSlug = "11-1-polynomial-vocabulary";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 11,
          title: "Polynomial Vocabulary",
          slug: lessonSlug,
          description: "Students identify terms, coefficients, degrees, and classify polynomials.",
          orderIndex: 1,
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
          title: "Polynomial Vocabulary",
          description: "Students identify terms, coefficients, degrees, and classify polynomials.",
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
              markdown: "## Explore: Building Blocks\n\nLook at the expression 3x⁴ − 2x² + 7x − 5.\n\nHow many parts (terms) does it have? What is the highest power of x? What is the number in front of each x called?",
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
                    question: "In 4x³, the coefficient is:",
                    options: ["3", "4", "x", "4x"],
                    correctIndex: 1,
                  },
                  {
                    question: "The degree of 5x² + 3x − 1 is:",
                    options: ["1", "2", "3", "5"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Polynomial Vocabulary\n\n### Key Terms\n- **Term**: A product of a number and variables (e.g., 3x²)\n- **Coefficient**: The numerical factor (e.g., 3 in 3x²)\n- **Variable**: The letter (e.g., x)\n- **Exponent**: The power (e.g., 2 in x²)\n- **Degree of a term**: The sum of exponents of variables\n- **Degree of a polynomial**: The highest degree of any term\n- **Leading coefficient**: Coefficient of the highest-degree term\n\n### Classifications by Number of Terms\n- **Monomial**: 1 term (e.g., 5x³)\n- **Binomial**: 2 terms (e.g., x² + 3)\n- **Trinomial**: 3 terms (e.g., x² + 2x + 1)\n- **Polynomial**: 1 or more terms",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Worked Example",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example: Analyze a Polynomial\n\nIdentify all parts of 4x³ − 2x² + x − 9.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial-analysis",
                equation: "4x³ - 2x² + x - 9",
                steps: [
                  { expression: "Terms: 4x³, -2x², x, -9", explanation: "Separate by + and - signs" },
                  { expression: "Coefficients: 4, -2, 1, -9", explanation: "Numerical parts of each term" },
                  { expression: "Degrees of terms: 3, 2, 1, 0", explanation: "Exponent of x in each term" },
                  { expression: "Degree of polynomial: 3", explanation: "Highest degree of any term" },
                  { expression: "Leading coefficient: 4", explanation: "Coefficient of x³" },
                  { expression: "Classification: 4 terms → polynomial", explanation: "More than 3 terms" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Guided Practice",
        phaseType: "guided_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "7x² − 3x is a:",
                    options: ["Monomial", "Binomial", "Trinomial", "Polynomial of 4 terms"],
                    correctIndex: 1,
                  },
                  {
                    question: "The degree of 6x⁵ + x³ − 2 is:",
                    options: ["6", "5", "3", "8"],
                    correctIndex: 1,
                  },
                  {
                    question: "The leading coefficient of 2x⁴ − 5x + 1 is:",
                    options: ["4", "2", "5", "1"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "Classify −3x³ + 5x² − 2x + 8:",
                    options: ["Monomial", "Binomial", "Trinomial", "Polynomial (4 terms)"],
                    correctIndex: 3,
                  },
                  {
                    question: "The constant term in 4x² + 3x − 7 is:",
                    options: ["4", "3", "-7", "0"],
                    correctIndex: 2,
                  },
                ],
              },
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
