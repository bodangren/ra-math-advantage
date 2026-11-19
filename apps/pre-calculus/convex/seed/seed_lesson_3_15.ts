import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_15Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_15 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_15Result> => {
    const now = Date.now();
    const lessonSlug = "3-15-polar-representations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Rates of Change in Polar Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.15: Rates of Change in Polar Functions",
          orderIndex: 15,
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
          title: "Rates of Change in Polar Functions",
          description: "AP Precalculus Topic 3.15: Rates of Change in Polar Functions",
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
                "For $r = 3\\cos(\\theta)$, when $\\theta = 0$ we get $r = 3$ and when $\\theta = \\pi/2$ we get $r = 0$. The radius decreased. But what if $r$ were negative? If $r = -2$ and increases to $r = -1$, the actual distance from the origin *decreases* — the point moves closer. How does the sign of $r$ change the relationship between the direction of $r$ and the distance from the origin?",
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
                "- **Signed radius**: $r$ can be positive or negative. When $r < 0$, the point plots in the opposite direction from $\\theta$, but the **distance** from the origin is $|r|$.\n- **Distance-from-origin behavior**: Determined by both the sign and the monotonicity (increasing/decreasing) of $r$.\n- **Average rate of change**: $\\frac{f(b) - f(a)}{b - a}$ over the interval $[a, b]$ — the rate at which $r$ changes per radian of $\\theta$.\n- **Relative extremum**: Where $r$ changes from increasing to decreasing (relative max) or decreasing to increasing (relative min), corresponding to a point farthest from or closest to the origin.",
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
                "Given a polar function $r = f(\\theta)$, the value $r$ is a **signed radius**. The actual distance from the origin is $|r|$. This means the sign of $r$ affects how we interpret increasing and decreasing behavior:\n\n| $r$ behavior | Distance to origin |\n|---|---|\n| $r$ positive and increasing | Distance increasing |\n| $r$ positive and decreasing | Distance decreasing |\n| $r$ negative and increasing | Distance **decreasing** |\n| $r$ negative and decreasing | Distance **increasing** |\n\nThe key insight: when $r$ is negative, increasing $r$ means moving *toward* zero (closer to the origin), and decreasing $r$ means moving *away from* zero (farther from the origin).\n\n**Relative extrema**: If $r$ changes from increasing to decreasing (or vice versa), the function has a relative extremum — a point closest to or farthest from the origin.\n\n**Average rate of change** of $r$ with respect to $\\theta$ over $[a, b]$:\n\n$$\\frac{f(b) - f(a)}{b - a}$$\n\nThis measures the rate at which the radius changes per radian. It can estimate $f(\\theta)$ within the interval using point-slope form: $r - r_1 = \\text{(avg rate)}(\\theta - \\theta_1)$.\n\n**AP exam tip**: It often helps to sketch $r = f(\\theta)$ in rectangular coordinates (with $\\theta$ on the horizontal axis and $r$ on the vertical axis) to visualize sign and monotonicity.",
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
                "**Example 1:** For a polar function, $r$ is positive and increasing on $[0, \\pi/2]$. What happens to the distance from the origin?\n\n**Solution:**\n- $r$ positive: distance equals $r$.\n- $r$ increasing: distance is **increasing**. The point moves away from the origin.\n\n**Example 2:** $r$ is negative and increasing on $[\\pi, 3\\pi/2]$. What happens to the distance?\n\n**Solution:**\n- $r$ negative: distance equals $-r$.\n- $r$ increasing (becoming less negative): $-r$ is **decreasing**.\n- Distance is **decreasing**. The point moves closer to the origin.\n\n**Example 3:** For a polar function, $f(\\pi/6) = 2$ and $f(\\pi/3) = 5$. Find the average rate of change on $[\\pi/6, \\pi/3]$.\n\n**Solution:**\n- $\\frac{5 - 2}{\\pi/3 - \\pi/6} = \\frac{3}{\\pi/6} = \\frac{18}{\\pi}$\n- The radius increases by $18/\\pi$ units per radian on this interval.\n\n**Example 4:** Using Example 3, estimate $f(\\pi/4)$.\n\n**Solution:**\n- Point-slope from $\\theta_1 = \\pi/6$, $r_1 = 2$:\n- $r - 2 = \\frac{18}{\\pi}(\\pi/4 - \\pi/6) = \\frac{18}{\\pi} \\cdot \\frac{\\pi}{12} = \\frac{3}{2}$\n- $r \\approx 2 + 1.5 = 3.5$",
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
                "**Problem 1:** $r$ is negative and decreasing on $[\\pi, 3\\pi/2]$. Is the distance from the origin increasing or decreasing?\n\n**Hint:** If $r$ is negative, distance is $-r$. A decreasing $r$ (more negative) means $-r$ is increasing.\n\n**Problem 2:** $f(0) = 3$ and $f(\\pi/2) = 0$. Find the average rate of change on $[0, \\pi/2]$.\n\n**Hint:** Apply $\\frac{f(b) - f(a)}{b - a}$.\n\n**Problem 3:** On which interval is the average rate of change equal to zero: $[0, \\pi/4]$, $[\\pi/4, \\pi/2]$, $[\\pi/2, 3\\pi/4]$? You are given that $f(0) = 2$, $f(\\pi/4) = 4$, $f(\\pi/2) = 4$, $f(3\\pi/4) = 2$.\n\n**Hint:** Zero average rate of change means $f(b) = f(a)$.",
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
                "**Problem 1:** For a polar function $r = f(\\theta)$, complete the table:\n\n| Interval | $r$ positive/negative? | $r$ increasing/decreasing? | Distance behavior |\n|---|---|---|---|\n| $[0, \\pi/4]$ | positive | increasing | ? |\n| $[\\pi/4, \\pi/2]$ | positive | decreasing | ? |\n| $[\\pi/2, 3\\pi/4]$ | negative | increasing | ? |\n| $[3\\pi/4, \\pi]$ | negative | decreasing | ? |\n\n**Problem 2:** A polar function has $f(\\pi/8) = 4$ and $f(\\pi/4) = 7$. Estimate $f(3\\pi/16)$ using the average rate of change.\n\n**Problem 3:** On which interval is the average rate of change least: $[0, \\pi/3]$, $[\\pi/3, 2\\pi/3]$, $[2\\pi/3, \\pi]$? Given $f(0) = 6$, $f(\\pi/3) = 3$, $f(2\\pi/3) = -1$, $f(\\pi) = -4$.\n\n**Hint:** Compute the average rate of change for each interval and compare.",
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
                "**Exit Ticket:** For a polar function, $r = 2$ when $\\theta = 0$ and $r = 5$ when $\\theta = \\pi/4$. What is the average rate of change? Estimate $r$ when $\\theta = \\pi/8$.\n\n**Lesson Summary:** The signed radius $r$ can be positive or negative, which reverses the distance interpretation when $r < 0$. When $r$ is negative and increasing, the distance from the origin is actually decreasing. The average rate of change $\\frac{f(b) - f(a)}{b - a}$ measures how fast the radius changes per radian and enables estimation via point-slope form. Sketching $r = f(\\theta)$ in rectangular coordinates helps visualize sign and monotonicity behavior.",
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
