import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_3Result> => {
    const now = Date.now();
    const lessonSlug = "9-3-linear-inequalities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Linear Inequalities",
          slug: lessonSlug,
          description: "Students solve and graph linear inequalities on a number line and coordinate plane.",
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
          title: "Linear Inequalities",
          description: "Students solve and graph linear inequalities on a number line and coordinate plane.",
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
              markdown: "## Explore: More Than One Answer\n\nThe equation x = 5 has exactly one solution. But what about x > 5?\n\nList five numbers that satisfy x > 5. How many solutions are there total?",
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
                    question: "How many solutions does x < 10 have?",
                    options: ["One", "Ten", "Infinitely many", "Zero"],
                    correctIndex: 2,
                  },
                  {
                    question: "When you multiply both sides of an inequality by a negative number, you must:",
                    options: ["Add the negative", "Flip the inequality sign", "Do nothing special", "Multiply again"],
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
              markdown: "## Linear Inequalities\n\n### Solving\nSolve like equations, but:\n- When multiplying or dividing by a negative, FLIP the inequality sign\n\n### Graphing on a Number Line\n- < or >: open circle (○)\n- ≤ or ≥: closed circle (●)\n\n### Graphing on a Coordinate Plane\n- y < mx + b: dashed line, shade below\n- y > mx + b: dashed line, shade above\n- y ≤ mx + b: solid line, shade below\n- y ≥ mx + b: solid line, shade above",
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
              markdown: "## Example: Solve and Graph\n\nSolve −3x + 6 > 15 and graph on a number line.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "inequality",
                equation: "-3x + 6 > 15",
                steps: [
                  { expression: "-3x + 6 - 6 > 15 - 6", explanation: "Subtract 6 from both sides" },
                  { expression: "-3x > 9", explanation: "Simplify" },
                  { expression: "x < -3", explanation: "Divide by -3, FLIP the sign" },
                  { expression: "Open circle at -3, arrow left", explanation: "Graph on number line" },
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
                    question: "Solve: 2x + 4 ≤ 10",
                    options: ["x ≤ 3", "x ≥ 3", "x ≤ 7", "x ≥ 7"],
                    correctIndex: 0,
                  },
                  {
                    question: "Solve: -5x > 20",
                    options: ["x > -4", "x < -4", "x > 4", "x < 4"],
                    correctIndex: 1,
                  },
                  {
                    question: "The graph of y > 2x + 1 uses a:",
                    options: ["Solid line, shade above", "Dashed line, shade above", "Solid line, shade below", "Dashed line, shade below"],
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
                    question: "Solve: 4x - 3 ≥ 9",
                    options: ["x ≥ 3", "x ≤ 3", "x ≥ 1.5", "x ≤ 1.5"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which inequality uses a closed circle?",
                    options: ["x > 5", "x < 5", "x ≥ 5", "x ≠ 5"],
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
