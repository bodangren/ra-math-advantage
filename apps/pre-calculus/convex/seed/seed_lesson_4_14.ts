import { upsertLessonPhases } from "./lesson_phases";
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
          title: "Matrices Modeling Contexts",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.14: Matrices Modeling Contexts",
          orderIndex: 14,
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
          title: "Matrices Modeling Contexts",
          description: "AP Precalculus Topic 4.14: Matrices Modeling Contexts",
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
                "A store sells two products. On Monday it sells 10 of product A and 5 of product B; on Tuesday it sells 8 of A and 12 of B. Product A costs $3 and product B costs$7. The revenue for each day can be computed with a single matrix multiplication. Matrices model real-world problems where multiple quantities interact across multiple categories.",
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
                "- **Matrix model**: Using matrix multiplication to represent and solve a real-world problem.\n- **Coefficient matrix**: The matrix of coefficients in a system of equations.\n- **Input-output model**: A matrix representation showing how outputs of one sector become inputs of another.",
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
                "Matrices naturally model problems involving **multiple inputs and outputs**.\n\n**Revenue model**: If $S = \\begin{bmatrix} 10 & 5 \\\\ 8 & 12 \\end{bmatrix}$ (rows = days, columns = products) and $P = \\begin{bmatrix} 3 \\\\ 7 \\end{bmatrix}$ (prices), then:\n$$R = SP = \\begin{bmatrix} 10(3) + 5(7) \\\\ 8(3) + 12(7) \\end{bmatrix} = \\begin{bmatrix} 65 \\\\ 108 \\end{bmatrix}$$\nThe revenue vector gives Monday's and Tuesday's revenue.\n\n**Systems of equations**: The system $2x + 3y = 7$ and $x - y = 1$ can be written as:\n$$\\begin{bmatrix} 2 & 3 \\\\ 1 & -1 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 7 \\\\ 1 \\end{bmatrix}$$\n\nSolving: $\\mathbf{x} = A^{-1}\\mathbf{b}$, provided $\\det(A) \\neq 0$.\n\n**Modeling strategy**:\n1. Identify the quantities and organize them into matrices.\n2. Set up the matrix equation $A\\mathbf{x} = \\mathbf{b}$.\n3. Solve by multiplying both sides by $A^{-1}$: $\\mathbf{x} = A^{-1}\\mathbf{b}$.",
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
                "**Example:** A bakery makes cookies and cakes. Each batch of cookies uses 2 cups flour and 1 cup sugar. Each batch of cake uses 3 cups flour and 2 cups sugar. The bakery has 14 cups flour and 9 cups sugar. How many batches of each can be made?\n\n**Solution:**\nSet up the system:\n$$2x + 3y = 14$$\n$$x + 2y = 9$$\n\nMatrix form:\n$$\\begin{bmatrix} 2 & 3 \\\\ 1 & 2 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 14 \\\\ 9 \\end{bmatrix}$$\n\nFind $A^{-1}$:\n$\\det(A) = 2(2) - 3(1) = 1$\n$$A^{-1} = \\begin{bmatrix} 2 & -3 \\\\ -1 & 2 \\end{bmatrix}$$\n\nSolve:\n$$\\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 2 & -3 \\\\ -1 & 2 \\end{bmatrix} \\begin{bmatrix} 14 \\\\ 9 \\end{bmatrix} = \\begin{bmatrix} 28 - 27 \\\\ -14 + 18 \\end{bmatrix} = \\begin{bmatrix} 1 \\\\ 4 \\end{bmatrix}$$\n\nAnswer: 1 batch of cookies, 4 batches of cake.",
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
                "**Problem 1:** A school sells tickets: adult tickets cost $8 and student tickets cost$5. On Friday, 120 adult and 80 student tickets were sold; on Saturday, 95 adult and 110 student tickets were sold. Write a matrix equation for the total revenue each day.\n\n**Hint:** $R = \\begin{bmatrix} 120 & 80 \\\\ 95 & 110 \\end{bmatrix} \\begin{bmatrix} 8 \\\\ 5 \\end{bmatrix}$\n\n**Problem 2:** Solve $3x + y = 10$ and $x + 2y = 9$ using $A^{-1}$.",
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
                "**Problem 1:** A farmer plants corn and wheat. Each acre of corn uses 4 hours labor and 2 tons water; each acre of wheat uses 3 hours labor and 3 tons water. The farmer has 24 hours labor and 18 tons water available. Set up and solve using matrices.\n\n**Problem 2:** Verify the solution to Problem 1 by substituting back into the original equations.\n\n**Problem 3:** Explain why $A^{-1}$ cannot be used to solve a system where $\\det(A) = 0$. What does this mean geometrically?",
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
                "**Exit Ticket:** Write the system $5x - 2y = 11$ and $x + 3y = 7$ as a matrix equation $A\\mathbf{x} = \\mathbf{b}$.\n\n**Lesson Summary:** Matrices model real-world problems by organizing data and representing systems of equations. Solving $A\\mathbf{x} = \\mathbf{b}$ uses $\\mathbf{x} = A^{-1}\\mathbf{b}$. This approach works whenever $\\det(A) \\neq 0$.",
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
