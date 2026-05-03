import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_12Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_12 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_12Result> => {
    const now = Date.now();
    const lessonSlug = "4-12-matrix-systems";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Matrices for Systems of Equations",
          slug: lessonSlug,
          description: "Students write systems of linear equations in matrix form and solve using row reduction and augmented matrices.",
          orderIndex: 12,
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
          title: "Matrices for Systems of Equations",
          description: "Students write systems of linear equations in matrix form and solve using row reduction and augmented matrices.",
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
                    question: "The system 2x + y = 5, x - y = 1 in matrix form $Ax = b$ has coefficient matrix:",
                    options: ["[[2,1],[1,-1]]", "[[2,1,5],[1,-1,1]]", "[[5],[1]]", "[[2],[1]]"],
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
              markdown: "## Matrices for Systems of Equations\n\n### Matrix Form\n\nThe system:\n$$a_{11}x_1 + a_{12}x_2 = b_1$$\n$$a_{21}x_1 + a_{22}x_2 = b_2$$\n\nbecomes $A\\vec{x} = \\vec{b}$:\n$$\\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix} \\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix} = \\begin{pmatrix} b_1 \\\\ b_2 \\end{pmatrix}$$\n\n### Augmented Matrix\n\n$$\\left( \\begin{array}{cc|c} a_{11} & a_{12} & b_1 \\\\ a_{21} & a_{22} & b_2 \\end{array} \\right)$$\n\n### Row Operations\n\n1. **Swap** two rows\n2. **Scale** a row (multiply by nonzero constant)\n3. **Replace** a row with sum of itself and a multiple of another row\n\n### Gaussian Elimination\n\nUse row operations to achieve **row echelon form** (upper triangular), then **back-substitute**.\n\n### Gauss-Jordan Elimination\n\nContinue to **reduced row echelon form** (identity on left) for direct solution.\n\n### Solution Types\n\n- **Unique solution**: consistent, no free variables\n- **Infinitely many**: consistent, has free variables\n- **No solution**: inconsistent (row like $[0 \\; 0 \\; | \\; c]$ where $c \\ne 0$)",
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
              markdown: "## Example: Solve with Gauss-Jordan\n\nSolve $2x + y = 5$, $x - y = 1$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Augmented matrix for 2x+y=5, x-y=1",
                steps: [
                  { expression: "[[2,1|5],[1,-1|1]]", explanation: "Write augmented matrix" },
                  { expression: "R₂ ← R₂ - (1/2)R₁: [[2,1|5],[0,-3/2|-3/2]]", explanation: "Eliminate x from row 2" },
                  { expression: "R₂ ← (-2/3)R₂: [[2,1|5],[0,1|1]]", explanation: "Make leading 1 in row 2" },
                  { expression: "R₁ ← R₁ - R₂: [[2,0|4],[0,1|1]]", explanation: "Eliminate y from row 1" },
                  { expression: "R₁ ← (1/2)R₁: [[1,0|2],[0,1|1]]", explanation: "Reduced row echelon — x=2, y=1" },
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
                equation: "Solve x + 2y = 7, 3x - y = 4 via row reduction",
                steps: [
                  { expression: "[[1,2|7],[3,-1|4]]", explanation: "Augmented matrix" },
                  { expression: "R₂ ← R₂ - 3R₁: [[1,2|7],[0,-7|-17]]", explanation: "Eliminate" },
                  { expression: "R₂ ← (-1/7)R₂: [[1,2|7],[0,1|17/7]]", explanation: "Leading 1" },
                  { expression: "R₁ ← R₁ - 2R₂: [[1,0|15/7],[0,1|17/7]]", explanation: "Back-substitute" },
                  { expression: "x = 15/7, y = 17/7", explanation: "Solution" },
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
                equation: "Solve x + y + z = 6, 2x - y + z = 3, x + 2y - z = 2",
                steps: [
                  { expression: "[[1,1,1|6],[2,-1,1|3],[1,2,-1|2]]", explanation: "Augmented matrix" },
                  { expression: "R₂←R₂-2R₁, R₃←R₃-R₁: [[1,1,1|6],[0,-3,-1|-9],[0,1,-2|-4]]", explanation: "Eliminate first column" },
                  { expression: "R₃←R₃+(1/3)R₂: [[1,1,1|6],[0,-3,-1|-9],[0,0,-7/3|-7]]", explanation: "Eliminate second column" },
                  { expression: "z = 3, y = 2, x = 1", explanation: "Back-substitute" },
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
