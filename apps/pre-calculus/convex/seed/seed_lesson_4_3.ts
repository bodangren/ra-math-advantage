import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_3Result> => {
    const now = Date.now();
    const lessonSlug = "4-3-rates-of-change-parametric";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametric Functions and Rates of Change",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.3: Parametric Functions and Rates of Change",
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
          title: "Parametric Functions and Rates of Change",
          description: "AP Precalculus Topic 4.3: Parametric Functions and Rates of Change",
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
          "markdown": "A particle moves along the path $x(t) = t^2$ and $y(t) = 2t + 1$. Between $t = 1$ and $t = 3$, how fast does the particle move horizontally? Vertically? How fast is it approaching the point $(9, 7)$? Rates of change in parametric functions require us to look at each coordinate independently."
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
          "markdown": "- **Average rate of change of a parametric function**: The change in each coordinate divided by the change in $t$: $\\frac{\\Delta x}{\\Delta t}$ and $\\frac{\\Delta y}{\\Delta t}$.\n- **Instantaneous rate of change**: The rate at a single value of $t$, approximated by shrinking the interval around that value.\n- **$\\frac{\\Delta y}{\\Delta x}$**: The secant slope between two positions, found by dividing the change in $y$ by the change in $x$."
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
          "markdown": "For a parametric function $(x(t), y(t))$, the **average rate of change** over $[t_1, t_2]$ is computed separately for each coordinate:\n\n$$\\frac{\\Delta x}{\\Delta t} = \\frac{x(t_2) - x(t_1)}{t_2 - t_1}, \\quad \\frac{\\Delta y}{\\Delta t} = \\frac{y(t_2) - y(t_1)}{t_2 - t_1}$$\n\nThese tell you how fast $x$ and $y$ are changing per unit of $t$.\n\n**Secant slope**: The slope between the two positions in the $xy$-plane is:\n\n$$\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y / \\Delta t}{\\Delta x / \\Delta t}$$\n\nThis ratio removes $t$ and gives the rate at which $y$ changes relative to $x$. When $\\Delta x = 0$ and $\\Delta y ≠ 0$, the secant is vertical. If both changes are zero, the two positions do not determine a secant line.\n\n**Interpreting signs**:\n- $\\frac{\\Delta x}{\\Delta t} > 0$: net movement to the right. $\\frac{\\Delta x}{\\Delta t} < 0$: net movement to the left.\n- $\\frac{\\Delta y}{\\Delta t} > 0$: net upward movement. $\\frac{\\Delta y}{\\Delta t} < 0$: net downward movement."
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
          "markdown": "**Example:** Given $x(t) = t^2$ and $y(t) = 2t + 1$.\n\n**(a)** Find the average rate of change of $x$ and $y$ on $[1, 3]$.\n- $\\frac{\\Delta x}{\\Delta t} = \\frac{x(3) - x(1)}{3 - 1} = \\frac{9 - 1}{2} = 4$\n- $\\frac{\\Delta y}{\\Delta t} = \\frac{y(3) - y(1)}{3 - 1} = \\frac{7 - 3}{2} = 2$\n\n**(b)** Estimate the slope near $t = 3$ with the secant over $[2, 3]$:\n- $\\frac{\\Delta x}{\\Delta t} = \\frac{9 - 4}{1} = 5$, $\\frac{\\Delta y}{\\Delta t} = \\frac{7 - 5}{1} = 2$\n- $\\frac{\\Delta y}{\\Delta x} = \\frac{2}{5} = 0.4$\n\n**(c)** Interpret: On $[2, 3]$, the average horizontal rate is 5 units per second and the average vertical rate is 2 units per second. The secant slope is $2/5$. These are interval averages, not exact instantaneous rates at $t = 3$."
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
          "markdown": "**Problem 1:** For $x(t) = 3t - 1$ and $y(t) = t^2$, find $\\frac{\\Delta x}{\\Delta t}$ and $\\frac{\\Delta y}{\\Delta t}$ on $[0, 2]$.\n\n**Hint:** Compute $x(2) - x(0)$ and $y(2) - y(0)$, each divided by 2.\n\n**Problem 2:** Using the results from Problem 1, find $\\frac{\\Delta y}{\\Delta x}$ over this interval."
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
          "markdown": "**Problem 1:** For $x(t) = \\cos(t)$ and $y(t) = \\sin(t)$, compute $\\frac{\\Delta x}{\\Delta t}$ and $\\frac{\\Delta y}{\\Delta t}$ on $[0, \\frac{\\pi}{2}]$. What is $\\frac{\\Delta y}{\\Delta x}$ over this interval?\n\n**Problem 2:** A particle has $x(t) = t^3 - t$ and $y(t) = t^2$. Estimate the slope near $t = 2$ by computing $\\frac{\\Delta y}{\\Delta t}$ and $\\frac{\\Delta x}{\\Delta t}$ on $[1.5, 2]$.\n\n**Problem 3:** When is a secant horizontal? Explain why $\\Delta y = 0$ also requires $\\Delta x ≠ 0$."
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
          "markdown": "**Exit Ticket:** For $x(t) = 4t$ and $y(t) = t^2 - 3$, find $\\frac{\\Delta y}{\\Delta x}$ on $[1, 3]$.\n\n**Lesson Summary:** Rates of change in parametric functions are computed per-coordinate. The slope $\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y / \\Delta t}{\\Delta x / \\Delta t}$ describes how the curve rises relative to how it runs in the $xy$-plane."
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
