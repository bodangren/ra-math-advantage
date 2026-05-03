import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_13Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_13 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_13Result> => {
    const now = Date.now();
    const lessonSlug = "3-13-polar-coordinates";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Polar Coordinates",
          slug: lessonSlug,
          description: "Students plot points in polar coordinates and convert between rectangular and polar forms.",
          orderIndex: 13,
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
          title: "Polar Coordinates",
          description: "Students plot points in polar coordinates and convert between rectangular and polar forms.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "In polar coordinates $(r, \\theta)$, $r$ represents:",
                    options: ["The angle", "The distance from the origin", "The x-coordinate", "The y-coordinate"],
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
              markdown: "## Polar Coordinates\n\n### Definition\n\nA point is described by $(r, \\theta)$ where:\n- $r$ = distance from the origin (pole)\n- $\\theta$ = angle from the positive x-axis (polar axis)\n\n### Conversion Formulas\n\n**Polar → Rectangular:**\n$$x = r\\cos(\\theta), \\quad y = r\\sin(\\theta)$$\n\n**Rectangular → Polar:**\n$$r = \\sqrt{x^2 + y^2}, \\quad \\theta = \\arctan\\left(\\frac{y}{x}\\right)$$\n\n### Key Ideas\n\n- $(r, \\theta)$ and $(r, \\theta + 2\\pi)$ represent the same point\n- $(-r, \\theta)$ and $(r, \\theta + \\pi)$ represent the same point\n- Polar coordinates are not unique",
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
              markdown: "## Example: Converting Coordinates\n\na) Convert $(3, \\frac{\\pi}{4})$ to rectangular.\nb) Convert $(-1, \\sqrt{3})$ to polar.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Coordinate conversion",
                steps: [
                  { expression: "a) x = 3cos(π/4) = 3√2/2", explanation: "X coordinate" },
                  { expression: "y = 3sin(π/4) = 3√2/2", explanation: "Y coordinate" },
                  { expression: "Rectangular: (3√2/2, 3√2/2)", explanation: "Answer for part a" },
                  { expression: "b) r = √(1 + 3) = 2", explanation: "Distance from origin" },
                  { expression: "θ = arctan(-√3/-1) = arctan(√3) in QIII", explanation: "Angle in correct quadrant" },
                  { expression: "θ = 4π/3, so polar: (2, 4π/3)", explanation: "Answer for part b" },
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "The rectangular equivalent of $(4, \\frac{\\pi}{2})$ is:",
                    options: ["(4, 0)", "(0, 4)", "(4, 4)", "(2, 2)"],
                    correctIndex: 1,
                  },
                  {
                    question: "The polar form of $(0, 3)$ is:",
                    options: ["(3, 0)", "(3, π/2)", "(3, π)", "(0, 3)"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Convert (5, 5) to polar",
                steps: [
                  { expression: "r = √(25 + 25) = 5√2", explanation: "Distance" },
                  { expression: "θ = arctan(5/5) = arctan(1) = π/4", explanation: "Angle (Q I)" },
                  { expression: "Polar: (5√2, π/4)", explanation: "Answer" },
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
