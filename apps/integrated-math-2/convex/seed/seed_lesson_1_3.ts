import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_3Result> => {
    const now = Date.now();
    const lessonSlug = "1-3-triangle-inequality-theorem";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Triangle Inequality Theorem",
          slug: lessonSlug,
          description: "Students apply the Triangle Inequality Theorem to determine if side lengths can form a triangle.",
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
          title: "Triangle Inequality Theorem",
          description: "Students apply the Triangle Inequality Theorem to determine if side lengths can form a triangle.",
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
              markdown: "## Explore: Can You Build a Triangle?\n\nTry to build a triangle with these side lengths:\n1. 3, 4, 5\n2. 1, 2, 5\n3. 2, 3, 4\n\nWhich sets work and which don't? What rule determines whether three lengths can form a triangle?",
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
                    question: "Can sides of length 2, 3, and 6 form a triangle?",
                    options: ["Yes", "No", "Not enough information"],
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
              markdown: "## Triangle Inequality Theorem\n\nThe sum of the lengths of any two sides of a triangle must be **greater than** the length of the third side.\n\nFor sides $a$, $b$, and $c$:\n- $a + b > c$\n- $a + c > b$\n- $b + c > a$\n\n### Quick Check\nIf you order the sides so that $a \\leq b \\leq c$, you only need to verify $a + b > c$.\n\n### Example\nCan sides 4, 7, 10 form a triangle?\n- $4 + 7 = 11 > 10$ ✓\n- $4 + 10 = 14 > 7$ ✓\n- $7 + 10 = 17 > 4$ ✓\nYes, these sides can form a triangle.",
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
              markdown: "## Example: Find the Range of Possible Third Side Lengths\n\nTwo sides of a triangle are 5 and 9. Find the range of possible lengths for the third side.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "inequality",
                equation: "Find range of third side x given sides 5 and 9",
                steps: [
                  { expression: "5 + 9 > x", explanation: "Sum of known sides > third side" },
                  { expression: "14 > x, so x < 14", explanation: "Upper bound" },
                  { expression: "x + 5 > 9", explanation: "Third side plus smaller > larger" },
                  { expression: "x > 4", explanation: "Lower bound" },
                  { expression: "4 < x < 14", explanation: "Range of possible lengths" },
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
                    question: "Can sides 8, 15, and 20 form a triangle?",
                    options: ["Yes", "No"],
                    correctIndex: 0,
                  },
                  {
                    question: "Two sides are 6 and 11. Which could be the third side?",
                    options: ["4", "5", "17", "18"],
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
                    question: "Two sides of a triangle are 3 and 10. What is the range for the third side?",
                    options: ["7 < x < 13", "3 < x < 10", "7 < x < 10", "3 < x < 13"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which set of lengths CANNOT form a triangle?",
                    options: ["3, 4, 5", "5, 12, 13", "1, 2, 4", "7, 24, 25"],
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
