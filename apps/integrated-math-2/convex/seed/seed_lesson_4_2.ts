import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_2Result> => {
    const now = Date.now();
    const lessonSlug = "4-2-special-right-triangles";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Special Right Triangles",
          slug: lessonSlug,
          description: "Students work with 45-45-90 and 30-60-90 triangles.",
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
          title: "Special Right Triangles",
          description: "Students work with 45-45-90 and 30-60-90 triangles.",
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
              markdown: "## Explore: Special Triangles\n\nCut a square along its diagonal. What kind of triangle do you get? Cut an equilateral triangle in half from vertex to midpoint of the opposite side. What kind of triangle do you get?",
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
                    question: "A 45-45-90 triangle is formed by cutting a:",
                    options: ["Rectangle", "Square", "Parallelogram", "Rhombus"],
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
              markdown: "## Special Right Triangles\n\n### 45-45-90 Triangle\n- Both legs are equal ($x, x$)\n- Hypotenuse = $x\\sqrt{2}$\n- Ratio: $1 : 1 : \\sqrt{2}$\n\n### 30-60-90 Triangle\n- Short leg (opposite 30°) = $x$\n- Long leg (opposite 60°) = $x\\sqrt{3}$\n- Hypotenuse (opposite 90°) = $2x$\n- Ratio: $1 : \\sqrt{3} : 2$\n\n### Quick Reference\n| Triangle | Sides |\n|----------|-------|\n| 45-45-90 | $x, x, x\\sqrt{2}$ |\n| 30-60-90 | $x, x\\sqrt{3}, 2x$ |",
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
              markdown: "## Example: 30-60-90 Triangle\n\nIn a 30-60-90 triangle, the short leg is 5. Find the long leg and hypotenuse.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "special_triangle",
                equation: "Short leg = 5, find other sides",
                steps: [
                  { expression: "Short leg = x = 5", explanation: "Given" },
                  { expression: "Long leg = x√3 = 5√3", explanation: "Multiply short leg by √3" },
                  { expression: "Hypotenuse = 2x = 10", explanation: "Multiply short leg by 2" },
                  { expression: "Sides: 5, 5√3, 10", explanation: "The three side lengths" },
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
                    question: "In a 45-45-90 triangle, if a leg is 7, the hypotenuse is:",
                    options: ["7√2", "7√3", "14", "7/√2"],
                    correctIndex: 0,
                  },
                  {
                    question: "In a 30-60-90 triangle, if the hypotenuse is 12, the short leg is:",
                    options: ["6", "6√3", "12√3", "4√3"],
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
                    question: "In a 30-60-90 triangle, the long leg is 8√3. The hypotenuse is:",
                    options: ["16", "8", "8√6", "16√3"],
                    correctIndex: 0,
                  },
                  {
                    question: "The diagonal of a square with side 6 is:",
                    options: ["6√2", "6√3", "12", "36"],
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
