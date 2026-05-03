import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson12_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson12_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson12_3Result> => {
    const now = Date.now();
    const lessonSlug = "12-3-completing-the-square";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 12,
          title: "Completing the Square",
          slug: lessonSlug,
          description: "Students complete the square to rewrite quadratics in vertex form and solve equations.",
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
          title: "Completing the Square",
          description: "Students complete the square to rewrite quadratics in vertex form and solve equations.",
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
              markdown: "## Explore: Making Perfect Squares\n\nx² + 6x is not a perfect square trinomial. But x² + 6x + 9 is!\n\nWhat number must you add to make x² + 6x + ? a perfect square? What pattern do you see?",
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
                    question: "To complete x² + 10x, add:",
                    options: ["10", "25", "5", "100"],
                    correctIndex: 1,
                  },
                  {
                    question: "x² + 8x + 16 factors as:",
                    options: ["(x + 4)²", "(x + 8)²", "(x + 2)²", "(x + 16)²"],
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
              markdown: "## Completing the Square\n\n### The Process\n1. Start with x² + bx\n2. Take half of b: b/2\n3. Square it: (b/2)²\n4. Add and subtract: x² + bx + (b/2)² − (b/2)²\n5. Factor: (x + b/2)² − (b/2)²\n\n### Why It Works\n(a + b)² = a² + 2ab + b²\nThe middle term is 2ab, so b = (middle term)/2a.\n\n### Uses\n- Convert standard form to vertex form\n- Solve quadratics that don't factor neatly\n- Derive the quadratic formula",
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
              markdown: "## Example: Complete the Square\n\nWrite x² + 8x + 5 in vertex form.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "completing-the-square",
                equation: "x² + 8x + 5",
                steps: [
                  { expression: "Half of 8 is 4, 4² = 16", explanation: "Find the completing value" },
                  { expression: "x² + 8x + 16 - 16 + 5", explanation: "Add and subtract 16" },
                  { expression: "(x + 4)² - 16 + 5", explanation: "Factor the perfect square" },
                  { expression: "(x + 4)² - 11", explanation: "Simplify: vertex form" },
                  { expression: "Vertex: (-4, -11)", explanation: "Read vertex from form a(x-h)² + k" },
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
                problemType: "completing-the-square",
                equation: "x² - 6x + 2 = 0",
                steps: [
                  { expression: "x² - 6x = -2", explanation: "Move constant to right side" },
                  { expression: "Half of -6 is -3, (-3)² = 9", explanation: "Find completing value" },
                  { expression: "x² - 6x + 9 = -2 + 9", explanation: "Add 9 to both sides" },
                  { expression: "(x - 3)² = 7", explanation: "Factor left side" },
                  { expression: "x - 3 = ±√7", explanation: "Take square root of both sides" },
                  { expression: "x = 3 ± √7", explanation: "Solve for x" },
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
                    question: "What value completes the square for x² + 14x?",
                    options: ["49", "7", "14", "196"],
                    correctIndex: 0,
                  },
                  {
                    question: "x² + 4x + 1 in vertex form is:",
                    options: ["(x + 2)² - 3", "(x + 2)² + 3", "(x + 4)² - 15", "(x + 1)²"],
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
