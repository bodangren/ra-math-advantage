import { upsertLessonPhases } from "./lesson_phases";
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
          title: "Linear Transformations and Matrices",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.12: Linear Transformations and Matrices",
          orderIndex: 12,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId).eq("version", 2))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 2,
          title: "Linear Transformations and Matrices",
          description: "AP Precalculus Topic 4.12: Linear Transformations and Matrices",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "Stretch a rubber sheet by doubling its width and halving its height. Rotate a shape 90 degrees. Reflect a figure across the $y$-axis. Each of these operations is a **linear transformation** — and every $2 \\times 2$ matrix represents one. Matrices are not just number grids; they are machines that transform space.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "- **Linear transformation**: A function $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ that maps vectors to vectors and preserves vector addition and scalar multiplication.\n- **Image**: The result of applying a transformation to a point or shape.\n- **Pre-image**: The original shape before transformation.\n- **Standard matrix**: The $2 \\times 2$ matrix representing a linear transformation.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "A $2 \\times 2$ matrix $A$ acts as a **linear transformation** on every point $(x, y)$ via:\n\n$$\\begin{bmatrix} x' \\\\ y' \\end{bmatrix} = A \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix}$$\n\nThis produces $x' = ax + by$ and $y' = cx + dy$.\n\n**Common transformations**:\n\n| Transformation | Matrix | Effect |\n|----------------|--------|--------|\n| Reflection over $x$-axis | $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$ | $y \\to -y$ |\n| Reflection over $y$-axis | $\\begin{bmatrix} -1 & 0 \\\\ 0 & 1 \\end{bmatrix}$ | $x \\to -x$ |\n| Horizontal stretch by $k$ | $\\begin{bmatrix} k & 0 \\\\ 0 & 1 \\end{bmatrix}$ | $x \\to kx$ |\n| Vertical stretch by $k$ | $\\begin{bmatrix} 1 & 0 \\\\ 0 & k \\end{bmatrix}$ | $y \\to ky$ |\n| Rotation by $\\theta$ | $\\begin{bmatrix} \\cos(\\theta) & -\\sin(\\theta) \\\\ \\sin(\\theta) & \\cos(\\theta) \\end{bmatrix}$ | Rotates counterclockwise |\n\n**Determinant and area**: The absolute value of the determinant $\\det(A)$ gives the **area scaling factor**. If $\\det(A) = 3$, the image has 3 times the area of the pre-image.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Example 1:** The transformation $T$ reflects over the $x$-axis. Apply $T$ to the triangle with vertices $(1, 2)$, $(3, 1)$, $(2, 4)$.\n\n**Solution:** The reflection matrix is $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$.\n- $(1, 2) \\to (1, -2)$\n- $(3, 1) \\to (3, -1)$\n- $(2, 4) \\to (2, -4)$\n\n**Example 2:** What transformation does $A = \\begin{bmatrix} 2 & 0 \\\\ 0 & 3 \\end{bmatrix}$ perform?\n\n**Solution:** $x' = 2x$, $y' = 3y$. This stretches horizontally by 2 and vertically by 3.\n$\\det(A) = 6$, so area is multiplied by 6.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Guided Practice",
        phaseType: "guided_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** Apply $\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$ to the point $(3, 1)$. What transformation is this?\n\n**Hint:** Multiply the matrix by the column vector. Compare to the rotation matrix with $\\theta = 90°$.\n\n**Problem 2:** Find the area scaling factor for $\\begin{bmatrix} 4 & 1 \\\\ 2 & 3 \\end{bmatrix}$.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Independent Practice",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** A square with vertices $(0, 0)$, $(1, 0)$, $(1, 1)$, $(0, 1)$ is transformed by $A = \\begin{bmatrix} 2 & 0 \\\\ 0 & 1 \\end{bmatrix}$. Find the image and its area.\n\n**Problem 2:** Write the matrix for a reflection over the line $y = x$. Apply it to $(3, -2)$.\n\n**Problem 3:** If $\\det(A) = 0$, what happens to the area of any shape under transformation $A$? What does this mean geometrically?",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Reflection",
        phaseType: "reflection",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Exit Ticket:** The transformation $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$ maps $(a, b)$ to what point? What type of transformation is this?\n\n**Lesson Summary:** Linear transformations are represented by $2 \\times 2$ matrices. Common types include reflections, stretches, and rotations. The determinant gives the area scaling factor. A zero determinant collapses space.",
            },
          },
        ],
      },
    ] as const;

    const activitiesCreated = 0;

    const phasesCreated = await upsertLessonPhases(ctx, lessonVersionId, phaseData, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
