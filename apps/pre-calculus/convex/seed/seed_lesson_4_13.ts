import { upsertLessonPhases } from "./lesson_phases";
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
          title: "Matrices as Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.13: Matrices as Functions",
          orderIndex: 13,
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
          title: "Matrices as Functions",
          description: "AP Precalculus Topic 4.13: Matrices as Functions",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
  {
    "phaseNumber": 1,
    "title": "Explore",
    "phaseType": "explore",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "A $2 \\times 2$ matrix takes an input vector $langle x, yrangle$ and produces an output vector $langle x', y'rangle$. This is exactly what a function does — it maps inputs to outputs. Viewing matrices as functions lets us apply all our function concepts: domain, range, composition, and inverses."
        }
      }
    ]
  },
  {
    "phaseNumber": 2,
    "title": "Vocabulary",
    "phaseType": "vocabulary",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "- **Matrix function**: A function $T(\\mathbf{v}) = A\\mathbf{v}$ that maps vectors to vectors.\n- **Composition of transformations**: Applying one transformation after another, represented by matrix multiplication $BA$ (apply $A$ first, then $B$).\n- **Inverse transformation**: Applying $A^{-1}$ to undo the transformation $A$."
        }
      }
    ]
  },
  {
    "phaseNumber": 3,
    "title": "Learn",
    "phaseType": "learn",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "A $2 \\times 2$ matrix $A$ defines a **function** $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ where $T(\\mathbf{v}) = A\\mathbf{v}$.\n\n**Function concepts applied to matrices**:\n- **Domain**: All of $\\mathbb{R}^2$ (any vector can be input).\n- **Range**: The set of all output vectors $A\\mathbf{v}$. If $\\det(A) \\neq 0$, the range is all of $\\mathbb{R}^2$. If $\\det(A) = 0$, the range is a line or the origin (the transformation collapses space).\n- **One-to-one**: $A$ is one-to-one if and only if $\\det(A) \\neq 0$.\n- **Onto**: $A$ maps onto $\\mathbb{R}^2$ if and only if $\\det(A) \\neq 0$.\n\n**Composition**: If $T_1$ is represented by $A$ and $T_2$ by $B$, then applying $T_1$ then $T_2$ is $T_2(T_1(\\mathbf{v})) = B(A\\mathbf{v}) = (BA)\\mathbf{v}$. The composite transformation is represented by $BA$.\n\n**Inverse**: If $\\det(A) \\neq 0$, then $T^{-1}(\\mathbf{v}) = A^{-1}\\mathbf{v}$ undoes $T$."
        }
      }
    ]
  },
  {
    "phaseNumber": 4,
    "title": "Worked Example",
    "phaseType": "worked_example",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Example 1:** Let $A = \\begin{bmatrix} 1 & 2 \\\\ 0 & 1 \\end{bmatrix}$ and $B = \\begin{bmatrix} 3 & 0 \\\\ 0 & 1 \\end{bmatrix}$.\n\n**(a)** Find $T_2 circ T_1$ (apply $A$ then $B$):\n$$BA = \\begin{bmatrix} 3 & 0 \\\\ 0 & 1 \\end{bmatrix} \\begin{bmatrix} 1 & 2 \\\\ 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 3 & 6 \\\\ 0 & 1 \\end{bmatrix}$$\n\n**(b)** Verify with $\\mathbf{v} = langle 1, 1rangle$:\n- $T_1(\\mathbf{v}) = \\begin{bmatrix} 1 & 2 \\\\ 0 & 1 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}$\n- $T_2(\\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}) = \\begin{bmatrix} 3 & 0 \\\\ 0 & 1 \\end{bmatrix} \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 9 \\\\ 1 \\end{bmatrix}$\n- Direct: $BA \\mathbf{v} = \\begin{bmatrix} 3 & 6 \\\\ 0 & 1 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 9 \\\\ 1 \\end{bmatrix}$. ✓"
        }
      }
    ]
  },
  {
    "phaseNumber": 5,
    "title": "Guided Practice",
    "phaseType": "guided_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** Let $A = \\begin{bmatrix} 2 & 0 \\\\ 0 & 1 \\end{bmatrix}$ and $B = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$. Find the matrix for \"stretch horizontally by 2, then reflect over $x$-axis.\"\n\n**Hint:** Compute $BA$.\n\n**Problem 2:** Does $A = \\begin{bmatrix} 4 & 2 \\\\ 2 & 1 \\end{bmatrix}$ have an inverse? Is it one-to-one?"
        }
      }
    ]
  },
  {
    "phaseNumber": 6,
    "title": "Independent Practice",
    "phaseType": "independent_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** Let $A = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$ (90° rotation). Find $A^4$ and interpret the result.\n\n**Problem 2:** If $T_1$ is a horizontal stretch by 3 and $T_2$ is a reflection over $y = x$, find the composite matrix $T_2 circ T_1$.\n\n**Problem 3:** Explain why a transformation with $\\det(A) = 0$ is not one-to-one. Give an example."
        }
      }
    ]
  },
  {
    "phaseNumber": 7,
    "title": "Reflection",
    "phaseType": "reflection",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Exit Ticket:** Find the matrix representing a horizontal stretch by 2 followed by a vertical stretch by 3.\n\n**Lesson Summary:** Matrices define functions from vectors to vectors. Composition corresponds to matrix multiplication (order matters). Inverses exist when $\\det(A) \\neq 0$. A zero determinant means the transformation collapses space and is not one-to-one."
        }
      }
    ]
  }
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
