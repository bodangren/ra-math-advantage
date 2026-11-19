import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_2Result> => {
    const now = Date.now();
    const lessonSlug = "3-2-basic-trig-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sine, Cosine, and Tangent",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.2: Sine, Cosine, and Tangent",
          orderIndex: 2,
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
          title: "Sine, Cosine, and Tangent",
          description: "AP Precalculus Topic 3.2: Sine, Cosine, and Tangent",
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
                "A point $P$ lies on a circle of radius 5 centered at the origin. The ray from the origin through $P$ makes an angle $\\theta$ with the positive x-axis. Suppose $P$ has coordinates $(3, 4)$.\n\nCan you express the vertical position of $P$ as a ratio involving the radius? What about the horizontal position? These ratios turn out to define three fundamental functions that connect angles to coordinates.",
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
                "- **Standard position**: An angle is in standard position when its vertex is at the origin and one ray lies along the positive x-axis.\n- **Terminal ray**: The second ray of the angle — the one that rotates from the positive x-axis.\n- **Radian measure**: The ratio of the arc length to the radius. On the unit circle, the radian measure equals the arc length.\n- **Unit circle**: A circle centered at the origin with radius 1.\n- **sin $\\theta$**: The ratio of the vertical displacement to the radius — $\\sin \\theta = y/r$.\n- **cos $\\theta$**: The ratio of the horizontal displacement to the radius — $\\cos \\theta = x/r$.\n- **tan $\\theta$**: The slope of the terminal ray — $\\tan \\theta = y/x$ or $\\sin \\theta / \\cos \\theta$.",
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
                "An angle in **standard position** has its vertex at the origin with one ray on the positive x-axis. The **terminal ray** is the rotated second ray. For any point $(x, y)$ on the terminal ray at distance $r$ from the origin:\n\n$$\\sin \\theta = \\frac{y}{r}, \\quad \\cos \\theta = \\frac{x}{r}, \\quad \\tan \\theta = \\frac{y}{x}$$\n\nPositive angles are measured counterclockwise; negative angles are measured clockwise.\n\n**Radian measure** is defined as arc length divided by radius. A full rotation is $2\\pi$ radians (360°), a half rotation is $\\pi$, and a quarter rotation is $\\pi/2$. On the **unit circle** where $r = 1$, the definitions simplify:\n\n$$\\sin \\theta = y, \\quad \\cos \\theta = x, \\quad \\tan \\theta = \\frac{y}{x}$$\n\nThe tangent is undefined when $x = 0$ (the terminal ray is vertical), which occurs at $\\theta = \\pi/2, 3\\pi/2, \\ldots$.",
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
                "**Example 1:** Point $P$ is on a circle of radius 5 in standard position at coordinates $(3, 4)$. Find $\\sin \\theta$, $\\cos \\theta$, and $\\tan \\theta$.\n\n**Solution:**\n$$\\sin \\theta = \\frac{y}{r} = \\frac{4}{5}, \\quad \\cos \\theta = \\frac{x}{r} = \\frac{3}{5}, \\quad \\tan \\theta = \\frac{y}{x} = \\frac{4}{3}$$\n\n**Example 2:** Point $P(x, y)$ is on a circle. $Q$, $R$, and $S$ are reflections of $P$ across the y-axis, the origin, and the x-axis respectively. Find their coordinates.\n\n**Solution:**\n- $Q = (-x, y)$ (reflect across y-axis)\n- $R = (-x, -y)$ (reflect across origin)\n- $S = (x, -y)$ (reflect across x-axis)\n\n**Example 3:** The terminal ray of angle $\\theta$ lies on the line $y = -3x$ in quadrant II. Find $\\sin \\theta$, $\\cos \\theta$, and $\\tan \\theta$.\n\n**Solution:** In quadrant II, $x < 0$ and $y > 0$. Choose $P = (-1, 3)$. Then $r = \\sqrt{(-1)^2 + 3^2} = \\sqrt{10}$.\n$$\\sin \\theta = \\frac{3}{\\sqrt{10}}, \\quad \\cos \\theta = \\frac{-1}{\\sqrt{10}}, \\quad \\tan \\theta = \\frac{3}{-1} = -3$$\n\n**Example 4:** Convert to radians: (a) $1/6$ of a full rotation counterclockwise, (b) two full rotations clockwise.\n\n**Solution:**\n- (a) $\\frac{1}{6} \\times 2\\pi = \\frac{\\pi}{3}$\n- (b) $-2 \\times 2\\pi = -4\\pi$",
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
                "**Problem 1:** A circle has radius 7 and point $P(-5, y)$ in quadrant II lies on it. Find $y$, then compute $\\sin \\theta$ and $\\tan \\theta$.\n\n**Hint:** Use $x^2 + y^2 = r^2$ to find $y$. Remember $y > 0$ in quadrant II.\n\n**Problem 2:** Sketch the angle $\\frac{3\\pi}{4}$ in standard position. In which quadrant does the terminal ray land?\n\n**Hint:** $\\pi/2 < 3\\pi/4 < \\pi$, so the angle is in quadrant II.\n\n**Problem 3:** Point $P$ is on the unit circle at coordinates $(\\frac{1}{2}, \\frac{\\sqrt{3}}{2})$. Find $\\sin \\theta$, $\\cos \\theta$, and $\\tan \\theta$.\n\n**Hint:** On the unit circle, $\\sin \\theta = y$ and $\\cos \\theta = x$.",
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
                "**Problem 1:** A circle has radius 10 and point $P(6, 8)$. Points $Q$, $R$, and $S$ are reflections of $P$. Find $\\cos \\theta$ at $Q$, $\\sin \\theta$ at $S$, and $\\tan \\theta$ at $R$.\n\n**Problem 2:** The terminal ray of $\\theta$ lies on $y = -\\frac{5}{7}x$ in quadrant II. Find the exact values of $\\sin \\theta$, $\\cos \\theta$, and $\\tan \\theta$.\n\n**Problem 3:** Convert to radians: (a) $3/4$ of a rotation counterclockwise, (b) $7/8$ of a rotation counterclockwise, (c) one full rotation clockwise.\n\n**Problem 4:** Sketch these angles in standard position: $\\frac{2\\pi}{3}$, $\\frac{5\\pi}{4}$, $\\frac{11\\pi}{6}$, $-\\frac{\\pi}{3}$.",
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
                "**Exit Ticket:** Point $P$ is on the terminal ray of angle $\\theta$ with coordinates $(-5, 12)$. Find $\\sin \\theta$, $\\cos \\theta$, and $\\tan \\theta$.\n\n**Lesson Summary:** The trigonometric functions sine, cosine, and tangent connect angles to coordinates via $\\sin \\theta = y/r$, $\\cos \\theta = x/r$, and $\\tan \\theta = y/x$. On the unit circle, these simplify to $\\sin \\theta = y$ and $\\cos \\theta = x$. Radian measure expresses angles as arc-length-to-radius ratios, and the reflection pattern $(x, y) \\to (-x, y) \\to (-x, -y) \\to (x, -y)$ determines sign rules across quadrants.",
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
