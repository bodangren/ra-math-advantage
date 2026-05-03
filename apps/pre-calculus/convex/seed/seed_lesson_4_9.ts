import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_9Result> => {
    const now = Date.now();
    const lessonSlug = "4-9-vector-valued-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Vector-Valued Functions",
          slug: lessonSlug,
          description: "Students work with vector-valued functions, computing derivatives, velocity, acceleration, and analyzing motion in the plane.",
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
          title: "Vector-Valued Functions",
          description: "Students work with vector-valued functions, computing derivatives, velocity, acceleration, and analyzing motion in the plane.",
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
                prompt: "Graph r(t) = ⟨cos t, sin t⟩ for 0 ≤ t ≤ 2π. What path does the tip of the vector trace?",
                defaultExpressions: ["r(t) = (cos(t), sin(t))"],
                parameterRange: [0, 6.28],
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
              markdown: "## Vector-Valued Functions\n\n### Definition\n\n$$\\vec{r}(t) = \\langle f(t), g(t) \\rangle = f(t)\\hat{i} + g(t)\\hat{j}$$\n\n### Velocity and Acceleration\n\n$$\\vec{v}(t) = \\vec{r}'(t) = \\langle f'(t), g'(t) \\rangle$$\n$$\\vec{a}(t) = \\vec{v}'(t) = \\vec{r}''(t) = \\langle f''(t), g''(t) \\rangle$$\n\n### Speed\n\n$$|\\vec{v}(t)| = \\sqrt{[f'(t)]^2 + [g'(t)]^2}$$\n\n### Displacement and Distance\n\n- **Displacement**: $\\vec{r}(b) - \\vec{r}(a)$\n- **Total distance**: $\\int_a^b |\\vec{v}(t)| \\, dt$\n\n### Tangent and Normal Vectors\n\n- Unit tangent: $\\vec{T}(t) = \\frac{\\vec{v}(t)}{|\\vec{v}(t)|}$\n- The acceleration decomposes into tangential and normal components",
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
              markdown: "## Example: Velocity and Speed\n\nFor $\\vec{r}(t) = \\langle t^2, 3t \\rangle$, find $\\vec{v}(t)$, speed at $t = 1$, and total distance from $t = 0$ to $t = 2$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "r(t) = ⟨t², 3t⟩",
                steps: [
                  { expression: "v(t) = r'(t) = ⟨2t, 3⟩", explanation: "Differentiate each component" },
                  { expression: "Speed at t=1: |v(1)| = |⟨2,3⟩| = √(4+9) = √13", explanation: "Magnitude of velocity" },
                  { expression: "a(t) = v'(t) = ⟨2, 0⟩", explanation: "Acceleration — constant horizontal" },
                  { expression: "Distance = ∫₀² √(4t²+9) dt", explanation: "Arc length integral" },
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
                    question: "For $\\vec{r}(t) = \\langle 3\\cos t, 3\\sin t \\rangle$, the speed is:",
                    options: ["3", "3t", "√(9cos²t + 9sin²t) = 3", "Variable"],
                    correctIndex: 2,
                  },
                  {
                    question: "The velocity vector is always ______ to the position curve at the point of evaluation:",
                    options: ["Parallel", "Tangent", "Perpendicular", "Unrelated"],
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
                equation: "For r(t) = ⟨e^t, e^(-t)⟩, find v(t) and |v(0)|",
                steps: [
                  { expression: "v(t) = ⟨e^t, -e^(-t)⟩", explanation: "Differentiate" },
                  { expression: "v(0) = ⟨1, -1⟩", explanation: "Evaluate at t = 0" },
                  { expression: "|v(0)| = √(1 + 1) = √2", explanation: "Speed at t = 0" },
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
