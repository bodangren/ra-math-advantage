import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_7Result> => {
    const now = Date.now();
    const lessonSlug = "4-7-parametrization";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametrization",
          slug: lessonSlug,
          description: "Students parametrize curves including conic sections and convert between parametric and rectangular forms in both directions.",
          orderIndex: 7,
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
          title: "Parametrization",
          description: "Students parametrize curves including conic sections and convert between parametric and rectangular forms in both directions.",
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
                    question: "Which parametrization traces the parabola $y = x^2$?",
                    options: ["x = t, y = t²", "x = t², y = t", "x = cos t, y = sin t", "x = t, y = t³"],
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
              markdown: "## Parametrization Strategies\n\n### Common Parametrizations\n\n| Curve | Parametric Form |\n|-------|----------------|\n| Line through $(x_0,y_0)$ with direction $\\langle a, b \\rangle$ | $x = x_0 + at$, $y = y_0 + bt$ |\n| Circle radius $r$ | $x = r\\cos t$, $y = r\\sin t$ |\n| Ellipse | $x = a\\cos t$, $y = b\\sin t$ |\n| Parabola $y = f(x)$ | $x = t$, $y = f(t)$ |\n| Hyperbola $x^2/a^2 - y^2/b^2 = 1$ | $x = a\\sec t$, $y = b\\tan t$ |\n\n### Choosing a Parameter\n\n- **Time**: natural for motion problems\n- **Angle**: natural for circular/elliptical paths\n- **x-coordinate**: simplest for function graphs $y = f(x)$\n\n### Restricting the Domain\n\nThe parameter range determines which portion of the curve is traced:\n- Full circle: $0 \\le t \\le 2\\pi$\n- Upper semicircle: $0 \\le t \\le \\pi$\n- Line segment: $0 \\le t \\le 1$\n\n### Speed and Direction\n\nDifferent parametrizations of the same curve can trace at different speeds and in different directions.",
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
              markdown: "## Example: Parametrize an Ellipse\n\nParametrize $\\frac{x^2}{16} + \\frac{y^2}{9} = 1$ and trace counterclockwise starting from the rightmost point.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Parametrize x²/16 + y²/9 = 1",
                steps: [
                  { expression: "a² = 16, b² = 9", explanation: "Identify semi-axes" },
                  { expression: "a = 4, b = 3", explanation: "Semi-axis lengths" },
                  { expression: "x = 4cos t, y = 3sin t", explanation: "Standard parametrization" },
                  { expression: "0 ≤ t ≤ 2π for full ellipse", explanation: "Parameter range" },
                  { expression: "At t=0: (4,0) ✓ rightmost point", explanation: "Verify starting point" },
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
                    question: "To parametrize the line segment from (2,1) to (6,4), use:",
                    options: ["x = 2 + 4t, y = 1 + 3t, 0 ≤ t ≤ 1", "x = 2t, y = t, 0 ≤ t ≤ 1", "x = 4cos t, y = 3sin t", "x = t, y = t"],
                    correctIndex: 0,
                  },
                  {
                    question: "The same rectangular curve can have infinitely many parametrizations because:",
                    options: ["Math is broken", "Different parameters trace the curve differently", "Only one is correct", "Rectangular form is superior"],
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
                equation: "Parametrize y = √x from x=0 to x=9",
                steps: [
                  { expression: "Let x = t", explanation: "Use x as parameter" },
                  { expression: "y = √t", explanation: "Substitute into equation" },
                  { expression: "x = t, y = √t, 0 ≤ t ≤ 9", explanation: "Parametric form with domain" },
                  { expression: "At t=0: (0,0). At t=9: (9,3)", explanation: "Check endpoints" },
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
