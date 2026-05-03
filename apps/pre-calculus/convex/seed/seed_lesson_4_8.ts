import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_8Result> => {
    const now = Date.now();
    const lessonSlug = "4-8-vectors";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Vectors",
          slug: lessonSlug,
          description: "Students perform vector operations including addition, scalar multiplication, dot product, and compute magnitude and direction.",
          orderIndex: 8,
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
          title: "Vectors",
          description: "Students perform vector operations including addition, scalar multiplication, dot product, and compute magnitude and direction.",
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
                    question: "The magnitude of $\\vec{v} = \\langle 3, 4 \\rangle$ is:",
                    options: ["5", "7", "12", "25"],
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
              markdown: "## Vectors\n\n### Notation\n\n$$\\vec{v} = \\langle v_1, v_2 \\rangle = v_1\\hat{i} + v_2\\hat{j}$$\n\n### Magnitude\n\n$$|\\vec{v}| = \\sqrt{v_1^2 + v_2^2}$$\n\n### Direction\n\n$$\\theta = \\arctan\\left(\\frac{v_2}{v_1}\\right)$$  (adjust for quadrant)\n\n### Operations\n\n- **Addition**: $\\langle a, b \\rangle + \\langle c, d \\rangle = \\langle a+c, b+d \\rangle$\n- **Scalar multiplication**: $k\\langle a, b \\rangle = \\langle ka, kb \\rangle$\n- **Dot product**: $\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2$\n- **Angle between vectors**: $\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{u}||\\vec{v}|}$\n\n### Unit Vector\n\n$$\\hat{u} = \\frac{\\vec{u}}{|\\vec{u}|}$$\n\n### Parallel and Perpendicular\n\n- Parallel: $\\vec{u} = k\\vec{v}$ for some scalar $k$\n- Perpendicular: $\\vec{u} \\cdot \\vec{v} = 0$",
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
              markdown: "## Example: Vector Operations\n\nGiven $\\vec{u} = \\langle 2, 3 \\rangle$ and $\\vec{v} = \\langle -1, 4 \\rangle$, find $2\\vec{u} - \\vec{v}$, $\\vec{u} \\cdot \\vec{v}$, and the angle between them.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Vectors u=<2,3>, v=<-1,4>",
                steps: [
                  { expression: "2u - v = <4,6> - <-1,4> = <5,2>", explanation: "Scalar multiply then subtract" },
                  { expression: "u · v = 2(-1) + 3(4) = -2 + 12 = 10", explanation: "Dot product" },
                  { expression: "|u| = √(4+9) = √13, |v| = √(1+16) = √17", explanation: "Magnitudes" },
                  { expression: "cos θ = 10/(√13 · √17) = 10/√221", explanation: "Cosine of angle" },
                  { expression: "θ ≈ 47.7°", explanation: "Angle between vectors" },
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
                    question: "Two vectors are perpendicular when their dot product equals:",
                    options: ["1", "0", "-1", "Undefined"],
                    correctIndex: 1,
                  },
                  {
                    question: "The unit vector in the direction of $\\langle 6, 8 \\rangle$ is:",
                    options: ["⟨3, 4⟩", "⟨6/10, 8/10⟩", "⟨1, 1⟩", "⟨6, 8⟩"],
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
                equation: "Find angle between u=<1,√3> and v=<-√3,1>",
                steps: [
                  { expression: "u · v = 1(-√3) + √3(1) = -√3 + √3 = 0", explanation: "Dot product" },
                  { expression: "cos θ = 0/(|u||v|) = 0", explanation: "Cosine is 0" },
                  { expression: "θ = 90°", explanation: "Vectors are perpendicular" },
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
