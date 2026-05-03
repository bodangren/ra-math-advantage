import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson10_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson10_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson10_1Result> => {
    const now = Date.now();
    const lessonSlug = "10-1-laws-of-exponents";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 10,
          title: "Laws of Exponents",
          slug: lessonSlug,
          description: "Students apply product, quotient, power, and zero exponent rules to simplify expressions.",
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
          title: "Laws of Exponents",
          description: "Students apply product, quotient, power, and zero exponent rules to simplify expressions.",
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
              markdown: "## Explore: Patterns in Powers\n\nCompute these values:\n- 2³ × 2⁴ = ?\n- What do you notice about the exponents?\n- 5⁷ ÷ 5³ = ?\n- (3²)⁴ = ?\n\nCan you find patterns that help you simplify without computing each power?",
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
                    question: "x³ × x⁴ simplifies to:",
                    options: ["x⁷", "x¹²", "x¹", "x⁷⁰"],
                    correctIndex: 0,
                  },
                  {
                    question: "Any nonzero number raised to the power of 0 equals:",
                    options: ["0", "1", "Itself", "Undefined"],
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
              markdown: "## Laws of Exponents\n\n### Product Rule\naᵐ × aⁿ = aᵐ⁺ⁿ\n\n### Quotient Rule\naᵐ ÷ aⁿ = aᵐ⁻ⁿ\n\n### Power Rule\n(aᵐ)ⁿ = aᵐⁿ\n\n### Zero Exponent\na⁰ = 1 (a ≠ 0)\n\n### Negative Exponent\na⁻ⁿ = 1/aⁿ\n\n### Power of a Product\n(ab)ⁿ = aⁿbⁿ",
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
              markdown: "## Example: Simplify\n\nSimplify (2x³y²)³.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "exponent-simplification",
                equation: "(2x³y²)³",
                steps: [
                  { expression: "2³ × (x³)³ × (y²)³", explanation: "Apply power of a product rule" },
                  { expression: "8 × x⁹ × y⁶", explanation: "Apply power rule to each factor" },
                  { expression: "8x⁹y⁶", explanation: "Simplified form" },
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
                    question: "Simplify: x⁵ ÷ x²",
                    options: ["x³", "x⁷", "x¹⁰", "x²·⁵"],
                    correctIndex: 0,
                  },
                  {
                    question: "Simplify: (3a²)²",
                    options: ["9a⁴", "6a⁴", "9a²", "3a⁴"],
                    correctIndex: 0,
                  },
                  {
                    question: "Simplify: 5⁻²",
                    options: ["-10", "-25", "1/25", "1/10"],
                    correctIndex: 2,
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
                    question: "Simplify: x³·x⁴/x²",
                    options: ["x⁵", "x⁹", "x", "x⁷"],
                    correctIndex: 0,
                  },
                  {
                    question: "Simplify: (2a)⁰ + 3",
                    options: ["0", "1", "3", "4"],
                    correctIndex: 3,
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
