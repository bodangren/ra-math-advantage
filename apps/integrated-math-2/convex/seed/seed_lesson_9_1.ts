import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_1Result> => {
    const now = Date.now();
    const lessonSlug = "9-1-solving-linear-equations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Solving Linear Equations",
          slug: lessonSlug,
          description: "Students solve one- and two-step linear equations and verify solutions.",
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
          title: "Solving Linear Equations",
          description: "Students solve one- and two-step linear equations and verify solutions.",
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
              markdown: "## Explore: Balancing Equations\n\nThink of an equation as a balance scale. Whatever you do to one side, you must do to the other.\n\nIf 2x + 5 = 13, what operations would you perform to find x?",
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
                    question: "To solve x + 7 = 12, you should:",
                    options: ["Add 7 to both sides", "Subtract 7 from both sides", "Multiply by 7", "Divide by 7"],
                    correctIndex: 1,
                  },
                  {
                    question: "To solve 3x = 15, you should:",
                    options: ["Multiply by 3", "Add 3", "Subtract 3", "Divide by 3"],
                    correctIndex: 3,
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
              markdown: "## Solving Linear Equations\n\n### Properties of Equality\n- **Addition Property**: If a = b, then a + c = b + c\n- **Subtraction Property**: If a = b, then a − c = b − c\n- **Multiplication Property**: If a = b, then ac = bc\n- **Division Property**: If a = b, then a/c = b/c\n\n### Steps\n1. Simplify both sides (distribute, combine like terms)\n2. Use inverse operations to isolate the variable\n3. Check your answer by substituting back",
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
              markdown: "## Example: Solve a Two-Step Equation\n\nSolve 4x − 7 = 21.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "linear-equation",
                equation: "4x - 7 = 21",
                steps: [
                  { expression: "4x - 7 + 7 = 21 + 7", explanation: "Add 7 to both sides" },
                  { expression: "4x = 28", explanation: "Simplify" },
                  { expression: "4x/4 = 28/4", explanation: "Divide both sides by 4" },
                  { expression: "x = 7", explanation: "Solution" },
                  { expression: "Check: 4(7) - 7 = 28 - 7 = 21 ✓", explanation: "Verify the solution" },
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "linear-equation",
                equation: "3x + 8 = 23",
                steps: [
                  { expression: "3x + 8 - 8 = 23 - 8", explanation: "Subtract 8 from both sides" },
                  { expression: "3x = 15", explanation: "Simplify" },
                  { expression: "x = 5", explanation: "Divide both sides by 3" },
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
                    question: "Solve: 5x + 3 = 28. x =",
                    options: ["5", "6", "7", "25"],
                    correctIndex: 0,
                  },
                  {
                    question: "Solve: -2x + 10 = 4. x =",
                    options: ["3", "-3", "7", "-7"],
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
