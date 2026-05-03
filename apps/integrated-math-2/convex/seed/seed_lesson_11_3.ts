import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson11_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson11_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson11_3Result> => {
    const now = Date.now();
    const lessonSlug = "11-3-multiplying-polynomials";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 11,
          title: "Multiplying Polynomials",
          slug: lessonSlug,
          description: "Students multiply polynomials using the distributive property and FOIL method.",
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
          title: "Multiplying Polynomials",
          description: "Students multiply polynomials using the distributive property and FOIL method.",
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
              markdown: "## Explore: Distributing Across\n\nRemember: a(b + c) = ab + ac.\n\nWhat happens when we multiply (x + 2)(x + 3)? We need to distribute each term in the first parenthesis to each term in the second.",
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
                    question: "x(x + 4) =",
                    options: ["x² + 4", "x² + 4x", "2x + 4", "x + 4x"],
                    correctIndex: 1,
                  },
                  {
                    question: "FOIL stands for:",
                    options: ["First, Outer, Inner, Last", "First, Outside, Inside, Left", "Front, Outer, Inner, Last", "First, Outer, Inner, Least"],
                    correctIndex: 0,
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
              markdown: "## Multiplying Polynomials\n\n### Distributive Property\nEvery term in the first polynomial multiplies every term in the second.\n\n### FOIL Method (for binomials)\n(a + b)(c + d):\n- **F**irst: a × c\n- **O**uter: a × d\n- **I**nner: b × c\n- **L**ast: b × d\n\n### General Multiplication\nFor larger polynomials, use a table or systematic distribution.\n\n### Add Exponents\nWhen multiplying like bases: xᵃ × xᵇ = xᵃ⁺ᵇ",
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
              markdown: "## Example: Multiply Using FOIL\n\nMultiply (x + 5)(x − 3).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial-multiplication",
                equation: "(x + 5)(x - 3)",
                steps: [
                  { expression: "F: x · x = x²", explanation: "First terms" },
                  { expression: "O: x · (-3) = -3x", explanation: "Outer terms" },
                  { expression: "I: 5 · x = 5x", explanation: "Inner terms" },
                  { expression: "L: 5 · (-3) = -15", explanation: "Last terms" },
                  { expression: "x² - 3x + 5x - 15", explanation: "Combine all products" },
                  { expression: "x² + 2x - 15", explanation: "Combine like terms" },
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
                    question: "(x + 3)(x + 4) =",
                    options: ["x² + 7x + 12", "x² + 12x + 7", "x² + 7x + 7", "x² + 12"],
                    correctIndex: 0,
                  },
                  {
                    question: "(2x + 1)(x − 5) =",
                    options: ["2x² - 9x - 5", "2x² - 10x - 5", "2x² + 9x - 5", "2x² - 9x + 5"],
                    correctIndex: 0,
                  },
                  {
                    question: "(x − 2)(x − 2) =",
                    options: ["x² - 4", "x² - 4x + 4", "x² + 4x + 4", "x² - 2x + 4"],
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
                    question: "(3x − 1)(2x + 4) =",
                    options: ["6x² + 10x - 4", "6x² + 12x - 4", "6x² - 10x + 4", "5x² + 10x - 4"],
                    correctIndex: 0,
                  },
                  {
                    question: "(x + 1)(x² + x + 1) =",
                    options: ["x³ + 2x² + 2x + 1", "x³ + x² + x + 1", "x³ + 2x² + x + 1", "x² + 2x + 2"],
                    correctIndex: 0,
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
