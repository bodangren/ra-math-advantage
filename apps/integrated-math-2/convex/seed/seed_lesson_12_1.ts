import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson12_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson12_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson12_1Result> => {
    const now = Date.now();
    const lessonSlug = "12-1-graphing-quadratics";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 12,
          title: "Graphing Quadratics",
          slug: lessonSlug,
          description: "Students graph quadratic functions and identify vertex, axis of symmetry, and intercepts.",
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
          title: "Graphing Quadratics",
          description: "Students graph quadratic functions and identify vertex, axis of symmetry, and intercepts.",
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
              markdown: "## Explore: The Shape of Quadratics\n\nGraph y = x² by plotting points for x = −3, −2, −1, 0, 1, 2, 3.\n\nWhat shape does the graph make? Where is the lowest point? Is there a line of symmetry?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                equations: ["x^2"],
                instructions: "Graph y = x² and observe the parabola shape.",
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
              markdown: "## Graphing Quadratics\n\n### Standard Form\ny = ax² + bx + c\n\n### Key Features\n- **Vertex**: The highest or lowest point\n- **Axis of symmetry**: Vertical line through the vertex, x = -b/(2a)\n- **Direction**: Opens up if a > 0, down if a < 0\n- **Y-intercept**: The value c (when x = 0)\n- **X-intercepts**: Solutions to ax² + bx + c = 0\n\n### Vertex Form\ny = a(x − h)² + k, where (h, k) is the vertex",
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
              markdown: "## Example: Find Key Features\n\nFor y = x² − 4x + 3, find the vertex, axis of symmetry, and intercepts.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "quadratic-graphing",
                equation: "y = x² - 4x + 3",
                steps: [
                  { expression: "x = -b/(2a) = 4/2 = 2", explanation: "Axis of symmetry" },
                  { expression: "y = (2)² - 4(2) + 3 = 4 - 8 + 3 = -1", explanation: "y-coordinate of vertex" },
                  { expression: "Vertex: (2, -1)", explanation: "The minimum point" },
                  { expression: "Axis of symmetry: x = 2", explanation: "Vertical line through vertex" },
                  { expression: "y-intercept: c = 3, so (0, 3)", explanation: "When x = 0" },
                  { expression: "x-intercepts: x² - 4x + 3 = (x-1)(x-3) = 0, so x = 1, 3", explanation: "Solve for zeros" },
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
              componentKey: "graphing-explorer",
              props: {
                equations: ["x^2 - 2x - 3", "-x^2 + 4"],
                instructions: "Graph these quadratics and identify their vertices.",
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
                    question: "The vertex of y = x² + 6x + 5 is at x =",
                    options: ["-3", "3", "-6", "6"],
                    correctIndex: 0,
                  },
                  {
                    question: "If a < 0 in y = ax² + bx + c, the parabola:",
                    options: ["Opens upward", "Opens downward", "Is a line", "Has no vertex"],
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
