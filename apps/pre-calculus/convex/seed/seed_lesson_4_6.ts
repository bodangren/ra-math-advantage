import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_6Result> => {
    const now = Date.now();
    const lessonSlug = "4-6-conic-sections";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Conic Sections",
          slug: lessonSlug,
          description: "Students identify, graph, and write equations for parabolas, ellipses, and hyperbolas in standard form.",
          orderIndex: 6,
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
          title: "Conic Sections",
          description: "Students identify, graph, and write equations for parabolas, ellipses, and hyperbolas in standard form.",
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
                prompt: "Graph these conics and identify each type: y = x²/4, x²/9 + y²/4 = 1, x²/4 - y²/9 = 1",
                defaultExpressions: ["y = x^2/4", "x^2/9 + y^2/4 = 1", "x^2/4 - y^2/9 = 1"],
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
              markdown: "## Conic Sections\n\n### Parabola\n\n$$(x - h)^2 = 4p(y - k) \\quad \\text{or} \\quad (y - k)^2 = 4p(x - h)$$\n\n- Vertex: $(h, k)$\n- Focus: $p$ units from vertex along axis\n- Directrix: $p$ units opposite from focus\n\n### Ellipse\n\n$$\\frac{(x-h)^2}{a^2} + \\frac{(y-k)^2}{b^2} = 1$$\n\n- Center: $(h, k)$\n- Major axis: $2a$ (along larger denominator)\n- Minor axis: $2b$\n- Foci: $c^2 = |a^2 - b^2|$\n\n### Hyperbola\n\n$$\\frac{(x-h)^2}{a^2} - \\frac{(y-k)^2}{b^2} = 1 \\quad \\text{(opens left/right)}$$\n$$\\frac{(y-k)^2}{a^2} - \\frac{(x-h)^2}{b^2} = 1 \\quad \\text{(opens up/down)}$$\n\n- Asymptotes: $y - k = \\pm \\frac{b}{a}(x - h)$\n- Foci: $c^2 = a^2 + b^2$\n\n### Discriminant Test\n\nFor $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$:\n- $B^2 - 4AC < 0$: ellipse (or circle)\n- $B^2 - 4AC = 0$: parabola\n- $B^2 - 4AC > 0$: hyperbola",
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
              markdown: "## Example: Identify and Graph\n\nIdentify the conic $9x^2 + 4y^2 - 36 = 0$ and find key features.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "9x² + 4y² - 36 = 0",
                steps: [
                  { expression: "9x² + 4y² = 36", explanation: "Move constant" },
                  { expression: "x²/4 + y²/9 = 1", explanation: "Divide by 36" },
                  { expression: "a² = 9, b² = 4, center at origin", explanation: "Ellipse — a² under y, so vertical major axis" },
                  { expression: "c² = 9 - 4 = 5, c = √5", explanation: "Foci at (0, ±√5)" },
                  { expression: "Vertices: (0, ±3), co-vertices: (±2, 0)", explanation: "Key points" },
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
                    question: "The equation $x^2/16 - y^2/9 = 1$ represents a:",
                    options: ["Circle", "Ellipse", "Hyperbola", "Parabola"],
                    correctIndex: 2,
                  },
                  {
                    question: "For the ellipse $x^2/25 + y^2/16 = 1$, the foci are at:",
                    options: ["(±3, 0)", "(±4, 0)", "(±5, 0)", "(0, ±3)"],
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
                prompt: "Graph (x-1)²/9 + (y+2)²/4 = 1. Identify the center, vertices, and foci.",
                defaultExpressions: ["(x-1)^2/9 + (y+2)^2/4 = 1"],
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
