import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_14Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_14 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_14Result> => {
    const now = Date.now();
    const lessonSlug = "3-14-polar-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Polar Functions",
          slug: lessonSlug,
          description: "Students graph polar equations including circles, cardioids, limaçons, and roses.",
          orderIndex: 14,
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
          title: "Polar Functions",
          description: "Students graph polar equations including circles, cardioids, limaçons, and roses.",
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
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "r = 1 + cos(theta)",
                title: "Explore a Cardioid",
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
              markdown: "## Common Polar Curves\n\n### Circles\n- $r = a$: Circle centered at origin, radius $a$\n- $r = 2a\\cos(\\theta)$: Circle centered at $(a, 0)$, radius $a$\n\n### Limaçons ($r = a + b\\cos(\\theta)$)\n- $a = b$: **Cardioid** (heart shape)\n- $a > b$: Dimpled or convex\n- $a < b$: Inner loop\n\n### Rose Curves ($r = a\\cos(n\\theta)$)\n- $n$ odd: $n$ petals\n- $n$ even: $2n$ petals\n\n### Lemniscates\n- $r^2 = a^2\\cos(2\\theta)$: Figure-eight shape\n\n### Testing for Symmetry\n- Over x-axis: replace $\\theta$ with $-\\theta$\n- Over y-axis: replace $\\theta$ with $\\pi - \\theta$\n- Over origin: replace $r$ with $-r$",
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
              markdown: "## Example: Classify a Polar Curve\n\nIdentify the type and features of $r = 3\\cos(2\\theta)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "r = 3cos(2θ)",
                steps: [
                  { expression: "Form: r = a·cos(nθ) with a = 3, n = 2", explanation: "Identify parameters" },
                  { expression: "n = 2 (even) → 2n = 4 petals", explanation: "Rose curve with 4 petals" },
                  { expression: "Maximum r = 3 (petal length)", explanation: "From coefficient" },
                  { expression: "Symmetric over x-axis, y-axis, and origin", explanation: "Test symmetries" },
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
                    question: "$r = 2 + 2\\cos(\\theta)$ is a:",
                    options: ["Circle", "Cardioid", "Rose curve", "Limaçon with inner loop"],
                    correctIndex: 1,
                  },
                  {
                    question: "$r = 5\\cos(3\\theta)$ has how many petals?",
                    options: ["3", "5", "6", "10"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "r = 2sin(3*theta)",
                title: "Graph a Rose Curve",
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
