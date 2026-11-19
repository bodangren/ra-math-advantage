import { upsertLessonPhases } from "./lesson_phases";
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
          title: "The Inverse and Determinant of a Matrix",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.11: The Inverse and Determinant of a Matrix",
          orderIndex: 11,
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
          title: "The Inverse and Determinant of a Matrix",
          description: "AP Precalculus Topic 4.11: The Inverse and Determinant of a Matrix",
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
                'For numbers, $5 \\times \\frac{1}{5} = 1$ — the reciprocal "undoes" multiplication. Can matrices do the same? If $A \\times A^{-1} = I$ (where $I$ is the identity matrix), then $A^{-1}$ is the **inverse** of $A$. Not every matrix has an inverse, and the **determinant** tells us which ones do.',
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
                "- **Identity matrix** ($I$): The matrix equivalent of 1. For $2 \\times 2$: $I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$.\n- **Inverse matrix** ($A^{-1}$): The matrix satisfying $AA^{-1} = A^{-1}A = I$.\n- **Determinant**: A scalar value $\\det(A)$ (or $|A|$) that indicates whether $A$ is invertible.\n- **Singular matrix**: A matrix with $\\det(A) = 0$ — it has no inverse.\n- **Non-singular matrix**: A matrix with $\\det(A) \\neq 0$ — it has an inverse.",
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
                '**Determinant of a $2 \\times 2$ matrix**:\n\n$$\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$$\n\nIf $\\det(A) = 0$, the matrix is **singular** (not invertible).\n\n**Inverse of a $2 \\times 2$ matrix**: When $\\det(A) \\neq 0$:\n\n$$A^{-1} = \\frac{1}{ad - bc} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$$\n\n**Verification**: $AA^{-1} = \\frac{1}{ad - bc} \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix} = \\frac{1}{ad - bc} \\begin{bmatrix} ad - bc & 0 \\\\ 0 & ad - bc \\end{bmatrix} = I$. ✓\n\n**Geometric meaning**: A zero determinant means the transformation represented by the matrix collapses space (no area). The inverse "reverses" the transformation.',
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
                "**Example 1:** Find the determinant and inverse of $A = \\begin{bmatrix} 3 & 1 \\\\ 2 & 4 \\end{bmatrix}$.\n\n**Solution:**\n$$\\det(A) = 3(4) - 1(2) = 12 - 2 = 10$$\n\nSince $\\det(A) \\neq 0$, the inverse exists:\n$$A^{-1} = \\frac{1}{10} \\begin{bmatrix} 4 & -1 \\\\ -2 & 3 \\end{bmatrix} = \\begin{bmatrix} 0.4 & -0.1 \\\\ -0.2 & 0.3 \\end{bmatrix}$$\n\n**Verification**: $AA^{-1} = \\begin{bmatrix} 3(0.4) + 1(-0.2) & 3(-0.1) + 1(0.3) \\\\ 2(0.4) + 4(-0.2) & 2(-0.1) + 4(0.3) \\end{bmatrix} = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$. ✓\n\n**Example 2:** Find the determinant of $B = \\begin{bmatrix} 6 & 3 \\\\ 4 & 2 \\end{bmatrix}$.\n\n$$\\det(B) = 6(2) - 3(4) = 12 - 12 = 0$$\n\n$B$ is **singular** — no inverse exists.",
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
                "**Problem 1:** Find the determinant of $\\begin{bmatrix} 5 & -2 \\\\ 3 & 1 \\end{bmatrix}$.\n\n**Hint:** Compute $ad - bc$.\n\n**Problem 2:** Find the inverse of $\\begin{bmatrix} 2 & 0 \\\\ 1 & 3 \\end{bmatrix}$, if it exists.",
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
                "**Problem 1:** Determine whether $\\begin{bmatrix} 4 & -1 \\\\ -8 & 2 \\end{bmatrix}$ has an inverse. Justify using the determinant.\n\n**Problem 2:** Find $A^{-1}$ for $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 7 \\end{bmatrix}$. Verify by computing $AA^{-1}$.\n\n**Problem 3:** If $\\det(A) = 5$ and $\\det(B) = -2$, what is $\\det(AB)$?",
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
                "**Exit Ticket:** Find the determinant of $\\begin{bmatrix} 7 & 2 \\\\ -3 & 5 \\end{bmatrix}$ and state whether the inverse exists.\n\n**Lesson Summary:** The determinant $ad - bc$ of a $2 \\times 2$ matrix determines invertibility. The inverse formula swaps diagonal entries, negates off-diagonal entries, and divides by the determinant. A zero determinant means the matrix has no inverse.",
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
