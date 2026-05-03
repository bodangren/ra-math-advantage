import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_2Result> => {
    const now = Date.now();
    const lessonSlug = "7-2-counting-principle";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Counting Principle",
          slug: lessonSlug,
          description: "Students apply the fundamental counting principle to determine the number of outcomes.",
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
          title: "Counting Principle",
          description: "Students apply the fundamental counting principle to determine the number of outcomes.",
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
              markdown: "## Explore: How Many Combinations?\n\nIf you have 3 shirts and 4 pants, how many different outfits can you make? The fundamental counting principle helps us find this quickly.",
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
                    question: "3 shirts × 4 pants = how many outfits?",
                    options: ["7", "12", "3", "4"],
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
              markdown: "## Fundamental Counting Principle\n\n### Rule\nIf one event can occur in $m$ ways and a second event can occur in $n$ ways, then the total number of ways both events can occur is $m \\times n$.\n\n### Extended\nFor $k$ events with $n_1, n_2, \\ldots, n_k$ possible outcomes:\n$$\\text{Total} = n_1 \\times n_2 \\times \\cdots \\times n_k$$\n\n### Example\nA 4-digit PIN using digits 0–9: $10 \\times 10 \\times 10 \\times 10 = 10{,}000$ possible PINs.",
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
              markdown: "## Example: Restaurant Menu\n\nA restaurant offers 5 appetizers, 8 main courses, and 4 desserts. How many different 3-course meals are possible?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "counting",
                equation: "Total = 5 × 8 × 4",
                steps: [
                  { expression: "5 choices for appetizer", explanation: "First event" },
                  { expression: "8 choices for main course", explanation: "Second event" },
                  { expression: "4 choices for dessert", explanation: "Third event" },
                  { expression: "5 × 8 × 4 = 160 meals", explanation: "Multiply all choices" },
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
                    question: "A coin is flipped 3 times. How many possible outcomes?",
                    options: ["6", "8", "3", "9"],
                    correctIndex: 1,
                  },
                  {
                    question: "A license plate has 3 letters followed by 3 digits. How many plates? (26 × 26 × 26 × 10 × 10 × 10)",
                    options: ["78,000", "17,576,000", "26,000", "1,000,000"],
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
                    question: "A car comes in 6 colors, 3 engine types, and 4 interior options. Total configurations =",
                    options: ["13", "72", "24", "36"],
                    correctIndex: 1,
                  },
                  {
                    question: "A 6-character password with letters (26) and digits (10) for each position gives:",
                    options: ["36⁶", "26⁶ × 10⁶", "36 × 6", "62⁶"],
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
