import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_5Result> => {
    const now = Date.now();
    const lessonSlug = "7-5-compound-probability";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Compound Probability",
          slug: lessonSlug,
          description: "Students calculate probabilities of compound events using addition and multiplication rules.",
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
          title: "Compound Probability",
          description: "Students calculate probabilities of compound events using addition and multiplication rules.",
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
              markdown: "## Explore: Combining Events\n\nWhat is the probability of rolling a 3 OR drawing a heart? What about flipping heads AND rolling a 6? These are compound events.",
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
                    question: "Two events are independent if:",
                    options: ["They can't happen together", "One affects the other", "One does not affect the other", "They are mutually exclusive"],
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
              markdown: "## Compound Probability Rules\n\n### AND (Independent Events)\n$$P(A \\text{ and } B) = P(A) \\times P(B)$$\n\n### OR (Addition Rule)\n$$P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$$\n\n### Mutually Exclusive Events\nIf A and B cannot happen simultaneously:\n$$P(A \\text{ or } B) = P(A) + P(B)$$\n\n### Conditional Probability\n$$P(A|B) = \\frac{P(A \\text{ and } B)}{P(B)}$$",
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
              markdown: "## Example: AND Probability\n\nWhat is the probability of flipping heads AND rolling a 4 on a die?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "compound_probability",
                equation: "P(H and 4) = P(H) × P(4)",
                steps: [
                  { expression: "P(H) = 1/2", explanation: "Probability of heads" },
                  { expression: "P(4) = 1/6", explanation: "Probability of rolling 4" },
                  { expression: "P(H and 4) = 1/2 × 1/6 = 1/12", explanation: "Multiply (independent events)" },
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
                    question: "P(A) = 0.4, P(B) = 0.3, mutually exclusive. P(A or B) =",
                    options: ["0.12", "0.7", "0.58", "0.1"],
                    correctIndex: 1,
                  },
                  {
                    question: "P(red) = 1/2, P(ace) = 1/13 (from cards). P(red ace) = 2/52 = 1/26. P(red or ace) = 1/2 + 1/13 - 1/26 =",
                    options: ["7/13", "8/13", "15/26", "1/2"],
                    correctIndex: 0,
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
                    question: "Two dice are rolled. P(sum = 7) has 6 favorable outcomes out of 36. P(sum = 7) =",
                    options: ["1/6", "7/36", "1/12", "1/7"],
                    correctIndex: 0,
                  },
                  {
                    question: "A coin is flipped 3 times. P(all heads) =",
                    options: ["1/2", "1/4", "1/6", "1/8"],
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
