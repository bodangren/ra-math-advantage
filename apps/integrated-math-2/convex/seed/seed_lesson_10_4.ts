import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson10_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson10_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson10_4Result> => {
    const now = Date.now();
    const lessonSlug = "10-4-radical-expressions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 10,
          title: "Radical Expressions",
          slug: lessonSlug,
          description: "Students simplify, add, subtract, multiply, and divide radical expressions.",
          orderIndex: 4,
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
          title: "Radical Expressions",
          description: "Students simplify, add, subtract, multiply, and divide radical expressions.",
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
              markdown: "## Explore: Unwrapping Square Roots\n\nConsider √50. It is not a perfect square, but can we simplify it?\n\nThink: 50 = 25 × 2, and √25 = 5. Can you use this to write √50 in a simpler form?",
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
                    question: "√(a × b) equals:",
                    options: ["√a × √b", "√a + √b", "a × √b", "√a × b"],
                    correctIndex: 0,
                  },
                  {
                    question: "√72 can be factored as √(36 × 2). Simplified it is:",
                    options: ["6√2", "36√2", "√36 + √2", "12√2"],
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
              markdown: "## Radical Expressions\n\n### Product Rule\n√(ab) = √a × √b\n\n### Quotient Rule\n√(a/b) = √a / √b\n\n### Simplifying Radicals\n1. Factor the radicand into perfect squares and other factors\n2. Pull out perfect squares\n3. Simplify\n\n### Like Radicals\nCan add/subtract: 3√2 + 5√2 = 8√2\nCannot add: 3√2 + 5√3 (different radicands)\n\n### Rationalizing the Denominator\nMultiply numerator and denominator by the radical in the denominator",
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
              markdown: "## Example: Simplify a Radical\n\nSimplify √(48).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "radical-simplification",
                equation: "√48",
                steps: [
                  { expression: "48 = 16 × 3", explanation: "Find largest perfect square factor" },
                  { expression: "√48 = √(16 × 3)", explanation: "Rewrite using factorization" },
                  { expression: "= √16 × √3", explanation: "Apply product rule" },
                  { expression: "= 4√3", explanation: "Simplify √16 = 4" },
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
                    question: "Simplify: √(75)",
                    options: ["5√3", "25√3", "3√25", "√75"],
                    correctIndex: 0,
                  },
                  {
                    question: "Simplify: 2√3 + 4√3",
                    options: ["6√3", "6√6", "8√3", "24√3"],
                    correctIndex: 0,
                  },
                  {
                    question: "Rationalize: 1/√5",
                    options: ["√5/5", "5/√5", "1/5", "√5"],
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
                    question: "Simplify: √(200)",
                    options: ["10√2", "20√2", "2√10", "100√2"],
                    correctIndex: 0,
                  },
                  {
                    question: "Can 3√2 + 2√3 be simplified further?",
                    options: ["Yes, it equals 5√5", "Yes, it equals 6√6", "No, radicands differ", "Yes, it equals √12"],
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
