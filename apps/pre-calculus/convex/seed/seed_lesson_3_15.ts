import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_15Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_15 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_15Result> => {
    const now = Date.now();
    const lessonSlug = "3-15-polar-representations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Polar Representations",
          slug: lessonSlug,
          description: "Students convert between rectangular and polar equations and understand when polar representation is advantageous.",
          orderIndex: 15,
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
          title: "Polar Representations",
          description: "Students convert between rectangular and polar equations and understand when polar representation is advantageous.",
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
                    question: "Which equation is simpler in polar form: $x^2 + y^2 = 25$?",
                    options: ["r = 5", "r = 25", "θ = 5", "r² = 5"],
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
              markdown: "## Polar Representations\n\n### Conversion Identities\n\n$$x^2 + y^2 = r^2, \\quad x = r\\cos\\theta, \\quad y = r\\sin\\theta$$\n$$\\tan\\theta = \\frac{y}{x}, \\quad \\frac{y}{x} = \\frac{\\sin\\theta}{\\cos\\theta}$$\n\n### When Polar is Better\n\n- **Circles through origin**: $r = 2a\\cos\\theta$ instead of $(x-a)^2 + y^2 = a^2$\n- **Rotational symmetry**: Rose curves, spirals\n- **Distance from origin**: Natural in polar\n\n### When Rectangular is Better\n\n- **Lines**: $y = mx + b$ is simpler\n- **Parabolas**: $y = x^2$ is simpler\n- **Horizontal/vertical distances**: Natural in rectangular\n\n### Multiple Representations\n\nThe same curve can have different polar equations (adding $\\pi$ to $\\theta$, negating $r$).",
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
              markdown: "## Example: Convert Between Forms\n\na) Convert $r = 4\\sin\\theta$ to rectangular.\nb) Convert $x^2 + y^2 = 6x$ to polar.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Polar-rectangular conversion",
                steps: [
                  { expression: "a) r = 4sinθ → r² = 4rsinθ", explanation: "Multiply both sides by r" },
                  { expression: "x² + y² = 4y", explanation: "Substitute r² and rsinθ" },
                  { expression: "x² + y² - 4y = 0 → x² + (y-2)² = 4", explanation: "Complete the square — circle of radius 2" },
                  { expression: "b) x² + y² = 6x → r² = 6rcosθ", explanation: "Substitute polar forms" },
                  { expression: "r = 6cosθ", explanation: "Divide by r (r ≠ 0)" },
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
                    question: "The rectangular equation of $r = 2\\cos\\theta$ is a:",
                    options: ["Line", "Circle", "Ellipse", "Parabola"],
                    correctIndex: 1,
                  },
                  {
                    question: "Polar form is most natural for curves with:",
                    options: ["Linear behavior", "Rotational symmetry", "Parabolic shape", "Cubic behavior"],
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
                equation: "Convert x² + y² = 9 to polar",
                steps: [
                  { expression: "x² + y² = r²", explanation: "Identity" },
                  { expression: "r² = 9", explanation: "Substitute" },
                  { expression: "r = 3", explanation: "Circle of radius 3" },
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
