import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson10_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson10_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson10_5Result> => {
    const now = Date.now();
    const lessonSlug = "10-5-solving-radical-equations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 10,
          title: "Solving Radical Equations",
          slug: lessonSlug,
          description: "Students solve equations containing square roots and other radicals by isolating and squaring.",
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
          title: "Solving Radical Equations",
          description: "Students solve equations containing square roots and other radicals by isolating and squaring.",
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
              markdown: "## Explore: Undoing the Root\n\nIf √x = 5, then x = 25 because √25 = 5.\n\nBut what about √(x + 3) = 5? How does the presence of x + 3 under the radical change our approach?",
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
                    question: "To solve √x = 7, you should:",
                    options: ["Divide by √x", "Square both sides", "Take the square root again", "Subtract 7"],
                    correctIndex: 1,
                  },
                  {
                    question: "If √x = -3, how many real solutions exist?",
                    options: ["One", "Two", "Zero", "Infinitely many"],
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
              markdown: "## Solving Radical Equations\n\n### Steps\n1. Isolate the radical on one side\n2. Square both sides (or raise to appropriate power)\n3. Solve the resulting equation\n4. **CHECK for extraneous solutions** by substituting back\n\n### Why Check?\nSquaring both sides can introduce solutions that don't work in the original equation. These are called **extraneous solutions**.\n\n### Example\n√(x + 1) = x − 1\nSquare: x + 1 = x² − 2x + 1\nSolve: x² − 3x = 0, so x = 0 or x = 3\nCheck: x = 0 gives √1 = −1 ✗; x = 3 gives √4 = 2 ✓",
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
              markdown: "## Example: Solve a Radical Equation\n\nSolve √(2x + 3) = 7.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "radical-equation",
                equation: "√(2x + 3) = 7",
                steps: [
                  { expression: "√(2x + 3) = 7", explanation: "Radical is already isolated" },
                  { expression: "2x + 3 = 49", explanation: "Square both sides" },
                  { expression: "2x = 46", explanation: "Subtract 3" },
                  { expression: "x = 23", explanation: "Divide by 2" },
                  { expression: "Check: √(2(23) + 3) = √49 = 7 ✓", explanation: "Verify solution" },
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
                problemType: "radical-equation",
                equation: "√(x - 5) + 2 = 6",
                steps: [
                  { expression: "√(x - 5) = 4", explanation: "Isolate the radical" },
                  { expression: "x - 5 = 16", explanation: "Square both sides" },
                  { expression: "x = 21", explanation: "Add 5" },
                  { expression: "Check: √(21-5) + 2 = √16 + 2 = 4 + 2 = 6 ✓", explanation: "Verify" },
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
                    question: "Solve: √(3x) = 6",
                    options: ["x = 2", "x = 12", "x = 18", "x = 36"],
                    correctIndex: 1,
                  },
                  {
                    question: "An extraneous solution is one that:",
                    options: ["Is too hard to find", "Does not satisfy the original equation", "Is always negative", "Makes the equation undefined"],
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
