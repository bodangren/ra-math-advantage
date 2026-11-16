import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_11Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_11 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_11Result> => {
    const now = Date.now();
    const lessonSlug = "3-11-other-trig-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "The Secant, Cosecant, and Cotangent Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.11: The Secant, Cosecant, and Cotangent Functions",
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
          title: "The Secant, Cosecant, and Cotangent Functions",
          description: "AP Precalculus Topic 3.11: The Secant, Cosecant, and Cotangent Functions",
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
          "markdown": "You know that $\\cos(\\pi/3) = 1/2$. So what is $1/\\cos(\\pi/3)$? It is $2$ — a value outside the $[-1, 1]$ range of cosine itself. This suggests that the reciprocal of cosine produces a fundamentally different kind of function. What happens to the graph where $\\cos(x) = 0$? What are the new range and asymptote locations?"
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
          "markdown": "- **Secant** $\\sec(x) = 1/\\cos(x)$: The reciprocal of cosine, defined where $\\cos(x) \\neq 0$. Vertical asymptotes at $x = \\pi/2 + k\\pi$. Range: $(-\\infty, -1$ cup $1, \\infty)$.\n- **Cosecant** $\\csc(x) = 1/\\sin(x)$: The reciprocal of sine, defined where $\\sin(x) \\neq 0$. Vertical asymptotes at $x = k\\pi$. Range: $(-\\infty, -1$ cup $1, \\infty)$.\n- **Cotangent** $\\cot(x) = 1/\\tan(x) = \\cos(x)/\\sin(x)$: The reciprocal of tangent, defined where $\\sin(x) \\neq 0$. Vertical asymptotes at $x = k\\pi$.\n- **Vertical asymptote**: A vertical line where the function approaches $\\pm \\infty$ — for reciprocal trig functions, this occurs wherever the denominator equals zero."
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
          "markdown": "Secant, cosecant, and cotangent are defined as reciprocals of the three primary trig functions:\n\n$$\\sec(x) = \\frac{1}{\\cos(x)}, \\quad \\cos(x) \\neq 0$$\n$$\\csc(x) = \\frac{1}{\\sin(x)}, \\quad \\sin(x) \\neq 0$$\n$$\\cot(x) = \\frac{1}{\\tan(x)} = \\frac{\\cos(x)}{\\sin(x)}, \\quad \\sin(x) \\neq 0$$\n\n**Vertical asymptotes** appear wherever the denominator is zero:\n- $\\sec(x)$ has asymptotes at $x = \\pi/2 + k\\pi$ (where $\\cos(x) = 0$)\n- $\\csc(x)$ has asymptotes at $x = k\\pi$ (where $\\sin(x) = 0$)\n- $\\cot(x)$ has asymptotes at $x = k\\pi$ (where $\\sin(x) = 0$)\n\nThe **ranges** of sec and csc are $(-\\infty, -1$ cup $1, \\infty)$ because they are reciprocals of values in $[-1, 1]$ — the reciprocal of any number with magnitude at most 1 has magnitude at least 1.\n\n**Solving strategy**: To solve equations involving reciprocal trig functions, isolate the function first, then convert to sin, cos, or tan. For example, $4\\csc(3x) + 1 = 11$ becomes $\\csc(3x) = 5/2$, which means $\\sin(3x) = 2/5$ — a familiar equation."
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
          "markdown": "**Example 1:** Find a vertical asymptote of $f(x) = 3\\sec(2x)$.\n\n**Solution:**\n- Asymptote when $\\cos(2x) = 0$\n- $2x = \\pi/2 + k\\pi \\rightarrow x = \\pi/4 + k\\pi/2$\n- At $k = 0$: $x = \\pi/4$. This is one asymptote location.\n\n**Example 2:** Find the range of $h(\\theta) = 3\\csc(\\theta/2)$.\n\n**Solution:**\n- $\\csc(\\theta/2)$ has range $(-\\infty, -1$ cup $1, \\infty)$\n- Multiplying by 3: range is $(-\\infty, -3$ cup $3, \\infty)$\n\n**Example 3:** Solve $4\\csc(3x) + 1 = 11$ on $[0, 2\\pi)$.\n\n**Solution:**\n- $4\\csc(3x) = 10 \\rightarrow \\csc(3x) = 5/2$\n- Convert: $\\sin(3x) = 2/5$\n- $3x = \\arcsin(2/5)$ or $3x = \\pi - \\arcsin(2/5)$ plus multiples of $2\\pi$\n- Let $\\alpha=\\arcsin(2/5)$. The six solutions are $\\alpha/3$, $(\\pi-\\alpha)/3$, $(\\alpha+2\\pi)/3$, $(3\\pi-\\alpha)/3$, $(\\alpha+4\\pi)/3$, and $(5\\pi-\\alpha)/3$. Each lies in $[0,2\\pi)$ and has $\\sin(3x)=2/5\\ne0$."
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
          "markdown": "**Problem 1:** Where does $g(x) = \\cot(2x)$ have vertical asymptotes?\n\n**Hint:** $\\cot(2x)$ has asymptotes where $\\sin(2x) = 0$. Solve $2x = k\\pi$.\n\n**Problem 2:** Find the range of $h(x) = 5\\sec(x/2)$.\n\n**Hint:** Start with the range of $\\sec(x/2)$, then scale by 5.\n\n**Problem 3:** Solve $3\\sec(2x - 1) = 4$ without a calculator.\n\n**Hint:** Convert to $\\cos(2x - 1) = 3/4$. Is this solvable with exact values?"
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
          "markdown": "**Problem 1:** Find the vertical asymptotes of $f(x) = \\sec(x/2)$ on $[0, 4\\pi)$.\n\n**Problem 2:** Solve $5 - 2\\csc(x) = 7$ on $[0, 2\\pi)$.\n\n**Hint:** Isolate $\\csc(x)$, convert to $\\sin(x)$, and solve.\n\n**Problem 3:** Solve $2 + 3\\cot(x) = 1$ on $[0, 2\\pi)$.\n\n**Hint:** Isolate $\\cot(x)$, convert to $\\cos(x)/\\sin(x)$, and find angles where tangent equals the reciprocal.\n\n**Problem 4:** At what $x$-values does $f(x) = 2\\sec(x) - 5$ intersect $g(x) = -1$ on $[0, 2\\pi)$?\n\n**Hint:** Set $2\\sec(x) - 5 = -1$, solve for $\\sec(x)$, then convert to $\\cos(x)$."
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
          "markdown": "**Exit Ticket:** Find the vertical asymptotes of $f(x) = 2\\csc(3x)$ on $[0, 2\\pi)$. How do you convert a sec/csc equation into a sin/cos equation?\n\n**Lesson Summary:** Sec, csc, and cot are reciprocals of cos, sin, and tan. Their graphs have vertical asymptotes where the denominator is zero, and their ranges exclude values between -1 and 1 (for sec and csc). To solve reciprocal equations, isolate the reciprocal function and convert to the primary trig function. This converts unfamiliar sec/csc/cot problems into familiar sin/cos/tan problems."
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
