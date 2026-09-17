import { upsertLessonPhases } from "./lesson_phases";
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
          title: "Matrices",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.10: Matrices",
          orderIndex: 10,
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
          title: "Matrices",
          description: "AP Precalculus Topic 4.10: Matrices",
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
          "markdown": "A school offers three sports, and enrollment data is organized in a grid:\n\n| | Freshmen | Sophomores |\n|---|---|---|\n| Soccer | 24 | 31 |\n| Track | 18 | 27 |\n| Swim | 12 | 15 |\n\nThis rectangular array of numbers is a **matrix**. Matrices organize data and enable systematic calculations — adding enrollments, scaling budgets, and transforming coordinates."
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
          "markdown": "- **Matrix**: A rectangular array of numbers arranged in rows and columns, written in brackets.\n- **Dimensions**: An $m \\times n$ matrix has $m$ rows and $n$ columns.\n- **Element (entry)**: The number in row $i$ and column $j$, denoted $a_{ij}$.\n- **Row matrix**: A $1 \\times n$ matrix (also called a row vector).\n- **Column matrix**: An $m \\times 1$ matrix (also called a column vector)."
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
          "markdown": "A **matrix** $A$ of size $m \\times n$ is written:\n\n$$A = \\begin{bmatrix} a_{11} & a_{12} & \\cdots & a_{1n} \\\\ a_{21} & a_{22} & \\cdots & a_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m1} & a_{m2} & \\cdots & a_{mn} \\end{bmatrix}$$\n\n**Matrix addition and subtraction**: Add or subtract corresponding entries (matrices must have the same dimensions).\n\n$$\\begin{bmatrix} 1 & 3 \\\\ 2 & 4 \\end{bmatrix} + \\begin{bmatrix} 5 & 1 \\\\ 0 & 2 \\end{bmatrix} = \\begin{bmatrix} 6 & 4 \\\\ 2 & 6 \\end{bmatrix}$$\n\n**Scalar multiplication**: Multiply every entry by the scalar.\n\n$$3 \\begin{bmatrix} 2 & -1 \\\\ 0 & 4 \\end{bmatrix} = \\begin{bmatrix} 6 & -3 \\\\ 0 & 12 \\end{bmatrix}$$\n\n**Matrix multiplication**: $A \\times B$ is defined when columns of $A$ = rows of $B$. Entry $(i, j)$ is the dot product of row $i$ of $A$ and column $j$ of $B$. Multiplication is **not** commutative — $AB \\neq BA$ in general."
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
          "markdown": "**Example 1:** Let $A = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix}$ and $B = \\begin{bmatrix} 4 & 1 \\\\ -2 & 5 \\end{bmatrix}$.\n\n$$A + B = \\begin{bmatrix} 6 & 0 \\\\ -2 & 8 \\end{bmatrix}, \\quad 2A - B = \\begin{bmatrix} 0 & -3 \\\\ 2 & 1 \\end{bmatrix}$$\n\n**Example 2:** Multiply $A = \\begin{bmatrix} 1 & 3 \\\\ 2 & -1 \\end{bmatrix}$ by $B = \\begin{bmatrix} 4 \\\\ 5 \\end{bmatrix}$.\n\n$$AB = \\begin{bmatrix} 1(4) + 3(5) \\\\ 2(4) + (-1)(5) \\end{bmatrix} = \\begin{bmatrix} 19 \\\\ 3 \\end{bmatrix}$$"
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
          "markdown": "**Problem 1:** Compute $\\begin{bmatrix} 3 & 0 \\\\ -1 & 2 \\end{bmatrix} + \\begin{bmatrix} -1 & 5 \\\\ 4 & -3 \\end{bmatrix}$.\n\n**Hint:** Add corresponding entries.\n\n**Problem 2:** Compute $\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 0 & 1 \\\\ -1 & 2 \\end{bmatrix}$.\n\n**Hint:** Row 1 of the result = $1(0) + 2(-1)$ and $1(1) + 2(2)$."
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
          "markdown": "**Problem 1:** Let $A = \\begin{bmatrix} 1 & -2 \\\\ 3 & 0 \\end{bmatrix}$. Find $3A$.\n\n**Problem 2:** Let $A = \\begin{bmatrix} 2 & 1 \\\\ 0 & -1 \\end{bmatrix}$ and $B = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$. Find $AB$.\n\n**Problem 3:** Explain why $\\begin{bmatrix} 1 & 2 & 3 \\end{bmatrix} \\begin{bmatrix} 4 & 5 \\\\ 6 & 7 \\end{bmatrix}$ is undefined."
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
          "markdown": "**Exit Ticket:** Compute $\\begin{bmatrix} 2 & -3 \\\\ 1 & 4 \\end{bmatrix} \\begin{bmatrix} 5 \\\\ -2 \\end{bmatrix}$.\n\n**Lesson Summary:** Matrices are rectangular arrays that organize and transform data. Addition requires matching dimensions. Multiplication requires matching inner dimensions and uses dot products. Matrix multiplication is not commutative."
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
