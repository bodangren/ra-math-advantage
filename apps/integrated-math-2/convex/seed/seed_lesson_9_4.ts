import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_4Result> => {
    const now = Date.now();
    const lessonSlug = "9-4-systems-of-equations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Systems of Equations",
          slug: lessonSlug,
          description: "Students solve systems of linear equations using graphing, substitution, and elimination methods.",
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
          title: "Systems of Equations",
          description: "Students solve systems of linear equations using graphing, substitution, and elimination methods.",
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
              markdown: "## Explore: Where Do Lines Meet?\n\nTwo hikers start from different locations. Hiker A follows y = x + 1 and Hiker B follows y = −x + 5.\n\nWhere will they meet? What does the meeting point represent?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                equations: ["x + 1", "-x + 5"],
                instructions: "Find where the two lines intersect.",
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
              markdown: "## Systems of Equations\n\n### Three Methods\n1. **Graphing**: Find the intersection point\n2. **Substitution**: Solve one equation for a variable, substitute into the other\n3. **Elimination**: Add/subtract equations to eliminate a variable\n\n### Types of Solutions\n- **One solution**: Lines intersect at one point\n- **No solution**: Lines are parallel\n- **Infinitely many solutions**: Lines are the same",
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
              markdown: "## Example: Solve by Substitution\n\nSolve the system:\ny = 2x + 1\n3x + y = 11",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "system-of-equations",
                equation: "y = 2x + 1 and 3x + y = 11",
                steps: [
                  { expression: "3x + (2x + 1) = 11", explanation: "Substitute y = 2x + 1 into second equation" },
                  { expression: "5x + 1 = 11", explanation: "Combine like terms" },
                  { expression: "5x = 10, x = 2", explanation: "Solve for x" },
                  { expression: "y = 2(2) + 1 = 5", explanation: "Substitute back to find y" },
                  { expression: "Solution: (2, 5)", explanation: "The intersection point" },
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
                problemType: "system-of-equations",
                equation: "x + y = 7 and x - y = 3",
                steps: [
                  { expression: "(x + y) + (x - y) = 7 + 3", explanation: "Add the two equations" },
                  { expression: "2x = 10, x = 5", explanation: "Solve for x" },
                  { expression: "5 + y = 7, y = 2", explanation: "Substitute to find y" },
                  { expression: "Solution: (5, 2)", explanation: "Verify in both equations" },
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
                    question: "A system with no solution has lines that are:",
                    options: ["Perpendicular", "Parallel", "The same line", "Intersecting"],
                    correctIndex: 1,
                  },
                  {
                    question: "If y = 3x and x + y = 8, then x =",
                    options: ["1", "2", "3", "4"],
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
