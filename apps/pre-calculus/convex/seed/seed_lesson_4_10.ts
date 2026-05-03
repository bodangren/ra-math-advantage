import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_10Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_10 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_10Result> => {
    const now = Date.now();
    const lessonSlug = "4-10-matrix-operations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Matrix Operations",
          slug: lessonSlug,
          description: "Students perform matrix addition, subtraction, scalar multiplication, and matrix multiplication.",
          orderIndex: 10,
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
          title: "Matrix Operations",
          description: "Students perform matrix addition, subtraction, scalar multiplication, and matrix multiplication.",
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
                    question: "To add two matrices, they must have:",
                    options: ["The same number of rows only", "The same dimensions", "Square dimensions", "At least one zero entry"],
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
              markdown: "## Matrix Operations\n\n### Matrix Addition/Subtraction\n\nSame dimensions required. Add/subtract corresponding entries.\n\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} + \\begin{pmatrix} e & f \\\\ g & h \\end{pmatrix} = \\begin{pmatrix} a+e & b+f \\\\ c+g & d+h \\end{pmatrix}$$\n\n### Scalar Multiplication\n\nMultiply every entry by the scalar:\n$$k \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = \\begin{pmatrix} ka & kb \\\\ kc & kd \\end{pmatrix}$$\n\n### Matrix Multiplication\n\n$A_{m \\times n} \\cdot B_{n \\times p} = C_{m \\times p}$\n\nEntry $c_{ij}$ = row $i$ of $A$ dotted with column $j$ of $B$.\n\n$$c_{ij} = \\sum_{k=1}^{n} a_{ik} b_{kj}$$\n\n**Important**: $AB \\ne BA$ in general (not commutative).\n\n### Identity Matrix\n\n$I_n$: 1s on diagonal, 0s elsewhere. $AI = IA = A$.\n\n### Zero Matrix\n\nAll entries are 0. $A + 0 = A$.",
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
              markdown: "## Example: Matrix Multiplication\n\nCompute $AB$ where $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ and $B = \\begin{pmatrix} 5 & 6 \\\\ 7 & 8 \\end{pmatrix}$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Multiply A = [[1,2],[3,4]] × B = [[5,6],[7,8]]",
                steps: [
                  { expression: "c₁₁ = 1(5) + 2(7) = 5 + 14 = 19", explanation: "Row 1 · Column 1" },
                  { expression: "c₁₂ = 1(6) + 2(8) = 6 + 16 = 22", explanation: "Row 1 · Column 2" },
                  { expression: "c₂₁ = 3(5) + 4(7) = 15 + 28 = 43", explanation: "Row 2 · Column 1" },
                  { expression: "c₂₂ = 3(6) + 4(8) = 18 + 32 = 50", explanation: "Row 2 · Column 2" },
                  { expression: "AB = [[19, 22], [43, 50]]", explanation: "Result matrix" },
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
                equation: "Compute [[2,0],[1,3]] × [[4],[5]]",
                steps: [
                  { expression: "c₁₁ = 2(4) + 0(5) = 8", explanation: "Row 1 · Column 1" },
                  { expression: "c₂₁ = 1(4) + 3(5) = 4 + 15 = 19", explanation: "Row 2 · Column 1" },
                  { expression: "Result: [[8], [19]]", explanation: "2×1 matrix" },
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
                equation: "Compute 3·[[1,-2],[0,4]] - [[2,1],[-3,5]]",
                steps: [
                  { expression: "3·[[1,-2],[0,4]] = [[3,-6],[0,12]]", explanation: "Scalar multiply" },
                  { expression: "[[3,-6],[0,12]] - [[2,1],[-3,5]]", explanation: "Subtract" },
                  { expression: "= [[3-2, -6-1], [0-(-3), 12-5]]", explanation: "Entry-wise" },
                  { expression: "= [[1, -7], [3, 7]]", explanation: "Simplify" },
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
