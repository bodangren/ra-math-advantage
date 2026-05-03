import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_6Result> => {
    const now = Date.now();
    const lessonSlug = "7-6-fair-decisions-expected-value";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Fair Decisions and Expected Value",
          slug: lessonSlug,
          description: "Students use expected value to analyze fair games and decision-making.",
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
          title: "Fair Decisions and Expected Value",
          description: "Students use expected value to analyze fair games and decision-making.",
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
              markdown: "## Explore: Is the Game Fair?\n\nA game costs $2 to play. You flip a coin: heads wins $3, tails wins nothing. Is this game fair? Expected value helps us decide.",
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
                    question: "If you play the game 100 times, you'd expect to win about how much total?",
                    options: ["$0", "$50", "$100", "$150"],
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
              markdown: "## Expected Value\n\n### Formula\n$$E(X) = \\sum x_i \\cdot P(x_i)$$\n\nMultiply each outcome by its probability and sum the products.\n\n### Fair Game\nA game is **fair** if the expected value equals zero (or equals the cost of playing).\n\n### Decision Making\n- Positive expected value: favorable (on average, you gain)\n- Negative expected value: unfavorable (on average, you lose)\n- Zero expected value: fair\n\n### Example\nFlip a coin: heads = +$1, tails = -$1\n$E = (1)(0.5) + (-1)(0.5) = 0$ → Fair game",
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
              markdown: "## Example: Expected Value of a Raffle\n\nA raffle ticket costs $5. There is 1 prize of $500 among 200 tickets. What is the expected value of buying one ticket?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "expected_value",
                equation: "E = (495)(1/200) + (-5)(199/200)",
                steps: [
                  { expression: "P(win) = 1/200, P(lose) = 199/200", explanation: "Probabilities" },
                  { expression: "Win amount = $500 - $5 = $495", explanation: "Net gain if you win" },
                  { expression: "Lose amount = -$5", explanation: "Net loss if you lose" },
                  { expression: "E = (495)(1/200) + (-5)(199/200)", explanation: "Expected value formula" },
                  { expression: "E = 2.475 + (-4.975) = -$2.50", explanation: "On average, you lose $2.50" },
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
                    question: "Roll a die: 6 wins $10, anything else loses $1. E = (10)(1/6) + (-1)(5/6) =",
                    options: ["$0", "$0.83", "$1.50", "-$0.83"],
                    correctIndex: 1,
                  },
                  {
                    question: "A fair game has expected value:",
                    options: ["Positive", "Negative", "Zero", "One"],
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
                    question: "A spinner has 4 equal sections: $2, $0, $0, -$1. Expected value =",
                    options: ["$0.25", "$0.50", "$0", "$1"],
                    correctIndex: 0,
                  },
                  {
                    question: "If expected value is -$3 for a $10 game, the game is:",
                    options: ["Fair", "Favorable to the player", "Unfavorable to the player", "Impossible"],
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
