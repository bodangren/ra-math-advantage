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
    const lessonSlug = "4-2-parametric-motion-modeling";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametric Motion Modeling",
          slug: lessonSlug,
          description: "Students model real-world motion using parametric equations, interpreting position, speed, and direction from parametric representations.",
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
          title: "Parametric Motion Modeling",
          description: "Students model real-world motion using parametric equations, interpreting position, speed, and direction from parametric representations.",
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
                prompt: "Graph x(t) = t, y(t) = −16t² + 30t to model projectile motion. What is the maximum height?",
                defaultExpressions: ["x(t) = t", "y(t) = -16t^2 + 30t"],
                parameterRange: [0, 2],
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
              markdown: "## Parametric Motion Modeling\n\n### Position Functions\n\nFor an object moving in a plane:\n- $x(t)$ = horizontal position at time $t$\n- $y(t)$ = vertical position at time $t$\n\n### Projectile Motion\n\nA ball launched at angle $\\alpha$ with initial speed $v_0$:\n$$x(t) = v_0 \\cos\\alpha \\cdot t$$\n$$y(t) = v_0 \\sin\\alpha \\cdot t - \\frac{1}{2}gt^2$$\n\nwhere $g \\approx 32$ ft/s² (or $9.8$ m/s²).\n\n### Interpreting Motion\n\n- **Initial position**: evaluate at $t = 0$\n- **Landing time**: solve $y(t) = 0$ for $t > 0$\n- **Maximum height**: occurs when $\\frac{dy}{dt} = 0$\n- **Range**: $x$-value when the object lands\n\n### Speed\n\n$$v(t) = \\sqrt{\\left(\\frac{dx}{dt}\\right)^2 + \\left(\\frac{dy}{dt}\\right)^2}$$",
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
              markdown: "## Example: Projectile Motion\n\nA ball is thrown with $x(t) = 20t$, $y(t) = -16t^2 + 32t$. Find the max height and landing point.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Projectile: x(t)=20t, y(t)=-16t²+32t",
                steps: [
                  { expression: "dy/dt = -32t + 32", explanation: "Differentiate y(t)" },
                  { expression: "-32t + 32 = 0 → t = 1", explanation: "Set derivative to zero for max height" },
                  { expression: "y(1) = -16 + 32 = 16 ft", explanation: "Maximum height is 16 feet" },
                  { expression: "y(t) = 0 → -16t² + 32t = 0 → t(t-2) = 0", explanation: "Find landing time" },
                  { expression: "t = 2, x(2) = 40 ft", explanation: "Lands 40 feet away at t = 2s" },
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
                    question: "For $x(t) = 10t$, $y(t) = -16t^2 + 24t$, the projectile lands when:",
                    options: ["t = 1", "t = 1.5", "t = 2", "t = 2.5"],
                    correctIndex: 1,
                  },
                  {
                    question: "The horizontal component of projectile motion (no wind) is:",
                    options: ["Accelerating", "Constant velocity", "Decelerating", "Parabolic"],
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
              componentKey: "graphing-explorer",
              props: {
                prompt: "Graph x(t) = 15cos(π/6)t, y(t) = 15sin(π/6)t − 16t². Find the range.",
                defaultExpressions: ["x(t) = 15cos(pi/6)t", "y(t) = 15sin(pi/6)t - 16t^2"],
                parameterRange: [0, 3],
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
