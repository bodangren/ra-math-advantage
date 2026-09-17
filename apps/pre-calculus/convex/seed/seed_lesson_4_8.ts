import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_8Result> => {
    const now = Date.now();
    const lessonSlug = "4-8-vectors";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Vectors",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.8: Vectors",
          orderIndex: 8,
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
          title: "Vectors",
          description: "AP Precalculus Topic 4.8: Vectors",
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
          "markdown": "A hiker walks 3 miles east and 4 miles north. How far is she from the starting point? The direct distance is 5 miles — but the *displacement* is more than a number. It has both magnitude (5 miles) and direction (northeast). A **vector** captures both of these quantities in a single mathematical object."
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
          "markdown": "- **Vector**: A quantity with both magnitude and direction, written as $langle a, brangle$ (component form).\n- **Component**: The individual entries $a$ and $b$ of $langle a, brangle$. $a$ is the horizontal component; $b$ is the vertical.\n- **Magnitude**: The length of the vector: $|langle a, brangle| = \\sqrt{a^2 + b^2}$.\n- **Unit vector**: A vector with magnitude 1. The standard unit vectors are $\\mathbf{i} = langle 1, 0rangle$ and $\\mathbf{j} = langle 0, 1rangle$.\n- **Direction angle**: The angle $\\theta$ the vector makes with the positive $x$-axis: $\\theta = \\arctan\\left(\\frac{b}{a}\\right)$."
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
          "markdown": "A **vector** $\\mathbf{v} = langle a, brangle$ has two components. Its **magnitude** is:\n\n$$|\\mathbf{v}| = \\sqrt{a^2 + b^2}$$\n\n**Operations**:\n- **Addition**: $langle a_1, b_1rangle + langle a_2, b_2rangle = langle a_1 + a_2, b_1 + b_2rangle$\n- **Scalar multiplication**: $c langle a, brangle = langle ca, cbrangle$\n- **Subtraction**: $\\mathbf{u} - \\mathbf{v} = \\mathbf{u} + (-\\mathbf{v})$\n\n**Geometric meaning**: Addition corresponds to placing vectors tip-to-tail. Scalar multiplication stretches or reverses the vector.\n\n**Unit vector in the direction of $\\mathbf{v}$**: $\\frac{\\mathbf{v}}{|\\mathbf{v}|}$ — same direction, magnitude 1."
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
          "markdown": "**Example 1:** Given $\\mathbf{u} = langle 3, -4rangle$ and $\\mathbf{v} = langle -1, 7rangle$:\n\n**(a)** Find $\\mathbf{u} + \\mathbf{v}$:\n$$langle 3 + (-1), -4 + 7rangle = langle 2, 3rangle$$\n\n**(b)** Find $|\\mathbf{u}|$:\n$$\\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$\n\n**(c)** Find the unit vector in the direction of $\\mathbf{v}$:\n$$|\\mathbf{v}| = \\sqrt{(-1)^2 + 7^2} = \\sqrt{50} = 5\\sqrt{2}$$\n$$\\frac{\\mathbf{v}}{|\\mathbf{v}|} = leftlangle \\frac{-1}{5\\sqrt{2}}, \\frac{7}{5\\sqrt{2}}rightrangle = leftlangle \\frac{-\\sqrt{2}}{10}, \\frac{7\\sqrt{2}}{10}rightrangle$$"
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
          "markdown": "**Problem 1:** Find $\\mathbf{u} + \\mathbf{v}$ and $|\\mathbf{u} + \\mathbf{v}|$ for $\\mathbf{u} = langle 5, 2rangle$ and $\\mathbf{v} = langle -3, 4rangle$.\n\n**Hint:** Add components, then compute the magnitude of the result.\n\n**Problem 2:** Find $3\\mathbf{u} - 2\\mathbf{v}$ for $\\mathbf{u} = langle 1, -1rangle$ and $\\mathbf{v} = langle 4, 3rangle$."
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
          "markdown": "**Problem 1:** A displacement vector has magnitude 10 and direction angle $\\theta = 60°$. Find its component form.\n\n**Problem 2:** Find the magnitude and direction angle of $langle -6, 8rangle$.\n\n**Problem 3:** If $\\mathbf{v} = langle 3, -1rangle$, find the unit vector in the direction of $\\mathbf{v}$."
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
          "markdown": "**Exit Ticket:** Find the magnitude of $langle 7, -24rangle$ and the direction angle.\n\n**Lesson Summary:** Vectors capture magnitude and direction. Operations include addition, scalar multiplication, and finding magnitude. Unit vectors normalize direction to length 1."
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
