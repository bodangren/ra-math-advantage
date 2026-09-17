import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_9Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_9 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_9Result> => {
    const now = Date.now();
    const lessonSlug = "4-9-vector-valued-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Vector-Valued Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.9: Vector-Valued Functions",
          orderIndex: 9,
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
          title: "Vector-Valued Functions",
          description: "AP Precalculus Topic 4.9: Vector-Valued Functions",
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
          "markdown": "A drone's position at time $t$ is given by $\\mathbf{r}(t) = langle 4t, -16t^2 + 32trangle$. Instead of separate equations for $x$ and $y$, we write a single function that outputs a **vector**. This is a vector-valued function — it packages a parametric path into one compact object."
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
          "markdown": "- **Vector-valued function**: A function $\\mathbf{r}(t)$ whose output is a vector, typically $\\mathbf{r}(t) = langle x(t), y(t)rangle$.\n- **Component functions**: The individual functions $x(t)$ and $y(t)$ inside $\\mathbf{r}(t)$.\n- **Position vector**: A vector-valued function $\\mathbf{r}(t)$ that represents the position of an object at time $t$."
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
          "markdown": "A **vector-valued function** $\\mathbf{r}(t) = langle f(t), g(t)rangle$ maps a scalar $t$ to a vector. This is equivalent to a parametric function $(x(t), y(t))$ but uses vector notation.\n\n**Evaluating**: Substitute $t$ into both component functions:\n$$\\mathbf{r}(2) = langle f(2), g(2)rangle$$\n\n**Velocity and displacement**: The vector $\\mathbf{r}(t_2) - \\mathbf{r}(t_1)$ gives the **displacement** from time $t_1$ to $t_2$.\n\n**Average rate of change**: $\\frac{\\mathbf{r}(t_2) - \\mathbf{r}(t_1)}{t_2 - t_1}$ is a vector whose components are $\\frac{\\Delta x}{\\Delta t}$ and $\\frac{\\Delta y}{\\Delta t}$ — the average velocity vector.\n\n**Graphing**: Plot $\\mathbf{r}(t)$ for several values of $t$. Each output is a point in the plane. Connecting them traces the path."
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
          "markdown": "**Example:** Let $\\mathbf{r}(t) = langle t^2, 2t - 1rangle$.\n\n**(a)** Evaluate $\\mathbf{r}(0)$, $\\mathbf{r}(1)$, $\\mathbf{r}(3)$:\n- $\\mathbf{r}(0) = langle 0, -1rangle$\n- $\\mathbf{r}(1) = langle 1, 1rangle$\n- $\\mathbf{r}(3) = langle 9, 5rangle$\n\n**(b)** Find the displacement from $t = 1$ to $t = 3$:\n$$\\mathbf{r}(3) - \\mathbf{r}(1) = langle 9 - 1, 5 - 1rangle = langle 8, 4rangle$$\n\n**(c)** Find the average rate of change on $[1, 3]$:\n$$\\frac{\\mathbf{r}(3) - \\mathbf{r}(1)}{3 - 1} = \\frac{langle 8, 4rangle}{2} = langle 4, 2rangle$$\n\nInterpretation: On average, the object moves 4 units right and 2 units up per unit of $t$."
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
          "markdown": "**Problem 1:** Let $\\mathbf{r}(t) = langle 3t + 1, t^2rangle$. Find $\\mathbf{r}(2)$ and $\\mathbf{r}(5)$.\n\n**Hint:** Substitute each value of $t$ into both components.\n\n**Problem 2:** For $\\mathbf{r}(t) = langle 3t + 1, t^2rangle$, find the average rate of change on $[2, 5]$."
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
          "markdown": "**Problem 1:** Let $\\mathbf{r}(t) = langle \\cos(t), \\sin(t)rangle$. Evaluate $\\mathbf{r}(0)$, $\\mathbf{r}(\\frac{\\pi}{2})$, $\\mathbf{r}(\\pi)$. What curve do these points lie on?\n\n**Problem 2:** For $\\mathbf{r}(t) = langle t^3 - t, 2t + 1rangle$, find the displacement from $t = -1$ to $t = 2$.\n\n**Problem 3:** Explain how a vector-valued function relates to a parametric function. What is the advantage of vector notation?"
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
          "markdown": "**Exit Ticket:** Let $\\mathbf{r}(t) = langle 5 - t, t^2 - 4rangle$. Find $\\mathbf{r}(1)$ and the average rate of change on $[1, 3]$.\n\n**Lesson Summary:** Vector-valued functions package parametric paths into vector outputs. The average rate of change produces a velocity vector. Displacement is the difference of position vectors."
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
