import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_5Result> => {
    const now = Date.now();
    const lessonSlug = "9-5-systems-of-inequalities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Systems of Inequalities",
          slug: lessonSlug,
          description: "Students graph and interpret systems of linear inequalities to find feasible regions.",
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
          title: "Systems of Inequalities",
          description: "Students graph and interpret systems of linear inequalities to find feasible regions.",
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
              markdown: "## Explore: Finding Common Ground\n\nImagine two rules for a game:\n- Rule 1: y ≤ x + 2\n- Rule 2: y > −x\n\nWhere on the coordinate plane can you be while following BOTH rules at the same time?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                inequalities: ["y <= x + 2", "y > -x"],
                instructions: "Graph both inequalities and identify the overlapping region.",
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
              markdown: "## Systems of Inequalities\n\n### Steps\n1. Graph each inequality separately\n2. Use solid lines for ≤ or ≥, dashed for < or >\n3. Shade the correct side of each line\n4. The solution is where the shadings overlap\n\n### Key Concepts\n- The solution is a REGION, not a single point\n- Points in the overlap satisfy BOTH inequalities\n- The boundary lines may or may not be included",
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
              markdown: "## Example: Graph a System\n\nGraph the system:\ny ≥ 2x − 1\ny < −x + 4",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "system-of-inequalities",
                equation: "y ≥ 2x - 1 and y < -x + 4",
                steps: [
                  { expression: "y = 2x - 1: solid line, shade above", explanation: "≥ means solid line and shade up" },
                  { expression: "y = -x + 4: dashed line, shade below", explanation: "< means dashed line and shade down" },
                  { expression: "Find intersection: 2x - 1 = -x + 4", explanation: "Boundary lines cross where equations are equal" },
                  { expression: "3x = 5, x = 5/3", explanation: "Solve for x-coordinate of intersection" },
                  { expression: "Overlap region is the solution", explanation: "Where both shadings overlap" },
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
                    question: "In a system of inequalities, the solution is:",
                    options: ["A single point", "A line", "A region", "No solution always"],
                    correctIndex: 2,
                  },
                  {
                    question: "A solid boundary line means the points on the line are:",
                    options: ["Excluded", "Included", "Undefined", "Partially included"],
                    correctIndex: 1,
                  },
                  {
                    question: "To find where boundary lines cross, set the equations:",
                    options: ["Equal to each other", "Both to zero", "To negative values", "To the origin"],
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
                    question: "The system y > x and y < x has:",
                    options: ["One solution", "Infinitely many solutions", "No solution", "Two solutions"],
                    correctIndex: 2,
                  },
                  {
                    question: "If a point is in the solution region, it must satisfy:",
                    options: ["Only one inequality", "All inequalities in the system", "At least one inequality", "None of the inequalities"],
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
