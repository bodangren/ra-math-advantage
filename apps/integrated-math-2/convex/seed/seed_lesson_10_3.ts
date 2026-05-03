import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson10_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson10_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson10_3Result> => {
    const now = Date.now();
    const lessonSlug = "10-3-scientific-notation";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 10,
          title: "Scientific Notation",
          slug: lessonSlug,
          description: "Students convert between standard form and scientific notation and perform operations with scientific notation.",
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
          title: "Scientific Notation",
          description: "Students convert between standard form and scientific notation and perform operations with scientific notation.",
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
              markdown: "## Explore: Very Big and Very Small\n\nThe distance from Earth to the Sun is about 93,000,000 miles.\nThe mass of an electron is about 0.0000000000000000000000000000000911 kg.\n\nWriting these numbers is tedious. Is there a shorter way to express them?",
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
                    question: "Scientific notation has the form:",
                    options: ["a × 10ⁿ where 1 ≤ |a| < 10", "a + 10ⁿ", "a × n¹⁰", "aⁿ × 10"],
                    correctIndex: 0,
                  },
                  {
                    question: "5,000 in scientific notation is:",
                    options: ["5 × 10²", "5 × 10³", "5 × 10⁴", "0.5 × 10⁴"],
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
              markdown: "## Scientific Notation\n\n### Format\na × 10ⁿ where 1 ≤ |a| < 10 and n is an integer\n\n### Converting to Scientific Notation\n- Move the decimal point until 1 ≤ |a| < 10\n- Count places moved: that is n\n- Large numbers: n is positive\n- Small numbers: n is negative\n\n### Operations\n- **Multiply**: (a × 10ᵐ)(b × 10ⁿ) = (ab) × 10ᵐ⁺ⁿ\n- **Divide**: (a × 10ᵐ)/(b × 10ⁿ) = (a/b) × 10ᵐ⁻ⁿ\n- **Add/Subtract**: Same power of 10 required",
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
              markdown: "## Example: Multiply in Scientific Notation\n\nCompute (3 × 10⁴)(2 × 10⁶).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "scientific-notation",
                equation: "(3 × 10⁴)(2 × 10⁶)",
                steps: [
                  { expression: "3 × 2 = 6", explanation: "Multiply the coefficients" },
                  { expression: "10⁴ × 10⁶ = 10¹⁰", explanation: "Add the exponents" },
                  { expression: "6 × 10¹⁰", explanation: "Combine" },
                  { expression: "Answer: 6 × 10¹⁰", explanation: "Already in scientific notation" },
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
                    question: "Convert 0.00045 to scientific notation:",
                    options: ["4.5 × 10⁴", "4.5 × 10⁻⁴", "4.5 × 10⁻³", "45 × 10⁻⁵"],
                    correctIndex: 1,
                  },
                  {
                    question: "(4 × 10³)(5 × 10²) =",
                    options: ["20 × 10⁵", "2 × 10⁶", "Both A and B", "9 × 10⁵"],
                    correctIndex: 2,
                  },
                  {
                    question: "78,000,000 in scientific notation is:",
                    options: ["7.8 × 10⁶", "7.8 × 10⁷", "78 × 10⁶", "0.78 × 10⁸"],
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
                    question: "(6 × 10⁸) ÷ (2 × 10³) =",
                    options: ["3 × 10⁵", "3 × 10¹¹", "3 × 10⁴", "12 × 10⁵"],
                    correctIndex: 0,
                  },
                  {
                    question: "0.0000072 in scientific notation is:",
                    options: ["7.2 × 10⁻⁵", "7.2 × 10⁻⁶", "72 × 10⁻⁷", "7.2 × 10⁶"],
                    correctIndex: 1,
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
