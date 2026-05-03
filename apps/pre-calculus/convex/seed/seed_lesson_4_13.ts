import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_13Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_13 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_13Result> => {
    const now = Date.now();
    const lessonSlug = "4-13-matrix-applications";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Matrix Applications",
          slug: lessonSlug,
          description: "Students apply matrices to real-world problems including network flow, Leontief input-output models, and Markov chains.",
          orderIndex: 13,
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
          title: "Matrix Applications",
          description: "Students apply matrices to real-world problems including network flow, Leontief input-output models, and Markov chains.",
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
                    question: "A transition matrix for a Markov chain must have columns that:",
                    options: ["Sum to 0", "Sum to 1", "Are all equal", "Are orthogonal"],
                    correctIndex: 1,
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
              markdown: "## Matrix Applications\n\n### Markov Chains\n\nA **transition matrix** $P$ has entries $p_{ij}$ = probability of going from state $j$ to state $i$.\n\n- Columns sum to 1\n- State after $n$ steps: $\\vec{s}_n = P^n \\vec{s}_0$\n- **Steady state**: $P\\vec{s} = \\vec{s}$ (eigenvector for $\\lambda = 1$)\n\n### Leontief Input-Output Model\n\n$$\\vec{x} = A\\vec{x} + \\vec{d}$$\n\n- $\\vec{x}$ = total production\n- $A$ = input-output matrix (inter-industry flows)\n- $\\vec{d}$ = external demand\n- Solution: $\\vec{x} = (I - A)^{-1}\\vec{d}$\n\n### Network Flow\n\nAt each node: flow in = flow out. Set up a system of equations from the network diagram.\n\n### Cryptography\n\nEncode: multiply message vector by encoding matrix.\nDecode: multiply by inverse of encoding matrix.",
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
              markdown: "## Example: Markov Chain\n\nA weather model: if sunny today, 80% chance sunny tomorrow; if rainy, 60% chance rainy. Start sunny. Find steady state.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Transition: P = [[0.8,0.4],[0.2,0.6]]",
                steps: [
                  { expression: "P = [[0.8, 0.4], [0.2, 0.6]]", explanation: "Sunny→Sunny=0.8, Rain→Sunny=0.4" },
                  { expression: "Steady state: Ps = s, so (P-I)s = 0", explanation: "Eigenvector condition" },
                  { expression: "[[-0.2, 0.4], [0.2, -0.4]][[s₁],[s₂]] = [[0],[0]]", explanation: "(P-I)s = 0" },
                  { expression: "-0.2s₁ + 0.4s₂ = 0 → s₁ = 2s₂", explanation: "From first row" },
                  { expression: "s₁ + s₂ = 1 → 3s₂ = 1 → s₂ = 1/3, s₁ = 2/3", explanation: "Probabilities sum to 1" },
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
                    question: "In the Leontief model $\\vec{x} = A\\vec{x} + \\vec{d}$, $(I-A)^{-1}$ is called the:",
                    options: ["Production matrix", "Technology matrix", "Demand vector", "Consumption matrix"],
                    correctIndex: 0,
                  },
                  {
                    question: "After many steps, a Markov chain's state depends on:",
                    options: ["The initial state", "The transition matrix only", "Both equally", "Neither"],
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
                equation: "Leontief: A=[[0.2,0.1],[0.3,0.4]], d=[[10],[20]]",
                steps: [
                  { expression: "I-A = [[0.8,-0.1],[-0.3,0.6]]", explanation: "Compute I minus A" },
                  { expression: "det(I-A) = 0.48-0.03 = 0.45", explanation: "Determinant" },
                  { expression: "(I-A)⁻¹ = (1/0.45)[[0.6,0.1],[0.3,0.8]]", explanation: "Inverse" },
                  { expression: "x = (I-A)⁻¹ d = ...", explanation: "Multiply to find total production" },
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
