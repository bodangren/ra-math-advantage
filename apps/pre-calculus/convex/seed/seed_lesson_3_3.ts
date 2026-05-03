import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_3Result> => {
    const now = Date.now();
    const lessonSlug = "3-3-trig-functions-unit-circle";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Trigonometric Functions and the Unit Circle",
          slug: lessonSlug,
          description: "Students extend trig functions to all real numbers using the unit circle and evaluate trig functions in all quadrants.",
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
          title: "Trigonometric Functions and the Unit Circle",
          description: "Students extend trig functions to all real numbers using the unit circle and evaluate trig functions in all quadrants.",
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
                equation: "y = cos(x)",
                title: "Explore the Unit Circle Connection",
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
              markdown: "## The Unit Circle\n\n### Definition\n\nOn the unit circle (radius 1, center at origin), a point at angle $\\theta$ has coordinates:\n$$(\\cos\\theta, \\sin\\theta)$$\n\n### Key Angles\n\n| $\\theta$ | $\\cos\\theta$ | $\\sin\\theta$ | Quadrant |\n|----------|--------------|--------------|----------|\n| $0$ | 1 | 0 | I |\n| $\\frac{\\pi}{6}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | I |\n| $\\frac{\\pi}{4}$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | I |\n| $\\frac{\\pi}{3}$ | $\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | I |\n| $\\frac{\\pi}{2}$ | 0 | 1 | I |\n\n### Signs by Quadrant\n\n- **Q I**: both positive\n- **Q II**: sin positive, cos negative\n- **Q III**: both negative\n- **Q IV**: cos positive, sin negative",
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
              markdown: "## Example: Using the Unit Circle\n\nFind $\\sin\\left(\\frac{5\\pi}{6}\\right)$ and $\\cos\\left(\\frac{5\\pi}{6}\\right)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Unit circle values",
                steps: [
                  { expression: "5π/6 = π - π/6", explanation: "Reference angle is π/6" },
                  { expression: "5π/6 is in Quadrant II", explanation: "Between π/2 and π" },
                  { expression: "Q II: sin positive, cos negative", explanation: "Sign rule" },
                  { expression: "sin(5π/6) = sin(π/6) = 1/2", explanation: "Positive in Q II" },
                  { expression: "cos(5π/6) = -cos(π/6) = -√3/2", explanation: "Negative in Q II" },
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
                    question: "$\\cos\\left(\\frac{\\pi}{2}\\right) =$",
                    options: ["1", "0", "-1", "1/2"],
                    correctIndex: 1,
                  },
                  {
                    question: "In Quadrant III, both sine and cosine are:",
                    options: ["Positive", "Negative", "Sine positive", "Cosine positive"],
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
                equation: "Evaluate sin(4π/3) and cos(4π/3)",
                steps: [
                  { expression: "4π/3 = π + π/3", explanation: "Reference angle π/3" },
                  { expression: "Quadrant III: both negative", explanation: "Signs" },
                  { expression: "sin(4π/3) = -sin(π/3) = -√3/2", explanation: "Sine" },
                  { expression: "cos(4π/3) = -cos(π/3) = -1/2", explanation: "Cosine" },
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
