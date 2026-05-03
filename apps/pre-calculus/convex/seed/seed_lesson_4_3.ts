import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_3Result> => {
    const now = Date.now();
    const lessonSlug = "4-3-rates-of-change-parametric";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Rates of Change (Parametric)",
          slug: lessonSlug,
          description: "Students compute dy/dx for parametric curves using chain rule and interpret slopes in context.",
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
          title: "Rates of Change (Parametric)",
          description: "Students compute dy/dx for parametric curves using chain rule and interpret slopes in context.",
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
                    question: "For parametric equations, dy/dx equals:",
                    options: ["dy/dt ÷ dx/dt", "dx/dt ÷ dy/dt", "dy/dt × dx/dt", "d²y/dt²"],
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
              markdown: "## Rates of Change for Parametric Curves\n\n### The Parametric Derivative\n\nBy the chain rule:\n$$\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}, \\quad \\text{provided } \\frac{dx}{dt} \\ne 0$$\n\n### Finding Tangent Lines\n\n1. Compute $\\frac{dx}{dt}$ and $\\frac{dy}{dt}$\n2. Evaluate both at the given $t$-value\n3. Slope $m = \\frac{dy/dt}{dx/dt}$\n4. Point: $(x(t_0), y(t_0))$\n5. Use point-slope form: $y - y_0 = m(x - x_0)$\n\n### Horizontal and Vertical Tangents\n\n- **Horizontal tangent**: $\\frac{dy}{dt} = 0$ and $\\frac{dx}{dt} \\ne 0$\n- **Vertical tangent**: $\\frac{dx}{dt} = 0$ and $\\frac{dy}{dt} \\ne 0$\n\n### Second Derivative\n\n$$\\frac{d^2y}{dx^2} = \\frac{d}{dt}\\left(\\frac{dy}{dx}\\right) \\div \\frac{dx}{dt}$$\n\nThis tells us concavity of the parametric curve.",
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
              markdown: "## Example: Tangent Line\n\nFor $x = t^2$, $y = t^3 - 3t$, find the slope at $t = 2$ and the tangent line equation.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Parametric tangent: x=t², y=t³-3t, t=2",
                steps: [
                  { expression: "dx/dt = 2t, dy/dt = 3t² - 3", explanation: "Differentiate each" },
                  { expression: "At t=2: dx/dt = 4, dy/dt = 9", explanation: "Evaluate at t = 2" },
                  { expression: "dy/dx = 9/4", explanation: "Slope = (dy/dt)/(dx/dt)" },
                  { expression: "Point: (4, 2)", explanation: "x(2)=4, y(2)=8-6=2" },
                  { expression: "y - 2 = (9/4)(x - 4)", explanation: "Tangent line in point-slope form" },
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
                    question: "A horizontal tangent on a parametric curve occurs when:",
                    options: ["dx/dt = 0", "dy/dt = 0 and dx/dt ≠ 0", "dy/dx = 1", "t = 0"],
                    correctIndex: 1,
                  },
                  {
                    question: "For x = cos t, y = sin t, dy/dx at t = π/4 is:",
                    options: ["1", "-1", "0", "Undefined"],
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
                equation: "Find dy/dx for x = e^t, y = e^(2t) + 1",
                steps: [
                  { expression: "dx/dt = e^t, dy/dt = 2e^(2t)", explanation: "Differentiate" },
                  { expression: "dy/dx = 2e^(2t)/e^t", explanation: "Divide" },
                  { expression: "dy/dx = 2e^t", explanation: "Simplify" },
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
