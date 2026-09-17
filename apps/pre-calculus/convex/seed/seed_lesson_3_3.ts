import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_3Result> => {
    const now = Date.now();
    const lessonSlug = "3-3-trig-functions-unit-circle";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sine and Cosine Function Values",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.3: Sine and Cosine Function Values",
          orderIndex: 3,
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
          title: "Sine and Cosine Function Values",
          description: "AP Precalculus Topic 3.3: Sine and Cosine Function Values",
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
          "markdown": "An equilateral triangle with side length 1 is inscribed in the unit circle, with one vertex on the positive x-axis. The angle at the origin for one of the other vertices is $\\pi/6$. Can you find the exact coordinates of that point on the unit circle? What about the point at $\\pi/4$?\n\nThese geometric constructions give us exact sine and cosine values at key angles — values you will use throughout the entire trigonometry unit."
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
          "markdown": "- **Special angles**: Angles that are multiples of $\\pi/6$, $\\pi/4$, $\\pi/3$, and $\\pi/2$ — they have exact sine and cosine values.\n- **Pythagorean identity**: The equation $\\sin^2\\theta + \\cos^2\\theta = 1$, which holds for every angle $\\theta$ and follows from the Pythagorean theorem on the unit circle.\n- **Reference angle**: The acute angle between the terminal ray and the x-axis, used to find trig values in any quadrant.\n\nOn the unit circle, $\\cos \\theta$ and $\\sin \\theta$ are the $x$- and $y$-coordinates of the point at angle $\\theta$. The coordinates of any point on a circle of radius $r$ are $(r\\cos \\theta, r\\sin \\theta)$."
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
          "markdown": "The coordinates of a point on a circle of radius $r$ can be written as $(r\\cos \\theta, r\\sin \\theta)$. On the unit circle ($r = 1$), $\\cos \\theta$ is the $x$-coordinate and $\\sin \\theta$ is the $y$-coordinate.\n\n**Geometric derivation of special values:**\n\nFor $\\theta = \\pi/6$: An equilateral triangle inscribed in the unit circle has a vertex at height $y = 1/2$. By the Pythagorean theorem, $x = \\sqrt{1 - (1/2)^2} = \\sqrt{3}/2$. So $\\cos(\\pi/6) = \\sqrt{3}/2$ and $\\sin(\\pi/6) = 1/2$.\n\nFor $\\theta = \\pi/4$: An isosceles right triangle gives $x = y$ and $x^2 + y^2 = 1$, so $2x^2 = 1$ and $x = y = \\sqrt{2}/2$.\n\nFor $\\theta = \\pi/3$: By symmetry, $\\cos(\\pi/3) = 1/2$ and $\\sin(\\pi/3) = \\sqrt{3}/2$.\n\nThese three sets of values in quadrant I are the foundation. All other unit circle values are obtained by reflecting across axes — changing signs as appropriate for each quadrant.\n\n$$\\sin^2\\theta + \\cos^2\\theta = 1 \\quad \\text{for all } \\theta$$"
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
          "markdown": "**Example 1:** Find the exact value of $\\sin(2\\pi/3)$.\n\n**Solution:** The angle $2\\pi/3$ is in quadrant II. Its reference angle is $\\pi - 2\\pi/3 = \\pi/3$. In quadrant II, sine is positive. $\\sin(2\\pi/3) = \\sin(\\pi/3) = \\frac{\\sqrt{3}}{2}$\n\n**Example 2:** Find the exact value of $\\cos(5\\pi/4)$.\n\n**Solution:** The angle $5\\pi/4$ is in quadrant III. Reference angle: $5\\pi/4 - \\pi = \\pi/4$. In quadrant III, cosine is negative. $\\cos(5\\pi/4) = -\\frac{\\sqrt{2}}{2}$\n\n**Example 3:** Find $\\sin(7\\pi/6)$, $\\cos(11\\pi/6)$, and $\\sin(3\\pi/2)$.\n\n**Solution:**\n- $\\sin(7\\pi/6)$: Quadrant III, reference angle $\\pi/6$. Sine is negative. Result: $-\\frac{1}{2}$\n- $\\cos(11\\pi/6)$: Quadrant IV, reference angle $\\pi/6$. Cosine is positive. Result: $\\frac{\\sqrt{3}}{2}$\n- $\\sin(3\\pi/2)$: On the negative $y$-axis. Result: $-1$\n\n**Example 4:** The point $P$ is on a circle of radius 4 with an equilateral triangle. If the angle at $P$ is $2\\pi/3$, find the coordinates of $P$.\n\n**Solution:** $P = (4\\cos(2\\pi/3), 4\\sin(2\\pi/3)) = (4 \\cdot (-1/2), 4 \\cdot (\\sqrt{3}/2)) = (-2, 2\\sqrt{3})$"
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
          "markdown": "**Problem 1:** Find the exact values of $\\sin(5\\pi/6)$ and $\\cos(5\\pi/6)$.\n\n**Hint:** $5\\pi/6$ is in quadrant II with reference angle $\\pi/6$. In quadrant II, sine is positive and cosine is negative.\n\n**Problem 2:** Find the exact value of $\\cos(4\\pi/3)$.\n\n**Hint:** $4\\pi/3$ is in quadrant III with reference angle $\\pi/3$. Cosine is negative in quadrant III.\n\n**Problem 3:** If $\\cos \\theta = 3/5$ and $\\theta$ is in quadrant IV, find $\\sin \\theta$ using the Pythagorean identity.\n\n**Hint:** $\\sin^2\\theta = 1 - \\cos^2\\theta = 1 - 9/25 = 16/25$. In quadrant IV, sine is negative."
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
          "markdown": "**Problem 1:** Find exact values without a calculator: $\\sin(5\\pi/3)$, $\\cos(3\\pi/4)$, $\\sin(\\pi/3)$, $\\cos(7\\pi/6)$.\n\n**Problem 2:** Find exact values: $\\tan(11\\pi/6)$, $\\cos(2\\pi/3)$, $\\sin(7\\pi/4)$, $\\cos(\\pi/6)$.\n\n**Problem 3:** A circle has radius 9 with an isosceles right triangle giving an angle of $\\pi/4$. Find the coordinates of the point on the terminal ray.\n\n**Problem 4:** If $\\sin \\theta = -\\sqrt{3}/2$ and $\\theta$ is in quadrant III, find $\\cos \\theta$."
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
          "markdown": "**Exit Ticket:** Find the exact values of $\\sin(5\\pi/3)$, $\\cos(2\\pi/3)$, and $\\sin(7\\pi/6)$.\n\n**Lesson Summary:** Exact sine and cosine values at special angles come from geometric constructions — equilateral triangles for $\\pi/6$ and $\\pi/3$, isosceles right triangles for $\\pi/4$. The three quadrant I coordinate pairs $(\\sqrt{3}/2, 1/2)$, $(\\sqrt{2}/2, \\sqrt{2}/2)$, and $(1/2, \\sqrt{3}/2)$ are the foundation. All other values are found by reflecting into the correct quadrant and adjusting signs. The Pythagorean identity $\\sin^2\\theta + \\cos^2\\theta = 1$ connects sine and cosine for every angle."
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
