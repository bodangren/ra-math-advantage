import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_11Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_11 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_11Result> => {
    const now = Date.now();
    const lessonSlug = "4-11-matrix-transformations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Matrix Transformations",
          slug: lessonSlug,
          description: "Students use matrices to represent and apply geometric transformations including reflections, rotations, dilations, and shears.",
          orderIndex: 11,
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
          title: "Matrix Transformations",
          description: "Students use matrices to represent and apply geometric transformations including reflections, rotations, dilations, and shears.",
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
                prompt: "Apply the matrix [[0,-1],[1,0]] to the vertices of a square. What transformation is this?",
                defaultExpressions: ["(x,y) → (-y,x)"],
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
              markdown: "## Matrix Transformations\n\n### Standard 2D Transformations\n\n| Transformation | Matrix |\n|---|---|\n| Reflection over x-axis | $\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$ |\n| Reflection over y-axis | $\\begin{pmatrix} -1 & 0 \\\\ 0 & 1 \\end{pmatrix}$ |\n| Reflection over $y=x$ | $\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$ |\n| Rotation by $\\theta$ | $\\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}$ |\n| Dilation by factor $k$ | $\\begin{pmatrix} k & 0 \\\\ 0 & k \\end{pmatrix}$ |\n| Horizontal shear | $\\begin{pmatrix} 1 & k \\\\ 0 & 1 \\end{pmatrix}$ |\n\n### Applying Transformations\n\nMultiply the transformation matrix by each point (as a column vector):\n$$\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix}$$\n\n### Composing Transformations\n\nApply $B$ then $A$: multiply $AB$ (right to left).\n\n### Determinant\n\n$$\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$$\n\nThe determinant gives the **area scaling factor**.",
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
              markdown: "## Example: Rotate a Triangle\n\nRotate the triangle with vertices $A(1,0)$, $B(0,1)$, $C(0,0)$ by 90° counterclockwise.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Rotate by 90°: R = [[0,-1],[1,0]]",
                steps: [
                  { expression: "R = [[cos90°, -sin90°], [sin90°, cos90°]] = [[0,-1],[1,0]]", explanation: "Rotation matrix" },
                  { expression: "A' = [[0,-1],[1,0]][[1],[0]] = [[0],[1]]", explanation: "Rotate A(1,0)" },
                  { expression: "B' = [[0,-1],[1,0]][[0],[1]] = [[-1],[0]]", explanation: "Rotate B(0,1)" },
                  { expression: "C' = [[0,-1],[1,0]][[0],[0]] = [[0],[0]]", explanation: "Rotate C(0,0)" },
                  { expression: "New vertices: (0,1), (-1,0), (0,0)", explanation: "Rotated triangle" },
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
                    question: "The matrix [[1,0],[0,-1]] represents:",
                    options: ["Rotation 90°", "Reflection over x-axis", "Reflection over y-axis", "Dilation"],
                    correctIndex: 1,
                  },
                  {
                    question: "The determinant of [[3,1],[2,4]] is:",
                    options: ["10", "14", "12", "8"],
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
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Apply [[2,0],[0,2]] to point (3, -1)",
                steps: [
                  { expression: "[[2,0],[0,2]][[3],[-1]]", explanation: "Matrix-vector product" },
                  { expression: "x' = 2(3) + 0(-1) = 6", explanation: "New x-coordinate" },
                  { expression: "y' = 0(3) + 2(-1) = -2", explanation: "New y-coordinate" },
                  { expression: "(3,-1) → (6,-2)", explanation: "Dilation by factor 2" },
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
