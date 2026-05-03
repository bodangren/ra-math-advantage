import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_14Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_14 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_14Result> => {
    const now = Date.now();
    const lessonSlug = "4-14-matrix-inverses";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Matrix Inverses",
          slug: lessonSlug,
          description: "Students compute matrix inverses using the adjugate method and row reduction, and use inverses to solve systems.",
          orderIndex: 14,
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
          title: "Matrix Inverses",
          description: "Students compute matrix inverses using the adjugate method and row reduction, and use inverses to solve systems.",
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
                    question: "A matrix has an inverse if and only if its determinant is:",
                    options: ["Zero", "Nonzero", "Positive", "Negative"],
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
              markdown: "## Matrix Inverses\n\n### Definition\n\n$A^{-1}$ satisfies $AA^{-1} = A^{-1}A = I$.\n\n### 2×2 Formula\n\n$$A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\implies A^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$$\n\n### Existence\n\n- $A$ is **invertible** (nonsingular) iff $\\det(A) \\ne 0$\n- Square matrices only\n- A system $Ax = b$ has unique solution $x = A^{-1}b$ iff $A$ is invertible\n\n### Row Reduction Method\n\nForm $[A | I]$ and row reduce to $[I | A^{-1}]$.\n\n### Properties\n\n- $(AB)^{-1} = B^{-1}A^{-1}$ (reverse order!)\n- $(A^{-1})^{-1} = A$\n- $(A^T)^{-1} = (A^{-1})^T$\n- $\\det(A^{-1}) = 1/\\det(A)$\n\n### Using Inverses to Solve Systems\n\n$$A\\vec{x} = \\vec{b} \\implies \\vec{x} = A^{-1}\\vec{b}$$",
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
              markdown: "## Example: Find the Inverse\n\nFind $A^{-1}$ for $A = \\begin{pmatrix} 3 & 1 \\\\ 2 & 4 \\end{pmatrix}$ and use it to solve $A\\vec{x} = \\begin{pmatrix} 5 \\\\ 10 \\end{pmatrix}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "A = [[3,1],[2,4]], solve Ax = [5,10]",
                steps: [
                  { expression: "det(A) = 3(4) - 1(2) = 12 - 2 = 10", explanation: "Determinant" },
                  { expression: "A⁻¹ = (1/10)[[4,-1],[-2,3]]", explanation: "2×2 inverse formula" },
                  { expression: "x = A⁻¹b = (1/10)[[4,-1],[-2,3]][[5],[10]]", explanation: "Multiply" },
                  { expression: "= (1/10)[[20-10],[-10+30]] = (1/10)[[10],[20]]", explanation: "Compute" },
                  { expression: "x = [[1],[2]] → x=1, y=2", explanation: "Solution" },
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Row reduce [A|I] for A = [[1,2],[3,7]]",
                steps: [
                  { expression: "[[1,2|1,0],[3,7|0,1]]", explanation: "Augmented [A|I]" },
                  { expression: "R₂←R₂-3R₁: [[1,2|1,0],[0,1|-3,1]]", explanation: "Eliminate" },
                  { expression: "R₁←R₁-2R₂: [[1,0|7,-2],[0,1|-3,1]]", explanation: "Back-substitute" },
                  { expression: "A⁻¹ = [[7,-2],[-3,1]]", explanation: "Inverse is right half" },
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
                equation: "Verify (AB)⁻¹ = B⁻¹A⁻¹ for A=[[1,0],[1,1]], B=[[2,1],[0,1]]",
                steps: [
                  { expression: "AB = [[2,1],[2,2]]", explanation: "Multiply A and B" },
                  { expression: "det(AB) = 4-2 = 2, (AB)⁻¹ = (1/2)[[2,-1],[-2,2]]", explanation: "Inverse of AB" },
                  { expression: "A⁻¹ = [[1,0],[-1,1]], B⁻¹ = (1/2)[[1,-1],[0,2]]", explanation: "Individual inverses" },
                  { expression: "B⁻¹A⁻¹ = (1/2)[[2,-1],[-2,2]]", explanation: "Multiply in reverse order" },
                  { expression: "(AB)⁻¹ = B⁻¹A⁻¹ ✓", explanation: "Property verified" },
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
