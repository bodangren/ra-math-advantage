import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson10_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson10_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson10_2Result> => {
    const now = Date.now();
    const lessonSlug = "10-2-negative-rational-exponents";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 10,
          title: "Negative and Rational Exponents",
          slug: lessonSlug,
          description: "Students evaluate and simplify expressions with negative and rational (fractional) exponents.",
          orderIndex: 2,
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
          title: "Negative and Rational Exponents",
          description: "Students evaluate and simplify expressions with negative and rational (fractional) exponents.",
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
              markdown: "## Explore: Beyond Whole Numbers\n\nWe know 2³ = 8. But what does 8¹ᐟ³ mean?\n\nConsider: If (8¹ᐟ³)³ = 8¹ = 8, then 8¹ᐟ³ must be the number that, when cubed, gives 8. What is that number?",
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
                    question: "16¹ᐟ² equals:",
                    options: ["8", "4", "32", "256"],
                    correctIndex: 1,
                  },
                  {
                    question: "2⁻³ equals:",
                    options: ["-8", "-6", "1/8", "1/6"],
                    correctIndex: 2,
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
              markdown: "## Negative and Rational Exponents\n\n### Negative Exponents\na⁻ⁿ = 1/aⁿ\n\nExample: 2⁻³ = 1/2³ = 1/8\n\n### Rational Exponents\na¹ᐟⁿ = ⁿ√a (the nth root of a)\naᵐᐟⁿ = (ⁿ√a)ᵐ = ⁿ√(aᵐ)\n\nExample: 8²ᐟ³ = (∛8)² = 2² = 4\n\n### Key Idea\nA fractional exponent is a root. The denominator is the root, the numerator is the power.",
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
              markdown: "## Example: Simplify\n\nSimplify 27²ᐟ³.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "rational-exponent",
                equation: "27^(2/3)",
                steps: [
                  { expression: "27²ᐟ³ = (∛27)²", explanation: "Rewrite: denominator is the root" },
                  { expression: "∛27 = 3", explanation: "The cube root of 27 is 3" },
                  { expression: "3² = 9", explanation: "Apply the numerator as power" },
                  { expression: "27²ᐟ³ = 9", explanation: "Final answer" },
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
                    question: "Simplify: 4⁻²",
                    options: ["-8", "1/16", "1/8", "16"],
                    correctIndex: 1,
                  },
                  {
                    question: "Simplify: 32²ᐟ⁵",
                    options: ["4", "8", "64", "16"],
                    correctIndex: 0,
                  },
                  {
                    question: "x¹ᐟ⁴ is the same as:",
                    options: ["x⁴", "⁴√x", "x/4", "4x"],
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
                    question: "Simplify: 64¹ᐟ³",
                    options: ["2", "4", "8", "21.3"],
                    correctIndex: 1,
                  },
                  {
                    question: "Simplify: (1/4)⁻¹",
                    options: ["-1/4", "1/4", "4", "-4"],
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
