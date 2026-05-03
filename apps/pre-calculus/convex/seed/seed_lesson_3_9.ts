import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_9Result> => {
    const now = Date.now();
    const lessonSlug = "3-9-inverse-trig-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Inverse Trigonometric Functions",
          slug: lessonSlug,
          description: "Students evaluate arcsin, arccos, and arctan and understand their restricted domains and ranges.",
          orderIndex: 9,
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
          title: "Inverse Trigonometric Functions",
          description: "Students evaluate arcsin, arccos, and arctan and understand their restricted domains and ranges.",
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
                    question: "$\\arcsin(1/2)$ equals:",
                    options: ["π/6", "π/4", "π/3", "π/2"],
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
              markdown: "## Inverse Trigonometric Functions\n\n### Why Restrictions?\n\nTrig functions are periodic, so they're not one-to-one. We restrict domains to define inverses.\n\n| Function | Domain | Range |\n|----------|--------|-------|\n| $\\arcsin(x) = \\sin^{-1}(x)$ | $[-1, 1]$ | $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$ |\n| $\\arccos(x) = \\cos^{-1}(x)$ | $[-1, 1]$ | $[0, \\pi]$ |\n| $\\arctan(x) = \\tan^{-1}(x)$ | $(-\\infty, \\infty)$ | $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$ |\n\n### Key Identities\n\n- $\\sin(\\arcsin(x)) = x$ for $x \\in [-1, 1]$\n- $\\arcsin(\\sin(\\theta)) = \\theta$ only when $\\theta \\in [-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$",
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
              markdown: "## Example: Evaluating Inverse Trig Functions\n\nEvaluate: a) $\\arcsin\\left(-\\frac{\\sqrt{3}}{2}\\right)$ b) $\\arccos(0)$ c) $\\arctan(1)$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Inverse trig evaluations",
                steps: [
                  { expression: "a) arcsin(-√3/2): sin(?) = -√3/2 in [-π/2, π/2]", explanation: "Find angle in range" },
                  { expression: "sin(-π/3) = -√3/2, so arcsin(-√3/2) = -π/3", explanation: "Answer" },
                  { expression: "b) arccos(0): cos(?) = 0 in [0, π]", explanation: "Find angle in range" },
                  { expression: "cos(π/2) = 0, so arccos(0) = π/2", explanation: "Answer" },
                  { expression: "c) arctan(1): tan(?) = 1 in (-π/2, π/2)", explanation: "Find angle in range" },
                  { expression: "tan(π/4) = 1, so arctan(1) = π/4", explanation: "Answer" },
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
                    question: "The range of $\\arcsin(x)$ is:",
                    options: ["[0, π]", "[-π/2, π/2]", "(-π/2, π/2)", "[-1, 1]"],
                    correctIndex: 1,
                  },
                  {
                    question: "$\\cos(\\arccos(0.5)) =$",
                    options: ["0", "0.5", "1", "π/3"],
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
                equation: "Evaluate tan(arcsin(3/5))",
                steps: [
                  { expression: "Let θ = arcsin(3/5), so sin(θ) = 3/5", explanation: "Define θ" },
                  { expression: "θ is in [-π/2, π/2], so cos(θ) > 0", explanation: "First quadrant" },
                  { expression: "cos(θ) = √(1 - 9/25) = 4/5", explanation: "Pythagorean identity" },
                  { expression: "tan(θ) = sin(θ)/cos(θ) = (3/5)/(4/5) = 3/4", explanation: "Calculate tangent" },
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
