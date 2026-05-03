import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_11Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_11 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_11Result> => {
    const now = Date.now();
    const lessonSlug = "3-11-other-trig-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Other Trigonometric Functions",
          slug: lessonSlug,
          description: "Students define and graph secant, cosecant, and cotangent and understand their relationships to sin, cos, and tan.",
          orderIndex: 11,
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
          title: "Other Trigonometric Functions",
          description: "Students define and graph secant, cosecant, and cotangent and understand their relationships to sin, cos, and tan.",
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
                variant: "compare_functions",
                equations: ["y = cos(x)", "y = sec(x)"],
                title: "Explore Secant and Cosine",
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
              markdown: "## Secant, Cosecant, and Cotangent\n\n### Definitions\n\n$$\\sec(x) = \\frac{1}{\\cos(x)}, \\quad \\csc(x) = \\frac{1}{\\sin(x)}, \\quad \\cot(x) = \\frac{\\cos(x)}{\\sin(x)}$$\n\n### Properties\n\n| Function | Period | Vertical Asymptotes | Range |\n|----------|--------|-------------------|-------|\n| $\\sec(x)$ | $2\\pi$ | $x = \\frac{\\pi}{2} + n\\pi$ | $(-\\infty, -1] \\cup [1, \\infty)$ |\n| $\\csc(x)$ | $2\\pi$ | $x = n\\pi$ | $(-\\infty, -1] \\cup [1, \\infty)$ |\n| $\\cot(x)$ | $\\pi$ | $x = n\\pi$ | $(-\\infty, \\infty)$ |\n\n### Graphing Relationship\n\n- Secant has U-shaped branches between cosine's max/min\n- Cosecant has U-shaped branches between sine's max/min\n- Both have no amplitude (unbounded)",
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
              markdown: "## Example: Graphing Secant\n\nGraph $y = \\sec(x)$ alongside $y = \\cos(x)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "y = sec(x)",
                steps: [
                  { expression: "sec(x) = 1/cos(x)", explanation: "Definition" },
                  { expression: "Asymptotes where cos(x) = 0: x = π/2, 3π/2, ...", explanation: "Vertical asymptotes" },
                  { expression: "Period = 2π", explanation: "Same as cosine" },
                  { expression: "Minimum of sec(x) is 1 (when cos(x) = 1)", explanation: "Secant ≥ 1 or ≤ -1" },
                  { expression: "Graph: U-shaped branches opening away from x-axis", explanation: "Shape description" },
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
                    question: "$\\csc(x)$ has vertical asymptotes where:",
                    options: ["cos(x) = 0", "sin(x) = 0", "tan(x) = 0", "sec(x) = 0"],
                    correctIndex: 1,
                  },
                  {
                    question: "The range of $\\sec(x)$ is:",
                    options: ["[-1, 1]", "(-∞, ∞)", "(-∞, -1] ∪ [1, ∞)", "[0, ∞)"],
                    correctIndex: 2,
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
                equation: "Evaluate sec(π/3), csc(π/6), cot(π/4)",
                steps: [
                  { expression: "sec(π/3) = 1/cos(π/3) = 1/(1/2) = 2", explanation: "Secant" },
                  { expression: "csc(π/6) = 1/sin(π/6) = 1/(1/2) = 2", explanation: "Cosecant" },
                  { expression: "cot(π/4) = cos(π/4)/sin(π/4) = 1", explanation: "Cotangent" },
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
